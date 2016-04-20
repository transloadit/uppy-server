/**
 * List files in a Google Drive folder
 */
module.exports = function * (next) {
  var self = this
  var Purest = require('purest')
  var google = new Purest({provider: 'google', api: 'drive'})

  yield function listFiles (cb) {
    // Query filters based on a file's parents
    var query = `'${self.query.dir}' in parents and trashed=false`

    google.get('files', {
      auth: {
        bearer: this.session.google.token
      },
      qs: {
        q: query,
        fields: 'items(createdDate,id,labels,mimeType,modifiedByMeDate,ownedByMe,parents,title,userPermission)'
      }
    }, function (err, res, body) {
      if (err) {
        this.body = 'Error: ' + err
        return cb()
      }

      self.body = body

      cb()
    })
  }
}

// var google = require('googleapis')
// var GoogleAuth = require('google-auth-library')
// var config = require('../../../config/auth')

// var clientKey = config.drive.key
// var clientSecret = config.drive.secret
// var redirectUrl = config.server.url + config.drive.callback

// module.exports = function () {
//   return function *(next) {
//     console.log('getFolder')
//     var service = google.drive('v2')
//     var auth = new GoogleAuth()

//     var oauth2Client = new auth.OAuth2(clientKey, clientSecret, redirectUrl)
//     oauth2Client.credentials = this.session.drive.token
//     var query = "'" + (this.query.dir || 'root') + "' in parents"

//     yield function listFiles (cb) {
//       var files = []

//       var getList = (nextPageToken, callCount) => {
//         service.files.list({
//           auth      : oauth2Client,
//           query     : query,
//           fields    : 'items(id,kind,mimeType,title),kind,nextPageToken',
//           maxResults: 1000,
//           pageToken : nextPageToken
//         }, (err, res) => {
//           if (err) {
//             console.log(err)
//             this.body = err
//             return cb()
//           }
//           console.log(res)
//           files.concat(res.items)

//           if (res.nextPageToken) {
//             getList(res.nextPageToken, callCount + 1)
//           } else {
//             this.body = {
//               items: res.items
//             }
//             cb()
//           }
//         })
//       }
//       getList('', 1)
//     }
//   }
// }
