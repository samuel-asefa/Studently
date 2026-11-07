<script>
	import { weekdayShort, todayISO, formatHours, shortDate } from '$lib/utils/date.js';

	let { data = [], height = 160 } = $props();

	const maxMinutes = $derived(Math.max(60, ...data.map((d) => d.minutes)));
	const top = $derived(Math.ceil(maxMinutes / 60) * 60);
	const todayIso = todayISO();
</script>

<div class="chart" style:height="{height}px">
	<div class="lines" aria-hidden="true">
		{#each [1, 0.5, 0] as f}
			<span style:bottom="{f * 100}%"><em class="mono">{formatHours((top * f) / 60)}</em></span>
		{/each}
	</div>
	<div class="bars">
		{#each data as d, i}
			<div class="col" class:today={d.date === todayIso}>
				<div class="track">
					<span
						class="fill"
						class:zero={d.minutes === 0}
						style:height="{Math.max(d.minutes ? 4 : 0, (d.minutes / top) * 100)}%"
						style:--delay="{i * 60}ms"
					>
						<span class="tip mono">{formatHours(d.minutes / 60)} · {shortDate(d.date)}</span>
					</span>
				</div>
				<span class="lbl">{d.date === todayIso ? 'Today' : weekdayShort(d.date)}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.chart {
		position: relative;
		padding-left: 38px;
		padding-bottom: 24px;
	}
	.lines {
		position: absolute;
		inset: 0 0 24px 38px;
	}
	.lines span {
		position: absolute;
		left: 0;
		right: 0;
		border-top: 1px dashed var(--border);
	}
	.lines em {
		position: absolute;
		left: -38px;
		top: -8px;
		font-size: 10.5px;
		font-style: normal;
		color: var(--text-3);
	}
	.bars {
		position: relative;
		display: grid;
		grid-template-columns: repeat(var(--n, 7), 1fr);
		gap: 10px;
		height: 100%;
	}
	.col {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
	}
	.track {
		position: relative;
		flex: 1;
		width: 100%;
		max-width: 36px;
		display: flex;
		align-items: flex-end;
	}
	.fill {
		position: relative;
		display: block;
		width: 100%;
		border-radius: 8px 8px 4px 4px;
		background: linear-gradient(to top, oklch(0.6 0.16 var(--accent-h) / 0.55), oklch(0.72 0.16 var(--accent-h) / 0.75));
		transform-origin: bottom;
		animation: grow 0.9s var(--ease-out) both;
		animation-delay: var(--delay);
		transition: filter 0.2s;
	}
	.today .fill {
		background: linear-gradient(to top, var(--btn-a), var(--accent-2));
		box-shadow: 0 8px 24px -8px var(--accent-glow);
	}
	.fill:hover {
		filter: brightness(1.2);
	}
	.tip {
		position: absolute;
		left: 50%;
		bottom: calc(100% + 8px);
		transform: translate(-50%, 4px);
		padding: 4px 8px;
		border-radius: 8px;
		font-size: 11px;
		white-space: nowrap;
		background: var(--surface-solid);
		border: 1px solid var(--border-2);
		box-shadow: var(--shadow);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s, transform 0.2s var(--ease-out);
		z-index: 2;
	}
	.col:hover .tip {
		opacity: 1;
		transform: translate(-50%, 0);
	}
	.zero .tip {
		bottom: 8px;
	}
	.lbl {
		position: absolute;
		bottom: -22px;
		font-size: 11px;
		color: var(--text-3);
		white-space: nowrap;
	}
	.today .lbl {
		color: var(--accent);
		font-weight: 600;
	}
	@keyframes grow {
		from {
			transform: scaleY(0);
		}
	}
</style>
