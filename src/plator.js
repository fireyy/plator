const plator = (options = {}) => {

  let isUpdate

  // icon

  const iconPlay = '<i class="plator-play"></i>'
  const iconPause = '<i class="plator-pause"></i>'
  const iconExpand = '<i class="plator-expand"></i>'
  const iconCompress = '<i class="plator-compress"></i>'

  // options

  const packed = options.packed.indexOf('data-') === 0 ? options.packed : `data-${options.packed}`

  const selectors = {
    all: () => toArray(document.querySelectorAll('video')),
    new: () => toArray(document.querySelectorAll('video')).filter(node => !node.hasAttribute(`${packed}`))
  }

  // array helpers

  function toArray (input, scope = document) {
    return Array.prototype.slice.call(input)
  }

  // helpers

  function updateButton (video, toggle) {
    var icon = video.paused ? iconPlay : iconPause
    toggle.forEach(button => button.innerHTML = icon)
 }

  function togglePlay (video, player) {
    var method = video.paused ? 'play' : 'pause'
    video[method]()
    video.paused ? player.classList.remove('is-playing') : player.classList.add('is-playing')
  }

  function setNodes () {
    players = selectors[persist ? 'new' : 'all']()
  }

  function buildControls () {
    let skin = 'plator'

    return `
      <button class="${skin}__button--big toggle" title="Toggle Play">${iconPlay}</button>
      <div class="${skin}__controls">
        <button class="${skin}__button toggle" title="Toggle Video">${iconPlay}</button>
        <span class="${skin}__time--current">00:00</span>
        <span class="${skin}__time--total">00:00</span>
        <button class="${skin}__button fullscreen" title="Full Screen">${iconExpand}</button>
      </div>
    `
  }

  function handleProgress (video, progressBar) {
    var percent = (video.currentTime / video.duration) * 100
    progressBar.style.flexBasis = `${percent}%`
  }

  function wrap () {
    nodes.forEach((video, index) => {

      let player = document.createElement('div')
      player.classList.add('plator__player')
      video.parentNode.insertBefore(player, video)
      player.appendChild(video)

      let html = buildControls()
      player.insertAdjacentHTML('beforeend', html)

      let toggle = player.querySelectorAll('.toggle')
      let progress = player.querySelector('.progress')
      let progressBar = player.querySelector('.progress__filled')

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
          handleProgress(video, progressBar)
        },
        ended (e) {
          //
        },
        durationchange (e) {
          //
        }
      }

      Object.keys(events).forEach(evt => video.addEventListener(evt, events[evt], false))

      video.setAttribute(packed, '')
    })
  }

  // API

  function setup () {
    persist = false

    return wrap()
  }

  function update () {
    persist = true

    return wrap()
  }

  return {
    setup,
    update
  }
}

export default plator
