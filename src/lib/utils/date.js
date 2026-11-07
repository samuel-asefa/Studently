export const DAY_MS = 86_400_000;

const pad = (n) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD (never UTC, so no off-by-one at night). */
export function toISO(date = new Date()) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const todayISO = () => toISO(new Date());

export function isISODate(s) {
	return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** Parse YYYY-MM-DD as a *local* date. `new Date('2025-01-15')` would be UTC. */
export function parseISO(s) {
	if (!isISODate(s)) return null;
	const [y, m, d] = s.split('-').map(Number);
	return new Date(y, m - 1, d);
}

export function startOfDay(date = new Date()) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

export function addDays(date, n) {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

/** Whole days from today until the ISO date (negative when past). */
export function daysUntil(iso, from = new Date()) {
	const due = parseISO(iso);
	if (!due) return 0;
	return Math.round((due.getTime() - startOfDay(from).getTime()) / DAY_MS);
}

export function relativeDay(iso) {
	const n = daysUntil(iso);
	if (n === 0) return 'Today';
	if (n === 1) return 'Tomorrow';
	if (n === -1) return 'Yesterday';
	if (n < 0) return `${-n} days ago`;
	if (n < 7) return parseISO(iso).toLocaleDateString('en-US', { weekday: 'long' });
	if (n < 14) return `Next ${parseISO(iso).toLocaleDateString('en-US', { weekday: 'short' })}`;
	return `In ${n} days`;
}

/** relativeDay for mid-sentence use: "due tomorrow", "due Friday", "due next Fri". */
export function relativeLower(iso) {
	const r = relativeDay(iso);
	return /^(Today|Tomorrow|Yesterday|Next|In)\b/.test(r) ? r[0].toLowerCase() + r.slice(1) : r;
}

/** @param {string} iso @param {Intl.DateTimeFormatOptions} [opts] */
export function shortDate(iso, opts = { month: 'short', day: 'numeric' }) {
	const d = parseISO(iso);
	return d ? d.toLocaleDateString('en-US', opts) : '';
}

export function weekdayShort(iso) {
	return shortDate(iso, { weekday: 'short' });
}

export function formatHours(h) {
	const mins = Math.round((Number(h) || 0) * 60);
	const hh = Math.floor(mins / 60);
	const mm = mins % 60;
	if (!hh && !mm) return '0m';
	if (!hh) return `${mm}m`;
	if (!mm) return `${hh}h`;
	return `${hh}h ${mm}m`;
}

export function formatClock(ms) {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${pad(m)}:${pad(s)}`;
}

export function greeting(date = new Date()) {
	const h = date.getHours();
	if (h < 5) return 'Burning the midnight oil';
	if (h < 12) return 'Good morning';
	if (h < 17) return 'Good afternoon';
	if (h < 22) return 'Good evening';
	return 'Good night';
}

/** Countdown text such as "2d 4h" until the end of the due date. */
export function countdown(iso, now = Date.now()) {
	const due = parseISO(iso);
	if (!due) return '';
	const end = addDays(due, 1).getTime(); // end of due day
	let diff = end - now;
	if (diff <= 0) return 'Overdue';
	const d = Math.floor(diff / DAY_MS);
	diff -= d * DAY_MS;
	const h = Math.floor(diff / 3_600_000);
	if (d > 0) return `${d}d ${h}h`;
	const m = Math.floor((diff - h * 3_600_000) / 60_000);
	return `${h}h ${m}m`;
}
