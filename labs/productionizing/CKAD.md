# Productionizing - CKAD Requirements

This document covers the CKAD (Certified Kubernetes Application Developer) exam requirements for production-ready applications, building on the basics covered in [README.md](README.md).

## CKAD Exam Requirements

The CKAD exam expects you to understand and implement:
- Liveness, readiness, and startup probes (HTTP, TCP, exec)
- Resource requests and limits (CPU and memory)
- Horizontal Pod Autoscaling (HPA) based on CPU/memory
- Security contexts (Pod and container level)
- Service accounts and RBAC basics
- Quality of Service (QoS) classes
- Resource quotas and limit ranges
- Pod disruption budgets
- Pod priority and preemption
- Graceful termination and lifecycle hooks

## Health Probes

Health probes are critical for production workloads to ensure applications are healthy and ready to serve traffic.

### Probe Types

Kubernetes supports three types of health checks:

1. **Liveness Probe** - Determines if container should be restarted
2. **Readiness Probe** - Determines if Pod should receive traffic
3. **Startup Probe** - Allows slow-starting containers extra time before liveness checks begin

### Probe Mechanisms

Each probe type can use three different mechanisms:

#### HTTP GET Probe

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: http-probe
spec:
  containers:
  - name: app
    image: myapp:latest
    ports:
    - containerPort: 8080
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 3
      periodSeconds: 10
      timeoutSeconds: 1
      successThreshold: 1
      failureThreshold: 3
```

#### TCP Socket Probe

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tcp-probe
spec:
  containers:
  - name: database
    image: postgres:14
    ports:
    - containerPort: 5432
    readinessProbe:
      tcpSocket:
        port: 5432
      initialDelaySeconds: 5
      periodSeconds: 10
```

#### Exec Command Probe

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: exec-probe
spec:
  containers:
  - name: app
    image: myapp:latest
    livenessProbe:
      exec:
        command:
        - cat
        - /tmp/healthy
      initialDelaySeconds: 5
      periodSeconds: 5
```

### Probe Configuration Parameters

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15   # Wait before first check
  periodSeconds: 10         # How often to check
  timeoutSeconds: 1         # Request timeout
  successThreshold: 1       # Consecutive successes to be considered healthy
  failureThreshold: 3       # Consecutive failures before action taken
```

### Readiness Probe

