# Lab Hints

## Securing the Nginx Container

The exercise asks you to create a secure nginx Pod with multiple security requirements. Here are hints for each requirement:

### 1. Non-root Execution

To ensure the container doesn't run as root:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 101  # nginx user ID
```

The nginx official image uses user ID 101 for the nginx user.

### 2. Read-only Filesystem

Make the root filesystem immutable:

```yaml
securityContext:
  readOnlyRootFilesystem: true
```

But nginx needs to write to certain directories...

### 3. Writable Cache Directories

Nginx needs to write to `/var/cache/nginx` and `/var/run`. Use emptyDir volumes:

```yaml
volumeMounts:
  - name: cache
    mountPath: /var/cache/nginx
  - name: run
    mountPath: /var/run

volumes:
  - name: cache
    emptyDir: {}
  - name: run
    emptyDir: {}
```

### 4. Drop Capabilities

Drop all capabilities except NET_BIND_SERVICE (needed for port 80):

```yaml
securityContext:
  capabilities:
    drop:
      - ALL
    add:
      - NET_BIND_SERVICE
```

### 5. Prevent Privilege Escalation

Add this to the security context:

```yaml
securityContext:
  allowPrivilegeEscalation: false
```

### 6. Putting It All Together

You need to combine all these settings. Remember:
- Some settings go in the container's `securityContext`
- The `volumeMounts` go in the container spec
- The `volumes` go in the Pod spec (not in containers)

### Structure Template

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-nginx
spec:
  containers:
    - name: nginx
      image: nginx:alpine
      securityContext:
        # Add all security settings here
      volumeMounts:
        # Add volume mounts here
  volumes:
    # Add volumes here
```

### Testing Your Solution

After creating your Pod:

1. Check it's running:
   ```bash
   kubectl get pod secure-nginx
   ```

2. Verify user ID:
   ```bash
   kubectl exec secure-nginx -- id
   ```
   Should show UID 101

3. Test nginx is working:
   ```bash
   kubectl exec secure-nginx -- wget -q -O- localhost
   ```
   Should return HTML

4. Verify read-only filesystem:
   ```bash
   kubectl exec secure-nginx -- touch /test.txt
   ```
   Should fail with "Read-only file system"

5. Verify writable cache:
   ```bash
   kubectl exec secure-nginx -- touch /var/cache/nginx/test.txt
   ```
   Should succeed

If any test fails, review the hints above and check your YAML syntax.

### Common Mistakes

- Forgetting to add emptyDir volumes for nginx's writable directories
- Putting volumes in the wrong place (should be at Pod level, not container)
- Wrong user ID (nginx uses 101, not 1000)
- Forgetting to add NET_BIND_SERVICE capability
- Missing `runAsNonRoot: true`

Still stuck? Check [solution.md](solution.md) for the complete working solution.
