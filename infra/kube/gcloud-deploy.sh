#!/usr/bin/env bash
set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace



# Set magic variables for current FILE & DIR
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__kube="${__dir}"

# Store the new image in docker hub
docker build --quiet -t transloadit/uppy-server:latest -t transloadit/uppy-server:$TRAVIS_COMMIT .;
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD";
docker push transloadit/uppy-server:$TRAVIS_COMMIT;
docker push transloadit/uppy-server:latest;


echo $GCLOUD_KEY | base64 --decode -i > ${HOME}/gcloud-service-key.json
gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json

echo $UPPY_ENV | base64 --decode -i > "${__kube}/uppy-server/uppy-env.yaml"

gcloud --quiet config set project $PROJECT_NAME
gcloud --quiet config set container/cluster $CLUSTER_NAME
gcloud --quiet config set compute/zone ${COMPUTE_ZONE}
gcloud --quiet container clusters get-credentials $CLUSTER_NAME

kubectl config current-context

helm init --service-account tiller --upgrade
sleep 15s

kubectl apply -f "${__kube}/uppy-server/00-namespace.yaml"

helm list |grep uppy || helm install --name uppy \
                                      --namespace uppy \
                                      --set redisPassword=${UPPY_REDIS_PASS}  \
                                      stable/redis
helm list --namespace uppy

kubectl apply -f "${__kube}/uppy-server/uppy-env.yaml"
kubectl apply -f "${__kube}/uppy-server/deployment.yaml"
kubectl apply -f "${__kube}/uppy-server/service.yaml"
kubectl apply -f "${__kube}/uppy-server/ingress-tls.yaml"
kubectl set image deployment/uppy-server --namespace=uppy uppy-server=docker.io/transloadit/uppy-server:$TRAVIS_COMMIT
sleep 10s

kubectl get pods --namespace=uppy
kubectl get service --namespace=uppy
kubectl get deployment --namespace=uppy














