// Achievements are computed from your data (see lib/insights.js computeFacts),
// so they never get out of sync. `value(f)` returns progress toward `target`.

const count = (key) => (f) => f[key];
const flag = (key) => (f) => (f[key] ? 1 : 0);

export const ACHIEVEMENTS = [
	// Focus
	{ id: 'focus-1', group: 'Focus', tier: 'bronze', name: 'First focus', desc: 'Finish a focus session', target: 1, value: count('sessions') },
	{ id: 'focus-10', group: 'Focus', tier: 'bronze', name: 'Getting into it', desc: 'Finish 10 focus sessions', target: 10, value: count('sessions') },
	{ id: 'focus-50', group: 'Focus', tier: 'silver', name: 'Locked in', desc: 'Finish 50 focus sessions', target: 50, value: count('sessions') },
	{ id: 'focus-100', group: 'Focus', tier: 'gold', name: 'Centurion', desc: 'Finish 100 focus sessions', target: 100, value: count('sessions') },
	{ id: 'hours-10', group: 'Focus', tier: 'bronze', name: 'Ten hours', desc: 'Focus for 10 hours in total', target: 10, value: count('focusHours') },
	{ id: 'hours-50', group: 'Focus', tier: 'silver', name: 'Fifty hours', desc: 'Focus for 50 hours in total', target: 50, value: count('focusHours') },
	{ id: 'hours-100', group: 'Focus', tier: 'gold', name: 'Hundred hours', desc: 'Focus for 100 hours in total', target: 100, value: count('focusHours') },
	{ id: 'marathon', group: 'Focus', tier: 'silver', name: 'Marathon', desc: 'One focus session of 90+ minutes', target: 90, value: count('longestSession') },
	{ id: 'four-a-day', group: 'Focus', tier: 'bronze', name: 'Full cycle', desc: 'Finish 4 sessions in one day', target: 4, value: count('maxSessionsInDay') },

	// Streaks
	{ id: 'streak-3', group: 'Streaks', tier: 'bronze', name: 'Warming up', desc: 'Reach a 3-day streak', target: 3, value: count('longestStreak') },
	{ id: 'streak-7', group: 'Streaks', tier: 'silver', name: 'One full week', desc: 'Reach a 7-day streak', target: 7, value: count('longestStreak') },
	{ id: 'streak-14', group: 'Streaks', tier: 'silver', name: 'Two weeks strong', desc: 'Reach a 14-day streak', target: 14, value: count('longestStreak') },
	{ id: 'streak-30', group: 'Streaks', tier: 'gold', name: 'Unstoppable', desc: 'Reach a 30-day streak', target: 30, value: count('longestStreak') },

	// Deadlines
	{ id: 'deadline-1', group: 'Deadlines', tier: 'bronze', name: 'On the books', desc: 'Add your first deadline', target: 1, value: count('deadlinesAdded') },
	{ id: 'done-1', group: 'Deadlines', tier: 'bronze', name: 'Shipped', desc: 'Complete a deadline', target: 1, value: count('deadlinesDone') },
	{ id: 'done-10', group: 'Deadlines', tier: 'silver', name: 'Ten down', desc: 'Complete 10 deadlines', target: 10, value: count('deadlinesDone') },
	{ id: 'done-25', group: 'Deadlines', tier: 'gold', name: 'Closer', desc: 'Complete 25 deadlines', target: 25, value: count('deadlinesDone') },
	{ id: 'early-1', group: 'Deadlines', tier: 'bronze', name: 'Ahead of schedule', desc: 'Finish a deadline 2+ days early', target: 1, value: count('doneEarly') },
	{ id: 'early-5', group: 'Deadlines', tier: 'silver', name: 'Early every time', desc: 'Finish 5 deadlines 2+ days early', target: 5, value: count('doneEarly') },
	{ id: 'ontime-10', group: 'Deadlines', tier: 'silver', name: 'Reliable', desc: 'Finish 10 deadlines on time', target: 10, value: count('doneOnTime') },

	// Tasks
	{ id: 'task-1', group: 'Tasks', tier: 'bronze', name: 'Check', desc: 'Complete a task', target: 1, value: count('tasksDone') },
	{ id: 'task-25', group: 'Tasks', tier: 'silver', name: 'Busy week', desc: 'Complete 25 tasks', target: 25, value: count('tasksDone') },
	{ id: 'task-100', group: 'Tasks', tier: 'gold', name: 'Task master', desc: 'Complete 100 tasks', target: 100, value: count('tasksDone') },
	{ id: 'inbox-zero', group: 'Tasks', tier: 'silver', name: 'Inbox zero', desc: 'Finish every open task (5 or more)', target: 1, value: flag('inboxZero') },

	// Habits
	{ id: 'template-1', group: 'Habits', tier: 'bronze', name: 'Blueprint', desc: 'Plan something from a template', target: 1, value: count('templatesUsed') },
	{ id: 'template-3', group: 'Habits', tier: 'silver', name: 'Architect', desc: 'Plan 3 things from templates', target: 3, value: count('templatesUsed') },
	{ id: 'night-owl', group: 'Habits', tier: 'bronze', name: 'Night owl', desc: 'Start a session after 10 PM', target: 1, value: flag('nightOwl') },
	{ id: 'early-riser', group: 'Habits', tier: 'bronze', name: 'Early riser', desc: 'Start a session before 7 AM', target: 1, value: flag('earlyRiser') },
	{ id: 'weekend', group: 'Habits', tier: 'bronze', name: 'Weekend warrior', desc: 'Focus on a Saturday and the Sunday after', target: 1, value: flag('weekendBoth') },
	{ id: 'categories-5', group: 'Habits', tier: 'bronze', name: 'Color coded', desc: 'Have 5 task categories', target: 5, value: count('categories') }
];

export const ACHIEVEMENT_GROUPS = [...new Set(ACHIEVEMENTS.map((a) => a.group))];
export const TIERS = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' };
