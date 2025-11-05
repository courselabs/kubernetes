# Nodes - Quickfire Questions

Test your knowledge of Kubernetes Nodes with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is a Node in Kubernetes?

A) A network device
B) A container runtime
C) A worker machine (VM or physical) that runs Pods
D) A Pod running on a server

### 2. Which command shows all nodes in a cluster?

A) kubectl list nodes
B) kubectl get nodes
C) kubectl nodes list
D) kubectl show nodes

### 3. What are the main components running on every worker node?

A) API server and scheduler
B) etcd and controller manager
C) Only the container runtime
D) kubelet, kube-proxy, and container runtime

### 4. What is the purpose of kubelet?

A) To schedule Pods
B) To manage the API server
C) To store cluster data
D) To ensure containers are running in Pods on the node

### 5. What does the Ready condition indicate for a node?

A) The node is being drained
B) The node is offline
C) The node has no Pods
D) The node is healthy and ready to accept Pods

### 6. What is a taint on a node?

A) A property that repels Pods unless they have matching tolerations
B) An error state
C) A resource limit
D) A label for organization

### 7. How do you mark a node as unschedulable to prevent new Pods from being scheduled?

A) kubectl stop node-name
B) kubectl cordon node-name
C) kubectl taint node-name
D) kubectl disable node-name

### 8. What is the purpose of draining a node?

A) To evict Pods gracefully before maintenance
B) To clear node labels
C) To remove taints
D) To delete the node

### 9. Which node condition indicates disk pressure?

A) LowDisk
B) DiskPressure
C) DiskFull
D) OutOfDisk

### 10. What does kube-proxy do on each node?

A) Monitors node health
B) Runs the container runtime
C) Implements network rules for Service routing
D) Schedules Pods

---

## Answers

1. **C** - A Node is a worker machine (physical or virtual) in the Kubernetes cluster that runs Pods. The cluster consists of control plane and worker nodes.

2. **B** - `kubectl get nodes` lists all nodes. Add `-o wide` for additional details like IP addresses and container runtime versions.

3. **D** - Every worker node runs: kubelet (node agent), kube-proxy (network proxy), and a container runtime (Docker, containerd, CRI-O).

4. **D** - kubelet is the node agent that ensures containers described in PodSpecs are running and healthy. It communicates with the API server.

5. **D** - The Ready condition indicates the node is healthy and ready to accept new Pods. Other conditions include MemoryPressure, DiskPressure, PIDPressure.

6. **A** - A taint is a node property that repels Pods unless they have matching tolerations. Used to dedicate nodes to specific workloads or prevent scheduling during issues.

7. **B** - `kubectl cordon node-name` marks a node as unschedulable, preventing new Pods from being scheduled. `kubectl uncordon` reverses this.

8. **A** - `kubectl drain node-name` safely evicts all Pods from a node before maintenance, respecting PodDisruptionBudgets and graceful termination.

9. **B** - DiskPressure indicates the node's disk capacity is low. Other conditions: MemoryPressure, PIDPressure, NetworkUnavailable, Ready.

10. **C** - kube-proxy implements network rules (iptables/IPVS) on each node to enable Service networking, forwarding traffic to appropriate Pods.

---

## Study Resources

- [Lab README](README.md) - Node concepts and management
- [CKAD Requirements](CKAD.md) - CKAD node topics
- [Official Nodes Documentation](https://kubernetes.io/docs/concepts/architecture/nodes/)
