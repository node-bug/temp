const WEIGHTS = require('@nodebug/config')('weights')
const Tapper = require('./Tapper')

const defaultWeights = {
  tap: 1,
  'long tap': 1,
}

class Randomizer {
  set weightedArray(w) {
    this._weightedArray = []
    this.weights = { ...defaultWeights }
    /* eslint-disable no-return-assign, no-prototype-builtins, no-restricted-syntax */
    Object.keys(this.weights).forEach((key) =>
      w.hasOwnProperty(key)
        ? (this.weights[key] = w[key])
        : (this.weights[key] = 1),
    )
    for (const weight of Object.keys(this.weights)) {
      const temp = Array(this.weights[weight]).fill(weight)
      this._weightedArray = this._weightedArray.concat(temp)
    }
    /* eslint-enable no-return-assign, no-prototype-builtins, no-restricted-syntax */
  }

  get weightedArray() {
    return this._weightedArray
  }

  constructor(driver) {
    this.driver = driver
    this.tapper = new Tapper(this.driver)
    this.weightedArray = WEIGHTS
  }

  get randomAction() {
    const random = Math.floor(Math.random() * this.weightedArray.length)
    return this.weightedArray[random]
  }

  async perform() {
    switch (this.randomAction) {
      case 'tap':
        return this.tapper.random('tap')
      case 'long tap':
        return this.tapper.random('long tap')
      default:
        return this.tapper.random('tap')
    }
  }
}

module.exports = Randomizer
