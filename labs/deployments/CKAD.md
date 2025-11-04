# CKAD Exam Preparation: Advanced Deployments

This document covers advanced Deployment topics required for the Certified Kubernetes Application Developer (CKAD) exam. Complete the [basic deployments lab](README.md) first before working through these exercises.

## Prerequisites

Before starting this lab, you should be familiar with:
- Creating basic Deployments
- Scaling applications
- Basic rolling updates and rollbacks
- Working with labels and selectors

## CKAD Deployment Topics Covered

- Deployment strategies (RollingUpdate vs Recreate)
- Rolling update configuration (maxSurge, maxUnavailable)
- Advanced rollout management (pause, resume, status, history)
- Resource requests and limits
- Health checks (readiness, liveness, startup probes)
- Multi-container patterns (init containers, sidecars)
- Advanced deployment patterns (canary, blue-green)
- Deployment annotations and change tracking
- Production best practices

## Deployment Strategies

Deployments support two strategies for replacing old Pods with new ones:

### 1. RollingUpdate (Default)

The RollingUpdate strategy gradually replaces old Pods with new ones, ensuring some Pods are always available during updates.

**TODO**: Create example spec `specs/ckad/strategy-rolling.yaml` with explicit RollingUpdate configuration

```
# Deploy with RollingUpdate strategy
kubectl apply -f labs/deployments/specs/ckad/strategy-rolling.yaml

# Watch the rollout
kubectl rollout status deployment/whoami-rolling
```

### 2. Recreate Strategy

The Recreate strategy terminates all existing Pods before creating new ones. This causes downtime but ensures old and new versions never run simultaneously.

**TODO**: Create example spec `specs/ckad/strategy-recreate.yaml`

```
# Deploy with Recreate strategy
kubectl apply -f labs/deployments/specs/ckad/strategy-recreate.yaml

# Watch all pods terminate before new ones start
kubectl get pods --watch
```

📋 **CKAD Tip**: Know when to use each strategy. Recreate is useful when:
- Your app can't handle multiple versions running simultaneously
- You need to perform database migrations
- Resource constraints prevent running both versions

## Rolling Update Configuration

Control how rolling updates behave with `maxSurge` and `maxUnavailable`:

### MaxSurge and MaxUnavailable

**TODO**: Create example spec `specs/ckad/rolling-update-config.yaml` demonstrating both parameters

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Max pods above desired count (number or %)
      maxUnavailable: 0  # Max pods unavailable during update (number or %)
```

- **maxSurge**: Maximum number (or %) of Pods created above the desired replica count during an update
- **maxUnavailable**: Maximum number (or %) of Pods that can be unavailable during an update

📋 **CKAD Exam Pattern**: You may need to configure a zero-downtime deployment where `maxUnavailable=0` and `maxSurge=1`.

Try different configurations:

```
# Update deployment with different rolling update parameters
kubectl patch deployment whoami -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":"50%","maxUnavailable":"50%"}}}}'

# Compare rollout speed with conservative settings
kubectl patch deployment whoami -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'

# Trigger an update to see the difference
kubectl set image deployment/whoami app=sixeyed/whoami:21.04.01
```

## Advanced Rollout Management

### Recording Changes

Use `--record` flag (deprecated but still on exam) or annotations to track changes:

```
# Record the command in rollout history (deprecated but may appear on exam)
kubectl set image deployment/whoami app=sixeyed/whoami:21.04.01 --record

# Better approach: use kubernetes.io/change-cause annotation
kubectl annotate deployment/whoami kubernetes.io/change-cause="Updated to version 21.04.01"

# View rollout history with change causes
kubectl rollout history deployment/whoami
```

**TODO**: Create example showing proper annotation usage for change tracking

### Rollout Status and History

Monitor and inspect deployment rollouts:

```
# Check rollout status (blocks until complete)
kubectl rollout status deployment/whoami

# View rollout history
kubectl rollout history deployment/whoami

# View specific revision details
kubectl rollout history deployment/whoami --revision=2

# Describe a deployment to see conditions
kubectl describe deployment whoami
```

### Pausing and Resuming Rollouts

Pause deployments to make multiple changes before rolling out:

```
# Pause the rollout
kubectl rollout pause deployment/whoami

