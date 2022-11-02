const Model = require('./Model')
const State = require('./State')
const Traces = require('../common/Traces')

class PathFinder {
  constructor(traces = []) {
    this.model = new Model(new State('start'))
    this.traces = traces
  }

  loadTraces(dir = './traces/') {
    const traces = Traces.load(dir)
    this.traces.push(...traces)
  }

  build() {
    this.traces.forEach((trace) => this.model.extend(trace))
  }

  clone() {
    const model = new Model(new State('start'))
    model.fold(this.model)
    return model
  }

  cleanModel() {
    const model = this.clone()
    model.duplicateTransitions.forEach((transition) =>
      model.cascadeDeregister(transition.from),
    )
    return model
  }

  errorModels() {
    const model = this.clone()

    const stateIds = new Set(model.duplicateTransitions.map((t) => t.from.id))
    const groupedDuplicateTransitions = Array.from(stateIds).map((stateId) =>
      model.duplicateTransitions.filter((t) => t.from.id === stateId),
    )

    const groupedPaths = groupedDuplicateTransitions.map((transitions) =>
      transitions.map((transition) => {
        const path = model.findPath(model.initialState, transition.from)
        path.push(transition)
        return path
      }),
    )

    const errorModels = groupedPaths.map((paths) => {
      const errorModel = new Model(new State('start'))
      paths.forEach((path) => errorModel.addTransitions(path))
      return errorModel
    })

    return errorModels
  }
}

module.exports = PathFinder
