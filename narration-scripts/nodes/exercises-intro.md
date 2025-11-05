# Nodes - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of Nodes - what they are, how they form the foundation of your Kubernetes cluster, and the key node components - it's time to work with node operations hands-on.

In the upcoming exercises video, we're going to query node information, label nodes for workload placement, and perform node maintenance operations. You'll understand how to manage the compute resources that run your workloads.

## What You'll Learn

In the hands-on exercises, we'll explore practical node operations:

First, you'll query node information using kubectl commands. You'll see node status, capacity, allocatable resources, and conditions. You'll understand what the output tells you about node health and available resources.

Then, we'll work with node labels - adding custom labels to nodes so you can target specific hardware or capabilities. You'll label nodes with characteristics like disk type, GPU availability, or environment designation. You'll then use these labels with node selectors and affinity rules.

Next, you'll explore node taints for controlling Pod placement. You'll taint nodes to repel workloads unless Pods explicitly tolerate the taint. You'll see how this mechanism reserves nodes for special purposes or prevents scheduling on unhealthy nodes.

After that, you'll perform node maintenance using cordon and drain. You'll cordon a node to prevent new Pods from scheduling, drain it to gracefully evict existing Pods, perform maintenance, and uncordon it to resume normal operations. This is the safe workflow for node updates and repairs.

You'll also view node metrics using kubectl top nodes (if metrics-server is available). You'll see CPU and memory usage across your cluster, understanding resource consumption patterns.

Finally, you'll troubleshoot node issues - diagnosing NotReady nodes, understanding node conditions, and checking node events for problems.

## Getting Ready

Before starting the exercises video, make sure you have:
- A Kubernetes cluster with multiple nodes (or single-node for basic operations)
- kubectl installed and configured
- A terminal and text editor ready
- Understanding that some operations require admin permissions

The exercises demonstrate node operations that are essential for cluster administration and appear in CKAD troubleshooting scenarios.

## Why This Matters

Node operations are important for CKAD. While you won't administer clusters from scratch, you'll need to query node information, understand node issues that affect Pod scheduling, and potentially perform basic maintenance operations during the exam.

Beyond the exam, understanding node operations is essential for diagnosing scheduling issues, planning capacity, and maintaining cluster health in production environments.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create awareness about node-level operations
- Reassure that node concepts build on earlier topics

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
