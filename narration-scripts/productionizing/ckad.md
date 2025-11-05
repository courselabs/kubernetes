# Productionizing - CKAD Exam Preparation

**Duration:** 25-30 minutes
**Format:** Comprehensive CKAD exam preparation
**Focus:** Health probes, resources, HPA, security contexts

---

## Introduction (1 minute)

Welcome to CKAD preparation for production-ready applications. This topic spans multiple exam domains and is absolutely critical for passing.

**CKAD Coverage:**
- **Application Design & Build** (20%) - Multi-container probes
- **Application Deployment** (20%) - Resource management
- **Application Observability & Maintenance** (15%) - Health probes
- **Services & Networking** (20%) - Readiness probes
- **Application Environment** (25%) - Security contexts

**Why Critical:**
- Appears in almost every deployment question
- Foundational for troubleshooting scenarios
- Required for real-world applications
- Easy points if you know the patterns

**Today's Comprehensive Coverage:**
1. All three probe types with examples
2. Resource requests, limits, and QoS
3. HPA creation and troubleshooting
4. Security contexts and best practices
5. Rapid-fire practice scenarios

Let's master production readiness!

---

## Section 1: Health Probes Deep Dive (8 minutes)

### Readiness Probe (2.5 minutes)

**Purpose:** Determine if Pod should receive traffic from Service.

**Behavior:**
- Probe fails → Pod removed from Service endpoints
- Probe succeeds → Pod added back to Service endpoints
- Container continues running

**HTTP Probe Example:**

**TCP Probe Example:**

**Exec Probe Example:**

**CKAD Scenario 1:** "Add a readiness probe to the nginx deployment that checks HTTP GET on port 80, path /ready, every 10 seconds."

**Solution:**

Add:

**Time Target:** 1-2 minutes

### Liveness Probe (2.5 minutes)

**Purpose:** Determine if container should be restarted.

**Behavior:**
- Probe fails → Container killed and restarted
- Restart count increments
- Subject to backoff delay

**Warning:** Be conservative! Aggressive liveness probes cause restart loops.

**Configuration Pattern:**

**CKAD Scenario 2:** "The api deployment keeps restarting. The liveness probe is too aggressive. Fix it by increasing initialDelaySeconds to 30 and failureThreshold to 5."

**Solution:**

Change:

**Time Target:** 2 minutes

### Startup Probe (1.5 minutes)

**Purpose:** Allow slow-starting containers extra time before liveness checks begin.

**Behavior:**
- Startup probe runs first
- Liveness and readiness disabled until startup succeeds
- If startup fails within window → container restarted

**Use Case:** Legacy apps with long initialization (30+ seconds).

**Example:**

**CKAD Scenario 3:** "The legacy-app takes 2 minutes to start but keeps getting killed by liveness probe. Add a startup probe allowing up to 3 minutes."

**Solution:**

**Time Target:** 1-2 minutes

### Combined Probe Strategy (1.5 minutes)

**Production Best Practice:**

**Decision Matrix:**

| Probe Type | Path | Period | Failure Threshold |
|------------|------|--------|-------------------|
| Startup | /startup or /health | 10s | Based on startup time |
| Readiness | /ready | 5s | 2-3 (quick removal) |
| Liveness | /healthz or /health | 10s | 3-5 (avoid false positives) |

---

## Section 2: Resource Requests and Limits (6 minutes)

### Understanding Requests vs. Limits (2 minutes)

**Requests:** Guaranteed minimum resources.
- Used by scheduler to place pods
- Pod won't start if cluster can't satisfy
- Can use more if available

**Limits:** Maximum resources allowed.
- CPU: Throttled if exceeded
- Memory: OOMKilled if exceeded
- Enforced by kubelet

**Configuration:**

**Units:**
- CPU:  = 1 core,  = 0.25 cores
- Memory:  (mebibytes),  (gibibytes)

**CKAD Scenario 4:** "Set resource requests to 250m CPU and 256Mi memory, and limits to 500m CPU and 512Mi memory for the webapp deployment."

**Solution:**

**Time Target:** 1-2 minutes

### Quality of Service (QoS) Classes (2 minutes)

**Guaranteed** (requests = limits for all containers):

- Highest priority
- Last to be evicted
- Use for: Critical workloads

