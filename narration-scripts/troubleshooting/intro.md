# Troubleshooting Apps in Kubernetes - Concept Introduction

**Duration:** 10-12 minutes
**Format:** Concept slideshow presentation
**Audience:** CKAD exam candidates and Kubernetes practitioners

---

## Slide 1: Introduction (30 seconds)

Welcome to Kubernetes troubleshooting fundamentals. This is a critical CKAD exam skill that spans multiple domains and can make the difference between passing and failing.

**Reality Check:** In production Kubernetes, things WILL go wrong. Your ability to quickly diagnose and fix issues is essential.

**Today's Focus:**
- Common failure patterns
- Systematic debugging approach
- Essential kubectl troubleshooting commands
- Real-world problem-solving techniques

---

## Slide 2: The Troubleshooting Challenge (1 minute)

Kubernetes validates YAML syntax but doesn't guarantee your app will work.

**Common Scenarios:**
- Service can't find pods (selector mismatch)
- Pods won't start (image pull errors)
- Containers crash repeatedly (application errors)
- Network connectivity failures (service/network issues)
- Configuration problems (ConfigMap/Secret mismatches)

**The Problem:** Objects are loosely coupled. A typo in a label breaks everything, but Kubernetes won't tell you until you investigate.

**Visual:** Diagram showing disconnected Service → Pods due to label mismatch.

---

## Slide 3: Systematic Troubleshooting Approach (1.5 minutes)

**The 5-Step Debugging Process:**

1. **Get Overview** - `kubectl get` to see resource status
2. **Check Events** - `kubectl describe` for recent events and errors
3. **Review Logs** - `kubectl logs` for application-level issues
4. **Verify Configuration** - Check selectors, labels, ports, names
5. **Test Directly** - Use port-forward or exec to bypass layers

**Key Principle:** Start broad, narrow down to specific components.

**Visual:** Flowchart showing decision tree from high-level overview to specific diagnosis.

**Time Management:** In the CKAD exam, you should identify most issues within 2-3 minutes using this approach.

---

## Slide 4: Essential kubectl Troubleshooting Commands (2 minutes)

### Level 1: Overview Commands

```bash
# Get resource status
kubectl get pods
kubectl get pods -o wide           # More details
kubectl get pods --all-namespaces  # Cluster-wide view
kubectl get all                    # All resources in namespace

# Check recent events
kubectl get events --sort-by='.lastTimestamp'
kubectl get events --field-selector involvedObject.name=pod-name
```

### Level 2: Detailed Investigation

```bash
# Describe resources (critical for events!)
kubectl describe pod <pod-name>
kubectl describe service <service-name>
kubectl describe node <node-name>

# View logs
kubectl logs <pod-name>
kubectl logs <pod-name> -c <container-name>  # Multi-container pods
kubectl logs <pod-name> --previous           # Previous container instance
kubectl logs <pod-name> -f                   # Follow logs
kubectl logs <pod-name> --tail=50            # Last 50 lines
```

### Level 3: Interactive Debugging

```bash
# Execute commands in containers
kubectl exec <pod-name> -- <command>
kubectl exec -it <pod-name> -- /bin/sh

# Test connectivity directly
kubectl port-forward <pod-name> 8080:80
kubectl port-forward service/<svc-name> 8080:80

# Create debug pod
kubectl run debug --image=busybox -it --rm -- sh
```

**CKAD Tip:** Memorize these commands! They're your primary diagnostic tools.

---

## Slide 5: Common Pod Failure #1 - ImagePullBackOff (1.5 minutes)

**Symptoms:**
- Pod status: `ImagePullBackOff` or `ErrImagePull`
- Pod never reaches Running state
- Restart count stays at 0

**Root Causes:**
1. **Typo in image name or tag** (most common)
2. **Image doesn't exist** in registry
3. **Private registry authentication failure**
4. **Network connectivity** to registry

**Diagnosis:**

```bash
kubectl get pods
# Shows: ImagePullBackOff

kubectl describe pod <pod-name>
# Events show: "Failed to pull image"
# Error message reveals specific issue
```

**Common Fixes:**

