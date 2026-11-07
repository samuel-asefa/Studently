<script>
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Sidebar from './Sidebar.svelte';
	import MobileNav from './MobileNav.svelte';
	import CommandPalette from './CommandPalette.svelte';
	import SettingsDrawer from './SettingsDrawer.svelte';
	import TemplatePicker from './TemplatePicker.svelte';
	import TechniqueLibrary from './TechniqueLibrary.svelte';
	import Insights from './views/Insights.svelte';
	import Dashboard from './views/Dashboard.svelte';
	import Planner from './views/Planner.svelte';
	import Tasks from './views/Tasks.svelte';
	import Focus from './views/Focus.svelte';
	import Categories from './views/Categories.svelte';
	import { view, go, syncViewFromHash, paletteOpen, settingsOpen, openPalette, templatesOpen, libraryOpen, toast } from '$lib/ui.js';
	import { achievements } from '$lib/stores.js';
	import { timer, remaining, MODES, toggle as toggleTimer } from '$lib/focus.js';
	import { NAV } from '$lib/constants.js';
	import { formatClock } from '$lib/utils/date.js';
	import { isTyping } from '$lib/utils/use.js';
	import { toggleTheme } from '$lib/theme.js';

	const VIEWS = { today: Dashboard, planner: Planner, tasks: Tasks, focus: Focus, insights: Insights, categories: Categories };
	const Current = $derived(VIEWS[$view] ?? Dashboard);

	function onkeydown(e) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			$paletteOpen = !$paletteOpen;
			return;
		}
		if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e) || $paletteOpen || $settingsOpen || $templatesOpen || $libraryOpen) return;
		if (document.querySelector('[role="alertdialog"]')) return;

		const nav = NAV.find((n) => n.key === e.key);
		if (nav) return go(nav.id);
		switch (e.key) {
			case 'n':
			case '/':
				e.preventDefault();
				openPalette();
				break;
			case ',':
				$settingsOpen = true;
				break;
			case 't':
				toggleTheme();
				break;
			case ' ':
				if ($view === 'focus') {
					e.preventDefault();
					toggleTimer();
				}
				break;
		}
	}

	// Toast newly unlocked achievements. The first run only records what's
	// already unlocked, so existing data doesn't trigger a flood.
	const SEEN_KEY = 'studently:achievements-seen';
	$effect(() => {
		const ids = $achievements.filter((a) => a.unlocked).map((a) => a.id);
		let seen = null;
		try {
			seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? 'null');
		} catch {
			seen = null;
		}
		if (Array.isArray(seen)) {
			const fresh = $achievements.filter((a) => a.unlocked && !seen.includes(a.id));
			if (fresh.length === 1) toast(`Achievement unlocked: ${fresh[0].name}`, { tone: 'success' });
			else if (fresh.length > 1) toast(`${fresh.length} achievements unlocked`, { tone: 'success' });
		}
		try {
			localStorage.setItem(SEEN_KEY, JSON.stringify(Array.isArray(seen) ? [...new Set([...seen, ...ids])] : ids));
		} catch {
			/* storage blocked */
		}
	});

	// Coming from the landing page, start at the top.
	$effect(() => {
		window.scrollTo({ top: 0, behavior: 'instant' });
	});

	$effect(() => {
		const label = NAV.find((n) => n.id === $view)?.label ?? 'Today';
		document.title =
			$timer.status !== 'idle'
				? `${formatClock($remaining)} · ${MODES[$timer.mode].label} — Studently`
				: `${label} — Studently`;
	});
</script>

<svelte:window {onkeydown} onpopstate={syncViewFromHash} onhashchange={syncViewFromHash} />

<div class="shell">
	<Sidebar />
	<main class="main">
		<MobileNav />
		{#key $view}
			<div class="view" in:fly={{ y: 14, duration: 550, easing: cubicOut }}>
				<Current />
			</div>
		{/key}
	</main>
</div>

<CommandPalette />
<SettingsDrawer />
<TemplatePicker />
<TechniqueLibrary />

<style>
	.shell {
		display: grid;
		grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
		min-height: 100dvh;
	}
	.main {
		min-width: 0;
		padding: 44px clamp(24px, 4vw, 60px) 80px;
	}
	.view {
		max-width: 1240px;
		margin: 0 auto;
	}
	@media (max-width: 900px) {
		.shell {
			grid-template-columns: minmax(0, 1fr);
		}
		.shell > :global(.sidebar) {
			display: none;
		}
		.main {
			padding: 0 16px calc(110px + env(safe-area-inset-bottom));
		}
	}
</style>
