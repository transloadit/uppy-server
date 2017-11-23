#!/usr/bin/env bash

# Set magic variables for current FILE & DIR
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__kube="${__dir}"


echo $GCLOUD_KEY | base64 --decode -i > gcloud-service-key.json
# This is a useless key, just for debugging 
cat gcloud-service-key.json
gcloud auth activate-service-account --key-file gcloud-service-key.json

echo $UPPY_ENV | base64 --decode -i > "${__kube}/uppy-server/uppy-env.yaml"

gcloud --quiet config set project $PROJECT_NAME
gcloud --quiet config set container/cluster $CLUSTER_NAME
gcloud --quiet config set compute/zone ${COMPUTE_ZONE}
gcloud --quiet container clusters get-credentials $CLUSTER_NAME

kubectl config current-context

kubectl set image deployment/uppy-server --namespace=uppy uppy-server=docker.io/transloadit/uppy-server:$TRAVIS_COMMIT

kubectl apply -f "${__kube}/uppy-server/00-namespace.yaml"

helm list |grep uppy-redis || helm install --name uppy \
                                      --namespace uppy \
                                      --set redisPassword=${UPPY_REDIS_PASS}  \
                                      stable/redis
helm list

kubectl apply -f "${__kube}/uppy-server/uppy-env.yaml"
kubectl apply -f "${__kube}/uppy-server/deployment.yaml"
kubectl apply -f "${__kube}/uppy-server/service.yaml"
kubectl apply -f "${__kube}/uppy-server/ingress-tls.yaml"

sleep 10s

kubectl get pods --namespace=uppy
kubectl get service --namespace=uppy
kubectl get deployment --namespace=uppy














