# Productionizing - CKAD Exam Preparation

**Duration:** 25-30 minutes
**Format:** Comprehensive CKAD exam preparation
**Focus:** Health probes, resources, HPA, security contexts

---

## Introduction (1 minute)

Welcome to CKAD preparation for production-ready applications. This topic spans multiple exam domains and is absolutely critical for passing.

**CKAD Coverage:**
- **Application Design & Build** (20%) - Multi-container probes
- **Application Deployment** (20%) - Resource management
- **Application Observability & Maintenance** (15%) - Health probes
- **Services & Networking** (20%) - Readiness probes
- **Application Environment** (25%) - Security contexts

**Why Critical:**
- Appears in almost every deployment question
- Foundational for troubleshooting scenarios
- Required for real-world applications
- Easy points if you know the patterns

**Today's Comprehensive Coverage:**
1. All three probe types with examples
2. Resource requests, limits, and QoS
3. HPA creation and troubleshooting
4. Security contexts and best practices
5. Rapid-fire practice scenarios

Let's master production readiness!

---

## Section 1: Health Probes Deep Dive (8 minutes)

### Readiness Probe (2.5 minutes)

**Purpose:** Determine if Pod should receive traffic from Service.

**Behavior:**
- Probe fails → Pod removed from Service endpoints
- Probe succeeds → Pod added back to Service endpoints
- Container continues running

**HTTP Probe Example:**

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

**TCP Probe Example:**

```yaml
readinessProbe:
  tcpSocket:
    port: 5432
  initialDelaySeconds: 5
  periodSeconds: 10
```

**Exec Probe Example:**

```yaml
readinessProbe:
  exec:
    command:
    - cat
    - /tmp/ready
  periodSeconds: 5
```

**CKAD Scenario 1:** "Add a readiness probe to the nginx deployment that checks HTTP GET on port 80, path /ready, every 10 seconds."

**Solution:**

```bash
kubectl set probe deployment/nginx \
  --readiness \
  --get-url=http://:80/ready \
  --period-seconds=10

# OR edit deployment
kubectl edit deployment nginx
```

Add:
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 80
  periodSeconds: 10
```

**Time Target:** 1-2 minutes

### Liveness Probe (2.5 minutes)

**Purpose:** Determine if container should be restarted.

**Behavior:**
- Probe fails → Container killed and restarted
- Restart count increments
- Subject to backoff delay

**Warning:** Be conservative! Aggressive liveness probes cause restart loops.

**Configuration Pattern:**

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15    # Give app time to start
  periodSeconds: 20          # Less frequent than readiness
  failureThreshold: 3        # Allow multiple failures
```

**CKAD Scenario 2:** "The api deployment keeps restarting. The liveness probe is too aggressive. Fix it by increasing initialDelaySeconds to 30 and failureThreshold to 5."

**Solution:**

```bash
kubectl edit deployment api
```

Change:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30     # Was: 5
  periodSeconds: 10
  failureThreshold: 5         # Was: 1
```

```bash
# Verify pods stop restarting
kubectl get pods --watch
```

**Time Target:** 2 minutes

### Startup Probe (1.5 minutes)

**Purpose:** Allow slow-starting containers extra time before liveness checks begin.

**Behavior:**
- Startup probe runs first
- Liveness and readiness disabled until startup succeeds
- If startup fails within window → container restarted

**Use Case:** Legacy apps with long initialization (30+ seconds).

**Example:**

```yaml
startupProbe:
  httpGet:
    path: /startup
    port: 8080
  periodSeconds: 10
  failureThreshold: 30         # 30 * 10 = 300 seconds max
```

**CKAD Scenario 3:** "The legacy-app takes 2 minutes to start but keeps getting killed by liveness probe. Add a startup probe allowing up to 3 minutes."

**Solution:**

```yaml
spec:
  containers:
  - name: app
    image: legacy-app:latest
    startupProbe:
      httpGet:
        path: /health
        port: 8080
      periodSeconds: 10
      failureThreshold: 18    # 18 * 10 = 180 seconds
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      periodSeconds: 10
      failureThreshold: 3
