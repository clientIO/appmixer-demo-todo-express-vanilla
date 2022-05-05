const deleteTodoButtons = document.querySelectorAll('.btn-todo-delete');
deleteTodoButtons.forEach(btn => btn.addEventListener('click', todoDelete));

const doneTodoButtons = document.querySelectorAll('.btn-todo-done');
doneTodoButtons.forEach(btn => btn.addEventListener('click', todoDone));

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
    await fetch('/api/todo/' + todoId, { method: 'PUT' });
    location.reload(true);
}
