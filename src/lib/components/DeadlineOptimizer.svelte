<script>
	import { deadlines } from '../stores.js';
	import { slide } from 'svelte/transition';

	let newDeadline = {
		name: '',
		type: 'assignment',
		dueDate: '',
		estimatedHours: 2,
		customWeight: 1.0
	};

	let showOptimizer = false;
	let dailyPlan = [];

	function handleAddDeadline() {
		if (!newDeadline.name || !newDeadline.dueDate) {
			alert('Please provide a name and due date.');
			return;
		}

		const deadline = {
			id: Date.now(),
			...newDeadline,
			completed: false,
			hoursSpent: 0
		};

		deadlines.update(d => [...d, deadline]);
		
		newDeadline = {
			name: '',
			type: 'assignment',
			dueDate: '',
			estimatedHours: 2,
			customWeight: 1.0
		};
	}

	function handleDeleteDeadline(id) {
		deadlines.update(d => d.filter(deadline => deadline.id !== id));
	}

	function toggleComplete(id) {
		deadlines.update(d => 
			d.map(deadline => 
				deadline.id === id 
					? { ...deadline, completed: !deadline.completed }
					: deadline
			)
		);
	}

	function updateDeadlineWeight(id, weight) {
		deadlines.update(d => 
			d.map(deadline => 
				deadline.id === id 
					? { ...deadline, customWeight: weight }
					: deadline
			)
		);
	}

	function getDaysUntil(dateString) {
		const due = new Date(dateString);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const diffTime = due - today;
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}

	function generateOptimizedPlan() {
		const activeDeadlines = $deadlines.filter(d => !d.completed);
		
		if (activeDeadlines.length === 0) {
			alert('No active deadlines to optimize!');
			return;
		}

		const scoredDeadlines = activeDeadlines.map(d => ({
			...d,
			daysUntil: getDaysUntil(d.dueDate),
			remainingHours: d.estimatedHours - d.hoursSpent
		})).filter(d => d.daysUntil >= 0 && d.remainingHours > 0);

		// Sort by urgency: weight divided by days remaining
		scoredDeadlines.sort((a, b) => {
			const urgencyA = a.customWeight / Math.max(a.daysUntil, 1);
			const urgencyB = b.customWeight / Math.max(b.daysUntil, 1);
			return urgencyB - urgencyA;
		});

		const maxDays = Math.max(...scoredDeadlines.map(d => d.daysUntil), 7);
		const plan = [];

		for (let day = 0; day <= maxDays; day++) {
			const dayDate = new Date();
			dayDate.setDate(dayDate.getDate() + day);
			const dayName = day === 0 ? 'Today' : day === 1 ? 'Tomorrow' : dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

			const dailyAllocations = [];
			let totalDailyHours = 0;
			const maxDailyHours = 6;

			for (const deadline of scoredDeadlines) {
				if (day > deadline.daysUntil) continue;
				if (totalDailyHours >= maxDailyHours) break;

				const daysLeft = deadline.daysUntil - day + 1;
				const hoursPerDay = deadline.remainingHours / daysLeft;
				const allocatedHours = Math.min(
					hoursPerDay,
					deadline.remainingHours,
					maxDailyHours - totalDailyHours
				);

				if (allocatedHours >= 0.5) {
					dailyAllocations.push({
						deadline: deadline.name,
						hours: Math.round(allocatedHours * 2) / 2,
						type: deadline.type,
						weight: deadline.customWeight,
						dueDate: deadline.dueDate
					});
					totalDailyHours += allocatedHours;
					deadline.remainingHours -= allocatedHours;
				}
			}

			if (dailyAllocations.length > 0) {
				plan.push({
					day: dayName,
					date: dayDate.toLocaleDateString(),
					allocations: dailyAllocations,
					totalHours: Math.round(totalDailyHours * 2) / 2
				});
			}
		}

		dailyPlan = plan;
		showOptimizer = true;
	}

	function formatHours(hours) {
		const h = Math.floor(hours);
		const m = Math.round((hours - h) * 60);
		if (m === 0) return `${h}h`;
		return `${h}h ${m}m`;
	}

	function getTypeIcon(type) {
		return type === 'exam' ? '📝' : type === 'ec' ? '🎯' : type === 'project' ? '🚀' : '📄';
	}

	function getWeightColor(weight) {
		if (weight >= 2.0) return '#dc2626';
		if (weight >= 1.5) return '#f59e0b';
		return '#10b981';
	}
