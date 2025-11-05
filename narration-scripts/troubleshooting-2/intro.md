# Troubleshooting Application Modeling - Concept Introduction

**Duration:** 10-12 minutes
**Format:** Concept slideshow presentation
**Audience:** CKAD exam candidates and Kubernetes practitioners

---

## Slide 1: Introduction (30 seconds)

Welcome to troubleshooting application modeling in Kubernetes. This builds on basic troubleshooting by adding complexity: multiple resources working together.

**Reality Check:** Even simple Kubernetes applications involve multiple interconnected resources. A single misconfiguration in any component breaks the entire stack.

**Today's Focus:**
- ConfigMap and Secret issues
- PersistentVolume mounting problems
- Namespace-related configuration errors
- Multi-resource dependency troubleshooting

**CKAD Relevance:** This is core exam material—modeling applications correctly is fundamental to passing.

---

## Slide 2: The Application Modeling Challenge (1 minute)

**Simple App, Complex Dependencies:**

A basic web application typically requires:
- **Pod/Deployment** - The application container
- **Service** - Network access to the app
- **ConfigMap** - Application configuration
- **Secret** - Database credentials
- **PersistentVolume** - Data storage
- **Namespace** - Resource isolation

**The Problem:** Each resource can fail independently, but symptoms often appear elsewhere.

**Example Cascade:**
1. ConfigMap has wrong key name
2. Pod fails to start (CreateContainerConfigError)
3. Service has no endpoints
4. Application appears "down" but the real issue is configuration

**Visual:** Dependency diagram showing how ConfigMap → Pod → Service flow breaks at any point.

---

## Slide 3: Configuration Resource Overview (1.5 minutes)

### ConfigMaps: Non-Sensitive Configuration

**Purpose:** Store configuration data as key-value pairs or files.

**Common Uses:**
- Application settings
- Environment variables
- Configuration files
- Feature flags

**Consumption Methods:**
1. **Environment Variables:** `envFrom.configMapRef`
2. **Individual Variables:** `env[].valueFrom.configMapKeyRef`
3. **Volume Mounts:** Mount as files in container

### Secrets: Sensitive Data

**Purpose:** Store sensitive information (base64 encoded).

**Common Uses:**
- Database passwords
- API keys
- TLS certificates
- Authentication tokens

**Consumption Methods:**
- Same as ConfigMaps (env vars or volumes)
- Additional security considerations

### PersistentVolumes: Durable Storage

**Purpose:** Provide persistent data storage beyond pod lifecycle.

**Components:**
- **PersistentVolume (PV):** Cluster storage resource
- **PersistentVolumeClaim (PVC):** Request for storage
- **Volume Mount:** Connection to container filesystem

**Visual:** Three diagrams showing ConfigMap → Pod, Secret → Pod, PVC → PV → Pod flows.

---

## Slide 4: Common ConfigMap Issues (2 minutes)

### Issue 1: ConfigMap Doesn't Exist

**Symptom:**
```
Pod Status: CreateContainerConfigError
Events: configmap "app-config" not found
```

**Causes:**
- ConfigMap not created yet
- ConfigMap in wrong namespace
- Typo in ConfigMap name

**Diagnosis:**
```bash
kubectl get configmap
kubectl get configmap -A  # All namespaces
kubectl describe pod <name>  # Check error message
```

### Issue 2: Key Name Mismatch

**Problem:**

```yaml
# ConfigMap
data:
  database-url: postgres://...  # Key has hyphen

# Pod
env:
- name: DATABASE_URL
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: database_url  # Looking for underscore!
```

**Result:** Pod starts but application fails due to missing config.

**Diagnosis:**
```bash
kubectl get configmap app-config -o yaml  # Check actual keys
kubectl describe pod <name>  # May show key not found
kubectl logs <name>  # App error about missing config
```

### Issue 3: Namespace Mismatch

**Problem:** ConfigMap in default namespace, Pod in app namespace.

```yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default  # Wrong namespace!

# Pod
metadata:
  namespace: app
spec:
  # ...references app-config
```

**Result:** Pod can't find ConfigMap.

### Issue 4: Volume Mount Conflicts

**Problem:** Multiple ConfigMaps mounting to same path.

```yaml
volumeMounts:
- name: config1
  mountPath: /etc/config
- name: config2
  mountPath: /etc/config  # Conflict!
```

**Result:** Second mount overwrites first.

**Visual:** Side-by-side comparison of working vs. broken ConfigMap configurations.

---

## Slide 5: Common Secret Issues (1.5 minutes)

**Similar to ConfigMaps but with additional considerations:**

### Issue 1: Secret Encoding Problems

**Problem:** Secrets must be base64 encoded.

```yaml
# Wrong - plain text
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
data:
  password: mypassword  # Not encoded!

# Right - base64 encoded
data:
  password: bXlwYXNzd29yZA==  # "mypassword" encoded
```

**Creating properly:**
```bash
kubectl create secret generic db-secret \
  --from-literal=password=mypassword
# Kubernetes handles encoding automatically
```

### Issue 2: Secret Type Mismatches

