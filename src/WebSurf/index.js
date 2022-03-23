import Surfer from './Surfer'

export default class WebSurf {
  #blur = () => { }
  #cacheBreakerWrapper = '__RNR__'
  #cacheBreaker = null
  #config = {
    elemDelay: 1000,
    maxElemDelayCount: 15
  }
  #defaultSuccessMessage = null
  #notify = () => { }

  constructor() {
    this.#cacheBreaker = this.#cacheBreakerWrapper + Date.now() + this.#cacheBreakerWrapper
  }

  async checkAttrContains (selector, attr, text) {
    try {
      const item = await this.#getElem(selector)

      this.#focus(item)

      let result = false

      await this.#tryCheck(() => {
        result = (item.attr(attr) || '').includes(text)

        return result
      })

      this.#checked(result)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  async checkAttrIs (selector, attr, val) {
    try {
      const item = await this.#getElem(selector)

      this.#focus(item)

      let result = false

      await this.#tryCheck(() => {
        result = item.attr(attr) == val

        return result
      })

      this.#checked(result)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  async checkExists (selector) {
    try {
      const item = await this.#getElem(selector)

      this.#focus(item)

      this.#checked(true)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  async checkIsOn (url) {
    try {
      let result = false

      await this.#tryCheck(() => {
        const regExp = new RegExp(`(\\?|&)${this.#cacheBreakerWrapper}.*${this.#cacheBreakerWrapper}`)

        result = document.location.href.replace(regExp, '') === url

        return result
      })

      this.#checked(result)
    } catch (e) {
      this.#checked(false)
    }
  }

  /**
   * Checks if an element is visible or hidden
   *
   * @param {string} selector The selector of the target html element
   * @param {string} display visible | hidden
   */
  async checkElementIs (selector, display) {
    try {
      const item = await this.#getElem(selector)

      this.#focus(item)

      let result = false

      const visible = display === 'visible'
      const isVisible = (elem) => {
        if (window.getComputedStyle(elem).display === 'none') {
          return false
        } else if (!elem.parentElement) {
          return true
        }

        return isVisible(elem.parentElement)
      }

      await this.#tryCheck(() => {
        if (visible) {
          result = isVisible(item.item)
        } else {
          result = !isVisible(item.item)
        }

        return result
      })


      this.#checked(result)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  async checkPageContains (selector, text) {
    try {
      const item = await this.#getElem(selector)

      this.#focus(item)

      let result = false

      await this.#tryCheck(() => {
        result = item.text().includes(text)

        if (!result) {
          item.find('input, textarea, select').each(elem => {
            result = `${(elem.value || '')}`.includes(text)

            if (result) {
              return false // stop the loop
            }
          })
        }

        return result
      })

      if (result) {
        return this.checkElementIs(selector, 'visible')
      }

      this.#checked(result)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  checkVisbleWithin (text, timeout) {
    const body = new Surfer('body')
    const start = Date.now()

    const check = () => {
      // @todo: Check text is also visible
      if (body.text().includes(text)) {
        return this.#checked(true)
      }

      if (start + timeout < Date.now()) {
        setTimeout(check, 1000)
      } else {
        this.#checked(false)
      }
    }

    check()
  }

  async checkTextContains (selector, text) {
    try {
      const item = await this.#getElem(selector)

      this.#focus(item)

      let result = false

      await this.#tryCheck(() => {
        result = (item.text() || '').includes(text)

        return result
      })

      this.#checked(result)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  async checkTextIs (selector, text) {
    try {
      const item = await this.#getElem(selector)

      this.#focus(item)

      let result = false

      await this.#tryCheck(() => {
        result = item.text() === text

        return result
      })

      this.#checked(result)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  async checkValueContains (selector, text) {
    try {
      const item = await this.#getElem(selector)

      this.#focus(item)

      let result = false

      await this.#tryCheck(() => {
        const value = `${item.value() || ''}`
        result = value.includes(text)

        return result
      })

      this.#checked(result)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  async checkValueIs (selector, value) {
    try {
      const item = await this.#getElem(selector)

      this.#focus(item)

      let result = false

      await this.#tryCheck(() => {
        result = item.value() === value

        return result
      })

      this.#checked(result)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  configure (config) {
    if (typeof config === 'object' && config !== null && !Array.isArray(config)) {
      this.#config = { ...this.#config, ...config }
    }

    return this
  }

  async doClick (selector) {
    if (selector) {
      try {
        const item = await this.#getElem(selector)

        this.#focus(item)

        item.click()
        this.#done()
      } catch (e) {
        this.#done(e.message, false)
      }
    } else {
      this.#done('Selector not provided', false)
    }
  }

  doGoto (url) {
    setTimeout(() => {
      const urlWithoutHash = url.split('#')[0]
      const locationWithoutHash = location.href.split('#')[0]

      // page uses hash routing
      if (urlWithoutHash === locationWithoutHash) {
        location.reload()
      } else {
        const joiner = url.includes('?') ? '&' : '?'

        // disable assets caching
        location.href = url + joiner + this.#cacheBreaker
      }
    })
  }

  doRefresh () {
    location.reload()
  }

  async doSelect (selector, value) {
    try {
      const item = await this.#getElem(selector)

      const timesTried = this.#try(() => !!item.find(`option[value="${value}"]`).length, 5, 2000)

      if (timesTried) {
        if (this.#defaultSuccessMessage) {
          this.#defaultSuccessMessage += ` and then found option after ${timesTried} seconds`
        } else {
          this.#defaultSuccessMessage = `Found option after ${timesTried} seconds`
        }
      }

      this.doSet(selector, value)
    } catch (e) {
      this.#done(e.message, false)
    }
  }

  async doSet (selector, value) {
    if (selector) {
      try {
        const item = await this.#getElem(selector)

        this.#focus(item)

        item.value(value)
        this.#done()
      } catch (e) {
        this.#done(e.message, false)
      }
    } else {
      this.#done('Selector not provided', false)
    }
  }

  async doSubmitForm (selector) {
    if (selector) {
      try {
        const item = await this.#getElem(selector)

        this.#focus(item)

        item.item.submit()
        this.#done()
      } catch (e) {
        this.#done(e.message, false)
      }
    } else {
      this.#done('Selector not provided', false)
    }
  }

  async doType (selector, str, speed = 100) {
    if (selector) {
      try {
        const item = await this.#getElem(selector)

        this.#focus(item)

        item.value('')

        let index = 0

        const type = () => {
          item.value(item.value() + str[index])
          item.dispatchEvent('input')

          if (++index < str.length) {
            setTimeout(type, speed)
          } else {
            item.blur()
            item.dispatchEvent('change')
            this.#done()
          }
        }

        type()
      } catch (e) {
        this.#done(e.message, false)
      }
    } else {
      this.#done('Selector not provided', false)
    }
  }

  whenDone (callback = () => { }) {
    this.#notify = callback

    return this
  }

  #try (callback, times, delay) {
    return new Promise((resolve, reject) => {
      let count = 0

      const call = () => {
        if (callback()) {
          resolve(count)
        } else if (count === times) {
          reject()
        } else {
          setTimeout(() => call(), delay)
        }

        count++
      }

      call()
    })
  }

  async #tryCheck (callback) {
    return this.#tryWithConfig(callback, timesTried => `Passed after ${timesTried} seconds`)
  }

  async #tryWithConfig (callback, messageFn = () => null) {
    const timesTried = await this.#try(callback, this.#config.maxElemDelayCount, this.#config.elemDelay)

    if (timesTried) {
      this.#defaultSuccessMessage = messageFn(timesTried)
    }

    return timesTried
  }

  #checked (status) {
    this.#blur()

    if (!status) {
      return this.#done('Check failed', false)
    }

    this.#done()
  }

  #done (message, success = true) {
    this.#blur()

    if (!message && success && this.#defaultSuccessMessage) {
      message = this.#defaultSuccessMessage
    }

    this.#notify({ success, message })
    this.#defaultSuccessMessage = null
  }

  #focus ({ item }) {
    const focusData = {
      backgroundColor: item.style.backgroundColor,
      border: item.style.border,
      color: item.style.color,
    }

    this.#blur = () => {
      for (let key in focusData) {
        item.style[key] = focusData[key]
      }
    }

    item.style.border = '2px solid magenta'
    item.style.color = '#0e90d2'
    item.style.backgroundColor = '#ffffff'

    item.scrollIntoView({ behavior: 'smooth', block: 'center' })
    item.focus({ preventScroll: true })
  }

  async #getElem (selector) {
    let item

    try {
      const timesTried = await this.#try(
        () => {
          item = new Surfer(selector)

          return !!item.length
        },
        this.#config.maxElemDelayCount,
        this.#config.elemDelay
      )

      if (timesTried) {
        this.message = `Element found after ${timesTried} seconds`
      }

      return item
    } catch (e) {
      throw new Error('Element not found')
    }
  }
}
