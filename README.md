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
npm run start:dev
```

In production

```bash
# As a privileged user
source env.sh
# As an non-privileged user
npm run start
```

An example server is running at http://server.uppy.io, which is deployed via 
[Frey](https://github.com/kvz/frey), using the following [Freyfile](infra/Freyfile.toml).

All the secrets are stored in `env.infra.sh`, so using `env.infra.example.sh`, you could
use the same Freyfile but target a different cloud vendor with different secrets, and run your own
uppy-server.
