# Preparing for Production - Practical Exercises

**Duration:** 20-25 minutes
**Format:** Live demonstration with hands-on practice
**Prerequisites:** Kubernetes cluster, metrics-server (for HPA)

---

## Introduction (1 minute)

Today we'll transform basic deployments into production-ready applications by adding health probes, resource management, autoscaling, and security contexts.

**What You'll Learn:**
1. Configure readiness and liveness probes
2. Set resource requests and limits
3. Create HPA for autoscaling
4. Apply security contexts
5. Troubleshoot production issues

Let's build production-grade applications!

---

## Exercise 1: Self-Healing Apps with Readiness Probes (5 minutes)

### Deploy Basic Application (1 minute)

```bash
# Deploy whoami application
kubectl apply -f labs/productionizing/specs/whoami

# Check deployment
kubectl get all -l app=whoami
```

**What was created:**
- Deployment with 2 replicas
- NodePort Service on port 8010

### Trigger Application Failure (1 minute)

**Test the application:**

```bash
# Windows users: Enable curl
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force; . ./scripts/windows-tools.ps1

# Test app
curl http://localhost:8010

# Break one pod
curl --data '503' http://localhost:8010/health

# Keep testing
curl http://localhost:8010
# Some requests return 503!
```

**Problem:** Broken pod still receives traffic.

### Add Readiness Probe (2 minutes)

**Deploy update with readiness probe:**

```bash
# Apply readiness probe configuration
kubectl apply -f labs/productionizing/specs/whoami/update

# Wait for pods to update
kubectl get pods -l app=whoami,update=readiness --watch
```

**Check probe configuration:**

```bash
# Describe pod to see readiness probe
kubectl describe pod -l update=readiness | grep -A 5 Readiness
```

**Test with failure:**

```bash
# Break one pod again
curl --data '503' http://localhost:8010/health

# Watch pod status
kubectl get pods -l app=whoami --watch
# One pod becomes 0/1 Ready

# Test application
curl http://localhost:8010
# All responses are OK! (traffic only to healthy pod)

# Verify endpoints
kubectl get endpoints whoami-np
# Only shows healthy pod IP
```

**Key Learning:** Readiness probe removes unhealthy pods from service without restarting them.

---

## Exercise 2: Self-Repairing Apps with Liveness Probes (4 minutes)

### Add Liveness Probe (1 minute)

**Deploy update with liveness probe:**

```bash
kubectl apply -f labs/productionizing/specs/whoami/update2

# Wait for new pods
kubectl get pods -l app=whoami,update=liveness --watch
```

### Trigger and Observe Restart (2 minutes)

**Break a pod and watch recovery:**

```bash
# Break one pod
curl --data '503' http://localhost:8010/health

# Watch pod behavior
kubectl get pods -l app=whoami --watch
```

**What to observe:**
1. Pod becomes 0/1 Ready (readiness probe fails)
2. After several failed liveness checks, pod restarts
3. RESTART count increases
4. Pod becomes 1/1 Ready again

**Verify recovery:**

```bash
# Check endpoints (both pods back in service)
kubectl get endpoints whoami-np

# Test application
curl http://localhost:8010
# All responses from both healthy pods
```

### Compare Probe Types (1 minute)

**Readiness vs. Liveness:**

**Readiness:**
- ✅ Removes from Service
- ✅ Pod keeps running
- ✅ May recover on its own
- Use for: Temporary issues, overload, warming up

**Liveness:**
- ✅ Restarts container
- ✅ Fresh start
- ❌ Loses pod state
- Use for: Deadlocks, unrecoverable errors

**Database Example:**

```bash
# Check Postgres database deployment
cat labs/productionizing/specs/products-db/products-db.yaml
```

**Shows:**
- Readiness: TCP socket probe (is DB listening?)
- Liveness: Exec command probe (is DB usable?)

---

## Exercise 3: Autoscaling with HPA (6 minutes)

### Setup Metrics Server (1 minute)

**Check if metrics-server is installed:**

```bash
kubectl top nodes

# If "Metrics API not available", install it
kubectl apply -f labs/productionizing/specs/metrics-server

# Wait a moment, then test
kubectl top nodes
```

### Deploy Application with HPA (2 minutes)

**Deploy Pi application with HPA:**

```bash
# Deploy Pi web app (CPU intensive)
kubectl apply -f labs/productionizing/specs/pi

# Check deployment
kubectl get deployment pi-web

# Check HPA
kubectl get hpa pi-cpu

# Monitor HPA
kubectl get hpa pi-cpu --watch
```

**Initial State:**

```
NAME     REFERENCE           TARGETS   MINPODS   MAXPODS   REPLICAS
pi-cpu   Deployment/pi-web   0%/75%    1         5         1
```

### Trigger Autoscaling (2 minutes)

**Generate load:**

```bash
# Open 2 browser tabs to:
# http://localhost:8020/pi?dp=100000

# OR use curl in loops
for i in {1..10}; do curl "http://localhost:8020/pi?dp=100000" & done
```

**Watch HPA scale up:**

```bash
# In your watch window, you'll see:
# 1. TARGETS increases (e.g., 198%/75%)
# 2. REPLICAS increases (1 → 3 → 5)
# 3. New pods are created

kubectl get pods -l app=pi-web
# Multiple pods now running
```

**Watch scale down:**

```bash
# Stop generating load
# Wait 5+ minutes

# HPA scales down
# TARGETS: 0%/75%
# REPLICAS: 5 → 3 → 1 (slow scale-down)
```

### HPA Troubleshooting (1 minute)

