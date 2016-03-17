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

export DROPBOX_KEY="***"
export DROPBOX_SECRET="***"
export GOOGLE_KEY="***"
export GOOGLE_SECRE="***"
export INSTAGRAM_KEY="***"
export INSTAGRAM_SECRET="***"

# source env.sh
# travis encrypt --add env.global "FREY_ENCRYPTION_SECRET=${FREY_ENCRYPTION_SECRET}"
# travis encrypt --add env.global "DROPBOX_KEY=${DROPBOX_KEY}"
# travis encrypt --add env.global "DROPBOX_SECRET=${DROPBOX_SECRET}"
# travis encrypt --add env.global "GOOGLE_KEY=${GOOGLE_KEY}"
# travis encrypt --add env.global "GOOGLE_SECRE=${GOOGLE_SECRE}"
# travis encrypt --add env.global "INSTAGRAM_KEY=${INSTAGRAM_KEY}"
# travis encrypt --add env.global "INSTAGRAM_SECRET=${INSTAGRAM_SECRET}"
