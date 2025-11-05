# Admission Control for CKAD

This document extends the [basic admission lab](README.md) with CKAD exam-specific scenarios and requirements.

## CKAD Exam Context

Admission control is typically covered at a conceptual level in CKAD. You need to:
- Understand what admission controllers are and when they run
- Recognize admission controller error messages
- Debug failures caused by admission policies
- Understand Pod Security Standards
- Work with existing admission policies (OPA Gatekeeper constraints)
- Know common built-in admission controllers

**Exam Tip:** You won't need to write custom admission webhooks, but you WILL need to troubleshoot apps that fail due to admission policies and understand error messages.

## What Are Admission Controllers?

Admission controllers are plugins that intercept requests to the Kubernetes API server **after authentication and authorization** but **before** objects are persisted.

### Request Flow

```
Client → Authentication → Authorization → Admission Controllers → Persistence (etcd)
                                            ↓
                                    [Mutating] → [Validating]
```

1. **Mutating Admission** - Can modify/mutate the object (runs first)
2. **Validating Admission** - Can accept or reject the object (runs after mutating)

### Why Admission Controllers Matter for CKAD

- **Enforce policies** - Security, resource limits, naming conventions
- **Set defaults** - Add missing fields automatically
- **Validate configurations** - Prevent invalid or dangerous configurations
- **Block deployment** - Your perfectly valid YAML might be rejected by policy

## Built-in Admission Controllers (CKAD Relevant)

You don't enable/disable these in the exam, but you should know what they do:

| Admission Controller | Purpose | CKAD Relevance |
|---------------------|---------|----------------|
| **NamespaceLifecycle** | Prevents objects in terminating/non-existent namespaces | Common error source |
| **LimitRanger** | Enforces LimitRange constraints | Resource management |
| **ResourceQuota** | Enforces ResourceQuota constraints | Namespace quotas |
| **ServiceAccount** | Automates ServiceAccount injection | Security context |
| **DefaultStorageClass** | Adds default storage class to PVCs | Storage |
| **PodSecurity** | Enforces Pod Security Standards | Security (important!) |
| **MutatingAdmissionWebhook** | Calls external webhooks to mutate objects | Policy enforcement |
| **ValidatingAdmissionWebhook** | Calls external webhooks to validate objects | Policy enforcement |

## Recognizing Admission Controller Errors

### Common Error Patterns

When you see these errors, it's an admission controller:

```
Error from server: admission webhook "..." denied the request: ...
```

```
Error creating: pods "..." is forbidden: failed quota: ... must specify limits.cpu
```

```
Error: failed to create pod: admission webhook "validate.nginx.ingress.kubernetes.io" denied
```

### Debugging Admission Failures

**Scenario:** You apply a Deployment but Pods aren't created.

```bash
# 1. Check Deployment
kubectl get deploy myapp
kubectl describe deploy myapp

# 2. Check ReplicaSet (admission errors often appear here)
kubectl get rs -l app=myapp
kubectl describe rs -l app=myapp

# Look for: "Error creating: admission webhook ... denied the request: ..."
```

📋 Deploy the whoami app and debug why it fails:

```bash
kubectl apply -f labs/admission/specs/whoami
```

<details>
  <summary>Solution</summary>

```bash
# Deployment creates, but Pods don't
kubectl get deploy whoami
# READY 0/2

# Check ReplicaSet events
kubectl describe rs -l app=whoami
# Error creating: admission webhook "servicetokenpolicy.courselabs.co"
# denied the request: automountServiceAccountToken must be set to false

# The admission controller is rejecting Pods without this field
# Fix: Update the Deployment to include automountServiceAccountToken: false
kubectl apply -f labs/admission/specs/whoami/fix
```

</details><br />

## Pod Security Standards (PSS)

Pod Security Standards replaced Pod Security Policies (deprecated in 1.21, removed in 1.25).

### Three Policy Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **Privileged** | Unrestricted, allows everything | Trusted system workloads |
| **Baseline** | Minimally restrictive, prevents known privilege escalations | Common applications |
| **Restricted** | Heavily restricted, follows Pod hardening best practices | Security-critical applications |

### Enforcement Modes

Applied at the **namespace level**:

| Mode | Behavior |
|------|----------|
| **enforce** | Policy violations reject the Pod |
| **audit** | Violations allowed but logged to audit log |
| **warn** | Violations allowed but warning returned to user |

### Applying Pod Security Standards

```bash
# Label namespace to enforce baseline standard
kubectl label namespace my-app pod-security.kubernetes.io/enforce=baseline

# Multiple modes can be used together
kubectl label namespace my-app \
  pod-security.kubernetes.io/enforce=baseline \
  pod-security.kubernetes.io/audit=restricted \
  pod-security.kubernetes.io/warn=restricted
```

