# Rollouts and Deployment Strategies - Practical Exercises

**Duration:** 18-22 minutes
**Format:** Live demonstration and hands-on practice
**Prerequisites:** Kubernetes cluster running, kubectl configured

---

## Introduction (1 minute)

Welcome to the hands-on portion of our deployment strategies session. We'll work through real scenarios you'll encounter in the CKAD exam and production environments.

**What we'll cover:**
1. Fast and slow rolling updates
2. Rollback operations
3. Big-bang recreate strategy
4. Blue/Green deployment implementation
5. Canary deployment with traffic management
6. Helm-based blue/green lab challenge

**Setup Check:**


Let's begin!

---

## Exercise 1: Fast Staged Rollouts (4 minutes)

**Scenario:** Deploy a web application and perform a fast rolling update to version 2.

### Step 1: Deploy Initial Version (1 minute)

First, let's open a watch window to observe pod changes in real-time.


Now deploy the v1 application:


**What to observe:**
- Initially no pods exist
- Three pods are created: vweb-[hash]-xxxx
- Init containers run (you'll see them in the status)
- Pods transition to Running state
- All three pods become Ready (1/1)

**Narration Point:** Notice the init container causes a slight delay. This is intentional to demonstrate rollout behavior.

Check the application:


### Step 2: Fast Rolling Update (2 minutes)

Now we'll update to v2 using a fast rollout strategy.


**What to observe in the watch window:**
- Three NEW pods are created immediately (maxSurge: 100%)
- Now you have 6 pods total (3 old + 3 new)
- New pods go through init container phase
- Once new pods are Ready, old pods start terminating
- Old pods transition: Running → Terminating → Gone
- Final state: 3 new pods running v2

**Narration Point:** This is a fast but resource-intensive strategy. You need spare capacity in your cluster to accommodate double the pods temporarily.

Verify the ReplicaSets:


Test during rollout:


**Key Learning:** During staged rollouts, multiple versions serve traffic simultaneously. Your application must handle this!

---

## Exercise 2: Rollback Operations (3 minutes)

**Scenario:** Practice rolling back deployments without reapplying YAML files.

### Step 1: Check Rollout History (30 seconds)


**Narration Point:** Currently at revision 2 (v2). Let's rollback to revision 1 (v1).

### Step 2: Perform Rollback (1.5 minutes)


**What to observe:**
- The rollback uses the CURRENT rollout strategy (fast)
- Three v1 pods are created immediately
- v2 pods are terminated when v1 pods are ready
- This is NOT reapplying the original YAML—it's reverting the Pod spec only

Verify the rollback:


**Important:** Describe the deployment to see that the rollout strategy hasn't changed.


**Key Learning:** Rollback reverts the Pod spec (image, env vars, etc.) but NOT the Deployment spec (replicas, strategy, etc.).

---

## Exercise 3: Slow Staged Rollouts (2.5 minutes)

**Scenario:** Update with a conservative rollout strategy—one pod at a time.

### Deploy Slow Update (1.5 minutes)


**What to observe:**
- Only ONE new v2 pod is created (maxSurge: 1)
- Wait for it to become ready
- Then ONE v1 pod terminates
- Repeat: Create one v2, terminate one v1
- Takes significantly longer than fast rollout

**Timing Note:** This rollout takes approximately 30-45 seconds due to init containers.


**Narration Point:** Slower rollouts are safer—if there's a problem, fewer users are affected. However, both versions run concurrently for a longer period.

### Compare Strategies (1 minute)

Let's compare what we've seen:

**Fast Rollout (maxSurge: 100%):**
- ✅ Fastest completion time
- ❌ Requires 2x resources
- ⚠️ Both versions active for shorter period

**Slow Rollout (maxSurge: 1):**
- ✅ Minimal extra resources
- ✅ Lower risk (gradual replacement)
- ⚠️ Both versions active for longer period
- ❌ Slower completion time

---

## Exercise 4: Big-Bang Recreate Strategy (2.5 minutes)

**Scenario:** Use the Recreate strategy with a broken image to see what happens.

### Deploy Broken Update (1.5 minutes)


**What to observe:**
- ALL existing pods terminate immediately
- New pods are created only after old pods are gone
- New pods fail to start (image has bad startup command)
- Pods enter CrashLoopBackOff state
- Zero pods are ready = application is DOWN

Check pod status:


Test application availability:


**Warning:** This demonstrates why Recreate is dangerous. A bad deployment takes your entire application offline!

### Rollback to Recovery (1 minute)


**What to observe:**
- All failing pods terminate
- New pods are created (using previous Pod spec)
- Init containers run (causing delay)
- Eventually pods become ready and app is restored

**Key Learning:** Even the rollback uses the Recreate strategy (it's still configured in the Deployment spec), so there's continued downtime during rollback!

**Time estimate:** 30-45 seconds for app to come back online.

---

## Exercise 5: Blue/Green Deployment (4 minutes)

**Scenario:** Implement manual blue/green deployment with instant traffic switching.

### Step 1: Deploy Blue Version (1 minute)


**What was created:**
- Deployment: vweb-bg-blue (3 replicas of v1)
- Service: vweb-bg-svc (selector: version=blue, NodePort 30019)

Test the blue version:


**Narration Point:** Traffic currently goes to blue. Let's deploy green without affecting users.

### Step 2: Deploy Green Version (1 minute)


Test that traffic still goes to blue:


**Narration Point:** Green is running but receiving no traffic. The Service selector still points to version=blue.

### Step 3: Test Green Directly (30 seconds)

Before switching production traffic, test green directly:


### Step 4: Switch Production Traffic (1 minute)

Now perform the instant switchover:


**Key Point:** This switch happens INSTANTLY. No pod restarts, no waiting. Just updating the Service selector.

### Step 5: Rollback Demonstration (30 seconds)

Show how easy rollback is:


**Key Learning:** Blue/green gives you instant switchover and instant rollback. The "cost" is running both versions simultaneously (2x resources).

---

## Exercise 6: Canary Deployment (4 minutes)

**Scenario:** Implement canary deployment with gradual traffic increase.

### Step 1: Deploy Stable Version (1 minute)


Test that all traffic goes to stable:


### Step 2: Deploy Canary (20% Traffic) (1 minute)


Test the traffic distribution:


**Narration Point:** The Service load-balances across all 5 pods. With 1 canary and 4 stable, approximately 20% of requests hit canary.

### Step 3: Increase Canary to 50% (1 minute)


**Narration Point:** In a real scenario, you'd monitor metrics here (error rates, latency, etc.) before proceeding.

### Step 4: Complete Rollout to 100% Canary (1 minute)


### Step 5: Demonstrate Rollback (30 seconds)

Show how to rollback if issues detected:


**Key Learning:** Canary gives you gradual rollout with checkpoints. You can stop and rollback at any stage if problems are detected.

---

## Lab Challenge: Helm Blue/Green (2 minutes)

**Scenario:** Fix a Helm chart to properly implement blue/green deployment.

### The Problem (30 seconds)


**Problem:** Both blue and green releases are receiving traffic simultaneously.

### Your Task (30 seconds)

**Goals:**
1. Fix the chart so only one version (blue OR green) receives traffic at a time
2. Enable switching releases with: `helm upgrade --set activeSlot=green vweb labs/rollouts/helm/vweb`
3. Implement automatic rollback: If updating blue to broken v3 image, rollback after 30 seconds if unsuccessful

**Hints:**
- Check the Service template selector
- Look at deployment templates and labels
- Use Helm values to control active slot
- Research `helm upgrade --wait --timeout` for automatic rollback

### Solution Path (1 minute)

**Key fixes needed:**
1. Service selector should use `slot: {{ .Values.activeSlot }}`
2. Deployments need proper slot labels
3. Use `helm upgrade --atomic --timeout 30s` for automatic rollback

**Time permitting, work through the solution or reference solution.md**

---

## Cleanup (1 minute)


---

## Summary and Key Takeaways (1 minute)

**What we practiced:**

1. **Rolling Updates:** Fast (maxSurge: 100%) and slow (maxSurge: 1) strategies
2. **Rollback:** Using `kubectl rollout undo` without reapplying YAML
3. **Recreate Strategy:** Saw the danger of big-bang updates
4. **Blue/Green:** Instant traffic switching with Service selector patching
5. **Canary:** Gradual rollout with traffic percentage control
6. **Helm:** Blue/green deployment management with Helm

**CKAD Exam Skills Reinforced:**
- ✅ Configuring rollout strategies (maxSurge, maxUnavailable)
- ✅ Managing rollouts (status, history, undo)
- ✅ Implementing blue/green with kubectl patch
- ✅ Creating canary deployments with multiple Deployments
- ✅ Understanding trade-offs between strategies

**Real-World Application:**
- Choose rolling updates for most scenarios
- Use blue/green for critical services requiring instant rollback
- Implement canary for high-risk changes with gradual validation
- Avoid Recreate in production unless absolutely necessary

---

**Total Duration:** 18-22 minutes
**Next Session:** CKAD exam-focused scenarios and advanced deployment patterns
