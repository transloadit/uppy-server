#!/usr/bin/env bash
# Frey. Copyright (c) 2016, Transloadit Ltd.
#
# This file:
#
#  - Walks over any FREY_ environment variable (except for _AWS_)
#  - Adds encrypted keys ready for use to .travis.yml
#
# Run as:
#
#  ./encrypt.sh
#
# Authors:
#
#  - Kevin van Zonneveld <kevin@transloadit.com>

set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

if [ -z "${FREY_AWS_ACCESS_KEY:-}" ]; then
  echo "FREY_AWS_ACCESS_KEY not present. "
  echo "Please first source env.sh"
  exit 1
fi

# Set magic variables for current file & dir
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
__base="$(basename ${__file} .sh)"
__root="$(dirname "${__dir}")"

for var in $(env |awk -F= '{print $1}' |egrep '^FREY_[A-Z0-9_]+$' |grep -v '_AWS_' |sort); do
  echo "Encrypting and adding '${var}'"
  travis encrypt "${var}=${!var}" --add env.global
done
