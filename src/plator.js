import './css/style.pcss'
import SvgIcon from './lib/svg'
import FullScreen from './lib/fullscreen'
import Events from './lib/events'
import { toArray, isNumber, onMulti, toggleClass } from './lib/utils'

const skin = 'plator__player'
const packed = 'data-packed'
const instances = []
let icons = null
let uniqueId = 0

class Plator {
  constructor (media, options = {}) {
    this.full = options.full || 'web'

    if (media.parentNode.classList.contains(`${skin}`)) {
      let parent = media.parentNode
      parent.parentNode.insertBefore(media, parent)
      parent.parentNode.removeChild(parent)
    }

    let player = document.createElement('div')
    player.classList.add(`${skin}`)
    media.parentNode.insertBefore(player, media)
    player.appendChild(media)

    // events
    this.events = new Events()

    // hide control timeout
    this.timer = {}
    this.mediaType = player.mediaType = media.nodeName.toLocaleLowerCase()
    player.classList.add(`${skin}--${this.mediaType}`)
    this.uuid = `${skin}-${this.mediaType}-${uniqueId++}`

    let html = this.buildControls(player)
    player.insertAdjacentHTML('beforeend', html)

    let toggle = player.querySelectorAll(`.${skin}__button--toggle`)
    this.uiMap = {
      poster: 'poster',
      track: 'progress--track',
      buffer: 'progress--buffer',
      played: 'progress--played',
      current: 'time--current',
      total: 'time--total',
      fullscreen: 'fullscreen',
      buttonBig: 'button--big',
      volume: 'volume',
      controls: 'controls'
    }
    Object.keys(this.uiMap).map(item => {
      this.uiMap[item] = player.querySelector(`.${skin}__${this.uiMap[item]}`)
    })

    this.uiMap.player = player
    this.uiMap.toggle = toggle
    this.uiMap.media = media

    if (this.mediaType === 'video') {
      player.classList.add('hide-control')
      media.removeAttribute('controls')
      // webkit video inline play
      media.setAttribute('playsinline', 'true')
      media.setAttribute('webkit-playsinline', 'true')
      // Tecent X5 Browser play inline (Android wechat)
      media.setAttribute('x5-video-player-type', 'h5') // h5 palyer for Tecent X5
      media.setAttribute('x5-video-player-fullscreen', 'true') // prevent landscape for Tecent X5
      media.setAttribute('x5-video-orientation', 'portraint') // default portraint for Tecent X5
      // poster
      this.uiMap.poster.style.backgroundImage = `url(${media.getAttribute(
        'poster'
      )})`
    }

    // events

    // play/pause button action
    toArray(toggle).forEach(button =>
      button.addEventListener('click', () => this.togglePlay())
    )

    // media event bind
    media.addEventListener(
      'ended',
      e => {
        player.classList.remove('is-playing')
        this.showReplay('重播')
      },
      false
    )
    // error handle
    media.addEventListener(
      'error',
      e => {
        console.log('error', e)
        player.error = true
      },
      false
    )
    // Time change on media
    onMulti(media, 'timeupdate seeking', e => this.timeUpdate(e))
    // Display duration
    onMulti(media, 'durationchange loadedmetadata', () => this.durationChange())
    // Check for buffer progress
    onMulti(media, 'progress playing', () => this.handleBuffer())
    // Handle play/pause
    onMulti(media, 'play pause', () => this.updateButton())
    // Loading
    onMulti(media, 'waiting canplay seeked', e => this.checkLoading(e))

    // process track input
    this.uiMap.track.addEventListener('input', e => this.inputProcess(e))

    // events
    this.events.mediaEvents.forEach(evt =>
      media.addEventListener(evt, e => {
        this.setPlayState(evt)
        e.player = this
        this.events.trigger(evt, e)
      })
    )

    if (this.mediaType === 'video') {
      // click toggle control
      this.uiMap.poster.addEventListener('click', () => this.toggleControl())

      // fullscreen action
      let fullScreen = new FullScreen(this, {
        skin: skin
      })

      this.uiMap.fullscreen.addEventListener('click', e =>
        fullScreen.toggle(this.full)
      )
      this.events.on('fullscreen', () => this.onFullScreen(fullScreen))
      this.events.on('fullscreen_cancel', () => this.onFullScreen(fullScreen))
    }

    // volume toggle
    this.uiMap.volume.addEventListener('click', () => this.toggleMuted())

    // media.setAttribute(packed, '')
  }
  formatTime (time) {
    if (isNaN(time)) {
      time = 0
    }

    let secs = parseInt(time % 60)
    let mins = parseInt((time / 60) % 60)
    let hours = parseInt((time / 60 / 60) % 60)

    // Do we need to display hours?
    var displayHours = parseInt((this.getDuration() / 60 / 60) % 60) > 0

    // Ensure it's two digits. For example, 03 rather than 3.
    secs = ('0' + secs).slice(-2)
    mins = ('0' + mins).slice(-2)

    return (displayHours ? hours + ':' : '') + mins + ':' + secs
  }

