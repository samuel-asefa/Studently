<script>
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { signOut } from 'firebase/auth';
	import { auth } from '$lib/firebase.js';
	import { settingsOpen, confirm, toast } from '$lib/ui.js';
	import {
		settings, user, guest, tasks, deadlines, categories, sessions, replaceAll, leaveGuest, displayName, DEFAULT_CATEGORIES
	} from '$lib/stores.js';
	import { ACCENTS, FONTS } from '$lib/constants.js';
	import { setTheme } from '$lib/theme.js';
	import { demoData } from '$lib/demo.js';
	import { todayISO, formatHours } from '$lib/utils/date.js';
	import {
		X, Sun, Moon, Monitor, Download, Upload, Sparkles, Trash, LogOut, User, Palette, Timer, Keyboard, CloudCheck, Laptop, ArrowRight
	} from '$lib/icons.js';

	let fileInput = $state();
	const close = () => settingsOpen.set(false);

	const fill = (v, min, max) => `${((v - min) / (max - min)) * 100}%`;

	function exportData() {
		const data = {
			app: 'studently',
			version: 2,
			exportedAt: new Date().toISOString(),
			categories: $categories,
			tasks: $tasks,
			deadlines: $deadlines,
			sessions: $sessions
		};
		const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = `studently-backup-${todayISO()}.json`;
		a.click();
		URL.revokeObjectURL(url);
		toast('Backup downloaded', { tone: 'success' });
	}

	async function importData(e) {
		const file = e.currentTarget.files?.[0];
		e.currentTarget.value = '';
		if (!file) return;
		try {
			const data = JSON.parse(await file.text());
			if (!data || (!Array.isArray(data.tasks) && !Array.isArray(data.deadlines))) throw new Error('bad file');
			const ok = await confirm({
				title: 'Replace your data with this backup?',
				message: `${data.deadlines?.length ?? 0} deadlines and ${data.tasks?.length ?? 0} tasks will replace what you have now.`,
				confirmLabel: 'Import',
				danger: true
			});
			if (!ok) return;
			replaceAll(data);
			toast('Backup imported', { tone: 'success' });
		} catch {
			toast('That file isn’t a Studently backup.', { tone: 'danger' });
		}
	}

	async function loadDemo() {
		const ok =
			(!$tasks.length && !$deadlines.length) ||
			(await confirm({ title: 'Load a sample semester?', message: 'Your current tasks and deadlines will be replaced.', confirmLabel: 'Load sample', danger: true }));
		if (!ok) return;
		replaceAll(demoData());
		toast('Sample semester loaded', { tone: 'success' });
	}

	async function resetAll() {
		const ok = await confirm({
			title: 'Erase everything?',
			message: 'All tasks, deadlines, categories and focus history will be deleted. Export a backup first if you might want it.',
			confirmLabel: 'Erase all',
			danger: true
		});
		if (!ok) return;
		replaceAll({ categories: DEFAULT_CATEGORIES, tasks: [], deadlines: [], sessions: [] });
		toast('Everything was erased');
	}

	async function doSignOut() {
		close();
		await signOut(auth);
	}

	function toAccount() {
		close();
		leaveGuest();
	}

	const shortcuts = [
		['⌘ K', 'Command palette'],
		['N', 'Quick add'],
		['1 – 5', 'Switch views'],
		['T', 'Toggle theme'],
		['Space', 'Start / pause timer (Focus)'],
		[',', 'Settings']
	];

	const totalFocus = $derived($sessions.reduce((s, x) => s + x.minutes, 0) / 60);
</script>

<svelte:window onkeydown={(e) => $settingsOpen && e.key === 'Escape' && close()} />

