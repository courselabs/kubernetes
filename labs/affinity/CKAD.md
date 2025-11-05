# CKAD Exam Preparation: Pod Scheduling with Affinity

This document covers pod scheduling and affinity topics required for the Certified Kubernetes Application Developer (CKAD) exam. Complete the [basic affinity lab](README.md) first to understand node and pod affinity patterns.

## Prerequisites

Before starting this lab, you should be familiar with:
- Pod and Deployment basics
- Node labels and selectors
- Basic scheduling concepts
- Taints and tolerations (helpful but not required)

## CKAD Affinity Topics Covered

- Node affinity (required and preferred rules)
- Pod affinity and anti-affinity
- Topology keys and node labels
- Required vs preferred scheduling
- Affinity operators and expressions
- Combining multiple affinity rules
- Troubleshooting scheduling issues
- Common CKAD exam scenarios
- Quick patterns for exam speed

## Node Affinity Basics

### What is Node Affinity?

Node affinity allows you to constrain which nodes your Pods can be scheduled on based on node labels.

**Key Concepts:**
- **Required** (`requiredDuringSchedulingIgnoredDuringExecution`): Hard constraint - Pod won't schedule if not met
- **Preferred** (`preferredDuringSchedulingIgnoredDuringExecution`): Soft preference - Pod schedules anyway if not met

📋 **CKAD Tip**: "IgnoredDuringExecution" means running Pods aren't evicted if rules change.

### Required Node Affinity

Schedule Pods only on nodes matching specific criteria:

**TODO**: Create example `specs/ckad/node-affinity-required.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-node-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
  containers:
  - name: app
    image: nginx
```

