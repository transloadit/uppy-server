module.exports = function *(next) {
  console.log('woot')
  this.session.google.token = this.query.access_token
  this.body = this.session.google
}