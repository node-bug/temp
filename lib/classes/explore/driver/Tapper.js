const { log } = require('@nodebug/logger')
const ElementData = require('../ElementData')
const ILabels = require('../ILabels')
const Selectors = require('./Selectors')

class Tapper {
  static get defaultConfig() {
    return { timeout: 10000, screenshot: false, highlight: false }
  }

  constructor(driver, config = {}) {
    this.driver = driver
    this.config = { ...this.defaultConfig, ...config }
    this.COLOR_LIST = ['blue', 'purple', 'red']
    this.currentColorIndex = 0
    this.clickables = []
  }

  get color() {
    return this.COLOR_LIST[this.currentColorIndex % this.COLOR_LIST.length]
  }

  //   async highlight(element) {
  //     if (this.config.highlight) {
  //       await this.browser.driver.executeScript(
  //         `return arguments[0].style.border = '5px solid ${this.color}'`,
  //         element,
  //       )
  //     }
  //   }

  async findAllClickables() {
    const elements = await this.driver.findElements(Selectors.clickables)
    log.debug(`${elements.length} elements found`)
    if (elements.length > 0) {
      this.clickables = elements
    } else {
      return ILabels.stimulusError('No clickable elements found')
    }
    return true
  }

  async randomClickable() {
    /* eslint-disable no-await-in-loop */
    while (this.clickables.length > 0) {
      const { length } = this.clickables
      const index = Math.floor(Math.random() * length)
      const element = this.clickables.splice(index, 1)[0]
      if (await element.isDisplayed()) {
        return element
      }
      // eslint-disable-next-line no-continue
      continue
    }
    /* eslint-disable no-await-in-loop */
    return ILabels.stimulusError('No clickable elements left')
  }

  async perform(action, element) {
    log.debug(`Starting ${action} on element`)
    const elementData = await ElementData.fromElement(
      element,
      this.config.screenshot,
    )
    try {
      switch (action) {
        case 'long tap':
          await element.touchAction(['longPress', 'release'])
          return ILabels.longtap(elementData)

        default:
          await element.touchAction({
            action: 'tap',
          })
          return ILabels.tap(elementData)
      }
    } catch (err) {
      log.error(err.stack)
      return ILabels.stimulusError(err.message)
    }
  }

  async do(action, ilabel) {
    const elementData = ElementData.fromILabel(ilabel)
    const element = await this.driver.findElement(elementData.toSelector())
    return this.perform(action, element)
  }

  async tap(ilabel) {
    return this.do('tap', ilabel)
  }

  async longtap(ilabel) {
    return this.do('long tap', ilabel)
  }

  async random(action) {
    const results = await this.findAllClickables()
    if (results.constructor.name === 'InstantiatedLabel') {
      return results
    }
    const element = await this.randomClickable()
    if (element.constructor.name === 'InstantiatedLabel') {
      return element
    }
    return this.perform(action, element)
  }
}

// async isClickable(element) {
//     if (!element || !element.isDisplayed) {
//         return false
//     }

//     const rect = await this.browser.driver.executeScript(
//       'return arguments[0].getBoundingClientRect();',
//       element,
//     )
//     const text = await element.getText()

//     const displayed = await element.isDisplayed()
//     const enabled = await element.isEnabled()
//     const visible = rect.height > 0
//     const shorttext = text.length < 40

//     if (displayed && enabled && visible) {
//       log.debug('Element is clickable')
//     }
//     if (!shorttext) {
//       log.debug(`Element has long text. Find another clickable.`)
//     }
//     return displayed && enabled && visible && shorttext
//   }

// async execute() {
//     try {
//         await this.findAllClickables()
//         let remainingTries = 10
//         /* eslint-disable no-await-in-loop */
//         while (this.clickables.length > 0) {
//             try {
//                 const element = this.randomClickable()
//                 if (!(await this.isClickable(element))) {
//                     // eslint-disable-next-line no-continue
//                     continue // if not clickable try next
//                 }
//                 // await this.highlight(element)
//                 log.debug('Starting click on element')
//                 const elementData = await ElementData.fromWebElement(
//                     element,
//                     this.config.screenshot,
//                 )
//                 await element.click()
//                 return ILabels.click(elementData)
//             } catch (err) {
//                 if (
//                     err.name === 'ElementClickInterceptedError' &&
//                     err.message.includes('element would receive') &&
//                     remainingTries > 0
//                 ) {
//                     log.debug(
//                         'Element blocked by other element. Finding top level elements.',
//                     )
//                     remainingTries -= 1
//                     const arr = err.message
//                         .split('click:')[1]
//                         .split('\n')[0]
//                         .trim()
//                         .split('>')[0]
//                         .split(' ')
//                     arr.shift()
//                     if (arr.length > 0) {
//                         await this.findAllClickables(
//                             `[${arr.join(' ').replace(/" /g, '"][')}]`,
//                         )
//                     }
//                 } else {
//                     log.warn(err.stack)
//                     // on error, click next element
//                 }
//             }
//         }
//         /* eslint-enable no-await-in-loop */
//         this.currentColorIndex += 1
//         log.debug('No clickable elements left')
//         return ILabels.stimulusError('No clickable elements left')
//     } catch (err) {
//         log.error(err.stack)
//         return ILabels.stimulusError(err.message)
//     }
// }
// }

module.exports = Tapper
