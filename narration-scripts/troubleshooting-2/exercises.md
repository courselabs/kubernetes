# Troubleshooting Application Modeling - Practical Exercises

**Duration:** 20-25 minutes
**Format:** Live demonstration and guided troubleshooting
**Prerequisites:** Kubernetes cluster running, kubectl configured

---

## Introduction (1 minute)

Welcome to hands-on application modeling troubleshooting. Today we'll work with a broken web application that uses multiple Kubernetes resources working together.

**The Scenario:** A web application that requires:
- Configuration from a ConfigMap
- Database credentials from a Secret
- Persistent storage via PersistentVolume
- Deployment to a custom namespace

**Your Mission:**
- Fix all configuration issues
- Get the pod healthy with no restarts
- Access the application at http://localhost:8040 or http://localhost:30040
- See the web app displaying its configuration correctly

**CKAD Reality:** This mirrors real exam scenarios where multiple resources must work together. You'll need systematic diagnosis!

Let's get started!

---

## Exercise: The Broken Multi-Resource Application (18-20 minutes)

### Step 1: Deploy the Broken Application (1 minute)

**Deploy all resources:**


**Initial Testing:**


**Narration:** "The application isn't accessible. Let's start our systematic troubleshooting process."

**What was created?**


**Observation Questions:**
- What namespaces are involved?
- Are there any pods? What's their status?
- Do ConfigMaps and Secrets exist?
- Are there any PVCs? What's their status?

**Pause for 1 minute:** "Take a moment to review what resources exist and their current state."

---

### Step 2: High-Level Resource Assessment (2 minutes)

**Check the namespace:**


**Narration:** "We should see a deployment, service, ConfigMap, Secret, and PVC. Let's check each component."

**Check deployments:**


**Check pods:**


**Check services:**


**Expected Findings:**
- Deployment may show 0/1 READY
- Pod may be in error state (Pending, CrashLoopBackOff, CreateContainerConfigError, etc.)
- Service exists but has no endpoints

**Narration:** "Based on the pod status, we can start narrowing down the issue. Let's examine the pod in detail."

---

### Step 3: Pod-Level Diagnosis (3 minutes)

**Get pod details:**


**What to look for in describe output:**

**1. Pod Status Section:**


**2. Container Status:**


**3. Events Section (CRITICAL!):**

Look for errors like:
- `configmap "xyz" not found`
- `secret "xyz" not found`
- `persistentvolumeclaim "xyz" not found`
- `key "xyz" not found in ConfigMap`
- `error mounting volume`

**Guided Investigation (2 minutes):**

**Narration:** "Read through the events carefully. They usually tell you exactly what's wrong. Look for:"
1. Missing ConfigMaps or Secrets
2. Wrong key names
3. PVC issues
4. Mount path problems

**Common Finding #1: ConfigMap Issues**

If you see `configmap "X" not found`:


**Common Finding #2: Secret Issues**

If you see `secret "X" not found`:


**Common Finding #3: PVC Issues**

If you see PVC-related errors:


**Common Finding #4: Key Name Mismatches**

If pod starts but describes show key errors:


---

### Step 4: ConfigMap and Secret Investigation (3 minutes)

**Check ConfigMap configuration:**


**Typical ConfigMap Issues:**

**Issue A: ConfigMap in Wrong Namespace**


**Issue B: Wrong Key Names**


**Example fix:**


**Check Secret configuration:**


**Typical Secret Issues:**

Similar to ConfigMap:
- Wrong namespace
- Wrong key names
- Pod can't access Secret

**Narration:** "ConfigMap and Secret issues are the most common application modeling problems. Let's fix any we've found."

---

### Step 5: PersistentVolume Investigation (2 minutes)

**Check PVC status:**


**Typical PVC Issues:**

**Issue A: No Matching PV**


**Issue B: PV/PVC Mismatch**


**Solution:** Create compatible PV or adjust PVC.

**Issue C: PVC Bound but Pod Can't Mount**


---

### Step 6: Service and Endpoint Verification (2 minutes)

**Once pod is healthy, check service routing:**


**Verify service configuration:**


**Check ports:**


---

### Step 7: Fix the Issues (4 minutes)

**Narration:** "Now let's fix the issues we've identified. Work through them systematically."

