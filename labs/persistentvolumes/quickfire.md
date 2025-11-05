# PersistentVolumes - Quickfire Questions

Test your knowledge of Kubernetes PersistentVolumes with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the relationship between PersistentVolumes (PV) and PersistentVolumeClaims (PVC)?

A) PVs request storage from PVCs
B) PVCs request storage from PVs
C) They are the same thing
D) PVCs create PVs automatically

### 2. Which access mode allows the volume to be mounted as read-write by multiple nodes?

A) ReadWriteOnce (RWO)
B) ReadOnlyMany (ROX)
C) ReadWriteMany (RWX)
D) ReadWriteMultiple (RWM)

### 3. What happens when a PersistentVolumeClaim is deleted with a Retain reclaim policy?

A) The PV is automatically deleted
B) The PV remains with data intact but must be manually reclaimed
C) The PV is wiped and becomes available
D) The PVC cannot be deleted

### 4. What is a StorageClass used for?

A) To classify storage by performance tiers
B) To enable dynamic provisioning of PersistentVolumes
C) To set storage quotas
D) To encrypt storage volumes

### 5. Which volume type stores data on the host node's filesystem?

A) emptyDir
B) hostPath
C) local
D) nfs

### 6. What is the purpose of an emptyDir volume?

A) To create persistent storage
B) To share temporary storage between containers in a Pod
C) To mount host directories
D) To create empty PersistentVolumes

### 7. In a PVC spec, what field specifies the amount of storage requested?

A) capacity
B) storage
C) resources.requests.storage
D) size

### 8. What happens to data in an emptyDir volume when a Pod is deleted?

A) Data persists on the node
B) Data is backed up automatically
C) Data is lost permanently
D) Data moves to a PersistentVolume

### 9. Which reclaim policy automatically deletes the PV when the PVC is deleted?

A) Retain
B) Delete
C) Recycle
D) Remove

### 10. Can a PersistentVolume be bound to multiple PersistentVolumeClaims simultaneously?

A) Yes, always
B) Yes, but only with ReadWriteMany access mode
C) No, a PV can only bind to one PVC at a time
D) Yes, if the StorageClass allows it

---

## Answers

1. **B** - PersistentVolumeClaims (PVCs) are requests for storage. Kubernetes binds PVCs to available PersistentVolumes (PVs) that satisfy the requirements.

2. **C** - ReadWriteMany (RWX) allows the volume to be mounted as read-write by multiple nodes. RWO allows single-node access, and ROX allows read-only access by multiple nodes.

3. **B** - With the Retain reclaim policy, when a PVC is deleted, the PV is retained with its data intact. It must be manually cleaned up and made available again.

4. **B** - StorageClasses enable dynamic provisioning of PersistentVolumes. When a PVC references a StorageClass, a PV is automatically created to satisfy the claim.

5. **B** - hostPath mounts a file or directory from the host node's filesystem into the Pod. It's not recommended for production due to security and portability concerns.

6. **B** - emptyDir provides temporary storage shared between containers in the same Pod. It's created when the Pod is assigned to a node and deleted when the Pod is removed.

7. **C** - The `resources.requests.storage` field in a PVC specifies the amount of storage requested (e.g., "10Gi").

8. **C** - emptyDir is ephemeral storage. When a Pod is deleted, the emptyDir volume and all its data are permanently deleted.

9. **B** - The Delete reclaim policy automatically deletes the PV and its associated storage when the PVC is deleted. This is the default for dynamically provisioned volumes.

10. **C** - A PersistentVolume can only be bound to one PersistentVolumeClaim at a time. The binding is exclusive, though the PV can be mounted on multiple nodes if the access mode allows (RWX/ROX).

---

## Study Resources

- [Lab README](README.md) - Core PersistentVolume concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific storage topics
- [Official PersistentVolumes Documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
