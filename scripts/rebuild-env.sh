#!/usr/bin/env bash
# Uppy-server. Copyright (c) 2016, Transloadit Ltd.

# This file:
#
#  - Creates a brand new env.sh based on env.example.sh that is shipped with Git
#  - Walks over any FREY_ and UPPYSERVER_ environment variable
#  - Adds them as exports to to env.sh
#
# Run as:
#
#  ./rebuild-env.sh
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

if [ -f "${__root}/env.sh" ]; then
  echo "You alreayd have a '${__root}/env.sh'"
  exit 1
fi

cp -v "${__root}/env.example.sh" "${__root}/env.sh"
for var in $(env |awk -F= '{print $1}' |egrep '^(FREY|UPPYSERVER)_[A-Z0-9_]+$'| grep -v '_AWS_' |sort); do
  echo "Adding '${var}' to env.sh"
  echo "export ${var}=\"${!var}\"" >> "${__root}/env.sh"
done
