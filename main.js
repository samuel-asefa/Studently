document.addEventListener("DOMContentLoaded", () => {
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
    const fontButtons = document.querySelectorAll(".font-buttons button");

    const predefinedColors = [
        "#ffadad", "#ffd6a5", "#fdffb6", "#caffbf",
        "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff",
    ];

    let selectedColor = predefinedColors[0];
    let categories = JSON.parse(localStorage.getItem("categories")) || {};
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let currentTheme = localStorage.getItem("theme") || "light";
    let currentFont = localStorage.getItem("font") || "Arial, sans-serif";

    // Populate the color palette
    function populateColorPalette() {
        colorPalette.innerHTML = ""; // Clear existing colors
        predefinedColors.forEach(color => {
            const colorOption = document.createElement("div");
            colorOption.classList.add("color-option");
            colorOption.style.backgroundColor = color;
            if (color === selectedColor) {
                colorOption.classList.add("selected");
            }
            colorOption.addEventListener("click", () => {
                selectedColor = color;
                document.querySelectorAll(".color-option").forEach(option => option.classList.remove("selected"));
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

    // Render categories
    function renderCategories() {
        categoryList.innerHTML = "";
        categorySelect.innerHTML = '<option value="">Select a category</option>';
        Object.entries(categories).forEach(([name, color]) => {
            const li = document.createElement("li");
            const span = document.createElement("span");
            const deleteBtn = document.createElement("button");

            span.textContent = name;
            span.style.color = color;

            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", () => {
                delete categories[name];
                tasks = tasks.filter(task => task.category !== name);
                saveToLocalStorage();
                renderCategories();
                renderTasks();
            });

            li.appendChild(span);
            li.appendChild(deleteBtn);
            categoryList.appendChild(li);

            // Add to category dropdown
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            categorySelect.appendChild(option);
        });
    }

    // Render tasks
    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.textContent = task.name;
            li.style.backgroundColor = categories[task.category] || "#fff";

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", () => {
                tasks.splice(index, 1);
                saveToLocalStorage();
                renderTasks();
            });

            li.appendChild(deleteBtn);
            taskList.appendChild(li);
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
            document.querySelectorAll(".color-option").forEach(option => {
                if (option.classList.contains("selected")) {
                    option.style.border = "2px solid #fff";
                }
            });
        } else {
            document.body.classList.remove("dark-mode");
            document.querySelectorAll(".color-option").forEach(option => {
                if (option.classList.contains("selected")) {
                    option.style.border = "2px solid #000";
                }
            });
        }
    }

    // Change font
    fontButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentFont = button.getAttribute("data-font");
            document.body.style.fontFamily = currentFont;
            saveToLocalStorage();
        });
    });

    // Add new category
    addCategoryButton.addEventListener("click", () => {
        const name = categoryInput.value.trim();
        if (name && !categories[name]) {
            categories[name] = selectedColor;
            categoryInput.value = "";
            saveToLocalStorage();
            renderCategories();
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
            renderTasks();
        }
    });

    // Open settings popup
    settingsButton.addEventListener("click", () => {
        settingsPopup.style.display = "flex";
    });

    // Close settings popup
    closeSettingsButton.addEventListener("click", () => {
        settingsPopup.style.display = "none";
    });

    // Initial load
    populateColorPalette();
    renderCategories();
    renderTasks();
    applyTheme();
    document.body.style.fontFamily = currentFont; // Apply saved font
});
