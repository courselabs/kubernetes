# Nodes - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now practiced querying node information, labeling nodes, applying taints, and performing maintenance with cordon and drain operations.

Here's what you need to know for CKAD: Node operations appear primarily in troubleshooting contexts. You'll query node information to diagnose why Pods won't schedule, check node capacity, and understand node conditions. The exam expects you to work efficiently with node-related kubectl commands.

That's what we're going to focus on in this next section: exam-specific node troubleshooting and rapid information gathering.

## What Makes CKAD Different

The CKAD exam includes node operations as part of troubleshooting scenarios. When Pods are Pending or failing to schedule, you need to quickly check node status, capacity, and taints. You won't administer nodes extensively, but you must query them efficiently.

For node operations specifically, the exam may test you on:

**Querying node status** - Using `kubectl get nodes` to see cluster nodes and their status. Using `kubectl describe node` to see detailed information including capacity, allocatable, conditions, and events. Understanding what Ready, NotReady, and other conditions mean.

**Checking node capacity** - Reading capacity and allocatable resources from `describe node` output. Understanding that capacity is total resources, allocatable is what's available for Pods. Diagnosing why Pods won't schedule due to insufficient resources.

**Viewing node labels** - Using `kubectl get nodes --show-labels` to see all labels, or `kubectl get nodes -L label-key` to show specific labels as columns. Understanding standard labels like kubernetes.io/os, kubernetes.io/hostname, and topology.kubernetes.io/zone.

**Node maintenance operations** - Using `kubectl cordon node` to mark it unschedulable, `kubectl drain node --ignore-daemonsets --delete-emptydir-data` to evict Pods, and `kubectl uncordon node` to resume scheduling. Knowing when to use these commands.

**Understanding node conditions** - Reading node conditions: Ready (can accept Pods), MemoryPressure (low memory), DiskPressure (low disk), PIDPressure (too many processes), NetworkUnavailable. Diagnosing what these mean for Pod scheduling.

**Troubleshooting scheduling failures** - When `kubectl describe pod` shows "node(s) didn't match node selector" or "Insufficient cpu," checking nodes to understand why. Verifying node labels exist, checking available resources, and identifying taints that prevent scheduling.

## What's Coming

In the upcoming CKAD-focused video, we'll drill on exam scenarios. You'll practice querying node information quickly. You'll diagnose Pod scheduling issues by checking nodes systematically. You'll use node commands efficiently.

We'll cover exam patterns: checking why Pods are Pending by examining nodes, verifying node labels for node selector issues, understanding taint-related scheduling failures, checking node capacity when resource requests can't be satisfied, and using cordon/drain for maintenance scenarios.

We'll also explore time-saving techniques: using wide output with `kubectl get nodes -o wide` for IP addresses, using custom-columns for specific node information, knowing that `kubectl top nodes` requires metrics-server, verifying nodes before troubleshooting Pods (saves time), and understanding which node information is relevant for different errors.

Finally, we'll practice troubleshooting scenarios where node issues cause Pod problems, ensuring you can diagnose these quickly.

## Exam Mindset

Remember: Node operations in CKAD are primarily about troubleshooting. When Pods won't schedule, check nodes. When you see resource errors, check capacity. When you see taint errors, check taints.

Practice the troubleshooting workflow: see Pod Pending → describe Pod → read error → query nodes for relevant information. This systematic approach prevents wasted time.

Let's dive into CKAD-specific node scenarios!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with node query demonstrations
- Serious but encouraging tone - this is exam preparation

**Tone:**
- Shift from learning to troubleshooting
- Emphasize systematic diagnosis
- Build confidence through workflows

**Key Messages:**
- Node operations appear in troubleshooting contexts
- Check nodes when Pods won't schedule
- Know the standard troubleshooting workflow
- The upcoming content focuses on diagnosis

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
