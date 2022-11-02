const { exec } = require('node:child_process')
const { log } = require('@nodebug/logger')
const config = require('@nodebug/config')('appium')

class Appium {
  constructor() {
    this.hostname = config.hostname
    this.port = config.port
    this.loglevel = config.logLevel
    this.path = config.path
  }

  async start() {
    this.process = await exec(
      `appium -a ${this.hostname} -p ${this.port} --log-level ${this.loglevel}`,
    )
  }

  async stop() {
    try {
      this.process.kill()
    } catch (err) {
      log.warn(`Could not kill Appium server${err.message}`)
    }
  }
}

module.exports = Appium
