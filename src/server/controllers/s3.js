const router = require('express').Router
const ms = require('ms')
const S3 = require('aws-sdk/clients/s3')

const defaultConfig = {
  acl: 'public-read',
  conditions: [],
  getKey: (req, filename) => filename
}

module.exports = function s3 (config) {
  config = Object.assign({}, defaultConfig, config)
  const client = new S3({
    region: config.region,
    accessKeyId: config.key,
    secretAccessKey: config.secret
  })

  return router()
    .get('/params', (req, res, next) => {
      const key = config.getKey(req, req.query.filename)
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
