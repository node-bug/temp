const { expect } = require('chai')

const ElementData = require('./ElementData')
const InstantiatedLabel = require('./InstantiatedLabel')
const Label = require('../common/Label')
const Labels = require('./Labels')

class ILabels {
  static hook(description) {
    return new InstantiatedLabel(Labels.hook, { description })
  }

  static tap(elementData) {
    expect(elementData).to.be.an.instanceOf(ElementData)
    return new InstantiatedLabel(Labels.tap, elementData.toLabelData())
  }

  static longtap(elementData) {
    expect(elementData).to.be.an.instanceOf(ElementData)
    return new InstantiatedLabel(Labels.longtap, elementData.toLabelData())
  }

  static stimulusError(message) {
    return new InstantiatedLabel(Labels.errorStimulus, { message })
  }

  //   static a11YError(message) {
  //     return new InstantiatedLabel(Labels.errorA11Y, { message })
  //   }

  //   static consoleError(message) {
  //     return new InstantiatedLabel(Labels.errorConsole, { message })
  //   }

  static quiescence() {
    return new InstantiatedLabel(Label.quiescence())
  }
}

module.exports = ILabels
