# Deployments - CKAD Exam Preparation Script

**Duration:** 25-30 minutes
**Format:** Screen recording with live demonstration
**Focus:** CKAD exam scenarios and advanced deployment techniques

---

## Opening

Welcome to the CKAD-focused session on Deployments. In this video, we'll go beyond the basics and cover everything you need to master Deployments for the Certified Kubernetes Application Developer exam.

The CKAD exam tests your ability to work quickly and accurately with production-ready configurations. For Deployments, this means understanding deployment strategies, health checks, resource management, advanced rollout controls, and various deployment patterns.

Let's dive into these advanced topics with practical examples.

## Deployment Strategies Overview

Kubernetes supports two deployment strategies, and you need to know both for the exam.

The **RollingUpdate strategy** is the default. It gradually replaces old Pods with new ones, ensuring some are always available. This is what we used in the exercises video.

The **Recreate strategy** terminates all Pods before creating new ones. This causes downtime but ensures old and new versions never run simultaneously.

Let's see both in action.

## RollingUpdate Strategy Configuration

First, let's create a Deployment with explicit RollingUpdate configuration.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami-rolling
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: whoami-rolling
  template:
    metadata:
      labels:
        app: whoami-rolling
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04
```

The key section is the **strategy**:
- **type: RollingUpdate** - explicitly sets the strategy
- **maxSurge: 1** - at most 1 extra Pod during updates (25% is default)
- **maxUnavailable: 1** - at most 1 Pod can be unavailable (25% is default)

With 4 replicas, maxSurge=1 means we'll have at most 5 Pods during updates, and maxUnavailable=1 means at least 3 must be available.

```powershell
kubectl apply -f strategy-rolling.yaml
```

Let's verify it's running.

```powershell
kubectl get deployment whoami-rolling
```

Perfect! Four replicas running. Now let's trigger an update to see the strategy in action.

I'll open a watch window first.

```powershell
kubectl get pods -l app=whoami-rolling --watch
```

And update the image in another terminal.

```powershell
kubectl set image deployment/whoami-rolling app=sixeyed/whoami:21.04.01
```

Watch the pattern:
- One new Pod is created (maxSurge=1)
- Once it's ready, one old Pod is terminated
- Another new Pod is created
- This continues until all Pods are updated

At no point did we have fewer than 3 Pods available (4 - maxUnavailable).

## Zero-Downtime Configuration

For critical applications, you want absolute zero downtime. Set maxUnavailable to 0.

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

This guarantees:
- All 4 Pods remain available during updates
- We temporarily have 5 Pods (4 + maxSurge)
- Only after a new Pod is ready does an old one terminate

This is a common exam scenario: "Ensure zero downtime during deployments."

Let me update the Deployment with this configuration.

```powershell
kubectl patch deployment whoami-rolling -p '{"spec":{"strategy":{"rollingUpdate":{"maxUnavailable":0}}}}'
```

Now trigger another update.

```powershell
kubectl set image deployment/whoami-rolling app=sixeyed/whoami:21.04
```

Watch carefully - you'll see 5 Pods momentarily. The extra Pod must become ready before any old Pod is removed. This is your zero-downtime guarantee.

## Recreate Strategy

Now let's see the Recreate strategy. This is used when you can't have multiple versions running simultaneously.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami-recreate
spec:
  replicas: 3
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: whoami-recreate
  template:
    metadata:
      labels:
        app: whoami-recreate
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04
```

The strategy is simply **type: Recreate** - no additional parameters needed.

```powershell
kubectl apply -f strategy-recreate.yaml
```

Wait for it to be ready, then watch for the update.

```powershell
kubectl get pods -l app=whoami-recreate --watch
```

Trigger an update.

```powershell
kubectl set image deployment/whoami-recreate app=sixeyed/whoami:21.04.01
```

Notice the difference:
- All three Pods terminate immediately
- Only after termination do new Pods get created
- There's a period with zero Pods running

This causes downtime but is necessary when:
- Your application uses a database schema that changes
- You're releasing exclusive resources like file locks
- The old and new versions can't share the same database
- You have resource constraints preventing both versions

For the exam, know when each strategy is appropriate.

## Advanced Rollout Management

Let's explore advanced rollout controls that are exam topics.

