# Namespaces - CKAD Exam Preparation
## Narration Script for Exam-Focused Training
**Duration:** 15-20 minutes

---

## Introduction (0:00 - 1:00)

"Welcome to CKAD exam preparation for Namespaces. This topic appears frequently in the exam, both directly and as a requirement for other tasks."

"Key exam context:
- Questions often specify which namespace to use
- You'll switch namespaces many times during the exam
- Some questions test namespace isolation and resource quotas
- Cross-namespace communication is a common scenario
- Missing the namespace is one of the most common mistakes"

"In the next 15-20 minutes, we'll cover:
- Fast namespace creation and switching
- Resource quota scenarios
- Cross-namespace service discovery
- Time-saving techniques
- Practice exercises"

**Setup:**
```bash
# Essential aliases for speed
alias k=kubectl
alias kn='kubectl config set-context --current --namespace'

# Verify current namespace
k config view --minify | grep namespace
```

---

## Section 1: Imperative Namespace Commands (1:00 - 4:00)

### Speed Technique #1: Quick Creation (1:00 - 2:00)

"The fastest way to create a namespace:"

```bash
# Create namespace imperatively
kubectl create namespace ckad-practice

# Verify creation
kubectl get ns ckad-practice
```

"That's it! Much faster than writing YAML."

**Generate YAML if needed:**
```bash
kubectl create namespace exam-ns --dry-run=client -o yaml > ns.yaml
```

"But in the exam, imperative creation is almost always faster unless you need specific labels or annotations."

### Speed Technique #2: Context Switching (2:00 - 3:00)

"Two methods to work in a namespace:"

**Method 1: Using -n flag**
```bash
kubectl get pods -n ckad-practice
kubectl run nginx --image=nginx -n ckad-practice
```

"Pros: Explicit, no confusion
Cons: More typing, easy to forget"

**Method 2: Change context**
```bash
kubectl config set-context --current --namespace ckad-practice

# Now all commands use ckad-practice
kubectl get pods
kubectl run nginx --image=nginx
```

"Pros: Less typing, cleaner
Cons: Can forget which namespace you're in"

### Exam Strategy Decision (3:00 - 4:00)

"My recommendation:
- **Use context switching** when a question focuses on one namespace
- **Use -n flag** when jumping between namespaces in a single question
- **Always verify** your namespace before critical operations"

**Quick verification:**
```bash
# See current namespace
kubectl config view --minify | grep namespace

# Or use alias
alias kcn='kubectl config view --minify | grep namespace'
```

"Practice both methods. Use what feels natural under pressure."

---

## Section 2: Resource Quotas (4:00 - 8:00)

### Understanding Quota Requirements (4:00 - 5:00)

"Critical exam knowledge: When a namespace has ResourceQuota for CPU or memory, **every Pod must specify resource requests and limits**."

"This catches many candidates:"

```bash
# Create namespace with quota
kubectl create namespace quota-test

cat << EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: quota-test
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
    pods: "5"
EOF
```

### The Problem (5:00 - 6:00)

"Now try to create a Pod without resources:"

```bash
kubectl -n quota-test run nginx --image=nginx
```

"It fails! Check the events:"

```bash
kubectl -n quota-test get events --sort-by='.lastTimestamp'
```

"Error: 'failed quota: compute-quota: must specify limits.cpu, limits.memory, requests.cpu, requests.memory'"

### The Solution (6:00 - 7:00)

"Always specify resources when quotas exist:"

```bash
kubectl -n quota-test run nginx --image=nginx \
  --requests=cpu=100m,memory=128Mi \
  --limits=cpu=200m,memory=256Mi
```

"Or with YAML:"

```bash
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  namespace: quota-test
spec:
  containers:
  - name: nginx
    image: nginx
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "200m"
        memory: "256Mi"
EOF
```

### Checking Quota Usage (7:00 - 8:00)

"Verify the quota is being tracked:"

```bash
kubectl describe quota compute-quota -n quota-test
```

"Output shows:
- Hard limits: Maximum allowed
- Used: Currently consumed
- Remaining capacity"

