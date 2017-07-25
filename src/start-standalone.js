const uppy = require('./pluggable')
const { app, sessionMiddleware } = require('./standalone')
const PORT = process.env.UPPYSERVER_PORT || 3020

uppy.socket(app.listen(PORT), sessionMiddleware)

console.log('Welcome to Uppy Server!')
console.log(`Listening on http://0.0.0.0:${PORT}`)
