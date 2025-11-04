# Clusters - CKAD Exam Topics

This document covers the CKAD exam requirements for working with multi-node Kubernetes clusters. Make sure you've completed the [basic Clusters lab](README.md) first, as it covers fundamental concepts of cluster architecture and node management.

## CKAD Cluster Management Requirements

The CKAD exam expects you to understand and work with:

- Multi-node cluster architecture
- Node labels and selectors
- Taints and tolerations
- Pod scheduling controls
- Affinity and anti-affinity rules
- Node maintenance (cordon, drain, uncordon)
- DaemonSets for node-level workloads
- Resource requests and limits affecting scheduling
- Understanding API version compatibility

## Reference

- [Taints and Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)
- [Node Selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector)
- [Node Affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)
- [DaemonSets](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)
- [Managing Resources](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)

## Understanding Node Labels

Every node in a Kubernetes cluster has labels that identify its characteristics:

### Standard Node Labels

```bash
# View all node labels
kubectl get nodes --show-labels

# View specific labels
kubectl get nodes -o custom-columns=NAME:.metadata.name,LABELS:.metadata.labels
```

**Built-in labels (always present):**

| Label | Purpose | Example Values |
|-------|---------|----------------|
| `kubernetes.io/hostname` | Node hostname | `node-1`, `ip-10-0-1-23` |
| `kubernetes.io/os` | Operating system | `linux`, `windows` |
| `kubernetes.io/arch` | CPU architecture | `amd64`, `arm64` |
| `node.kubernetes.io/instance-type` | Instance type | `t3.medium`, `n1-standard-2` |
| `topology.kubernetes.io/zone` | Availability zone | `us-east-1a`, `europe-west1-b` |
| `topology.kubernetes.io/region` | Cloud region | `us-east-1`, `europe-west1` |

**Special labels:**

| Label | Purpose |
|-------|---------|
| `node-role.kubernetes.io/control-plane` | Marks control plane nodes |
| `node-role.kubernetes.io/master` | Legacy control plane label |

### Adding Custom Labels

```bash
# Add a label to a node
kubectl label node <node-name> environment=production

# Add multiple labels
kubectl label node <node-name> disk-type=ssd storage=high-performance

# Update existing label (requires --overwrite)
kubectl label node <node-name> environment=staging --overwrite

# Remove a label
kubectl label node <node-name> environment-

# View updated labels
kubectl get nodes --show-labels
```

**Common custom label patterns:**

```bash
# Environment
kubectl label node node-1 environment=production

# Hardware characteristics
kubectl label node node-1 disk=ssd
kubectl label node node-2 disk=hdd
kubectl label node node-3 gpu=nvidia-t4

# Workload types
kubectl label node node-1 workload=compute-intensive
kubectl label node node-2 workload=memory-intensive

# Team or project
kubectl label node node-1 team=backend
kubectl label node node-2 team=frontend
```

**TODO**: Create examples:
- `specs/labels/label-nodes.sh` - Script to label nodes
- `specs/labels/node-label-examples.yaml` - Various labeling scenarios

**TODO**: Add exercise:
1. View all node labels
2. Add custom labels to nodes
3. Query nodes by label selectors
4. Update and remove labels

## Node Selectors

Node selectors are the simplest way to constrain Pods to specific nodes:

### Basic Node Selector

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  nodeSelector:
    disk: ssd
  containers:
  - name: nginx
    image: nginx
```

Pod will **only** be scheduled on nodes with `disk=ssd` label.

### Using Standard Labels

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: linux-app
spec:
  nodeSelector:
    kubernetes.io/os: linux
    kubernetes.io/arch: amd64
  containers:
  - name: app
    image: myapp:latest
```

### Multiple Node Selectors

All labels must match (AND logic):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-app
spec:
  nodeSelector:
    gpu: nvidia-t4
    environment: production
  containers:
  - name: ml-app
    image: ml-training:v1
```

Pod needs a node with **both** `gpu=nvidia-t4` AND `environment=production`.

### Deployment with Node Selector

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      nodeSelector:
        workload: compute-intensive
      containers:
      - name: api
        image: backend-api:v2
```

**TODO**: Create examples:
- `specs/node-selector/basic-selector.yaml`
- `specs/node-selector/deployment-selector.yaml`
- `specs/node-selector/multiple-selectors.yaml`

