<script>
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let { value = 0, size = 64, stroke = 6, duration = 900, glow = false, children = undefined } = $props();

	const id = `ring-${Math.random().toString(36).slice(2, 8)}`;
	const t = new Tween(0, { duration, easing: cubicOut });

	$effect(() => {
		t.target = Math.max(0, Math.min(1, Number(value) || 0));
	});

	let r = $derived((size - stroke) / 2);
	let c = $derived(2 * Math.PI * r);
</script>

<div class="ring" class:glow style:width="{size}px" style:height="{size}px">
	<svg viewBox="0 0 {size} {size}" aria-hidden="true">
		<defs>
			<linearGradient {id} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" style="stop-color: var(--accent)" />
				<stop offset="1" style="stop-color: var(--accent-2)" />
			</linearGradient>
		</defs>
		<circle cx={size / 2} cy={size / 2} {r} fill="none" class="track" stroke-width={stroke} />
		<circle
			cx={size / 2}
			cy={size / 2}
			{r}
			fill="none"
			stroke="url(#{id})"
			stroke-width={stroke}
			stroke-linecap="round"
			stroke-dasharray={c}
			stroke-dashoffset={c * (1 - t.current)}
			opacity={t.current < 0.004 ? 0 : 1}
			transform="rotate(-90 {size / 2} {size / 2})"
		/>
	</svg>
	{#if children}
		<div class="center">{@render children()}</div>
	{/if}
</div>

<style>
	.ring {
		position: relative;
		flex-shrink: 0;
	}
	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.glow svg {
		filter: drop-shadow(0 0 14px var(--accent-glow));
	}
	.track {
		stroke: var(--surface-3);
	}
	.center {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		text-align: center;
	}
</style>
