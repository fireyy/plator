var CustomEvent
if (typeof window.CustomEvent === 'function') {
  CustomEvent = window.CustomEvent
} else {
  // Polyfill CustomEvent
  // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
  CustomEvent = function (event, params) {
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    }
    var custom = document.createEvent('CustomEvent')
    custom.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    )
    return custom
  }
  CustomEvent.prototype = window.Event.prototype
}

export default CustomEvent
