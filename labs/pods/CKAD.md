# Pods - CKAD Requirements

This document covers the CKAD (Certified Kubernetes Application Developer) exam requirements for Pods, building on the basics covered in [README.md](README.md).

## CKAD Exam Requirements

The CKAD exam expects you to understand and implement:
- Multi-container Pod patterns (sidecar, ambassador, adapter)
- Init containers
- Resource requests and limits
- Liveness, readiness, and startup probes
- Environment variables and configuration
- Security contexts
- Pod scheduling (node selectors, affinity, taints/tolerations)
- Pod lifecycle and restart policies

## Multi-Container Pods

Pods can run multiple containers that work together. Common patterns include:

### Sidecar Pattern

The sidecar pattern runs a helper container alongside the main application container.

> **TODO**: Add example spec for sidecar pattern (e.g., main app + logging sidecar)

```yaml
# Example: web app with log processor sidecar
apiVersion: v1
kind: Pod
metadata:
  name: web-with-sidecar
spec:
  containers:
  - name: web-app
    image: nginx
    # TODO: Add volume mount for logs
  - name: log-processor
    image: busybox
    # TODO: Add volume mount and processing command
  # TODO: Add shared volume definition
```

📋 Create and deploy a multi-container Pod with a sidecar pattern.

### Ambassador Pattern

The ambassador pattern uses a proxy container to simplify connectivity for the main container.

> **TODO**: Add example spec for ambassador pattern (e.g., app + proxy to external service)

### Adapter Pattern

The adapter pattern transforms the output of the main container to match a standard format.

> **TODO**: Add example spec for adapter pattern (e.g., app with custom logs + adapter to standard format)

## Init Containers

Init containers run before the main application containers and are often used for setup tasks.

> **TODO**: Add example spec showing init container use case (e.g., database migration, config setup)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
spec:
  initContainers:
  - name: init-setup
    image: busybox
    command: ['sh', '-c', 'echo Initializing... && sleep 5']
  containers:
  - name: app
    image: nginx
```

Key characteristics:
- Init containers run to completion before app containers start
- They run sequentially in the order defined
- If an init container fails, the Pod restarts (subject to restart policy)

📋 Create a Pod with an init container that checks for a service availability before starting the main app.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution showing nslookup or wget check in init container

</details><br/>

## Resource Requests and Limits

Resource management is critical for CKAD. You must understand:
- **Requests**: Minimum resources guaranteed to the container
- **Limits**: Maximum resources the container can use

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

> **TODO**: Add example showing what happens when container exceeds memory limit (OOMKilled)

📋 Create a Pod that requests 100m CPU and 128Mi memory, with limits of 200m CPU and 256Mi memory.

### Quality of Service (QoS) Classes

Kubernetes assigns QoS classes based on resource configuration:
- **Guaranteed**: Requests = Limits for all containers
- **Burstable**: At least one container has requests or limits set
- **BestEffort**: No requests or limits set

> **TODO**: Add examples showing how to identify QoS class using `kubectl describe pod`

## Health Probes

Health probes monitor container health and are essential for production workloads.

### Liveness Probe

Restarts the container if the probe fails.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: liveness-demo
spec:
  containers:
  - name: app
    image: nginx
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 3
      periodSeconds: 3
```

> **TODO**: Add example showing liveness probe with exec command

### Readiness Probe

