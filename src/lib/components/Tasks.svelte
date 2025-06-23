<script>
    // Script content remains the same
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
</script>

<div class="tasks-section">
	<h2>Tasks</h2>
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
	<ul id="taskList">
		{#if $tasks.length === 0}
			<p class="empty-message">No tasks yet. Add your first task above!</p>
		{:else}
			{#each $tasks as task, index (index)}
				<li transition:slide style="border-left-color: {$categories[task.category]};">
					<span
						class="badge"
						style="background-color: {$categories[task.category]}33; color: {$categories[task.category]};"
					>
						{task.category}
					</span>
					<span class="task-name">{task.name}</span>
					<button class="delete-btn" on:click={() => handleDeleteTask(index)}>×</button>
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style>
	.tasks-section {
		background: var(--surface);
		border-radius: var(--radius-lg);
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transition: var(--transition);
		height: fit-content;
		animation: fadeIn 0.5s ease-out;
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
	.task-input {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 2rem;
		width: 100%;
	}
	input[type='text'] {
		flex: 1;
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
	.delete-btn {
		font-size: 0.8rem;
		padding: 0.4rem;
		background: transparent;
		color: var(--text-tertiary);
		border: 1px solid var(--border);
		height: auto;
		border-radius: 4px;
	}

	.delete-btn:hover {
		background: #fee2e2;
		color: #ef4444;
		border-color: #fecaca;
		transform: translateY(0);
	}
	#taskList li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.2rem;
		margin-bottom: 1rem;
		border-radius: var(--radius-md);
		background: var(--surface-hover);
		border: 1px solid var(--border);
		transition: all 0.3s ease;
		animation: slideIn 0.3s ease-out forwards;
		position: relative;
		overflow: hidden;
		padding-left: 1rem;
	}
	#taskList li:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-md);
		border-color: var(--primary-light);
	}
	#taskList li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: inherit;
		opacity: 0.7;
	}
	.empty-message {
		color: var(--text-tertiary);
		text-align: center;
		padding: 2rem 0;
		font-style: italic;
	}
	.badge {
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		border-radius: 12px;
		margin-right: 8px;
		white-space: nowrap;
	}
	.task-name {
		flex: 1;
		word-break: break-word;
	}
</style>