**Exam tip:** "If Pods won't start, check for quotas with `kubectl describe quota -n <namespace>`. This saves minutes of debugging."

---

## Section 3: Cross-Namespace Communication (8:00 - 11:00)

### DNS Patterns (8:00 - 9:00)

"Services are namespace-scoped, but DNS allows cross-namespace access."

**Three DNS formats:**

```bash
# 1. Short name (same namespace only)
service-name

# 2. Namespace-qualified (cross-namespace)
service-name.namespace

# 3. FQDN (complete, unambiguous)
service-name.namespace.svc.cluster.local
```

### Exam Scenario: Multi-Namespace App (9:00 - 10:30)

"Common exam task: Deploy frontend and backend in different namespaces."

```bash
# Create namespaces
kubectl create namespace backend
kubectl create namespace frontend

# Deploy backend
kubectl -n backend run db --image=nginx --port=80
kubectl -n backend expose pod db --port=80

# Deploy frontend
kubectl -n frontend run web --image=busybox --command -- sleep 3600
```

"Now test connectivity from frontend to backend:"

```bash
# This fails - wrong namespace
kubectl -n frontend exec web -- nslookup db

# This works - namespace-qualified
kubectl -n frontend exec web -- nslookup db.backend

# This works - FQDN
kubectl -n frontend exec web -- nslookup db.backend.svc.cluster.local

# Test actual HTTP access
kubectl -n frontend exec web -- wget -qO- http://db.backend
```

### ConfigMap Scoping Challenge (10:30 - 11:00)

"Important limitation: ConfigMaps and Secrets cannot be referenced across namespaces."

"If the exam asks you to configure cross-namespace communication:
- Create the ConfigMap in the SAME namespace as the Pod
- Store the FQDN service name in the ConfigMap
- The Pod references the local ConfigMap
- The service name points to the other namespace"

**Example:**
```bash
kubectl -n frontend create configmap backend-config \
  --from-literal=BACKEND_URL=http://db.backend.svc.cluster.local
```

"ConfigMap is in frontend namespace (where the Pod is), but the URL points to backend namespace."

---

## Section 4: Common Exam Patterns (11:00 - 15:00)

### Pattern 1: Namespace Isolation (11:00 - 12:00)

"Task: Deploy the same application in dev and prod namespaces with different configurations."

```bash
# Create namespaces
kubectl create namespace dev
kubectl create namespace prod

# Deploy to dev
kubectl -n dev run web --image=nginx --env="ENV=development"
kubectl -n dev expose pod web --port=80

# Deploy to prod (identical name, different namespace)
kubectl -n prod run web --image=nginx --env="ENV=production"
kubectl -n prod expose pod web --port=80

# Verify isolation
kubectl get pods -A -l run=web
```

"Same Pod name, same service name, but isolated in different namespaces."

### Pattern 2: Resource Quota Enforcement (12:00 - 13:00)

"Task: Create a namespace with quota that limits it to 3 Pods and 1 CPU core total."

```bash
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: limited
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: limits
  namespace: limited
spec:
  hard:
    pods: "3"
    requests.cpu: "1"
    limits.cpu: "2"
EOF
```

"Try to deploy 4 Pods:"

```bash
# These will succeed (1-3)
kubectl -n limited run pod1 --image=nginx \
  --requests=cpu=100m --limits=cpu=200m

kubectl -n limited run pod2 --image=nginx \
  --requests=cpu=100m --limits=cpu=200m

kubectl -n limited run pod3 --image=nginx \
  --requests=cpu=100m --limits=cpu=200m

# This will fail (4th pod)
kubectl -n limited run pod4 --image=nginx \
  --requests=cpu=100m --limits=cpu=200m

# Check why
kubectl -n limited get events --sort-by='.lastTimestamp'
```

### Pattern 3: ServiceAccount in Namespace (13:00 - 14:00)

"ServiceAccounts are namespace-scoped. Common exam task:"

