# CKAD Exam Guide: Application Security & SecurityContexts

## Why Security Matters for CKAD

**Domain**: Application Environment, Configuration and Security (25% of exam)
**Importance**: ⭐⭐⭐⭐⭐ CRITICAL - 25% of your total score!

SecurityContexts are a **mandatory topic** for CKAD. You will face questions requiring you to:
- Add SecurityContext to Pods or containers
- Configure runAsUser, runAsGroup, runAsNonRoot
- Work with capabilities (add/drop)
- Set readOnlyRootFilesystem
- Configure allowPrivilegeEscalation
- Use fsGroup for volume permissions

**Time estimate**: 5-8 minutes per security question on the exam

---

## Quick Reference for the Exam

### Pod-level SecurityContext

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:          # Pod-level: applies to all containers
    runAsUser: 1000         # Run as UID 1000
    runAsGroup: 3000        # Primary group GID 3000
    fsGroup: 2000           # Volume ownership GID 2000
    supplementalGroups: [4000]
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: nginx
```

### Container-level SecurityContext

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  containers:
  - name: app
    image: nginx
    securityContext:        # Container-level: overrides pod-level
      runAsUser: 2000       # Different user than pod-level
      runAsNonRoot: true    # Enforce non-root (will fail if image runs as root)
      readOnlyRootFilesystem: true       # Immutable container
      allowPrivilegeEscalation: false    # Prevent privilege escalation
      privileged: false                  # Not privileged
      capabilities:
        drop: ["ALL"]       # Drop all capabilities first
        add: ["NET_BIND_SERVICE"]  # Then add only what's needed
```

### Quick Comparison: Pod vs Container Level

| Field | Pod Level | Container Level | Which Wins? |
|-------|-----------|-----------------|-------------|
| `runAsUser` | ✅ Yes | ✅ Yes | Container |
| `runAsGroup` | ✅ Yes | ✅ Yes | Container |
| `fsGroup` | ✅ Yes | ❌ No | Pod only |
| `runAsNonRoot` | ❌ No | ✅ Yes | Container only |
| `readOnlyRootFilesystem` | ❌ No | ✅ Yes | Container only |
| `allowPrivilegeEscalation` | ❌ No | ✅ Yes | Container only |
| `capabilities` | ❌ No | ✅ Yes | Container only |

---

## Exam Scenarios You'll Face

### Scenario 1: Run Pod as Non-Root User

**Task**: "Create a Pod named `secure-app` with image `nginx` that runs as user ID 1000."

**Solution**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:
    runAsUser: 1000
  containers:
  - name: nginx
    image: nginx
```

**Verify**:
```bash
kubectl exec secure-app -- id
# Should show uid=1000
```

### Scenario 2: Enforce Non-Root

**Task**: "Ensure the container fails to start if the image tries to run as root."

**Solution**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  containers:
  - name: app
    image: myapp
    securityContext:
      runAsNonRoot: true
```

### Scenario 3: Read-Only Root Filesystem

**Task**: "Make the container's root filesystem read-only but allow writes to /tmp."

**Solution**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  containers:
  - name: app
    image: myapp
    securityContext:
      readOnlyRootFilesystem: true
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
```

### Scenario 4: Drop All Capabilities

**Task**: "Run a container with all Linux capabilities dropped except NET_BIND_SERVICE."

**Solution**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  containers:
  - name: app
    image: myapp
    securityContext:
      capabilities:
        drop: ["ALL"]
        add: ["NET_BIND_SERVICE"]
```

### Scenario 5: Set Volume Permissions

**Task**: "Create a Pod with a volume that's owned by group ID 2000."