{#if $settingsOpen}
	<div class="overlay" transition:fade={{ duration: 200 }} onclick={close} role="presentation"></div>
	<div class="drawer" role="dialog" aria-modal="true" aria-label="Settings" transition:fly={{ x: 60, duration: 420, easing: cubicOut }}>
		<header class="d-head">
			<h2 class="display">Settings</h2>
			<button class="btn btn-ghost btn-icon" onclick={close} aria-label="Close settings"><X size={18} /></button>
		</header>

		<div class="d-body">
			<section>
				<h3><User size={15} /> Profile</h3>
				<div class="field">
					<label class="label" for="set-name">What should we call you?</label>
					<input id="set-name" class="input" bind:value={$settings.name} placeholder={$displayName || 'Your first name'} maxlength="30" />
				</div>
				<div class="account card">
					{#if $user}
						<CloudCheck size={18} />
						<div class="acc-body">
							<strong>Synced to your account</strong>
							<span class="faint">{$user.email}</span>
						</div>
						<button class="btn btn-soft btn-sm" onclick={doSignOut}><LogOut size={14} /> Sign out</button>
					{:else if $guest}
						<Laptop size={18} />
						<div class="acc-body">
							<strong>Guest mode</strong>
							<span class="faint">Saved on this device only.</span>
						</div>
						<button class="btn btn-primary btn-sm" onclick={toAccount}>Sync <ArrowRight size={14} /></button>
					{/if}
				</div>
			</section>

			<section>
				<h3><Palette size={15} /> Appearance</h3>
				<div class="field">
					<span class="label">Theme</span>
					<div class="seg block">
						<button class:on={$settings.theme === 'light'} onclick={(e) => setTheme('light', e)}><Sun size={14} /> Light</button>
						<button class:on={$settings.theme === 'dark'} onclick={(e) => setTheme('dark', e)}><Moon size={14} /> Dark</button>
						<button class:on={$settings.theme === 'system'} onclick={(e) => setTheme('system', e)}><Monitor size={14} /> Auto</button>
					</div>
				</div>
				<div class="field">
					<span class="label">Accent</span>
					<div class="accents">
						{#each ACCENTS as a}
							<button
								class="accent"
								class:on={$settings.accent === a.id}
								style:--sh={a.h}
								onclick={() => ($settings.accent = a.id)}
								aria-label="{a.label} accent"
								title={a.label}
							></button>
						{/each}
					</div>
				</div>
				<div class="field">
					<span class="label">Font</span>
					<div class="fonts">
						{#each FONTS as f}
							<button class="font" class:on={$settings.font === f.id} style:font-family="'{f.id}', var(--font-sans)" onclick={() => ($settings.font = f.id)}>
								Aa <span>{f.label}</span>
							</button>
						{/each}
					</div>
				</div>
				<button class="toggle" onclick={() => ($settings.effects = !$settings.effects)}>
					<span><strong>Ambient background</strong><span class="faint">Animated aurora and grain</span></span>
					<span class="switch" class:on={$settings.effects}></span>
				</button>
				<button class="toggle" onclick={() => ($settings.reduceMotion = !$settings.reduceMotion)}>
					<span><strong>Reduce motion</strong><span class="faint">Turn off animations and confetti</span></span>
					<span class="switch" class:on={$settings.reduceMotion}></span>
				</button>
			</section>

			<section>
				<h3><Timer size={15} /> Study</h3>
				<div class="field">
					<div class="label-row"><span class="label">Daily study budget</span><span class="num val">{formatHours($settings.dailyHours)}</span></div>
					<input class="range" type="range" min="0.5" max="12" step="0.5" bind:value={$settings.dailyHours} style:--fill={fill($settings.dailyHours, 0.5, 12)} aria-label="Daily study budget" />
				</div>
				<div class="field">
					<div class="label-row"><span class="label">Focus length</span><span class="num val">{$settings.focusMinutes} min</span></div>
					<input class="range" type="range" min="10" max="90" step="5" bind:value={$settings.focusMinutes} style:--fill={fill($settings.focusMinutes, 10, 90)} aria-label="Focus length" />
				</div>
				<div class="two">
					<div class="field">
						<div class="label-row"><span class="label">Short break</span><span class="num val">{$settings.shortBreak}m</span></div>
						<input class="range" type="range" min="1" max="20" step="1" bind:value={$settings.shortBreak} style:--fill={fill($settings.shortBreak, 1, 20)} aria-label="Short break length" />
					</div>
					<div class="field">
						<div class="label-row"><span class="label">Long break</span><span class="num val">{$settings.longBreak}m</span></div>
						<input class="range" type="range" min="5" max="45" step="5" bind:value={$settings.longBreak} style:--fill={fill($settings.longBreak, 5, 45)} aria-label="Long break length" />
					</div>
				</div>
				<button class="toggle" onclick={() => ($settings.sound = !$settings.sound)}>
					<span><strong>Sounds</strong><span class="faint">Chime when a session ends</span></span>
					<span class="switch" class:on={$settings.sound}></span>
				</button>
				<button class="toggle" onclick={() => ($settings.autoBreak = !$settings.autoBreak)}>
					<span><strong>Auto-start breaks</strong><span class="faint">Roll straight into your break</span></span>
					<span class="switch" class:on={$settings.autoBreak}></span>
				</button>
			</section>

			<section>
				<h3><Download size={15} /> Your data</h3>
				<div class="data-stats">
					<span><strong class="num">{$deadlines.length}</strong> deadlines</span>
					<span><strong class="num">{$tasks.length}</strong> tasks</span>
					<span><strong class="num">{formatHours(totalFocus)}</strong> focused</span>
				</div>
				<div class="data-btns">
					<button class="btn btn-soft btn-sm" onclick={exportData}><Download size={14} /> Export</button>
					<button class="btn btn-soft btn-sm" onclick={() => fileInput.click()}><Upload size={14} /> Import</button>
					<button class="btn btn-soft btn-sm" onclick={loadDemo}><Sparkles size={14} /> Sample data</button>
					<input type="file" accept="application/json,.json" bind:this={fileInput} onchange={importData} hidden />
				</div>
				<button class="btn btn-ghost btn-danger btn-sm erase" onclick={resetAll}><Trash size={14} /> Erase everything</button>
			</section>

			<section>
				<h3><Keyboard size={15} /> Shortcuts</h3>
				<ul class="keys">
					{#each shortcuts as [k, label]}
						<li><span>{label}</span><span class="kbd">{k}</span></li>
					{/each}
				</ul>
			</section>

			<p class="about faint">
				Studently · made by <a href="https://samuelasefa.vercel.app" target="_blank" rel="noreferrer">Sammy Asefa</a>
			</p>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1200;
		background: oklch(0.1 0.02 var(--accent-h) / 0.45);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}
	.drawer {
		position: fixed;
		top: 10px;
		right: 10px;
		bottom: 10px;
		z-index: 1201;
		width: min(440px, calc(100vw - 20px));
		display: flex;
		flex-direction: column;
		border-radius: 24px;
		background: var(--surface-solid);
		border: 1px solid var(--border-2);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
	}
	.d-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 20px 14px 24px;
		border-bottom: 1px solid var(--border);
	}
	.d-head h2 {
		font-size: 32px;
	}
	.d-body {
		flex: 1;
		overflow-y: auto;
		padding: 8px 24px 24px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 20px 0;
		border-bottom: 1px solid var(--border);
	}
	h3 {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--text-2);
	}
	h3 :global(svg) {
		color: var(--accent);
	}
	.account {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 12px 12px 14px;
		border-radius: 14px;
		box-shadow: none;
		color: var(--accent);
	}
	.acc-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		font-size: 13px;
		color: var(--text);
		line-height: 1.35;
	}
	.acc-body .faint {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.accents {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	.accent {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, oklch(0.66 0.2 var(--sh)), oklch(0.66 0.19 calc(var(--sh) + 45)));
		box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.15);
		transition: transform 0.3s var(--ease-spring), box-shadow 0.2s;
	}
	.accent:hover {
		transform: scale(1.12);
	}
	.accent.on {
		box-shadow: 0 0 0 3px var(--surface-solid), 0 0 0 5px oklch(0.7 0.2 var(--sh));
	}
	.fonts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
		gap: 8px;
	}
	.font {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding: 10px 12px;
		border-radius: 12px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		font-size: 18px;
		font-weight: 600;
		transition: border-color 0.2s, background 0.2s;
	}
	.font span {
		font-size: 12.5px;
		font-weight: 500;
		color: var(--text-2);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.font:hover {
		border-color: var(--border-2);
	}
	.font.on {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		text-align: left;
	}
	.toggle > span:first-child {
		display: flex;
		flex-direction: column;
		font-size: 14px;
		line-height: 1.35;
	}
	.toggle strong {
		font-weight: 550;
	}
	.toggle .faint {
		font-size: 12.5px;
	}
	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 10px;
	}
	.label-row .label {
		margin: 0;
	}
	.val {
		font-size: 13px;
		font-weight: 600;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	.data-stats {
		display: flex;
		gap: 16px;
		font-size: 13px;
		color: var(--text-3);
	}
	.data-stats strong {
		color: var(--text);
		font-weight: 600;
	}
	.data-btns {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.erase {
		align-self: flex-start;
	}
	.keys li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 7px 0;
		font-size: 13.5px;
		color: var(--text-2);
	}
	.keys .kbd {
		min-width: 28px;
	}
	.about {
		padding-top: 20px;
		font-size: 12.5px;
		text-align: center;
	}
	.about a {
		color: var(--text-2);
	}
	.about a:hover {
		color: var(--accent);
	}
	@media (max-width: 640px) {
		.drawer {
			top: auto;
			left: 6px;
			right: 6px;
			bottom: 6px;
			width: auto;
			max-height: 88dvh;
		}
	}
</style>
