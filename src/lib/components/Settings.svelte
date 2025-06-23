<script>
    // Script content remains the same
	import { theme, font } from '../stores.js';
	export let show = false;
</script>

{#if show}
	<div class="popup" on:click|self={() => (show = false)} role="dialog">
		<div class="popup-content">
			<h2>Settings</h2>
			<div class="settings-group">
				<label for="themeSelect">Theme</label>
				<select id="themeSelect" bind:value={$theme}>
					<option value="light">Light Mode</option>
					<option value="dark">Dark Mode</option>
				</select>
			</div>
			<div class="settings-group">
				<label>Font Style</label>
				<div class="font-buttons">
					<button class="font-btn" class:active={$font === 'Inter'} on:click={() => ($font = 'Inter')}>Inter</button>
					<button class="font-btn" class:active={$font === 'Roboto'} on:click={() => ($font = 'Roboto')}>Roboto</button>
					<button class="font-btn" class:active={$font === 'Arial'} on:click={() => ($font = 'Arial')}>Arial</button>
				</div>
			</div>
			<button class="save-btn" on:click={() => (show = false)}>Save Changes</button>
		</div>
	</div>
{/if}

<style>
	.popup {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: 1000;
		justify-content: center;
		align-items: center;
	}

	.popup:global(.show) {
		display: flex;
	}

	.popup-content {
		background: var(--surface);
		padding: 2rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		max-width: 450px;
		width: 100%;
		position: relative;
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		text-align: left;
	}

	.settings-group {
		margin-bottom: 1.5rem;
		text-align: left;
	}

	.settings-group label {
		display: block;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: var(--text-secondary);
	}

	.font-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.font-btn {
		flex: 1;
		min-width: 110px;
		padding: 0.5rem 1rem;
		color: var(--text-primary);
		background: var(--surface-hover);
		border: 1px solid var(--border);
	}

	.font-btn:hover {
		background: var(--primary-light);
		color: var(--primary);
        transform: translateY(0); /* Override global button hover */
	}

	.font-btn.active {
		background: var(--primary);
		color: white;
		border-color: var(--primary);
	}
    
    .save-btn {
        width: 100%;
    }
</style>