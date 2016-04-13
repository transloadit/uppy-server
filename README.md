# uppy-server

## Install

```bash
npm install uppy-server
```

## Configure

```bash
cp env.example.sh env.sh
$EDITOR env.sh
```

## Run

For local development:

```bash
npm run start
```

In production

```bash
# As a privileged user
source env.sh
# As an non-privileged user
npm run start:production
```

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
