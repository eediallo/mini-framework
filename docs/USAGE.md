# Mini Framework — Usage

## Overview
A lightweight front-end framework that provides DOM abstraction, state management, routing, and event handling without external dependencies. Built for learning and understanding core web development concepts.

## Features
- **DOM Abstraction**: Virtual DOM with naive diffing for efficient updates
- **State Management**: Centralized store with reactive updates
- **Routing**: Hash-based routing with URL synchronization
- **Event Handling**: Declarative event delegation system

## Install / Run
Open `apps/todomvc/index.html` in your browser using a local server.

- With Python 3: `python3 -m http.server` then open `http://localhost:8000/apps/todomvc/`
- With Node: `npx serve .` then navigate to `/apps/todomvc/`

## How to Create Elements

### Basic Element Creation
```js
import { h } from '../framework/index.js';

// Simple div
const div = h('div');

// Div with text content
const greeting = h('div', {}, 'Hello World');

// Div with attributes
const button = h('button', { 
  type: 'submit', 
  class: 'btn-primary',
  disabled: false 
}, 'Click me');
```

### Adding Attributes to Elements
```js
// All standard HTML attributes are supported
const input = h('input', {
  type: 'text',
  placeholder: 'Enter your name',
  value: 'John',
  className: 'form-control',  // className maps to 'class'
  id: 'username',
  required: true,
  'data-testid': 'username-input'  // Custom data attributes
});

// Boolean attributes
const checkbox = h('input', {
  type: 'checkbox',
  checked: true,
  disabled: false  // false/null/undefined removes the attribute
});
```

### Nesting Elements
```js
// Multiple children
const list = h('ul', { class: 'todo-list' },
  h('li', { class: 'todo-item' }, 'First item'),
  h('li', { class: 'todo-item' }, 'Second item'),
  h('li', { class: 'todo-item completed' }, 'Third item')
);

// Mixed content types
const card = h('div', { class: 'card' },
  h('h2', {}, 'Card Title'),
  'Some text content',
  42,  // numbers are converted to strings
  h('p', {}, 'More content'),
  null,  // null/undefined/false are filtered out
  h('button', {}, 'Action')
);

// Dynamic children
const items = ['Apple', 'Banana', 'Cherry'];
const dynamicList = h('ul', {},
  ...items.map(item => h('li', { key: item }, item))
);
```

## How to Create Events

### Event Delegation System
```js
import { bindEvents } from '../framework/index.js';

// Basic event binding
const dispose = bindEvents(document.body, {
  'click .btn': (event, element) => {
    console.log('Button clicked:', element);
  },
  
  'submit .form': (event, element) => {
    event.preventDefault();
    console.log('Form submitted');
  },
  
  'keydown .input': (event, element) => {
    if (event.key === 'Enter') {
      console.log('Enter pressed in input');
    }
  }
});

// Cleanup when done
dispose();
```

### Event Selectors
```js
bindEvents(document.body, {
  // Class selector
  'click .button': handler,
  
  // ID selector  
  'click #submit-btn': handler,
  
  // Attribute selector
  'click [data-action="save"]': handler,
  
  // Complex selectors
  'click .todo-list .destroy': handler,
  'dblclick .todo-item label': handler
});
```

## State Management

### Creating a Store
```js
import { createStore } from '../framework/index.js';

const store = createStore({
  todos: [],
  filter: 'all',
  editingId: null
});
```

### Reading State
```js
// Get current state
const currentState = store.getState();
console.log(currentState.todos);
```

### Updating State
```js
// Direct update
store.setState({ todos: [], filter: 'active' });

// Immutable update function
store.update(currentState => ({
  ...currentState,
  todos: [...currentState.todos, { id: 1, text: 'New todo' }]
}));
```

### Subscribing to Changes
```js
const unsubscribe = store.subscribe(newState => {
  console.log('State changed:', newState);
  // Re-render your UI here
});

// Unsubscribe when done
unsubscribe();
```

## Routing

### Basic Router Setup
```js
import { createRouter } from '../framework/index.js';

const router = createRouter();

// Listen to route changes
router.onChange(path => {
  console.log('Route changed to:', path);
  // Update your app based on the route
});

// Navigate programmatically
router.push('/todos/active');
```

### Route Handling
```js
// Get current location
const currentPath = router.getLocation();

// Handle different routes
router.onChange(path => {
  if (path === '/all') {
    store.update(s => ({ ...s, filter: 'all' }));
  } else if (path === '/active') {
    store.update(s => ({ ...s, filter: 'active' }));
  } else if (path === '/completed') {
    store.update(s => ({ ...s, filter: 'completed' }));
  }
});
```

## Rendering

### Mounting and Updating
```js
import { h, render } from '../framework/index.js';

function createView(state) {
  return h('div', { class: 'app' },
    h('h1', {}, 'Todo App'),
    h('ul', {},
      ...state.todos.map(todo => 
        h('li', { key: todo.id }, todo.text)
      )
    )
  );
}

// Mount initial view
const container = document.getElementById('app');
render(createView(store.getState()), container);

// Update when state changes
store.subscribe(state => {
  render(createView(state), container);
});
```

## Complete Example
```js
import { h, render, createStore, bindEvents, createRouter } from '../framework/index.js';

// State
const store = createStore({ count: 0 });
const router = createRouter();

// View
function Counter(state) {
  return h('div', { class: 'counter' },
    h('h2', {}, `Count: ${state.count}`),
    h('button', { class: 'increment' }, 'Increment'),
    h('button', { class: 'decrement' }, 'Decrement')
  );
}

// Events
bindEvents(document.body, {
  'click .increment': () => {
    store.update(s => ({ ...s, count: s.count + 1 }));
  },
  'click .decrement': () => {
    store.update(s => ({ ...s, count: s.count - 1 }));
  }
});

// Render
const container = document.getElementById('app');
store.subscribe(state => {
  render(Counter(state), container);
});

// Initial render
render(Counter(store.getState()), container);
```

## Why This Design?

### DOM Abstraction
- **Virtual DOM**: Represents UI as JavaScript objects, making it easier to reason about and manipulate
- **Naive Diffing**: Simple but effective algorithm that updates only what changed
- **Declarative**: Describe what the UI should look like, not how to change it

### State Management
- **Centralized**: Single source of truth for application state
- **Reactive**: UI automatically updates when state changes
- **Immutable**: State updates create new objects, preventing accidental mutations

### Event Handling
- **Delegation**: Events are handled at the document level, improving performance
- **Declarative**: Events are defined alongside the elements they target
- **Cleanup**: Automatic cleanup prevents memory leaks

### Routing
- **Hash-based**: Works without server configuration
- **Synchronous**: URL changes immediately reflect in application state
- **Simple**: Minimal API for common routing needs