  updateButton () {
    let { uiMap } = this
    this.clearControlTimeout()
    var icon = uiMap.media.paused ? icons.get('play') : icons.get('pause')
    uiMap.player.classList[uiMap.media.paused ? 'remove' : 'add']('is-playing')
    uiMap.toggle.forEach(button => (button.innerHTML = icon))
    if (uiMap.player.error) {
      uiMap.player.error = false
      this.showReplay('网络繁忙，请重试', uiMap)
    }
  }

  togglePlay () {
    // FIXME: replay need restart(CurrentTime = 0)
    let { media, player } = this.uiMap

    player.classList.remove('is-waiting')
    var method = media.paused ? 'play' : 'pause'
    if (method in media) {
      // FIXME: The element has no supported sources.
      media[method]()
    }
    media.paused
      ? player.classList.remove('is-playing')
      : player.classList.add('is-playing')
  }

  showReplay (msg) {
    this.uiMap.buttonBig.innerHTML = `${icons.get('replay')}<span>${msg}</span>`
  }

  toggleControl () {
    this.uiMap.player.classList.toggle('hide-control')
    this.clearControlTimeout()
  }

  clearControlTimeout () {
    if (this.timer.control) {
      clearTimeout(this.timer.control)
    }

    this.timer.control = setTimeout(() => {
      this.uiMap.player.classList.add('hide-control')
    }, 3000)
  }

  buildControls (player) {
    return `
      ${player.mediaType === 'video'
        ? `
          <div class="${skin}__poster"></div>
          <button class="${skin}__button--big ${skin}__button--toggle" title="Toggle Play">${icons.get(
            'play'
          )}</button>
        `
        : ''}
      <div class="${skin}__controls">
        <button class="${skin}__button ${skin}__button--toggle" title="Toggle media">${icons.get(
      'play'
    )}</button>
        <span class="${skin}__time--current">00:00</span>
        <div class="${skin}__progress">
          <input class="${skin}__progress--track" type="range" min="0" max="100" step="0.1" value="0">
          <progress max="100" value="0" class="${skin}__progress--played"></progress>
          <progress max="100" value="0" class="${skin}__progress--buffer"></progress>
        </div>
        <span class="${skin}__time--total">00:00</span>
        <button class="${skin}__button ${skin}__volume" title="Volume">${icons.get(
            'volume'
          )}</button>
        ${player.mediaType === 'video'
          ? `<button class="${skin}__button ${skin}__fullscreen" title="Full Screen">${icons.get(
              'expand'
            )}</button>`
          : ''}
      </div>
    `
  }

  timeUpdate (e) {
    let { uiMap } = this
    let { media, player } = uiMap

    this.progressTime()

    // Ignore updates while seeking
    if (e && e.type === 'timeupdate' && media.seeking) {
      return
    }

    player.classList.remove('is-waiting')

    let value = this.getPercentage(media.currentTime, this.getDuration())
    if (e.type === 'timeupdate' && uiMap.track) {
      uiMap.track.value = value
    }
    this.setProgress(uiMap.played, value)
  }