**Common Fix 1: Move ConfigMap to Correct Namespace**


**Common Fix 2: Create Missing Secret**


**Common Fix 3: Fix Key Names**


Or fix the ConfigMap:


**Common Fix 4: Create Missing PV**


**Common Fix 5: Fix Service Selector**


**Common Fix 6: Restart Pods After Config Changes**


**Narration:** "After each fix, check if the pod status improves. You might need to fix multiple issues."

---

### Step 8: Verification (3 minutes)

**Comprehensive verification checklist:**

**1. All Resources Exist in Correct Namespace:**


**2. Pod is Healthy:**


**3. PVC is Bound:**


**4. Service Has Endpoints:**


**5. Application Responds:**


**6. Configuration is Loaded:**


**7. Persistent Storage Works:**


**Success Criteria:**

✅ Pod is Running and Ready (1/1)
✅ No pod restarts
✅ PVC is Bound
✅ Service has endpoints
✅ Application responds at http://localhost:8040 or http://localhost:30040
✅ Web app displays configuration correctly
✅ No errors in pod logs

**Narration:** "If all checks pass, you've successfully diagnosed and fixed all the application modeling issues!"

---

## Common Issues and Solutions (2 minutes)

**Let's review the typical issues found in this lab:**

### Issue 1: Resources in Wrong Namespace

**Problem:** ConfigMap or Secret created in `default` namespace, but deployment is in `troubleshooting-2`.

**Solution:**


### Issue 2: ConfigMap Key Mismatch

**Problem:** ConfigMap has `database-url` but pod looks for `database_url`.

**Solution:**


### Issue 3: PVC Not Bound

**Problem:** No PV available matching PVC requirements.

**Solution:**


### Issue 4: Service Can't Find Pods

**Problem:** Service selector doesn't match pod labels.

**Solution:**


---

## CKAD Exam Tips (2 minutes)

### Quick Diagnosis Commands

**For multi-resource applications:**


### Time-Saving Strategies

**1. Use --all-namespaces to find misplaced resources:**


**2. Create resources quickly:**


**3. Copy resources between namespaces:**


### Common Patterns in CKAD

**Pattern 1:** "Application can't find configuration"
→ Check ConfigMap exists in correct namespace

**Pattern 2:** "Pod stuck in ContainerCreating"
→ Check PVC is Bound

**Pattern 3:** "Pod keeps restarting"
→ Check configuration values are correct

**Pattern 4:** "Can't access application"
→ Check service has endpoints

### Verification Workflow

1. ✅ `kubectl get all,cm,secret,pvc -n <namespace>` - All resources exist
2. ✅ `kubectl get pods -n <namespace>` - Pods Running and Ready
3. ✅ `kubectl get pvc -n <namespace>` - PVC Bound
4. ✅ `kubectl get endpoints -n <namespace>` - Service has endpoints
5. ✅ `curl <service>` - Application responds

---

## Cleanup (1 minute)


---

## Summary and Key Takeaways (1 minute)

**What We Practiced:**

1. **Multi-resource troubleshooting** - Dealing with interconnected components
2. **Namespace-aware debugging** - Finding resources in wrong namespaces
3. **ConfigMap/Secret issues** - Key mismatches and missing resources
4. **PVC troubleshooting** - Understanding binding and volume issues
5. **Service endpoint verification** - Ensuring routing works

**CKAD Skills Reinforced:**
- ✅ Systematic multi-resource diagnosis
- ✅ Using kubectl across namespaces
- ✅ Understanding resource dependencies
- ✅ Fixing configuration issues quickly
- ✅ Comprehensive verification

**Real-World Application:**
- This is exactly how production applications are modeled
- Multiple teams create different resources - mismatches happen
- Namespace isolation requires careful coordination
- Always verify cross-resource references

**Key Lessons:**
- Start with pod describe to identify missing resources
- Check namespace boundaries carefully
- Verify key names match exactly
- Ensure PVCs are Bound before pods can use them
- Always check service endpoints after fixes

---

**Total Duration:** 20-25 minutes
**Next Session:** Advanced troubleshooting with Helm, Ingress, and StatefulSets

**Remember:** In the CKAD exam, application modeling questions combine multiple topics. Master the systematic approach and you'll handle any complexity!
