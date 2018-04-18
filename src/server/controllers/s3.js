const router = require('express').Router
const ms = require('ms')
const S3 = require('aws-sdk/clients/s3')
const AWS = require('aws-sdk')

const defaultConfig = {
  acl: 'public-read',
  endpoint: 'https://{service}.{region}.amazonaws.com',
  conditions: [],
  getKey: (req, filename) => filename
}

module.exports = function s3 (config) {
  config = Object.assign({}, defaultConfig, config)

  // Use credentials to allow assumed roles to pass STS sessions in.
  // If the user doesn't specify key and secret, the default credentials (process-env)
  // will be used by S3 in calls below.
  let credentials
  if ('key' in config && 'secret' in config) {
    credentials = new AWS.Credentials(config.key, config.secret, config.sessionToken)
  }

  if (typeof config.acl !== 'string') {
    throw new TypeError('s3: The `acl` option must be a string')
  }
  if (typeof config.getKey !== 'function') {
    throw new TypeError('s3: The `getKey` option must be a function')
  }

  const client = new S3({
    region: config.region,
    endpoint: config.endpoint,
    credentials
  })

  return router()
    .get('/params', (req, res, next) => {
      const key = config.getKey(req, req.query.filename)
      if (typeof key !== 'string') {
        return res.status(500).json({ error: 's3: filename returned from `getKey` must be a string' })
      }

      const fields = {
        acl: config.acl,
        key: key,
        success_action_status: '201',
        'content-type': req.query.type
      }

      client.createPresignedPost({
        Bucket: config.bucket,
        Expires: ms('5 minutes') / 1000,
        Fields: fields,
        Conditions: config.conditions
      }, (err, data) => {
        if (err) {
          next(err)
          return
        }
        res.json({
          method: 'post',
          url: data.url,
          fields: data.fields
        })
      })
    })
}
