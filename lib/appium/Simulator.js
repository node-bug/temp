const { execSync } = require('node:child_process')
const { log } = require('@nodebug/logger')
const config = require('@nodebug/config')('simulator')

class Simulator {
  constructor() {
    this.platformName = config.platformName
    this.deviceName = config.deviceName
    this.platformVersion = config.platformVersion
    this.uuid = null
    this.pid = process.pid
  }

  async create() {
    try {
      const proc =
        await execSync(`xcrun simctl create "${this.deviceName} ${this.platformVersion} ${this.pid}" \
      "${this.deviceName}" "${this.platformName}${this.platformVersion}"`)
      this.deviceName = `${this.deviceName} ${this.platformVersion} ${this.pid}`
      this.uuid = proc.toString().trim()
    } catch (err) {
      log.error(err.message)
      throw err
    }
  }

  async delete() {
    try {
      await execSync(`xcrun simctl delete "${this.uuid}"`)
    } catch (err) {
      log.error(err.message)
      throw err
    }
  }
}

module.exports = Simulator
