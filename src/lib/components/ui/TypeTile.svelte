<script>
	import { typeInfo, seriesHue } from '$lib/constants.js';
	let { type = 'assignment', id = '', size = 34 } = $props();
	const info = $derived(typeInfo(type));
</script>

<span class="tile" style:--h={seriesHue(id)} style:--s="{size}px" title={info.label}>
	<info.icon size={Math.round(size * 0.5)} />
</span>

<style>
	.tile {
		display: grid;
		place-items: center;
		width: var(--s);
		height: var(--s);
		border-radius: calc(var(--s) * 0.32);
		flex-shrink: 0;
		color: oklch(0.8 0.14 var(--h));
		background: oklch(0.7 0.16 var(--h) / 0.16);
		box-shadow: inset 0 0 0 1px oklch(0.7 0.16 var(--h) / 0.25);
	}
	:global([data-theme='light']) .tile {
		color: oklch(0.5 0.17 var(--h));
		background: oklch(0.7 0.16 var(--h) / 0.14);
	}
</style>
