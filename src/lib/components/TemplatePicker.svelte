<script>
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { templatesOpen, go } from '$lib/ui.js';
	import { applyTemplate } from '$lib/actions.js';
	import {
		TEMPLATES, TEMPLATE_GROUPS, MILESTONE_COUNT, EFFORT, planSteps, templateHours, templateSpan
	} from '$lib/content/templates.js';
	import { toISO, addDays, startOfDay, todayISO, shortDate, relativeDay, formatHours, daysUntil } from '$lib/utils/date.js';
	import { X } from '$lib/icons.js';

	let group = $state('All');
	let selectedId = $state(TEMPLATES[0].id);
	let title = $state('');
	let dueDate = $state('');
	let effort = $state('standard');

	const shown = $derived(group === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.group === group));
	const selected = $derived(TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0]);
	const factor = $derived(EFFORT.find((e) => e.id === effort)?.factor ?? 1);
	const steps = $derived(dueDate ? planSteps(selected, dueDate, factor) : []);
	const total = $derived(steps.reduce((n, s) => n + s.hours, 0));
	const squeezed = $derived(!!dueDate && templateSpan(selected) > daysUntil(dueDate));

	function pick(t) {
		selectedId = t.id;
		title = '';
		dueDate = toISO(addDays(startOfDay(), templateSpan(t) + 1));
	}

	$effect(() => {
		if ($templatesOpen && !dueDate) pick(selected);
	});

	const close = () => templatesOpen.set(false);

	function create() {
		if (!dueDate) return;
		applyTemplate(selected, { title: title || selected.name, dueDate, factor });
		close();
		go('planner');
	}
</script>

<svelte:window onkeydown={(e) => $templatesOpen && e.key === 'Escape' && close()} />

{#if $templatesOpen}
	<div class="overlay" transition:fade={{ duration: 180 }} onclick={close} role="presentation">
		<div
			class="modal card"
			role="dialog"
			aria-modal="true"
			aria-label="Plan templates"
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
					<span class="eyebrow">{TEMPLATES.length} templates · {MILESTONE_COUNT} milestones</span>
					<h2 class="display">Start from a template</h2>
				</div>
				<button class="btn btn-ghost btn-icon" onclick={close} aria-label="Close"><X size={18} weight="bold" /></button>
			</header>

			<div class="body">
				<div class="list-col">
					<div class="groups">
						{#each ['All', ...TEMPLATE_GROUPS] as g}
							<button class="grp" class:on={group === g} onclick={() => (group = g)}>
								{g}
								<span class="num">{g === 'All' ? TEMPLATES.length : TEMPLATES.filter((t) => t.group === g).length}</span>
							</button>
						{/each}
					</div>
					<ul class="list">
						{#each shown as t (t.id)}
							<li>
								<button class="tpl" class:on={t.id === selectedId} onclick={() => pick(t)}>
									<span class="t-name">{t.name}</span>
									<span class="t-blurb">{t.blurb}</span>
									<span class="t-meta mono">{t.steps.length} steps · {formatHours(templateHours(t))} · {templateSpan(t)} days</span>
								</button>
							</li>
						{/each}
					</ul>
				</div>

				<div class="detail">
					<div class="fields">
						<div class="field">
							<label class="label" for="tpl-title">Name</label>
							<input id="tpl-title" class="input" bind:value={title} placeholder={selected.name} />
						</div>
						<div class="field">
							<label class="label" for="tpl-date">Final due date</label>
							<input id="tpl-date" class="input" type="date" bind:value={dueDate} min={todayISO()} />
						</div>
						<div class="field full">
							<span class="label">Effort</span>
							<div class="seg block">
								{#each EFFORT as e}
									<button class:on={effort === e.id} onclick={() => (effort = e.id)}>
										{e.label} <span class="faint num">{e.factor}×</span>
									</button>
								{/each}
							</div>
						</div>
					</div>

					<ol class="steps">
						{#each steps as s, i}
							<li>
								<span class="s-i mono">{String(i + 1).padStart(2, '0')}</span>
								<span class="s-name">{s.name}</span>
								<span class="s-date">{relativeDay(s.dueDate)} <span class="faint">· {shortDate(s.dueDate)}</span></span>
								<span class="s-h num">{formatHours(s.hours)}</span>
							</li>
						{/each}
					</ol>
					{#if squeezed}
						<p class="note">Less time than this template usually needs, so the steps are packed closer together.</p>
					{/if}

					<div class="foot">
						<span class="total"><span class="num">{steps.length}</span> steps · <span class="num">{formatHours(total)}</span> of work</span>
						<button class="btn btn-primary" onclick={create} disabled={!dueDate}>Add to planner</button>
					</div>
				</div>
			</div>
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
		width: min(980px, 100%);
		max-height: min(760px, 92dvh);
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
		padding: 22px 22px 16px 26px;
		border-bottom: 1px solid var(--border);
	}
	.m-head h2 {
		margin-top: 8px;
		font-size: 34px;
	}
	.body {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: 340px 1fr;
	}
	.list-col {
		display: flex;
		flex-direction: column;
		min-height: 0;
		border-right: 1px solid var(--border);
	}
	.groups {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 14px 16px;
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
		padding: 8px;
	}
	.tpl {
		display: flex;
		flex-direction: column;
		gap: 3px;
		width: 100%;
		padding: 12px 14px;
		border-radius: 14px;
		text-align: left;
		border: 1px solid transparent;
		transition: background 0.2s, border-color 0.2s;
	}
	.tpl:hover {
		background: var(--surface-2);
	}
	.tpl.on {
		background: var(--accent-soft);
		border-color: oklch(0.74 0.17 var(--accent-h) / 0.3);
	}
	.t-name {
		font-size: 14.5px;
		font-weight: 600;
	}
	.t-blurb {
		font-size: 12.5px;
		color: var(--text-2);
	}
	.t-meta {
		margin-top: 4px;
		font-size: 11px;
		color: var(--text-3);
	}
	.detail {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow-y: auto;
		padding: 18px 22px;
		gap: 16px;
	}
	.fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.full {
		grid-column: 1 / -1;
	}
	.steps {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--border);
	}
	.steps li {
		display: grid;
		grid-template-columns: 30px 1fr auto 60px;
		align-items: center;
		gap: 12px;
		padding: 11px 0;
		border-bottom: 1px solid var(--border);
		font-size: 13.5px;
	}
	.s-i {
		font-size: 11px;
		color: var(--accent-ink);
	}
	.s-name {
		font-weight: 550;
		min-width: 0;
	}
	.s-date {
		font-size: 12.5px;
		color: var(--text-2);
		white-space: nowrap;
	}
	.s-h {
		text-align: right;
		font-weight: 600;
		color: var(--text-2);
	}
	.note {
		font-size: 12.5px;
		color: var(--warn);
	}
	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: auto;
		padding-top: 6px;
	}
	.total {
		font-size: 13px;
		color: var(--text-2);
	}
	.total .num {
		color: var(--text);
		font-weight: 600;
	}
	@media (max-width: 760px) {
		.body {
			grid-template-columns: 1fr;
			overflow-y: auto;
		}
		.list-col {
			border-right: 0;
			border-bottom: 1px solid var(--border);
		}
		.list {
			max-height: 260px;
		}
		.detail {
			overflow: visible;
		}
		.steps li {
			grid-template-columns: 26px 1fr 52px;
		}
		.s-date {
			grid-column: 2;
			grid-row: 2;
		}
		.m-head h2 {
			font-size: 28px;
		}
	}
</style>
