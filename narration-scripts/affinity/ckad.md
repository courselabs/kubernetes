# Affinity - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (20-25 minutes)

---

### Section 1: CKAD Exam Context and Scope (2 min)
**[00:00-02:00]**

Welcome to CKAD exam preparation for Pod scheduling and affinity. While affinity is marked as advanced and beyond core CKAD requirements, understanding these concepts will make you a more effective Kubernetes developer and may appear in exam scenarios.

Let me be clear about what to expect. The CKAD exam primarily tests core application development skills. However, affinity and anti-affinity patterns frequently appear in real-world scenarios, especially when deploying high-availability applications or optimizing performance.

In this session, we'll focus on practical exam skills:
- Recognizing when to use affinity versus simpler mechanisms
- Reading and understanding affinity rules in existing deployments
- Quickly identifying why Pods are pending due to affinity constraints
- Using kubectl commands to troubleshoot scheduling issues
- Common patterns you can apply quickly under exam time pressure

The key takeaway: you won't need to write complex affinity rules from scratch, but you should be able to work with existing ones and troubleshoot scheduling problems efficiently.

---

### Section 2: Understanding Affinity Types and Operators (3 min)
**[02:00-05:00]**

Let's start with the fundamentals. There are three types of affinity in Kubernetes: node affinity, Pod affinity, and Pod anti-affinity.

**Node affinity** controls which nodes can run your Pods based on node labels. It comes in two flavors: required and preferred. The full name is requiredDuringSchedulingIgnoredDuringExecution. That's a mouthful, so focus on the key parts: "required" means it must be satisfied, "IgnoredDuringExecution" means running Pods won't be evicted if rules change.

Let me show you a quick example:

```bash
kubectl explain pod.spec.affinity.nodeAffinity
```

Notice the structure. Required affinity uses nodeSelectorTerms with matchExpressions. Each match expression has a key, operator, and values.

The operators are critical for CKAD:
- **In**: value must be in the list
- **NotIn**: value must not be in the list
- **Exists**: key must exist, value doesn't matter
- **DoesNotExist**: key must not exist
- **Gt**: greater than (for numeric values)
- **Lt**: less than (for numeric values)

Here's a practical example. If you want Pods only on Linux nodes with SSD storage:

```bash
kubectl run test --image=nginx --dry-run=client -o yaml > pod.yaml
```

Edit the pod.yaml to add node affinity. In the exam, you might be given this requirement and need to modify an existing spec. The key is knowing the structure.

**Pod affinity and anti-affinity** use the same concepts but add a topology key. This defines the scope: kubernetes.io/hostname means same node, topology.kubernetes.io/zone means same zone.

---

### Section 3: Quick Command Reference for CKAD (3 min)
**[05:00-08:00]**

Let me show you the essential kubectl commands for working with affinity in the exam. These will save you precious time.

First, checking node labels - this is critical because affinity rules depend on labels:

```bash
# Show all node labels
kubectl get nodes --show-labels

# Show specific labels as columns
kubectl get nodes -L disktype,zone

# Find nodes with a specific label
kubectl get nodes -l disktype=ssd
```

Adding labels to nodes:

```bash
# Add a label
kubectl label node worker-1 disktype=ssd

# Update existing label requires --overwrite
kubectl label node worker-1 disktype=nvme --overwrite

# Remove a label with minus suffix
kubectl label node worker-1 disktype-
```

Checking Pod placement and troubleshooting:

```bash
# See which node each Pod is on
kubectl get pods -o wide

# Check affinity rules on a running Pod
kubectl get pod mypod -o yaml | grep -A 20 affinity

# See why a Pod is pending
kubectl describe pod mypod | grep -A 5 Events
```

The describe command is your best friend for debugging affinity issues. The Events section will tell you exactly which affinity constraints couldn't be satisfied.

For quick debugging of scheduling issues:

```bash
# Check if any nodes match your selector
kubectl get nodes -l your-label=value

# Check node capacity
kubectl describe node worker-1 | grep -A 5 Capacity

# See if nodes are tainted
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
```

Memorize these patterns. In the exam, every second counts, and knowing these commands by heart will save you valuable time.

---

### Section 4: Common CKAD Patterns - Node Affinity (4 min)
**[08:00-12:00]**

Now let's walk through common exam patterns. I'll show you templates you can reuse quickly.

**Pattern 1: Schedule on specific node type**

Scenario: "Create a deployment that only runs on nodes with label environment=production."

The fastest approach:

```bash
# Generate base deployment
kubectl create deployment webapp --image=nginx --replicas=3 \
  --dry-run=client -o yaml > deploy.yaml
```

