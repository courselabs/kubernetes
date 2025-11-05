# Kubernetes Tools - Quickfire Questions

Test your knowledge of essential Kubernetes tools with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is kubectl?

A) A monitoring tool
B) A Kubernetes cluster
C) The command-line tool for interacting with Kubernetes
D) A container runtime

### 2. What is the purpose of kubeconfig file?

A) To store container images
B) To store cluster authentication and connection information
C) To define resource quotas
D) To store Pod configurations

### 3. Which tool can you use to run a local Kubernetes cluster?

A) kubelet
B) etcd
C) kubectl
D) kind, minikube, or Docker Desktop

### 4. What is kustomize used for?

A) Creating custom resources
B) Template-free customization of Kubernetes manifests
C) Monitoring clusters
D) Building container images

### 5. What is the default location of the kubeconfig file?

A) ~/.kube/config
B) ~/kubernetes/config
C) /var/lib/kubernetes/config
D) /etc/kubernetes/config

### 6. How do you switch between different Kubernetes contexts?

A) kubectl context switch context-name
B) kubectl use-context context-name
C) kubectl config use-context context-name
D) kubectl set context context-name

### 7. What is stern used for?

A) Performance testing
B) Tailing logs from multiple Pods simultaneously
C) Resource validation
D) Cluster management

### 8. What does kubectl apply do differently from kubectl create?

A) create supports more resource types
B) apply is declarative and can update existing resources
C) apply is faster
D) They are identical

### 9. What is k9s?

A) A monitoring tool
B) A terminal-based UI for managing Kubernetes clusters
C) A security scanner
D) A Kubernetes distribution

### 10. Which tool validates Kubernetes manifests against best practices?

A) kubecheck
B) kubectl validate
C) kubeval or kube-score
D) manifest-validator

---

## Answers

1. **C** - kubectl is the official command-line tool for interacting with Kubernetes clusters. It communicates with the API server to manage resources.

2. **B** - The kubeconfig file stores cluster information, authentication credentials, and contexts. It tells kubectl which cluster to connect to and how to authenticate.

3. **D** - kind (Kubernetes IN Docker), minikube, and Docker Desktop all provide local Kubernetes clusters for development and testing.

4. **B** - kustomize provides template-free customization of Kubernetes manifests using overlays, patches, and bases without complex templating languages.

5. **A** - The default kubeconfig location is `~/.kube/config` (or `$HOME/.kube/config`). You can override with the `KUBECONFIG` environment variable or `--kubeconfig` flag.

6. **C** - `kubectl config use-context context-name` switches to a different context (cluster/namespace/user combination) in your kubeconfig.

7. **B** - stern is a tool for tailing logs from multiple Pods and containers simultaneously, with filtering by Pod name, labels, and containers.

8. **B** - `kubectl apply` is declarative and can create or update resources. `kubectl create` is imperative and fails if the resource exists. Apply supports three-way merge.

9. **B** - k9s is a terminal-based UI that provides a fast way to navigate and manage Kubernetes clusters with keyboard shortcuts and real-time updates.

10. **C** - kubeval validates manifests against Kubernetes schemas. kube-score checks for best practices and security issues. Both help catch errors before deployment.

---

## Study Resources

- [Lab README](README.md) - Kubernetes tools overview
- [CKAD Requirements](CKAD.md) - CKAD tooling topics
- [Official kubectl Documentation](https://kubernetes.io/docs/reference/kubectl/)
