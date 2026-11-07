import { toISO, addDays, startOfDay, parseISO, DAY_MS } from './utils/date.js';
import { ACHIEVEMENTS } from './content/achievements.js';

const dayOf = (ms) => toISO(new Date(ms));
const startOf = (s) => s.at - s.minutes * 60_000;

/** Longest run of consecutive days in a set of ISO dates. */
function longestRun(days) {
	const sorted = [...days].sort();
	let best = 0;
	let run = 0;
	let prev = null;
	for (const iso of sorted) {
		const d = parseISO(iso);
		run = prev && Math.round((d.getTime() - prev.getTime()) / DAY_MS) === 1 ? run + 1 : 1;
		best = Math.max(best, run);
		prev = d;
	}
	return best;
}

/** Everything the Insights view and achievements need, from raw data. */
export function computeFacts({ tasks = [], deadlines = [], sessions = [], categories = {} }) {
	const perDay = new Map();
	for (const s of sessions) perDay.set(dayOf(s.at), (perDay.get(dayOf(s.at)) ?? 0) + 1);

	const activeDays = new Set(perDay.keys());
	for (const t of tasks) if (t.done && t.completedAt) activeDays.add(dayOf(t.completedAt));
	for (const d of deadlines) if (d.completed && d.completedAt) activeDays.add(dayOf(d.completedAt));

	const done = deadlines.filter((d) => d.completed);
	const finishedBy = (d, daysEarly) =>
		d.completedAt && dayOf(d.completedAt) <= toISO(addDays(parseISO(d.dueDate), -daysEarly));

	const sessionDays = new Set(perDay.keys());
	const weekendBoth = [...sessionDays].some((iso) => {
		const d = parseISO(iso);
		return d.getDay() === 6 && sessionDays.has(toISO(addDays(d, 1)));
	});

	const focusMinutes = sessions.reduce((n, s) => n + s.minutes, 0);

	return {
		sessions: sessions.length,
		focusHours: Math.floor((focusMinutes / 60) * 10) / 10,
		focusMinutes,
		longestSession: sessions.reduce((m, s) => Math.max(m, s.minutes), 0),
		maxSessionsInDay: Math.max(0, ...perDay.values()),
		longestStreak: longestRun(activeDays),
		deadlinesAdded: deadlines.length,
		deadlinesDone: done.length,
		doneEarly: done.filter((d) => finishedBy(d, 2)).length,
		doneOnTime: done.filter((d) => finishedBy(d, 0)).length,
		tasksDone: tasks.filter((t) => t.done).length,
		inboxZero: tasks.length >= 5 && tasks.every((t) => t.done),
		templatesUsed: new Set(deadlines.filter((d) => d.group).map((d) => d.group)).size,
		nightOwl: sessions.some((s) => new Date(startOf(s)).getHours() >= 22),
		earlyRiser: sessions.some((s) => {
			const h = new Date(startOf(s)).getHours();
			return h >= 4 && h < 7;
		}),
		weekendBoth,
		categories: Object.keys(categories).length
	};
}

export function computeAchievements(facts) {
	return ACHIEVEMENTS.map((a) => {
		const value = Math.max(0, a.value(facts));
		return { ...a, value, progress: Math.min(1, value / a.target), unlocked: value >= a.target };
	});
}

/** Numbers and series for the Insights view. */
export function computeInsights({ deadlines = [], sessions = [] }, weeks = 26) {
	const byHour = Array(24).fill(0);
	const byWeekday = Array(7).fill(0);
	const byDay = new Map();
	for (const s of sessions) {
		const start = new Date(startOf(s));
		byHour[start.getHours()] += s.minutes;
		byWeekday[start.getDay()] += s.minutes;
		byDay.set(dayOf(s.at), (byDay.get(dayOf(s.at)) ?? 0) + s.minutes);
	}

	// Heatmap: `weeks` full weeks ending this Saturday, Sunday-first columns.
	const today = startOfDay();
	const end = addDays(today, 6 - today.getDay());
	const start = addDays(end, -(weeks * 7 - 1));
	const heat = [];
	for (let i = 0; i < weeks * 7; i++) {
		const d = addDays(start, i);
		const iso = toISO(d);
		heat.push({ date: iso, minutes: Math.round(byDay.get(iso) ?? 0), future: d > today });
	}
	const heatTotal = heat.reduce((n, d) => n + d.minutes, 0);
	const activeHeatDays = heat.filter((d) => d.minutes > 0).length;

	const done = deadlines.filter((d) => d.completed);
	const onTime = done.filter((d) => d.completedAt && dayOf(d.completedAt) <= d.dueDate).length;
	const measured = done.filter((d) => d.hoursSpent > 0 && d.estimatedHours > 0);
	const accuracy = measured.length
		? measured.reduce((n, d) => n + Math.max(0, 1 - Math.abs(d.hoursSpent - d.estimatedHours) / d.estimatedHours), 0) /
			measured.length
		: null;

	const peakHour = byHour.some(Boolean) ? byHour.indexOf(Math.max(...byHour)) : null;
	const bestDay = byWeekday.some(Boolean) ? byWeekday.indexOf(Math.max(...byWeekday)) : null;

	const perDeadline = deadlines
		.filter((d) => d.hoursSpent > 0)
		.map((d) => ({ id: d.id, name: d.name, spent: d.hoursSpent, estimate: d.estimatedHours, completed: d.completed }))
		.sort((a, b) => b.spent - a.spent)
		.slice(0, 6);

	const totalMinutes = sessions.reduce((n, s) => n + s.minutes, 0);

	return {
		byHour,
		byWeekday,
		heat,
		heatTotal,
		activeHeatDays,
		weeks,
		onTimeRate: done.length ? onTime / done.length : null,
		accuracy,
		avgSession: sessions.length ? totalMinutes / sessions.length : 0,
		peakHour,
		bestDay,
		perDeadline,
		totalMinutes
	};
}
