# StatefulSets - Quickfire Questions

Test your knowledge of Kubernetes StatefulSets with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary difference between a Deployment and a StatefulSet?

A) StatefulSets provide stable network identities and persistent storage for Pods
B) StatefulSets are faster to deploy
C) Deployments cannot use PersistentVolumes
D) StatefulSets can only run one Pod

### 2. How are StatefulSet Pods named?

A) With timestamps
B) With the node name appended
C) With predictable names: <statefulset-name>-0, <statefulset-name>-1, etc.
D) With random suffixes like Deployments

### 3. What is a headless Service in the context of StatefulSets?

A) A Service without ports
B) A Service that routes to no Pods
C) A Service without a selector
D) A Service with clusterIP: None that provides DNS for each Pod

### 4. What happens when you scale down a StatefulSet from 5 to 3 replicas?

A) Random Pods are terminated
B) The oldest Pods are terminated
C) All Pods are recreated
D) Pods 3 and 4 are terminated in reverse ordinal order

### 5. How does a StatefulSet provide stable storage for Pods?

A) Using emptyDir volumes
B) Using shared PersistentVolumes
C) Using volumeClaimTemplates to create unique PVCs for each Pod
D) Using hostPath volumes

### 6. What is the default Pod Management Policy for StatefulSets?

A) OrderedReady
B) Random
C) Parallel
D) Sequential

### 7. When a StatefulSet Pod is rescheduled to a different node, what happens to its identity?

A) Only the name is retained
B) It gets a new name and PVC
C) Only the PVC is retained
D) It retains the same name and PVC

### 8. Which field in a StatefulSet spec defines the headless Service?

A) clusterIP
B) serviceName
C) service
D) headlessService

### 9. What is the purpose of the Parallel Pod Management Policy?

A) To distribute Pods across nodes
B) To launch or terminate all Pods simultaneously
C) To ensure Pods start in order
D) To enable rolling updates

### 10. How do you access individual StatefulSet Pods via DNS?

A) <statefulset-name>-<ordinal>.<namespace>.svc.cluster.local
B) Individual Pods cannot be accessed via DNS
C) <pod-name>.<namespace>.svc.cluster.local
D) <pod-name>.<service-name>.<namespace>.svc.cluster.local

---

## Answers

1. **A** - StatefulSets provide stable, unique network identities and stable persistent storage for Pods. They're designed for stateful applications like databases.

2. **C** - StatefulSet Pods have predictable, ordinal names: `<statefulset-name>-0`, `<statefulset-name>-1`, etc. This provides stable identities.

3. **D** - A headless Service (clusterIP: None) is required for StatefulSets. It provides DNS records for each Pod, enabling direct Pod-to-Pod communication.

4. **D** - StatefulSets terminate Pods in reverse ordinal order when scaling down. Scaling from 5 to 3 terminates Pod-4, then Pod-3.

5. **C** - StatefulSets use `volumeClaimTemplates` to automatically create a unique PersistentVolumeClaim for each Pod, providing stable storage.

6. **A** - OrderedReady (default) ensures Pods are created/deleted in order (0, 1, 2...) and each Pod must be Ready before the next is created.

7. **D** - StatefulSet Pods maintain their identity (name) and storage (PVC) when rescheduled, even to different nodes. This is a key feature for stateful apps.

8. **B** - The `serviceName` field specifies the name of the headless Service that governs the StatefulSet, providing network identity.

9. **B** - The Parallel Pod Management Policy launches or terminates all Pods simultaneously without waiting for readiness, useful for non-ordered workloads.

10. **D** - Individual StatefulSet Pods are accessible via DNS: `<pod-name>.<service-name>.<namespace>.svc.cluster.local` (e.g., `web-0.nginx.default.svc.cluster.local`).

---

## Study Resources

- [Lab README](README.md) - Core StatefulSet concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific StatefulSet topics
- [Official StatefulSet Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
