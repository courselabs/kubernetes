# Rollouts and Deployment Strategies - CKAD Exam Preparation

**Duration:** 25-30 minutes
**Format:** CKAD exam-focused scenarios and rapid-fire practice
**Target:** CKAD exam candidates preparing for Application Deployment domain (20%)

---

## Introduction (1 minute)

Welcome to the CKAD exam preparation session for deployment strategies and rollouts. This topic represents 20% of your exam score in the Application Deployment domain.

**What makes this CKAD-critical:**
- You WILL get questions about updating deployments
- You WILL need to implement rollback scenarios
- You MAY need to implement blue/green or canary strategies
- Speed matters—you need to execute these tasks in under 5 minutes

**Exam Format Reminder:**
- Performance-based, not multiple choice
- Time-limited (2 hours for ~15-20 questions)
- Real Kubernetes cluster environment
- kubectl and official docs are available

**Today's Focus:**
1. Core rollout commands and configuration
2. Rapid deployment updates
3. Rollback operations under pressure
4. Blue/green and canary implementation
5. Troubleshooting failed rollouts
6. Time-saving techniques

Let's master the skills you need to ace deployment questions!

---

## Section 1: Essential Rollout Commands (4 minutes)

### Quick Reference: Must-Know Commands (1 minute)

```bash
# Update deployment image (fastest method)
kubectl set image deployment/myapp myapp=myapp:v2

# View rollout status
kubectl rollout status deployment/myapp

# View rollout history
kubectl rollout history deployment/myapp

# Rollback to previous version
kubectl rollout undo deployment/myapp

# Rollback to specific revision
kubectl rollout undo deployment/myapp --to-revision=2

# Pause a rollout (for validation)
kubectl rollout pause deployment/myapp

# Resume a paused rollout
kubectl rollout resume deployment/myapp

# Restart deployment (useful for config changes)
kubectl rollout restart deployment/myapp
```

**Exam Tip:** Memorize `kubectl set image` and `kubectl rollout undo`—you'll use these constantly.

### Scenario 1: Quick Image Update (2 minutes)

**CKAD Question:** "Update the nginx deployment in the default namespace to use image nginx:1.21-alpine. Ensure zero downtime."

**Solution:**

```bash
# Method 1: Fastest - set image directly
kubectl set image deployment/nginx nginx=nginx:1.21-alpine

# Method 2: Edit in place
kubectl edit deployment nginx
# Change image field, save, exit

# Method 3: Patch (useful for scripting)
kubectl patch deployment nginx -p '{"spec":{"template":{"spec":{"containers":[{"name":"nginx","image":"nginx:1.21-alpine"}]}}}}'

# Monitor the rollout
kubectl rollout status deployment/nginx

# Verify new pods are running
kubectl get pods -l app=nginx
```

**Time Target:** Complete in under 2 minutes

**Verification:**
```bash
# Check image version
kubectl get deployment nginx -o jsonpath='{.spec.template.spec.containers[0].image}'
# Output: nginx:1.21-alpine

# Check all pods are ready
kubectl get deployment nginx
# READY should show desired count (e.g., 3/3)
```

### Scenario 2: Rollback Failed Deployment (1 minute)

**CKAD Question:** "The webapp deployment has been updated with a bad image and pods are crashing. Roll back to the previous working version."

**Solution:**

```bash
# Check current status
kubectl get deployment webapp
kubectl get pods -l app=webapp
# Pods show CrashLoopBackOff or ImagePullBackOff

# View rollout history
kubectl rollout history deployment/webapp

# Rollback to previous version
kubectl rollout undo deployment/webapp

# Monitor rollback
kubectl rollout status deployment/webapp

# Verify pods are healthy
kubectl get pods -l app=webapp
```

**Time Target:** Complete in under 90 seconds

**Common Pitfall:** Don't waste time trying to fix the image in the YAML—just rollback!

---

## Section 2: Rollout Strategy Configuration (5 minutes)

### Understanding maxSurge and maxUnavailable (1.5 minutes)

These two parameters control how Kubernetes performs rolling updates:

**maxSurge:**
- Maximum number of pods ABOVE desired count during rollout
- Can be absolute number (e.g., `2`) or percentage (e.g., `25%`)
- Default: 25%
- Higher value = faster rollout, more resources needed

**maxUnavailable:**
- Maximum number of pods that can be UNAVAILABLE during rollout
- Can be absolute number or percentage
- Default: 25%
- Higher value = faster rollout, more risk

