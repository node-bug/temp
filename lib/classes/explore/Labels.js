const { expect } = require('chai')
const Label = require('../common/Label')

function hook() {
  const label = Label.stimulus('hook')
  label.addParameter('description')

  return label
}

function tap(type) {
  let label
  switch (type) {
    case 'long tap':
      label = Label.stimulus('long tap')
      break

    default:
      label = Label.stimulus('tap')
  }
  label.addParameter('type')
  label.addParameter('name')
  label.addParameter('label')
  label.addParameter('index')
  label.addParameter('image')
  return label
}

function error(type = 'error', labelType = 'response') {
  // eslint-disable-next-line no-unused-expressions
  expect(type.startsWith('error')).to.be.true

  const label = Label[labelType](`${type}`)
  label.addParameter('message')

  return label
}

module.exports = {
  hook: hook(),
  tap: tap('tap'),
  longtap: tap('long tap'),
  errorStimulus: error('error_stimulus', 'stimulus'),
  //   errorA11Y: error('error_a11y'),
  //   errorConsole: error('error_console'),
}