```bash
# Fix wrong image name
kubectl set image deployment/app app=correct-image:v1

# Add image pull secret for private registry
kubectl create secret docker-registry regcred \
  --docker-server=<server> \
  --docker-username=<user> \
  --docker-password=<pass>

# Reference secret in deployment
spec:
  imagePullSecrets:
  - name: regcred
```

**Visual:** Screenshot showing ImagePullBackOff in kubectl describe events.

---

## Slide 6: Common Pod Failure #2 - CrashLoopBackOff (1.5 minutes)

**Symptoms:**
- Pod status: `CrashLoopBackOff`
- Restart count increases continuously
- Pod runs briefly then crashes

**Root Causes:**
1. **Application error at startup** (missing config, bad code)
2. **Missing dependencies** (database, external service)
3. **Incorrect command or arguments**
4. **Failed liveness probe** (too aggressive settings)
5. **Resource constraints** (OOMKilled)

**Diagnosis:**

```bash
kubectl get pods
# Shows: CrashLoopBackOff, RESTARTS: 5

kubectl logs <pod-name>
# Check current logs

kubectl logs <pod-name> --previous
# CRITICAL: Check logs from crashed container

kubectl describe pod <pod-name>
# Check:
# - Last State: Terminated (Reason: Error, Exit Code: 1)
# - Events: May show OOMKilled or other termination reasons
```

**Common Fixes:**

```bash
# Missing environment variable
kubectl set env deployment/app DATABASE_URL=postgres://...

# Wrong command
kubectl edit deployment app
# Fix command/args in container spec

# Failed liveness probe
kubectl edit deployment app
# Increase initialDelaySeconds, failureThreshold
```

**Key Insight:** Always check `--previous` logs! Current logs show the RESTART, not the original crash.

---

## Slide 7: Common Pod Failure #3 - Pending State (1.5 minutes)

**Symptoms:**
- Pod status: `Pending`
- Pod never gets scheduled to a node
- Remains pending indefinitely

**Root Causes:**
1. **Insufficient cluster resources** (CPU/memory)
2. **Node selector/affinity rules** can't be satisfied
3. **PersistentVolumeClaim not bound**
4. **Taints and tolerations mismatch**

**Diagnosis:**

```bash
kubectl get pods
# Shows: STATUS: Pending

kubectl describe pod <pod-name>
# Events section shows scheduling errors:
# - "Insufficient cpu"
# - "Insufficient memory"
# - "No nodes available that match selector"
# - "PersistentVolumeClaim not bound"

# Check node resources
kubectl top nodes
kubectl describe nodes
```

**Common Fixes:**

```bash
# Reduce resource requests
kubectl edit deployment app
resources:
  requests:
    cpu: 100m      # Was 2000m
    memory: 128Mi  # Was 4Gi

# Fix node selector
kubectl edit deployment app
# Remove or correct nodeSelector

# Create PersistentVolume if missing
kubectl get pv,pvc
# Create appropriate PV for pending PVC
```

**Visual:** Table showing pod resource requests vs. available node resources.

---

## Slide 8: Service and Networking Issues (2 minutes)

**The Most Common Kubernetes Problem:** Service can't find pods!

### Issue 1: Selector Mismatch

**Problem:** Service selector labels don't match Pod labels.

```yaml
# Service
spec:
  selector:
    app: webapp    # Looking for "webapp"

# Pod
metadata:
  labels:
    app: web-app   # Has "web-app" (typo!)
```

**Diagnosis:**

```bash
kubectl get service webapp
kubectl describe service webapp
# Shows: Selector: app=webapp

kubectl get endpoints webapp
# Shows: No endpoints! <none>

kubectl get pods -l app=webapp
# Shows: No resources found (confirming mismatch)

kubectl get pods --show-labels
# Find pods with wrong label
```

### Issue 2: Port Mismatch

**Problem:** Service targetPort doesn't match container port.

```yaml
# Service
spec:
  ports:
  - port: 80
    targetPort: 8080  # Expects container on 8080

# Container
spec:
  containers:
  - name: app
    ports:
    - containerPort: 3000  # Actually listening on 3000!
```

**Diagnosis:**

