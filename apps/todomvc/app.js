import { h, render } from '../../framework/dom.js';
import { createStore } from '../../framework/state.js';
import { bindEvents } from '../../framework/events.js';
import { createRouter } from '../../framework/router.js';

// State shape: { todos: [{id, title, completed}], filter: 'all' }
const store = createStore({ todos: [], filter: 'all' });
const router = createRouter();

function filteredTodos(state) {
  if (state.filter === 'active') return state.todos.filter(t => !t.completed);
  if (state.filter === 'completed') return state.todos.filter(t => t.completed);
  return state.todos;
}

function view(state) {
  const items = filteredTodos(state).map(t =>
    h('li', { 'data-id': t.id, class: t.completed ? 'completed' : '' },
      h('div', { class: 'view' },
        h('input', { class: 'toggle', type: 'checkbox', checked: t.completed ? 'checked' : null }),
        h('label', {}, t.title),
        h('button', { class: 'destroy' })
      )
    )
  );

  return h('div', {}, items);
}

function updateFromRoute(path) {
  const seg = (path.split('?')[0] || '/').replace(/^\/+/, '/');
  const filter = seg.replace(/^\#?\//, '') || 'all';
  if (!['all', 'active', 'completed'].includes(filter)) return;
  store.update(s => ({ ...s, filter }));
}

function addTodo(title) {
  const trimmed = title.trim();
  if (!trimmed) return;
  store.update(s => ({
    ...s,
    todos: [...s.todos, { id: Date.now().toString(36), title: trimmed, completed: false }]
  }));
}

function toggleTodo(id) {
  store.update(s => ({
    ...s,
    todos: s.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  }));
}

function destroyTodo(id) {
  store.update(s => ({
    ...s,
    todos: s.todos.filter(t => t.id !== id)
  }));
}

function toggleAll(checked) {
  store.update(s => ({
    ...s,
    todos: s.todos.map(t => ({ ...t, completed: !!checked }))
  }));
}

function clearCompleted() {
  store.update(s => ({
    ...s,
    todos: s.todos.filter(t => !t.completed)
  }));
}

function renderApp() {
  const container = document.getElementById('todo-list');
  const vnode = view(store.getState());
  render(vnode, container, store.getState());

  // Footer counts
  const remaining = store.getState().todos.filter(t => !t.completed).length;
  const countEl = document.getElementById('todo-count');
  if (countEl) {
    countEl.textContent = `${remaining} item${remaining === 1 ? '' : 's'} left`;
  }

  // Filter selected
  const links = document.querySelectorAll('.filters a');
  links.forEach(a => {
    const href = a.getAttribute('href') || '#/all';
    const f = href.replace(/^#\//, '');
    if (f === store.getState().filter) a.classList.add('selected');
    else a.classList.remove('selected');
  });
}

function wireEvents() {
  const dispose = bindEvents(document.body, {
    'keydown #new-todo': (ev, el) => {
      if (ev.key === 'Enter') {
        addTodo(el.value);
        el.value = '';
      }
    },
    'click .toggle': (ev, el) => {
      const li = el.closest('li');
      if (!li) return;
      toggleTodo(li.getAttribute('data-id'));
    },
    'click .destroy': (ev, el) => {
      const li = el.closest('li');
      if (!li) return;
      destroyTodo(li.getAttribute('data-id'));
    },
    'click #clear-completed': () => clearCompleted(),
    'change #toggle-all': (ev, el) => toggleAll(el.checked)
  });
  return dispose;
}

// Initial wireup
updateFromRoute(router.getLocation());
router.onChange(updateFromRoute);

const unsubscribe = store.subscribe(renderApp);
const disposeEvents = wireEvents();

// First render
window.addEventListener('DOMContentLoaded', renderApp);

// Expose for quick debugging in console
window.app = { store, addTodo, toggleTodo, destroyTodo, toggleAll, clearCompleted };
