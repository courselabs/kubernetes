# CKAD Exam Guide: Kustomize

## Why Kustomize Matters for CKAD

**Domain**: Application Deployment (20% of exam)
**Importance**: ⭐⭐⭐⭐⭐ CRITICAL - Explicit exam requirement

Kustomize is a **required topic** for the CKAD exam. You will likely face at least one question requiring you to:
- Create or modify a kustomization.yaml file
- Deploy resources using kubectl apply -k
- Create overlays for different environments
- Understand base and overlay patterns

**Time estimate**: 5-8 minutes per Kustomize question on the exam

---

## Quick Reference for the Exam

### Essential Commands

```bash
# Apply a kustomization (most common)
kubectl apply -k <directory>

# Preview without applying (debugging)
kubectl kustomize <directory>

# Delete kustomization resources
kubectl delete -k <directory>

# Diff to see changes
kubectl diff -k <directory>
```

### Basic kustomization.yaml Structure

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# List of resource files to include
resources:
  - deployment.yaml
  - service.yaml

# Common labels for all resources
commonLabels:
  app: myapp

# Add prefix to all resource names
namePrefix: dev-

# Set namespace for all resources
namespace: development

# Modify replicas
replicas:
  - name: myapp
    count: 3

# Modify images
images:
  - name: nginx
    newTag: 1.21
```

---

## Exam Scenarios You'll Face

### Scenario 1: Create a Kustomization from Existing YAML

**Task**: "You have deployment.yaml and service.yaml. Create a kustomization.yaml that applies both resources with a `prod-` prefix and sets namespace to `production`."

**Solution**:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml

namePrefix: prod-
namespace: production
```

**Apply**:
```bash
kubectl apply -k .
```

### Scenario 2: Create Environment-Specific Overlay

**Task**: "Create a prod overlay that references the base/ directory and sets replicas to 5."

**Directory structure**:
```
base/
  kustomization.yaml
  deployment.yaml
overlays/
  prod/
    kustomization.yaml
```

**overlays/prod/kustomization.yaml**:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

namePrefix: prod-
namespace: production

replicas:
  - name: myapp
    count: 5
```

### Scenario 3: Patch a Deployment

**Task**: "Add environment variable `ENV=production` to the deployment using a patch."

**Create patch.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
        - name: myapp
          env:
            - name: ENV
              value: production
```

**Update kustomization.yaml**:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml

patches:
  - path: patch.yaml
```

### Scenario 4: Change Image Tag

**Task**: "Deploy the staging environment with image tag v2.1 instead of the base tag."

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

images:
  - name: myapp
    newTag: v2.1
```

---

## Common Kustomize Transformations (Know These!)

| Transformation | Purpose | Example |
|----------------|---------|---------|
| `namePrefix` | Add prefix to all resources | `namePrefix: dev-` |
| `nameSuffix` | Add suffix to all resources | `nameSuffix: -v2` |
| `namespace` | Set namespace for all resources | `namespace: production` |
| `commonLabels` | Add labels to all resources | `commonLabels: {env: prod}` |
| `commonAnnotations` | Add annotations to all resources | `commonAnnotations: {ver: "1.0"}` |
| `replicas` | Change replica count | `replicas: [{name: app, count: 5}]` |
| `images` | Change image tags | `images: [{name: nginx, newTag: 1.21}]` |

---

## Exam Tips & Time Savers

### ✅ DO This

1. **Use kubectl kustomize first** - Preview output before applying:
   ```bash
   kubectl kustomize overlays/prod > preview.yaml
   # Review preview.yaml
   kubectl apply -k overlays/prod
   ```

2. **Remember the -k flag** - It works with many kubectl commands:
   ```bash
   kubectl apply -k <dir>
   kubectl delete -k <dir>
   kubectl diff -k <dir>
   kubectl get -k <dir>
   ```

3. **Use resources to reference base** - In overlays, always include:
   ```yaml
   resources:
     - ../../base
   ```

4. **Keep it simple** - Use built-in transformations before patches:
   ```yaml
   # Prefer this (built-in)
   replicas:
     - name: myapp
       count: 5

   # Over this (patch)
   patches:
     - patch: |-
         - op: replace
           path: /spec/replicas
           value: 5
   ```

### ❌ DON'T Do This

1. **Don't forget apiVersion** - Always include at the top:
   ```yaml
   apiVersion: kustomize.config.k8s.io/v1beta1
   kind: Kustomization
   ```

2. **Don't use absolute paths** - Use relative paths in resources:
   ```yaml
   # ✅ Correct
   resources:
     - ../../base

   # ❌ Wrong
   resources:
     - /home/user/base
   ```

