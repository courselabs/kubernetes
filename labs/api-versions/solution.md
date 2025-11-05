# Lab Solution

## API Version Migration Exercise

Here's the complete solution for the API version migration exercise.

### Understanding the Exercise

The legacy-app resources are already using current API versions (`apps/v1`, `batch/v1`, `v1`), so this exercise demonstrates the **process** you would follow when encountering deprecated APIs.

### Step-by-Step Solution

#### Step 1: Deploy the Legacy Resources

```bash
kubectl apply -f labs/api-versions/specs/legacy-app/
```

Expected output:
```
deployment.apps/legacy-web created
service/v1/legacy-web created
cronjob.batch/legacy-cleanup created
```

#### Step 2: Check for Warnings

Since the provided resources already use current APIs, you won't see deprecation warnings.

In a real scenario with deprecated APIs, you would see:
```
Warning: batch/v1beta1 CronJob is deprecated in v1.21+, unavailable in v1.25+; use batch/v1 CronJob
```

#### Step 3: Identify Current API Versions

Check what API versions are in use:

```bash
kubectl get deployment legacy-web -o jsonpath='{.apiVersion}'
# Output: apps/v1

kubectl get cronjob legacy-cleanup -o jsonpath='{.apiVersion}'
# Output: batch/v1

kubectl get service legacy-web -o jsonpath='{.apiVersion}'
# Output: v1
```

Verify these are the current stable versions:

```bash
kubectl api-resources | grep -E "^deployments"
# Output: deployments  deploy  apps/v1  true  Deployment

kubectl api-resources | grep -E "^cronjobs"
# Output: cronjobs  cj  batch/v1  true  CronJob

kubectl api-resources | grep -E "^services"
# Output: services  svc  v1  true  Service
```

✅ All resources are using current stable API versions.

#### Step 4: Migration Process (Demonstration)

If you had deprecated APIs, here's how you would convert them:

##### Example: Converting a Deployment

If you had a deployment using `apps/v1beta1`:

```bash
# Export the resource
kubectl get deployment legacy-web -o yaml > deployment-old.yaml

# Using kubectl convert (if installed)
kubectl convert -f deployment-old.yaml --output-version apps/v1 > deployment-new.yaml

# Or manually update the apiVersion field
# Change: apiVersion: apps/v1beta1
# To:     apiVersion: apps/v1
```

##### Example: Converting a CronJob

If you had a CronJob using `batch/v1beta1`:

```bash
# Export the resource
kubectl get cronjob legacy-cleanup -o yaml > cronjob-old.yaml

# Convert to batch/v1
kubectl convert -f cronjob-old.yaml --output-version batch/v1 > cronjob-new.yaml
```

#### Step 5: Apply Updated Resources

```bash
kubectl apply -f deployment-new.yaml
kubectl apply -f cronjob-new.yaml
```

Kubernetes will update the resources in-place with the new API version.

#### Step 6: Verify Everything Works

```bash
# Check all resources are running
kubectl get all -l kubernetes.courselabs.co=api-versions

# Expected output:
# NAME                              READY   STATUS    RESTARTS   AGE
# pod/legacy-web-xxxxx-yyyyy        1/1     Running   0          2m
# pod/legacy-web-xxxxx-zzzzz        1/1     Running   0          2m
# pod/legacy-web-xxxxx-aaaaa        1/1     Running   0          2m
#
# NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
# service/legacy-web   ClusterIP   10.96.xxx.xxx   <none>        80/TCP    2m
#
# NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
# deployment.apps/legacy-web   3/3     3            3           2m
#
# NAME                                    DESIRED   CURRENT   READY   AGE
# replicaset.apps/legacy-web-xxxxx        3         3         3       2m

kubectl get cronjobs
# NAME              SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE
# legacy-cleanup    0 2 * * *     False     0        <none>          2m
```

Test the web application:

```bash
kubectl exec -it deployment/legacy-web -- curl -s localhost | grep "Welcome to nginx"
```

Expected: HTML output from nginx

✅ All resources are functioning correctly with current API versions.

### Real-World Migration Example

Here's what a real migration scenario looks like:

