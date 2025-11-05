# Preparing for Production - Concept Introduction

**Duration:** 12-15 minutes
**Format:** Concept slideshow presentation
**Audience:** CKAD exam candidates and Kubernetes practitioners

---

## Slide 1: Introduction (30 seconds)

Welcome to production readiness for Kubernetes applications. This is a critical CKAD topic that distinguishes toy deployments from production-grade applications.

**Reality Check:** Getting an app running in Kubernetes is easy. Making it production-ready requires additional configuration for reliability, security, and observability.

**Today's Focus:**
- Health probes (readiness, liveness, startup)
- Resource management (requests and limits)
- Horizontal Pod Autoscaling (HPA)
- Security contexts and best practices

**CKAD Relevance:** This is core exam material in multiple domains.

---

## Slide 2: The Production Readiness Gap (1 minute)

**Basic Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
```

**Problems:**
- No health checks → Kubernetes can't tell if app is healthy
- No resource limits → Can consume all cluster resources
- No autoscaling → Manual scaling only
- No security → Runs as root with full privileges

**Production-Ready Deployment:**
- ✅ Health probes configured
- ✅ Resource requests and limits set
- ✅ HPA for automatic scaling
- ✅ Security contexts applied
- ✅ Multiple replicas for availability

**Visual:** Side-by-side comparison of basic vs. production-ready deployment.

---

## Slide 3: Health Probes Overview (2 minutes)

### Three Types of Probes

**1. Readiness Probe**
- **Purpose:** Is the app ready to receive traffic?
- **Action:** Remove from Service endpoints if failing
- **Use case:** App is starting, loading data, or temporarily overloaded

**2. Liveness Probe**
- **Purpose:** Is the app alive and functioning?
- **Action:** Restart container if failing
- **Use case:** App is deadlocked, hung, or in unrecoverable state

**3. Startup Probe**
- **Purpose:** Has the app finished initializing?
- **Action:** Delay liveness/readiness checks until passing
- **Use case:** Slow-starting applications (legacy apps, large data loads)

### Probe Mechanisms

**HTTP GET** (most common for web apps):
```yaml
httpGet:
  path: /healthz
  port: 8080
```

**TCP Socket** (for non-HTTP apps):
```yaml
tcpSocket:
  port: 5432
```

**Exec Command** (custom health checks):
```yaml
exec:
  command:
  - cat
  - /tmp/healthy
```

**Visual:** Flowchart showing when each probe type triggers and what action is taken.

---

## Slide 4: Readiness vs. Liveness (1.5 minutes)

### Readiness Probe

**Scenario:** Web app is temporarily overloaded.

**Without readiness probe:**
- App returns 503 errors
- Users get error messages
- Service keeps sending traffic

**With readiness probe:**
- Probe fails on `/ready` endpoint
- Pod removed from Service endpoints
- No traffic sent to unhealthy pod
- Pod might recover without restart

**Key Point:** Readiness probe manages traffic routing, not pod lifecycle.

### Liveness Probe

**Scenario:** App deadlocks or enters unrecoverable state.

**Without liveness probe:**
- Container keeps running
- App never recovers
- Manual intervention required

**With liveness probe:**
- Probe fails on `/healthz` endpoint
- Kubernetes kills container
- Container is restarted
- App gets fresh start

**Key Point:** Liveness probe triggers restarts, so be careful with configuration!

**Visual:** Timeline showing readiness probe temporarily removing pod from service, vs. liveness probe triggering restart.

---

## Slide 5: Probe Configuration Parameters (1.5 minutes)

### Timing Parameters

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30   # Wait before first check
  periodSeconds: 10         # How often to check
  timeoutSeconds: 5         # Request timeout
  successThreshold: 1       # Consecutive successes to be healthy
  failureThreshold: 3       # Consecutive failures before action
```

### Configuration Guidelines

**initialDelaySeconds:**
- Too short → False positives during startup
- Too long → Slow to detect issues
- Guideline: Estimate app startup time + buffer

**periodSeconds:**
- Too short → Unnecessary load on app
- Too long → Slow detection of issues
- Guideline: 5-10 seconds for most apps

**failureThreshold:**
- Too low → Restart on transient errors
- Too high → Slow to take action
- Guideline: 3 for liveness, 2-3 for readiness

**Common Pattern:**
- Readiness: Quick checks, low threshold (fast traffic removal)
- Liveness: Slower checks, higher threshold (avoid unnecessary restarts)

**Visual:** Timeline showing probe check intervals and failure thresholds.

---

## Slide 6: Resource Management - Requests and Limits (2 minutes)

### Why Resource Management Matters

**Without resource limits:**
- One pod can consume all cluster resources
- Noisy neighbor problems
- Cluster instability
- Unpredictable performance

**With resource management:**
- Guaranteed minimum resources (requests)
- Protected from resource exhaustion (limits)
- Better scheduling decisions
- Predictable performance

### Requests vs. Limits

```yaml
resources:
  requests:
    cpu: 100m        # Guaranteed minimum
    memory: 128Mi
  limits:
    cpu: 500m        # Maximum allowed
    memory: 256Mi
```

**Requests:**
- Used by scheduler to place pods
- Guaranteed to be available
- Pod won't start if cluster can't satisfy requests

**Limits:**
- Maximum resources pod can use
- CPU: Throttled if exceeded
- Memory: OOMKilled if exceeded

### Quality of Service (QoS) Classes

**Guaranteed** (requests = limits):
- Highest priority
- Last to be evicted
- Use for critical workloads

**Burstable** (requests < limits):
- Medium priority
- Can use more when available
- Use for most applications

**BestEffort** (no requests/limits):
- Lowest priority
- First to be evicted
- Use for non-critical jobs only

