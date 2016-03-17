# Rename this file to env.sh, it will be kept out of Git.
# So suitable for adding secret keys and such

# Set magic variables for current FILE & DIR
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
__base="$(basename ${__file} .sh)"
__rootdir="${__dir}"

export DEPLOY_ENV="${DEPLOY_ENV:-production}"
export DEBUG="frey:*"

# Secret keys here:
# export FREY_AWS_ACCESS_KEY="xyz"
# export FREY_AWS_SECRET_KEY="xyz123"
# export FREY_AWS_ZONE_ID="Z123"
# ^-- Travis won't need these. We'll only use Travis for deploys

# export FREY_DOMAIN="server.uppy.io"

# export FREY_ENCRYPTION_SECRET="abcdefghijklmnopqrstuvwXYZ!"

export UPPYSERVER_DROPBOX_KEY="***"
export UPPYSERVER_DROPBOX_SECRET="***"
export UPPYSERVER_GOOGLE_KEY="***"
export UPPYSERVER_GOOGLE_SECRET="***"
export UPPYSERVER_INSTAGRAM_KEY="***"
export UPPYSERVER_INSTAGRAM_SECRET="***"

# source env.sh
# travis encrypt --add env.global "FREY_ENCRYPTION_SECRET=${FREY_ENCRYPTION_SECRET}"
# travis encrypt --add env.global "UPPYSERVER_DROPBOX_KEY=${UPPYSERVER_DROPBOX_KEY}"
# travis encrypt --add env.global "UPPYSERVER_DROPBOX_SECRET=${UPPYSERVER_DROPBOX_SECRET}"
# travis encrypt --add env.global "UPPYSERVER_GOOGLE_KEY=${UPPYSERVER_GOOGLE_KEY}"
# travis encrypt --add env.global "UPPYSERVER_GOOGLE_SECRET=${UPPYSERVER_GOOGLE_SECRET}"
# travis encrypt --add env.global "UPPYSERVER_INSTAGRAM_KEY=${UPPYSERVER_INSTAGRAM_KEY}"
# travis encrypt --add env.global "UPPYSERVER_INSTAGRAM_SECRET=${UPPYSERVER_INSTAGRAM_SECRET}"
