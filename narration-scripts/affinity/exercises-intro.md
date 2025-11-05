# Affinity and Pod Scheduling - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the concepts of Pod scheduling with affinity in Kubernetes, it's time to put these powerful mechanisms into action.

In the upcoming exercises video, we're going to work with a multi-node Kubernetes cluster to demonstrate how affinity rules actually control Pod placement. You'll see node affinity, Pod affinity, and Pod anti-affinity working in real scenarios, and you'll understand when to use required versus preferred rules.

## What You'll Learn

In the hands-on exercises, we'll build up progressively through different scheduling patterns:

First, you'll set up a multi-node k3d cluster specifically for this lab. Having multiple nodes is essential for seeing affinity in action - you need different targets for the scheduler to choose from.

Then, we'll deploy applications with node affinity rules. You'll watch Pods schedule onto nodes that match affinity requirements, and you'll see Pods stuck in Pending state when no nodes satisfy the constraints. You'll learn to diagnose scheduling failures by reading the Events in `kubectl describe pod`.

Next, we'll add topology labels to nodes - region and zone labels that simulate a multi-zone cloud environment. These topology labels are crucial for understanding how Pod affinity and anti-affinity work across your infrastructure.

After that, we'll explore Pod affinity for co-location. You'll see how Pods can be scheduled near other Pods based on labels and topology keys. You'll understand the difference between hostname-level affinity (same physical node) and zone-level affinity (same availability zone).

We'll then work with Pod anti-affinity to spread Pods apart for high availability. You'll see how required anti-affinity can be too restrictive, leaving Pods pending, and how preferred anti-affinity provides better flexibility.

Finally, you'll experiment with weighted preferences. You'll see how different weights guide the scheduler to prefer certain nodes while still allowing fallback options.

## Getting Ready

Before starting the exercises video, make sure you have:
- k3d installed for creating a multi-node cluster (we'll show the installation)
- kubectl installed and configured
- Ability to create and delete clusters
- A terminal and text editor ready

The exercises will create a dedicated k3d cluster for this lab, so you won't affect your existing Kubernetes environment. You can follow along and create the same cluster, or watch first and practice afterward.

## Why This Matters

While affinity is advanced material beyond core CKAD requirements, these patterns are fundamental to production Kubernetes. High availability deployments spread replicas across zones. Performance-optimized applications co-locate related components. Resource-intensive workloads target specialized nodes.

For the exam, you won't need to write complex affinity rules from scratch, but you absolutely need to understand how they work. You'll encounter scenarios with existing affinity configurations, and you'll need to troubleshoot when Pods won't schedule due to affinity constraints.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for seeing scheduling in action
- Reassure that multi-node setup will be demonstrated

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