**Types:**
- `Opaque` (default) - arbitrary data
- `kubernetes.io/dockerconfigjson` - Docker registry auth
- `kubernetes.io/tls` - TLS certificates
- `kubernetes.io/basic-auth` - Basic auth credentials

**Problem:** Using wrong type causes authentication failures.

### Issue 3: Secret Not Mounted as Expected

**Problem:** Application expects file but Secret mounted as env var (or vice versa).

**Check:**
```bash
kubectl exec <pod> -- ls /path/to/secret
kubectl exec <pod> -- env | grep SECRET
```

**Visual:** Flowchart for diagnosing Secret issues.

---

## Slide 6: PersistentVolume Issues (2 minutes)

### The PV/PVC Lifecycle

**States:**
1. **Available** - PV ready for binding
2. **Bound** - PVC successfully bound to PV
3. **Released** - PVC deleted but PV not reclaimed
4. **Failed** - Reclamation failed

### Issue 1: PVC Pending (Not Bound)

**Symptom:**
```
PVC Status: Pending
Pod Status: Pending (or ContainerCreating)
Events: waiting for volume to be created
```

**Causes:**
1. No PV available matching PVC requirements
2. Storage class doesn't exist
3. Size/access mode mismatch
4. Node doesn't support volume type

**Diagnosis:**
```bash
kubectl get pvc
# Shows: STATUS: Pending

kubectl describe pvc <name>
# Events show why binding failed

kubectl get pv
# Check available PVs and their specs
```

**Common Mismatches:**

```yaml
# PVC requests
spec:
  accessModes:
  - ReadWriteMany  # Needs RWX
  resources:
    requests:
      storage: 10Gi  # Needs 10Gi

# Available PV has
spec:
  accessModes:
  - ReadWriteOnce  # Only RWO!
  capacity:
    storage: 5Gi    # Only 5Gi!
```

### Issue 2: Volume Mount Path Errors

**Problem:** Mount path doesn't exist or has wrong permissions.

```yaml
volumeMounts:
- name: data
  mountPath: /data/app  # Directory doesn't exist in image
```

**Result:** Container may fail to start or crash.

### Issue 3: Multiple Pods Claiming RWO Volume

**Problem:** ReadWriteOnce volume can only be used by one pod on one node.

**Scenario:** Deployment with 3 replicas tries to use RWO volume.

**Result:** Only one pod succeeds, others stuck in ContainerCreating.

**Solution:** Use ReadWriteMany or change to StatefulSet with per-pod volumes.

**Visual:** Diagram showing PVC in Pending state with mismatched PV requirements.

---

## Slide 7: Namespace-Related Issues (1.5 minutes)

### Issue 1: Resources in Wrong Namespace

**Problem:** Resources referencing each other across namespaces.

```yaml
# ConfigMap in default namespace
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default

# Deployment in app namespace
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  namespace: app
spec:
  template:
    spec:
      containers:
      - name: app
        envFrom:
        - configMapRef:
            name: app-config  # Can't find it!
```

**Rule:** Resources can only reference other resources in the same namespace (with some exceptions like PV, Nodes).

### Issue 2: Service DNS Across Namespaces

**Within Namespace:**
```bash
curl http://api-service  # Works
```

**Cross-Namespace (requires FQDN):**
```bash
curl http://api-service.other-namespace.svc.cluster.local
```

**Problem:** App tries to reach service with short name but it's in different namespace.

### Issue 3: RBAC Namespace Restrictions

**Problem:** ServiceAccount doesn't have permissions in target namespace.

**Diagnosis:**
```bash
kubectl auth can-i get pods --as=system:serviceaccount:app:default
# Check permissions for specific ServiceAccount
```

**Visual:** Namespace boundary diagram showing which resources can/cannot be shared.

---

## Slide 8: Multi-Resource Dependency Issues (1.5 minutes)

### Common Dependency Chains

**Example 1: Web App with Database**

```
ConfigMap (DB connection) → Pod → Service → Ingress
Secret (DB password) ──────┘
PVC (App data) ────────────┘
```

**Any single failure breaks the chain.**

### Troubleshooting Strategy

**1. Start at the Pod (middle of chain)**
```bash
kubectl get pods
kubectl describe pod <name>
```

**2. Check Dependencies (work backwards)**
```bash
# Check ConfigMaps/Secrets
kubectl get cm,secret
kubectl describe cm <name>

# Check PVCs
kubectl get pvc
kubectl describe pvc <name>
```

**3. Check Consumers (work forwards)**
```bash
# Check if Service has endpoints
kubectl get endpoints
kubectl describe service <name>
```

### Common Patterns

**Pattern 1: CreateContainerConfigError**
- Missing ConfigMap/Secret
- Wrong key in ConfigMap/Secret
- ConfigMap/Secret in wrong namespace

**Pattern 2: ContainerCreating (stuck)**
- PVC not bound
- Volume mount issues
- Image pull problems

**Pattern 3: CrashLoopBackOff**
- Wrong configuration values
- Missing required config
- Invalid file paths