# Make multiple changes without triggering rollouts
kubectl set image deployment/whoami app=sixeyed/whoami:new-version
kubectl set resources deployment/whoami -c=app --limits=cpu=200m,memory=512Mi

# Resume to apply all changes in one rollout
kubectl rollout resume deployment/whoami
```

📋 **CKAD Scenario**: Pause a deployment, make configuration changes, then resume - useful for batching multiple updates.

### Rolling Back

Multiple ways to rollback failed deployments:

```
# Rollback to previous revision
kubectl rollout undo deployment/whoami

# Rollback to specific revision
kubectl rollout undo deployment/whoami --to-revision=2

# Verify the rollback
kubectl rollout status deployment/whoami
kubectl rollout history deployment/whoami
```

**TODO**: Create exercise with broken deployment requiring rollback

## Resource Management

Deployments should specify resource requests and limits for production readiness:

**TODO**: Create example spec `specs/ckad/resources.yaml` with requests and limits

```yaml
spec:
  template:
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
```

Update resources imperatively (useful in exam for speed):

```
# Set resource requests
kubectl set resources deployment/whoami -c=app --requests=cpu=100m,memory=64Mi

# Set resource limits
kubectl set resources deployment/whoami -c=app --limits=cpu=200m,memory=128Mi

# View resource settings
kubectl describe deployment whoami | grep -A 5 Limits
```

📋 **CKAD Critical**: Know the difference between requests (scheduler guarantee) and limits (enforcement boundary).

## Health Checks

Production deployments need health checks to ensure reliable updates:

### Readiness Probes

Readiness probes determine when a Pod is ready to accept traffic:

**TODO**: Create example spec `specs/ckad/readiness-probe.yaml`

```yaml
spec:
  template:
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Liveness Probes

Liveness probes determine when a container needs to be restarted:

**TODO**: Create example spec `specs/ckad/liveness-probe.yaml`

```yaml
spec:
  template:
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 10
          failureThreshold: 3
```

### Startup Probes

Startup probes handle slow-starting containers:

**TODO**: Create example spec `specs/ckad/startup-probe.yaml`

```yaml
spec:
  template:
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04
        startupProbe:
          httpGet:
            path: /health
            port: 80
          failureThreshold: 30
          periodSeconds: 10
```

### Probe Types

All probe types support three check mechanisms:

```yaml
# HTTP GET probe
httpGet:
  path: /health
  port: 80
  httpHeaders:
  - name: Custom-Header
    value: Awesome

# TCP Socket probe
tcpSocket:
  port: 80

# Command execution probe
exec:
  command:
  - cat
  - /tmp/healthy
```

📋 **CKAD Quick Reference**:
- `initialDelaySeconds`: Wait before first probe
- `periodSeconds`: How often to probe
- `timeoutSeconds`: Probe timeout
- `successThreshold`: Consecutive successes to mark healthy
- `failureThreshold`: Consecutive failures to mark unhealthy

**TODO**: Create comprehensive exercise combining all probe types

## Multi-Container Patterns

### Init Containers

Init containers run before app containers and must complete successfully:

**TODO**: Create example spec `specs/ckad/init-containers.yaml`

```yaml
spec:
  template:
    spec:
      initContainers:
      - name: init-service-check
        image: busybox:1.35
        command: ['sh', '-c', 'until nslookup myservice; do echo waiting for myservice; sleep 2; done']
      containers:
      - name: app
        image: sixeyed/whoami:21.04
```

Common init container use cases:
- Wait for dependencies (databases, services)
- Clone git repositories
- Populate volumes with data
- Set permissions on volumes

### Sidecar Containers

Sidecars run alongside the main container throughout the Pod lifecycle:

**TODO**: Create example spec `specs/ckad/sidecar.yaml` with logging sidecar

```yaml
spec:
  template:
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04
      - name: log-shipper
        image: fluent/fluentd:v1.14
        # Sidecar configuration
```

Common sidecar patterns:
- Log shipping and aggregation
- Metrics collection
- Service mesh proxies
- Configuration synchronization

