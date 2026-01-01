<script>
	import { theme, font, user } from '$lib/stores.js';
	import Header from '$lib/components/Header.svelte';
	import Categories from '$lib/components/Categories.svelte';
	import Tasks from '$lib/components/Tasks.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import Auth from '$lib/components/Auth.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import DeadlineOptimizer from '$lib/components/DeadlineOptimizer.svelte';
	import { onMount } from 'svelte';

	let showSettings = false;
	let activeTab = 'optimizer'; // 'optimizer', 'tasks', 'categories'

	$: if (typeof window !== 'undefined') {
		document.body.className = $theme === 'dark' ? 'dark-mode' : '';
		document.body.style.fontFamily = `${$font}, sans-serif`;
	}

	onMount(() => {
		document.body.className = $theme === 'dark' ? 'dark-mode' : '';
		document.body.style.fontFamily = `${$font}, sans-serif`;
	});
</script>

<svelte:head>
	<title>Studently - Smart Study Planner</title>
</svelte:head>

<Header />

{#if !$user}
	<Auth />
{:else}
	<Auth />
	
	<div class="tab-navigation">
		<button 
			class="tab-btn" 
			class:active={activeTab === 'optimizer'}
			on:click={() => activeTab = 'optimizer'}
		>
			<span class="tab-icon">🎯</span>
			<span class="tab-label">Smart Scheduler</span>
		</button>
		<button 
			class="tab-btn" 
			class:active={activeTab === 'tasks'}
			on:click={() => activeTab = 'tasks'}
		>
			<span class="tab-icon">✓</span>
			<span class="tab-label">Quick Tasks</span>
		</button>
		<button 
			class="tab-btn" 
			class:active={activeTab === 'categories'}
			on:click={() => activeTab = 'categories'}
		>
			<span class="tab-icon">🏷️</span>
			<span class="tab-label">Categories</span>
		</button>
	</div>

	<main class="container">
		{#if activeTab === 'optimizer'}
			<div class="full-width-content">
				<DeadlineOptimizer />
			</div>
		{:else if activeTab === 'tasks'}
			<div class="full-width-content">
				<Tasks />
			</div>
		{:else if activeTab === 'categories'}
			<div class="full-width-content">
				<Categories />
			</div>
		{/if}
	</main>

	<Settings bind:show={showSettings} />

	<button class="settings-button" on:click={() => (showSettings = true)}>⚙</button>
{/if}

<Footer />

<style>
	.tab-navigation {
		max-width: 1200px;
		margin: 0 auto 2rem;
		padding: 0 2rem;
		display: flex;
		gap: 1rem;
		border-bottom: 2px solid var(--border);
	}

	.tab-btn {
		background: transparent;
		border: none;
		border-bottom: 3px solid transparent;
		padding: 1rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary);
		font-weight: 500;
		transition: all 0.2s ease;
		cursor: pointer;
		border-radius: 0;
		box-shadow: none;
		height: auto;
		margin-bottom: -2px;
	}

	.tab-btn:hover {
		background: var(--surface-hover);
		color: var(--text-primary);
		transform: none;
		box-shadow: none;
	}

	.tab-btn.active {
		color: var(--primary);
		border-bottom-color: var(--primary);
		background: transparent;
	}

	.tab-icon {
		font-size: 1.2rem;
	}

	.tab-label {
		font-size: 0.95rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto 4rem;
		padding: 0 2rem;
	}

	.full-width-content {
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.settings-button {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: var(--primary);
		color: white;
		font-size: 1.2rem;
		box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
		padding: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.settings-button:hover {
		transform: scale(1.1) rotate(30deg);
		box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
	}

	@media (max-width: 768px) {
		.tab-navigation {
			padding: 0 1rem;
			gap: 0.5rem;
			overflow-x: auto;
		}

		.tab-btn {
			padding: 0.75rem 1rem;
			white-space: nowrap;
		}

		.tab-label {
			font-size: 0.85rem;
		}

		.container {
			padding: 0 1rem;
		}

		.settings-button {
			bottom: 1.5rem;
			right: 1.5rem;
			width: 3rem;
			height: 3rem;
		}
	}
</style>