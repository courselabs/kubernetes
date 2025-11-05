# PersistentVolumes - Quickfire Questions

Test your knowledge of Kubernetes PersistentVolumes with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the relationship between PersistentVolumes (PV) and PersistentVolumeClaims (PVC)?

A) PVCs request storage from PVs
B) PVCs create PVs automatically
C) They are the same thing
D) PVs request storage from PVCs

### 2. Which access mode allows the volume to be mounted as read-write by multiple nodes?

A) ReadOnlyMany (ROX)
B) ReadWriteMany (RWX)
C) ReadWriteMultiple (RWM)
D) ReadWriteOnce (RWO)

### 3. What happens when a PersistentVolumeClaim is deleted with a Retain reclaim policy?

A) The PV is wiped and becomes available
B) The PV is automatically deleted
C) The PVC cannot be deleted
D) The PV remains with data intact but must be manually reclaimed

### 4. What is a StorageClass used for?

A) To set storage quotas
B) To encrypt storage volumes
C) To classify storage by performance tiers
D) To enable dynamic provisioning of PersistentVolumes

### 5. Which volume type stores data on the host node's filesystem?

A) hostPath
B) nfs
C) local
D) emptyDir

### 6. What is the purpose of an emptyDir volume?

A) To share temporary storage between containers in a Pod
B) To create empty PersistentVolumes
C) To mount host directories
D) To create persistent storage

### 7. In a PVC spec, what field specifies the amount of storage requested?

A) size
B) capacity
C) storage
D) resources.requests.storage

### 8. What happens to data in an emptyDir volume when a Pod is deleted?

A) Data is backed up automatically
B) Data moves to a PersistentVolume
C) Data persists on the node
D) Data is lost permanently

### 9. Which reclaim policy automatically deletes the PV when the PVC is deleted?

A) Remove
B) Delete
C) Retain
D) Recycle

### 10. Can a PersistentVolume be bound to multiple PersistentVolumeClaims simultaneously?

A) Yes, if the StorageClass allows it
B) No, a PV can only bind to one PVC at a time
C) Yes, always
D) Yes, but only with ReadWriteMany access mode

---

## Answers

1. **A** - PersistentVolumeClaims (PVCs) are requests for storage. Kubernetes binds PVCs to available PersistentVolumes (PVs) that satisfy the requirements.

2. **B** - ReadWriteMany (RWX) allows the volume to be mounted as read-write by multiple nodes. RWO allows single-node access, and ROX allows read-only access by multiple nodes.

3. **D** - With the Retain reclaim policy, when a PVC is deleted, the PV is retained with its data intact. It must be manually cleaned up and made available again.

4. **D** - StorageClasses enable dynamic provisioning of PersistentVolumes. When a PVC references a StorageClass, a PV is automatically created to satisfy the claim.

5. **A** - hostPath mounts a file or directory from the host node's filesystem into the Pod. It's not recommended for production due to security and portability concerns.

6. **A** - emptyDir provides temporary storage shared between containers in the same Pod. It's created when the Pod is assigned to a node and deleted when the Pod is removed.

7. **D** - The `resources.requests.storage` field in a PVC specifies the amount of storage requested (e.g., "10Gi").

8. **D** - emptyDir is ephemeral storage. When a Pod is deleted, the emptyDir volume and all its data are permanently deleted.

9. **B** - The Delete reclaim policy automatically deletes the PV and its associated storage when the PVC is deleted. This is the default for dynamically provisioned volumes.

10. **B** - A PersistentVolume can only be bound to one PersistentVolumeClaim at a time. The binding is exclusive, though the PV can be mounted on multiple nodes if the access mode allows (RWX/ROX).

---

## Study Resources

- [Lab README](README.md) - Core PersistentVolume concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific storage topics
- [Official PersistentVolumes Documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
