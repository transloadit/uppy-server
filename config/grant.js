module.exports = {
  server: {
    host: 'localhost:8080',
    protocol: 'http'
  },
  dropbox: {
    key     : process.env.UPPYSERVER_DROPBOX_KEY,
    secret  : process.env.UPPYSERVER_DROPBOX_SECRET,
    scope   : [],
    callback: '/dropbox/callback'
  },
  google: {
    key   : process.env.UPPYSERVER_GOOGLE_KEY,
    secret: process.env.UPPYSERVER_GOOGLE_SECRETT,
    scope : [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ],
    callback: '/google/callback'
  },
  instagram: {
    key     : process.env.UPPYSERVER_INSTAGRAM_KEY,
    secret  : process.env.UPPYSERVER_INSTAGRAM_SECRET,
    scope   : [],
    callback: '/instagram/callback'
  },
  onedrive: {

  },
  box: {

  },
  facebook: {

  },
  picasa: {

  },
  amazon: {

  },
  flickr: {

  },
  github: {

  },
  gmail: {

  },
  imgur: {

  }
}
