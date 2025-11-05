# ConfigMaps - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of ConfigMaps in Kubernetes - what they are, why they matter, and how they enable environment-independent configuration - it's time to work with them hands-on.

In the upcoming exercises video, we're going to create ConfigMaps using multiple methods and see how they provide configuration to running applications. You'll work with a demo application that visually displays its configuration, making it easy to see exactly how ConfigMaps affect your containers.

## What You'll Learn

In the hands-on exercises, we'll progress through different ConfigMap patterns:

First, you'll run the demo application without any ConfigMaps to see its default behavior. This establishes a baseline and demonstrates that applications always have some default configuration baked into their images.

Then, you'll add configuration through environment variables defined directly in Pod specs. This isn't using ConfigMaps yet, but it shows the traditional approach and sets up the comparison for why ConfigMaps are better.

Next, you'll create your first ConfigMap from literal values using `kubectl create configmap --from-literal`. You'll see how these simple key-value pairs can be injected into Pods as environment variables, overriding the defaults without changing the container image.

After that, you'll create ConfigMaps from files - both individual configuration files and entire directories. You'll mount these as volumes in your containers, seeing how ConfigMaps can provide complete configuration files like nginx.conf or application.properties.

You'll also work with selective mounting - choosing which keys from a ConfigMap to expose, and using the `subPath` feature to mount individual files without overwriting entire directories.

Finally, you'll explore how ConfigMap updates propagate to running Pods. You'll see that volume-mounted ConfigMaps update automatically, while environment variables require Pod restarts. This understanding is critical for managing configuration changes in production.

## Getting Ready

Before starting the exercises video, make sure you have:
- A running Kubernetes cluster (any distribution works)
- kubectl installed and configured
- A terminal and text editor ready
- Ability to access applications via port-forward or NodePort

The exercises use a custom demo application called "configurable" that makes configuration visible through a web interface. You can follow along and deploy it yourself, or watch first and practice afterward.

## Why This Matters

ConfigMaps are a core CKAD exam topic. You'll absolutely encounter questions that ask you to create ConfigMaps and use them in Pods - both as environment variables and as mounted volumes. The exam tests your ability to work quickly with all ConfigMap creation methods and consumption patterns.

Beyond the exam, ConfigMaps are fundamental to running applications in Kubernetes. Every real-world deployment uses ConfigMaps to separate configuration from code, enabling the same container images to run in different environments with different settings.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create excitement for seeing configuration in action
- Reassure that exercises build progressively from simple to complex

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
