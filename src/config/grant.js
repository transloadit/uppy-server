module.exports = {
  server: {
    host: process.env.UPPYSERVER_DOMAIN,
    protocol: process.env.UPPYSERVER_PROTOCOL
  },
  google: {
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ],
    callback: '/drive/callback'
  },
  dropbox: {
    callback: '/dropbox/callback'
  },
  instagram: {
    callback: '/instagram/callback'
  }
}
