// const { log } = require('@nodebug/logger')
// const ElementLocator = require('./elements')
// const Toggle = require('./toggle')
// const messenger = require('./messenger')

// const TIMEOUT = 10

// class Worker {
//   constructor(capabilities) {
//     super(capabilities)
//     this.stack = []
//     this.elementlocator = new ElementLocator()
//     this.toggle = new Toggle(this)
//   }

//   get message() {
//     return this._message
//   }

//   set message(value) {
//     this._message = value
//   }

//   async start() {
//     await super.new()
//     this.elementlocator.driver = this.driver
//     await this.driver.startRecordingScreen({
//       videoType: 'mpeg4',
//       videoQuality: 'low',
//       videoFps: 30,
//       timeLimit: 1800,
//     })
//     return true
//   }

//   async getScreenRecording() {
//     return this.driver.stopRecordingScreen()
//   }

//   async terminate(appId) {
//     try {
//       await this.driver.terminateApp(appId)
//       await this.sleep(1000)
//       if ((await this.driver.queryAppState(appId)) === 1) {
//         log.info(`App ${appId} is terminated successfully`)
//       } else {
//         log.error(`App ${appId} is still active`)
//         throw new Error(`Could not terminate App ${appId}`)
//       }
//     } catch (err) {
//       log.error(`Error while terminating the app ${appId}`)
//       log.error(err.stack)
//       err.message = `Error while terminating the app ${appId}\n${err.message}`
//       throw err
//     }
//     return true
//   }

//   async activate(appId) {
//     try {
//       await this.driver.activateApp(appId)
//       await this.sleep(1000)
//       log.info(`App ${appId} is activated and moved to foreground`)
//     } catch (err) {
//       log.error(`Error while activating the app ${appId} to foreground`)
//       log.error(err.stack)
//       err.message = `Error while activating the app ${appId} to foreground\n${err.message}`
//       throw err
//     }
//   }

//   async uninstall(appId) {
//     try {
//       await this.driver.removeApp(appId)
//       log.info(`App ${appId} is uninstalled`)
//     } catch (err) {
//       log.error(`Error while uninstalling the app ${appId}`)
//       log.error(err.stack)
//       err.message = `Error while uninstalling the app ${appId}\n${err.message}`
//       throw err
//     }
//   }

//   async getUrl() {
//     try {
//       if (parseFloat(this.capabilities['appium:platformVersion']) < 15) {
//         await this.element('Address').tap()
//       } else {
//         await this.element('TabBarItemTitle').tap()
//       }
//       const url = await this.element('URL').value()
//       await this.element('Cancel').tap()
//       return url
//     } catch (err) {
//       this.stack = []
//       log.error(`Error while getting the browser url`)
//       log.error(err.stack)
//       err.message = `Error while getting the browser url\n${err.message}`
//       throw err
//     }
//   }

//   async finder(t = null, action = null) {
//     let timeout
//     if (t === null) {
//       timeout = TIMEOUT * 1000
//     } else {
//       timeout = t
//     }

//     const now = await Date.now()
//     let locator
//     while (Date.now() < now + timeout && locator === undefined) {
//       try {
//         // eslint-disable-next-line no-await-in-loop
//         locator = await this.elementlocator.find(this.stack, action)
//       } catch (err) {
//         // eslint-disable-next-line no-empty
//       }
//     }

//     if (locator === undefined) {
//       throw new Error(`Element was not found on page after ${timeout} timeout`)
//     }
//     return locator
//   }

//   async scrollIntoView() {
//     this.message = messenger({ stack: this.stack, action: 'scroll' })
//     try {
//       const locator = await this.finder()
//       let visible = JSON.parse(await locator.getAttribute('visible'))
//       let p = ''
//       /* eslint-disable no-await-in-loop */
//       while (!visible) {
//         p += '/..'
//         let parent = await this.driver.$(
//           `//${locator.tagname}[${locator.index + 1}]${p}`,
//         )
//         if (JSON.parse(await parent.getAttribute('visible'))) {
//           parent = await this.elementlocator.addQualifiers(parent)
//           if (parent.rect.midy < locator.rect.midy) {
//             await this.driver.touchAction([
//               { action: 'longPress', x: parent.rect.midx, y: parent.rect.midy },
//               { action: 'moveTo', x: parent.rect.x, y: parent.rect.y },
//               'release',
//             ])
//           } else {
//             await this.driver.touchAction([
//               { action: 'longPress', x: parent.rect.x, y: parent.rect.y },
//               { action: 'moveTo', x: parent.rect.midx, y: parent.rect.midy },
//               'release',
//             ])
//           }
//           visible = JSON.parse(await locator.getAttribute('visible'))
//         }
//       }
//       /* eslint-enable no-await-in-loop */
//       log.info('Successfully scrolled element into view')
//     } catch (err) {
//       log.error(
//         `${this.message}\nError while scrolling to element\n${err.message}`,
//       )
//       this.stack = []
//       err.message = `Error while ${this.message}\n${err.message}`
//       throw err
//     }
//     this.stack = []
//   }

