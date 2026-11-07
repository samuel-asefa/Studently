<script>
	import { weekdayShort, shortDate, formatHours, parseISO } from '$lib/utils/date.js';
	import { seriesColor } from '$lib/constants.js';

	let { days = [], budget = 4, selected = $bindable(0), max = 14, doneToday = 0 } = $props();

	const shown = $derived(days.slice(0, Math.max(7, Math.min(max, days.length))));
	const top = $derived(Math.max(budget, doneToday + (shown[0]?.total ?? 0), ...shown.map((d) => d.total)) * 1.08);
	const H = 150;
</script>

<div class="sched" style:--n={shown.length}>
	<div class="cap" style:bottom="{(budget / top) * H + 30}px">
		<span class="mono">{formatHours(budget)} / day</span>
	</div>
	<div class="cols" role="listbox" aria-label="Days">
		{#each shown as day, i (day.date)}
			{@const d = parseISO(day.date)}
			<button
				class="col"
				class:sel={selected === i}
				class:weekend={d.getDay() === 0 || d.getDay() === 6}
				class:full={day.total >= budget - 0.01}
				role="option"
				aria-selected={selected === i}
				aria-label="{shortDate(day.date)}: {formatHours(day.total)} planned"
				onclick={() => (selected = i)}
			>
				<div class="stack" style:height="{H}px">
					{#if i === 0 && doneToday > 0}
						<span class="seg done" style:height="{(Math.min(doneToday, top) / top) * H}px" title="Done today: {formatHours(doneToday)}"></span>
					{/if}
					{#each day.items as item (item.id)}
						<span
							class="seg"
							style:height="{(item.hours / top) * H}px"
							style:background={seriesColor(item.id)}
							style:--delay="{i * 35}ms"
							title="{item.name}: {formatHours(item.hours)}"
						></span>
					{/each}
					{#if !day.items.length && !(i === 0 && doneToday > 0)}<span class="none"></span>{/if}
				</div>
				<span class="lbl">
					<span class="wd">{i === 0 ? 'Today' : weekdayShort(day.date)}</span>
					<span class="dn mono">{d.getDate()}</span>
				</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.sched {
		position: relative;
		overflow-x: auto;
		overflow-y: hidden;
		padding-top: 8px;
		margin: 0 -6px;
		scrollbar-width: thin;
	}
	.cap {
		position: absolute;
		left: 6px;
		right: 6px;
		border-top: 1.5px dashed var(--border-2);
		pointer-events: none;
		z-index: 1;
		min-width: calc(var(--n) * 44px);
	}
	.cap span {
		position: absolute;
		right: 0;
		top: -19px;
		font-size: 10.5px;
		color: var(--text-3);
		padding: 0 4px;
		background: var(--surface-solid);
		border-radius: 4px;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(var(--n), minmax(40px, 1fr));
		gap: 6px;
		padding: 0 6px;
		min-width: calc(var(--n) * 46px);
	}
	.col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 6px 0 4px;
		border-radius: 12px;
		transition: background 0.2s;
	}
	.col:hover {
		background: var(--surface-2);
	}
	.col.sel {
		background: var(--accent-soft);
	}
	.stack {
		display: flex;
		flex-direction: column-reverse;
		justify-content: flex-start;
		width: 62%;
		max-width: 30px;
	}
	.seg {
		display: block;
		width: 100%;
		border-radius: 6px;
		min-height: 4px;
		border-top: 2px solid transparent;
		background-clip: padding-box !important;
		transform-origin: bottom;
		animation: grow 0.7s var(--ease-out) both;
		animation-delay: var(--delay);
		transition: filter 0.2s;
	}
	.col:hover .seg {
		filter: brightness(1.12);
	}
	.seg.done {
		background: repeating-linear-gradient(-45deg, var(--surface-3) 0 4px, transparent 4px 8px) !important;
		box-shadow: inset 0 0 0 1px var(--border-2);
		animation: none;
	}
	.none {
		display: block;
		height: 3px;
		border-radius: 3px;
		background: var(--surface-3);
	}
	.lbl {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.2;
	}
	.wd {
		font-size: 10.5px;
		color: var(--text-3);
		white-space: nowrap;
	}
	.dn {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-2);
	}
	.weekend .dn {
		color: var(--text-3);
	}
	.sel .wd,
	.sel .dn {
		color: var(--accent-ink);
	}
	@keyframes grow {
		from {
			transform: scaleY(0);
		}
	}
</style>
