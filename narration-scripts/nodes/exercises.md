# Examining Nodes - Practical Demo
## Narration Script for Hands-On Exercises (12-15 minutes)

### Section 1: Basic Node Queries (3 min)
**[00:00-03:00]**

List nodes:
```bash
kubectl get nodes
```

Shows name, status, roles, age, version. Get more details:
```bash
kubectl get nodes -o wide
```

Adds IP addresses, OS, kernel, container runtime. Describe a node:
```bash
kubectl describe node <your-node-name>
```

Lots of information: labels, taints, capacity, allocatable, conditions, allocated resources, events.

Find node capacity:
```bash
kubectl describe node <name> | grep -A 5 Capacity
```

See how much CPU and memory the node has.

### Section 2: Understanding Node Information (3 min)
**[03:00-06:00]**

Check CPU capacity:
```bash
kubectl get node <name> -o jsonpath='{.status.capacity.cpu}'
```

Check memory:
```bash
kubectl get node <name> -o jsonpath='{.status.capacity.memory}'
```

Check container runtime:
```bash
kubectl get node <name> -o jsonpath='{.status.nodeInfo.containerRuntimeVersion}'
```

Check allocated resources:
```bash
kubectl describe node <name> | grep -A 10 "Allocated resources"
```

Shows percentage of CPU and memory allocated to Pods.

### Section 3: Working with Labels (3 min)
**[06:00-09:00]**

View all labels:
```bash
kubectl get nodes --show-labels
```

View specific labels as columns:
```bash
kubectl get nodes -L kubernetes.io/os,kubernetes.io/arch
```

Add a custom label:
```bash
kubectl label node <name> environment=production
kubectl label node <name> disktype=ssd
```

View the new label:
```bash
kubectl get nodes -L environment,disktype
```

Remove a label:
```bash
kubectl label node <name> disktype-
```

Labels critical for Pod scheduling with nodeSelector.

### Section 4: Output Formatting (2 min)
**[09:00-11:00]**

Get node info in YAML:
```bash
kubectl get node <name> -o yaml
```

Get in JSON:
```bash
kubectl get node <name> -o json
```

Use JSONPath for specific fields:
```bash
# Get OS
kubectl get node <name> -o jsonpath='{.status.nodeInfo.osImage}'

# Get CPU architecture
kubectl get node <name> -o jsonpath='{.metadata.labels.kubernetes\.io/arch}'
```

Note: Escape dots in label names for JSONPath.

### Section 5: Using kubectl explain (2 min)
**[11:00-13:00]**

Get node documentation:
```bash
kubectl explain node
```

Drill into fields:
```bash
kubectl explain node.status
kubectl explain node.status.capacity
kubectl explain node.status.conditions
```

See full structure:
```bash
kubectl explain node --recursive | less
```

This shows all available fields. Essential for understanding what information is available.

### Section 6: Lab Exercise (2 min)
**[13:00-15:00]**

Task: Find your node's labels showing CPU architecture and operating system.

Approach:
```bash
# Option 1: Show all labels
kubectl get nodes --show-labels | grep -E "arch|os"

# Option 2: Specific columns
kubectl get nodes -L kubernetes.io/os,kubernetes.io/arch

# Option 3: JSONPath
kubectl get node <name> -o jsonpath='{.metadata.labels.kubernetes\.io/arch}'
kubectl get node <name> -o jsonpath='{.metadata.labels.kubernetes\.io/os}'

# Option 4: YAML and grep
kubectl get node <name> -o yaml | grep -E "arch:|os:"
```

Summary: kubectl provides rich node information through get, describe, and various output formats. Master these commands for efficient cluster troubleshooting and CKAD exam success.
