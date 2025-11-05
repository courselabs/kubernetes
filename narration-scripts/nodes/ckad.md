# Examining Nodes - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-18 minutes)

### Section 1: CKAD Node Query Requirements (2 min)
**[00:00-02:00]**

CKAD tests your ability to query cluster state efficiently. Node operations appear in troubleshooting scenarios.

Essential commands (memorize these):
```bash
kubectl get nodes
kubectl get nodes -o wide
kubectl describe node <name>
kubectl get nodes --show-labels
kubectl get nodes -L <label-key>
kubectl top nodes  # Requires metrics-server
```

Time target: Answer any node query in <30 seconds.

### Section 2: Quick Node Information Lookup (3 min)
**[02:00-05:00]**

**Find node capacity**:
```bash
kubectl describe node <name> | grep Capacity -A 5
```

**Find CPU count**:
```bash
kubectl get node <name> -o jsonpath='{.status.capacity.cpu}'
```

**Find memory**:
```bash
kubectl get node <name> -o jsonpath='{.status.capacity.memory}'
```

**Find container runtime**:
```bash
kubectl get node <name> -o jsonpath='{.status.nodeInfo.containerRuntimeVersion}'
```

**Find OS/arch**:
```bash
kubectl get nodes -L kubernetes.io/os,kubernetes.io/arch
```

Practice until you can run these without thinking.

### Section 3: Node Labels for Scheduling (3 min)
**[05:00-08:00]**

Labels critical for Pod placement.

**View labels**:
```bash
kubectl get nodes --show-labels
kubectl get nodes -L environment,disktype,gpu
```

**Add label**:
```bash
kubectl label node worker-1 disktype=ssd
kubectl label node worker-1 gpu=nvidia-t4
```

**Update label** (requires --overwrite):
```bash
kubectl label node worker-1 environment=staging --overwrite
```

**Remove label**:
```bash
kubectl label node worker-1 gpu-
```

**Find nodes with label**:
```bash
kubectl get nodes -l disktype=ssd
kubectl get nodes -l 'environment in (prod,staging)'
```

Use in Pod spec:
```yaml
spec:
  nodeSelector:
    disktype: ssd
```

### Section 4: Troubleshooting with Node Information (3 min)
**[08:00-11:00]**

**Scenario: Pod stuck in Pending**

Check node capacity:
```bash
kubectl describe node <name> | grep -A 10 "Allocated resources"
```

Shows CPU/memory usage percentages. If at 100%, node is full.

Check node conditions:
```bash
kubectl describe node <name> | grep Conditions -A 5
```

Look for MemoryPressure, DiskPressure, or Ready=False.

Check if nodes match selectors:
```bash
# Pod requires disktype=ssd
kubectl get nodes -l disktype=ssd
# If empty, no nodes match
```

Check node taints:
```bash
kubectl describe node <name> | grep Taints
```

### Section 5: Output Formatting for Speed (2 min)
**[11:00-13:00]**

JSONPath for quick answers:
```bash
# All node names
kubectl get nodes -o name

# All node IPs
kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'

# Nodes with their OS
kubectl get nodes -o custom-columns=NAME:.metadata.name,OS:.status.nodeInfo.osImage
```

Custom columns:
```bash
kubectl get nodes -o custom-columns=\
NAME:.metadata.name,\
CPU:.status.capacity.cpu,\
MEMORY:.status.capacity.memory
```

Saves time in exam scenarios requiring specific node information.

### Section 6: Common Exam Patterns (3 min)
**[13:00-16:00]**

**Pattern 1**: Find nodes with specific label
```bash
kubectl get nodes -l disktype=ssd
```

**Pattern 2**: Label a node
```bash
kubectl label node worker-1 app=database
```

**Pattern 3**: Find node capacity
```bash
kubectl describe node worker-1 | grep Capacity -A 5
```

**Pattern 4**: Check if node ready
```bash
kubectl get nodes
# Look for Ready status
```

**Pattern 5**: Find which nodes are schedulable
```bash
kubectl get nodes
# SchedulingDisabled means cordoned
```

### Section 7: Exam Tips (2 min)
**[16:00-18:00]**

**Speed tips**:
- Use short commands: `kubectl get no` (alias for nodes)
- Tab completion for node names
- Pipe to grep for specific info
- Remember JSONPath patterns for complex queries

**Common mistakes**:
- Forgetting quotes in -L with slashes: `-L 'kubernetes.io/arch'`
- Not checking node status before troubleshooting Pods
- Typing full commands when aliases work

**Practice drill**: 
1. List nodes (<5 sec)
2. Find CPU capacity (<15 sec)
3. Check node labels (<10 sec)
4. Label a node (<10 sec)
5. Find nodes with specific label (<15 sec)

Total: <60 seconds for all operations.

**Checklist**:
- [ ] Can list nodes quickly
- [ ] Can find node capacity
- [ ] Can view and add labels
- [ ] Can use JSONPath for queries
- [ ] Can use describe for troubleshooting
- [ ] Know standard node labels

Master these, and node operations won't slow you down in the exam.
