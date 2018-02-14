#!/usr/bin/env bash
set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

# Set magic variables for current FILE & DIR
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__root="$(cd "$(dirname "${__dir}")" && pwd)"

hostsFile="${__dir}/.tl-deploy-hosts-danger.txt"
localPath="${__root}/lib/"
remotePath="/srv/current/api2/node_modules/uppy-server/lib"
parentDir=$(dirname ${remotePath})
cmd="cd /srv/current"
cmd="${cmd} && source env.sh"
cmd="${cmd} && tlsvc -s uppy-server restart"

type jq || brew install jq
type curl || brew install curl

if false; then
  curl -sSLk https://api2.transloadit.com/instances \
    | jq --raw-output \
      '.instances[] 
      | select(.role=="spot_uploader" or .role=="uploader") 
      | select(.cluster=="production") 
      | "\(.hostname)"' \
    > "${hostsFile}"
fi

# Make sure we're not deploying syntax errors:
chmod 600 "${__root}/../api2/envs/api2-production-ssh-key.pem"

echo ""
echo "************************************************************************************"
echo "I will sudo chmod 777, remove ${jsFile:-nothing}, upload your version of ${localPath}"
echo "to $(cat "${hostsFile}" |wc -l) servers from ${hostsFile}."
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

# sleep 3

ssh="ssh -i ${__root}/../api2/envs/api2-production-ssh-key.pem -o LogLevel=error -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -l ubuntu"

cat "${hostsFile}" |while read -r host; do
  echo "${ssh} \"${host}\" \"sudo chmod 777 ${parentDir} && sudo chgrp -R ubuntu ${remotePath} && sudo chmod -R g+wrX ${remotePath}\" && rsync --progress -vvnaie \"${ssh}\" ${localPath} ${host}:${remotePath} && ${ssh} \"${host}\" \"${cmd}\""
  # (${ssh} "${host}" "sudo chmod 777 ${parentDir} && sudo chgrp -R ubuntu ${remotePath} && sudo chmod -R g+wrX ${remotePath}" && rsync --progress -naie "${ssh}" ${localPath} ${host}:${remotePath} && ${ssh} "${host}" "${cmd}") &
done
