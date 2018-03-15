const router = require('express').Router
const ms = require('ms')
const S3 = require('aws-sdk/clients/s3')

const defaultConfig = {
  acl: 'public-read',
  endpoint: 'https://{service}.{region}.amazonaws.com',
  conditions: [],
  getKey: (req, filename) => filename
}

module.exports = function s3 (config) {
  config = Object.assign({}, defaultConfig, config)

  if (typeof config.acl !== 'string') {
    throw new TypeError('s3: The `acl` option must be a string')
  }
  if (typeof config.getKey !== 'function') {
    throw new TypeError('s3: The `getKey` option must be a function')
  }

  const client = new S3({
    region: config.region,
    endpoint: config.endpoint,
    accessKeyId: config.key,
    secretAccessKey: config.secret
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
    .post('/multipart', (req, res, next) => {
      const key = config.getKey(req, req.query.filename)
      if (typeof key !== 'string') {
        return res.status(500).json({ error: 's3: filename returned from `getKey` must be a string' })
      }

      client.createMultipartUpload({
        Bucket: config.bucket,
        Key: key,
        ACL: config.acl,
        ContentType: req.query.type,
        Expires: new Date(Date.now() + ms('5 minutes') / 1000)
      }, (err, data) => {
        if (err) {
          next(err)
          return
        }
        res.json({
          key: data.Key,
          uploadId: data.UploadId
        })
      })
    })
    .get('/multipart/:uploadId/:partNumber', (req, res, next) => {
      const { uploadId, partNumber } = req.params
      const { key } = req.query

      if (typeof key !== 'string') {
        return res.status(400).json({ error: 's3: the object key must be passed as a query parameter. For example: "?key=abc.jpg"' })
      }
      if (!parseInt(partNumber, 10)) {
        return res.status(400).json({ error: 's3: the part number must be a number between 1 and 10000.' })
      }

      client.getSignedUrl('uploadPart', {
        Bucket: config.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: '',
        Expires: new Date(Date.now() + ms('5 minutes') / 1000)
      }, (err, url) => {
        if (err) {
          next(err)
          return
        }
        res.json({ url })
      })
    })
    .delete('/multipart/:uploadId', (req, res, next) => {
      const { uploadId } = req.params
      const { key } = req.query

      if (typeof key !== 'string') {
        return res.status(400).json({ error: 's3: the object key must be passed as a query parameter. For example: "?key=abc.jpg"' })
      }

      client.abortMultipartUpload({
        Bucket: config.bucket,
        Key: key,
        UploadId: uploadId
      }, (err, data) => {
        if (err) {
          next(err)
          return
        }
        res.json({})
      })
    })
    .post('/multipart/:uploadId/complete', (req, res, next) => {
      const { uploadId } = req.params
      const { key } = req.query
      const { parts } = req.body

      if (typeof key !== 'string') {
        return res.status(400).json({ error: 's3: the object key must be passed as a query parameter. For example: "?key=abc.jpg"' })
      }
      if (!Array.isArray(parts) || !parts.every(isValidPart)) {
        return res.status(400).json({ error: 's3: `parts` must be an array of {ETag, PartNumber} objects.' })
      }

      client.completeMultipartUpload({
        Bucket: config.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts
        }
      }, (err, data) => {
        if (err) {
          next(err)
          return
        }
        res.json({
          location: data.Location
        })
      })
    })
}

function isValidPart (part) {
  return part && typeof part === 'object' && typeof part.PartNumber === 'number' && typeof part.ETag === 'string'
}
