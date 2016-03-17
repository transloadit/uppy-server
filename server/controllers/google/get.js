var fs = require('fs')

module.exports = function *(next) {
  var Purest = require('purest')
  var google = new Purest({provider: 'google', api: 'drive'})
  yield function listFiles (cb) {
    google.get(`files/${this.query.fileId}`, {
      auth: {
        bearer: this.session.google.token
      },
      qs: {
        alt: 'media'
      }
    }, function (err, res, body) {
      if (err) {
        console.log('error ', err)
        this.body = 'Error: ' + err; return cb()
      }
      fs.writeFile('./output', body, function (err, res) {
        if (err) {
          console.log(err)
          this.body = err
        }

        this.status = 200
        cb()
      })
    })
  }
}