**Common Configurations:**

| Configuration | maxSurge | maxUnavailable | Behavior | Use Case |
|---------------|----------|----------------|----------|----------|
| Fast & Safe | 100% | 0 | Create all new pods first | Critical services |
| Slow & Safe | 1 | 0 | One at a time | Conservative updates |
| Balanced | 25% | 25% | Default behavior | Most applications |
| Fast & Risky | 100% | 100% | Fastest possible | Dev environments |

### Scenario 3: Configure Conservative Rollout (2 minutes)

**CKAD Question:** "Configure the api-server deployment to update one pod at a time, ensuring at least the desired number of pods are always available."

**Solution:**

```bash
# Method 1: Patch the deployment
kubectl patch deployment api-server -p '{"spec":{"strategy":{"type":"RollingUpdate","rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'

# Method 2: Edit and modify
kubectl edit deployment api-server
```

Add/modify the strategy section:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

**Verification:**
```bash
# Check strategy configuration
kubectl get deployment api-server -o yaml | grep -A 5 strategy
```

**Time Target:** 2-3 minutes including verification

### Scenario 4: Recreate Strategy (1.5 minutes)

**CKAD Question:** "The legacy-app deployment must be updated using the Recreate strategy because it cannot run multiple versions simultaneously."

**Solution:**

```bash
# Method 1: Patch
kubectl patch deployment legacy-app -p '{"spec":{"strategy":{"type":"Recreate"}}}'

# Method 2: Edit
kubectl edit deployment legacy-app
```

Change strategy:

```yaml
spec:
  strategy:
    type: Recreate
  # Remove rollingUpdate section if it exists
```

**Warning:** This causes downtime! Ensure the question allows it.

**Verification:**
```bash
kubectl get deployment legacy-app -o jsonpath='{.spec.strategy.type}'
# Output: Recreate
```

---

## Section 3: Blue/Green Deployments (6 minutes)

### Concept Refresher (1 minute)

**Blue/Green Strategy:**
- Two complete environments (blue and green)
- Service selector controls which environment serves traffic
- Instant switchover by changing selector
- Easy rollback by switching selector back

**Key CKAD Skills:**
- Creating deployments with version labels
- Using `kubectl patch` to update Service selector
- Verifying traffic routing

### Scenario 5: Implement Blue/Green (4 minutes)

**CKAD Question:** "Implement a blue/green deployment for the payment-api application. Currently, the blue version (v1.0) is serving traffic. Deploy the green version (v2.0) and prepare it for switchover, but don't switch traffic yet."

**Solution Steps:**

**Step 1: Create Blue Deployment (current production)**

```bash
# Create blue deployment
kubectl create deployment payment-api-blue \
  --image=payment-api:v1.0 \
  --replicas=3 \
  --dry-run=client -o yaml > blue-deployment.yaml
```

Edit blue-deployment.yaml:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api-blue
  labels:
    app: payment-api
    strategy: blue-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-api
      version: blue
  template:
    metadata:
      labels:
        app: payment-api
        version: blue
    spec:
      containers:
      - name: payment-api
        image: payment-api:v1.0
        ports:
        - containerPort: 8080
```

```bash
kubectl apply -f blue-deployment.yaml
```

**Step 2: Create Service**

```bash
kubectl create service clusterip payment-api \
  --tcp=80:8080 \
  --dry-run=client -o yaml > service.yaml
```

Edit service.yaml:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: payment-api
  labels:
    app: payment-api
spec:
  selector:
    app: payment-api
    version: blue  # Points to blue initially
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

```bash
kubectl apply -f service.yaml
```

**Step 3: Create Green Deployment**

```bash
# Copy blue deployment and modify
cp blue-deployment.yaml green-deployment.yaml
```

Edit green-deployment.yaml:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api-green
  labels:
    app: payment-api
    strategy: blue-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-api
      version: green
  template:
    metadata:
      labels:
        app: payment-api
        version: green
    spec:
      containers:
      - name: payment-api
        image: payment-api:v2.0  # New version
        ports:
        - containerPort: 8080
```

```bash
kubectl apply -f green-deployment.yaml
```

**Step 4: Verify Setup**

```bash
# Check both deployments are running
kubectl get deployments -l strategy=blue-green
# Should show both blue and green

# Check service points to blue
kubectl get service payment-api -o jsonpath='{.spec.selector}'
# Should show: map[app:payment-api version:blue]

# Check endpoints (should only show blue pods)
kubectl get endpoints payment-api
```

