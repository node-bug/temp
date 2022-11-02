const { log } = require('@nodebug/logger')
const messenger = require('./messenger')

class Toggle {
  constructor(that) {
    this.that = that
  }

  async action(state) {
    this.that.message = messenger({
      stack: this.that.stack,
      action: 'toggle',
      data: state,
    })

    try {
      const locator = await this.that.finder(null, 'toggle')
      const currentState = await locator.getValue(locator)
      if (
        (state === 'ON' && currentState === '0') ||
        (state === 'OFF' && currentState === '1')
      ) {
        await locator.touchAction({
          action: 'tap',
          x: 30,
          y: 20,
        })
        await this.that.sleep(1000)
        const newLocator = await this.that.finder(null, 'toggle')
        const newState = await newLocator.getValue(newLocator)
        if (
          (state === 'ON' && newState === '0') ||
          (state === 'OFF' && newState === '1')
        ) {
          throw new Error(`Setting toggle to ${state} was not successfull.`)
        }
        log.info(`Toggle set to ${state} state`)
      } else {
        log.info(`Toggle is already in ${state} state.`)
      }
    } catch (err) {
      log.error(
        `${this.that.message}\nError while toggling element to ${state} state.\nError ${err.stack}`,
      )
      this.that.stack = []
      err.message = `Error while ${this.that.message}\n${err.message}`
      throw err
    }
    this.that.stack = []
    return true
  }

  async on() {
    return this.action('ON')
  }

  async off() {
    return this.action('OFF')
  }
}

module.exports = Toggle
