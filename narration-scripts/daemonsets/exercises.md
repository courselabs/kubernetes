# DaemonSets - Practical Exercises
## Narration Script for Hands-On Demo

**Duration: 12-15 minutes**
**Target Audience: CKAD Candidates**
**Delivery Style: Step-by-step demonstration with clear explanations**

---

## Introduction (45 seconds)

Welcome to the hands-on DaemonSets lab session. In this demo, we'll work through practical exercises that demonstrate how DaemonSets behave in a real Kubernetes cluster.

**What We'll Cover**:
1. Deploy a DaemonSet with HostPath volumes
2. Observe update strategies and their effects
3. Work with init containers
4. Use node selectors to target specific nodes
5. Complete the lab challenge

**Prerequisites**:
- A working Kubernetes cluster
- kubectl configured
- Lab files from `labs/daemonsets/`

Let's get started with our first deployment.

---

## Section 1: Deploy a DaemonSet with HostPath (3-4 minutes)

### 1.1 Understanding the Example (60 seconds)

Our first example deploys Nginx as a DaemonSet. While Nginx doesn't typically need to run on every node, this example demonstrates DaemonSet patterns without complex infrastructure code.

The key features of this deployment:
- **HostPath volume**: Nginx logs are written directly to the node's disk at `/var/log/nginx`
- **One Pod per node**: Exactly one Nginx Pod per node in the cluster
- **Services for access**: LoadBalancer and NodePort Services for external access

**Why HostPath here?** This demonstrates a common DaemonSet pattern where node-level resources are accessed. In production, this might be a log collector reading from node directories or a monitoring agent accessing system metrics.

### 1.2 Examining the Specs (60 seconds)

Let's look at the DaemonSet spec in `labs/daemonsets/specs/nginx/daemonset.yaml`.

**Key sections**:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nginx
spec:
  selector:
    matchLabels:
      app: nginx
```

Notice there's **no replicas field**. The number of Pods is automatically determined by the number of nodes.

**The Pod spec with HostPath**:

```yaml
volumes:
- name: logs
  hostPath:
    path: /var/log/nginx
    type: DirectoryOrCreate
```

`DirectoryOrCreate` means Kubernetes will create the directory on the node if it doesn't exist.

**The volumeMount**:

```yaml
volumeMounts:
- name: logs
  mountPath: /var/log/nginx
