# Scenario 5: Secure Application Configuration

**Difficulty**: Advanced
**Time Limit**: 18 minutes
**CKAD Domains**: Application Environment, Configuration & Security (25%)

## Scenario

Deploy an application with proper security configurations using RBAC, ServiceAccounts, and secure credential management.

## Requirements

1. **Create a namespace** called `secure-app`

2. **Create a ServiceAccount** called `app-sa` in the `secure-app` namespace

3. **Create a Role** called `pod-reader` that allows:
   - Resources: pods, pods/log
   - Verbs: get, list, watch

4. **Create a RoleBinding** called `read-pods`:
   - Bind the `pod-reader` Role to the `app-sa` ServiceAccount

5. **Create a Secret** called `api-credentials`:
   - `API_KEY=abc123xyz789`
   - `API_SECRET=super-secret-value`

6. **Create a Pod** called `secure-app`:
   - Image: `busybox:1.36`
   - Command: `sh -c "while true; do echo 'Running...'; sleep 30; done"`
   - Use the `app-sa` ServiceAccount
   - Mount the `api-credentials` Secret as a volume at `/etc/secrets`
   - Set security context: runAsNonRoot: true, runAsUser: 1000
   - Labels: `app=secure-app`

## Verification

```bash
# Check all resources
kubectl get sa,role,rolebinding,secret,pod -n secure-app

# Verify ServiceAccount
kubectl describe sa app-sa -n secure-app

# Verify Role permissions
kubectl describe role pod-reader -n secure-app

# Verify RoleBinding
kubectl describe rolebinding read-pods -n secure-app

# Test RBAC permissions
kubectl auth can-i get pods --as=system:serviceaccount:secure-app:app-sa -n secure-app
kubectl auth can-i delete pods --as=system:serviceaccount:secure-app:app-sa -n secure-app

# Verify Secret is mounted
kubectl exec secure-app -n secure-app -- ls -l /etc/secrets
kubectl exec secure-app -n secure-app -- cat /etc/secrets/API_KEY

# Verify security context
kubectl get pod secure-app -n secure-app -o jsonpath='{.spec.securityContext}'
```

## Success Criteria

- [ ] ServiceAccount, Role, and RoleBinding are created
- [ ] ServiceAccount can read pods but not delete them
- [ ] Secret is mounted as a volume in the Pod
- [ ] Pod is running with non-root user (UID 1000)
- [ ] Pod is using the custom ServiceAccount

## Clean Up

```bash
kubectl delete namespace secure-app
```

[See Solution](solution.md)
