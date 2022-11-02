const { log } = require('@nodebug/logger')

const fs = require('fs')
const uuid = require('uuid')
const State = require('./State')
const Model = require('./Model')

// /**
//  * Builds up models from traces
//  */
class ModelBuilder {
  static build(traces) {
    const model = new Model(new State('start'))
    traces.forEach((trace) => model.extend(trace))
    return model
  }

  static save(models, dir = './models/') {
    // Don't save model we've loaded via `load`
    let modelsArray = models
    if (!(modelsArray instanceof Array)) {
      modelsArray = [modelsArray]
    }
    modelsArray.forEach((model) => {
      if (!model.fromFile) {
        model.toFile(`${dir}model-${uuid.v4()}.json`)
      }
    })
  }

  static load(dir = './models/') {
    let filenames
    const models = []
    try {
      filenames = fs.readdirSync(dir)
    } catch (err) {
      if (err.message.includes('no such file or directory')) {
        log.warn(err.message)
        return false
      }
      throw err
    }
    filenames.forEach((filename) => {
      if (filename.endsWith('.json')) {
        const model = Model.fromFile(dir + filename)
        model.fromFile = true
        models.push(model)
      }
    })
    return models
  }
}

module.exports = ModelBuilder