**Burstable** (requests < limits):

- Medium priority
- Can burst when available
- Use for: Most applications

**BestEffort** (no requests or limits):

- Lowest priority
- First to be evicted
- Use for: Non-critical jobs

**Check QoS Class:**

**CKAD Scenario 5:** "Create a Guaranteed QoS pod with 1 CPU and 1Gi memory."

**Solution:**

**Time Target:** 2 minutes

### Troubleshooting Resource Issues (2 minutes)

**OOMKilled (Out of Memory):**

**CPU Throttling:**

**Pod Pending (Insufficient Resources):**

---

## Section 3: Horizontal Pod Autoscaling (5 minutes)

### Creating HPA (2 minutes)

**v1 API (Simple CPU-based):**

**v2 API (Multiple metrics):**

**CKAD Scenario 6:** "Create HPA for deployment  that scales between 3 and 12 pods at 60% CPU."

**Solution:**

**Time Target:** 1-2 minutes

### HPA Troubleshooting (2 minutes)

**Issue: HPA shows **

**Issue: HPA not scaling**

**Issue: HPA scales down too quickly**

**Time Target:** 2-3 minutes

### HPA Prerequisites (1 minute)

**Required:**
1. ✅ Metrics Server installed
2. ✅ Pods have 
3. ✅ Target is scalable (Deployment, ReplicaSet, StatefulSet)

**Check prerequisites:**

---

## Section 4: Security Contexts (4 minutes)

### Pod-Level Security Context (1.5 minutes)

**CKAD Scenario 7:** "Configure the webapp deployment to run as user 1000, group 1000."

**Solution:**

**Time Target:** 1-2 minutes

### Container-Level Security Context (1.5 minutes)

**Key Security Settings:**
-  - Fail if image runs as root
-  - Prevent privilege gain
-  - Immutable filesystem
-  - Drop all Linux capabilities

**CKAD Scenario 8:** "Secure the api deployment: run as non-root, read-only filesystem, drop all capabilities."

**Solution:**

Add:

**Time Target:** 2 minutes

### Security Best Practices Summary (1 minute)

**Checklist:**
- ✅ Run as non-root user ()
- ✅ Drop all capabilities ()
- ✅ Read-only root filesystem (+ emptyDir for writable paths)
- ✅ Disable privilege escalation
- ✅ Disable SA token auto-mount (if not needed)

---

## Section 5: Rapid-Fire Practice (4 minutes)

### Quick Drill 1 (45 seconds)

**Task:** "Add readiness probe checking HTTP /health on port 8080 to deployment webapp."

### Quick Drill 2 (45 seconds)

**Task:** "Set resource requests: 100m CPU, 128Mi memory for deployment api."

### Quick Drill 3 (45 seconds)

**Task:** "Create HPA for deployment frontend: 2-8 pods, 75% CPU."

### Quick Drill 4 (45 seconds)

**Task:** "Make deployment secure-app run as user 1000."

### Quick Drill 5 (45 seconds)

**Task:** "Check QoS class of pod mypod."

---

## Section 6: Complete Production Deployment (2 minutes)

**CKAD Scenario:** "Create a production-ready deployment with all best practices."

---

## Final CKAD Checklist (1 minute)

**Before leaving a question:**

✅ **Probes Configured:**

✅ **Resources Set:**

✅ **HPA Created (if required):**

✅ **Security Context (if required):**

✅ **Application Responds:**

✅ **No CrashLoopBackOff:**

---

## Summary: CKAD Mastery (1 minute)

**Must-Know Commands:**

**Common Patterns:**
- Readiness removes from Service (temporary)
- Liveness restarts container (permanent fix)
- Startup allows slow initialization
- Always set resource requests for HPA
- QoS = Guaranteed (requests=limits), Burstable (requests<limits), BestEffort (none)

**Time Management:**
- Simple probe: 1-2 minutes
- Resources + HPA: 2-3 minutes
- Full production setup: 5-7 minutes
- Always verify before moving on!

**Remember:** Production readiness is tested across ALL CKAD domains. Master these patterns and you'll excel!

---

**Total Duration:** 25-30 minutes
**Practice Goal:** Configure production-ready deployment in under 5 minutes!

Good luck on your CKAD exam!
