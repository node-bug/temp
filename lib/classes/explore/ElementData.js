const { log } = require('@nodebug/logger')
// const { screenshot } = require('../../../selenium/app/screenshot')

class ElementData {
  // eslint-disable-next-line max-params
  constructor(type, name, label, index, image = []) {
    this.type = type
    this.name = name
    this.label = label
    this.index = index
    this.image = image
  }

  toLabelData() {
    return {
      type: this.type,
      name: this.name,
      label: this.label,
      index: this.index,
      image: this.image,
    }
  }

  toSelector() {
    if ([null, undefined, '', 0, 1].includes(this.index)) {
      return `//${this.type}[@name='${this.name}' and @label='${this.label}']`
    }
    return `//${this.type}[@name='${this.name}' and @label='${this.label}'][${this.index}]`
  }

  static fromILabel(ilabel) {
    return new ElementData(
      ilabel.data.type,
      ilabel.data.name,
      ilabel.data.label,
      ilabel.data.index,
      ilabel.data.image,
    )
  }

  static async fromElement(element) {
    // screenshot of element?
    const type = await element.getTagName()
    const name = await element.getAttribute('name')
    const label = await element.getAttribute('label')
    let index = null
    const image = null

    const elementData = new ElementData(type, name, label, index, image)
    const elements = await element.parent.$$(elementData.toSelector())
    if (elements.length > 1) {
      for (let i = 0; i < elements.length; i++) {
        if (element.elementId === elements[i].elementId) {
          index = i
          break
        }
      }
    }

    log.debug(
      `ElementData: type ${type}, name ${name}, label ${label}, index ${index}`,
    )
    return new ElementData(type, name, label, index, image)

    // log.debug('ElementData: Getting screenshot')
    // if (takeScreenshot) {
    //     snap = await screenshot(element)
    // log.debug(`ElementData: Snap ${snap.length}`)
    // }
    // log.debug('ElementData: Got screenshot')

    // const attributes = [
    //     'text',
    //     'data-test-id',
    //     'aria-label',
    //     'label',
    //     'title',
    //     'alt',
    //     'id',
    //     'class',
    // ]

    // log.debug('ElementData: Getting attributes')
    /* eslint-disable no-await-in-loop */
    // for (
    //     let index = 0;
    //     index < attributes.length && [null, undefined, ''].includes(v);
    //     index++
    // ) {
    //     a = attributes[index]
    //     if (a !== 'text') {
    //         v = await element.getAttribute(a)
    //     } else {
    //         v = await element.getText()
    //     }
    // }
    // /* eslint-enable no-await-in-loop */
    // // log.debug('ElementData: Got attributes')

    // if ([null, undefined, ''].includes(v)) {
    //     log.debug('ElementData: Getting parent attributes due to bad attributes')
    //     const parent = await element.findElement(By.xpath('./..'))
    //     return ElementData.fromWebElement(parent, takeScreenshot)
    // }

    // log.debug('ElementData: Getting index')
    // i = await ElementData.findIndex(element, a, v)
    // log.debug('ElementData: Got index')
  }

  //   //     toSelector() {
  //   //         // Use XPATH, as css has no text selector
  //   //         // TODO: we might want to losen ids (e.g. ignore numbers)

  //   //         var selectors = [];
  //   //         if (this.className) {
  //   //             selectors.push(`contains(@class, '${this.className}')`);
  //   //         }
  //   //         if (this.id) {
  //   //             selectors.push(`@id='${this.id}'`);
  //   //         }
  //   //         if (this.text) {
  //   //             selectors.push(`text()='${this.text}'`);
  //   //         }
  //   //         if (this.label) {
  //   //             selectors.push(`@aria-label='${this.label}'`);
  //   //         }

  //   //         return By.xpath(`//*[${selectors.join(' and ')}]`);
  //   //     }

  //   //     toWeakSelector() {
  //   //         var selectors = [];
  //   //         if (this.text) {
  //   //             selectors.push(`text()='${this.text}'`);
  //   //         }
  //   //         if (this.label) {
  //   //             selectors.push(`@aria-label='${this.label}'`);
  //   //         }

  //   //         return By.xpath(`//*[${selectors.join(' and ')}]`);
  //   //     }

  //   static async findIndex(element, a, v) {
  //     let list
  //     if (a === 'text') {
  //       list = await (
  //         await element.getDriver()
  //       ).findElements(By.xpath(`//*[text()='${v}']`))
  //     } else {
  //       list = await (
  //         await element.getDriver()
  //       ).findElements(By.css(`[${a}*='${v}']`))
  //     }
  //     log.debug(`ElementData: findIndex: ${list.length} matching elements found`)
  //     if (list.length < 2) {
  //       return null
  //     }

  //     // eslint-disable-next-line no-restricted-syntax
  //     for (const [i, item] of list.entries()) {
  //       // eslint-disable-next-line no-await-in-loop
  //       if (await WebElement.equals(item, element)) {
  //         return i + 1
  //       }
  //     }

  //     return 1
  //   }

  //   static async fromWebElement(element, takeScreenshot) {
  //     let snap = null
  //     let a = null
  //     let v = null
  //     let i = null

  //     // log.debug('ElementData: Getting screenshot')
  //     if (takeScreenshot) {
  //       snap = await screenshot(element)
  //       // log.debug(`ElementData: Snap ${snap.length}`)
  //     }
  //     // log.debug('ElementData: Got screenshot')

  //     const attributes = [
  //       'text',
  //       'data-test-id',
  //       'aria-label',
  //       'label',
  //       'title',
  //       'alt',
  //       'id',
  //       'class',
  //     ]

  //     // log.debug('ElementData: Getting attributes')
  //     /* eslint-disable no-await-in-loop */
  //     for (
  //       let index = 0;
  //       index < attributes.length && [null, undefined, ''].includes(v);
  //       index++
  //     ) {
  //       a = attributes[index]
  //       if (a !== 'text') {
  //         v = await element.getAttribute(a)
  //       } else {
  //         v = await element.getText()
  //       }
  //     }
  //     /* eslint-enable no-await-in-loop */
  //     // log.debug('ElementData: Got attributes')

  //     if ([null, undefined, ''].includes(v)) {
  //       log.debug('ElementData: Getting parent attributes due to bad attributes')
  //       const parent = await element.findElement(By.xpath('./..'))
  //       return ElementData.fromWebElement(parent, takeScreenshot)
  //     }

  //     // log.debug('ElementData: Getting index')
  //     i = await ElementData.findIndex(element, a, v)
  //     // log.debug('ElementData: Got index')

  //     log.debug(`ElementData: attribute: ${a}, value: ${v}, index: ${i}`)
  // return new ElementData(a, v, i, snap)
  //   }
}

module.exports = ElementData