</script>

<div class="deadline-section">
	<h2>📅 Deadline Optimizer</h2>
	
	<div class="add-deadline-form">
		<input
			type="text"
			bind:value={newDeadline.name}
			placeholder="Assignment or exam name..."
			class="full-width"
		/>
		
		<select bind:value={newDeadline.type}>
			<option value="assignment">Assignment</option>
			<option value="exam">Exam</option>
			<option value="ec">EC Commitment</option>
			<option value="project">Project</option>
			<option value="other">Other</option>
		</select>

		<input
			type="date"
			bind:value={newDeadline.dueDate}
			min={new Date().toISOString().split('T')[0]}
		/>

		<div class="number-input-group">
			<label>
				<span>Hours needed:</span>
				<input
					type="number"
					bind:value={newDeadline.estimatedHours}
					min="0.5"
					max="100"
					step="0.5"
				/>
			</label>
		</div>

		<div class="slider-group full-width">
			<label>
				<span>Priority Weight: {newDeadline.customWeight.toFixed(1)}x</span>
				<input
					type="range"
					bind:value={newDeadline.customWeight}
					min="0.5"
					max="3.0"
					step="0.1"
				/>
				<div class="weight-labels">
					<span>Low (0.5x)</span>
					<span>Medium (1.0x)</span>
					<span>High (2.0x)</span>
					<span>Critical (3.0x)</span>
				</div>
			</label>
		</div>

		<button on:click={handleAddDeadline} class="add-btn">Add Deadline</button>
	</div>

	<div class="deadlines-list">
		<h3>Active Deadlines ({$deadlines.filter(d => !d.completed).length})</h3>
		{#if $deadlines.length === 0}
			<p class="empty-message">No deadlines yet. Add your first deadline above!</p>
		{:else}
			<ul>
				{#each $deadlines as deadline (deadline.id)}
					<li 
						transition:slide 
						class:completed={deadline.completed}
					>
						<div class="deadline-header">
							<input
								type="checkbox"
								checked={deadline.completed}
								on:change={() => toggleComplete(deadline.id)}
							/>
							<span class="deadline-icon">{getTypeIcon(deadline.type)}</span>
							<span class="deadline-name">{deadline.name}</span>
							<span 
								class="weight-badge" 
								style="background-color: {getWeightColor(deadline.customWeight)}33; color: {getWeightColor(deadline.customWeight)};"
							>
								{deadline.customWeight.toFixed(1)}x
							</span>
						</div>
						<div class="deadline-details">
							<span class="detail">📅 Due: {new Date(deadline.dueDate).toLocaleDateString()}</span>
							<span class="detail">⏱️ {formatHours(deadline.estimatedHours)}</span>
							<span class="detail">📌 {deadline.type}</span>
						</div>
						<div class="weight-adjuster">
							<label>
								<span>Adjust weight:</span>
								<input
									type="range"
									value={deadline.customWeight}
									on:input={(e) => updateDeadlineWeight(deadline.id, parseFloat(e.target.value))}
									min="0.5"
									max="3.0"
									step="0.1"
								/>
							</label>
						</div>
						<button class="delete-btn" on:click={() => handleDeleteDeadline(deadline.id)}>×</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<button class="optimize-btn" on:click={generateOptimizedPlan}>
		🎯 Generate Optimized Schedule
	</button>
</div>

{#if showOptimizer}
	<div class="optimizer-popup" on:click={() => (showOptimizer = false)}>
		<div class="optimizer-content" on:click|stopPropagation>
			<div class="popup-header">
				<h2>📊 Your Optimized Daily Schedule</h2>
				<button class="close-btn" on:click={() => (showOptimizer = false)}>×</button>
			</div>
			
			{#if dailyPlan.length === 0}
				<p class="empty-message">All caught up! No work to schedule.</p>
			{:else}
				<div class="daily-plan">
					{#each dailyPlan as day}
						<div class="day-card" transition:slide>
							<div class="day-header">
								<h3>{day.day}</h3>
								<span class="total-hours">{formatHours(day.totalHours)} total</span>
							</div>
							<ul class="allocations">
								{#each day.allocations as allocation}
									<li>
										<div class="allocation-header">
											<span class="allocation-icon">{getTypeIcon(allocation.type)}</span>
											<span class="allocation-name">{allocation.deadline}</span>
											<span 
												class="weight-badge-small"
												style="background-color: {getWeightColor(allocation.weight)}33; color: {getWeightColor(allocation.weight)};"
											>
												{allocation.weight.toFixed(1)}x
											</span>
										</div>
										<div class="allocation-time">
											<span class="time-badge">{formatHours(allocation.hours)}</span>
											<span class="due-info">Due: {new Date(allocation.dueDate).toLocaleDateString()}</span>
										</div>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.deadline-section {
		background: var(--surface);
		border-radius: var(--radius-lg);
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		animation: fadeIn 0.5s ease-out;
	}

	h2 {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
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

	.add-deadline-form {
		display: grid;
		gap: 1rem;
		margin-bottom: 2rem;
		grid-template-columns: repeat(2, 1fr);
	}

	.full-width {
		grid-column: 1 / -1;
	}

	.number-input-group {
		display: flex;
		flex-direction: column;
	}

	.number-input-group label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.number-input-group span {
		font-size: 0.85rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.number-input-group input[type="number"] {
		height: 50px;
	}

	.slider-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.slider-group label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.slider-group span {
		font-size: 0.85rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.slider-group input[type="range"] {
		height: 8px;
		-webkit-appearance: none;
		appearance: none;
		background: linear-gradient(to right, #10b981 0%, #f59e0b 50%, #dc2626 100%);
		border-radius: 5px;
		outline: none;
	}

	.slider-group input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 22px;
		height: 22px;
		background: white;
		cursor: pointer;
		border-radius: 50%;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		border: 2px solid var(--primary);
	}

	.slider-group input[type="range"]::-moz-range-thumb {
		width: 22px;
		height: 22px;
		background: white;
		cursor: pointer;
		border-radius: 50%;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		border: 2px solid var(--primary);
	}

	.weight-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		color: var(--text-tertiary);
		margin-top: 0.25rem;
	}

	.add-btn {
		grid-column: 1 / -1;
	}

	.deadlines-list {
		margin-bottom: 1.5rem;
	}

	.deadlines-list h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-secondary);
	}

	.deadlines-list ul {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.deadlines-list li {
		position: relative;
		padding: 1rem 1.2rem;
		padding-left: 1rem;
		padding-right: 3rem;
		border-radius: var(--radius-md);
		background: var(--surface-hover);
		border: 1px solid var(--border);
		transition: all 0.3s ease;
	}

	.deadlines-list li:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.deadlines-list li.completed {
		opacity: 0.5;
	}

	.deadline-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.deadline-header input[type="checkbox"] {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.deadline-icon {
		font-size: 1.25rem;
	}

	.deadline-name {
		flex: 1;
		font-weight: 600;
		color: var(--text-primary);
	}

	.weight-badge {
		font-size: 0.7rem;
		padding: 0.25rem 0.6rem;
		border-radius: 12px;
		font-weight: 700;
	}

	.deadline-details {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding-left: 2.5rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
		margin-bottom: 0.75rem;
	}

	.detail {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.weight-adjuster {
		padding-left: 2.5rem;
		margin-top: 0.5rem;
	}

	.weight-adjuster label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.weight-adjuster span {
		font-size: 0.8rem;
		color: var(--text-tertiary);
		font-weight: 500;
	}

	.weight-adjuster input[type="range"] {
		height: 6px;
		-webkit-appearance: none;
		appearance: none;
		background: linear-gradient(to right, #10b981 0%, #f59e0b 50%, #dc2626 100%);
		border-radius: 3px;
		outline: none;
	}

	.weight-adjuster input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		background: white;
		cursor: pointer;
		border-radius: 50%;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
		border: 2px solid var(--primary);
	}

	.weight-adjuster input[type="range"]::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background: white;
		cursor: pointer;
		border-radius: 50%;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
		border: 2px solid var(--primary);
	}

	.delete-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 28px;
		height: 28px;
		padding: 0;
		background: transparent;
		color: var(--text-tertiary);
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 1.2rem;
	}

	.delete-btn:hover {
		background: #fee2e2;
		color: #ef4444;
		border-color: #fecaca;
		transform: translateY(0);
	}

	.optimize-btn {
		width: 100%;
		background: var(--primary);
		font-size: 1.1rem;
		height: 56px;
	}

	.optimize-btn:hover {
		background: var(--primary-hover);
		transform: translateY(-2px);
	}

	.empty-message {
		color: var(--text-tertiary);
		text-align: center;
		padding: 2rem 0;
		font-style: italic;
	}

	.optimizer-popup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		animation: fadeIn 0.2s ease-out;
	}

	.optimizer-content {
		background: var(--surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		max-width: 900px;
		width: 100%;
		max-height: 85vh;
		overflow-y: auto;
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

	.popup-header {
		position: sticky;
		top: 0;
		background: var(--surface);
		padding: 2rem;
		border-bottom: 1px solid var(--border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 10;
	}

	.popup-header h2 {
		margin: 0;
		padding: 0;
	}

	.popup-header h2::after {
		display: none;
	}

	.close-btn {
		width: 36px;
		height: 36px;
		padding: 0;
		background: var(--surface-hover);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: 50%;
		font-size: 1.5rem;
	}

	.close-btn:hover {
		background: #fee2e2;
		color: #ef4444;
		transform: rotate(90deg);
	}

	.daily-plan {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.day-card {
		background: var(--surface-hover);
		border-radius: var(--radius-md);
		padding: 1.5rem;
		border: 1px solid var(--border);
	}

	.day-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--border);
	}

	.day-header h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.total-hours {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--primary);
		background: var(--primary-light);
		padding: 0.35rem 0.75rem;
		border-radius: 20px;
	}

	.allocations {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.allocations li {
		background: var(--surface);
		padding: 1rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
	}

	.allocation-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.allocation-icon {
		font-size: 1.1rem;
	}

	.allocation-name {
		flex: 1;
		font-weight: 600;
		color: var(--text-primary);
	}

	.weight-badge-small {
		font-size: 0.65rem;
		padding: 0.2rem 0.5rem;
		border-radius: 10px;
		font-weight: 700;
	}

	.allocation-time {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-left: 1.6rem;
		font-size: 0.85rem;
	}

	.time-badge {
		background: linear-gradient(135deg, var(--primary), #8b5cf6);
		color: white;
		padding: 0.3rem 0.7rem;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.8rem;
	}

	.due-info {
		color: var(--text-tertiary);
	}

	@media (max-width: 768px) {
		.add-deadline-form {
			grid-template-columns: 1fr;
		}

		.optimizer-popup {
			padding: 1rem;
		}

		.popup-header {
			padding: 1.5rem;
		}

		.daily-plan {
			padding: 1.5rem;
		}
	}
</style>