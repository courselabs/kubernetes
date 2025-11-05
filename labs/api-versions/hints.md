# Lab Hints

## Version Migration Exercise

The exercise asks you to identify and fix deprecated API versions. Here are hints for each step:

### Step 1: Deploy the Legacy Resources

```bash
kubectl apply -f labs/api-versions/specs/legacy-app/
```

Watch for any warnings in the output.

### Step 2: Check for Deprecation Warnings

When you apply the resources, kubectl will show warnings if any APIs are deprecated (but not yet removed).

Look for messages like:
```
Warning: <resource> is deprecated in v1.x+, unavailable in v1.y+; use <new-version> instead
```

### Step 3: Identify Deprecated APIs

Check what API versions are currently in use:

```bash
kubectl get deployments -o json | grep apiVersion
kubectl get cronjobs -o json | grep apiVersion
kubectl get services -o json | grep apiVersion
```

Compare these with the current stable versions:

```bash
kubectl api-resources | grep -E "deployments|cronjobs|services"
```

### Step 4: Convert Resources

For each resource type, you can use `kubectl convert`:

```bash
# Export the current resource
kubectl get deployment legacy-web -o yaml > deployment-export.yaml

# If kubectl convert is available:
kubectl convert -f deployment-export.yaml --output-version apps/v1

# Or manually edit the files in specs/legacy-app/
```

Check the official documentation for the current API version:

```bash
kubectl explain deployment | grep VERSION
kubectl explain cronjob | grep VERSION
```

### Step 5: Update Deployments

Apply the updated manifests:

```bash
kubectl apply -f <updated-file>.yaml
```

### Step 6: Verify Everything Works

Check that all resources are running:

```bash
kubectl get all -l kubernetes.courselabs.co=api-versions

kubectl get deployment legacy-web -o wide
kubectl get cronjob legacy-cleanup
kubectl get service legacy-web
```

## Common API Version Mappings

Here are the current stable versions for common resources:

| Resource | Current Stable API |
|----------|-------------------|
| Deployment | `apps/v1` |
| StatefulSet | `apps/v1` |
| DaemonSet | `apps/v1` |
| ReplicaSet | `apps/v1` |
| Service | `v1` |
| ConfigMap | `v1` |
| Secret | `v1` |
| CronJob | `batch/v1` |
| Job | `batch/v1` |
| Ingress | `networking.k8s.io/v1` |
| NetworkPolicy | `networking.k8s.io/v1` |
| PodDisruptionBudget | `policy/v1` |

## Checking Your Work

Use these commands to verify your migration:

```bash
# Check all resources are using current API versions
kubectl get deploy,cronjob,svc -l kubernetes.courselabs.co=api-versions -o yaml | grep apiVersion

# Test the application is still functioning
kubectl exec -it deployment/legacy-web -- curl localhost

# Check for any warnings
kubectl apply -f labs/api-versions/specs/legacy-app/ --dry-run=client
```

If you see no warnings with `--dry-run=client`, you've successfully migrated to current API versions!

## Additional Resources

- Use `kubectl api-versions` to see all available versions
- Use `kubectl explain <resource>` to see the expected API version
- Check the Kubernetes version of your cluster: `kubectl version --short`

Still stuck? Check [solution.md](solution.md) for the complete solution.
