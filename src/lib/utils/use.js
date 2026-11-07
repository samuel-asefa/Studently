/** Cursor-following glow for `.spot` cards. */
export function spotlight(node) {
	const move = (e) => {
		const r = node.getBoundingClientRect();
		node.style.setProperty('--mx', `${e.clientX - r.left}px`);
		node.style.setProperty('--my', `${e.clientY - r.top}px`);
	};
	node.addEventListener('pointermove', move);
	return {
		destroy: () => node.removeEventListener('pointermove', move)
	};
}

/** Focus an element when it mounts. */
export function autofocus(node, enabled = true) {
	if (enabled) requestAnimationFrame(() => node.focus());
}

/** Gentle 3D tilt toward the cursor. */
export function tilt(node, { max = 6 } = {}) {
	const move = (e) => {
		const r = node.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width - 0.5;
		const py = (e.clientY - r.top) / r.height - 0.5;
		node.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
		node.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
	};
	const leave = () => {
		node.style.setProperty('--rx', '0deg');
		node.style.setProperty('--ry', '0deg');
	};
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);
	return {
		destroy() {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		}
	};
}

/** True when the keyboard event came from a text field. */
export function isTyping(e) {
	const el = e.target;
	return (
		el instanceof HTMLElement &&
		(el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
	);
}
