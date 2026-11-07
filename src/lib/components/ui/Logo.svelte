<script>
	import { MARK } from '$lib/brand.js';
	let { size = 30, word = true } = $props();
	const id = `logo-${Math.random().toString(36).slice(2, 7)}`;
</script>

<span class="logo" style:--s="{size}px">
	<svg class="mark" viewBox="0 0 48 48" aria-hidden="true">
		<defs>
			<linearGradient {id} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" style="stop-color: var(--btn-a)" />
				<stop offset="1" style="stop-color: var(--btn-b)" />
			</linearGradient>
		</defs>
		<rect width="48" height="48" rx="12" fill="url(#{id})" />
		<rect x="0.5" y="0.5" width="47" height="47" rx="12.5" fill="none" stroke="white" stroke-opacity="0.18" />
		<path d={MARK.board} fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round" />
		<path d={MARK.body} fill="#fff" fill-opacity="0.74" />
		<path d={MARK.cord} fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" />
		<circle cx={MARK.knot.cx} cy={MARK.knot.cy} r={MARK.knot.r} fill="#fff" />
	</svg>
	{#if word}
		<span class="word">Student<em>ly</em></span>
	{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}
	.mark {
		width: var(--s);
		height: var(--s);
		filter: drop-shadow(0 6px 16px var(--accent-glow));
		transition: transform 0.6s var(--ease-spring);
	}
	.logo:hover .mark {
		transform: rotate(-6deg) scale(1.05);
	}
	.word {
		font-family: var(--font-display);
		font-size: calc(var(--s) * 0.86);
		line-height: 1;
		letter-spacing: -0.01em;
		color: var(--text);
	}
	.word em {
		color: var(--accent);
	}
</style>
