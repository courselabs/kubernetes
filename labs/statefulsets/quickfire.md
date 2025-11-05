# StatefulSets - Quickfire Questions

Test your knowledge of Kubernetes StatefulSets with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary difference between a Deployment and a StatefulSet?

A) StatefulSets can only run one Pod
B) StatefulSets provide stable network identities and persistent storage for Pods
C) Deployments cannot use PersistentVolumes
D) StatefulSets are faster to deploy

### 2. How are StatefulSet Pods named?

A) With random suffixes like Deployments
B) With predictable names: <statefulset-name>-0, <statefulset-name>-1, etc.
C) With timestamps
D) With the node name appended

### 3. What is a headless Service in the context of StatefulSets?

A) A Service without a selector
B) A Service with clusterIP: None that provides DNS for each Pod
C) A Service that routes to no Pods
D) A Service without ports

### 4. What happens when you scale down a StatefulSet from 5 to 3 replicas?

A) Random Pods are terminated
B) Pods 3 and 4 are terminated in reverse ordinal order
C) All Pods are recreated
D) The oldest Pods are terminated

### 5. How does a StatefulSet provide stable storage for Pods?

A) Using emptyDir volumes
B) Using volumeClaimTemplates to create unique PVCs for each Pod
C) Using hostPath volumes
D) Using shared PersistentVolumes

### 6. What is the default Pod Management Policy for StatefulSets?

A) Parallel
B) OrderedReady
C) Random
D) Sequential

### 7. When a StatefulSet Pod is rescheduled to a different node, what happens to its identity?

A) It gets a new name and PVC
B) It retains the same name and PVC
C) Only the name is retained
D) Only the PVC is retained

### 8. Which field in a StatefulSet spec defines the headless Service?

A) service
B) serviceName
C) headlessService
D) clusterIP

### 9. What is the purpose of the Parallel Pod Management Policy?

A) To launch or terminate all Pods simultaneously
B) To ensure Pods start in order
C) To distribute Pods across nodes
D) To enable rolling updates

### 10. How do you access individual StatefulSet Pods via DNS?

A) <pod-name>.<namespace>.svc.cluster.local
B) <pod-name>.<service-name>.<namespace>.svc.cluster.local
C) <statefulset-name>-<ordinal>.<namespace>.svc.cluster.local
D) Individual Pods cannot be accessed via DNS

---

## Answers

1. **B** - StatefulSets provide stable, unique network identities and stable persistent storage for Pods. They're designed for stateful applications like databases.

2. **B** - StatefulSet Pods have predictable, ordinal names: `<statefulset-name>-0`, `<statefulset-name>-1`, etc. This provides stable identities.

3. **B** - A headless Service (clusterIP: None) is required for StatefulSets. It provides DNS records for each Pod, enabling direct Pod-to-Pod communication.

4. **B** - StatefulSets terminate Pods in reverse ordinal order when scaling down. Scaling from 5 to 3 terminates Pod-4, then Pod-3.

5. **B** - StatefulSets use `volumeClaimTemplates` to automatically create a unique PersistentVolumeClaim for each Pod, providing stable storage.

6. **B** - OrderedReady (default) ensures Pods are created/deleted in order (0, 1, 2...) and each Pod must be Ready before the next is created.

7. **B** - StatefulSet Pods maintain their identity (name) and storage (PVC) when rescheduled, even to different nodes. This is a key feature for stateful apps.

8. **B** - The `serviceName` field specifies the name of the headless Service that governs the StatefulSet, providing network identity.

9. **A** - The Parallel Pod Management Policy launches or terminates all Pods simultaneously without waiting for readiness, useful for non-ordered workloads.

10. **B** - Individual StatefulSet Pods are accessible via DNS: `<pod-name>.<service-name>.<namespace>.svc.cluster.local` (e.g., `web-0.nginx.default.svc.cluster.local`).

---

## Study Resources

- [Lab README](README.md) - Core StatefulSet concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific StatefulSet topics
- [Official StatefulSet Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
