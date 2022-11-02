const { log } = require('@nodebug/logger')
const PathFinder = require('./classes/model/PathFinder')
const Visualizer = require('./classes/model/Visualizer')

class Reporter extends PathFinder {
  constructor(traces = []) {
    super(traces)
    this.name = `${Date.now().toString().slice(-5)}`
  }

  static save(model, location = './models/unknown/model.json') {
    model.toFile(location)
  }

  static visualize(model, location = './reports/unknown/model.html') {
    Visualizer.createHTML(model, location)
  }

  exploration() {
    this.build()
    log.debug('Built model from traces')

    // full model
    Reporter.save(this.model, `./models/full/model-${this.name}.json`)
    Reporter.visualize(this.model, `./reports/full/${this.name}/model.html`)
    log.debug('Visualized and Saved full model')

    // clean model
    const cleanModel = this.cleanModel()
    Reporter.save(cleanModel, `./models/clean/model-${this.name}.json`)
    Reporter.visualize(cleanModel, `./reports/clean/${this.name}/model.html`)
    log.debug('Visualized and Saved clean model')

    // error models
    const errors = this.errorModels()
    for (let i = 0; i < errors.length; i++) {
      const model = errors[i]
      Reporter.save(model, `./models/errors/${this.name}/model-${i}.json`)
      Reporter.visualize(model, `./reports/errors/${this.name}/${i}/model.html`)
    }
    log.debug('Visualized and Saved models of errors')
  }

  // segregate() {
  //   const model = ModelBuilder.build(this.traces)
  //   const duplicateTransitions = model.transitions.filter(t => t.isDuplicate)

  //   const uniqueFromStates = new Set(duplicateTransitions.map(t => t.from.id))
  //   const transitionSets = []
  //   uniqueFromStates.forEach(stateId => transitionSets.push(duplicateTransitions.filter(t => t.from.id === stateId)))

  //   const groups = transitionSets.map(
  //     transitions => transitions.map(
  //       transition => {
  //         const path = model.findPath(model.initialState, transition.from)
  //         path.push(transition)
  //         return path
  //       }
  //     )
  //   )

  //   groups.forEach(group => {
  //     const submodel = new Model(new State('start'))
  //     group.forEach(path => submodel.addTransitions(path))
  //     ModelBuilder.save(submodel, './models/errors/')
  //     Visualizer.createHTML(submodel, `./reports/errors/error${Date.now().toString().slice(-5)}.html`)
  //   })
  // }
}

module.exports = Reporter
