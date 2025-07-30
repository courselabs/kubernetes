# Docker Images Used by Lab

This document provides a comprehensive mapping of Docker images used in each lab directory.

## Summary of All Unique Images

The following Docker images are used across all labs:

### Official/Third-Party Images
- `adminer:4-standalone` - Database management UI
- `alpine:3.13`, `alpine:3.14` - Base Alpine Linux images
- `busybox:1.34.0` - Lightweight utilities
- `fluent/fluent-bit:1.8.3` - Log forwarding
- `gcr.io/cadvisor/cadvisor:v0.45.0` - Container metrics
- `ghcr.io/dexidp/dex:v2.27.0` - OpenID Connect provider
- `moby/buildkit:v0.9.0` - Docker build toolkit
- `nginx:1.18-alpine`, `nginx:1.20-alpine`, `nginx:1.23-alpine` - Web server
- `openpolicyagent/gatekeeper:v3.5.2` - Policy enforcement
- `percona:5.7.35` - MySQL variant
- `quay.io/argoproj/argocd:v2.1.2` - GitOps tool
- `quay.io/jetstack/cert-manager-cainjector:v1.5.3` - Certificate management
- `quay.io/jetstack/cert-manager-controller:v1.5.3` - Certificate management
- `quay.io/jetstack/cert-manager-webhook:v1.5.3` - Certificate management
- `quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.33.0` - Ingress controller
- `redis:6.2.4-alpine`, `redis:7-alpine` - In-memory data store

### Kubernetes Official Images
- `k8s.gcr.io/ingress-nginx/controller:v1.2.0` - Nginx ingress controller
- `k8s.gcr.io/kube-state-metrics/kube-state-metrics:v2.2.0` - Cluster metrics
- `k8s.gcr.io/metrics-server-amd64:v0.3.6` - Resource metrics
- `k8s.gcr.io/metrics-server/metrics-server:v0.6.1` - Resource metrics
- `kubernetesui/dashboard:v2.3.1` - Kubernetes dashboard
- `kubernetesui/metrics-scraper:v1.0.6` - Dashboard metrics
- `registry.k8s.io/metrics-server/metrics-server:v0.8.0` - Resource metrics

### Calico Network Policy Images
- `calico/cni:v3.15.0`
- `calico/kube-controllers:v3.15.0`
- `calico/node:v3.15.0`
- `calico/pod2daemon-flexvol:v3.15.0`

### Course/Tutorial Images
- `courselabs/bad-sleep` - Demonstration of failed container
- `courselabs/elasticsearch:7.10` - Search engine
- `courselabs/fulfilment-api` - Demo API
- `courselabs/fulfilment-processor` - Demo processor
- `courselabs/grafana:8.0.5` - Metrics visualization
- `courselabs/keda-web:latest` - KEDA demo web app
- `courselabs/keda-worker:latest` - KEDA demo worker
- `courselabs/kibana:7.10` - Log visualization
- `courselabs/nats-operator:v0.8.3` - NATS messaging operator
- `courselabs/prometheus:v2.28.1` - Metrics collection
- `diamol/ch02-hello-diamol-web` - Demo web app
- `kiamol/ch03-numbers-api` - Demo API
- `kiamol/ch03-numbers-web` - Demo web app
- `kiamol/ch03-sleep` - Sleep container for testing
- `kiamol/ch05-pi` - Pi calculation app
- `kiamol/ch05-pi-app` - Pi calculation app variant
- `kiamol/ch09-vweb:v1`, `v2`, `v3` - Versioned web app
- `kiamol/ch11-gogs` - Git server
- `kiamol/ch11-jenkins:2.319.1` - CI/CD server
- `kiamol/ch14-access-log` - Access log service
- `kiamol/ch14-image-gallery` - Image gallery app
- `kiamol/ch14-image-of-the-day` - Image API
- `kiamol/ch15-cert-generator` - Certificate generation
- `kiamol/ch16-admission-webhook` - Admission webhook
- `kiamol/ch17-kube-explorer` - Kubernetes explorer
- `kiamol/ch17-user-cert-generator` - User certificate generator
- `kiamol/ch20-todo-list` - Todo list app
- `kiamol/ch20-todo-save-handler` - Todo save handler
- `sixeyed/configurable:21.04` - Configurable demo app
- `sixeyed/kubectl:1.21.0` - Kubectl tool
- `sixeyed/whoami:21.04`, `sixeyed/whoami:24.07` - Identity service
- `widgetario/products-db:postgres` - Products database
- `widgetario/products-db:postgres-replicated` - Replicated products database

