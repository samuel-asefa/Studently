<script>
	import { theme, font } from '$lib/stores.js';
	import Header from '$lib/components/Header.svelte';
	import Categories from '$lib/components/Categories.svelte';
	import Tasks from '$lib/components/Tasks.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';

	let showSettings = false;

	// Apply theme and font from stores to the body
	$: if (typeof window !== 'undefined') {
		document.body.className = $theme === 'dark' ? 'dark-mode' : '';
		document.body.style.fontFamily = `${$font}, sans-serif`;
	}

    // A one-time onMount call to set initial styles
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