**Visual:** QoS priority pyramid showing eviction order.

---

## Slide 7: Horizontal Pod Autoscaling (HPA) (2 minutes)

### What is HPA?

**HPA automatically scales pods based on metrics:**
- CPU utilization (most common)
- Memory utilization
- Custom metrics (requests per second, queue depth, etc.)

**Flow:**
```
Metrics Server → HPA → Deployment → ReplicaSet → Pods
```

### Basic HPA Configuration

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
```

**Behavior:**
- Load increases → CPU > 70% → Scale up
- Load decreases → CPU < 70% → Scale down
- Min 2 pods (high availability)
- Max 10 pods (cost control)

### HPA Requirements

**Prerequisites:**
1. Metrics Server must be installed
2. Pods must have resource requests
3. Target must be scalable (Deployment, ReplicaSet, StatefulSet)

**Limitations:**
- Can't scale below minReplicas (even at 0% CPU)
- Default cooldown periods prevent thrashing
- Based on average across all pods

**Visual:** Graph showing HPA scaling pods up and down based on CPU utilization.

---

## Slide 8: Security Contexts (1.5 minutes)

### Pod and Container Security

**Default Kubernetes behavior:**
- Containers often run as root
- Full Linux capabilities
- Read-write filesystem
- Service account token mounted

**Security Risks:**
- Container escape → Node compromise
- Privilege escalation
- Data modification
- API access abuse

### Security Best Practices

```yaml
spec:
  # Pod-level security
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000

  # Don't mount SA token unless needed
  automountServiceAccountToken: false

  containers:
  - name: app
    # Container-level security
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL

    # Resource limits
    resources:
      limits:
        memory: "256Mi"
        cpu: "200m"
      requests:
        memory: "128Mi"
        cpu: "100m"
```

**Key Practices:**
1. Run as non-root user
2. Drop all capabilities
3. Read-only root filesystem (+ emptyDir for writable paths)
4. Disable privilege escalation
5. Disable SA token auto-mount

**Visual:** Security context layers from permissive to hardened.

---

## Slide 9: Production Readiness Checklist (1.5 minutes)

### Before Going to Production

**Health & Reliability:**
- ✅ Readiness probe configured
- ✅ Liveness probe configured (carefully!)
- ✅ Startup probe for slow-starting apps
- ✅ Multiple replicas (minimum 2)
- ✅ Pod disruption budget (for critical apps)

**Resource Management:**
- ✅ Resource requests set
- ✅ Resource limits set
- ✅ QoS class appropriate for workload
- ✅ HPA configured for variable load

**Security:**
- ✅ Run as non-root user
- ✅ Read-only root filesystem
- ✅ Drop all capabilities
- ✅ Disable unnecessary SA token
- ✅ Security context configured

**Observability:**
- ✅ Logging configured
- ✅ Metrics exposed
- ✅ Readiness/liveness endpoints implemented
- ✅ Graceful shutdown handling

**Testing:**
- ✅ Health endpoints tested
- ✅ Resource limits tested (stress testing)
- ✅ HPA tested under load
- ✅ Failure scenarios tested (kill pods, network issues)

---

## Slide 10: Common Anti-Patterns (1 minute)

### What NOT to Do

**❌ No health probes**
- Kubernetes can't tell if app is healthy
- Broken pods keep receiving traffic
- Manual intervention required

**❌ Aggressive liveness probes**
- False positives cause restart loops
- Transient errors trigger restarts
- App never stabilizes

**❌ No resource limits**
- One pod can starve others
- Cluster instability
- Unpredictable performance

**❌ Running as root**
- Security risk
- Privilege escalation possible
- Best practices violation

**❌ Single replica**
- No high availability
- Zero-downtime updates impossible
- Single point of failure

---

## Slide 11: CKAD Exam Relevance (1 minute)

**What You Must Know:**

**Health Probes (Critical):**
- Configure readiness, liveness, startup probes
- Choose appropriate probe mechanism
- Set correct timing parameters
- Understand the difference between probe types

**Resources (Critical):**
- Set requests and limits
- Understand QoS classes
- Calculate appropriate values
- Troubleshoot OOMKilled pods

**HPA (Important):**
- Create basic HPA
- Configure CPU/memory targets
- Set min/max replicas
- Troubleshoot HPA issues

**Security (Important):**
- Configure security contexts
- Run as non-root
- Set capabilities
- Understand security implications

**Exam Format:**
- "Configure readiness probe for deployment X..."
- "Add resource limits to prevent OOMKilled..."
- "Create HPA to scale between 2-10 pods at 80% CPU..."
- "Secure the deployment to run as non-root user..."

---

## Slide 12: Key Takeaways (1 minute)

**Essential Concepts:**

1. **Readiness Probe** - Manages traffic routing (remove from Service)
2. **Liveness Probe** - Manages container lifecycle (restart if failing)
3. **Startup Probe** - Allows slow initialization before liveness checks
4. **Resource Requests** - Guaranteed minimum (scheduling)
5. **Resource Limits** - Maximum allowed (throttling/OOMKill)
6. **HPA** - Automatic scaling based on metrics
7. **Security Context** - Run as non-root, drop capabilities, read-only filesystem

**CKAD Success Formula:**
- Master probe configuration (all three types)
- Understand resource management (requests vs. limits)
- Know how to create HPA
- Configure basic security contexts
- Practice troubleshooting (OOMKilled, CrashLoopBackOff)

**Production Mindset:**
- Health checks are not optional
- Resource limits protect the cluster
- Security contexts reduce risk
- Test failure scenarios
- Always have multiple replicas

**Remember:** Production readiness is about **reliability, security, and observability**—not just "making it work"!

---

**Total Time:** 12-15 minutes
**Next:** Hands-on configuration of production-ready applications
