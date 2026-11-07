<script>
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import Logo from './ui/Logo.svelte';
	import Ring from './ui/Ring.svelte';
	import AuthCard from './AuthCard.svelte';
	import { settings, startGuest } from '$lib/stores.js';
	import { ACCENTS } from '$lib/constants.js';
	import { parseQuick, describeParse } from '$lib/utils/parse.js';
	import { tilt, spotlight } from '$lib/utils/use.js';
	import { toggleTheme } from '$lib/theme.js';
	import {
		Sparkles, CalendarClock, Timer, Flame, TriangleAlert, WandSparkles, ArrowRight,
		Sun, Moon, CloudCheck, Zap, Laptop, X, Check, Play
	} from '$lib/icons.js';

	let authOpen = $state(false);
	let authMode = $state('signup');

	function openAuth(mode) {
		authMode = mode;
		authOpen = true;
	}


	// Typewriter that runs the real quick-add parser on each keystroke.
	const examples = [
		'Chem midterm next fri 8h !!!',
		'History essay thursday 5h !!',
		'Calc problem set tomorrow 2h',
		'Bio lab report in 9 days 4h',
		'Debate prep sat 90m !'
	];
	let typed = $state('');
	let chips = $derived(describeParse(parseQuick(typed)));

	$effect(() => {
		let i = 0;
		let pos = 0;
		let deleting = false;
		let timer;
		const step = () => {
			const target = examples[i];
			if (!deleting) {
				pos++;
				typed = target.slice(0, pos);
				if (pos === target.length) {
					deleting = true;
					timer = setTimeout(step, 1900);
					return;
				}
				timer = setTimeout(step, 42 + Math.random() * 50);
			} else {
				pos -= 2;
				typed = target.slice(0, Math.max(0, pos));
				if (pos <= 0) {
					deleting = false;
					pos = 0;
					i = (i + 1) % examples.length;
					timer = setTimeout(step, 350);
					return;
				}
				timer = setTimeout(step, 16);
			}
		};
		timer = setTimeout(step, 900);
		return () => clearTimeout(timer);
	});

	const planRows = [
		{ name: 'Organic chemistry midterm', time: '1h 30m', hue: 285, w: 92 },
		{ name: 'History essay: the Cold War', time: '1h 15m', hue: 40, w: 76 },
		{ name: 'Calc II problem set 7', time: '30m', hue: 150, w: 34 }
	];
	const week = [
		[1.5, 1, 0.5], [1.75, 1, 0.75], [2, 1.25, 0], [2, 0.75, 0.5], [1.5, 1.5, 0], [1, 0.5, 0], [0.75, 0.5, 0.25]
	];
	const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
	const today = new Date().getDay();

	const features = [
		{
			icon: CalendarClock,
			title: 'A planner that plans for you',
			body: 'Add a deadline and an estimate. Studently splits it into daily study blocks, weighted by priority and urgency, and keeps it inside the hours you actually have.',
			big: true
		},
		{
			icon: WandSparkles,
			title: 'Type it like you’d say it',
			body: '“essay fri 4h !!” becomes a high-priority assignment due Friday with four hours planned.'
		},
		{
			icon: Timer,
			title: 'Focus that keeps score',
			body: 'Every focus session logs progress to the deadline you picked, so your plan updates itself.'
		},
		{
			icon: TriangleAlert,
			title: 'No more 3 a.m. surprises',
			body: 'If the math doesn’t work, you’ll know days early, with a one-tap fix.'
		},
		{
			icon: Flame,
			title: 'Momentum you can see',
			body: 'Streaks, weekly focus charts and progress rings that make showing up feel good.'
		}
	];

	function onkeydown(e) {
		if (e.key === 'Escape' && authOpen) authOpen = false;
	}
</script>

<svelte:window {onkeydown} />
<svelte:head>
	<title>Studently — Your semester, under control</title>
</svelte:head>

