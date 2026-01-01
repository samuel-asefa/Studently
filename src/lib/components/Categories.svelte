<script>
	import { categories, tasks } from '../stores.js';
	import { slide } from 'svelte/transition';

	let newCategoryName = '';
	const predefinedColors = [
		'#3b82f6', '#10b981', '#f59e0b', '#ef4444',
		'#8b5cf6', '#ec4899', '#6366f1', '#14b8a6',
		'#f97316', '#06b6d4', '#a855f7', '#84cc16'
	];
	let selectedColor = predefinedColors[0];

	function handleAddCategory() {
		const trimmedName = newCategoryName.trim();
		if (!trimmedName) {
			alert('Please enter a category name.');
			return;
		}
		if ($categories[trimmedName]) {
			alert('This category already exists!');
			return;
		}
		categories.update(cats => ({ ...cats, [trimmedName]: selectedColor }));
		newCategoryName = '';
	}

	function handleDeleteCategory(name) {
		if (confirm(`Delete category "${name}"? All tasks in this category will also be deleted.`)) {
			tasks.update(t => t.filter(task => task.category !== name));
			categories.update(cats => {
				const { [name]: _, ...rest } = cats;
				return rest;
			});
		}
	}

	// Count tasks per category
	$: taskCounts = $tasks.reduce((acc, task) => {
		acc[task.category] = (acc[task.category] || 0) + 1;
		return acc;
	}, {});
</script>

<div class="categories-section">
	<div class="section-header">
		<div>
			<h2>🏷️ Categories</h2>
			<p class="subtitle">Organize your tasks and deadlines with custom categories</p>
		</div>
		<div class="category-count">
			<span class="count-number">{Object.keys($categories).length}</span>
			<span class="count-label">categories</span>
		</div>
	</div>

	<div class="category-input-card">
		<h3>Create New Category</h3>
		<div class="category-input">
			<input
				type="text"
				bind:value={newCategoryName}
				on:keypress={(e) => e.key === 'Enter' && handleAddCategory()}
				placeholder="Category name (e.g., Math, Science, Sports)..."
			/>
			<button on:click={handleAddCategory}>Create</button>
		</div>
		<div class="color-section">
			<label class="color-label">Choose a color:</label>
			<div class="color-palette">
				{#each predefinedColors as color}
					<button
						type="button"
						class="color-option"
						class:selected={color === selectedColor}
						style="background-color: {color};"
						on:click={() => (selectedColor = color)}
						aria-label="Select color {color}"
					></button>
				{/each}
			</div>
		</div>
	</div>

	<div class="categories-display">
		{#if Object.keys($categories).length === 0}
			<div class="empty-state">
				<span class="empty-icon">🏷️</span>
				<h3>No categories yet</h3>
				<p>Create your first category to organize your work!</p>
			</div>
		{:else}
			<div class="categories-grid">
				{#each Object.entries($categories) as [name, color] (name)}
					<div class="category-card" transition:slide style="border-left-color: {color};">
						<div class="category-card-header">
							<span class="category-color-dot" style="background-color: {color};"></span>
							<h3 class="category-name">{name}</h3>
						</div>
						<div class="category-card-body">
							<div class="category-stats">
								<span class="stat-icon">✓</span>
								<span class="stat-text">{taskCounts[name] || 0} tasks</span>
							</div>
							<button class="delete-btn" on:click={() => handleDeleteCategory(name)}>
								<span>Delete</span>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.categories-section {
		background: var(--surface);
		border-radius: var(--radius-lg);
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		animation: fadeIn 0.5s ease-out;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid var(--border);
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		color: var(--text-primary);
	}

	.subtitle {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.category-count {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		background: var(--primary-light);
		padding: 0.75rem 1.25rem;
		border-radius: var(--radius-md);
	}

	.count-number {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--primary);
		line-height: 1;
	}

	.count-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.category-input-card {
		background: var(--surface-hover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.category-input-card h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.category-input {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	input[type='text'] {
		min-width: 0;
	}

	.color-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.color-label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.color-palette {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.color-option {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		border: 3px solid transparent;
		padding: 0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.color-option:hover {
		transform: scale(1.15);
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
	}

	.color-option.selected {
		border: 3px solid var(--text-primary);
		transform: scale(1.15);
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
	}

	.categories-display {
		min-height: 200px;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-icon {
		font-size: 4rem;
		display: block;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.empty-state h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: var(--text-tertiary);
		font-style: italic;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}

	.category-card {
		background: var(--surface-hover);
		border: 1px solid var(--border);
		border-left-width: 4px;
		border-radius: var(--radius-md);
		padding: 1.25rem;
		transition: all 0.3s ease;
	}

	.category-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	}

	.category-card-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.category-color-dot {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.category-name {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		flex: 1;
	}

	.category-card-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.category-stats {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--surface);
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-md);
	}

	.stat-icon {
		font-size: 1rem;
	}

	.stat-text {
		font-size: 0.85rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.delete-btn {
		font-size: 0.85rem;
		padding: 0.5rem 1rem;
		background: transparent;
		color: var(--text-tertiary);
		border: 1px solid var(--border);
		height: auto;
	}

	.delete-btn:hover {
		background: #fee2e2;
		color: #ef4444;
		border-color: #fecaca;
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.section-header {
			flex-direction: column;
			gap: 1rem;
		}

		.category-count {
			align-self: flex-start;
		}

		.category-input {
			grid-template-columns: 1fr;
		}

		.categories-grid {
			grid-template-columns: 1fr;
		}
	}
</style>