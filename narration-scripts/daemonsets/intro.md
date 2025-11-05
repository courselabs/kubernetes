# DaemonSets - Concept Introduction
## Narration Script for Slideshow Presentation

**Duration: 8-10 minutes**
**Target Audience: CKAD Candidates**
**Delivery Style: Professional, practical, focused**

---

## Slide 1: Introduction to DaemonSets (45 seconds)

Welcome to this session on Kubernetes DaemonSets. Today we'll explore a specialized Pod controller that ensures exactly one Pod runs on each node in your cluster.

DaemonSets are less common than Deployments or StatefulSets, but they serve a critical role in Kubernetes infrastructure. You'll find them managing node-level services like monitoring agents, log collectors, and network plugins.

**Key Point**: While you'll use Deployments for most applications, DaemonSets are essential when you need to run a component on every node, or when your application needs to interact directly with node resources.

---

## Slide 2: What Makes DaemonSets Different (90 seconds)

Let me explain what makes DaemonSets unique compared to other Pod controllers.

**The Core Concept**:
With a Deployment, you specify the number of replicas: "I want 3 Pods." Kubernetes distributes these 3 Pods across available nodes based on scheduling algorithms.

With a DaemonSet, you don't specify a replica count. Instead, you say: "I want exactly one Pod on every node." Kubernetes automatically maintains this by:
- Creating a Pod when a new node joins the cluster
- Removing the Pod when a node is removed
- Ensuring exactly one Pod per node, never more, never less

**Automatic Scaling**:
In a cluster with 3 nodes, a DaemonSet creates 3 Pods.
If you add a 4th node, Kubernetes automatically creates a 4th Pod on that node.
If a node is removed, its DaemonSet Pod is also removed.

**The "Daemon" Analogy**:
The name comes from Unix daemons - background processes that run continuously on every system. Similarly, DaemonSet Pods are background services running on every Kubernetes node.

---

## Slide 3: Common DaemonSet Use Cases (90 seconds)

Let's look at the real-world scenarios where DaemonSets are the right choice.

**1. Monitoring and Metrics Collection**:
- **Node Exporter** (Prometheus): Collects hardware and OS metrics from each node
- **Datadog Agent**: Monitors all containers running on each node
- **New Relic Agent**: Application performance monitoring per node

**Why DaemonSets?** Monitoring agents need to run on every node to collect complete cluster metrics.

**2. Log Collection**:
- **Fluentd**: Collects logs from all containers on a node
- **Filebeat**: Ships log files to central logging systems
- **Logstash**: Processes and forwards logs

**Why DaemonSets?** Log collectors need access to node-level log directories and must run wherever containers are running.

**3. Network Infrastructure**:
- **CNI Plugins** (Calico, Weave, Flannel): Manage pod networking on each node
- **Kube-proxy**: Handles network routing rules on nodes

**Why DaemonSets?** Network plugins must operate at the node level to configure networking for all Pods.

**4. Storage Plugins**:
- **Ceph agents**: Manage distributed storage per node
- **GlusterFS daemons**: Provide storage services

**Why DaemonSets?** Storage systems need local agents on each node to manage disk resources.

**5. Security and Compliance**:
- **Falco**: Runtime security monitoring on each node
- **Sysdig**: System visibility and security

**Why DaemonSets?** Security tools need to monitor all activity on every node.

**Common Pattern**: If your application needs to work with node-level resources (logs, metrics, network, storage), consider a DaemonSet.

---

## Slide 4: DaemonSets vs Deployments (90 seconds)

Understanding when to use each controller is crucial for the CKAD exam. Let's compare them side by side.

**Replica Management**:
- **Deployment**: You specify replicas (e.g., `replicas: 3`)
- **DaemonSet**: Automatic - one Pod per matching node (no replicas field)

**Scheduling Distribution**:
- **Deployment**: Kubernetes scheduler distributes Pods across nodes for best resource utilization
- **DaemonSet**: One Pod per node, guaranteed

**Scaling Behavior**:
- **Deployment**: Scale by changing the replica count
- **DaemonSet**: "Scale" by adding or removing nodes, or by changing node labels

**Update Strategy**:
- **Deployment**: Default is RollingUpdate - creates new Pods before removing old ones
- **DaemonSet**: Default is RollingUpdate - removes old Pods before creating new ones (different behavior)

**Use Case Focus**:
- **Deployment**: Application workloads, stateless services, APIs, web servers
- **DaemonSet**: Infrastructure services, node-level agents, system daemons

