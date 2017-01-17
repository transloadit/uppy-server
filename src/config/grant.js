module.exports = {
  server: { host: process.env.UPPYSERVER_DOMAIN, protocol: 'http' },
  google: {
    key: process.env.UPPYSERVER_GOOGLE_KEY,
    secret: process.env.UPPYSERVER_GOOGLE_SECRET,
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ],
    callback: '/drive/callback'
  },
  dropbox: {
    key: process.env.UPPYSERVER_DROPBOX_KEY,
    secret: process.env.UPPYSERVER_DROPBOX_SECRET,
    callback: '/dropbox/callback'
  }
}
