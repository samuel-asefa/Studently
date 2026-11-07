<script>
	import { DEADLINE_TYPES, PRIORITIES, priorityFor } from '$lib/constants.js';
	import { todayISO } from '$lib/utils/date.js';
	import { Minus, Plus } from '$lib/icons.js';

	let { initial = {}, submitLabel = 'Add deadline', onsubmit, oncancel } = $props();

	let name = $state(initial.name ?? '');
	let type = $state(initial.type ?? 'assignment');
	let dueDate = $state(initial.dueDate ?? '');
	let hours = $state(initial.estimatedHours ?? 2);
	let weight = $state(priorityFor(initial.customWeight ?? 1).weight);
	let notes = $state(initial.notes ?? '');

	const step = (delta) => (hours = Math.max(0.5, Math.min(200, Math.round((Number(hours) + delta) * 2) / 2)));

	function submit(e) {
		e.preventDefault();
		if (!name.trim() || !dueDate) return;
		onsubmit?.({
			name: name.trim(),
			type,
			dueDate,
			estimatedHours: Number(hours) || 1,
			customWeight: weight,
			notes
		});
	}
</script>

<form class="form" onsubmit={submit}>
	<div class="field full">
		<label class="label" for="df-name-{initial.id ?? 'new'}">Name</label>
		<input id="df-name-{initial.id ?? 'new'}" class="input" bind:value={name} placeholder="e.g. Physics lab report" required />
	</div>

	<div class="field full">
		<span class="label">Type</span>
		<div class="seg block types">
			{#each DEADLINE_TYPES as t}
				<button type="button" class:on={type === t.id} onclick={() => (type = t.id)}>
					<t.icon size={14} />
					<span>{t.short ?? t.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="field">
		<label class="label" for="df-date-{initial.id ?? 'new'}">Due date</label>
		<input id="df-date-{initial.id ?? 'new'}" class="input" type="date" bind:value={dueDate} min={initial.id ? undefined : todayISO()} required />
	</div>

	<div class="field">
		<span class="label">Hours needed</span>
		<div class="stepper">
			<button type="button" class="btn btn-soft btn-icon" onclick={() => step(-0.5)} aria-label="Fewer hours"><Minus size={15} /></button>
			<input class="input num" type="number" min="0.5" max="200" step="0.5" bind:value={hours} aria-label="Hours needed" />
			<button type="button" class="btn btn-soft btn-icon" onclick={() => step(0.5)} aria-label="More hours"><Plus size={15} /></button>
		</div>
	</div>

	<div class="field full">
		<span class="label">Priority</span>
		<div class="seg block">
			{#each PRIORITIES as p}
				<button type="button" class:on={weight === p.weight} class={p.tone} onclick={() => (weight = p.weight)}>
					<span class="pdot"></span>{p.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="field full">
		<label class="label" for="df-notes-{initial.id ?? 'new'}">Notes <span class="faint">(optional)</span></label>
		<textarea id="df-notes-{initial.id ?? 'new'}" class="input" rows="2" bind:value={notes} placeholder="Chapters, rubric, links…"></textarea>
	</div>

	<div class="buttons full">
		{#if oncancel}<button type="button" class="btn btn-ghost" onclick={oncancel}>Cancel</button>{/if}
		<button type="submit" class="btn btn-primary" disabled={!name.trim() || !dueDate}>{submitLabel}</button>
	</div>
</form>

<style>
	.form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.full {
		grid-column: 1 / -1;
	}
	.types > button span {
		display: inline;
	}
	.stepper {
		display: flex;
		gap: 6px;
	}
	.stepper .btn {
		--h: 42px;
		flex-shrink: 0;
	}
	.stepper .input {
		text-align: center;
		-moz-appearance: textfield;
		appearance: textfield;
	}
	.stepper .input::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}
	.pdot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--text-3);
	}
	.success .pdot { background: var(--success); }
	.warn .pdot { background: var(--warn); }
	.danger .pdot { background: var(--danger); }
	.buttons {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
	@media (max-width: 640px) {
		.form {
			grid-template-columns: 1fr;
		}
		.types > button span {
			display: none;
		}
	}
</style>