**Resource Access**:
- **Deployment**: Typically uses cluster resources (Services, ConfigMaps, PVCs)
- **DaemonSet**: Often uses node resources (HostPath volumes, host networking)

**Example Decision**:
- Web application serving traffic? → Deployment
- Log collector on every node? → DaemonSet
- Database with 3 replicas? → StatefulSet
- Monitoring agent on every node? → DaemonSet

---

## Slide 5: Node Selection and Targeting (90 seconds)

One of DaemonSet's most useful features is the ability to target specific nodes. Let me explain the three approaches.

**Approach 1: Run on All Nodes (Default)**

By default, a DaemonSet creates a Pod on every node:
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitoring-agent
spec:
  selector:
    matchLabels:
      app: monitoring
  template:
    # Pod spec
```

No node selection criteria - runs everywhere.

**Approach 2: Node Selector (Simple Filtering)**

Use node labels to target specific nodes:
```yaml
spec:
  template:
    spec:
      nodeSelector:
        disktype: ssd
```

Pods only run on nodes labeled `disktype=ssd`.

**Use Case**: Deploy a DaemonSet only to GPU nodes, or only to production nodes, or only to nodes with SSDs.

**Approach 3: Tolerations (Run on Special Nodes)**

Some nodes have taints that prevent normal Pod scheduling (like master nodes). DaemonSets can use tolerations to run on these nodes:

```yaml
spec:
  template:
    spec:
      tolerations:
      - key: node-role.kubernetes.io/master
        effect: NoSchedule
```

**Use Case**: Deploy monitoring or networking DaemonSets that need to run even on control plane nodes.

**Dynamic Behavior**:
When you label a node, matching DaemonSets automatically create Pods on it.
When you remove a label, the DaemonSet removes its Pod from that node.

This makes DaemonSets ideal for heterogeneous clusters where you have different types of nodes.

---

## Slide 6: HostPath Volumes and Node Access (90 seconds)

DaemonSets commonly need access to node resources, which is achieved through HostPath volumes. Let me explain this important pattern.

**What is a HostPath Volume?**

A HostPath volume mounts a directory or file from the node's filesystem directly into the Pod:

```yaml
volumes:
- name: varlog
  hostPath:
    path: /var/log
    type: Directory
```

This gives the Pod access to the node's `/var/log` directory.

**Common HostPath Use Cases in DaemonSets**:

**1. Log Collection**:
```yaml
hostPath:
  path: /var/log
```
Access node and container logs.

**2. Container Runtime Access**:
```yaml
hostPath:
  path: /var/run/docker.sock
  type: Socket
```
Interact with the container runtime (for monitoring or management).

**3. System Metrics**:
```yaml
hostPath:
  path: /proc
hostPath:
  path: /sys
```
Collect system-level metrics.

**Security Considerations**:

HostPath volumes are powerful but potentially dangerous:
- Pods can read sensitive node files
- Pods can write to node directories
- Container breakout could affect the host

**Best Practices**:
1. Use **read-only** mounts when possible: `readOnly: true`
2. Limit HostPath usage to trusted workloads
3. Use Pod Security Standards to restrict HostPath usage
4. Specify the `type` field for validation

**HostPath Types**:
- `Directory` - must exist as a directory
- `DirectoryOrCreate` - create if doesn't exist
- `File` - must exist as a file
- `Socket` - must exist as a Unix socket

**Exam Relevance**: DaemonSet questions often involve HostPath volumes for log collection scenarios.

---

## Slide 7: Update Strategies - RollingUpdate vs OnDelete (90 seconds)

DaemonSets support two update strategies that control how Pods are replaced during updates. Understanding these is critical.

**Strategy 1: RollingUpdate (Default)**

When you update the DaemonSet spec, Pods are automatically replaced:

```yaml
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
```

**How it works**:
1. DaemonSet spec is updated
2. Old Pods are terminated (node by node)
3. New Pods are created with updated spec
4. Process continues until all nodes are updated

**maxUnavailable**: Controls how many nodes can have their Pod missing during update.
- Value of `1` means update one node at a time
- Value of `2` means update two nodes simultaneously
- Can be a percentage like `20%`

**Critical Difference from Deployments**:
DaemonSets **terminate the old Pod before starting the new one** on each node. Deployments do the opposite. This means DaemonSet updates can cause brief service interruptions per node.

**Strategy 2: OnDelete (Manual Control)**

With OnDelete, updates don't happen automatically:

```yaml
spec:
  updateStrategy:
    type: OnDelete
