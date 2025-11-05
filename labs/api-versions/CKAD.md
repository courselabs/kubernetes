# CKAD Exam Guide: API Versions and Deprecations

## Why API Deprecations Matter for CKAD

**Domain**: Application Observability and Maintenance (15% of exam)
**Importance**: ⭐⭐⭐⭐ HIGH - Required exam topic

Understanding API deprecations is **required** for the CKAD exam. You need to be able to:
- Identify deprecated API versions
- Use kubectl api-resources and api-versions
- Understand the kubectl convert command
- Migrate resources to newer API versions
- Check for deprecated APIs in manifests

**Time estimate**: 4-6 minutes per API deprecation question on the exam

---

## Quick Reference for the Exam

### Essential Commands

```bash
# List all API resources and their versions
kubectl api-resources

# Find specific resource API version
kubectl api-resources | grep <resource-name>

# List all supported API versions
kubectl api-versions

# Check specific resource's API details
kubectl explain <resource> | grep VERSION

# Convert old API to new API (if kubectl-convert installed)
kubectl convert -f old.yaml --output-version <new-apiVersion>

# Check what API version a resource uses
kubectl get <resource> <name> -o yaml | grep apiVersion
```

### Understanding API Versions

```yaml
# Core group (no group name)
apiVersion: v1               # Pods, Services, ConfigMaps, Secrets

# Apps group
apiVersion: apps/v1          # Deployments, StatefulSets, DaemonSets

# Batch group
apiVersion: batch/v1         # Jobs, CronJobs

# Networking group
apiVersion: networking.k8s.io/v1  # Ingress, NetworkPolicy

# RBAC group
apiVersion: rbac.authorization.k8s.io/v1  # Roles, RoleBindings

# Policy group
apiVersion: policy/v1        # PodDisruptionBudget
```

---

## Exam Scenarios You'll Face

### Scenario 1: Find Current API Version

**Task**: "What API version does the Ingress resource use in this cluster?"

**Solution**:
```bash
kubectl api-resources | grep ingress
```

Output shows: `ingresses networking.k8s.io/v1`

**Alternative**:
```bash
kubectl explain ingress | grep VERSION
```

### Scenario 2: Identify Deprecated APIs

**Task**: "Check all deployments and identify their API versions."

**Solution**:
```bash
kubectl get deployments --all-namespaces -o jsonpath='{range .items[*]}{.apiVersion}{"  "}{.kind}{"  "}{.metadata.name}{"\n"}{end}'
```

**Simpler version**:
```bash
kubectl get deployments -A -o yaml | grep apiVersion
```

### Scenario 3: Convert Deprecated API

**Task**: "You have a file using an old API version. Update it to the current version."

**Given**: `deployment.yaml` with old apiVersion

**Solution**:
```bash
# Check current API version
kubectl api-resources | grep deployment

# If kubectl convert is available:
kubectl convert -f deployment.yaml --output-version apps/v1 > deployment-new.yaml

# Manual approach:
# Edit the file and change apiVersion to apps/v1
vi deployment.yaml
# Change: apiVersion: extensions/v1beta1
# To: apiVersion: apps/v1
```

### Scenario 4: Update Existing Resource

**Task**: "A running deployment uses a deprecated API. Update it to the current stable version."

**Solution**:
```bash
# Export current resource
kubectl get deployment myapp -o yaml > deployment-old.yaml

# Convert to new version
kubectl convert -f deployment-old.yaml --output-version apps/v1 > deployment-new.yaml

# Apply updated version
kubectl apply -f deployment-new.yaml
```

---

## Common API Version Migrations (Know These!)

### Recently Removed APIs

| Resource | Old API (REMOVED) | Current API | Removed In |
|----------|-------------------|-------------|------------|
| Deployment | `extensions/v1beta1` | `apps/v1` | v1.16 |
| DaemonSet | `extensions/v1beta1` | `apps/v1` | v1.16 |
| ReplicaSet | `extensions/v1beta1` | `apps/v1` | v1.16 |
| Ingress | `extensions/v1beta1` | `networking.k8s.io/v1` | v1.22 |
| Ingress | `networking.k8s.io/v1beta1` | `networking.k8s.io/v1` | v1.22 |
| CronJob | `batch/v1beta1` | `batch/v1` | v1.25 |
| PodSecurityPolicy | `policy/v1beta1` | **REMOVED** | v1.25 |
| PodDisruptionBudget | `policy/v1beta1` | `policy/v1` | v1.25 |

### Current Stable APIs (Use These!)

