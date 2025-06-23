<script>
  // We no longer need to import app.css
</script>

<slot />

<style>
	/* All global styles and CSS variables now live here */
	:root {
		--primary: #2563eb;
		--primary-hover: #1d4ed8;
		--primary-light: #dbeafe;
		--surface: #ffffff;
		--surface-hover: #f8fafc;
		--background: #f9fafb;
		--text-primary: #1e293b;
		--text-secondary: #64748b;
		--text-tertiary: #94a3b8;
		--border: #e2e8f0;
		--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
		--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		--radius-sm: 4px;
		--radius-md: 8px;
		--radius-lg: 16px;
		--transition: all 0.2s ease;
	}

	:global(body.dark-mode) {
		--primary: #3b82f6;
		--primary-hover: #2563eb;
		--primary-light: #1e3a8a;
		--surface: #1e293b;
		--surface-hover: #334155;
		--background: #0f172a;
		--text-primary: #f8fafc;
		--text-secondary: #cbd5e1;
		--text-tertiary: #64748b;
		--border: #334155;
	}

	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Inter', sans-serif;
		background-color: var(--background);
		color: var(--text-primary);
		line-height: 1.6;
		transition: var(--transition);
		min-height: 100vh;
	}
	
	:global(ul) {
		list-style: none;
		padding: 0;
	}

	:global(button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 50px;
		padding: 0 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		color: white;
		background: var(--primary);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		box-shadow: 0 2px 5px rgba(37, 99, 235, 0.2);
		white-space: nowrap;
	}

	:global(button:hover) {
		background: var(--primary-hover);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(37, 99, 235, 0.25);
	}

	:global(button:active) {
		transform: translateY(0);
	}

	:global(input[type='text']),
	:global(select) {
		height: 50px;
		padding: 0.85rem 1.2rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-size: 1rem;
		color: var(--text-primary);
		background: var(--surface);
		transition: var(--transition);
		box-shadow: var(--shadow-sm);
	}

	:global(input[type='text']:hover),
	:global(select:hover) {
		border-color: var(--primary-light);
	}

	:global(input[type='text']:focus),
	:global(select:focus) {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
	}

	:global(::placeholder) {
		color: var(--text-tertiary);
		opacity: 0.8;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>