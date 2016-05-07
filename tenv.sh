# Rename this file to env.sh, it will be kept out of Git.
# So suitable for adding secret keys and such

# Set magic variables for current FILE & DIR
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
__base="$(basename ${__file} .sh)"
__rootdir="${__dir}"

export NODE_ENV="${NODE_ENV:-development}"
export DEPLOY_ENV="${DEPLOY_ENV:-production}"
export DEBUG="frey:*"

export FREY_DOMAIN="server.uppy.io"
export FREY_ENCRYPTION_SECRET="aldghjadsgjo330915u409gujaslkdngaskdjngfjhabvjhvdbkjjwr93u5ohnkljn"
export UPPY_ENDPOINT="http://uppy.io"
export UPPYSERVER_DOMAIN="server.uppy.io"
export UPPYSERVER_DROPBOX_KEY="982dibzeipfg5fj"
export UPPYSERVER_DROPBOX_SECRET="tvgqmt4emr9ukuj"
export UPPYSERVER_GOOGLE_KEY="146595268827-k061evcr8hqubradso6au0kl69ha3pt1.apps.googleusercontent.com"
export UPPYSERVER_GOOGLE_SECRET="tuvU351gTFFV-eMIWkhRbuz6"
export UPPYSERVER_INSTAGRAM_KEY="0fa43d43910e417c89027ad3d004cc63"
export UPPYSERVER_INSTAGRAM_SECRET="75bcfe73be464e9f995246141899890e"

# source env.sh
# travis encrypt --add env.global "FREY_DOMAIN=${FREY_DOMAIN}"
# travis encrypt --add env.global "FREY_ENCRYPTION_SECRET=${FREY_ENCRYPTION_SECRET}"
# travis encrypt --add env.global "UPPY_ENDPOINT=${UPPY_ENDPOINT}"
# travis encrypt --add env.global "UPPYSERVER_DOMAIN=${UPPYSERVER_DOMAIN}"
# travis encrypt --add env.global "UPPYSERVER_DROPBOX_KEY=${UPPYSERVER_DROPBOX_KEY}"
# travis encrypt --add env.global "UPPYSERVER_DROPBOX_SECRET=${UPPYSERVER_DROPBOX_SECRET}"
# travis encrypt --add env.global "UPPYSERVER_GOOGLE_KEY=${UPPYSERVER_GOOGLE_KEY}"
# travis encrypt --add env.global "UPPYSERVER_GOOGLE_SECRET=${UPPYSERVER_GOOGLE_SECRET}"
# travis encrypt --add env.global "UPPYSERVER_INSTAGRAM_KEY=${UPPYSERVER_INSTAGRAM_KEY}"
# travis encrypt --add env.global "UPPYSERVER_INSTAGRAM_SECRET=${UPPYSERVER_INSTAGRAM_SECRET}"
