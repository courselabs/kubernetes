# API Versions and Deprecations - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of Kubernetes API versioning and the deprecation policy, it's time to work with these concepts in a real cluster.

In the upcoming exercises video, we're going to practice discovering API versions, identifying deprecated APIs, and migrating resources to current versions. You'll learn the essential kubectl commands that help you navigate API changes confidently.

## What You'll Learn

In the hands-on exercises, we'll work through practical API version scenarios:

First, you'll discover what API versions your cluster supports using `kubectl api-versions` and `kubectl api-resources`. You'll learn the difference between these commands and when to use each one. You'll see how to quickly find the current API version for any resource type - a skill that's essential for the CKAD exam.

Then, we'll explore the structure of different APIs using `kubectl explain`. You'll see how this command provides instant documentation about resource fields, required properties, and valid values. This is faster than searching online documentation and works even without internet access.

Next, we'll work with real API version changes using Ingress as an example. You'll see the differences between networking.k8s.io/v1beta1 and networking.k8s.io/v1, and you'll learn that API migrations aren't just about changing version numbers - sometimes the schema changes too, requiring additional fields or different structures.

After that, you'll practice identifying deprecated APIs in your running resources. You'll learn how to scan your cluster for resources using old API versions and understand the warnings that kubectl displays.

Finally, you'll use the `kubectl convert` tool to migrate manifests from old API versions to new ones. You'll see both its capabilities and its limitations, and you'll practice troubleshooting common API version errors.

## Getting Ready

Before starting the exercises video, make sure you have:
- A running Kubernetes cluster (any distribution works)
- kubectl installed and configured
- A terminal and text editor ready
- Permission to deploy and delete test resources

The exercises move at a comfortable pace with clear explanations. You can follow along on your own cluster, or watch first and practice afterward using the lab materials.

## Why This Matters

API version knowledge is critical for CKAD exam success. The exam may present you with manifests using deprecated APIs, or you might encounter "no matches for kind" errors that you must fix quickly. Knowing how to use `kubectl api-resources`, `kubectl explain`, and understanding API version structure will save you valuable time.

In production environments, cluster upgrades can break applications if manifests use removed API versions. The skills you'll practice in these exercises will help you proactively identify and fix these issues before they cause downtime.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for mastering practical API commands
- Reassure that API version management is learnable and systematic

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
