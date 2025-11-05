# Scenario 1 Solution: Web Application Deployment

## Solution Overview

This scenario tests basic Kubernetes resource creation: Namespaces, ConfigMaps, Deployments, and Services.

## Step-by-Step Solution

### Step 1: Create the Namespace (30 seconds)

```bash
kubectl create namespace webapp-ns
```

### Step 2: Create the ConfigMap (1 minute)

Using imperative command:

```bash
kubectl create configmap webapp-config \
  --from-literal=APP_MODE=production \
  --from-literal=LOG_LEVEL=info \
  --from-literal=MAX_CONNECTIONS=100 \
  -n webapp-ns
```

Or create a YAML file (`specs/configmap.yaml`):

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webapp-config
  namespace: webapp-ns
data:
  APP_MODE: production
  LOG_LEVEL: info
  MAX_CONNECTIONS: "100"
```

```bash
kubectl apply -f specs/configmap.yaml
```

### Step 3: Create the Deployment (5 minutes)

Generate template and edit:

```bash
kubectl create deployment webapp \
  --image=nginx:1.21-alpine \
  --replicas=3 \
  -n webapp-ns \
  --dry-run=client -o yaml > specs/deployment.yaml
```

Edit the file to add ConfigMap, labels, and resource limits (`specs/deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  namespace: webapp-ns
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
      tier: frontend
  template:
    metadata:
      labels:
        app: webapp
        tier: frontend
    spec:
      containers:
      - name: nginx
        image: nginx:1.21-alpine
        envFrom:
        - configMapRef:
            name: webapp-config
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
```

```bash
kubectl apply -f specs/deployment.yaml
```

### Step 4: Create the Service (2 minutes)

Using imperative command:

```bash
kubectl expose deployment webapp \
  --name=webapp-svc \
  --port=80 \
  --type=ClusterIP \
  -n webapp-ns
```

Or create YAML file (`specs/service.yaml`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-svc
  namespace: webapp-ns
spec:
  selector:
    app: webapp
    tier: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

```bash
kubectl apply -f specs/service.yaml
```

### Step 5: Verify (3 minutes)

```bash
# Check all resources
kubectl get all -n webapp-ns

# Verify ConfigMap is loaded into Pods
kubectl exec -n webapp-ns deployment/webapp -- env | grep -E 'APP_MODE|LOG_LEVEL|MAX_CONNECTIONS'

# Test the service
kubectl run test-pod --image=busybox -n webapp-ns --rm -it --restart=Never -- wget -qO- webapp-svc
```

## Complete YAML Files

All files are in the `solution/` directory:

- `solution/namespace.yaml` - Namespace definition
- `solution/configmap.yaml` - ConfigMap with configuration
- `solution/deployment.yaml` - Deployment with resources and ConfigMap
- `solution/service.yaml` - ClusterIP Service

Deploy the complete solution:

```bash
kubectl apply -f solution/
```

## Key Learning Points

1. **Imperative vs Declarative**: Imperative commands are faster for simple resources; use YAML for complex configurations
2. **ConfigMap as Environment Variables**: Use `envFrom.configMapRef` to load all keys
3. **Resource Management**: Always set requests and limits for production workloads
4. **Labels**: Ensure Service selector matches Deployment Pod labels
5. **Namespace Isolation**: All resources must be in the same namespace

## Common Mistakes

- ❌ Forgetting to specify namespace in commands
- ❌ Mismatched labels between Service and Pods
- ❌ Not using `envFrom` (using individual `env` entries instead)
- ❌ Missing resource limits and requests
- ❌ Wrong ConfigMap value types (should be strings)

## Time Breakdown

| Task | Estimated Time | Actual Time |
|------|----------------|-------------|
| Namespace | 30 sec | ___ |
| ConfigMap | 1 min | ___ |
| Deployment | 5 min | ___ |
| Service | 2 min | ___ |
| Verification | 3 min | ___ |
| **Total** | **~12 min** | ___ |
