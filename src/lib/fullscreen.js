class FullScreen {
  constructor (uiMap, options = {}) {
    this.uiMap = uiMap
    this.settings = options
    this.supportsFullScreen = false
    let browserPrefixes = 'webkit moz ms'.split(' ')

    if (document.cancelFullScreen) {
      this.supportsFullScreen = true
    } else {
      // Check for fullscreen support by vendor prefix
      for (var i = 0, il = browserPrefixes.length; i < il; i++) {
        if (document[browserPrefixes[i] + 'CancelFullScreen']) {
          this.supportsFullScreen = true
          break
        } else if (
          document.msExitFullscreen &&
          document.msFullscreenEnabled
        ) {
          // Special case for MS
          this.supportsFullScreen = true
          break
        }
      }
    }
  }

  isFullScreen () {
    let type = this.supportsFullScreen ? 'browser' : 'web'
    switch (type) {
      case 'browser':
        return (
          document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        )
      case 'web':
        return this.uiMap.player.classList.contains(
          `${this.settings.skin}__fullscreen`
        )
    }
  }

  request (type = 'browser') {
    switch (type) {
      case 'browser':
        if (this.uiMap.player.requestFullscreen) {
          this.uiMap.player.requestFullscreen()
        } else if (this.uiMap.player.mozRequestFullScreen) {
          this.uiMap.player.mozRequestFullScreen()
        } else if (this.uiMap.player.webkitRequestFullscreen) {
          this.uiMap.player.webkitRequestFullscreen()
        } else if (this.uiMap.media.webkitEnterFullscreen) {
          // Safari for iOS
          this.uiMap.media.webkitEnterFullscreen()
        } else if (this.uiMap.player.msRequestFullscreen) {
          this.uiMap.player.msRequestFullscreen()
        }
        break
      case 'web':
        this.uiMap.player.classList.add(`${this.settings.skin}__fullscreen`)
        break
    }
  }

  cancel (type = 'browser') {
    switch (type) {
      case 'browser':
        if (document.cancelFullScreen) {
          document.cancelFullScreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (this.uiMap.media.webkitExitFullscreen) {
          this.uiMap.media.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        break
      case 'web':
        this.uiMap.player.classList.remove(
          `${this.settings.skin}__fullscreen`
        )
        break
    }
  }

  toggle () {
    let type = this.supportsFullScreen ? 'browser' : 'web'
    if (this.isFullScreen()) {
      this.cancel(type)
    } else {
      this.request(type)
    }
  }
}

export default FullScreen
