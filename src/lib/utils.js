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

export function _onMulti (element, events, callback, useCapture) {
  if (element) {
    events
      .split(' ')
      .forEach(evt => element.addEventListener(evt, callback, false))
  }
}

// class helpers

export function _toggleClass (element, className, state) {
  if (element) {
    element.classList[state ? 'add' : 'remove'](className)
  }
}
