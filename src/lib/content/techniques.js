// Timer presets. Durations in minutes.
export const PRESETS = [
	{ id: 'pomodoro', name: 'Pomodoro', focus: 25, short: 5, long: 15, note: 'The classic. Short rounds, frequent breaks.' },
	{ id: 'deep', name: 'Deep work', focus: 50, short: 10, long: 30, note: 'Longer rounds for writing and problem sets.' },
	{ id: 'ultradian', name: 'Ultradian', focus: 90, short: 20, long: 30, note: 'One long block, then a real rest.' },
	{ id: '52-17', name: '52 / 17', focus: 52, short: 17, long: 30, note: 'Long-ish focus with generous breaks.' },
	{ id: 'sprint', name: 'Sprint', focus: 15, short: 3, long: 10, note: 'For getting started when you don’t want to.' },
	{ id: 'review', name: 'Review', focus: 30, short: 5, long: 15, note: 'Flashcards and spaced review sessions.' }
];

export const presetFor = (s) =>
	PRESETS.find((p) => p.focus === s.focusMinutes && p.short === s.shortBreak && p.long === s.longBreak) ?? null;

// Study methods. `preset` suggests a timer setup.
export const TECHNIQUES = [
	{
		id: 'active-recall',
		name: 'Active recall',
		group: 'Remember',
		tagline: 'Pull information out of your head instead of rereading it.',
		bestFor: 'Facts, definitions, exams',
		steps: ['Close your notes.', 'Write or say everything you remember about the topic.', 'Check against your notes and mark the gaps.', 'Restudy only the gaps, then try again.'],
		preset: 'pomodoro'
	},
	{
		id: 'spaced-repetition',
		name: 'Spaced repetition',
		group: 'Remember',
		tagline: 'Review just before you’d forget, at growing intervals.',
		bestFor: 'Vocabulary, formulas, long courses',
		steps: ['Study the material once.', 'Review after 1 day, then 3, then 7, then 14.', 'Move cards you miss back to a shorter interval.'],
		preset: 'review'
	},
	{
		id: 'leitner',
		name: 'Leitner boxes',
		group: 'Remember',
		tagline: 'Flashcards sorted into boxes by how well you know them.',
		bestFor: 'Language learning, terminology',
		steps: ['Start every card in box 1 and review box 1 daily.', 'Right answers move up a box; wrong answers go back to box 1.', 'Review higher boxes less often (every 2, 4, 8 days).'],
		preset: 'review'
	},
	{
		id: 'blurting',
		name: 'Blurting',
		group: 'Remember',
		tagline: 'Dump everything you know onto a blank page, then fill the holes.',
		bestFor: 'Essay subjects, history, biology',
		steps: ['Read a section once.', 'On a blank page, write everything you can remember.', 'Compare with the source in a different color.', 'Repeat later with only the missing parts.'],
		preset: 'sprint'
	},
	{
		id: 'practice-testing',
		name: 'Practice testing',
		group: 'Remember',
		tagline: 'Rehearse the real thing: timed, closed-book, past papers.',
		bestFor: 'Standardized tests, finals',
		steps: ['Find past papers or make a mock exam.', 'Take it under real time limits.', 'Grade it honestly and list every mistake.', 'Study the mistakes, not what you already got right.'],
		preset: 'ultradian'
	},
	{
		id: 'feynman',
		name: 'Feynman technique',
		group: 'Understand',
		tagline: 'Explain it simply enough that a younger student would get it.',
		bestFor: 'Concepts in science and math',
		steps: ['Write the concept at the top of a page.', 'Explain it in plain words, as if teaching someone.', 'Wherever you get stuck or use jargon, go back to the source.', 'Simplify and use an analogy.'],
		preset: 'deep'
	},
	{
		id: 'elaboration',
		name: 'Elaboration',
		group: 'Understand',
		tagline: 'Keep asking “why?” and “how does this connect?”',
		bestFor: 'Reading-heavy subjects',
		steps: ['Pick an idea from your notes.', 'Ask why it’s true and how it works.', 'Connect it to something you already know.'],
		preset: 'deep'
	},
	{
		id: 'dual-coding',
		name: 'Dual coding',
		group: 'Understand',
		tagline: 'Pair words with visuals: diagrams, timelines, flowcharts.',
		bestFor: 'Processes, systems, timelines',
		steps: ['Pick something with steps or structure.', 'Draw it as a diagram or timeline.', 'Explain the drawing out loud using your notes.'],
		preset: 'pomodoro'
	},
	{
		id: 'interleaving',
		name: 'Interleaving',
		group: 'Understand',
		tagline: 'Mix problem types instead of doing one kind in a row.',
		bestFor: 'Math, physics, chemistry',
		steps: ['Gather problems from 2–3 different topics.', 'Shuffle them.', 'For each one, first decide which method applies, then solve.'],
		preset: 'deep'
	},
	{
		id: 'teach-back',
		name: 'Teach it back',
		group: 'Understand',
		tagline: 'Teaching a friend exposes what you don’t really know.',
		bestFor: 'Study groups, presentations',
		steps: ['Pick a topic and a willing listener.', 'Teach it without notes.', 'Write down every question you couldn’t answer.'],
		preset: 'pomodoro'
	},
	{
		id: 'cornell',
		name: 'Cornell notes',
		group: 'Take notes',
		tagline: 'A notes page built for review: cues, notes, summary.',
		bestFor: 'Lectures and readings',
		steps: ['Split the page: a narrow cue column, wide notes, summary at the bottom.', 'Take notes during class.', 'Afterwards, write questions in the cue column.', 'Summarize the page in 2–3 sentences.'],
		preset: null
	},
	{
		id: 'sq3r',
		name: 'SQ3R',
		group: 'Take notes',
		tagline: 'Survey, Question, Read, Recite, Review.',
		bestFor: 'Textbook chapters',
		steps: ['Survey headings and figures.', 'Turn headings into questions.', 'Read to answer them.', 'Recite answers from memory.', 'Review the whole chapter.'],
		preset: 'deep'
	},
	{
		id: 'mind-map',
		name: 'Mind mapping',
		group: 'Take notes',
		tagline: 'Branch out from one central idea to see the whole topic.',
		bestFor: 'Essay planning, big-picture review',
		steps: ['Write the topic in the middle of the page.', 'Add main branches for each subtopic.', 'Add details, examples and links between branches.'],
		preset: 'sprint'
	},
	{
		id: 'time-blocking',
		name: 'Time blocking',
		group: 'Plan',
		tagline: 'Give every hour a job before the day starts.',
		bestFor: 'Busy weeks, many classes',
		steps: ['List what has to get done.', 'Put each item in a specific block on your calendar.', 'Protect the blocks like appointments.'],
		preset: null
	},
	{
		id: 'eat-the-frog',
		name: 'Eat the frog',
		group: 'Plan',
		tagline: 'Do the hardest, most-dreaded task first.',
		bestFor: 'Procrastination',
		steps: ['Pick tomorrow’s hardest task tonight.', 'Start it before anything else.', 'Everything after it feels easy.'],
		preset: 'sprint'
	},
	{
		id: 'two-minute',
		name: 'Two-minute rule',
		group: 'Plan',
		tagline: 'If it takes under two minutes, do it now.',
		bestFor: 'Small tasks piling up',
		steps: ['Scan your task list.', 'Do anything that takes under two minutes immediately.', 'Schedule the rest.'],
		preset: null
	}
];

export const TECHNIQUE_GROUPS = [...new Set(TECHNIQUES.map((t) => t.group))];
