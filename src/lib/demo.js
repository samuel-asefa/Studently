import { addDays, startOfDay, toISO } from './utils/date.js';
import { uid } from './utils/id.js';

/** A believable sample semester, dated relative to today. */
export function demoData() {
	const base = startOfDay();
	const day = (n) => toISO(addDays(base, n));
	const at = (n, hour = 15) => {
		const d = addDays(base, n);
		d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
		return d.getTime();
	};

	const ids = { chem: uid(), essay: uid(), calc: uid(), cs: uid(), debate: uid(), spanish: uid(), bio: uid() };

	const deadlines = [
		{ id: ids.calc, name: 'Calc II problem set 7', type: 'assignment', dueDate: day(1), estimatedHours: 3, customWeight: 1, hoursSpent: 1.5 },
		{ id: ids.essay, name: 'History essay: the Cold War', type: 'assignment', dueDate: day(3), estimatedHours: 6, customWeight: 2, hoursSpent: 1.75 },
		{ id: ids.debate, name: 'Debate club regional prep', type: 'ec', dueDate: day(4), estimatedHours: 2.5, customWeight: 0.75, hoursSpent: 0 },
		{ id: ids.chem, name: 'Organic chemistry midterm', type: 'exam', dueDate: day(6), estimatedHours: 10, customWeight: 3, hoursSpent: 2 },
		{ id: ids.bio, name: 'Bio lab report: enzymes', type: 'assignment', dueDate: day(9), estimatedHours: 4, customWeight: 1, hoursSpent: 0 },
		{ id: ids.cs, name: 'CS final project: web app', type: 'project', dueDate: day(13), estimatedHours: 16, customWeight: 2, hoursSpent: 3.5 },
		{ id: ids.spanish, name: 'Spanish vocab quiz', type: 'exam', dueDate: day(-2), estimatedHours: 2, customWeight: 1, hoursSpent: 2, completed: true, completedAt: at(-2, 9) }
	].map((d) => ({ completed: false, completedAt: null, createdAt: at(-10), notes: '', ...d }));

	const t = (name, category, done = false, daysAgo = 0) => ({
		id: uid(),
		name,
		category,
		done,
		createdAt: at(-daysAgo - 1),
		completedAt: done ? at(-daysAgo, 11) : null
	});

	const tasks = [
		t('Email Prof. Lin about office hours', 'Study'),
		t('Print lab safety form', 'Study'),
		t('Review lecture 12 notes', 'Study', true, 0),
		t('Finish shift swap with Maya', 'Work'),
		t('Submit timesheet', 'Work', true, 1),
		t('Update résumé for career fair', 'Work'),
		t('Gym: leg day', 'Personal', true, 0),
		t('Call grandma', 'Personal'),
		t('Laundry + groceries', 'Personal'),
		t('Book flights home for break', 'Personal', true, 2)
	];

	const sess = (daysAgo, minutes, deadlineId, hour) => ({
		id: uid(),
		at: at(-daysAgo, hour),
		minutes,
		deadlineId
	});

	const sessions = [
		sess(6, 25, ids.calc, 16), sess(6, 25, ids.calc, 17),
		sess(5, 50, ids.essay, 14),
		sess(4, 25, ids.chem, 10), sess(4, 25, ids.chem, 11), sess(4, 25, ids.cs, 20),
		sess(3, 50, ids.cs, 19), sess(3, 25, ids.essay, 21),
		sess(2, 25, ids.spanish, 8), sess(2, 50, ids.cs, 15),
		sess(1, 25, ids.chem, 13), sess(1, 25, ids.chem, 14), sess(1, 25, ids.calc, 18),
		sess(0, 25, ids.essay, 10), sess(0, 25, ids.cs, 12)
	];

	return {
		categories: { Study: '#10b981', Work: '#3b82f6', Personal: '#f43f5e', Clubs: '#f59e0b' },
		deadlines,
		tasks,
		sessions
	};
}
