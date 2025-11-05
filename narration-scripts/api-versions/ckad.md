# API Versions - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-20 minutes)

---

### Section 1: CKAD Exam Relevance (2 min)
**[00:00-02:00]**

Welcome to CKAD exam preparation for Kubernetes API versions and deprecations. This topic appears directly in exam scenarios and is critical for troubleshooting.

You'll encounter API version questions in several forms:
- Identifying the correct API version for a resource type
- Fixing manifests that use deprecated APIs
- Converting resources to current versions
- Troubleshooting "no matches for kind" errors

Time allocation: Spend no more than 3-4 minutes on API version questions. These are usually quick wins if you know the commands.

Essential commands to memorize:
```bash
kubectl api-resources | grep <resource>
kubectl api-versions
kubectl explain <resource>
kubectl convert -f <file> --output-version <version>
```

Let's practice these systematically.

---

### Section 2: Finding Current API Versions (3 min)
**[02:00-05:00]**

Scenario: "What API version should be used for creating an Ingress resource?"

Quick solution:
```bash
kubectl api-resources | grep ingress
```

Output shows: `ingresses networking.k8s.io/v1 true Ingress`

The answer is networking.k8s.io/v1. This command works for any resource type.

Common CKAD resources and their current versions:
```bash
kubectl api-resources | grep -E "^(deployments|services|pods|ingress|cronjob|job|configmap|secret)"
```

Memorize these patterns:
- **Core resources** (Pod, Service, ConfigMap, Secret): `v1`
- **Workloads** (Deployment, StatefulSet, DaemonSet): `apps/v1`
- **Jobs** (Job, CronJob): `batch/v1`
- **Networking** (Ingress, NetworkPolicy): `networking.k8s.io/v1`
- **Policy** (PodDisruptionBudget): `policy/v1`

Practice drill:
```bash
# Find API version for each
kubectl api-resources | grep deployment
kubectl api-resources | grep cronjob
kubectl api-resources | grep ingress
kubectl api-resources | grep poddisruptionbudget
```

Time yourself - you should complete this in under 30 seconds per resource.

---

### Section 3: Fixing Deprecated API Errors (4 min)
**[05:00-09:00]**

Scenario: "A deployment fails with error: no matches for kind Ingress in version networking.k8s.io/v1beta1. Fix it."

This is a deprecated API error. Here's the systematic approach:

```bash
# Step 1: Identify current version (15 seconds)
kubectl api-resources | grep ingress

# Step 2: Get the failing resource if it exists
kubectl get ingress myapp -o yaml > ingress.yaml

# Step 3: Edit the apiVersion field
vi ingress.yaml
# Change: apiVersion: networking.k8s.io/v1beta1
# To: apiVersion: networking.k8s.io/v1

# Step 4: Check for schema changes with explain
kubectl explain ingress.spec.rules.http.paths

# Step 5: Update required fields (v1 Ingress requires pathType)
# Add: pathType: Prefix (or Exact)

# Step 6: Apply
kubectl apply -f ingress.yaml
```

Common deprecated APIs you might encounter:

**Deployment (extensions/v1beta1 → apps/v1)**
```yaml
# OLD
apiVersion: extensions/v1beta1
kind: Deployment

# NEW
apiVersion: apps/v1
kind: Deployment
spec:
  selector:  # Now required
    matchLabels:
      app: myapp
```

**Ingress (networking.k8s.io/v1beta1 → networking.k8s.io/v1)**
```yaml
# OLD
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
spec:
  rules:
  - http:
      paths:
      - path: /
        backend:
          serviceName: myapp
          servicePort: 80

# NEW
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix  # Required
        backend:
          service:  # Structure changed
            name: myapp
            port:
              number: 80
```

**CronJob (batch/v1beta1 → batch/v1)**
```yaml
# Just change version, schema is compatible
apiVersion: batch/v1  # Changed from batch/v1beta1
kind: CronJob
```

Practice: Fix these broken manifests in under 2 minutes each.

---

### Section 4: Using kubectl explain Efficiently (3 min)
**[09:00-12:00]**

kubectl explain is your on-demand documentation. Use it to verify API structure without leaving the terminal.

Basic usage:
```bash
kubectl explain deployment
kubectl explain deployment.spec
kubectl explain deployment.spec.template
```

Find required fields:
```bash
kubectl explain deployment.spec --recursive
```

Scroll through output to see all fields. Required fields are typically mentioned in the description.

Exam-specific patterns:

**Quick schema verification:**
```bash
# What fields does an Ingress path need?
kubectl explain ingress.spec.rules.http.paths

# Output shows pathType is required in v1
```

