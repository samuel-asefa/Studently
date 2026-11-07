import { addDays, startOfDay, toISO, shortDate, relativeDay } from './date.js';
import { priorityFor } from '../constants.js';

const WEEKDAY_FORMS = [
	['sunday', 0], ['sun', 0],
	['monday', 1], ['mon', 1],
	['tuesday', 2], ['tues', 2], ['tue', 2],
	['wednesday', 3], ['wed', 3],
	['thursday', 4], ['thurs', 4], ['thur', 4], ['thu', 4],
	['friday', 5], ['fri', 5],
	['saturday', 6], ['sat', 6]
];
const WEEKDAY_RE = WEEKDAY_FORMS.map(([w]) => w).join('|');
const WEEKDAY = Object.fromEntries(WEEKDAY_FORMS);

const MONTHS = {
	jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
	jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};
const MONTH_RE =
	'(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

/** @type {[RegExp, string][]} */
const TYPE_WORDS = [
	[/\b(project|presentation|portfolio|capstone)\b/i, 'project'],
	[/\b(exam|midterm|final|finals|quiz|test)\b/i, 'exam'],
	[/\b(practice|club|game|meet|rehearsal|volunteer|tryouts?|tournament|debate|robotics|choir|band|orchestra|recital|ec)\b/i, 'ec'],
	[/\b(essay|paper|hw|homework|assignment|lab|pset|problem set|worksheet|report|reading|read|draft)\b/i, 'assignment']
];

const PREFIX = '(?:(?:due|by|on|before)\\s+)?';

function upcoming(base, weekday) {
	const diff = (weekday - base.getDay() + 7) % 7;
	return addDays(base, diff);
}

function nextWeeks(base, weekday) {
	// "next fri" = that weekday in the next calendar week (weeks start Monday)
	const dow = (base.getDay() + 6) % 7; // Mon=0
	const nextMonday = addDays(base, 7 - dow);
	return addDays(nextMonday, (weekday + 6) % 7);
}

function dateFromMonthDay(base, month, day, year) {
	let d = new Date(year ?? base.getFullYear(), month, day);
	if (year == null && d < base) d = new Date(base.getFullYear() + 1, month, day);
	return d;
}

/**
 * Parse quick-add text like "Chem midterm next fri 6h !!" into structured fields.
 * Returns the cleaned name plus whatever it could find.
 */
