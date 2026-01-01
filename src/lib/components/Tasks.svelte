<script>
	import { categories, tasks } from '../stores.js';
	import { slide } from 'svelte/transition';

	let newTaskName = '';
	let selectedCategoryForTask = '';

    function handleAddTask() {
        if (!newTaskName || !selectedCategoryForTask) {
            alert('Please provide a task name and select a category.');
            return;
        }
        tasks.update(t => [...t, { name: newTaskName, category: selectedCategoryForTask }]);
        newTaskName = '';
    }

	function handleDeleteTask(index) {
		tasks.update(t => t.filter((_, i) => i !== index));
	}

	// Group tasks by category
	$: tasksByCategory = $tasks.reduce((acc, task, index) => {
		if (!acc[task.category]) {
			acc[task.category] = [];
		}
		acc[task.category].push({ ...task, index });
		return acc;
	}, {});
</script>

<div class="tasks-section">
	<div class="section-header">
		<div>
			<h2>✓ Quick Tasks</h2>
			<p class="subtitle">Manage your daily to-dos and quick action items</p>
		</div>
		<div class="task-count">
			<span class="count-number">{$tasks.length}</span>
			<span class="count-label">tasks</span>
		</div>
	</div>
	
	<div class="task-input-card">
		<h3>Add New Task</h3>
		<div class="task-input">
			<input
				type="text"
				bind:value={newTaskName}
				on:keypress={(e) => e.key === 'Enter' && handleAddTask()}
				placeholder="What do you need to do?"
			/>
			<select bind:value={selectedCategoryForTask}>
				<option value="">Select Category</option>
				{#each Object.keys($categories) as categoryName}
					<option value={categoryName}>{categoryName}</option>
				{/each}
			</select>
			<button on:click={handleAddTask}>Add Task</button>
		</div>
	</div>

	<div class="tasks-display">
		{#if $tasks.length === 0}
			<div class="empty-state">
				<span class="empty-icon">📝</span>
				<h3>No tasks yet</h3>
				<p>Add your first task above to get started!</p>
			</div>
		{:else}
			<div class="tasks-grid">
				{#each Object.entries(tasksByCategory) as [categoryName, categoryTasks]}
					<div class="category-group" transition:slide>
						<div class="category-group-header" style="border-left-color: {$categories[categoryName]};">
							<span class="category-dot" style="background-color: {$categories[categoryName]};"></span>
							<h3>{categoryName}</h3>
							<span class="category-count">{categoryTasks.length}</span>
						</div>
						<ul class="task-list">
							{#each categoryTasks as task (task.index)}
								<li transition:slide>
									<span class="task-name">{task.name}</span>
									<button class="delete-btn" on:click={() => handleDeleteTask(task.index)}>×</button>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.tasks-section {
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

	.task-count {
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

	.task-input-card {
		background: var(--surface-hover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.task-input-card h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.task-input {
		display: grid;
		grid-template-columns: 2fr 1fr auto;
		gap: 1rem;
	}

	input[type='text'] {
		min-width: 0;
	}

	select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		background-size: 1rem;
		padding-right: 2.5rem;
	}

	.tasks-display {
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

	.tasks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.category-group {
		background: var(--surface-hover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.category-group-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		background: var(--surface);
		border-left: 4px solid;
		border-bottom: 1px solid var(--border);
	}

	.category-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.category-group-header h3 {
		flex: 1;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.category-count {
		background: var(--border);
		color: var(--text-secondary);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.6rem;
		border-radius: 12px;
	}

	.task-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.task-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.875rem 1.25rem;
		border-bottom: 1px solid var(--border);
		transition: background 0.2s ease;
	}

	.task-list li:last-child {
		border-bottom: none;
	}

	.task-list li:hover {
		background: var(--surface);
	}

	.task-name {
		flex: 1;
		word-break: break-word;
		color: var(--text-primary);
	}

	.delete-btn {
		width: 28px;
		height: 28px;
		padding: 0;
		background: transparent;
		color: var(--text-tertiary);
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 1.2rem;
		margin-left: 1rem;
		flex-shrink: 0;
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

		.task-count {
			align-self: flex-start;
		}

		.task-input {
			grid-template-columns: 1fr;
		}

		.tasks-grid {
			grid-template-columns: 1fr;
		}
	}
</style>