```

Nginx logs written to `/var/log/nginx` in the container are actually written to the node's filesystem.

### 1.3 Deploying the DaemonSet (90 seconds)

Let's deploy everything:

```bash
kubectl apply -f labs/daemonsets/specs/nginx
```

Immediately check the DaemonSet status:

```bash
kubectl get daemonset
```

**Observe the output**:
- `DESIRED`: Number of nodes in your cluster
- `CURRENT`: Number of Pods currently running
- `READY`: Number of Pods ready to serve traffic
- `UP-TO-DATE`: Number of Pods with the latest spec
- `AVAILABLE`: Number of Pods available

In a single-node cluster, you'll see all values as `1`. In a 3-node cluster, you'll see `3`.

**Key Observation**: DaemonSets automatically scale with your cluster size. Add a node, get a Pod. Remove a node, lose its Pod.

Now let's check the Pods:

```bash
kubectl get pods -l app=nginx -o wide
```

Note the `NODE` column - each Pod is on a different node (if you have multiple nodes). With one node, you'll see one Pod.

### 1.4 Verifying Service Integration (60 seconds)

DaemonSet Pods work with Services just like any other Pods. Let's verify:

```bash
kubectl get pods -l app=nginx -o wide
```

Note the Pod IP address.

```bash
kubectl get endpoints nginx-np
```

The Service endpoint includes the DaemonSet Pod's IP address. Services don't care whether Pods come from Deployments, StatefulSets, or DaemonSets - they use labels to find Pods.

**Test the application**:

```bash
curl http://localhost:30010
# or browse to http://localhost:8010
```

You should see the Nginx welcome page. The DaemonSet is functioning like any other Pod controller from the Service's perspective.

---

## Section 2: Updating DaemonSets (3-4 minutes)

### 2.1 Understanding DaemonSet Update Behavior (45 seconds)

This is where DaemonSets differ significantly from Deployments. When you update a DaemonSet:

**Deployment behavior**: New Pods start → Verify they're healthy → Delete old Pods
**DaemonSet behavior**: Delete old Pods → Start new Pods

This means DaemonSet updates can cause temporary service interruption per node. Let's see this in action with a broken update.

### 2.2 Deploying a Bad Update (90 seconds)

We have a spec that intentionally breaks the DaemonSet to demonstrate update behavior.

Look at `labs/daemonsets/specs/nginx/update-bad/daemonset-bad-command.yaml`. It changes the container command to something that will immediately exit.

Deploy the bad update:

```bash
kubectl apply -f labs/daemonsets/specs/nginx/update-bad
```

Watch what happens to the Pods:

```bash
kubectl get pods -l app=nginx --watch
```

**Observe the sequence**:
1. The existing Pod goes into `Terminating` status
2. The Pod is fully terminated (disappears)
3. A new Pod is created
4. The new Pod starts but enters `CrashLoopBackOff` or `Error` status

Press Ctrl+C to stop watching.

**Critical Point**: The old working Pod was deleted **before** Kubernetes verified the new Pod worked. Your application is now broken.

Try accessing the app:

```bash
curl http://localhost:30010
# This will fail or timeout
```

**Contrast with Deployment**: With a Deployment, the old Pod would still be running because Kubernetes wouldn't delete it until the new Pod was Ready. DaemonSets can't do this because there can only be one Pod per node.

### 2.3 Fixing with Init Containers (90 seconds)

The proper way to do what that bad update attempted is to use an init container. Init containers run before the main application container and are perfect for setup tasks.

Let's look at `labs/daemonsets/specs/nginx/update-good/daemonset-init-container.yaml`:

```yaml
initContainers:
- name: write-html
  image: busybox
  command:
  - sh
  - -c
  - echo '<h1>DaemonSet with Init Container</h1>' > /usr/share/nginx/html/index.html
  volumeMounts:
  - name: html
    mountPath: /usr/share/nginx/html
```

The init container writes a custom HTML page, then exits. Then the Nginx container starts and serves that page.

Deploy the fix:

```bash
kubectl apply -f labs/daemonsets/specs/nginx/update-good
```

Watch the rollout:

```bash
kubectl get pods -l app=nginx --watch
```

**Observe the new statuses**:
- `Init:0/1` - Init container is running
- `PodInitializing` - Init container completed, main container starting
- `Running` - All containers running

Press Ctrl+C when the Pod is Running.

**Verify the init container output**:

```bash
kubectl logs -l app=nginx
```

You should see Nginx access logs.

Check the HTML content:

```bash
kubectl exec daemonset/nginx -- cat /usr/share/nginx/html/index.html
```

You'll see the custom HTML written by the init container.

**Test the application**:

```bash
curl http://localhost:30010
```

The application is working again with the new content.

**Key Learning**: Use init containers for setup tasks, not by modifying the main application's command.

---

## Section 3: Node Selection with Labels (3-4 minutes)

### 3.1 Understanding Node Selectors (45 seconds)

One of DaemonSet's most powerful features is the ability to target specific nodes. This is done using node labels and selectors.

**The Pattern**:
1. Label nodes with specific criteria
2. DaemonSet uses nodeSelector to target those labels
3. Pods only run on matching nodes

Let's see this in practice with our Nginx DaemonSet.

### 3.2 Deploying with Node Selector (60 seconds)

The spec at `labs/daemonsets/specs/nginx/update-subset/daemonset-node-selector.yaml` adds a nodeSelector:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        kubernetes.courselabs.co.ip: public
```

