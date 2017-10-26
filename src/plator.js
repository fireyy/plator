import './css/style.pcss'
import iconPlay from './img/play.svg'
import iconPause from './img/pause.svg'
import iconReplay from './img/replay.svg'
import iconExpand from './img/expand.svg'
import iconCompress from './img/compress.svg'

const plator = (options = {}) => {
  const skin = 'plator__player'

  let isUpdate, nodes

  // options

  const packed = 'data-packed'
  const type = options.type ? options.type : 'audio'

  const selectors = {
    all: () => toArray(document.querySelectorAll(type)),
    new: () =>
      toArray(document.querySelectorAll(type)).filter(
        node => !node.hasAttribute(`${packed}`)
      )
  }

  // array helpers

  function toArray (input, scope = document) {
    return Array.prototype.slice.call(input)
  }

  // helpers

  function formatTime (time, total) {
    if (isNaN(time)) {
      time = 0
    }

    let secs = parseInt(time % 60)
    let mins = parseInt((time / 60) % 60)
    let hours = parseInt((time / 60 / 60) % 60)

    // Do we need to display hours?
    var displayHours = parseInt((total / 60 / 60) % 60) > 0

    // Ensure it's two digits. For example, 03 rather than 3.
    secs = ('0' + secs).slice(-2)
    mins = ('0' + mins).slice(-2)

    return (displayHours ? hours + ':' : '') + mins + ':' + secs
  }

  function updateButton (uiMap) {
    clearControlTimeout(uiMap.player)
    var icon = uiMap.media.paused ? iconPlay : iconPause
    uiMap.toggle.forEach(button => (button.innerHTML = icon))
  }

  function togglePlay (uiMap) {
    let { media, player } = uiMap

    player.classList.remove('is-waiting')
    var method = media.paused ? 'play' : 'pause'
    media[method]()
    media.paused
      ? player.classList.remove('is-playing')
      : player.classList.add('is-playing')
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

  function setNodes () {
    nodes = selectors[isUpdate ? 'new' : 'all']()
  }

  function buildControls (player) {
    return `
      ${player.media === 'video'
        ? `
          <div class="${skin}__poster"></div>
          <button class="${skin}__button--big ${skin}__button--toggle" title="Toggle Play">${iconPlay}</button>
        `
        : ''}
      <div class="${skin}__controls">
        <button class="${skin}__button ${skin}__button--toggle" title="Toggle media">${iconPlay}</button>
        <span class="${skin}__time--current">00:00</span>
        <div class="${skin}__progress">
          <input class="${skin}__progress--track" type="range" min="0" max="100" step="0.1" value="0">
          <progress max="100" value="0" class="${skin}__progress--played"></progress>
          <progress max="100" value="0" class="${skin}__progress--buffer"></progress>
        </div>
        <span class="${skin}__time--total">00:00</span>
        ${player.media === 'video' ? `<button class="${skin}__button ${skin}__fullscreen" title="Full Screen">${iconExpand}</button>` : ''}
      </div>
    `
  }

  function handleProgress (uiMap) {
    let { media, player } = uiMap

    player.classList.remove('is-waiting')
    uiMap.played.value = uiMap.track.value = media.currentTime
      ? media.currentTime / media.duration * 100
      : 0
    progressTime(uiMap)
  }

  function handleBuffer (uiMap) {
    // try
    try {
      let buffer = uiMap.media.buffered.end(0)
      uiMap.buffer.value = buffer / uiMap.media.duration * 100
    } catch (e) {}
  }

  function progressTime (uiMap) {
    uiMap.current.textContent = formatTime(
      uiMap.media.currentTime,
      uiMap.media.duration
    )
  }

  function durationChange (uiMap) {
    uiMap.total.textContent = formatTime(
      uiMap.media.duration,
      uiMap.media.duration
    )
    progressTime(uiMap)
  }

  function inputProcess (e, uiMap) {
    clearControlTimeout(uiMap.player)
    let time = e.target.value / 100 * uiMap.media.duration

    uiMap.media.currentTime =
      time < 0 ? 0 : time > uiMap.media.duration ? uiMap.media.duration : time
  }

  function toggleFullScreen (uiMap) {
    let player = uiMap.player

    if (
      !document.fullscreenElement && // alternative standard method
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      player.classList.add(`${skin}__fullscreen`)

      if (player.requestFullscreen) {
        player.requestFullscreen()
      } else if (player.mozRequestFullScreen) {
        player.mozRequestFullScreen() // Firefox
      } else if (player.webkitRequestFullscreen) {
        player.webkitRequestFullscreen() // Chrome and Safari
      } else if (player.msRequestFullscreen) {
        player.msRequestFullscreen()
      }

      uiMap.fullscreen.innerHTML = iconCompress
    } else {
      player.classList.remove(`${skin}__fullscreen`)

      if (document.cancelFullScreen) {
        document.cancelFullScreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }

      uiMap.fullscreen.innerHTML = iconExpand
    }
  }

  function onFullScreen (e, uiMap) {
    var isFullscreen = document.webkitFullscreenElement !== null
    if (!isFullscreen) {
      uiMap.player.classList.remove(`${skin}__fullscreen`)
      uiMap.fullscreen.innerHTML = iconExpand
    } else {
      uiMap.fullscreen.innerHTML = iconCompress
    }
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

      let html = buildControls(player)
      player.insertAdjacentHTML('beforeend', html)

      let toggle = player.querySelectorAll(`.${skin}__button--toggle`)
      let uiMap = {
        poster: 'poster',
        track: 'progress--track',
        buffer: 'progress--buffer',
        played: 'progress--played',
        current: 'time--current',
        total: 'time--total',
        fullscreen: 'fullscreen',
        buttonBig: 'button--big'
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

      const events = {
        play (e) {
          updateButton(uiMap)
        },
        pause (e) {
          updateButton(uiMap)
        },
        timeupdate (e) {
          handleProgress(uiMap)
        },
        progress (e) {
          handleBuffer(uiMap)
        },
        waiting (e) {
          player.classList.add('is-waiting')
        },
        ended (e) {
          player.classList.remove('is-playing')
          uiMap.buttonBig.innerHTML = iconReplay
        },
        durationchange (e) {
          durationChange(uiMap)
        }
      }

      // play/pause button action
      toggle.forEach(button =>
        button.addEventListener('click', () => togglePlay(uiMap))
      )

      // media event bind
      Object.keys(events).forEach(evt =>
        media.addEventListener(evt, events[evt], false)
      )

      // process track input
      uiMap.track.addEventListener('input', e => inputProcess(e, uiMap))

      if (player.media === 'video') {
        // click toggle control
        uiMap.poster.addEventListener('click', () => toggleControl(uiMap))

        // fullscreen action
        uiMap.fullscreen.addEventListener('click', e => toggleFullScreen(uiMap))
        'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange'
          .split(' ')
          .forEach(evt =>
            `on${evt}` in document && document.addEventListener(evt, e => onFullScreen(e, uiMap))
          )
      }

      media.setAttribute(packed, '')
    })
  }

  // API

  function setup () {
    isUpdate = false
    setNodes()

    return wrap()
  }

  function update () {
    isUpdate = true
    setNodes()

    return wrap()
  }

  return {
    setup,
    update
  }
}

export default plator
