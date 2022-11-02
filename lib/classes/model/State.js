const { expect } = require('chai')
const uuid = require('uuid')
const Screenshot = require('../common/Screenshot')

class State {
  constructor(name, meta = {}) {
    this.name = name
    // TODO: This doesnt guarantee uniqueness
    this.id = uuid.v4()
    this.meta = meta
    this.transitions = []
  }

  // sanitizing, e.g. to use as file name
  get sanitizedId() {
    return this.id.replace(/[^a-zA-Z0-9.]/g, '_')
  }

  get hasImage() {
    return ![undefined, null, ''].includes(this.meta.image)
  }

  get hasMeta() {
    return Object.entries(this.meta).length !== 0
  }

  isSimilarTo(state) {
    if (this.hasMeta && state.hasMeta) {
      if (this.hasImage && state.hasImage) {
        return Screenshot.same(this.meta.image, state.meta.image)
      }
      return this.meta === state.meta
    }
    return this.name === state.name
  }

  hasSimilarMeta(state) {
    if (this.hasMeta && state.hasMeta) {
      if (this.hasImage && state.hasImage) {
        return Screenshot.same(this.meta.image, state.meta.image)
      }
      return this.meta === state.meta
    }
    return this.hasMeta === state.hasMeta
  }

  addMeta(data) {
    expect(data).to.have.property('isExternal')
    expect(data).to.have.property('clickableCount')

    this.meta.isExternal = data.isExternal
    this.meta.clickableCount = data.clickableCount
    this.meta.image = data.image

    this.name = `${this.name}_${this.meta.clickableCount}`
    if (data.isExternal) {
      this.name = `ExternalApp:${this.name}`
      this.id = `ExternalApp:${this.id}`
    }
  }

  registerTransition(transition) {
    // TODO: should check for uniqueness
    // TODO: potientially guard for quiesence? (state cannot be quiescent and have output at the same time)
    /* eslint-disable no-param-reassign, no-return-assign */
    if (this.transitions.findIndex((t) => t.isSimiliarTo(transition)) > -1) {
      transition.isDuplicate = true
      this.transitions
        .filter((t) => t.isSimiliarTo(transition))
        .forEach((t) => (t.isDuplicate = true))
    }
    this.transitions.push(transition)
    /* eslint-enable no-param-reassign, no-return-assign */
  }

  deregisterTransition(transition) {
    const index = this.transitions.findIndex((t) => t.id === transition.id)
    if (index > -1) {
      return this.transitions.splice(index, 1)[0]
    }
    return false
  }

  replaceTransition(oldTransition, newTransition) {
    this.transitions[this.transitions.indexOf(oldTransition)] = newTransition
  }

  getTransitionFor(label, state, guard = {}) {
    return this.transitions.find(
      (transition) =>
        label.id === transition.label.id &&
        JSON.stringify(guard) === JSON.stringify(transition.guard) &&
        state.hasSimilarMeta(transition.to),
    )
  }

  toDot() {
    if (this.hasImage) {
      return `"${this.name}" [image="./${this.sanitizedId}.png"]`
    }
    return null
  }

  static fromJSON(json) {
    const state = new State(json.name, json.meta)
    state.transitions = json.transitions
    return state
  }
}

module.exports = State
