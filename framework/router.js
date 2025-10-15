// Simple hash router: #/path?query

function getHashPath() {
  const hash = window.location.hash || '#/';
  return hash.slice(1); // '/path?query'
}

export function createRouter() {
  let current = getHashPath();
  const listeners = new Set();

  function getLocation() {
    return current;
  }

  function push(path) {
    if (!path.startsWith('/')) path = '/' + path;
    if ('#/ ' + path !== window.location.hash) {
      window.location.hash = path;
    }
  }

  function onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function notify() {
    current = getHashPath();
    for (const l of listeners) l(current);
  }

  window.addEventListener('hashchange', notify);
  // Initialize
  notify();

  return { getLocation, push, onChange };
}