//   async findAll() {
//     this.message = messenger({ stack: this.stack, action: 'findAll' })
//     let locators = []
//     try {
//       try {
//         await this.finder()
//       } catch (err) {
//         log.info('No matching elements are visible on page.')
//       }
//       locators = await this.elementlocator.findAll(this.stack)
//     } catch (err) {
//       log.error(
//         `${this.message}\nError while finding all matching elements.\n${err.message}`,
//       )
//       this.stack = []
//       err.message = `Error while ${this.message}\n${err.message}`
//       throw err
//     }

//     this.stack = []
//     return locators
//   }

//   async find() {
//     this.message = messenger({ stack: this.stack, action: 'find' })
//     let locator
//     try {
//       locator = await this.finder()
//     } catch (err) {
//       log.info(err.message)
//     }

//     this.stack = []
//     if (![null, undefined, ''].includes(locator)) {
//       log.info('Element is visible on page')
//       return locator
//     }
//     log.info('Element is not visible on page')
//     throw new Error(
//       `Error while ${this.message}\nElement is not visible on page`,
//     )
//   }

//   async value() {
//     this.message = messenger({ stack: this.stack, action: 'value' })
//     try {
//       const locator = await this.finder()
//       const value = await locator.getValue()
//       log.info(`Value is ${value}`)
//       this.stack = []
//       return value
//     } catch (err) {
//       log.error(`Error while ${this.message}\nError ${err.stack}`)
//       this.stack = []
//       err.message = `Error while ${this.message}\n${err.message}`
//       throw err
//     }
//   }

//   async isEnabled() {
//     this.message = messenger({ stack: this.stack, action: 'isEnabled' })
//     try {
//       const locator = await this.finder()
//       const value = JSON.parse(await locator.getAttribute('enabled'))
//       if (value) {
//         log.info('Element is enabled')
//       } else {
//         log.info('Element is disabled')
//       }
//       this.stack = []
//       return value
//     } catch (err) {
//       log.error(`Error while ${this.message}\nError ${err.stack}`)
//       this.stack = []
//       err.message = `Error while ${this.message}\n${err.message}`
//       throw err
//     }
//   }

//   async isVisible(t = null) {
//     this.message = messenger({ stack: this.stack, action: 'isVisible' })
//     let e
//     try {
//       e = await this.finder(t)
//     } catch (err) {
//       log.info(err.message)
//     }

//     this.stack = []
//     if (![null, undefined, ''].includes(e)) {
//       log.info('Element is visible on page')
//       return true
//     }
//     log.info('Element is not visible on page')
//     return false
//   }

//   async isDisplayed(t = null) {
//     this.message = messenger({ stack: this.stack, action: 'isDisplayed' })
//     try {
//       await this.finder(t)
//     } catch (err) {
//       log.error(
//         `${this.message}\nElement is not visible on page\n${err.message}`,
//       )
//       this.stack = []
//       err.message = `Error while ${this.message}\n${err.message}`
//       throw err
//     }
//     log.info('Element is visible on page')
//     this.stack = []
//     return true
//   }

//   async isNotDisplayed(t = null) {
//     this.message = messenger({ stack: this.stack, action: 'isNotDisplayed' })
//     let timeout
//     if (t === null) {
//       timeout = TIMEOUT * 1000
//     } else {
//       timeout = t
//     }

//     const now = await Date.now()
//     /* eslint-disable no-await-in-loop */
//     while (Date.now() < now + timeout) {
//       try {
//         let locators = await this.elementlocator.findAll(this.stack)
//         if (locators.length === 0) {
//           throw new Error('0 matching elements found')
//         } else {
//           locators = await Promise.all(
//             locators.map(async (locator) => {
//               return locator.getAttribute('visible')
//             }),
//           )
//           if (!locators.includes('true')) {
//             throw new Error('0 matching elements found')
//           }
//         }
//       } catch (err) {
//         log.info('Element is not visible on page')
//         this.stack = []
//         return true
//       }
//     }
//     /* eslint-enable no-await-in-loop */
//     log.error(`${this.message}\nElement is visible on page`)
//     this.stack = []
//     throw new Error(`Error while ${this.message}\nElement is visible on page`)
//   }

//   async write(value) {
//     this.message = messenger({
//       stack: this.stack,
//       action: 'write',
//       data: value,
//     })
//     try {
//       const locator = await this.finder(null, 'write')
//       if (locator.tagname === 'XCUIElementTypeSearchField') {
//         await locator.touchAction(['tap'])
//       }
//       await locator.setValue(value)
//     } catch (err) {
//       log.error(
//         `${this.message}\nError while entering data.\nError ${err.stack}`,
//       )
//       this.stack = []
//       err.message = `Error while ${this.message}\n${err.message}`
//       throw err
//     }
//     this.stack = []
//     return true
//   }

