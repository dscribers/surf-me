import AutoSurf from '@dscribers/autosurf'
import WebSurf from '@dscribers/autosurf-websurf-adapter'

// @todo: change * to https://app.testsuite.com
const targetOrigin = '*'

// in an iframe
if (window.parent !== window) {
  const $surfer = new AutoSurf(new WebSurf())

  $surfer
    .on('*', function (event) {
      window.parent.postMessage(event, targetOrigin)
    })
    .ready((isNotNew) => {
      if (!isNotNew) {
        window.parent.postMessage({ name: 'ready' }, targetOrigin)
      }
    })

  function receivedCommand ({ data = {}, origin }) {
    if (targetOrigin !== '*' && origin !== targetOrigin) {
      return
    }

    try {
      $surfer[data.name](data.detail)
    } catch (e) {}
  }

  window.addEventListener('message', receivedCommand, false)
}
