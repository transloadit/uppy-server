module.exports = function * (next) {
  this.body = {
    isAuthenticated: this.session.google.token !== undefined
  }
}
