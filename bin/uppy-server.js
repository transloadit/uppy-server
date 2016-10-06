#!/usr/bin/env node

var program = require('commander')

var version = require('../package.json').version

program
  .version(version)
  .command('start', 'start Uppy Server')
  .command('init', 'generate config skeleton')
  .parse(process.argv)
