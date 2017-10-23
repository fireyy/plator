import './css/style.pcss'

const plator = (options = {}) => {
  const skin = 'plator__player'

  let isUpdate, nodes

  // icon

  const iconPlay = `<i class="${skin}__icon--play"></i>`
  const iconPause = `<i class="${skin}__icon--pause"></i>`
  const iconExpand = `<i class="${skin}__icon--expand"></i>`
  const iconCompress = `<i class="${skin}__icon--compress"></i>`

  // options

  const packed = 'data-packed'

  const selectors = {
    all: () => toArray(document.querySelectorAll('video')),
    new: () =>
      toArray(document.querySelectorAll('video')).filter(
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

  function updateButton (video, toggle) {
    var icon = video.paused ? iconPlay : iconPause
    toggle.forEach(button => (button.innerHTML = icon))
  }

  function togglePlay (video, player) {
    var method = video.paused ? 'play' : 'pause'
    video[method]()
    video.paused
      ? player.classList.remove('is-playing')
      : player.classList.add('is-playing')
  }

  function setNodes () {
    nodes = selectors[isUpdate ? 'new' : 'all']()
  }

  function buildControls () {
    return `
      <button class="${skin}__button--big toggle" title="Toggle Play">${iconPlay}</button>
      <div class="${skin}__controls">
        <button class="${skin}__button toggle" title="Toggle Video">${iconPlay}</button>
        <span class="${skin}__time--current">00:00</span>
        <div class="${skin}__progress">
          <input class="${skin}__progress--track" type="range" min="0" max="100" step="0.1" value="0">
          <progress max="100" value="0" class="${skin}__progress--played"></progress>
          <progress max="100" value="0" class="${skin}__progress--buffer"></progress>
        </div>
        <span class="${skin}__time--total">00:00</span>
        <button class="${skin}__button ${skin}__fullscreen" title="Full Screen">${iconExpand}</button>
      </div>
    `
  }

  function handleProgress (video, uiMap) {
    uiMap.played.value = uiMap.track.value = video.currentTime
      ? video.currentTime / video.duration * 100
      : 0
    progressTime(video, uiMap)
  }

  function handleBuffer (video, uiMap) {
    // try
    try {
      let buffer = video.buffered.end(0)
      uiMap.buffer.value = buffer / video.duration * 100
    } catch (e) {}
  }

  function progressTime (video, uiMap) {
    uiMap.current.textContent = formatTime(video.currentTime, video.duration)
  }

  function durationChange (video, uiMap) {
    uiMap.total.textContent = formatTime(video.duration, video.duration)
    progressTime(video, uiMap)
  }

  function inputProcess (e, video) {
    let time = e.target.value / 100 * video.duration

    video.currentTime =
      time < 0 ? 0 : time > video.duration ? video.duration : time
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
    nodes.forEach((video, index) => {
      let player = document.createElement('div')
      player.classList.add(`${skin}`)
      video.parentNode.insertBefore(player, video)
      player.appendChild(video)

      let html = buildControls()
      player.insertAdjacentHTML('beforeend', html)

      let toggle = player.querySelectorAll('.toggle')
      let uiMap = {
        track: 'progress--track',
        buffer: 'progress--buffer',
        played: 'progress--played',
        current: 'time--current',
        total: 'time--total',
        fullscreen: 'fullscreen'
      }
      Object.keys(uiMap).map(item => {
        uiMap[item] = player.querySelector(`.${skin}__${uiMap[item]}`)
      })

      uiMap.player = player

      // events

      const events = {
        click (e) {
          togglePlay(video, player)
        },
        play (e) {
          updateButton(video, toggle)
        },
        pause (e) {
          updateButton(video, toggle)
        },
        timeupdate (e) {
          handleProgress(video, uiMap)
        },
        progress (e) {
          handleBuffer(video, uiMap)
        },
        waiting (e) {
          updateButton(video, toggle)
        },
        ended (e) {
          //
        },
        durationchange (e) {
          durationChange(video, uiMap)
        }
      }

      // play/pause button action
      toggle.forEach(button =>
        button.addEventListener('click', () => togglePlay(video, player))
      )

      // video event bind
      Object.keys(events).forEach(evt =>
        video.addEventListener(evt, events[evt], false)
      )

      // process track input
      uiMap.track.addEventListener('input', e => inputProcess(e, video))

      // fullscreen action
      uiMap.fullscreen.addEventListener('click', e =>
        toggleFullScreen(uiMap)
      )
      'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange'
        .split(' ')
        .forEach(evt =>
          player.addEventListener(evt, e => onFullScreen(e, uiMap))
        )

      video.setAttribute(packed, '')
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
