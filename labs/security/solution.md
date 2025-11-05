# Lab Solution

## Secure Nginx Pod

Here's the complete solution for the secure nginx Pod exercise.

### Complete YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-nginx
  labels:
    kubernetes.courselabs.co: security
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:alpine
      ports:
        - containerPort: 80
      securityContext:
        # Requirement 1 & 6: Run as non-root (nginx user = 101)
        runAsNonRoot: true
        runAsUser: 101

        # Requirement 2: Read-only filesystem
        readOnlyRootFilesystem: true

        # Requirement 4: Drop all capabilities, add only NET_BIND_SERVICE
        capabilities:
          drop:
            - ALL
          add:
            - NET_BIND_SERVICE

        # Requirement 5: Prevent privilege escalation
        allowPrivilegeEscalation: false

      # Requirement 3: Writable directories for nginx
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

### Deployment Steps

1. **Create the Pod:**

```bash
kubectl apply -f labs/security/solution/secure-nginx.yaml
```

Or create it directly:

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: secure-nginx
  labels:
    kubernetes.courselabs.co: security
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:alpine
      ports:
        - containerPort: 80
      securityContext:
        runAsNonRoot: true
        runAsUser: 101
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
          add:
            - NET_BIND_SERVICE
        allowPrivilegeEscalation: false
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
EOF
```

2. **Verify the Pod is running:**

```bash
kubectl get pod secure-nginx
```

Expected output:
```
NAME           READY   STATUS    RESTARTS   AGE
secure-nginx   1/1     Running   0          10s
```

### Verification Steps

#### 1. Check Non-Root Execution

```bash
kubectl exec secure-nginx -- id
```

Expected output:
```
uid=101(nginx) gid=101(nginx) groups=101(nginx)
```

✅ Running as user 101 (nginx user), not root

#### 2. Verify Read-Only Filesystem

```bash
kubectl exec secure-nginx -- touch /test.txt
```

Expected output:
```
touch: /test.txt: Read-only file system
```

✅ Cannot write to root filesystem

#### 3. Verify Writable Cache Directory

```bash
kubectl exec secure-nginx -- touch /var/cache/nginx/test.txt
kubectl exec secure-nginx -- ls -l /var/cache/nginx/test.txt
```

Expected output:
```
-rw-r--r--    1 nginx    nginx            0 Nov  4 21:00 /var/cache/nginx/test.txt
```

✅ Can write to mounted emptyDir volume

#### 4. Verify Nginx is Working

```bash
kubectl exec secure-nginx -- wget -q -O- localhost
```

Expected output: HTML from nginx default page

✅ Nginx is serving content on port 80 (thanks to NET_BIND_SERVICE capability)

#### 5. Check Security Context Settings

```bash
kubectl get pod secure-nginx -o jsonpath='{.spec.containers[0].securityContext}' | jq
```

Expected output:
```json
{
  "allowPrivilegeEscalation": false,
  "capabilities": {
    "add": [
      "NET_BIND_SERVICE"
    ],
    "drop": [
      "ALL"
    ]
  },
  "readOnlyRootFilesystem": true,
  "runAsNonRoot": true,
  "runAsUser": 101
}
```

✅ All security settings properly applied

### Explanation of Each Requirement

#### Requirement 1: Non-root Execution

```yaml
runAsNonRoot: true
runAsUser: 101
```

- `runAsNonRoot: true` - Kubernetes will refuse to start the Pod if the image tries to run as root
- `runAsUser: 101` - Explicitly sets the user ID to 101 (the nginx user in the official image)

#### Requirement 2: Read-only Filesystem

```yaml
readOnlyRootFilesystem: true
```

- Makes the entire root filesystem read-only
- Prevents any modifications to the container filesystem
- Critical security practice: immutable containers can't be modified by attackers

#### Requirement 3: Writable Directories

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

- Nginx needs to write temporary files, cache, and PID files
- EmptyDir volumes provide writable storage without compromising filesystem immutability
- These are temporary directories that don't persist beyond the Pod's lifecycle

#### Requirement 4: Drop All Capabilities

```yaml
capabilities:
  drop:
    - ALL
  add:
    - NET_BIND_SERVICE
```

- Drops all Linux capabilities (removes all special privileges)
- Adds back only NET_BIND_SERVICE (needed to bind to port 80)
- Follows the principle of least privilege

#### Requirement 5: No Privilege Escalation

```yaml
allowPrivilegeEscalation: false
```

- Prevents processes from gaining more privileges than their parent
- Blocks setuid binaries and other escalation mechanisms
- Essential security control

#### Requirement 6: Specific User

```yaml
runAsUser: 101
```

- User ID 101 is the nginx user in the official nginx images
- Using a specific UID ensures consistent permissions
- Better than relying on the image's default user

### Alternative: Using a Deployment

For production, you'd typically use a Deployment instead of a Pod:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          ports:
            - containerPort: 80
          securityContext:
            runAsNonRoot: true
            runAsUser: 101
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
              add:
                - NET_BIND_SERVICE
            allowPrivilegeEscalation: false
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

### Cleanup

```bash
kubectl delete pod secure-nginx
```

### Key Takeaways

1. **Layered security** - Combine multiple security controls for defense in depth
2. **Read-only filesystems** - Use with emptyDir volumes for necessary writable paths
3. **Drop ALL capabilities** - Start with nothing, add only what's needed
4. **Non-root users** - Always specify `runAsNonRoot: true`
5. **Prevent escalation** - Always set `allowPrivilegeEscalation: false`
6. **Know your app** - Understand what capabilities and filesystem access your app needs

This configuration represents a production-ready security baseline for containerized applications.