#### Before (Deprecated API - DON'T USE):

```yaml
apiVersion: networking.k8s.io/v1beta1  # Deprecated!
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            backend:
              serviceName: my-service    # Old field name
              servicePort: 80            # Old field name
```

#### After (Current API - USE THIS):

```yaml
apiVersion: networking.k8s.io/v1  # Current stable version
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix          # New required field
            backend:
              service:                # New structure
                name: my-service      # New field name
                port:
                  number: 80          # New field name
```

**Key Changes:**
1. API version updated to `networking.k8s.io/v1`
2. Added required `pathType` field
3. Changed `serviceName`/`servicePort` to nested `service.name`/`service.port.number`

### Common Migration Scenarios

#### Scenario 1: CronJob Migration

**Before (v1beta1 - removed in 1.25):**
```yaml
apiVersion: batch/v1beta1
kind: CronJob
```

**After (v1 - current):**
```yaml
apiVersion: batch/v1
kind: CronJob
```

**Changes:** Mostly compatible, just API version change.

#### Scenario 2: PodDisruptionBudget Migration

**Before (v1beta1 - removed in 1.25):**
```yaml
apiVersion: policy/v1beta1
kind: PodDisruptionBudget
```

**After (v1 - current):**
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
spec:
  unhealthyPodEvictionPolicy: IfHealthyBudget  # New field available
```

**Changes:** API version + new optional fields.

### Using kubectl convert

If kubectl convert is installed:

```bash
# Convert single file
kubectl convert -f old-manifest.yaml --output-version apps/v1

# Convert directory
kubectl convert -f manifests/ --output-version apps/v1 -o yaml > new-manifests.yaml

# Convert and save each file
for file in *.yaml; do
  kubectl convert -f "$file" --output-version apps/v1 -o yaml > "converted-$file"
done
```

### Automated Deprecation Detection

Using **kubent** (Kube-No-Trouble):

```bash
# Install
sh -c "$(curl -sSL https://git.io/install-kubent)"

# Scan cluster for deprecated APIs
kubent

# Example output:
# 2:25PM INF >>> Kube No Trouble `kubent` <<<
# 2:25PM INF Initializing collectors and retrieving data
# 2:25PM INF Retrieved 12 resources from collector name=Cluster
# 2:25PM INF Found deprecated APIs:
# __________________________________________________________________________________________
# >>> Deprecated APIs removed in 1.25 <<<
# ------------------------------------------------------------------------------------------
# KIND         NAMESPACE     NAME             API_VERSION
# CronJob      default       legacy-cleanup   batch/v1beta1
# __________________________________________________________________________________________
```

### Key Commands Reference

```bash
# Check API versions available in cluster
kubectl api-versions

# Find API version for a resource type
kubectl api-resources | grep <resource-name>

# Get API version of running resource
kubectl get <resource> <name> -o jsonpath='{.apiVersion}'

# Check resource definition
kubectl explain <resource>

# Convert manifest
kubectl convert -f <file> --output-version <group/version>

# Dry-run to check for warnings
kubectl apply -f <file> --dry-run=client

# Export resource in current cluster version
kubectl get <resource> <name> -o yaml
```

### Cleanup

```bash
kubectl delete -f labs/api-versions/specs/legacy-app/
```

### Key Takeaways

1. **Check before upgrading** - Always check for deprecated APIs before upgrading clusters
2. **Use stable versions** - Prefer `v1` over `v1beta1` or `v1alpha1`
3. **Test migrations** - Always test in dev/staging before production
4. **kubectl convert** - Useful for bulk migrations
5. **Automation helps** - Use tools like kubent for large clusters
6. **Read release notes** - Kubernetes release notes list all deprecations
7. **Field changes matter** - Some migrations require structural changes, not just version updates

### CKAD Exam Relevance

For the CKAD exam, you should be able to:

✅ Identify the current API version for any resource using `kubectl api-resources`
✅ Convert a manifest from one API version to another
✅ Recognize deprecation warnings in kubectl output
✅ Use `kubectl explain` to check API documentation
✅ Understand API version format (`group/version` or just `version` for core)

Practice these commands until they become second nature!
