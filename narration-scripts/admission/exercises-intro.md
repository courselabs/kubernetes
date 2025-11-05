# Admission Control - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of admission control in Kubernetes, it's time to see these mechanisms in action.

In the upcoming exercises video, we're going to work with actual admission webhooks. You'll deploy custom validation webhooks, watch them accept and reject resource requests, and see how mutating webhooks automatically modify your configurations. We'll also explore OPA Gatekeeper, which provides a declarative approach to policy management.

## What You'll Learn

In the hands-on exercises, we'll build up progressively through different admission control patterns:

First, you'll set up cert-manager to handle TLS certificates for webhooks. Admission webhooks must use HTTPS, and you'll see exactly how to configure trusted certificates for your webhook servers.

Then, we'll deploy a custom validating webhook that enforces a specific policy - requiring Pods to disable automatic service account token mounting. You'll see how this webhook accepts compliant Pods while rejecting those that don't meet the policy. More importantly, you'll learn where to find admission errors when deployments fail - they appear in ReplicaSet events, not Pod events.

Next, we'll explore mutating webhooks that automatically modify resources. You'll deploy a webhook that injects security contexts into all Pods, and you'll witness how this can cause unexpected behavior when the modifications conflict with container requirements.

After that, we'll transition to OPA Gatekeeper. You'll create constraint templates and constraints, which provide discoverable, declarative policies. Unlike custom webhooks that are black boxes, Gatekeeper policies are Kubernetes resources you can inspect with kubectl.

Finally, you'll tackle a lab challenge that requires fixing an application to satisfy multiple Gatekeeper policies simultaneously - requiring specific labels and resource limits.

## Getting Ready

Before starting the exercises video, make sure you have:
- A running Kubernetes cluster with sufficient permissions to install cluster-scoped resources
- kubectl installed and configured
- Ability to install cert-manager and webhook deployments
- A terminal and text editor ready

The exercises move at a comfortable pace with explanations of what's happening at each step. You can follow along on your own cluster, or watch first and practice afterward using the lab materials.

## Why This Matters

While admission control is advanced material beyond core CKAD requirements, understanding how it works is crucial for troubleshooting. When your deployments mysteriously fail in the exam or production environments, admission controllers are often the reason. Knowing where to look for admission errors - checking ReplicaSet events, understanding ResourceQuota violations, recognizing Pod Security Standard restrictions - will save you valuable time.

The exam won't ask you to implement admission controllers, but you must quickly diagnose when they block your deployments.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for hands-on work with advanced features
- Reassure that exercises build progressively

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
