# ArgoCD and GitOps - Quickfire Questions

Test your knowledge of ArgoCD and GitOps principles with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is GitOps?

A) An operational model where Git is the single source of truth for declarative infrastructure
B) A Git hosting service
C) A deployment tool
D) Using Git for version control only

### 2. What is ArgoCD?

A) A container registry
B) A Git client
C) A declarative GitOps continuous delivery tool for Kubernetes
D) A monitoring tool

### 3. How does ArgoCD detect changes in Git repositories?

A) Manual triggers only
B) Polling the repository or webhook notifications
C) Email notifications
D) SSH connections

### 4. What is an ArgoCD Application?

A) A containerized application
B) A deployment manifest
C) A CRD that defines the source repository and destination cluster for deployment
D) A Git repository

### 5. What does it mean when an ArgoCD Application is "OutOfSync"?

A) The cluster is offline
B) The application is broken
C) The Git repository is unavailable
D) The live cluster state differs from the desired state in Git

### 6. What is the ArgoCD sync operation?

A) Syncing data between clusters
B) Backing up cluster data
C) Updating Git repositories
D) Applying desired state from Git to the cluster

### 7. Can ArgoCD automatically sync applications?

A) Yes, with auto-sync enabled
B) No, all syncs must be manual
C) Only during business hours
D) Only for specific resource types

### 8. What is a sync wave in ArgoCD?

A) A rollback mechanism
B) A backup strategy
C) A way to control the order of resource creation using annotations
D) Network synchronization

### 9. What does ArgoCD use to determine the desired state?

A) Git repositories containing Kubernetes manifests, Helm charts, or Kustomize
B) Configuration databases
C) Kubernetes API
D) Docker images

### 10. What is the purpose of ArgoCD Projects?

A) To build containers
B) To provide multi-tenancy and restrict what can be deployed where
C) To create Git repositories
D) To organize code

---

## Answers

1. **A** - GitOps is an operational model where Git repositories serve as the single source of truth for declarative infrastructure and applications, with automated delivery to match the desired state.

2. **C** - ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. It monitors Git repositories and automatically synchronizes the cluster state.

3. **B** - ArgoCD can poll Git repositories at regular intervals (default 3 minutes) or receive webhook notifications for immediate detection of changes.

4. **C** - An ArgoCD Application is a CRD that defines: the source (Git repo, path, revision), destination (cluster, namespace), and sync policy.

5. **D** - OutOfSync means the actual state in the cluster differs from the desired state defined in Git. ArgoCD can automatically or manually sync to fix this.

6. **D** - A sync operation applies the desired state from Git to the cluster, creating, updating, or deleting resources to match the Git repository.

7. **A** - With auto-sync enabled, ArgoCD automatically applies changes from Git to the cluster without manual intervention. You can also configure self-healing.

8. **C** - Sync waves use the `argocd.argoproj.io/sync-wave` annotation to control resource creation order. Lower numbers are applied first (e.g., -5, 0, 5).

9. **A** - ArgoCD reads desired state from Git repositories containing Kubernetes manifests (raw YAML), Helm charts, Kustomize overlays, or other supported tools.

10. **B** - ArgoCD Projects provide logical grouping and multi-tenancy, restricting which Git repositories can be deployed to which clusters and namespaces.

---

## Study Resources

- [Lab README](README.md) - ArgoCD and GitOps concepts
- [Official ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Principles](https://opengitops.dev/)
