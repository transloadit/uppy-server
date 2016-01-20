module.exports = function (client, dir) {
  return function *(next) {
    client.readdir(dir, (error, entries, stat, statFiles) => {
      if (error) {
        console.error(error)
        // return showError(error)  // Something went wrong.
      }

      this.body = statFiles
    })
  }
}
