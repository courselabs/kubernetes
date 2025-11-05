# Kubernetes Clusters - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-20 minutes)

### Section 1: CKAD Node Operations (3 min)
**[00:00-03:00]**

CKAD tests node querying and basic maintenance, not cluster setup.

Essential commands:
```bash
kubectl get nodes
kubectl describe node <name>
kubectl get nodes --show-labels
kubectl get nodes -L disktype,zone
kubectl top nodes  # Requires metrics-server
```

Node information you need: capacity, allocatable, conditions, labels, taints.

### Section 2: Taints and Tolerations (4 min)
**[03:00-07:00]**

Add taint:
```bash
kubectl taint node worker-1 dedicated=gpu:NoSchedule
```

Remove taint:
```bash
kubectl taint node worker-1 dedicated=gpu:NoSchedule-
```

Toleration in Pod spec:
```yaml
spec:
  tolerations:
  - key: "dedicated"
    operator: "Equal"
    value: "gpu"
    effect: "NoSchedule"
```

Tolerate any value:
```yaml
tolerations:
- key: "dedicated"
  operator: "Exists"
  effect: "NoSchedule"
```

### Section 3: Node Maintenance Workflow (3 min)
**[07:00-10:00]**

Complete workflow:
```bash
# 1. Cordon
kubectl cordon worker-1

# 2. Check what will be evicted
kubectl get pods -o wide --all-namespaces | grep worker-1

# 3. Drain
kubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data

# 4. Perform maintenance
# ... do your work ...

# 5. Uncordon
kubectl uncordon worker-1
```

Common drain flags:
- `--ignore-daemonsets`: Required for DaemonSet Pods
- `--delete-emptydir-data`: Delete Pods with emptyDir
- `--force`: Force deletion (use carefully)
- `--grace-period=N`: Wait time before force kill

### Section 4: Node Labels and Selectors (3 min)
**[10:00-13:00]**

Add labels:
```bash
kubectl label node worker-1 disktype=ssd
kubectl label node worker-1 disktype=nvme --overwrite
kubectl label node worker-1 disktype-  # Remove
```

NodeSelector in Pod:
```yaml
spec:
  nodeSelector:
    disktype: ssd
```

Standard labels:
- `kubernetes.io/hostname`
- `kubernetes.io/os` (linux/windows)
- `kubernetes.io/arch` (amd64/arm64)
- `topology.kubernetes.io/zone`
- `topology.kubernetes.io/region`

### Section 5: Troubleshooting Node Issues (3 min)
**[13:00-16:00]**

Pod Pending due to node issues:

```bash
# Check events
kubectl describe pod <name>

# Common messages:
# "0/3 nodes available: 3 node(s) didn't match node selector"
# "0/3 nodes available: 3 Insufficient cpu"
# "0/3 nodes available: 3 node(s) had taints that pod didn't tolerate"

# Debug steps:
kubectl get nodes
kubectl describe node <node>  # Check capacity, taints
kubectl get nodes -l your-label=value  # Verify labels exist
```

### Section 6: Exam Practice Scenarios (2 min)
**[16:00-18:00]**

**Scenario 1**: Label a node and deploy Pods there.
```bash
kubectl label node worker-1 app=database
kubectl run db --image=postgres --dry-run=client -o yaml > db.yaml
# Add nodeSelector: app=database
kubectl apply -f db.yaml
```

**Scenario 2**: Drain a node for maintenance.
```bash
kubectl cordon worker-1
kubectl drain worker-1 --ignore-daemonsets
# Wait...
kubectl uncordon worker-1
```

**Scenario 3**: Fix Pod that won't schedule due to taint.
```bash
kubectl describe pod <name>  # See taint error
# Add toleration to Pod spec
```

### Section 7: Exam Tips (2 min)
**[18:00-20:00]**

Time management: Node operations should take <3 minutes.

Quick reference:
```bash
# Info
kubectl get nodes
kubectl describe node <name>

# Labels
kubectl label node <name> key=value
kubectl get nodes -L key

# Taints
kubectl taint node <name> key=value:Effect
kubectl taint node <name> key:Effect-  # Remove

# Maintenance
kubectl cordon/drain/uncordon <name>
```

Common mistakes:
- Forgetting --ignore-daemonsets on drain
- Not checking nodes before troubleshooting Pods
- Confusing taints (node) with tolerations (Pod)

Practice until these commands are muscle memory!
