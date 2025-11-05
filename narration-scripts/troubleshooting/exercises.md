# Troubleshooting Apps in Kubernetes - Practical Exercises

**Duration:** 20-25 minutes
**Format:** Live demonstration and guided troubleshooting
**Prerequisites:** Kubernetes cluster running, kubectl configured

---

## Introduction (1 minute)

Welcome to hands-on Kubernetes troubleshooting. Today, you'll diagnose and fix real broken applications—exactly what you'll face in the CKAD exam.

**The Challenge:** We'll deploy deliberately broken configurations and work through systematic diagnosis and fixes. No solutions until you've tried!

**What You'll Learn:**
1. Systematic troubleshooting methodology
2. Using kubectl describe and logs effectively
3. Identifying common misconfigurations
4. Fixing issues under time pressure
5. Verifying your fixes work

**CKAD Mindset:** These are realistic exam scenarios. Practice your diagnosis speed!

Let's dive in!

---

## Exercise 1: The Broken Pi Application (18-20 minutes)

### Scenario Introduction (1 minute)

**Your Task:** A colleague deployed the Pi calculation application but it's not working. Users should be able to access it at http://localhost:8020 or http://localhost:30020, but they can't reach it.

**Success Criteria:**
- Access the Pi app via browser or curl
- Pod is healthy with no restarts
- Application responds successfully

**Deploy the broken app:**


**Initial Check:**


**The Problem:** Something is wrong! Let's troubleshoot systematically.

---

### Step 1: High-Level Assessment (2 minutes)

**Narration:** Always start with a broad view before diving deep.


**What to look for:**
- **Deployments:** Are they showing READY replicas?
- **Pods:** What's their STATUS? Any restarts?
- **Services:** Do they exist? What type?
- **ReplicaSets:** Are they creating pods?

**Observe:**


**Expected Findings:**
- You should see a deployment, pods, and services
- Note any pods that aren't READY or have errors
- Note any deployments that don't have desired replicas

**Narration Point:** "What's the pod status? Is it Running? Is it Ready? These are our first clues."

---

### Step 2: Pod-Level Diagnosis (3 minutes)

**Narration:** Let's examine the pods in detail.


**Check for common issues:**
- STATUS: ImagePullBackOff, CrashLoopBackOff, Pending, Error?
- READY: Is it 0/1 or 1/1?
- RESTARTS: High restart count?

**Describe the pod:**


**What to examine in describe output:**

1. **Pod Status and Conditions:**
   - Is PodScheduled?
   - Is Initialized?
   - Is Ready?
   - Are Containers Ready?

2. **Events Section (critical!):**
   - Look for errors in chronological order
   - Common patterns:
     - "Failed to pull image"
     - "Back-off restarting failed container"
     - "Readiness probe failed"
     - "Liveness probe failed"

3. **Container Status:**
   - Current State: Running, Waiting, Terminated?
   - Last State: Was it terminated? Exit code?
   - Ready: true or false?

**Pause for discovery:** "What do the events tell us? Take 30 seconds to read them carefully."

**Potential Issue #1: Image Problem**

If you see image pull errors:


**Potential Issue #2: Container Crash**

If pods are crashing:


**Potential Issue #3: Readiness/Liveness Probe Failures**

If probe failures:


**Guided Discovery (2 minutes):**

**Narration:** "Let's identify what's wrong with this pod. I'll give you 2 minutes to investigate using describe and logs."

**Common findings in this lab:**
1. Check if the image name is correct
2. Check if there are any port mismatches
3. Look at environment variables
4. Check resource requests/limits

---

### Step 3: Service-Level Diagnosis (3 minutes)

**Narration:** Even if pods are running, service configuration can prevent access.


**Check these critical aspects:**

1. **Service Type:**
   - Is it NodePort (for localhost:30020)?
   - Is it LoadBalancer or ClusterIP?

2. **Port Configuration:**

   - **port:** External port (e.g., 8020)
   - **targetPort:** Container port it forwards to
   - **nodePort:** Port on node (e.g., 30020)

3. **Selector:**

   - Do these labels exist on pods?

4. **Endpoints:**

   - If ENDPOINTS is `<none>`, service can't find pods!
   - This usually means selector mismatch

**Diagnosis Process:**


**Common Issues:**

**Issue A: Selector Mismatch**


**Issue B: TargetPort Mismatch**


**Issue C: Named Port Mismatch**


**Guided Discovery:**

"Check the service endpoints. Are there any? If not, what could cause that?"

---

### Step 4: Fix the Issues (5 minutes)

**Narration:** "Now that we've identified the problems, let's fix them one by one."

**Common fixes you might need:**

