var fs = require('fs')

module.exports = function * (next) {
  console.log('getFilegoogle')
  var self = this
  var Purest = require('purest')
  var google = new Purest({
    provider: 'google',
    api: 'drive'
  })

  yield function listFiles (cb) {
    google.get(`files/${this.query.fileId}`, {
      auth: {
        bearer: this.session.google.token
      }
    }, function (err, res, file) {
      if (err) {
        console.log(err)
      }
      console.log(file)
      if (file.mimeType.indexOf('application/vnd.google-apps.') !== -1) {
        // google.get(`files/${self.query.fileId}/export`, {
        //   auth: {
        //     bearer: self.session.google.token
        //   },
        //   qs: {
        //     mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        //   }
        // }, function (err, res, body) {
        //   if (err) {
        //     console.log(err)
        //     self.body = 'Error: ' + err
        //     return cb()
        //   }
        //   fs.writeFile('./output/doc.docx', body, function (err, res) {
        //     if (err) {
        //       console.log(err)
        //       self.body = err
        //     }
        //     console.log('we did it')
        //     self.body = 'ok'
        //     self.status = 200
        //     cb()
        //   })
        // })
        self.status = 401
        self.body = 'Uppy Server does not currently support fetching Google documents'
        cb()
      } else {
        google.get(`files/${self.query.fileId}`, {
          auth: {
            bearer: self.session.google.token
          },
          qs: {
            alt: 'media'
          }
        }, function (err, res, body) {
          if (err) {
            console.log('fetcher')
            console.log(err)
            self.body = 'Error: ' + err
            return cb()
          }

          fs.writeFile(`./output/${file.title}`, body, function (err, res) {
            if (err) {
              console.log(err)
              self.body = err
            }
            console.log('we did it')
            self.body = 'ok'
            self.status = 200
            cb()
          })
        })
      }
    })
    // google.get(`files/${this.query.fileId}`, {
    //   auth: {
    //     bearer: this.session.google.token
    //   },
    //   qs: {
    //     alt: 'media'
    //   }
    // }, function (err, res, body) {
    //   console.log(err)
    //   if (err) {
    //     console.log(err)
    //     self.body = 'Error: ' + err
    //     return cb()
    //   }
    //   fs.writeFile('./output', body, function (err, res) {
    //     if (err) {
    //       console.log(err)
    //       self.body = err
    //     }
    //     console.log('we did it')
    //     self.body = 'ok'
    //     self.status = 200
    //     cb()
    //   })
    // })
  }
}
