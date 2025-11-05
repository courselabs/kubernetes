# Persistent Volumes - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of Persistent Volumes - what they are, how they provide durable storage, and the relationship between PVs, PVCs, and StorageClasses - it's time to work with storage in Kubernetes.

In the upcoming exercises video, we're going to create PersistentVolumeClaims, bind them to PersistentVolumes, and use them in Pods for data persistence. You'll see how Kubernetes separates storage provisioning from storage consumption.

## What You'll Learn

In the hands-on exercises, we'll work through the complete storage lifecycle:

First, you'll create PersistentVolumeClaims to request storage. You'll specify storage size and access modes, and you'll see how Kubernetes finds and binds matching PersistentVolumes. You'll understand the claiming process and how PVCs abstract storage details from Pods.

Then, we'll mount PVCs in Pods as volumes. You'll see how Pods reference PVCs by name, how volumeMounts connect storage to container file paths, and how data persists across Pod restarts. You'll understand that multiple Pods can share PVCs if access modes permit.

Next, you'll work with different access modes: ReadWriteOnce (single node), ReadWriteMany (multiple nodes), and ReadOnlyMany. You'll see how access modes affect Pod scheduling and data sharing patterns.

After that, you'll explore dynamic provisioning with StorageClasses. You'll create PVCs that reference a StorageClass, triggering automatic PersistentVolume creation. You'll see how this eliminates manual PV management in cloud environments.

You'll also work with storage capacity and reclaim policies. You'll see what happens when PVCs request more storage than available, how retain and delete policies affect PV lifecycle, and how to expand PVCs when supported by the StorageClass.

Finally, you'll troubleshoot common storage issues. You'll diagnose Pods stuck in Pending due to PVC binding failures, understand "volume not found" errors, and verify PVC-to-PV bindings.

## Getting Ready

Before starting the exercises video, make sure you have:
- A Kubernetes cluster with a working StorageClass (most clusters have default)
- kubectl installed and configured
- A terminal and text editor ready
- Understanding that storage behavior varies by cluster type

The exercises work with standard Kubernetes storage patterns. Cloud clusters use cloud storage, local clusters use hostPath or local volumes. The concepts remain the same across environments.

## Why This Matters

PersistentVolumes are core CKAD exam content. You'll be asked to create PVCs, mount them in Pods, and potentially troubleshoot storage binding issues. The exam expects you to understand PVC syntax and mounting patterns.

Beyond the exam, persistent storage is essential for stateful applications. Databases, file servers, and any application that stores data relies on PersistentVolumes for data durability across Pod restarts.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for seeing data persistence
- Reassure about storage complexity

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
