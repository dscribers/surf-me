import WebSurf from './WebSurf'
import { version } from '../package.json'

// @todo: change * to https://app.testsuite.com
const targetOrigin = '*'

// in an iframe
if (window.parent !== window) {
  const $surfer = new WebSurf()
    .whenDone(({ success, message }) => {
      sendToParent({ name: 'actionDone', detail: { success, message } })
    })

  const sendToParent = (data) => window.parent.postMessage(data, targetOrigin)


  function receivedCommand ({ data = {}, origin }) {
    if (targetOrigin !== '*' && origin !== targetOrigin) {
      return
    }

    try {
      if ($surfer[data.action]) {
        $surfer[data.action](...data.params)
      }
    } catch (e) {
      console.warn(e.message)
    }
  }

  window.addEventListener('message', receivedCommand, false)

  sendToParent({ name: 'ready', detail: { version } })

}
