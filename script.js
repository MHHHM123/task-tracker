const storageKey = "task-tracker-items";
const today = new Date().toISOString().slice(0, 10);
const taskForm = document.querySelector("#taskForm");
const taskTitle = document.querySelector("#taskTitle");
const taskPriority = document.querySelector("#taskPriority");
const taskDue = document.querySelector("#taskDue");
const taskList = document.querySelector("#taskList");
const template = document.querySelector("#taskTemplate");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
const filterButtons = document.querySelectorAll(".filter-button");
let activeFilter = "all";

function createId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const fallbackTasks = [
    { id: createId(), title: "Review project milestones", priority: "high", due: today, done: false },
    { id: createId(), title: "Prepare weekly status notes", priority: "medium", due: "", done: false },
    { id: createId(), title: "Archive completed requests", priority: "low", due: "", done: true }
];

function loadTasks() {
    try {
        return JSON.parse(localStorage.getItem(storageKey) || "null") || fallbackTasks;
    } catch {
        return fallbackTasks;
    }
}

let tasks = loadTasks();

function saveTasks() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function formatDueDate(dateValue) {
    if (!dateValue) return "No due date";
    const date = new Date(`${dateValue}T00:00:00`);
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function renderTasks() {
    const query = searchInput.value.trim().toLowerCase();
    const visibleTasks = tasks.filter((task) => {
        const matchesFilter =
            activeFilter === "all" ||
            (activeFilter === "open" && !task.done) ||
            (activeFilter === "done" && task.done);
        return matchesFilter && task.title.toLowerCase().includes(query);
    });

    taskList.replaceChildren();

    visibleTasks.forEach((task) => {
        const node = template.content.firstElementChild.cloneNode(true);
        const checkbox = node.querySelector("input");
        const title = node.querySelector("h4");
        const priority = node.querySelector(".priority-pill");
        const due = node.querySelector(".due-pill");
        const deleteButton = node.querySelector(".icon-button");

        node.classList.toggle("is-done", task.done);
        node.dataset.priority = task.priority;
        checkbox.checked = task.done;
        title.textContent = task.title;
        priority.textContent = task.priority;
        due.textContent = formatDueDate(task.due);
        due.classList.toggle("is-today", task.due === today && !task.done);

        checkbox.addEventListener("change", () => {
            task.done = checkbox.checked;
            saveTasks();
            render();
        });

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter((item) => item.id !== task.id);
            saveTasks();
            render();
        });

        taskList.append(node);
    });

    emptyState.hidden = visibleTasks.length > 0;
}

function updateStats() {
    const total = tasks.length;
    const done = tasks.filter((task) => task.done).length;
    const open = total - done;
    const todayCount = tasks.filter((task) => task.due === today && !task.done).length;
    const high = tasks.filter((task) => task.priority === "high" && !task.done).length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    document.querySelector("#totalTasks").textContent = total;
    document.querySelector("#todayTasks").textContent = todayCount;
    document.querySelector("#urgentTasks").textContent = high;
    document.querySelector("#doneTasks").textContent = done;
    document.querySelector("#allBadge").textContent = total;
    document.querySelector("#openBadge").textContent = open;
    document.querySelector("#doneBadge").textContent = done;
    document.querySelector("#openCount").textContent = `${open} open`;
    document.querySelector("#progressLabel").textContent = `${percent}% complete`;
    document.querySelector("#progressBar").style.width = `${percent}%`;
}

function render() {
    renderTasks();
    updateStats();
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    tasks.unshift({
        id: createId(),
        title: taskTitle.value.trim(),
        priority: taskPriority.value,
        due: taskDue.value,
        done: false
    });
    taskForm.reset();
    taskPriority.value = "medium";
    taskTitle.focus();
    saveTasks();
    render();
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        activeFilter = button.dataset.filter;
        renderTasks();
    });
});

searchInput.addEventListener("input", renderTasks);

document.querySelector("#clearDone").addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.done);
    saveTasks();
    render();
});

render();
