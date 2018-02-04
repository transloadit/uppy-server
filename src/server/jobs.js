const schedule = require('node-schedule')
const { FILE_NAME_PREFIX } = require('./Uploader')
const fs = require('fs')
const path = require('path')

/**
 * Runs a function every 24 hours, to clean up stale, upload related files.
 * @param {string} dirPath path to the directory which you want to clean
 */
exports.startCleanUpJob = (dirPath) => {
  console.log('uppy-server: Starting clean up job')
  // run once a day
  schedule.scheduleJob('0 23 * * *', () => cleanUpFinishedUploads(dirPath))
}

const cleanUpFinishedUploads = (dirPath) => {
  console.log(`uppy-server: Running clean up job for path: ${dirPath}`)
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error(err)
      return
    }

    console.log(`uppy-server: found ${files.length} files`)
    files.forEach((file, fileIndex) => {
      // if it does not contain FILE_NAME_PREFIX then it probably wasn't created by uppy-server.
      // this is to avoid deleting unintended files, e.g if a wrong path was accidentally given
      // by a developer.
      if (!file.startsWith(FILE_NAME_PREFIX)) {
        console.log(`uppy-server: skipping file ${file}`)
        return
      }
      const fullPath = path.join(dirPath, file)

      fs.stat(fullPath, (err, stats) => {
        const twelveHoursAgo = 12 * 60 * 60 * 1000
        if (err) {
          // we still delete the file if we can't get the stats
          // but we also log the error
          console.error(err)
        // @ts-ignore
        } else if (((new Date()) - stats.mtime) < twelveHoursAgo) {
          console.log(`uppy-server: skipping file ${file}`)
          return
        }

        console.log(`uppy-server: deleting file ${file}`)
        fs.unlink(fullPath, (err) => {
          if (err) console.error(err)
        })
      })
    })
  })
}
