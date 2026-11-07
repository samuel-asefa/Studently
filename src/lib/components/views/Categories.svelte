<script>
	import { flip } from 'svelte/animate';
	import { scale, fade } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { categories, tasks } from '$lib/stores.js';
	import { addCategory, recolorCategory, renameCategory, deleteCategory } from '$lib/actions.js';
	import { confirm, toast, go } from '$lib/ui.js';
	import { CATEGORY_COLORS } from '$lib/constants.js';
	import { spotlight, autofocus } from '$lib/utils/use.js';
	import { Pencil, Trash, Palette, Check, Tag, Plus } from '$lib/icons.js';

	let name = $state('');
	let color = $state(CATEGORY_COLORS[0]);
	let error = $state('');
	let renaming = $state(null);
	let renameText = $state('');
	let picking = $state(null);

	const entries = $derived(Object.entries($categories));
	const counts = $derived.by(() => {
		const c = {};
		for (const t of $tasks) {
			c[t.category] ??= { total: 0, done: 0 };
			c[t.category].total++;
			if (t.done) c[t.category].done++;
		}
		return c;
	});

	function create(e) {
		e.preventDefault();
		error = addCategory(name, color) ?? '';
		if (!error) {
			toast(`Created “${name.trim()}”`, { tone: 'success' });
			name = '';
			color = CATEGORY_COLORS[(CATEGORY_COLORS.indexOf(color) + 3) % CATEGORY_COLORS.length];
		}
	}

	function commitRename() {
		if (!renaming) return;
		const err = renameCategory(renaming, renameText);
		if (err) toast(err, { tone: 'danger' });
		renaming = null;
	}

	async function remove(n) {
		const count = counts[n]?.total ?? 0;
		const ok = await confirm({
			title: `Delete “${n}”?`,
			message: count
				? `Its ${count} task${count === 1 ? '' : 's'} will be deleted too. You can undo right after.`
				: 'This category has no tasks.',
			confirmLabel: 'Delete',
			danger: true
		});
		if (ok) deleteCategory(n);
	}
</script>

<svelte:window onclick={() => (picking = null)} />

