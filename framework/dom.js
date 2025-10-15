// Minimal DOM abstraction and naive virtual DOM renderer

export function h(tag, attrs = {}, ...rawChildren) {
  const children = rawChildren
    .flat()
    .filter(c => c !== null && c !== undefined && c !== false)
    .map(c => (typeof c === 'string' || typeof c === 'number') ? { tag: '#text', text: String(c) } : c);

  return { tag, attrs, children };
}

function setAttrs(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value === null || value === undefined) {
      el.removeAttribute(key);
      // For boolean properties, also set the property to false
      if (key === 'checked' || key === 'disabled' || key === 'selected') {
        try { el[key] = false; } catch {}
      }
    } else if (key === 'value' && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      el.value = value;
    } else if (key === 'checked' || key === 'disabled' || key === 'selected') {
      // For boolean properties, set both attribute and property
      el.setAttribute(key, '');
      try { el[key] = true; } catch {}
    } else if (key === 'className') {
      el.setAttribute('class', value);
    } else {
      el.setAttribute(key, value);
    }
  }
}

function createElement(vnode) {
  if (vnode.tag === '#text') {
    return document.createTextNode(vnode.text || '');
  }
  if (vnode.tag === '#fragment') {
    const frag = document.createDocumentFragment();
    for (const child of vnode.children || []) {
      frag.appendChild(createElement(child));
    }
    return frag;
  }
  const el = document.createElement(vnode.tag);
  if (vnode.attrs) setAttrs(el, vnode.attrs);
  if (vnode.children) {
    for (const child of vnode.children) {
      el.appendChild(createElement(child));
    }
  }
  return el;
}

function updateAttrs(el, oldAttrs = {}, newAttrs = {}) {
  // Remove old attributes not present anymore
  for (const key of Object.keys(oldAttrs)) {
    if (!(key in newAttrs)) {
      el.removeAttribute(key);
      // For boolean properties, also set the property to false
      if (key === 'checked' || key === 'disabled' || key === 'selected') {
        try { el[key] = false; } catch {}
      }
    }
  }
  // Set new attributes
  setAttrs(el, newAttrs);
}

export function mount(vnode, container) {
  const el = createElement(vnode);
  container.innerHTML = '';
  container.appendChild(el);
  return el;
}

export function diff(parent, oldNode, newNode, index = 0) {
  // Very naive diff: replace if tag changed; update text; shallow attrs; index-based children
  const parentEl = parent;
  const oldEl = parentEl.childNodes[index];

  if (!oldNode) {
    parentEl.appendChild(createElement(newNode));
    return;
  }
  if (!newNode) {
    if (oldEl) parentEl.removeChild(oldEl);
    return;
  }
  if (oldNode.tag !== newNode.tag || newNode.tag === '#fragment') {
    parentEl.replaceChild(createElement(newNode), oldEl);
    return;
  }

  if (newNode.tag === '#text') {
    if (oldNode.text !== newNode.text && oldEl.nodeType === Node.TEXT_NODE) {
      oldEl.textContent = newNode.text || '';
    }
    return;
  }

  // Update attrs
  updateAttrs(oldEl, oldNode.attrs, newNode.attrs);

  const oldChildren = oldNode.children || [];
  const newChildren = newNode.children || [];
  const max = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < max; i++) {
    diff(oldEl, oldChildren[i], newChildren[i], i);
  }
}

export function render(nextVNode, container, state) {
  const prev = container.__vnode;
  if (!prev || prev.tag === '#fragment' || nextVNode.tag === '#fragment') {
    mount(nextVNode, container);
  } else {
    diff(container, prev, nextVNode, 0);
  }
  container.__vnode = nextVNode;
  container.__state = state;
}