**Solution**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:
    fsGroup: 2000
  containers:
  - name: app
    image: myapp
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    emptyDir: {}
```

**Verify**:
```bash
kubectl exec secure-app -- ls -ld /data
# Should show group ownership as 2000
```

---

## Essential SecurityContext Fields (Memorize These!)

### Must Know for Exam

| Field | Purpose | Level | Example Value |
|-------|---------|-------|---------------|
| `runAsUser` | Set user ID | Pod/Container | `1000` |
| `runAsGroup` | Set primary group | Pod/Container | `3000` |
| `runAsNonRoot` | Enforce non-root | Container | `true` |
| `fsGroup` | Volume ownership | Pod | `2000` |
| `readOnlyRootFilesystem` | Immutable container | Container | `true` |
| `allowPrivilegeEscalation` | Block privilege gain | Container | `false` |
| `privileged` | Full host access | Container | `false` (avoid true!) |
| `capabilities.drop` | Remove capabilities | Container | `["ALL"]` |
| `capabilities.add` | Add capabilities | Container | `["NET_BIND_SERVICE"]` |

### Common Linux Capabilities

| Capability | What It Does | When You Need It |
|------------|--------------|------------------|
| `NET_BIND_SERVICE` | Bind to ports < 1024 | Web servers on port 80/443 |
| `NET_ADMIN` | Network configuration | Network tools, VPNs |
| `SYS_TIME` | Change system clock | Time sync services |
| `CHOWN` | Change file ownership | File management apps |
| `SETUID` / `SETGID` | Set user/group ID | User switching apps |

---

## Exam Tips & Time Savers

### ✅ DO This

1. **Always drop ALL capabilities first**, then add specific ones:
   ```yaml
   capabilities:
     drop: ["ALL"]
     add: ["NET_BIND_SERVICE"]
   ```

2. **Use runAsNonRoot for enforcement**:
   ```yaml
   securityContext:
     runAsUser: 1000
     runAsNonRoot: true  # Extra safety - fails if image ignores runAsUser
   ```

3. **Combine readOnlyRootFilesystem with volumes**:
   ```yaml
   securityContext:
     readOnlyRootFilesystem: true
   volumeMounts:
   - name: tmp
     mountPath: /tmp
   ```

4. **Check your work with exec**:
   ```bash
   # Check user
   kubectl exec <pod> -- id

   # Check filesystem
   kubectl exec <pod> -- touch /test.txt

   # Check capabilities (if busybox/alpine)
   kubectl exec <pod> -- cat /proc/1/status | grep Cap
   ```

### ❌ DON'T Do This

1. **Don't confuse Pod and Container level** - Some fields only work at one level:
   ```yaml
   # ❌ Wrong - fsGroup is Pod-level only
   containers:
   - name: app
     securityContext:
       fsGroup: 2000

   # ✅ Correct
   spec:
     securityContext:
       fsGroup: 2000
   ```

2. **Don't use privileged: true** unless explicitly required:
   ```yaml
   # ❌ Dangerous
   securityContext:
     privileged: true

   # ✅ Use specific capabilities instead
   securityContext:
     capabilities:
       add: ["NET_ADMIN"]
   ```

3. **Don't forget to mount volumes** with readOnlyRootFilesystem:
   ```yaml
   # ❌ Will fail - app can't write logs
   securityContext:
     readOnlyRootFilesystem: true

   # ✅ Add writable temp dir
   securityContext:
     readOnlyRootFilesystem: true
   volumeMounts:
   - name: tmp
     mountPath: /tmp
   ```

---

## Troubleshooting on the Exam

### Error: "container has runAsNonRoot and image will run as root"

**Cause**: Image is configured to run as root, but you set `runAsNonRoot: true`
**Fix**: Add `runAsUser: 1000` (or any non-zero value) to override

```yaml
securityContext:
  runAsUser: 1000
  runAsNonRoot: true
```

### Error: "read-only file system"

**Cause**: Application trying to write files with `readOnlyRootFilesystem: true`
**Fix**: Mount an emptyDir volume for writable locations

```yaml
securityContext:
  readOnlyRootFilesystem: true
volumeMounts:
- name: tmp
  mountPath: /tmp
volumes:
- name: tmp
  emptyDir: {}
```

### Error: "operation not permitted"

**Cause**: Dropped too many capabilities or blocked privilege escalation
**Fix**: Add specific capability needed

```yaml
securityContext:
  capabilities:
    drop: ["ALL"]
    add: ["NET_BIND_SERVICE"]  # Add what's needed
```

### Permission Denied on Volume

**Cause**: Volume has wrong ownership
**Fix**: Set `fsGroup` at pod level

```yaml
securityContext:
  fsGroup: 2000
```

---

## Production Security Best Practices (Exam Favorite!)

### Minimal Security Baseline

Every production Pod should have at minimum:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: production-app
spec:
  securityContext:
    runAsUser: 1000      # Never root
    runAsGroup: 3000
    fsGroup: 2000        # For volume permissions
  containers:
  - name: app
    image: myapp
    securityContext:
      runAsNonRoot: true              # Enforce
      readOnlyRootFilesystem: true    # Immutable
      allowPrivilegeEscalation: false # No escalation
      capabilities:
        drop: ["ALL"]                 # Drop everything
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
```

### Hardened Production Template

