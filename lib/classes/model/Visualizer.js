const fs = require('fs')
const path = require('path')
const open = require('open')

const ORIGINAL_MAX_MEMORY = 16777216
const MAX_MEMORY_MULTIPLIER = 32

const Screenshot = require('../common/Screenshot')

class Visualizer {
  static storeAndAddStateImages(states, workdir) {
    return states
      .map((state) => {
        if (state.hasImage) {
          const filename = `${state.sanitizedId}.png`
          const screenshot = Screenshot.fromBase64(state.meta.image)
          screenshot.store(path.join(workdir, filename))
          return `.addImage("./${filename}", "${screenshot.image.width}px", "${screenshot.image.height}px")`
        }
        return ''
      })
      .join('\n')
  }

  static storeAndAddTransitionImages(transitions, workdir) {
    return transitions
      .map(async (transition) => {
        if (transition.guard.image) {
          const filename = `${transition.id}.png`
          const screenshot = Screenshot.fromBase64(transition.guard.image)
          screenshot.store(path.join(workdir, filename))
          return `.addImage("./${filename}", "${screenshot.image.width}px", "${screenshot.image.height}px")`
        }
        return ''
      })
      .join('\n')
  }

  static createHTML(model, location) {
    const dir = path.dirname(location)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const workdir = location.substring(0, location.lastIndexOf('/'))
    const html = `<!DOCTYPE html>
                <meta charset="utf-8">
                <body>
                    <script src="http://d3js.org/d3.v4.min.js"></script>
                    <script src="https://unpkg.com/viz.js@1.8.0/viz.js" type="javascript/worker"></script>
                    <script src="https://unpkg.com/d3-graphviz@2.6.0/build/d3-graphviz.min.js"></script>
                    <div id="graph" style="text-align: center;"></div>
                    <script>
                        d3.select("#graph").graphviz()
                            ${Visualizer.storeAndAddStateImages(
                              model.states,
                              workdir,
                            )}
                            ${Visualizer.storeAndAddTransitionImages(
                              model.transitions,
                              workdir,
                            )}
                            .totalMemory(${
                              ORIGINAL_MAX_MEMORY * MAX_MEMORY_MULTIPLIER
                            })
                            .fade(false)
                            .renderDot(\`${model.toDot(workdir)}\`);
                </script></body></html>`

    fs.writeFileSync(location, html)
    return open(location)
  }
}

module.exports = Visualizer
