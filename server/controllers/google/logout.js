module.exports = function * (next) {
  this.session.google.token = null
  this.session.grant.state = null
  this.session.grant.dynamic = null
  this.body = {
    ok: true
  }
}
