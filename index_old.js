// const { log } = require('@nodebug/logger')
// const Explorer = require('./lib/Explorer')
// const Reporter = require('./lib/Reporter')
// const ModelManager = require('./lib/ModelManager')
// const App = require('./lib/App')
// const { Appium, Simulator } = require('./lib/appium')

// const { sleep } = require('./utils')

// async function explore() {
//   const server = new Appium()
//   await server.start()
//   const simulator = new Simulator()
//   await simulator.create()
//   await sleep(5000)

//   const app = new App(server, simulator)
//   const explorer = new Explorer(app)
//   await explorer.do()
//   explorer.visualize()
//   explorer.saveModel()

//   await simulator.delete()
//   await server.stop()
// }
// // explore()

// async function retrace() {
//   const server = new Appium()
//   await server.start()
//   const simulator = new Simulator()
//   await simulator.create()
//   await sleep(5000)

//   const app = new App(server, simulator)
//   const explorer = new Explorer(app)

//   log.info('Finished retrace. Saving new retraces and model...')
//   log.info('Loading previous traces')
//   explorer.loadTraces()
//   log.info(`Traces loaded: ${explorer.traces.length}`)
//   await explorer.retrace()

//   explorer.visualize()
//   // explorer.saveModel()

//   await simulator.delete()
//   await server.stop()
// }
// // retrace()

// async function saveModel() {
//   const reporter = new Reporter()
//   log.info('Loading previous traces')
//   reporter.loadTraces()
//   log.info(`Traces loaded: ${reporter.traces.length}`)
//   reporter.saveModel()
//   reporter.visualize()
// }
// // saveModel()

// async function manage() {
//   const manager = new ModelManager()
//   log.info('Loading previous models')
//   manager.loadModels('./models/')
//   log.info(`Models loaded: ${manager.models.length}`)
//   // manager.visualize()
//   manager.merge()
// }
// // manage()

// async function report() {
//   const reporter = new Reporter()
//   log.info('Loading previous traces')
//   reporter.loadTraces()
//   log.info(`Traces loaded: ${reporter.traces.length}`)
//   reporter.visualize('reports/model.html')
// }
// // report()
