<script>
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Check from './ui/Check.svelte';
	import TypeTile from './ui/TypeTile.svelte';
	import DeadlineForm from './DeadlineForm.svelte';
	import { toggleDeadline, deleteDeadline, updateDeadline, logTime } from '$lib/actions.js';
	import { go, focusTarget } from '$lib/ui.js';
	import { priorityFor, seriesColor } from '$lib/constants.js';
	import { relativeDay, shortDate, formatHours, daysUntil } from '$lib/utils/date.js';
	import { Pencil, Trash, Play, Plus, Minus, Clock } from '$lib/icons.js';

	let { d } = $props();
	let editing = $state(false);

	const n = $derived(daysUntil(d.dueDate));
	const pct = $derived(Math.min(100, (d.hoursSpent / d.estimatedHours) * 100));
	const prio = $derived(priorityFor(d.customWeight));
	const dueTone = $derived(d.completed ? '' : n < 0 ? 'danger' : n <= 2 ? 'warn' : '');
	const left = $derived(Math.max(0, d.estimatedHours - d.hoursSpent));

	function save(fields) {
		updateDeadline(d.id, fields);
		editing = false;
	}
</script>

<article class="dl card" class:done={d.completed} class:editing style:--c={seriesColor(d.id)}>
	<div class="row">
		<Check
			checked={d.completed}
			color={seriesColor(d.id)}
			label={d.completed ? `Mark ${d.name} not done` : `Complete ${d.name}`}
			onchange={(el) => toggleDeadline(d.id, el)}
		/>
		<TypeTile type={d.type} id={d.id} size={38} />
		<button class="body" onclick={() => (editing = !editing)} aria-expanded={editing}>
			<span class="name">{d.name}</span>
			<span class="meta">
				<span class="chip {dueTone}">
					{n < 0 && !d.completed ? `${-n}d overdue` : relativeDay(d.dueDate)} · {shortDate(d.dueDate)}
				</span>
				{#if prio.id !== 'normal'}<span class="chip {prio.tone}">{prio.label}</span>{/if}
				<span class="hours"><Clock size={12} /> {d.completed ? formatHours(d.hoursSpent) + ' logged' : `${formatHours(left)} left`}</span>
			</span>
		</button>
		<div class="actions">
			{#if !d.completed}
				<button
					class="btn btn-ghost btn-icon btn-sm"
					onclick={() => {
						focusTarget.set(d.id);
						go('focus');
					}}
					title="Start a focus session"
					aria-label="Focus on {d.name}"
				>
					<Play size={15} />
				</button>
			{/if}
			<button class="btn btn-ghost btn-icon btn-sm" onclick={() => (editing = !editing)} aria-label="Edit {d.name}">
				<Pencil size={15} />
			</button>
			<button class="btn btn-ghost btn-danger btn-icon btn-sm" onclick={() => deleteDeadline(d.id)} aria-label="Delete {d.name}">
				<Trash size={15} />
			</button>
		</div>
	</div>

	<div class="progress">
		<div class="bar"><span style:width="{pct}%" style:background="var(--c)"></span></div>
		<span class="mono pct">{formatHours(d.hoursSpent)} / {formatHours(d.estimatedHours)}</span>
		{#if !d.completed}
			<div class="log">
				<button class="mini" onclick={() => logTime(d.id, -0.5)} disabled={d.hoursSpent <= 0} aria-label="Remove 30 minutes">
					<Minus size={12} />
				</button>
				<span class="mono">30m</span>
				<button class="mini" onclick={() => logTime(d.id, 0.5)} aria-label="Log 30 minutes">
					<Plus size={12} />
				</button>
			</div>
		{/if}
	</div>

	{#if editing}
		<div class="edit" transition:slide={{ duration: 300, easing: cubicOut }}>
			<DeadlineForm initial={d} submitLabel="Save changes" onsubmit={save} oncancel={() => (editing = false)} />
		</div>
	{/if}
</article>

<style>
	.dl {
		padding: 14px 14px 12px;
		border-radius: 18px;
		box-shadow: var(--shadow-sm);
		transition: border-color 0.25s, transform 0.3s var(--ease-out), opacity 0.3s;
	}
	.dl::before {
		content: '';
		position: absolute;
		left: -1px;
		top: 16px;
		bottom: 16px;
		width: 3px;
		border-radius: 0 3px 3px 0;
		background: var(--c);
		opacity: 0;
		transition: opacity 0.25s;
	}
	.dl:hover {
		border-color: var(--border-2);
	}
	.dl:hover::before,
	.dl.editing::before {
		opacity: 1;
	}
	.dl.done {
		opacity: 0.6;
	}
	.dl.done .name {
		text-decoration: line-through;
		text-decoration-color: var(--text-3);
	}
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
		text-align: left;
	}
	.name {
		max-width: 100%;
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.01em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
	}
	.hours {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: var(--text-3);
		margin-left: 2px;
	}
	.actions {
		display: flex;
		gap: 2px;
		opacity: 0.35;
		transition: opacity 0.2s;
	}
	.dl:hover .actions,
	.dl:focus-within .actions {
		opacity: 1;
	}
	.progress {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 12px 0 0 34px;
	}
	.progress .bar {
		flex: 1;
		height: 5px;
	}
	.pct {
		font-size: 11.5px;
		color: var(--text-3);
		white-space: nowrap;
	}
	.log {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		color: var(--text-3);
		opacity: 0;
		transition: opacity 0.2s;
	}
	.dl:hover .log {
		opacity: 1;
	}
	.mini {
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border-radius: 7px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-2);
	}
	.mini:hover:not(:disabled) {
		color: var(--text);
		border-color: var(--border-2);
	}
	.edit {
		margin-top: 14px;
		padding-top: 14px;
		border-top: 1px solid var(--border);
	}
	@media (hover: none) {
		.actions,
		.log {
			opacity: 1;
		}
	}
	@media (max-width: 640px) {
		.dl :global(.tile) {
			display: none;
		}
		.progress {
			margin-left: 0;
		}
	}
</style>
