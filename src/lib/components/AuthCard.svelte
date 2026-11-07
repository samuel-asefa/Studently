<script>
	import { auth } from '$lib/firebase.js';
	import {
		signInWithEmailAndPassword,
		createUserWithEmailAndPassword,
		sendPasswordResetEmail,
		updateProfile,
		GoogleAuthProvider,
		signInWithPopup
	} from 'firebase/auth';
	import { user, startGuest } from '$lib/stores.js';
	import { toast } from '$lib/ui.js';
	import { slide } from 'svelte/transition';
	import Logo from './ui/Logo.svelte';
	import { Mail, Lock, Eye, EyeOff, User, ArrowRight, LoaderCircle, CircleAlert, Laptop } from '$lib/icons.js';

	let { mode = $bindable('signin') } = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state('');

	const isSignUp = $derived(mode === 'signup');

	const MESSAGES = {
		'auth/invalid-credential': "That email and password don't match.",
		'auth/wrong-password': "That email and password don't match.",
		'auth/user-not-found': "We couldn't find an account with that email.",
		'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
		'auth/weak-password': 'Use at least 6 characters for your password.',
		'auth/invalid-email': "That doesn't look like a valid email.",
		'auth/missing-password': 'Enter your password.',
		'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
		'auth/network-request-failed': 'Network error. Check your connection.',
		'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and try again.',
		'auth/unauthorized-domain': 'Google sign-in is not enabled for this domain yet.'
	};
	const SILENT = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

	function explain(err) {
		if (SILENT.includes(err?.code)) return '';
		return MESSAGES[err?.code] ?? String(err?.message ?? 'Something went wrong.').replace(/^Firebase:\s*/, '');
	}

	async function submit(e) {
		e.preventDefault();
		error = '';
		loading = true;
		try {
			if (isSignUp) {
				const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
				if (name.trim()) {
					await updateProfile(cred.user, { displayName: name.trim() });
					user.set(auth.currentUser);
				}
				toast(`Welcome to Studently${name.trim() ? `, ${name.trim().split(' ')[0]}` : ''}!`, { tone: 'success' });
			} else {
				await signInWithEmailAndPassword(auth, email.trim(), password);
			}
		} catch (err) {
			error = explain(err);
		} finally {
			loading = false;
		}
	}

	async function google() {
		error = '';
		loading = true;
		try {
			await signInWithPopup(auth, new GoogleAuthProvider());
		} catch (err) {
			error = explain(err);
		} finally {
			loading = false;
		}
	}

	async function resetPassword() {
		error = '';
		if (!email.trim()) {
			error = 'Enter your email above, then tap “Forgot password” again.';
			return;
		}
		try {
			await sendPasswordResetEmail(auth, email.trim());
			toast(`Password reset link sent to ${email.trim()}`, { tone: 'success' });
		} catch (err) {
			error = explain(err);
		}
	}
</script>

