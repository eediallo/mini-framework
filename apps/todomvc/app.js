import { h, render } from '../../framework/dom.js';
import { createStore } from '../../framework/state.js';
import { bindEvents } from '../../framework/events.js';
import { createRouter } from '../../framework/router.js';

// State shape: { todos: [{id, title, completed}], filter: 'all', editingId: null }
const store = createStore({ 
  todos: [
    { id: '1', title: 'Going to the Gym.', completed: false },
    { id: '2', title: 'Call Mama', completed: true },
    { id: '3', title: 'Do homework', completed: false }
  ], 
  filter: 'all', 
  editingId: null 
});
const router = createRouter();

function filteredTodos(state) {
  if (state.filter === 'active') return state.todos.filter(t => !t.completed);
  if (state.filter === 'completed') return state.todos.filter(t => t.completed);
  return state.todos;
}

function view(state) {
  const items = filteredTodos(state).map(t => {
    const isEditing = state.editingId === t.id;
    const liClass = [
      t.completed ? 'completed' : '',
      isEditing ? 'editing' : ''
    ].filter(Boolean).join(' ');

    if (isEditing) {
      return h('li', { 'data-id': t.id, class: liClass },
        h('input', { 
          class: 'edit', 
          value: t.title,
          'data-id': t.id
        })
      );
    }

    return h('li', { 'data-id': t.id, class: liClass },
      h('div', { class: 'view' },
        h('input', { class: 'toggle', type: 'checkbox', checked: t.completed ? 'checked' : null }),
        h('label', { 'data-id': t.id }, t.title),
        h('button', { class: 'destroy' })
      )
    );
  });

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

function startEditing(id) {
  store.update(s => ({ ...s, editingId: id }));
}

function finishEditing(id, newTitle) {
  const trimmed = newTitle.trim();
  if (!trimmed) {
    destroyTodo(id);
  } else {
    store.update(s => ({
      ...s,
      todos: s.todos.map(t => t.id === id ? { ...t, title: trimmed } : t),
      editingId: null
    }));
  }
}

function cancelEditing() {
  store.update(s => ({ ...s, editingId: null }));
}

function renderApp() {
  const state = store.getState();
  const container = document.getElementById('todo-list');
  const vnode = view(state);
  render(vnode, container, state);

  // Footer visibility and counts
  const remaining = state.todos.filter(t => !t.completed).length;
  const completed = state.todos.filter(t => t.completed).length;
  const hasTodos = state.todos.length > 0;
  
  // Show/hide footer
  const footer = document.querySelector('.footer');
  if (footer) {
    footer.style.display = hasTodos ? 'block' : 'none';
  }

  // Show/hide main section
  const main = document.querySelector('.main');
  if (main) {
    main.style.display = hasTodos ? 'block' : 'none';
  }

  // Update count
  const countEl = document.getElementById('todo-count');
  if (countEl) {
    countEl.textContent = `${remaining} item${remaining === 1 ? '' : 's'} left`;
  }

  // Update toggle-all checkbox
  const toggleAll = document.getElementById('toggle-all');
  if (toggleAll) {
    toggleAll.checked = hasTodos && remaining === 0;
    toggleAll.indeterminate = hasTodos && remaining > 0 && completed > 0;
  }

  // Show/hide clear completed button
  const clearBtn = document.getElementById('clear-completed');
  if (clearBtn) {
    clearBtn.style.display = completed > 0 ? 'block' : 'none';
  }

  // Filter selected
  const links = document.querySelectorAll('.filters a');
  links.forEach(a => {
    const href = a.getAttribute('href') || '#/all';
    const f = href.replace(/^#\//, '');
    if (f === state.filter) a.classList.add('selected');
    else a.classList.remove('selected');
  });

  // Focus edit input if editing
  if (state.editingId) {
    const editInput = document.querySelector('.edit');
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  }
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
    'dblclick label': (ev, el) => {
      const id = el.getAttribute('data-id');
      if (id) startEditing(id);
    },
    'keydown .edit': (ev, el) => {
      const id = el.getAttribute('data-id');
      if (ev.key === 'Enter') {
        finishEditing(id, el.value);
      } else if (ev.key === 'Escape') {
        cancelEditing();
      }
    },
    'blur .edit': (ev, el) => {
      const id = el.getAttribute('data-id');
      finishEditing(id, el.value);
    },
    'click #clear-completed': () => clearCompleted(),
    'change #toggle-all': (ev, el) => toggleAll(el.checked),
    'click label[for="toggle-all"]': (ev, el) => {
      const toggleAllEl = document.getElementById('toggle-all');
      if (toggleAllEl) {
        toggleAllEl.checked = !toggleAllEl.checked;
        toggleAll(toggleAllEl.checked);
      }
    }
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
