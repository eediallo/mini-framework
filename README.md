# mini-framework

A tiny didactic front-end framework implementing DOM abstraction, state, events, and routing, plus a TodoMVC example.

## Quick start
- Start a static server at the repo root:
  - Python: `python3 -m http.server`
  - Node: `npx serve .`
- Open `http://localhost:8000/apps/todomvc/` (or the served URL) to run the TodoMVC example.

## Project layout
- `framework/`: core modules
  - `dom.js`: `h`, `render` and naive diff
  - `state.js`: simple global store
  - `events.js`: declarative event delegation
  - `router.js`: hash-based router
  - `index.js`: public exports
- `apps/todomvc/`: example app using the framework
  - `index.html`, `app.js`, `styles.css`
- `docs/USAGE.md`: usage and API docs
- `project-requirements.md`: original assignment

See `docs/USAGE.md` for API usage and examples.

