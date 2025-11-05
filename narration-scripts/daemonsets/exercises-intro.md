# DaemonSets - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of DaemonSets - what they are, how they differ from Deployments, and when to use them - it's time to see them in action.

In the upcoming exercises video, we're going to create DaemonSets and watch how they automatically run on every node in your cluster. You'll see how DaemonSets interact with node selectors and taints, and you'll understand the patterns for node-level services.

## What You'll Learn

In the hands-on exercises, we'll explore DaemonSet behavior and configuration:

First, you'll create a basic DaemonSet and watch it deploy Pods to every node automatically. You'll see how DaemonSets maintain exactly one Pod per node, and you'll understand how this differs from Deployments that can place multiple Pods on the same node.

Then, we'll work with node selectors to control which nodes run DaemonSet Pods. You'll label nodes and use selectors to restrict DaemonSet Pods to specific nodes - perhaps only running on nodes labeled for monitoring or logging infrastructure.

Next, you'll see how DaemonSets interact with taints and tolerations. Unlike Deployments, DaemonSets can include tolerations to run on tainted nodes, which is essential for system-level services that need to run everywhere, including control plane nodes.

After that, you'll explore update strategies for DaemonSets. You'll see how RollingUpdate automatically upgrades DaemonSet Pods node-by-node, and you'll understand the OnDelete strategy for manual control over updates.

Finally, you'll work with real-world DaemonSet use cases like deploying monitoring agents or log collectors that need to run on every node in your cluster.

## Getting Ready

Before starting the exercises video, make sure you have:
- A multi-node Kubernetes cluster (or k3d/kind cluster with multiple nodes)
- kubectl installed and configured
- A terminal and text editor ready
- Understanding that single-node clusters limit DaemonSet demonstrations

The exercises work best with multiple nodes to see DaemonSets' full behavior. If you're using a single-node cluster, you'll still see the core concepts but with limited Pod distribution.

## Why This Matters

While DaemonSets are not as common as Deployments in CKAD exam questions, understanding them is important for cluster-wide services. You may encounter scenarios involving logging, monitoring, or node-level networking where DaemonSets are the appropriate solution.

Beyond the exam, DaemonSets are essential for infrastructure services. Every production cluster uses DaemonSets for log shipping, metrics collection, network plugins, and storage drivers.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for seeing node-level deployments
- Reassure about multi-node requirements

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
