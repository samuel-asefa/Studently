<script>
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { signOut } from 'firebase/auth';
	import { auth } from '$lib/firebase.js';
	import { paletteOpen, paletteSeed, go, settingsOpen, toast, confirm, focusTarget, templatesOpen, libraryOpen } from '$lib/ui.js';
	import { TEMPLATES } from '$lib/content/templates.js';
	import { TECHNIQUES } from '$lib/content/techniques.js';
	import { tasks, deadlines, categories, user, replaceAll, leaveGuest } from '$lib/stores.js';
	import { addTask, addDeadline } from '$lib/actions.js';
	import { parseQuick, describeParse } from '$lib/utils/parse.js';
	import { relativeDay, relativeLower, toISO, addDays, startOfDay } from '$lib/utils/date.js';
	import { NAV } from '$lib/constants.js';
	import { toggleTheme } from '$lib/theme.js';
	import { start as startTimer } from '$lib/focus.js';
	import { demoData } from '$lib/demo.js';
	import { autofocus } from '$lib/utils/use.js';
	import {
		Search, Plus, CalendarClock, Play, SunMoon, Settings, Layers, BookOpen, Download, LogOut, CornerDownLeft, ListChecks, Check
	} from '$lib/icons.js';

	let query = $state('');
	let index = $state(0);
	let listEl = $state();

	$effect(() => {
		if ($paletteOpen) {
			query = $paletteSeed;
			index = 0;
		}
	});

	const close = () => paletteOpen.set(false);
	const catNames = $derived(Object.keys($categories));
	const parsed = $derived(parseQuick(query, { categories: catNames }));

	function match(text, q) {
		const t = text.toLowerCase();
		const i = t.indexOf(q);
		if (i >= 0) return 100 - i;
		let j = 0;
		for (const ch of t) if (ch === q[j]) j++;
		return j === q.length ? 10 : -1;
	}

	const items = $derived.by(() => {
		const q = query.trim().toLowerCase();
		/** @type {any[]} */
		const out = [];

		if (q) {
			const tag = query.match(/(^|\s)#([\p{L}\p{N}_-]+)/u);
			const cat = tag ? catNames.find((c) => c.toLowerCase().replace(/\s+/g, '') === tag[2].toLowerCase()) : null;
			const taskName = cat ? query.replace(tag[0], ' ').trim() : query.trim();
			out.push({
				group: 'Create',
				id: 'add-task',
				icon: Plus,
				label: `Add task “${taskName}”`,
				hint: cat ? `in ${cat}` : 'to Inbox',
				run: () => {
					addTask(taskName, cat ?? '');
					toast(`Task added${cat ? ` to ${cat}` : ''}`, { tone: 'success' });
				}
			});
			if (parsed.name) {
				out.push({
					group: 'Create',
					id: 'add-deadline',
					icon: CalendarClock,
					label: `Add deadline “${parsed.name}”`,
					chips: describeParse(parsed),
					run: () => {
						const d = addDeadline({
							name: parsed.name,
							type: parsed.type ?? 'assignment',
							dueDate: parsed.dueDate ?? toISO(addDays(startOfDay(), 7)),
							estimatedHours: parsed.hours ?? 2,
							customWeight: parsed.weight ?? 1
						});
						if (d) {
							toast(`Deadline added, due ${relativeLower(d.dueDate)}`, { tone: 'success' });
							go('planner');
						}
					}
				});
			}
		}

		/** @type {any[]} */
		const commands = [
			...NAV.map((n) => ({ group: 'Go to', id: `nav-${n.id}`, icon: n.icon, label: n.label, kbd: n.key, run: () => go(n.id) })),
			{ group: 'Actions', id: 'focus', icon: Play, label: 'Start a focus session', run: () => (go('focus'), startTimer()) },
			{ group: 'Actions', id: 'templates', icon: Layers, label: `Plan from a template (${TEMPLATES.length})`, run: () => (go('planner'), templatesOpen.set(true)) },
			{ group: 'Actions', id: 'techniques', icon: BookOpen, label: `Browse study techniques (${TECHNIQUES.length})`, run: () => libraryOpen.set(true) },
			{ group: 'Actions', id: 'theme', icon: SunMoon, label: 'Toggle light / dark mode', kbd: 'T', run: () => toggleTheme() },
			{ group: 'Actions', id: 'settings', icon: Settings, label: 'Open settings', kbd: ',', run: () => settingsOpen.set(true) },
			{
				group: 'Actions',
				id: 'demo',
				icon: Download,
				label: 'Load a sample semester',
				run: async () => {
					const empty = !$tasks.length && !$deadlines.length;
					if (!empty && !(await confirm({ title: 'Replace your data with a sample?', message: 'Your current tasks and deadlines will be swapped for a demo semester.', confirmLabel: 'Load sample', danger: true }))) return;
					replaceAll(demoData());
					go('today');
					toast('Sample semester loaded.', { tone: 'success' });
				}
			},
			{
				group: 'Actions',
				id: 'signout',
				icon: LogOut,
				label: $user ? 'Sign out' : 'Leave guest mode',
				run: () => ($user ? signOut(auth) : leaveGuest())
			}
		];

		// Filter but keep order, so each group stays together.
		const scored = q ? commands.filter((c) => match(c.label, q) >= 0) : commands;
		// "plan" should jump to Planner, not create a task called "plan".
		const commandFirst = q && scored.some((c) => ` ${c.label.toLowerCase()}`.includes(` ${q}`));

		if (q) {
			const found = [
				...$deadlines.filter((d) => !d.completed).map((d) => ({ d, s: match(d.name, q) })).filter((x) => x.s > 10).slice(0, 4).map(({ d }) => ({
					group: 'Deadlines',
					id: `d-${d.id}`,
					icon: CalendarClock,
					label: d.name,
					hint: relativeDay(d.dueDate),
					run: () => (focusTarget.set(d.id), go('focus'))
				})),
				...$tasks.map((t) => ({ t, s: match(t.name, q) })).filter((x) => x.s > 10).slice(0, 4).map(({ t }) => ({
					group: 'Tasks',
					id: `t-${t.id}`,
					icon: t.done ? Check : ListChecks,
					label: t.name,
					hint: t.category || 'Inbox',
					run: () => go('tasks')
				}))
			];
			return commandFirst ? [...scored, ...out, ...found] : [...out, ...found, ...scored];
		}
		return scored;
	});

	$effect(() => {
		if (index >= items.length) index = Math.max(0, items.length - 1);
	});

	$effect(() => {
		listEl?.querySelector(`[data-i="${index}"]`)?.scrollIntoView({ block: 'nearest' });
	});

	function run(item) {
		close();
		item?.run();
	}

	function onkeydown(e) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			index = (index + 1) % Math.max(1, items.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			index = (index - 1 + items.length) % Math.max(1, items.length);
		} else if (e.key === 'Enter' && !e.isComposing) {
			e.preventDefault();
			run(items[index]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}
</script>

{#if $paletteOpen}
	<div class="overlay" transition:fade={{ duration: 150 }} onclick={close} role="presentation">
		<div
			class="palette card"
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
			tabindex="-1"
			transition:scale={{ start: 0.96, duration: 220, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				e.stopPropagation();
				if (e.key === 'Escape') close();
			}}
		>
			<div class="search">
				<Search size={18} />
				<input
					bind:value={query}
					{onkeydown}
					use:autofocus
					placeholder="Search, jump, or add “Essay fri 3h !!”"
					aria-label="Command"
					autocomplete="off"
					spellcheck="false"
					oninput={() => (index = 0)}
				/>
				<span class="kbd">esc</span>
			</div>

			<div class="results" bind:this={listEl} role="listbox">
				{#each items as it, i (it.id)}
					{#if i === 0 || items[i - 1].group !== it.group}
						<div class="group">{it.group}</div>
					{/if}
					<button
						class="item"
						class:active={i === index}
						data-i={i}
						role="option"
						aria-selected={i === index}
						onmousemove={() => (index = i)}
						onclick={() => run(it)}
					>
						<span class="ico"><it.icon size={16} /></span>
						<span class="label">{it.label}</span>
						{#if it.chips?.length}
							<span class="chips">
								{#each it.chips as c}<span class="chip {c.kind === 'priority' ? c.tone || 'accent' : 'accent'}">{c.label}</span>{/each}
							</span>
						{/if}
						{#if it.hint}<span class="hint">{it.hint}</span>{/if}
						{#if it.kbd}<span class="kbd">{it.kbd}</span>{/if}
						<span class="enter"><CornerDownLeft size={14} weight="bold" /></span>
					</button>
				{:else}
					<div class="nothing">No matches.</div>
				{/each}
			</div>

			<div class="foot">
				<span><span class="kbd">↑</span><span class="kbd">↓</span> navigate</span>
				<span><span class="kbd">↵</span> select</span>
				<span class="tip">Tip: <code>#study</code> files a task, <code>fri 3h !!</code> makes a deadline</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1500;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: min(14vh, 120px) 16px 16px;
		background: oklch(0.1 0.02 var(--accent-h) / 0.5);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}
	.palette {
		width: min(640px, 100%);
		max-height: min(560px, 76vh);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: color-mix(in oklch, var(--surface-solid) 92%, transparent);
		box-shadow: var(--shadow-lg), 0 0 0 1px var(--border-2), 0 30px 120px -40px var(--accent-glow);
		border-radius: 22px;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 18px;
		height: 60px;
		border-bottom: 1px solid var(--border);
		color: var(--text-3);
	}
	.search input {
		flex: 1;
		height: 100%;
		background: none;
		border: 0;
		outline: none;
		font-size: 16px;
		color: var(--text);
	}
	.search input::placeholder {
		color: var(--text-3);
	}
	.results {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
	}
	.group {
		padding: 10px 10px 6px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
	}
	.item {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		min-height: 44px;
		padding: 6px 10px;
		border-radius: 12px;
		text-align: left;
		font-size: 14px;
		color: var(--text-2);
	}
	.item.active {
		background: var(--accent-soft);
		color: var(--text);
	}
	.ico {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 9px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		flex-shrink: 0;
	}
	.item.active .ico {
		color: var(--accent);
		border-color: oklch(0.74 0.17 var(--accent-h) / 0.3);
	}
	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.chips {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}
	.chips .chip {
		height: 20px;
		font-size: 11px;
		padding: 0 7px;
	}
	.hint {
		font-size: 12px;
		color: var(--text-3);
		white-space: nowrap;
	}
	.enter {
		display: grid;
		color: var(--text-3);
		opacity: 0;
	}
	.item.active .enter {
		opacity: 1;
	}
	.nothing {
		padding: 30px;
		text-align: center;
		color: var(--text-3);
		font-size: 14px;
	}
	.foot {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 10px 16px;
		border-top: 1px solid var(--border);
		font-size: 12px;
		color: var(--text-3);
	}
	.foot > span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.tip {
		margin-left: auto;
	}
	code {
		font-family: var(--font-mono);
		font-size: 11px;
		padding: 1px 5px;
		border-radius: 5px;
		background: var(--surface-2);
		color: var(--text-2);
	}
	@media (max-width: 640px) {
		.overlay {
			padding-top: 12px;
		}
		.tip,
		.chips {
			display: none;
		}
	}
</style>
