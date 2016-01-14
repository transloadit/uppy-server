var google = require('googleapis')

module.exports = function () {
  return function *(next) {
    var service = google.drive('v2')
    var query = "'" + (this.query.dir || "root") + "' in parents"
    service.files.list({
      auth: this.session.drive.auth,
      nextToken: this.query.nextToken || '',
      q: query
    }, function(err, res) {
      if (err) {
        return
      }
      this.body = res.items
    })
  }
}
