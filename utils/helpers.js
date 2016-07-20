var redis = require('redis')
var client = redis.createClient()

client.on('error', function (err) {
  console.log('Error ' + err)
})

var jwt = require('jsonwebtoken')
var secret = process.env.JWT_SECRET || 'ship shipping ship' // super secret

function verifyToken (token) {
  var decoded = false
  try {
    decoded = jwt.verify(token, secret)
  } catch (e) {
    decoded = false // still false
  }
  return decoded
}

function generateAndStoreToken (req, opts) {
  var GUID = generateGUID()
  console.log(GUID)
  var token = generateToken(req, GUID, opts)
  console.log('generated')
  var record = {
    'valid': true,
    'created': new Date().getTime()
  }

  // client.set(GUID, JSON.stringify(record), redis.print)

  return token
}

function generateToken (req, GUID, opts) {
  opts = opts || {}

  var expiresDefault = Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60
  var token = jwt.sign({
    auth: GUID,
    agent: req.headers['user-agent'],
    exp: opts.expires || expiresDefault
  }, secret)
  console.log(token)
  return token
}

function generateGUID () {
  return new Date().getTime() // we can do better with crypto
}

module.exports = {
  verify : verifyToken,
  generateAndStoreToken: generateAndStoreToken
}