```bash
# Create namespace
kubectl create namespace app-space

# Create ServiceAccount
kubectl create serviceaccount app-sa -n app-space

# Create Pod using that ServiceAccount
kubectl -n app-space run app-pod --image=nginx \
  --serviceaccount=app-sa

# Verify
kubectl describe pod app-pod -n app-space | grep -i serviceaccount
```

**Exam tip:** "If a question asks for a Pod with a specific ServiceAccount, the SA must exist in the same namespace as the Pod."

### Pattern 4: Bulk Operations (14:00 - 15:00)

"Working with resources across namespaces:"

```bash
# Get all Pods in all namespaces
kubectl get pods -A

# Get specific resource type across all namespaces
kubectl get deployments -A

# Get resources with label across all namespaces
kubectl get svc -A -l app=web

# Delete all Pods in a specific namespace
kubectl delete pods --all -n dev

# Delete a namespace and everything in it
kubectl delete namespace dev
```

**Exam warning:** "Be very careful with namespace deletion. It's immediate and irreversible!"

---

## Section 5: Time-Saving Techniques (15:00 - 17:00)

### Quick Reference Commands (15:00 - 16:00)

**Namespace operations:**
```bash
# Create
kubectl create ns <name>

# List
kubectl get ns

# Describe (shows quotas if any)
kubectl describe ns <name>

# Delete (WARNING!)
kubectl delete ns <name>

# Check current namespace
kubectl config view --minify | grep namespace
```

**Context operations:**
```bash
# Set namespace in current context
kubectl config set-context --current --namespace <name>

# View current context details
kubectl config get-contexts

# See full context config
kubectl config view --minify
```

**Resource quotas:**
```bash
# List quotas in namespace
kubectl get quota -n <namespace>

# Describe specific quota
kubectl describe quota <name> -n <namespace>

# Delete quota
kubectl delete quota <name> -n <namespace>
```

### Helpful Aliases (16:00 - 17:00)

"Set these up at the start of your exam:"

```bash
# Basic kubectl alias
alias k=kubectl

# Namespace switcher
alias kn='kubectl config set-context --current --namespace'

# Show current namespace
alias kcn='kubectl config view --minify | grep namespace'

# Common flags
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
```

"Usage examples:"
```bash
k get pods
kn production
kcn
k create deployment web --image=nginx $do
```

---

## Section 6: Practice Exercises (17:00 - 20:00)

### Exercise 1: Quick Setup (17:00 - 18:00)

"Timed exercise - 2 minutes:"

**Task:** "Create a namespace called 'practice', switch to it, create a Pod named 'test' running nginx, verify it's running, then switch back to default."

**Timer starts...**

<details>
<summary>Solution</summary>

```bash
kubectl create namespace practice
kubectl config set-context --current --namespace practice
kubectl run test --image=nginx
kubectl get pods
kubectl wait --for=condition=ready pod/test
kubectl config set-context --current --namespace default
```
</details>

### Exercise 2: Quota Challenge (18:00 - 19:00)

"Timed exercise - 3 minutes:"

**Task:** "Create a namespace 'restricted' with a ResourceQuota limiting it to 2 Pods, 500m CPU, and 512Mi memory. Deploy two nginx Pods that fit within this quota. Attempt a third Pod and explain why it fails."

**Timer starts...**

<details>
<summary>Solution</summary>

```bash
# Create namespace
kubectl create namespace restricted

# Create quota
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: restrictions
  namespace: restricted
spec:
  hard:
    pods: "2"
    requests.cpu: "500m"
    requests.memory: 512Mi
    limits.cpu: "1"
    limits.memory: 1Gi
EOF

# Deploy first Pod
kubectl -n restricted run nginx1 --image=nginx \
  --requests=cpu=100m,memory=128Mi \
  --limits=cpu=200m,memory=256Mi

# Deploy second Pod
kubectl -n restricted run nginx2 --image=nginx \
  --requests=cpu=100m,memory=128Mi \
  --limits=cpu=200m,memory=256Mi

# Try third Pod (will fail - pod count quota)
kubectl -n restricted run nginx3 --image=nginx \
  --requests=cpu=100m,memory=128Mi \
  --limits=cpu=200m,memory=256Mi

# Check quota
kubectl describe quota restrictions -n restricted
```

