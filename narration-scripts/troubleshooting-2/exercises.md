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

```bash
kubectl apply -f labs/troubleshooting-2/specs/
```

**Initial Testing:**

```bash
# Try to access the application
curl localhost:8040
# Connection refused or timeout

curl localhost:30040
# Connection refused or timeout
```

**Narration:** "The application isn't accessible. Let's start our systematic troubleshooting process."

**What was created?**

```bash
# Get high-level overview
kubectl get all -l kubernetes.courselabs.co=troubleshooting-2

# Check all related resources
kubectl get all,cm,secret,pvc -l kubernetes.courselabs.co=troubleshooting-2

# Check across all namespaces (resources might be in different namespaces!)
kubectl get all,cm,secret,pvc -A -l kubernetes.courselabs.co=troubleshooting-2
```

**Observation Questions:**
- What namespaces are involved?
- Are there any pods? What's their status?
- Do ConfigMaps and Secrets exist?
- Are there any PVCs? What's their status?

**Pause for 1 minute:** "Take a moment to review what resources exist and their current state."

---

### Step 2: High-Level Resource Assessment (2 minutes)

**Check the namespace:**

```bash
# List all namespaces
kubectl get namespaces | grep troubleshooting

# Check what's in the troubleshooting-2 namespace
kubectl get all -n troubleshooting-2

# Check ConfigMaps and Secrets
kubectl get cm,secret -n troubleshooting-2

# Check PVCs
kubectl get pvc -n troubleshooting-2
```

**Narration:** "We should see a deployment, service, ConfigMap, Secret, and PVC. Let's check each component."

**Check deployments:**

```bash
kubectl get deployments -n troubleshooting-2
# Check READY column - are all replicas ready?
```

**Check pods:**

```bash
kubectl get pods -n troubleshooting-2
# Note the STATUS and READY columns
```

**Check services:**

```bash
kubectl get services -n troubleshooting-2
# Verify service type and ports
```

**Expected Findings:**
- Deployment may show 0/1 READY
- Pod may be in error state (Pending, CrashLoopBackOff, CreateContainerConfigError, etc.)
- Service exists but has no endpoints

**Narration:** "Based on the pod status, we can start narrowing down the issue. Let's examine the pod in detail."

---

### Step 3: Pod-Level Diagnosis (3 minutes)

**Get pod details:**

```bash
# Get pod name
POD_NAME=$(kubectl get pod -n troubleshooting-2 -l kubernetes.courselabs.co=troubleshooting-2 -o jsonpath='{.items[0].metadata.name}')

echo "Pod name: $POD_NAME"

# Check pod status
kubectl get pod $POD_NAME -n troubleshooting-2

# Describe the pod
kubectl describe pod $POD_NAME -n troubleshooting-2
```

**What to look for in describe output:**

**1. Pod Status Section:**
```
Status: Pending / Running / Failed
Conditions:
  PodScheduled: True/False
  Initialized: True/False
  ContainersReady: True/False
  Ready: True/False
```

**2. Container Status:**
```
State: Running/Waiting/Terminated
  Reason: CreateContainerConfigError / CrashLoopBackOff / etc.
```

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

```bash
# Check if ConfigMap exists in the namespace
kubectl get cm -n troubleshooting-2

# Check in all namespaces
kubectl get cm -A | grep troubleshooting-2

# If it exists elsewhere
kubectl get cm -n default | grep troubleshooting-2
```

**Common Finding #2: Secret Issues**

If you see `secret "X" not found`:

```bash
# Check if Secret exists in the namespace
kubectl get secret -n troubleshooting-2

# Check in all namespaces
kubectl get secret -A | grep troubleshooting-2
```

**Common Finding #3: PVC Issues**

If you see PVC-related errors:

```bash
# Check PVC status
kubectl get pvc -n troubleshooting-2
# Look at STATUS column - should be "Bound"

# If Pending, describe it
kubectl describe pvc -n troubleshooting-2

# Check available PVs
kubectl get pv
```

