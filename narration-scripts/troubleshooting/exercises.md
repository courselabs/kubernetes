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

```bash
kubectl apply -f labs/troubleshooting/specs/pi-failing
```

**Initial Check:**

```bash
# See what was created
kubectl get all -l kubernetes.courselabs.co=troubleshooting

# Try to access the app
curl localhost:8020
# Connection refused or timeout

curl localhost:30020
# Connection refused or timeout
```

**The Problem:** Something is wrong! Let's troubleshoot systematically.

---

### Step 1: High-Level Assessment (2 minutes)

**Narration:** Always start with a broad view before diving deep.

```bash
# Check all resources
kubectl get all -l kubernetes.courselabs.co=troubleshooting
```

**What to look for:**
- **Deployments:** Are they showing READY replicas?
- **Pods:** What's their STATUS? Any restarts?
- **Services:** Do they exist? What type?
- **ReplicaSets:** Are they creating pods?

**Observe:**

```bash
# Check deployment status
kubectl get deployment -l kubernetes.courselabs.co=troubleshooting

# Check pod status specifically
kubectl get pods -l kubernetes.courselabs.co=troubleshooting

# Check services
kubectl get svc -l kubernetes.courselabs.co=troubleshooting
```

**Expected Findings:**
- You should see a deployment, pods, and services
- Note any pods that aren't READY or have errors
- Note any deployments that don't have desired replicas

**Narration Point:** "What's the pod status? Is it Running? Is it Ready? These are our first clues."

---

### Step 2: Pod-Level Diagnosis (3 minutes)

**Narration:** Let's examine the pods in detail.

```bash
# Get detailed pod information
kubectl get pods -l kubernetes.courselabs.co=troubleshooting -o wide
```

**Check for common issues:**
- STATUS: ImagePullBackOff, CrashLoopBackOff, Pending, Error?
- READY: Is it 0/1 or 1/1?
- RESTARTS: High restart count?

**Describe the pod:**

```bash
# Get the pod name
POD_NAME=$(kubectl get pod -l kubernetes.courselabs.co=troubleshooting -o jsonpath='{.items[0].metadata.name}')

# Describe it
kubectl describe pod $POD_NAME
```

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

```bash
# Check the image name in the deployment
kubectl get deployment -l kubernetes.courselabs.co=troubleshooting -o yaml | grep image:

# Common fixes:
# - Wrong image name or tag
# - Typo in image name
# - Missing image pull secret
```

**Potential Issue #2: Container Crash**

If pods are crashing:

```bash
# Check current logs
kubectl logs $POD_NAME

# IMPORTANT: Check previous logs if crashing
kubectl logs $POD_NAME --previous

# Look for:
# - Startup errors
# - Missing environment variables
# - Configuration errors
# - Application exceptions
```

**Potential Issue #3: Readiness/Liveness Probe Failures**

If probe failures:

```bash
# Check probe configuration in describe
kubectl describe pod $POD_NAME | grep -A 10 "Liveness\|Readiness"

# Common issues:
# - Wrong port
# - Wrong path
# - Too aggressive timing
```

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

```bash
# Describe the service
kubectl get svc -l kubernetes.courselabs.co=troubleshooting
kubectl describe svc -l kubernetes.courselabs.co=troubleshooting
```

**Check these critical aspects:**

1. **Service Type:**
   - Is it NodePort (for localhost:30020)?
   - Is it LoadBalancer or ClusterIP?

2. **Port Configuration:**
   ```bash
   # Check service ports
   kubectl get svc <service-name> -o yaml | grep -A 5 ports:
   ```
   - **port:** External port (e.g., 8020)
   - **targetPort:** Container port it forwards to
   - **nodePort:** Port on node (e.g., 30020)

3. **Selector:**
   ```bash
   # Check service selector
   kubectl get svc <service-name> -o jsonpath='{.spec.selector}'
   ```
   - Do these labels exist on pods?

