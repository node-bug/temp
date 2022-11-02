const { expect } = require('chai')

class Label {
  constructor(name, isResponse = false, isQuiescence = false) {
    this.name = name
    this.id = name
    this.response = isResponse
    this.quiescence = isQuiescence
    this.parameters = []
  }

  static fromJSON(json) {
    // TODO: ID is not read from JSON
    const label = new Label(json.name, json.response, json.quiescence)
    for (let i = 0; i < json.parameters.length; i++) {
      const parameter = json.parameters[i]
      label.addParameter(parameter)
    }
    return label
  }

  addParameter(name) {
    expect(name).to.be.a('string')
    expect(this.parameters).not.to.include(name)
    this.parameters.push(name)
  }

  static quiescence() {
    return new Label('δ', false, true)
  }

  static response(name) {
    return new Label(`!${name}`, true)
  }

  static stimulus(name) {
    return new Label(`?${name}`, false)
  }
}

module.exports = Label
