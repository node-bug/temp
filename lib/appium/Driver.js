const webdriverio = require('webdriverio')

class Driver {
  constructor(server, simulator, app) {
    this.options = {
      hostname: server.hostname,
      path: server.path,
      port: server.port,
      logLevel: server.loglevel,
      capabilities: {
        platformName: simulator.platformName,
        'appium:platformVersion': simulator.platformVersion,
        'appium:deviceName': simulator.deviceName,
        'appium:uuid': simulator.uuid,
        'appium:isHeadless': app.isHeadless,
        'appium:app': app.app,
        'appium:automationName': app.automationName,
        'appium:newCommandTimeout': server.timeout * 6,
      },
    }
  }

  async launch() {
    this.driver = await webdriverio.remote(this.options)
    this.dimensions = await this.driver.getWindowRect()
  }

  async quit() {
    await this.driver.deleteSession()
  }

  async findElement(selector) {
    return this.driver.$(selector)
  }

  async findElements(selector) {
    return this.driver.$$(selector)
  }

  async getAttribute(attribute, selector) {
    const element = await this.driver.$(selector)
    return element.getAttribute(attribute)
  }

  async getRect(selector) {
    const element = await this.driver.$(selector)
    return this.driver.getElementRect(element.elementId)
  }

  async getWindowRect() {
    return this.driver.getWindowRect()
  }

  async screenshot() {
    return this.driver.takeScreenshot()
  }
}

module.exports = Driver
