# DaemonSets - CKAD Exam Preparation
## Narration Script for Exam Readiness Session

**Duration: 15-20 minutes**
**Target Audience: CKAD Exam Candidates**
**Delivery Style: Exam-focused, concise, time-efficient**

---

## Introduction (90 seconds)

Welcome to the CKAD exam preparation session for DaemonSets. While DaemonSets are supplementary material for CKAD, they can appear on the exam, and understanding them demonstrates solid Kubernetes knowledge.

**Session Objectives**:
1. Review essential DaemonSet concepts for the exam
2. Practice timed scenarios with realistic constraints
3. Master troubleshooting techniques
4. Avoid common mistakes and pitfalls
5. Learn quick reference commands

**Exam Context**: DaemonSets are part of the "Application Deployment" domain (20% of exam). You might see 1-2 questions involving DaemonSets, often combined with:
- Node selection and affinity
- Init containers
- HostPath volumes
- Update strategies

**Time Management**: With 6-8 minutes per question, DaemonSets questions should be faster than StatefulSets (no headless Service, no volumeClaimTemplates). Target: 3-5 minutes per DaemonSet question.

**Key Advantage**: DaemonSets are simpler than StatefulSets, so they're less likely to consume excessive exam time. Master the basics and you'll handle these questions efficiently.

Let's start with essential commands and quick reference material.

---

## Section 1: Essential Commands and Quick Reference (2-3 minutes)

### 1.1 Core kubectl Commands (90 seconds)

Here are the commands you must know by heart for DaemonSet questions:

**Create and View**:
```bash
# Apply from YAML (most common approach)
kubectl apply -f daemonset.yaml

# Get DaemonSets (use shorthand)
kubectl get ds

# Describe for troubleshooting
kubectl describe ds <name>

# View DaemonSet YAML
kubectl get ds <name> -o yaml
```

**Update and Rollout Management**:
```bash
# Edit DaemonSet
kubectl edit ds <name>

# Check rollout status
kubectl rollout status ds/<name>

# View rollout history
kubectl rollout history ds/<name>

# Rollback if needed
kubectl rollout undo ds/<name>
```

**Pod Management**:
```bash
# Get Pods from DaemonSet
kubectl get pods -l app=<label> -o wide

# Watch Pods during updates
kubectl get pods -l app=<label> --watch

# Delete specific Pod (for OnDelete strategy)
kubectl delete pod <pod-name>
```

**Node Operations**:
```bash
# Label node to target DaemonSet
kubectl label node <node-name> <key>=<value>

# Remove label from node
kubectl label node <node-name> <key>-

# View node labels
kubectl get nodes --show-labels
```

**Deletion**:
```bash
# Delete DaemonSet (cascading)
kubectl delete ds <name>

# Delete DaemonSet but keep Pods
kubectl delete ds <name> --cascade=orphan
```

**Memory Aid**: Use `ds` not `daemonset` - saves 8 characters every time.

### 1.2 DaemonSet vs Deployment - Quick Comparison (60 seconds)

Know this cold for the exam:

| Feature | DaemonSet | Deployment |
|---------|-----------|------------|
| **Replicas** | Automatic (one per node) | Manual specification |
| **Scaling** | Add/remove nodes or change labels | Change replica count |
| **Update Default** | RollingUpdate (delete first) | RollingUpdate (create first) |
| **Use Case** | Node-level services | Application workloads |
| **HostPath** | Common | Rare |

**Decision Tree for Exam**:
- Question mentions "every node" or "each node" → DaemonSet
- Question mentions "log collector" or "monitoring agent" → Likely DaemonSet
- Question specifies "3 replicas" → Deployment or StatefulSet
- Question mentions "node resources" or HostPath → Likely DaemonSet

---

## Section 2: Scenario 1 - Create Basic DaemonSet (3-4 minutes)

### 2.1 Scenario Setup (30 seconds)

**Time Target: 3-4 minutes**

**Exam Question Format**:

"Create a DaemonSet named `monitor` that runs busybox:latest with the command `sleep 3600`. The DaemonSet should have the label `app=monitor`. Verify that one Pod is running on each node."