Removes Pod from Service endpoints when unhealthy (doesn't restart):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 3
```

**Behavior:**
- Probe fails → Pod removed from Service endpoints
- Probe succeeds → Pod added back to Service endpoints
- Container continues running

### Liveness Probe

Restarts container when unhealthy:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /healthz
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 20
          failureThreshold: 3
```

**Behavior:**
- Probe fails → Container restarted
- Restart count increments
- Subject to backoff delay (10s, 20s, 40s, ... up to 5 minutes)

### Startup Probe

Allows slow-starting containers more time:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: slow-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: slow-app
  template:
    metadata:
      labels:
        app: slow-app
    spec:
      containers:
      - name: app
        image: slow-starting-app:latest
        ports:
        - containerPort: 8080
        startupProbe:
          httpGet:
            path: /startup
            port: 8080
          initialDelaySeconds: 0
          periodSeconds: 10
          failureThreshold: 30  # 30 * 10 = 300 seconds (5 minutes) max
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          periodSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          periodSeconds: 5
```

**Behavior:**
- Startup probe runs first
- Liveness and readiness probes disabled until startup succeeds
- If startup fails within window → container restarted

> **TODO**: Add example showing startup probe preventing premature liveness failures

### Combined Probe Strategy

Best practice for production applications:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: production-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: production-app
  template:
    metadata:
      labels:
        app: production-app
    spec:
      containers:
      - name: app
        image: myapp:v1.0
        ports:
        - containerPort: 8080

        # Startup: Allow up to 2 minutes for initialization
        startupProbe:
          httpGet:
            path: /startup
            port: 8080
          periodSeconds: 10
          failureThreshold: 12  # 12 * 10 = 120 seconds

        # Readiness: Check every 5 seconds if ready for traffic
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          periodSeconds: 5
          failureThreshold: 3
          successThreshold: 1

        # Liveness: Check every 10 seconds if alive (less aggressive)
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          periodSeconds: 10
          failureThreshold: 3
          timeoutSeconds: 5
```

> **TODO**: Add decision matrix for choosing probe settings based on app characteristics

📋 Create a Deployment with all three probe types configured appropriately for a web application.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete solution with verification steps

</details><br/>

## Resource Requests and Limits

Resource management is critical for cluster stability and application performance.

### CPU and Memory Resources

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: myapp:latest
    resources:
      requests:
        memory: "128Mi"    # Guaranteed minimum
        cpu: "250m"        # 0.25 cores
      limits:
        memory: "256Mi"    # Maximum allowed
        cpu: "500m"        # 0.5 cores
```

**Units:**
- CPU: `1000m` = 1 core, `500m` = 0.5 cores, `100m` = 0.1 cores
- Memory: `Mi` (mebibytes), `Gi` (gibibytes), `M` (megabytes), `G` (gigabytes)

### Quality of Service (QoS) Classes

Kubernetes assigns QoS classes based on resource configuration:

#### Guaranteed (Highest Priority)

```yaml
# requests = limits for all containers
resources:
  requests:
    memory: "256Mi"
    cpu: "500m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

- Highest priority
- Last to be evicted
- Best for critical workloads

#### Burstable (Medium Priority)

```yaml
# At least one container has requests or limits (not all equal)
resources:
  requests:
    memory: "128Mi"
    cpu: "250m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

- Medium priority
- Can use more than requested if available
- Good for most applications

#### BestEffort (Lowest Priority)

```yaml
# No requests or limits set
resources: {}
```

- Lowest priority
- First to be evicted under pressure
- Only for non-critical workloads

> **TODO**: Add example showing eviction order under resource pressure

### Checking QoS Class

```bash
kubectl get pod mypod -o jsonpath='{.status.qosClass}'
```

📋 Create three Pods with different QoS classes and verify their classification.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete solution with QoS verification

</details><br/>

### Resource Behavior

**Memory:**
- Exceeding memory limit → Pod OOMKilled (Out of Memory)
- Cannot be compressed or throttled

**CPU:**
- Exceeding CPU limit → Throttled (not killed)
- Can be compressed
- Performance degrades but Pod continues

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: stress-test
spec:
  containers:
  - name: stress
    image: polinux/stress
    command: ["stress"]
    args:
    - "--vm"
    - "1"
    - "--vm-bytes"
    - "150M"  # Try to allocate 150Mi
    - "--vm-hang"
    - "1"
    resources:
      requests:
        memory: "100Mi"
      limits:
        memory: "128Mi"  # Will be OOMKilled
```

> **TODO**: Add hands-on example showing OOMKilled vs CPU throttling

## Horizontal Pod Autoscaling (HPA)

Automatically scale replicas based on metrics.

### CPU-Based Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # Target 70% of requested CPU
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 15
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

**Prerequisites:**
- Metrics Server must be installed
- Pods must have resource requests defined
- Target resource must be a Deployment, ReplicaSet, or StatefulSet

### Memory-Based Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: memory-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: memory-intensive-app
  minReplicas: 2
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80  # Target 80% of requested memory
```

### Multiple Metrics

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: multi-metric-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  # CPU metric
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  # Memory metric
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  # Custom metric (requires custom metrics API)
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
```

> When multiple metrics are specified, HPA calculates desired replicas for each metric and uses the highest value.

### Legacy v1 API

```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: simple-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 50
```

### HPA Behavior Configuration

Control scale-up and scale-down rates:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: controlled-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 minutes before scaling down
      policies:
      - type: Pods
        value: 1
        periodSeconds: 60  # Max 1 pod per minute
      - type: Percent
        value: 10
        periodSeconds: 60  # Max 10% per minute
      selectPolicy: Min  # Use most conservative policy
    scaleUp:
      stabilizationWindowSeconds: 0  # Scale up immediately
      policies:
      - type: Pods
        value: 2
        periodSeconds: 30  # Max 2 pods per 30 seconds
      - type: Percent
        value: 50
        periodSeconds: 30  # Max 50% per 30 seconds
      selectPolicy: Max  # Use most aggressive policy
```

> **TODO**: Add example showing HPA behavior during load spike

### Installing Metrics Server

```bash
# Check if metrics server is available
kubectl top nodes

# Install if not available
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For development clusters (Docker Desktop, minikube), may need insecure TLS:
kubectl patch deployment metrics-server -n kube-system --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

📋 Create an HPA that scales a Deployment between 3 and 10 replicas based on 60% CPU utilization.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete solution with load testing to trigger scaling

</details><br/>

### HPA Troubleshooting

```bash
# Check HPA status
kubectl get hpa
kubectl describe hpa web-app-hpa

# Check metrics
kubectl top pods
kubectl top nodes

# View HPA events
kubectl get events --field-selector involvedObject.kind=HorizontalPodAutoscaler

# Common issues:
# - "missing request for cpu" - Pod spec needs resources.requests.cpu
# - "unable to get metrics" - Metrics server not installed or not working
# - "failed to get cpu utilization" - Pod not ready or just started
```

> **TODO**: Add troubleshooting scenario with resolution steps

## Security Contexts

Define privilege and access control settings for Pods and containers.

### Pod-Level Security Context

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-demo
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
    fsGroupChangePolicy: "OnRootMismatch"
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "sleep 3600"]
```

### Container-Level Security Context

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
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
        add:
        - NET_BIND_SERVICE
    volumeMounts:
    - name: cache
      mountPath: /var/cache/nginx
    - name: run
      mountPath: /var/run
  volumes:
  - name: cache
    emptyDir: {}
  - name: run
    emptyDir: {}
```

