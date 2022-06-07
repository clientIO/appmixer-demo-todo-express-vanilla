const deleteTodoButtons = document.querySelectorAll('.btn-todo-delete');
deleteTodoButtons.forEach(btn => btn.addEventListener('click', todoDelete));

const doneTodoButtons = document.querySelectorAll('.btn-todo-done');
doneTodoButtons.forEach(btn => btn.addEventListener('click', todoDone));

const undoneTodoButtons = document.querySelectorAll('.btn-todo-undone');
undoneTodoButtons.forEach(btn => btn.addEventListener('click', todoUndone));

const deleteAllTodoButton = document.querySelector('.btn-todo-delete-all');
deleteAllTodoButton.addEventListener('click', todoDeleteAll);

async function todoDelete(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    const target = evt.target;
    const todoId = target.dataset.todoId;
    await fetch('/api/todo/' + todoId, { method: 'DELETE' });
    location.reload(true);
}

async function todoDone(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    const target = evt.target;
    const todoId = target.dataset.todoId;
    await fetch('/api/todo/' + todoId, { method: 'PUT', body: JSON.stringify({ done: '1' }), headers: { 'Content-Type': 'application/json' } });
    location.reload(true);
}

async function todoUndone(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    const target = evt.target;
    const todoId = target.dataset.todoId;
    await fetch('/api/todo/' + todoId, { method: 'PUT', body: JSON.stringify({ done: '0' }), headers: { 'Content-Type': 'application/json' } });
    location.reload(true);
}

async function todoDeleteAll(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    await fetch('/api/todo', { method: 'DELETE' });
    location.reload(true);
}
