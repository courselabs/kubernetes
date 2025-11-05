# Helm - Quickfire Questions

Test your knowledge of Helm package manager with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is Helm primarily used for in Kubernetes?

A) Container image building
B) Package management and templating for Kubernetes applications
C) Network configuration
D) User authentication

### 2. What is a Helm Chart?

A) A visualization tool for Kubernetes resources
B) A package containing Kubernetes manifests and metadata
C) A monitoring dashboard
D) A network routing table

### 3. Which command installs a Helm chart?

A) helm deploy chart-name
B) helm install release-name chart-name
C) helm apply chart-name
D) helm create release-name

### 4. What is a Helm release?

A) A version of Helm itself
B) An instance of a chart installed in a cluster
C) A published chart version
D) A container image tag

### 5. How do you customize values when installing a Helm chart?

A) Edit the chart directly
B) Use --set key=value or -f values.yaml
C) Use --config file.yaml
D) Use --customize values

### 6. Which file in a Helm chart contains the default configuration values?

A) config.yaml
B) values.yaml
C) defaults.yaml
D) settings.yaml

### 7. How do you upgrade an existing Helm release?

A) helm update release-name chart-name
B) helm upgrade release-name chart-name
C) helm apply release-name chart-name
D) helm install --upgrade release-name

### 8. What command shows the history of a Helm release?

A) helm log release-name
B) helm history release-name
C) helm revisions release-name
D) helm show history release-name

### 9. How do you rollback a Helm release to a previous version?

A) helm undo release-name
B) helm revert release-name
C) helm rollback release-name [revision]
D) helm restore release-name

### 10. Which directory in a Helm chart contains the Kubernetes manifest templates?

A) manifests/
B) templates/
C) kubernetes/
D) specs/

---

## Answers

1. **B** - Helm is a package manager for Kubernetes that simplifies deploying and managing applications using templated manifests and reusable packages (charts).

2. **B** - A Helm Chart is a package containing all the Kubernetes resource definitions, templates, metadata, and default values needed to deploy an application.

3. **B** - `helm install release-name chart-name` installs a chart. The release-name is a unique identifier for this installation instance.

4. **B** - A Helm release is an instance of a chart deployed to a cluster. You can install the same chart multiple times with different release names.

5. **B** - Use `--set key=value` for individual values or `-f values.yaml` / `--values values.yaml` to provide a custom values file.

6. **B** - The `values.yaml` file in a chart contains default configuration values that can be overridden during installation or upgrade.

7. **B** - `helm upgrade release-name chart-name` upgrades an existing release to a new chart version or with new values. Use `--reuse-values` to keep existing values.

8. **B** - `helm history release-name` shows all revisions of a release, including revision numbers, dates, status, and descriptions.

9. **C** - `helm rollback release-name [revision]` rolls back to a previous revision. Without specifying revision, it rolls back to the previous revision.

10. **B** - The `templates/` directory contains Kubernetes manifest templates written in Go template syntax. Helm renders these with values to create actual manifests.

---

## Study Resources

- [Lab README](README.md) - Core Helm concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Helm topics
- [Official Helm Documentation](https://helm.sh/docs/)