### Security Context Fields

**Pod Level:**
- `runAsUser` - UID to run containers
- `runAsGroup` - GID to run containers
- `fsGroup` - GID for volume ownership
- `supplementalGroups` - Additional GIDs
- `seccompProfile` - Seccomp profile
- `seLinuxOptions` - SELinux options

**Container Level:**
- `runAsUser` - Override pod-level UID
- `runAsGroup` - Override pod-level GID
- `runAsNonRoot` - Fail if image runs as root
- `readOnlyRootFilesystem` - Make root filesystem read-only
- `allowPrivilegeEscalation` - Allow gaining more privileges
- `privileged` - Run as privileged container
- `capabilities` - Add/drop Linux capabilities

### Capabilities

```yaml
securityContext:
  capabilities:
    drop:
    - ALL  # Drop all capabilities
    add:
    - NET_BIND_SERVICE  # Allow binding to privileged ports
    - CHOWN             # Allow changing file ownership
    - DAC_OVERRIDE      # Override file permissions
```

Common capabilities:
- `NET_BIND_SERVICE` - Bind to ports < 1024
- `NET_ADMIN` - Network administration
- `SYS_TIME` - Set system clock
- `CHOWN` - Change file ownership
- `SETUID`/`SETGID` - Set user/group ID
- `KILL` - Send signals to processes

### Read-Only Root Filesystem

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: readonly-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: readonly-app
  template:
    metadata:
      labels:
        app: readonly-app
    spec:
      containers:
      - name: app
        image: nginx:alpine
        securityContext:
          readOnlyRootFilesystem: true
        volumeMounts:
        # Nginx needs these directories writable
        - name: cache
          mountPath: /var/cache/nginx
        - name: run
          mountPath: /var/run
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: cache
        emptyDir: {}
      - name: run
        emptyDir: {}
      - name: tmp
        emptyDir: {}
