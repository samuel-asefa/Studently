<script>
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { parseQuick, describeParse } from '$lib/utils/parse.js';
	import { categories } from '$lib/stores.js';

	let {
		value = $bindable(''),
		placeholder = 'Try “Chem midterm next fri 6h !!”',
		onsubmit,
		autofocus = false,
		inputEl = $bindable()
	} = $props();

	const parsed = $derived(parseQuick(value, { categories: Object.keys($categories) }));
	const chips = $derived(value.trim() ? describeParse(parsed) : []);

	const LABEL = { date: 'Due', hours: 'Time', priority: 'Priority', type: 'Type', category: 'In' };

	function onkeydown(e) {
		if (e.key === 'Enter' && !e.isComposing) {
			e.preventDefault();
			if (parsed.name) onsubmit?.(parsed);
		}
	}
</script>

<div class="smart" class:has-chips={chips.length > 0}>
	<div class="field">
		<!-- svelte-ignore a11y_autofocus -->
		<input
			bind:this={inputEl}
			bind:value
			{placeholder}
			{onkeydown}
			{autofocus}
			class="input"
			aria-label="Quick add a deadline"
			autocomplete="off"
			spellcheck="false"
		/>
		<button class="btn btn-primary btn-sm go" disabled={!parsed.name} onclick={() => onsubmit?.(parsed)}>
			Add <span class="kbd enter">↵</span>
		</button>
	</div>
	{#if chips.length}
		<div class="chips">
			{#each chips as c (c.kind)}
				<span class="parsed" class:tone={c.kind === 'priority'} data-tone={c.tone} in:scale={{ start: 0.8, duration: 260, easing: backOut }}>
					<span class="k">{LABEL[c.kind]}</span>
					<span class="v">{c.label}</span>
				</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.smart {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.field {
		position: relative;
		display: flex;
		align-items: center;
	}
	.input {
		height: 54px;
		padding-left: 18px;
		padding-right: 96px;
		font-size: 15.5px;
		border-radius: 16px;
	}
	.go {
		position: absolute;
		right: 8px;
	}
	.enter {
		height: 18px;
		min-width: 18px;
		padding: 0 3px;
		background: oklch(1 0 0 / 0.18);
		border-color: oklch(1 0 0 / 0.2);
		color: #fff;
		box-shadow: none;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		padding-left: 2px;
	}
	.parsed {
		display: inline-flex;
		align-items: stretch;
		height: 24px;
		border-radius: 7px;
		overflow: hidden;
		border: 1px solid var(--border-2);
		font-size: 12px;
	}
	.parsed .k {
		display: grid;
		place-items: center;
		padding: 0 7px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-3);
		background: var(--surface-2);
		border-right: 1px solid var(--border);
	}
	.parsed .v {
		display: grid;
		place-items: center;
		padding: 0 8px;
		font-weight: 550;
		color: var(--text);
	}
	.parsed[data-tone='warn'] .v {
		color: var(--warn);
	}
	.parsed[data-tone='danger'] .v {
		color: var(--danger);
	}
	.parsed[data-tone='success'] .v {
		color: var(--success);
	}
</style>