3. **Don't create overlays without resources** - Always reference what you're overlaying:
   ```yaml
   # ❌ Missing resources reference
   namePrefix: prod-

   # ✅ Correct
   resources:
     - ../../base
   namePrefix: prod-
   ```

---

## Troubleshooting on the Exam

### Error: "no matches for kind"

**Cause**: Missing apiVersion or kind in kustomization.yaml
**Fix**: Add the header:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
```

### Error: "unable to find one or more files"

**Cause**: Incorrect path in resources or patches
**Fix**: Check relative paths, use `ls` to verify files exist

### Error: "resource already exists"

**Cause**: Resources already applied, name collision
**Fix**: Either delete existing resources or use different namePrefix

### Resources not in expected namespace

**Cause**: Forgot to set namespace in overlay
**Fix**: Add `namespace: <namespace-name>` to kustomization.yaml

---

## Kustomize vs Helm (Know the Difference!)

Both are in CKAD curriculum. Here's when to use each:

| Aspect | Kustomize | Helm |
|--------|-----------|------|
| **Use in Exam** | Environment configs (dev/staging/prod) | Installing packaged apps |
| **Command** | `kubectl apply -k` | `helm install` |
| **Syntax** | Standard YAML | Go templates |
| **Built-in** | Yes (kubectl 1.14+) | No, separate tool |
| **Best for** | Same app, multiple environments | Distributing reusable apps |

**Exam Tip**: If the question mentions "dev, staging, prod environments" → think Kustomize!

---

## Practice Scenarios (Time Yourself: 7 minutes each)

### Practice 1: Basic Kustomization

Create a kustomization that:
- Includes deployment.yaml and service.yaml
- Sets namespace to `test`
- Adds prefix `test-`
- Sets replicas to 3

<details>
<summary>Solution</summary>

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml

namespace: test
namePrefix: test-
replicas:
  - name: myapp
    count: 3
```

```bash
kubectl apply -k .
```
</details>

### Practice 2: Overlay Pattern

Given a base/ directory with resources, create an overlay:
- Directory: overlays/dev
- Namespace: development
- Prefix: dev-
- Image tag: v1-dev

<details>
<summary>Solution</summary>

```yaml
# overlays/dev/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

namespace: development
namePrefix: dev-

images:
  - name: myapp
    newTag: v1-dev
```

```bash
kubectl apply -k overlays/dev
```
</details>

### Practice 3: Quick Deployment Change

Change the image tag of an existing kustomization from v1 to v2 and reapply.

<details>
<summary>Solution</summary>

Add or update in kustomization.yaml:
```yaml
images:
  - name: myapp
    newTag: v2
```

```bash
kubectl apply -k .
```
</details>

---

## Exam Day Checklist

Before attempting a Kustomize question:

- [ ] **Read carefully** - Note the environment (dev/staging/prod)
- [ ] **Check namespace** - Is a specific namespace required?
- [ ] **Verify paths** - Are you in the right directory?
- [ ] **Preview first** - Use `kubectl kustomize .` to check output
- [ ] **Apply** - Use `kubectl apply -k <directory>`
- [ ] **Verify** - Check that resources are created correctly

---

## Key Points to Remember

1. **Kustomize is built into kubectl** (kubectl apply -k)
2. **Base + Overlays pattern** for environment management
3. **No templating** - works with standard YAML
4. **Common transformations**: namePrefix, namespace, replicas, images
5. **Relative paths** in resources and patches
6. **Preview with kubectl kustomize** before applying
7. **Different from Helm** - know when to use which

---

## Time Management

**Typical exam question**: 6-8 minutes

| Task | Time |
|------|------|
| Read requirements | 1 min |
| Create/modify kustomization.yaml | 3-4 min |
| Apply and verify | 2-3 min |

If stuck beyond 8 minutes → **flag and move on**. Come back later.

---

## Additional Resources

During the exam you can access:
- [Kustomize Documentation](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/)
- [Kustomization Reference](https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/)

**Bookmark these** before the exam!

---

## Summary

✅ **Master these for CKAD**:
- Creating kustomization.yaml files
- Base and overlay pattern
- Using kubectl apply -k
- Common transformations (namespace, namePrefix, replicas, images)
- Understanding when to use Kustomize vs Helm

🎯 **Exam weight**: 20% of total score (Application Deployment domain)
⏱️ **Time per question**: 6-8 minutes
📊 **Difficulty**: Medium (with practice)

Practice this lab multiple times until you can complete the exercises in under 10 minutes!
