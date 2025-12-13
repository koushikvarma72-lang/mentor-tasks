const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");


input.addEventListener("input", () => {
  const char = input.value.slice(input.length-1);
  if(!/^[A-Za-z_*]+$/.test(char)) {
    alert("invalid input")
    input.value = input.value.slice(0, -1);
  };
})
const STORAGE_KEY = "todo-items";

let todos = []; 

function createTodoElement(text) {
  const li = document.createElement("li");
  li.classList.add("todo-item");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const span = document.createElement("span");
  span.textContent = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  return li;
}

function loadTodos() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  try {
    todos = JSON.parse(stored) || [];
  } catch (e) {
    todos = [];
  }

  todos.forEach((text) => {
    const li = createTodoElement(text);
    list.appendChild(li);
  });
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (text === "") return;

  const li = createTodoElement(text);
  list.appendChild(li);

  todos.push(text);
  saveTodos();

  input.value = "";
});

list.addEventListener("click", (e) => {
  const target = e.target;

  if (target.classList.contains("delete-btn")) {
    const li = target.parentElement;
    const text = li.querySelector("span").textContent;

    todos = todos.filter((t) => t !== text);
    saveTodos();

    li.remove();
    return;
  }

  if (target.type === "checkbox") {
    const span = target.parentElement.querySelector("span");
    span.classList.toggle("completed");
  }
});

loadTodos();