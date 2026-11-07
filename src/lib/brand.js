import { accentFor } from './constants.js';

/** Graduation-cap mark in a 48×48 box: board, cap, tassel cord and knot. */
export const MARK = {
	board: 'M24 10 42.5 18.4 24 26.8 5.5 18.4Z',
	body: 'M13.8 24.8 24 29.4 34.2 24.8V30.6C34.2 33.6 29.6 36 24 36S13.8 33.6 13.8 30.6Z',
	cord: 'M39.6 20.4V30.2',
	knot: { cx: 39.6, cy: 31.6, r: 2.3 }
};

const markInner = () =>
	`<path d="${MARK.board}" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>` +
	`<path d="${MARK.body}" fill="#fff" fill-opacity=".74"/>` +
	`<path d="${MARK.cord}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>` +
	`<circle cx="${MARK.knot.cx}" cy="${MARK.knot.cy}" r="${MARK.knot.r}" fill="#fff"/>`;

/** OKLCH → sRGB hex (clamped), so the favicon works in every browser. */
export function oklchToHex(L, C, hDeg) {
	const h = (hDeg * Math.PI) / 180;
	const a = C * Math.cos(h);
	const b = C * Math.sin(h);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const rgb = [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	];
	return (
		'#' +
		rgb
			.map((x) => {
				x = Math.min(1, Math.max(0, x));
				x = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
				return Math.round(x * 255)
					.toString(16)
					.padStart(2, '0');
			})
			.join('')
	);
}

export function logoSvg(accentId) {
	const { h, h2 } = accentFor(accentId);
	const from = oklchToHex(0.6, 0.2, h);
	const to = oklchToHex(0.6, 0.18, h2);
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(#g)"/>${markInner()}</svg>`;
}

/** Point the tab icon at a logo in the current accent color. */
export function applyFavicon(accentId) {
	if (typeof document === 'undefined') return;
	const url = `data:image/svg+xml,${encodeURIComponent(logoSvg(accentId))}`;
	/** @type {HTMLLinkElement | null} */
	let link = document.querySelector('link[rel="icon"]');
	if (!link) {
		link = document.createElement('link');
		link.rel = 'icon';
		document.head.appendChild(link);
	}
	link.type = 'image/svg+xml';
	link.href = url;
	try {
		localStorage.setItem('studently:favicon', url);
	} catch {
		/* storage blocked */
	}
}
