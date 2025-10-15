# Mini Framework — Usage

## Install / Run
Open `apps/todomvc/index.html` in your browser using a local server.

- With Python 3: `python3 -m http.server` then open `http://localhost:8000/apps/todomvc/`
- With Node: `npx serve .` then navigate to `/apps/todomvc/`

## APIs

### Elements and Rendering
```js
import { h, render } from '../framework/index.js';

const view = (name) => h('div', { class: 'greeting' }, 'Hello ', name);

const container = document.getElementById('app');
render(view('World'), container);
```

- `h(tag, attrs, ...children)`: builds a virtual node. Children can be strings, numbers, or other vnodes.
- `render(vnode, container)`: mounts or updates the DOM using a naive diff.

### State
```js
import { createStore } from '../framework/index.js';
const store = createStore({ count: 0 });
store.subscribe(state => console.log(state.count));
store.update(s => ({ ...s, count: s.count + 1 }));
```

### Events (declarative delegation)
```js
import { bindEvents } from '../framework/index.js';
const dispose = bindEvents(document.body, {
  'click .btn': (ev, el) => console.log('clicked', el)
});
// later: dispose();
```

### Router (hash)
```js
import { createRouter } from '../framework/index.js';
const router = createRouter();
router.onChange(path => console.log('route', path));
router.push('/active');
```

## Why this design?
- Simple, readable primitives to learn core concepts (DOM abstraction, state, routing, events).
- Naive VDOM keeps implementation approachable for study and iteration.
- Event delegation avoids direct listener management by app code.
- Hash router is zero-config for static hosting.