**Time Target:** 4-5 minutes for full setup

### Scenario 6: Switch Traffic to Green (1 minute)

**CKAD Question:** "Switch the payment-api service to route traffic to the green version."

**Solution:**

```bash
# Switch service selector to green
kubectl patch service payment-api -p '{"spec":{"selector":{"version":"green"}}}'

# Verify switch
kubectl get endpoints payment-api
# Should now show green pod IPs

# Or describe service
kubectl describe service payment-api | grep -A 3 Selector
```

**Rollback if needed:**

```bash
kubectl patch service payment-api -p '{"spec":{"selector":{"version":"blue"}}}'
```

**Time Target:** Under 1 minute

---

## Section 4: Canary Deployments (6 minutes)

### Concept Refresher (1 minute)

**Canary Strategy:**
- Two deployments with same labels but different versions
- Service load-balances across all pods
- Control traffic percentage by adjusting replica counts
- Gradual rollout with monitoring at each stage

**Traffic Percentage Formula:**
```
Canary % = (Canary Replicas / Total Replicas) × 100
```

Example: 1 canary + 4 stable = 20% canary traffic

### Scenario 7: Implement Canary Deployment (5 minutes)

**CKAD Question:** "Implement a canary deployment for the web-app application. Start with 80% traffic to the stable version (v1.5) and 20% to the canary version (v2.0). Both versions should share the same service."

**Solution:**

**Step 1: Create Stable Deployment**

```bash
kubectl create deployment web-app-stable \
  --image=web-app:v1.5 \
  --replicas=4 \
  --dry-run=client -o yaml > stable.yaml
```

Edit stable.yaml:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app-stable
  labels:
    app: web-app
    track: stable
spec:
  replicas: 4  # 80% of traffic
  selector:
    matchLabels:
      app: web-app  # Same label as canary!
      track: stable
  template:
    metadata:
      labels:
        app: web-app  # Same label as canary!
        track: stable
    spec:
      containers:
      - name: web-app
        image: web-app:v1.5
        ports:
        - containerPort: 8080
```

```bash
kubectl apply -f stable.yaml
```

**Step 2: Create Canary Deployment**

```bash
cp stable.yaml canary.yaml
```

Edit canary.yaml:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app-canary
  labels:
    app: web-app
    track: canary
spec:
  replicas: 1  # 20% of traffic
  selector:
    matchLabels:
      app: web-app  # Same label as stable!
      track: canary
  template:
    metadata:
      labels:
        app: web-app  # Same label as stable!
        track: canary
    spec:
      containers:
      - name: web-app
        image: web-app:v2.0  # New version
        ports:
        - containerPort: 8080
```

```bash
kubectl apply -f canary.yaml
```

**Step 3: Create Service**

```bash
kubectl expose deployment web-app-stable \
  --name=web-app \
  --port=80 \
  --target-port=8080 \
  --type=ClusterIP
```

Or create YAML:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app
spec:
  selector:
    app: web-app  # Selects BOTH stable and canary!
  ports:
  - port: 80
    targetPort: 8080
```

**Step 4: Verify Canary Setup**

```bash
# Check both deployments
kubectl get deployments -l app=web-app
# Should show: stable (4 replicas), canary (1 replica)

# Check all pods
kubectl get pods -l app=web-app
# Should show 5 pods total

# Check service endpoints (should include all 5 pods)
kubectl get endpoints web-app
```

**Step 5: Progress the Canary (if question asks)**

**To 50% canary:**

```bash
kubectl scale deployment web-app-stable --replicas=3
kubectl scale deployment web-app-canary --replicas=3
# Now: 3 stable + 3 canary = 50% each
```

**To 100% canary:**

```bash
kubectl scale deployment web-app-canary --replicas=4
kubectl scale deployment web-app-stable --replicas=0
# Now: 0 stable + 4 canary = 100% canary
```

**Rollback canary:**

```bash
kubectl scale deployment web-app-canary --replicas=0
kubectl scale deployment web-app-stable --replicas=4
```

**Time Target:** 5-6 minutes for full implementation

---

## Section 5: Troubleshooting Failed Rollouts (4 minutes)

### Common Rollout Failures (1 minute)

**Symptoms:**
- Pods stuck in ImagePullBackOff
- Pods in CrashLoopBackOff
- Rollout never completes
- Deployment shows READY 2/3 (not all replicas ready)

**Quick Diagnosis:**

```bash
# Check rollout status
kubectl rollout status deployment/myapp