**Constraints**:
- Namespace: default
- Must verify solution works
- Efficient execution required

### 2.2 Solution Walkthrough (2-3 minutes)

**Step 1: Create the DaemonSet** (2 minutes target)

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitor
  labels:
    app: monitor
spec:
  selector:
    matchLabels:
      app: monitor
  template:
    metadata:
      labels:
        app: monitor
    spec:
      containers:
      - name: busybox
        image: busybox:latest
        command: ['sleep', '3600']
EOF
```

**Critical Points**:
- No `replicas` field - common mistake to include one
- `selector.matchLabels` must match `template.metadata.labels`
- `command` is an array of strings

**Time-Saving Tip**: In the exam, don't overthink the YAML structure. DaemonSets are simpler than StatefulSets - just Pod spec, selector, and template.

**Step 2: Verify DaemonSet Created** (30 seconds target)

```bash
kubectl get ds monitor
```

Check that `DESIRED` matches your cluster's node count.

**Step 3: Verify Pods Running** (30 seconds target)

```bash
kubectl get pods -l app=monitor -o wide
```

Verify:
- One Pod per node (check the NODE column)
- All Pods in Running status

**Exam Time Check**: This should take 3-4 minutes maximum. If you're over 5 minutes, you need more practice with YAML syntax.

### 2.3 Common Mistakes (30 seconds)

❌ **Mistake 1**: Adding a `replicas` field - DaemonSets don't have one

❌ **Mistake 2**: Label mismatch between selector and template

❌ **Mistake 3**: Wrong API version (use `apps/v1`)

❌ **Mistake 4**: Not verifying Pods are actually running

✅ **Success Criteria**: DaemonSet exists, DESIRED equals node count, all Pods Running.

---

## Section 3: Scenario 2 - DaemonSet with HostPath Volume (3-4 minutes)

### 3.1 Scenario Setup (30 seconds)

**Time Target: 3-4 minutes**

**Exam Question Format**:

"Create a DaemonSet named `log-collector` that runs busybox with the command `tail -f /host-logs/syslog`. Mount the host's `/var/log` directory as a read-only volume at `/host-logs` in the container."

**Key Challenge**: Correct HostPath volume configuration.

### 3.2 Solution Walkthrough (2-3 minutes)

**Step 1: Create DaemonSet with HostPath** (2-3 minutes target)

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-collector
spec:
  selector:
    matchLabels:
      app: log-collector
  template:
    metadata:
      labels:
        app: log-collector
    spec:
      containers:
      - name: collector
        image: busybox
        command: ['tail', '-f', '/host-logs/syslog']
        volumeMounts:
        - name: varlog
          mountPath: /host-logs
          readOnly: true
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
          type: Directory
EOF
```

**Critical Points**:
- `volumeMounts.name` must match `volumes.name` (both `varlog`)
- `readOnly: true` is specified at the volumeMount level
- `hostPath.type: Directory` validates that `/var/log` exists as a directory
- `mountPath` can be different from `hostPath.path`

**Common HostPath Types**:
- `Directory` - must exist (most common for exam)
- `DirectoryOrCreate` - create if doesn't exist
- `File` - must exist as a file
- `Socket` - for Unix sockets (e.g., Docker socket)

**Step 2: Verify Pods Started** (60 seconds target)

```bash
kubectl get pods -l app=log-collector

# Check that the command is running
kubectl logs -l app=log-collector --tail 10
```

You should see log output from the host's syslog.

**Exam Time Check**: Should complete in 3-4 minutes.

### 3.3 Troubleshooting HostPath Issues (30 seconds)

If Pods are not Running:

```bash
kubectl describe pod -l app=log-collector
```

**Common issues**:
- Path doesn't exist on node (wrong `type` specified)
- Permission denied (may need securityContext)
- Wrong volumeMount name reference

**Quick Fix**: If path validation fails, use `type: DirectoryOrCreate` instead of `Directory`.

---

## Section 4: Scenario 3 - DaemonSet with Node Selector (3-4 minutes)

