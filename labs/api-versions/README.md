# Managing API Versions and Deprecations

Kubernetes APIs evolve over time, with versions moving from alpha to beta to stable. The CKAD exam tests your ability to identify deprecated APIs, understand version compatibility, and migrate resources to newer API versions. This is critical for maintaining applications as clusters are upgraded.

## Reference

- [Kubernetes API Versioning](https://kubernetes.io/docs/reference/using-api/#api-versioning)

- [Deprecated API Migration Guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide/)

- [API Changes and Removals](https://kubernetes.io/docs/reference/using-api/deprecation-policy/)

- [kubectl convert](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/#install-kubectl-convert-plugin)

## API specs

- [API Groups](https://kubernetes.io/docs/reference/using-api/#api-groups)

- [API Versioning](https://kubernetes.io/docs/reference/using-api/api-overview/#api-versioning)

<details>
  <summary>Understanding API Versions</summary>

## API Version Stages

Kubernetes APIs go through three maturity levels:

### Alpha (v1alpha1, v1alpha2, etc.)
- Experimental features
- May be buggy
- Support may be dropped at any time
- **Not recommended for production**

### Beta (v1beta1, v1beta2, etc.)
- Well-tested features
- Safe to use, but details may change
- Will be supported for at least one release after deprecation
- **Can be used in production with caution**

### Stable/GA (v1, v2, etc.)
- Production-ready
- Will be supported for many releases
- **Recommended for all production use**

## API Groups

Kubernetes organizes APIs into groups:

```yaml
apiVersion: apps/v1        # apps group, version v1
apiVersion: batch/v1       # batch group, version v1
apiVersion: v1             # core group (no group name)
apiVersion: networking.k8s.io/v1  # networking group
```

## Deprecation Policy

Kubernetes follows a deprecation policy:

1. **Stable APIs (v1)** - Supported for 12 months or 3 releases (whichever is longer)
2. **Beta APIs (v1beta1)** - Supported for 9 months or 3 releases
3. **Alpha APIs (v1alpha1)** - May be removed at any time

When an API is deprecated, you get advance warning to migrate.

</details><br/>

## Discovering API Versions

### Check Available API Versions

List all API resources and their versions:

```
kubectl api-resources
```

> This shows every resource type, its API version, and whether it's namespaced.

Find a specific resource's API version:

```
kubectl api-resources | grep deployment
```

> Shows: `deployments apps/v1 true Deployment`

### Check Server API Versions

See what API versions your cluster supports:

```
kubectl api-versions
```

> Lists all supported API versions like `apps/v1`, `batch/v1`, etc.

📋 Find the API version for Ingress in your cluster

<details>
  <summary>Not sure how?</summary>

```
kubectl api-resources | grep ingress
```

or

```
kubectl explain ingress | grep VERSION
```

</details><br/>

### Understanding the Output

```
kubectl api-resources
```

Key columns:
- **NAME** - Resource name (plural form)
- **SHORTNAMES** - Abbreviations (e.g., `po` for pods)
- **APIVERSION** - Current API version
- **NAMESPACED** - Whether the resource is namespaced
- **KIND** - Resource type for YAML

## Identifying Deprecated APIs

### Check Your Current Resources

See what API versions your current resources use:

```
kubectl get deployments -o json | grep apiVersion

kubectl get all --all-namespaces -o json | grep -o '"apiVersion":"[^"]*"' | sort -u
```

This shows all API versions currently in use in your cluster.

### Look for Deprecated APIs

Let's deploy resources using different API versions to understand deprecation:

- [deployment-old-api.yaml](./specs/deployment-old-api.yaml) - uses an older API format (example)
- [deployment-current-api.yaml](./specs/deployment-current-api.yaml) - uses current stable API

📋 Apply the current API deployment

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -f labs/api-versions/specs/deployment-current-api.yaml
```

</details><br/>

Check the deployment:

```
kubectl get deployment api-demo -o yaml | grep apiVersion
```

> Shows `apiVersion: apps/v1` - the current stable version.

## Checking for Deprecation Warnings

When you apply a manifest with a deprecated API version, kubectl will show a warning:

```
kubectl apply -f labs/api-versions/specs/deployment-old-api.yaml
```

> **Important**: Kubernetes 1.25+ removed several deprecated APIs. If you see an error instead of a warning, the API has already been removed.

### Common Deprecated APIs (Historical Reference)

| Old API Version | New API Version | Resource | Removed In |
|----------------|-----------------|----------|------------|
| `extensions/v1beta1` | `apps/v1` | Deployment | v1.16 |
| `extensions/v1beta1` | `networking.k8s.io/v1` | Ingress | v1.22 |
| `batch/v1beta1` | `batch/v1` | CronJob | v1.25 |
| `policy/v1beta1` | `policy/v1` | PodDisruptionBudget | v1.25 |

## Using kubectl convert

The `kubectl convert` command helps migrate YAML files to newer API versions.

### Installing kubectl convert

The convert plugin is separate from kubectl:

```bash
# On Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl-convert"
chmod +x kubectl-convert
sudo mv kubectl-convert /usr/local/bin/

# On macOS
brew install kubectl-convert

# On Windows with Chocolatey
choco install kubectl-convert
```

Verify installation:

```
kubectl convert --help
```

### Converting API Versions

If you have a file using an old API version, convert it:

```
kubectl convert -f labs/api-versions/specs/old-version-example.yaml --output-version apps/v1
```

> This outputs the same resource using the new API version.

Save the converted version:

```
kubectl convert -f labs/api-versions/specs/old-version-example.yaml --output-version apps/v1 > converted.yaml
```

### Example: Converting an Ingress

- [ingress-old.yaml](./specs/ingress-old.yaml) - older Ingress API version (example)

Convert to the current version:

```
kubectl convert -f labs/api-versions/specs/ingress-old.yaml --output-version networking.k8s.io/v1
```

> Note the differences in the output - the new version might have different field names or structure.

## Version Migration Strategy

### Step 1: Identify Deprecated APIs

Check all resources in your cluster:

```bash
# Get all resources with their API versions
for resource in $(kubectl api-resources --verbs=list -o name); do
  kubectl get "$resource" --all-namespaces -o json 2>/dev/null | \
    jq -r ".items[] | .apiVersion + \" \" + .kind + \" \" + .metadata.name" 2>/dev/null
done | sort -u
```

This lists every resource with its API version.

### Step 2: Check Kubernetes Release Notes

Before upgrading your cluster, check the deprecation guide:

- [Kubernetes Deprecation Guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide/)

Look for removed APIs in your target Kubernetes version.

### Step 3: Update YAML Manifests

For each deprecated API:

1. **Use kubectl convert**:
   ```bash
   kubectl convert -f old-manifest.yaml --output-version <new-version>
   ```

2. **Review the changes** - some fields might have different names

3. **Test the new manifest** in a dev environment

4. **Update your source control** with the new version

### Step 4: Update Running Resources

You can update running resources in-place:

```bash
# Export current resource
kubectl get deployment myapp -o yaml > myapp-old.yaml

# Convert to new version
kubectl convert -f myapp-old.yaml --output-version apps/v1 > myapp-new.yaml

# Apply the updated version
kubectl apply -f myapp-new.yaml
```

Or let Kubernetes handle it automatically when you apply:

```bash
kubectl apply -f myapp-new.yaml
```

## Lab Exercise: Version Migration

Your task is to identify and fix deprecated API versions:

1. **Deploy the legacy resources**:
   ```
   kubectl apply -f labs/api-versions/specs/legacy-app/
   ```

2. **Check for deprecation warnings** - look at the kubectl output

3. **Identify the deprecated APIs** used in the legacy app

4. **Convert the resources** to current stable API versions

5. **Update the deployments** with the new versions

6. **Verify everything still works**

📋 Complete all steps and verify the app is running with current API versions

<details>
  <summary>Need help?</summary>

Check [hints.md](hints.md) for step-by-step guidance, or [solution.md](solution.md) for the complete solution.

</details><br/>

## Using kubectl explain for API Information

The `kubectl explain` command shows API documentation including version info:

```
kubectl explain deployment
```

> Shows the API version and description

For detailed field information:

```
kubectl explain deployment.spec
kubectl explain deployment.spec.template
```

To see the full structure:

```
kubectl explain deployment --recursive
```

## Automated Deprecation Checking

### kubent (Kubernetes No Trouble)

[kubent](https://github.com/doitintl/kube-no-trouble) is a tool that scans your cluster for deprecated APIs:

```bash
# Install kubent
sh -c "$(curl -sSL https://git.io/install-kubent)"

# Run deprecation check
kubent
```

> Shows all resources using deprecated APIs with remediation advice.

### Pluto

[Pluto](https://github.com/FairwindsOps/pluto) detects deprecated Kubernetes API versions:

```bash
# Install
brew install FairwindsOps/tap/pluto

# Check files
pluto detect-files -d .

# Check running cluster
pluto detect-helm
```

## Best Practices

### ✅ DO

1. **Always use stable APIs (v1)** in production
2. **Check release notes** before cluster upgrades
3. **Test in dev environments** before production updates
4. **Use kubectl convert** for bulk migrations
5. **Monitor deprecation warnings** in kubectl output
6. **Keep YAML manifests in version control** for easy updates
7. **Use automated tools** (kubent, pluto) for large clusters

### ❌ DON'T

1. **Don't ignore deprecation warnings** - they're advance notice
2. **Don't use alpha APIs** in production
3. **Don't skip testing** after API version changes
4. **Don't upgrade clusters** without checking for deprecated APIs first
5. **Don't wait until APIs are removed** - migrate proactively

## CKAD Exam Tips

### What You Must Know

1. **kubectl api-resources** - Finding current API versions
2. **kubectl convert** - Converting manifests to new versions
3. **kubectl explain** - Checking API documentation
4. **Deprecation warnings** - Recognizing when APIs are deprecated
5. **API version format** - Understanding `group/version` syntax

### Common Exam Tasks

- Identify the current API version for a resource type
- Convert a manifest from a deprecated API version to current
- Fix a deployment using a removed API version
- Check what API versions are available in the cluster

### Quick Reference Commands

```bash
# Find API version for a resource
kubectl api-resources | grep <resource>

# Check cluster API versions
kubectl api-versions

# Convert to new version
kubectl convert -f old.yaml --output-version <group/version>

# Check resource documentation
kubectl explain <resource>

# Get API version of running resource
kubectl get <resource> <name> -o yaml | grep apiVersion
```

### Time-Saving Tips

- Use `kubectl api-resources` with grep for quick lookups
- Remember common stable versions: `apps/v1`, `v1`, `batch/v1`, `networking.k8s.io/v1`
- Know that `v1` (without a group) is the core API
- Practice converting ingress and deployment - commonly tested

## Cleanup

Remove the demo resources:

```
kubectl delete -f labs/api-versions/specs/deployment-current-api.yaml

# If you completed the exercise:
kubectl delete -f labs/api-versions/specs/legacy-app/
```

## Key Takeaways

1. **API Maturity**: Alpha → Beta → Stable (v1)
2. **Deprecation Policy**: Advance warning before removal
3. **kubectl convert**: Tool for migrating API versions
4. **api-resources**: Command to discover current versions
5. **Version Format**: `group/version` or just `version` for core
6. **Proactive Migration**: Don't wait for APIs to be removed
7. **Testing**: Always test after version updates
8. **Automation**: Use tools like kubent for large-scale checks

## Additional Resources

- [Kubernetes API Conventions](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md)
- [API Deprecation Policy](https://kubernetes.io/docs/reference/using-api/deprecation-policy/)
- [Version Skew Policy](https://kubernetes.io/releases/version-skew-policy/)
