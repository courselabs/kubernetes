# Network Policy - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of NetworkPolicy - what it is, how it provides network segmentation within Kubernetes, and why it's essential for security - it's time to see network isolation in action.

In the upcoming exercises video, we're going to create NetworkPolicies that control Pod-to-Pod communication. You'll see how to allow and deny traffic based on labels, namespaces, and ports. You'll understand how Kubernetes implements microsegmentation for zero-trust networking.

## What You'll Learn

In the hands-on exercises, we'll work through practical network security patterns:

First, you'll deploy applications without NetworkPolicies and verify that all Pods can communicate freely. This establishes the baseline - Kubernetes allows all Pod-to-Pod traffic by default. Then you'll apply NetworkPolicies and watch traffic get blocked, understanding the shift from permissive to restrictive networking.

Then, we'll create ingress rules to allow specific incoming traffic. You'll write policies that allow traffic from Pods with certain labels, from specific namespaces, or on particular ports. You'll see how these rules build up to create precise access controls.

Next, you'll work with egress rules to control outgoing traffic. You'll restrict which external services Pods can access, implementing data exfiltration protection and limiting attack surface.

After that, you'll combine ingress and egress policies to create complete network isolation. You'll build multi-tier application security where frontend Pods can reach backend Pods, but backend Pods can't initiate connections to the frontend.

You'll also explore namespace selectors and pod selectors together. You'll create policies that allow traffic from specific Pods in specific namespaces, demonstrating complex multi-tenant security patterns.

Finally, you'll troubleshoot NetworkPolicy issues. You'll diagnose why traffic is being blocked unexpectedly, understand policy evaluation order, and verify NetworkPolicy enforcement.

## Getting Ready

Before starting the exercises video, make sure you have:
- A Kubernetes cluster with a CNI that supports NetworkPolicy (Calico, Cilium, Weave)
- kubectl installed and configured
- A terminal and text editor ready
- Understanding that not all clusters enforce NetworkPolicy by default

Note: Docker Desktop Kubernetes and some cloud providers don't enforce NetworkPolicy by default. The exercises will explain how to verify NetworkPolicy support.

## Why This Matters

NetworkPolicy is core CKAD exam content. You'll be asked to create policies that allow or deny specific traffic patterns. The exam expects you to understand NetworkPolicy syntax and common security patterns.

Beyond the exam, NetworkPolicy is fundamental to Kubernetes security. Production clusters use NetworkPolicies to implement defense-in-depth, isolate tenants, and meet compliance requirements. Understanding network segmentation is essential for secure cloud-native applications.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create awareness about security importance
- Reassure about NetworkPolicy complexity

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
