---
layout: post
title: "My kubectl commands cheat sheet"
date: 2022-9-2
subtitle: "My useful kubectl commands cheat sheet and Google Kubernetes Engine cluster (GKE) set up"
author: "ntsd"
catalog: true
categories:
  - Cloud
tags:
  - Kubernetes
  - Google Cloud Platform
published: true
---

As a developer sometimes I need to debug or investigate problems on the cloud machine. so I create this cheat sheet to note the commands. And it might be good to share with people who are just getting started with the Kubernetes.

# Pod, Namespace, and Deployment

to using kubectl, the reader need to know some knowledge about pod, namespace, and containers in Kubernetes.

## Container

Kubernates Container is similar to Docker Container it will include software or package to runnning on it environments or OS. And the pre running container is calling Container Image similar to Docker Image.

## Pod

Pod is the smallest computing unit in Kubernetes that will share resource and storage. One pod can have multiple containers.

## Namespace

namespace will use to define the unique name of group or cluster for multiple objects. normally they will use namespace to specific team or project for make it easier to manage and avoid the effect between team or project.

## Deployment

A resource object in Kubernetes that provides declarative updates to applications. for example image, number of pods, etc. normallt it will write in `.yaml` format.

# Google Kubernetes Engine Cluster

to make the kubectl work, we need to set the config. for manual set can follow this guide <https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/>.

I am using Google Kubernetes Engine (GKE) they have the gcloud container command to allow me to manage containers and cluster easier.

to map configuration with gcloud cli

```bash
# init gcloud
gcloud init

# login
gcloud auth login

# list gcloud config
gcloud config list

# list project
gcloud projects list

# list clusters by project
gcloud container clusters list --project <project-name>

# map kubectl config, for zone copy from the `Location` when list cluster
gcloud container clusters get-credentials <cluster-name> --zone <zone>

# check kubectl config
kubectl config view
```

After this your kubectl will using access from the gcloud cluster

# Kubectl commands

## Find resource name

Resource name will help to identify the Kubernates resource and target such as Service, Pod, Deployment, etc.

### List pods

```bash
# list pods by all namespaces
kubectl get pod -A

# list pods by namespace
kubectl get pod -n <name-space>
```

### List deployment

```bash
# list deployment by namespace
kubectl get deployment -n <name-space>
```

### List all

```bash
# list all by namespace
kubectl get all -n <name-space>

# list service, pod, and deployment by namespace
kubectl get service,pod,deployment -n <name-space>
```

### Get expose port

```bash
kubectl get svc -n <name-space>
```

## Environment

```bash
# set env
kubectl set env <resource-name> -n <name-space> {ENV_NAME}={ENV_VALUE}

# remove env, to remove env need to add `-` after the env name
kubectl set env <resource-name> -n <name-space> {ENV_NAME}-

# list all pods env
kubectl set env pods --all --list
```

## Forward port

Forward port will allow you access to the Kubernates cluster and mapping with your local port

```bash
kubectl port-forward -n <name-space> <resource-name> <local-port>:<resource-port>

# example
kubectl port-forward -n <name-space> <resource-name> 8080:80
```

## Exec

runnning shell on Kubectl pod

if you familiar to Docker it work similar to `docker exec`

```bash
# run shell command
kubectl -n <name-space> exec <pod-name> -- <cmd>

# get env of pod by shell
kubectl -n <name-space> exec <pod-name> -- env

# interactive mode
kubectl -n <name-space> exec -it <pod-name> -- bash
```
