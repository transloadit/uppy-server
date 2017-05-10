# uppy-server

<img src="http://uppy.io/images/logos/uppy-dog-full.svg" width="120" alt="Uppy logo — a superman puppy in a pink suit" align="right">

[![Build Status](https://travis-ci.org/transloadit/uppy-server.svg?branch=master)](https://travis-ci.org/transloadit/uppy-server)

Uppy-server is a server integration for [Uppy](https://github.com/transloadit/uppy) file uploader.

It handles the server-to-server communication between your server and file storage providers such as Google Drive, Dropbox,
Instagram, etc.

As of now uppy-server is integrated to work with:

- Google Drive
- Dropbox
- Local disk

## Install

```bash
npm install uppy-server
```

## Configure

Once uppy-server is insatlled you need to set the following environment variables

```bash
export UPPY_ENDPOINT="YOUR UPPY CLIENT URL"
export UPPYSERVER_DOMAIN="YOUR SERVER DOMAIN"
export UPPYSERVER_PROTOCOL="YOUR SERVER PROTOCOL"

# If used with Dropbox
export UPPYSERVER_DROPBOX_KEY="YOUR DROPBOX KEY"
export UPPYSERVER_DROPBOX_SECRET="YOUR DROPBOX SECRET"

# If used with Google Drive
export UPPYSERVER_GOOGLE_KEY="YOUR GOOGLE KEY"
export UPPYSERVER_GOOGLE_SECRET="YOUR GOOGLE SECRET"

```

If you want to store uploads on your server's local disk, please set the following env variable as well

```bash
export UPPYSERVER_DATADIR="PATH/TO/UPLOAD/DIRECTORY "
```

## Usage

Please ensure that the required env varaibles are set before runnning/using uppy-server. [See](#configure).

### Plug to already existing server

```javascript

var express = require('express')
var bodyParser = require('body-parser')
var uppy = require('uppy-server')

var app = express()
app.use(bodyParser.json())
...
// be sure to place this anywhere after app.use(bodyParser.json())
app.use(uppy.app())

```

To enable uppy socket for realtime feed to the client while upload is going on, you call the `socket` method like so.

```javascript
...
var server = app.listen(PORT)

uppy.socket(server)

```

### Run as standalone server

```bash
node .node_modules/uppy-server/lib/start-standalone.js
```

If you cloned the repo from gtihub and want to run it as a standalone server, you may also run the following command from within its
directory

```bash
npm run start:production
```

## Development

1. To setup uppy-server for local development, please clone the repo and install like so:

```bash
git clone https://github.com/transloadit/uppy-server && cd upppy-server && npm install
```


2. Configure your enviorment variables by copying the `env.example.sh` file to `env.sh` and edit it to its correct values.

```bash
cp env.example.sh env.sh
$EDITOR env.sh
```


3. To start the server simply run:

```bash
npm run start
```

This would get the uppy-server running on `http://localhost:3020`.

It also expects the [uppy client](https://github.com/transloadit/uppy) to be running on `http://localhost:3452`

## Running example

An example server is running at http://server.uppy.io, which is deployed via
[Frey](https://github.com/kvz/frey), using the following [Freyfile](infra/Freyfile.toml).

All the secrets are stored in `env.infra.sh`, so using `env.infra.example.sh`, you could
use the same Freyfile but target a different cloud vendor with different secrets, and run your own
uppy-server.

## Logging

Requires Frey, if you haven't set it up yet type

```bash
npm run install:frey
```

afterwards, production logs are available through:

```bash
npm run logtail
```

This requires at least the `FREY_ENCRYPTION_SECRET` key present in your `./env.sh`.
