import { setScrollPosition, getScrollPosition } from './utils'

class FullScreen {
  constructor (plator, options = {}) {
    this.uiMap = plator.uiMap
    this.events = plator.events
    this.settings = options

    const fullscreenchange = () => {
      if (this.isFullScreen('browser')) {
        this.events.trigger('fullscreen')
      } else {
        this.events.trigger('fullscreen_cancel')
      }
    }

    // Handle user exiting fullscreen by escaping etc
    'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange'
      .split(' ')
      .forEach(
        evt =>
          `on${evt}` in document &&
          document.addEventListener(evt, fullscreenchange)
      )
  }

  isFullScreen (type = 'web') {
    switch (type) {
      case 'browser':
        return (
          document.fullscreenElement ||
          document.mozFullScreenElement ||
          this.uiMap.media.webkitDisplayingFullscreen ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        )
      case 'web':
        return this.uiMap.player.classList.contains(
          `${this.settings.skin}__fullscreen`
        )
    }
  }

  request (type = 'web') {
    switch (type) {
      case 'browser':
        if (this.uiMap.player.requestFullscreen) {
          this.uiMap.player.requestFullscreen()
        } else if (this.uiMap.player.mozRequestFullScreen) {
          this.uiMap.player.mozRequestFullScreen()
        } else if (this.uiMap.media.webkitEnterFullscreen) {
          // Safari for iOS
          this.uiMap.media.webkitEnterFullscreen()
        } else if (this.uiMap.player.webkitRequestFullscreen) {
          this.uiMap.player.webkitRequestFullscreen()
        } else if (this.uiMap.player.msRequestFullscreen) {
          this.uiMap.player.msRequestFullscreen()
        }
        break
      case 'web':
        this.uiMap.player.classList.add(`${this.settings.skin}__fullscreen`)

        // record last position then hide scrollbars
        this.lastScrollPosition = getScrollPosition()
        document.body.classList.add('plator-web-fullscreen-fix')

        this.events.trigger('fullscreen')
        break
    }
  }

  cancel (type = 'web') {
    switch (type) {
      case 'browser':
        if (document.cancelFullScreen) {
          document.cancelFullScreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (this.uiMap.media.webkitExitFullscreen) {
          this.uiMap.media.webkitExitFullscreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        break
      case 'web':
        this.uiMap.player.classList.remove(`${this.settings.skin}__fullscreen`)

        // restore scrollbars and last position
        document.body.classList.remove('plator-web-fullscreen-fix')
        setScrollPosition(this.lastScrollPosition)

        this.events.trigger('fullscreen_cancel')
        break
    }
  }

  toggle (type = 'web') {
    if (this.isFullScreen(type)) {
      this.cancel(type)
    } else {
      this.request(type)
    }
  }
}

export default FullScreen
