# Deployments - CKAD Exam Preparation Script

**Duration:** 25-30 minutes
**Format:** Screen recording with live demonstration
**Focus:** CKAD exam scenarios and advanced deployment techniques

---

## Opening

Welcome to the CKAD-focused session on Deployments. In this video, we'll go beyond the basics and cover everything you need to master Deployments for the Certified Kubernetes Application Developer exam.

The CKAD exam tests your ability to work quickly and accurately with production-ready configurations. For Deployments, this means understanding deployment strategies, health checks, resource management, advanced rollout controls, and various deployment patterns.

Let's dive into these advanced topics with practical examples.

## Deployment Strategies Overview

Kubernetes supports two deployment strategies, and you need to know both for the exam.

The **RollingUpdate strategy** is the default. It gradually replaces old Pods with new ones, ensuring some are always available. This is what we used in the exercises video.

The **Recreate strategy** terminates all Pods before creating new ones. This causes downtime but ensures old and new versions never run simultaneously.

Let's see both in action.

## RollingUpdate Strategy Configuration

First, let's create a Deployment with explicit RollingUpdate configuration.

The key section is the **strategy**:
- **type: RollingUpdate** - explicitly sets the strategy
- **maxSurge: 1** - at most 1 extra Pod during updates (25% is default)
- **maxUnavailable: 1** - at most 1 Pod can be unavailable (25% is default)

With 4 replicas, maxSurge=1 means we'll have at most 5 Pods during updates, and maxUnavailable=1 means at least 3 must be available.

Let's verify it's running.

Perfect! Four replicas running. Now let's trigger an update to see the strategy in action.

I'll open a watch window first.

And update the image in another terminal.

Watch the pattern:
- One new Pod is created (maxSurge=1)
- Once it's ready, one old Pod is terminated
- Another new Pod is created
- This continues until all Pods are updated

At no point did we have fewer than 3 Pods available (4 - maxUnavailable).

## Zero-Downtime Configuration

For critical applications, you want absolute zero downtime. Set maxUnavailable to 0.

This guarantees:
- All 4 Pods remain available during updates
- We temporarily have 5 Pods (4 + maxSurge)
- Only after a new Pod is ready does an old one terminate

This is a common exam scenario: "Ensure zero downtime during deployments."

Let me update the Deployment with this configuration.

Now trigger another update.

Watch carefully - you'll see 5 Pods momentarily. The extra Pod must become ready before any old Pod is removed. This is your zero-downtime guarantee.

## Recreate Strategy

Now let's see the Recreate strategy. This is used when you can't have multiple versions running simultaneously.

The strategy is simply **type: Recreate** - no additional parameters needed.

Wait for it to be ready, then watch for the update.

Trigger an update.

Notice the difference:
- All three Pods terminate immediately
- Only after termination do new Pods get created
- There's a period with zero Pods running

This causes downtime but is necessary when:
- Your application uses a database schema that changes
- You're releasing exclusive resources like file locks
- The old and new versions can't share the same database
- You have resource constraints preventing both versions

For the exam, know when each strategy is appropriate.

## Advanced Rollout Management

Let's explore advanced rollout controls that are exam topics.

### Recording Changes with Annotations

Kubernetes tracks why changes were made using annotations. The --record flag is deprecated, so use annotations instead.

Now check the rollout history.

You'll see the change cause in the CHANGE-CAUSE column. This is valuable for tracking what changed and why.

### Pausing and Resuming Rollouts

You can pause a Deployment to make multiple changes before rolling them out together.

Now make several changes.

Check the Pods.

Nothing changed! The Deployment is paused.

Now resume to apply all changes in one rollout.

Watch the update.

Both changes (image and resources) applied in a single rollout. This is useful when you need to batch multiple updates.

### Checking Rollout Status

The rollout status command blocks until the rollout completes.

When it says "successfully rolled out," the update is complete and all Pods are ready.

For exam scripts, this ensures commands wait for completion before proceeding.

### Rolling Back to Specific Revisions

You can roll back to any previous revision, not just the previous one.

Let's say we want to roll back to revision 2.

This jumps directly to that specific configuration. Very useful when you need to skip over several bad releases.

## Resource Management

Production Deployments must include resource requests and limits. This is critical for the exam.

The **requests** section guarantees minimum resources:
- 64 MiB of memory
- 100 millicores (0.1 CPU cores)

The **limits** section caps maximum usage:
- 128 MiB of memory
- 200 millicores (0.2 CPU cores)

For the exam, you can set resources imperatively to save time.

This is much faster than editing YAML during the exam.

Let's verify the resources were set.

Perfect! You can see both requests and limits.

Understanding QoS classes is also exam material. Let's check.

The QoS Class is "Burstable" because requests are less than limits. For "Guaranteed" QoS, requests must equal limits for all resources.

## Health Checks for Zero-Downtime

Readiness probes are critical for zero-downtime deployments. Let's create a Deployment with proper health checks.

The **readinessProbe** determines when a Pod can receive traffic:
- HTTP GET to / on port 80
- Waits 5 seconds before first check
- Checks every 5 seconds
- Pod removed from Service endpoints if it fails

The **livenessProbe** determines when to restart:
- Same HTTP check
- Waits 15 seconds (longer initial delay)
- Checks every 10 seconds
- Restarts the container if it fails

Let's watch the Pods during creation.

Notice the Pods show 0/1 ready initially, then switch to 1/1 after the readiness probe succeeds. This is crucial - without readiness probes, Pods receive traffic immediately, even if they're not ready.

During rolling updates, new Pods won't receive traffic until the readiness probe passes. This ensures zero downtime.

For the exam, know all three probe types:

**HTTP GET probe:**