//   async tap() {
//     this.message = messenger({ stack: this.stack, action: 'tap' })
//     try {
//       const locator = await this.finder()
//       await locator.touchAction({
//         action: 'tap',
//         x: Math.floor(locator.rect.width / 2),
//         y: Math.floor(locator.rect.height / 2),
//       })
//     } catch (err) {
//       log.error(
//         `${this.message}\nError while tapping on element.\nError ${err.stack}`,
//       )
//       err.message = `Error while ${this.message}\n${err.message}`
//       this.stack = []
//       throw err
//     }
//     this.stack = []
//     return true
//   }

//   async longtap() {
//     this.message = messenger({ stack: this.stack, action: 'longtap' })
//     try {
//       const locator = await this.finder()
//       await locator.touchAction(['longPress', 'release'])
//     } catch (err) {
//       log.error(
//         `${this.message}\nError while tapping on element.\nError ${err.stack}`,
//       )
//       this.stack = []
//       err.message = `Error while ${this.message}\n${err.message}`
//       throw err
//     }
//     this.stack = []
//     return true
//   }

//   async screenshot() {
//     let dataUrl = false
//     if (this.stack.length > 0) {
//       let locator
//       try {
//         locator = await this.finder()
//       } catch (err) {
//         log.error(err.stack)
//       }
//       if (![undefined, null, ''].includes(locator)) {
//         messenger({ stack: this.stack, action: 'screenshot' })
//         dataUrl = await this.driver.takeElementScreenshot(locator.elementId)
//       }
//     }

//     if (!dataUrl) {
//       log.info('Capturing screenshot of page')
//       dataUrl = await this.driver.takeScreenshot()
//     }

//     this.stack = []
//     return dataUrl
//   }

//   exactly() {
//     this.stack.push({ exactly: true })
//     return this
//   }

//   within() {
//     this.stack.push({ type: 'location', located: 'within' })
//     return this
//   }

//   relativePositioner(position) {
//     const description = this.stack.pop()
//     if (JSON.stringify(description) === JSON.stringify({ exactly: true })) {
//       this.stack.push({ type: 'location', located: position, exactly: true })
//     } else {
//       if (typeof description !== 'undefined') {
//         this.stack.push(description)
//       }
//       this.stack.push({ type: 'location', located: position, exactly: false })
//     }
//     return this
//   }

//   above() {
//     return this.relativePositioner('above')
//   }

//   below() {
//     return this.relativePositioner('below')
//   }

//   toLeftOf() {
//     return this.relativePositioner('toLeftOf')
//   }

//   toRightOf() {
//     return this.relativePositioner('toRightOf')
//   }

//   atIndex(index) {
//     if (typeof index !== 'number') {
//       throw new TypeError(
//         `Expected parameter for atIndex is number. Received ${typeof index} instead`,
//       )
//     }
//     const description = this.stack.pop()
//     if (typeof description !== 'undefined') {
//       description.index = index
//       this.stack.push(description)
//     }
//     return this
//   }

//   exact() {
//     this.stack.push({ exact: true })
//     return this
//   }

//   element(data) {
//     const description = this.stack.pop()
//     if (JSON.stringify(description) === JSON.stringify({ exact: true })) {
//       this.stack.push({
//         type: 'element',
//         id: data.toString(),
//         exact: true,
//         matches: [],
//         index: false,
//       })
//     } else {
//       if (typeof description !== 'undefined') {
//         this.stack.push(description)
//       }
//       this.stack.push({
//         type: 'element',
//         id: data.toString(),
//         exact: false,
//         matches: [],
//         index: false,
//       })
//     }
//     return this
//   }

//   typefixer(data, type) {
//     this.element(data)
//     const description = this.stack.pop()
//     description.type = type
//     this.stack.push(description)
//     return this
//   }

//   button(data) {
//     return this.typefixer(data, 'button')
//   }

//   image(data) {
//     return this.typefixer(data, 'image')
//   }

//   switch(data) {
//     return this.typefixer(data, 'switch')
//   }

//   textbox(data) {
//     return this.typefixer(data, 'textbox')
//   }

//   alert(data) {
//     return this.typefixer(data, 'alert')
//   }

//   cell(data) {
//     return this.typefixer(data, 'cell')
//   }

//   menuitem(data) {
//     return this.typefixer(data, 'menu item')
//   }

//   /* eslint-disable class-methods-use-this */
//   async sleep(ms) {
//     log.info(`Sleeping for ${ms} milliseconds`)
//     return new Promise((resolve) => setTimeout(resolve, ms))
//   }
//   /* eslint-enable class-methods-use-this */
// }

// module.exports = Worker
