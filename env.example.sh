# Rename this file to env.sh, it will be kept out of Git.
# So suitable for adding secret keys and such
export NODE_ENV="${NODE_ENV:-development}"
export DEPLOY_ENV="${DEPLOY_ENV:-production}"
export DEBUG="frey:*"

export FREY_DOMAIN="server.uppy.io"
# export FREY_ENCRYPTION_SECRET="***"
export PORT=3020
export UPPY_ENDPOINT="uppy.io"
export UPPYSERVER_DATADIR="/mnt/uppy-server-data"
export UPPYSERVER_DOMAIN="server.uppy.io"
export UPPYSERVER_PROTOCOL="https"
export UPPYSERVER_DROPBOX_KEY="***"
export UPPYSERVER_DROPBOX_SECRET="***"
export UPPYSERVER_GOOGLE_KEY="***"
export UPPYSERVER_GOOGLE_SECRET="***"
export UPPYSERVER_INSTAGRAM_KEY="***"
export UPPYSERVER_INSTAGRAM_SECRET="***"

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