### 4.1 Scenario Setup (30 seconds)

**Time Target: 3-4 minutes**

**Exam Question Format**:

"Create a DaemonSet named `gpu-monitor` that runs on nodes labeled `gpu=nvidia`. Use the nginx:alpine image. Then label one node with `gpu=nvidia` and verify the Pod is created on that node."

**Skills Tested**: Node selection, dynamic behavior, verification.

### 4.2 Solution Walkthrough (2-3 minutes)

**Step 1: Create DaemonSet with nodeSelector** (90 seconds target)

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: gpu-monitor
spec:
  selector:
    matchLabels:
      app: gpu-monitor
  template:
    metadata:
      labels:
        app: gpu-monitor
    spec:
      nodeSelector:
        gpu: nvidia
      containers:
      - name: nginx
        image: nginx:alpine
EOF
```

**Critical Point**: `nodeSelector` is part of the Pod spec (`template.spec.nodeSelector`), not the DaemonSet spec.

**Step 2: Verify DaemonSet but No Pods** (30 seconds target)

```bash
kubectl get ds gpu-monitor
```

You should see `DESIRED: 0` because no nodes match the selector.

```bash
kubectl get pods -l app=gpu-monitor
```

No Pods exist yet.

**Step 3: Label a Node** (60 seconds target)

```bash
# Get node name
kubectl get nodes

# Label the first node
kubectl label node <node-name> gpu=nvidia

# Or use this one-liner
kubectl label node $(kubectl get nodes -o jsonpath='{.items[0].metadata.name}') gpu=nvidia
```

**Step 4: Verify Pod Created** (30 seconds target)

```bash
kubectl get pods -l app=gpu-monitor -o wide
```

You should see one Pod created on the labeled node.

**Exam Time Check**: Should complete in 3-4 minutes.

### 4.3 Key Concepts (30 seconds)

**Dynamic Behavior**:
- Label a node → DaemonSet creates Pod
- Remove label → DaemonSet deletes Pod
- Relabel node → Pod moves

**Use Cases**:
- GPU nodes: `gpu=nvidia`
- Production nodes: `env=production`
- SSD nodes: `disktype=ssd`
- Zone-specific: `zone=us-west-2a`

**Exam Tip**: If a question mentions specific node types or subsets, use nodeSelector.

---

## Section 5: Scenario 4 - Update Strategy OnDelete (2-3 minutes)

### 5.1 Scenario Setup (30 seconds)

**Time Target: 2-3 minutes**

**Exam Question Format**:

"Configure the DaemonSet `monitor` to use manual update control. When you update the image, Pods should only be updated when you manually delete them."

**Key Concept**: OnDelete update strategy.

### 5.2 Solution Walkthrough (90 seconds)

**Step 1: Update DaemonSet with OnDelete Strategy** (60 seconds target)

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitor
spec:
  updateStrategy:
    type: OnDelete
  selector:
    matchLabels:
      app: monitor
  template:
    metadata:
      labels:
        app: monitor
    spec:
      containers:
      - name: busybox
        image: busybox:1.35  # Updated version
        command: ['sleep', '3600']
EOF
```

**Critical Field**: `updateStrategy.type: OnDelete`

**Step 2: Verify Pods NOT Updated** (30 seconds target)

```bash
kubectl get pods -l app=monitor
```

Pods are still running with the old spec. The update didn't trigger a rollout.

**Step 3: Manually Trigger Update** (30 seconds target)

```bash
# Delete one Pod
kubectl delete pod <pod-name>

# Watch it recreate with new spec
kubectl get pods -l app=monitor --watch
```

The new Pod will have the updated image.

**Exam Time Check**: Should complete in 2-3 minutes.

### 5.3 RollingUpdate vs OnDelete (30 seconds)

**RollingUpdate** (default):
```yaml
updateStrategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
```
Automatic updates when spec changes.

**OnDelete**:
```yaml
updateStrategy:
  type: OnDelete
```
Manual updates only when Pods are deleted.

**Exam Decision**:
- Question says "automatic updates" → RollingUpdate
- Question says "manual control" or "one at a time" → OnDelete