### Template Variables
- `access-log` - Template variable
- `image-gallery` - Template variable
- `image-of-the-day` - Template variable

## Images by Lab

### admission
- `kiamol/ch05-pi` - Pi calculation demo
- `kiamol/ch03-sleep` - Sleep container
- `kiamol/ch14-access-log` - Access logging
- `kiamol/ch14-image-gallery` - Image gallery
- `kiamol/ch14-image-of-the-day` - Image API
- `kiamol/ch16-admission-webhook` - Admission webhook
- `openpolicyagent/gatekeeper:v3.5.2` - Policy enforcement
- `quay.io/jetstack/cert-manager-*:v1.5.3` - Certificate management
- `sixeyed/whoami:21.04` - Identity service

### affinity
- `diamol/ch02-hello-diamol-web` - Multi-arch demo
- `sixeyed/whoami:21.04` - Identity service

### argo
- `ghcr.io/dexidp/dex:v2.27.0` - OIDC provider
- `kiamol/ch11-gogs` - Git server
- `quay.io/argoproj/argocd:v2.1.2` - ArgoCD
- `redis:6.2.4-alpine` - Redis cache
- Template variables: `access-log`, `image-gallery`, `image-of-the-day`

### buildkit
- `kiamol/ch03-sleep` - Sleep container
- `moby/buildkit:v0.9.0` - Build toolkit

### clusters
- `quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.33.0` - Ingress controller
- `sixeyed/whoami:21.04` - Identity service

### configmaps
- `sixeyed/configurable:21.04` - Configurable app demonstrating ConfigMaps

### daemonsets
- `nginx:1.18-alpine` - Web server
- `kiamol/ch03-sleep` - Sleep container

### deployments
- `sixeyed/whoami:21.04` - Identity service for deployment demos

### docker
- No Kubernetes manifests (Docker-only lab)

### helm
- No fixed images (uses Helm templates)

### ingress
- `kiamol/ch05-pi` - Pi calculation
- `nginx:1.18-alpine` - Default backend
- `k8s.gcr.io/ingress-nginx/controller:v1.2.0` - Ingress controller
- `kiamol/ch15-cert-generator` - TLS certificate generation
- `sixeyed/configurable:21.04` - Configurable app
- `sixeyed/whoami:21.04` - Identity service

### jenkins
- `kiamol/ch11-gogs` - Git server
- `kiamol/ch11-jenkins:2.319.1` - Jenkins CI/CD
- `moby/buildkit:v0.9.0` - Build toolkit

### jobs
- `alpine:3.13` - Base image for jobs
- `kiamol/ch03-sleep` - Sleep container
- `kiamol/ch05-pi` - Pi calculation
- `sixeyed/kubectl:1.21.0` - Kubectl for CronJobs

### keda
- `courselabs/keda-web:latest` - KEDA demo web app
- `courselabs/keda-worker:latest` - KEDA demo worker
- `redis:7-alpine` - Redis queue
- `registry.k8s.io/metrics-server/metrics-server:v0.8.0` - Metrics server

### logging
- `courselabs/elasticsearch:7.10` - Log storage
- `courselabs/kibana:7.10` - Log visualization
- `alpine:3.14` - Sidecar container
- `courselabs/fulfilment-api` - Demo API
- `courselabs/fulfilment-processor` - Demo processor
- `fluent/fluent-bit:1.8.3` - Log forwarding
- `kiamol/ch03-sleep` - Sleep container

