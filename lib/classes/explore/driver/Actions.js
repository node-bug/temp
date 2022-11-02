const Tapper = require('./Tapper')

class Actions {
  constructor(driver) {
    this.driver = driver
    this.tapper = new Tapper(this.driver)
  }

  async perform(ilabel) {
    switch (ilabel.label.name) {
      case '?tap':
        return this.tapper.tap(ilabel)
      case '?long tap':
        return this.tapper.longtap(ilabel)
      default:
        return null
    }
  }
}

module.exports = Actions
