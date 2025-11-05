# Kubernetes Clusters - Quickfire Questions

Test your knowledge of Kubernetes cluster architecture and components with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What are the main components of the Kubernetes control plane?

A) kubelet and kube-proxy
B) API server, scheduler, controller manager, and etcd
C) Docker and containerd
D) Pods and Services

### 2. What is etcd's role in a Kubernetes cluster?

A) Container runtime
B) Distributed key-value store for all cluster data
C) Network proxy
D) Load balancer

### 3. What does the Kubernetes scheduler do?

A) Schedules meetings
B) Assigns Pods to nodes based on resource requirements and constraints
C) Manages container lifecycles
D) Routes network traffic

### 4. What is the API server's role?

A) Stores cluster data
B) Exposes the Kubernetes API and processes all API requests
C) Runs containers
D) Schedules Pods

### 5. What do controllers in the controller manager do?

A) Control network traffic
B) Watch desired state and take actions to achieve it (e.g., Deployment, ReplicaSet controllers)
C) Manage user access
D) Schedule Pods

### 6. Can a cluster have multiple control plane nodes?

A) No, only one is allowed
B) Yes, for high availability
C) Only in cloud environments
D) Only with special licenses

### 7. What is a Kubernetes context?

A) A Pod configuration
B) A combination of cluster, user, and namespace for kubectl
C) A namespace
D) A node label

### 8. What is the purpose of the cloud controller manager?

A) To manage all cloud resources
B) To interact with cloud provider APIs for resources like load balancers and volumes
C) To deploy to the cloud
D) To monitor cloud costs

### 9. What is a kubeconfig file used for?

A) Configuring Pods
B) Storing cluster connection information and credentials
C) Defining resource limits
D) Storing application configuration

### 10. What is the difference between a managed and self-hosted Kubernetes cluster?

A) No difference
B) Managed clusters have the control plane managed by the provider; self-hosted requires you to manage it
C) Managed clusters are always free
D) Self-hosted clusters are faster

---

## Answers

1. **B** - The control plane consists of: API server (API frontend), scheduler (Pod placement), controller manager (controller loops), and etcd (data store).

2. **B** - etcd is a distributed, consistent key-value store that holds all cluster data, including configuration, state, and metadata for all Kubernetes objects.

3. **B** - The scheduler watches for newly created Pods without assigned nodes and selects optimal nodes based on resource requirements, constraints, affinity, and policies.

4. **B** - The API server is the front-end for the Kubernetes control plane, exposing the REST API. All operations (kubectl, controllers, kubelet) interact through it.

5. **B** - Controllers continuously watch the desired state of resources and take corrective actions to match actual state to desired state (e.g., maintaining replica counts).

6. **B** - Multiple control plane nodes provide high availability. API servers can run actively, while scheduler and controller manager use leader election.

7. **B** - A context in kubeconfig defines a cluster (API server endpoint), user (credentials), and default namespace, allowing easy switching between configurations.

8. **B** - The cloud controller manager interacts with cloud provider APIs to manage cloud-specific resources like LoadBalancer Services, persistent volumes, and node lifecycle.

9. **B** - kubeconfig stores cluster endpoints, authentication credentials, contexts, and preferences for kubectl to connect to clusters.

10. **B** - Managed clusters (EKS, AKS, GKE) have the control plane managed by the provider. Self-hosted clusters require you to install, configure, and maintain all components.

---

## Study Resources

- [Lab README](README.md) - Cluster architecture and components
- [CKAD Requirements](CKAD.md) - CKAD cluster topics
- [Official Cluster Architecture Documentation](https://kubernetes.io/docs/concepts/architecture/)
