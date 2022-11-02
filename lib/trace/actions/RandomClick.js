// const { log } = require('@nodebug/logger')
// const webdriver = require('selenium-webdriver')

// const { By } = webdriver

// const ElementData = require('../../base/trace/ElementData')
// const ILabels = require('../ILabels')

// const clickableSelector =
//   // eslint-disable-next-line max-len
//   'a,button,.button,[role="button"],[role="link"],[role="menuitem"],[class*="close"],[class*="tab"],[class*="menu"],[class*="switch"],svg'

// class RandomClick {
//   static get defaultConfig() {
//     return { timeout: 10000, screenshot: false, highlight: false }
//   }

//   /* eslint-disable no-underscore-dangle */
//   get color() {
//     return this.COLOR_LIST[this.currentColorIndex % this.COLOR_LIST.length]
//   }

//   get browser() {
//     return this._browser
//   }

//   get config() {
//     return this._config
//   }

//   get clickables() {
//     return this._clickables
//   }

//   set clickables(value) {
//     this._clickables = value
//   }

//   constructor(browser, config) {
//     this._browser = browser
//     this._config = { ...this.defaultConfig, ...config }
//     this.COLOR_LIST = ['blue', 'purple', 'red']
//     this.currentColorIndex = 0
//     this._clickables = null
//   }
//   /* eslint-enable no-underscore-dangle */

//   async highlight(element) {
//     if (this.config.highlight) {
//       await this.browser.driver.executeScript(
//         `return arguments[0].style.border = '5px solid ${this.color}'`,
//         element,
//       )
//     }
//   }

//   async findAllClickables(selector) {
//     let ref
//     if ([undefined, null, ''].includes(selector)) {
//       ref = this.browser.driver
//     } else {
//       ref = await this.browser.driver.findElement(By.css(selector))
//     }
//     const clickables = await ref.findElements(By.css(clickableSelector))
//     log.debug(`${clickables.length} found`)
//     // for(let i=0; i<clickables.length;i++){
//     //   await this.highlight(clickables[i])
//     // }
//     if (clickables.length > 0) {
//       this.clickables = clickables
//     }
//   }

//   randomClickable() {
//     const { length } = this.clickables
//     const index = Math.floor(Math.random() * (length + 1))
//     return this.clickables.splice(index, 1)[0]
//   }

//   async isClickable(element) {
//     if (!element || !element.isDisplayed) {
//       return false
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

//   async execute() {
//     try {
//       await this.findAllClickables()
//       let remainingTries = 10
//       /* eslint-disable no-await-in-loop */
//       while (this.clickables.length > 0) {
//         try {
//           const element = this.randomClickable()
//           if (!(await this.isClickable(element))) {
//             // eslint-disable-next-line no-continue
//             continue // if not clickable try next
//           }
//           await this.highlight(element)
//           log.debug('Starting click on element')
//           const elementData = await ElementData.fromWebElement(
//             element,
//             this.config.screenshot,
//           )
//           await element.click()
//           return ILabels.click(elementData)
//         } catch (err) {
//           if (
//             err.name === 'ElementClickInterceptedError' &&
//             err.message.includes('element would receive') &&
//             remainingTries > 0
//           ) {
//             log.debug(
//               'Element blocked by other element. Finding top level elements.',
//             )
//             remainingTries -= 1
//             const arr = err.message
//               .split('click:')[1]
//               .split('\n')[0]
//               .trim()
//               .split('>')[0]
//               .split(' ')
//             arr.shift()
//             if (arr.length > 0) {
//               await this.findAllClickables(
//                 `[${arr.join(' ').replace(/" /g, '"][')}]`,
//               )
//             }
//           } else {
//             log.warn(err.stack)
//             // on error, click next element
//           }
//         }
//       }
//       /* eslint-enable no-await-in-loop */
//       this.currentColorIndex += 1
//       log.debug('No clickable elements left')
//       return ILabels.stimulusError('No clickable elements left')
//     } catch (err) {
//       log.error(err.stack)
//       return ILabels.stimulusError(err.message)
//     }
//   }
// }
// module.exports = RandomClick
