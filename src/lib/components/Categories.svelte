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
</script>

<div class="categories-section">
	<h2>Categories</h2>
	<div class="category-input">
		<input
			type="text"
			bind:value={newCategoryName}
			on:keypress={(e) => e.key === 'Enter' && handleAddCategory()}
			placeholder="New category name..."
		/>
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
		<button on:click={handleAddCategory}>Add</button>
	</div>
	<ul id="categoryList">
		{#each Object.entries($categories) as [name, color] (name)}
			<li transition:slide>
				<span class="category-name" style="color: {color};">{name}</span>
				<button class="delete-btn" on:click={() => handleDeleteCategory(name)}>Delete</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.categories-section {
		background: var(--surface);
		border-radius: var(--radius-lg);
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transition: var(--transition);
		height: fit-content;
		animation: fadeIn 0.5s ease-out;
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

	h2 {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 1.25rem;
		color: var(--text-primary);
		position: relative;
		padding-bottom: 0.5rem;
	}

	h2::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 2.5rem;
		height: 2px;
		background: var(--primary);
		border-radius: 2px;
	}

	.category-input {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 2rem;
		width: 100%;
	}

	input[type='text'] {
		flex: 1;
		min-width: 200px;
	}

	.delete-btn {
		font-size: 0.8rem;
		padding: 0.4rem 0.85rem;
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

	.color-palette {
		display: flex;
		gap: 0.5rem;
		margin: 0.75rem 0;
		flex-wrap: wrap;
		width: 100%;
	}

	.color-option {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		border: 2px solid transparent;
		padding: 0;
		box-shadow: none;
	}

	.color-option:hover {
		transform: scale(1.15);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.color-option.selected {
		border: 3px solid var(--text-primary);
		transform: scale(1.15);
	}

	#categoryList {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	#categoryList li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.2rem;
		margin-bottom: 1rem;
		border-radius: var(--radius-md);
		background: var(--surface-hover);
		border: 1px solid var(--border);
		transition: all 0.3s ease;
	}

	#categoryList li:hover {
		transform: translateY(-3px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border-color: var(--primary-light);
	}

	.category-name {
		font-weight: 500;
		font-size: 1rem;
	}
</style>