**Common Finding #4: Key Name Mismatches**

If pod starts but describes show key errors:

```bash
# Check ConfigMap keys
kubectl get cm <name> -n troubleshooting-2 -o yaml

# Compare with pod spec
kubectl get pod $POD_NAME -n troubleshooting-2 -o yaml | grep -A 10 configMap
```

---

### Step 4: ConfigMap and Secret Investigation (3 minutes)

**Check ConfigMap configuration:**

```bash
# List ConfigMaps
kubectl get cm -n troubleshooting-2

# If found, examine contents
kubectl get cm <configmap-name> -n troubleshooting-2 -o yaml

# If not found, check other namespaces
kubectl get cm -A | grep <configmap-name>
```

**Typical ConfigMap Issues:**

**Issue A: ConfigMap in Wrong Namespace**

```bash
# ConfigMap exists but in wrong namespace
kubectl get cm app-config -n default
# Found in default, but pod is in troubleshooting-2!

# Solution: Create in correct namespace or move it
kubectl get cm app-config -n default -o yaml | \
  sed 's/namespace: default/namespace: troubleshooting-2/' | \
  kubectl apply -f -

# Or delete and recreate
kubectl delete cm app-config -n default
kubectl create cm app-config -n troubleshooting-2 --from-literal=key=value
```

**Issue B: Wrong Key Names**

```bash
# Check what keys actually exist
kubectl get cm app-config -n troubleshooting-2 -o jsonpath='{.data}'

# Check what keys pod is looking for
kubectl get pod $POD_NAME -n troubleshooting-2 -o yaml | grep -A 5 configMapKeyRef
```

**Example fix:**

```yaml
# ConfigMap has:
data:
  app-setting: value

# Pod looks for:
  configMapKeyRef:
    name: app-config
    key: app_setting  # Wrong! Should be "app-setting"
```

**Check Secret configuration:**

```bash
# List Secrets
kubectl get secret -n troubleshooting-2

# Examine Secret (data is base64 encoded)
kubectl get secret <secret-name> -n troubleshooting-2 -o yaml

# Decode a secret value to verify
kubectl get secret <secret-name> -n troubleshooting-2 -o jsonpath='{.data.password}' | base64 -d
```

**Typical Secret Issues:**

Similar to ConfigMap:
- Wrong namespace
- Wrong key names
- Pod can't access Secret

**Narration:** "ConfigMap and Secret issues are the most common application modeling problems. Let's fix any we've found."

---

### Step 5: PersistentVolume Investigation (2 minutes)

**Check PVC status:**

```bash
# Check PVC
kubectl get pvc -n troubleshooting-2
# STATUS should be "Bound"

# If Pending, describe it
kubectl describe pvc <pvc-name> -n troubleshooting-2
```

**Typical PVC Issues:**

**Issue A: No Matching PV**

```bash
# Check what PVC needs
kubectl describe pvc <pvc-name> -n troubleshooting-2
# Note: Requested storage, access modes

# Check available PVs
kubectl get pv

# Look for:
# - STATUS: Available (not Bound or Released)
# - Capacity matches or exceeds PVC request
# - Access modes compatible
```

**Issue B: PV/PVC Mismatch**

```yaml
# PVC requests:
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi

# But available PV has:
spec:
  accessModes:
  - ReadOnlyMany  # Wrong access mode!
  capacity:
    storage: 500Mi  # Too small!
```

**Solution:** Create compatible PV or adjust PVC.

**Issue C: PVC Bound but Pod Can't Mount**

```bash
# PVC is Bound
kubectl get pvc -n troubleshooting-2
# STATUS: Bound

# But pod still has mount errors
kubectl describe pod $POD_NAME -n troubleshooting-2
# Check for mount path issues

# Verify volume mounts
kubectl get pod $POD_NAME -n troubleshooting-2 -o yaml | grep -A 5 volumeMounts
```

---

