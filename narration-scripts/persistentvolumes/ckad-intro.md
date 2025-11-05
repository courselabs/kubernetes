# Persistent Volumes - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now practiced creating PersistentVolumeClaims, mounting them in Pods, working with access modes, and understanding dynamic provisioning with StorageClasses.

Here's what you need to know for CKAD: PersistentVolumes are core exam content. You'll create PVCs and mount them in Pods, often as part of deploying stateful applications. The exam expects you to know PVC syntax and mounting patterns without hesitation.

That's what we're going to focus on in this next section: exam-specific storage scenarios and rapid configuration techniques.

## What Makes CKAD Different

The CKAD exam tests practical storage usage. You'll see requirements like "create a pod with persistent storage" or "deploy a database with a 5Gi volume." You need to create PVCs and mount them in Pods quickly and correctly.

For PersistentVolumes specifically, the exam will test you on:

**Rapid PVC creation** - Using `kubectl create` or writing concise YAML manifests. PVCs need `resources.requests.storage` for size, `accessModes` for access pattern, and optionally `storageClassName`. You must know this structure by heart.

**Understanding access modes** - Choosing the correct mode: ReadWriteOnce (RWO) for single-node access, ReadWriteMany (RWX) for multi-node access, ReadOnlyMany (ROX) for read-only sharing. The exam may specify requirements that dictate which mode to use.

**Mounting PVCs in Pods** - Adding `volumes` referencing the PVC by name, and `volumeMounts` in container specs connecting volumes to mount paths. Getting the syntax right: volumes use `persistentVolumeClaim.claimName`, while volumeMounts specify `name` and `mountPath`.

**StorageClass selection** - Referencing the correct StorageClass in PVCs using `storageClassName`, or omitting it to use the default StorageClass. Understanding that the exam cluster will have pre-configured StorageClasses.

**Troubleshooting PVC binding** - Checking PVC status with `kubectl get pvc`, seeing whether it's Bound or Pending, using `kubectl describe pvc` to see binding errors, and understanding common issues like "no PersistentVolume matches" or "insufficient storage."

**Understanding Pod-PVC-PV relationships** - Knowing that Pods reference PVCs, PVCs bind to PVs, and deleting a PVC doesn't immediately delete the PV (depends on reclaim policy). Understanding these relationships helps troubleshoot storage issues.

## What's Coming

In the upcoming CKAD-focused video, we'll drill on exam scenarios. You'll practice creating PVCs in under 60 seconds. You'll mount PVCs in Pods efficiently. You'll troubleshoot common storage issues quickly.

We'll cover exam patterns: creating simple PVCs with default StorageClass, mounting PVCs in Deployments for persistent application data, creating multiple PVCs for different application components, understanding emptyDir for temporary storage (doesn't require PVC), and combining PVCs with StatefulSets for scaled stateful applications.

We'll also explore time-saving techniques: using YAML templates for PVCs since the structure is consistent, knowing that `kubectl explain pvc.spec` shows required fields, verifying PVC binding before creating Pods (saves troubleshooting time), and understanding that most exam environments have default StorageClasses configured.

Finally, we'll practice complete scenarios including creating PVCs and Pods together, timing ourselves to ensure we can handle storage questions within 4-5 minutes.

## Exam Mindset

Remember: PVC creation and mounting is straightforward with the right syntax. The structure is consistent: create PVC with size and accessModes, reference it in Pod volumes, mount it in containers. Practice until this workflow is automatic.

When you see "persistent storage" in exam requirements, immediately think: create PVC, reference in volumes, mount in volumeMounts. This three-step process handles most storage scenarios.

Let's dive into CKAD-specific PersistentVolume scenarios!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with storage demonstrations
- Serious but encouraging tone - this is exam preparation

**Tone:**
- Shift from learning to drilling
- Emphasize syntax accuracy for volumes
- Build confidence through systematic approaches

**Key Messages:**
- PersistentVolumes are core CKAD content
- PVC creation and mounting is straightforward
- Know the three-step process: PVC, volumes, volumeMounts
- The upcoming content focuses on exam techniques

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
