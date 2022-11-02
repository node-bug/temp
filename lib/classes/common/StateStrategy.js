const config = require('@nodebug/config')('explorer')
const uuid = require('uuid')
const Selectors = require('../explore/driver/Selectors')
const Screenshot = require('./Screenshot')

const STATUS_BAR_HEIGHT = 44
const BOTTOM_BAR_HEIGHT = 14

class StateStrategy {
  constructor(driver, applicationName) {
    this.driver = driver
    this.applicationName = applicationName
  }

  get dimensions() {
    return {
      x: 0,
      y: STATUS_BAR_HEIGHT,
      width: this.driver.dimensions.width,
      height:
        this.driver.dimensions.height - STATUS_BAR_HEIGHT - BOTTOM_BAR_HEIGHT,
    }
  }

  async didLeaveApp() {
    const name = await this.driver.getAttribute('name', Selectors.application)
    return !(this.applicationName === name)
  }

  async numberOfClickables() {
    const elements = await this.driver.findElements(Selectors.clickables)
    return elements.length
  }

  async screenshot() {
    if (config.saveImages) {
      const image = await Screenshot.resize(
        await this.driver.screenshot(),
        this.driver.dimensions,
      )
      if (config.screenshot === 'application') {
        const cropped = await Screenshot.crop(image, this.dimensions)
        return cropped
      }
      return image
    }
    return null
  }

  async getState() {
    return {
      isExternal: await this.didLeaveApp(),
      uuid: uuid.v4(),
      clickableCount: await this.numberOfClickables(),
      image: await this.screenshot(),
      timestamp: Date.now(),
    }
  }
}

module.exports = StateStrategy
