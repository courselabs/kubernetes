# RBAC - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of Role-Based Access Control - what it is, how it provides authorization in Kubernetes, and the relationship between Roles, RoleBindings, and ServiceAccounts - it's time to see RBAC in action.

In the upcoming exercises video, we're going to create Roles that define permissions, bind them to users and ServiceAccounts, and test access controls. You'll see how Kubernetes enforces least-privilege access for security.

## What You'll Learn

In the hands-on exercises, we'll work through practical RBAC patterns:

First, you'll create Roles that grant specific permissions on Kubernetes resources. You'll define rules that allow verbs like get, list, create, delete on resources like Pods, Services, and Deployments. You'll understand how to build up permissions from atomic operations.

Then, we'll create RoleBindings that connect Roles to subjects - users, groups, or ServiceAccounts. You'll see how RoleBindings activate permissions, allowing subjects to perform actions they couldn't before.

Next, you'll work with ServiceAccounts - the identities that Pods use. You'll create custom ServiceAccounts, bind Roles to them, and configure Pods to use these ServiceAccounts. You'll see how applications get the permissions they need without sharing credentials.

After that, you'll explore ClusterRoles and ClusterRoleBindings for cluster-wide permissions. You'll see how these differ from namespaced Roles, and when to use each for proper scope limitation.

You'll also test permissions using `kubectl auth can-i` to verify what actions are allowed. This tool helps you validate RBAC configurations before deploying applications.

Finally, you'll troubleshoot RBAC issues - diagnosing "Forbidden" errors, understanding permission denials, and fixing RoleBinding configuration problems.

## Getting Ready

Before starting the exercises video, make sure you have:
- A Kubernetes cluster where you have admin permissions
- kubectl installed and configured
- A terminal and text editor ready
- Understanding that RBAC errors are common when permissions are too restrictive

The exercises demonstrate RBAC patterns for common scenarios. You'll see security best practices for least-privilege access control.

## Why This Matters

RBAC is important CKAD exam content. You may be asked to create ServiceAccounts, bind Roles, or troubleshoot permission errors. The exam expects you to understand RBAC syntax and common patterns.

Beyond the exam, RBAC is fundamental to Kubernetes security. Every production cluster uses RBAC to control who can do what. Understanding RBAC enables you to implement secure, least-privilege access for applications and users.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create awareness about security importance
- Reassure about RBAC complexity

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
