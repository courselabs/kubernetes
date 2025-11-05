# DaemonSets - Quickfire Questions

Test your knowledge of Kubernetes DaemonSets with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary purpose of a DaemonSet?

A) To run multiple replicas of a Pod
B) To run exactly one Pod per node in the cluster
C) To manage StatefulSets
D) To run Jobs on a schedule

### 2. When a new node is added to a cluster with an existing DaemonSet, what happens?

A) The DaemonSet must be restarted
B) A Pod is automatically added to the new node
C) You must update the DaemonSet spec
D) Nothing, you must manually scale the DaemonSet

### 3. Can you control which nodes a DaemonSet deploys Pods to?

A) Yes, using the nodes field in the spec
B) No, it always deploys to all nodes
C) Yes, but only with annotations
D) Yes, using nodeSelector, affinity, or taints/tolerations

### 4. What happens to DaemonSet Pods when a node is removed from the cluster?

A) The Pods are moved to other nodes
B) The Pods are garbage collected
C) The DaemonSet creates replacement Pods
D) The Pods remain and must be manually deleted

### 5. Which update strategy allows you to manually delete DaemonSet Pods to trigger updates?

A) OnDelete
B) Manual
C) RollingUpdate
D) Recreate

### 6. What is the default update strategy for DaemonSets?

A) Recreate
B) RollingUpdate
C) OnDelete
D) Manual

### 7. Can a DaemonSet run multiple Pods on the same node?

A) Yes, if replicas are specified
B) Yes, if parallelism is set
C) No, DaemonSets ensure only one Pod per node
D) Yes, by default

### 8. What is a common use case for DaemonSets?

A) Running databases
B) Running web applications
C) Running batch Jobs
D) Running node-level services like log collectors or monitoring agents

### 9. How do DaemonSets handle nodes with taints?

A) Taints are removed automatically
B) You must add tolerations to the Pod spec
C) They automatically ignore taints
D) They cannot deploy to tainted nodes

### 10. Which field in a DaemonSet determines how many old Pods can be unavailable during updates?

A) parallelism
B) maxUnavailable (in updateStrategy.rollingUpdate)
C) replicas
D) maxSurge

---

## Answers

1. **B** - DaemonSets ensure that a copy of a Pod runs on all (or selected) nodes. They're typically used for node-level services.

2. **B** - When a new node joins the cluster, the DaemonSet controller automatically schedules a Pod on that node if it matches the DaemonSet's node selector/affinity.

3. **D** - You can control which nodes get DaemonSet Pods using `nodeSelector`, node/pod affinity, or by adding tolerations to match node taints.

4. **B** - When a node is removed or becomes unreachable, the DaemonSet Pods on that node are garbage collected by the cluster.

5. **A** - The OnDelete update strategy requires you to manually delete Pods to trigger updates. New Pods are created with the updated spec only after deletion.

6. **B** - RollingUpdate is the default update strategy for DaemonSets, automatically updating Pods when the spec changes.

7. **C** - DaemonSets ensure exactly one Pod per node (or per selected node). Multiple Pods on the same node would require multiple DaemonSets or different workload types.

8. **D** - Common use cases include log collectors (Fluentd), monitoring agents (Prometheus Node Exporter), network plugins, and storage daemons that need to run on every node.

9. **B** - To deploy to tainted nodes, you must add matching tolerations to the DaemonSet's Pod template. DaemonSets don't automatically bypass taints.

10. **B** - The `maxUnavailable` field (under `updateStrategy.rollingUpdate`) controls how many Pods can be unavailable during a rolling update. `maxSurge` is not applicable to DaemonSets.

---

## Study Resources

- [Lab README](README.md) - Core DaemonSet concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific DaemonSet topics
- [Official DaemonSet Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)
