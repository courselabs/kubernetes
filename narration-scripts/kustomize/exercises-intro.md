# Kustomize - Exercises Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with terminal visible
**Purpose:** Bridge from concepts to hands-on practice

---

## Transition to Practice

Welcome back! Now that we've covered the fundamental concepts of Kustomize - what it is, how it manages Kubernetes manifests without templates, and why it's valuable for environment-specific configurations - it's time to work with Kustomize hands-on.

In the upcoming exercises video, we're going to use Kustomize to manage application configurations across multiple environments. You'll see how overlays and patches enable environment customization without duplicating YAML.

## What You'll Learn

In the hands-on exercises, we'll work through practical Kustomize patterns:

First, you'll create a base configuration with common resources shared across all environments. You'll see how the base contains Deployments, Services, and ConfigMaps that apply universally.

Then, we'll create overlays for different environments - development, staging, production. Each overlay will customize the base for specific requirements: different replica counts, resource limits, or ConfigMap values. You'll see how overlays keep environment-specific changes organized.

Next, you'll use `kubectl apply -k` to deploy Kustomized applications. You'll see how kubectl's built-in Kustomize support makes deployment simple without additional tools. You'll understand the workflow from source to cluster.

After that, you'll work with patches to modify specific fields. You'll use strategic merge patches for partial updates and JSON patches for precise changes. You'll see how patches enable surgical modifications without duplicating entire resource definitions.

You'll also explore Kustomize features like commonLabels, namePrefix, and configMapGenerator. These transformers automate repetitive modifications, ensuring consistency across resources.

Finally, you'll troubleshoot Kustomize builds - diagnosing patch conflicts, understanding build errors, and verifying output before applying to the cluster.

## Getting Ready

Before starting the exercises video, make sure you have:
- A running Kubernetes cluster (any distribution works)
- kubectl v1.14+ with built-in Kustomize support
- A terminal and text editor ready
- Understanding that Kustomize works with standard YAML

The exercises demonstrate Kustomize patterns that make multi-environment management sustainable and maintainable.

## Why This Matters

Kustomize is beyond core CKAD requirements but is built into kubectl, making basic familiarity valuable. Understanding Kustomize helps you manage configuration variations without copy-paste sprawl. While deep Kustomize expertise isn't needed for CKAD, basic concepts are accessible.

Beyond the exam, Kustomize is widely adopted for managing Kubernetes configurations in GitOps workflows. Many organizations use Kustomize to customize applications across environments.

Let's get started with the hands-on exercises!

---

## Recording Notes

**Visual Setup:**
- Can be talking head, screen capture with small webcam overlay, or just terminal
- Should feel like a quick transition, not a full lesson

**Tone:**
- Encouraging and energizing
- Create awareness that Kustomize is built into kubectl
- Reassure that basic concepts are straightforward

**Timing:**
- Opening: 30 sec
- What You'll Learn: 1.5 min
- Getting Ready: 30 sec
- Why This Matters: 30 sec

**Total: ~3 minutes**
