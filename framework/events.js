// Declarative event system (no direct addEventListener usage by user code)
// Usage: bindEvents(root, { 'click .selector': handler, 'input #id': handler })

function parseKey(key) {
  const [type, ...selParts] = key.trim().split(/\s+/);
  const selector = selParts.join(' ').trim();
  return { type, selector };
}

export function bindEvents(root, map) {
  const delegators = [];
  for (const [key, handler] of Object.entries(map)) {
    const { type, selector } = parseKey(key);
    const delegator = (ev) => {
      const target = ev.target.closest(selector || '*');
      if (!target || !root.contains(target)) return;
      handler(ev, target);
    };
    root.addEventListener(type, delegator);
    delegators.push({ type, delegator });
  }
  return () => {
    for (const { type, delegator } of delegators) {
      root.removeEventListener(type, delegator);
    }
  };
}
