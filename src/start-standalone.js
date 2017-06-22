const uppy = require('./pluggable')
const app = require('./standalone')
const PORT = process.env.PORT || 3020

uppy.socket(app.listen(PORT))

console.log('Welcome to Uppy Server!')
console.log(`Listening on http://0.0.0.0:${PORT}`)
