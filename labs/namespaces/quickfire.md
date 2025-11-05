# Namespaces - Quickfire Questions

Test your knowledge of Kubernetes Namespaces with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary purpose of Namespaces in Kubernetes?

A) To provide network isolation between Pods
B) To provide logical separation and organization of cluster resources
C) To encrypt data
D) To manage user authentication

### 2. Which Namespaces exist by default in a new Kubernetes cluster?

A) default only
B) default, kube-system, and kube-public
C) default, kube-system, kube-public, and kube-node-lease
D) default and production

### 3. How do you create a resource in a specific Namespace using kubectl?

A) kubectl apply -f file.yaml --namespace=dev
B) kubectl create -f file.yaml -ns dev
C) kubectl apply -f file.yaml --ns=dev
D) Both A and C are correct

### 4. What is the format for a fully qualified DNS name for a Service in a Namespace?

A) service-name.namespace
B) service-name.namespace.svc.cluster.local
C) namespace.service-name.svc
D) service-name.svc.namespace

### 5. Can resources in one Namespace reference resources in another Namespace?

A) No, Namespaces provide complete isolation
B) Yes, using fully qualified names or cross-namespace references
C) Only for ConfigMaps and Secrets
D) Only if they are in the same node

### 6. Which kubectl command shows all resources across all Namespaces?

A) kubectl get all
B) kubectl get all --all-namespaces
C) kubectl get * --namespaces=all
D) kubectl get everything

### 7. What happens when you delete a Namespace?

A) Only the Namespace object is deleted
B) All resources within the Namespace are deleted
C) Resources are moved to the default Namespace
D) You must manually delete resources first

### 8. Which resources are NOT namespaced?

A) Pods and Services
B) Nodes and PersistentVolumes
C) ConfigMaps and Secrets
D) Deployments and ReplicaSets

### 9. How do you set a default Namespace for kubectl commands?

A) kubectl config set default-namespace dev
B) kubectl config set-context --current --namespace=dev
C) kubectl set namespace dev
D) kubectl use-namespace dev

### 10. What is the purpose of ResourceQuotas in Namespaces?

A) To limit network bandwidth
B) To limit the aggregate resource consumption in a Namespace
C) To set storage quotas only
D) To manage user permissions

---

## Answers

1. **B** - Namespaces provide logical separation and organization of cluster resources, allowing multiple teams or projects to share a cluster with resource isolation.

2. **C** - Default Namespaces are: `default` (for resources without a specified namespace), `kube-system` (for system components), `kube-public` (for public resources), and `kube-node-lease` (for node heartbeats).

3. **D** - Both `--namespace=dev` and `-n dev` (short form) work. The short form `-n` is more commonly used.

4. **B** - The fully qualified DNS name is `<service-name>.<namespace>.svc.cluster.local`. Within the same namespace, you can use just the service name.

5. **B** - Resources can reference resources in other Namespaces using fully qualified DNS names or explicit namespace references (e.g., ConfigMaps can't cross Namespaces, but Services can).

6. **B** - `kubectl get all --all-namespaces` or the short form `-A` shows resources across all Namespaces.

7. **B** - Deleting a Namespace deletes all resources within it. This is a destructive operation that requires confirmation.

8. **B** - Cluster-wide resources like Nodes, PersistentVolumes, StorageClasses, and Namespaces themselves are not namespaced.

9. **B** - `kubectl config set-context --current --namespace=dev` sets the default Namespace for the current context.

10. **B** - ResourceQuotas limit the aggregate resource consumption (CPU, memory, storage, object counts) within a Namespace, preventing resource exhaustion.

---

## Study Resources

- [Lab README](README.md) - Core Namespace concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Namespace topics
- [Official Namespaces Documentation](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