```

**Time Target:** 1-2 minutes

### Combined Probe Strategy (1.5 minutes)

**Production Best Practice:**

```yaml
containers:
- name: app
  image: myapp:v1.0
  ports:
  - containerPort: 8080

  # Startup: Allow 2 minutes for initialization
  startupProbe:
    httpGet:
      path: /startup
      port: 8080
    periodSeconds: 10
    failureThreshold: 12       # 2 minutes

  # Readiness: Check every 5 seconds
  readinessProbe:
    httpGet:
      path: /ready
      port: 8080
    periodSeconds: 5
    failureThreshold: 3

  # Liveness: Check every 10 seconds (less aggressive)
  livenessProbe:
    httpGet:
      path: /healthz
      port: 8080
    periodSeconds: 10
    failureThreshold: 3
```

**Decision Matrix:**

| Probe Type | Path | Period | Failure Threshold |
|------------|------|--------|-------------------|
| Startup | /startup or /health | 10s | Based on startup time |
| Readiness | /ready | 5s | 2-3 (quick removal) |
| Liveness | /healthz or /health | 10s | 3-5 (avoid false positives) |

---

## Section 2: Resource Requests and Limits (6 minutes)

### Understanding Requests vs. Limits (2 minutes)

**Requests:** Guaranteed minimum resources.
- Used by scheduler to place pods
- Pod won't start if cluster can't satisfy
- Can use more if available

**Limits:** Maximum resources allowed.
- CPU: Throttled if exceeded
- Memory: OOMKilled if exceeded
- Enforced by kubelet

**Configuration:**

```yaml
resources:
  requests:
    cpu: 100m         # 0.1 cores
    memory: 128Mi
  limits:
    cpu: 500m         # 0.5 cores
    memory: 256Mi
```

**Units:**
- CPU: `1000m` = 1 core, `250m` = 0.25 cores
- Memory: `Mi` (mebibytes), `Gi` (gibibytes)

**CKAD Scenario 4:** "Set resource requests to 250m CPU and 256Mi memory, and limits to 500m CPU and 512Mi memory for the webapp deployment."

**Solution:**

```bash
kubectl set resources deployment webapp \
  --requests=cpu=250m,memory=256Mi \
  --limits=cpu=500m,memory=512Mi

# Verify
kubectl describe deployment webapp | grep -A 5 Limits
```

**Time Target:** 1-2 minutes

### Quality of Service (QoS) Classes (2 minutes)

**Guaranteed** (requests = limits for all containers):

```yaml
resources:
  requests:
    cpu: 500m
    memory: 256Mi
  limits:
    cpu: 500m      # Same as requests
    memory: 256Mi  # Same as requests
```

- Highest priority
- Last to be evicted
- Use for: Critical workloads

**Burstable** (requests < limits):

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

- Medium priority
- Can burst when available
- Use for: Most applications

**BestEffort** (no requests or limits):

```yaml
resources: {}
```

- Lowest priority
- First to be evicted
- Use for: Non-critical jobs

**Check QoS Class:**

```bash
kubectl get pod mypod -o jsonpath='{.status.qosClass}'
```

**CKAD Scenario 5:** "Create a Guaranteed QoS pod with 1 CPU and 1Gi memory."

**Solution:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: guaranteed-pod
spec:
  containers:
  - name: app
    image: nginx
    resources:
      requests:
        cpu: "1"
        memory: "1Gi"
      limits:
        cpu: "1"
        memory: "1Gi"
```

**Time Target:** 2 minutes

### Troubleshooting Resource Issues (2 minutes)

**OOMKilled (Out of Memory):**

```bash
kubectl describe pod <name>
# Last State: Terminated
#   Reason: OOMKilled
#   Exit Code: 137

# Fix: Increase memory limit
kubectl set resources deployment/<name> --limits=memory=512Mi
```

**CPU Throttling:**

```bash
# Symptom: Slow performance but no restarts
# Check CPU usage
kubectl top pod <name>

# If consistently at limit, increase
kubectl set resources deployment/<name> --limits=cpu=1000m
```

**Pod Pending (Insufficient Resources):**

```bash
kubectl describe pod <name>
# Events: 0/3 nodes available: Insufficient cpu

# Fix: Reduce requests
kubectl set resources deployment/<name> --requests=cpu=100m
```

