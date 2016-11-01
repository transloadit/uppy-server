#!/usr/bin/env bash
set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

# http://stackoverflow.com/questions/39829473/cryptography-assertionerror-sorry-but-this-version-only-supports-100-named-gro
# There is a bug with PyCParser - See https://github.com/pyca/cryptography/issues/3187

# yes w |sudo -HE \
#     env PATH=${PATH} LD_LIBRARY_PATH=${LD_LIBRARY_PATH:-} PYTHONPATH=${PYTHONPATH:-} \
#     pip install \
#       --ignore-installed \
#       --force-reinstall \
#       --disable-pip-version-check \
#       requests==2.5.3 \
#       pycparser==2.16

curl -L https://raw.githubusercontent.com/yyuu/pyenv-installer/19b1ba86c9ff8080f28253c83cbd5a37568048f7/bin/pyenv-installer | bash
pyenv update || true
pyenv install 2.7.11 || true
pyenv global 2.7.11
pyenv versions || true
python --version

# because a Travis deploy script has to be a real file
npm run deploy:travis
