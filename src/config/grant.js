module.exports = {
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