### Common Baseline Restrictions

The **baseline** policy prevents:
- `hostNetwork: true`
- `hostPID: true`
- `hostIPC: true`
- `hostPath` volumes
- `privileged: true` containers
- Capability additions (except safe ones)

### Common Restricted Restrictions

The **restricted** policy additionally requires:
- `runAsNonRoot: true`
- Dropped ALL capabilities
- `seccompProfile` set
- No privilege escalation

### CKAD Scenario: Pod Security Standard Violation

```bash
# Create namespace with baseline enforcement
kubectl create namespace secure-app
kubectl label namespace secure-app pod-security.kubernetes.io/enforce=baseline

# Try to create a privileged pod
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: privileged-pod
  namespace: secure-app
spec:
  containers:
  - name: nginx
    image: nginx
    securityContext:
      privileged: true
EOF
```

You'll get an error like:
```
Error from server (Forbidden): error when creating "STDIN": pods "privileged-pod" is forbidden:
violates PodSecurity "baseline:latest": privileged (container "nginx" must not set
securityContext.privileged=true)
```

📋 Create a namespace with `restricted` enforcement and try to run a basic nginx pod.

<details>
  <summary>Solution</summary>

```bash
# Create namespace with restricted policy
kubectl create namespace restricted-ns
kubectl label namespace restricted-ns pod-security.kubernetes.io/enforce=restricted

# Try basic nginx (will fail)
kubectl run nginx --image=nginx -n restricted-ns
# Error: violates PodSecurity "restricted:latest": allowPrivilegeEscalation != false
# runAsNonRoot != true...

# Fix: Create Pod with proper security context
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  namespace: restricted-ns
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: nginx
    image: nginx:alpine
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
EOF
```

Note: nginx:alpine might still fail if the image runs as root. You may need a non-root image.

</details><br />

## ResourceQuota Admission Control

ResourceQuota is an admission controller that enforces namespace quotas.

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: dev
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "10"
```

### Quota Violation Errors

```bash
# When quota is exceeded, you see:
Error from server (Forbidden): pods "myapp-xxxx" is forbidden:
exceeded quota: compute-quota, requested: limits.memory=4Gi,
used: limits.memory=6Gi, limited: limits.memory=8Gi
```

### Debugging Quota Issues

```bash
# Check quota status
kubectl describe resourcequota -n dev

# Shows:
# Resource        Used  Hard
# --------        ----  ----
# limits.memory   6Gi   8Gi
# pods            8     10

# To fix: Delete some pods or increase quota
```

📋 Create a namespace with a quota of 2 pods, deploy 3 pods, and observe the error.

<details>
  <summary>Solution</summary>

```bash
# Create namespace with pod quota
kubectl create namespace quota-test
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: pod-quota
  namespace: quota-test
spec:
  hard:
    pods: "2"
EOF

# Try to create 3 pods
kubectl run pod1 --image=nginx -n quota-test
kubectl run pod2 --image=nginx -n quota-test
kubectl run pod3 --image=nginx -n quota-test

# Third pod fails
# Error from server (Forbidden): pods "pod3" is forbidden:
# exceeded quota: pod-quota, requested: pods=1, used: pods=2, limited: pods=2

# Check quota
kubectl describe resourcequota pod-quota -n quota-test
```

</details><br />

## LimitRange Admission Control

LimitRange enforces default limits and min/max constraints.

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: mem-limit-range
spec:
  limits:
  - default:          # Default limits
      memory: 512Mi
      cpu: 500m
    defaultRequest:   # Default requests
      memory: 256Mi
      cpu: 100m
    max:              # Maximum allowed
      memory: 1Gi
      cpu: 1
    min:              # Minimum required
      memory: 128Mi
      cpu: 50m
    type: Container
```

### LimitRange Violation Errors

```bash
# When you exceed max:
Error from server (Forbidden): pods "big-pod" is forbidden:
maximum memory usage per Container is 1Gi, but limit is 2Gi
```

### Debugging LimitRange Issues

```bash
# Check LimitRange
kubectl describe limitrange mem-limit-range

# Shows defaults, min, max for resources
```

## OPA Gatekeeper (Practical CKAD Usage)

In CKAD, you won't create Gatekeeper policies, but you may need to work with existing ones.

### Understanding Gatekeeper Constraints

```bash
# List constraint templates (the policy definitions)
kubectl get constrainttemplates

# List specific constraints (policy instances)
kubectl get requiredlabels
kubectl get k8srequiredlabels  # Common convention

# Describe to see violations
kubectl describe requiredlabels my-policy
```

