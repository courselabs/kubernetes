# Operators - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of Kubernetes Operators - what they are, how they extend Kubernetes with custom resources and controllers, and why they're valuable for managing complex applications - it's time to see Operators in action.

In the upcoming exercises video, we're going to deploy an Operator, work with Custom Resource Definitions, and create custom resources that the Operator manages. You'll see how Operators automate operational knowledge.

## What You'll Learn

In the hands-on exercises, we'll explore Operator patterns:

First, you'll install an Operator into your cluster. You'll see that Operators are typically deployed as Deployments with special permissions via RBAC. You'll understand the Operator architecture and how it integrates with Kubernetes.

Then, we'll examine Custom Resource Definitions (CRDs) that the Operator provides. You'll see how CRDs extend the Kubernetes API with new resource types specific to the application the Operator manages. You'll use `kubectl api-resources` to discover these new types.

Next, you'll create custom resources (CRs) - instances of the CRDs. You'll see how these custom resources declaratively describe desired state for complex applications, and how the Operator reconciles them into actual Kubernetes resources.

After that, you'll observe the Operator's reconciliation behavior. You'll modify custom resources and watch the Operator update the underlying Deployments, Services, and other resources automatically. You'll see operational automation in action.

You'll also explore how Operators handle upgrades, backups, and other operational tasks that would be complex or manual without automation.

Finally, you'll troubleshoot Operator issues - checking Operator pod logs, understanding custom resource status, and diagnosing reconciliation problems.

## Getting Ready

Before starting the exercises video, make sure you have:
- A running Kubernetes cluster with admin permissions
- kubectl installed and configured
- A terminal and text editor ready
- Understanding that Operators require cluster-wide permissions

The exercises use simple, educational Operators that demonstrate core concepts without production complexity.

## Why This Matters

Operators are advanced material beyond core CKAD requirements. However, many production environments use Operators for databases, messaging systems, and complex applications. Understanding basic Operator concepts provides valuable context for real-world Kubernetes.

While you won't implement Operators for CKAD, recognizing when you're working with Operator-managed resources helps you troubleshoot and understand modern Kubernetes deployments.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create awareness that Operators are advanced
- Reassure that basic concepts are accessible

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
