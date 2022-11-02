const ModelBuilder = require('./classes/model/ModelBuilder')
const Visualizer = require('./classes/model/Visualizer')

class ModelManager {
  constructor() {
    this.models = []
  }

  loadModels(location = './models/') {
    const models = ModelBuilder.load(location)
    models.forEach((model) => this.models.push(model))
  }

  visualize() {
    this.models.forEach((model) =>
      Visualizer.createHTML(
        model,
        `./reports1/model${Date.now().toString().slice(-5)}.html`,
      ),
    )
  }

  merge() {
    const finalModel = this.models.pop()
    for (let i = 0; i < this.models.length; i++) {
      const model = this.models.pop()
      finalModel.fold(model)
    }
    Visualizer.createHTML(
      finalModel,
      `./reports1/model${Date.now().toString().slice(-5)}.html`,
    )
    return finalModel
  }
}

module.exports = ModelManager
