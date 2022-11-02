const { expect } = require('chai')

const Label = require('../common/Label')
// const Transition = require('./Transition');

class InstantiatedLabel {
  /* eslint-disable no-param-reassign, no-underscore-dangle */
  get metadata() {
    return this._metadata
  }

  set metadata(value) {
    this._metadata = Object.assign(value, { timestamp: Date.now() })
  }

  constructor(label, data, metadata = {}) {
    expect(label).to.be.an.instanceof(Label)
    this.label = label
    this.data = InstantiatedLabel.prepareData(label, data)
    this._metadata = Object.assign(metadata, { timestamp: Date.now() })
  }

  static fromJSON(json) {
    return new InstantiatedLabel(
      Label.fromJSON(json.label),
      json.data,
      json._metadata,
    )
  }
  /* eslint-enable no-param-reassign, no-underscore-dangle */

  static prepareData(label, data) {
    const preparedData = {}

    if (![undefined, null].includes(data)) {
      Object.entries(data).map(([key, value]) => {
        if (label.parameters.includes(key)) {
          if (value !== null && value !== '') {
            preparedData[key] = value
          }
        } else {
          throw new Error(`unknown label parameter '${key}'`)
        }
        return true
      })
    }

    return preparedData
  }

  //     static fromTransition(transition) {
  //         expect(transition).to.be.an.instanceof(Transition);
  //         return new InstantiatedLabel(transition.label, transition.guard);
  //     }
}

module.exports = InstantiatedLabel
