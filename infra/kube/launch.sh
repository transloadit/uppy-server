#!/usr/bin/env bash

# Set magic variables for current FILE & DIR
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__root="$(cd "$(dirname "${__dir}")" && pwd)"
__kube="${__root}"


gcloud config set project ${GCLOUD_PROJECT_ID}
gcloud config set compute/zone ${GCLOUD_COMPUTE_ZONE}
# Launch the cluster

gcloud beta container clusters create transloadit-oss-cluster --num-nodes=1 --cluster-version=1.8.1-gke.1 --machine-type=n1-highcpu-4 --enable-autoscaling --min-nodes=1 --max-nodes=5


kubectl config current-context

# Install helm and tiller
helm init --upgrade
# Wait for tiller pod tp be ready
sleep 15s
