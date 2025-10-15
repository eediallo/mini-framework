// Tiny global store with subscribe/dispatch and immutable-style updates

export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(nextState) {
    state = nextState;
    for (const listener of listeners) listener(state);
  }

  function update(updater) {
    const next = updater(state);
    setState(next);
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, setState, update, subscribe };
}
