# Troubleshooting Advanced Components - CKAD Perspective

**Duration:** 25-30 minutes
**Format:** CKAD-focused view of advanced topics
**Note:** Core CKAD + enrichment material

---

## Important Note (1 minute)

**CKAD Core vs. Advanced:**

This lab covers advanced topics. Here's what matters for CKAD:

**✅ CKAD Core (Focus Here):**
- Basic Ingress resources and routing
- Basic StatefulSet concepts
- Standard troubleshooting commands
- Multi-resource debugging approach

**📚 Beyond CKAD (Bonus):**
- Helm chart creation and debugging
- Advanced Ingress patterns
- Complex StatefulSet scenarios

**Recommendation:** If studying for CKAD, prioritize core topics in troubleshooting and troubleshooting-2 labs first.

---

## Section 1: CKAD-Relevant Ingress Basics (8 minutes)

### What CKAD Expects (2 minutes)

**You should know:**
- What an Ingress is and why it's used
- How to create basic Ingress resources
- How Ingress routes to Services
- Basic troubleshooting of Ingress connectivity

**You don't need to know:**
- Ingress controller internals
- Complex path rewrites
- Advanced TLS configuration

### Scenario 1: Create Basic Ingress (3 minutes)

**CKAD Question:** "Create an Ingress named `webapp-ingress` that routes traffic from `app.example.com` to service `webapp-svc` on port 80."

**Solution:**

```bash
# Method 1: YAML
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webapp-svc
            port:
              number: 80
EOF

# Verify
kubectl get ingress webapp-ingress
kubectl describe ingress webapp-ingress
```

**Time Target:** 2-3 minutes

### Scenario 2: Ingress Troubleshooting (3 minutes)

**CKAD Question:** "The Ingress `api-ingress` isn't routing traffic to the backend. Diagnose and fix the issue."

**Diagnosis:**

```bash
# Check Ingress exists and has ADDRESS
kubectl get ingress api-ingress

# Check backend service exists
kubectl describe ingress api-ingress
# Note the backend service name and port

kubectl get svc <backend-service-name>
# Does it exist?

# Check service has endpoints
kubectl get endpoints <backend-service-name>
# If empty, selector mismatch

# Fix selector if needed
kubectl patch svc <service-name> -p '{"spec":{"selector":{"app":"correct-label"}}}'
```

**Common Issues:**
- Backend service doesn't exist
- Service has no endpoints (selector mismatch)
- Wrong port number
- Ingress controller not installed (but this is usually pre-configured in exam)

**Time Target:** 3 minutes

---

## Section 2: CKAD-Relevant StatefulSet Basics (8 minutes)

### What CKAD Expects (2 minutes)

**You should know:**
- Difference between Deployment and StatefulSet
- When to use StatefulSet (stateful apps like databases)
- Pod naming conventions (pod-0, pod-1, pod-2)
- Basic volumeClaimTemplates usage

**You might not need:**
- Advanced StatefulSet update strategies
- Complex partition-based rollouts
- Detailed PV/PVC reclaim policies

### Scenario 3: Create Basic StatefulSet (3 minutes)

**CKAD Question:** "Create a StatefulSet named `redis` with 3 replicas using image `redis:alpine`. Each pod should have a PVC requesting 1Gi storage mounted at `/data`."

**Solution:**

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  clusterIP: None  # Headless service
  selector:
    app: redis
  ports:
  - port: 6379
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
spec:
  serviceName: redis
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:alpine
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 1Gi
EOF
```

**Verify:**

```bash
kubectl get statefulset redis
kubectl get pods -l app=redis
kubectl get pvc
```

**Time Target:** 3-4 minutes

### Scenario 4: StatefulSet Troubleshooting (3 minutes)

**CKAD Question:** "The postgres StatefulSet has pod-0 in Pending state. Fix the issue."

**Diagnosis:**

```bash
# Check pod status
kubectl get pods | grep postgres

# Describe pod
kubectl describe pod postgres-0
# Look for PVC mounting issues

# Check PVC
kubectl get pvc data-postgres-0
# If Pending, no matching PV

# Create PV
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv-0
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /tmp/postgres-0
  persistentVolumeReclaimPolicy: Retain
EOF

# Verify PVC binds
kubectl get pvc data-postgres-0
# Should show: Bound

# Verify pod starts
kubectl get pods postgres-0
```

**Time Target:** 3 minutes

---

## Section 3: Multi-Resource Debugging (CKAD-Relevant) (6 minutes)

### Scenario 5: Debug Complete Application Stack (6 minutes)

**CKAD Question:** "An application stack has:
- StatefulSet `db` (not ready)
- Deployment `api` (CrashLoopBackOff)
- Service `api-svc` (no endpoints)
- Ingress `api-ingress` (not routing)

Fix all issues so the application is accessible."

**Systematic Solution:**

**Step 1: Fix StatefulSet (2 minutes)**

```bash
# Check StatefulSet
kubectl get statefulset db
kubectl get pods -l app=db

