<script>
	import '../app.css';
	import { settings } from '$lib/stores.js';
	import { FONTS, accentFor } from '$lib/constants.js';
	import { applyFavicon } from '$lib/brand.js';
	import { resolvedTheme } from '$lib/theme.js';
	import IconContext from 'phosphor-svelte/lib/IconContext';
	import Toasts from '$lib/components/Toasts.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	let { children } = $props();

	let systemDark = $state(matchMedia('(prefers-color-scheme: dark)').matches);

	$effect(() => {
		const mq = matchMedia('(prefers-color-scheme: dark)');
		const onChange = (e) => (systemDark = e.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	$effect(() => {
		const s = $settings;
		void systemDark;
		const root = document.documentElement;
		root.dataset.theme = resolvedTheme(s.theme);
		const accent = accentFor(s.accent);
		root.style.setProperty('--accent-h', String(accent.h));
		root.style.setProperty('--accent-h2', String(accent.h2));
		applyFavicon(accent.id);
		if (s.reduceMotion) root.dataset.motion = 'reduce';
		else delete root.dataset.motion;

		const font = FONTS.find((f) => f.id === s.font) ?? FONTS[0];
		if (font.url && !document.querySelector(`link[data-font="${font.id}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = `https://fonts.googleapis.com/css2?${font.url}&display=swap`;
			link.dataset.font = font.id;
			document.head.appendChild(link);
		}
		root.style.setProperty('--font-sans', `'${font.id}', ui-sans-serif, system-ui, sans-serif`);
	});
</script>

<!-- Duotone icons everywhere unless a component asks for another weight. -->
<IconContext values={{ weight: 'duotone' }}>
	{@render children()}
	<Toasts />
	<ConfirmDialog />
</IconContext>
