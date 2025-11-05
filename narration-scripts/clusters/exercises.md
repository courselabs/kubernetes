# Kubernetes Clusters - Practical Demo
## Narration Script for Hands-On Exercises (12-15 minutes)

### Section 1: Creating Multi-Node Cluster (3 min)
**[00:00-03:00]**

Let's create a 3-node cluster with k3d:

```bash
k3d cluster create lab-clusters --servers 1 --agents 2 -p "30700-30799:30700-30799"
kubectl get nodes
kubectl get nodes -o wide
kubectl get nodes --show-labels
```

We have one control plane (server) and two workers (agents). Check node details:

```bash
kubectl describe node k3d-lab-clusters-agent-0
```

See capacity, allocatable resources, and conditions.

### Section 2: Taints and Tolerations (4 min)
**[03:00-07:00]**

Deploy whoami app across all nodes:

```bash
kubectl apply -f labs/clusters/specs/whoami
kubectl get pods -l app=whoami -o wide
```

Pods distributed across all nodes. Now taint a node:

```bash
kubectl taint nodes k3d-lab-clusters-agent-1 disk=hdd:NoSchedule
kubectl rollout restart deploy whoami
kubectl get pods -l app=whoami -o wide
```

No new Pods on agent-1 due to taint. Taint the control plane with NoExecute:

```bash
kubectl taint nodes k3d-lab-clusters-server-0 workload=system:NoExecute
kubectl get pods -l app=whoami -o wide
```

Pods on server get evicted immediately. Update deployment with toleration:

```bash
kubectl apply -f labs/clusters/specs/whoami/update
kubectl get pods -l app=whoami -o wide
```

Now Pods can schedule on agent-1.

### Section 3: Node Labels and Scheduling (3 min)
**[07:00-10:00]**

Add topology labels:

```bash
kubectl label node --all topology.kubernetes.io/region=lab
kubectl label node k3d-lab-clusters-server-0 topology.kubernetes.io/zone=lab-a
kubectl label node k3d-lab-clusters-agent-0 topology.kubernetes.io/zone=lab-a
kubectl label node k3d-lab-clusters-agent-1 topology.kubernetes.io/zone=lab-b
```

Deploy DaemonSet with node selector:

```bash
kubectl apply -f labs/clusters/specs/ingress-controller
kubectl get pods -n ingress-nginx -o wide
```

DaemonSet respects taints and node selectors.

### Section 4: Node Maintenance (3 min)
**[10:00-13:00]**

Cordon a node:

```bash
kubectl cordon k3d-lab-clusters-agent-1
kubectl get nodes
```

Status shows SchedulingDisabled. Drain the node:

```bash
kubectl drain k3d-lab-clusters-agent-1 --ignore-daemonsets --delete-emptydir-data
kubectl get pods -l app=whoami -o wide
```

Pods evicted and rescheduled. Uncordon:

```bash
kubectl uncordon k3d-lab-clusters-agent-1
kubectl get nodes
```

Node available again. Cleanup:

```bash
k3d cluster delete lab-clusters
```
