<script>
	import { confirmState } from '$lib/ui.js';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { autofocus } from '$lib/utils/use.js';

	function close(value) {
		$confirmState?.resolve(value);
		confirmState.set(null);
	}

	function onkeydown(e) {
		if (!$confirmState) return;
		if (e.key === 'Escape') {
			e.stopPropagation();
			close(false);
		}
	}
</script>

<svelte:window {onkeydown} />

{#if $confirmState}
	{@const s = $confirmState}
	<div class="overlay" transition:fade={{ duration: 160 }} onclick={() => close(false)} role="presentation">
		<div
			class="dialog card"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="confirm-title"
			tabindex="-1"
			transition:scale={{ start: 0.94, duration: 260, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				e.stopPropagation();
				if (e.key === 'Escape') close(false);
			}}
		>
			<span class="rule" class:danger={s.danger}></span>
			<h2 id="confirm-title">{s.title}</h2>
			{#if s.message}<p>{s.message}</p>{/if}
			<div class="actions">
				<button class="btn btn-soft" onclick={() => close(false)}>Cancel</button>
				<button
					class="btn {s.danger ? 'btn-danger-solid' : 'btn-primary'}"
					onclick={() => close(true)}
					use:autofocus
				>
					{s.confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 3000;
		display: grid;
		place-items: center;
		padding: 16px;
		background: oklch(0.1 0.02 var(--accent-h) / 0.55);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}
	.dialog {
		width: min(420px, 100%);
		padding: 26px;
		background: var(--surface-solid);
		box-shadow: var(--shadow-lg);
	}
	.dialog {
		overflow: hidden;
	}
	.rule {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--btn-a), var(--btn-b));
	}
	.rule.danger {
		background: var(--danger);
	}
	h2 {
		font-size: 18px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}
	p {
		margin-top: 6px;
		color: var(--text-2);
		font-size: 14px;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 24px;
	}
</style>
