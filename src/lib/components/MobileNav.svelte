<script>
	import Logo from './ui/Logo.svelte';
	import { NAV } from '$lib/constants.js';
	import { view, go, openPalette, settingsOpen } from '$lib/ui.js';
	import { timer, remaining } from '$lib/focus.js';
	import { formatClock } from '$lib/utils/date.js';
	import { Search, Settings, Plus } from '$lib/icons.js';
</script>

<header class="mtop">
	<button onclick={() => go('today')} aria-label="Go to Today"><Logo size={28} /></button>
	<div class="r">
		{#if $timer.status !== 'idle'}
			<button class="pill mono" onclick={() => go('focus')}>
				<span class="live" class:paused={$timer.status === 'paused'}></span>
				{formatClock($remaining)}
			</button>
		{/if}
		<button class="btn btn-ghost btn-icon" onclick={() => openPalette()} aria-label="Search">
			<Search size={18} />
		</button>
		<button class="btn btn-ghost btn-icon" onclick={() => ($settingsOpen = true)} aria-label="Settings">
			<Settings size={18} />
		</button>
	</div>
</header>

<nav class="mbar" aria-label="Main">
	{#each NAV.filter((n) => n.id !== 'categories') as item, i}
		{#if i === 2}
			<button class="add" onclick={() => openPalette()} aria-label="Quick add">
				<Plus size={22} weight="bold" />
			</button>
		{/if}
		<button class="tab" class:active={$view === item.id} onclick={() => go(item.id)}>
			<item.icon size={20} />
			<span>{item.label}</span>
		</button>
	{/each}
</nav>

<style>
	.mtop,
	.mbar {
		display: none;
	}
	@media (max-width: 900px) {
		.mtop {
			position: sticky;
			top: 0;
			z-index: 40;
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 60px;
			margin: 0 -16px 8px;
			padding: 0 10px 0 16px;
			padding-top: env(safe-area-inset-top);
			background: color-mix(in oklch, var(--bg) 70%, transparent);
			backdrop-filter: blur(18px);
			-webkit-backdrop-filter: blur(18px);
			border-bottom: 1px solid var(--border);
		}
		.r {
			display: flex;
			align-items: center;
			gap: 2px;
		}
		.pill {
			display: inline-flex;
			align-items: center;
			gap: 7px;
			height: 30px;
			padding: 0 12px;
			margin-right: 4px;
			border-radius: 999px;
			font-size: 13px;
			font-weight: 600;
			background: var(--accent-soft);
			color: var(--accent-ink);
		}
		.live {
			width: 7px;
			height: 7px;
			border-radius: 50%;
			background: var(--accent);
			animation: pulse 1.4s ease-in-out infinite;
		}
		.live.paused {
			animation: none;
			opacity: 0.5;
		}
		@keyframes pulse {
			50% {
				opacity: 0.3;
				transform: scale(0.7);
			}
		}

		.mbar {
			position: fixed;
			left: 10px;
			right: 10px;
			bottom: calc(10px + env(safe-area-inset-bottom));
			z-index: 60;
			display: flex;
			align-items: center;
			justify-content: space-around;
			height: 66px;
			padding: 0 6px;
			border-radius: 22px;
			background: color-mix(in oklch, var(--surface-solid) 82%, transparent);
			border: 1px solid var(--border-2);
			box-shadow: var(--shadow-lg);
			backdrop-filter: blur(22px) saturate(160%);
			-webkit-backdrop-filter: blur(22px) saturate(160%);
		}
		.tab {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 3px;
			padding: 6px 0;
			font-size: 10px;
			font-weight: 550;
			color: var(--text-3);
			transition: color 0.2s, transform 0.2s;
		}
		.tab.active {
			color: var(--accent);
		}
		.tab:active {
			transform: scale(0.92);
		}
		.add {
			display: grid;
			place-items: center;
			width: 48px;
			height: 48px;
			margin: 0 4px;
			border-radius: 16px;
			color: #fff;
			background: linear-gradient(135deg, var(--btn-a), var(--btn-b));
			box-shadow: 0 10px 24px -8px var(--accent-glow);
			flex-shrink: 0;
		}
		.add:active {
			transform: scale(0.94);
		}
	}
</style>