**Compare API versions:**
```bash
kubectl explain ingress --api-version=networking.k8s.io/v1
```

**Find field types:**
```bash
kubectl explain deployment.spec.replicas
# Shows: TYPE: integer
```

Time-saving trick: Pipe to grep
```bash
kubectl explain deployment.spec --recursive | grep -E "selector|replicas|strategy"
```

Practice drill: Use explain to answer these in under 30 seconds each:
1. What type is deployment.spec.replicas?
2. Is ingress.spec.rules.http.paths.pathType required?
3. What are valid values for pathType?

---

### Section 5: Quick Migration Patterns (3 min)
**[12:00-15:00]**

When you need to update a resource's API version quickly:

**Pattern 1: In-place edit**
```bash
kubectl get deployment myapp -o yaml > temp.yaml
sed -i 's|extensions/v1beta1|apps/v1|' temp.yaml
# Add required fields if needed
kubectl apply -f temp.yaml
```

**Pattern 2: Using kubectl convert (if available)**
```bash
kubectl convert -f old-manifest.yaml --output-version apps/v1 > new-manifest.yaml
kubectl apply -f new-manifest.yaml
```

**Pattern 3: Recreate from imperative command**
```bash
# Get key details first
kubectl get deployment myapp -o yaml

# Delete and recreate
kubectl delete deployment myapp
kubectl create deployment myapp --image=nginx:latest --replicas=3

# Reapply customizations
kubectl set env deployment/myapp VAR=value
kubectl set resources deployment/myapp --requests=cpu=100m,memory=128Mi
```

**Pattern 4: For simple API version changes**
```bash
kubectl edit deployment myapp
# Change apiVersion in editor, save and exit
# Kubernetes applies immediately
```

Choose based on complexity:
- Simple version change only → kubectl edit
- Multiple resources → sed with kubectl apply
- Schema changes → kubectl convert or manual edit
- Complex customizations → recreate from imperative

Practice: Migrate a Deployment from extensions/v1beta1 to apps/v1 in under 2 minutes.

---

### Section 6: Troubleshooting Decision Tree (2 min)
**[15:00-17:00]**

Use this mental flowchart for API version errors:

```
See "no matches for kind X in version Y"?
├─ Yes → API version issue
│  ├─ Run: kubectl api-resources | grep X
│  ├─ Update apiVersion in YAML
│  ├─ Run: kubectl explain X.spec
│  ├─ Check for required fields
│  └─ Apply updated YAML
│
└─ No → Different error type
```

Common error messages and fixes:

**Error 1:**
```
no matches for kind "Ingress" in version "networking.k8s.io/v1beta1"
```
Fix: Change to networking.k8s.io/v1 and add pathType

**Error 2:**
```
error validating data: ValidationError(Deployment.spec): missing required field "selector"
```
Fix: The apps/v1 Deployment requires spec.selector.matchLabels

**Error 3:**
```
Unknown field "serviceName" in Ingress backend
```
Fix: v1 Ingress uses service.name instead of serviceName

Speed check: When you see an API error, you should:
1. Identify it's an API issue (5 sec)
2. Find correct version (15 sec)
3. Check schema with explain (30 sec)
4. Update and apply (60 sec)

Total: ~110 seconds maximum.

---

### Section 7: Exam Tips and Practice Scenarios (3 min)
**[17:00-20:00]**

**Tip 1:** Memorize common current versions
- apps/v1, batch/v1, networking.k8s.io/v1, policy/v1, v1

**Tip 2:** Use api-resources, not documentation
- Faster than searching docs
- Always shows your cluster's versions

**Tip 3:** kubectl explain is your friend
- No internet needed
- Shows exact structure required

**Tip 4:** Test with --dry-run
```bash
kubectl apply -f manifest.yaml --dry-run=server
```
This catches API errors without applying.

**Tip 5:** Don't overthink
- If it says wrong API version, fix the API version
- Use kubectl api-resources to find the right one
- Move on quickly

**Practice Scenario 1:** (4 minutes)
"Update this Ingress to use the current API version and make it work."

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        backend:
          serviceName: app-service
          servicePort: 80
```

Solution:
```bash
# Check current version
kubectl api-resources | grep ingress

# Fix the YAML
apiVersion: networking.k8s.io/v1  # Updated
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix  # Added - required in v1
        backend:
          service:  # Changed structure
            name: app-service
            port:
              number: 80
```

Time yourself. With practice, this should take under 2 minutes.

**Final Exam Strategy:**
- Read question carefully - create or fix?
- For create: Use current stable versions
- For fix: Use kubectl api-resources first
- Don't spend >4 minutes on API questions
- Move on if stuck, flag for review

Good luck with your CKAD exam!
