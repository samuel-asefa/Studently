<script>
	import { authReady, dataReady, user, guest } from '$lib/stores.js';
	import { timer } from '$lib/focus.js';
	import Background from '$lib/components/Background.svelte';
	import Landing from '$lib/components/Landing.svelte';
	import Shell from '$lib/components/Shell.svelte';

	const ready = $derived($authReady && (!$user || $dataReady));

	$effect(() => {
		if (ready) document.getElementById('splash')?.classList.add('hide');
	});
</script>

<Background intense={$timer.status === 'running' && $timer.mode === 'focus'} />

{#if ready}
	{#if $user || $guest}
		<Shell />
	{:else}
		<Landing />
	{/if}
{/if}