**Visual:** Troubleshooting decision tree starting from pod status.

---

## Slide 9: CKAD Troubleshooting Methodology (1.5 minutes)

### Phase 1: Assess the Situation (30 seconds)

```bash
# Get overview
kubectl get all,cm,secret,pvc -n <namespace>

# Check recent events
kubectl get events --sort-by='.lastTimestamp' -n <namespace>

# Focus on problematic resources
kubectl get pods -n <namespace>
```

### Phase 2: Diagnose Dependencies (1-2 minutes)

```bash
# Check pod details
kubectl describe pod <name> -n <namespace>

# Look for specific errors:
# - "configmap not found" → ConfigMap issue
# - "secret not found" → Secret issue
# - "persistentvolumeclaim not bound" → PVC issue
# - "error mounting volume" → Volume mount issue

# Verify referenced resources exist
kubectl get cm <name> -n <namespace>
kubectl get secret <name> -n <namespace>
kubectl get pvc <name> -n <namespace>
```

### Phase 3: Verify Configuration (1 minute)

```bash
# Check ConfigMap keys match references
kubectl get cm <name> -o yaml -n <namespace>

# Check Secret keys match references
kubectl get secret <name> -o yaml -n <namespace>

# Check PVC is bound
kubectl get pvc <name> -n <namespace>
# STATUS should be: Bound

# Check PV matches PVC
kubectl describe pvc <name> -n <namespace>
kubectl describe pv <pv-name>
```

### Phase 4: Fix and Validate (1-2 minutes)

```bash
# Apply fixes
kubectl create configmap ...  # If missing
kubectl edit deployment ...    # Fix references
kubectl delete pod ...         # Force restart if needed

# Validate
kubectl get pods -n <namespace>
# All pods Running and Ready

kubectl logs <pod> -n <namespace>
# No errors, app starting successfully
```

**Time Budget:** 5-7 minutes total for CKAD exam questions.

---

## Slide 10: Common Error Messages and Meanings (1 minute)

| Error Message | Root Cause | First Action |
|---------------|------------|--------------|
| `CreateContainerConfigError` | ConfigMap/Secret issue | `kubectl describe pod` |
| `configmap "X" not found` | Missing ConfigMap | `kubectl get cm` |
| `secret "X" not found` | Missing Secret | `kubectl get secret` |
| `persistentvolumeclaim not bound` | PVC pending | `kubectl get pvc; kubectl get pv` |
| `error mounting volume` | Volume mount issue | Check paths and permissions |
| `key "X" not found in ConfigMap` | Wrong key name | `kubectl get cm <name> -o yaml` |
| `Volume is already attached by pod` | RWO conflict | Check volume access mode |
| `unable to mount volume` | PV not available | Check node/PV compatibility |

---

## Slide 11: CKAD Exam Tips (1 minute)

### Quick Diagnostics

**ConfigMap/Secret Issues:**
```bash
# Fast check
kubectl get cm,secret -n <namespace>
kubectl describe pod <name> | grep -i config
kubectl describe pod <name> | grep -i secret
```

**PVC Issues:**
```bash
# Fast check
kubectl get pvc -n <namespace>
kubectl describe pvc <name> | grep -i event
```

**Namespace Issues:**
```bash
# Check current namespace
kubectl config view --minify | grep namespace

# List resources across all namespaces
kubectl get all,cm,secret,pvc -A
```

### Time-Saving Commands

```bash
# Create ConfigMap quickly
kubectl create cm app-config --from-literal=key=value -n <namespace>

# Create Secret quickly
kubectl create secret generic db-secret --from-literal=password=pass -n <namespace>

# Check what namespace you're in
kubectl config get-contexts
```

### Verification Checklist

✅ All ConfigMaps exist in correct namespace
✅ All Secrets exist in correct namespace
✅ All PVCs are Bound
✅ Key names match in ConfigMaps/Secrets
✅ Volume mount paths are correct
✅ Pods are Running and Ready

---

## Slide 12: Key Takeaways (1 minute)

**Essential Concepts:**

1. **ConfigMaps and Secrets must exist in same namespace as Pods**
2. **Key names must match exactly** between ConfigMap/Secret and Pod references
3. **PVCs must be Bound before Pods can use them**
4. **Check `kubectl describe pod` for CreateContainerConfigError**
5. **Namespace boundaries matter** for most resources

**Troubleshooting Priority:**
1. Check if resources exist: `kubectl get cm,secret,pvc`
2. Check pod errors: `kubectl describe pod`
3. Verify key names: `kubectl get cm <name> -o yaml`
4. Check PVC status: `kubectl get pvc`
5. Verify namespace alignment

**CKAD Success Formula:**
- Know how to create ConfigMaps/Secrets quickly
- Understand PVC lifecycle and states
- Practice namespace-scoped troubleshooting
- Always verify dependencies before fixing pods

**Remember:** Application modeling errors are among the most common in production AND the CKAD exam. Master these patterns!

---

**Total Time:** 10-12 minutes
**Next:** Hands-on troubleshooting with real multi-resource applications
