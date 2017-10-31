import './css/style.pcss'
import SvgIcon from './lib/svg'
import RangeFix from './lib/range'
import FullScreen from './lib/fullscreen'

// TODO: class and instances
const plator = (options = {}) => {
  const skin = 'plator__player'

  let icons = new SvgIcon(options)

  let nodes

  // options

  const packed = 'data-packed'
  const type = options.type ? options.type : 'audio'

  function selectors () {
    return toArray(document.querySelectorAll(type)).filter(
      node => !node.hasAttribute(`${packed}`)
    )
  }

  // type helpers

  function isNumber (input) {
    return (
      input !== null &&
      ((typeof input === 'number' && !isNaN(input - 0)) ||
        (typeof input === 'object' && input.constructor === Number))
    )
  }

  // array helpers

  function toArray (input, scope = document) {
    return Array.prototype.slice.call(input)
  }

  // event helpers

  function _onMulti (element, events, callback, useCapture) {
    if (element) {
      events
        .split(' ')
        .forEach(evt => element.addEventListener(evt, callback, false))
    }
  }

  // class helpers

  function _toggleClass (element, className, state) {
    if (element) {
      element.classList[state ? 'add' : 'remove'](className)
    }
  }

  // helpers

  function formatTime (time, uiMap) {
    if (isNaN(time)) {
      time = 0
    }

    let secs = parseInt(time % 60)
    let mins = parseInt((time / 60) % 60)
    let hours = parseInt((time / 60 / 60) % 60)

    // Do we need to display hours?
    var displayHours = parseInt((getDuration(uiMap) / 60 / 60) % 60) > 0

    // Ensure it's two digits. For example, 03 rather than 3.
    secs = ('0' + secs).slice(-2)
    mins = ('0' + mins).slice(-2)

    return (displayHours ? hours + ':' : '') + mins + ':' + secs
  }

  function updateButton (uiMap) {
    clearControlTimeout(uiMap.player)
    var icon = uiMap.media.paused ? icons.get('play') : icons.get('pause')
    uiMap.player.classList[uiMap.media.paused ? 'remove' : 'add']('is-playing')
    uiMap.toggle.forEach(button => (button.innerHTML = icon))
    if (uiMap.player.error) {
      uiMap.player.error = false
      showReplay('网络繁忙，请重试', uiMap)
    }
  }

  function togglePlay (uiMap) {
    // FIXME: replay need restart(CurrentTime = 0)
    let { media, player } = uiMap

    player.classList.remove('is-waiting')
    var method = media.paused ? 'play' : 'pause'
    if (method in media) {
      media[method]()
    }
    media.paused
      ? player.classList.remove('is-playing')
      : player.classList.add('is-playing')
  }

  function showReplay (msg, uiMap) {
    uiMap.buttonBig.innerHTML = `${icons.get('replay')}<span>${msg}</span>`
  }

  function toggleControl (uiMap) {
    uiMap.player.classList.toggle('hide-control')
    clearControlTimeout(uiMap.player)
  }

  function clearControlTimeout (player) {
    if (player.control_timeout) {
      clearTimeout(player.control_timeout)
    }

    player.control_timeout = setTimeout(() => {
      player.classList.add('hide-control')
    }, 3000)
  }

  function buildControls (player) {
    return `
      ${player.media === 'video'
        ? `
          <div class="${skin}__poster"></div>
          <button class="${skin}__button--big ${skin}__button--toggle" title="Toggle Play">${icons.get('play')}</button>
        `
        : ''}
      <div class="${skin}__controls">
        <button class="${skin}__button ${skin}__button--toggle" title="Toggle media">${icons.get('play')}</button>
        <span class="${skin}__time--current">00:00</span>
        <div class="${skin}__progress">
          <input class="${skin}__progress--track" type="range" min="0" max="100" step="0.1" value="0">
          <progress max="100" value="0" class="${skin}__progress--played"></progress>
          <progress max="100" value="0" class="${skin}__progress--buffer"></progress>
        </div>
        <span class="${skin}__time--total">00:00</span>
        ${player.sources && Object.keys(player.sources).length > 0
          ? `
        <span class="${skin}__quality--list">
          <select>
          ${Object.keys(player.sources).map(
            s => `<option value="${player.sources[s]}">${s}</option>`
          )}
          </select>
        </span>
        `
          : ''}
        ${player.media === 'video'
          ? `<button class="${skin}__button ${skin}__fullscreen" title="Full Screen">${icons.get('expand')}</button>`
          : ''}
      </div>
    `
  }

  function timeUpdate (e, uiMap) {
    let { media, player } = uiMap

    progressTime(uiMap)

    // Ignore updates while seeking
    if (e && e.type === 'timeupdate' && media.seeking) {
      return
    }

    player.classList.remove('is-waiting')

    let value = getPercentage(media.currentTime, getDuration(uiMap))
    if (e.type === 'timeupdate' && uiMap.track) {
      uiMap.track.value = value
    }
    setProgress(uiMap.played, value)
  }

  function setProgress (progress, value) {
    progress.value = value
  }

  function handleBuffer (uiMap) {
    // try
    try {
      let buffer = uiMap.media.buffered.end(0)
      let value = getPercentage(buffer, getDuration(uiMap))
      setProgress(uiMap.buffer, value)
    } catch (e) {}
  }

  function progressTime (uiMap) {
    uiMap.current.textContent = formatTime(uiMap.media.currentTime, uiMap)
  }

  function durationChange (uiMap) {
    if (uiMap.player.currentTime) {
      uiMap.media.currentTime = uiMap.player.currentTime
    }
    let duration = getDuration(uiMap)
    uiMap.total.textContent = formatTime(duration, uiMap)
    progressTime(uiMap)
  }

  function inputProcess (e, uiMap) {
    clearControlTimeout(uiMap.player)

    let duration = getDuration(uiMap)
    let time = e.target.value / e.target.max * duration

    time = time < 0 ? 0 : time > duration ? duration : time

    updateSeekDisplay(time, uiMap)

    try {
      uiMap.media.currentTime = time.toFixed(4)
    } catch (e) {}
  }

  function updateSeekDisplay (time, uiMap) {
    // Default to 0
    if (!isNumber(time)) {
      time = 0
    }

    let duration = getDuration(uiMap)
    let value = getPercentage(time, duration)

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
  function getPercentage (current, max) {
    if (current === 0 || max === 0 || isNaN(current) || isNaN(max)) {
      return 0
    }
    return (current / max * 100).toFixed(2)
  }

  // Get the duration
  function getDuration (uiMap) {
    let mediaDuration = 0

    // Only if duration available
    if (uiMap.media.duration !== null && !isNaN(uiMap.media.duration)) {
      mediaDuration = uiMap.media.duration
    }

    return mediaDuration
  }

  function onFullScreen (e, uiMap, fullScreen) {
    if (!fullScreen.isFullScreen()) {
      uiMap.player.classList.remove(`${skin}__fullscreen`)
      uiMap.fullscreen.innerHTML = icons.get('expand')
    } else {
      uiMap.player.classList.add(`${skin}__fullscreen`)
      uiMap.fullscreen.innerHTML = icons.get('compress')
    }
  }

  function selectQuality (url, uiMap) {
    // uiMap
    uiMap.player.currentTime = uiMap.media.currentTime
    uiMap.media.setAttribute('src', url)
    // uiMap.media.load()
    if ('play' in uiMap.media) {
      uiMap.media.play()
    }
  }

  function checkLoading (e, uiMap) {
    var loading = e.type === 'waiting'

    // Clear timer
    clearTimeout(uiMap.player.loadingTimer)

    uiMap.player.loadingTimer = setTimeout(function () {
      _toggleClass(uiMap.player, 'is-waiting', loading)
    }, loading ? 250 : 0)
  }

  function wrap () {
    nodes.forEach((media, index) => {
      let player = document.createElement('div')
      player.classList.add(`${skin}`)
      media.parentNode.insertBefore(player, media)
      player.appendChild(media)

      // hide control timeout
      player.control_timeout = null
      player.media = media.nodeName.toLocaleLowerCase()
      player.classList.add(`${skin}--${player.media}`)

      // get all sources
      player.sources = null
      if (player.media === 'video') {
        player.sources = {}
        toArray(media.querySelectorAll('source')).forEach((el, i) => {
          player.sources[el.getAttribute('label')] = el.getAttribute('src')
          media.removeChild(el)
        })
      }

      let html = buildControls(player)
      player.insertAdjacentHTML('beforeend', html)

      // fix input range touch
      new RangeFix({ // eslint-disable-line
        thumbWidth: 12
      })

      let toggle = player.querySelectorAll(`.${skin}__button--toggle`)
      let uiMap = {
        poster: 'poster',
        track: 'progress--track',
        buffer: 'progress--buffer',
        played: 'progress--played',
        current: 'time--current',
        total: 'time--total',
        fullscreen: 'fullscreen',
        buttonBig: 'button--big',
        qualityList: 'quality--list select'
      }
      Object.keys(uiMap).map(item => {
        uiMap[item] = player.querySelector(`.${skin}__${uiMap[item]}`)
      })

      uiMap.player = player
      uiMap.toggle = toggle
      uiMap.media = media

      // poster
      if (player.media === 'video') {
        player.classList.add('hide-control')
        media.removeAttribute('controls')
        uiMap.poster.style.backgroundImage = `url(${media.getAttribute(
          'poster'
        )})`
      }

      // events

      // play/pause button action
      toArray(toggle).forEach(button =>
        button.addEventListener('click', () => togglePlay(uiMap))
      )

      // media event bind
      media.addEventListener(
        'ended',
        e => {
          player.classList.remove('is-playing')
          showReplay('重播', uiMap)
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
      _onMulti(media, 'timeupdate seeking', e => timeUpdate(e, uiMap))
      // Display duration
      _onMulti(media, 'durationchange loadedmetadata', () =>
        durationChange(uiMap)
      )
      // Check for buffer progress
      _onMulti(media, 'progress playing', () => handleBuffer(uiMap))
      // Handle play/pause
      _onMulti(media, 'play pause', () => updateButton(uiMap))
      // Loading
      _onMulti(media, 'waiting canplay seeked', e => checkLoading(e, uiMap))

      // process track input
      uiMap.track.addEventListener('input', e => inputProcess(e, uiMap))

      if (player.media === 'video') {
        // click toggle control
        uiMap.poster.addEventListener('click', () => toggleControl(uiMap))

        // click quality switcher
        uiMap.qualityList &&
          uiMap.qualityList.addEventListener('change', e =>
            selectQuality(e.target.value, uiMap)
          )

        // fullscreen action
        let fullScreen = new FullScreen(uiMap, {
          skin: skin
        })
        uiMap.fullscreen.addEventListener('click', e => fullScreen.toggle())
        // Handle user exiting fullscreen by escaping etc
        'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange'
          .split(' ')
          .forEach(
            evt =>
              `on${evt}` in document &&
              document.addEventListener(evt, e => onFullScreen(e, uiMap, fullScreen))
          )
      }

      media.setAttribute(packed, '')
    })
  }

  // API

  function setup () {
    nodes = selectors()

    return wrap()
  }

  return {
    setup
  }
}

export default plator
