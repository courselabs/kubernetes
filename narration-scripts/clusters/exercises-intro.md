# Kubernetes Clusters - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the architecture of Kubernetes clusters, the control plane and worker node components, and the mechanisms for controlling Pod placement, it's time to work with these concepts in a multi-node environment.

In the upcoming exercises video, we're going to create a multi-node cluster and practice node operations. You'll work with taints and tolerations, perform node maintenance, and see how DaemonSets behave across a cluster.

## What You'll Learn

In the hands-on exercises, we'll explore multi-node cluster operations:

First, you'll create a three-node k3d cluster with one control plane and two worker nodes. Having multiple nodes is essential for seeing how Kubernetes distributes workloads and how node-level controls affect Pod scheduling.

Then, we'll work with taints and tolerations. You'll apply a `NoSchedule` taint to a node and watch how it prevents new Pods from being scheduled there while existing Pods continue running. You'll also see the more aggressive `NoExecute` taint that immediately evicts running Pods. Finally, you'll add tolerations to Pods so they can schedule on tainted nodes.

Next, we'll add topology labels to nodes - simulating the region and zone labels that cloud providers automatically apply. You'll see how these labels integrate with Pod affinity rules and zone-aware scheduling.

After that, you'll deploy a DaemonSet and observe how it runs on every node while respecting both taints and node selectors. You'll understand why DaemonSets are special and how they interact with node-level constraints.

Finally, you'll practice the node maintenance workflow: cordoning a node to mark it unschedulable, draining it to evict all Pods gracefully, performing maintenance, and uncordoning it to make it available again. This is a critical operational skill for managing production clusters.

## Getting Ready

Before starting the exercises video, make sure you have:
- k3d installed for creating multi-node clusters
- kubectl installed and configured
- Ability to create and delete clusters
- A terminal and text editor ready

The exercises will create a dedicated k3d cluster for this lab. You can follow along and create the same cluster, or watch first and practice afterward.

## Why This Matters

While cluster setup and administration are beyond core CKAD requirements, understanding node operations is essential. The exam may ask you to troubleshoot why Pods won't schedule, label nodes for specific workloads, or perform basic node maintenance operations.

More importantly, understanding how the cluster distributes Pods, how taints prevent scheduling, and how to safely drain nodes for maintenance are skills you'll use constantly in production Kubernetes environments.

For CKAD, focus on the kubectl commands for querying node information, managing labels and taints, and performing cordon/drain/uncordon operations. These are practical skills that appear in exam scenarios.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for working with multi-node operations
- Reassure that k3d setup will be shown step-by-step

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