Then edit deploy.yaml to add node affinity:

```yaml
spec:
  template:
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
```

**Pro tip**: You can use a simpler nodeSelector if you just need equality matching:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        environment: production
```

Node selectors are easier to write and understand. Use them unless you need affinity's advanced features.

**Pattern 2: Avoid control plane nodes**

This is extremely common:

```yaml
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
    - matchExpressions:
      - key: node-role.kubernetes.io/control-plane
        operator: DoesNotExist
```

Notice we use DoesNotExist - the control plane label shouldn't be present.

**Pattern 3: Specific region/zone**

For cloud environments:

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

Multiple expressions in the same term use AND logic - the node must match all of them.

**Pattern 4: Preferred affinity with weights**

When you want preference without hard requirements:

```yaml
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
```

Weights range from 1 to 100. Higher weight means stronger preference.

---

### Section 5: Common CKAD Patterns - Pod Affinity (4 min)
**[12:00-16:00]**

Now let's look at Pod affinity and anti-affinity patterns. These are all about relationships between Pods.

**Pattern 1: High availability with anti-affinity**

This is the most common exam scenario. Spread replicas across nodes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
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
              matchLabels:
                app: web
            topologyKey: kubernetes.io/hostname
```

The topology key kubernetes.io/hostname means "different physical nodes." Each replica will be on a different node for high availability.

**Important warning**: If you have 3 replicas but only 2 nodes, with required anti-affinity, one Pod will stay pending. Use preferred for more flexibility.

**Pattern 2: Spread across zones (preferred)**

Better for real-world scenarios:

```yaml
podAntiAffinity:
  preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 100
    podAffinityTerm:
      labelSelector:
        matchLabels:
          app: web
      topologyKey: topology.kubernetes.io/zone
```

This tries to spread across zones but allows multiple Pods per zone if necessary.

**Pattern 3: Co-locate with cache**

Pod affinity for performance:

```yaml
podAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
  - labelSelector:
      matchLabels:
        app: redis-cache
    topologyKey: kubernetes.io/hostname
```

This says: "schedule me on the same node as Pods labeled app=redis-cache."

**Pattern 4: Regional affinity with zone spreading**

Combining node and Pod affinity:

```yaml
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
```

This demonstrates a sophisticated pattern: "stay in one region, but spread across zones within it."

---

### Section 6: Troubleshooting Affinity Issues (4 min)
**[16:00-20:00]**

Now let's focus on troubleshooting - this is critical for the exam. When Pods are pending due to affinity, you need to diagnose and fix quickly.

**Issue 1: Pods stuck in Pending**

First step - always check the Pod status:

```bash
kubectl get pods
```

If you see Pending, describe the Pod:

```bash
kubectl describe pod mypod | tail -20
```

Look for messages like "0/3 nodes are available: 3 node(s) didn't match Pod's node affinity/selector."

This tells you the affinity rules can't be satisfied. Debug steps:

```bash
# Check what labels the affinity requires
kubectl get pod mypod -o yaml | grep -A 10 nodeAffinity

# Check if any nodes have those labels
kubectl get nodes --show-labels | grep disktype

# If no nodes match, add the label or fix the affinity rule
kubectl label node worker-1 disktype=ssd
```

**Issue 2: Anti-affinity too restrictive**

Scenario: You have required anti-affinity but not enough nodes. The error message:

"0/3 nodes are available: 2 node(s) didn't match pod affinity rules, 1 node(s) had volume node affinity conflict."

Solution: Change from required to preferred:

```bash
kubectl edit deployment myapp
```

Find the anti-affinity section and change `requiredDuringScheduling` to `preferredDuringScheduling`, add weight.

**Issue 3: Pods not co-locating**

You want Pod affinity but Pods are on different nodes. Debug:

```bash
# Check if target Pods exist
kubectl get pods -l app=target-app

# Check which nodes they're on
kubectl get pods -l app=target-app -o wide

# Verify your affinity label selector
kubectl get pod mypod -o yaml | grep -A 10 podAffinity
```

Common mistakes:
- Wrong label selector
- Target Pods don't exist yet
- Wrong topology key

**Issue 4: Quick decision tree**

In the exam, use this mental checklist:

1. Is the Pod pending? → Check describe for scheduling errors
2. Error mentions affinity/selector? → Verify node labels match requirements
3. No nodes match? → Label a node or change affinity
4. Anti-affinity preventing scheduling? → Change required to preferred
5. Still stuck? → Check taints, resource capacity, other constraints

---

