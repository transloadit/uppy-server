# Rename this file to env.sh, it will be kept out of Git.
# So suitable for adding secret keys and such
export NODE_ENV="${NODE_ENV:-development}"
export DEPLOY_ENV="${DEPLOY_ENV:-production}"
export DEBUG="frey:*"

export FREY_DOMAIN="server.uppy.io"
# export FREY_ENCRYPTION_SECRET="***"
export UPPYSERVER_PORT=3020
export UPPY_ENDPOINT="uppy.io"
# for whitelisting multiple clients
export UPPY_ENDPOINTS="uppy.io,localhost:3452"
# inform uppy client about the server host name
export UPPYSERVER_REDIS_URL="redis://localhost:6379"
export UPPYSERVER_DATADIR="/mnt/uppy-server-data"
export UPPYSERVER_DOMAIN="server.uppy.io"
export UPPYSERVER_SELF_ENDPOINT="${UPPYSERVER_DOMAIN}"
# valid server hostnames for oauth handling
export UPPYSERVER_DOMAINS="server.uppy.io,localhost:3020"
export UPPYSERVER_PATH=""
export UPPYSERVER_SECRET="***"
export UPPYSERVER_PROTOCOL="https"
# single oauth redirect handler for multiple server instances
export UPPYSERVER_OAUTH_DOMAIN=""
export UPPYSERVER_DROPBOX_KEY="***"
export UPPYSERVER_DROPBOX_SECRET="***"
export UPPYSERVER_GOOGLE_KEY="***"
export UPPYSERVER_GOOGLE_SECRET="***"
export UPPYSERVER_INSTAGRAM_KEY="***"
export UPPYSERVER_INSTAGRAM_SECRET="***"
export UPPYSERVER_AWS_KEY="***"
export UPPYSERVER_AWS_SECRET="***"
export UPPYSERVER_AWS_BUCKET="***"
export UPPYSERVER_AWS_REGION="***"

# source env.sh
# travis encrypt --add env.global "FREY_DOMAIN=${FREY_DOMAIN}"
# travis encrypt --add env.global "FREY_ENCRYPTION_SECRET=${FREY_ENCRYPTION_SECRET}"
# travis encrypt --add env.global "UPPY_ENDPOINT=${UPPY_ENDPOINT}"
# travis encrypt --add env.global "UPPYSERVER_DATADIR=${UPPYSERVER_DATADIR}"
# travis encrypt --add env.global "UPPYSERVER_DOMAIN=${UPPYSERVER_DOMAIN}"
# travis encrypt --add env.global "UPPYSERVER_PROTOCOL=${UPPYSERVER_PROTOCOL}"
# travis encrypt --add env.global "UPPYSERVER_DROPBOX_KEY=${UPPYSERVER_DROPBOX_KEY}"
# travis encrypt --add env.global "UPPYSERVER_DROPBOX_SECRET=${UPPYSERVER_DROPBOX_SECRET}"
# travis encrypt --add env.global "UPPYSERVER_GOOGLE_KEY=${UPPYSERVER_GOOGLE_KEY}"
# travis encrypt --add env.global "UPPYSERVER_GOOGLE_SECRET=${UPPYSERVER_GOOGLE_SECRET}"
# travis encrypt --add env.global "UPPYSERVER_INSTAGRAM_KEY=${UPPYSERVER_INSTAGRAM_KEY}"
# travis encrypt --add env.global "UPPYSERVER_INSTAGRAM_SECRET=${UPPYSERVER_INSTAGRAM_SECRET}"
