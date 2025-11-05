# Troubleshooting for CKAD - Exam Preparation

**Duration:** 25-30 minutes
**Format:** Comprehensive CKAD exam preparation with scenarios
**Target:** CKAD certification candidates

---

## Introduction (1 minute)

Welcome to comprehensive CKAD troubleshooting preparation. Troubleshooting is not a separate exam domain—it's a critical skill you'll need across ALL domains.

**CKAD Exam Requirements:**
- Evaluate cluster and node logging
- Understand and debug application deployment issues
- Monitor applications
- Debug services and networking issues
- Troubleshoot pod failures and application issues

**Why This Matters:**
- Wrong answers in other domains often stem from troubleshooting failures
- You must diagnose issues quickly (5-7 minutes max per question)
- No points for partially working solutions
- Troubleshooting is tested in almost every question

**Today's Comprehensive Coverage:**
1. Core troubleshooting commands
2. Common pod failure scenarios
3. Service and networking issues
4. Configuration problems
5. Rapid-fire practice scenarios
6. Time-saving techniques

Let's master CKAD troubleshooting!

---

## Section 1: Core Troubleshooting Commands (4 minutes)

### Essential kubectl Commands (1.5 minutes)

**Level 1: Overview (Start here!)**

**Level 2: Detailed Investigation**

**Level 3: Interactive Debugging**

### Quick Reference Table (1 minute)

| Problem Type | Primary Command | Secondary Command |
|--------------|----------------|-------------------|
| Pod won't start |  |  |
| Pod crashing |  |  |
| Service not routing |  |  |
| Config issues |  |  |
| Resource constraints |  |  |
| Network connectivity |  |  |

### Time-Saving Aliases (1 minute)

**CKAD Tip:** Practice with aliases until they're muscle memory!

---

## Section 2: Common Pod Failure Scenarios (10 minutes)

### Scenario 1: ImagePullBackOff / ErrImagePull (2 minutes)

**Symptoms:**
- Pod status:  or 
- Pod stuck, never reaches Running
- Restart count: 0

**Common Causes:**
1. Incorrect image name or tag
2. Image doesn't exist in registry
3. Private registry authentication failure
4. Network connectivity to registry

**Diagnosis Process:**

**What to look for in events:**

**Common Fixes:**

Add to pod spec:

**CKAD Practice Question:**

"The nginx-web deployment in the default namespace is failing to start. Fix the issue so all pods are running."

**Quick Solution:**

**Time Target:** 2 minutes

---

### Scenario 2: CrashLoopBackOff (2.5 minutes)

**Symptoms:**
- Pod status: 
- Restart count continuously increasing
- Pod alternates between Running and CrashLoopBackOff

**Common Causes:**
1. Application error at startup
2. Missing dependencies (environment variables, external services)
3. Incorrect command or arguments
4. Failed liveness probe (too aggressive)
5. OOMKilled (out of memory)

**Diagnosis Process:**

**What to look for:**

**In describe output:**

**In logs:**

Look for:
- Missing environment variables
- Connection errors to databases/services
- Configuration file errors
- Application exceptions

**Common Fixes:**

Change:

**CKAD Practice Question:**

"The api-server deployment is crash looping. Diagnose and fix the issue."

**Quick Solution:**

**Time Target:** 3 minutes

---

### Scenario 3: Pod Pending (2 minutes)

**Symptoms:**
- Pod status: 
- Pod never gets scheduled to a node
- Remains pending indefinitely

**Common Causes:**
1. Insufficient cluster resources (CPU/memory)
2. Node selector/affinity rules can't be satisfied
3. PersistentVolumeClaim not bound
4. Taints and tolerations mismatch

**Diagnosis Process:**

**What to look for in events:**

**Additional Diagnosis:**

**Common Fixes:**

**CKAD Practice Question:**

"The worker deployment has pods stuck in Pending state. Fix the issue."

**Quick Solution:**

**Time Target:** 2 minutes

---

### Scenario 4: Container Not Ready (1.5 minutes)

**Symptoms:**
- Pod status: 
- READY column shows: 0/1 or 0/2
- Service doesn't route traffic to pod

**Common Causes:**
1. Readiness probe failing
2. Application slow to start
3. Incorrect readiness probe configuration

**Diagnosis:**

**Look for:**

**Common Fixes:**

**Time Target:** 1-2 minutes

---

### Scenario 5: Init Container Issues (1 minute)

**Symptoms:**
- Pod status: , , or 
- Pod stuck in Init phase

**Diagnosis:**

**Common Fixes:**

**Time Target:** 1-2 minutes

---

### Scenario 6: Multi-Container Pod Issues (1 minute)

**Symptoms:**
- Pod shows READY: 1/2 (one container not ready)
- Need to troubleshoot specific container

**Diagnosis:**

