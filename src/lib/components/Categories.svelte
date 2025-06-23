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
		if (newCategoryName && !$categories[newCategoryName]) {
			$categories[newCategoryName] = selectedColor;
			newCategoryName = '';
		} else if ($categories[newCategoryName]) {
			alert('This category already exists!');
		}
	}

	function handleDeleteCategory(name) {
		if (confirm(`Delete category "${name}"? All tasks in this category will also be deleted.`)) {
			// Filter tasks associated with the deleted category
			$tasks = $tasks.filter(task => task.category !== name);
			// Delete the category itself
			delete $categories[name];
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
                <div
					class="color-option"
					class:selected={color === selectedColor}
					style="background-color: {color};"
					on:click={() => (selectedColor = color)}
                    role="button"
                    tabindex="0"
                    on:keypress|self={(e) => e.key === 'Enter' && (selectedColor = color)}
				></div>
			{/each}
		</div>
		<button on:click={handleAddCategory}>Add</button>
	</div>
	<ul id="categoryList">
		{#each Object.entries($categories) as [name, color] (name)}
			<li transition:slide>
				<span style="color: {color};">{name}</span>
				<button class="delete-btn" on:click={() => handleDeleteCategory(name)}>Delete</button>
			</li>
		{/each}
	</ul>
</div>