### Step 6: Service and Endpoint Verification (2 minutes)

**Once pod is healthy, check service routing:**

```bash
# Check service
kubectl get svc -n troubleshooting-2

# Check if service has endpoints
kubectl get endpoints -n troubleshooting-2

# Describe service
kubectl describe svc <service-name> -n troubleshooting-2
```

**Verify service configuration:**

```bash
# Check service selector
kubectl get svc <service-name> -n troubleshooting-2 -o jsonpath='{.spec.selector}'

# Check pod labels
kubectl get pods -n troubleshooting-2 --show-labels

# Verify they match!
```

**Check ports:**

```bash
# Service ports
kubectl describe svc <service-name> -n troubleshooting-2 | grep -E "Port:|TargetPort:|NodePort:"

# Container ports
kubectl describe pod $POD_NAME -n troubleshooting-2 | grep "Port:"

# Must align!
```

---

### Step 7: Fix the Issues (4 minutes)

**Narration:** "Now let's fix the issues we've identified. Work through them systematically."

**Common Fix 1: Move ConfigMap to Correct Namespace**

```bash
# If ConfigMap is in wrong namespace
kubectl get cm <name> -n default -o yaml > /tmp/configmap.yaml

# Edit to change namespace
vi /tmp/configmap.yaml
# Change: namespace: default → namespace: troubleshooting-2

# Apply to correct namespace
kubectl apply -f /tmp/configmap.yaml

# Or use kubectl in one line
kubectl get cm <name> -n default -o yaml | \
  kubectl apply -n troubleshooting-2 -f -

# Clean up old one
kubectl delete cm <name> -n default
```

**Common Fix 2: Create Missing Secret**

```bash
# If Secret doesn't exist
kubectl create secret generic <name> \
  --from-literal=username=admin \
  --from-literal=password=secret123 \
  -n troubleshooting-2
```

**Common Fix 3: Fix Key Names**

```bash
# If key names don't match, fix the pod spec
kubectl edit deployment <name> -n troubleshooting-2

# Change the key reference to match actual ConfigMap keys
```

Or fix the ConfigMap:

```bash
kubectl edit cm <name> -n troubleshooting-2
# Change key names to match pod expectations
```

**Common Fix 4: Create Missing PV**

```bash
# If PVC is Pending and no matching PV exists
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: troubleshooting-2-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /tmp/troubleshooting-2-data
  persistentVolumeReclaimPolicy: Retain
EOF

# Check PVC binds
kubectl get pvc -n troubleshooting-2
# Should now show: Bound
```

**Common Fix 5: Fix Service Selector**

```bash
# If endpoints are empty
kubectl patch svc <name> -n troubleshooting-2 -p '{"spec":{"selector":{"app":"correct-label"}}}'

# Or edit
kubectl edit svc <name> -n troubleshooting-2
```

**Common Fix 6: Restart Pods After Config Changes**

```bash
# After fixing ConfigMaps/Secrets, restart deployment
kubectl rollout restart deployment/<name> -n troubleshooting-2

# Or delete pod to force recreation
kubectl delete pod $POD_NAME -n troubleshooting-2

# Watch for new pod
kubectl get pods -n troubleshooting-2 --watch
```

**Narration:** "After each fix, check if the pod status improves. You might need to fix multiple issues."

---

### Step 8: Verification (3 minutes)

**Comprehensive verification checklist:**

**1. All Resources Exist in Correct Namespace:**

```bash
kubectl get all,cm,secret,pvc -n troubleshooting-2
# All should exist in troubleshooting-2 namespace
```

**2. Pod is Healthy:**

```bash
kubectl get pods -n troubleshooting-2
# Should show: READY 1/1, STATUS Running, RESTARTS 0

# No errors in describe
kubectl describe pod -n troubleshooting-2 | grep -i error
# Should return nothing
```

**3. PVC is Bound:**

```bash
kubectl get pvc -n troubleshooting-2
# STATUS: Bound
```

