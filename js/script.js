const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let stars = [];

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random();
        this.fade = (Math.random() * 0.02) + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.opacity >= 1 || this.opacity <= 0) this.fade *= -1;
        this.opacity += this.fade;
    }

    draw() {
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initStars() {
    stars = [];
    for (let i = 0; i < 200; i++) stars.push(new Star());
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animateStars);
}

initStars();
animateStars();

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let editingId = null;

const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const todoForm = document.getElementById("todoForm");
const todoBody = document.getElementById("todoBody");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

const deleteModal = document.getElementById("deleteModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

let deleteId = null;

dateInput.min = new Date().toISOString().split("T")[0];

/* Validasi */
function validateForm() {
    let valid = true;

    document.getElementById("taskError").textContent = "";
    document.getElementById("dateError").textContent = "";

    if (!taskInput.value.trim()) {
        valid = false;
        document.getElementById("taskError").textContent = "Nama tugas wajib diisi";
    }

    if (!dateInput.value) {
        valid = false;
        document.getElementById("dateError").textContent = "Tanggal harus diisi";
    }

    return valid;
}

/* Tambah/Edit */
todoForm.addEventListener("submit", e => {
    e.preventDefault();

    if (!validateForm()) return;

    const name = taskInput.value.trim();
    const date = dateInput.value;

    if (editingId !== null) {
        let t = todos.find(x => x.id === editingId);
        t.task = name;
        t.date = date;
        editingId = null;
        submitBtn.querySelector("#btnText").textContent = "Tambah";
        cancelBtn.style.display = "none";
    } else {
        todos.push({
            id: Date.now(),
            task: name,
            date: date,
            completed: false
        });
    }

    todoForm.reset();
    saveTodos();
    renderTodos();
});

/* Cancel Edit */
cancelBtn.addEventListener("click", () => {
    editingId = null;
    submitBtn.querySelector("#btnText").textContent = "Tambah";
    cancelBtn.style.display = "none";
    todoForm.reset();
});

/* Edit */
function editTodo(id) {
    let t = todos.find(x => x.id === id);
    taskInput.value = t.task;
    dateInput.value = t.date;
    editingId = id;

    submitBtn.querySelector("#btnText").textContent = "Perbarui";
    cancelBtn.style.display = "inline-block";

    scrollTo({ top: 0, behavior: "smooth" });
}

/* Delete + modal */
function deleteTodo(id) {
    deleteId = id;
    deleteModal.style.display = "block";
}

confirmDelete.onclick = () => {
    todos = todos.filter(x => x.id !== deleteId);
    saveTodos();
    renderTodos();
    deleteModal.style.display = "none";
};

cancelDelete.onclick = () => {
    deleteModal.style.display = "none";
};

/* Complete */
function toggleComplete(id) {
    let t = todos.find(x => x.id === id);
    t.completed = !t.completed;
    saveTodos();
    renderTodos();
}

/* Save */
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

/* Filter */
function getFilteredTodos() {
    let result = [...todos];

    const q = searchInput.value.trim().toLowerCase();
    if (q) result = result.filter(t => t.task.toLowerCase().includes(q));

    const f = filterSelect.value;
    if (f === "completed") result = result.filter(t => t.completed);
    if (f === "incomplete") result = result.filter(t => !t.completed);

    if (f === "newest") result.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (f === "oldest") result.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (f === "az") result.sort((a, b) => a.task.localeCompare(b.task));
    if (f === "za") result.sort((a, b) => b.task.localeCompare(a.task));

    return result;
}

/* Render Table */
function renderTodos() {
    const list = getFilteredTodos();

    if (!list.length) {
        todoBody.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    todoBody.innerHTML = list
        .map(
            t => `
        <tr class="${t.completed ? "completed" : ""}">
            <td>
                <input type="checkbox" ${t.completed ? "checked" : ""} onclick="toggleComplete(${t.id})">
            </td>
            <td>${t.task}</td>
            <td>${new Date(t.date).toLocaleDateString("id-ID")}</td>
            <td>
                <div class="action-btns">
                    <div class="action-icon" onclick="editTodo(${t.id})">✏</div>
                    <div class="action-icon" onclick="deleteTodo(${t.id})">🗑</div>
                </div>
            </td>
        </tr>
    `
        )
        .join("");
}

searchInput.addEventListener("input", renderTodos);
filterSelect.addEventListener("change", renderTodos);

renderTodos();