### Gatekeeper Error Messages

```
Error from server ([my-policy] you must provide labels: {"app", "owner"}):
error when creating "pod.yaml": admission webhook "validation.gatekeeper.sh"
denied the request
```

### Debugging Gatekeeper Violations

```bash
# 1. Check which constraints exist
kubectl get constraints --all-namespaces

# 2. Describe the constraint to understand requirements
kubectl describe <constraint-type> <constraint-name>

# Look for:
# - Match: Which resources this applies to
# - Parameters: What's required/restricted
# - Violations: Current violations (helpful!)

# 3. Fix your YAML to meet requirements
```

📋 Given a Gatekeeper constraint requiring `app` and `version` labels, deploy a compliant pod.

<details>
  <summary>Solution</summary>

```bash
# Assume constraint exists requiring app and version labels

# Check constraint
kubectl get requiredlabels
kubectl describe requiredlabels my-policy

# Create compliant pod
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  labels:
    app: myapp
    version: "1.0"
spec:
  containers:
  - name: nginx
    image: nginx
EOF
```

</details><br />

## Common CKAD Scenarios

### Scenario 1: Deployment Not Creating Pods

**Symptom:** Deployment exists, ReplicaSet exists, but no Pods.

```bash
kubectl get deploy myapp  # 0/3 ready
kubectl get rs -l app=myapp  # 0 desired pods

# Check ReplicaSet events
kubectl describe rs -l app=myapp
# Look for admission webhook errors
```

**Common Causes:**
- Validating webhook rejecting Pods
- ResourceQuota exceeded
- LimitRange violation
- Pod Security Standard violation

### Scenario 2: Pod Security Standard Error

**Error:**
```
violates PodSecurity "baseline:latest": hostNetwork (pod must not set
spec.securityContext.hostNetwork=true)
```

**Fix:**
```yaml
# Remove or set to false
spec:
  hostNetwork: false  # or remove this line
```

### Scenario 3: ResourceQuota Error

**Error:**
```
exceeded quota: compute-quota, requested: limits.cpu=2, used: limits.cpu=3, limited: limits.cpu=4
```

**Fix Options:**
1. Reduce resource requests in your Pods
2. Delete other Pods in the namespace
3. Increase the quota (if you have permission)

```bash
# Check current usage
kubectl describe resourcequota -n namespace

# Option 1: Scale down other deployments
kubectl scale deploy other-app --replicas=0 -n namespace
```

### Scenario 4: Missing Required Labels (Gatekeeper)

**Error:**
```
admission webhook "validation.gatekeeper.sh" denied the request:
you must provide labels: {"app"}
```

**Fix:**
```yaml
metadata:
  labels:
    app: myapp  # Add missing label
```

## Troubleshooting Checklist

When a resource won't create:

1. **Check the object status**
   ```bash
   kubectl get <resource-type> <name>
   kubectl describe <resource-type> <name>
   ```

2. **For Deployments, check ReplicaSets**
   ```bash
   kubectl describe rs -l app=<app-label>
   ```

3. **Look for admission webhook errors** in events
   - Format: `admission webhook "..." denied the request: ...`

4. **Check namespace labels** for Pod Security Standards
   ```bash
   kubectl get namespace <ns> --show-labels
   ```

5. **Check ResourceQuotas**
   ```bash
   kubectl describe resourcequota -n <namespace>
   ```

6. **Check LimitRanges**
   ```bash
   kubectl describe limitrange -n <namespace>
   ```

7. **Check Gatekeeper constraints**
   ```bash
   kubectl get constraints --all-namespaces
   ```

8. **Read the error message carefully** - it usually tells you exactly what's wrong

## Advanced Topics

TODO: Add sections on:
- Custom Resource Definitions with validation
- Admission webhook failure policies (Ignore vs Fail)
- Namespace selectors in webhooks
- Audit annotations
- Dry-run with admission controllers
- Common Gatekeeper ConstraintTemplates (library)

## Common CKAD Pitfalls

1. **Ignoring ReplicaSet events** - Admission errors often appear here, not on Deployment
2. **Not checking namespace labels** - Pod Security Standards are namespace-scoped
3. **Assuming YAML is valid** - Admission controllers add runtime checks beyond schema validation
4. **Not reading error messages** - They're usually very specific about what's wrong
5. **Forgetting ResourceQuota applies at creation** - Existing pods aren't affected by new quotas
6. **Not checking constraint violations** - `describe` on Gatekeeper constraints shows current violations
7. **Missing securityContext** - Restricted Pod Security Standard requires many security fields
8. **Debugging wrong object** - For Deployments, check ReplicaSet; for StatefulSets, check Pods
9. **Not considering defaults** - LimitRange and mutating webhooks can add fields automatically
10. **Webhook timeout** - If webhook is down, object creation may hang or fail