# Check pod status
kubectl get pods -l app=myapp

# Describe failing pods
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Scenario 8: Diagnose and Fix Failed Rollout (3 minutes)

**CKAD Question:** "The api-gateway deployment was updated but the rollout is stuck. Only 2 out of 3 replicas are ready. Diagnose the issue and fix it."

**Solution Process:**

**Step 1: Investigate**

```bash
# Check deployment status
kubectl get deployment api-gateway
# Shows: READY 2/3

# Check pods
kubectl get pods -l app=api-gateway
# Look for pods in bad state

# Describe problematic pod
kubectl describe pod api-gateway-xxxx-yyyy
# Look in Events section for errors

# Common issues you might find:
# - ImagePullBackOff: Wrong image name/tag
# - CrashLoopBackOff: Application error, check logs
# - Pending: Resource constraints
```

**Step 2: Fix Based on Issue**

**If image is wrong:**

```bash
# Rollback
kubectl rollout undo deployment/api-gateway

# Or fix with correct image
kubectl set image deployment/api-gateway api-gateway=api-gateway:v1.2
```

**If config is wrong:**

```bash
# Rollback
kubectl rollout undo deployment/api-gateway

# Fix the config
kubectl edit configmap api-gateway-config

# Restart deployment to pick up changes
kubectl rollout restart deployment/api-gateway
```

**If resource constraints:**

```bash
# Check node resources
kubectl top nodes

# Adjust resource requests
kubectl edit deployment api-gateway
# Reduce resources.requests values
```

**Step 3: Verify Fix**

```bash
# Monitor rollout
kubectl rollout status deployment/api-gateway

# Verify all replicas ready
kubectl get deployment api-gateway
# Should show: READY 3/3
```

**Time Target:** 3-4 minutes including diagnosis and fix

---

## Section 6: Advanced Rollout Techniques (3 minutes)

### Pause and Resume Rollouts (1 minute)

**Use Case:** You want to verify a few pods before continuing the rollout.

```bash
# Start an update
kubectl set image deployment/myapp myapp=myapp:v2

# Immediately pause
kubectl rollout pause deployment/myapp

# Some pods will be updated, others remain on old version
kubectl get pods -l app=myapp

# Test the new pods, run validations, etc.
# ...

# If everything looks good, resume
kubectl rollout resume deployment/myapp

# If not, undo
kubectl rollout undo deployment/myapp
```

**CKAD Scenario:** "Update the frontend deployment to version 2.0, but pause after the first new pod comes online for manual testing."

### Rollback to Specific Revision (1 minute)

```bash
# View history with details
kubectl rollout history deployment/myapp

# View specific revision
kubectl rollout history deployment/myapp --revision=3

# Rollback to specific revision
kubectl rollout undo deployment/myapp --to-revision=3

# Verify
kubectl rollout status deployment/myapp
```

### Using --record Flag (1 minute)

**Note:** `--record` is deprecated but might still appear in exams.

```bash
# Record the command in history
kubectl set image deployment/myapp myapp=myapp:v2 --record

# History will show the command
kubectl rollout history deployment/myapp
# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         kubectl set image deployment/myapp myapp=myapp:v2 --record=true
```

**Current Best Practice:** Use annotations instead:

```bash
kubectl annotate deployment/myapp kubernetes.io/change-cause="Updated to v2.0 for security patch"
```

---

## Section 7: Time-Saving Tips for CKAD (2 minutes)

### Aliases and Shortcuts

```bash
# Set these at the start of your exam
alias k=kubectl
alias kgd='kubectl get deployments'
alias kgp='kubectl get pods'
alias kd='kubectl describe'
alias ke='kubectl edit'

# Use them
k set image deploy/app app=app:v2
kgd
kgp -l app=app
```

### Quick YAML Generation

```bash
# Generate deployment YAML
kubectl create deployment myapp --image=myapp:v1 --replicas=3 --dry-run=client -o yaml > deploy.yaml

# Edit as needed
vi deploy.yaml

# Apply
kubectl apply -f deploy.yaml
```

### Rapid Verification

```bash
# Check image version quickly
kubectl get deployment myapp -o jsonpath='{.spec.template.spec.containers[0].image}'

# Check all replica counts
kubectl get deployment -o custom-columns=NAME:.metadata.name,DESIRED:.spec.replicas,READY:.status.readyReplicas

# Watch rollout in real-time
kubectl get pods -l app=myapp --watch
```

