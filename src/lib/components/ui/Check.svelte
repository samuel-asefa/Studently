<script>
	let { checked = false, color = null, size = 22, label = 'Mark complete', onchange } = $props();
	let el = $state();
</script>

<button
	bind:this={el}
	type="button"
	class="check"
	class:on={checked}
	style:--c={color}
	style:--s="{size}px"
	role="checkbox"
	aria-checked={checked}
	aria-label={label}
	onclick={(e) => {
		e.stopPropagation();
		onchange?.(el);
	}}
>
	<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9" /></svg>
</button>

<style>
	.check {
		--c: var(--accent);
		position: relative;
		display: grid;
		place-items: center;
		width: var(--s);
		height: var(--s);
		border-radius: calc(var(--s) * 0.34);
		border: 1.75px solid var(--border-2);
		background: transparent;
		flex-shrink: 0;
		transition: background 0.25s, border-color 0.25s, box-shadow 0.3s, transform 0.2s;
	}
	.check:hover {
		border-color: var(--c);
		background: color-mix(in oklch, var(--c) 14%, transparent);
	}
	.check.on {
		background: var(--c);
		border-color: var(--c);
		box-shadow: 0 4px 14px -4px var(--c);
		animation: pop 0.45s var(--ease-spring);
	}
	svg {
		width: 72%;
		height: 72%;
		fill: none;
		stroke: #fff;
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 20;
		stroke-dashoffset: 20;
		transition: stroke-dashoffset 0.35s var(--ease-out) 0.05s;
	}
	.on svg {
		stroke-dashoffset: 0;
	}
	@keyframes pop {
		0% { transform: scale(1); }
		40% { transform: scale(0.82); }
		100% { transform: scale(1); }
	}
</style>