### Section 7: Exam Strategies and Time-Saving Tips (3 min)
**[20:00-23:00]**

Let me share strategic advice for handling affinity in the CKAD exam.

**Strategy 1: Prefer simpler mechanisms**

If the question can be solved with a nodeSelector instead of node affinity, use nodeSelector. It's faster to write and less error-prone:

```yaml
# Simple nodeSelector
spec:
  nodeSelector:
    disktype: ssd

# vs node affinity (more complex)
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
```

Only use affinity when you need its advanced features.

**Strategy 2: Use kubectl explain for syntax**

Don't memorize the exact YAML structure:

```bash
kubectl explain pod.spec.affinity
kubectl explain pod.spec.affinity.nodeAffinity
kubectl explain pod.spec.affinity.podAntiAffinity
```

This shows you the exact field names and structure.

**Strategy 3: Generate and modify**

Start with imperative commands:

```bash
kubectl create deployment web --image=nginx --replicas=3 \
  --dry-run=client -o yaml > deploy.yaml
```

Then edit deploy.yaml to add affinity. This is faster than writing from scratch.

**Strategy 4: Common mistakes to avoid**

1. **Forgetting nodeSelectorTerms wrapper**: The matchExpressions must be inside nodeSelectorTerms.

2. **Wrong topology key**: Use kubernetes.io/hostname for same node, topology.kubernetes.io/zone for same zone.

3. **Case-sensitive labels**: disktype is not the same as diskType.

4. **Required anti-affinity with too many replicas**: If you have 5 replicas, 3 nodes, and required anti-affinity, 2 Pods will stay pending.

5. **Not checking if target Pods exist**: Pod affinity fails if the target Pods haven't been created yet.

**Strategy 5: Time management**

If you encounter an affinity question:
- Read carefully - is it asking you to create or debug?
- For creation - use the simplest mechanism that works
- For debugging - describe Pod, check Events, look at labels
- Don't spend more than 5 minutes on any single question
- Flag and move on if stuck

---

### Section 8: Practice Scenario Walkthrough (3 min)
**[23:00-26:00]**

Let's do a quick practice scenario that simulates exam conditions.

**Scenario**: "Deploy application 'webapp' with 3 replicas. Pods must run on Linux nodes. Pods should be spread across different availability zones if possible, but all replicas must start even if only one zone is available."

Time yourself. You have 4 minutes.

Here's my approach:

```bash
# Step 1: Create base deployment (30 seconds)
kubectl create deployment webapp --image=nginx --replicas=3 \
  --dry-run=client -o yaml > webapp.yaml
```

Now edit webapp.yaml:

```yaml
# Step 2: Add affinity rules (2 minutes)
spec:
  template:
    spec:
      affinity:
        # Required: Linux nodes
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: kubernetes.io/os
                operator: In
                values:
                - linux
        # Preferred: spread across zones
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchLabels:
                  app: webapp
              topologyKey: topology.kubernetes.io/zone
```

Key decisions:
- Required node affinity for Linux (must have)
- Preferred Pod anti-affinity for spreading (nice to have)
- Used preferredDuringScheduling because question says "all replicas must start"

```bash
# Step 3: Apply and verify (1 minute)
kubectl apply -f webapp.yaml
kubectl get pods -l app=webapp -o wide

# Step 4: Confirm success (30 seconds)
kubectl describe deployment webapp | grep -A 10 Replicas
```

Total time: 4 minutes. Practice this workflow until you can do it in under 3 minutes.

---

### Section 9: Summary and Final Tips (1 min)
**[26:00-27:00]**

Let's wrap up with key takeaways for CKAD exam success with affinity.

**Remember these essentials:**
- Node affinity controls placement based on node labels
- Pod affinity co-locates, anti-affinity spreads
- Required creates hard constraints, preferred creates soft preferences
- Topology key defines the scope: hostname, zone, or region
- Always check `kubectl describe pod` Events for scheduling issues

**Practical exam tips:**
- Use nodeSelector for simple cases
- Use kubectl explain for syntax help
- Generate base YAML with imperative commands
- Understand required vs preferred deeply
- Practice troubleshooting pending Pods
- Know the standard labels: hostname, os, arch, zone, region

**Time-saving commands to memorize:**
- kubectl get nodes --show-labels
- kubectl label node <name> <key>=<value>
- kubectl describe pod <name> | tail -20
- kubectl get pod <name> -o yaml | grep -A 20 affinity

Practice these patterns until they're second nature. The exam is time-pressured, so muscle memory with these commands is crucial.

Good luck with your CKAD exam preparation!