### Recording Changes with Annotations

Kubernetes tracks why changes were made using annotations. The --record flag is deprecated, so use annotations instead.

```powershell
kubectl annotate deployment whoami-rolling kubernetes.io/change-cause="Updated to version 21.04.01 for bug fix"
```

Now check the rollout history.

```powershell
kubectl rollout history deployment/whoami-rolling
```

You'll see the change cause in the CHANGE-CAUSE column. This is valuable for tracking what changed and why.

### Pausing and Resuming Rollouts

You can pause a Deployment to make multiple changes before rolling them out together.

```powershell
kubectl rollout pause deployment/whoami-rolling
```

Now make several changes.

```powershell
kubectl set image deployment/whoami-rolling app=sixeyed/whoami:21.04.02
kubectl set resources deployment/whoami-rolling -c=app --limits=cpu=200m,memory=128Mi
```

Check the Pods.

```powershell
kubectl get pods -l app=whoami-rolling
```

Nothing changed! The Deployment is paused.

Now resume to apply all changes in one rollout.

```powershell
kubectl rollout resume deployment/whoami-rolling
```

Watch the update.

```powershell
kubectl rollout status deployment/whoami-rolling
```

Both changes (image and resources) applied in a single rollout. This is useful when you need to batch multiple updates.

### Checking Rollout Status

The rollout status command blocks until the rollout completes.

```powershell
kubectl rollout status deployment/whoami-rolling
```

When it says "successfully rolled out," the update is complete and all Pods are ready.

For exam scripts, this ensures commands wait for completion before proceeding.

### Rolling Back to Specific Revisions

You can roll back to any previous revision, not just the previous one.

```powershell
kubectl rollout history deployment/whoami-rolling
```

Let's say we want to roll back to revision 2.

```powershell
kubectl rollout undo deployment/whoami-rolling --to-revision=2
```

This jumps directly to that specific configuration. Very useful when you need to skip over several bad releases.

## Resource Management

Production Deployments must include resource requests and limits. This is critical for the exam.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: resource-demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: resource-demo
  template:
    metadata:
      labels:
        app: resource-demo
    spec:
      containers:
      - name: app
        image: nginx
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
```

The **requests** section guarantees minimum resources:
- 64 MiB of memory
- 100 millicores (0.1 CPU cores)

The **limits** section caps maximum usage:
- 128 MiB of memory
- 200 millicores (0.2 CPU cores)

```powershell
kubectl apply -f resource-demo.yaml
```

For the exam, you can set resources imperatively to save time.

```powershell
kubectl set resources deployment/resource-demo -c=app --requests=cpu=100m,memory=64Mi --limits=cpu=200m,memory=128Mi
```

This is much faster than editing YAML during the exam.

Let's verify the resources were set.

```powershell
kubectl describe deployment resource-demo | grep -A 5 Limits
```

Perfect! You can see both requests and limits.

Understanding QoS classes is also exam material. Let's check.

```powershell
kubectl describe pod -l app=resource-demo | grep "QoS Class"
```

The QoS Class is "Burstable" because requests are less than limits. For "Guaranteed" QoS, requests must equal limits for all resources.

## Health Checks for Zero-Downtime

Readiness probes are critical for zero-downtime deployments. Let's create a Deployment with proper health checks.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: probe-demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: probe-demo
  template:
    metadata:
      labels:
        app: probe-demo
    spec:
      containers:
      - name: app
        image: nginx
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 10
```

The **readinessProbe** determines when a Pod can receive traffic:
- HTTP GET to / on port 80
- Waits 5 seconds before first check
- Checks every 5 seconds
- Pod removed from Service endpoints if it fails

The **livenessProbe** determines when to restart:
- Same HTTP check
- Waits 15 seconds (longer initial delay)
- Checks every 10 seconds
- Restarts the container if it fails

```powershell
kubectl apply -f probe-demo.yaml
```

Let's watch the Pods during creation.

```powershell
kubectl get pods -l app=probe-demo --watch
```

Notice the Pods show 0/1 ready initially, then switch to 1/1 after the readiness probe succeeds. This is crucial - without readiness probes, Pods receive traffic immediately, even if they're not ready.

During rolling updates, new Pods won't receive traffic until the readiness probe passes. This ensures zero downtime.

