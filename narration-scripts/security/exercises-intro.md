# Security - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered fundamental Kubernetes security concepts - Pod Security Standards, security contexts, RBAC, and network policies - it's time to implement these security controls hands-on.

In the upcoming exercises video, we're going to configure secure Pod specifications, enforce security policies at the namespace level, and implement defense-in-depth patterns. You'll see how to harden Kubernetes applications against common threats.

## What You'll Learn

In the hands-on exercises, we'll implement security best practices:

First, you'll configure security contexts at both Pod and container levels. You'll run containers as non-root users, drop Linux capabilities, set read-only root filesystems, and prevent privilege escalation. You'll see how these controls reduce attack surface.

Then, we'll work with Pod Security Standards enforcement. You'll label namespaces to enforce baseline or restricted security policies. You'll see how Pod Security admission rejects Pods that violate security requirements, preventing dangerous configurations from running.

Next, you'll create and configure ServiceAccounts with minimal RBAC permissions. You'll implement least-privilege access control, ensuring applications can only perform necessary API operations. You'll test permissions to verify restrictions.

After that, you'll implement NetworkPolicies for network segmentation. You'll create zero-trust networking where communication is denied by default and explicitly allowed only where needed. You'll see how this limits lateral movement during security incidents.

You'll also work with Secrets for sensitive data, using volume mounts instead of environment variables for improved security, and ensuring proper access controls.

Finally, you'll troubleshoot security-related Pod failures - diagnosing permission denied errors, understanding security policy violations, and fixing configurations to meet security requirements without breaking functionality.

## Getting Ready

Before starting the exercises video, make sure you have:
- A running Kubernetes cluster with Pod Security admission enabled
- kubectl installed and configured
- A terminal and text editor ready
- Understanding that security features may vary by cluster type

The exercises demonstrate security patterns that protect applications in production environments, balancing security with functionality.

## Why This Matters

Security is core to CKAD. You'll configure security contexts, work with RBAC, and potentially implement NetworkPolicies. The exam expects you to know how to secure applications without extensive security expertise.

Beyond the exam, security is fundamental to production Kubernetes. Every application needs proper security controls. Understanding these patterns helps you deploy secure, compliant applications.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create awareness about security importance
- Reassure that security patterns are learnable

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
