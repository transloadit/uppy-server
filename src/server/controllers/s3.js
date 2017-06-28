const router = require('express').Router
const ms = require('ms')
const S3 = require('aws-sdk/clients/s3')

const defaultConfig = {
  acl: 'public-read',
  key: process.env.UPPYSERVER_AWS_KEY,
  secret: process.env.UPPYSERVER_AWS_SECRET,
  bucket: process.env.UPPYSERVER_AWS_BUCKET,
  region: process.env.UPPYSERVER_AWS_REGION,
  conditions: []
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
      client.createPresignedPost({
        Bucket: config.bucket,
        Expires: ms('5 minutes') / 1000,
        Fields: {
          key: req.query.filename,
          success_action_status: '201',
          'content-type': req.query.type
        },
        Conditions: config.conditions
      }, (err, data) => {
        if (err) {
          next(err)
          return
        }
        res.json({
          endpoint: data.url,
          params: data.fields
        })
      })
    })
}
