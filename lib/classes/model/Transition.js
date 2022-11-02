const { expect } = require('chai')
const Label = require('../common/Label')
const State = require('./State')

class Transition {
  // sanitizing, e.g. to use as file name
  get id() {
    return (this.from.id + this.label.id + this.to.id).replace(
      /[^a-z0-9]/g,
      '_',
    )
  }

  constructor(from, label, to, guard = {}) {
    expect(from).to.be.an.instanceof(State)
    expect(to).to.be.an.instanceof(State)
    expect(label).to.be.an.instanceof(Label)

    this.from = from
    this.label = label
    this.to = to
    this.guard = guard
  }

  static sanitize(str) {
    return str
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, ', ')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  isSimiliarTo(transition) {
    if (
      this.label.id === transition.label.id &&
      JSON.stringify(this.guard) === JSON.stringify(transition.guard)
    ) {
      return true
    }
    return false
  }

  //     addCondition(parameter, value) {
  //         expect(parameter).to.be.a('string');
  //         expect(value).to.be.a('string');
  //         this._guard[parameter] = value;
  //     }

  toDot() {
    const from = Transition.sanitize(this.from.name)
    const to = Transition.sanitize(this.to.name)
    const label = Transition.sanitize(this.label.name)
    const guard = Object.entries(this.guard)
      .filter(([key]) => key !== 'image') // guard is a string, avoid image in a string
      .map(([key, value]) => Transition.sanitize(`${key} == ${value}`))
      .join('<br/>')
    // //             // TODO: this shouldn't go here, make optional parameters/metadata?
    // .filter((key) => key !== 'image')

    let labelStr = guard ? `${label}<br/>${guard}` : label
    if (this.guard.image) {
      // eslint-disable-next-line max-len
      labelStr = `<<table border="0"><tr><td><img src="./${this.id}.png"/></td></tr><tr><td>${labelStr}</td></tr></table>>`
    } else {
      labelStr = `<<table border="0"><tr><td>${labelStr}</td></tr></table>>`
    }

    // const color = RegExp('.?error').test(label)
    //   ? 'red'
    //   : this.isDuplicate
    //   ? 'blue'
    //   : 'black'

    function color() {
      if (RegExp('.?error').test(label)) {
        return 'red'
      }
      if (this.isDuplicate) {
        return 'blue'
      }
      return 'black'
    }
    return `"${from}" -> "${to}" [label=${labelStr} color="${color}"]`
  }
}

module.exports = Transition
