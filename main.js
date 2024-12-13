// Elements
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const taskList = document.getElementById('taskList');
const newCategoryInput = document.getElementById('newCategoryInput');
const addTaskButton = document.getElementById('addTaskButton');
const addCategoryButton = document.getElementById('addCategoryButton');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadTasks();
});

// Add a new category
addCategoryButton.addEventListener('click', () => {
    const newCategory = newCategoryInput.value.trim();
    if (newCategory === '') {
        alert('Please enter a category.');
        return;
    }
    addCategory(newCategory);
    saveCategories();
    newCategoryInput.value = '';
});

// Add a new task
addTaskButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    const categoryText = categorySelect.value;

    if (taskText === '') {
        alert('Please enter a task.');
        return;
    }

    addTask(taskText, categoryText);
    saveTasks();
    taskInput.value = '';
});

// Delete a task
taskList.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const listItem = e.target.parentElement;
        taskList.removeChild(listItem);
        saveTasks();
    }
});

// Helper functions
function addCategory(category) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
}

function addTask(task, category) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <span>${task}</span>
        <span class="task-category">${category}</span>
        <button>Delete</button>
    `;
    taskList.appendChild(listItem);
}

function saveCategories() {
    const categories = Array.from(categorySelect.options).map(option => option.value);
    localStorage.setItem('categories', JSON.stringify(categories));
}

function loadCategories() {
    const savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    categorySelect.innerHTML = '';
    savedCategories.forEach(category => addCategory(category));
    if (savedCategories.length === 0) {
        addCategory('Default');
    }
}

function saveTasks() {
    const tasks = Array.from(taskList.children).map(item => ({
        task: item.children[0].textContent,
        category: item.children[1].textContent
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(({ task, category }) => addTask(task, category));
}
