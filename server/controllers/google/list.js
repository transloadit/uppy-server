// module.exports = function *(next) {
//   var Purest = require('purest')
//   var google = new Purest({provider:'google'})
//   yield function listFiles(cb) {
//     console.log(this.session.google.token)
//     google.get('list', {
//       api: 'drive',
//       auth: this.session.google.token
//     }, function (err, res, body) {
//       if (err) { console.log('error ', err); this.body = 'Error: ' + err; return cb(); }
//       // console.log(res)
//       console.log(body)
//       this.body = body
//       cb()
//     })
//   }
// }

var google = require('googleapis')
var GoogleAuth = require('google-auth-library')
var config = require('../../../config/grant')

var clientKey = config.google.key
var clientSecret = config.google.secret
var redirectUrl = 'http://localhost:3020/connect/google/callback'

module.exports = function *(next) {
  var service = google.drive('v2')
  var auth = new GoogleAuth()

  var oauth2Client = new auth.OAuth2(clientKey, clientSecret, redirectUrl)
  console.log(this.session.google.token)
  oauth2Client.credentials = this.session.google.token
  var query = "'" + (this.query.dir || 'root') + "' in parents"

  yield function listFiles (cb) {
    var files = []

    var getList = (nextPageToken, callCount) => {
      service.files.list({
        auth      : oauth2Client,
        query     : query,
        fields    : 'items(id,kind,mimeType,title),kind,nextPageToken',
        maxResults: 1000,
        pageToken : nextPageToken
      }, (err, res) => {
        if (err) {
          console.log(err)
          this.body = err
          return cb()
        }
        console.log(res)
        files.concat(res.items)

        if (res.nextPageToken) {
          getList(res.nextPageToken, callCount + 1)
        } else {
          this.body = {
            items: res.items
          }
          cb()
        }
      })
    }
    getList('', 1)
  }
}
