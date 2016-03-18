module.exports = function * (next) {
  this.session.google.token = this.query.access_token
  this.body = this.session.google
}
