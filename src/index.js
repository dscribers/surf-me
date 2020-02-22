import AutoSurf from '@dscribers/autosurf'

// in an iframe
if (window.parent !== window) {
  const surf = function() {
    window.addEventListener('message', receivedCommand, false)

    const Events = {
      listenToEvents() {
        this.scheduler = AutoSurf.on('*', function(event) {
          window.parent.postMessage(event, '*')
        })
      },
      pause() {
        if (this.scheduler) {
          this.scheduler.pause()
        }
      },
      restart() {
        if (this.scheduler) {
          this.scheduler.restart()
        }
      },
      resume() {
        if (this.scheduler) {
          this.scheduler.resume()
        }
      },
      start(feature) {
        this.listenToEvents()
        this.scheduler
          .parseFeature(feature)
          .clearBackup()
          .start({
            debug: true,
            delayBetweenSchedules: 3000
          })
      }
    }

    function receivedCommand({ data = {} }) {
      if (Events.hasOwnProperty(data.name)) {
        Events[data.name](data.detail)
      }
    }

    AutoSurf.ready(
      isNotNew => {
        if (isNotNew) {
          Events.listenToEvents()
        }
      },
      isNotNew => {
        if (!isNotNew) {
          // @todo: change * to testsuite live site origin
          window.parent.postMessage({ name: 'ready' }, '*')
        }
      }
    )
  }

  const oldLoadFunc = window.onload
  window.onload = function() {
    if (typeof oldLoadFunc === 'function') {
      oldLoadFunc()
    }

    surf()
  }

  const oldBeforeUnloadFunc = window.onbeforeunload
  window.onbeforeunload = function() {
    if (typeof oldBeforeUnloadFunc === 'function') {
      oldBeforeUnloadFunc()
    }

    AutoSurf.backup()
  }
}
