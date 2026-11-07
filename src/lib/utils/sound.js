let ctx = null;

function audio() {
	if (typeof window === 'undefined') return null;
	if (!ctx) {
		const AC = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
		if (!AC) return null;
		ctx = new AC();
	}
	if (ctx.state === 'suspended') ctx.resume();
	return ctx;
}

/** Call from a click handler so later chimes are allowed to play. */
export function unlockAudio() {
	audio();
}

function note(ac, freq, at, length, gain = 0.18) {
	const osc = ac.createOscillator();
	const g = ac.createGain();
	osc.type = 'sine';
	osc.frequency.setValueAtTime(freq, at);
	g.gain.setValueAtTime(0, at);
	g.gain.linearRampToValueAtTime(gain, at + 0.02);
	g.gain.exponentialRampToValueAtTime(0.0001, at + length);
	osc.connect(g).connect(ac.destination);
	osc.start(at);
	osc.stop(at + length + 0.05);
}

/** A soft three-note chime. */
export function chime(kind = 'done') {
	const ac = audio();
	if (!ac) return;
	const t = ac.currentTime + 0.02;
	const notes = kind === 'break' ? [659.25, 523.25, 392] : [523.25, 659.25, 783.99];
	notes.forEach((f, i) => note(ac, f, t + i * 0.16, 1.1));
}

/** Tiny click for checking things off. */
export function pop() {
	const ac = audio();
	if (!ac) return;
	const t = ac.currentTime;
	const osc = ac.createOscillator();
	const g = ac.createGain();
	osc.type = 'triangle';
	osc.frequency.setValueAtTime(880, t);
	osc.frequency.exponentialRampToValueAtTime(1320, t + 0.06);
	g.gain.setValueAtTime(0.08, t);
	g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
	osc.connect(g).connect(ac.destination);
	osc.start(t);
	osc.stop(t + 0.14);
}
