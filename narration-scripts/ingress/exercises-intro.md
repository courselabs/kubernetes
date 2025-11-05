# Ingress - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of Ingress - what it is, how it provides HTTP/HTTPS routing, and why it's more efficient than multiple LoadBalancer Services - it's time to work with Ingress controllers and rules.

In the upcoming exercises video, we're going to install an Ingress controller, create Ingress resources with routing rules, and see how a single load balancer can route to multiple backend Services based on hostnames and paths.

## What You'll Learn

In the hands-on exercises, we'll work through practical Ingress patterns:

First, you'll install an Ingress controller - the component that actually implements Ingress rules. You'll see that Ingress resources by themselves don't do anything; they're configuration that tells the Ingress controller how to route traffic. You'll learn about popular controllers like NGINX Ingress, Traefik, and cloud provider integrations.

Then, you'll create your first Ingress resource with simple host-based routing. You'll deploy multiple Services and configure an Ingress that routes traffic based on the hostname in the HTTP request. You'll see how `app.example.com` routes to one Service while `api.example.com` routes to another.

Next, we'll work with path-based routing. You'll configure an Ingress that routes requests to different Services based on the URL path. Requests to `/app` go to the app Service, requests to `/api` go to the API Service. You'll understand path types: Prefix, Exact, and ImplementationSpecific.

After that, you'll combine host and path routing in a single Ingress resource. You'll create complex routing patterns that use both hostname and path to determine the backend Service. This demonstrates how Ingress consolidates multiple routing rules.

You'll also work with TLS termination. You'll create a Secret containing TLS certificates and configure Ingress to handle HTTPS traffic, decrypting it before forwarding to backend Services. You'll see how this offloads SSL processing from application Pods.

Finally, you'll explore Ingress troubleshooting. You'll learn to check Ingress status, examine Ingress controller logs, and verify that backend Services have ready endpoints. These skills are essential when Ingress routing isn't working as expected.

## Getting Ready

Before starting the exercises video, make sure you have:
- A Kubernetes cluster that can provision LoadBalancers OR use port-forwarding
- kubectl installed and configured
- A terminal and text editor ready
- Understanding that Ingress requires a controller installation

The exercises will guide you through Ingress controller installation, but the specific steps depend on your cluster type. Docker Desktop, cloud providers, and local clusters each have different controller options.

## Why This Matters

Ingress is core CKAD exam content. You'll be asked to create Ingress resources with routing rules, configure TLS, and troubleshoot routing issues. The exam expects you to understand Ingress syntax and common patterns.

Beyond the exam, Ingress is how production Kubernetes clusters expose HTTP services efficiently. Using one LoadBalancer with routing rules is vastly more cost-effective than provisioning separate LoadBalancers for every Service.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for seeing sophisticated routing
- Reassure about controller installation complexity

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
