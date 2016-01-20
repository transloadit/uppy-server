module.exports = function () {
  return function *(next) {
    var dir = 'todo' // @todo Where is dir coming from?
    this.session.dropbox.client.readdir(dir, (error, entries, stat, statFiles) => {
      if (error) {
        console.error(error)
        // return showError(error)  // Something went wrong.
      }

      this.body = statFiles
    })
  }
}
