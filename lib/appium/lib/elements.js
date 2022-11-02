// const { log } = require('@nodebug/logger')
const attributes = ['name', 'label', 'value', 'text']

class ElementLocator {
  get driver() {
    return this._driver
  }

  set driver(value) {
    this._driver = value
  }

  /* eslint-disable class-methods-use-this */
  transform(text) {
    let txt
    if (text.includes("'")) {
      txt = `concat('${text.replace(`'`, `',"'",'`)}')`
    } else {
      txt = `'${text}'`
    }
    return txt
  }
  /* eslint-enable class-methods-use-this */

  getSelector(obj) {
    let selector = ''
    if (obj.exact) {
      attributes.forEach((attribute) => {
        selector += `normalize-space(@${attribute})=${this.transform(
          obj.id,
        )} or `
      })
      selector += `normalize-space(.)=${this.transform(obj.id)} `
      selector += `and not(.//*[normalize-space(.)=${this.transform(obj.id)}])`
    } else {
      attributes.forEach((attribute) => {
        selector += `contains(normalize-space(@${attribute}),${this.transform(
          obj.id,
        )}) or `
      })
      selector += `contains(normalize-space(.),${this.transform(obj.id)}) `
      selector += `and not(.//*[contains(normalize-space(.),${this.transform(
        obj.id,
      )})])`
    }

    if (['button'].includes(obj.type)) {
      selector = `//XCUIElementTypeButton[${selector}]`
    } else if (['image'].includes(obj.type)) {
      selector = `//XCUIElementTypeImage[${selector}]`
    } else if (['switch'].includes(obj.type)) {
      selector = `//XCUIElementTypeSwitch[${selector}]`
    } else if (['textbox'].includes(obj.type)) {
      selector =
        `//*[${selector} and (self::XCUIElementTypeTextField or self::XCUIElementTypeSecureTextField` +
        ` or self::XCUIElementTypeSearchField)]`
    } else if (['alert'].includes(obj.type)) {
      selector = `//XCUIElementTypeAlert[${selector}]`
    } else if (['cell'].includes(obj.type)) {
      selector = `//*[${selector}]/ancestor-or-self::XCUIElementTypeCell`
    } else if (['menu item'].includes(obj.type)) {
      selector = `//*[${selector}]/ancestor-or-self::XCUIElementTypeMenuItem`
    } else {
      selector = `//*[${selector}]`
    }

    return selector
  }

  async addQualifiers(locator) {
    const element = locator
    element.rect = await this.driver.getElementRect(element.elementId)
    element.rect.left = element.rect.x
    element.rect.right = element.rect.x + element.rect.width
    element.rect.midx = element.rect.x + element.rect.width / 2
    element.rect.top = element.rect.y
    element.rect.bottom = element.rect.y + element.rect.height
    element.rect.midy = element.rect.y + element.rect.height / 2
    element.tagname = await this.driver.getElementTagName(element.elementId)
    return element
  }

  async addParentWindow(locator) {
    const element = locator
    element.window = await this.driver.$(
      `(${locator.selector})[${
        locator.index + 1
      }]/ancestor-or-self::XCUIElementTypeWindow`,
    ).elementId
    return element
  }

  async findElements(elementData) {
    const c = []
    const elements = await this.driver.$$(this.getSelector(elementData))
    if (elements.length > 0) {
      const matches = await Promise.all(
        elements.map((element) => this.addQualifiers(element)),
      )
      c.push(...matches.filter((e) => e.rect.height > 0 && e.rect.width > 0))
    }
    return c
  }

  async nearestElement(locator, action) {
    let tagnames = []
    if (['write'].includes(action)) {
      tagnames = [
        'XCUIElementTypeTextField',
        'XCUIElementTypeSecureTextField',
        'XCUIElementTypeSearchField',
      ]
    } else if (['toggle'].includes(action)) {
      tagnames = ['XCUIElementTypeSwitch']
    }

    if (tagnames.includes(locator.tagname)) {
      return locator
    }

    let elements = []
    await Promise.all(
      tagnames.map(async (tagname) => {
        const elementsFound = await this.driver.$$(`//${tagname}`)
        elements = [...elements, ...elementsFound]
        return elementsFound
      }),
    )

    await Promise.all(
      elements.map(async (ele) => {
        let e = ele
        e = await this.addQualifiers(e)
        e.distance = Math.sqrt(
          (e.rect.midx - locator.rect.midx) ** 2 +
            (e.rect.y - locator.rect.y) ** 2,
        )
        return e
      }),
    )

    const re = await this.addParentWindow(locator)
    await Promise.all(
      elements.map(async (e) => {
        return this.addParentWindow(e)
      }),
    )
    elements = elements.filter((e) => e.window === re.window)

    elements.sort(function swap(a, b) {
      return parseFloat(a.distance) - parseFloat(b.distance)
    })
    return elements[0]
  }

