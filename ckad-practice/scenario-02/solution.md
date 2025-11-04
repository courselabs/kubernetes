# Scenario 2 Solution: Multi-Container Application

## Solution Overview

This scenario tests multi-container Pod patterns, shared volumes (emptyDir), and Secrets management.

## Step-by-Step Solution

### Step 1: Create the Namespace (30 seconds)

```bash
kubectl create namespace logging-app
```

### Step 2: Create the Secret (1.5 minutes)

Using imperative command:

```bash
kubectl create secret generic db-credentials \
  --from-literal=DB_USERNAME=admin \
  --from-literal=DB_PASSWORD='s3cr3tP@ssw0rd' \
  --from-literal=DB_HOST=postgres.default.svc.cluster.local \
  -n logging-app
```

Or create YAML file (`solution/secret.yaml`):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: logging-app
type: Opaque
stringData:
  DB_USERNAME: admin
  DB_PASSWORD: s3cr3tP@ssw0rd
  DB_HOST: postgres.default.svc.cluster.local
```

### Step 3: Create the Multi-Container Pod (8 minutes)

Create file `solution/pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-logging
  namespace: logging-app
  labels:
    app: logging
    type: multi-container
spec:
  containers:
  - name: app
    image: busybox:1.36
    command:
    - sh
    - -c
    - "while true; do echo $(date) - Application log message >> /var/log/app.log; sleep 5; done"
    volumeMounts:
    - name: log-volume
      mountPath: /var/log
    envFrom:
    - secretRef:
        name: db-credentials
  - name: log-processor
    image: busybox:1.36
    command:
    - sh
    - -c
    - "tail -f /var/log/app.log | grep 'Application'"
    volumeMounts:
    - name: log-volume
      mountPath: /var/log
  volumes:
  - name: log-volume
    emptyDir: {}
```

Apply the Pod:

```bash
kubectl apply -f solution/pod.yaml
```

### Step 4: Verify (5 minutes)

```bash
# Check Pod status
kubectl get pod app-with-logging -n logging-app

# Wait for both containers to be ready
kubectl wait --for=condition=Ready pod/app-with-logging -n logging-app --timeout=60s

# View app container logs
kubectl logs app-with-logging -n logging-app -c app --tail=5

# View log-processor sidecar logs
kubectl logs app-with-logging -n logging-app -c log-processor --tail=5

# Verify environment variables
kubectl exec app-with-logging -n logging-app -c app -- env | grep DB_

# Check shared volume
kubectl exec app-with-logging -n logging-app -c app -- ls -l /var/log/app.log
kubectl exec app-with-logging -n logging-app -c log-processor -- ls -l /var/log/app.log
```

## Complete YAML Files

Deploy the complete solution:

```bash
kubectl apply -f solution/
```

Files included:
- `solution/namespace.yaml` - Namespace definition
- `solution/secret.yaml` - Secret with database credentials
- `solution/pod.yaml` - Multi-container Pod with shared volume

## Key Learning Points

1. **Multi-Container Pods**: Multiple containers in the same Pod share network and can share volumes
2. **Sidecar Pattern**: Log-processor is a sidecar that augments the main application
3. **Shared Volumes**: emptyDir volumes are shared between containers in the same Pod
4. **Secret Management**: Use Secrets for sensitive data, not ConfigMaps
5. **Container Commands**: Use array format for commands in YAML

## Common Mistakes

- ❌ Creating separate Pods instead of multi-container Pod
- ❌ Not mounting volume in both containers
- ❌ Using different volume names in containers
- ❌ Exposing secrets in ConfigMaps or as plain environment variables
- ❌ Incorrect command format (using string instead of array)
- ❌ Not waiting for Pod to be ready before verification

## Multi-Container Patterns

This scenario demonstrates the **Sidecar Pattern**. Other common patterns:

- **Ambassador**: Proxy container that simplifies network access
- **Adapter**: Transform output to a common format
- **Init Container**: Run before app containers (not covered here)

## Time Breakdown

| Task | Estimated Time | Actual Time |
|------|----------------|-------------|
| Namespace | 30 sec | ___ |
| Secret | 1.5 min | ___ |
| Pod YAML | 8 min | ___ |
| Verification | 5 min | ___ |
| **Total** | **~15 min** | ___ |