For maximum security:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hardened-app
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: myapp:v1.0.0  # Never :latest
    securityContext:
      runAsNonRoot: true
      readOnlyRootFilesystem: true
      allowPrivilegeEscalation: false
      privileged: false
      capabilities:
        drop: ["ALL"]
      seccompProfile:
        type: RuntimeDefault
    resources:
      requests:
        memory: "64Mi"
        cpu: "100m"
      limits:
        memory: "128Mi"
        cpu: "200m"
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
```

---

## Practice Scenarios (Time Yourself: 6 minutes each)

### Practice 1: Basic Security

Create a Pod that:
- Runs as user 1000
- Enforces non-root
- Has read-only root filesystem
- Has writable /tmp

<details>
<summary>Solution</summary>

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsUser: 1000
  containers:
  - name: app
    image: nginx
    securityContext:
      runAsNonRoot: true
      readOnlyRootFilesystem: true
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
```
</details>

### Practice 2: Capabilities

Create a Pod that drops all capabilities except NET_BIND_SERVICE.

<details>
<summary>Solution</summary>

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cap-pod
spec:
  containers:
  - name: app
    image: nginx
    securityContext:
      capabilities:
        drop: ["ALL"]
        add: ["NET_BIND_SERVICE"]
```
</details>

### Practice 3: Volume Permissions

Create a Pod with fsGroup 2000 and verify volume ownership.

<details>
<summary>Solution</summary>

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: fsgroup-pod
spec:
  securityContext:
    fsGroup: 2000
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    emptyDir: {}
```

Verify:
```bash
kubectl exec fsgroup-pod -- ls -ld /data
```
</details>

### Practice 4: Secure Deployment

Take an existing Deployment and add security context to make it production-ready.

<details>
<summary>Solution</summary>

```bash
# Get existing deployment
kubectl get deployment myapp -o yaml > deployment.yaml

# Edit to add:
spec:
  template:
    spec:
      securityContext:
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - name: app
        securityContext:
          runAsNonRoot: true
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
          capabilities:
            drop: ["ALL"]
        volumeMounts:
        - name: tmp
          mountPath: /tmp
    volumes:
    - name: tmp
      emptyDir: {}

# Apply
kubectl apply -f deployment.yaml
```
</details>

---

## Common Exam Patterns

### Pattern 1: "Secure this Pod"

Given an insecure Pod, add security settings. Look for:
- Is it running as root? → Add `runAsUser` and `runAsNonRoot`
- Can it write to filesystem? → Add `readOnlyRootFilesystem` + volumes
- Does it have all capabilities? → Drop ALL, add specific ones
- Can it escalate privileges? → Add `allowPrivilegeEscalation: false`

### Pattern 2: "Fix permission errors"

App can't access files on a volume:
- Add `fsGroup` at Pod level
- Ensure runAsUser is compatible with fsGroup

### Pattern 3: "Why won't this Pod start?"

Common causes:
- `runAsNonRoot: true` but image runs as root → Add `runAsUser: 1000`
- `readOnlyRootFilesystem: true` but app writes logs → Add writable volume mount
- Missing capabilities → Add specific capability needed

---

## Exam Day Checklist

Before completing a security question:

- [ ] **Pod vs Container level** - Did you put fields at correct level?
- [ ] **runAsUser + runAsNonRoot** - Both set?
- [ ] **readOnlyRootFilesystem** - Need writable volumes?
- [ ] **Capabilities** - Drop ALL first, then add?
- [ ] **fsGroup** - Need for volume permissions?
- [ ] **Verify** - Test with kubectl exec before moving on

---

## Key Points to Remember

1. **Two levels**: Pod-level and container-level SecurityContext
2. **Container wins**: Container-level overrides pod-level for same field
3. **Drop ALL capabilities first**, then add specific ones
4. **readOnlyRootFilesystem requires volumes** for writable locations
5. **fsGroup is Pod-level only**, sets volume ownership
6. **runAsNonRoot enforces** - fails if image tries to run as root
7. **Never use privileged: true** unless absolutely required
8. **Test with kubectl exec** - `id`, `touch /test.txt`, etc.

---

## Time Management

**Typical exam question**: 6-8 minutes

| Task | Time |
|------|------|
| Read requirements | 1 min |
| Add securityContext YAML | 3-4 min |
| Apply and verify | 2-3 min |

If stuck beyond 8 minutes → **flag and move on**

---

## Additional Resources

During the exam you can access:
- [Configure Security Context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)

**Bookmark these** before the exam!

---

## Summary

✅ **Master these for CKAD**:
- Pod-level vs container-level SecurityContext
- runAsUser, runAsGroup, runAsNonRoot
- readOnlyRootFilesystem with volumes
- Capabilities (drop ALL, add specific)
- fsGroup for volume permissions
- allowPrivilegeEscalation: false
- Production security baseline template

🎯 **Exam weight**: 25% of total score (highest weighted domain!)
⏱️ **Time per question**: 6-8 minutes
📊 **Difficulty**: Medium (lots of fields to remember)

Practice this lab multiple times until the security settings become second nature!
