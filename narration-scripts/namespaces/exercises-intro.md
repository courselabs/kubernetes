# Namespaces - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of Namespaces - what they are, why they're essential for organization and isolation, and how they enable multi-tenancy - it's time to work with them hands-on.

In the upcoming exercises video, we're going to create namespaces, deploy resources into them, and see how namespaces provide logical separation within a cluster. You'll understand DNS naming patterns and cross-namespace communication.

## What You'll Learn

In the hands-on exercises, we'll explore namespace usage and patterns:

First, you'll create namespaces using both imperative commands and declarative YAML. You'll see how simple namespace creation is and how it immediately provides a new logical partition in your cluster.

Then, we'll deploy resources into specific namespaces. You'll use the `-n` or `--namespace` flag to specify where resources should be created. You'll understand that most resources are namespaced (Pods, Services, Deployments) while some are cluster-scoped (Nodes, PersistentVolumes).

Next, you'll work with namespace context switching. You'll use `kubectl config set-context --current --namespace` to change your default namespace, making it easier to work within a specific namespace without constantly specifying `-n`. You'll see how this improves workflow when focusing on one namespace.

After that, you'll explore cross-namespace communication. You'll see how Services in one namespace can be accessed from Pods in another namespace using fully qualified DNS names. You'll understand the pattern: `service-name.namespace.svc.cluster.local`.

You'll also work with namespace isolation patterns. You'll see how ResourceQuotas limit resources per namespace, how LimitRanges set defaults per namespace, and how NetworkPolicies can control traffic between namespaces.

Finally, you'll practice namespace cleanup and the implications of deleting namespaces - all resources within are deleted cascade-style.

## Getting Ready

Before starting the exercises video, make sure you have:
- A running Kubernetes cluster (any distribution works)
- kubectl installed and configured
- A terminal and text editor ready
- Understanding that namespace operations are quick and safe

The exercises demonstrate practical namespace patterns you'll use constantly in multi-tenant clusters. You can follow along on your own cluster, or watch first and practice afterward.

## Why This Matters

Namespaces are core CKAD exam content. You'll be asked to create resources in specific namespaces, switch namespace contexts, and understand cross-namespace communication. The exam expects you to work efficiently with namespace-scoped commands.

Beyond the exam, namespaces are fundamental to organizing production Kubernetes clusters. Every real-world cluster uses namespaces to separate environments, teams, or applications. Understanding namespace patterns is essential for effective cluster management.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for seeing logical organization
- Reassure that namespace concepts are straightforward

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
