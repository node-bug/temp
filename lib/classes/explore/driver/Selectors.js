function getSelector(selectors) {
  let selector = ''
  selectors.forEach((item) => {
    selector += `(self::${item}) or `
  })
  selector = `//*[${selector.substring(0, selector.length - 4)}]`
  return selector
}

function application() {
  const selectors = ['XCUIElementTypeApplication']
  return getSelector(selectors)
}

function clickables() {
  // const selector = '//*[(self::XCUIElementTypeButton)]'
  // [ or self::XCUIElementTypeSecureTextField  or self::XCUIElementTypeSearchField)]'

  const selectors = ['XCUIElementTypeButton']
  return getSelector(selectors)
}

module.exports = {
  application: application(),
  clickables: clickables(),
}