**4. Service Has Endpoints:**

```bash
kubectl get endpoints -n troubleshooting-2
# Should show pod IP addresses
```

**5. Application Responds:**

```bash
# Test via port-forward
kubectl port-forward -n troubleshooting-2 svc/<service-name> 8080:80

# In another terminal
curl localhost:8080
# Should see application response

# Test via NodePort (if configured)
curl localhost:8040
# OR
curl localhost:30040

# Expected: Web application displaying its configuration
```

**6. Configuration is Loaded:**

```bash
# Check app logs
kubectl logs -n troubleshooting-2 <pod-name>

# Should see:
# - No errors about missing config
# - Configuration loaded successfully
# - Application started

# Verify ConfigMap values appear in app
curl localhost:8040
# Response should include config values
```

**7. Persistent Storage Works:**

```bash
# Check volume is mounted
kubectl exec -n troubleshooting-2 <pod-name> -- df -h | grep data

# Check data can be written
kubectl exec -n troubleshooting-2 <pod-name> -- touch /data/test.txt
kubectl exec -n troubleshooting-2 <pod-name> -- ls /data

# Should see test.txt
```

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
```bash
# Move to correct namespace
kubectl get cm <name> -n default -o yaml | \
  kubectl apply -n troubleshooting-2 -f -
kubectl delete cm <name> -n default
```

### Issue 2: ConfigMap Key Mismatch

**Problem:** ConfigMap has `database-url` but pod looks for `database_url`.

**Solution:**
```bash
# Option 1: Fix ConfigMap
kubectl edit cm <name> -n troubleshooting-2
# Rename key to match pod expectation

# Option 2: Fix pod
kubectl edit deployment <name> -n troubleshooting-2
# Update configMapKeyRef.key to match actual key
```

### Issue 3: PVC Not Bound

**Problem:** No PV available matching PVC requirements.

**Solution:**
```bash
# Create matching PV
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /tmp/app-data
EOF
```

### Issue 4: Service Can't Find Pods

**Problem:** Service selector doesn't match pod labels.

**Solution:**
```bash
# Check and fix selector
kubectl get svc <name> -n troubleshooting-2 -o jsonpath='{.spec.selector}'
kubectl get pods -n troubleshooting-2 --show-labels

# Fix selector to match labels
kubectl patch svc <name> -n troubleshooting-2 -p '{"spec":{"selector":{"app":"correct-label"}}}'
```

---

## CKAD Exam Tips (2 minutes)

### Quick Diagnosis Commands

**For multi-resource applications:**

```bash
# Check everything at once
kubectl get all,cm,secret,pvc -n <namespace>

# Check pod errors
kubectl describe pod <name> -n <namespace> | grep -A 10 Events

# Verify ConfigMap keys
kubectl get cm <name> -n <namespace> -o jsonpath='{.data}' | jq

# Check PVC binding
kubectl get pvc -n <namespace>

# Verify service endpoints
kubectl get endpoints -n <namespace>
```

### Time-Saving Strategies

**1. Use --all-namespaces to find misplaced resources:**
```bash
kubectl get cm,secret -A | grep <name>
```

**2. Create resources quickly:**
```bash
# ConfigMap
kubectl create cm app-config --from-literal=key=value -n <namespace>

# Secret
kubectl create secret generic db-secret --from-literal=password=pass -n <namespace>
```

**3. Copy resources between namespaces:**
```bash
kubectl get cm <name> -n source -o yaml | \
  sed 's/namespace: source/namespace: target/' | \
  kubectl apply -f -
```

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

```bash
# Delete the namespace (removes all resources)
kubectl delete namespace troubleshooting-2

# Delete any ConfigMaps in default namespace with the label
kubectl delete cm -A -l kubernetes.courselabs.co=troubleshooting-2

# Verify cleanup
kubectl get all,cm,secret,pvc -A -l kubernetes.courselabs.co=troubleshooting-2
# Should return: No resources found
```

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
