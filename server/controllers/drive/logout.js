module.exports = function () {
  return function * (next) {
    this.session = null
    this.body = 'Successfully logged out.'
    console.log('[logged out]')
  }
}
