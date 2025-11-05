# Kubernetes Clusters - Concept Introduction
## Narration Script for Slideshow (8-10 minutes)

### Slide 1: Introduction (1 min)
**[00:00-01:00]**

Welcome to Kubernetes Clusters. This session covers multi-node cluster architecture, components, and setup options. While cluster setup is beyond CKAD scope, understanding architecture helps with troubleshooting and operations.

Topics: Control plane vs worker nodes, cluster components, taints and tolerations, node maintenance, multi-node considerations.

### Slide 2: Single vs Multi-Node Clusters (1 min)
**[01:00-02:00]**

Single-node clusters (Docker Desktop, Minikube) are fine for learning, but production requires multi-node for high availability and scale.

Typical production cluster: 3+ control plane nodes (for HA), 10-100+ worker nodes (for capacity). Control plane runs Kubernetes components, workers run your applications.

### Slide 3: Control Plane Components (1 min)
**[02:00-03:00]**

Control plane runs:
- **API Server**: Front-end for Kubernetes, handles all API requests
- **etcd**: Distributed key-value store, cluster database
- **Scheduler**: Assigns Pods to nodes
- **Controller Manager**: Runs controllers (Deployment, ReplicaSet, etc.)
- **Cloud Controller Manager**: Integrates with cloud providers

These components are typically replicated across 3 or 5 nodes for fault tolerance.

### Slide 4: Worker Node Components (1 min)
**[03:00-04:00]**

Each worker node runs:
- **kubelet**: Agent that manages Pods on the node
- **Container runtime**: Docker, containerd, or CRI-O
- **kube-proxy**: Network proxy for Services

Workers execute the actual workload - your Pods run here. Nodes can be physical servers, VMs, or cloud instances.

### Slide 5: Taints and Tolerations (1 min)
**[04:00-05:00]**

**Taints** mark nodes as special - they repel Pods unless the Pod tolerates the taint.

Format: `key=value:Effect`

Effects: NoSchedule (no new Pods), PreferNoSchedule (avoid if possible), NoExecute (evict existing Pods).

**Tolerations** on Pods allow scheduling on tainted nodes. Control plane nodes are typically tainted to prevent user workloads.

### Slide 6: Node Labels and Selectors (1 min)
**[05:00-06:00]**

Standard labels applied automatically:
- `kubernetes.io/hostname`: node name
- `kubernetes.io/os`: linux or windows
- `kubernetes.io/arch`: amd64, arm64, etc.
- `topology.kubernetes.io/zone`: availability zone
- `topology.kubernetes.io/region`: cloud region

Use nodeSelector or affinity to place Pods on specific nodes. Custom labels for hardware types (ssd, gpu, etc.).

### Slide 7: Cluster Setup Options (1 min)
**[06:00-07:00]**

**Kubeadm**: Manual cluster setup on VMs or bare metal
**Managed services**: AKS (Azure), EKS (AWS), GKE (Google)
**Local dev**: Docker Desktop, k3d, Kind, Minikube

For CKAD: Focus on kubectl commands, not cluster setup. Know the architecture and how to query cluster state.

### Slide 8: API Version Compatibility (1 min)
**[07:00-08:00]**

Different Kubernetes versions support different API versions. Upgrading clusters may break old manifests.

Always check Kubernetes deprecation guide before upgrades. Test applications against new versions in staging before production.

k3d useful for testing different Kubernetes versions locally.

### Slide 9: Node Maintenance (1 min)
**[08:00-09:00]**

**Cordon**: Mark node unschedulable (`kubectl cordon`)
**Drain**: Evict all Pods gracefully (`kubectl drain --ignore-daemonsets`)
**Uncordon**: Re-enable scheduling (`kubectl uncordon`)

Workflow: Cordon → Drain → Maintenance → Uncordon

Pods don't automatically rebalance after uncordon - they stay where rescheduled.

### Slide 10: Summary (1 min)
**[09:00-10:00]**

Key concepts: Control plane vs workers, taints/tolerations for node isolation, labels for Pod placement, maintenance with cordon/drain.

For CKAD: Know how to query node information, understand why Pods don't schedule, perform basic node maintenance.

Commands to remember: `kubectl get nodes`, `kubectl describe node`, `kubectl cordon/drain/uncordon`, `kubectl label node`.