Explanation: "Pod limit of 2 has been reached."
</details>

### Exercise 3: Cross-Namespace Communication (19:00 - 20:00)

"Timed exercise - 3 minutes:"

**Task:** "Create namespace 'api' with a Pod named 'backend' running nginx on port 80, expose it as a service. Create namespace 'web' with a Pod named 'frontend' running busybox (sleep 3600). From the frontend Pod, successfully access the backend service using its FQDN."

**Timer starts...**

<details>
<summary>Solution</summary>

```bash
# Create namespaces
kubectl create namespace api
kubectl create namespace web

# Deploy backend
kubectl -n api run backend --image=nginx --port=80
kubectl -n api expose pod backend --port=80

# Deploy frontend
kubectl -n web run frontend --image=busybox --command -- sleep 3600

# Wait for Pods to be ready
kubectl wait --for=condition=ready pod/backend -n api
kubectl wait --for=condition=ready pod/frontend -n web

# Test connectivity
kubectl -n web exec frontend -- nslookup backend.api.svc.cluster.local
kubectl -n web exec frontend -- wget -qO- http://backend.api
```
</details>

---

## Section 7: Exam Strategy and Checklist (20:00 - 21:00)

### Time Management

"For namespace-related questions:
- Simple namespace creation: 15-30 seconds
- Creating with ResourceQuota: 2-3 minutes
- Cross-namespace deployment: 3-5 minutes
- Debugging quota issues: 2-3 minutes"

### Pre-Exam Checklist

**Commands to memorize:**
```bash
# Create namespace
kubectl create namespace <name>

# Switch namespace
kubectl config set-context --current --namespace <name>

# Create with resources
kubectl run <name> --image=<image> \
  --requests=cpu=100m,memory=128Mi \
  --limits=cpu=200m,memory=256Mi

# Cross-namespace service access
<service>.<namespace>.svc.cluster.local
```

**Common exam pitfalls:**
1. ✗ Forgetting which namespace you're in
2. ✗ Not specifying resources when quotas exist
3. ✗ Using short service names across namespaces
4. ✗ Trying to reference ConfigMaps across namespaces
5. ✗ Not verifying namespace before operations

**Success checklist:**
1. ✓ Set up aliases at exam start
2. ✓ Always verify current namespace
3. ✓ Use context switching for focused work
4. ✓ Check for ResourceQuotas if Pods won't start
5. ✓ Use FQDNs for cross-namespace services
6. ✓ Practice rapid namespace creation and switching

---

## Cleanup (21:00)

```bash
# Clean up practice resources
kubectl delete namespace ckad-practice quota-test backend frontend \
  limited app-space practice restricted api web
```

---

## Final Tips

"Three keys to namespace success in CKAD:

1. **Awareness:** Always know which namespace you're in. Make it muscle memory to check.

2. **Speed:** Master imperative commands. Create namespaces in seconds, not minutes.

3. **Understanding:** Know what's namespace-scoped vs cluster-scoped. Know when resources can cross namespace boundaries.

Namespaces appear in almost every CKAD exam question - either explicitly or implicitly. Get comfortable with them, and you'll save time throughout the entire exam.

Good luck!"

---

## Additional Practice Recommendations

Practice these scenarios daily until the exam:

1. **Speed drill:** Create 5 namespaces, deploy a Pod in each, verify all running - under 5 minutes

2. **Quota mastery:** Set up namespace with quotas, deploy Pods that fit, attempt to exceed, explain errors - under 3 minutes

3. **Context switching:** Switch between 3 namespaces, perform operations in each, switch back to default - under 2 minutes

4. **Cross-namespace comms:** Deploy multi-tier app across namespaces, verify connectivity - under 5 minutes

5. **Troubleshooting:** Debug why Pods won't start in namespace with quotas - under 2 minutes

**Target:** Complete all 5 scenarios in under 20 minutes total before your exam day.
