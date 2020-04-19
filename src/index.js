// in an iframe
if (window.parent !== window) {
  const $surfer = new require('@dscribers/autosurf')()

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
    if ($surfer.hasOwnProperty(data.name)) {
      $surfer[data.name](data.detail)
    }
  }

  window.addEventListener('message', receivedCommand, false)
}