**TODO**: Add exercise:
1. Label nodes with different characteristics
2. Deploy Pods with various node selectors
3. Show Pods scheduled only on matching nodes
4. Test what happens when no nodes match

## Taints and Tolerations

Taints repel Pods from nodes unless the Pod has a matching toleration.

### Understanding Taints

**Taint structure:** `key=value:effect`

**Effects:**

| Effect | Behavior |
|--------|----------|
| `NoSchedule` | New Pods won't be scheduled (existing Pods unaffected) |
| `PreferNoSchedule` | Try to avoid scheduling here (soft constraint) |
| `NoExecute` | New Pods won't be scheduled, existing Pods evicted |

### Adding Taints to Nodes

```bash
# NoSchedule - no new Pods scheduled
kubectl taint nodes node-1 key=value:NoSchedule

# PreferNoSchedule - avoid if possible
kubectl taint nodes node-2 key=value:PreferNoSchedule

# NoExecute - evict existing Pods
kubectl taint nodes node-3 key=value:NoExecute

# Real examples
kubectl taint nodes node-1 dedicated=gpu:NoSchedule
kubectl taint nodes node-2 maintenance=true:NoExecute
kubectl taint nodes master node-role.kubernetes.io/master:NoSchedule

# Remove taint (note the minus sign)
kubectl taint nodes node-1 key=value:NoSchedule-
```

### Viewing Taints

```bash
# View all node taints
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints

# Describe specific node
kubectl describe node <node-name> | grep Taints
```

### Pod Tolerations

Tolerations allow Pods to be scheduled on tainted nodes:

**Exact match toleration:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-workload
spec:
  tolerations:
  - key: "dedicated"
    operator: "Equal"
    value: "gpu"
    effect: "NoSchedule"
  containers:
  - name: gpu-app
    image: gpu-app:v1
```

**Wildcard toleration (tolerates any value):**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: system-monitor
spec:
  tolerations:
  - key: "node-role.kubernetes.io/master"
    operator: "Exists"
    effect: "NoSchedule"
  containers:
  - name: monitor
    image: prometheus-exporter:v1
```

**Tolerate all taints:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: admin-pod
spec:
  tolerations:
  - operator: "Exists"
  containers:
  - name: admin-tools
    image: admin-tools:v1
```

**Toleration with time limit (NoExecute only):**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: graceful-shutdown
spec:
  tolerations:
  - key: "node.kubernetes.io/unreachable"
    operator: "Exists"
    effect: "NoExecute"
    tolerationSeconds: 300
  containers:
  - name: app
    image: myapp:v1
```

Pod can stay for 300 seconds after node becomes unreachable before being evicted.

### Deployment with Tolerations

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
spec:
  replicas: 5
  selector:
    matchLabels:
      app: batch
  template:
    metadata:
      labels:
        app: batch
    spec:
      tolerations:
      - key: "disk"
        operator: "Equal"
        value: "hdd"
        effect: "NoSchedule"
      - key: "workload"
        operator: "Equal"
        value: "batch"
        effect: "PreferNoSchedule"
      containers:
      - name: processor
        image: batch-processor:v1
```

**Key Point:** Tolerations allow scheduling but don't guarantee it. Combine with node selectors or affinity for guaranteed placement.

**TODO**: Create comprehensive examples:
- `specs/taints/taint-examples.sh` - Various taint scenarios
- `specs/taints/toleration-exact.yaml`
- `specs/taints/toleration-exists.yaml`
- `specs/taints/toleration-all.yaml`
- `specs/taints/combined-selector-toleration.yaml`

**TODO**: Add exercise:
1. Taint nodes with different effects
2. Deploy Pods without tolerations (won't schedule)
3. Add tolerations and redeploy
4. Test NoExecute taint evicting Pods
5. Show toleration + nodeSelector combination

## Node Affinity

More expressive than node selectors, supporting complex scheduling rules:

### Required Node Affinity

Pod must be placed on matching nodes:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disk
            operator: In
            values:
            - ssd
            - nvme
  containers:
  - name: nginx
    image: nginx
```

Pod requires nodes with `disk=ssd` OR `disk=nvme`.

### Preferred Node Affinity

