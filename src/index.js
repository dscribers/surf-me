import AutoSurf from '@dscribers/autosurf'
import WebSurf from '@dscribers/websurf-adapter'

// in an iframe
if (window.parent !== window) {
  const $surfer = new AutoSurf(new WebSurf())

  $surfer
    .on('*', function (event) {
      window.parent.postMessage(event, '*')
    })
    .ready((isNotNew) => {
      if (!isNotNew) {
        // @todo: change * to testsuite live site origin
        window.parent.postMessage({ name: 'ready' }, '*')
      }
    })

  function receivedCommand({ data = {} }) {
    try {
      $surfer[data.name](data.detail)
    } catch (e) {
      console.error(e.message, data)
    }
  }

  window.addEventListener('message', receivedCommand, false)
}
