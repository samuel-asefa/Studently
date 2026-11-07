<script>
	import { facts, achievements, insights, stats, tasks, deadlines } from '$lib/stores.js';
	import { ACHIEVEMENT_GROUPS, TIERS } from '$lib/content/achievements.js';
	import { seriesColor } from '$lib/constants.js';
	import { formatHours, shortDate, parseISO } from '$lib/utils/date.js';
	import { spotlight } from '$lib/utils/use.js';
	import { go } from '$lib/ui.js';

	const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const hourLabel = (h) => (h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`);
	const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`);

	const unlocked = $derived($achievements.filter((a) => a.unlocked).length);
	const tierCounts = $derived(
		Object.keys(TIERS).map((t) => ({
			tier: t,
			done: $achievements.filter((a) => a.tier === t && a.unlocked).length,
			total: $achievements.filter((a) => a.tier === t).length
		}))
	);

	const kpis = $derived([
		{ label: 'Focus time', value: formatHours($facts.focusMinutes / 60), sub: `${$facts.sessions} sessions` },
		{ label: 'Avg session', value: `${Math.round($insights.avgSession)}m`, sub: `longest ${$facts.longestSession}m` },
		{ label: 'Longest streak', value: `${$facts.longestStreak}d`, sub: `current ${$stats.streak}d` },
		{ label: 'On-time rate', value: pct($insights.onTimeRate), sub: `${$facts.doneOnTime} of ${$facts.deadlinesDone} deadlines` },
		{ label: 'Estimate accuracy', value: pct($insights.accuracy), sub: 'logged vs. estimated hours' },
		{ label: 'Deadlines done', value: String($facts.deadlinesDone), sub: `${$facts.doneEarly} finished 2+ days early` },
		{ label: 'Tasks done', value: String($facts.tasksDone), sub: `${$tasks.length - $facts.tasksDone} still open` },
		{
			label: 'Peak focus',
			value: $insights.peakHour == null ? '—' : hourLabel($insights.peakHour),
			sub: $insights.bestDay == null ? 'no sessions yet' : `best day: ${WEEKDAYS[$insights.bestDay]}`
		}
	]);

	const heatLevel = (m) => (m <= 0 ? 0 : m <= 30 ? 1 : m <= 60 ? 2 : m <= 120 ? 3 : 4);
	const columns = $derived(
		Array.from({ length: $insights.weeks }, (_, w) => $insights.heat.slice(w * 7, w * 7 + 7))
	);
	// Month label goes over the first week that starts in a new month.
	const monthLabels = $derived(
		columns.map((col, i) => {
			const first = parseISO(col[0].date);
			const prev = i > 0 ? parseISO(columns[i - 1][0].date) : null;
			return !prev || prev.getMonth() !== first.getMonth()
				? first.toLocaleDateString('en-US', { month: 'short' })
				: '';
		})
	);

	const hourMax = $derived(Math.max(1, ...$insights.byHour));
	const dayMax = $derived(Math.max(1, ...$insights.byWeekday));
	const deadlineMax = $derived(Math.max(1, ...$insights.perDeadline.map((d) => Math.max(d.spent, d.estimate))));
</script>

