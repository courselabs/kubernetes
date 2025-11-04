# Scenario 4: Application Update and Rollback

**Difficulty**: Intermediate
**Time Limit**: 12 minutes
**CKAD Domains**: Application Deployment (20%), Application Observability (15%)

## Scenario

You have a running application that needs to be updated to a new version. After the update, you discover issues and need to rollback to the previous version.

## Requirements

1. **Create a namespace** called `app-updates`

2. **Create a Deployment** called `myapp` in the `app-updates` namespace:
   - Image: `nginx:1.19-alpine`
   - Replicas: 4
   - Labels: `app=myapp`, `version=v1`
   - Record the deployment (for rollback tracking)
   - Rolling update strategy: maxSurge=1, maxUnavailable=1

3. **Update the Deployment** to version 2:
   - Change image to `nginx:1.20-alpine`
   - Update label `version=v2`
   - Record the change

4. **Check rollout status** and view rollout history

5. **Rollback to previous version** (v1)

6. **Verify** the rollback was successful

## Verification

```bash
# Check Deployment
kubectl get deployment myapp -n app-updates
kubectl describe deployment myapp -n app-updates

# Check rollout status
kubectl rollout status deployment/myapp -n app-updates

# View rollout history
kubectl rollout history deployment/myapp -n app-updates

# Check current image version
kubectl get pods -n app-updates -o jsonpath='{.items[0].spec.containers[0].image}'

# Check labels
kubectl get pods -n app-updates --show-labels
```

## Success Criteria

- [ ] Deployment created with v1 (nginx:1.19-alpine)
- [ ] Successfully updated to v2 (nginx:1.20-alpine)
- [ ] Rollout history shows both revisions
- [ ] Successfully rolled back to v1
- [ ] All 4 Pods are running with v1 image

## Clean Up

```bash
kubectl delete namespace app-updates
```

## Hints

<details>
  <summary>Click to see hints</summary>

### Hint 1: Recording Changes
Use `--record` flag (deprecated but still works) or use `kubectl annotate` with `kubernetes.io/change-cause`.

### Hint 2: Update Deployment
Use `kubectl set image` or `kubectl edit` to update the image.

### Hint 3: Rollback
Use `kubectl rollout undo deployment/myapp -n app-updates`.

</details>

[See Solution](solution.md)
