<script>
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Check from '../ui/Check.svelte';
	import Ring from '../ui/Ring.svelte';
	import { tasks, categories } from '$lib/stores.js';
	import { addTask, toggleTask, updateTask, deleteTask, clearCompleted } from '$lib/actions.js';
	import { go } from '$lib/ui.js';
	import { autofocus } from '$lib/utils/use.js';
	import { Plus, Search, Trash, Pencil, X, Inbox, Tag, ListChecks, CornerDownLeft } from '$lib/icons.js';

	let text = $state('');
	let category = $state(Object.keys($categories)[0] ?? '');
	let filter = $state('all');
	let query = $state('');
	let editingId = $state(null);
	let editText = $state('');

	const INBOX = '__inbox__';
	const catNames = $derived(Object.keys($categories));
	const done = $derived($tasks.filter((t) => t.done).length);

	const visible = $derived(
		$tasks.filter(
			(t) =>
				(filter === 'all' || (filter === 'done' ? t.done : !t.done)) &&
				(!query.trim() || t.name.toLowerCase().includes(query.trim().toLowerCase()))
		)
	);

	const groups = $derived.by(() => {
		const map = new Map(catNames.map((c) => [c, []]));
		map.set(INBOX, []);
		for (const t of visible) (map.has(t.category) ? map.get(t.category) : map.get(INBOX)).push(t);
		const filtering = filter !== 'all' || query.trim();
		return [...map.entries()]
			.map(([name, list]) => {
				const all = $tasks.filter((t) => (name === INBOX ? !catNames.includes(t.category) : t.category === name));
				return {
					name,
					list: [...list].sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt),
					total: all.length,
					doneCount: all.filter((t) => t.done).length
				};
			})
			.filter((g) => (g.name === INBOX ? g.list.length > 0 : !filtering || g.list.length > 0));
	});

	$effect(() => {
		if (category && !catNames.includes(category)) category = catNames[0] ?? '';
	});

	function add(e) {
		e?.preventDefault();
		let name = text;
		let cat = category;
		const m = name.match(/(^|\s)#([\p{L}\p{N}_-]+)/u);
		if (m) {
			const found = catNames.find((c) => c.toLowerCase().replace(/\s+/g, '') === m[2].toLowerCase());
			if (found) {
				cat = found;
				name = name.replace(m[0], ' ');
			}
		}
		if (addTask(name, cat)) text = '';
	}

	const inline = $state({});
	function addInline(e, group) {
		e.preventDefault();
		if (addTask(inline[group] ?? '', group === INBOX ? '' : group)) inline[group] = '';
	}

	function startEdit(t) {
		editingId = t.id;
		editText = t.name;
	}
	function commitEdit() {
		if (editingId && editText.trim()) updateTask(editingId, { name: editText.trim() });
		editingId = null;
	}
	function editKey(e) {
		if (e.key === 'Enter') commitEdit();
		if (e.key === 'Escape') editingId = null;
	}
</script>

<div class="page stagger">
	<header class="page-head">
		<div>
			<span class="eyebrow">Quick to-dos</span>
			<h1 class="page-title">Tasks</h1>
			<p class="page-sub">The small stuff, out of your head and into a list. Check things off for a little burst of joy.</p>
		</div>
		<div class="progress card">
			<Ring value={$tasks.length ? done / $tasks.length : 0} size={52} stroke={5}>
				<span class="num pct">{$tasks.length ? Math.round((done / $tasks.length) * 100) : 0}%</span>
			</Ring>
			<div>
				<div class="p-big num">{done} <span class="faint">of {$tasks.length}</span></div>
				<div class="faint p-sub">tasks complete</div>
			</div>
		</div>
	</header>

	<section class="add card card-pad">
		<form class="add-row" onsubmit={add}>
			<div class="add-input">
				<Plus size={18} />
				<input class="input" bind:value={text} placeholder="What needs doing? Use #category to file it" aria-label="New task" />
			</div>
			<button class="btn btn-primary" type="submit" disabled={!text.trim()}>
				Add task <span class="kbd enter"><CornerDownLeft size={11} /></span>
			</button>
		</form>
		<div class="cats" role="radiogroup" aria-label="Category">
			{#each catNames as c}
				<button
					type="button"
					class="cat"
					class:on={category === c}
					style:--c={$categories[c]}
					role="radio"
					aria-checked={category === c}
					onclick={() => (category = c)}
				>
					<span class="dot" style:background={$categories[c]}></span>{c}
				</button>
			{/each}
			<button type="button" class="cat" class:on={category === ''} role="radio" aria-checked={category === ''} onclick={() => (category = '')}>
				<Inbox size={12} /> Inbox
			</button>
			<button type="button" class="cat ghost" onclick={() => go('categories')}><Tag size={12} /> Manage</button>
		</div>
	</section>

	<section class="toolbar">
		<div class="seg">
			<button class:on={filter === 'all'} onclick={() => (filter = 'all')}>All</button>
			<button class:on={filter === 'active'} onclick={() => (filter = 'active')}>Active</button>
			<button class:on={filter === 'done'} onclick={() => (filter = 'done')}>Done</button>
		</div>
		<div class="search">
			<Search size={15} />
			<input class="input" bind:value={query} placeholder="Search tasks" aria-label="Search tasks" />
			{#if query}<button class="clear" onclick={() => (query = '')} aria-label="Clear search"><X size={14} /></button>{/if}
		</div>
		<button class="btn btn-ghost btn-sm" onclick={clearCompleted} disabled={!done}>
			<Trash size={14} /> Clear completed
		</button>
	</section>

	{#if groups.length}
		<section class="board">
			{#each groups as g (g.name)}
				{@const color = g.name === INBOX ? 'var(--text-3)' : $categories[g.name]}
				<article class="group card" style:--c={color} animate:flip={{ duration: 400, easing: cubicOut }} in:fade>
					<header class="g-head">
						<span class="g-dot"></span>
						<h2>{g.name === INBOX ? 'Inbox' : g.name}</h2>
						<span class="g-count num">{g.doneCount}/{g.total}</span>
					</header>
					<div class="g-bar"><span style:width="{g.total ? (g.doneCount / g.total) * 100 : 0}%"></span></div>
					<ul class="g-list">
						{#each g.list as t (t.id)}
							<li class:done={t.done} animate:flip={{ duration: 350, easing: cubicOut }} in:slide={{ duration: 250 }} out:slide={{ duration: 200 }}>
								<Check checked={t.done} color={g.name === INBOX ? null : color} label={t.done ? `Mark ${t.name} not done` : `Complete ${t.name}`} onchange={(el) => toggleTask(t.id, el)} />
								{#if editingId === t.id}
									<input class="input edit" bind:value={editText} onkeydown={editKey} onblur={commitEdit} use:autofocus aria-label="Edit task" />
								{:else}
									<span class="t-name" role="button" tabindex="0" ondblclick={() => startEdit(t)} onkeydown={(e) => e.key === 'Enter' && startEdit(t)}>{t.name}</span>
									<span class="t-actions">
										<button class="btn btn-ghost btn-icon btn-sm" onclick={() => startEdit(t)} aria-label="Edit {t.name}"><Pencil size={13} /></button>
										<button class="btn btn-ghost btn-danger btn-icon btn-sm" onclick={() => deleteTask(t.id)} aria-label="Delete {t.name}"><Trash size={13} /></button>
									</span>
								{/if}
							</li>
						{:else}
							<li class="none">Nothing here yet.</li>
						{/each}
					</ul>
					<form class="g-add" onsubmit={(e) => addInline(e, g.name)}>
						<Plus size={14} />
						<input bind:value={inline[g.name]} placeholder="Add to {g.name === INBOX ? 'Inbox' : g.name}" aria-label="Add task to {g.name === INBOX ? 'Inbox' : g.name}" />
					</form>
				</article>
			{/each}
		</section>
	{:else}
		<div class="card empty">
			<span class="empty-ico"><ListChecks size={22} /></span>
			<h3>{query ? 'No matches' : filter === 'done' ? 'Nothing completed yet' : 'No tasks'}</h3>
			<p>{query ? `Nothing matches “${query}”.` : 'Add one above to get going.'}</p>
		</div>
	{/if}
</div>

<style>
	.progress {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 20px 12px 12px;
		border-radius: 18px;
	}
	.pct {
		font-size: 12px;
		font-weight: 600;
	}
	.p-big {
		font-size: 20px;
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}
	.p-big .faint {
		font-size: 14px;
		font-weight: 500;
	}
	.p-sub {
		font-size: 12px;
	}

	.add {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.add-row {
		display: flex;
		gap: 10px;
	}
	.add-input {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
	}
	.add-input :global(svg) {
		position: absolute;
		left: 16px;
		color: var(--accent);
		pointer-events: none;
	}
	.add-input .input {
		height: 50px;
		padding-left: 46px;
		font-size: 15px;
		border-radius: 14px;
	}
	.add-row .btn {
		--h: 50px;
		border-radius: 14px;
	}
	.enter {
		height: 18px;
		min-width: 18px;
		padding: 0 3px;
		background: oklch(1 0 0 / 0.18);
		border-color: oklch(1 0 0 / 0.2);
		color: #fff;
		box-shadow: none;
	}
	.cats {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.cat {
		--c: var(--text-3);
		display: inline-flex;
		align-items: center;
		gap: 7px;
		height: 30px;
		padding: 0 12px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: 520;
		color: var(--text-2);
		border: 1px solid var(--border);
		background: var(--surface-2);
		transition: all 0.2s;
	}
	.cat:hover {
		border-color: var(--border-2);
		color: var(--text);
	}
	.cat.on {
		color: var(--text);
		border-color: color-mix(in oklch, var(--c) 60%, transparent);
		background: color-mix(in oklch, var(--c) 16%, transparent);
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--c) 12%, transparent);
	}
	.cat.ghost {
		background: transparent;
		border-style: dashed;
		color: var(--text-3);
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.search {
		position: relative;
		flex: 1;
		min-width: 180px;
		max-width: 340px;
		display: flex;
		align-items: center;
	}
	.search > :global(svg) {
		position: absolute;
		left: 12px;
		color: var(--text-3);
		pointer-events: none;
	}
	.search .input {
		height: 38px;
		padding-left: 36px;
	}
	.clear {
		position: absolute;
		right: 6px;
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		border-radius: 8px;
		color: var(--text-3);
	}
	.clear:hover {
		color: var(--text);
		background: var(--surface-2);
	}
	.toolbar > .btn {
		margin-left: auto;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 310px), 1fr));
		gap: 16px;
		align-items: start;
	}
	.group {
		padding: 18px 18px 10px;
		overflow: hidden;
	}
	.group::before {
		content: '';
		position: absolute;
		inset: 0 0 auto 0;
		height: 90px;
		background: radial-gradient(ellipse 80% 100% at 10% 0%, color-mix(in oklch, var(--c) 18%, transparent), transparent);
		pointer-events: none;
	}
	.g-head {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.g-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--c);
		box-shadow: 0 0 0 4px color-mix(in oklch, var(--c) 20%, transparent);
	}
	.g-head h2 {
		flex: 1;
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}
	.g-count {
		font-size: 12px;
		color: var(--text-3);
	}
	.g-bar {
		position: relative;
		height: 3px;
		margin: 12px 0 6px;
		border-radius: 3px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.g-bar span {
		position: absolute;
		inset: 0 auto 0 0;
		border-radius: inherit;
		background: var(--c);
		transition: width 0.6s var(--ease-out);
	}
	.g-list li {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 46px;
		border-bottom: 1px solid var(--border);
	}
	.t-name {
		flex: 1;
		min-width: 0;
		font-size: 14px;
		cursor: text;
		word-break: break-word;
		padding: 10px 0;
		transition: color 0.3s;
	}
	.done .t-name {
		color: var(--text-3);
		text-decoration: line-through;
		text-decoration-color: var(--text-3);
	}
	.t-actions {
		display: flex;
		opacity: 0;
		transition: opacity 0.2s;
	}
	li:hover .t-actions,
	li:focus-within .t-actions {
		opacity: 1;
	}
	.edit {
		height: 34px;
		flex: 1;
	}
	.none {
		justify-content: center;
		font-size: 13px;
		color: var(--text-3);
	}
	.g-add {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 44px;
		color: var(--text-3);
		padding-left: 4px;
	}
	.g-add input {
		flex: 1;
		height: 100%;
		background: none;
		border: 0;
		outline: none;
		font-size: 13.5px;
	}
	.g-add input::placeholder {
		color: var(--text-3);
	}
	.g-add:focus-within {
		color: var(--accent);
	}
	@media (hover: none) {
		.t-actions {
			opacity: 1;
		}
	}
	@media (max-width: 640px) {
		.add-row {
			flex-direction: column;
		}
		.search {
			max-width: none;
			order: 3;
			flex-basis: 100%;
		}
	}
</style>
