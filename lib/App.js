const config = require('@nodebug/config')('app')
const Trace = require('./classes/explore/Trace') // core
const ILabels = require('./classes/explore/ILabels')
const StateStrategy = require('./classes/common/StateStrategy')
// const ConsoleCheck = require('./lib/trace/checks/Console')
const { Driver } = require('./appium')

class App {
  constructor(server, simulator) {
    this.server = server
    this.simulator = simulator
    this.driver = new Driver(server, simulator, config)
    this.strategy = new StateStrategy(this.driver, config.applicationName)
  }

  async before() {
    await this.driver.launch()
    //   await this.browser.goto(this.appdata.url)
    //   await this.browser.element('username').overwrite('raptoradmin')
    //   await this.browser.element('password').overwrite('fasterthansixmill')
    //   await this.browser.element('submit').click()
    //   await this.browser.goto(this.appdata.url)

    const trace = new Trace()
    trace.add(ILabels.hook(`Launch App`))
    return trace
  }

  async after() {
    await this.driver.quit()
  }

  //   async waitForConsole() {
  //     const console = new ConsoleCheck(this.browser, {
  //       types: this.appdata.error.types,
  //       levels: this.appdata.error.levels,
  //     })
  //     const outputTrace = await console.check()
  //     return outputTrace
  //   }

  async determineState() {
    const appState = await this.strategy.getState()
    return appState
  }
}

module.exports = App
