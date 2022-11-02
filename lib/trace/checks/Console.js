// const { expect } = require('chai')

// const ILabels = require('../ILabels')
// const Trace = require('../../base/trace/Trace')

// class ConsoleCheck {
//   static get defaultConfig() {
//     return { onError: true, allowMultiple: true }
//   }

//   /* eslint-disable no-underscore-dangle */
//   get browser() {
//     return this._browser
//   }

//   get config() {
//     return this._config
//   }

//   constructor(browser, config) {
//     this._browser = browser

//     expect(config).to.have.own.property('types')
//     expect(config).to.have.own.property('levels')
//     this._config = { ...this.defaultConfig, ...config }
//   }
//   /* eslint-enable no-underscore-dangle */

//   async check() {
//     const logs = await this.browser.getLog(
//       this.config.types,
//       this.config.levels,
//     )
//     const ilabels = logs.map((item) => ILabels.consoleError(item.message))
//     return Trace.fromArray(ilabels)
//   }
// }

// module.exports = ConsoleCheck
