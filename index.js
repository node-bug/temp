const { log } = require('@nodebug/logger')
const Explorer = require('./lib/Explorer')
const Reporter = require('./lib/Reporter')
const App = require('./lib/App')
const { Appium, Simulator } = require('./lib/appium')
const { sleep } = require('./utils')

function cleanAndSave() {
  const reporter = new Reporter()
  log.info('Loading previous traces')
  reporter.loadTraces()
  log.info(`Traces loaded: ${reporter.traces.length}`)

  reporter.exploration()
  log.info('Visualized and saved complete model ')
}
cleanAndSave()

async function explore() {
  const server = new Appium()
  await server.start()
  const simulator = new Simulator()
  await simulator.create()
  await sleep(5000)

  const app = new App(server, simulator)
  const explorer = new Explorer(app)
  await explorer.do()
  await explorer.retrace()

  await simulator.delete()
  await server.stop()

  await cleanAndSave()
}
explore()
