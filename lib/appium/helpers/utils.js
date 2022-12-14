const { compressBase64 } = require('./imagecompress')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fdate(dt) {
  let date = dt
  if (date === undefined) {
    date = new Date()
  }
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
}

function ftime(dt) {
  let date = dt
  if (date === undefined) {
    date = new Date()
  }
  return date.toISOString().match(/(\d{2}:){2}\d{2}/)[0]
}

module.exports = {
  sleep,
  fdate,
  ftime,
  compressBase64,
}
