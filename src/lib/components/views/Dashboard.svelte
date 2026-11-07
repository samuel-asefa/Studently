<script>
	import { flip } from 'svelte/animate';
	import { slide, fade } from 'svelte/transition';
	import Ring from '../ui/Ring.svelte';
	import Check from '../ui/Check.svelte';
	import TypeTile from '../ui/TypeTile.svelte';
	import WeekChart from '../ui/WeekChart.svelte';
	import { stats, plan, displayName, deadlines, tasks, categories, replaceAll, achievements } from '$lib/stores.js';
	import { go, focusTarget, confirm, toast, templatesOpen } from '$lib/ui.js';
	import { toggleTask, addTask } from '$lib/actions.js';
	import { greeting, formatHours, relativeDay, shortDate, countdown, daysUntil, parseISO, weekdayShort } from '$lib/utils/date.js';
	import { seriesColor } from '$lib/constants.js';
	import { spotlight } from '$lib/utils/use.js';
	import { demoData } from '$lib/demo.js';
	import { TEMPLATES } from '$lib/content/templates.js';
	import { ArrowRight } from '$lib/icons.js';

	const dateLine = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

	const todayPlan = $derived($plan.days[0]);
	const focused = $derived($stats.focusToday / 60);
	const leftToday = $derived(todayPlan?.total ?? 0);
	const planned = $derived(focused + leftToday);
	const isEmpty = $derived($deadlines.length === 0 && $tasks.length === 0);
	const next = $derived($stats.nextDeadline);
	const openTasks = $derived($tasks.filter((t) => !t.done).slice(0, 6));
	const upcoming = $derived($stats.upcoming.slice(0, 5));
	const problems = $derived($plan.risks.length + $plan.overdue.length);
	const pct = (a, b) => (b ? Math.round(Math.min(1, a / b) * 100) : 0);

	const unlocked = $derived($achievements.filter((a) => a.unlocked).length);
	const nextUp = $derived(
		$achievements
			.filter((a) => !a.unlocked)
			.sort((a, b) => b.progress - a.progress)
			.slice(0, 3)
	);

	let now = $state(Date.now());
	$effect(() => {
		const i = setInterval(() => (now = Date.now()), 30_000);
		return () => clearInterval(i);
	});

	function dueText(iso) {
		const n = daysUntil(iso);
		if (n < 0) return 'overdue';
		if (n === 0) return 'due today';
		if (n === 1) return 'due tomorrow';
		if (n < 14) return `due ${relativeDay(iso)}`;
		return `due in ${n} days`;
	}

	const summary = $derived.by(() => {
		if (isEmpty) return 'Let’s set up your semester. Add a deadline and Studently plans the rest.';
		if (focused > 0 && leftToday === 0 && $deadlines.some((d) => !d.completed))
			return 'You’ve hit today’s plan. Anything more is a bonus.';
		const parts = [];
		if (leftToday > 0) parts.push(`${formatHours(leftToday)} of study left today`);
		if ($stats.activeTasks) parts.push(`${$stats.activeTasks} open task${$stats.activeTasks === 1 ? '' : 's'}`);
		let s = parts.length ? `You have ${parts.join(' and ')}.` : 'Nothing scheduled today.';
		if (next) s += ` ${next.name} is ${dueText(next.dueDate)}.`;
		return s;
	});

	let quick = $state('');
	function addQuick(e) {
		e.preventDefault();
		let name = quick;
		let category = '';
		const m = name.match(/(^|\s)#([\p{L}\p{N}_-]+)/u);
		if (m) {
			const found = Object.keys($categories).find((c) => c.toLowerCase().replace(/\s+/g, '') === m[2].toLowerCase());
			if (found) {
				category = found;
				name = name.replace(m[0], ' ');
			}
		}
		if (addTask(name, category)) quick = '';
	}

	function startFocus(id) {
		focusTarget.set(id);
		go('focus');
	}

	function openTemplates() {
		go('planner');
		templatesOpen.set(true);
	}

	async function loadDemo() {
		if (!isEmpty) {
			const ok = await confirm({
				title: 'Replace your data with a sample?',
				message: 'This swaps your current tasks and deadlines for a demo semester.',
				confirmLabel: 'Load sample',
				danger: true
			});
			if (!ok) return;
		}
		replaceAll(demoData());
		toast('Sample semester loaded. Poke around!', { tone: 'success' });
	}
</script>

<div class="page stagger">
	<header class="hello">
		<span class="eyebrow">{dateLine}</span>
		<h1 class="display">
			{greeting()}{#if $displayName},<br class="br" />
				<em>{$displayName}.</em>{:else}.{/if}
		</h1>
		<p class="page-sub">{summary}</p>
	</header>

	{#if isEmpty}
		<section class="welcome card spot" use:spotlight>
			<span class="eyebrow">Getting started</span>
			<h2 class="display">Three steps to a <em>calmer</em> semester.</h2>
			<ol class="steps">
				<li>
					<span class="index">01</span>
					<strong>Add your deadlines</strong>
					<span>Exams, essays, projects, with a rough hour estimate. Or start from one of {TEMPLATES.length} templates.</span>
				</li>
				<li>
					<span class="index">02</span>
					<strong>Get a daily plan</strong>
					<span>Studently spreads the work across the days you have, in 15-minute blocks.</span>
				</li>
				<li>
					<span class="index">03</span>
					<strong>Focus and track</strong>
					<span>Run focus sessions. Progress logs itself, and your plan adjusts.</span>
				</li>
			</ol>
			<div class="w-cta">
				<button class="btn btn-primary" onclick={() => go('planner')}>Add your first deadline</button>
				<button class="btn btn-soft" onclick={openTemplates}>Browse {TEMPLATES.length} templates</button>
				<button class="btn btn-ghost" onclick={loadDemo}>Load a sample semester</button>
			</div>
		</section>
	{/if}

	{#if problems > 0}
		<button class="alert card" onclick={() => go('planner')} transition:slide>
			<span class="a-text">
				{#if $plan.overdue.length}
					<strong>{$plan.overdue.length} overdue</strong> deadline{$plan.overdue.length === 1 ? '' : 's'}
					{#if $plan.risks.length}and <strong>{$plan.risks.length} at risk</strong>{/if}.
				{:else}
					<strong>{$plan.risks[0].name}</strong> needs {formatHours($plan.risks[0].shortfall)} more than your budget
					allows{$plan.risks.length > 1 ? ` (+${$plan.risks.length - 1} more)` : ''}.
				{/if}
			</span>
			<span class="a-go">Review plan <ArrowRight size={15} weight="bold" /></span>
		</button>
	{/if}

	<section class="stats">
		<article class="stat card spot" use:spotlight>
			<Ring value={planned ? focused / planned : 0} size={64} stroke={6}>
				<span class="ring-n num">{pct(focused, planned)}<small>%</small></span>
			</Ring>
			<div class="s-body">
				<span class="eyebrow">Focus today</span>
				<span class="s-big num">{formatHours(focused)}</span>
				<span class="s-sub">of {formatHours(planned)} planned</span>
			</div>
		</article>

		<article class="stat card spot" use:spotlight>
			<Ring value={$stats.totalTasks ? $stats.doneTasks / $stats.totalTasks : 0} size={64} stroke={6}>
				<span class="ring-n num">{pct($stats.doneTasks, $stats.totalTasks)}<small>%</small></span>
			</Ring>
			<div class="s-body">
				<span class="eyebrow">Tasks</span>
				<span class="s-big num">{$stats.doneTasks}<span class="faint">/{$stats.totalTasks}</span></span>
				<span class="s-sub">{$stats.doneToday} finished today</span>
			</div>
		</article>

		<article class="stat card spot" use:spotlight>
			<div class="s-body">
				<span class="eyebrow">Streak</span>
				<span class="s-big num">{$stats.streak} <small>day{$stats.streak === 1 ? '' : 's'}</small></span>
				<div class="week-dots" aria-label="Active days this week">
					{#each $stats.week as d}
						<span class="wd" class:on={d.active} title={shortDate(d.date)}>
							<i></i>
							<em>{weekdayShort(d.date).slice(0, 1)}</em>
						</span>
					{/each}
				</div>
			</div>
		</article>

		<article class="stat card spot" use:spotlight>
			{#if next}
				{@const d = parseISO(next.dueDate)}
				<div class="cal" aria-hidden="true">
					<span class="cal-m">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
					<span class="cal-d num">{d.getDate()}</span>
				</div>
				<div class="s-body">
					<span class="eyebrow">Next deadline</span>
					<span class="s-big num">{countdown(next.dueDate, now)}</span>
					<span class="s-sub ellipsis" title={next.name}>{next.name}</span>
				</div>
			{:else}
				<div class="s-body">
					<span class="eyebrow">Next deadline</span>
					<span class="s-big num">—</span>
					<span class="s-sub">You’re all clear</span>
				</div>
			{/if}
		</article>
	</section>

	<section class="grid">
		<div class="col">
			<article class="card card-pad">
				<div class="card-head">
					<h2 class="card-title">Today’s plan</h2>
					<span class="card-meta">
						{todayPlan?.items.length ?? 0} block{todayPlan?.items.length === 1 ? '' : 's'} · {formatHours(leftToday)}{focused > 0 ? ' left' : ''}
					</span>
				</div>
				{#if todayPlan?.items.length}
					<ul class="plan">
						{#each todayPlan.items as item (item.id)}
							{@const dl = $deadlines.find((d) => d.id === item.id)}
							<li class="plan-item" animate:flip={{ duration: 300 }}>
								<TypeTile type={item.type} id={item.id} />
								<div class="p-body">
									<div class="p-name">{item.name}</div>
									<div class="p-meta">
										<span>{relativeDay(item.dueDate)}</span>
										{#if dl}<span class="mono">· {formatHours(dl.hoursSpent)} / {formatHours(dl.estimatedHours)}</span>{/if}
									</div>
									{#if dl}
										<div class="bar thin">
											<span style:width="{Math.min(100, (dl.hoursSpent / dl.estimatedHours) * 100)}%" style:background={seriesColor(item.id)}></span>
										</div>
									{/if}
								</div>
								<span class="p-hours num">{formatHours(item.hours)}</span>
								<button class="btn btn-accent-soft btn-sm" onclick={() => startFocus(item.id)}>Start</button>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="empty">
						<h3>{$deadlines.length ? 'Nothing due from today' : 'No deadlines yet'}</h3>
						<p>{$deadlines.length ? 'Your plan is clear. Enjoy it, or get ahead.' : 'Add one in the Planner and your day fills itself in.'}</p>
						<button class="btn btn-soft btn-sm" onclick={() => go('planner')}>Open planner</button>
					</div>
				{/if}
			</article>

			<article class="card card-pad">
				<div class="card-head">
					<h2 class="card-title">Focus this week</h2>
					<span class="card-meta">{formatHours($stats.weekMinutes / 60)} total</span>
				</div>
				<WeekChart data={$stats.week} />
			</article>
		</div>

		<div class="col">
			<article class="card card-pad">
				<div class="card-head">
					<h2 class="card-title">Tasks</h2>
					<button class="btn btn-ghost btn-sm" onclick={() => go('tasks')}>All {$stats.totalTasks}</button>
				</div>
				<form class="quick" onsubmit={addQuick}>
					<input class="input" bind:value={quick} placeholder="Add a task… (#category)" aria-label="Add a task" />
				</form>
				{#if openTasks.length}
					<ul class="tasks">
						{#each openTasks as t (t.id)}
							<li animate:flip={{ duration: 300 }} out:fade={{ duration: 200 }}>
								<Check color={$categories[t.category]} label="Complete {t.name}" onchange={(el) => toggleTask(t.id, el)} />
								<span class="t-name">{t.name}</span>
								{#if t.category}
									<span class="dot" style:background={$categories[t.category] ?? 'var(--text-3)'} title={t.category}></span>
								{/if}
							</li>
						{/each}
					</ul>
				{:else}
					<p class="quiet">{$tasks.length ? 'Inbox zero. Beautiful.' : 'Quick to-dos live here.'}</p>
				{/if}
			</article>

			<article class="card card-pad">
				<div class="card-head">
					<h2 class="card-title">Coming up</h2>
					<button class="btn btn-ghost btn-sm" onclick={() => go('planner')}>Planner</button>
				</div>
				{#if upcoming.length}
					<ol class="timeline">
						{#each upcoming as d (d.id)}
							{@const n = daysUntil(d.dueDate)}
							<li style:--c={seriesColor(d.id)}>
								<span class="t-dot"></span>
								<div class="t-date">
									<span class="t-rel" class:soon={n <= 2}>{relativeDay(d.dueDate)}</span>
									<span class="faint">{shortDate(d.dueDate)}</span>
								</div>
								<div class="t-body">
									<span class="t-title">{d.name}</span>
									<span class="faint mono">{formatHours(Math.max(0, d.estimatedHours - d.hoursSpent))} left</span>
								</div>
							</li>
						{/each}
					</ol>
				{:else}
					<p class="quiet">No upcoming deadlines.</p>
				{/if}
			</article>

			<article class="card card-pad">
				<div class="card-head">
					<h2 class="card-title">Achievements</h2>
					<button class="btn btn-ghost btn-sm" onclick={() => go('insights')}>
						<span class="num">{unlocked}/{$achievements.length}</span>
					</button>
				</div>
				<div class="bar"><span style:width="{($achievements.length ? unlocked / $achievements.length : 0) * 100}%"></span></div>
				<ul class="next-up">
					{#each nextUp as a (a.id)}
						<li>
							<span class="tier {a.tier}"></span>
							<div class="nu-body">
								<span class="nu-name">{a.name}</span>
								<span class="faint">{a.desc}</span>
							</div>
							<span class="num nu-val">{Math.min(a.value, a.target)}<span class="faint">/{a.target}</span></span>
						</li>
					{/each}
				</ul>
			</article>
		</div>
	</section>
</div>

<style>
	.hello h1 {
		margin-top: 12px;
		font-size: clamp(44px, 6vw, 76px);
		line-height: 0.98;
		letter-spacing: -0.03em;
	}
	.hello h1 em {
		color: var(--accent);
	}
	.br {
		display: none;
	}
	.hello .page-sub {
		font-size: 16.5px;
		margin-top: 14px;
	}

	/* Welcome */
	.welcome {
		padding: 32px;
		border-radius: var(--radius-xl);
	}
	.welcome h2 {
		font-size: clamp(30px, 3.6vw, 42px);
		margin: 12px 0 26px;
	}
	.welcome h2 em {
		color: var(--accent);
	}
	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 24px;
	}
	.steps li {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-top: 14px;
		border-top: 1px solid var(--border-2);
	}
	.steps strong {
		margin-top: 6px;
		font-size: 15px;
		font-weight: 600;
	}
	.steps span:not(.index) {
		font-size: 13.5px;
		color: var(--text-2);
	}
	.w-cta {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 28px;
	}

	/* Alert */
	.alert {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 18px 14px 20px;
		text-align: left;
		font-size: 14px;
		overflow: hidden;
		border-color: oklch(0.8 0.15 75 / 0.3);
		background: linear-gradient(90deg, oklch(0.8 0.15 75 / 0.1), var(--surface));
	}
	.alert::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--warn);
	}
	.a-text {
		flex: 1;
		color: var(--text-2);
	}
	.a-text strong {
		color: var(--text);
		font-weight: 600;
	}
	.a-go {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: var(--warn);
		white-space: nowrap;
	}

	/* Stats */
	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
	}
	.stat {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 18px;
		min-width: 0;
	}
	.stat:hover {
		transform: translateY(-2px);
	}
	.ring-n {
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.03em;
	}
	.ring-n small {
		font-size: 10px;
		color: var(--text-3);
		margin-left: 1px;
	}
	.s-body {
		display: flex;
		flex-direction: column;
		min-width: 0;
		gap: 2px;
	}
	.s-big {
		font-size: 24px;
		font-weight: 600;
		line-height: 1.15;
		letter-spacing: -0.03em;
	}
	.s-big small {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-3);
	}
	.s-sub {
		font-size: 12.5px;
		color: var(--text-3);
	}
	.ellipsis {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.week-dots {
		display: flex;
		gap: 6px;
		margin-top: 6px;
	}
	.wd {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.wd i {
		width: 14px;
		height: 14px;
		border-radius: 4px;
		background: var(--surface-3);
	}
	.wd.on i {
		background: var(--accent);
		box-shadow: 0 0 10px -2px var(--accent-glow);
	}
	.wd em {
		font-style: normal;
		font-family: var(--font-mono);
		font-size: 9.5px;
		color: var(--text-3);
	}
	.cal {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 56px;
		flex-shrink: 0;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid var(--border-2);
		background: var(--surface-2);
	}
	.cal-m {
		width: 100%;
		padding: 3px 0;
		text-align: center;
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #fff;
		background: var(--btn-a);
	}
	.cal-d {
		padding: 4px 0 6px;
		font-size: 22px;
		font-weight: 600;
		line-height: 1.1;
	}

	/* Grid */
	.grid {
		display: grid;
		grid-template-columns: 1.35fr 1fr;
		gap: 16px;
		align-items: start;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
	}
	.plan {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.plan-item {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px;
		margin: 0 -12px;
		border-radius: 14px;
		transition: background 0.2s;
	}
	.plan-item:hover {
		background: var(--surface-2);
	}
	.p-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.p-name {
		font-weight: 550;
		font-size: 14.5px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.p-meta {
		display: flex;
		gap: 4px;
		font-size: 12px;
		color: var(--text-3);
	}
	.bar.thin {
		height: 4px;
		margin-top: 4px;
	}
	.p-hours {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-2);
	}
	.quick {
		margin-bottom: 8px;
	}
	.tasks li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
	}
	.tasks li:last-child {
		border-bottom: 0;
	}
	.t-name {
		flex: 1;
		min-width: 0;
		font-size: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.quiet {
		padding: 18px 0 6px;
		font-size: 13.5px;
		color: var(--text-3);
		text-align: center;
	}
	.timeline {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-left: 20px;
	}
	.timeline::before {
		content: '';
		position: absolute;
		left: 4px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		border-radius: 2px;
		background: linear-gradient(var(--border-2), transparent);
	}
	.timeline li {
		position: relative;
		display: grid;
		grid-template-columns: 92px 1fr;
		gap: 12px;
		align-items: start;
	}
	.t-dot {
		position: absolute;
		left: -20px;
		top: 4px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--c);
		box-shadow: 0 0 0 4px var(--bg), 0 0 12px var(--c);
	}
	.t-date {
		display: flex;
		flex-direction: column;
		font-size: 12px;
		line-height: 1.35;
	}
	.t-rel {
		font-weight: 600;
		font-size: 13px;
		color: var(--text-2);
	}
	.t-rel.soon {
		color: var(--warn);
	}
	.t-body {
		display: flex;
		flex-direction: column;
		min-width: 0;
		font-size: 12px;
		line-height: 1.35;
	}
	.t-title {
		font-size: 14px;
		font-weight: 550;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.next-up {
		display: flex;
		flex-direction: column;
		margin-top: 12px;
	}
	.next-up li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
	}
	.next-up li:last-child {
		border-bottom: 0;
	}
	.tier {
		width: 10px;
		height: 10px;
		border-radius: 3px;
		flex-shrink: 0;
		transform: rotate(45deg);
	}
	.tier.bronze {
		background: oklch(0.68 0.11 55);
	}
	.tier.silver {
		background: oklch(0.8 0.01 250);
	}
	.tier.gold {
		background: oklch(0.82 0.15 85);
	}
	.nu-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		font-size: 12px;
		line-height: 1.35;
	}
	.nu-name {
		font-size: 13.5px;
		font-weight: 550;
	}
	.nu-val {
		font-size: 13px;
		font-weight: 600;
	}

	@media (max-width: 1200px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 1180px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 640px) {
		.br {
			display: inline;
		}
		.hello {
			padding-top: 12px;
		}
		.welcome {
			padding: 22px;
		}
		.stats {
			gap: 10px;
		}
		.stat {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
			padding: 16px;
		}
		.s-body {
			width: 100%;
		}
		.s-big {
			font-size: 21px;
		}
		.week-dots {
			gap: 4px;
		}
		.wd i {
			width: 12px;
			height: 12px;
		}
		.alert {
			flex-wrap: wrap;
		}
		.plan-item .btn {
			display: none;
		}
	}
</style>
