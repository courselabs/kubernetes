# Scenario 1: Web Application Deployment

**Difficulty**: Beginner
**Time Limit**: 12 minutes
**CKAD Domains**: Application Design & Build (20%), Services & Networking (20%)

## Scenario

Your team is deploying a new web application called **webapp**. You need to deploy the application with specific configuration and expose it internally to other services.

## Requirements

Complete the following tasks:

1. **Create a namespace** called `webapp-ns`

2. **Create a ConfigMap** called `webapp-config` in the `webapp-ns` namespace with the following data:
   - `APP_MODE=production`
   - `LOG_LEVEL=info`
   - `MAX_CONNECTIONS=100`

3. **Create a Deployment** called `webapp` in the `webapp-ns` namespace with:
   - Image: `nginx:1.21-alpine`
   - 3 replicas
   - Environment variables from the `webapp-config` ConfigMap
   - Labels: `app=webapp`, `tier=frontend`
   - Resource limits: CPU: 200m, Memory: 256Mi
   - Resource requests: CPU: 100m, Memory: 128Mi

4. **Create a Service** called `webapp-svc` that:
   - Exposes the Deployment on port 80
   - Uses type ClusterIP
   - Has the same labels as the Deployment

## Verification

Run these commands to verify your solution:

```bash
# Check namespace
kubectl get namespace webapp-ns

# Check ConfigMap
kubectl get configmap webapp-config -n webapp-ns
kubectl describe configmap webapp-config -n webapp-ns

# Check Deployment
kubectl get deployment webapp -n webapp-ns
kubectl get pods -n webapp-ns -l app=webapp
kubectl describe deployment webapp -n webapp-ns

# Check Service
kubectl get service webapp-svc -n webapp-ns
kubectl describe service webapp-svc -n webapp-ns

# Verify endpoints
kubectl get endpoints webapp-svc -n webapp-ns

# Test the service (should return nginx welcome page)
kubectl run test-pod --image=busybox -n webapp-ns --rm -it --restart=Never -- wget -qO- webapp-svc
```

## Success Criteria

- [ ] Namespace `webapp-ns` exists
- [ ] ConfigMap contains all three key-value pairs
- [ ] Deployment has exactly 3 replicas
- [ ] All Pods are Running
- [ ] Pods have the ConfigMap values as environment variables
- [ ] Service is accessible and returns the nginx welcome page

## Clean Up

```bash
kubectl delete namespace webapp-ns
```

## Hints

<details>
  <summary>Click to see hints</summary>

### Hint 1: Creating Resources Quickly
Use kubectl imperative commands with `--dry-run=client -o yaml` to generate YAML templates quickly.

### Hint 2: ConfigMap as Environment Variables
Use `envFrom` with `configMapRef` in the Pod spec to load all ConfigMap keys as environment variables.

### Hint 3: Resource Limits
Resources are specified under `spec.containers[].resources` with `limits` and `requests` fields.

</details>

## Time Allocation Suggestion

- Namespace and ConfigMap: 2 minutes
- Deployment YAML: 5 minutes
- Service YAML: 2 minutes
- Verification: 3 minutes

---

[See Solution](solution.md)
