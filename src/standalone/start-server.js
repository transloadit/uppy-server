#!/usr/bin/env node
const uppy = require('../uppy')
// @ts-ignore
const { version } = require('../../package.json')
const { app, uppyOptions } = require('./index')
const PORT = process.env.UPPYSERVER_PORT || 3020

uppy.socket(app.listen(PORT), uppyOptions)

console.log(`Welcome to Uppy Server! v${version}`)
console.log(`Listening on http://0.0.0.0:${PORT}`)
