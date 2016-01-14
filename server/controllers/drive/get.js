var fs = require('fs')
var google = require('googleapis')
var 

module.exports = function () {
  return function *(next) {
    var service = google.drive('v2')

    service.files.get({
      fileId: this.query.fileId,
      alt: 'media'
    }, function(error, file) {
      if (err) {
        this.body = error
        return
      }
      fs.writeFile('files/' + this.query.fileId, file, function(err, res) {
        if (err) {
          this.body = err
        }

        this.status = 200
      })
    })
  }
}