export function parseQuick(input, { categories = [], now = new Date() } = {}) {
	const base = startOfDay(now);
	let text = ` ${input ?? ''} `;
	const out = { name: '', dueDate: null, hours: null, weight: null, type: null, category: null };

	// Find the first match the handler accepts, then cut it out of the text.
	const take = (re, fn) => {
		const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
		for (const m of text.matchAll(global)) {
			if (fn(m) === false) continue;
			text = text.slice(0, m.index) + ' ' + text.slice(m.index + m[0].length);
			return true;
		}
		return false;
	};
	// "SAT prep" or "MON" in caps is probably not a weekday.
	const looksLikeAcronym = (w) => w.length <= 3 && w === w.toUpperCase();

	// #category
	take(/\s#([\p{L}\p{N}_-]+)/u, (m) => {
		const tag = m[1].toLowerCase();
		const match = categories.find((c) => c.toLowerCase().replace(/\s+/g, '') === tag);
		if (!match) return false;
		out.category = match;
	});

	// Priority: !, !!, !!! or p1/p2/p3
	take(/(!{1,3})(?=\s)/, (m) => {
		out.weight = [1.5, 2, 3][m[1].length - 1];
	});
	if (out.weight == null)
		take(/\sp([1-3])(?=\s)/i, (m) => {
			out.weight = { 1: 3, 2: 2, 3: 1.5 }[m[1]];
		});

	// Durations: 1h30m, 2.5h, 90m, 3 hours
	take(/\s(\d+)\s*h\s*(\d+)\s*m(?:in)?s?(?=\s)/i, (m) => {
		out.hours = Number(m[1]) + Number(m[2]) / 60;
	}) ||
		take(/\s(?:for\s+)?(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)(?=\s)/i, (m) => {
			out.hours = Number(m[1]);
		}) ||
		take(/\s(?:for\s+)?(\d+)\s*(?:m|min|mins|minutes)(?=\s)/i, (m) => {
			out.hours = Number(m[1]) / 60;
		});

	// Dates
	const setDate = (d) => {
		out.dueDate = toISO(d);
	};
	const dateMatchers = [
		[new RegExp(`\\s${PREFIX}(today|tonight|tod)(?=\\s)`, 'i'), () => setDate(base)],
		[new RegExp(`\\s${PREFIX}(tomorrow|tmrw|tmr)(?=\\s)`, 'i'), () => setDate(addDays(base, 1))],
		[new RegExp(`\\s${PREFIX}next\\s+(${WEEKDAY_RE})\\.?(?=\\s)`, 'i'), (m) => setDate(nextWeeks(base, WEEKDAY[m[1].toLowerCase()]))],
		[new RegExp(`\\s${PREFIX}(?:this\\s+)?(${WEEKDAY_RE})\\.?(?=\\s)`, 'i'), (m) => {
			if (looksLikeAcronym(m[1])) return false;
			setDate(upcoming(base, WEEKDAY[m[1].toLowerCase()]));
		}],
		[new RegExp(`\\s${PREFIX}next\\s+week(?=\\s)`, 'i'), () => setDate(addDays(base, 7))],
		[new RegExp(`\\s${PREFIX}next\\s+month(?=\\s)`, 'i'), () => {
			const d = new Date(base);
			d.setMonth(d.getMonth() + 1);
			setDate(d);
		}],
		[new RegExp(`\\s${PREFIX}in\\s+(\\d+|a|an|one|two|three)\\s+(day|days|week|weeks)(?=\\s)`, 'i'), (m) => {
			const words = { a: 1, an: 1, one: 1, two: 2, three: 3 };
			const n = Number(m[1]) || words[m[1].toLowerCase()] || 1;
			setDate(addDays(base, /week/i.test(m[2]) ? n * 7 : n));
		}],
		[new RegExp(`\\s${PREFIX}${MONTH_RE}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?(?=\\s)`, 'i'), (m) => {
			setDate(dateFromMonthDay(base, MONTHS[m[1].slice(0, 3).toLowerCase()], Number(m[2]), m[3] ? Number(m[3]) : null));
		}],
		[new RegExp(`\\s${PREFIX}(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH_RE}(?=\\s)`, 'i'), (m) => {
			setDate(dateFromMonthDay(base, MONTHS[m[2].slice(0, 3).toLowerCase()], Number(m[1]), null));
		}],
		[new RegExp(`\\s${PREFIX}(\\d{4})-(\\d{2})-(\\d{2})(?=\\s)`), (m) => setDate(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])))],
		[new RegExp(`\\s${PREFIX}(\\d{1,2})\\/(\\d{1,2})(?:\\/(\\d{2,4}))?(?=\\s)`), (m) => {
			const month = Number(m[1]) - 1;
			const day = Number(m[2]);
			if (month > 11 || day > 31 || day < 1) return false;
			let year = m[3] ? Number(m[3]) : null;
			if (year != null && year < 100) year += 2000;
			setDate(dateFromMonthDay(base, month, day, year));
		}]
	];
	for (const [re, fn] of dateMatchers) {
		if (take(re, fn)) break;
	}

	// Type is inferred from words but they stay in the name.
	for (const [re, type] of TYPE_WORDS) {
		if (re.test(text)) {
			out.type = type;
			break;
		}
	}

	let name = text.replace(/\s+/g, ' ').trim();
	name = name.replace(/\s+(due|by|on|for)$/i, '').trim();
	out.name = name ? name[0].toUpperCase() + name.slice(1) : '';
	return out;
}

/** Labels for the parsed fields, for preview chips. */
export function describeParse(p) {
	const chips = [];
	if (p.dueDate) chips.push({ kind: 'date', label: `${relativeDay(p.dueDate)} · ${shortDate(p.dueDate)}` });
	if (p.hours) chips.push({ kind: 'hours', label: `${Math.round(p.hours * 100) / 100}h` });
	if (p.weight) chips.push({ kind: 'priority', label: priorityFor(p.weight).label, tone: priorityFor(p.weight).tone });
	if (p.type) chips.push({ kind: 'type', label: p.type === 'ec' ? 'Extracurricular' : p.type[0].toUpperCase() + p.type.slice(1) });
	if (p.category) chips.push({ kind: 'category', label: p.category });
	return chips;
}