**Operators:**
- `In`: Label value must be in the list
- `NotIn`: Label value must not be in the list
- `Exists`: Label key must exist (value doesn't matter)
- `DoesNotExist`: Label key must not exist
- `Gt`: Label value greater than (numeric comparison)
- `Lt`: Label value less than (numeric comparison)

📋 **CKAD Critical**: Know all operators and when to use each one.

### Preferred Node Affinity

Soft preference with weight (1-100):

**TODO**: Create example `specs/ckad/node-affinity-preferred.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-node-preference
spec:
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 80
        preference:
          matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
      - weight: 20
        preference:
          matchExpressions:
          - key: network
            operator: In
            values:
            - fast
  containers:
  - name: app
    image: nginx
```

**Weight Rules:**
- Higher weight = higher priority
- Scheduler calculates scores for each node
- Node with highest total score wins

### Combining Required and Preferred

Most common pattern in production:

**TODO**: Create example `specs/ckad/node-affinity-combined.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: combined-affinity
spec:
  affinity:
    nodeAffinity:
      # MUST run on Linux nodes
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/os
            operator: In
            values:
            - linux
      # PREFER nodes with SSD
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
  containers:
  - name: app
    image: nginx
```

📋 **CKAD Pattern**: Use required for must-haves, preferred for nice-to-haves.

### Multiple MatchExpressions

All expressions in a nodeSelectorTerm must match (AND logic):

```yaml
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
    - matchExpressions:
      - key: disktype
        operator: In
        values:
        - ssd
      - key: zone
        operator: In
        values:
        - us-west-1a
        - us-west-1b
```

This means: Node must have `disktype=ssd` AND zone in (us-west-1a or us-west-1b)

### Multiple NodeSelectorTerms

Any nodeSelectorTerm can match (OR logic):

```yaml
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
    # Option 1: SSD in zone A
    - matchExpressions:
      - key: disktype
        operator: In
        values: [ssd]
      - key: zone
        operator: In
        values: [zone-a]
    # Option 2: HDD in zone B
    - matchExpressions:
      - key: disktype
        operator: In
        values: [hdd]
      - key: zone
        operator: In
        values: [zone-b]
```

This means: (disktype=ssd AND zone=zone-a) OR (disktype=hdd AND zone=zone-b)

📋 **CKAD Exam**: Understanding AND/OR logic is critical for complex affinity rules.

## Standard Node Labels

Kubernetes automatically adds these labels to all nodes:

```bash
# Check node labels
kubectl get nodes --show-labels

# Common standard labels:
kubernetes.io/arch=amd64               # CPU architecture
kubernetes.io/os=linux                 # Operating system
kubernetes.io/hostname=node1           # Node hostname
topology.kubernetes.io/region=us-west  # Cloud region
topology.kubernetes.io/zone=us-west-1a # Availability zone
node-role.kubernetes.io/control-plane  # Control plane node
node.kubernetes.io/instance-type=t3.large  # Instance type (cloud)
```

📋 **CKAD Quick Reference**: Use these labels for common affinity scenarios.

### Example: Avoid Control Plane Nodes

```yaml
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
    - matchExpressions:
      - key: node-role.kubernetes.io/control-plane
        operator: DoesNotExist
```

### Example: Specific Region/Zone

```yaml
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
    - matchExpressions:
      - key: topology.kubernetes.io/region
        operator: In
        values:
        - us-west
      - key: topology.kubernetes.io/zone
        operator: In
        values:
        - us-west-1a
        - us-west-1b
```

**TODO**: Create examples for common node label patterns

## Pod Affinity and Anti-Affinity

### Pod Affinity Basics

Schedule Pods near other Pods (co-location):

**TODO**: Create example `specs/ckad/pod-affinity-basic.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-pod-affinity
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - cache
        topologyKey: kubernetes.io/hostname
  containers:
  - name: app
    image: nginx
```

**What this means:**
- Schedule this Pod on a node where Pods with label `app=cache` are running
- `topologyKey: kubernetes.io/hostname` means "same node"

### Pod Anti-Affinity Basics

Schedule Pods away from other Pods (spreading):

**TODO**: Create example `specs/ckad/pod-anti-affinity-basic.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-pod-anti-affinity
  labels:
    app: web
spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - web
        topologyKey: kubernetes.io/hostname
  containers:
  - name: app
    image: nginx
```

**What this means:**
- Don't schedule this Pod on nodes where Pods with label `app=web` are running
- Ensures each web Pod runs on a different node (high availability)

### Topology Keys

The topology key defines the "scope" of affinity:

**Common Topology Keys:**

```yaml
# Same node (co-locate on exact same host)
topologyKey: kubernetes.io/hostname

# Same zone (within same availability zone)
topologyKey: topology.kubernetes.io/zone

# Same region (within same cloud region)
topologyKey: topology.kubernetes.io/region
```

📋 **CKAD Pattern**:
- Use `hostname` for strict co-location/anti-co-location
- Use `zone` for availability zone spreading
- Use `region` for regional grouping

### Preferred Pod Affinity

Soft preference with weights:

**TODO**: Create example `specs/ckad/pod-affinity-preferred.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: preferred-pod-affinity
spec:
  affinity:
    podAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - cache
          topologyKey: kubernetes.io/hostname
  containers:
  - name: app
    image: nginx
```

**What this means:**
- Prefer to run near Pods with `app=cache`
- But it's OK if we can't

## Common Affinity Patterns

### Pattern 1: High Availability (Spread Across Zones)

Ensure pods run in different availability zones:

**TODO**: Create example `specs/ckad/patterns/ha-spread-zones.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-ha
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchLabels:
                  app: web
              topologyKey: topology.kubernetes.io/zone
      containers:
      - name: web
        image: nginx
```

📋 **CKAD Use Case**: Multi-zone deployments for high availability.

### Pattern 2: Co-locate App with Cache

Run application pods near cache pods:

**TODO**: Create example `specs/ckad/patterns/colocate-cache.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-cache
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: redis-cache
        topologyKey: kubernetes.io/hostname
  containers:
  - name: app
    image: myapp:1.0
```

📋 **CKAD Use Case**: Performance optimization by co-locating dependent services.

### Pattern 3: Spread Replicas Across Nodes

Ensure no two replicas run on same node:

**TODO**: Create example `specs/ckad/patterns/spread-replicas.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 5
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchLabels:
                app: api
            topologyKey: kubernetes.io/hostname
      containers:
      - name: api
        image: api:1.0
```

⚠️ **Warning**: With required anti-affinity, pods may stay pending if there aren't enough nodes.

### Pattern 4: Regional Affinity with Zone Spreading

Stay in one region but spread across zones:

**TODO**: Create example `specs/ckad/patterns/region-with-zone-spread.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 6
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      affinity:
        # Must be in us-west region
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: topology.kubernetes.io/region
                operator: In
                values:
                - us-west
        # Prefer spreading across zones
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchLabels:
                  app: web
              topologyKey: topology.kubernetes.io/zone
      containers:
      - name: web
        image: nginx
```

📋 **CKAD Pattern**: Combine node + pod affinity for complex requirements.

### Pattern 5: Avoid Noisy Neighbors

Keep your app away from resource-intensive apps:

**TODO**: Create example `specs/ckad/patterns/avoid-noisy.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: latency-sensitive-app
spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: workload-type
            operator: In
            values:
            - batch
            - ml-training
        topologyKey: kubernetes.io/hostname
  containers:
  - name: app
    image: latency-app:1.0
```

## Troubleshooting Affinity Issues

### Issue 1: Pods Stuck in Pending

**Symptom**: Pod status shows `Pending`

**Debugging Steps:**

```bash
# Check pod status
kubectl get pod <pod-name>

# Check events for scheduling failures
kubectl describe pod <pod-name>

# Look for messages like:
# "0/3 nodes are available: 3 node(s) didn't match Pod's node affinity/selector"
```

**Common Causes:**

1. **No nodes match required affinity**
```bash
# Check node labels
kubectl get nodes --show-labels

# Check if any node has required labels
kubectl get nodes -l disktype=ssd
```

2. **Anti-affinity preventing scheduling**
```bash
# Check how many replicas are running
kubectl get pods -l app=myapp -o wide

# Check if they're on all available nodes
kubectl get nodes
```

**Solutions:**

```bash
# Option 1: Add required label to a node
kubectl label node worker-1 disktype=ssd

# Option 2: Change required to preferred
# Edit the deployment YAML and change:
# requiredDuringSchedulingIgnoredDuringExecution
# to:
# preferredDuringSchedulingIgnoredDuringExecution

# Option 3: Remove affinity rules temporarily
kubectl edit deployment myapp
# Remove or comment out affinity section
```

**TODO**: Create broken example for practice: `specs/ckad/troubleshooting/pending-affinity.yaml`

### Issue 2: Uneven Pod Distribution

**Symptom**: All pods on one node despite spread preferences

**Cause**: Using preferred (not required) anti-affinity

**Solution**:

```yaml
# Change from preferred to required for strict spreading
podAntiAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:  # Changed from preferred
  - labelSelector:
      matchLabels:
        app: myapp
    topologyKey: kubernetes.io/hostname
```

### Issue 3: Pods Not Co-locating

**Symptom**: Pods that should be together are on different nodes

**Debugging:**

```bash
# Check if target pods exist
kubectl get pods -l app=target-app

# Check which nodes they're on
kubectl get pods -l app=target-app -o wide

# Check affinity rules
kubectl get pod <pod-name> -o yaml | grep -A 20 affinity
```

**Common Mistakes:**

1. Wrong label selector
2. Wrong topology key
3. Target pods don't exist yet

### Issue 4: Node Affinity Not Working

**Debugging:**

```bash
# Verify node has required label
kubectl get nodes -L disktype

# Check exact label value
kubectl get node <node-name> -o jsonpath='{.metadata.labels}'

# Common issues:
# - Label value mismatch (case-sensitive)
# - Operator wrong (In vs Exists)
# - Label key typo
```

## CKAD Lab Exercises

### Exercise 1: Basic Node Affinity

Create a deployment that:
1. Must run on Linux nodes
2. Prefers nodes with `disktype=ssd` label
3. Has 3 replicas

**TODO**: Create in `specs/ckad/exercises/ex1-node-affinity/`

### Exercise 2: Pod Anti-Affinity for HA

Create a deployment that:
1. Runs 5 replicas
2. Each replica must run on a different node
3. If fewer than 5 nodes, some pods should stay pending

**TODO**: Create in `specs/ckad/exercises/ex2-anti-affinity/`

### Exercise 3: Co-locate with Cache

Given:
- A redis cache deployment with label `app=cache`

Create an application deployment that:
- Runs on the same nodes as redis pods
- Has 3 replicas

**TODO**: Create in `specs/ckad/exercises/ex3-colocate/`

### Exercise 4: Zone Spreading

Create a deployment that:
1. Must stay in region `us-west`
2. Prefers spreading across zones
3. Has 6 replicas

**TODO**: Create in `specs/ckad/exercises/ex4-zone-spread/`

### Exercise 5: Troubleshoot Pending Pods

Given a broken deployment with pods in pending state:
1. Identify why pods aren't scheduling
2. Fix the affinity rules
3. Verify pods start running

**TODO**: Create in `specs/ckad/exercises/ex5-troubleshoot/`

## Common CKAD Exam Scenarios

### Scenario 1: Schedule on Specific Node Type

"Create a deployment 'web' with 3 replicas that only runs on nodes with label `node-type=compute`"

```bash
# Quick imperative approach:
kubectl create deployment web --image=nginx --replicas=3 --dry-run=client -o yaml > web.yaml

# Then edit web.yaml to add:
```

```yaml
spec:
  template:
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: node-type
                operator: In
                values:
                - compute
```

```bash
kubectl apply -f web.yaml
```

### Scenario 2: Spread Across Zones

"Configure deployment 'api' so replicas prefer to run in different availability zones"

```yaml
# Add to deployment spec:
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchLabels:
            app: api
        topologyKey: topology.kubernetes.io/zone
```

### Scenario 3: Co-locate Pods

"Run pod 'worker' on the same node as pods with label `app=database`"

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: worker
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: database
        topologyKey: kubernetes.io/hostname
  containers:
  - name: worker
    image: worker:1.0
```

### Scenario 4: Avoid Control Plane

"Ensure deployment 'app' never runs on control plane nodes"

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: node-role.kubernetes.io/control-plane
          operator: DoesNotExist
```

### Scenario 5: Debug Pending Pod

"A pod is stuck in Pending state. Debug and fix the affinity issue."

```bash
# 1. Check status
kubectl describe pod <pod-name>

# 2. Look for scheduling errors in events
# Example: "0/3 nodes available: node(s) didn't match affinity"

# 3. Check node labels
kubectl get nodes --show-labels

# 4. Fix by either:
# - Adding required label to node
# - Modifying affinity rule
# - Changing required to preferred
```

## Quick Command Reference for CKAD

### Check Node Labels

```bash
# Show all node labels
kubectl get nodes --show-labels

# Show specific labels
kubectl get nodes -L disktype,zone

# Show nodes with specific label
kubectl get nodes -l disktype=ssd
```

### Add/Remove Node Labels

```bash
# Add label
kubectl label node <node-name> <key>=<value>
kubectl label node worker-1 disktype=ssd

# Remove label (add - suffix)
kubectl label node <node-name> <key>-
kubectl label node worker-1 disktype-

# Update existing label (--overwrite)
kubectl label node <node-name> <key>=<value> --overwrite
```

### Check Pod Placement

```bash
# See which node each pod is on
kubectl get pods -o wide

# Show pods on specific node
kubectl get pods --field-selector spec.nodeName=worker-1

# Check pod affinity rules
kubectl get pod <pod-name> -o yaml | grep -A 30 affinity
```

### Generate YAML Template

```bash
# Create deployment and output YAML
kubectl create deployment web --image=nginx --replicas=3 --dry-run=client -o yaml > web.yaml

# Then edit web.yaml to add affinity rules
```

### Useful Debugging Commands

```bash
# Check why pod isn't scheduling
kubectl describe pod <pod-name> | grep -A 5 Events

# Get pod scheduling info
kubectl get events --sort-by='.lastTimestamp' | grep <pod-name>

# Check node capacity
kubectl describe node <node-name> | grep -A 5 Capacity

# Count pods per node
kubectl get pods -o wide --all-namespaces | awk '{print $8}' | sort | uniq -c
```

## Exam Tips and Tricks

### Speed Tips

1. **Use imperative commands** to generate base YAML:
   ```bash
   kubectl create deployment web --image=nginx --dry-run=client -o yaml > deploy.yaml
   ```

2. **Use kubectl explain** for syntax:
   ```bash
   kubectl explain pod.spec.affinity
   kubectl explain pod.spec.affinity.nodeAffinity
   kubectl explain pod.spec.affinity.podAffinity
   ```

3. **Copy-paste affinity blocks** from existing resources:
   ```bash
   kubectl get deployment example -o yaml | grep -A 20 affinity
   ```

### Common Mistakes to Avoid

1. ❌ Forgetting `nodeSelectorTerms` wrapper
   ```yaml
   # Wrong
   nodeAffinity:
     requiredDuringSchedulingIgnoredDuringExecution:
       matchExpressions:
       - key: disktype

   # Correct
   nodeAffinity:
     requiredDuringSchedulingIgnoredDuringExecution:
       nodeSelectorTerms:  # Don't forget this!
       - matchExpressions:
         - key: disktype
   ```

2. ❌ Using `matchLabels` with `In` operator
   ```yaml
   # Redundant
   matchExpressions:
   - key: app
     operator: In
     values: [web]

   # Simpler (when single value)
   matchLabels:
     app: web
   ```

3. ❌ Wrong topology key
   ```yaml
   # If you want same node, use:
   topologyKey: kubernetes.io/hostname

   # Not:
   topologyKey: kubernetes.io/zone  # This is for same zone
   ```

4. ❌ Case sensitivity in labels
   ```bash
   # Labels are case-sensitive!
   diskType=ssd  # Not the same as
   disktype=ssd  # This one
   ```

5. ❌ Required anti-affinity with too many replicas
   ```yaml
   # If you have 3 nodes and 5 replicas with required anti-affinity
   # 2 pods will stay pending!
   # Use preferred instead if you want all pods running
   ```

### Time-Saving Patterns

```bash
# Quick label node
kubectl label node worker-1 app=cache --overwrite

# Quick check if pod can schedule
kubectl describe pod <pod-name> | tail -10

# Generate and edit in one go
kubectl create deployment web --image=nginx --dry-run=client -o yaml | \
  kubectl apply -f -

# Find nodes with label
kubectl get nodes -l disktype=ssd -o name
```

## Affinity Decision Tree

```
Need to control where pods run?
│
├─ Based on NODE properties?
│  └─ Use NODE AFFINITY
│     ├─ Must run on specific nodes? → requiredDuringScheduling
│     └─ Prefer specific nodes? → preferredDuringScheduling
│
└─ Based on OTHER PODS?
   ├─ Want pods TOGETHER? → Use POD AFFINITY
   └─ Want pods APART? → Use POD ANTI-AFFINITY
      ├─ Must be apart? → requiredDuringScheduling
      └─ Prefer apart? → preferredDuringScheduling
```

## Checklist for CKAD

- [ ] Understand required vs preferred affinity
- [ ] Know all affinity operators (In, NotIn, Exists, DoesNotExist, Gt, Lt)
- [ ] Use node affinity to control node placement
- [ ] Use pod affinity for co-location
- [ ] Use pod anti-affinity for spreading
- [ ] Understand topology keys (hostname, zone, region)
- [ ] Know standard node labels (os, arch, hostname, zone, region)
- [ ] Combine node and pod affinity
- [ ] Debug pending pods due to affinity
- [ ] Use weights for preferred rules
- [ ] Label nodes imperatively
- [ ] Generate deployment YAML quickly

## Additional Resources

- [Affinity and Anti-Affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)
- [Assign Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)
- [Pod Topology Spread Constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)
- [Well-Known Labels, Annotations and Taints](https://kubernetes.io/docs/reference/labels-annotations-taints/)

## Cleanup

```bash
kubectl delete all -l kubernetes.courselabs.co=affinity-ckad
```

---

> Return to [affinity lab](README.md) | Check [solution examples](solution-ckad.md)