| Resource | Current Stable API |
|----------|-------------------|
| Pod | `v1` |
| Service | `v1` |
| ConfigMap | `v1` |
| Secret | `v1` |
| Namespace | `v1` |
| Deployment | `apps/v1` |
| StatefulSet | `apps/v1` |
| DaemonSet | `apps/v1` |
| Job | `batch/v1` |
| CronJob | `batch/v1` |
| Ingress | `networking.k8s.io/v1` |
| NetworkPolicy | `networking.k8s.io/v1` |
| Role | `rbac.authorization.k8s.io/v1` |
| RoleBinding | `rbac.authorization.k8s.io/v1` |

---

## API Version Maturity Levels

### Alpha (v1alpha1, v1alpha2)
- ❌ **NOT for production**
- May be removed without notice
- Bugs expected
- **Exam tip**: If you see alpha APIs, suggest upgrading to beta or stable

### Beta (v1beta1, v1beta2)
- ⚠️ **Use with caution**
- Generally safe but may change
- Supported for 9 months after deprecation
- **Exam tip**: Watch for deprecation warnings

### Stable/GA (v1, v2)
- ✅ **Production ready**
- Supported for 12+ months after deprecation
- Preferred for all production workloads
- **Exam tip**: Always use stable versions when available

---

## Exam Tips & Time Savers

### ✅ DO This

1. **Use kubectl api-resources** - Fastest way to find current versions:
   ```bash
   kubectl api-resources | grep <resource>
   ```

2. **Check with kubectl explain** - Shows API version and fields:
   ```bash
   kubectl explain deployment | head -5
   ```

3. **Use shortnames** for speed:
   ```bash
   kubectl api-resources | grep deployment
   # Shows: deploy = deployments
   ```

4. **Remember the pattern** - Most workload controllers use apps/v1:
   - Deployment → apps/v1
   - StatefulSet → apps/v1
   - DaemonSet → apps/v1
   - ReplicaSet → apps/v1

5. **Core resources have no group** (just v1):
   - Pod → v1
   - Service → v1
   - ConfigMap → v1
   - Secret → v1

### ❌ DON'T Do This

1. **Don't guess API versions** - Always check:
   ```bash
   # ❌ Don't guess
   apiVersion: apps/v1beta1

   # ✅ Check first
   kubectl api-resources | grep deployment
   ```

2. **Don't use extensions/v1beta1** - It's long gone (removed in v1.16):
   ```yaml
   # ❌ Old and removed
   apiVersion: extensions/v1beta1
   kind: Deployment

   # ✅ Current
   apiVersion: apps/v1
   kind: Deployment
   ```

3. **Don't forget the group** for non-core resources:
   ```yaml
   # ❌ Missing group
   apiVersion: v1
   kind: Deployment  # Wrong! Pods are v1, not Deployments

   # ✅ Correct
   apiVersion: apps/v1
   kind: Deployment
   ```

---

## kubectl convert Command

### When Is It Available?

The `kubectl convert` plugin is **not** always installed by default. On the exam:

1. **Check if it exists**:
   ```bash
   kubectl convert --help
   ```

2. **If not available**, manually edit the YAML:
   ```bash
   # Edit the file
   vi deployment.yaml
   # Change apiVersion line
   ```

### Using kubectl convert

If available:

```bash
# Convert single file
kubectl convert -f old-manifest.yaml --output-version apps/v1

# Save to new file
kubectl convert -f old-manifest.yaml --output-version apps/v1 > new-manifest.yaml

# Convert and apply directly
kubectl convert -f old-manifest.yaml --output-version apps/v1 | kubectl apply -f -
```

### Common Conversions

```bash
# Deployment
kubectl convert -f deployment.yaml --output-version apps/v1

# Ingress
kubectl convert -f ingress.yaml --output-version networking.k8s.io/v1

# CronJob
kubectl convert -f cronjob.yaml --output-version batch/v1

# PodDisruptionBudget
kubectl convert -f pdb.yaml --output-version policy/v1
```

---

## Troubleshooting on the Exam

### Error: "no matches for kind ... in version ..."

**Cause**: Using removed or incorrect API version
**Example**: `no matches for kind "Deployment" in version "extensions/v1beta1"`

**Fix**:
```bash
# Find correct version
kubectl api-resources | grep deployment

# Update apiVersion in YAML
apiVersion: apps/v1  # Not extensions/v1beta1
```

### Warning: "... is deprecated in v1.XX"

**Cause**: Using deprecated but not yet removed API
**Action**: Note the warning, update to recommended version

**Example**:
```
Warning: batch/v1beta1 CronJob is deprecated in v1.21+, use batch/v1
```

**Fix**: Change to `apiVersion: batch/v1`

### Error: "kubectl convert: command not found"

**Cause**: kubectl convert plugin not installed
**Fix**: Edit YAML file manually to update apiVersion

---

## Quick Lookup Table

When you need to find an API version on the exam:

