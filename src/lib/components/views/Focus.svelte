<script>
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import TypeTile from '../ui/TypeTile.svelte';
	import { timer, remaining, progress, MODES, start, pause, reset, setMode, setDeadline, finishEarly } from '$lib/focus.js';
	import { deadlines, stats, settings, plan } from '$lib/stores.js';
	import { focusTarget, settingsOpen, toast } from '$lib/ui.js';
	import { formatClock, formatHours, relativeDay } from '$lib/utils/date.js';
	import { seriesColor } from '$lib/constants.js';
	import { Play, Pause, RotateCcw, SkipForward, Check, Volume, VolumeOff, Bell, Coffee, Brain, Target, Settings } from '$lib/icons.js';

	const SIZE = 340;
	const STROKE = 10;
	const R = (SIZE - STROKE) / 2 - 18;
	const C = 2 * Math.PI * R;

	const active = $derived($deadlines.filter((d) => !d.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
	const current = $derived($deadlines.find((d) => d.id === $timer.deadlineId) ?? null);
	const plannedForCurrent = $derived(current ? ($plan.days[0]?.items.find((i) => i.id === current.id)?.hours ?? 0) : 0);
	const running = $derived($timer.status === 'running');
	const isBreak = $derived($timer.mode !== 'focus');

	const p = new Tween(0, { duration: 400, easing: cubicOut });
	$effect(() => {
		p.target = $progress;
	});
	const angle = $derived(p.current * 2 * Math.PI - Math.PI / 2);

	// Deep link from "Focus" buttons elsewhere in the app.
	$effect(() => {
		const id = $focusTarget;
		if (!id) return;
		if ($timer.status === 'idle') {
			if ($timer.mode !== 'focus') setMode('focus');
			setDeadline(id);
		} else if ($timer.deadlineId !== id) {
			toast('Finish or reset the current session to switch.');
		}
		focusTarget.set(null);
	});

	let notifyState = $state(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
	async function askNotify() {
		notifyState = await Notification.requestPermission();
		if (notifyState === 'granted') toast('You’ll get a notification when a session ends.', { tone: 'success' });
	}

	const timeOf = (ms) => new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	const round = $derived(($timer.round % 4) + (isBreak ? 0 : 1));
</script>

<div class="page stagger">
	<header class="page-head">
		<div>
			<span class="eyebrow">Deep work</span>
			<h1 class="page-title">Focus</h1>
			<p class="page-sub">Pick what you’re working on and press start. Finished sessions are logged to that deadline automatically.</p>
		</div>
		<div class="quick-tools">
			<button class="btn btn-soft btn-icon" onclick={() => ($settings.sound = !$settings.sound)} aria-label={$settings.sound ? 'Mute sounds' : 'Unmute sounds'} title="Sound">
				{#if $settings.sound}<Volume size={17} />{:else}<VolumeOff size={17} />{/if}
			</button>
			{#if notifyState === 'default'}
				<button class="btn btn-soft btn-sm" onclick={askNotify}><Bell size={15} /> Notify me</button>
			{/if}
			<button class="btn btn-soft btn-icon" onclick={() => ($settingsOpen = true)} aria-label="Timer settings" title="Timer settings">
				<Settings size={17} />
			</button>
		</div>
	</header>

	<section class="grid">
		<article class="timer card" class:running class:break={isBreak}>
			<div class="seg modes">
				{#each Object.entries(MODES) as [id, m]}
					<button class:on={$timer.mode === id} onclick={() => setMode(id)} disabled={running}>
						{#if id === 'focus'}<Brain size={14} />{:else}<Coffee size={14} />{/if}
						{m.label}
					</button>
				{/each}
			</div>

			<div class="dial" style:--size="{SIZE}px">
				<svg viewBox="0 0 {SIZE} {SIZE}" aria-hidden="true">
					<defs>
						<linearGradient id="dial-grad" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" style="stop-color: var(--accent)" />
							<stop offset="1" style="stop-color: var(--accent-2)" />
						</linearGradient>
					</defs>
					{#each Array(60) as _, i}
						{@const a = (i / 60) * 2 * Math.PI - Math.PI / 2}
						{@const long = i % 5 === 0}
						<line
							x1={SIZE / 2 + Math.cos(a) * (SIZE / 2 - 4)}
							y1={SIZE / 2 + Math.sin(a) * (SIZE / 2 - 4)}
							x2={SIZE / 2 + Math.cos(a) * (SIZE / 2 - (long ? 14 : 9))}
							y2={SIZE / 2 + Math.sin(a) * (SIZE / 2 - (long ? 14 : 9))}
							class="tick"
							class:lit={i / 60 <= p.current}
							class:long
						/>
					{/each}
					<circle cx={SIZE / 2} cy={SIZE / 2} r={R} class="track" stroke-width={STROKE} fill="none" />
					<circle
						cx={SIZE / 2}
						cy={SIZE / 2}
						r={R}
						fill="none"
						stroke="url(#dial-grad)"
						stroke-width={STROKE}
						stroke-linecap="round"
						stroke-dasharray={C}
						stroke-dashoffset={C * (1 - p.current)}
						transform="rotate(-90 {SIZE / 2} {SIZE / 2})"
						class="arc"
						opacity={p.current > 0.002 ? 1 : 0}
					/>
					{#if p.current > 0.002}
						<circle cx={SIZE / 2 + Math.cos(angle) * R} cy={SIZE / 2 + Math.sin(angle) * R} r="9" class="knob" />
					{/if}
				</svg>
				<div class="readout">
					<span class="mode-label">{MODES[$timer.mode].label}{$timer.status === 'paused' ? ' · paused' : ''}</span>
					<span class="time mono">{formatClock($remaining)}</span>
					<span class="rounds" aria-label="Round {round} of 4">
						{#each [1, 2, 3, 4] as r}
							<span class:filled={r < round || (r === round && !isBreak && running)} class:current={r === round}></span>
						{/each}
					</span>
				</div>
			</div>

			<div class="controls">
				<button class="btn btn-soft btn-icon ctl" onclick={reset} disabled={$timer.status === 'idle'} aria-label="Reset" title="Reset">
					<RotateCcw size={18} />
				</button>
				<button class="play" onclick={() => (running ? pause() : start())} aria-label={running ? 'Pause' : 'Start'}>
					{#if running}<Pause size={30} />{:else}<Play size={30} />{/if}
				</button>
				<button
					class="btn btn-soft btn-icon ctl"
					onclick={finishEarly}
					aria-label={isBreak ? 'Skip break' : 'Finish and log'}
					title={isBreak ? 'Skip break' : 'Finish now and log the time'}
				>
					{#if isBreak}<SkipForward size={18} />{:else}<Check size={18} />{/if}
				</button>
			</div>
			<p class="hint faint">
				<span class="kbd">Space</span> start / pause · {$settings.focusMinutes} / {$settings.shortBreak} / {$settings.longBreak} min
			</p>
		</article>

		<div class="side">
			<article class="card card-pad">
				<div class="card-head">
					<h2 class="card-title"><span class="ico"><Target size={16} /></span> Working on</h2>
				</div>
				<select
					class="input"
					value={$timer.deadlineId ?? ''}
					onchange={(e) => setDeadline(e.currentTarget.value)}
					disabled={$timer.status !== 'idle'}
					aria-label="Deadline to log time to"
				>
					<option value="">Just focusing (no deadline)</option>
					{#each active as d}
						<option value={d.id}>{d.name} · {relativeDay(d.dueDate)}</option>
					{/each}
				</select>
				{#if current}
					<div class="current" in:fade>
						<TypeTile type={current.type} id={current.id} size={40} />
						<div class="c-body">
							<div class="c-name">{current.name}</div>
							<div class="faint c-meta">
								{formatHours(current.hoursSpent)} of {formatHours(current.estimatedHours)} done{plannedForCurrent ? ` · ${formatHours(plannedForCurrent)} planned today` : ''}
							</div>
							<div class="bar"><span style:width="{Math.min(100, (current.hoursSpent / current.estimatedHours) * 100)}%" style:background={seriesColor(current.id)}></span></div>
						</div>
					</div>
				{:else if !active.length}
					<p class="faint none">Add deadlines in the Planner to log focus time against them.</p>
				{/if}
			</article>

			<article class="card card-pad">
				<div class="card-head">
					<h2 class="card-title"><span class="ico"><Brain size={16} /></span> Today</h2>
					<span class="mono faint">{formatHours($stats.focusToday / 60)}</span>
				</div>
				<div class="today-stats">
					<div><span class="num big">{$stats.sessionsToday.length}</span><span class="faint">sessions</span></div>
					<div><span class="num big">{Math.round($stats.focusToday)}</span><span class="faint">minutes</span></div>
					<div><span class="num big">{$stats.streak}</span><span class="faint">day streak</span></div>
				</div>
				{#if $stats.sessionsToday.length}
					<ul class="sessions">
						{#each [...$stats.sessionsToday].reverse() as s (s.id)}
							{@const d = $deadlines.find((x) => x.id === s.deadlineId)}
							<li animate:flip={{ duration: 300 }} in:fly={{ y: -8, duration: 300 }}>
								<span class="s-dot" style:background={d ? seriesColor(d.id) : 'var(--text-3)'}></span>
								<span class="s-name">{d?.name ?? 'Free focus'}</span>
								<span class="faint mono">{timeOf(s.at)}</span>
								<span class="mono s-min">{Math.round(s.minutes)}m</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="faint none">No sessions yet today. The first one is the hardest.</p>
				{/if}
			</article>
		</div>
	</section>
</div>

<style>
	.quick-tools {
		display: flex;
		gap: 8px;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}
	.timer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 26px;
		padding: 30px 24px 26px;
		border-radius: var(--radius-xl);
		overflow: hidden;
	}
	.timer::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 50% 45%, oklch(0.7 0.18 var(--accent-h) / 0.16), transparent 60%);
		opacity: 0;
		transition: opacity 1.2s;
		pointer-events: none;
	}
	.timer.running::before {
		opacity: 1;
		animation: breathe 5s ease-in-out infinite;
	}
	@keyframes breathe {
		50% {
			transform: scale(1.12);
			opacity: 0.6;
		}
	}
	.modes {
		position: relative;
	}
	.dial {
		position: relative;
		width: min(var(--size), 78vw);
		aspect-ratio: 1;
	}
	.dial svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.tick {
		stroke: var(--border-2);
		stroke-width: 2;
		stroke-linecap: round;
		transition: stroke 0.4s;
	}
	.tick.long {
		stroke-width: 2.5;
	}
	.tick.lit {
		stroke: var(--accent);
	}
	.track {
		stroke: var(--surface-3);
	}
	.arc {
		filter: drop-shadow(0 0 10px var(--accent-glow));
	}
	.knob {
		fill: #fff;
		filter: drop-shadow(0 0 8px var(--accent)) drop-shadow(0 2px 4px oklch(0 0 0 / 0.4));
	}
	.readout {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
	}
	.mode-label {
		font-size: 13px;
		font-weight: 550;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-3);
	}
	.time {
		font-size: clamp(54px, 13vw, 80px);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.04em;
	}
	.rounds {
		display: flex;
		gap: 7px;
		margin-top: 8px;
	}
	.rounds span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--surface-3);
		transition: background 0.3s, transform 0.3s;
	}
	.rounds span.filled {
		background: var(--accent);
	}
	.rounds span.current {
		transform: scale(1.25);
		box-shadow: 0 0 0 2px var(--accent-soft);
	}
	.controls {
		position: relative;
		display: flex;
		align-items: center;
		gap: 22px;
	}
	.ctl {
		--h: 52px;
		border-radius: 50%;
	}
	.play {
		display: grid;
		place-items: center;
		width: 84px;
		height: 84px;
		border-radius: 50%;
		color: #fff;
		background: linear-gradient(135deg, var(--btn-a), var(--btn-b));
		box-shadow: 0 0 0 1px oklch(1 0 0 / 0.15) inset, 0 18px 40px -12px var(--accent-glow), 0 0 0 8px var(--accent-soft);
		transition: transform 0.3s var(--ease-spring), box-shadow 0.3s;
	}
	.play:hover {
		transform: scale(1.06);
	}
	.play:active {
		transform: scale(0.95);
	}
	.running .play {
		animation: ring-pulse 2.4s ease-out infinite;
	}
	@keyframes ring-pulse {
		0% { box-shadow: 0 0 0 1px oklch(1 0 0 / 0.15) inset, 0 18px 40px -12px var(--accent-glow), 0 0 0 0 var(--accent-glow); }
		100% { box-shadow: 0 0 0 1px oklch(1 0 0 / 0.15) inset, 0 18px 40px -12px var(--accent-glow), 0 0 0 22px transparent; }
	}
	.hint {
		position: relative;
		font-size: 12px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.side {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
	}
	.current {
		display: flex;
		gap: 14px;
		margin-top: 16px;
	}
	.c-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.c-name {
		font-weight: 600;
		font-size: 15px;
	}
	.c-meta {
		font-size: 12.5px;
	}
	.c-body .bar {
		margin-top: 6px;
	}
	.none {
		font-size: 13.5px;
		margin-top: 12px;
	}
	.today-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 8px;
	}
	.today-stats > div {
		display: flex;
		flex-direction: column;
		padding: 12px;
		border-radius: 14px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		font-size: 12px;
	}
	.big {
		font-size: 24px;
		font-weight: 600;
		letter-spacing: -0.03em;
	}
	.sessions li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
		font-size: 13.5px;
	}
	.sessions li:last-child {
		border-bottom: 0;
	}
	.s-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	.s-name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.s-min {
		font-weight: 600;
		min-width: 36px;
		text-align: right;
	}
	@media (max-width: 1180px) {
		.grid {
			grid-template-columns: 1fr;
		}
		.side {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
			align-items: start;
		}
	}
	@media (max-width: 640px) {
		.modes > button {
			padding: 0 10px;
		}
		.timer {
			padding: 22px 14px;
		}
	}
</style>
