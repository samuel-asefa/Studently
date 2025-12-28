<script>
	import { auth } from '../firebase';
	import { 
		signInWithEmailAndPassword, 
		createUserWithEmailAndPassword, 
		signOut,
		GoogleAuthProvider,
		signInWithPopup 
	} from 'firebase/auth';
	import { user } from '../stores';

	let email = '';
	let password = '';
	let isSignUp = false;
	let error = '';
	let loading = false;

	async function handleEmailAuth() {
		error = '';
		loading = true;
		try {
			if (isSignUp) {
				await createUserWithEmailAndPassword(auth, email, password);
			} else {
				await signInWithEmailAndPassword(auth, email, password);
			}
			email = '';
			password = '';
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function handleGoogleSignIn() {
		error = '';
		loading = true;
		try {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function handleSignOut() {
		try {
			await signOut(auth);
		} catch (err) {
			error = err.message;
		}
	}
</script>

{#if $user}
	<div class="user-info">
		<span class="user-email">{$user.email}</span>
		<button class="sign-out-btn" on:click={handleSignOut}>Sign Out</button>
	</div>
{:else}
	<div class="auth-container">
		<div class="auth-box">
			<h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
			
			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<form on:submit|preventDefault={handleEmailAuth}>
				<input
					type="email"
					bind:value={email}
					placeholder="Email"
					required
					disabled={loading}
				/>
				<input
					type="password"
					bind:value={password}
					placeholder="Password"
					required
					disabled={loading}
				/>
				<button type="submit" disabled={loading}>
					{loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
				</button>
			</form>

			<div class="divider">or</div>

			<button class="google-btn" on:click={handleGoogleSignIn} disabled={loading}>
				<svg width="18" height="18" viewBox="0 0 18 18">
					<path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
					<path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
					<path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z"/>
					<path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
				</svg>
				Continue with Google
			</button>

			<p class="toggle-mode">
				{isSignUp ? 'Already have an account?' : "Don't have an account?"}
				<button class="link-btn" on:click={() => (isSignUp = !isSignUp)}>
					{isSignUp ? 'Sign In' : 'Sign Up'}
				</button>
			</p>
		</div>
	</div>
{/if}

<style>
	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--surface);
		border-radius: var(--radius-md);
		margin-bottom: 2rem;
		justify-content: space-between;
	}

	.user-email {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.sign-out-btn {
		padding: 0.5rem 1rem;
		height: auto;
		font-size: 0.9rem;
		background: var(--surface-hover);
		color: var(--text-primary);
		border: 1px solid var(--border);
	}

	.sign-out-btn:hover {
		background: #fee2e2;
		color: #ef4444;
		border-color: #fecaca;
	}

	.auth-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.auth-box {
		background: var(--surface);
		padding: 2.5rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		max-width: 400px;
		width: 90%;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	h2 {
		margin-bottom: 1.5rem;
		color: var(--text-primary);
		text-align: center;
		font-size: 1.5rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	input {
		width: 100%;
	}

	button[type="submit"] {
		width: 100%;
		margin-top: 0.5rem;
	}

	.error-message {
		background: #fee2e2;
		color: #ef4444;
		padding: 0.75rem;
		border-radius: var(--radius-md);
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.divider {
		text-align: center;
		margin: 1.5rem 0;
		color: var(--text-tertiary);
		position: relative;
	}

	.divider::before,
	.divider::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 40%;
		height: 1px;
		background: var(--border);
	}

	.divider::before {
		left: 0;
	}

	.divider::after {
		right: 0;
	}

	.google-btn {
		width: 100%;
		background: white;
		color: #333;
		border: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		font-weight: 500;
	}

	.google-btn:hover {
		background: #f8f9fa;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.toggle-mode {
		text-align: center;
		margin-top: 1.5rem;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--primary);
		padding: 0;
		height: auto;
		font-weight: 500;
		text-decoration: underline;
		cursor: pointer;
		box-shadow: none;
	}

	.link-btn:hover {
		color: var(--primary-hover);
		transform: none;
	}
</style>