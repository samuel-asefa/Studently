import { addDays, daysUntil, parseISO, startOfDay, toISO } from '../utils/date.js';

// Multi-step plans. `offset` is days before the final due date (0 = due date).
// Hours are a typical high-school / early-college workload at "Standard" effort.

export const TEMPLATES = [
	{
		id: 'research-paper',
		name: 'Research paper',
		group: 'Writing',
		blurb: 'Topic to citations, without the all-nighter.',
		steps: [
			{ name: 'Pick a topic and gather sources', offset: -14, hours: 3 },
			{ name: 'Annotated bibliography', offset: -11, hours: 3 },
			{ name: 'Thesis and outline', offset: -8, hours: 2 },
			{ name: 'First draft', offset: -5, hours: 6 },
			{ name: 'Revise and edit', offset: -2, hours: 3 },
			{ name: 'Proofread, cite and submit', offset: 0, hours: 1, weight: 2 }
		]
	},
	{
		id: 'essay',
		name: 'Essay',
		group: 'Writing',
		blurb: 'A short essay in four focused sittings.',
		steps: [
			{ name: 'Brainstorm and thesis', offset: -6, hours: 1 },
			{ name: 'Outline', offset: -5, hours: 1 },
			{ name: 'Full draft', offset: -3, hours: 3 },
			{ name: 'Revise and submit', offset: 0, hours: 1.5, weight: 2 }
		]
	},
	{
		id: 'book-report',
		name: 'Book report',
		group: 'Writing',
		blurb: 'Read on pace, then write with your notes ready.',
		steps: [
			{ name: 'Read the first half', offset: -10, hours: 4 },
			{ name: 'Read the second half', offset: -6, hours: 4 },
			{ name: 'Notes, themes and quotes', offset: -4, hours: 1.5 },
			{ name: 'Write the report', offset: -2, hours: 3 },
			{ name: 'Edit and submit', offset: 0, hours: 1, weight: 2 }
		]
	},
	{
		id: 'lab-report',
		name: 'Lab report',
		group: 'Science',
		blurb: 'Data to discussion, one section at a time.',
		steps: [
			{ name: 'Organize the raw data', offset: -6, hours: 1.5 },
			{ name: 'Analysis and graphs', offset: -5, hours: 2 },
			{ name: 'Methods and results', offset: -3, hours: 2 },
			{ name: 'Discussion and conclusion', offset: -2, hours: 2 },
			{ name: 'Proofread and submit', offset: 0, hours: 1, weight: 2 }
		]
	},
	{
		id: 'problem-set',
		name: 'Problem set',
		group: 'Science',
		blurb: 'Easy wins first, hard problems with time to ask.',
		steps: [
			{ name: 'Read and do the easy problems', offset: -4, hours: 1.5 },
			{ name: 'Work the hard problems', offset: -2, hours: 2 },
			{ name: 'Check answers or go to office hours', offset: -1, hours: 1 },
			{ name: 'Write up and submit', offset: 0, hours: 1, weight: 2 }
		]
	},
	{
		id: 'science-competition',
		name: 'Science competition',
		group: 'Science',
		blurb: 'Rules, notes, deep dives and timed practice.',
		steps: [
			{ name: 'Study the event rules', offset: -30, hours: 1.5 },
			{ name: 'Build your notes sheet or binder', offset: -24, hours: 4 },
			{ name: 'Topic deep dives', offset: -17, hours: 6 },
			{ name: 'Timed practice tests', offset: -10, hours: 5 },
			{ name: 'Review missed questions', offset: -4, hours: 3 },
			{ name: 'Final review', offset: -1, hours: 2, weight: 3 }
		]
	},
	{
		id: 'midterm',
		name: 'Midterm exam',
		group: 'Exams',
		blurb: 'Review, practice, then a timed dress rehearsal.',
		steps: [
			{ name: 'Gather notes and the syllabus', offset: -8, hours: 1 },
			{ name: 'Concept review', offset: -6, hours: 3 },
			{ name: 'Practice problems', offset: -4, hours: 3 },
			{ name: 'Timed practice exam', offset: -2, hours: 2 },
			{ name: 'Final review', offset: -1, hours: 1.5 },
			{ name: 'Exam day', offset: 0, hours: 0.5, weight: 3, type: 'exam' }
		]
	},
	{
		id: 'final-exam',
		name: 'Final exam',
		group: 'Exams',
		blurb: 'A cumulative exam, covered unit by unit.',
		steps: [
			{ name: 'Map every unit and topic', offset: -14, hours: 1 },
			{ name: 'Review the first half of units', offset: -12, hours: 3 },
			{ name: 'Review the second half of units', offset: -9, hours: 3 },
			{ name: 'Full practice final', offset: -6, hours: 3 },
			{ name: 'Fix weak spots', offset: -3, hours: 3 },
			{ name: 'Light review', offset: -1, hours: 1.5 },
			{ name: 'Exam day', offset: 0, hours: 0.5, weight: 3, type: 'exam' }
		]
	},
	{
		id: 'ap-exam',
		name: 'AP exam',
		group: 'Exams',
		blurb: 'Four weeks from diagnostic to exam-ready.',
		steps: [
			{ name: 'Diagnostic practice test', offset: -28, hours: 3 },
			{ name: 'Review your weakest units', offset: -24, hours: 5 },
			{ name: 'Review the remaining units', offset: -17, hours: 5 },
			{ name: 'Free-response practice', offset: -10, hours: 4 },
			{ name: 'Full practice exam', offset: -5, hours: 3.5 },
			{ name: 'Final review', offset: -1, hours: 1.5 },
			{ name: 'Exam day', offset: 0, hours: 0.5, weight: 3, type: 'exam' }
		]
	},
	{
		id: 'sat-act',
		name: 'SAT / ACT',
		group: 'Exams',
		blurb: 'Five weeks, two full practice tests.',
		steps: [
			{ name: 'Diagnostic test', offset: -35, hours: 3 },
			{ name: 'Math fundamentals', offset: -28, hours: 5 },
			{ name: 'Reading and writing drills', offset: -21, hours: 5 },
			{ name: 'Full practice test 1', offset: -14, hours: 3 },
			{ name: 'Targeted error review', offset: -7, hours: 3 },
			{ name: 'Full practice test 2', offset: -3, hours: 3 },
			{ name: 'Test day', offset: 0, hours: 0.5, weight: 3, type: 'exam' }
		]
	},
	{
		id: 'presentation',
		name: 'Presentation',
		group: 'Projects',
		blurb: 'Slides, notes and two full rehearsals.',
		steps: [
			{ name: 'Outline the key points', offset: -7, hours: 1 },
			{ name: 'Build the slides', offset: -5, hours: 3 },
			{ name: 'Write speaker notes', offset: -3, hours: 1.5 },
			{ name: 'Rehearse twice', offset: -1, hours: 1.5 },
			{ name: 'Present', offset: 0, hours: 0.5, weight: 2 }
		]
	},
	{
		id: 'group-project',
		name: 'Group project',
		group: 'Projects',
		blurb: 'Roles first, integration well before the deadline.',
		steps: [
			{ name: 'Kickoff and split roles', offset: -21, hours: 1 },
			{ name: 'Research', offset: -17, hours: 4 },
			{ name: 'Build the first version', offset: -12, hours: 6 },
			{ name: 'Combine everyone’s work', offset: -7, hours: 3 },
			{ name: 'Polish', offset: -3, hours: 3 },
			{ name: 'Present or submit', offset: 0, hours: 1, weight: 2 }
		]
	},
	{
		id: 'coding-project',
		name: 'Coding project',
		group: 'Projects',
		blurb: 'Spec, MVP, features, tests, demo.',
		steps: [
			{ name: 'Spec and wireframes', offset: -14, hours: 2 },
			{ name: 'Core features (MVP)', offset: -10, hours: 8 },
			{ name: 'Remaining features', offset: -6, hours: 6 },
			{ name: 'Testing and bug fixes', offset: -3, hours: 4 },
			{ name: 'README and docs', offset: -1, hours: 1.5 },
			{ name: 'Demo and submit', offset: 0, hours: 1, weight: 2 }
		]
	},
	{
		id: 'college-app',
		name: 'College application',
		group: 'Applications',
		blurb: 'Research, essays and a calm final check.',
		steps: [
			{ name: 'Research the school and program', offset: -28, hours: 2 },
			{ name: 'Brainstorm essay topics', offset: -24, hours: 1.5 },
			{ name: 'Ask for recommendations', offset: -21, hours: 0.5 },
			{ name: 'Essay first draft', offset: -18, hours: 4 },
			{ name: 'Activities list', offset: -14, hours: 2 },
			{ name: 'Essay revisions', offset: -9, hours: 3 },
			{ name: 'Final review and submit', offset: -2, hours: 1.5, weight: 3 }
		]
	}
];

