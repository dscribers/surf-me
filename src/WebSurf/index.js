import Surfer from './Surfer'

export default class WebSurf {
  #cacheBreakerWrapper = '__RNR__'
  #cacheBreaker = null
  #notify = () => { }

  constructor() {
    this.#cacheBreaker = this.#cacheBreakerWrapper + Date.now() + this.#cacheBreakerWrapper
  }

  #blur = () => { }

  /**
   * @inheritdoc
   */
  checkAttrContains (selector, attr, text) {
    const item = new Surfer(selector)

    if (!item.length) {
      return this.#done('Element not found')
    }

    this.#focus(selector)

    this.#checked((item.attr(attr) || '').includes(text))
  }

  /**
   * @inheritdoc
   */
  checkAttrIs (selector, attr, val) {
    const item = new Surfer(selector)

    if (!item.length) {
      return this.#done('Element not found')
    }

    this.#focus(selector)

    this.#checked(item.attr(attr) == val)
  }

  /**
   * @inheritdoc
   */
  checkExists (selector) {
    this.#focus(selector)
    this.#checked(new Surfer(selector).length > 0)
  }

  /**
   * @inheritdoc
   */
  checkIsOn (url) {
    const regExp = new RegExp(`(\\?|&)${this.#cacheBreakerWrapper}.*${this.#cacheBreakerWrapper}`)
    const cleanLocationHref = document.location.href.replace(regExp, '')

    this.#checked(cleanLocationHref === url)
  }

  /**
   * Checks if an element is visible or hidden
   *
   * @param {string} selector The selector of the target html element
   * @param {string} display visible | hidden
   */
  checkElementIs (selector, display) {
    const item = new Surfer(selector)

    if (!item.length) {
      return this.#done('Element not found')
    }

    this.#focus(selector)

    const visible = display === 'visible'
    const isVisible = (elem) => {
      if (window.getComputedStyle(elem).display === 'none') {
        return false
      } else if (!elem.parentElement) {
        return true
      }

      return isVisible(elem.parentElement)
    }

    let valid = false

    if (visible) {
      valid = isVisible(item.item)
    } else {
      valid = !isVisible(item.item)
    }

    this.#checked(valid)
  }

  checkPageContains (selector, text) {
    const item = new Surfer(selector)

    if (!item.length) {
      return this.#done('Element not found')
    }

    this.#focus(selector)

    let contains = item.text().includes(text)

    if (!contains) {
      item.find('input, textarea, select').each(elem => {
        contains = `${(elem.value || '')}`.includes(text)

        if (contains) {
          return false
        }
      })
    }

    if (contains) {
      return this.checkElementIs(selector, 'visible')
    }

    this.#checked(contains)
  }

  /**
   * @inheritdoc
   */
  checkTextContains (selector, text) {
    const item = new Surfer(selector)

    if (!item.length) {
      return this.#done('Element not found')
    }

    this.#focus(selector)

    this.#checked((item.text() || '').includes(text))
  }

  /**
   * @inheritdoc
   */
  checkTextIs (selector, text) {
    const item = new Surfer(selector)

    if (!item.length) {
      return this.#done('Element not found')
    }

    this.#focus(selector)

    this.#checked(item.text() === text)
  }

  /**
   * @inheritdoc
   */
  checkValueContains (selector, text) {
    const item = new Surfer(selector)

    if (!item.length) {
      return this.#done('Element not found')
    }

    this.#focus(selector)

    const value = `${item.value() || ''}`
    this.#checked(value.includes(text))
  }

  /**
   * @inheritdoc
   */
  checkValueIs (selector, value) {
    const item = new Surfer(selector)

    if (!item.length) {
      return this.#done('Element not found')
    }

    this.#focus(selector)

    this.#checked(item.value() === value)
  }

  /**
   * @inheritdoc
   */
  doClick (selector) {
    if (selector) {
      const item = new Surfer(selector)

      if (!item.length) {
        return this.#done('Element not found')
      }

      this.#focus(selector)

      item.click()
      this.#done()
    } else {
      this.#done('Selector not provided')
    }
  }

  /**
   * @inheritdoc
   */
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

  /**
   * @inheritdoc
   */
  doRefresh () {
    location.reload()
  }

  /**
   * @inheritdoc
   */
  doSelect (selector, value) {
    if (selector) {
      const item = new Surfer(selector)

      if (!item.length) {
        return this.#done('Element not found')
      }

      this.#focus(selector)

      item.value(value)
    } else {
      this.#done('Selector not provided')
    }
  }

  /**
   * @inheritdoc
   */
  doSubmitForm (selector) {
    if (selector) {
      const item = new Surfer(selector)

      if (!item.length) {
        return this.#done('Element not found')
      }

      this.#focus(selector)

      item.item.submit()
      this.#done()
    } else {
      this.#done('Selector not provided')
    }
  }

  /**
   * @inheritdoc
   */
  doType (selector, str, speed = 100) {
    if (selector) {
      const item = new Surfer(selector)

      if (!item.length) {
        return this.#done('Element not found')
      }

      this.#focus(selector)

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
    } else {
      this.#done('Selector not provided')
    }
  }

  whenDone (callback = () => { }) {
    this.#notify = callback

    return this
  }

  #checked (status) {
    this.#blur()

    if (!status) {
      return this.#done('Check failed')
    }

    this.#done()
  }

  #done (errorMessage) {
    this.#blur()

    this.#notify({
      success: !errorMessage,
      message: errorMessage
    })
  }

  /**
   * Focuses on the current item
   *
   * @param {*} selector The selector of the target html element
   */
  #focus (selector) {
    if (!selector) {
      throw new Error('Selector not provided')
    }

    const item = new Surfer(selector).item

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
}
