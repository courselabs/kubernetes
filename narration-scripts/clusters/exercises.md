# Kubernetes Clusters - Practical Demo
## Narration Script for Hands-On Exercises (12-15 minutes)

### Section 1: Creating Multi-Node Cluster (3 min)
**[00:00-03:00]**

Let's create a 3-node cluster with k3d.

We have one control plane (server) and two workers (agents). Let's check the node details to see capacity, allocatable resources, and conditions.

The node information shows us the resources available, the current conditions like Ready status, and various details about the node's configuration.

---

### Section 2: Taints and Tolerations (4 min)
**[03:00-07:00]**

Let's deploy the whoami app across all nodes to see the default behavior.

Pods are distributed across all nodes. Now let's taint a node with NoSchedule. This prevents new Pods from being scheduled there.

Let's restart the deployment to force rescheduling.

No new Pods schedule on agent-1 due to the taint. Now let's taint the control plane with NoExecute, which is more aggressive.

Pods on the server get evicted immediately with NoExecute. This is different from NoSchedule, which only prevents new scheduling.

Now let's update the deployment with a toleration that allows Pods to schedule on the tainted node.

Now Pods can schedule on agent-1 because they tolerate the taint. This demonstrates how tolerations give specific Pods permission to run on tainted nodes.

---

### Section 3: Node Labels and Scheduling (3 min)
**[07:00-10:00]**

Let's add topology labels to simulate a real cloud environment with regions and zones.

These topology labels are used for zone-aware scheduling and can influence Pod placement decisions.

Now let's deploy a DaemonSet with a node selector.

The DaemonSet respects both taints and node selectors, so it only runs on nodes that match its criteria.

---

### Section 4: Node Maintenance (3 min)
**[10:00-13:00]**

Let's practice node maintenance operations. First, we'll cordon a node, which marks it as unschedulable.

The status now shows SchedulingDisabled. New Pods won't be scheduled here, but existing Pods continue running.

Now let's drain the node, which evicts all Pods.

Pods are evicted and rescheduled to other nodes. Draining is essential before performing maintenance on a node.

Now let's uncordon the node to make it available again.

The node is available again for scheduling. Note that Pods don't automatically move back - they stay where they were rescheduled.

Time for cleanup.

---

## Recording Notes

**Timing:**
- Section 1: 3 minutes
- Section 2: 4 minutes
- Section 3: 3 minutes
- Section 4: 3 minutes
- Total: 13 minutes

**Key Points:**
- Emphasize the difference between NoSchedule and NoExecute taints
- Show how tolerations work with taints
- Demonstrate the cordon/drain/uncordon workflow for maintenance
- Highlight that DaemonSets respect taints and selectors

**Visual Focus:**
- Show Pod distribution across nodes clearly
- Highlight taint effects on Pod scheduling
- Display node status changes during cordon/drain operations
- Keep node names visible for clarity