This means: "Only create Pods on nodes that have the label `kubernetes.courselabs.co.ip=public`."

Deploy this update:

```bash
kubectl apply -f labs/daemonsets/specs/nginx/update-subset
```

Watch what happens:

```bash
kubectl get pods -l app=nginx --watch
```

**Observe**: The existing Pod(s) are terminated and no new Pods are created!

Press Ctrl+C and check the DaemonSet status:

```bash
kubectl get daemonset nginx
```

You'll see `DESIRED: 0` because no nodes match the selector criteria. The DaemonSet controller calculated that zero Pods should exist, so it deleted the existing one.

### 3.3 Adding the Label to Activate the DaemonSet (90 seconds)

Now let's label a node to match the selector.

First, find your node name:

```bash
kubectl get nodes
```

Now label the node:

```bash
kubectl label node $(kubectl get nodes -o jsonpath='{.items[0].metadata.name}') kubernetes.courselabs.co.ip=public
```

This command gets the first node's name and labels it. Watch the Pods immediately:

```bash
kubectl get pods -l app=nginx --watch
```

**Observe**: A new Pod is created almost immediately! The DaemonSet controller detected that a node now matches the criteria and created a Pod for it.

Press Ctrl+C when the Pod is Running.

**Test the application again**:

```bash
curl http://localhost:30010
```

It's working again.

**Key Insight**: DaemonSets are dynamic. Change node labels, and the DaemonSet automatically adjusts. This is powerful for:
- Different DaemonSets on different node types (GPU vs CPU)
- Environment-specific agents (production vs development nodes)
- Gradually rolling out new infrastructure components

---

## Section 4: Lab Challenge - Manual Updates and Orphan Pods (2-3 minutes)

### 4.1 Challenge Introduction (30 seconds)

The lab includes a challenge to explore two less common but useful DaemonSet features:

**Challenge 1**: Configure manual update control - update the DaemonSet spec but have Pods only update when you manually delete them.

**Challenge 2**: Delete the DaemonSet but keep the Pods running.

These demonstrate advanced DaemonSet capabilities. Let's work through the solutions.

### 4.2 Challenge 1 Solution - OnDelete Update Strategy (90 seconds)

**Objective**: Use the OnDelete update strategy for manual rollout control.

The solution involves changing the updateStrategy to OnDelete:

```yaml
spec:
  updateStrategy:
    type: OnDelete
```

**Full solution** (from `labs/daemonsets/solution.md`):

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nginx
  labels:
    kubernetes.courselabs.co: daemonsets
spec:
  selector:
    matchLabels:
      app: nginx
  updateStrategy:
    type: OnDelete
  template:
    metadata:
      labels:
        app: nginx
    spec:
      nodeSelector:
        kubernetes.courselabs.co.ip: public
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
        - name: logs
          mountPath: /var/log/nginx
      volumes:
      - name: logs
        hostPath:
          path: /var/log/nginx
          type: DirectoryOrCreate
