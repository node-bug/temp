const { expect } = require('chai')
const { parse, stringify } = require('flatted')
const fs = require('fs')
const { dirname } = require('path')
const Label = require('../common/Label')
const State = require('./State')
const Transition = require('./Transition')

class Model {
  get transitions() {
    const transitions = []
    this.states.forEach((state) => transitions.push(...state.transitions))
    return transitions
  }

  get newState() {
    return new State(`_${this.states.length + 1}`)
  }

  constructor(initialState) {
    expect(initialState).to.be.an.instanceOf(State)

    this.initialState = initialState
    this.states = [this.initialState]
    this.labels = []
  }

  findLabel(label) {
    return this.labels.find((l) => l.id === label.id)
  }

  addLabel(label) {
    expect(label).to.be.an.instanceof(Label)
    return this.findLabel(label) || (this.labels.push(label) && label)
  }

  findState(state) {
    const index = this.states.findIndex((s) => s.isSimilarTo(state))
    if (index !== -1) {
      return this.states[index]
    }
    return false
  }

  addState(state) {
    expect(state).to.be.an.instanceOf(State)
    const foundState = this.findState(state)
    if (!foundState) {
      this.states.push(state)
      return state
    }
    return foundState
  }

  removeState(state) {
    expect(state).to.be.an.instanceOf(State)
    const index = this.states.findIndex((s) => s.id === state.id)
    if (index > -1) {
      return this.states.splice(index, 1)[0]
    }
    return false
  }

  cascadeDeregister(state) {
    expect(state).to.be.an.instanceOf(State)
    this.transitions
      .filter((t) => t.to.id === state.id)
      .map((t) => t.from.deregisterTransition(t))
    // state.transitions.map((t) => {
    state.transitions.forEach((t) => {
      const transition = state.deregisterTransition(t)
      const index = this.transitions.findIndex(
        (trn) => trn.to === transition.to,
      )
      if (index < 0) {
        this.cascadeDeregister(transition.to)
      }
    })
    this.removeState(state)
  }

  addTransition(from, labelData, to, guard = {}) {
    expect(from).to.be.an.instanceOf(State)
    expect(labelData).to.be.an.instanceOf(Label)
    expect(to).to.be.an.instanceOf(State)

    const fromState = this.findState(from)
    const label = this.addLabel(labelData)

    let transition = fromState.getTransitionFor(label, to, guard)
    if (!transition) {
      const toState = this.addState(to)
      transition = new Transition(fromState, label, toState, guard)
      fromState.registerTransition(transition)
    } else if (!(transition instanceof Transition)) {
      const toState = this.addState(to)
      const newTransition = new Transition(fromState, label, toState, guard)
      fromState.replaceTransition(transition, newTransition)
    }

    return transition
  }

  get duplicateTransitions() {
    return this.transitions.filter((t) => t.isDuplicate)
  }

  extend(ilabels) {
    let currentState = this.initialState
    for (let i = 0; i < ilabels.length; i++) {
      const ilabel = ilabels[i]

      const toState = this.newState
      if (ilabel.metadata.state) {
        toState.addMeta(ilabel.metadata.state)
      }

      // TODO: implement 'optional parameters', not all data needs to guard?
      const transition = this.addTransition(
        currentState,
        ilabel.label,
        toState,
        ilabel.data,
      )
      currentState = transition.to
    }
    return this
  }

  static fromJSON(json) {
    const model = new Model(new State('start'))

    const states = [...json.states]
    states.splice(
      states.findIndex((s) => model.initialState.isSimilarTo(s)),
      1,
    )
    // states.map((s) => {
    states.forEach((s) => {
      const state = model.newState
      if (State.fromJSON(s).hasMeta) {
        state.addMeta(s.meta)
      }
      model.addState(state)
    })

    // json.states.map((state) =>
    json.states.forEach(
      (
        state, // state.transitions.map((transition) => {
      ) =>
        state.transitions.forEach((transition) => {
          const from = model.findState(State.fromJSON(transition.from))
          const to = model.findState(State.fromJSON(transition.to))
          model.addTransition(
            from,
            Label.fromJSON(transition.label),
            to,
            transition.guard,
          )
        }),
    )

    return model
  }

