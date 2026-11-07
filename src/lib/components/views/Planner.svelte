<script>
	import { flip } from 'svelte/animate';
	import { slide, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import SmartInput from '../ui/SmartInput.svelte';
	import ScheduleChart from '../ui/ScheduleChart.svelte';
	import TypeTile from '../ui/TypeTile.svelte';
	import DeadlineItem from '../DeadlineItem.svelte';
	import DeadlineForm from '../DeadlineForm.svelte';
	import { deadlines, plan, settings } from '$lib/stores.js';
	import { addDeadline, updateDeadline, toggleDeadline } from '$lib/actions.js';
	import { toast, go, focusTarget } from '$lib/ui.js';
	import { relativeDay, relativeLower, shortDate, formatHours, todayISO, toISO, addDays, startOfDay, parseISO } from '$lib/utils/date.js';
	import { seriesColor } from '$lib/constants.js';
	import {
		Minus, Plus, SlidersHorizontal, TriangleAlert, CalendarClock, CalendarDays, Play,
		ChevronDown, Sparkles, PartyPopper, CircleCheck, Coffee
	} from '$lib/icons.js';

	let text = $state('');
	let showForm = $state(false);
	let filter = $state('active');
	let selected = $state(0);

	const sorted = $derived(
		[...$deadlines].sort(
			(a, b) => Number(a.completed) - Number(b.completed) || a.dueDate.localeCompare(b.dueDate) || b.customWeight - a.customWeight
		)
	);
	const shown = $derived(
		filter === 'all' ? sorted : sorted.filter((d) => (filter === 'done' ? d.completed : !d.completed))
	);
	const counts = $derived({
		active: $deadlines.filter((d) => !d.completed).length,
		done: $deadlines.filter((d) => d.completed).length
	});
	const day = $derived($plan.days[Math.min(selected, $plan.days.length - 1)]);

	function quickAdd(p) {
		const d = addDeadline({
			name: p.name,
			type: p.type ?? 'assignment',
			dueDate: p.dueDate ?? toISO(addDays(startOfDay(), 7)),
			estimatedHours: p.hours ?? 2,
			customWeight: p.weight ?? 1
		});
		if (!d) return;
		text = '';
		toast(
			`Added “${d.name}”, due ${relativeLower(d.dueDate)}${p.dueDate ? '' : ' (default, edit anytime)'}.`,
			{ tone: 'success' }
		);
	}

	function formAdd(fields) {
		const d = addDeadline(fields);
		if (d) {
			toast(`Added “${d.name}”`, { tone: 'success' });
			showForm = false;
		}
	}

	const setBudget = (h) => ($settings.dailyHours = Math.max(0.5, Math.min(16, Math.round(h * 2) / 2)));

	function moveToTomorrow(id) {
		updateDeadline(id, { dueDate: toISO(addDays(startOfDay(), 1)) });
		toast('Moved to tomorrow');
	}
</script>

<div class="page stagger">
	<header class="page-head">
		<div>
			<span class="eyebrow">Smart scheduler</span>
			<h1 class="page-title">Planner</h1>
			<p class="page-sub">
				Add what’s due. Studently splits it into daily blocks, most urgent first, without going over your
				daily budget.
			</p>
		</div>
		<div class="budget card">
			<SlidersHorizontal size={16} />
			<span class="b-label">Daily study budget</span>
			<div class="b-ctl">
				<button class="btn btn-soft btn-icon btn-sm" onclick={() => setBudget($settings.dailyHours - 0.5)} aria-label="Less time per day">
					<Minus size={14} />
				</button>
				<span class="b-val num">{formatHours($settings.dailyHours)}</span>
				<button class="btn btn-soft btn-icon btn-sm" onclick={() => setBudget($settings.dailyHours + 0.5)} aria-label="More time per day">
					<Plus size={14} />
				</button>
			</div>
		</div>
	</header>

	<section class="add card card-pad">
		<SmartInput bind:value={text} onsubmit={quickAdd} />
		<div class="add-foot">
			<span class="tips faint">
				Dates: <code>fri</code> <code>next tue</code> <code>nov 20</code> <code>in 5 days</code> · Hours: <code>3h</code>
				<code>90m</code> · Priority: <code>!</code> <code>!!</code> <code>!!!</code>
			</span>
			<button class="btn btn-ghost btn-sm" onclick={() => (showForm = !showForm)} aria-expanded={showForm}>
				Detailed form <span class="chev" class:open={showForm}><ChevronDown size={14} /></span>
			</button>
		</div>
		{#if showForm}
			<div class="form-wrap" transition:slide={{ duration: 350, easing: cubicOut }}>
				<DeadlineForm onsubmit={formAdd} oncancel={() => (showForm = false)} />
			</div>
		{/if}
	</section>

	{#if $plan.overdue.length || $plan.risks.length}
		<section class="warnings" transition:slide>
			{#each $plan.overdue as d (d.id)}
				<div class="warn-row card" transition:slide>
					<span class="w-ico danger"><TriangleAlert size={16} /></span>
					<span class="w-text"><strong>{d.name}</strong> was due {relativeLower(d.dueDate)}.</span>
					<button class="btn btn-soft btn-sm" onclick={() => moveToTomorrow(d.id)}>Move to tomorrow</button>
					<button class="btn btn-accent-soft btn-sm" onclick={(e) => toggleDeadline(d.id, e.currentTarget)}>Mark done</button>
				</div>
			{/each}
			{#each $plan.risks as r (r.id)}
				<div class="warn-row card" transition:slide>
					<span class="w-ico"><TriangleAlert size={16} /></span>
					<span class="w-text">
						<strong>{r.name}</strong> needs <strong>{formatHours(r.shortfall)}</strong> more than your budget allows before
						{relativeLower(r.dueDate)}.
					</span>
					<button class="btn btn-accent-soft btn-sm" onclick={() => setBudget($settings.dailyHours + 1)}>
						<Plus size={14} /> 1h per day
					</button>
				</div>
			{/each}
		</section>
	{/if}

	<section class="grid">
		<div class="list-col">
			<div class="list-head">
				<h2 class="card-title"><span class="ico"><CalendarClock size={16} /></span> Deadlines</h2>
				<div class="seg">
					<button class:on={filter === 'active'} onclick={() => (filter = 'active')}>Active <span class="faint num">{counts.active}</span></button>
					<button class:on={filter === 'done'} onclick={() => (filter = 'done')}>Done <span class="faint num">{counts.done}</span></button>
					<button class:on={filter === 'all'} onclick={() => (filter = 'all')}>All</button>
				</div>
			</div>
			{#if shown.length}
				<div class="list">
					{#each shown as d (d.id)}
						<div animate:flip={{ duration: 400, easing: cubicOut }} in:fade={{ duration: 250 }}>
							<DeadlineItem {d} />
						</div>
					{/each}
				</div>
			{:else}
				<div class="card empty">
					<span class="empty-ico">
						{#if filter === 'done'}<CircleCheck size={22} />{:else if $deadlines.length}<PartyPopper size={22} />{:else}<Sparkles size={22} />{/if}
					</span>
					<h3>
						{filter === 'done' ? 'Nothing finished yet' : $deadlines.length ? 'All done!' : 'Your planner is empty'}
					</h3>
					<p>
						{filter === 'done'
							? 'Completed deadlines show up here.'
							: $deadlines.length
								? 'Every deadline is complete. Treat yourself.'
								: 'Type something like “Essay fri 4h !!” above and press Enter.'}
					</p>
				</div>
			{/if}
		</div>

		<aside class="sched-col card card-pad">
			<div class="card-head">
				<h2 class="card-title"><span class="ico"><CalendarDays size={16} /></span> Your schedule</h2>
				<span class="mono faint">{formatHours($plan.totalPlanned)} planned</span>
			</div>
			<ScheduleChart days={$plan.days} budget={$plan.budget} doneToday={$plan.usedToday} bind:selected />

			{#if day}
				<div class="day">
					<div class="day-head">
						<div>
							<div class="day-title">{selected === 0 ? 'Today' : selected === 1 ? 'Tomorrow' : parseISO(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
							<div class="faint day-date">
								{shortDate(day.date, { month: 'long', day: 'numeric' })}{selected === 0 && $plan.usedToday > 0 ? ` · ${formatHours($plan.usedToday)} done` : ''}
							</div>
						</div>
						<div class="day-load">
							<span class="num">{formatHours(day.total)}{selected === 0 && $plan.usedToday > 0 ? ' left' : ''}</span>
							<div class="bar"><span style:width="{Math.min(100, ((day.total + (selected === 0 ? $plan.usedToday : 0)) / $plan.budget) * 100)}%"></span></div>
						</div>
					</div>
					{#key day.date}
						<ul class="day-items" in:fade={{ duration: 200 }}>
							{#each day.items as item (item.id)}
								<li style:--c={seriesColor(item.id)}>
									<TypeTile type={item.type} id={item.id} size={30} />
									<div class="di-body">
										<span class="di-name">{item.name}</span>
										<span class="faint di-due">{item.isDueDay ? 'Due today, final push' : `Due ${relativeLower(item.dueDate)}`}</span>
									</div>
									<span class="num di-h">{formatHours(item.hours)}</span>
									{#if selected === 0}
										<button
											class="btn btn-ghost btn-icon btn-sm"
											onclick={() => {
												focusTarget.set(item.id);
												go('focus');
											}}
											aria-label="Focus on {item.name}"
										>
											<Play size={14} />
										</button>
									{/if}
								</li>
							{:else}
								<li class="rest">
									<Coffee size={18} />
									<span>{$deadlines.some((d) => !d.completed) ? 'Free day. Rest is part of the plan.' : 'Nothing scheduled.'}</span>
								</li>
							{/each}
						</ul>
					{/key}
				</div>
			{/if}
		</aside>
	</section>
</div>

<style>
	.budget {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 10px 10px 16px;
		border-radius: 16px;
		color: var(--text-3);
	}
	.b-label {
		font-size: 13px;
		font-weight: 550;
		color: var(--text-2);
	}
	.b-ctl {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.b-val {
		min-width: 52px;
		text-align: center;
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
	}

	.add {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.add-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.tips {
		font-size: 12px;
		line-height: 2;
	}
	code {
		font-family: var(--font-mono);
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 6px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-2);
	}
	.chev {
		display: inline-grid;
		transition: transform 0.3s var(--ease-out);
	}
	.chev.open {
		transform: rotate(180deg);
	}
	.form-wrap {
		padding-top: 16px;
		border-top: 1px solid var(--border);
	}

	.warnings {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.warn-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px 10px 14px;
		border-radius: 16px;
		font-size: 13.5px;
		border-color: oklch(0.8 0.15 75 / 0.28);
		background: linear-gradient(90deg, oklch(0.8 0.15 75 / 0.09), var(--surface) 60%);
	}
	.w-ico {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 10px;
		flex-shrink: 0;
		color: var(--warn);
		background: oklch(0.8 0.15 75 / 0.15);
	}
	.w-ico.danger {
		color: var(--danger);
		background: oklch(0.66 0.21 25 / 0.14);
	}
	.w-text {
		flex: 1;
		color: var(--text-2);
	}
	.w-text strong {
		color: var(--text);
		font-weight: 600;
	}

	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}
	.list-col {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}
	.list-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		padding: 0 2px;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.sched-col {
		position: sticky;
		top: 24px;
		min-width: 0;
	}
	.day {
		margin-top: 18px;
		padding-top: 18px;
		border-top: 1px solid var(--border);
	}
	.day-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 12px;
	}
	.day-title {
		font-family: var(--font-display);
		font-size: 28px;
		line-height: 1.05;
	}
	.day-date {
		font-size: 12.5px;
	}
	.day-load {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 6px;
		min-width: 110px;
	}
	.day-load .num {
		font-size: 15px;
		font-weight: 600;
	}
	.day-load .bar {
		width: 100%;
		height: 5px;
	}
	.day-items {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.day-items li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		margin: 0 -10px;
		border-radius: 12px;
		transition: background 0.2s;
	}
	.day-items li:not(.rest):hover {
		background: var(--surface-2);
	}
	.di-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		line-height: 1.3;
	}
	.di-name {
		font-size: 14px;
		font-weight: 550;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.di-due {
		font-size: 12px;
	}
	.di-h {
		font-size: 13.5px;
		font-weight: 600;
		color: var(--text-2);
	}
	.rest {
		justify-content: center;
		padding: 22px 10px !important;
		color: var(--text-3);
		font-size: 13.5px;
	}

	@media (max-width: 1100px) {
		.grid {
			grid-template-columns: 1fr;
		}
		.sched-col {
			position: static;
			order: -1;
		}
	}
	@media (max-width: 640px) {
		.budget {
			width: 100%;
		}
		.b-label {
			flex: 1;
		}
		.tips {
			display: none;
		}
		.warn-row {
			flex-wrap: wrap;
		}
	}
</style>
