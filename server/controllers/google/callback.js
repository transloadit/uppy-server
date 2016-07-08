/**
 * oAuth callback.  Adds access token to session store
 * and redirects to original page.
 * Eventually refactor to have `state` be entire Uppy state object.
 */

module.exports = function * (next) {
  this.session.google.token = this.query.access_token
  this.websocket.emit('google.callback', this.query.access_token)
  this.websocket.send('google.auth.pass')
  this.websocket.send('google.auth.complete')
  this.body = {
    ok: true
  }
  yield next
}
