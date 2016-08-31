/**
 * oAuth callback.  Adds access token to session store
 * and redirects to original page.
 * Eventually refactor to have `state` be entire Uppy state object.
 */
var atob = require('atob')

module.exports = function * (next) {
  this.session.google.token = this.query.access_token
  console.log(this.session.google.token)
  var state = JSON.parse(atob(this.session.grant.state))
  this.redirect(`${state.redirect}?state=${this.session.grant.state}`)
}