Soft constraint, scheduler tries to honor but not required:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        preference:
          matchExpressions:
          - key: disk
            operator: In
            values:
            - ssd
  containers:
  - name: nginx
    image: nginx
```

Scheduler prefers nodes with `disk=ssd` but will schedule elsewhere if needed.

### Affinity Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `In` | Value in list | `disk In [ssd, nvme]` |
| `NotIn` | Value not in list | `disk NotIn [hdd]` |
| `Exists` | Key exists | `gpu Exists` |
| `DoesNotExist` | Key doesn't exist | `spot DoesNotExist` |
| `Gt` | Greater than (numeric) | `cpu-count Gt 16` |
| `Lt` | Less than (numeric) | `memory-gb Lt 64` |

### Combining Required and Preferred

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: data-processor
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/arch
            operator: In
            values:
            - amd64
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 80
        preference:
          matchExpressions:
          - key: disk
            operator: In
            values:
            - ssd
      - weight: 20
        preference:
          matchExpressions:
          - key: network
            operator: In
            values:
            - 10gbit
  containers:
  - name: processor
    image: data-processor:v1
```

**Weight:** Higher weights are more preferred (1-100).

### Multiple Node Selector Terms (OR Logic)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: flexible-app
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: environment
            operator: In
            values:
            - production
        - matchExpressions:
          - key: environment
            operator: In
            values:
            - staging
          - key: region
            operator: In
            values:
            - us-east
  containers:
  - name: app
    image: myapp:v1
```

Pod can run on:
- Nodes with `environment=production` OR
- Nodes with `environment=staging` AND `region=us-east`

**TODO**: Create examples:
- `specs/affinity/required-affinity.yaml`
- `specs/affinity/preferred-affinity.yaml`
- `specs/affinity/combined-affinity.yaml`
- `specs/affinity/multiple-terms.yaml`
- `specs/affinity/operators-examples.yaml`

**TODO**: Add exercise:
1. Deploy with required affinity
2. Deploy with preferred affinity
3. Compare with node selector
4. Test multiple selector terms (OR logic)
5. Show weight priority in preferred affinity

## Pod Affinity and Anti-Affinity

Control Pod placement relative to other Pods:

### Pod Affinity

Schedule Pods close to other Pods:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-frontend
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
  - name: frontend
    image: web-frontend:v1
```

This Pod must be on the same node (`topologyKey: kubernetes.io/hostname`) as a Pod with `app=cache` label.

**Common topology keys:**
- `kubernetes.io/hostname` - Same node
- `topology.kubernetes.io/zone` - Same availability zone
- `topology.kubernetes.io/region` - Same region

### Pod Anti-Affinity

Keep Pods apart (high availability):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
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
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - web
            topologyKey: kubernetes.io/hostname
      containers:
      - name: nginx
        image: nginx
```

Each replica will be on a different node (no two Pods with `app=web` on same node).

### Preferred Pod Anti-Affinity

Soft constraint for spreading:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
spec:
  replicas: 5
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - backend
              topologyKey: topology.kubernetes.io/zone
      containers:
      - name: api
        image: backend-api:v1
```

Try to spread across zones, but allow multiple Pods per zone if necessary.

### Combining Pod and Node Affinity

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disk
            operator: In
            values:
            - ssd
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - database
        topologyKey: topology.kubernetes.io/zone
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - app-pod
          topologyKey: kubernetes.io/hostname
  containers:
  - name: app
    image: myapp:v1
```

Requirements:
- Must run on SSD node (node affinity)
- Must be in same zone as database Pod (pod affinity)
- Prefer not to run on same node as other app-pod instances (pod anti-affinity)

**TODO**: Create comprehensive examples:
- `specs/pod-affinity/affinity-same-node.yaml`
- `specs/pod-affinity/affinity-same-zone.yaml`
- `specs/pod-affinity/anti-affinity-spread.yaml`
- `specs/pod-affinity/combined-affinities.yaml`

**TODO**: Add exercise:
1. Deploy cache Pods
2. Deploy app Pods with affinity to cache
3. Deploy web Pods with anti-affinity (spread across nodes)
4. Show Pod distribution across nodes
5. Combine node + pod affinities

## DaemonSets

Ensure a Pod runs on every node (or selected nodes):

### Basic DaemonSet

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      containers:
      - name: exporter
        image: prom/node-exporter:latest
        ports:
        - containerPort: 9100
```