EOF
```

Apply this spec:

```bash
kubectl apply -f <your-solution-file>
```

Now make a change to test it (for example, add an environment variable):

```bash
kubectl edit daemonset nginx
# Add an environment variable to the container spec, then save
```

Check the Pods:

```bash
kubectl get pods -l app=nginx
```

**Observe**: The Pods are still running with the old spec! The update didn't trigger a rollout.

Now manually delete a Pod:

```bash
kubectl delete pod -l app=nginx
```

Watch the new Pod come up:

```bash
kubectl get pods -l app=nginx --watch
```

**Observe**: The new Pod has the updated spec with your changes.

**Key Learning**: OnDelete gives you complete control over when updates happen. This is useful for critical infrastructure where you want to test updates on one node before proceeding.

### 4.3 Challenge 2 Solution - Orphan Pods (60 seconds)

**Objective**: Delete the DaemonSet but leave Pods running.

This uses the `--cascade=orphan` flag:

```bash
kubectl delete daemonset nginx --cascade=orphan
```

Now check:

```bash
kubectl get daemonset
```

No DaemonSets are listed.

```bash
kubectl get pods -l app=nginx
```

But the Pods are still there!

**What happened?**

The DaemonSet object was deleted, but Kubernetes didn't cascade the deletion to the Pods it managed. The Pods are now "orphaned" - they continue running but have no controller managing them.

**Use Case**: This is useful when:
- Migrating from a DaemonSet to another controller type
- Performing cluster maintenance that requires removing the DaemonSet object temporarily
- Debugging without disrupting running services

**Important**: Orphaned Pods won't be recreated if they fail or are deleted. They have no controller watching them.

To fully clean up:

```bash
kubectl delete pods -l app=nginx
```

---

## Section 5: Extra Content - Pod Affinity with DaemonSets (2 minutes, optional)

### 5.1 The Debug Pod Pattern (60 seconds)

The lab includes an advanced pattern: deploying a Pod that must land on the same node as a DaemonSet Pod. This is useful for debugging.

**The Scenario**: Your DaemonSet writes logs to a HostPath volume. You want to deploy a debug Pod that can access those same logs.

**The Solution**: Use Pod affinity to co-locate the debug Pod.

Let's look at `labs/daemonsets/specs/sleep-with-hostPath.yaml`:

```yaml
affinity:
  podAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchLabels:
          app: nginx
      topologyKey: kubernetes.io/hostname
```

This says: "Schedule this Pod on the same node (hostname) as a Pod with label `app=nginx`."

The spec also includes the same HostPath volume as the Nginx DaemonSet:

```yaml
volumes:
- name: nginx-logs
  hostPath:
    path: /var/log/nginx
    type: Directory
