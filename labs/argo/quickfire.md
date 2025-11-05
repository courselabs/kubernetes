# ArgoCD and GitOps - Quickfire Questions

Test your knowledge of ArgoCD and GitOps principles with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is GitOps?

A) Using Git for version control only
B) An operational model where Git is the single source of truth for declarative infrastructure
C) A Git hosting service
D) A deployment tool

### 2. What is ArgoCD?

A) A Git client
B) A declarative GitOps continuous delivery tool for Kubernetes
C) A container registry
D) A monitoring tool

### 3. How does ArgoCD detect changes in Git repositories?

A) Manual triggers only
B) Polling the repository or webhook notifications
C) Email notifications
D) SSH connections

### 4. What is an ArgoCD Application?

A) A containerized application
B) A CRD that defines the source repository and destination cluster for deployment
C) A deployment manifest
D) A Git repository

### 5. What does it mean when an ArgoCD Application is "OutOfSync"?

A) The application is broken
B) The live cluster state differs from the desired state in Git
C) The Git repository is unavailable
D) The cluster is offline

### 6. What is the ArgoCD sync operation?

A) Syncing data between clusters
B) Applying desired state from Git to the cluster
C) Backing up cluster data
D) Updating Git repositories

### 7. Can ArgoCD automatically sync applications?

A) No, all syncs must be manual
B) Yes, with auto-sync enabled
C) Only for specific resource types
D) Only during business hours

### 8. What is a sync wave in ArgoCD?

A) Network synchronization
B) A way to control the order of resource creation using annotations
C) A backup strategy
D) A rollback mechanism

### 9. What does ArgoCD use to determine the desired state?

A) Kubernetes API
B) Git repositories containing Kubernetes manifests, Helm charts, or Kustomize
C) Docker images
D) Configuration databases

### 10. What is the purpose of ArgoCD Projects?

A) To organize code
B) To provide multi-tenancy and restrict what can be deployed where
C) To create Git repositories
D) To build containers

---

## Answers

1. **B** - GitOps is an operational model where Git repositories serve as the single source of truth for declarative infrastructure and applications, with automated delivery to match the desired state.

2. **B** - ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. It monitors Git repositories and automatically synchronizes the cluster state.

3. **B** - ArgoCD can poll Git repositories at regular intervals (default 3 minutes) or receive webhook notifications for immediate detection of changes.

4. **B** - An ArgoCD Application is a CRD that defines: the source (Git repo, path, revision), destination (cluster, namespace), and sync policy.

5. **B** - OutOfSync means the actual state in the cluster differs from the desired state defined in Git. ArgoCD can automatically or manually sync to fix this.

6. **B** - A sync operation applies the desired state from Git to the cluster, creating, updating, or deleting resources to match the Git repository.

7. **B** - With auto-sync enabled, ArgoCD automatically applies changes from Git to the cluster without manual intervention. You can also configure self-healing.

8. **B** - Sync waves use the `argocd.argoproj.io/sync-wave` annotation to control resource creation order. Lower numbers are applied first (e.g., -5, 0, 5).

9. **B** - ArgoCD reads desired state from Git repositories containing Kubernetes manifests (raw YAML), Helm charts, Kustomize overlays, or other supported tools.

10. **B** - ArgoCD Projects provide logical grouping and multi-tenancy, restricting which Git repositories can be deployed to which clusters and namespaces.

---

## Study Resources

- [Lab README](README.md) - ArgoCD and GitOps concepts
- [Official ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Principles](https://opengitops.dev/)