One Pod per node automatically.

### DaemonSet with Node Selector

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: gpu-device-plugin
spec:
  selector:
    matchLabels:
      app: gpu-plugin
  template:
    metadata:
      labels:
        app: gpu-plugin
    spec:
      nodeSelector:
        accelerator: nvidia-gpu
      containers:
      - name: plugin
        image: nvidia-device-plugin:v1
```

One Pod per node with `accelerator=nvidia-gpu` label.

### DaemonSet with Tolerations

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-logging
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      tolerations:
      - key: node-role.kubernetes.io/master
        effect: NoSchedule
      - key: node.kubernetes.io/disk-pressure
        effect: NoSchedule
      containers:
      - name: fluentd
        image: fluentd:v1.14
```

Runs on all nodes including control plane and nodes under disk pressure.

### DaemonSet Update Strategy

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nginx-ingress
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  selector:
    matchLabels:
      app: ingress
  template:
    metadata:
      labels:
        app: ingress
    spec:
      containers:
      - name: nginx
        image: nginx-ingress:v1.0
```

**Update strategies:**
- `RollingUpdate` - Update one node at a time (default)
- `OnDelete` - Update only when Pods manually deleted

**TODO**: Create examples:
- `specs/daemonset/basic-daemonset.yaml`
- `specs/daemonset/node-selector-daemonset.yaml`
- `specs/daemonset/toleration-daemonset.yaml`
- `specs/daemonset/update-strategy.yaml`

**TODO**: Add exercise:
1. Deploy basic DaemonSet
2. Verify Pod on each node
3. Add node selector to limit nodes
4. Add tolerations for control plane
5. Update DaemonSet image and watch rolling update

## Node Maintenance

### Cordon - Prevent Scheduling

Mark node as unschedulable:

```bash
# Cordon a node
kubectl cordon <node-name>

# Check node status
kubectl get nodes

# Node shows as Ready,SchedulingDisabled
```

**Use case:** Prevent new Pods before maintenance

### Drain - Evict Pods

Safely evict all Pods from a node:

```bash
# Drain node (respects PodDisruptionBudgets)
kubectl drain <node-name> --ignore-daemonsets

# Common flags:
kubectl drain <node-name> \
  --ignore-daemonsets \          # Required for DaemonSet Pods
  --delete-emptydir-data \       # Delete Pods with emptyDir volumes
  --force \                      # Force deletion (use carefully)
  --grace-period=300             # Wait time before force kill (seconds)
```

**What drain does:**
1. Cordons the node (prevents new Pods)
2. Evicts all Pods gracefully
3. Respects PodDisruptionBudgets (unless --disable-eviction)
4. Waits for termination or grace period

### Uncordon - Re-enable Scheduling

Mark node as schedulable again:

```bash
# Uncordon node
kubectl uncordon <node-name>

# Verify status
kubectl get nodes
```

**Note:** Existing Pods don't automatically move back. They stay where they were rescheduled.

### Complete Maintenance Workflow

```bash
# 1. Cordon the node
kubectl cordon worker-node-1

# 2. Check what will be evicted
kubectl get pods -o wide --all-namespaces | grep worker-node-1

# 3. Drain the node
kubectl drain worker-node-1 --ignore-daemonsets --delete-emptydir-data

# 4. Perform maintenance (upgrade, repair, etc.)
# ... do maintenance work ...

# 5. Uncordon when done
kubectl uncordon worker-node-1

# 6. Optional: Force rebalance
kubectl rollout restart deployment/myapp
```

**TODO**: Create examples:
- `specs/maintenance/maintenance-workflow.sh`
- `specs/maintenance/poddisruptionbudget.yaml`

**TODO**: Add exercise:
1. Deploy application across nodes
2. Cordon a node and deploy new Pods (won't schedule there)
3. Drain a node (Pods evicted)
4. Uncordon and verify scheduling enabled
5. Rebalance Pods across nodes

## Resource Requests and Limits

Affect scheduling decisions:

### Resource Requests

Minimum guaranteed resources:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: myapp:v1
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

**Scheduling impact:**
- Scheduler only places Pod on nodes with sufficient available resources
- Requests are reserved for the Pod

### Node Capacity and Allocatable

```bash
# View node capacity
kubectl describe node <node-name>