For the exam, know all three probe types:

**HTTP GET probe:**
```yaml
httpGet:
  path: /health
  port: 8080
```

**TCP Socket probe:**
```yaml
tcpSocket:
  port: 8080
```

**Exec probe:**
```yaml
exec:
  command:
  - cat
  - /tmp/healthy
```

Practice creating all three quickly.

## Production-Ready Deployment

Let's combine everything into a production-ready Deployment that would pass any exam scenario.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: production-app
  annotations:
    kubernetes.io/change-cause: "Initial production deployment v1.0"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: production-app
  template:
    metadata:
      labels:
        app: production-app
        version: v1.0
    spec:
      containers:
      - name: app
        image: nginx:1.21
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

This Deployment has everything:
- Appropriate replica count for HA
- Zero-downtime rolling update strategy
- Resource requests and limits
- Readiness probe for traffic management
- Liveness probe for auto-healing
- Named port for clarity
- Pinned image version
- Change-cause annotation
- Meaningful labels

```powershell
kubectl apply -f production-ready.yaml
```

This is your template for exam questions asking for "production-ready" Deployments.

## Canary Deployment Pattern

Canary deployments are an advanced pattern tested in the exam. You run a small percentage of traffic on the new version to test it.

The strategy: Create two Deployments with different replica counts, both selected by the same Service.

First, the main Deployment with most replicas.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami-main
spec:
  replicas: 3
  selector:
    matchLabels:
      app: whoami-canary
      version: main
  template:
    metadata:
      labels:
        app: whoami-canary
        version: main
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04
```

Then the canary Deployment with fewer replicas.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: whoami-canary
      version: canary
  template:
    metadata:
      labels:
        app: whoami-canary
        version: canary
    spec:
      containers:
      - name: app
        image: sixeyed/whoami:21.04.01
        env:
        - name: WHOAMI_MODE
          value: q
```

Both use the label "app=whoami-canary" but different "version" labels.

The Service selects only the app label, not the version.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: whoami-canary
spec:
  selector:
    app: whoami-canary
  ports:
  - port: 80
  type: LoadBalancer
```

```powershell
kubectl apply -f canary-main.yaml
kubectl apply -f canary-canary.yaml
kubectl apply -f canary-service.yaml
```

Check what we created.

```powershell
kubectl get pods -l app=whoami-canary
```

We have 4 total Pods: 3 main, 1 canary. The Service distributes traffic proportionally - about 75% to main, 25% to canary.

Let's test it.

```powershell
for i in {1..10}; do curl -s http://localhost:8080 | grep -i version; done
```

You'll see mostly full responses (main version) with occasional short responses (canary). That's the canary receiving about 25% of traffic.

If the canary performs well, promote it:

```powershell
kubectl scale deployment/whoami-main --replicas=0
kubectl scale deployment/whoami-canary --replicas=4
```

Now 100% of traffic goes to the canary version. If there are issues, quickly scale back:

```powershell
kubectl scale deployment/whoami-main --replicas=3
kubectl scale deployment/whoami-canary --replicas=1
```

This pattern gives you production traffic testing with minimal risk.

## Quick Command Reference for CKAD

Let me show you time-saving imperative commands for the exam.

Create a Deployment quickly:

```powershell
kubectl create deployment myapp --image=nginx --replicas=3
```

This generates a basic Deployment. You can save it to YAML for editing:

```powershell
kubectl create deployment myapp --image=nginx --replicas=3 --dry-run=client -o yaml > deployment.yaml
```

Update the image:

```powershell
kubectl set image deployment/myapp nginx=nginx:1.21
```

Scale:

```powershell
kubectl scale deployment/myapp --replicas=5
```

Set resources:

```powershell
kubectl set resources deployment/myapp -c=nginx --requests=cpu=100m,memory=64Mi --limits=cpu=200m,memory=128Mi
```

Expose as a Service:

```powershell
kubectl expose deployment myapp --port=80 --type=LoadBalancer
```

Check rollout status:

```powershell
kubectl rollout status deployment/myapp
```

View history:

```powershell
kubectl rollout history deployment/myapp
```

Rollback:

```powershell
kubectl rollout undo deployment/myapp
```

Restart all Pods (triggers rollout):

```powershell
kubectl rollout restart deployment/myapp
```

Patch specific fields:

```powershell
kubectl patch deployment myapp -p '{"spec":{"replicas":5}}'
```

These commands are much faster than editing YAML during the exam.

## Common CKAD Exam Scenarios

Let me walk through typical exam scenarios.

### Scenario 1: Zero-Downtime Update

"Update the deployment 'webapp' to use nginx:1.21 with zero downtime."

```powershell
# Option 1: Ensure strategy is set
kubectl patch deployment webapp -p '{"spec":{"strategy":{"rollingUpdate":{"maxUnavailable":0}}}}'
kubectl set image deployment/webapp nginx=nginx:1.21

