const { app } = require('../src/standalone')

const express = require('express')
const session = require('express-session')
var authServer = express()

authServer.use(session({ secret: 'grant', resave: true, saveUninitialized: true }))
authServer.all('/drive/callback', (req, res, next) => {
  req.session.grant = { state: new Buffer(JSON.stringify({ redirect: 'http://redirect.foo' })).toString('base64') }
  next()
})

authServer.use(app)

module.exports = { authServer, noAuthServer: app }