export const TEMPLATE_GROUPS = [...new Set(TEMPLATES.map((t) => t.group))];
export const MILESTONE_COUNT = TEMPLATES.reduce((n, t) => n + t.steps.length, 0);

export const EFFORT = [
	{ id: 'light', label: 'Light', factor: 0.75 },
	{ id: 'standard', label: 'Standard', factor: 1 },
	{ id: 'heavy', label: 'Heavy', factor: 1.5 }
];

export const templateHours = (t, factor = 1) =>
	Math.round(t.steps.reduce((n, s) => n + s.hours, 0) * factor * 4) / 4;
export const templateSpan = (t) => -Math.min(...t.steps.map((s) => s.offset));

const defaultType = (t) => (t.group === 'Exams' ? 'exam' : t.group === 'Projects' ? 'project' : 'assignment');

/**
 * Date each step, counting back from `dueDate`. If fewer days are left than
 * the template expects, steps are squeezed proportionally so none land in the past.
 */
export function planSteps(template, dueDate, factor = 1) {
	const span = templateSpan(template);
	const available = Math.max(0, daysUntil(dueDate));
	const scale = span > available ? available / span : 1;
	const due = parseISO(dueDate) ?? startOfDay();
	let prev = null;
	return template.steps.map((step) => {
		let offset = Math.round(step.offset * scale);
		if (prev != null && offset < prev) offset = prev;
		prev = offset;
		return {
			name: step.name,
			dueDate: toISO(addDays(due, offset)),
			hours: Math.max(0.25, Math.round(step.hours * factor * 4) / 4),
			weight: step.weight ?? 1,
			type: step.type ?? defaultType(template)
		};
	});
}
