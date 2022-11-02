const { PNG } = require('pngjs')
const fs = require('fs')
const Jimp = require('jimp')
const BlinkDiff = require('blink-diff')

class Screenshot {
  constructor(image) {
    this.image = image
  }

  store(location) {
    fs.writeFileSync(location, PNG.sync.write(this.image))
  }

  static fromBase64(dataUrl) {
    const image = PNG.sync.read(Buffer.from(dataUrl, 'base64'))
    const screenshot = new Screenshot(image)
    return screenshot
  }

  static async fromBase64Compress(dataUrl) {
    const jimp = await Jimp.read(Buffer.from(dataUrl, 'base64'))
    await jimp.resize(300, Jimp.AUTO)
    await jimp.quality(60)
    const img = await jimp.getBufferAsync(Jimp.MIME_PNG)
    return new Screenshot(PNG.sync.read(img))
  }

  static async resize(dataUrl, size) {
    const jimp = await Jimp.read(Buffer.from(dataUrl, 'base64'))
    await jimp.resize(size.width, size.height)
    return jimp.getBufferAsync(Jimp.MIME_PNG)
  }

  static async crop(dataUrl, rect) {
    const jimp = await Jimp.read(Buffer.from(dataUrl, 'base64'))
    await jimp.crop(rect.x, rect.y, rect.width, rect.height)
    return jimp.getBufferAsync(Jimp.MIME_PNG)
  }

  static same(image1, image2) {
    if (!(image1 && image2)) {
      return false
    }

    const bd = new BlinkDiff({
      imageA: Buffer.from(image1, 'base64'),
      imageB: Buffer.from(image2, 'base64'),
      gamma: 0.001,
      perceptual: true,
    })
    const difference = bd.runSync()
    if (difference.code === BlinkDiff.RESULT_IDENTICAL) {
      return true
    }
    return false
  }
}

module.exports = Screenshot