  setProgress (progress, value) {
    progress.value = value
  }

  handleBuffer () {
    let { uiMap } = this
    // try
    try {
      let buffer = uiMap.media.buffered.end(0)
      let value = this.getPercentage(buffer, this.getDuration())
      this.setProgress(uiMap.buffer, value)
    } catch (e) {}
  }

  progressTime () {
    this.uiMap.current.textContent = this.formatTime(
      this.uiMap.media.currentTime
    )
  }

  durationChange () {
    let { uiMap } = this
    if (uiMap.player.currentTime) {
      uiMap.media.currentTime = uiMap.player.currentTime
    }
    let duration = this.getDuration()
    uiMap.total.textContent = this.formatTime(duration)
    this.progressTime()
  }

  inputProcess (e) {
    let { uiMap } = this
    this.clearControlTimeout()

    let duration = this.getDuration()
    let time = e.target.value / e.target.max * duration

    time = time < 0 ? 0 : time > duration ? duration : time

    this.updateSeekDisplay(time)

    try {
      uiMap.media.currentTime = time.toFixed(4)
    } catch (e) {}
  }

  updateSeekDisplay (time) {
    let { uiMap } = this
    // Default to 0
    if (!isNumber(time)) {
      time = 0
    }

    let value = this.getPercentage(time, this.getDuration())

    // Update palyed progress
    if (uiMap.played) {
      uiMap.played.value = value
    }

    // Update range input
    if (uiMap.track) {
      uiMap.track.value = value
    }
  }

  // Get percentage
  getPercentage (current, max) {
    if (current === 0 || max === 0 || isNaN(current) || isNaN(max)) {
      return 0
    }
    return (current / max * 100).toFixed(2)
  }

  // Get the duration
  getDuration () {
    let { uiMap } = this
    let mediaDuration = 0

    // Only if duration available
    if (uiMap.media.duration !== null && !isNaN(uiMap.media.duration)) {
      mediaDuration = uiMap.media.duration
    }

    return mediaDuration
  }

  onFullScreen (fullScreen) {
    let { uiMap } = this
    if (!fullScreen.isFullScreen(this.full)) {
      uiMap.player.classList.remove(`${skin}__fullscreen`)
      uiMap.fullscreen.innerHTML = icons.get('expand')
    } else {
      uiMap.player.classList.add(`${skin}__fullscreen`)
      uiMap.fullscreen.innerHTML = icons.get('compress')
    }
  }

  checkLoading (e) {
    let { uiMap } = this
    var loading = e.type === 'waiting'

    // Clear timer
    clearTimeout(this.timer.loading)

    this.timer.loading = setTimeout(() => {
      toggleClass(uiMap.player, 'is-waiting', loading)
    }, loading ? 250 : 0)
  }

  setPlayState (state) {
    this.uiMap.player.setAttribute('data-play-state', state)
  }

  toggleMuted () {
    let { media, volume } = this.uiMap
    media.muted = !media.muted
    volume.innerHTML = icons.get(media.muted ? 'muted' : 'volume')
  }
}

export default function (options = {}) {
  const type = options.type ? options.type : 'video'
  icons = new SvgIcon(options)

  const selectors = () => {
    return toArray(document.querySelectorAll(type)).filter(
      node => !node.hasAttribute(`${packed}`)
    )
  }
  // TODO: make sure only one instance playing
  instances.setup = (plugins = []) => {
    selectors().forEach(media => {
      let instance = new Plator(media, options)
      instances.push(instance)
      plugins.forEach(plugin => plugin(instance))
    })
    return instances
  }

  instances.on = (event, callback) => {
    instances.forEach(instance => {
      instance.events.on(event, callback)
    })
    return instances
  }

  return instances
}