4. **Endpoints:**
   ```bash
   # CRITICAL CHECK: Does service have endpoints?
   kubectl get endpoints -l kubernetes.courselabs.co=troubleshooting
   ```
   - If ENDPOINTS is `<none>`, service can't find pods!
   - This usually means selector mismatch

**Diagnosis Process:**

```bash
# Step 1: Get service selector
SVC_NAME=$(kubectl get svc -l kubernetes.courselabs.co=troubleshooting -o jsonpath='{.items[0].metadata.name}')
kubectl get svc $SVC_NAME -o jsonpath='{.spec.selector}'
echo

# Step 2: Check if pods have matching labels
kubectl get pods --show-labels -l kubernetes.courselabs.co=troubleshooting

# Step 3: Check endpoints
kubectl get endpoints $SVC_NAME

# Step 4: Verify port mapping
kubectl describe svc $SVC_NAME | grep -E "Port:|TargetPort:|NodePort:"
kubectl describe pod $POD_NAME | grep "Port:"
```

**Common Issues:**

**Issue A: Selector Mismatch**
```yaml
# Service expects:
selector:
  app: pi-web

# But pod has:
labels:
  app: pi-webapp  # Typo!
```

**Issue B: TargetPort Mismatch**
```yaml
# Service forwards to:
targetPort: 8080

# But container listens on:
containerPort: 80  # Wrong!
```

**Issue C: Named Port Mismatch**
```yaml
# Service uses named port:
targetPort: web-port

# But container doesn't define that name
```

**Guided Discovery:**

"Check the service endpoints. Are there any? If not, what could cause that?"

---

### Step 4: Fix the Issues (5 minutes)

**Narration:** "Now that we've identified the problems, let's fix them one by one."

**Common fixes you might need:**

**Fix 1: Correct Image Name**

If image is wrong:

```bash
# Check current image
kubectl get deployment <name> -o jsonpath='{.spec.template.spec.containers[0].image}'

# Fix via set image
kubectl set image deployment/<name> <container>=<correct-image>

# OR edit deployment
kubectl edit deployment <name>
# Fix image field
```

**Fix 2: Fix Service Selector**

If selector doesn't match:

```bash
# Option 1: Fix service selector
kubectl edit service <name>
# Change selector to match pod labels

# Option 2: Fix pod labels
kubectl edit deployment <name>
# Change pod template labels to match service
```

**Fix 3: Fix Port Configuration**

If ports don't match:

```bash
# Fix service targetPort
kubectl edit service <name>
# Change targetPort to match container port

# OR fix container port
kubectl edit deployment <name>
# Change containerPort to match service targetPort
```

**Fix 4: Fix Environment Variables**

If app needs env vars:

```bash
kubectl set env deployment/<name> KEY=value

# OR edit deployment
kubectl edit deployment <name>
# Add env section
```

**Fix 5: Fix Resource Limits**

If OOMKilled or resource issues:

```bash
kubectl edit deployment <name>
# Adjust resources:
#   requests/limits for cpu and memory
```

**Applying Fixes:**

**Narration:** "After each fix, give Kubernetes time to reconcile and watch for changes."

```bash
# Watch pods for changes
kubectl get pods -l kubernetes.courselabs.co=troubleshooting --watch

# In another terminal, apply fixes
kubectl edit ...

# Wait for:
# - Old pods to terminate
# - New pods to be created
# - New pods to become READY
```

---

### Step 5: Verification (3 minutes)

**Narration:** "Always verify your fixes worked. Don't assume!"

**Verification Checklist:**

1. **Pods are healthy:**
   ```bash
   kubectl get pods -l kubernetes.courselabs.co=troubleshooting
   # Should show: READY 1/1, STATUS Running, RESTARTS 0
   ```

2. **Deployment is healthy:**
   ```bash
   kubectl get deployment -l kubernetes.courselabs.co=troubleshooting
   # Should show: READY matches DESIRED (e.g., 1/1)
   ```

