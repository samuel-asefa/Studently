<script>
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
		<rect width="48" height="48" rx="13" fill="url(#{id})" />
		<rect x="0.5" y="0.5" width="47" height="47" rx="12.5" fill="none" stroke="white" stroke-opacity="0.2" />
		<path
			fill="#fff"
			d="M24 9C25.4 18.4 29.6 22.6 39 24 29.6 25.4 25.4 29.6 24 39 22.6 29.6 18.4 25.4 9 24 18.4 22.6 22.6 18.4 24 9Z"
		/>
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
		transform: rotate(90deg) scale(1.05);
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
