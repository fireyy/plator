import CustomEvent from './CustomEvent'

// Default config
var settings = {
  thumbWidth: 15,
  events: {
    start: 'touchstart',
    move: 'touchmove',
    end: 'touchend'
  }
}

// Trigger event
function trigger (element, type, properties) {
  // Bail if no element
  if (!element || !type) {
    return
  }

  // Create and dispatch the event
  var event = new CustomEvent(type, {
    bubbles: true,
    detail: properties
  })

  // Dispatch the event
  element.dispatchEvent(event)
}

// Check if element is disabled
function isDisabled (element) {
  if (element instanceof HTMLElement) { // eslint-disable-line
    return element.disabled
  }

  return true
}

// Get the number of decimal places
function getDecimalPlaces (value) {
  var match = ('' + value).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)

  if (!match) {
    return 0
  }

  return Math.max(
    0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0) -
      // Adjust for scientific notation.
      (match[2] ? +match[2] : 0)
  )
}

// Round to the nearest step
function round (number, step) {
  if (step < 1) {
    var places = getDecimalPlaces(step)
    return parseFloat(number.toFixed(places))
  }
  return Math.round(number / step) * step
}

// Get the value based on touch position
function get (event) {
  var input = event.target
  var touch = event.changedTouches[0]
  var min = parseFloat(input.getAttribute('min')) || 0
  var max = parseFloat(input.getAttribute('max')) || 100
  var step = parseFloat(input.getAttribute('step')) || 1
  var delta = max - min

  // Calculate percentage
  var percent
  var clientRect = input.getBoundingClientRect()
  var thumbWidth = 100 / clientRect.width * (settings.thumbWidth / 2) / 100

  // Determine left percentage
  percent = 100 / clientRect.width * (touch.clientX - clientRect.left)

  // Don't allow outside bounds
  if (percent < 0) {
    percent = 0
  } else if (percent > 100) {
    percent = 100
  }

  // Factor in the thumb offset
  if (percent < 50) {
    percent -= (100 - percent * 2) * thumbWidth
  } else if (percent > 50) {
    percent += (percent - 50) * 2 * thumbWidth
  }

  // Find the closest step to the mouse position
  return min + round(delta * (percent / 100), step)
}

// Update range value based on position
function set (event) {
  if (event.target.type !== 'range' || isDisabled(event.target)) {
    return
  }

  // Prevent text highlight on iOS
  event.preventDefault()

  // Set value
  event.target.value = get(event)

  // Trigger input event
  trigger(event.target, event.type === settings.events.end ? 'change' : 'input')
}

function setup (options) {
  // Bail if not a touch enabled device
  if (!('ontouchstart' in document.documentElement)) {
    return
  }

  if (options && options.thumbWidth) settings.thumbWidth = options.thumbWidth

  // Listen for events
  Object.values(settings.events).forEach(evt =>
    document.body.addEventListener(evt, set, false)
  )
}

export default setup