# Output shows:
# Capacity:
#   cpu:                4
#   memory:             16Gi
# Allocatable:
#   cpu:                3800m
#   memory:             15Gi
# Allocated resources:
#   cpu:                2000m (52%)
#   memory:             8Gi (53%)
```

**Key concepts:**
- **Capacity**: Total resources on node
- **Allocatable**: Available for Pods (capacity - system reserved)
- **Allocated**: Sum of all Pod requests

### Pod Won't Schedule Due to Resources

```bash
# Pod stuck in Pending state
kubectl get pods

# Check events
kubectl describe pod <pod-name>

# Common message:
# Warning  FailedScheduling  0/3 nodes are available: 3 Insufficient cpu.
```

**Solutions:**
- Reduce resource requests
- Add more nodes
- Remove/scale down other Pods

**TODO**: Create examples showing:
- Pods with various resource requirements
- Over-subscription scenarios
- QoS classes (Guaranteed, Burstable, BestEffort)
- Priority and preemption

## API Version Compatibility

Different Kubernetes versions support different API versions:

### Checking API Versions

```bash
# List all available API versions
kubectl api-versions

# Check if specific API exists
kubectl api-versions | grep networking.k8s.io/v1

# Get API resources
kubectl api-resources
```

### Deprecated APIs

Common deprecations in Kubernetes:

| Resource | Deprecated API | Current API | Removed In |
|----------|---------------|-------------|------------|
| Ingress | `extensions/v1beta1` | `networking.k8s.io/v1` | v1.22 |
| CronJob | `batch/v1beta1` | `batch/v1` | v1.25 |
| PodSecurityPolicy | `policy/v1beta1` | Removed | v1.25 |

### Handling API Migrations

```bash
# Convert deprecated API to current version
kubectl convert -f old-ingress.yaml --output-version networking.k8s.io/v1

# Dry-run to check compatibility
kubectl apply --dry-run=server -f manifest.yaml
```

**CKAD Tip:** Always use stable (`v1`) APIs, not `beta` versions.

**TODO**: Add examples of:
- API version migration scripts
- Backward compatibility patterns
- Testing across Kubernetes versions

## Troubleshooting Scheduling Issues

### Common Problems and Solutions

**1. Pod Stuck in Pending**

```bash
# Check Pod events
kubectl describe pod <pod-name>

# Common causes:
# - Insufficient resources
# - No nodes match selectors
# - All nodes are tainted
# - ImagePullBackOff (different issue)

# Debug steps:
kubectl get nodes
kubectl describe nodes
kubectl get pod <pod-name> -o yaml | grep -A 10 nodeSelector
kubectl get pod <pod-name> -o yaml | grep -A 10 affinity
```

**2. Pod on Wrong Node**

```bash
# Check where Pod landed
kubectl get pod <pod-name> -o wide

# Check node labels
kubectl get node <node-name> --show-labels

# Verify selectors and affinity
kubectl get pod <pod-name> -o yaml
```

**3. DaemonSet Not on All Nodes**

```bash
# Check DaemonSet status
kubectl get daemonset

# Check if nodes are tainted
kubectl describe nodes | grep Taints

# Check DaemonSet tolerations
kubectl describe daemonset <name> | grep -A 5 Tolerations
```

**4. Affinity Not Working**

```bash
# Verify labels exist on target Pods
kubectl get pods --show-labels

# Check topology key exists on nodes
kubectl get nodes --show-labels | grep <topology-key>

# Review affinity rules
kubectl get pod <pod-name> -o yaml | grep -A 20 affinity
```

**TODO**: Create comprehensive troubleshooting lab with:
- Various broken scheduling scenarios
- Systematic debugging steps
- Decision tree for diagnosis

## CKAD Exam Tips

### Quick Commands

```bash
# Node operations
kubectl get nodes
kubectl describe node <name>
kubectl label node <name> key=value
kubectl taint node <name> key=value:Effect
kubectl cordon <name>
kubectl drain <name> --ignore-daemonsets
kubectl uncordon <name>

