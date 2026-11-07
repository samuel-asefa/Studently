import { addDays, daysUntil, startOfDay, toISO } from './date.js';

const STEP = 0.25; // plan in 15-minute blocks
const EPS = 1e-6;
const ceilStep = (h) => Math.ceil(h / STEP - EPS) * STEP;
const floorStep = (h) => Math.floor(h / STEP + EPS) * STEP;

/**
 * Turn deadlines into a day-by-day study plan.
 *
 * Pass 1 spreads each deadline's remaining hours evenly over the days left,
 * most urgent first (priority weight / days left), within the daily budget.
 * Pass 2 front-loads anything that did not fit into free time before its due
 * date. Whatever still does not fit is reported as a risk.
 * `usedToday` is focus time already done today; it comes out of today's budget.
 */
export function buildPlan(deadlines, { dailyHours = 4, today = new Date(), usedToday = 0 } = {}) {
	const base = startOfDay(today);
	const budget = Math.max(STEP, Number(dailyHours) || 4);

	const active = (deadlines ?? [])
		.filter((d) => !d.completed)
		.map((d) => ({
			...d,
			days: daysUntil(d.dueDate, base),
			remaining: Math.max(0, (Number(d.estimatedHours) || 0) - (Number(d.hoursSpent) || 0))
		}));

	const overdue = active.filter((d) => d.days < 0).sort((a, b) => a.days - b.days);
	const work = active.filter((d) => d.days >= 0 && d.remaining > EPS);

	const lastDay = work.reduce((m, d) => Math.max(m, d.days), 0);
	const horizon = Math.max(lastDay + 1, 7);

	const days = Array.from({ length: horizon }, (_, i) => ({
		index: i,
		date: toISO(addDays(base, i)),
		items: [],
		total: 0,
		free: i === 0 ? Math.max(0, floorStep(budget - usedToday)) : budget
	}));

	const left = new Map(work.map((d) => [d.id, d.remaining]));

	const allocate = (day, d, hours) => {
		if (hours <= EPS) return;
		const existing = day.items.find((it) => it.id === d.id);
		if (existing) existing.hours += hours;
		else
			day.items.push({
				id: d.id,
				name: d.name,
				type: d.type,
				weight: d.customWeight ?? 1,
				dueDate: d.dueDate,
				isDueDay: day.index === d.days,
				hours
			});
		day.total += hours;
		day.free -= hours;
		left.set(d.id, left.get(d.id) - hours);
	};

	// Pass 1: even spread, most urgent first.
	for (const day of days) {
		const candidates = work
			.filter((d) => d.days >= day.index && left.get(d.id) > EPS)
			.map((d) => {
				const daysLeft = d.days - day.index + 1;
				return { d, share: left.get(d.id) / daysLeft, score: (d.customWeight ?? 1) / daysLeft };
			})
			.sort((a, b) => b.score - a.score || a.d.days - b.d.days);

		for (const { d, share } of candidates) {
			if (day.free < STEP - EPS) break;
			const want = Math.min(Math.max(ceilStep(share), STEP), left.get(d.id));
			allocate(day, d, Math.min(want, floorStep(day.free)));
		}
	}

	// Pass 2: pull leftover work into earlier free time.
	const behind = work
		.filter((d) => left.get(d.id) > EPS)
		.sort((a, b) => a.days - b.days || (b.customWeight ?? 1) - (a.customWeight ?? 1));
	for (const d of behind) {
		for (let i = 0; i <= d.days && left.get(d.id) > EPS; i++) {
			const day = days[i];
			allocate(day, d, Math.min(left.get(d.id), floorStep(day.free)));
		}
	}

	const risks = work
		.filter((d) => left.get(d.id) > 0.05)
		.map((d) => ({ id: d.id, name: d.name, shortfall: left.get(d.id), dueDate: d.dueDate }));

	for (const day of days) {
		day.items.sort((a, b) => b.hours - a.hours);
		day.total = Math.round(day.total * 100) / 100;
	}

	const totalPlanned = days.reduce((s, d) => s + d.total, 0);
	const busiest = days.reduce((m, d) => Math.max(m, d.total), 0);

	return { days, overdue, risks, totalPlanned, busiest, budget, usedToday };
}