---

## Section 3: Horizontal Pod Autoscaling (5 minutes)

### Creating HPA (2 minutes)

**v1 API (Simple CPU-based):**

```bash
kubectl autoscale deployment webapp \
  --min=2 \
  --max=10 \
  --cpu-percent=70

# OR YAML
kubectl apply -f - <<EOF
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: webapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
EOF
```

**v2 API (Multiple metrics):**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**CKAD Scenario 6:** "Create HPA for deployment `api` that scales between 3 and 12 pods at 60% CPU."

**Solution:**

```bash
kubectl autoscale deployment api --min=3 --max=12 --cpu-percent=60

# Verify
kubectl get hpa api
```

**Time Target:** 1-2 minutes

### HPA Troubleshooting (2 minutes)

**Issue: HPA shows `<unknown>/70%`**

```bash
# Cause: Metrics not available
# Fix 1: Check metrics-server running
kubectl get pods -n kube-system -l k8s-app=metrics-server

# Fix 2: Wait 30 seconds for metrics to collect
kubectl top pods

# Fix 3: Ensure pod has resource requests
kubectl get deployment <name> -o yaml | grep -A 3 requests
```

**Issue: HPA not scaling**

```bash
# Check current metrics
kubectl get hpa <name>
# TARGETS should show actual usage

# Check pod resource requests exist
kubectl describe deployment <name> | grep -A 3 "cpu:"

# Generate load to test
kubectl run -it --rm load-generator --image=busybox -- sh
# while true; do wget -q -O- http://webapp; done
```

**Issue: HPA scales down too quickly**

```yaml
# Add behavior policies (v2 API)
spec:
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 min before scale down
      policies:
      - type: Pods
        value: 1
        periodSeconds: 60  # Max 1 pod per minute
```

**Time Target:** 2-3 minutes

### HPA Prerequisites (1 minute)

**Required:**
1. ✅ Metrics Server installed
2. ✅ Pods have `resources.requests.cpu`
3. ✅ Target is scalable (Deployment, ReplicaSet, StatefulSet)

**Check prerequisites:**

```bash
# Check metrics-server
kubectl top nodes

# Check resource requests
kubectl get deployment <name> -o jsonpath='{.spec.template.spec.containers[0].resources.requests}'
```

---

## Section 4: Security Contexts (4 minutes)

### Pod-Level Security Context (1.5 minutes)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-app
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        runAsGroup: 1000
        fsGroup: 1000
```

**CKAD Scenario 7:** "Configure the webapp deployment to run as user 1000, group 1000."

**Solution:**

```bash
kubectl patch deployment webapp -p '{"spec":{"template":{"spec":{"securityContext":{"runAsUser":1000,"runAsGroup":1000}}}}}'

# OR edit
kubectl edit deployment webapp
```

**Time Target:** 1-2 minutes

### Container-Level Security Context (1.5 minutes)

```yaml
spec:
  containers:
  - name: app
    image: nginx:alpine
    securityContext:
      runAsNonRoot: true
      runAsUser: 1000
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    volumeMounts:
    - name: tmp
      mountPath: /tmp
    - name: cache
      mountPath: /var/cache/nginx
  volumes:
  - name: tmp
    emptyDir: {}
  - name: cache
    emptyDir: {}
