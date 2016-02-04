# Rename this file to env.sh, it will be kept out of Git.
# So suitable for adding secret keys and such

# Set magic variables for current FILE & DIR
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
__base="$(basename ${__file} .sh)"
__rootdir="${__dir}"

export DEPLOY_ENV="${DEPLOY_ENV:-production}"

# Secret keys here:
# export FREY_AWS_ACCESS_KEY="xyz"
# export FREY_AWS_SECRET_KEY="xyz123"
# export FREY_AWS_ZONE_ID="Z123"
# export FREY_DOMAIN="uppy-server.transloadit.com"
# export FREY_SSH_KEY_FILE="/Users/kvz/.ssh/frey-uppy-server.pem"
# export FREY_SSH_USER="ubuntu"
# export FREY_SSH_KEY_NAME="uppy-server"
