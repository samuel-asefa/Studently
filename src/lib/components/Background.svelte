<script>
	import { settings } from '$lib/stores.js';
	let { intense = false } = $props();
</script>

{#if $settings.effects}
	<div class="bg" class:intense aria-hidden="true">
		<div class="blob b1"></div>
		<div class="blob b2"></div>
		<div class="blob b3"></div>
		<div class="grid"></div>
		<div class="grain"></div>
	</div>
{:else}
	<div class="bg plain" aria-hidden="true"></div>
{/if}

<style>
	.bg {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
	}
	.plain {
		background: radial-gradient(
			ellipse 80% 50% at 50% -10%,
			oklch(0.6 0.15 var(--accent-h) / 0.12),
			transparent 70%
		);
	}
	.blob {
		position: absolute;
		width: 62vmax;
		height: 62vmax;
		border-radius: 50%;
		opacity: var(--blob-opacity);
		will-change: transform;
		transition: opacity 2s ease;
	}
	.b1 {
		top: -28vmax;
		left: -18vmax;
		background: radial-gradient(closest-side, oklch(0.6 0.21 var(--accent-h) / 0.6), transparent);
		animation: drift1 26s ease-in-out infinite alternate;
	}
	.b2 {
		top: -24vmax;
		right: -26vmax;
		background: radial-gradient(
			closest-side,
			oklch(0.64 0.17 var(--accent-h2) / 0.42),
			transparent
		);
		animation: drift2 32s ease-in-out infinite alternate;
	}
	.b3 {
		bottom: -40vmax;
		left: 18vmax;
		background: radial-gradient(
			closest-side,
			oklch(0.62 0.14 calc(var(--accent-h2) - 30) / 0.34),
			transparent
		);
		animation: drift3 38s ease-in-out infinite alternate;
	}
	.intense .blob {
		opacity: calc(var(--blob-opacity) * 1.6);
	}
	.intense .b1 {
		animation-duration: 10s;
	}
	.intense .b2 {
		animation-duration: 13s;
	}
	.grid {
		position: absolute;
		inset: 0;
		background-image: linear-gradient(var(--grid-line) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
		background-size: 64px 64px;
		-webkit-mask-image: radial-gradient(ellipse 75% 55% at 50% 0%, #000 25%, transparent 75%);
		mask-image: radial-gradient(ellipse 75% 55% at 50% 0%, #000 25%, transparent 75%);
	}
	.grain {
		position: absolute;
		inset: 0;
		opacity: var(--grain-opacity);
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}
	@keyframes drift1 {
		to {
			transform: translate(16vmax, 10vmax) scale(1.18);
		}
	}
	@keyframes drift2 {
		to {
			transform: translate(-14vmax, 16vmax) scale(0.9);
		}
	}
	@keyframes drift3 {
		to {
			transform: translate(-12vmax, -14vmax) scale(1.12);
		}
	}
</style>