  static fromFile(filepath) {
    const json = parse(fs.readFileSync(filepath).toString())
    return Model.fromJSON(json)
  }

  toFile(filepath) {
    const dir = dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filepath, stringify(this))
  }

  addTransitions(t) {
    const transitions = parse(stringify(t))
    if (!this.initialState.isSimilarTo(transitions[0].from)) {
      throw new Error(
        `Start state is "${transitions[0].from.name}". It does not match with current model initial state.`,
      )
    }

    let from = this.initialState
    while (transitions.length > 0) {
      const transition = transitions.shift()
      const label = Label.fromJSON(transition.label)
      const to = this.newState
      if (State.fromJSON(transition.to).hasMeta) {
        to.addMeta(transition.to.meta)
      }
      from = this.addTransition(from, label, to, transition.guard).to
    }
  }

  fold(model) {
    expect(model).to.be.an.instanceOf(Model)
    model.uniquePaths.forEach((path) => this.addTransitions(path))
  }

  get uniquePaths() {
    const transitions = parse(stringify(this.transitions))
    const paths = []

    while (transitions.length > 0) {
      let path = []
      let transition = transitions.shift()
      const curState = this.findState(State.fromJSON(transition.from))
      if (curState !== this.initialState) {
        path = this.findPath(this.initialState, curState)
      }
      path.push(
        this.transitions.filter(
          (t) =>
            t.from.id === transition.from.id &&
            t.label.id === transition.label.id &&
            t.to.id === transition.to.id,
        )[0],
      )
      while (transition.to.transitions.length > 0) {
        transition = transition.to.transitions.shift()
        const index = transitions.indexOf(transition)
        if (index !== -1) {
          // eslint-disable-next-line prefer-destructuring
          transition = transitions.splice(index, 1)[0]
          /* eslint-disable no-loop-func */
          path.push(
            this.transitions.filter(
              (t) =>
                t.from.id === transition.from.id &&
                t.label.id === transition.label.id &&
                t.to.id === transition.to.id,
            )[0],
          )
          /* eslint-enable no-loop-func */
        }
      }
      paths.push(path)
    }

    return paths
  }

  // Depth-first search
  findPath(strtState, trgtState) {
    const startState = strtState ? this.findState(strtState) : this.initialState
    // eslint-disable-next-line no-unused-expressions
    expect(startState, 'startState must be in model').to.be.ok

    const targetState = this.findState(trgtState)
    // eslint-disable-next-line no-unused-expressions
    expect(targetState, 'targetState must be in model').to.be.ok

    const visited = []
    let stack = [{ state: startState, transitions: [] }]

    function transitionToFringeFn(path) {
      return function (transition) {
        return {
          state: transition.to,
          transitions: path.concat([transition]),
        }
      }
    }

    while (stack.length) {
      const node = stack.pop()
      const { state } = node
      const path = node.transitions

      if (state === targetState) {
        return path
      }

      if (visited.includes(state)) {
        // eslint-disable-next-line no-continue
        continue
      }

      stack = stack.concat(state.transitions.map(transitionToFringeFn(path)))

      visited.push(state)
    }
    return visited
  }

  // TODO: its about time to move to its own class/visualizer as there's coupling with the file system
  toDot() {
    const dotStates = this.states.map((state) => state.toDot()).join('\n')

    const dotTransitions = this.states
      .map((state) =>
        state.transitions.map((transition) => transition.toDot()).join('\n'),
      )
      .join('\n')

    return `digraph {
                  "_initialState" [style="invisible"]
                  ${dotStates}
                  "_initialState" -> "${this.initialState.name}"
                  ${dotTransitions}
              }`
  }
}

module.exports = Model