```

> **TODO**: Add example showing errors without required writable volumes

### Non-Root User

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nonroot-app
spec:
  securityContext:
    runAsNonRoot: true  # Enforces non-root requirement
    runAsUser: 1000
    runAsGroup: 1000
  containers:
  - name: app
    image: myapp:latest
```

### Security Best Practices

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hardened-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hardened-app
  template:
    metadata:
      labels:
        app: hardened-app
    spec:
      # Disable automounting SA token
      automountServiceAccountToken: false

      # Pod-level security
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        runAsGroup: 1000
        fsGroup: 1000
        seccompProfile:
          type: RuntimeDefault

      containers:
      - name: app
        image: myapp:latest

        # Container-level security
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL

        # Resource limits
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

        # Health probes
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          periodSeconds: 5

        volumeMounts:
        - name: tmp
          mountPath: /tmp

      volumes:
      - name: tmp
        emptyDir: {}
```

📋 Create a secure Deployment following all security best practices.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete solution with security verification steps

</details><br/>

## Service Accounts

Every Pod runs with a service account that determines API access permissions.

### Default Service Account

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: default-sa
spec:
  # Uses default SA in namespace if not specified
  containers:
  - name: app
    image: nginx
```

### Custom Service Account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
---
apiVersion: v1
kind: Pod
metadata:
  name: custom-sa
spec:
  serviceAccountName: app-sa
  containers:
  - name: app
    image: nginx
```

### Disable Auto-Mount SA Token

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: no-sa-token
spec:
  automountServiceAccountToken: false
  containers:
  - name: app
    image: nginx
```

> **TODO**: Add example showing RBAC binding with service account

## Resource Quotas

Limit resource consumption at namespace level.

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: dev
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "50"
    services: "10"
    persistentvolumeclaims: "5"
```

> **TODO**: Add example showing quota enforcement

## Limit Ranges

Set default resource limits for containers in a namespace.

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: limit-range
  namespace: dev
spec:
  limits:
  - max:
      cpu: "2"
      memory: "2Gi"
    min:
      cpu: "100m"
      memory: "128Mi"
    default:
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:
      cpu: "250m"
      memory: "256Mi"
    type: Container
```

> **TODO**: Add example showing limit range application

## Pod Disruption Budgets

Ensure minimum availability during voluntary disruptions.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-app-pdb
spec:
  minAvailable: 2  # or maxUnavailable: 1
  selector:
    matchLabels:
      app: web-app
```

> **TODO**: Add example showing PDB preventing node drain

## Pod Priority and Preemption

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000
globalDefault: false
description: "High priority for critical apps"
---
apiVersion: v1
kind: Pod
metadata:
  name: critical-app
spec:
  priorityClassName: high-priority
  containers:
  - name: app
    image: nginx
```

> **TODO**: Add example showing preemption behavior

