const fs = require('fs')
const uuid = require('uuid')
const { log } = require('@nodebug/logger')
const Trace = require('../explore/Trace')

class Traces {
  static save(traces, dir = './traces/') {
    for (let i = 0; i < traces.length; i++) {
      const trace = traces[i]
      // Don't save traces we've loaded via `loadTraces`
      if (!trace.fromFile) {
        trace.toFile(`${dir}trace-${uuid.v4()}.json`)
      }
    }
  }

  static load(dir = './traces/') {
    let filenames
    const traces = []
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
        const trace = Trace.fromFile(dir + filename)
        trace.fromFile = true
        traces.push(trace)
      }
    })

    return traces
  }
}

module.exports = Traces
