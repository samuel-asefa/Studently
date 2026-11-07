<script>
	// Profile photo when there is one, otherwise a gradient generated from
	// `seed` (stable per account). With no seed it follows the accent color.
	let { seed = '', photo = null, size = 34, label = '' } = $props();

	function hash(s) {
		let h = 2166136261;
		for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
		return h;
	}

	const style = $derived.by(() => {
		if (!seed) {
			return `radial-gradient(circle at 28% 24%, oklch(0.9 0.08 var(--accent-h2)) 0%, transparent 45%),
				radial-gradient(circle at 78% 82%, oklch(0.5 0.2 var(--accent-h)) 0%, transparent 60%),
				linear-gradient(140deg, oklch(0.72 0.16 var(--accent-h2)), oklch(0.56 0.21 var(--accent-h)))`;
		}
		const h = hash(seed);
		const a = h % 360;
		const b = (a + 40 + ((h >>> 9) % 90)) % 360;
		const angle = (h >>> 3) % 360;
		return `radial-gradient(circle at 28% 24%, oklch(0.92 0.07 ${a}) 0%, transparent 45%),
			radial-gradient(circle at 78% 82%, oklch(0.5 0.19 ${b}) 0%, transparent 60%),
			linear-gradient(${angle}deg, oklch(0.74 0.15 ${a}), oklch(0.58 0.19 ${b}))`;
	});
</script>

{#if photo}
	<img class="av" src={photo} alt={label} referrerpolicy="no-referrer" style:--s="{size}px" />
{:else}
	<span class="av" role="img" aria-label={label || 'Avatar'} style:--s="{size}px" style:background={style}></span>
{/if}

<style>
	.av {
		display: block;
		width: var(--s);
		height: var(--s);
		border-radius: 50%;
		flex-shrink: 0;
		object-fit: cover;
		box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.18), 0 2px 8px -2px oklch(0 0 0 / 0.35);
	}
</style>
