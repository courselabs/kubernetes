# Lab Solution

## Creating the QA Environment Overlay

Here's the complete solution for creating a QA environment overlay.

### Step 1: Create the Directory

```bash
mkdir -p labs/kustomize/specs/overlays/qa
```

### Step 2: Create the Kustomization File

Create `labs/kustomize/specs/overlays/qa/kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# Reference the base configuration
resources:
  - ../../base

# QA environment customizations
namespace: qa
namePrefix: qa-

# Add QA-specific labels
commonLabels:
  environment: qa
  tier: testing

# Override the number of replicas
replicas:
  - name: whoami
    count: 4

# Use a specific image tag for QA
images:
  - name: containous/whoami
    newTag: v1-alpine
```

### Step 3: Create the Namespace

```bash
kubectl create namespace qa
```

### Step 4: Deploy the QA Environment

```bash
kubectl apply -k labs/kustomize/specs/overlays/qa
```

### Step 5: Verify the Deployment

Check that everything is running correctly:

```bash
# See all QA resources
kubectl get all -n qa

# Check the replica count (should be 4)
kubectl get deploy -n qa qa-whoami -o jsonpath='{.spec.replicas}'

# Check the image tag (should be v1-alpine)
kubectl get deploy -n qa qa-whoami -o jsonpath='{.spec.template.spec.containers[0].image}'

# Check the labels
kubectl get deploy -n qa qa-whoami -o jsonpath='{.metadata.labels}' | jq
```

Expected output:
- Deployment name: `qa-whoami`
- Service name: `qa-whoami`
- Namespace: `qa`
- Replicas: 4
- Image: `containous/whoami:v1-alpine`
- Label `environment: qa` present

### Alternative: Using kubectl kustomize to Preview

Before applying, you can preview the generated YAML:

```bash
kubectl kustomize labs/kustomize/specs/overlays/qa
```

This shows the final YAML that will be applied without actually creating resources.

### Cleanup

When you're done testing:

```bash
kubectl delete -k labs/kustomize/specs/overlays/qa
kubectl delete namespace qa
```

## Key Points

This exercise demonstrates:

1. **Reusing base configuration** - The QA overlay uses the same base as dev, staging, and prod
2. **Environment-specific customization** - Each environment has unique settings without duplicating YAML
3. **Built-in transformations** - Using Kustomize features (replicas, images, labels) instead of manual patches
4. **Namespace isolation** - Each environment runs in its own namespace
5. **kubectl integration** - Using `kubectl apply -k` for deployment

## Common Mistakes

- **Forgetting to create the namespace** - Kustomize won't create it automatically
- **Wrong path to base** - Make sure the path `../../base` is correct from your overlay directory
- **YAML indentation** - Watch out for proper indentation in the kustomization.yaml file
- **Resource names** - The replica and image transforms use the resource name from the base (`whoami`)
