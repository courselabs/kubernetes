# Application Security with SecurityContexts

Security is a critical aspect of running applications in Kubernetes. The CKAD exam tests your ability to configure Pod and container security using SecurityContexts, capabilities, and other security features. This lab covers all the essential security configurations you need to know.

## Reference

- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)

- [SecurityContext](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)

- [Configure a Security Context for a Pod or Container](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)

- [Linux Capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)

## API specs

- [PodSecurityContext](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#podsecuritycontext-v1-core)

- [SecurityContext](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#securitycontext-v1-core)

<details>
  <summary>YAML overview</summary>

## SecurityContext Levels

Kubernetes has two levels of SecurityContext:

### 1. Pod-level SecurityContext

Applied to all containers in the Pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-demo
spec:
  securityContext:            # Pod-level security settings
    runAsUser: 1000          # Run as specific user ID
    runAsGroup: 3000         # Run with specific group ID
    fsGroup: 2000            # Filesystem group for volumes
    fsGroupChangePolicy: "OnRootMismatch"
    supplementalGroups: [4000]
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: nginx
```

### 2. Container-level SecurityContext

Applied to specific containers (overrides pod-level):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-demo
spec:
  containers:
    - name: app
      image: nginx
      securityContext:        # Container-level security settings
        runAsUser: 2000       # Overrides pod-level setting
        runAsNonRoot: true    # Prevent running as root
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        privileged: false
        capabilities:
          add: ["NET_ADMIN"]
          drop: ["ALL"]
```

## Key Security Fields

| Field | Level | Description |
|-------|-------|-------------|
| `runAsUser` | Pod/Container | User ID to run the container process |
| `runAsGroup` | Pod/Container | Group ID for the container process |
| `runAsNonRoot` | Container | Ensures container doesn't run as root |
| `fsGroup` | Pod | Group ID for volume ownership |
| `readOnlyRootFilesystem` | Container | Makes root filesystem read-only |
| `allowPrivilegeEscalation` | Container | Controls privilege escalation |
| `privileged` | Container | Run container in privileged mode |
| `capabilities` | Container | Add/drop Linux capabilities |
| `seLinuxOptions` | Pod/Container | SELinux labels |
| `seccompProfile` | Pod/Container | Seccomp profile to use |

</details><br/>

## Understanding Security Contexts

Before diving into examples, let's understand why security matters:

### The Problem

By default, containers often run as root, which poses security risks:

```
kubectl run insecure --image=nginx

kubectl exec insecure -- whoami
```

> Output: `root` - the container is running as root user!

Let's see what this means:

```
kubectl exec insecure -- id
```

> Shows UID 0 (root) and full group memberships. If this container is compromised, the attacker has root privileges.

📋 Clean up the insecure pod

<details>
  <summary>Not sure how?</summary>

```
kubectl delete pod insecure
```

</details><br/>

## Pod-level SecurityContext

Let's create a Pod with security settings applied at the Pod level:

- [pod-security-context.yaml](./specs/pod-security-context.yaml) - runs as specific user and group

📋 Deploy the Pod and check what user it's running as

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -f labs/security/specs/pod-security-context.yaml

kubectl exec pod-security-demo -- id
```

</details><br/>

Check the output:

```
kubectl exec pod-security-demo -- whoami

kubectl exec pod-security-demo -- id
```

> The container runs as user 1000, group 3000, with filesystem group 2000. No root access!

Try to perform a privileged operation:

```
kubectl exec pod-security-demo -- apt-get update
```

> Fails because the container doesn't have root privileges.

## Container-level SecurityContext

Container-level settings override Pod-level settings and provide more granular control:

- [container-security-context.yaml](./specs/container-security-context.yaml) - container-specific security settings

📋 Deploy this Pod and verify the security settings

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -f labs/security/specs/container-security-context.yaml

kubectl exec container-security-demo -- id

kubectl exec container-security-demo -- cat /etc/hostname
```

</details><br/>

Try to write to the filesystem:

```
kubectl exec container-security-demo -- touch /tmp/test
```

> Fails! The `readOnlyRootFilesystem: true` prevents any writes to the container filesystem.

This is a critical security practice - immutable containers can't be modified by attackers.

## Running as Non-Root

One of the most important security practices is ensuring containers don't run as root:

- [non-root.yaml](./specs/non-root.yaml) - enforces non-root execution

📋 Deploy this Pod

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -f labs/security/specs/non-root.yaml
```

</details><br/>

Check the Pod status:

```
kubectl get pods non-root-demo

kubectl describe pod non-root-demo
```

> The Pod is running successfully. The `runAsNonRoot: true` ensures the container can't start if the image tries to run as root.

Let's verify:

```
kubectl exec non-root-demo -- id
```

> Shows a non-root user ID.

## Working with Read-Only Filesystems

When using `readOnlyRootFilesystem: true`, applications that need to write temporary files need volume mounts:

- [readonly-with-volume.yaml](./specs/readonly-with-volume.yaml) - read-only root with writable /tmp

📋 Deploy this Pod and test writing to different locations

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -f labs/security/specs/readonly-with-volume.yaml

# Try to write to root filesystem (should fail)
kubectl exec readonly-demo -- touch /test.txt

# Try to write to /tmp (should succeed)
kubectl exec readonly-demo -- touch /tmp/test.txt
kubectl exec readonly-demo -- ls -l /tmp/
```

</details><br/>

> The emptyDir volume provides a writable location for temporary files while keeping the root filesystem immutable.

## Linux Capabilities

Linux capabilities allow fine-grained control over privileges without full root access:

### Dropping All Capabilities

The most secure approach is to drop all capabilities:

- [drop-all-capabilities.yaml](./specs/drop-all-capabilities.yaml) - drops all Linux capabilities

📋 Deploy this Pod and test network operations

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -f labs/security/specs/drop-all-capabilities.yaml

kubectl exec capabilities-demo -- ping -c 1 8.8.8.8
```

</details><br/>

> The ping might fail because we dropped all capabilities, including network-related ones.

### Adding Specific Capabilities

Sometimes you need specific capabilities for your application:

- [add-capabilities.yaml](./specs/add-capabilities.yaml) - adds NET_ADMIN capability

📋 Deploy this Pod

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -f labs/security/specs/add-capabilities.yaml
```

</details><br/>

> This Pod can perform network administration tasks but doesn't have full root privileges.

### Common Capabilities

| Capability | Description | Use Case |
|------------|-------------|----------|
| `NET_ADMIN` | Network configuration | Change routes, firewall rules |
| `NET_BIND_SERVICE` | Bind to ports < 1024 | Web servers on port 80/443 |
| `SYS_TIME` | Set system clock | Time synchronization services |
| `CHOWN` | Change file ownership | File management applications |
| `DAC_OVERRIDE` | Bypass file permissions | Backup applications |
| `SETUID/SETGID` | Set user/group ID | Applications that change users |

## Preventing Privilege Escalation

The `allowPrivilegeEscalation` field prevents processes from gaining more privileges:

- [no-privilege-escalation.yaml](./specs/no-privilege-escalation.yaml) - blocks privilege escalation

📋 Deploy this Pod and try to escalate privileges

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -f labs/security/specs/no-privilege-escalation.yaml

# Try to run a setuid binary
kubectl exec escalation-demo -- /bin/su
```

</details><br/>

> The setuid mechanism is blocked by `allowPrivilegeEscalation: false`.

## Privileged Containers

Privileged containers have access to all host devices and run with elevated privileges. **Avoid these in production unless absolutely necessary!**

- [privileged-pod.yaml](./specs/privileged-pod.yaml) - demonstrates a privileged container

```
kubectl apply -f labs/security/specs/privileged-pod.yaml

kubectl exec privileged-demo -- ls /dev
```

> You'll see all host devices. This is dangerous and should only be used for specific system-level tasks.

## Filesystem Group (fsGroup)

The `fsGroup` field sets ownership for mounted volumes:

- [fsgroup-demo.yaml](./specs/fsgroup-demo.yaml) - demonstrates fsGroup for volume permissions

📋 Deploy this Pod and check volume permissions

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -f labs/security/specs/fsgroup-demo.yaml

kubectl exec fsgroup-demo -- ls -la /data

kubectl exec fsgroup-demo -- id
```

</details><br/>

> The /data volume is owned by group 2000 (the fsGroup), allowing the container to write to it.

Try creating a file:

```
kubectl exec fsgroup-demo -- touch /data/test.txt

kubectl exec fsgroup-demo -- ls -l /data/
```

> The file is created with group ownership 2000.

## Lab Exercise: Secure a Web Application

Your task is to create a secure nginx deployment with these requirements:

1. **Non-root execution**: Container must not run as root
2. **Read-only filesystem**: Root filesystem must be read-only
3. **Writable cache**: nginx needs /var/cache/nginx and /var/run to be writable
4. **Drop capabilities**: Drop all capabilities except NET_BIND_SERVICE (for port 80)
5. **No privilege escalation**: Prevent privilege escalation
6. **Specific user**: Run as user ID 101 (nginx user)

📋 Create a Pod spec that meets all these requirements and deploy it.

<details>
  <summary>Need help?</summary>

Check [hints.md](hints.md) for guidance on each requirement, or [solution.md](solution.md) for the complete solution.

</details><br/>

Test your deployment:

```
# Check the Pod is running
kubectl get pod secure-nginx

# Verify it's running as non-root
kubectl exec secure-nginx -- id

# Check you can access nginx
kubectl exec secure-nginx -- curl -s localhost
```

## Security Best Practices

### ✅ DO

1. **Always run as non-root** - Use `runAsNonRoot: true`
2. **Use read-only filesystems** - Set `readOnlyRootFilesystem: true`
3. **Drop all capabilities by default** - Add only what you need
4. **Prevent privilege escalation** - Set `allowPrivilegeEscalation: false`
5. **Use specific user IDs** - Set `runAsUser` to a known UID
6. **Set resource limits** - Prevent resource exhaustion attacks
7. **Use seccomp profiles** - Apply `RuntimeDefault` seccomp profile

### ❌ DON'T

1. **Don't run privileged containers** - Unless absolutely necessary
2. **Don't run as root** - Especially in production
3. **Don't add unnecessary capabilities** - Follow least privilege
4. **Don't use `privileged: true`** - Almost never needed
5. **Don't skip security contexts** - Default settings are insecure

## CKAD Exam Tips

### What You Must Know

1. **SecurityContext syntax** - Both pod and container levels
2. **runAsUser, runAsGroup, fsGroup** - User and group ID settings
3. **readOnlyRootFilesystem** - Making containers immutable
4. **capabilities add/drop** - Especially dropping ALL
5. **allowPrivilegeEscalation** - Preventing escalation
6. **runAsNonRoot** - Enforcing non-root execution

### Common Exam Tasks

- Add a security context to an existing Deployment
- Make a container run as non-root
- Set read-only root filesystem with writable volumes
- Drop all capabilities from a container
- Configure fsGroup for shared volumes

### Quick Reference

```yaml
# Minimal secure container
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop: ["ALL"]
```

### Time-Saving Tips

- Know the field names exactly - `runAsUser`, not `user`
- Remember: Pod level uses `securityContext:`, container level too
- Practice adding emptyDir volumes for writable directories
- Use `kubectl explain pod.spec.securityContext` for quick reference
- Use `kubectl explain pod.spec.containers.securityContext`

## Cleanup

Remove all the demo Pods:

```
kubectl delete pod pod-security-demo container-security-demo non-root-demo \
  readonly-demo capabilities-demo capabilities-net-demo escalation-demo \
  privileged-demo fsgroup-demo

# If you created the exercise Pod:
kubectl delete pod secure-nginx
```

## Key Takeaways

1. **Two levels**: Pod-level and container-level SecurityContexts
2. **Container overrides Pod**: Container settings take precedence
3. **runAsNonRoot**: Critical for production security
4. **readOnlyRootFilesystem**: Immutable containers are more secure
5. **Drop ALL capabilities**: Start secure, add only what you need
6. **allowPrivilegeEscalation: false**: Prevent escalation attacks
7. **fsGroup**: Essential for multi-user volume access
8. **Privileged containers**: Avoid unless absolutely necessary

## Additional Resources

- [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes)
- [NIST Application Container Security Guide](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-190.pdf)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/security-checklist/)
