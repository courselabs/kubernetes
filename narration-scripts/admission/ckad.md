# Admission Control - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (18-22 minutes)

### Section 1: CKAD Exam Context (2 min)
**[00:00-02:00]**

While admission control is advanced, you'll encounter it in CKAD scenarios - mainly troubleshooting when policies block your deployments.

Key exam skills:
- Recognizing admission controller errors
- Debugging Pods stuck due to admission policies
- Understanding Pod Security Standards
- Working with ResourceQuota and LimitRange
- Reading Gatekeeper constraints

You won't write webhooks, but you must troubleshoot when they block you. Essential commands:

```bash
kubectl describe rs -l app=myapp  # Admission errors appear here
kubectl get events --sort-by=.metadata.creationTimestamp
kubectl describe resourcequota -n namespace
kubectl describe limitrange -n namespace
kubectl get namespace namespace --show-labels  # Check Pod Security
```

---

### Section 2: Pod Security Standards (4 min)
**[02:00-06:00]**

PSS is enforced at namespace level via labels. Three levels:

**Privileged** - No restrictions
**Baseline** - Prevents known privilege escalations
**Restricted** - Hardened security requirements

Apply enforcement:

```bash
kubectl label namespace app pod-security.kubernetes.io/enforce=baseline
```

Baseline prevents:
- hostNetwork, hostPID, hostIPC
- privileged containers
- hostPath volumes
- Adding capabilities (except safe ones)

Restricted additionally requires:
- runAsNonRoot: true
- Drop ALL capabilities
- seccompProfile set
- No privilege escalation

Common error:

```
violates PodSecurity "baseline:latest": privileged
(container "nginx" must not set securityContext.privileged=true)
```

Fix:

```yaml
spec:
  containers:
  - name: nginx
    image: nginx
    securityContext:
      privileged: false  # or remove the line
```

For restricted mode:

```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: app
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop: [ALL]
```

---

### Section 3: ResourceQuota Troubleshooting (3 min)
**[06:00-09:00]**

ResourceQuota enforces namespace limits. Common error:

```
exceeded quota: compute-quota, requested: limits.memory=2Gi,
used: limits.memory=8Gi, limited: limits.memory=10Gi
```

Debug:

```bash
kubectl describe resourcequota -n namespace
```

Output shows:

```
Resource        Used  Hard
--------        ----  ----
limits.memory   8Gi   10Gi
pods            8     10
```

Solutions:
1. Reduce resources in your Pod spec
2. Delete other Pods
3. Increase quota (if you have permission)

```bash
# Option 1: Reduce requests
kubectl edit deployment myapp
# Change limits.memory from 2Gi to 1Gi

# Option 2: Scale down others
kubectl scale deployment other-app --replicas=0

# Check quota again
kubectl describe resourcequota -n namespace
```

---

### Section 4: LimitRange Defaults (2 min)
**[09:00-11:00]**

LimitRange sets defaults and constraints. Error example:

```
maximum memory usage per Container is 1Gi, but limit is 2Gi
```

Check LimitRange:

```bash
kubectl describe limitrange -n namespace
```

Shows:

```
Container:
  default:      memory: 512Mi, cpu: 500m
  defaultRequest: memory: 256Mi, cpu: 100m
  max:          memory: 1Gi, cpu: 1
  min:          memory: 128Mi, cpu: 50m
```

If your container doesn't specify resources, LimitRange applies defaults automatically. If you exceed max, requests are rejected.

---

### Section 5: Webhook and Gatekeeper Debugging (4 min)
**[11:00-15:00]**

Webhook error format:

```
Error from server: admission webhook "validate.app.io"
denied the request: you must provide labels: {"app", "version"}
```

Debug steps:

```bash
# 1. Check which constraints exist
kubectl get constraints --all-namespaces
kubectl get requiredlabels

# 2. Describe to see requirements
kubectl describe requiredlabels my-policy

# Look for:
# - Match: Which resources
# - Parameters: What's required
# - Violations: Current violations

# 3. Fix your YAML
metadata:
  labels:
    app: myapp
    version: "1.0"
```

For deployment failures, always check ReplicaSet:

```bash
kubectl get deploy myapp  # Shows 0/3 ready
kubectl describe deploy myapp  # May not show error
kubectl describe rs -l app=myapp  # Error is HERE
```

---

### Section 6: Common Scenarios and Quick Fixes (5 min)
**[15:00-20:00]**

**Scenario 1: Deployment not creating Pods**

```bash
kubectl get deploy myapp  # 0/3 ready
kubectl describe rs -l app=myapp
# See: "admission webhook denied the request"
```

Fix: Read error message, add required fields.

**Scenario 2: Pod Security violation**

```
violates PodSecurity "baseline": hostNetwork
```

Fix: Remove hostNetwork or change namespace policy.

**Scenario 3: ResourceQuota exceeded**

```bash
kubectl describe resourcequota -n namespace
# Shows: pods 10/10 (at limit)
```

Fix: Delete a Pod or scale down a deployment.

**Scenario 4: Missing required labels**

```
you must provide labels: {"app"}
```

Fix:

```yaml
metadata:
  labels:
    app: myapp
```

---

### Section 7: Exam Strategy (2 min)
**[20:00-22:00]**

**Checklist for admission issues:**

1. Deployment exists but no Pods? → Check ReplicaSet
2. Error mentions webhook? → Read message, fix specified field
3. Error mentions quota? → Check kubectl describe resourcequota
4. Error mentions PodSecurity? → Check namespace labels, adjust securityContext
5. Still stuck? → Check LimitRange, check events

**Time-saving commands:**

```bash
# Quick admission check
kubectl describe rs -l app=myapp | tail -20

# Check namespace policies
kubectl get ns namespace --show-labels

# Check quota status
kubectl describe resourcequota -n namespace

# Check all constraints
kubectl get constraints -A
```

**Common mistakes to avoid:**

1. Checking Deployment instead of ReplicaSet for admission errors
2. Not reading the full error message
3. Forgetting namespace-scoped policies
4. Not verifying quota after changes

Practice identifying admission errors in under 2 minutes. Move on quickly if stuck - don't let admission questions consume >5 minutes.

Good luck with CKAD!
