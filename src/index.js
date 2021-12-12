import WebSurf from '@dscribers/autosurf-websurf-adapter'

// @todo: change * to https://app.testsuite.com
const targetOrigin = '*'

// in an iframe
if (window.parent !== window) {
  const $surfer = new WebSurf()
  const sendToParent = (data) => window.parent.postMessage(data, targetOrigin)

  $surfer.whenDone(({ success, message }) => {
    sendToParent({ name: 'actionDone', detail: { success, message } })
  })

  function receivedCommand ({ data = {}, origin }) {
    if (targetOrigin !== '*' && origin !== targetOrigin) {
      return
    }

    try {
      $surfer[data.action](...data.params)
    } catch (e) {
      sendToParent({ name: 'actionDone', detail: { success: false, message: e.message } })
    }
  }

  window.addEventListener('message', receivedCommand, false)

  sendToParent({ name: 'ready' })
}