**TCP Socket probe:**

**Exec probe:**

Practice creating all three quickly.

## Production-Ready Deployment

Let's combine everything into a production-ready Deployment that would pass any exam scenario.

This Deployment has everything:
- Appropriate replica count for HA
- Zero-downtime rolling update strategy
- Resource requests and limits
- Readiness probe for traffic management
- Liveness probe for auto-healing
- Named port for clarity
- Pinned image version
- Change-cause annotation
- Meaningful labels

This is your template for exam questions asking for "production-ready" Deployments.

## Canary Deployment Pattern

Canary deployments are an advanced pattern tested in the exam. You run a small percentage of traffic on the new version to test it.

The strategy: Create two Deployments with different replica counts, both selected by the same Service.

First, the main Deployment with most replicas.

Then the canary Deployment with fewer replicas.

Both use the label "app=whoami-canary" but different "version" labels.

The Service selects only the app label, not the version.

Check what we created.

We have 4 total Pods: 3 main, 1 canary. The Service distributes traffic proportionally - about 75% to main, 25% to canary.

Let's test it.

You'll see mostly full responses (main version) with occasional short responses (canary). That's the canary receiving about 25% of traffic.

If the canary performs well, promote it:

Now 100% of traffic goes to the canary version. If there are issues, quickly scale back:

This pattern gives you production traffic testing with minimal risk.

## Quick Command Reference for CKAD

Let me show you time-saving imperative commands for the exam.

Create a Deployment quickly:

This generates a basic Deployment. You can save it to YAML for editing:

Update the image:

Scale:

Set resources:

Expose as a Service:

Check rollout status:

View history:

Rollback:

Restart all Pods (triggers rollout):

Patch specific fields:

These commands are much faster than editing YAML during the exam.

## Common CKAD Exam Scenarios

Let me walk through typical exam scenarios.

### Scenario 1: Zero-Downtime Update

"Update the deployment 'webapp' to use nginx:1.21 with zero downtime."

### Scenario 2: Fix Failed Deployment

"The deployment 'api' failed to roll out. Investigate and fix."

### Scenario 3: Production-Ready Configuration

"Create a production-ready deployment 'frontend' with nginx:1.21, 3 replicas, resource limits, and health checks."

### Scenario 4: Canary Deployment

"Deploy a canary version of 'backend' with 20% traffic to the new version."

### Scenario 5: Resource Management

"Add resource limits to 'worker' deployment: CPU 500m, Memory 256Mi."

## Troubleshooting Tips

Quick debugging steps for exam scenarios:

Check Deployment status:

Check ReplicaSets:

Check Pods:

Check rollout issues:

Common failure reasons:
- **ImagePullBackOff**: Wrong image name or registry auth
- **CrashLoopBackOff**: Container keeps failing
- **Pending**: Resource constraints or scheduling issues
- **Rollout stuck**: Check readiness probes and events

Force a new rollout:

## Cleanup

Let's clean up all the resources we created.

## CKAD Exam Tips Summary

**Time Management:**
- Use kubectl create to generate YAML quickly
- Use imperative commands when possible
- Practice typing resource limits and probes from memory
- Set your editor: export KUBE_EDITOR=nano

**Must-Know Commands:**
- kubectl create deployment
- kubectl set image
- kubectl scale
- kubectl set resources
- kubectl rollout status/history/undo
- kubectl expose

**Key Concepts:**
- Zero downtime requires maxUnavailable: 0
- Readiness probes prevent traffic to unready Pods
- Liveness probes restart unhealthy containers
- Requests guarantee resources, limits cap them
- ReplicaSets implement updates
- Rollbacks just scale old ReplicaSets back up

**Common Requirements:**
- Production-ready means: replicas ≥ 2, resources set, probes configured, rolling update strategy
- Zero downtime means: maxUnavailable: 0, readiness probes
- Canary means: two Deployments, same Service selector
- Blue-green means: two Deployments, Service selector controls traffic

**Documentation:**
- You can access kubernetes.io/docs during exam
- Bookmark key pages beforehand
- Search for "deployment" and use examples
- kubectl explain is allowed: kubectl explain deployment.spec.strategy

## Practice Exercise

Here's a comprehensive exercise combining multiple concepts:

Create a production-ready deployment named "shop" that:
1. Runs nginx:1.21 with 3 replicas
2. Has zero-downtime updates configured
3. Includes CPU request 100m, limit 200m
4. Includes memory request 64Mi, limit 128Mi
5. Has HTTP readiness probe on port 80, path /
6. Has HTTP liveness probe with 15s initial delay
7. Uses RollingUpdate with maxSurge 1
8. Has proper labels: app=shop, tier=frontend

Pause the video and create this from scratch. Time yourself - in the exam, this should take 3-5 minutes.

## Summary

In this video, we covered all advanced Deployment topics for the CKAD exam:

- RollingUpdate and Recreate strategies with configuration
- Zero-downtime deployments with maxUnavailable: 0
- Advanced rollout management (pause, resume, annotations)
- Resource requests and limits with imperative commands
- Readiness and liveness probes for production reliability
- Production-ready Deployment checklist
- Canary deployment pattern for testing in production
- Time-saving imperative commands
- Common exam scenarios with solutions
- Troubleshooting techniques

## Final Advice

Practice is key. Set up scenarios and time yourself:
- Can you create a basic Deployment in 30 seconds?
- Can you add resources and probes in 2 minutes?
- Can you troubleshoot a failing rollout in 1 minute?

The exam is performance-based. Knowing the concepts isn't enough - you must execute quickly and accurately.

Keep practicing, use the official docs during practice, and familiarize yourself with kubectl explain.

Good luck with your CKAD exam!

---
