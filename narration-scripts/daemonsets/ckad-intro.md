# DaemonSets - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now practiced creating DaemonSets, using node selectors to control placement, working with tolerations for tainted nodes, and understanding update strategies.

Here's what you need to know for CKAD: DaemonSets are less frequently tested than Deployments, but they do appear in exam scenarios, especially for node-level services like logging or monitoring. Understanding when to use a DaemonSet instead of a Deployment is key.

That's what we're going to focus on in this next section: recognizing DaemonSet use cases and creating them quickly when needed.

## What Makes CKAD Different

The CKAD exam tests whether you can choose the right workload controller for the requirements. When you see "ensure one instance runs on every node" or "deploy a monitoring agent cluster-wide," that's a DaemonSet scenario.

For DaemonSets specifically, the exam may test you on:

**Recognizing DaemonSet use cases** - Knowing when the requirements call for a DaemonSet rather than a Deployment. Keywords like "every node," "node-level," "one per node," or "cluster-wide monitoring" indicate DaemonSets.

**Rapid creation from Deployment manifests** - Since there's no `kubectl create daemonset` command, the fastest approach is generating a Deployment manifest with `--dry-run=client -o yaml`, then changing the kind to DaemonSet and removing the replicas field. This is much faster than writing from scratch.

**Node selector configuration** - Using `nodeSelector` in the Pod template to restrict DaemonSet Pods to specific nodes, commonly used for hardware-specific services or environment separation.

**Toleration configuration** - Adding tolerations to allow DaemonSet Pods on tainted nodes, especially important for system services that need to run on control plane nodes or nodes with special taints.

**Understanding update strategies** - Knowing that RollingUpdate is the default and updates Pods automatically, while OnDelete requires manual Pod deletion for updates. The exam may ask you to configure update parameters.

## What's Coming

In the upcoming CKAD-focused video, we'll work through exam scenarios. You'll practice recognizing when to use DaemonSets based on requirements. You'll create DaemonSets quickly using the Deployment-to-DaemonSet conversion technique.

We'll cover common patterns: deploying cluster-wide monitoring agents, using node selectors to target specific node types, adding tolerations for system nodes, and configuring update strategies for controlled rollouts.

We'll also discuss time-saving approaches: knowing that DaemonSets and Deployments have nearly identical Pod template specs, understanding that the main differences are in replicas (DaemonSets don't have this field) and scheduling (DaemonSets ignore normal scheduling), and using YAML manifests efficiently.

Finally, we'll practice scenarios where you need to choose between DaemonSets and Deployments based on requirements, ensuring you can make the right decision quickly.

## Exam Mindset

Remember: DaemonSet questions are less common than Deployment questions, but when they appear, they're straightforward if you recognize the pattern. Look for "one per node" or "every node" in the requirements.

Practice converting Deployment specs to DaemonSet specs until it's automatic. The change is simple: kind becomes DaemonSet, and you remove the replicas field.

Let's dive into CKAD-specific DaemonSet scenarios!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with DaemonSet demonstrations
- Serious but encouraging tone - this is exam preparation

**Tone:**
- Shift from learning to applying
- Emphasize pattern recognition
- Build confidence through systematic approaches

**Key Messages:**
- DaemonSets appear less often but are important
- Recognition is key: "one per node" = DaemonSet
- Conversion from Deployment manifests is fastest
- The upcoming content focuses on exam techniques

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
