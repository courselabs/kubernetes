# Preparing for Production - Practical Exercises

**Duration:** 20-25 minutes
**Format:** Live demonstration with hands-on practice
**Prerequisites:** Kubernetes cluster, metrics-server (for HPA)

---

## Introduction (1 minute)

Today we'll transform basic deployments into production-ready applications by adding health probes, resource management, autoscaling, and security contexts.

**What You'll Learn:**
1. Configure readiness and liveness probes
2. Set resource requests and limits
3. Create HPA for autoscaling
4. Apply security contexts
5. Troubleshoot production issues

Let's build production-grade applications!

---

## Exercise 1: Self-Healing Apps with Readiness Probes (5 minutes)

### Deploy Basic Application (1 minute)


**What was created:**
- Deployment with 2 replicas
- NodePort Service on port 8010

### Trigger Application Failure (1 minute)

**Test the application:**


**Problem:** Broken pod still receives traffic.

### Add Readiness Probe (2 minutes)

**Deploy update with readiness probe:**


**Check probe configuration:**


**Test with failure:**


**Key Learning:** Readiness probe removes unhealthy pods from service without restarting them.

---

## Exercise 2: Self-Repairing Apps with Liveness Probes (4 minutes)

### Add Liveness Probe (1 minute)

**Deploy update with liveness probe:**


### Trigger and Observe Restart (2 minutes)

**Break a pod and watch recovery:**


**What to observe:**
1. Pod becomes 0/1 Ready (readiness probe fails)
2. After several failed liveness checks, pod restarts
3. RESTART count increases
4. Pod becomes 1/1 Ready again

**Verify recovery:**


### Compare Probe Types (1 minute)

**Readiness vs. Liveness:**

**Readiness:**
- ✅ Removes from Service
- ✅ Pod keeps running
- ✅ May recover on its own
- Use for: Temporary issues, overload, warming up

**Liveness:**
- ✅ Restarts container
- ✅ Fresh start
- ❌ Loses pod state
- Use for: Deadlocks, unrecoverable errors

**Database Example:**


**Shows:**
- Readiness: TCP socket probe (is DB listening?)
- Liveness: Exec command probe (is DB usable?)

---

## Exercise 3: Autoscaling with HPA (6 minutes)

### Setup Metrics Server (1 minute)

**Check if metrics-server is installed:**


### Deploy Application with HPA (2 minutes)

**Deploy Pi application with HPA:**


**Initial State:**


### Trigger Autoscaling (2 minutes)

**Generate load:**


**Watch HPA scale up:**


**Watch scale down:**


### HPA Troubleshooting (1 minute)

**Common Issues:**

**If HPA shows `<unknown>/75%`:**


**If HPA doesn't scale:**


**Docker Desktop Note:** May have issues with metrics-server. HPA might not trigger, but concept still demonstrated.

---

## Exercise 4: Lab Challenge - Complete Production Setup (7 minutes)

### The Challenge (1 minute)

**Starting point:**


**Your Goals:**

1. Run 5 replicas
2. Ensure traffic only goes to healthy pods (readiness probe)
3. Restart pods if app fails (liveness probe)
4. Add HPA: scale 5-10 pods at 50% CPU
5. Bonus: Add security context (non-root, read-only filesystem)

**Requirements:**
- App has `/healthz` endpoint for health checks
- Use HTTP probes
- Set appropriate timing parameters

### Solution Approach (6 minutes)

**Step 1: Add Health Probes (2 minutes)**


**Step 2: Create HPA (1 minute)**


**Step 3: Test Health Probes (2 minutes)**


**Step 4: Test HPA (1 minute - optional)**


---

## CKAD Exam Tips (2 minutes)

### Quick Commands

**Add readiness probe to existing deployment:**


**Add liveness probe:**


**Set resources:**


**Create HPA:**


### Verification Checklist

✅ **Health Probes Working:**


✅ **Resources Set:**


✅ **HPA Active:**


✅ **Application Responds:**


---

## Cleanup (1 minute)


---

## Summary (1 minute)

**What We Practiced:**

1. **Readiness Probes** - Remove unhealthy pods from service
2. **Liveness Probes** - Restart unhealthy containers
3. **Resource Management** - Requests and limits
4. **HPA** - Automatic scaling based on CPU
5. **Production Patterns** - Complete setup with all components

**CKAD Skills Reinforced:**
- ✅ Configure all three probe types
- ✅ Set resource requests and limits
- ✅ Create and troubleshoot HPA
- ✅ Understand probe timing parameters
- ✅ Build production-ready deployments

**Real-World Application:**
- Health probes prevent traffic to broken pods
- Resource limits protect cluster stability
- HPA handles variable load automatically
- Security contexts reduce attack surface

**Key Lessons:**
- Readiness ≠ Liveness (different purposes)
- Conservative liveness probes (avoid restart loops)
- Always set resource requests for HPA
- Test failure scenarios (kill pods, overload)
- Multiple replicas for high availability

---

**Total Duration:** 20-25 minutes
**Next:** CKAD exam scenarios with health probes, resources, and HPA
