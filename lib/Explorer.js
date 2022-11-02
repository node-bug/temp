const config = require('@nodebug/config')('explorer')
const { log } = require('@nodebug/logger')
const { expect } = require('chai')

const Trace = require('./classes/explore/Trace')
const Traces = require('./classes/common/Traces')
const ILabels = require('./classes/explore/ILabels')
const Randomizer = require('./classes/explore/driver/Randomizer')
const Actions = require('./classes/explore/driver/Actions')

class Explorer {
  static get defaultConfig() {
    return {
      maxTraces: 1,
      maxDepth: 10,
      // Save images of state and things we interact with
      saveImages: false,
      // Decorate elements we (try to) interact with
      decorateElements: false,
    }
  }

  constructor(app, traces = []) {
    expect(app).to.respondTo('before', 'App not correctly implemented')
    expect(app).to.respondTo('after', 'App not correctly implemented')
    expect(app).to.respondTo('determineState', 'App not correctly implemented')

    this.config = { ...this.defaultConfig, ...config }
    this.traces = traces
    this.app = app
    this.randomizer = new Randomizer(this.app.driver)
    this.actions = new Actions(this.app.driver)
  }

  // // async rerun(statename) {
  // //   var model = new ModelBuilder(this.traces).build();
  // //   var path = model.findPath(model.findState(statename));

  // //   for (var i = 0; i < path.length; i++) {
  // //     var transition = path[i];
  // //     var ilabel = InstantiatedLabel.fromTransition(transition);
  // //     if (ilabel.label.response || ilabel.label.quiescence) {
  // //       continue;
  // //     }
  // //     var action = Actions.fromILabel(this.driver, this._app, ilabel);
  // //     await action.execute();
  // //   }

  // //   // TODO: observe state and output
  // //   // TODO: log the new trace
  // //   // TODO: re-evaluate path after each step
  // // }

  // //     // TODO: remove, no need to expose transitions, use rerun instead.
  // //     findPath(statename) {
  // //         var model = new (this.traces).build();
  // //         return model.findPath(model.findState(statename));
  // //     }

  async retrace(saveLocation = './traces/') {
    const oldTraces = [...this.traces]
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < oldTraces.length; i++) {
      const trace = oldTraces[i]
      const retrace = new Trace()
      // const filename = this.traces[i].filename
      log.info(`RE-TRACE ${i + 1}/${oldTraces.length} STARTED`)
      try {
        for (let j = 0, leftApp = false; j < trace.length && !leftApp; j++) {
          if (trace[j].label.response || trace[j].label.quiescence) {
            // eslint-disable-next-line no-continue
            continue
          }
          log.debug(`Depth ${j}`)
          if (j === 0) {
            retrace.addAll(await this.app.before())
          } else {
            retrace.add(await this.perform(trace[j]))
          }
          retrace.add(ILabels.quiescence())
          const meta = {}
          meta.state = await this.app.determineState()
          retrace[retrace.length - 1].metadata = meta
          leftApp = meta.state.isExternal
        }
      } catch (err) {
        log.error('Error during this RE-TRACE')
        log.error(err.stack)
      } finally {
        await this.app.after()
      }
      log.info(retrace.map((ilabel) => ilabel.label.name))
      this.traces.push(retrace)
    }
    /* eslint-enable no-await-in-loop */
    Traces.save(this.traces, saveLocation)
  }

  async loadTraces(dir = './traces/') {
    const traces = Traces.load(dir)
    this.traces.push(...traces)
  }

  async perform(iLabel) {
    const ilabel = await this.actions.perform(iLabel)
    // await sleep(this.config.WAIT_SECONDS * 1000)
    return ilabel
  }

  async stimulate() {
    const ilabel = await this.randomizer.perform()
    // await sleep(this.config.WAIT_SECONDS * 1000)
    return ilabel
  }

  async do() {
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < this.config.maxTraces; i++) {
      log.info(`TRACE ${i + 1}/${this.config.maxTraces} STARTED`)

      try {
        const trace = new Trace()
        for (
          let j = 0, leftApp = false;
          j < this.config.maxDepth && !leftApp;
          j++
        ) {
          log.debug(`Depth ${j}`)
          if (j === 0) {
            trace.addAll(await this.app.before())
          } else {
            trace.add(await this.stimulate())
          }
          //   trace.addAll(await app.waitForConsole())
          trace.add(ILabels.quiescence())
          const meta = {}
          meta.state = await this.app.determineState()
          trace[trace.length - 1].metadata = meta
          leftApp = meta.state.isExternal
        }
        log.info(trace.map((ilabel) => ilabel.label.name))
        this.traces.push(trace)
      } catch (err) {
        log.error('Error during this TRACE')
        log.error(err.stack)
      } finally {
        await this.app.after()
      }
    }
    /* eslint-enable no-await-in-loop */
    Traces.save(this.traces, './traces/')
  }
}

module.exports = Explorer