# Option 2: Check existing strategy
kubectl get deployment webapp -o yaml | grep -A 5 strategy
# If already configured, just update
kubectl set image deployment/webapp nginx=nginx:1.21
kubectl rollout status deployment/webapp
```

### Scenario 2: Fix Failed Deployment

"The deployment 'api' failed to roll out. Investigate and fix."

```powershell
# Check status
kubectl rollout status deployment/api

# Check events
kubectl describe deployment api

# Check Pod status
kubectl get pods -l app=api
kubectl describe pod <failing-pod>

# If it's a bad image, rollback
kubectl rollout undo deployment/api

# Verify rollback
kubectl rollout status deployment/api
```

### Scenario 3: Production-Ready Configuration

"Create a production-ready deployment 'frontend' with nginx:1.21, 3 replicas, resource limits, and health checks."

```powershell
# Generate base YAML
kubectl create deployment frontend --image=nginx:1.21 --replicas=3 --dry-run=client -o yaml > frontend.yaml

# Edit to add resources, probes, strategy
# (In exam, quickly type these sections)

# Apply
kubectl apply -f frontend.yaml

# Verify
kubectl get deployment frontend
kubectl describe deployment frontend
```

### Scenario 4: Canary Deployment

"Deploy a canary version of 'backend' with 20% traffic to the new version."

```powershell
# Existing deployment has 4 replicas
# Create canary with 1 replica (20% of 5 total)
kubectl create deployment backend-canary --image=myapp:v2 --replicas=1 --dry-run=client -o yaml > canary.yaml

# Edit labels to match main deployment's Service
# Apply and test
kubectl apply -f canary.yaml

# Monitor logs
kubectl logs -l version=canary --tail=50 -f

# If successful, scale up canary and down main
kubectl scale deployment/backend --replicas=0
kubectl scale deployment/backend-canary --replicas=4
```

### Scenario 5: Resource Management

"Add resource limits to 'worker' deployment: CPU 500m, Memory 256Mi."

```powershell
kubectl set resources deployment/worker -c=worker --limits=cpu=500m,memory=256Mi

