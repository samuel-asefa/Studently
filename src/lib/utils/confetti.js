const reducedMotion = () =>
	typeof window !== 'undefined' &&
	(window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
		document.documentElement.dataset.motion === 'reduce');

function accentPalette() {
	const h = Number(getComputedStyle(document.documentElement).getPropertyValue('--accent-h')) || 285;
	return [h, h + 55, h - 60, h + 150, 85].map((x) => `oklch(0.78 0.17 ${x})`);
}

/**
 * Small dependency-free confetti burst.
 * Pass an element or {x, y} in pixels to burst from that point.
 * @param {{ from?: Element | { x: number, y: number }, count?: number, spread?: number, power?: number, colors?: string[] }} [opts]
 */
export function confetti({ from, count = 90, spread = 75, power = 1, colors } = {}) {
	if (typeof window === 'undefined' || reducedMotion()) return;

	let x = window.innerWidth / 2;
	let y = window.innerHeight / 2;
	if (from instanceof Element) {
		const r = from.getBoundingClientRect();
		x = r.left + r.width / 2;
		y = r.top + r.height / 2;
	} else if (from) {
		x = from.x;
		y = from.y;
	}

	const canvas = document.createElement('canvas');
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	canvas.width = window.innerWidth * dpr;
	canvas.height = window.innerHeight * dpr;
	Object.assign(canvas.style, {
		position: 'fixed',
		inset: '0',
		width: '100%',
		height: '100%',
		pointerEvents: 'none',
		zIndex: '9999'
	});
	document.body.appendChild(canvas);
	const ctx = canvas.getContext('2d');
	ctx.scale(dpr, dpr);

	const palette = colors ?? accentPalette();
	const rad = (deg) => (deg * Math.PI) / 180;
	const parts = Array.from({ length: count }, () => {
		const angle = rad(-90 + (Math.random() - 0.5) * spread * 2);
		const speed = (6 + Math.random() * 9) * power;
		return {
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			rot: Math.random() * 360,
			vr: (Math.random() - 0.5) * 18,
			w: 5 + Math.random() * 6,
			h: 8 + Math.random() * 8,
			color: palette[(Math.random() * palette.length) | 0],
			shape: Math.random() < 0.3 ? 'circle' : 'rect',
			wobble: Math.random() * 10,
			life: 0
		};
	});

	const start = performance.now();
	const DURATION = 2200;

	function frame(t) {
		const elapsed = t - start;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (const p of parts) {
			p.life += 1;
			p.vy += 0.28; // gravity
			p.vx *= 0.985;
			p.vy *= 0.985;
			p.x += p.vx + Math.sin((p.life + p.wobble) / 8) * 0.6;
			p.y += p.vy;
			p.rot += p.vr;
			const alpha = Math.max(0, 1 - elapsed / DURATION);
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.translate(p.x, p.y);
			ctx.rotate(rad(p.rot));
			ctx.fillStyle = p.color;
			if (p.shape === 'circle') {
				ctx.beginPath();
				ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
				ctx.fill();
			} else {
				ctx.scale(1, Math.cos(rad(p.rot * 2)));
				ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
			}
			ctx.restore();
		}
		if (elapsed < DURATION) requestAnimationFrame(frame);
		else canvas.remove();
	}
	requestAnimationFrame(frame);
}