---

## Section 6: Scenario 5 - Init Container Pattern (2-3 minutes)

### 6.1 Scenario Setup (30 seconds)

**Time Target: 2-3 minutes**

**Exam Question Format**:

"Create a DaemonSet named `web` that runs nginx:alpine. Before nginx starts, an init container should create a custom index.html file in a shared volume."

**Key Concept**: Init containers with shared volumes.

### 6.2 Solution Walkthrough (90 seconds)

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: web
spec:
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      initContainers:
      - name: setup
        image: busybox
        command:
        - sh
        - -c
        - echo '<h1>Initialized by DaemonSet</h1>' > /html/index.html
        volumeMounts:
        - name: html
          mountPath: /html
      containers:
      - name: nginx
        image: nginx:alpine
        volumeMounts:
        - name: html
          mountPath: /usr/share/nginx/html
      volumes:
      - name: html
        emptyDir: {}
EOF
```

**Critical Points**:
- Init container and main container share the volume `html`
- Init container writes to `/html/index.html`
- Main container reads from `/usr/share/nginx/html`
- Volume uses `emptyDir` for temporary storage

**Verification** (30 seconds):

```bash
kubectl get pods -l app=web --watch
# Wait for Init:0/1 → PodInitializing → Running

kubectl exec daemonset/web -- cat /usr/share/nginx/html/index.html
```

Should show the custom HTML.

### 6.3 Init Container Patterns (30 seconds)

**Common exam patterns**:

**Pattern 1: Wait for dependency**:
```yaml
initContainers:
- name: wait
  image: busybox
  command: ['sh', '-c', 'until nslookup myservice; do sleep 2; done']
```

**Pattern 2: Download config**:
```yaml
initContainers:
- name: fetch
  image: busybox
  command: ['wget', '-O', '/config/app.conf', 'http://config-server/']
```

**Pattern 3: Set permissions**:
```yaml
initContainers:
- name: perms
  image: busybox
  command: ['sh', '-c', 'chmod 777 /data']
```

---

## Section 7: Troubleshooting Common Issues (2-3 minutes)

### 7.1 Issue 1: Pods Not Scheduling (60 seconds)

**Symptoms**:
```bash
kubectl get ds monitor
# DESIRED: 0 even though you have nodes
```

**Diagnosis**:

```bash
# Check nodeSelector
kubectl get ds monitor -o jsonpath='{.spec.template.spec.nodeSelector}'

# Check node labels
kubectl get nodes --show-labels
```

**Common causes**:
- nodeSelector doesn't match any nodes
- Nodes have taints without corresponding tolerations
- All nodes are tainted as NoSchedule

**Quick Fix**:

```bash
# Remove nodeSelector if not needed
kubectl patch ds monitor --type json -p='[{"op": "remove", "path": "/spec/template/spec/nodeSelector"}]'

# Or label nodes to match
kubectl label node <node> <key>=<value>
```

### 7.2 Issue 2: Update Not Happening (60 seconds)

**Symptoms**: You updated the DaemonSet but Pods still have old spec.

**Diagnosis**:

```bash
# Check update strategy
kubectl get ds monitor -o jsonpath='{.spec.updateStrategy.type}'
```

**If it says "OnDelete"**:
- This is expected behavior
- You must manually delete Pods for updates

**Fix**:

```bash
# Either delete Pods manually
kubectl delete pod -l app=monitor

# Or change to RollingUpdate
kubectl patch ds monitor -p '{"spec":{"updateStrategy":{"type":"RollingUpdate"}}}'
```

### 7.3 Issue 3: HostPath Volume Failures (60 seconds)

**Symptoms**: Pods in CrashLoopBackOff or Error state.

**Diagnosis**:

```bash
kubectl describe pod <pod-name>
# Look for mount errors or path validation failures
```

**Common causes**:
- Path doesn't exist on node
- Wrong `hostPath.type` specified
- Permission denied

**Fixes**:

**If path doesn't exist**:
```yaml
hostPath:
  path: /var/log
  type: DirectoryOrCreate  # Change from Directory