**Common Issues:**

**If HPA shows `<unknown>/75%`:**
```bash
# Metrics not available yet, wait 30 seconds
# OR metrics-server not working
kubectl top pods
```

**If HPA doesn't scale:**
```bash
# Check pod has resource requests
kubectl get deployment pi-web -o yaml | grep -A 5 resources

# Must have requests.cpu for HPA to work
```

**Docker Desktop Note:** May have issues with metrics-server. HPA might not trigger, but concept still demonstrated.

---

## Exercise 4: Lab Challenge - Complete Production Setup (7 minutes)

### The Challenge (1 minute)

**Starting point:**

```bash
# Deploy basic configurable app
kubectl apply -f labs/productionizing/specs/configurable

# Test it
curl http://localhost:8030
# Works at first...

# Refresh 3+ times
curl http://localhost:8030
# App fails and never recovers!
```

**Your Goals:**

1. Run 5 replicas
2. Ensure traffic only goes to healthy pods (readiness probe)
3. Restart pods if app fails (liveness probe)
4. Add HPA: scale 5-10 pods at 50% CPU
5. Bonus: Add security context (non-root, read-only filesystem)

**Requirements:**
- App has `/healthz` endpoint for health checks
- Use HTTP probes
- Set appropriate timing parameters

### Solution Approach (6 minutes)

**Step 1: Add Health Probes (2 minutes)**

```bash
# Create updated deployment
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: configurable
spec:
  replicas: 5
  selector:
    matchLabels:
      app: configurable
  template:
    metadata:
      labels:
        app: configurable
    spec:
      containers:
      - name: web
        image: kiamol/ch09-configurable
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 50m
            memory: 50Mi
          limits:
            cpu: 100m
            memory: 100Mi
        readinessProbe:
          httpGet:
            path: /healthz
            port: 80
          periodSeconds: 5
          failureThreshold: 2
        livenessProbe:
          httpGet:
            path: /healthz
            port: 80
          periodSeconds: 10
          failureThreshold: 3
          initialDelaySeconds: 10
EOF

# Verify pods
kubectl get pods -l app=configurable
```

**Step 2: Create HPA (1 minute)**

```bash
kubectl apply -f - <<EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: configurable-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: configurable
  minReplicas: 5
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
EOF

# Verify HPA
kubectl get hpa configurable-hpa
```

**Step 3: Test Health Probes (2 minutes)**

```bash
# Test application multiple times
for i in {1..10}; do curl http://localhost:8030; done

# All requests should succeed (readiness probe working)

# Check pods stay healthy
kubectl get pods -l app=configurable
# No restarts, all 1/1 Ready
```

**Step 4: Test HPA (1 minute - optional)**

```bash
# Generate CPU load
kubectl exec -it <pod-name> -- sh
# Inside container:
# while true; do :; done

# In another terminal, watch HPA
kubectl get hpa configurable-hpa --watch
# Should scale up to 10 pods

# Stop load, watch scale down to 5
```

---

## CKAD Exam Tips (2 minutes)

### Quick Commands

**Add readiness probe to existing deployment:**

```bash
kubectl set probe deployment/myapp \
  --readiness \
  --get-url=http://:8080/ready \
  --initial-delay-seconds=5 \
  --period-seconds=10
```

**Add liveness probe:**

```bash
kubectl set probe deployment/myapp \
  --liveness \
  --get-url=http://:8080/health \
  --initial-delay-seconds=15 \
  --period-seconds=20
```

**Set resources:**

```bash
kubectl set resources deployment/myapp \
  --requests=cpu=100m,memory=128Mi \
  --limits=cpu=200m,memory=256Mi
```

**Create HPA:**

```bash
kubectl autoscale deployment myapp \
  --min=2 \
  --max=10 \
  --cpu-percent=70
```

### Verification Checklist

✅ **Health Probes Working:**
```bash
kubectl describe pod <name> | grep -A 10 "Liveness\|Readiness"
kubectl get pods  # Check no restart loops
```

✅ **Resources Set:**
```bash
kubectl describe pod <name> | grep -A 5 Limits
kubectl get pod <name> -o jsonpath='{.status.qosClass}'
```

✅ **HPA Active:**
```bash
kubectl get hpa
# Should show current/target metrics
```

✅ **Application Responds:**
```bash
curl <service>
# Test health endpoints
curl <service>/healthz
```

---

## Cleanup (1 minute)

```bash
kubectl delete all,hpa -l kubernetes.courselabs.co=productionizing
```

---

## Summary (1 minute)

**What We Practiced:**

1. **Readiness Probes** - Remove unhealthy pods from service
2. **Liveness Probes** - Restart unhealthy containers
3. **Resource Management** - Requests and limits
4. **HPA** - Automatic scaling based on CPU
5. **Production Patterns** - Complete setup with all components

**CKAD Skills Reinforced:**
- ✅ Configure all three probe types
- ✅ Set resource requests and limits
- ✅ Create and troubleshoot HPA
- ✅ Understand probe timing parameters
- ✅ Build production-ready deployments

**Real-World Application:**
- Health probes prevent traffic to broken pods
- Resource limits protect cluster stability
- HPA handles variable load automatically
- Security contexts reduce attack surface

**Key Lessons:**
- Readiness ≠ Liveness (different purposes)
- Conservative liveness probes (avoid restart loops)
- Always set resource requests for HPA
- Test failure scenarios (kill pods, overload)
- Multiple replicas for high availability

---

**Total Duration:** 20-25 minutes
**Next:** CKAD exam scenarios with health probes, resources, and HPA
