// type helpers

export function isNumber (input) {
  return (
    input !== null &&
    ((typeof input === 'number' && !isNaN(input - 0)) ||
      (typeof input === 'object' && input.constructor === Number))
  )
}

// array helpers

export function toArray (input, scope = document) {
  return Array.prototype.slice.call(input)
}

// event helpers

export function onMulti (element, events, callback, useCapture) {
  if (element) {
    events
      .split(' ')
      .forEach(evt => element.addEventListener(evt, callback, false))
  }
}

// class helpers

export function toggleClass (element, className, state) {
  if (element) {
    element.classList[state ? 'add' : 'remove'](className)
  }
}

export function getScrollPosition () {
  return {
    left:
      window.pageXOffset ||
      document.documentElement.scrollLeft ||
      document.body.scrollLeft ||
      0,
    top:
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
  }
}

export function setScrollPosition ({ left = 0, top = 0 }) {
  window.scrollTo(left, top)
}