```

**Key Security Settings:**
- `runAsNonRoot: true` - Fail if image runs as root
- `allowPrivilegeEscalation: false` - Prevent privilege gain
- `readOnlyRootFilesystem: true` - Immutable filesystem
- `capabilities.drop: [ALL]` - Drop all Linux capabilities

**CKAD Scenario 8:** "Secure the api deployment: run as non-root, read-only filesystem, drop all capabilities."

**Solution:**

```bash
kubectl edit deployment api
```

Add:
```yaml
spec:
  containers:
  - name: api
    securityContext:
      runAsNonRoot: true
      readOnlyRootFilesystem: true
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
```

**Time Target:** 2 minutes

### Security Best Practices Summary (1 minute)

**Checklist:**
- ✅ Run as non-root user (`runAsUser: 1000`)
- ✅ Drop all capabilities (`drop: [ALL]`)
- ✅ Read-only root filesystem (+ emptyDir for writable paths)
- ✅ Disable privilege escalation
- ✅ Disable SA token auto-mount (if not needed)

---

## Section 5: Rapid-Fire Practice (4 minutes)

### Quick Drill 1 (45 seconds)

**Task:** "Add readiness probe checking HTTP /health on port 8080 to deployment webapp."

```bash
kubectl set probe deployment/webapp --readiness --get-url=http://:8080/health
```

### Quick Drill 2 (45 seconds)

**Task:** "Set resource requests: 100m CPU, 128Mi memory for deployment api."

```bash
kubectl set resources deployment/api --requests=cpu=100m,memory=128Mi
```

### Quick Drill 3 (45 seconds)

**Task:** "Create HPA for deployment frontend: 2-8 pods, 75% CPU."

```bash
kubectl autoscale deployment frontend --min=2 --max=8 --cpu-percent=75
```

### Quick Drill 4 (45 seconds)

**Task:** "Make deployment secure-app run as user 1000."

```bash
kubectl patch deployment secure-app -p '{"spec":{"template":{"spec":{"securityContext":{"runAsUser":1000}}}}}'
```

### Quick Drill 5 (45 seconds)

**Task:** "Check QoS class of pod mypod."

```bash
kubectl get pod mypod -o jsonpath='{.status.qosClass}'
```

---

## Section 6: Complete Production Deployment (2 minutes)

**CKAD Scenario:** "Create a production-ready deployment with all best practices."

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prod-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: prod-app
  template:
    metadata:
      labels:
        app: prod-app
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      automountServiceAccountToken: false
      containers:
      - name: app
        image: myapp:v1.0
        ports:
        - containerPort: 8080

        # Startup probe
        startupProbe:
          httpGet:
            path: /startup
            port: 8080
          periodSeconds: 10
          failureThreshold: 12

        # Readiness probe
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          periodSeconds: 5
          failureThreshold: 3

        # Liveness probe
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          periodSeconds: 10
          failureThreshold: 3

        # Resources
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi

        # Security
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL

        volumeMounts:
        - name: tmp
          mountPath: /tmp

      volumes:
      - name: tmp
        emptyDir: {}
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: prod-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: prod-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Final CKAD Checklist (1 minute)

**Before leaving a question:**

✅ **Probes Configured:**
```bash
kubectl describe pod <name> | grep -A 5 "Readiness\|Liveness"
```

✅ **Resources Set:**
```bash
kubectl describe pod <name> | grep -A 5 Limits
```

✅ **HPA Created (if required):**
```bash
kubectl get hpa
```

✅ **Security Context (if required):**
```bash
kubectl get pod <name> -o jsonpath='{.spec.securityContext}'
```

✅ **Application Responds:**
```bash
curl <service>
kubectl logs <pod>
```

✅ **No CrashLoopBackOff:**
```bash
kubectl get pods  # RESTARTS should be 0 or stable
```

---

## Summary: CKAD Mastery (1 minute)

**Must-Know Commands:**
```bash
# Probes
kubectl set probe deployment/<name> --readiness --get-url=http://:8080/health
kubectl set probe deployment/<name> --liveness --get-url=http://:8080/healthz

# Resources
kubectl set resources deployment/<name> --requests=cpu=100m,memory=128Mi --limits=cpu=200m,memory=256Mi

# HPA
kubectl autoscale deployment/<name> --min=2 --max=10 --cpu-percent=70

# Check status
kubectl top pods
kubectl get hpa
kubectl describe pod <name>
```

**Common Patterns:**
- Readiness removes from Service (temporary)
- Liveness restarts container (permanent fix)
- Startup allows slow initialization
- Always set resource requests for HPA
- QoS = Guaranteed (requests=limits), Burstable (requests<limits), BestEffort (none)

**Time Management:**
- Simple probe: 1-2 minutes
- Resources + HPA: 2-3 minutes
- Full production setup: 5-7 minutes
- Always verify before moving on!

**Remember:** Production readiness is tested across ALL CKAD domains. Master these patterns and you'll excel!

---

**Total Duration:** 25-30 minutes
**Practice Goal:** Configure production-ready deployment in under 5 minutes!

Good luck on your CKAD exam!