## Quick Reference

### Check Admission Status

```bash
# Check Pod Security Standards on namespace
kubectl get namespace <ns> --show-labels | grep pod-security

# Check ResourceQuota
kubectl describe resourcequota -n <namespace>

# Check LimitRange
kubectl describe limitrange -n <namespace>

# Check Gatekeeper constraints
kubectl get constraints --all-namespaces

# Check for webhook configs
kubectl get validatingwebhookconfigurations
kubectl get mutatingwebhookconfigurations
```

### Apply Pod Security Standards

```bash
# Enforce baseline
kubectl label namespace <ns> pod-security.kubernetes.io/enforce=baseline

# Enforce restricted
kubectl label namespace <ns> pod-security.kubernetes.io/enforce=restricted

# Warn only (don't enforce)
kubectl label namespace <ns> pod-security.kubernetes.io/warn=baseline

# Audit mode
kubectl label namespace <ns> pod-security.kubernetes.io/audit=baseline
```

### Debug Admission Failures

```bash
# For Deployments
kubectl describe deploy <name>
kubectl describe rs -l app=<label>

# For Pods
kubectl describe pod <name>

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Check quota usage
kubectl describe resourcequota -n <namespace>
```

## Practice Exercises

### Exercise 1: Debug Admission Failure

Given:
- A Deployment that creates a ReplicaSet but no Pods
- An unknown admission policy in place

Tasks:
1. Identify the admission controller blocking the Pods
2. Read the error message to understand requirements
3. Fix the Deployment to pass admission

TODO: Add step-by-step solution

### Exercise 2: Pod Security Standard

Tasks:
1. Create namespace `secure-app`
2. Apply `baseline` enforcement
3. Try to deploy a pod with `hostNetwork: true` (should fail)
4. Deploy a compliant pod
5. Change to `restricted` enforcement
6. Fix the pod to meet restricted requirements

TODO: Add detailed solution

### Exercise 3: ResourceQuota Troubleshooting

Given:
- Namespace with ResourceQuota
- Deployment that partially scales

Tasks:
1. Identify why only some pods are created
2. Check quota usage
3. Fix by adjusting resources or quota

TODO: Add solution

## Exam Tips

1. **Read error messages carefully** - They tell you exactly what's wrong
2. **Check ReplicaSet events for Deployments** - Admission errors appear there
3. **Know Pod Security Standard levels** - privileged, baseline, restricted
4. **Understand ResourceQuota is namespace-scoped**
5. **LimitRange provides defaults** - You might not need to specify limits
6. **Gatekeeper errors start with constraint name** - Look for it in describe
7. **Practice without admission controllers first** - Then add policies
8. **Use dry-run to test** - `kubectl apply --dry-run=server` catches admission errors
9. **Check namespace labels** - Pod Security Standards are set there
10. **Don't write webhook code** - Focus on using/debugging existing policies

## Cleanup

```bash
# Remove Gatekeeper constraints
kubectl delete constraints --all

# Remove constraint templates
kubectl delete constrainttemplates --all

# Remove OPA Gatekeeper
kubectl delete -f labs/admission/specs/opa-gatekeeper

# Remove custom webhooks
kubectl delete validatingwebhookconfigurations --all
kubectl delete mutatingwebhookconfigurations --all

# Clean up namespaces
kubectl delete namespace <test-namespaces>
```

## Next Steps

After understanding admission control for CKAD:
1. Practice [RBAC](../rbac/) - Works with admission for complete security
2. Review [Namespaces](../namespaces/) - ResourceQuota and LimitRange are namespace-scoped
3. Study [SecurityContext](../productionizing/) - Required for Pod Security Standards
4. Practice troubleshooting workflows - Admission errors are common

---

## Study Checklist for CKAD

- [ ] Understand admission controller request flow
- [ ] Recognize admission webhook error message format
- [ ] Know the three Pod Security Standard levels
- [ ] Apply Pod Security Standards to namespaces (labels)
- [ ] Debug Deployment admission failures via ReplicaSet events
- [ ] Check and interpret ResourceQuota status
- [ ] Understand LimitRange defaults and constraints
- [ ] List and describe Gatekeeper constraints
- [ ] Read admission error messages and fix YAML accordingly
- [ ] Use kubectl describe to find admission failures
- [ ] Know common baseline restrictions (no hostNetwork, etc.)
- [ ] Know common restricted requirements (runAsNonRoot, etc.)
- [ ] Check namespace labels for policies
- [ ] Understand quota is enforced at creation time
- [ ] Practice with dry-run to catch admission errors early