<div class="page stagger">
	<header class="page-head">
		<div>
			<span class="eyebrow">Your numbers</span>
			<h1 class="page-title">Insights</h1>
			<p class="page-sub">How much you’ve studied, when you focus best, and how close your estimates land.</p>
		</div>
		<div class="score card">
			<span class="score-n num">{unlocked}<span class="faint">/{$achievements.length}</span></span>
			<span class="faint">achievements</span>
		</div>
	</header>

	<section class="kpis">
		{#each kpis as k, i}
			<article class="kpi card spot" use:spotlight>
				<span class="index">{String(i + 1).padStart(2, '0')}</span>
				<span class="eyebrow">{k.label}</span>
				<span class="kpi-v num">{k.value}</span>
				<span class="kpi-s">{k.sub}</span>
			</article>
		{/each}
	</section>

	<article class="card card-pad">
		<div class="card-head">
			<h2 class="card-title">Last {$insights.weeks} weeks</h2>
			<span class="card-meta">
				{formatHours($insights.heatTotal / 60)} focused · {$insights.activeHeatDays} active days
			</span>
		</div>
		<div class="heat-wrap">
			<div class="heat" style:--w={$insights.weeks}>
				{#each monthLabels as m, i}
					<span class="mlabel" style:grid-column={i + 2} style:grid-row="1" aria-hidden="true">{m}</span>
				{/each}
				{#each ['', 'Mon', '', 'Wed', '', 'Fri', ''] as l, r}
					<span class="dlabel" style:grid-row={r + 2} aria-hidden="true">{l}</span>
				{/each}
				{#each $insights.heat as d, i}
					<span
						class="cell l{heatLevel(d.minutes)}"
						class:future={d.future}
						style:grid-column={Math.floor(i / 7) + 2}
						style:grid-row={(i % 7) + 2}
						title="{shortDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })}: {formatHours(d.minutes / 60)}"
					></span>
				{/each}
			</div>
		</div>
		<div class="legend">
			<span>Less</span>
			{#each [0, 1, 2, 3, 4] as l}<span class="cell l{l}"></span>{/each}
			<span>More</span>
		</div>
	</article>

	<section class="two">
		<article class="card card-pad">
			<div class="card-head">
				<h2 class="card-title">Time of day</h2>
				<span class="card-meta">{$insights.peakHour == null ? 'no data' : `peak ${hourLabel($insights.peakHour)}`}</span>
			</div>
			<div class="hours">
				{#each $insights.byHour as m, h}
					<span class="hbar" class:peak={h === $insights.peakHour && m > 0} style:height="{(m / hourMax) * 100}%" title="{hourLabel(h)}: {formatHours(m / 60)}"></span>
				{/each}
			</div>
			<div class="axis mono"><span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span></div>
		</article>

		<article class="card card-pad">
			<div class="card-head">
				<h2 class="card-title">Day of week</h2>
				<span class="card-meta">{$insights.bestDay == null ? 'no data' : `best ${WEEKDAYS[$insights.bestDay]}`}</span>
			</div>
			<div class="days">
				{#each $insights.byWeekday as m, d}
					<div class="drow">
						<span class="dl mono">{WEEKDAYS[d]}</span>
						<div class="dtrack"><span style:width="{(m / dayMax) * 100}%" class:peak={d === $insights.bestDay && m > 0}></span></div>
						<span class="dv num">{formatHours(m / 60)}</span>
					</div>
				{/each}
			</div>
		</article>
	</section>

	<article class="card card-pad">
		<div class="card-head">
			<h2 class="card-title">Where your hours go</h2>
			<span class="card-meta">logged vs. estimated · top {$insights.perDeadline.length}</span>
		</div>
		{#if $insights.perDeadline.length}
			<ul class="spend">
				{#each $insights.perDeadline as d (d.id)}
					<li>
						<span class="sp-name" title={d.name}>{d.name}</span>
						<div class="sp-track">
							<span class="sp-est" style:width="{(d.estimate / deadlineMax) * 100}%"></span>
							<span class="sp-log" style:width="{(d.spent / deadlineMax) * 100}%" style:background={seriesColor(d.id)}></span>
						</div>
						<span class="sp-v num">{formatHours(d.spent)}<span class="faint"> / {formatHours(d.estimate)}</span></span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="quiet">Log time on a deadline with the focus timer to see it here.</p>
		{/if}
	</article>

	<section class="ach">
		<div class="ach-head">
			<h2 class="card-title">Achievements</h2>
			<div class="tiers">
				{#each tierCounts as t}
					<span class="tier-chip"><i class="tier {t.tier}"></i>{TIERS[t.tier]} <span class="num">{t.done}/{t.total}</span></span>
				{/each}
			</div>
		</div>
		{#each ACHIEVEMENT_GROUPS as group}
			{@const list = $achievements.filter((a) => a.group === group)}
			<div class="ach-group">
				<div class="ach-label">
					<span class="eyebrow">{group}</span>
					<span class="card-meta">{list.filter((a) => a.unlocked).length}/{list.length}</span>
				</div>
				<div class="ach-grid">
					{#each list as a (a.id)}
						<article class="badge card" class:locked={!a.unlocked}>
							<div class="b-top">
								<i class="tier {a.tier}"></i>
								<span class="b-tier">{TIERS[a.tier]}</span>
								{#if a.unlocked}<span class="b-done">Unlocked</span>{/if}
							</div>
							<h3>{a.name}</h3>
							<p>{a.desc}</p>
							<div class="b-prog">
								<div class="bar"><span style:width="{a.progress * 100}%"></span></div>
								<span class="num">{Math.min(Math.floor(a.value), a.target)}/{a.target}</span>
							</div>
						</article>
					{/each}
				</div>
			</div>
		{/each}
	</section>

	{#if !$deadlines.length}
		<button class="btn btn-soft cta" onclick={() => go('planner')}>Add a deadline to start collecting numbers</button>
	{/if}
</div>

<style>
	.score {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		padding: 12px 18px;
		border-radius: 16px;
		font-size: 12px;
	}
	.score-n {
		font-size: 26px;
		font-weight: 600;
		letter-spacing: -0.03em;
		line-height: 1.1;
	}
	.score-n .faint {
		font-size: 16px;
	}

	.kpis {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
	}
	.kpi {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 16px 18px 18px;
		min-width: 0;
	}
	.kpi .index {
		margin-bottom: 8px;
	}
	.kpi-v {
		margin-top: 4px;
		font-size: 30px;
		font-weight: 600;
		letter-spacing: -0.04em;
		line-height: 1.05;
	}
	.kpi-s {
		font-size: 12.5px;
		color: var(--text-3);
	}

	/* Heatmap */
	.heat-wrap {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 4px;
	}
	.heat {
		display: grid;
		grid-template-columns: 30px repeat(var(--w), minmax(11px, 17px));
		grid-template-rows: 16px;
		grid-auto-rows: auto;
		gap: 4px;
	}
	.mlabel,
	.dlabel {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--text-3);
		white-space: nowrap;
		align-self: center;
	}
	.dlabel {
		grid-column: 1;
	}
	.cell {
		display: block;
		aspect-ratio: 1;
		border-radius: 3px;
		background: var(--surface-3);
		transition: transform 0.15s;
	}
	.heat .cell:hover {
		transform: scale(1.25);
	}
	.cell.l1 { background: oklch(0.7 0.17 var(--accent-h) / 0.3); }
	.cell.l2 { background: oklch(0.7 0.17 var(--accent-h) / 0.5); }
	.cell.l3 { background: oklch(0.7 0.17 var(--accent-h) / 0.75); }
	.cell.l4 { background: var(--accent); }
	.cell.future {
		opacity: 0.35;
	}
	.legend {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 4px;
		margin-top: 12px;
		font-size: 11px;
		color: var(--text-3);
	}
	.legend .cell {
		width: 11px;
	}
	.legend span:first-child {
		margin-right: 4px;
	}
	.legend span:last-child {
		margin-left: 4px;
	}

	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	.hours {
		display: flex;
		align-items: flex-end;
		gap: 3px;
		height: 120px;
		border-bottom: 1px solid var(--border);
	}
	.hbar {
		flex: 1;
		min-height: 2px;
		border-radius: 3px 3px 0 0;
		background: oklch(0.7 0.17 var(--accent-h) / 0.45);
		transition: height 0.6s var(--ease-out);
	}
	.hbar.peak {
		background: var(--accent);
	}
	.axis {
		display: flex;
		justify-content: space-between;
		margin-top: 6px;
		font-size: 10.5px;
		color: var(--text-3);
	}
	.days {
		display: flex;
		flex-direction: column;
		gap: 9px;
	}
	.drow {
		display: grid;
		grid-template-columns: 34px 1fr 56px;
		align-items: center;
		gap: 10px;
	}
	.dl {
		font-size: 11.5px;
		color: var(--text-3);
	}
	.dtrack {
		height: 10px;
		border-radius: 999px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.dtrack span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: oklch(0.7 0.17 var(--accent-h) / 0.55);
		transition: width 0.6s var(--ease-out);
	}
	.dtrack span.peak {
		background: var(--accent);
	}
	.dv {
		font-size: 12px;
		text-align: right;
		color: var(--text-2);
	}

	.spend {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.spend li {
		display: grid;
		grid-template-columns: minmax(120px, 0.9fr) 2fr auto;
		align-items: center;
		gap: 14px;
	}
	.sp-name {
		font-size: 13.5px;
		font-weight: 550;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sp-track {
		position: relative;
		height: 12px;
		border-radius: 999px;
		background: var(--surface-2);
	}
	.sp-est {
		position: absolute;
		inset: 0 auto 0 0;
		border-radius: inherit;
		border: 1px dashed var(--border-2);
	}
	.sp-log {
		position: absolute;
		inset: 0 auto 0 0;
		border-radius: inherit;
	}
	.sp-v {
		font-size: 12.5px;
		white-space: nowrap;
	}
	.quiet {
		font-size: 13.5px;
		color: var(--text-3);
	}

	/* Achievements */
	.ach {
		display: flex;
		flex-direction: column;
		gap: 18px;
		margin-top: 8px;
	}
	.ach-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.tiers {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.tier-chip {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		height: 28px;
		padding: 0 11px;
		border-radius: 999px;
		font-size: 12px;
		color: var(--text-2);
		background: var(--surface-2);
		border: 1px solid var(--border);
	}
	.tier {
		display: inline-block;
		width: 9px;
		height: 9px;
		border-radius: 2px;
		transform: rotate(45deg);
		flex-shrink: 0;
	}
	.tier.bronze { background: oklch(0.68 0.11 55); }
	.tier.silver { background: oklch(0.8 0.01 250); }
	.tier.gold { background: oklch(0.82 0.15 85); }
	.ach-label {
		display: flex;
		align-items: baseline;
		gap: 10px;
		margin-bottom: 10px;
	}
	.ach-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
		gap: 10px;
	}
	.badge {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px 16px;
		border-radius: 16px;
		box-shadow: var(--shadow-sm);
	}
	.badge.locked {
		opacity: 0.62;
	}
	.badge:not(.locked) {
		border-color: oklch(0.74 0.17 var(--accent-h) / 0.35);
		background-image: linear-gradient(160deg, var(--accent-soft), transparent 60%);
	}
	.b-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}
	.b-tier {
		font-family: var(--font-mono);
		font-size: 10.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
	}
	.b-done {
		margin-left: auto;
		font-size: 11px;
		font-weight: 600;
		color: var(--accent-ink);
	}
	.badge h3 {
		font-size: 14.5px;
		font-weight: 600;
	}
	.badge p {
		font-size: 12.5px;
		color: var(--text-2);
		line-height: 1.4;
	}
	.b-prog {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 8px;
	}
	.b-prog .bar {
		flex: 1;
		height: 4px;
	}
	.b-prog .num {
		font-size: 11.5px;
		color: var(--text-2);
	}
	.cta {
		align-self: center;
	}

	@media (max-width: 1100px) {
		.kpis {
			grid-template-columns: repeat(2, 1fr);
		}
		.two {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 640px) {
		.kpi-v {
			font-size: 24px;
		}
		.spend li {
			grid-template-columns: 1fr auto;
		}
		.sp-track {
			grid-column: 1 / -1;
			grid-row: 2;
		}
	}
</style>