Removes Pod from service endpoints if the probe fails (doesn't restart).

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: readiness-demo
spec:
  containers:
  - name: app
    image: nginx
    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
```

### Startup Probe

Allows slow-starting containers more time before liveness checks begin.

> **TODO**: Add example spec showing startup probe use case

📋 Create a Pod with both liveness and readiness probes using different methods (httpGet, exec, tcpSocket).

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution showing all three probe types

</details><br/>

## Environment Variables and Configuration

### Basic Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: env-demo
spec:
  containers:
  - name: app
    image: nginx
    env:
    - name: ENVIRONMENT
      value: "production"
    - name: LOG_LEVEL
      value: "info"
```

### Environment Variables from ConfigMaps

> **TODO**: Add example showing envFrom and valueFrom with ConfigMap

### Environment Variables from Secrets

> **TODO**: Add example showing env vars populated from Secrets

📋 Create a Pod that uses environment variables from both ConfigMap and Secret.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution with ConfigMap, Secret, and Pod consuming both

</details><br/>

## Security Contexts

Security contexts define privilege and access control settings.

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
  name: security-demo-2
spec:
  containers:
  - name: app
    image: nginx
    securityContext:
      allowPrivilegeEscalation: false
      runAsNonRoot: true
      runAsUser: 1000
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
```

> **TODO**: Add example showing read-only root filesystem

📋 Create a Pod that runs as non-root user with a read-only root filesystem.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution showing non-root user + readOnlyRootFilesystem

</details><br/>

## Service Accounts

Every Pod runs with a service account that determines API access permissions.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sa-demo
spec:
  serviceAccountName: my-service-account
  containers:
  - name: app
    image: nginx
```

> **TODO**: Add example showing how to create service account and verify Pod is using it

📋 Create a custom service account and assign it to a Pod.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution with ServiceAccount creation and Pod assignment

</details><br/>

## Pod Scheduling

### Node Selectors

Simple node selection based on labels.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: node-selector-demo
spec:
  nodeSelector:
    disktype: ssd
  containers:
  - name: app
    image: nginx
```

### Node Affinity

More expressive node selection with required and preferred rules.

> **TODO**: Add example showing requiredDuringSchedulingIgnoredDuringExecution

> **TODO**: Add example showing preferredDuringSchedulingIgnoredDuringExecution

### Pod Affinity and Anti-Affinity

Controls Pod placement relative to other Pods.

> **TODO**: Add example showing pod affinity (schedule near certain Pods)

> **TODO**: Add example showing pod anti-affinity (spread Pods across nodes)

### Taints and Tolerations

> **TODO**: Add example showing how to add tolerations to schedule on tainted nodes

📋 Create a Pod with node affinity that requires SSD disk and prefers nodes in us-west region.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution with node affinity rules

</details><br/>

## Pod Lifecycle and Restart Policies

### Restart Policies

Kubernetes supports three restart policies:
- **Always** (default): Always restart the container
- **OnFailure**: Restart only if container exits with error
- **Never**: Never restart the container

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: restart-demo
spec:
  restartPolicy: OnFailure
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'exit 1']
```

### Pod Lifecycle Hooks

> **TODO**: Add example showing postStart hook

> **TODO**: Add example showing preStop hook

📋 Create a Pod with preStop hook that performs graceful shutdown.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution showing preStop hook implementation

</details><br/>

## Labels and Annotations

Labels are used for organization and selection; annotations store non-identifying metadata.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: labels-demo
  labels:
    app: myapp
    tier: frontend
    environment: production
    version: v1.2.3
  annotations:
    description: "Main application frontend"
    owner: "platform-team@company.com"
spec:
  containers:
  - name: app
    image: nginx
```

📋 Create three Pods with different labels, then use label selectors to query them.

<details>
  <summary>Not sure how?</summary>

```powershell
# Get pods with specific label
kubectl get pods -l app=myapp

# Get pods with label key
kubectl get pods -l environment

# Get pods with multiple label conditions
kubectl get pods -l 'app=myapp,tier=frontend'

# Get pods with label value in set
kubectl get pods -l 'environment in (production,staging)'
```

</details><br/>

## Container Lifecycle Commands

Override container commands and arguments.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: command-demo
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c"]
    args: ["echo Hello from the pod && sleep 3600"]
```

Understanding the relationship between Dockerfile and Pod spec:
- `command` in Pod spec overrides `ENTRYPOINT` in Dockerfile
- `args` in Pod spec overrides `CMD` in Dockerfile

> **TODO**: Add example showing various combinations of command/args

## Lab Exercises

### Exercise 1: Multi-Container Pod

Create a Pod with two containers:
1. An nginx web server
2. A sidecar container that fetches content every 30 seconds

The containers should share a volume where the sidecar writes content and nginx serves it.

> **TODO**: Add detailed requirements and solution

### Exercise 2: Resource Management

Create a Pod that demonstrates resource limits by:
1. Setting memory limit to 64Mi
2. Attempting to allocate more memory than the limit
3. Observing the OOMKilled behavior

> **TODO**: Add stress test example and solution

### Exercise 3: Health Checks

Create a Pod with:
- Startup probe with 30 second grace period
- Liveness probe that checks HTTP endpoint
- Readiness probe that checks a file exists

> **TODO**: Add complete exercise with solution

### Exercise 4: Security Hardening

Create a Pod that follows security best practices:
- Runs as non-root user
- Uses read-only root filesystem
- Drops all capabilities except necessary ones
- Uses a custom service account

> **TODO**: Add complete exercise with solution

### Exercise 5: Advanced Scheduling

Create Pods that demonstrate:
1. Node affinity with required and preferred rules
2. Pod affinity (schedule with certain Pods)
3. Pod anti-affinity (spread across nodes)

> **TODO**: Add complete exercise with solution

## Common CKAD Scenarios

### Scenario 1: Debug a Failing Pod

> **TODO**: Add troubleshooting scenario with misconfigured probes

### Scenario 2: Update Environment Variables

> **TODO**: Add scenario showing how to update Pod with new env vars

### Scenario 3: Fix Resource Issues

> **TODO**: Add scenario with OOMKilled or CPU throttling

## Quick Reference Commands

```powershell
# Create Pod from YAML
kubectl apply -f pod.yaml

# Get Pod with labels shown
kubectl get pods --show-labels

# Filter Pods by label
kubectl get pods -l app=myapp

# Get Pod YAML
kubectl get pod mypod -o yaml

# Edit Pod (limited fields)
kubectl edit pod mypod

# Delete and recreate Pod
kubectl delete pod mypod
kubectl apply -f pod.yaml

# Describe Pod (events, conditions, status)
kubectl describe pod mypod

# Get Pod logs
kubectl logs mypod
kubectl logs mypod -c container-name  # specific container

# Execute command in Pod
kubectl exec mypod -- command
kubectl exec -it mypod -- sh

# Get Pod with custom columns
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,IP:.status.podIP

# Watch Pod status
kubectl get pods -w

# Get Pod resource usage
kubectl top pod mypod

# Port forward to Pod
kubectl port-forward mypod 8080:80

# Copy files to/from Pod
kubectl cp mypod:/path/to/file ./local-file
kubectl cp ./local-file mypod:/path/to/file
```

## Cleanup

Remove all Pods created in these exercises:

```powershell
kubectl delete pod --all
```

> Or use label selectors to remove specific Pods:

```powershell
kubectl delete pod -l exercise=ckad
```

---

## Next Steps

After mastering Pods, continue with these CKAD topics:
- [ConfigMaps](../configmaps/CKAD.md) - Configuration management
- [Secrets](../secrets/CKAD.md) - Secure configuration
- [Deployments](../deployments/CKAD.md) - Application deployment and scaling
- [Services](../services/CKAD.md) - Networking and load balancing