**Fix 1: Correct Image Name**

If image is wrong:


**Fix 2: Fix Service Selector**

If selector doesn't match:


**Fix 3: Fix Port Configuration**

If ports don't match:


**Fix 4: Fix Environment Variables**

If app needs env vars:


**Fix 5: Fix Resource Limits**

If OOMKilled or resource issues:


**Applying Fixes:**

**Narration:** "After each fix, give Kubernetes time to reconcile and watch for changes."


---

### Step 5: Verification (3 minutes)

**Narration:** "Always verify your fixes worked. Don't assume!"

**Verification Checklist:**

1. **Pods are healthy:**


2. **Deployment is healthy:**


3. **Service has endpoints:**


4. **Application responds:**


5. **Access via browser:**


6. **No restarts:**


**Success Criteria Met?**

✅ Pod is Running and Ready (1/1)
✅ No pod restarts
✅ Service has endpoints
✅ Application responds to curl/browser
✅ Can calculate Pi values

**Narration:** "If all checks pass, congratulations! You've successfully diagnosed and fixed the application!"

---

### Step 6: Common Solutions Revealed (2 minutes)

**Narration:** "Let's review the typical issues in this lab and their solutions."

**Typical Issue #1: Service Selector Mismatch**


**Typical Issue #2: Wrong Port Numbers**


**Typical Issue #3: Wrong Service Type**


**Typical Issue #4: Image Name Error**


**Review Your Approach:**

"How did you diagnose the issue? Did you follow the systematic approach?"

1. ✅ Started with high-level view (get all)
2. ✅ Checked pod status
3. ✅ Used describe for events
4. ✅ Checked logs (if crashing)
5. ✅ Verified service configuration
6. ✅ Checked endpoints
7. ✅ Fixed issues systematically
8. ✅ Verified fixes worked

---

## Exercise 2: Quick Diagnosis Drills (3 minutes)

**Narration:** "Let's practice rapid diagnosis with theoretical scenarios."

### Drill 1: Quick Assessment (30 seconds each)

**Scenario A:**


**Question:** What's wrong and how do you diagnose?

**Answer:**


---

**Scenario B:**


**Question:** Why can't users access the API?

**Answer:**


---

**Scenario C:**


**Question:** How do you find out why it's crashing?

**Answer:**


---

## CKAD Exam Tips (2 minutes)

### Time Management

**For troubleshooting questions:**
- Budget 5-7 minutes total
- 2 minutes diagnosis
- 2 minutes fixing
- 1 minute verification

### Common CKAD Troubleshooting Patterns

**Pattern 1: "Fix the broken deployment"**
- Always check: labels, selectors, ports, image
- Use describe and logs
- Verify endpoints

**Pattern 2: "Why can't I access the service?"**
- Check service has endpoints
- Check service type (NodePort vs ClusterIP)
- Check port numbers match
- Test with port-forward

**Pattern 3: "Pod won't start"**
- ImagePullBackOff → Check image name
- CrashLoopBackOff → Check logs --previous
- Pending → Check resources and scheduling
- CreateContainerConfigError → Check ConfigMap/Secret

### Essential Commands to Memorize


### Verification Checklist

Before moving to next question:
1. ✅ Pod shows READY 1/1
2. ✅ Pod status is Running
3. ✅ RESTARTS is 0 (or hasn't increased)
4. ✅ Service has endpoints
5. ✅ Application actually responds (test it!)

---

## Cleanup (1 minute)


---

## Summary and Key Takeaways (1 minute)

**What We Practiced:**

1. **Systematic diagnosis** - Not guessing, but following a process
2. **Using describe effectively** - Events section is gold
3. **Checking endpoints** - First thing for service issues
4. **Using logs correctly** - Including --previous flag
5. **Verifying fixes** - Never assume, always test

**CKAD Skills Reinforced:**
- ✅ Rapid problem identification
- ✅ Using kubectl describe and logs
- ✅ Understanding pod lifecycle
- ✅ Debugging service connectivity
- ✅ Fixing common misconfigurations

**Real-World Application:**
- This is your daily reality with Kubernetes
- Speed comes from practice and pattern recognition
- Always follow a systematic approach
- Document your troubleshooting steps

**Practice Makes Perfect:**
- Run through this lab multiple times
- Try to reduce your diagnosis time each iteration
- Create your own broken configs to practice
- Time yourself against CKAD exam pace

---

**Total Duration:** 20-25 minutes
**Next Session:** Advanced troubleshooting scenarios and CKAD exam preparation

**Remember:** In the exam, troubleshooting is not a separate domain—it's a skill you'll use in EVERY domain. Master it!
