<script>
	import { theme, font } from '../stores.js';
	export let show = false;
</script>

{#if show}
	<div class="popup show" on:click|self={() => (show = false)} role="dialog">
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
					<button class:active={$font === 'Inter'} on:click={() => ($font = 'Inter')}>Inter</button>
					<button class:active={$font === 'Roboto'} on:click={() => ($font = 'Roboto')}>Roboto</button>
					<button class:active={$font === 'Arial'} on:click={() => ($font = 'Arial')}>Arial</button>
				</div>
			</div>
			<button on:click={() => (show = false)}>Save Changes</button>
		</div>
	</div>
{/if}