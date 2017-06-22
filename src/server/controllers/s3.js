const crypto = require('crypto')
const router = require('express').Router
const ms = require('ms')

function hmacSha (key, data) {
  return crypto.createHmac('sha256', key)
    .update(data)
    .digest()
}

function dateString (date) {
  return `${date.getFullYear()}${padded(date.getMonth() + 1)}${padded(date.getDate())}`

  function padded (n) {
    if (n < 10) return `0${n}`
    return n
  }
}

function isoString (date) {
  return `${dateString(date)}T000000Z`
}

function createPolicy (config, opts) {
  return {
    expiration: new Date(opts.date.getTime() + opts.expires).toISOString(),
    conditions: [
      { bucket: config.bucket },
      { acl: config.acl },
      { key: opts.filename },
      [ 'starts-with', '$Content-Type', opts.type ],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
      { 'x-amz-credential': opts.credential },
      { 'x-amz-date': isoString(opts.date) }
    ]
  }
}

function toBase64 (obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
}

function createSignature (config, policy, opts) {
  let signature = hmacSha(`AWS4${config.secret}`, dateString(opts.date))
  signature = hmacSha(signature, config.region)
  signature = hmacSha(signature, 's3')
  signature = hmacSha(signature, 'aws4_request')
  signature = hmacSha(signature, toBase64(policy))
  return signature.toString('hex')
}

function createParams (config, opts) {
  const credential = `${config.key}/${dateString(opts.date)}/${config.region}/s3/aws4_request`
  const policy = createPolicy(config, {
    date: opts.date,
    expires: opts.expires,
    filename: opts.filename,
    type: opts.type,
    credential
  })
  return {
    key: opts.filename,
    acl: config.acl,
    policy: toBase64(policy),
    'content-type': opts.type,
    'x-amz-algorithm': 'AWS4-HMAC-SHA256',
    'x-amz-credential': credential,
    'x-amz-signature': createSignature(config, policy, { date: opts.date }),
    'x-amz-date': isoString(opts.date)
  }
}

const defaultConfig = {
  acl: 'public-read',
  key: process.env.UPPYSERVER_AWS_KEY,
  secret: process.env.UPPYSERVER_AWS_SECRET,
  bucket: process.env.UPPYSERVER_AWS_BUCKET,
  region: process.env.UPPYSERVER_AWS_REGION
}

module.exports = function s3 (config) {
  config = Object.assign({}, defaultConfig, config)

  return router()
    .get('/credentials', (req, res) => {
      const date = new Date()
      date.setMilliseconds(0)
      const params = createParams(config, {
        date,
        expires: ms('5 minutes'),
        filename: req.query.filename,
        type: req.query.type
      })
      res.json({
        endpoint: `https://${config.bucket}.s3.${config.region}.amazonaws.com`,
        params
      })
    })
}
