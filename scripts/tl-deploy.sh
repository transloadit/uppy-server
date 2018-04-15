#!/usr/bin/env bash
set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

# Set magic variables for current FILE & DIR
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__root="$(cd "$(dirname "${__dir}")" && pwd)"

hostsFile="${__dir}/.tl-deploy-hosts-danger.txt"
localPath="${__root}/"
remotePath="/srv/current/api2/node_modules/uppy-server"
parentDir=$(dirname ${remotePath})
cmd="cd /srv/current"
cmd="${cmd} && sudo chown -R transloadit-api2.ubuntu ${parentDir}"
cmd="${cmd} && source env.sh"
cmd="${cmd} && tlsvc -s uppy-server restart"

host="${1:-}"

if [ "${host}" = "" ]; then
  type jq || brew install jq
  type curl || brew install curl

  # Cache hosts file for 10 minutes
  if find "${hostsFile}" -mmin +10; then
    echo "--> Deleting hosts cache file '${hostsFile}' cause older than 10 minutes ... "
    rm -f "${hostsFile}"
  fi
  if [ ! -f "${hostsFile}" ]; then
    echo "--> Saving new hosts cache file '${hostsFile}' for the next 10 minutes of iterations ... "
    curl -sSLk https://api2.transloadit.com/instances \
      | jq --raw-output \
        '.instances[] 
        | select(.role=="spot_uploader" or .role=="uploader") 
        | select(.cluster=="production") 
        | "\(.hostname)"' \
      > "${hostsFile}"
  fi
else 
  echo "Populating '${hostsFile}' from cli argument"
  echo "${host}" > "${hostsFile}"
fi

echo ""
echo "************************************************************************************"
echo "I will sudo chmod 777, remove ${jsFile:-nothing}, upload your version of ${localPath}"
echo "to uploaders: $(echo $(cat "${hostsFile}")) "
echo "set in: ${hostsFile}."
echo ""
echo "This command will be run: "
echo "${cmd}"
echo ""
echo "I will do all of this in parallel."
echo "This can be EXTREMELY DANGEROUS!!!"
echo ""
echo "You have 3 seconds to press CTRL+C"
echo "************************************************************************************"
echo ""

sleep 3

# Make sure we're not deploying syntax errors:
chmod 600 "${__root}/../api2/envs/api2-production-ssh-key.pem"
ssh="ssh -i ${__root}/../api2/envs/api2-production-ssh-key.pem -o LogLevel=error -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -l ubuntu"

cat "${hostsFile}" |while read -r host; do
  echo "${ssh} \"${host}\" \"sudo chown -R transloadit-api2.ubuntu ${parentDir} && sudo chmod -R g+wrX ${parentDir}\" && rsync --progress -ai --no-o --no-g --no-p --no-t -e \"${ssh}\" ${localPath} ${host}:${remotePath} && ${ssh} \"${host}\" \"${cmd}\""
  (${ssh} "${host}" "sudo chown -R transloadit-api2.ubuntu ${parentDir} && sudo chmod -R g+wrX ${parentDir}" && rsync --progress -ai --no-o --no-g --no-p --no-t -e "${ssh}" ${localPath} ${host}:${remotePath} && ${ssh} "${host}" "${cmd}") &
done