# Check Pod scheduling
kubectl get pods -o wide
kubectl describe pod <name> | grep -A 5 Events
kubectl get pod <name> -o yaml | grep nodeName

# Test scheduling constraints
kubectl run test --image=nginx --dry-run=client -o yaml > pod.yaml
# Edit to add nodeSelector, affinity, tolerations
kubectl apply -f pod.yaml
kubectl get pod test -o wide
```

### Common Patterns

**Add node selector to existing Deployment:**
```bash
kubectl patch deployment myapp -p '
{
  "spec": {
    "template": {
      "spec": {
        "nodeSelector": {
          "disk": "ssd"
        }
      }
    }
  }
}'
```

**Quick toleration template:**
```yaml
tolerations:
- key: "key"
  operator: "Equal"
  value: "value"
  effect: "NoSchedule"
```

**Quick affinity template:**
```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: label-key
          operator: In
          values:
          - label-value
```

### What to Focus On

**High Priority for CKAD:**
- Node labels and selectors
- Taints and tolerations (especially NoSchedule, NoExecute)
- Basic node affinity
- DaemonSets
- Cordon/drain/uncordon
- Resource requests impacting scheduling

**Medium Priority:**
- Pod affinity and anti-affinity
- Preferred vs required affinities
- Topology keys
- Weight in preferred affinity

**Lower Priority:**
- Complex multi-term affinity rules
- Advanced scheduling plugins
- Cluster autoscaling

**TODO**: Add 10 rapid-fire CKAD practice scenarios

## Lab Challenge: Multi-Tier Application with Advanced Scheduling

Deploy a realistic application with various scheduling constraints:

**TODO**: Create comprehensive challenge with:

### Requirements

1. **Database Tier**
   - DaemonSet or StatefulSet on nodes with `disk=ssd`
   - Tolerate `database=critical:NoSchedule` taint
   - Anti-affinity to spread across nodes

2. **Cache Tier**
   - Deployment with 3 replicas
   - Node affinity for `memory=high`
   - Anti-affinity to spread across zones
   - Pod affinity to be near database

3. **Application Tier**
   - Deployment with 5 replicas
   - Required: Linux amd64 nodes
   - Preferred: nodes with `compute=optimized`
   - Anti-affinity to spread across nodes
   - Pod affinity to be near cache (same zone)

4. **Monitoring**
   - DaemonSet on all nodes including control plane
   - Tolerate all taints
   - Resource requests: cpu 100m, memory 128Mi

5. **Node Configuration**
   - Label nodes with appropriate characteristics
   - Taint database nodes
   - At least 3 worker nodes in different zones

6. **Maintenance Tasks**
   - Cordon and drain one node
   - Verify Pods rescheduled correctly
   - Uncordon and rebalance

**Success Criteria:**
- All Pods scheduled on appropriate nodes
- Database Pods on SSD nodes only
- Cache and app Pods co-located in same zones
- Monitoring DaemonSet on every node
- Anti-affinity rules prevent Pod concentration
- Drain operation completes successfully
- Application remains available during maintenance

**TODO**: Create all specs in `specs/challenge/` directory

## Quick Reference

### Node Operations
```bash
kubectl get nodes --show-labels
kubectl label node <name> key=value
kubectl taint node <name> key=value:Effect
kubectl cordon <name>
kubectl drain <name> --ignore-daemonsets
kubectl uncordon <name>
```

### Node Selector
```yaml
spec:
  nodeSelector:
    disk: ssd
```

### Tolerations
```yaml
spec:
  tolerations:
  - key: "key"
    operator: "Equal"
    value: "value"
    effect: "NoSchedule"
```

### Node Affinity
```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disk
            operator: In
            values:
            - ssd
```

### Pod Anti-Affinity
```yaml
spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: web
        topologyKey: kubernetes.io/hostname
```

## Cleanup

```bash
# Remove taints
kubectl taint nodes <name> key:Effect-

# Remove labels
kubectl label nodes <name> key-

# Uncordon nodes
kubectl uncordon <name>

# Delete test resources
kubectl delete all -l app=test
```

## Further Reading

- [Kubernetes Scheduling Framework](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/)
- [Taints and Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)
- [Assign Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)
- [Pod Priority and Preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/)

---

> Back to [basic Clusters lab](README.md) | [Course contents](../../README.md)
