# Nodes - Quickfire Questions

Test your knowledge of Kubernetes Nodes with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is a Node in Kubernetes?

A) A Pod running on a server
B) A worker machine (VM or physical) that runs Pods
C) A container runtime
D) A network device

### 2. Which command shows all nodes in a cluster?

A) kubectl list nodes
B) kubectl get nodes
C) kubectl show nodes
D) kubectl nodes list

### 3. What are the main components running on every worker node?

A) API server and scheduler
B) kubelet, kube-proxy, and container runtime
C) etcd and controller manager
D) Only the container runtime

### 4. What is the purpose of kubelet?

A) To schedule Pods
B) To manage the API server
C) To ensure containers are running in Pods on the node
D) To store cluster data

### 5. What does the Ready condition indicate for a node?

A) The node has no Pods
B) The node is healthy and ready to accept Pods
C) The node is being drained
D) The node is offline

### 6. What is a taint on a node?

A) A label for organization
B) A property that repels Pods unless they have matching tolerations
C) An error state
D) A resource limit

### 7. How do you mark a node as unschedulable to prevent new Pods from being scheduled?

A) kubectl cordon node-name
B) kubectl taint node-name
C) kubectl disable node-name
D) kubectl stop node-name

### 8. What is the purpose of draining a node?

A) To delete the node
B) To evict Pods gracefully before maintenance
C) To remove taints
D) To clear node labels

### 9. Which node condition indicates disk pressure?

A) DiskFull
B) DiskPressure
C) OutOfDisk
D) LowDisk

### 10. What does kube-proxy do on each node?

A) Monitors node health
B) Runs the container runtime
C) Implements network rules for Service routing
D) Schedules Pods

---

## Answers

1. **B** - A Node is a worker machine (physical or virtual) in the Kubernetes cluster that runs Pods. The cluster consists of control plane and worker nodes.

2. **B** - `kubectl get nodes` lists all nodes. Add `-o wide` for additional details like IP addresses and container runtime versions.

3. **B** - Every worker node runs: kubelet (node agent), kube-proxy (network proxy), and a container runtime (Docker, containerd, CRI-O).

4. **C** - kubelet is the node agent that ensures containers described in PodSpecs are running and healthy. It communicates with the API server.

5. **B** - The Ready condition indicates the node is healthy and ready to accept new Pods. Other conditions include MemoryPressure, DiskPressure, PIDPressure.

6. **B** - A taint is a node property that repels Pods unless they have matching tolerations. Used to dedicate nodes to specific workloads or prevent scheduling during issues.

7. **A** - `kubectl cordon node-name` marks a node as unschedulable, preventing new Pods from being scheduled. `kubectl uncordon` reverses this.

8. **B** - `kubectl drain node-name` safely evicts all Pods from a node before maintenance, respecting PodDisruptionBudgets and graceful termination.

9. **B** - DiskPressure indicates the node's disk capacity is low. Other conditions: MemoryPressure, PIDPressure, NetworkUnavailable, Ready.

10. **C** - kube-proxy implements network rules (iptables/IPVS) on each node to enable Service networking, forwarding traffic to appropriate Pods.

---

## Study Resources

- [Lab README](README.md) - Node concepts and management
- [CKAD Requirements](CKAD.md) - CKAD node topics
- [Official Nodes Documentation](https://kubernetes.io/docs/concepts/architecture/nodes/)