```

**How it works**:
1. You update the DaemonSet spec
2. Nothing happens to existing Pods
3. You manually delete Pods one by one
4. Each deleted Pod is recreated with the new spec

**Use Cases for OnDelete**:
- Critical infrastructure where you want to control update timing
- Coordinating updates with external systems
- Testing updates on one node before rolling out cluster-wide
- Maintenance windows for specific nodes

**Exam Tip**: If a question asks for "manual control over Pod updates" or "one node at a time at your discretion," use `updateStrategy.type: OnDelete`.

---

## Slide 8: Init Containers in DaemonSets (60 seconds)

Init containers are frequently used with DaemonSets to prepare the node environment before the main container starts.

**Common Init Container Patterns**:

**Pattern 1: Setup Host Configuration**
```yaml
initContainers:
- name: setup
  image: busybox
  command: ['sh', '-c', 'sysctl -w net.ipv4.ip_forward=1']
  securityContext:
    privileged: true
```
Configure kernel parameters or system settings.

**Pattern 2: Wait for Dependencies**
```yaml
initContainers:
- name: wait-for-service
  image: busybox
  command: ['sh', '-c', 'until nslookup myservice; do sleep 2; done']
```
Ensure required services are available before starting.

**Pattern 3: Download Configuration**
```yaml
initContainers:
- name: fetch-config
  image: busybox
  command: ['sh', '-c', 'wget http://config-server/config -O /config/app.conf']
  volumeMounts:
  - name: config
    mountPath: /config
