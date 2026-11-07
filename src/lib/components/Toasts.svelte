<script>
	import { toasts, dismissToast } from '$lib/ui.js';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { backOut } from 'svelte/easing';
	import { X } from '$lib/icons.js';
</script>

<div class="toasts" aria-live="polite" aria-atomic="false">
	{#each $toasts as t (t.id)}
		<div
			class="toast {t.tone}"
			role="status"
			animate:flip={{ duration: 300 }}
			in:fly={{ y: 28, duration: 500, easing: backOut }}
			out:fly={{ y: 10, duration: 200 }}
		>
			<span class="dot-ico" aria-hidden="true"></span>
			<span class="msg">{t.message}</span>
			{#if t.action}
				<button
					class="act"
					onclick={() => {
						t.action.run();
						dismissToast(t.id);
					}}
				>
					{t.action.label}
				</button>
			{/if}
			<button class="x" onclick={() => dismissToast(t.id)} aria-label="Dismiss">
				<X size={14} weight="bold" />
			</button>
		</div>
	{/each}
</div>

<style>
	.toasts {
		position: fixed;
		left: 50%;
		bottom: 24px;
		transform: translateX(-50%);
		z-index: 2000;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		pointer-events: none;
		width: min(480px, calc(100vw - 32px));
	}
	.toast {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 8px 8px 14px;
		min-height: 48px;
		max-width: 100%;
		border-radius: 16px;
		background: var(--surface-solid);
		border: 1px solid var(--border-2);
		box-shadow: var(--shadow-lg);
		font-size: 14px;
		font-weight: 500;
	}
	.dot-ico {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.success .dot-ico {
		background: var(--success);
		box-shadow: 0 0 0 3px oklch(0.74 0.16 155 / 0.18);
	}
	.danger .dot-ico {
		background: var(--danger);
		box-shadow: 0 0 0 3px oklch(0.66 0.21 25 / 0.18);
	}
	.msg {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.act {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 30px;
		padding: 0 11px;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 600;
		color: var(--accent-ink);
		background: var(--accent-soft);
		transition: filter 0.2s;
	}
	.act:hover {
		filter: brightness(1.15);
	}
	.x {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 10px;
		color: var(--text-3);
	}
	.x:hover {
		color: var(--text);
		background: var(--surface-2);
	}
	@media (max-width: 900px) {
		.toasts {
			bottom: calc(92px + env(safe-area-inset-bottom));
		}
	}
</style>
