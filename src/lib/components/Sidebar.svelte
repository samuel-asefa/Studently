<script>
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Logo from './ui/Logo.svelte';
	import Ring from './ui/Ring.svelte';
	import { NAV } from '$lib/constants.js';
	import { view, go, openPalette, settingsOpen } from '$lib/ui.js';
	import { user, guest, syncState, stats, plan, displayName } from '$lib/stores.js';
	import { timer, remaining, progress, MODES, toggle } from '$lib/focus.js';
	import { formatClock, formatHours, daysUntil } from '$lib/utils/date.js';
	import { toggleTheme } from '$lib/theme.js';
	import {
		Search, Settings, Sun, Moon, Play, Pause, CloudCheck, CloudOff, LoaderCircle, Laptop, Plus
	} from '$lib/icons.js';

	const activeIndex = $derived(Math.max(0, NAV.findIndex((n) => n.id === $view)));

	const badges = $derived({
		tasks: $stats.activeTasks || null,
		planner: $stats.upcoming.filter((d) => daysUntil(d.dueDate) <= 2).length || null
	});

	const urgent = $derived($stats.overdue > 0);
	const todayDone = $derived($stats.focusToday / 60);
	const todayPlanned = $derived(todayDone + ($plan.days[0]?.total ?? 0));
	const initials = $derived(
		($displayName || $user?.email || 'G')
			.split(/\s+/)
			.map((p) => p[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);
	const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
</script>

<aside class="sidebar">
	<div class="brand">
		<button onclick={() => go('today')} aria-label="Go to Today"><Logo size={30} /></button>
		<button class="btn btn-ghost btn-icon btn-sm" onclick={toggleTheme} aria-label="Toggle theme" title="Toggle theme (T)">
			<Sun size={16} class="only-dark" />
			<Moon size={16} class="only-light" />
		</button>
	</div>

	<button class="search" onclick={() => openPalette()}>
		<Search size={15} />
		<span>Search or add…</span>
		<span class="kbd">{isMac ? '⌘' : 'Ctrl'} K</span>
	</button>

	<nav aria-label="Main">
		<span class="indicator" style:transform="translateY({activeIndex * 42}px)"></span>
		{#each NAV as item}
			<button
				class="nav-item"
				class:active={$view === item.id}
				aria-current={$view === item.id ? 'page' : undefined}
				onclick={() => go(item.id)}
			>
				<item.icon size={18} />
				<span class="label">{item.label}</span>
				{#if badges[item.id]}
					<span class="badge" class:urgent={item.id === 'planner' && urgent}>{badges[item.id]}</span>
				{:else}
					<span class="key">{item.key}</span>
				{/if}
			</button>
		{/each}
	</nav>

	<button class="quick btn btn-primary btn-block" onclick={() => openPalette()}>
		<Plus size={17} /> Quick add
	</button>

	{#if $timer.status !== 'idle'}
		<div class="timer card" transition:fly={{ y: 10, duration: 350, easing: cubicOut }}>
			<Ring value={$progress} size={44} stroke={4} duration={300} />
			<button class="timer-info" onclick={() => go('focus')}>
				<span class="mono t">{formatClock($remaining)}</span>
				<span class="m">{MODES[$timer.mode].label}{$timer.status === 'paused' ? ' · paused' : ''}</span>
			</button>
			<button class="btn btn-soft btn-icon btn-sm" onclick={toggle} aria-label={$timer.status === 'running' ? 'Pause' : 'Resume'}>
				{#if $timer.status === 'running'}<Pause size={15} />{:else}<Play size={15} />{/if}
			</button>
		</div>
	{/if}

	<div class="spacer"></div>

	<div class="today card">
		<div class="today-row">
			<span class="eyebrow">Today</span>
			<span class="mono faint">{formatHours(todayDone)} / {formatHours(todayPlanned)}</span>
		</div>
		<div class="bar"><span style:width="{todayPlanned ? Math.min(100, (todayDone / todayPlanned) * 100) : 0}%"></span></div>
		<div class="today-stats">
			<span><strong>{$stats.doneToday}</strong> task{$stats.doneToday === 1 ? '' : 's'} done</span>
			<span><strong>{$stats.streak}</strong>-day streak</span>
		</div>
	</div>

	<button class="me" onclick={() => ($settingsOpen = true)}>
		{#if $user?.photoURL}
			<img class="avatar" src={$user.photoURL} alt="" referrerpolicy="no-referrer" />
		{:else}
			<span class="avatar initials">{initials}</span>
		{/if}
		<span class="who">
			<span class="name">{$displayName || ($guest ? 'Guest' : 'Student')}</span>
			<span class="sync">
				{#if $guest}
					<Laptop size={12} /> On this device
				{:else if $syncState === 'saving'}
					<LoaderCircle size={12} class="spin" /> Saving…
				{:else if $syncState === 'error'}
					<CloudOff size={12} /> Offline · will sync
				{:else}
					<CloudCheck size={12} /> Synced
				{/if}
			</span>
		</span>
		<Settings size={17} />
	</button>
</aside>

<style>
	.sidebar {
		position: sticky;
		top: 0;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 18px 14px 14px;
		border-right: 1px solid var(--border);
		background: color-mix(in oklch, var(--bg-2) 72%, transparent);
		backdrop-filter: blur(24px) saturate(140%);
		-webkit-backdrop-filter: blur(24px) saturate(140%);
		overflow-y: auto;
	}
	.brand {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 2px 4px 6px 6px;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 38px;
		padding: 0 8px 0 12px;
		border-radius: 12px;
		background: var(--input-bg);
		border: 1px solid var(--border);
		color: var(--text-3);
		font-size: 13.5px;
		transition: border-color 0.2s, color 0.2s;
	}
	.search span:not(.kbd) {
		flex: 1;
		text-align: left;
	}
	.search:hover {
		border-color: var(--border-2);
		color: var(--text-2);
	}

	nav {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.indicator {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 40px;
		border-radius: 12px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
		transition: transform 0.45s var(--ease-spring);
	}
	.indicator::before {
		content: '';
		position: absolute;
		left: -14px;
		top: 10px;
		bottom: 10px;
		width: 3px;
		border-radius: 0 3px 3px 0;
		background: linear-gradient(var(--accent), var(--accent-2));
		box-shadow: 0 0 12px var(--accent-glow);
	}
	.nav-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		height: 40px;
		padding: 0 10px 0 12px;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 520;
		color: var(--text-2);
		transition: color 0.2s;
	}
	.nav-item:hover {
		color: var(--text);
	}
	.nav-item.active {
		color: var(--text);
	}
	.nav-item.active :global(svg) {
		color: var(--accent);
	}
	.label {
		flex: 1;
		text-align: left;
	}
	.key {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-3);
		opacity: 0;
		transition: opacity 0.2s;
	}
	.nav-item:hover .key {
		opacity: 1;
	}
	.badge {
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: 999px;
		display: grid;
		place-items: center;
		font-size: 11px;
		font-weight: 600;
		font-family: var(--font-mono);
		color: var(--text-2);
		background: var(--surface-3);
	}
	.badge.urgent {
		color: #fff;
		background: var(--danger);
	}
	.quick {
		margin-top: 4px;
	}

	.timer {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border-radius: 16px;
	}
	.timer-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		line-height: 1.2;
	}
	.timer-info .t {
		font-size: 17px;
		font-weight: 600;
	}
	.timer-info .m {
		font-size: 11.5px;
		color: var(--text-3);
	}

	.spacer {
		flex: 1;
	}
	.today {
		padding: 14px;
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: none;
	}
	.today-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11.5px;
	}
	.today-stats {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: var(--text-3);
	}
	.today-stats strong {
		color: var(--text);
		font-weight: 600;
	}
	.me {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px;
		border-radius: 14px;
		color: var(--text-3);
		transition: background 0.2s, color 0.2s;
	}
	.me:hover {
		background: var(--surface-2);
		color: var(--text);
	}
	.avatar {
		width: 34px;
		height: 34px;
		border-radius: 11px;
		object-fit: cover;
	}
	.initials {
		display: grid;
		place-items: center;
		font-size: 12.5px;
		font-weight: 650;
		color: #fff;
		background: linear-gradient(135deg, var(--btn-a), var(--btn-b));
	}
	.who {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		line-height: 1.25;
	}
	.name {
		font-size: 13.5px;
		font-weight: 600;
		color: var(--text);
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sync {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 11.5px;
		color: var(--text-3);
	}
</style>