**TODO**: Create exercise requiring init container + sidecar pattern

📋 **CKAD Pattern**: You may need to add a sidecar to an existing deployment for logging/monitoring.

## Advanced Deployment Patterns

### Canary Deployments

Canary deployments run a small percentage of traffic on the new version:

**TODO**: Create complete canary example in `specs/ckad/canary/`

Strategy:
1. Deploy main version with most replicas
2. Deploy canary version with few replicas
3. Both use same Service labels
4. Monitor canary performance
5. Scale up canary, scale down main version

```
# Deploy main version with 3 replicas
kubectl apply -f labs/deployments/specs/ckad/canary/whoami-main.yaml

# Deploy canary with 1 replica (25% traffic)
kubectl apply -f labs/deployments/specs/ckad/canary/whoami-canary.yaml

# Both deployments use app=whoami-canary label
# Service selects both: selector: app: whoami-canary

# Monitor canary
kubectl logs -l version=canary --tail=50

# If successful, scale canary up and main down
kubectl scale deployment/whoami-main --replicas=0
kubectl scale deployment/whoami-canary --replicas=4
```

### Blue-Green Deployments (Advanced)

Production-grade blue-green with full cutover:

**TODO**: Enhance blue-green example from basic lab with:
- Resource requests/limits
- Health checks
- Multiple replicas for HA
- Proper annotations

The basic pattern (from main lab):
1. Run two separate Deployments (blue and green)
2. Service targets one environment via labels
3. Switch traffic by updating Service selector
4. Keep old version running for quick rollback

```
# Deploy both versions
kubectl apply -f labs/deployments/specs/ckad/blue-green/whoami-blue.yaml
kubectl apply -f labs/deployments/specs/ckad/blue-green/whoami-green.yaml

# Service points to blue initially
kubectl apply -f labs/deployments/specs/ckad/blue-green/service-blue.yaml

# Test blue version
curl localhost:8020

# Switch to green
kubectl apply -f labs/deployments/specs/ckad/blue-green/service-green.yaml

# Test green version
curl localhost:8020

# Rollback by reapplying blue service
kubectl apply -f labs/deployments/specs/ckad/blue-green/service-blue.yaml
```

📋 **CKAD Tip**: Blue-green requires careful label management. Practice changing Service selectors quickly.

## Production Best Practices

### Complete Production-Ready Deployment

**TODO**: Create comprehensive production example `specs/ckad/production-ready.yaml` with:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami-production
  labels:
    app: whoami
    tier: frontend
  annotations:
    kubernetes.io/change-cause: "Initial production deployment"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: whoami
  template:
    metadata:
      labels:
        app: whoami
        version: v1
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04
        ports:
        - containerPort: 80
          name: http
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        readinessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 15
          periodSeconds: 10
```

### Deployment Checklist for CKAD

Ensure your deployments include:

- [ ] Appropriate replica count for HA (minimum 2)
- [ ] Resource requests and limits
- [ ] Readiness probe configured
- [ ] Liveness probe configured
- [ ] Appropriate rolling update strategy
- [ ] Meaningful labels for selection
- [ ] Change-cause annotations
- [ ] Container port explicitly named
- [ ] Image version pinned (not :latest)
- [ ] Proper selector matching template labels

## CKAD Lab Exercises

### Exercise 1: Zero-Downtime Deployment

Create a deployment that:
- Runs 3 replicas
- Has zero downtime during updates (maxUnavailable: 0)
- Uses a readiness probe
- Updates from whoami:21.04 to whoami:21.04.01

**TODO**: Create exercise spec and solution

### Exercise 2: Failed Deployment Recovery

Deploy a broken application (wrong image name) and practice:
- Identifying the failure
- Checking rollout status
- Rolling back to previous version
- Verifying recovery

**TODO**: Create broken deployment spec for practice

### Exercise 3: Canary Release

Implement a canary deployment:
- Main deployment: 3 replicas (v1)
- Canary deployment: 1 replica (v2)
- Single service routing to both
- Monitor and complete cutover

**TODO**: Create complete canary exercise with monitoring steps

### Exercise 4: Multi-Container Pattern

Create a deployment with:
- Init container that waits for a dependency
- Main application container
- Sidecar for log collection
- All with proper resource limits

**TODO**: Create multi-container exercise spec

### Exercise 5: Production Deployment

Build a production-ready deployment from scratch with all best practices:
- HA configuration (3 replicas)
- Resource management
- Health checks (readiness, liveness, startup)
- RollingUpdate with proper configuration
- Meaningful labels and annotations

**TODO**: Create from-scratch production exercise (no template)

## Quick Command Reference for CKAD

Common imperative commands for exam speed:

```bash
# Create deployment
kubectl create deployment whoami --image=sixeyed/whoami:21.04 --replicas=3

