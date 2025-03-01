document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const workInput = document.getElementById("work-input");
    const personalInput = document.getElementById("personal-input");
    const workList = document.getElementById("work-list");
    const personalList = document.getElementById("personal-list");
    const addWorkBtn = document.getElementById("add-work-task");
    const addPersonalBtn = document.getElementById("add-personal-task");
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    // Load Dark Mode Preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener("change", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", darkModeToggle.checked ? "enabled" : "disabled");
    });

    // Function to add task & save to storage
    function addTask(input, list, category) {
        if (input.value.trim() === "") return;

        const task = { text: input.value, done: false };

        chrome.storage.sync.get([category], (result) => {
            const tasks = result[category] || [];
            tasks.push(task);
            chrome.storage.sync.set({ [category]: tasks }, () => {
                loadTasks(); // Reload UI after saving
            });
        });

        input.value = "";
    }

    // Load tasks from storage
    function loadTasks() {
        ["work", "personal"].forEach(category => {
            chrome.storage.sync.get([category], function (result) {
                const tasks = result[category] || [];
                const list = document.getElementById(`${category}-list`);
                list.innerHTML = "";

                tasks.forEach((task, index) => {
                    const li = document.createElement("li");
                    li.classList.add("task-item");
                    if (task.done) li.classList.add("completed");

                    const span = document.createElement("span");
                    span.textContent = task.text;

                    const doneBtn = document.createElement("button");
                    doneBtn.textContent = "✔";
                    doneBtn.classList.add("done-btn");
                    doneBtn.addEventListener("click", () => toggleTask(category, index));

                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "✖";
                    deleteBtn.classList.add("delete-btn");
                    deleteBtn.addEventListener("click", () => deleteTask(category, index));

                    li.appendChild(span);
                    li.appendChild(doneBtn);
                    li.appendChild(deleteBtn);
                    list.appendChild(li);
                });
            });
        });
    }

    function toggleTask(category, index) {
        chrome.storage.sync.get([category], function (result) {
            const tasks = result[category] || [];
            tasks[index].done = !tasks[index].done;
            chrome.storage.sync.set({ [category]: tasks }, function () {
                loadTasks();
            });
        });
    }

    function deleteTask(category, index) {
        chrome.storage.sync.get([category], function (result) {
            const tasks = result[category] || [];
            tasks.splice(index, 1);
            chrome.storage.sync.set({ [category]: tasks }, function () {
                loadTasks();
            });
        });
    }

    // Event Listeners for Adding Tasks
    addWorkBtn.addEventListener("click", () => addTask(workInput, workList, "work"));
    addPersonalBtn.addEventListener("click", () => addTask(personalInput, personalList, "personal"));

    // Enable Drag & Drop Sorting
    new Sortable(workList, { animation: 150, onEnd: saveTasks });
    new Sortable(personalList, { animation: 150, onEnd: saveTasks });

    function saveTasks() {
        ["work", "personal"].forEach(category => {
            const list = document.getElementById(`${category}-list`);
            const tasks = Array.from(list.children).map(li => ({
                text: li.querySelector("span").textContent,
                done: li.classList.contains("completed")
            }));
            chrome.storage.sync.set({ [category]: tasks });
        });
    }

    // Load tasks on popup open
    loadTasks();
});
