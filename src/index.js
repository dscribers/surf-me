import '@babel/polyfill'
import WebSurf from './WebSurf'
import { version } from '../package.json'

let configured = false

window.SurfMe = (targetOrigin, config = {}) => {
  if (typeof config !== 'object') {
    throw new Error('Parameter must be an object')
  }

  if (configured) {
    throw new Error('SurfMe has already been configured')
  }

  // not in an iframe
  if (window.parent === window) {
    return
  }

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
        $surfer[data.action](...(data.params || []))
      }
    } catch (e) {
      sendToParent({ name: 'actionDone', detail: { success: false, message: e.message } })
      console.warn(e)
    }
  }

  window.addEventListener('message', receivedCommand, false)

  sendToParent({ name: 'ready', detail: { ...config, version } })

  configured = true
}