## Graceful Termination

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: graceful-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: graceful-app
  template:
    metadata:
      labels:
        app: graceful-app
    spec:
      terminationGracePeriodSeconds: 30
      containers:
      - name: app
        image: myapp:latest
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
```

> **TODO**: Add example showing graceful shutdown workflow

## Lab Exercises

### Exercise 1: Complete Health Check Implementation

Create a Deployment with:
- Startup probe allowing 60 seconds for initialization
- Readiness probe checking HTTP /ready endpoint
- Liveness probe checking HTTP /health endpoint
- Appropriate timing configuration for each

> **TODO**: Add complete solution with verification

### Exercise 2: Resource Management and QoS

Create three Deployments demonstrating each QoS class:
1. Guaranteed - requests = limits
2. Burstable - requests < limits
3. BestEffort - no requests or limits

Verify QoS assignment and test resource pressure scenarios.

> **TODO**: Add complete solution with stress testing

### Exercise 3: HPA with Load Testing

Create a Deployment with HPA that:
- Starts with 2 replicas
- Scales up to 10 replicas based on 70% CPU
- Includes resource requests
- Deploy load generator to trigger scaling

> **TODO**: Add complete solution with load generation

### Exercise 4: Security Hardening

Take an insecure Deployment and harden it:
- Run as non-root user
- Read-only root filesystem
- Drop all capabilities
- Disable SA token auto-mount
- Add resource limits

> **TODO**: Add before/after comparison

### Exercise 5: Production-Ready Application

Create a complete production-ready Deployment with:
- All three probe types
- Resource requests and limits (Burstable QoS)
- Security contexts (non-root, read-only filesystem)
- HPA for autoscaling
- Multiple replicas
- PodDisruptionBudget

> **TODO**: Add complete solution representing best practices

## Common CKAD Scenarios

### Scenario 1: Debug Crashing Container

> **TODO**: Add scenario with misconfigured liveness probe causing crash loop

### Scenario 2: Fix OOMKilled Pods

> **TODO**: Add scenario identifying and fixing memory issues

### Scenario 3: Application Not Receiving Traffic

> **TODO**: Add scenario debugging failing readiness probes

### Scenario 4: HPA Not Scaling

> **TODO**: Add scenario troubleshooting HPA configuration

### Scenario 5: Security Context Preventing Startup

> **TODO**: Add scenario fixing security-related startup failures

## Best Practices for CKAD

1. **Health Probes**
   - Always use readiness probes in production
   - Use liveness probes carefully (avoid false positives)
   - Add startup probes for slow-starting apps
   - Use different paths for different probe types

2. **Resources**
   - Always set requests and limits
   - Start conservative, tune based on monitoring
   - Aim for Burstable QoS for most apps
   - Use Guaranteed QoS for critical workloads

3. **Autoscaling**
   - Set minReplicas >= 2 for availability
   - Configure behavior for gradual scale-down
   - Test HPA with realistic load
   - Monitor HPA decisions

4. **Security**
   - Run as non-root whenever possible
   - Use read-only root filesystem
   - Drop ALL capabilities, add only what's needed
   - Disable SA token auto-mount unless needed
   - Use specific user/group IDs

5. **Availability**
   - Use multiple replicas
   - Configure PodDisruptionBudgets
   - Set appropriate terminationGracePeriodSeconds
   - Use preStop hooks for graceful shutdown

## Quick Reference Commands

```bash
# Health Probes
kubectl describe pod mypod | grep -A 10 Liveness
kubectl describe pod mypod | grep -A 10 Readiness

# Resources
kubectl top pods
kubectl top nodes
kubectl describe pod mypod | grep -A 5 Limits
kubectl get pod mypod -o jsonpath='{.status.qosClass}'

# HPA
kubectl get hpa
kubectl describe hpa myhpa
kubectl autoscale deployment myapp --min=2 --max=10 --cpu-percent=70

# Security
kubectl exec mypod -- whoami
kubectl exec mypod -- id
kubectl get pod mypod -o jsonpath='{.spec.securityContext}'
kubectl get pod mypod -o jsonpath='{.spec.containers[0].securityContext}'

# Service Accounts
kubectl get sa
kubectl describe sa mysa
kubectl get pod mypod -o jsonpath='{.spec.serviceAccountName}'

# Resource Quotas
kubectl get resourcequota
kubectl describe resourcequota myquota

# Limit Ranges
kubectl get limitrange
kubectl describe limitrange mylimitrange

# PDB
kubectl get pdb
kubectl describe pdb mypdb

# Check Pod disruptions
kubectl drain node-1 --dry-run
```

## Cleanup

```bash
# Delete specific resources
kubectl delete deployment myapp
kubectl delete hpa myhpa
kubectl delete pdb mypdb

# Delete all resources with label
kubectl delete all,hpa,pdb -l app=myapp
```

---

## Next Steps

After mastering production readiness, continue with these CKAD topics:
- [Deployments](../deployments/CKAD.md) - Rolling updates and rollback strategies
- [Services](../services/CKAD.md) - Service mesh and advanced networking
- [Monitoring](../monitoring/CKAD.md) - Observability and metrics
- [RBAC](../rbac/CKAD.md) - Advanced authorization