```

**If permission issues**:
```yaml
securityContext:
  privileged: true  # Only if absolutely necessary
```

---

## Section 8: Exam Tips and Best Practices (2-3 minutes)

### 8.1 Time Management (90 seconds)

**1. DaemonSets are Quick**:
- No headless Service (unlike StatefulSets)
- No volumeClaimTemplates
- Target: 3-5 minutes per DaemonSet question

**2. Use Heredocs for Speed**:
```bash
kubectl apply -f - <<EOF
<yaml>
EOF
```

**3. Verification Shortcuts**:
```bash
# Quick verification
kubectl get ds <name> && kubectl get pods -l app=<name>

# One command to check everything
kubectl get ds,pods -l app=<name>
```

**4. Don't Watch Unnecessarily**:
- Use `--watch` to see first Pod start
- Press Ctrl+C immediately when status is clear
- Move to next task

**5. Label Nodes Efficiently**:
```bash
# Get first node and label in one command
kubectl label node $(kubectl get nodes -o jsonpath='{.items[0].metadata.name}') key=value
```

### 8.2 Common Exam Pitfalls (90 seconds)

**Pitfall 1: Including replicas Field**
✅ **Solution**: Remember - DaemonSets have NO replicas field

**Pitfall 2: Expecting Deployment Update Behavior**
✅ **Solution**: DaemonSets delete old Pods before creating new ones

**Pitfall 3: Wrong HostPath Type**
✅ **Solution**: Use `Directory` for existing paths, `DirectoryOrCreate` for new paths

**Pitfall 4: Init Container Not Sharing Volume**
✅ **Solution**: Ensure both init and main containers reference the same volume name

**Pitfall 5: Not Verifying Node Count**
✅ **Solution**: Always check that DESIRED matches your node count

**Pitfall 6: Forgetting to Label Nodes**
✅ **Solution**: When using nodeSelector, remember to actually label nodes

**Pitfall 7: Wrong Selector Syntax**
✅ **Solution**: It's `nodeSelector:` (Pod spec) not `nodeName:` or `node-selector:`

---

## Section 9: Quick Command Reference Card (90 seconds)

### 9.1 Must-Know Commands

**Creation and Viewing**:
```bash
kubectl apply -f daemonset.yaml
kubectl get ds
kubectl describe ds <name>
kubectl get ds <name> -o yaml
```

**Pod Operations**:
```bash
kubectl get pods -l app=<name> -o wide
kubectl logs -l app=<name>
kubectl delete pod <pod-name>
```

**Updates and Rollouts**:
```bash
kubectl edit ds <name>
kubectl rollout status ds/<name>
kubectl rollout undo ds/<name>
kubectl set image ds/<name> <container>=<new-image>
```

**Node Operations**:
```bash
kubectl label node <name> key=value
kubectl label node <name> key-  # Remove label
kubectl get nodes --show-labels
```

**Troubleshooting**:
```bash
kubectl describe ds <name>
kubectl describe pod <pod-name>
kubectl get events --sort-by='.lastTimestamp'
kubectl logs <pod-name>
```

**Deletion**:
```bash
kubectl delete ds <name>
kubectl delete ds <name> --cascade=orphan
```

---

## Section 10: Practice Exercise - Full Exam Simulation (3-4 minutes)

### 10.1 Timed Challenge (30 seconds)

**Your challenge**: Complete this in 5 minutes or less.

**Exam Question**:

"Create a DaemonSet named `fluentd` with these requirements:
- Image: fluent/fluentd:latest
- Label: app=fluentd
- Mount host's `/var/log` as read-only at `/var/log` in the container
- Use OnDelete update strategy
- Should only run on nodes labeled `logging=enabled`
- Verify the DaemonSet is created but no Pods exist (nodes not labeled yet)"

**Start your timer now.**

### 10.2 Solution (2-3 minutes)

After attempting it yourself:

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  updateStrategy:
    type: OnDelete
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      nodeSelector:
        logging: enabled
      containers:
      - name: fluentd
        image: fluent/fluentd:latest
        volumeMounts:
        - name: varlog
          mountPath: /var/log
          readOnly: true
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
          type: Directory
EOF

# Verify DaemonSet created
kubectl get ds fluentd

# Verify no Pods (DESIRED should be 0)
kubectl get pods -l app=fluentd
```