<div class="auth">
	<div class="head">
		<Logo word={false} size={44} />
		<h2 class="display">
			{#if isSignUp}Create your <em>account</em>{:else}Welcome <em>back</em>{/if}
		</h2>
		<p>{isSignUp ? 'Free forever. Syncs across all your devices.' : 'Sign in to pick up right where you left off.'}</p>
	</div>

	<div class="seg block" role="tablist">
		<button role="tab" aria-selected={!isSignUp} class:on={!isSignUp} onclick={() => ((mode = 'signin'), (error = ''))}>
			Sign in
		</button>
		<button role="tab" aria-selected={isSignUp} class:on={isSignUp} onclick={() => ((mode = 'signup'), (error = ''))}>
			Create account
		</button>
	</div>

	<button class="btn btn-soft btn-block google" onclick={google} disabled={loading}>
		<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
			<path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
			<path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
			<path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z" />
			<path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
		</svg>
		Continue with Google
	</button>

	<div class="or"><span>or with email</span></div>

	<form onsubmit={submit}>
		{#if isSignUp}
			<label class="input-wrap" transition:slide={{ duration: 250 }}>
				<User size={16} />
				<input class="input" type="text" bind:value={name} placeholder="First name" autocomplete="given-name" disabled={loading} />
			</label>
		{/if}
		<label class="input-wrap">
			<Mail size={16} />
			<input class="input" type="email" bind:value={email} placeholder="you@school.edu" autocomplete="email" required disabled={loading} />
		</label>
		<label class="input-wrap">
			<Lock size={16} />
			<input
				class="input"
				type={showPassword ? 'text' : 'password'}
				bind:value={password}
				placeholder={isSignUp ? 'Create a password (6+ characters)' : 'Password'}
				autocomplete={isSignUp ? 'new-password' : 'current-password'}
				minlength={isSignUp ? 6 : undefined}
				required
				disabled={loading}
			/>
			<button
				type="button"
				class="peek"
				onclick={() => (showPassword = !showPassword)}
				aria-label={showPassword ? 'Hide password' : 'Show password'}
			>
				{#if showPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
			</button>
		</label>

		{#if !isSignUp}
			<button type="button" class="forgot" onclick={resetPassword}>Forgot password?</button>
		{/if}

		{#if error}
			<div class="error" transition:slide={{ duration: 200 }}>
				<CircleAlert size={16} />
				<span>{error}</span>
			</div>
		{/if}

		<button type="submit" class="btn btn-primary btn-lg btn-block" disabled={loading}>
			{#if loading}
				<LoaderCircle size={18} class="spin" />
			{:else}
				{isSignUp ? 'Create account' : 'Sign in'}
				<ArrowRight size={17} />
			{/if}
		</button>
	</form>

	<button class="guest" onclick={startGuest}>
		<Laptop size={16} />
		<span><strong>Continue as guest</strong> · no account needed</span>
		<ArrowRight size={15} />
	</button>
	<p class="fine">Guest data stays on this device. Create an account later and it moves over automatically.</p>
</div>

<style>
	.auth {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.head {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 10px;
		margin-bottom: 6px;
	}
	.head h2 {
		font-size: 34px;
		margin-top: 6px;
	}
	.head h2 em {
		color: var(--accent);
	}
	.head p {
		color: var(--text-2);
		font-size: 14px;
	}
	.google {
		height: 46px;
		font-weight: 550;
	}
	.or {
		position: relative;
		text-align: center;
		font-size: 12px;
		color: var(--text-3);
	}
	.or::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: 1px;
		background: var(--border);
	}
	.or span {
		position: relative;
		padding: 0 10px;
		background: var(--surface-solid);
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.input-wrap {
		position: relative;
		display: block;
	}
	.input-wrap > :global(svg:first-child) {
		position: absolute;
		left: 14px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-3);
		pointer-events: none;
	}
	.input-wrap .input {
		height: 46px;
		padding-left: 40px;
	}
	.peek {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 9px;
		color: var(--text-3);
	}
	.peek:hover {
		color: var(--text);
		background: var(--surface-2);
	}
	.input-wrap:has(.peek) .input {
		padding-right: 44px;
	}
	.forgot {
		align-self: flex-end;
		font-size: 12.5px;
		color: var(--text-2);
		margin-top: -2px;
	}
	.forgot:hover {
		color: var(--accent);
	}
	.error {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		padding: 10px 12px;
		border-radius: 12px;
		font-size: 13px;
		color: var(--danger);
		background: oklch(0.66 0.21 25 / 0.1);
		border: 1px solid oklch(0.66 0.21 25 / 0.2);
	}
	.error :global(svg) {
		margin-top: 2px;
	}
	form .btn-primary {
		margin-top: 4px;
	}
	.guest {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 4px;
		padding: 12px 14px;
		border-radius: 14px;
		border: 1px dashed var(--border-2);
		color: var(--text-2);
		font-size: 13.5px;
		text-align: left;
		transition: border-color 0.2s, color 0.2s, background 0.2s;
	}
	.guest span {
		flex: 1;
	}
	.guest strong {
		color: var(--text);
		font-weight: 600;
	}
	.guest :global(svg:last-child) {
		transition: transform 0.3s var(--ease-out);
	}
	.guest:hover {
		border-color: var(--accent);
		color: var(--text);
		background: var(--accent-soft);
	}
	.guest:hover :global(svg:last-child) {
		transform: translateX(3px);
	}
	.fine {
		font-size: 12px;
		color: var(--text-3);
		text-align: center;
	}
</style>
