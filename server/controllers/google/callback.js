module.exports = function * (next) {
  this.session.google.token = this.query.access_token
  this.redirect(this.session.grant.state)
}
