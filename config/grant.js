module.exports = {
  server: {
    protocol: 'http',
    host: 'localhost:8080'
  },
  dropbox: {
    key     : process.env.DROPBOX_KEY,
    secret  : process.env.DROPBOX_SECRET,
    scope   : [],
    callback: '/dropbox/callback'
  },
  google: {
    key   : process.env.GOOGLE_KEY,
    secret: process.env.GOOGLE_SECRET,
    scope : [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ],
    callback: '/google/callback'
  },
  instagram: {
    key     : process.env.INSTAGRAM_KEY,
    secret  : process.env.INSTAGRAM_SECRET,
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
