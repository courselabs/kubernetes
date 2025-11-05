# Services - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of Kubernetes Services - what they are, why they're essential for networking, and the different Service types - it's time to see them in action.

In the upcoming exercises video, we're going to create Services using different types, test connectivity between Pods, and see how DNS integration makes service discovery automatic. You'll understand exactly how Kubernetes provides stable networking in a dynamic container environment.

## What You'll Learn

In the hands-on exercises, we'll explore all the major Service patterns:

First, you'll deploy an application and create a ClusterIP Service to expose it internally. You'll see how the Service gets a stable IP address and automatic DNS entry. You'll test connectivity from other Pods using both the Service IP and DNS name, understanding how internal service discovery works.

Then, we'll work with label selectors - the mechanism that connects Services to Pods. You'll see how Services automatically discover and route to Pods with matching labels. You'll add and remove labels from Pods and watch how the Service endpoints update dynamically. This demonstrates the loose coupling that makes Kubernetes so flexible.

Next, you'll create a NodePort Service to expose your application externally. You'll access the application through any node's IP address on the assigned port. You'll understand the relationship between NodePort and ClusterIP - every NodePort is also a ClusterIP, giving you both internal and external access.

After that, you'll create a LoadBalancer Service (if your environment supports it). You'll see how Kubernetes provisions cloud load balancers automatically and routes external traffic into your cluster. You'll understand why LoadBalancer Services are the preferred choice for production external access.

You'll also work with service endpoints. You'll use `kubectl get endpoints` to see exactly which Pods are backing each Service. When Pods fail health checks or aren't ready, you'll see them disappear from the endpoints list. This shows how Kubernetes ensures Services only route to healthy Pods.

Finally, you'll explore DNS naming patterns. You'll test accessing services using short names within the same namespace, and fully qualified names across namespaces. You'll understand the pattern: `service-name.namespace.svc.cluster.local`.

## Getting Ready

Before starting the exercises video, make sure you have:
- A running Kubernetes cluster (any distribution works)
- kubectl installed and configured
- A terminal and text editor ready
- Ability to access Services via port-forward, NodePort, or LoadBalancer

The exercises use simple web applications that make it easy to verify connectivity and see which Pod is responding. You can follow along on your own cluster, or watch first and practice afterward.

## Why This Matters

Services are core CKAD exam content. You'll absolutely be asked to create Services, expose Deployments, and troubleshoot networking issues. The exam expects you to understand all Service types and know when to use each one.

Beyond the exam, Services are fundamental to Kubernetes networking. Every application that needs to be accessed - whether by other Pods or external users - needs a Service. Understanding how Services work is essential for building reliable distributed applications.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for seeing networking in action
- Reassure that exercises build progressively

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
