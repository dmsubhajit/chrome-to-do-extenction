document.addEventListener("DOMContentLoaded", function () {
    loadTasks();

    document.getElementById("add-work-task").addEventListener("click", function () {
        addTask("work");
    });

    document.getElementById("add-personal-task").addEventListener("click", function () {
        addTask("personal");
    });
});

function addTask(category) {
    const input = document.getElementById(`${category}-input`);
    const taskText = input.value.trim();

    if (taskText === "") return;

    chrome.storage.sync.get([category], function (result) {
        const tasks = result[category] || [];
        tasks.push({ text: taskText, done: false });
        chrome.storage.sync.set({ [category]: tasks }, function () {
            input.value = "";
            loadTasks();
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

function loadTasks() {
    ["work", "personal"].forEach(category => {
        chrome.storage.sync.get([category], function (result) {
            const tasks = result[category] || [];
            const list = document.getElementById(`${category}-list`);
            list.innerHTML = "";

            tasks.forEach((task, index) => {
                const li = document.createElement("li");
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
