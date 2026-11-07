import {
	FileText, Exam, Rocket, Trophy, Shapes,
	LayoutDashboard, CalendarClock, ListChecks, Timer, Tag, ChartColumn
} from './icons.js';

export const DEADLINE_TYPES = [
	{ id: 'assignment', label: 'Assignment', code: 'AS', icon: FileText },
	{ id: 'exam', label: 'Exam', code: 'EX', icon: Exam },
	{ id: 'project', label: 'Project', code: 'PR', icon: Rocket },
	{ id: 'ec', label: 'Extracurricular', short: 'EC', code: 'EC', icon: Trophy },
	{ id: 'other', label: 'Other', code: 'OT', icon: Shapes }
];

export const typeInfo = (id) => DEADLINE_TYPES.find((t) => t.id === id) ?? DEADLINE_TYPES[4];

export const PRIORITIES = [
	{ id: 'low', label: 'Low', weight: 0.75, tone: 'success' },
	{ id: 'normal', label: 'Normal', weight: 1, tone: '' },
	{ id: 'high', label: 'High', weight: 2, tone: 'warn' },
	{ id: 'critical', label: 'Critical', weight: 3, tone: 'danger' }
];

export function priorityFor(weight = 1) {
	let best = PRIORITIES[1];
	for (const p of PRIORITIES) {
		if (Math.abs(p.weight - weight) < Math.abs(best.weight - weight)) best = p;
	}
	return best;
}

// Same order as the accents: blue → green → warm → purple, then neutral.
export const CATEGORY_COLORS = [
	'#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16',
	'#eab308', '#f59e0b', '#f97316', '#ef4444', '#f43f5e', '#ec4899',
	'#d946ef', '#a855f7', '#8b5cf6', '#64748b'
];

// h is the main hue, h2 the second stop of its gradient (OKLCH degrees).
// Ordered around the color wheel: blue → green → warm → purple.
export const ACCENTS = [
	{ id: 'blue', label: 'Blue', h: 258, h2: 232 },
	{ id: 'sky', label: 'Sky', h: 228, h2: 200 },
	{ id: 'mint', label: 'Mint', h: 165, h2: 190 },
	{ id: 'gold', label: 'Gold', h: 80, h2: 55 },
	{ id: 'ember', label: 'Ember', h: 40, h2: 18 },
	{ id: 'rose', label: 'Rose', h: 355, h2: 15 },
	{ id: 'iris', label: 'Iris', h: 285, h2: 318 }
];

// Old ids from earlier versions.
const ACCENT_ALIASES = { ocean: 'sky', lime: 'mint' };
export const accentFor = (id) =>
	ACCENTS.find((a) => a.id === (ACCENT_ALIASES[id] ?? id)) ?? ACCENTS[0];

export const FONTS = [
	{ id: 'Geist', label: 'Geist', url: null },
	{ id: 'Inter', label: 'Inter', url: 'family=Inter:wght@300..800' },
	{ id: 'Outfit', label: 'Outfit', url: 'family=Outfit:wght@300..800' },
	{ id: 'Space Grotesk', label: 'Space Grotesk', url: 'family=Space+Grotesk:wght@300..700' },
	{ id: 'Atkinson Hyperlegible', label: 'Atkinson', url: 'family=Atkinson+Hyperlegible:wght@400;700' }
];

export const SERIES_HUES = [285, 200, 150, 40, 340, 95, 250, 15, 180, 310];

// Each deadline stores its own hue (picked at creation so active ones differ).
const hueById = new Map();
export function registerHues(list) {
	hueById.clear();
	for (const d of list) if (typeof d.hue === 'number') hueById.set(d.id, d.hue);
}

/** The least-used hue among the given deadlines. */
export function pickHue(list) {
	const used = new Map(SERIES_HUES.map((h) => [h, 0]));
	for (const d of list) if (!d.completed && used.has(d.hue)) used.set(d.hue, used.get(d.hue) + 1);
	return [...used.entries()].sort((a, b) => a[1] - b[1])[0][0];
}

/** Stable color for a deadline, so it looks the same in every chart. */
export function seriesHue(id = '') {
	if (hueById.has(id)) return hueById.get(id);
	let h = 0;
	for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
	return SERIES_HUES[h % SERIES_HUES.length];
}

export const seriesColor = (id, l = 0.7, c = 0.16) => `oklch(${l} ${c} ${seriesHue(id)})`;

export const NAV = [
	{ id: 'today', label: 'Today', key: '1', icon: LayoutDashboard },
	{ id: 'planner', label: 'Planner', key: '2', icon: CalendarClock },
	{ id: 'tasks', label: 'Tasks', key: '3', icon: ListChecks },
	{ id: 'focus', label: 'Focus', key: '4', icon: Timer },
	{ id: 'insights', label: 'Insights', key: '5', icon: ChartColumn },
	{ id: 'categories', label: 'Categories', key: '6', icon: Tag }
];
