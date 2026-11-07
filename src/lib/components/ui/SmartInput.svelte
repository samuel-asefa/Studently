<script>
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { parseQuick, describeParse } from '$lib/utils/parse.js';
	import { categories } from '$lib/stores.js';
	import { WandSparkles, CalendarDays, Clock, Zap, Layers, Tag, CornerDownLeft } from '$lib/icons.js';

	let {
		value = $bindable(''),
		placeholder = 'Try “Chem midterm next fri 6h !!”',
		onsubmit,
		autofocus = false,
		inputEl = $bindable()
	} = $props();

	const parsed = $derived(parseQuick(value, { categories: Object.keys($categories) }));
	const chips = $derived(value.trim() ? describeParse(parsed) : []);

	const ICON = { date: CalendarDays, hours: Clock, priority: Zap, type: Layers, category: Tag };

	function onkeydown(e) {
		if (e.key === 'Enter' && !e.isComposing) {
			e.preventDefault();
			if (parsed.name) onsubmit?.(parsed);
		}
	}
</script>

<div class="smart" class:has-chips={chips.length > 0}>
	<div class="field">
		<span class="lead"><WandSparkles size={18} /></span>
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
			Add <span class="kbd enter"><CornerDownLeft size={11} /></span>
		</button>
	</div>
	{#if chips.length}
		<div class="chips">
			<span class="hint">Understood:</span>
			{#each chips as c (c.kind)}
				{@const Icon = ICON[c.kind]}
				<span
					class="chip {c.kind === 'priority' ? c.tone || 'accent' : 'accent'}"
					in:scale={{ start: 0.7, duration: 280, easing: backOut }}
				>
					<Icon size={12} />
					{c.label}
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
	.lead {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--accent);
		pointer-events: none;
		display: grid;
	}
	.input {
		height: 54px;
		padding-left: 46px;
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
		padding-left: 4px;
	}
	.hint {
		font-size: 12px;
		color: var(--text-3);
		margin-right: 2px;
	}
</style>