```bash
kubectl describe service webapp
# Note targetPort

kubectl describe pod webapp-xxxx
# Check container port

# Test directly with port-forward
kubectl port-forward pod/webapp-xxxx 8080:3000
# If this works but service doesn't, it's a port mismatch
```

**Key Diagnostic Command:**

```bash
# Check if service has endpoints
kubectl get endpoints <service-name>

# If endpoints exist, service → pod routing works
# If endpoints are empty, selector/port mismatch
```

---

## Slide 9: Container Not Ready (1 minute)

**Symptoms:**
- Pod status: `Running` but not `Ready`
- Shows as 0/1 or 0/2 in READY column
- Service doesn't route traffic to pod

**Root Causes:**
1. **Readiness probe failing**
2. **Application slow to start**
3. **Incorrect readiness probe configuration**

**Diagnosis:**

```bash
kubectl get pods
# Shows: READY 0/1, STATUS: Running

kubectl describe pod <pod-name>
# Check:
# - Readiness probe configuration
# - Events: "Readiness probe failed: HTTP probe failed"

kubectl logs <pod-name>
# Check if app is actually ready
```

**Common Fixes:**

```bash
# Increase readiness probe timing
kubectl edit deployment app
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30  # Was 5
  periodSeconds: 10
  failureThreshold: 3      # Was 1

# Fix readiness probe path
# Maybe app uses /ready not /health
```

---

## Slide 10: Configuration Issues (1 minute)

**ConfigMap and Secret Problems:**

**Common Issues:**
1. ConfigMap/Secret doesn't exist
2. Wrong key referenced in Pod spec
3. Volume mount path conflicts
4. Environment variable name typos

**Diagnosis:**

```bash
# Check ConfigMap exists
kubectl get configmap app-config
# If not found, that's your problem!

# Check ConfigMap contents
kubectl describe configmap app-config
kubectl get configmap app-config -o yaml

# Check pod references
kubectl describe pod <pod-name>
# Look in Environment and Mounts sections
```

**Quick Fixes:**

```bash
# Create missing ConfigMap
kubectl create configmap app-config --from-literal=key=value

# Fix key reference
kubectl edit deployment app
# Correct the key name in env or volumeMounts
```

---

## Slide 11: CKAD Troubleshooting Strategy (1 minute)

**Exam Time Management:**

**Phase 1: Quick Assessment (30 seconds)**
```bash
kubectl get all
kubectl get pods
kubectl get events --sort-by='.lastTimestamp' | tail
```

**Phase 2: Detailed Diagnosis (1-2 minutes)**
```bash
kubectl describe pod <failing-pod>
kubectl logs <failing-pod>
kubectl logs <failing-pod> --previous  # If crashing
```

**Phase 3: Verify Configuration (1 minute)**
```bash
# Check selectors match
kubectl get svc <svc> -o yaml | grep -A 3 selector
kubectl get pods --show-labels

# Check endpoints exist
kubectl get endpoints <svc>

# Check ports match
kubectl describe pod <pod> | grep Port
kubectl describe svc <svc> | grep Port
```

**Phase 4: Fix and Verify (1 minute)**
```bash
# Apply fix (edit, patch, or reapply)
kubectl edit ...

# Verify fix worked
kubectl get pods
kubectl get endpoints
```

**Total Time Budget:** 4-5 minutes per troubleshooting question

---

## Slide 12: Key Takeaways (1 minute)

**Essential Skills for CKAD:**

1. **Master describe and logs** - Your primary diagnostic tools
2. **Check endpoints** - First thing to verify for service issues
3. **Use --previous** - Essential for CrashLoopBackOff
4. **Verify labels and selectors** - Most common source of problems
5. **Check ports** - Container port must match service targetPort
6. **Read events carefully** - They tell you exactly what's wrong

**Common Patterns to Remember:**
- ImagePullBackOff → Check image name in `describe`
- CrashLoopBackOff → Check logs with `--previous`
- Pending → Check resources and scheduling in `describe`
- Running but not Ready → Check readiness probe
- Service not routing → Check endpoints

**CKAD Success Formula:**
- Follow systematic approach
- Don't guess—diagnose!
- Verify every fix
- Practice common scenarios

---

**Total Time:** 10-12 minutes
**Next:** Hands-on troubleshooting exercises with real broken configurations
