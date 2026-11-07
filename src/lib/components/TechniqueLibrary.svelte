<script>
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { libraryOpen, go, toast } from '$lib/ui.js';
	import { settings } from '$lib/stores.js';
	import { TECHNIQUES, TECHNIQUE_GROUPS, PRESETS } from '$lib/content/techniques.js';
	import { X } from '$lib/icons.js';

	let group = $state('All');
	let openId = $state(null);

	const shown = $derived(group === 'All' ? TECHNIQUES : TECHNIQUES.filter((t) => t.group === group));
	const presetById = (id) => PRESETS.find((p) => p.id === id);
	const close = () => libraryOpen.set(false);

	function usePreset(id) {
		const p = presetById(id);
		if (!p) return;
		settings.update((s) => ({ ...s, focusMinutes: p.focus, shortBreak: p.short, longBreak: p.long }));
		toast(`${p.name} timer set: ${p.focus} / ${p.short} / ${p.long} min`, { tone: 'success' });
		close();
		go('focus');
	}
</script>

<svelte:window onkeydown={(e) => $libraryOpen && e.key === 'Escape' && close()} />

{#if $libraryOpen}
	<div class="overlay" transition:fade={{ duration: 180 }} onclick={close} role="presentation">
		<div
			class="modal card"
			role="dialog"
			aria-modal="true"
			aria-label="Study techniques"
			tabindex="-1"
			transition:fly={{ y: 24, duration: 400, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				e.stopPropagation();
				if (e.key === 'Escape') close();
			}}
		>
			<header class="m-head">
				<div>
					<span class="eyebrow">{TECHNIQUES.length} techniques · {TECHNIQUE_GROUPS.length} categories · {PRESETS.length} timer presets</span>
					<h2 class="display">Study techniques</h2>
				</div>
				<button class="btn btn-ghost btn-icon" onclick={close} aria-label="Close"><X size={18} weight="bold" /></button>
			</header>

			<div class="groups">
				{#each ['All', ...TECHNIQUE_GROUPS] as g}
					<button class="grp" class:on={group === g} onclick={() => (group = g)}>
						{g}
						<span class="num">{g === 'All' ? TECHNIQUES.length : TECHNIQUES.filter((t) => t.group === g).length}</span>
					</button>
				{/each}
			</div>

			<ul class="list">
				{#each shown as t, i (t.id)}
					{@const open = openId === t.id}
					<li class:open>
						<button class="row" onclick={() => (openId = open ? null : t.id)} aria-expanded={open}>
							<span class="index">{String(TECHNIQUES.indexOf(t) + 1).padStart(2, '0')}</span>
							<span class="r-body">
								<span class="r-name">{t.name}</span>
								<span class="r-tag">{t.tagline}</span>
							</span>
							<span class="r-group mono">{t.group}</span>
						</button>
						{#if open}
							<div class="detail" transition:slide={{ duration: 260, easing: cubicOut }}>
								<p class="best"><span class="eyebrow">Best for</span> {t.bestFor}</p>
								<ol class="how">
									{#each t.steps as step, n}
										<li><span class="mono">{n + 1}</span>{step}</li>
									{/each}
								</ol>
								{#if t.preset}
									{@const p = presetById(t.preset)}
									<button class="btn btn-accent-soft btn-sm" onclick={() => usePreset(p.id)}>
										Use the {p.name} timer · <span class="num">{p.focus}/{p.short}/{p.long}</span>
									</button>
								{/if}
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1300;
		display: grid;
		place-items: center;
		padding: 16px;
		background: oklch(0.1 0.02 var(--accent-h) / 0.55);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}
	.modal {
		width: min(760px, 100%);
		max-height: min(780px, 92dvh);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: var(--surface-solid);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
	}
	.m-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 22px 22px 14px 26px;
	}
	.m-head h2 {
		margin-top: 8px;
		font-size: 34px;
	}
	.groups {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 0 26px 14px;
		border-bottom: 1px solid var(--border);
	}
	.grp {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 28px;
		padding: 0 10px;
		border-radius: 999px;
		font-size: 12.5px;
		font-weight: 520;
		color: var(--text-2);
		border: 1px solid var(--border);
	}
	.grp .num {
		font-size: 11px;
		color: var(--text-3);
	}
	.grp.on {
		color: var(--text);
		background: var(--accent-soft);
		border-color: transparent;
	}
	.list {
		flex: 1;
		overflow-y: auto;
		padding: 6px 12px 14px;
	}
	.list > li {
		border-bottom: 1px solid var(--border);
	}
	.row {
		display: flex;
		align-items: center;
		gap: 16px;
		width: 100%;
		padding: 14px;
		text-align: left;
		border-radius: 12px;
		transition: background 0.2s;
	}
	.row:hover,
	.open .row {
		background: var(--surface-2);
	}
	.r-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.r-name {
		font-size: 15px;
		font-weight: 600;
	}
	.r-tag {
		font-size: 13px;
		color: var(--text-2);
	}
	.r-group {
		font-size: 11px;
		color: var(--text-3);
		white-space: nowrap;
	}
	.detail {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		padding: 6px 14px 18px 52px;
	}
	.best {
		display: flex;
		align-items: baseline;
		gap: 10px;
		font-size: 13.5px;
	}
	.how {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 13.5px;
		color: var(--text-2);
	}
	.how li {
		display: flex;
		gap: 12px;
	}
	.how .mono {
		color: var(--accent-ink);
		font-size: 12px;
		min-width: 10px;
		padding-top: 1px;
	}
	@media (max-width: 640px) {
		.r-group {
			display: none;
		}
		.detail {
			padding-left: 14px;
		}
	}
</style>
