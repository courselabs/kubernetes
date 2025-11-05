# Kubernetes Clusters - Quickfire Questions

Test your knowledge of Kubernetes cluster architecture and components with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What are the main components of the Kubernetes control plane?

A) API server, scheduler, controller manager, and etcd
B) kubelet and kube-proxy
C) Docker and containerd
D) Pods and Services

### 2. What is etcd's role in a Kubernetes cluster?

A) Container runtime
B) Network proxy
C) Load balancer
D) Distributed key-value store for all cluster data

### 3. What does the Kubernetes scheduler do?

A) Schedules meetings
B) Routes network traffic
C) Assigns Pods to nodes based on resource requirements and constraints
D) Manages container lifecycles

### 4. What is the API server's role?

A) Schedules Pods
B) Runs containers
C) Stores cluster data
D) Exposes the Kubernetes API and processes all API requests

### 5. What do controllers in the controller manager do?

A) Manage user access
B) Watch desired state and take actions to achieve it (e.g., Deployment, ReplicaSet controllers)
C) Schedule Pods
D) Control network traffic

### 6. Can a cluster have multiple control plane nodes?

A) Only with special licenses
B) No, only one is allowed
C) Yes, for high availability
D) Only in cloud environments

### 7. What is a Kubernetes context?

A) A Pod configuration
B) A namespace
C) A combination of cluster, user, and namespace for kubectl
D) A node label

### 8. What is the purpose of the cloud controller manager?

A) To monitor cloud costs
B) To deploy to the cloud
C) To manage all cloud resources
D) To interact with cloud provider APIs for resources like load balancers and volumes

### 9. What is a kubeconfig file used for?

A) Defining resource limits
B) Storing cluster connection information and credentials
C) Storing application configuration
D) Configuring Pods

### 10. What is the difference between a managed and self-hosted Kubernetes cluster?

A) Managed clusters are always free
B) Managed clusters have the control plane managed by the provider; self-hosted requires you to manage it
C) Self-hosted clusters are faster
D) No difference

---

## Answers

1. **A** - The control plane consists of: API server (API frontend), scheduler (Pod placement), controller manager (controller loops), and etcd (data store).

2. **D** - etcd is a distributed, consistent key-value store that holds all cluster data, including configuration, state, and metadata for all Kubernetes objects.

3. **C** - The scheduler watches for newly created Pods without assigned nodes and selects optimal nodes based on resource requirements, constraints, affinity, and policies.

4. **D** - The API server is the front-end for the Kubernetes control plane, exposing the REST API. All operations (kubectl, controllers, kubelet) interact through it.

5. **B** - Controllers continuously watch the desired state of resources and take corrective actions to match actual state to desired state (e.g., maintaining replica counts).

6. **C** - Multiple control plane nodes provide high availability. API servers can run actively, while scheduler and controller manager use leader election.

7. **C** - A context in kubeconfig defines a cluster (API server endpoint), user (credentials), and default namespace, allowing easy switching between configurations.

8. **D** - The cloud controller manager interacts with cloud provider APIs to manage cloud-specific resources like LoadBalancer Services, persistent volumes, and node lifecycle.

9. **B** - kubeconfig stores cluster endpoints, authentication credentials, contexts, and preferences for kubectl to connect to clusters.

10. **B** - Managed clusters (EKS, AKS, GKE) have the control plane managed by the provider. Self-hosted clusters require you to install, configure, and maintain all components.

---

## Study Resources

- [Lab README](README.md) - Cluster architecture and components
- [CKAD Requirements](CKAD.md) - CKAD cluster topics
- [Official Cluster Architecture Documentation](https://kubernetes.io/docs/concepts/architecture/)
