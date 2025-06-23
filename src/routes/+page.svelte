<script>
	import { theme, font } from '$lib/stores.js';
	import Header from '$lib/components/Header.svelte';
	import Categories from '$lib/components/Categories.svelte';
	import Tasks from '$lib/components/Tasks.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';

	let showSettings = false;

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
	<title>Studently</title>
</svelte:head>

<Header />

<main class="container">
	<Categories />
	<Tasks />
</main>

<Settings bind:show={showSettings} />

<button class="settings-button" on:click={() => (showSettings = true)}>⚙</button>

<Footer />

<style>
	.container {
		max-width: 1500px;
		margin: 0 auto 4rem;
		padding: 0 2rem;
		display: grid;
		grid-template-columns: 1.4fr 1.8fr;
		gap: 2.5rem;
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
		.container {
			grid-template-columns: 1fr;
		}

		.settings-button {
			bottom: 1.5rem;
			right: 1.5rem;
			width: 3rem;
			height: 3rem;
		}
	}
</style>