```
Retrieve configuration files before the main application starts.

**Key Benefit**: Init containers run to completion before the main container starts, ensuring the environment is properly prepared. They share volumes with the main container, allowing data passing.

---

## Slide 9: DaemonSet Lifecycle and Pod Management (60 seconds)

Understanding DaemonSet lifecycle behavior helps with troubleshooting and exam scenarios.

**Pod Creation Sequence**:
1. DaemonSet controller watches node status
2. When a node becomes Ready, controller creates a Pod for it
3. Pod is scheduled to that specific node (not by the regular scheduler)
4. If multiple DaemonSets target the same node, all their Pods are created

**Pod Deletion Scenarios**:

**Scenario 1: Node Becomes Unavailable**
- DaemonSet Pod is marked for deletion
- After a grace period, Pod is forcefully terminated

**Scenario 2: Node Label Changes**
- If labels no longer match nodeSelector, Pod is deleted
- If labels now match, Pod is created

**Scenario 3: DaemonSet Deleted**
- All Pods are deleted (cascading delete by default)
- Can use `--cascade=orphan` to keep Pods running

**Scenario 4: Scale Down Cluster**
- Remove a node from the cluster
- Its DaemonSet Pods are automatically cleaned up

**Pod Replacement**:
If a DaemonSet Pod is manually deleted, it's immediately recreated by the controller. This ensures the "one Pod per node" guarantee.

**Exam Relevance**: Questions might ask what happens when you change node labels or update a DaemonSet.

---

## Slide 10: CKAD Exam Relevance and Focus Areas (60 seconds)

DaemonSets are supplementary material for CKAD, similar to StatefulSets. Let's focus on what you need to know.

**Exam Weight**: Approximately 1-2 questions may involve DaemonSets, typically in the "Application Deployment" domain.

**What You Must Know**:

**1. Core Concepts**:
- No replicas field - automatic one-per-node
- Update strategies: RollingUpdate vs OnDelete
- Node selection with nodeSelector
- Differences from Deployments

**2. Practical Skills**:
- Create a DaemonSet from YAML
- Configure HostPath volumes
- Implement init containers
- Use nodeSelector for targeting
- Update and rollback DaemonSets

**3. Common Exam Scenarios**:
- Deploy a log collector to all nodes
- Create a monitoring agent DaemonSet
- Troubleshoot a DaemonSet not scheduling on certain nodes
- Update a DaemonSet with manual control

**4. Quick Commands You Need**:
```bash
kubectl get daemonset      # or 'ds'
kubectl describe ds <name>
kubectl rollout status ds/<name>
kubectl rollout undo ds/<name>
```

**Time Consideration**: DaemonSets are simpler than StatefulSets (no volumeClaimTemplates, no headless Service requirement). You should be able to create one in 3-4 minutes.

**Focus Priority**: DaemonSets are less likely to appear than Deployments or Services, so allocate your study time accordingly. Master the basics, but don't over-invest time at the expense of core topics.

---

## Slide 11: Key Differences from Other Controllers (60 seconds)

Let's summarize how DaemonSets compare to other Pod controllers to solidify your understanding.

**DaemonSet vs Deployment**:
- DaemonSet: One Pod per node, node-level services
- Deployment: N replicas distributed, application workloads

**DaemonSet vs StatefulSet**:
- DaemonSet: No stable network identity, node-focused
- StatefulSet: Stable Pod names/DNS, stateful applications

**DaemonSet vs Job**:
- DaemonSet: Long-running Pods, restarts on failure
- Job: Run-to-completion tasks, terminates when done

**DaemonSet vs Bare Pods**:
- DaemonSet: Controller manages lifecycle, auto-recreates
- Bare Pod: No management, manual creation/deletion

**When to Use DaemonSets** (Decision Tree):
- Does it need to run on every node? → Likely DaemonSet
- Does it interact with node resources? → Likely DaemonSet
- Is it a system/infrastructure service? → Likely DaemonSet
- Does it need stable network identity? → Use StatefulSet instead
- Is it a stateless application? → Use Deployment instead

---

## Slide 12: Key Takeaways and Summary (60 seconds)

Let's recap the essential concepts about DaemonSets for the CKAD exam.

**Core Characteristics**:
1. **One Pod per node** - automatically maintained by the controller
2. **No replicas field** - Pod count is determined by matching node count
3. **Node-level services** - monitoring, logging, networking, storage
4. **HostPath volumes** - commonly used for node resource access
5. **Different update behavior** - terminates old Pod before creating new one

**Configuration Essentials**:
- Use `nodeSelector` to target specific nodes
- Use `tolerations` to run on tainted nodes (like masters)
- Choose `RollingUpdate` for automatic updates or `OnDelete` for manual control
- Set `maxUnavailable` to control update speed

**Common Use Cases**:
- Monitoring agents (Prometheus Node Exporter, Datadog)
- Log collectors (Fluentd, Filebeat)
- Network plugins (Calico, Weave)
- Security agents (Falco, Sysdig)

**Exam Gotchas**:
- Don't try to set a replicas field - DaemonSets don't have one
- Remember RollingUpdate deletes old Pods first (different from Deployments)
- HostPath volumes need the `type` field for validation
- OnDelete means manual deletion of Pods is required for updates

**Quick Reference**:
- Shorthand: `ds` (e.g., `kubectl get ds`)
- No headless Service requirement (unlike StatefulSets)
- Simpler than StatefulSets, less common than Deployments

---

## Transition to Exercises (30 seconds)

This concludes the conceptual overview of DaemonSets. You should now understand:
- What DaemonSets are and why they exist
- How they differ from Deployments and StatefulSets
- When to use DaemonSets in real-world scenarios
- Key configuration options and behaviors

In our next session, we'll work hands-on with DaemonSets, deploying real examples and exploring their behavior in a live cluster. We'll cover:
- Deploying a DaemonSet with HostPath volumes
- Testing update strategies
- Using init containers for setup tasks
- Node selection with labels
- The lab challenge

**Total Duration**: 10 minutes

---

## Presentation Notes

**Pacing Tips**:
- This is a shorter session than StatefulSets - keep it focused
- Emphasize practical use cases over theory
- Use real-world examples (Prometheus, Fluentd) that candidates may recognize
- Keep slide transitions smooth

**Visual Recommendations**:
- Slide 2: Diagram showing one Pod per node distribution
- Slide 4: Side-by-side comparison table (DaemonSet vs Deployment)
- Slide 5: Node selection visual with labeled nodes
- Slide 7: Update strategy flow diagram
- Slide 9: Lifecycle state diagram

**Common Questions to Anticipate**:
- Q: Can I set replicas in a DaemonSet? A: No, it's automatically determined by node count.
- Q: What if I only want to run on some nodes? A: Use nodeSelector or node affinity.
- Q: Are DaemonSets important for CKAD? A: They're supplementary but may appear in 1-2 questions.
- Q: When should I use OnDelete vs RollingUpdate? A: Use OnDelete when you need manual control over update timing.

**Engagement Tips**:
- Ask: "Who has seen Prometheus Node Exporter or Fluentd in production?"
- Ask: "What happens if you add a node to a cluster with DaemonSets running?"
- Show real kubectl output examples for each concept

**Time Management**:
- Core content: 8 minutes
- Q&A buffer: 2 minutes
- Stay within 10 minutes total to keep momentum
