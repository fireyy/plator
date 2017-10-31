import CustomEvent from './CustomEvent'

class RangeFix {
  constructor (options = {}) {
    // Bail if not a touch enabled device
    if (!('ontouchstart' in document.documentElement)) {
      return
    }

    this.settings = options

    this.events = {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    }

    // Listen for events
    Object.values(this.events).forEach(evt =>
      document.body.addEventListener(evt, this.set.bind(this), false)
    )
  }
  // Trigger event
  trigger (element, type, properties) {
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
  isDisabled (element) {
    if (element instanceof HTMLElement) { // eslint-disable-line
      return element.disabled
    }

    return true
  }

  // Get the number of decimal places
  getDecimalPlaces (value) {
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
  round (number, step) {
    if (step < 1) {
      var places = this.getDecimalPlaces(step)
      return parseFloat(number.toFixed(places))
    }
    return Math.round(number / step) * step
  }

  // Get the value based on touch position
  get (event) {
    var input = event.target
    var touch = event.changedTouches[0]
    var min = parseFloat(input.getAttribute('min')) || 0
    var max = parseFloat(input.getAttribute('max')) || 100
    var step = parseFloat(input.getAttribute('step')) || 1
    var delta = max - min

    // Calculate percentage
    var percent
    var clientRect = input.getBoundingClientRect()
    var thumbWidth = 100 / clientRect.width * (this.settings.thumbWidth / 2) / 100

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
    return min + this.round(delta * (percent / 100), step)
  }

  // Update range value based on position
  set (event) {
    if (event.target.type !== 'range' || this.isDisabled(event.target)) {
      return
    }

    // Prevent text highlight on iOS
    event.preventDefault()

    // Set value
    event.target.value = this.get(event)

    // Trigger input event
    this.trigger(event.target, event.type === this.events.end ? 'change' : 'input')
  }
}

export default RangeFix