### Using kubectl Documentation

```bash
# Quick help
kubectl set image --help
kubectl rollout --help

# Examples from help
kubectl set image --help | grep -A 10 Examples
```

---

## Section 8: Rapid-Fire Practice Scenarios (3 minutes)

**Try to complete each in under 2 minutes:**

### Quick Drill 1

"Update deployment 'nginx' to use image 'nginx:alpine' and verify it's running."

```bash
kubectl set image deployment/nginx nginx=nginx:alpine
kubectl rollout status deployment/nginx
kubectl get pods -l app=nginx
```

### Quick Drill 2

"Rollback deployment 'webapp' to the previous version."

```bash
kubectl rollout undo deployment/webapp
kubectl rollout status deployment/webapp
```

### Quick Drill 3

"Scale deployment 'api' to 5 replicas and verify."

```bash
kubectl scale deployment/api --replicas=5
kubectl get deployment api
```

### Quick Drill 4

"Create a deployment 'test-app' with image 'nginx', 3 replicas, then update to 'nginx:alpine'."

```bash
kubectl create deployment test-app --image=nginx --replicas=3
kubectl set image deployment/test-app nginx=nginx:alpine
kubectl rollout status deployment/test-app
```

### Quick Drill 5

"Check the rollout history of 'frontend' and rollback to revision 2."

```bash
kubectl rollout history deployment/frontend
kubectl rollout undo deployment/frontend --to-revision=2
```

---

## Section 9: Common CKAD Pitfalls (2 minutes)

### Pitfall 1: Not Waiting for Rollout to Complete

**Wrong:**

```bash
kubectl set image deployment/app app=app:v2
kubectl get pods  # Might see old pods still running!
```

**Right:**

```bash
kubectl set image deployment/app app=app:v2
kubectl rollout status deployment/app  # Wait for completion
kubectl get pods
```

### Pitfall 2: Wrong Container Name

Deployments can have multiple containers. Specify the right one!

**Wrong:**

```bash
kubectl set image deployment/app app=app:v2
# Error: container "app" not found
```

**Right:**

```bash
# Check container names first
kubectl get deployment app -o jsonpath='{.spec.template.spec.containers[*].name}'

# Use correct name
kubectl set image deployment/app my-container=app:v2
```

### Pitfall 3: Forgetting to Verify

Always verify your changes worked!

```bash
# After any operation
kubectl get deployment myapp
kubectl get pods -l app=myapp
kubectl describe deployment myapp | grep Image
```

### Pitfall 4: Blue/Green Service Selector Mistakes

**Wrong:**

```bash
# Forgetting to include all label pairs
kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'
# Might select pods you didn't intend!
```

**Right:**

```bash
# Include all necessary labels
kubectl patch service app -p '{"spec":{"selector":{"app":"myapp","version":"green"}}}'
```

---

## Final Exam Checklist (1 minute)

**Before you leave the exam pod:**

✅ Deployment shows correct READY count (e.g., 3/3)
✅ Pods are in Running state
✅ Image version is correct
✅ Service selector points to correct pods (blue/green scenarios)
✅ Endpoints exist for services
✅ No pods in CrashLoopBackOff or ImagePullBackOff

**Quick verification command:**

```bash
kubectl get all -l app=myapp
# Should show healthy deployments, replicasets, pods, and services
```

---

## Summary: Must-Know for CKAD (1 minute)

**Commands to Memorize:**

```bash
# Update
kubectl set image deployment/app app=app:v2

# Status
kubectl rollout status deployment/app

# History
kubectl rollout history deployment/app

# Rollback
kubectl rollout undo deployment/app

# Patch service selector (blue/green)
kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'

# Scale (canary)
kubectl scale deployment/app-canary --replicas=2
```

**Concepts to Master:**
1. Rolling update with maxSurge/maxUnavailable
2. Rollback procedures
3. Blue/green with service selector patching
4. Canary with replica scaling
5. Troubleshooting failed rollouts

**Time Management:**
- Simple updates: 1-2 minutes
- Blue/green setup: 4-5 minutes
- Canary setup: 5-6 minutes
- Troubleshooting: 3-4 minutes

**Final Tip:** Speed comes from practice. Run through these scenarios multiple times until they're muscle memory!

---

**Total Duration:** 25-30 minutes
**Next Steps:** Practice these scenarios in a timed environment to build exam confidence!
