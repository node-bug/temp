const { expect } = require('chai')
const path = require('path')
const fs = require('fs')

const InstantiatedLabel = require('./InstantiatedLabel')

class Trace extends Array {
  static fromArray(ilabels) {
    const trace = new Trace()
    ilabels.forEach((ilabel) => trace.push(ilabel))
    return trace
  }

  static fromJSON(json) {
    const trace = new Trace()
    json.forEach((element) => trace.add(InstantiatedLabel.fromJSON(element)))
    return trace
  }

  static fromFile(location) {
    const json = JSON.parse(fs.readFileSync(location).toString())
    return Trace.fromJSON(json)
  }

  toFile(filename) {
    const dir = path.dirname(filename)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filename, JSON.stringify(this))
  }

  add(ilabel) {
    expect(ilabel).to.be.an.instanceof(InstantiatedLabel)
    this.push(ilabel)
  }

  addAll(trace) {
    expect(trace).to.be.an.instanceof(Trace)
    trace.forEach((ilabel) => this.add(ilabel))
    return trace
  }
}

module.exports = Trace
