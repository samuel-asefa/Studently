document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const categoryList = document.getElementById("categoryList");
    const taskList = document.getElementById("taskList");
    const categoryInput = document.getElementById("newCategoryInput");
    const taskInput = document.getElementById("taskInput");
    const categorySelect = document.getElementById("categorySelect");
    const addCategoryButton = document.getElementById("addCategoryButton");
    const addTaskButton = document.getElementById("addTaskButton");
    const settingsButton = document.getElementById("settingsButton");
    const settingsPopup = document.getElementById("settingsPopup");
    const closeSettingsButton = document.getElementById("closeSettingsButton");
    const colorPalette = document.getElementById("colorPalette");
    const themeSelect = document.getElementById("themeSelect");
    const fontButtons = document.querySelectorAll(".font-btn");
    
    // Modern color palette (softer, more professional)
    const predefinedColors = [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", 
        "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6",
        "#f97316", "#06b6d4", "#a855f7", "#84cc16"
    ];
    
    let selectedColor = predefinedColors[0];
    let categories = JSON.parse(localStorage.getItem("categories")) || {};
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let currentTheme = localStorage.getItem("theme") || "light";
    let currentFont = localStorage.getItem("font") || "Inter";
    
    // Add task with enter key
    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            addTaskButton.click();
        }
    });
    
    // Add category with enter key
    categoryInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            addCategoryButton.click();
        }
    });
    
    // Populate the color palette
    function populateColorPalette() {
        colorPalette.innerHTML = "";
        predefinedColors.forEach(color => {
            const colorOption = document.createElement("div");
            colorOption.classList.add("color-option");
            colorOption.style.backgroundColor = color;
            if (color === selectedColor) {
                colorOption.classList.add("selected");
            }
            colorOption.addEventListener("click", () => {
                selectedColor = color;
                document.querySelectorAll(".color-option").forEach(option => 
                    option.classList.remove("selected"));
                colorOption.classList.add("selected");
            });
            colorPalette.appendChild(colorOption);
        });
    }
    
    // Save to local storage
    function saveToLocalStorage() {
        localStorage.setItem("categories", JSON.stringify(categories));
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("theme", currentTheme);
        localStorage.setItem("font", currentFont);
    }
    
    // Render categories with animation
    function renderCategories() {
        categoryList.innerHTML = "";
        categorySelect.innerHTML = '<option value="">Select a category</option>';
        
        Object.entries(categories).forEach(([name, color]) => {
            const li = document.createElement("li");
            li.style.opacity = "0";
            li.style.transform = "translateY(10px)";
            
            const span = document.createElement("span");
            span.textContent = name;
            span.style.color = color;
            
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                
                // Confirm deletion
                if (confirm(`Delete category "${name}"? All tasks in this category will also be deleted.`)) {
                    delete categories[name];
                    tasks = tasks.filter(task => task.category !== name);
                    saveToLocalStorage();
                    renderCategories();
                    renderTasks();
                }
            });
            
            li.appendChild(span);
            li.appendChild(deleteBtn);
            categoryList.appendChild(li);
            
            // Add animation
            setTimeout(() => {
                li.style.transition = "opacity 0.3s, transform 0.3s";
                li.style.opacity = "1";
                li.style.transform = "translateY(0)";
            }, 50);
            
            // Add to category dropdown
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            categorySelect.appendChild(option);
        });
    }
    
    // Render tasks with animation
    function renderTasks() {
        taskList.innerHTML = "";
        
        if (tasks.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "No tasks yet. Add your first task above!";
            emptyMessage.style.color = "var(--text-tertiary)";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.padding = "2rem 0";
            taskList.appendChild(emptyMessage);
            return;
        }
        
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.style.opacity = "0";
            li.style.transform = "translateY(10px)";
            
            // Create task color indicator
            li.style.borderLeft = `4px solid ${categories[task.category] || "#ccc"}`;
            li.style.paddingLeft = "12px";
            
            // Add category badge
            const badge = document.createElement("span");
            badge.textContent = task.category;
            badge.style.fontSize = "0.7rem";
            badge.style.padding = "0.2rem 0.5rem";
            badge.style.borderRadius = "12px";
            badge.style.backgroundColor = categories[task.category] + "33"; // Add transparency
            badge.style.color = categories[task.category];
            badge.style.marginRight = "8px";
            
            // Add task name
            const taskName = document.createElement("span");
            taskName.textContent = task.name;
            taskName.style.flex = "1";
            
            // Add actions container
            const actions = document.createElement("div");
            actions.style.display = "flex";
            actions.style.gap = "0.5rem";
            
            // Add complete button
            const completeBtn = document.createElement("button");
            completeBtn.innerHTML = "✓";
            completeBtn.title = "Mark as complete";
            completeBtn.classList.add("delete-btn");
            completeBtn.style.background = "var(--primary-light)";
            completeBtn.style.color = "var(--primary)";
            completeBtn.style.padding = "0.4rem";
            completeBtn.style.borderRadius = "4px";
            completeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                li.style.transition = "opacity 0.3s, transform 0.3s";
                li.style.opacity = "0";
                li.style.transform = "translateY(-10px)";
                
                setTimeout(() => {
                    tasks.splice(index, 1);
                    saveToLocalStorage();
                    renderTasks();
                }, 300);
            });
            
            // Add delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "×";
            deleteBtn.title = "Delete task";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.style.padding = "0.4rem";
            deleteBtn.style.borderRadius = "4px";
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                li.style.transition = "opacity 0.3s, transform 0.3s";
                li.style.opacity = "0";
                li.style.transform = "translateY(10px)";
                
                setTimeout(() => {
                    tasks.splice(index, 1);
                    saveToLocalStorage();
                    renderTasks();
                }, 300);
            });
            
            actions.appendChild(completeBtn);
            actions.appendChild(deleteBtn);
            
            li.appendChild(badge);
            li.appendChild(taskName);
            li.appendChild(actions);
            taskList.appendChild(li);
            
            // Add animation with staggered delay
            setTimeout(() => {
                li.style.transition = "opacity 0.3s, transform 0.3s";
                li.style.opacity = "1";
                li.style.transform = "translateY(0)";
            }, 50 * index);
        });
    }
    
    // Change theme
    themeSelect.addEventListener("change", () => {
        currentTheme = themeSelect.value;
        applyTheme();
        saveToLocalStorage();
    });
    
    function applyTheme() {
        if (currentTheme === "dark") {
            document.body.classList.add("dark-mode");
            themeSelect.value = "dark";
        } else {
            document.body.classList.remove("dark-mode");
            themeSelect.value = "light";
        }
    }
    
    // Change font
    fontButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentFont = button.getAttribute("data-font");
            document.body.style.fontFamily = `${currentFont}, sans-serif`;
            
            // Update active state
            fontButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            
            saveToLocalStorage();
        });
    });
    
    // Add new category
    addCategoryButton.addEventListener("click", () => {
        const name = categoryInput.value.trim();
        if (name && !categories[name]) {
            // Add with animation
            categories[name] = selectedColor;
            categoryInput.value = "";
            saveToLocalStorage();
            
            // Highlight effect on input
            categoryInput.style.backgroundColor = "var(--primary-light)";
            categoryInput.style.transition = "background-color 0.5s";
            setTimeout(() => {
                categoryInput.style.backgroundColor = "";
            }, 500);
            
            renderCategories();
        } else if (categories[name]) {
            alert("This category already exists!");
        }
    });
    
    // Add new task
    addTaskButton.addEventListener("click", () => {
        const name = taskInput.value.trim();
        const category = categorySelect.value;
        
        if (name && category) {
            tasks.push({ name, category });
            taskInput.value = "";
            saveToLocalStorage();
            
            // Highlight effect on input
            taskInput.style.backgroundColor = "var(--primary-light)";
            taskInput.style.transition = "background-color 0.5s";
            setTimeout(() => {
                taskInput.style.backgroundColor = "";
            }, 500);
            
            renderTasks();
        } else {
            if (!name) taskInput.focus();
            else if (!category) {
                alert("Please select a category for your task.");
                categorySelect.focus();
            }
        }
    });
    
    // Settings popup
    settingsButton.addEventListener("click", () => {
        settingsPopup.style.display = "flex";
        settingsPopup.style.opacity = "0";
        setTimeout(() => {
            settingsPopup.style.opacity = "1";
            settingsPopup.style.transition = "opacity 0.3s";
        }, 10);
    });
    
    // Close settings popup
    closeSettingsButton.addEventListener("click", () => {
        settingsPopup.style.opacity = "0";
        settingsPopup.style.transition = "opacity 0.3s";
        setTimeout(() => {
            settingsPopup.style.display = "none";
        }, 300);
    });
    
    // Close popup when clicking outside
    settingsPopup.addEventListener("click", (e) => {
        if (e.target === settingsPopup) {
            closeSettingsButton.click();
        }
    });
    
    // Initial load
    populateColorPalette();
    renderCategories();
    renderTasks();
    applyTheme();
    document.body.style.fontFamily = `${currentFont}, sans-serif`;
});
