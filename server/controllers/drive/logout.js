module.exports = function () {
  return function * (next) {
    this.session = null
    console.log('[logged out]')
  }
}
