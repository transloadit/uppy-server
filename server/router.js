var routes = require('./routes')
var router = require('koa-router')()
// var auth = require('../../config/auth-config')

module.exports = function() {
  
  // router.get('/dropbox/callback', function *(next) {
  //   authCallbackHandler.bind(this)('dropbox');
  // })

  // router.get('/google/callback', function *(next) {
  //   authCallbackHandler('google').bind(this)
  // })

  // router.get('/instagram/callback', function *(next) {
  //   authCallbackHandler('instagram').bind(this)
  // })

  // router.get('/dropbox/connect', function *(next) {
  //   this.redirect('http://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=' + auth.dropbox.clientKey + '&redirect_uri=http://localhost:3000/dropbox/callback')
  // })

  // router.get('/dropbox/connect', function *(next) {
  //   this.redirect('http://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=' + auth.dropbox.clientKey + '&redirect_uri=http://localhost:3000/dropbox/callback')
  // })

  // router.get('/google/connect', function *(next) {
  //   this.redirect('http://www.google.com/1/oauth2/authorize?response_type=code&client_id=' + auth.google.clientKey + '&redirect_uri=http://localhost:3000/google/callback')
  // })

  // router.get('/instagram/connect', function *(next) {
  //   this.redirect('http://www.instagram.com/1/oauth2/authorize?response_type=code&client_id=' + auth.instagram.clientKey + '&redirect_uri=http://localhost:3000/instagram/callback')
  // })

  // router.get('/', function *(next) {
  //   console.log('index')
  // })

  routes.forEach(function(route) {
    router.get(route.route, route.handler)
  })

  return router;
}