<div class="landing">
	<header class="nav" in:fade={{ duration: 600 }}>
		<Logo size={32} />
		<div class="nav-r">
			<button class="btn btn-ghost btn-icon" onclick={toggleTheme} aria-label="Toggle theme">
				<Sun size={18} class="only-dark" />
				<Moon size={18} class="only-light" />
			</button>
			<button class="btn btn-ghost btn-sm hide-sm" onclick={startGuest}>Try as guest</button>
			<button class="btn btn-soft btn-sm" onclick={() => openAuth('signin')}>Sign in</button>
		</div>
	</header>

	<section class="hero">
		<div class="copy stagger">
			<span class="pill"><Sparkles size={14} /> Smart scheduling for students</span>
			<h1 class="display headline">
				Your semester,<br />
				<em class="grad-text">beautifully</em><br />
				under control.
			</h1>
			<p class="lede">
				Drop in your deadlines. Studently turns them into calm, doable daily sessions, times your focus,
				and keeps everything in sync.
			</p>
			<div class="cta">
				<button class="btn btn-primary btn-lg" onclick={() => openAuth('signup')}>
					Get started free <ArrowRight size={18} />
				</button>
				<button class="btn btn-soft btn-lg" onclick={startGuest}>
					<Play size={16} /> Try it as a guest
				</button>
			</div>
			<ul class="proof">
				<li><Zap size={14} /> 15-minute planning blocks</li>
				<li><CloudCheck size={14} /> Works offline, syncs everywhere</li>
				<li><Laptop size={14} /> No install needed</li>
			</ul>
		</div>

		<div class="visual" in:fly={{ y: 40, duration: 1100, delay: 200, easing: cubicOut }}>
			<div class="window card" use:tilt={{ max: 7 }}>
				<div class="win-bar">
					<span class="dots"><i></i><i></i><i></i></span>
					<span class="win-url mono">studently · today</span>
				</div>
				<div class="win-body">
					<div class="mock-input">
						<WandSparkles size={16} />
						<span class="typed">{typed}<span class="caret"></span></span>
					</div>
					<div class="mock-chips">
						{#each chips as c (c.kind + c.label)}
							<span class="chip {c.kind === 'priority' ? c.tone : 'accent'}" in:scale={{ start: 0.6, duration: 300, easing: backOut }}>
								{c.label}
							</span>
						{/each}
					</div>

					<div class="mock-plan">
						<div class="row-head">
							<span class="eyebrow">Today’s plan</span>
							<span class="mono faint">3h 15m</span>
						</div>
						{#each planRows as r, i}
							<div class="plan-row" style:--h={r.hue} style:--d="{0.5 + i * 0.12}s">
								<span class="pbar"></span>
								<span class="pname">{r.name}</span>
								<span class="ptime mono">{r.time}</span>
								<span class="pprog"><span style:width="{r.w}%"></span></span>
							</div>
						{/each}
					</div>

					<div class="mock-week">
						{#each week as stack, i}
							<div class="wcol" class:now={i === today}>
								<div class="wstack">
									{#each stack as h, j}
										<span style:height="{h * 20}px" style:--h={[285, 40, 150][j]} style:--d="{0.6 + i * 0.06}s"></span>
									{/each}
								</div>
								<span class="wlabel mono">{weekdays[i]}</span>
							</div>
						{/each}
						<span class="cap-line"><span class="mono">4h budget</span></span>
					</div>
				</div>
			</div>

			<div class="float f1 card">
				<Ring value={0.72} size={64} stroke={6}>
					<span class="mono ring-t">18:42</span>
				</Ring>
				<div>
					<div class="f-title">Focusing</div>
					<div class="f-sub">Chem midterm · round 2</div>
				</div>
			</div>
			<div class="float f2 card">
				<span class="flame"><Flame size={16} /></span>
				<span><strong>6-day</strong> streak</span>
			</div>
			<div class="float f3 card">
				<span class="ok"><Check size={14} /></span>
				<span>Calc pset done · <span class="faint">+2h logged</span></span>
			</div>
		</div>
	</section>

	<section class="features">
		<div class="sec-head">
			<span class="eyebrow">Why Studently</span>
			<h2 class="display">Everything a semester needs.<br /><em class="faint">Nothing it doesn’t.</em></h2>
		</div>
		<div class="bento">
			{#each features as f}
				<article class="feat card spot" class:big={f.big} use:spotlight>
					<span class="f-ico"><f.icon size={20} /></span>
					<h3>{f.title}</h3>
					<p>{f.body}</p>
					{#if f.big}
						<div class="mini-chart" aria-hidden="true">
							{#each [3, 3.5, 4, 3.75, 2.5, 2, 1.5, 2.75, 3.25, 4, 3.5, 2] as h, i}
								<span style:height="{h * 16}px" style:--h={[285, 40, 150, 200][i % 4]}></span>
							{/each}
						</div>
					{/if}
				</article>
			{/each}
		</div>
	</section>

	<section class="personalize card">
		<div>
			<span class="eyebrow">Make it yours</span>
			<h2 class="display">Pick a color. <em>Any color.</em></h2>
			<p class="muted">Every surface re-tints to match, in light or dark mode. Go on, try it.</p>
		</div>
		<div class="swatches">
			{#each ACCENTS as a}
				<button
					class="swatch"
					class:on={$settings.accent === a.id}
					style:--sh={a.h}
					onclick={() => ($settings.accent = a.id)}
					aria-label="{a.label} accent"
					title={a.label}
				></button>
			{/each}
			<button class="btn btn-soft btn-sm" onclick={toggleTheme}>
				<Sun size={15} class="only-dark" /><Moon size={15} class="only-light" /> Flip theme
			</button>
		</div>
	</section>

	<section class="final">
		<h2 class="display">Your best semester<br />starts <em class="grad-text">tonight.</em></h2>
		<div class="cta center">
			<button class="btn btn-primary btn-lg" onclick={() => openAuth('signup')}>
				Create a free account <ArrowRight size={18} />
			</button>
			<button class="btn btn-ghost btn-lg" onclick={() => openAuth('signin')}>I already have one</button>
		</div>
	</section>

	<footer class="foot">
		<Logo size={22} />
		<span class="faint">
			Made by <a href="https://samuelasefa.vercel.app" target="_blank" rel="noreferrer">Sammy Asefa</a>
		</span>
	</footer>
</div>

{#if authOpen}
	<div class="overlay" transition:fade={{ duration: 200 }} onclick={() => (authOpen = false)} role="presentation">
		<div
			class="modal card"
			role="dialog"
			aria-modal="true"
			aria-label="Sign in"
			tabindex="-1"
			transition:fly={{ y: 24, duration: 450, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<button class="btn btn-ghost btn-icon close" onclick={() => (authOpen = false)} aria-label="Close">
				<X size={18} />
			</button>
			<AuthCard bind:mode={authMode} />
		</div>
	</div>
{/if}

<style>
	.landing {
		max-width: 1220px;
		margin: 0 auto;
		padding: 0 24px;
	}

	/* Nav */
	.nav {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 76px;
		margin: 0 -24px;
		padding: 0 24px;
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		-webkit-mask-image: linear-gradient(#000 70%, transparent);
		mask-image: linear-gradient(#000 70%, transparent);
	}
	.nav-r {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	/* Hero */
	.hero {
		display: grid;
		grid-template-columns: 1.02fr 1fr;
		gap: 64px;
		align-items: center;
		padding: 48px 0 120px;
		min-height: calc(100dvh - 76px);
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 32px;
		padding: 0 14px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: 550;
		color: var(--accent-ink);
		background: var(--accent-soft);
		border: 1px solid oklch(0.74 0.17 var(--accent-h) / 0.25);
	}
	.headline {
		margin-top: 26px;
		font-size: clamp(54px, 7.4vw, 100px);
		line-height: 0.94;
		letter-spacing: -0.035em;
	}
	.headline em {
		padding-right: 0.08em;
	}
	.lede {
		margin-top: 26px;
		font-size: 18px;
		line-height: 1.55;
		color: var(--text-2);
		max-width: 44ch;
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 34px;
	}
	.cta.center {
		justify-content: center;
	}
	.proof {
		display: flex;
		flex-wrap: wrap;
		gap: 10px 22px;
		margin-top: 40px;
		font-size: 13px;
		color: var(--text-3);
	}
	.proof li {
		display: inline-flex;
		align-items: center;
		gap: 7px;
	}
	.proof :global(svg) {
		color: var(--accent);
	}

	/* Product mock */
	.visual {
		position: relative;
		perspective: 1600px;
	}
	.window {
		--rx: 0deg;
		--ry: 0deg;
		border-radius: 22px;
		background: var(--surface);
		box-shadow: var(--shadow-lg), 0 0 0 1px var(--border), 0 60px 120px -40px var(--accent-glow);
		transform: rotateX(calc(6deg + var(--rx))) rotateY(calc(-12deg + var(--ry))) rotateZ(1deg);
		transition: transform 0.8s var(--ease-out);
		transform-style: preserve-3d;
		overflow: hidden;
	}
	.win-bar {
		display: flex;
		align-items: center;
		gap: 14px;
		height: 42px;
		padding: 0 16px;
		border-bottom: 1px solid var(--border);
		background: var(--surface-2);
	}
	.dots {
		display: flex;
		gap: 6px;
	}
	.dots i {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--surface-3);
	}
	.dots i:nth-child(1) { background: oklch(0.7 0.18 25); }
	.dots i:nth-child(2) { background: oklch(0.82 0.15 85); }
	.dots i:nth-child(3) { background: oklch(0.75 0.16 150); }
	.win-url {
		font-size: 11.5px;
		color: var(--text-3);
	}
	.win-body {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.mock-input {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 48px;
		padding: 0 16px;
		border-radius: 14px;
		background: var(--input-bg);
		border: 1px solid var(--accent);
		box-shadow: 0 0 0 4px var(--accent-soft);
		color: var(--accent);
		font-size: 15px;
	}
	.typed {
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
	}
	.caret {
		display: inline-block;
		width: 2px;
		height: 18px;
		margin-left: 1px;
		vertical-align: -3px;
		background: var(--accent);
		animation: blink 1s steps(1) infinite;
	}
	@keyframes blink {
		50% { opacity: 0; }
	}
	.mock-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		min-height: 24px;
		margin-top: -4px;
	}
	.mock-plan {
		padding: 14px;
		border-radius: 16px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.row-head {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
	}
	.plan-row {
		display: grid;
		grid-template-columns: 4px 1fr auto;
		grid-template-rows: auto auto;
		column-gap: 12px;
		row-gap: 6px;
		align-items: center;
		animation: rise 0.7s var(--ease-out) both;
		animation-delay: var(--d);
	}
	.pbar {
		grid-row: span 2;
		height: 100%;
		border-radius: 4px;
		background: oklch(0.7 0.16 var(--h));
	}
	.pname {
		font-size: 13.5px;
		font-weight: 550;
	}
	.ptime {
		font-size: 12px;
		color: var(--text-2);
	}
	.pprog {
		grid-column: 2 / 4;
		height: 4px;
		border-radius: 4px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.pprog span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: oklch(0.7 0.16 var(--h));
		animation: grow 1.4s var(--ease-out) both 0.8s;
		transform-origin: left;
	}
	@keyframes grow {
		from { transform: scaleX(0); }
	}
	.mock-week {
		position: relative;
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 10px;
		align-items: end;
		height: 120px;
		padding: 0 6px;
	}
	.wcol {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.wstack {
		display: flex;
		flex-direction: column-reverse;
		gap: 2px;
		width: 100%;
		max-width: 30px;
	}
	.wstack span {
		display: block;
		border-radius: 5px;
		background: oklch(0.7 0.16 var(--h) / 0.85);
		animation: rise-bar 0.9s var(--ease-out) both;
		animation-delay: var(--d);
		transform-origin: bottom;
	}
	@keyframes rise-bar {
		from { transform: scaleY(0); opacity: 0; }
	}
	.wlabel {
		font-size: 10.5px;
		color: var(--text-3);
	}
	.wcol.now .wlabel {
		color: var(--accent);
		font-weight: 600;
	}
	.cap-line {
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(22px + 80px);
		border-top: 1px dashed var(--border-2);
	}
	.cap-line span {
		position: absolute;
		right: 0;
		top: -18px;
		font-size: 10px;
		color: var(--text-3);
	}

	.float {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 18px;
		background: var(--surface-solid);
		box-shadow: var(--shadow-lg);
		font-size: 13.5px;
		animation: bob 6s ease-in-out infinite alternate;
	}
	.f1 {
		left: -48px;
		bottom: -40px;
		padding: 12px 20px 12px 12px;
	}
	.f2 {
		top: -22px;
		right: -18px;
		animation-delay: -2s;
	}
	.f3 {
		right: -30px;
		bottom: 110px;
		animation-delay: -4s;
	}
	.ring-t {
		font-size: 13px;
		font-weight: 600;
	}
	.f-title {
		font-weight: 600;
	}
	.f-sub {
		font-size: 12px;
		color: var(--text-3);
	}
	.flame {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 9px;
		color: oklch(0.78 0.17 55);
		background: oklch(0.78 0.17 55 / 0.15);
	}
	.ok {
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border-radius: 7px;
		color: #fff;
		background: var(--success);
	}
	@keyframes bob {
		from { transform: translateY(0); }
		to { transform: translateY(-12px); }
	}

	/* Features */
	.features {
		padding: 40px 0 80px;
	}
	.sec-head {
		text-align: center;
		margin-bottom: 44px;
	}
	.sec-head h2 {
		margin-top: 14px;
		font-size: clamp(38px, 5vw, 60px);
		line-height: 1.02;
	}
	.bento {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	.feat {
		padding: 26px;
		overflow: hidden;
		min-height: 220px;
	}
	.feat:hover {
		transform: translateY(-3px);
	}
	.feat.big {
		grid-column: span 2;
	}
	.f-ico {
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
		border-radius: 13px;
		background: var(--accent-soft);
		color: var(--accent-ink);
		margin-bottom: 20px;
	}
	.feat h3 {
		font-size: 18px;
		font-weight: 600;
		letter-spacing: -0.015em;
	}
	.feat p {
		margin-top: 8px;
		color: var(--text-2);
		font-size: 14.5px;
		max-width: 52ch;
	}
	.mini-chart {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		height: 72px;
		margin-top: 22px;
	}
	.mini-chart span {
		flex: 1;
		border-radius: 6px 6px 3px 3px;
		background: linear-gradient(to top, oklch(0.66 0.17 var(--h) / 0.9), oklch(0.75 0.15 var(--h) / 0.5));
		transition: transform 0.4s var(--ease-spring);
		transform-origin: bottom;
	}
	.feat:hover .mini-chart span {
		transform: scaleY(1.08);
	}

	/* Personalize */
	.personalize {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 32px;
		flex-wrap: wrap;
		padding: 36px 40px;
		border-radius: var(--radius-xl);
	}
	.personalize h2 {
		font-size: clamp(32px, 4vw, 44px);
		margin: 10px 0 8px;
	}
	.personalize h2 em {
		color: var(--accent);
	}
	.swatches {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.swatch {
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: linear-gradient(135deg, oklch(0.66 0.2 var(--sh)), oklch(0.66 0.19 calc(var(--sh) + 45)));
		box-shadow: 0 0 0 1px oklch(1 0 0 / 0.15) inset;
		transition: transform 0.35s var(--ease-spring), box-shadow 0.3s;
	}
	.swatch:hover {
		transform: scale(1.12);
	}
	.swatch.on {
		box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px oklch(0.7 0.2 var(--sh));
		transform: scale(1.08);
	}

	/* Final CTA */
	.final {
		text-align: center;
		padding: 120px 0 80px;
	}
	.final h2 {
		font-size: clamp(46px, 6.5vw, 84px);
		line-height: 0.98;
		letter-spacing: -0.03em;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		padding: 28px 0 40px;
		border-top: 1px solid var(--border);
		font-size: 13px;
	}
	.foot a {
		color: var(--text-2);
		font-weight: 550;
	}
	.foot a:hover {
		color: var(--accent);
	}

	/* Auth modal */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: grid;
		place-items: center;
		padding: 16px;
		overflow-y: auto;
		background: oklch(0.1 0.02 var(--accent-h) / 0.6);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}
	.modal {
		position: relative;
		width: min(430px, 100%);
		padding: 32px 28px 24px;
		background: var(--surface-solid);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg), 0 0 120px -30px var(--accent-glow);
	}
	.close {
		position: absolute;
		top: 12px;
		right: 12px;
	}

	@media (max-width: 1020px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 80px;
			min-height: 0;
			padding-top: 32px;
		}
		.visual {
			max-width: 600px;
			margin: 0 auto;
			width: 100%;
		}
		.bento {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (max-width: 640px) {
		.landing {
			padding: 0 16px;
		}
		.nav {
			margin: 0 -16px;
			padding: 0 16px;
			height: 64px;
		}
		.hide-sm {
			display: none;
		}
		.lede {
			font-size: 16.5px;
		}
		.cta .btn {
			flex: 1;
		}
		.window {
			transform: none;
		}
		.f1 {
			left: -6px;
			bottom: -48px;
		}
		.f2 {
			right: -4px;
		}
		.f3 {
			display: none;
		}
		.bento {
			grid-template-columns: 1fr;
		}
		.feat.big {
			grid-column: auto;
		}
		.personalize {
			padding: 28px 22px;
		}
		.final {
			padding: 80px 0 56px;
		}
	}
</style>