### monitoring
- `courselabs/grafana:8.0.5` - Metrics visualization
- `k8s.gcr.io/kube-state-metrics/kube-state-metrics:v2.2.0` - Cluster metrics
- `courselabs/fulfilment-processor` - Demo app
- `courselabs/prometheus:v2.28.1` - Metrics collection
- `gcr.io/cadvisor/cadvisor:v0.45.0` - Container metrics

### namespaces
- `kiamol/ch05-pi` - Pi calculation
- `nginx:1.18-alpine` - Web server
- `kiamol/ch03-sleep` - Sleep container
- `sixeyed/configurable:21.04` - Configurable app
- `sixeyed/whoami:21.04` - Identity service

### networkpolicy
- Calico CNI images (`calico/*:v3.15.0`)
- `kiamol/ch03-sleep` - Sleep container
- `kiamol/ch14-access-log` - Access logging
- `kiamol/ch14-image-gallery` - Image gallery
- `kiamol/ch14-image-of-the-day` - Image API

### nodes
- No container images (node management lab)

### operators
- `busybox:1.34.0` - Init container
- `courselabs/nats-operator:v0.8.3` - NATS operator
- MySQL operator images (`docker.io/bitpoke/mysql-operator*`)
- `kiamol/ch20-todo-list` - Todo app
- `kiamol/ch20-todo-save-handler` - Todo handler
- `percona:5.7.35` - MySQL

### persistentvolumes
- `kiamol/ch05-pi` - Pi calculation
- `nginx:1.18-alpine` - Web server with caching
- `kiamol/ch03-sleep` - Sleep container

### pods
- `courselabs/bad-sleep` - Failing pod demo
- `kiamol/ch03-sleep` - Sleep container
- `sixeyed/whoami:24.07` - Identity service

### productionizing
- `kiamol/ch05-pi` - Pi calculation
- `k8s.gcr.io/metrics-server/metrics-server:v0.6.1` - Metrics for HPA
- `sixeyed/configurable:21.04` - Configurable app
- `sixeyed/whoami:21.04` - Identity service
- `widgetario/products-db:postgres` - Database

### rbac
- `kiamol/ch17-kube-explorer` - Kubernetes explorer
- `kiamol/ch03-sleep` - Sleep container
- `kiamol/ch17-user-cert-generator` - Certificate generator

### rollouts
- `nginx:1.18-alpine`, `nginx:1.20-alpine` - Different versions
- `kiamol/ch03-sleep` - Sleep container
- `kiamol/ch09-vweb:v1`, `v2`, `v3` - Versioned app

### secrets
- `sixeyed/configurable:21.04` - Configurable app demonstrating secrets

### services
- `kiamol/ch03-sleep` - Sleep container
- `sixeyed/whoami:21.04` - Identity service

### statefulsets
- `adminer:4-standalone` - Database UI
- `kiamol/ch03-sleep` - Sleep container
- `nginx:1.18-alpine` - Web server
- `widgetario/products-db:postgres-replicated` - Replicated database

### tools
- `k8s.gcr.io/metrics-server-amd64:v0.3.6` - Metrics server
- `kiamol/ch03-numbers-api` - Demo API
- `kiamol/ch03-numbers-web` - Demo web app
- `kubernetesui/dashboard:v2.3.1` - Kubernetes dashboard
- `kubernetesui/metrics-scraper:v1.0.6` - Dashboard metrics

### troubleshooting
- `kiamol/ch05-pi` - Working version
- `kiamol/ch05-pi-app` - Broken version

### troubleshooting-2
- `nginx:1.23-alpine` - Web server

### troubleshooting-3
- Uses Helm templates (no fixed images)

## Notes

1. Some labs use template variables (e.g., `{{ .Values.image }}`) which are resolved at deployment time
2. The `docker` and `helm` labs don't contain fixed image references in their specs
3. Many images are versioned (e.g., `:21.04`, `:v1.2.0`) for reproducibility
4. Several labs use the same images for consistency (e.g., `kiamol/ch03-sleep` for testing)
5. The course uses a mix of official images, course-specific images, and third-party images