# If PVC pending
kubectl get pvc
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: db-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /tmp/db-data
EOF
```

**Step 2: Fix API Deployment (2 minutes)**

```bash
# Check why crashing
kubectl logs <api-pod> --previous
# Shows: "Cannot connect to database"

# Fix database connection env var
kubectl set env deployment/api DATABASE_URL=db-0.db.default.svc.cluster.local:5432

# Verify pods running
kubectl get pods -l app=api
```

**Step 3: Fix Service (1 minute)**

```bash
# Check endpoints
kubectl get endpoints api-svc
# If empty, check selector

kubectl get svc api-svc -o jsonpath='{.spec.selector}'
kubectl get pods -l app=api --show-labels

# Fix if mismatch
kubectl patch svc api-svc -p '{"spec":{"selector":{"app":"api"}}}'
```

**Step 4: Verify Ingress (1 minute)**

```bash
# Check Ingress backend
kubectl describe ingress api-ingress
# Should reference api-svc

# Test
curl -H "Host: api.example.com" http://localhost
```

**Time Target:** 6 minutes total

---

## Section 4: CKAD Exam Tips (4 minutes)

### Ingress Quick Reference (2 minutes)

**Create Ingress:**
```bash
# Basic pattern
kubectl create ingress <name> \
  --rule="<host>/<path>=<service>:<port>"

# Example
kubectl create ingress webapp \
  --rule="app.local/=webapp-svc:80"
```

**Troubleshoot Ingress:**
```bash
# 1. Check Ingress exists
kubectl get ingress

# 2. Check backend service
kubectl describe ingress <name>
kubectl get svc <backend-service>

# 3. Check service endpoints
kubectl get endpoints <backend-service>

# 4. Test with host header
curl -H "Host: <host>" http://localhost:<port>
```

### StatefulSet Quick Reference (2 minutes)

**Create StatefulSet:**
```yaml
# Remember these key parts:
# 1. Headless service (clusterIP: None)
# 2. serviceName in StatefulSet spec
# 3. volumeClaimTemplates (not volumes)
# 4. selector matches template labels
```

**Troubleshoot StatefulSet:**
```bash
# 1. Check pods in order
kubectl get pods -l app=<name>
# pod-0 must be ready before pod-1 starts

# 2. Check PVCs
kubectl get pvc
# Each pod gets its own PVC

# 3. Fix PVC issues first
# Create matching PVs if needed

# 4. Check headless service exists
kubectl get svc <statefulset-servicename>
# Must have clusterIP: None
```

---

## Section 5: What to Skip for CKAD (2 minutes)

**Helm - Not in CKAD Core:**
- Skip Helm chart creation
- Skip Helm template syntax
- Skip Helm debugging commands
- Focus: kubectl and YAML only

**Advanced Ingress - Limited CKAD Coverage:**
- Skip: Complex path rewrites
- Skip: Ingress controller installation
- Skip: Advanced TLS setup
- Focus: Basic HTTP routing

**Advanced StatefulSet - Limited CKAD Coverage:**
- Skip: Update strategies (OnDelete, partitions)
- Skip: PersistentVolume reclaim policies
- Skip: Advanced storage classes
- Focus: Basic StatefulSet creation and PVC binding

---

## Section 6: Core CKAD Troubleshooting Review (3 minutes)

**Priority 1: Master These First**

```bash
# Pod troubleshooting
kubectl get pods
kubectl describe pod <name>
kubectl logs <name>
kubectl logs <name> --previous

# Service troubleshooting
kubectl get svc
kubectl get endpoints <name>
kubectl describe svc <name>

# Multi-resource
kubectl get all
kubectl get all,cm,secret,pvc
```

**Priority 2: Practice These Scenarios**

1. Pod ImagePullBackOff → Fix image
2. Pod CrashLoopBackOff → Check logs --previous
3. Service no endpoints → Fix selector
4. ConfigMap missing → Create it
5. PVC Pending → Create PV
6. Basic Ingress routing → Create Ingress resource

**Priority 3: Time Management**

- Simple fixes: 2-3 minutes
- Multi-resource: 5-7 minutes
- Complex scenarios: 8-10 minutes MAX
- Always verify before moving on

---

## Final CKAD Guidance (1 minute)

**Study Path:**

1. **First:** Master basic troubleshooting (labs/troubleshooting)
2. **Second:** Master multi-resource (labs/troubleshooting-2)
3. **Third:** Basic Ingress and StatefulSet (relevant parts of this lab)
4. **Later:** Helm and advanced patterns (after passing CKAD)

**Exam Focus:**

✅ **Do this:**
- Memorize kubectl troubleshooting commands
- Practice fixing broken YAML
- Master describe and logs commands
- Understand resource dependencies
- Time yourself on practice scenarios

❌ **Don't worry about:**
- Helm chart syntax
- Ingress controller internals
- Advanced StatefulSet patterns
- Topics explicitly marked "beyond CKAD"

**Success Formula:**
- Focus on core topics = Pass CKAD
- Add advanced topics = Excel in real world
- Practice both = Kubernetes mastery

---

**Total Duration:** 25-30 minutes
**Recommendation:** Return to this after mastering core CKAD troubleshooting!