```

### 5.2 Testing Shared HostPath Access (60 seconds)

First, ensure the Nginx DaemonSet is running:

```bash
kubectl apply -f labs/daemonsets/specs/nginx
```

Deploy the sleep Pod with affinity:

```bash
kubectl apply -f labs/daemonsets/specs/sleep-with-hostPath.yaml
```

Verify they're on the same node:

```bash
kubectl get pods -l app -o wide
```

The `NODE` column should show both Pods on the same node.

**Access the shared logs**:

From the Nginx Pod:

```bash
kubectl exec daemonset/nginx -- ls -l /var/log/nginx
```

From the sleep Pod:

```bash
kubectl exec pod/sleep -- ls -l /node-root/volumes/nginx-logs
```

Both Pods see the same files because they're accessing the same node directory via HostPath.

**Practical Use**: This pattern is useful for debugging DaemonSets that use HostPath volumes. You can deploy a debug Pod with tools and access the same node resources.

---

## Section 6: Cleanup and Key Observations (2 minutes)

### 6.1 Cleanup Process (30 seconds)

Let's clean up all the lab resources:

```bash
kubectl delete svc,ds,po -l kubernetes.courselabs.co=daemonsets
```

This deletes:
- Services (svc)
- DaemonSets (ds)
- Pods (po)

All resources labeled with `kubernetes.courselabs.co=daemonsets`.

Verify everything is cleaned up:

```bash
kubectl get all -l kubernetes.courselabs.co=daemonsets
```

Should show no resources.

### 6.2 Key Observations from the Lab (90 seconds)

Let's recap what we learned through hands-on practice:

**1. Automatic Scaling**: DaemonSets automatically adjust to cluster size. One Pod per node, always.

**2. Update Behavior**: Unlike Deployments, DaemonSets delete old Pods before creating new ones. This can cause service interruption.

**3. Init Containers**: The proper way to perform setup tasks before the main container starts. Init containers run to completion, then the main container starts.

**4. Node Selection**: Using nodeSelector, DaemonSets dynamically respond to node labels. Add a label, get a Pod. Remove a label, lose the Pod.

**5. Manual Control**: OnDelete strategy gives you complete control over when updates happen, perfect for critical infrastructure.

**6. Orphan Pods**: Using `--cascade=orphan` allows removing the DaemonSet without affecting running Pods.

**7. HostPath Volumes**: Commonly used in DaemonSets to access node-level resources like logs, metrics, or the container runtime.

**8. Pod Affinity**: Debug Pods can be co-located with DaemonSet Pods using affinity rules to share HostPath volumes.

---

## Conclusion (60 seconds)

This concludes our hands-on DaemonSets lab. You've now:
- Deployed a DaemonSet with HostPath volumes
- Observed different update behaviors
- Used init containers for proper setup tasks
- Implemented node selection with labels
- Explored manual update control
- Learned about orphan Pods and debugging patterns

**Key Skills for CKAD**:
- Know how to create a DaemonSet from YAML
- Understand there's no replicas field
- Remember update behavior differs from Deployments
- Know how to use nodeSelector for targeting
- Understand OnDelete vs RollingUpdate strategies

**Practice Recommendations**:
1. Repeat this lab until you can deploy a DaemonSet in under 3 minutes
2. Practice adding init containers from memory
3. Experiment with different node selector scenarios
4. Try the OnDelete strategy and manual Pod deletion workflow
5. Review differences between DaemonSet and Deployment update behavior

**Common Pitfalls to Avoid**:
- Don't try to set a `replicas` field - DaemonSets don't have one
- Remember RollingUpdate deletes before creating (opposite of Deployments)
- Don't forget to specify HostPath `type` for validation
- Be aware that OnDelete requires manual Pod deletion for updates

**Time Estimate**: In an exam scenario, creating a basic DaemonSet should take 3-4 minutes. Adding init containers or node selectors adds 1-2 minutes each.

**Next Steps**: In the CKAD exam prep session, we'll work through timed scenarios, practice troubleshooting, and review common exam questions involving DaemonSets.

---

## Presentation Notes

**Demo Environment**:
- Have a working cluster ready
- Test all commands before the session
- Consider using a multi-node cluster if available (shows DaemonSet behavior better)
- Have lab files accessible and tested

**Timing Breakdown**:
- Section 1 (Deploy): 3-4 minutes
- Section 2 (Updates): 3-4 minutes
- Section 3 (Node Selection): 3-4 minutes
- Section 4 (Lab Challenge): 2-3 minutes
- Section 5 (Extra/Optional): 2 minutes
- Section 6 (Cleanup): 2 minutes
- **Total**: 13-19 minutes (flexible based on optional content)

**Demo Tips**:
- Show real kubectl output, don't just read the commands
- Point out differences when comparing with Deployment behavior
- Emphasize the "one Pod per node" concept throughout
- Use `--watch` to show dynamic behavior
- Pause for questions after Section 3 (Node Selection)

**Common Demo Issues**:
- Single-node clusters: Acknowledge that DaemonSet behavior is more visible with multiple nodes
- HostPath permissions: May need to adjust security contexts depending on cluster
- Label commands: Double-check node names before labeling

**Interactive Elements**:
- Ask participants to predict what happens when you apply the bad update
- Have them guess what `DESIRED: 0` means when nodeSelector doesn't match
- Encourage them to run commands in their own environments
- Pause for questions after demonstrating the update behavior difference

**Engagement Strategies**:
- Ask: "What do you think happens if we delete the Pod?"
- Ask: "How is this different from a Deployment?"
- Encourage predictions: "What will happen when we label the node?"

**Visual Aids**:
- Show `kubectl get pods -o wide` frequently to highlight the NODE column
- Use split terminal to show DaemonSet status and Pod status side-by-side
- Keep a browser tab open to test the application after each update

**Total Duration**: 12-15 minutes (core content), up to 19 minutes with optional section
