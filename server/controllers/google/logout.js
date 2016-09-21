/**
 * Logout of Google Drive by clearing access token
 * from session store.
 */
module.exports = function * (next) {
  this.session.google.token = null

  if (this.session.grant) {
    this.session.grant.state = null
    this.session.grant.dynamic = null
  }

  this.body = {
    ok: true
  }
}
