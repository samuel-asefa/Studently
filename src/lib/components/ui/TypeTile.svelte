<script>
	import { typeInfo, seriesHue } from '$lib/constants.js';
	let { type = 'assignment', id = '', size = 34 } = $props();
	const info = $derived(typeInfo(type));
</script>

<span class="tile" style:--h={seriesHue(id)} style:--s="{size}px" title={info.label} aria-label={info.label}>
	<info.icon size={Math.round(size * 0.54)} weight="duotone" />
</span>

<style>
	.tile {
		display: grid;
		place-items: center;
		width: var(--s);
		height: var(--s);
		border-radius: calc(var(--s) * 0.3);
		flex-shrink: 0;
		color: oklch(0.82 0.13 var(--h));
		background: linear-gradient(160deg, oklch(0.7 0.16 var(--h) / 0.24), oklch(0.7 0.16 var(--h) / 0.1));
		box-shadow: inset 0 0 0 1px oklch(0.7 0.16 var(--h) / 0.28), inset 0 1px 0 oklch(1 0 0 / 0.08);
	}
	:global([data-theme='light']) .tile {
		color: oklch(0.5 0.17 var(--h));
		background: linear-gradient(160deg, oklch(0.75 0.14 var(--h) / 0.24), oklch(0.75 0.14 var(--h) / 0.1));
	}
</style>
