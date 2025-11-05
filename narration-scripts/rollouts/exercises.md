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
```bash
# Verify cluster is ready
kubectl get nodes

# Check we're in the right directory
pwd  # Should be at repository root
```

Let's begin!

---

## Exercise 1: Fast Staged Rollouts (4 minutes)

**Scenario:** Deploy a web application and perform a fast rolling update to version 2.

### Step 1: Deploy Initial Version (1 minute)

First, let's open a watch window to observe pod changes in real-time.

```bash
# In a split terminal or separate window, start watching pods
kubectl get po -l app=vweb --watch
```

Now deploy the v1 application:

```bash
# Deploy the vweb application
kubectl apply -f labs/rollouts/specs/vweb
```

**What to observe:**
- Initially no pods exist
- Three pods are created: vweb-[hash]-xxxx
- Init containers run (you'll see them in the status)
- Pods transition to Running state
- All three pods become Ready (1/1)

**Narration Point:** Notice the init container causes a slight delay. This is intentional to demonstrate rollout behavior.

Check the application:

```bash
# View the service
kubectl get svc vweb-np

# Test the application (NodePort 30018)
curl localhost:30018/v.txt
# Output: v1
```

### Step 2: Fast Rolling Update (2 minutes)

Now we'll update to v2 using a fast rollout strategy.

```bash
# Apply the fast update
kubectl apply -f labs/rollouts/specs/vweb/update-fast
```

**What to observe in the watch window:**
- Three NEW pods are created immediately (maxSurge: 100%)
- Now you have 6 pods total (3 old + 3 new)
- New pods go through init container phase
- Once new pods are Ready, old pods start terminating
- Old pods transition: Running → Terminating → Gone
- Final state: 3 new pods running v2

**Narration Point:** This is a fast but resource-intensive strategy. You need spare capacity in your cluster to accommodate double the pods temporarily.

Verify the ReplicaSets:

```bash
# Check ReplicaSets
kubectl get rs -l app=vweb

# You'll see two ReplicaSets:
# - Old RS: desired=0, current=0 (v1)
# - New RS: desired=3, current=3 (v2)
```

Test during rollout:

```bash
# While rolling out, you'll get responses from both versions
curl localhost:30018/v.txt
# Outputs: mix of "v1" and "v2"
```

**Key Learning:** During staged rollouts, multiple versions serve traffic simultaneously. Your application must handle this!

---

## Exercise 2: Rollback Operations (3 minutes)

**Scenario:** Practice rolling back deployments without reapplying YAML files.

### Step 1: Check Rollout History (30 seconds)

```bash
# View deployment history
kubectl rollout history deploy/vweb

# Output shows:
# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         <none>
```

**Narration Point:** Currently at revision 2 (v2). Let's rollback to revision 1 (v1).

### Step 2: Perform Rollback (1.5 minutes)

```bash
# Rollback to previous version
kubectl rollout undo deploy/vweb
```

**What to observe:**
- The rollback uses the CURRENT rollout strategy (fast)
- Three v1 pods are created immediately
- v2 pods are terminated when v1 pods are ready
- This is NOT reapplying the original YAML—it's reverting the Pod spec only

Verify the rollback:

```bash
# Check current version
curl localhost:30018/v.txt
# Output: v1

# Check ReplicaSets again
kubectl get rs -l app=vweb
# The OLD ReplicaSet is now scaled up to 3
# The NEW ReplicaSet is scaled down to 0
```

**Important:** Describe the deployment to see that the rollout strategy hasn't changed.

```bash
kubectl describe deploy vweb | grep -A 5 Strategy
# Still shows: maxSurge=100%, maxUnavailable=0
```

**Key Learning:** Rollback reverts the Pod spec (image, env vars, etc.) but NOT the Deployment spec (replicas, strategy, etc.).

---

## Exercise 3: Slow Staged Rollouts (2.5 minutes)

**Scenario:** Update with a conservative rollout strategy—one pod at a time.

### Deploy Slow Update (1.5 minutes)

```bash
# Apply slow rollout configuration
kubectl apply -f labs/rollouts/specs/vweb/update-slow
```

**What to observe:**
- Only ONE new v2 pod is created (maxSurge: 1)
- Wait for it to become ready
- Then ONE v1 pod terminates
- Repeat: Create one v2, terminate one v1
- Takes significantly longer than fast rollout

**Timing Note:** This rollout takes approximately 30-45 seconds due to init containers.

```bash
# Monitor rollout progress
kubectl rollout status deploy/vweb
# Shows: "Waiting for deployment 'vweb' rollout to finish..."
```

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

```bash
# Apply recreate strategy with broken image
kubectl apply -f labs/rollouts/specs/vweb/update-broken
```

**What to observe:**
- ALL existing pods terminate immediately
- New pods are created only after old pods are gone
- New pods fail to start (image has bad startup command)
- Pods enter CrashLoopBackOff state
- Zero pods are ready = application is DOWN

Check pod status:

```bash
# View pods
kubectl get pods -l app=vweb

# Check logs of failed pod
kubectl logs <pod-name>
# Shows error from bad startup command
```

Test application availability:

```bash
curl localhost:30018/v.txt
# Connection refused or timeout - app is DOWN
```

**Warning:** This demonstrates why Recreate is dangerous. A bad deployment takes your entire application offline!

### Rollback to Recovery (1 minute)

```bash
# Check history
kubectl rollout history deploy/vweb

# Rollback to previous version
kubectl rollout undo deploy/vweb
```

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

```bash
# Deploy blue/green setup
kubectl apply -f labs/rollouts/specs/blue-green/

# Check what was created
kubectl get deploy,svc -l strategy=blue-green
kubectl get po -l app=vweb-bg
```

**What was created:**
- Deployment: vweb-bg-blue (3 replicas of v1)
- Service: vweb-bg-svc (selector: version=blue, NodePort 30019)

Test the blue version:

```bash
# Access the application
curl localhost:30019/v.txt
# Output: v1 (blue version)
```

**Narration Point:** Traffic currently goes to blue. Let's deploy green without affecting users.

### Step 2: Deploy Green Version (1 minute)

```bash
# Deploy green version
kubectl apply -f labs/rollouts/specs/blue-green/green-deployment.yaml

# Verify both versions running
kubectl get deploy -l app=vweb-bg
# Shows two deployments: blue and green

kubectl get po -l app=vweb-bg
# Shows 6 pods total: 3 blue + 3 green
```

Test that traffic still goes to blue:

```bash
curl localhost:30019/v.txt
# Still outputs: v1 (blue)
```

**Narration Point:** Green is running but receiving no traffic. The Service selector still points to version=blue.

### Step 3: Test Green Directly (30 seconds)

Before switching production traffic, test green directly:

```bash
# Get a green pod name
kubectl get po -l version=green

# Port-forward to test (in separate terminal)
kubectl port-forward <green-pod-name> 8081:80

# In original terminal, test green
curl localhost:8081/v.txt
# Output: v2 (green version)
```

### Step 4: Switch Production Traffic (1 minute)

Now perform the instant switchover:

```bash
# Switch service to green
kubectl patch service vweb-bg-svc -p '{"spec":{"selector":{"version":"green"}}}'

# Verify the switch
curl localhost:30019/v.txt
# Output: v2 (green is now live!)

# Check service endpoints
kubectl get endpoints vweb-bg-svc
# Shows only green pod IPs
```

**Key Point:** This switch happens INSTANTLY. No pod restarts, no waiting. Just updating the Service selector.

### Step 5: Rollback Demonstration (30 seconds)

Show how easy rollback is:

```bash
# Instant rollback to blue
kubectl patch service vweb-bg-svc -p '{"spec":{"selector":{"version":"blue"}}}'

# Verify rollback
curl localhost:30019/v.txt
# Output: v1 (back to blue)
```

**Key Learning:** Blue/green gives you instant switchover and instant rollback. The "cost" is running both versions simultaneously (2x resources).

---

## Exercise 6: Canary Deployment (4 minutes)

**Scenario:** Implement canary deployment with gradual traffic increase.

### Step 1: Deploy Stable Version (1 minute)

```bash
# Deploy stable version (4 replicas)
kubectl apply -f labs/rollouts/specs/canary/stable-deployment.yaml

# Check deployment
kubectl get deploy vweb-canary-stable
kubectl get po -l app=vweb-canary

# Deploy service
kubectl apply -f labs/rollouts/specs/canary/service.yaml
```

Test that all traffic goes to stable:

```bash
# Make multiple requests
for i in {1..10}; do curl -s localhost:30020/v.txt; done
# All outputs: v1
```

### Step 2: Deploy Canary (20% Traffic) (1 minute)

```bash
# Deploy canary (1 replica = 20% of traffic)
kubectl apply -f labs/rollouts/specs/canary/canary-deployment.yaml

# Check both deployments
kubectl get deploy -l app=vweb-canary
# Shows: stable (4 replicas) and canary (1 replica)

kubectl get po -l app=vweb-canary
# Shows 5 pods total: 4 stable + 1 canary
```

Test the traffic distribution:

```bash
# Make 20 requests and count versions
for i in {1..20}; do curl -s localhost:30020/v.txt; done | sort | uniq -c

# Expected output (approximately):
#   16 v1  (80% - stable)
#    4 v2  (20% - canary)
```

**Narration Point:** The Service load-balances across all 5 pods. With 1 canary and 4 stable, approximately 20% of requests hit canary.

### Step 3: Increase Canary to 50% (1 minute)

```bash
# Scale both deployments
kubectl scale deployment vweb-canary-canary --replicas=3
kubectl scale deployment vweb-canary-stable --replicas=3

# Check distribution
for i in {1..20}; do curl -s localhost:30020/v.txt; done | sort | uniq -c

# Expected output (approximately):
#   10 v1  (50% - stable)
#   10 v2  (50% - canary)
```

**Narration Point:** In a real scenario, you'd monitor metrics here (error rates, latency, etc.) before proceeding.

### Step 4: Complete Rollout to 100% Canary (1 minute)

```bash
# Scale canary to 100%
kubectl scale deployment vweb-canary-canary --replicas=4
kubectl scale deployment vweb-canary-stable --replicas=0

# Verify all traffic to v2
for i in {1..10}; do curl -s localhost:30020/v.txt; done
# All outputs: v2
```

### Step 5: Demonstrate Rollback (30 seconds)

Show how to rollback if issues detected:

```bash
# Immediate rollback - scale canary to 0
kubectl scale deployment vweb-canary-canary --replicas=0
kubectl scale deployment vweb-canary-stable --replicas=4

# Verify rollback
for i in {1..10}; do curl -s localhost:30020/v.txt; done
# All outputs: v1
```

**Key Learning:** Canary gives you gradual rollout with checkpoints. You can stop and rollback at any stage if problems are detected.

---

## Lab Challenge: Helm Blue/Green (2 minutes)

**Scenario:** Fix a Helm chart to properly implement blue/green deployment.

### The Problem (30 seconds)

```bash
# Install the broken chart
helm install vweb labs/rollouts/helm/vweb

# Test the application
curl localhost:30021/v.txt
# Output flickers between v1 and v2 - WRONG!
```

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

```bash
# Remove Helm chart
helm uninstall vweb

# Remove all exercise resources
kubectl delete ds,sts,deploy,svc -l kubernetes.courselabs.co=rollouts

# Verify cleanup
kubectl get all -l kubernetes.courselabs.co=rollouts
# Should return: No resources found
```

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
