<script>
	import { categories, tasks } from '../stores.js';
	import { slide } from 'svelte/transition';

	let newTaskName = '';
	let selectedCategoryForTask = '';
</script>

<div class="tasks-section">
	<h2>Tasks</h2>
	<div class="task-input">
		<input
			type="text"
			bind:value={newTaskName}
			on:keypress={(e) => e.key === 'Enter' && tasks.update(t => [...t, { name: newTaskName, category: selectedCategoryForTask }])}
			placeholder="What do you need to do?"
		/>
		<select bind:value={selectedCategoryForTask}>
			<option value="">Select Category</option>
			{#each Object.keys($categories) as categoryName}
				<option value={categoryName}>{categoryName}</option>
			{/each}
		</select>
		<button on:click={() => tasks.update(t => [...t, { name: newTaskName, category: selectedCategoryForTask }])}>Add Task</button>
	</div>
	<ul id="taskList">
		{#if $tasks.length === 0}
			<p>No tasks yet. Add your first task above!</p>
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
					<button class="delete-btn" on:click={() => tasks.update(t => t.filter((_, i) => i !== index))}>×</button>
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style>
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