# Update image
kubectl set image deployment/whoami app=sixeyed/whoami:21.04.01

# Scale deployment
kubectl scale deployment/whoami --replicas=5

# Set resources
kubectl set resources deployment/whoami -c=app --requests=cpu=100m,memory=64Mi --limits=cpu=200m,memory=128Mi

# Expose deployment
kubectl expose deployment whoami --port=80 --target-port=80 --type=LoadBalancer

# Rollout commands
kubectl rollout status deployment/whoami
kubectl rollout history deployment/whoami
kubectl rollout undo deployment/whoami
kubectl rollout pause deployment/whoami
kubectl rollout resume deployment/whoami
kubectl rollout restart deployment/whoami

# Get YAML for modification
kubectl get deployment whoami -o yaml > deployment.yaml

# Patch deployment (for quick changes)
kubectl patch deployment whoami -p '{"spec":{"replicas":5}}'

# Edit in-place (exam tip: set KUBE_EDITOR=nano or vim)
kubectl edit deployment whoami
```

## Common CKAD Exam Scenarios

### Scenario 1: Update Application Version
"Update the deployment 'webapp' to use image version 2.0 with zero downtime"

```bash
kubectl set image deployment/webapp app=webapp:2.0
kubectl rollout status deployment/webapp
```

### Scenario 2: Fix Failed Deployment
"The deployment 'api' is failing to roll out. Rollback to the previous version"

```bash
kubectl rollout status deployment/api
kubectl rollout history deployment/api
kubectl rollout undo deployment/api
```

### Scenario 3: Scale Application
"Scale the deployment 'frontend' to 5 replicas"

```bash
kubectl scale deployment/frontend --replicas=5
```

### Scenario 4: Add Resource Limits
"Add resource limits to deployment 'backend': CPU 200m, Memory 512Mi"

```bash
kubectl set resources deployment/backend -c=backend --limits=cpu=200m,memory=512Mi
```

### Scenario 5: Configure Rolling Update
"Configure deployment 'app' to update one pod at a time with no downtime"

```bash
kubectl patch deployment app -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'
```

**TODO**: Create complete scenario-based exercises matching exam format

## Troubleshooting Deployments

Common issues and debugging steps:

```bash
# Check deployment status
kubectl get deployments
kubectl describe deployment <name>

# Check replica sets
kubectl get replicasets
kubectl describe rs <name>

# Check pod status
kubectl get pods -l app=<label>
kubectl describe pod <name>
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check rollout issues
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>

# Force new rollout (if stuck)
kubectl rollout restart deployment/<name>
```

**TODO**: Create troubleshooting exercise with common failure scenarios

## Study Tips for CKAD

1. **Practice imperative commands** - They're faster in the exam
2. **Use kubectl explain** - `kubectl explain deployment.spec.strategy`
3. **Generate YAML templates** - `kubectl create deployment --dry-run=client -o yaml`
4. **Know the shortcuts** - `deploy`, `rs`, `po`, `svc`
5. **Practice typing** - Speed matters in the exam
6. **Bookmark the docs** - You can use https://kubernetes.io/docs during exam
7. **Use kubectl cheat sheet** - Allowed during exam

## Additional Resources

- [Kubernetes Deployments Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Rolling Update Strategy](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)

## Cleanup

```bash
kubectl delete deployment,svc -l kubernetes.courselabs.co=deployments-ckad
```

---

> Return to [basic deployments lab](README.md) | Check [solution examples](solution-ckad.md)