| Resource Type | Quick Command | Expected Result |
|---------------|---------------|-----------------|
| Any resource | `kubectl api-resources \| grep <resource>` | Shows API group/version |
| Specific resource | `kubectl explain <resource> \| head` | Shows apiVersion field |
| All versions | `kubectl api-versions` | Lists all available versions |
| Current usage | `kubectl get <resource> -o yaml \| grep apiVersion` | Shows what's deployed |

---

## Practice Scenarios (Time Yourself: 5 minutes each)

### Practice 1: Find API Version

Find the current API version for NetworkPolicy.

<details>
<summary>Solution</summary>

```bash
kubectl api-resources | grep networkpolic

# Or
kubectl explain networkpolicy | grep VERSION
```

Answer: `networking.k8s.io/v1`
</details>

### Practice 2: Check Deployment API

You have a deployment named `webapp`. Check what API version it's using.

<details>
<summary>Solution</summary>

```bash
kubectl get deployment webapp -o yaml | grep apiVersion

# Or
kubectl get deployment webapp -o jsonpath='{.apiVersion}'
```
</details>

### Practice 3: Identify All API Versions in Use

List all API versions currently used by resources in the `default` namespace.

<details>
<summary>Solution</summary>

```bash
kubectl get all -n default -o yaml | grep apiVersion | sort -u

# Or more comprehensive
kubectl api-resources --verbs=list -o name | xargs -I {} kubectl get {} -n default -o jsonpath='{.apiVersion}' 2>/dev/null | sort -u
```
</details>

### Practice 4: Update Deprecated Ingress

You have an Ingress using `networking.k8s.io/v1beta1`. Update it to `networking.k8s.io/v1`.

<details>
<summary>Solution</summary>

```bash
# Export current
kubectl get ingress myingress -o yaml > ingress-old.yaml

# Edit the file
vi ingress-old.yaml
# Change: apiVersion: networking.k8s.io/v1beta1
# To: apiVersion: networking.k8s.io/v1
# Note: May also need to update spec fields

# Apply
kubectl apply -f ingress-old.yaml

# Or with convert (if available)
kubectl convert -f ingress-old.yaml --output-version networking.k8s.io/v1 | kubectl apply -f -
```
</details>

---

## Common Exam Patterns

### Pattern 1: "What API version should you use?"

**Approach**:
1. Use `kubectl api-resources | grep <resource>`
2. Use the version shown (usually the only version listed)
3. If multiple versions, use the stable one (v1, v2)

### Pattern 2: "Find deprecated APIs"

**Approach**:
1. Get all resources: `kubectl get all -A -o yaml`
2. Look for old API versions (beta, extensions group)
3. Check against known deprecations

### Pattern 3: "Migrate to new API"

**Approach**:
1. Identify current version used
2. Find new version: `kubectl api-resources | grep <resource>`
3. Either use `kubectl convert` or manually edit YAML
4. Test and apply

---

## Exam Day Checklist

Before completing an API version question:

- [ ] **Check api-resources** - What's the current version?
- [ ] **Look for beta versions** - Usually need updating
- [ ] **Check extensions group** - All deprecated/removed
- [ ] **Verify after update** - Did the resource deploy?
- [ ] **Watch for warnings** - Kubernetes will warn about deprecations

---

## Key Points to Remember

1. **kubectl api-resources** - Your best friend for finding versions
2. **apps/v1** - Most workload controllers (Deployment, StatefulSet, DaemonSet)
3. **v1** - Core resources (Pod, Service, ConfigMap, Secret)
4. **batch/v1** - Jobs and CronJobs (not v1beta1 anymore!)
5. **networking.k8s.io/v1** - Ingress and NetworkPolicy
6. **extensions/v1beta1** - REMOVED (don't use!)
7. **kubectl convert** - May or may not be available
8. **Manual editing** - Always a fallback option

---

## Time Management

**Typical exam question**: 4-6 minutes

| Task | Time |
|------|------|
| Read requirements | 1 min |
| Find current API version | 1-2 min |
| Update manifest | 2-3 min |

If stuck beyond 6 minutes → **flag and move on**

---

## Additional Resources

During the exam you can access:
- [Kubernetes API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)
- [Deprecation Guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide/)

**Bookmark these** before the exam!

---

## Summary

✅ **Master these for CKAD**:
- kubectl api-resources command
- kubectl api-versions command
- Current stable API versions for common resources
- How to identify deprecated APIs
- kubectl convert (if available) or manual editing
- Common API migrations (extensions→apps, v1beta1→v1)

🎯 **Exam weight**: 15% (Observability & Maintenance domain)
⏱️ **Time per question**: 4-6 minutes
📊 **Difficulty**: Easy-Medium (mostly command knowledge)

Practice identifying and updating API versions until it becomes automatic!
