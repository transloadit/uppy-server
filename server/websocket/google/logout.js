/**
 * Logout of Google Drive by clearing access token
 * from session store.
 */
module.exports = function () {
  this.session.google.token = null
  this.session.grant.state = null
  this.session.grant.dynamic = null
  this.websocket.send('google.logout.ok')
}