**Time Target:** 2 minutes per container

---

## Section 3: Service and Networking Troubleshooting (6 minutes)

### Issue 1: Service Not Routing to Pods (3 minutes)

**The #1 Most Common Kubernetes Problem!**

**Symptoms:**
- Can't access application through service
-  times out or connection refused
- Application works with pod IP but not service

**Root Cause #1: Selector Mismatch**

**Diagnosis:**

**Example Problem:**

**Fixes:**

**Root Cause #2: Port Mismatch**

**Diagnosis:**

**Example Problem:**

**Fixes:**

**Root Cause #3: Named Port Mismatch**

**Fix:** Ensure port names match exactly.

**CKAD Practice Question:**

"Users cannot access the frontend service at http://frontend. Fix the issue."

**Quick Solution:**

**Time Target:** 3 minutes

---

### Issue 2: Service Type Issues (1 minute)

**Problem:** Service is ClusterIP but you need NodePort or LoadBalancer.

**Diagnosis:**

**Fix:**

---

### Issue 3: DNS Resolution Issues (1 minute)

**Problem:** Can't resolve service names.

**Diagnosis:**

**Common Issues:**
- CoreDNS pods not running
- Network policy blocking DNS
- Wrong service name/namespace

**Check CoreDNS:**

---

### Issue 4: Network Policy Blocking Traffic (1 minute)

**Problem:** Network policies prevent pod communication.

**Diagnosis:**

**Fix:** Adjust network policy to allow required traffic.

---

## Section 4: Configuration Issues (3 minutes)

### ConfigMap and Secret Problems (2 minutes)

**Common Issues:**

**Issue 1: ConfigMap/Secret doesn't exist**

**Fix:**

**Issue 2: Incorrect key reference**

**Diagnosis:**

**Issue 3: Volume mount conflicts**

**CKAD Practice Question:**

"The worker pod is failing with CreateContainerConfigError. Fix the issue."

**Quick Solution:**

**Time Target:** 2 minutes

---

## Section 5: Rapid-Fire CKAD Scenarios (4 minutes)

### Quick Drill 1 (1 minute)

**Scenario:** "Pod is in ImagePullBackOff. Fix it in under 1 minute."

---

### Quick Drill 2 (1 minute)

**Scenario:** "Service has no endpoints. Fix it in under 1 minute."

---

### Quick Drill 3 (1 minute)

**Scenario:** "Pod is CrashLoopBackOff. Diagnose in under 1 minute."

---

### Quick Drill 4 (1 minute)

**Scenario:** "Pod is Pending. Fix resource constraints."

---

## Section 6: Advanced Troubleshooting Techniques (2 minutes)

### Using Ephemeral Debug Containers (1 minute)

**Kubernetes 1.23+:**

### Checking Resource Usage (1 minute)

---

## Section 7: CKAD Troubleshooting Workflow (2 minutes)

### Standard Workflow (1 minute)

**Phase 1: Quick Assessment (30 seconds)**

**Phase 2: Detailed Diagnosis (1-2 minutes)**

**Phase 3: Verify Configuration (1 minute)**

**Phase 4: Fix and Verify (1-2 minutes)**

### Pod Status Quick Reference (1 minute)

| Status | Meaning | Command to Diagnose |
|--------|---------|---------------------|
|  | Not scheduled |  |
|  | Creating container |  |
|  | Pod running | Check READY column |
|  | Repeatedly crashing |  |
|  | Can't pull image |  |
|  | Terminated with error |  |
|  | Ran to completion | Normal for Jobs |
|  | Being deleted | Wait or check for finalizers |
|  | Config issue |  |
|  | Init container |  |

---

## Final CKAD Exam Checklist (1 minute)

**Before leaving a troubleshooting question:**

✅ **Pod is Running and Ready**

✅ **No restarts or crashes**

✅ **Service has endpoints (if applicable)**

✅ **Application responds**

✅ **No errors in events**

---

## Summary: CKAD Troubleshooting Mastery (1 minute)

**Must-Know Commands:**

**Common Patterns:**
- ImagePullBackOff → Wrong image name
- CrashLoopBackOff → Check logs --previous
- Pending → Resource constraints
- Running but not Ready → Readiness probe
- Service not routing → Check endpoints

**Time Management:**
- Quick issues: 2-3 minutes
- Complex issues: 5-7 minutes
- Always verify fixes work!

**Final Tips:**
1. Follow systematic approach
2. Don't skip verification
3. Use aliases for speed
4. Practice until it's muscle memory
5. Stay calm under pressure

**Remember:** Troubleshooting is tested in EVERY domain. Master it and you'll pass CKAD!

---

**Total Duration:** 25-30 minutes
**Next Steps:** Practice these scenarios in timed conditions until you can diagnose any issue in under 3 minutes!

Good luck on your CKAD exam!
