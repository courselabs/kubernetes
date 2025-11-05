# Examining Nodes with Kubectl - Concept Introduction
## Narration Script for Slideshow (8-10 minutes)

### Slide 1: Introduction (1 min)
**[00:00-01:00]**

Welcome to examining Kubernetes nodes with kubectl - a core CKAD skill. Nodes are the machines running your containers.

Topics: kubectl basics, querying nodes, understanding node information, labels, resource capacity, formatting output.

Essential for troubleshooting and cluster understanding.

### Slide 2: What are Nodes (1 min)
**[01:00-02:00]**

Nodes are worker machines (physical servers, VMs, cloud instances) that run containers in Kubernetes clusters.

Each node runs:
- kubelet: Manages containers
- Container runtime: Docker, containerd, CRI-O
- kube-proxy: Network proxy

Kubernetes stores node information in its database, queryable via kubectl.

### Slide 3: Basic Node Commands (1 min)
**[02:00-03:00]**

Essential commands:
```bash
kubectl get nodes  # List all nodes
kubectl get nodes -o wide  # More details
kubectl describe nodes  # Detailed info
kubectl describe node <name>  # Specific node
```

get shows summary, describe shows detailed information including events, capacity, and conditions.

### Slide 4: Node Status and Conditions (1 min)
**[03:00-04:00]**

Node status conditions:
- **Ready**: Node is healthy and ready for Pods
- **MemoryPressure**: Node is low on memory
- **DiskPressure**: Node is low on disk space
- **PIDPressure**: Too many processes running
- **NetworkUnavailable**: Network not configured

Check with:
```bash
kubectl get nodes
kubectl describe node <name> | grep Conditions -A 5
```

Ready status means node can accept workloads.

### Slide 5: Node Capacity and Allocatable (1 min)
**[04:00-05:00]**

**Capacity**: Total resources on node (CPU, memory)
**Allocatable**: Available for Pods (capacity minus system reserved)

Example:
```
Capacity:
  cpu: 4
  memory: 16Gi
Allocatable:
  cpu: 3800m
  memory: 15Gi
```

System components reserve some resources. Pods can only use allocatable amount.

### Slide 6: Node Labels (1 min)
**[05:00-06:00]**

Labels are key-value pairs providing node metadata.

Standard labels:
- `kubernetes.io/hostname`: Node name
- `kubernetes.io/os`: Operating system
- `kubernetes.io/arch`: CPU architecture
- `topology.kubernetes.io/zone`: Availability zone

View labels:
```bash
kubectl get nodes --show-labels
kubectl get nodes -L os,arch
```

Labels used for Pod scheduling with nodeSelector or affinity.

### Slide 7: Kubectl Output Formatting (1 min)
**[06:00-07:00]**

Output formats:
```bash
kubectl get nodes  # Table (default)
kubectl get nodes -o wide  # Extended table
kubectl get nodes -o yaml  # YAML format
kubectl get nodes -o json  # JSON format
kubectl get nodes -o name  # Just names
```

JSONPath for specific fields:
```bash
kubectl get node <name> -o jsonpath='{.status.capacity.cpu}'
kubectl get node <name> -o jsonpath='{.status.nodeInfo.containerRuntimeVersion}'
```

Useful for scripting and automation.

### Slide 8: kubectl explain (1 min)
**[07:00-08:00]**

Get documentation on resources:
```bash
kubectl explain node
kubectl explain node.status
kubectl explain node.status.capacity
```

Shows field descriptions and types. Works offline, doesn't need internet or documentation access.

Invaluable for CKAD exam to understand resource structure.

### Slide 9: Common Node Operations (1 min)
**[08:00-09:00]**

Label a node:
```bash
kubectl label node <name> key=value
```

Taint a node:
```bash
kubectl taint node <name> key=value:NoSchedule
```

Cordon/drain for maintenance:
```bash
kubectl cordon <name>  # Mark unschedulable
kubectl drain <name>  # Evict Pods
kubectl uncordon <name>  # Re-enable
```

Essential for node management.

### Slide 10: Summary (1 min)
**[09:00-10:00]**

Key skills: Query nodes with get/describe, understand capacity vs allocatable, read node labels, format output with -o and jsonpath, use explain for documentation.

For CKAD: Master kubectl node commands, quickly find information, troubleshoot scheduling issues by checking node capacity and labels.

Commands to remember: `kubectl get nodes`, `kubectl describe node`, `kubectl get nodes --show-labels`, `kubectl explain node`.
