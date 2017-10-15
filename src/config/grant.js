module.exports = () => {
  return {
    google: {
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ],
      callback: '/drive/callback'
    },
    dropbox: {
      authorize_url: 'https://www.dropbox.com/oauth2/authorize',
      access_url: 'https://api.dropbox.com/oauth2/token',
      callback: '/dropbox/callback'
    },
    instagram: {
      callback: '/instagram/callback'
    }
  }
}