# Verify
kubectl describe deployment worker | grep -A 5 Limits
```

## Troubleshooting Tips

Quick debugging steps for exam scenarios:

Check Deployment status:
```powershell
kubectl get deployments
kubectl describe deployment <name>
```

Check ReplicaSets:
```powershell
kubectl get rs
kubectl describe rs <name>
```

Check Pods:
```powershell
kubectl get pods -l app=<label>
kubectl describe pod <name>
kubectl logs <name>
```

Check rollout issues:
```powershell
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
```

Common failure reasons:
- **ImagePullBackOff**: Wrong image name or registry auth
- **CrashLoopBackOff**: Container keeps failing
- **Pending**: Resource constraints or scheduling issues
- **Rollout stuck**: Check readiness probes and events

Force a new rollout:
```powershell
kubectl rollout restart deployment/<name>
```

## Cleanup

Let's clean up all the resources we created.

```powershell
kubectl delete deployment --all
kubectl delete service --all
```

## CKAD Exam Tips Summary

**Time Management:**
- Use kubectl create to generate YAML quickly
- Use imperative commands when possible
- Practice typing resource limits and probes from memory
- Set your editor: export KUBE_EDITOR=nano

**Must-Know Commands:**
- kubectl create deployment
- kubectl set image
- kubectl scale
- kubectl set resources
- kubectl rollout status/history/undo
- kubectl expose

**Key Concepts:**
- Zero downtime requires maxUnavailable: 0
- Readiness probes prevent traffic to unready Pods
- Liveness probes restart unhealthy containers
- Requests guarantee resources, limits cap them
- ReplicaSets implement updates
- Rollbacks just scale old ReplicaSets back up

**Common Requirements:**
- Production-ready means: replicas ≥ 2, resources set, probes configured, rolling update strategy
- Zero downtime means: maxUnavailable: 0, readiness probes
- Canary means: two Deployments, same Service selector
- Blue-green means: two Deployments, Service selector controls traffic

**Documentation:**
- You can access kubernetes.io/docs during exam
- Bookmark key pages beforehand
- Search for "deployment" and use examples
- kubectl explain is allowed: kubectl explain deployment.spec.strategy

## Practice Exercise

Here's a comprehensive exercise combining multiple concepts:

Create a production-ready deployment named "shop" that:
1. Runs nginx:1.21 with 3 replicas
2. Has zero-downtime updates configured
3. Includes CPU request 100m, limit 200m
4. Includes memory request 64Mi, limit 128Mi
5. Has HTTP readiness probe on port 80, path /
6. Has HTTP liveness probe with 15s initial delay
7. Uses RollingUpdate with maxSurge 1
8. Has proper labels: app=shop, tier=frontend

Pause the video and create this from scratch. Time yourself - in the exam, this should take 3-5 minutes.

## Summary

In this video, we covered all advanced Deployment topics for the CKAD exam:

- RollingUpdate and Recreate strategies with configuration
- Zero-downtime deployments with maxUnavailable: 0
- Advanced rollout management (pause, resume, annotations)
- Resource requests and limits with imperative commands
- Readiness and liveness probes for production reliability
- Production-ready Deployment checklist
- Canary deployment pattern for testing in production
- Time-saving imperative commands
- Common exam scenarios with solutions
- Troubleshooting techniques

## Final Advice

Practice is key. Set up scenarios and time yourself:
- Can you create a basic Deployment in 30 seconds?
- Can you add resources and probes in 2 minutes?
- Can you troubleshoot a failing rollout in 1 minute?

The exam is performance-based. Knowing the concepts isn't enough - you must execute quickly and accurately.

Keep practicing, use the official docs during practice, and familiarize yourself with kubectl explain.

Good luck with your CKAD exam!

---

## Recording Notes

**Screen Setup:**
- Terminal full screen for most demonstrations
- Split terminal when watching updates
- Clear, large font (16pt minimum)
- Use terminal colors to distinguish output

**Key Demonstrations:**
1. RollingUpdate with maxSurge/maxUnavailable visible behavior
2. Recreate strategy showing downtime period
3. Pause/resume with multiple changes
4. Resource limits with describe output
5. Readiness probes preventing premature traffic
6. Canary deployment with traffic distribution
7. Quick command sequences for common scenarios

**Exam Tips to Emphasize:**
- Speed matters - practice until commands are automatic
- Imperative commands save time
- kubectl explain is your friend
- Read questions carefully - they have multiple requirements
- Verify your work before moving on
- Bookmark docs pages before exam

**Common Mistakes to Address:**
- Forgetting maxUnavailable: 0 for zero downtime
- Not waiting for rollout status before proceeding
- Wrong container name in set resources command
- Readiness vs liveness probe confusion
- Requests vs limits reversed

**Practice Drills to Suggest:**
- Create production Deployment in under 5 minutes
- Update and verify in under 2 minutes
- Troubleshoot and rollback in under 3 minutes
- Set up canary deployment in under 5 minutes

**Timing Breakdown:**
- Opening: 2 min
- RollingUpdate configuration: 4 min
- Zero-downtime setup: 3 min
- Recreate strategy: 3 min
- Advanced rollout controls: 5 min
- Resource management: 3 min
- Health checks: 4 min
- Production-ready example: 3 min
- Canary deployment: 5 min
- Quick commands: 4 min
- Exam scenarios: 6 min
- Troubleshooting: 3 min
- Tips and summary: 3 min

**Total: ~48 minutes**

**Visual Emphasis:**
- Highlight key YAML sections
- Show side-by-side Pod counts during updates
- Display timing of rollout status
- Show proportion of canary traffic clearly
- Use clear prompts for command sequences
