# Namespaces - Quickfire Questions

Test your knowledge of Kubernetes Namespaces with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary purpose of Namespaces in Kubernetes?

A) To encrypt data
B) To provide logical separation and organization of cluster resources
C) To provide network isolation between Pods
D) To manage user authentication

### 2. Which Namespaces exist by default in a new Kubernetes cluster?

A) default only
B) default, kube-system, kube-public, and kube-node-lease
C) default and production
D) default, kube-system, and kube-public

### 3. How do you create a resource in a specific Namespace using kubectl?

A) kubectl apply -f file.yaml --namespace=dev
B) Both A and C are correct
C) kubectl create -f file.yaml -ns dev
D) kubectl apply -f file.yaml --ns=dev

### 4. What is the format for a fully qualified DNS name for a Service in a Namespace?

A) service-name.svc.namespace
B) namespace.service-name.svc
C) service-name.namespace
D) service-name.namespace.svc.cluster.local

### 5. Can resources in one Namespace reference resources in another Namespace?

A) Only for ConfigMaps and Secrets
B) Yes, using fully qualified names or cross-namespace references
C) No, Namespaces provide complete isolation
D) Only if they are in the same node

### 6. Which kubectl command shows all resources across all Namespaces?

A) kubectl get all --all-namespaces
B) kubectl get everything
C) kubectl get all
D) kubectl get * --namespaces=all

### 7. What happens when you delete a Namespace?

A) Resources are moved to the default Namespace
B) Only the Namespace object is deleted
C) All resources within the Namespace are deleted
D) You must manually delete resources first

### 8. Which resources are NOT namespaced?

A) ConfigMaps and Secrets
B) Pods and Services
C) Nodes and PersistentVolumes
D) Deployments and ReplicaSets

### 9. How do you set a default Namespace for kubectl commands?

A) kubectl config set default-namespace dev
B) kubectl use-namespace dev
C) kubectl set namespace dev
D) kubectl config set-context --current --namespace=dev

### 10. What is the purpose of ResourceQuotas in Namespaces?

A) To manage user permissions
B) To set storage quotas only
C) To limit the aggregate resource consumption in a Namespace
D) To limit network bandwidth

---

## Answers

1. **B** - Namespaces provide logical separation and organization of cluster resources, allowing multiple teams or projects to share a cluster with resource isolation.

2. **B** - Default Namespaces are: `default` (for resources without a specified namespace), `kube-system` (for system components), `kube-public` (for public resources), and `kube-node-lease` (for node heartbeats).

3. **B** - Both `--namespace=dev` and `-n dev` (short form) work. The short form `-n` is more commonly used.

4. **D** - The fully qualified DNS name is `<service-name>.<namespace>.svc.cluster.local`. Within the same namespace, you can use just the service name.

5. **B** - Resources can reference resources in other Namespaces using fully qualified DNS names or explicit namespace references (e.g., ConfigMaps can't cross Namespaces, but Services can).

6. **A** - `kubectl get all --all-namespaces` or the short form `-A` shows resources across all Namespaces.

7. **C** - Deleting a Namespace deletes all resources within it. This is a destructive operation that requires confirmation.

8. **C** - Cluster-wide resources like Nodes, PersistentVolumes, StorageClasses, and Namespaces themselves are not namespaced.

9. **D** - `kubectl config set-context --current --namespace=dev` sets the default Namespace for the current context.

10. **C** - ResourceQuotas limit the aggregate resource consumption (CPU, memory, storage, object counts) within a Namespace, preventing resource exhaustion.

---

## Study Resources

- [Lab README](README.md) - Core Namespace concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Namespace topics
- [Official Namespaces Documentation](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