  /* eslint-disable class-methods-use-this */
  async relativeSearch(item, rel, relativeElement) {
    if ([undefined, null, ''].includes(rel)) {
      return item.matches
    }
    if ([undefined, null, ''].includes(rel.located)) {
      return item.matches
    }

    let elements
    if (![undefined, null, ''].includes(relativeElement)) {
      switch (rel.located) {
        case 'above':
          if (rel.exactly === true) {
            elements = item.matches.filter((element) => {
              return (
                relativeElement.rect.top >= element.rect.bottom &&
                relativeElement.rect.left - 5 <= element.rect.left &&
                relativeElement.rect.right + 5 >= element.rect.right
              )
            })
          } else {
            elements = item.matches.filter((element) => {
              return relativeElement.rect.top >= element.rect.bottom
            })
          }
          break
        case 'below':
          if (rel.exactly === true) {
            elements = item.matches.filter((element) => {
              return (
                relativeElement.rect.bottom <= element.rect.top &&
                relativeElement.rect.left - 5 <= element.rect.left &&
                relativeElement.rect.right + 5 >= element.rect.right
              )
            })
          } else {
            elements = item.matches.filter((element) => {
              return relativeElement.rect.bottom <= element.rect.top
            })
          }
          break
        case 'toLeftOf':
          if (rel.exactly === true) {
            elements = item.matches.filter((element) => {
              return (
                relativeElement.rect.left >= element.rect.right &&
                relativeElement.rect.top - 5 <= element.rect.top &&
                relativeElement.rect.bottom + 5 >= element.rect.bottom
              )
            })
          } else {
            elements = item.matches.filter((element) => {
              return relativeElement.rect.left >= element.rect.right
            })
          }
          break
        case 'toRightOf':
          if (rel.exactly === true) {
            elements = item.matches.filter((element) => {
              return (
                relativeElement.rect.right <= element.rect.left &&
                relativeElement.rect.top - 5 <= element.rect.top &&
                relativeElement.rect.bottom + 5 >= element.rect.bottom
              )
            })
          } else {
            elements = item.matches.filter((element) => {
              return relativeElement.rect.right <= element.rect.left
            })
          }
          break
        case 'within':
          elements = item.matches.filter((element) => {
            return (
              relativeElement.rect.left <= element.rect.left + 5 &&
              relativeElement.rect.right + 5 >= element.rect.right &&
              relativeElement.rect.top <= element.rect.top + 5 &&
              relativeElement.rect.bottom + 5 >= element.rect.bottom
            )
          })
          break
        default:
          throw new ReferenceError(`Location '${rel.located}' is not supported`)
      }
    } else {
      throw new ReferenceError(
        `Location '${rel.located}' cannot be found as relative element is '${relativeElement}'`,
      )
    }

    const re = await this.addParentWindow(relativeElement)
    await Promise.all(
      elements.map(async (e) => {
        return this.addParentWindow(e)
      }),
    )
    elements = elements.filter((e) => e.window === re.window)

    return elements
  }
  /* eslint-enable class-methods-use-this */

  async resolveElements(stack) {
    const items = []

    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < stack.length; i++) {
      const item = { ...stack[i] }
      if (
        [
          'element',
          'button',
          'image',
          'switch',
          'textbox',
          'alert',
          'cell',
          'menu item',
        ].includes(item.type) &&
        item.matches.length < 1
      ) {
        item.matches = await this.findElements(item)
      }
      items.push(item)
    }
    /* eslint-enable no-await-in-loop */
    return items
  }

  async find(stack, action) {
    const data = await this.resolveElements(stack)

    let element = null
    /* eslint-disable no-await-in-loop */
    for (let i = data.length - 1; i > -1; i--) {
      const item = data[i]
      if (
        [
          'element',
          'button',
          'image',
          'switch',
          'textbox',
          'alert',
          'cell',
          'menu item',
        ].includes(item.type)
      ) {
        const elements = await this.relativeSearch(item)
        if (item.index !== false) {
          element = elements[item.index - 1]
        } else {
          ;[element] = elements
        }
        if ([undefined, null, ''].includes(element)) {
          throw new ReferenceError(
            `'${item.id}' has no matching elements on page.`,
          )
        }
      } else if (item.type === 'location') {
        i -= 1
        const elements = await this.relativeSearch(data[i], item, element)
        if (data[i].index !== false) {
          element = elements[data[i].index - 1]
        } else {
          ;[element] = elements
        }
        if ([undefined, null, ''].includes(element)) {
          throw new ReferenceError(
            `'${data[i].id}' ${item.located} '${
              data[i + 2].id
            }' has no matching elements on page.`,
          )
        }
      }
    }
    /* eslint-enable no-await-in-loop */
    if (action !== null) {
      element = await this.nearestElement(element, action)
    }
    if (
      ['textbox'].includes(stack[0].type) &&
      ![
        'XCUIElementTypeTextField',
        'XCUIElementTypeSecureTextField',
        'XCUIElementTypeSearchField',
      ].includes(element.tagname)
    ) {
      element = await this.nearestElement(element, 'write')
    }

    return element
  }

  async findAll(stack) {
    const data = await this.resolveElements(stack)

    let element = null
    /* eslint-disable no-await-in-loop */
    for (let i = data.length - 1; i > -1; i--) {
      const item = data[i]
      if (
        [
          'element',
          'button',
          'image',
          'switch',
          'textbox',
          'alert',
          'cell',
        ].includes(item.type)
      ) {
        const elements = await this.relativeSearch(item)
        if (item.index !== false) {
          element = elements[item.index - 1]
        } else {
          if (i === 0) {
            return elements
          }
          ;[element] = elements
        }
        if ([undefined, null, ''].includes(element)) {
          throw new ReferenceError(
            `'${item.id}' has no matching elements on page.`,
          )
        }
      } else if (item.type === 'location') {
        i -= 1
        const elements = await this.relativeSearch(data[i], item, element)
        if (data[i].index !== false) {
          element = elements[data[i].index - 1]
        } else {
          if (i === 0) {
            return elements
          }
          ;[element] = elements
        }
        if ([undefined, null, ''].includes(element)) {
          throw new ReferenceError(
            `'${data[i].id}' ${item.located} '${
              data[i + 2].id
            }' has no matching elements on page.`,
          )
        }
      }
    }
    /* eslint-enable no-await-in-loop */
    return []
  }
}

module.exports = ElementLocator