**Time Target**: 4-5 minutes total.

### 10.3 Self-Assessment (30 seconds)

**If you completed in**:
- **Under 4 minutes**: Excellent, exam-ready for DaemonSet questions
- **4-5 minutes**: Good, but practice the YAML structure more
- **5-6 minutes**: You need more practice to build speed
- **Over 6 minutes**: Review the syntax daily until under 5 minutes

**Focus Areas**:
- Struggled with YAML structure? Practice writing DaemonSets from scratch
- Struggled with nodeSelector? Practice the Pod spec structure
- Struggled with HostPath? Practice volume syntax

---

## Conclusion and Next Steps (90 seconds)

### Summary of Key Exam Points (60 seconds)

**Must-Know Concepts**:

**1. No Replicas Field**:
- DaemonSets automatically match node count
- Don't try to set replicas

**2. Update Strategy Differences**:
- RollingUpdate: Automatic, deletes before creating
- OnDelete: Manual, update by deleting Pods

**3. Node Selection**:
- `nodeSelector` for simple label matching
- Tolerations for tainted nodes
- Labels are dynamic - add label, get Pod

**4. HostPath Volumes**:
- Specify `type` for validation
- Use `readOnly: true` when possible
- Common types: Directory, DirectoryOrCreate, File, Socket

**5. Init Containers**:
- Run before main containers
- Share volumes with main containers
- Perfect for setup tasks

**6. Time Management**:
- Target 3-5 minutes per DaemonSet question
- Simpler than StatefulSets
- Verify quickly and move on

### Practice Recommendations (30 seconds)

**Before the exam**:
1. **Daily Practice**: Create 2-3 DaemonSets from scratch daily
2. **Timed Drills**: Set a 4-minute timer, practice under pressure
3. **Memorization**: Write DaemonSet YAML structure from memory
4. **Comparisons**: Practice explaining differences from Deployments
5. **Troubleshooting**: Practice the diagnosis commands

**Exam Day Strategy**:
- DaemonSet questions should be quick wins
- Don't overcomplicate - the YAML is straightforward
- Verify with `kubectl get ds` and `kubectl get pods`
- If nodeSelector is involved, verify the label logic
- Move on quickly - don't burn time on simple questions

**Final Thought**: DaemonSets are less common than Deployments but easier than StatefulSets. Master the basics, practice the syntax, and these should be confidence-building questions on exam day.

Good luck on your CKAD exam!

---

## Additional Resources

**Official Documentation** (allowed during exam):
- https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/
- https://kubernetes.io/docs/concepts/workloads/pods/init-containers/

**Practice Labs**:
- Complete the full DaemonSets lab (README.md)
- Work through all exercises in CKAD.md
- Try the lab challenges

**Next Topics to Review**:
- Deployments (core topic, higher priority)
- Services and networking
- Init containers and multi-container patterns
- Node affinity and taints/tolerations

**Total Duration**: 15-20 minutes

---

## Presentation Notes

**Delivery Tips**:
- Keep pace brisk - DaemonSets are simpler than StatefulSets
- Emphasize speed and efficiency
- Show real-time command execution
- Demonstrate error recovery

**Interactive Elements**:
- Have participants attempt the practice exercise
- Time them and discuss results
- Share common mistakes

**Materials Needed**:
- Working Kubernetes cluster
- Lab files ready
- Timer for practice exercise
- Notes on common pitfalls

**Audience Engagement**:
- Ask: "What happens if you add a replicas field?" (Answer: Error or ignored)
- Ask: "When do you use OnDelete vs RollingUpdate?"
- Poll: "Who can create a DaemonSet in under 4 minutes?"

**Emphasis Points**:
- NO replicas field (repeat this often)
- Different update behavior than Deployments
- HostPath security considerations
- Dynamic behavior with node labels