3. **Service has endpoints:**
   ```bash
   kubectl get endpoints -l kubernetes.courselabs.co=troubleshooting
   # Should show pod IP addresses
   ```

4. **Application responds:**
   ```bash
   # Test via service port-forward
   kubectl port-forward svc/$SVC_NAME 8080:80
   # In another terminal:
   curl localhost:8080

   # OR test via NodePort directly
   curl localhost:30020

   # Expected: Response from Pi application
   # Should see HTML or JSON response
   ```

5. **Access via browser:**
   ```bash
   # If you have a browser:
   # Navigate to: http://localhost:8020 or http://localhost:30020
   # Should see the Pi web interface
   ```

6. **No restarts:**
   ```bash
   # Wait 30 seconds, then check
   kubectl get pods -l kubernetes.courselabs.co=troubleshooting
   # RESTARTS should still be 0
   ```

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

```yaml
# Problem: Service selector doesn't match pod labels

# Service had:
selector:
  app: pi-web

# Pods had:
labels:
  app: pi-webapp  # or different label

# Solution: Make them match!
```

**Typical Issue #2: Wrong Port Numbers**

```yaml
# Problem: Port mismatch

# Service targetPort:
targetPort: 8080

# Container port:
containerPort: 80  # Different!

# Solution: Align the ports
```

**Typical Issue #3: Wrong Service Type**

```yaml
# Problem: Service is ClusterIP but question wants NodePort

# Solution:
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30020
```

**Typical Issue #4: Image Name Error**

```yaml
# Problem: Typo in image name

image: kiamol/ch05-pi  # Wrong
image: kiamol/ch03-pi  # Correct

# Solution: Fix the image reference
```

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
```
kubectl get pods
NAME                    READY   STATUS             RESTARTS
webapp-7d4f8-abc123     0/1     ImagePullBackOff   0
```

**Question:** What's wrong and how do you diagnose?

**Answer:**
```bash
kubectl describe pod webapp-7d4f8-abc123
# Look for image name in events
# Likely: Wrong image name/tag or auth issue
```

---

**Scenario B:**
```
kubectl get pods
NAME                    READY   STATUS    RESTARTS
api-7d4f8-abc123        0/1     Running   0

kubectl get svc
NAME   TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)
api    ClusterIP   10.96.45.123   <none>        80/TCP

kubectl get endpoints api
NAME   ENDPOINTS
api    <none>
```

**Question:** Why can't users access the API?

**Answer:**
```bash
# Service has no endpoints - selector mismatch!
kubectl get svc api -o jsonpath='{.spec.selector}'
kubectl get pod api-7d4f8-abc123 --show-labels
# Labels don't match selector
```

---

**Scenario C:**
```
kubectl get pods
NAME                    READY   STATUS             RESTARTS
worker-7d4f8-abc123     0/1     CrashLoopBackOff   7
```

**Question:** How do you find out why it's crashing?

**Answer:**
```bash
# Check previous logs!
kubectl logs worker-7d4f8-abc123 --previous
kubectl describe pod worker-7d4f8-abc123
# Look for exit code and termination reason
```

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

```bash
# Your toolbox:
kubectl get pods -o wide
kubectl describe pod <name>
kubectl logs <name>
kubectl logs <name> --previous
kubectl get endpoints <svc-name>
kubectl port-forward pod/<name> 8080:80
kubectl get svc <name> -o jsonpath='{.spec.selector}'
kubectl get pod <name> --show-labels
```

### Verification Checklist

Before moving to next question:
1. ✅ Pod shows READY 1/1
2. ✅ Pod status is Running
3. ✅ RESTARTS is 0 (or hasn't increased)
4. ✅ Service has endpoints
5. ✅ Application actually responds (test it!)

---

## Cleanup (1 minute)

```bash
# Remove lab resources
kubectl delete all -l kubernetes.courselabs.co=troubleshooting

# Verify cleanup
kubectl get all -l kubernetes.courselabs.co=troubleshooting
# Should return: No resources found
```

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