<div class="page stagger">
	<header class="page-head">
		<div>
			<span class="eyebrow">Organize</span>
			<h1 class="page-title">Categories</h1>
			<p class="page-sub">Color-code your life. Categories group your tasks so you can see each part of your week at a glance.</p>
		</div>
		<div class="chip">{entries.length} categor{entries.length === 1 ? 'y' : 'ies'}</div>
	</header>

	<form class="create card card-pad" onsubmit={create}>
		<div class="preview" style:--c={color}>
			<Tag size={26} weight="fill" />
			<span class="p-hex mono">{color}</span>
		</div>
		<div class="c-body">
			<div class="c-row">
				<input class="input" bind:value={name} placeholder="New category, e.g. Math, Soccer, Job" aria-label="Category name" maxlength="40" />
				<button class="btn btn-primary" type="submit" disabled={!name.trim()}>Create</button>
			</div>
			<div class="palette" role="radiogroup" aria-label="Color">
				{#each CATEGORY_COLORS as c}
					<button
						type="button"
						class="sw"
						class:on={c === color}
						style:--c={c}
						role="radio"
						aria-checked={c === color}
						aria-label="Color {c}"
						onclick={() => (color = c)}
					>
						{#if c === color}<span in:scale={{ duration: 250, easing: backOut }}><Check size={13} weight="bold" /></span>{/if}
					</button>
				{/each}
				<label class="sw custom" title="Custom color" style:--c={color}>
					<Plus size={14} weight="bold" />
					<input type="color" bind:value={color} aria-label="Custom color" />
				</label>
			</div>
			{#if error}<p class="err">{error}</p>{/if}
		</div>
	</form>

	{#if entries.length}
		<section class="grid">
			{#each entries as [n, c] (n)}
				{@const stat = counts[n] ?? { total: 0, done: 0 }}
				{@const pct = stat.total ? Math.round((stat.done / stat.total) * 100) : 0}
				<article
					class="cat card spot"
					style:--c={c}
					use:spotlight
					animate:flip={{ duration: 400, easing: cubicOut }}
					in:scale={{ start: 0.92, duration: 400, easing: cubicOut }}
					out:fade={{ duration: 150 }}
				>
					<div class="glow"></div>
					<div class="top">
						<span class="big-dot"></span>
						<div class="actions">
							<button class="btn btn-ghost btn-icon btn-sm" onclick={(e) => { e.stopPropagation(); picking = picking === n ? null : n; }} aria-label="Change color of {n}">
								<Palette size={14} />
							</button>
							<button class="btn btn-ghost btn-icon btn-sm" onclick={() => { renaming = n; renameText = n; }} aria-label="Rename {n}">
								<Pencil size={14} />
							</button>
							<button class="btn btn-ghost btn-danger btn-icon btn-sm" onclick={() => remove(n)} aria-label="Delete {n}">
								<Trash size={14} />
							</button>
						</div>
					</div>

					{#if picking === n}
						<div class="pop card" role="dialog" aria-label="Pick a color" tabindex="-1" transition:scale={{ start: 0.9, duration: 200 }} onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && (picking = null)}>
							{#each CATEGORY_COLORS as pc}
								<button class="sw sm" class:on={pc === c} style:--c={pc} aria-label="Color {pc}" onclick={() => { recolorCategory(n, pc); picking = null; }}></button>
							{/each}
						</div>
					{/if}

					{#if renaming === n}
						<input
							class="input rename"
							bind:value={renameText}
							use:autofocus
							onblur={commitRename}
							onkeydown={(e) => {
								if (e.key === 'Enter') commitRename();
								if (e.key === 'Escape') renaming = null;
							}}
							aria-label="Rename category"
						/>
					{:else}
						<h2 class="name" ondblclick={() => { renaming = n; renameText = n; }}>{n}</h2>
					{/if}

					<div class="stats">
						<span><strong class="num">{stat.total - stat.done}</strong> open</span>
						<span><strong class="num">{stat.done}</strong> done</span>
						<span class="pct num">{pct}%</span>
					</div>
					<div class="bar"><span style:width="{pct}%" style:background={c}></span></div>
				</article>
			{/each}
		</section>
	{:else}
		<div class="card empty">
			<h3>No categories</h3>
			<p>Create one above. Tasks without a category land in your Inbox.</p>
		</div>
	{/if}

	<button class="to-tasks btn btn-ghost" onclick={() => go('tasks')}>Go to tasks →</button>
</div>

<style>
	.create {
		display: flex;
		gap: 18px;
		align-items: flex-start;
	}
	.preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		width: 72px;
		height: 72px;
		border-radius: 18px;
		flex-shrink: 0;
		color: #fff;
		background: linear-gradient(135deg, var(--c), color-mix(in oklch, var(--c) 70%, black));
		box-shadow: 0 12px 30px -10px var(--c);
		transition: background 0.4s, box-shadow 0.4s;
	}
	.p-hex {
		font-size: 9.5px;
		opacity: 0.85;
		text-transform: uppercase;
	}
	.custom :global(svg) {
		filter: drop-shadow(0 1px 2px oklch(0 0 0 / 0.4));
	}
	.c-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.c-row {
		display: flex;
		gap: 10px;
	}
	.c-row .input {
		height: 46px;
		font-size: 15px;
	}
	.c-row .btn {
		--h: 46px;
	}
	.palette {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.sw {
		position: relative;
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		color: #fff;
		background: var(--c);
		box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.15);
		transition: transform 0.3s var(--ease-spring), box-shadow 0.2s;
	}
	.sw:hover {
		transform: scale(1.14);
	}
	.sw.on {
		box-shadow: 0 0 0 3px var(--surface-solid), 0 0 0 5px var(--c);
	}
	.sw.sm {
		width: 24px;
		height: 24px;
	}
	.custom {
		cursor: pointer;
		background: conic-gradient(from 0deg, #f43f5e, #f59e0b, #84cc16, #10b981, #06b6d4, #6366f1, #d946ef, #f43f5e);
		color: #fff;
	}
	.custom input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}
	.err {
		font-size: 13px;
		color: var(--danger);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
		gap: 14px;
	}
	.cat {
		padding: 18px;
		overflow: visible;
		min-height: 170px;
		display: flex;
		flex-direction: column;
	}
	.cat:hover {
		transform: translateY(-3px);
	}
	.glow {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: radial-gradient(ellipse 90% 70% at 0% 0%, color-mix(in oklch, var(--c) 22%, transparent), transparent 70%);
		pointer-events: none;
	}
	.top {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	.big-dot {
		width: 36px;
		height: 36px;
		border-radius: 12px;
		background: linear-gradient(135deg, var(--c), color-mix(in oklch, var(--c) 65%, black));
		box-shadow: 0 8px 20px -8px var(--c);
	}
	.actions {
		display: flex;
		opacity: 0;
		transition: opacity 0.2s;
	}
	.cat:hover .actions,
	.cat:focus-within .actions {
		opacity: 1;
	}
	.pop {
		position: absolute;
		top: 54px;
		right: 12px;
		z-index: 20;
		display: grid;
		grid-template-columns: repeat(4, 24px);
		gap: 8px;
		padding: 12px;
		background: var(--surface-solid);
		box-shadow: var(--shadow-lg);
		transform-origin: top right;
	}
	.name {
		position: relative;
		margin-top: auto;
		padding-top: 18px;
		font-family: var(--font-display);
		font-size: 30px;
		font-weight: 400;
		line-height: 1.05;
		letter-spacing: -0.01em;
		word-break: break-word;
	}
	.rename {
		margin-top: auto;
		height: 40px;
		font-size: 16px;
	}
	.stats {
		position: relative;
		display: flex;
		gap: 14px;
		margin: 10px 0 10px;
		font-size: 12.5px;
		color: var(--text-3);
	}
	.stats strong {
		color: var(--text);
		font-weight: 600;
	}
	.pct {
		margin-left: auto;
		color: var(--text-2);
		font-weight: 600;
	}
	.bar {
		position: relative;
		height: 4px;
	}
	.to-tasks {
		align-self: center;
	}
	@media (hover: none) {
		.actions {
			opacity: 1;
		}
	}
	@media (max-width: 640px) {
		.preview {
			display: none;
		}
		.c-row {
			flex-direction: column;
		}
	}
</style>
