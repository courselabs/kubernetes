# Pods - Quickfire Questions

Test your knowledge of Kubernetes Pods with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the minimum required fields in a Pod YAML specification?

A) apiVersion, metadata, containers
B) apiVersion, kind, metadata, spec, status
C) apiVersion, kind, metadata (with name), spec (with containers)
D) kind, metadata, spec

### 2. Which multi-container Pod pattern uses a helper container to extend the functionality of the main application?

A) Sidecar pattern
B) Proxy pattern
C) Ambassador pattern
D) Adapter pattern

### 3. What is the difference between init containers and regular containers in a Pod?

A) Init containers run after the main containers start
B) Init containers run in parallel with main containers
C) Init containers run to completion before main containers start
D) Init containers can only be used for network initialization

### 4. When a container exceeds its memory limit, what happens?

A) The Pod is evicted from the node
B) Kubernetes automatically increases the limit
C) The container is throttled
D) The container is OOMKilled (terminated)

### 5. What is the purpose of a readiness probe?

A) To check if the container has started
B) To restart the container if it fails
C) To monitor resource usage
D) To remove the Pod from service endpoints if the probe fails

### 6. Which QoS class is assigned to a Pod when requests equal limits for all containers?

A) Premium
B) Burstable
C) BestEffort
D) Guaranteed

### 7. What field in the Pod spec overrides the ENTRYPOINT defined in a container's Dockerfile?

A) cmd
B) command
C) args
D) entrypoint

### 8. What is the purpose of setting `runAsNonRoot: true` in a security context?

A) To prevent the container from running as the root user
B) To disable user authentication
C) To run the container with root privileges
D) To change the container's user ID to 0

### 9. Which restart policy should you use if you want a container to restart only when it exits with a non-zero status?

A) OnFailure
B) Always
C) Never
D) OnError

### 10. How can you expose environment variables from a ConfigMap to all containers in a Pod?

A) Using `volumes` and `volumeMounts`
B) Using `env` with `valueFrom`
C) Using `configMapKeyRef` in metadata
D) Using `envFrom` with `configMapRef`

---

## Answers

1. **C** - A Pod requires apiVersion, kind, metadata (with name), and spec (with containers array containing at least one container with name and image).

2. **A** - The sidecar pattern runs a helper container alongside the main application container to extend or enhance its functionality (e.g., log processing, monitoring).

3. **C** - Init containers run sequentially to completion before the main application containers start. They are useful for setup tasks like database migrations or configuration.

4. **D** - When a container exceeds its memory limit, it is terminated (OOMKilled). The kubelet may restart it depending on the restart policy.

5. **D** - Readiness probes determine if a Pod should receive traffic. If a readiness probe fails, the Pod is removed from service endpoints but not restarted.

6. **D** - The Guaranteed QoS class is assigned when every container has memory and CPU requests equal to their limits.

7. **B** - The `command` field in a Pod spec overrides the Dockerfile's ENTRYPOINT. The `args` field overrides CMD.

8. **A** - The `runAsNonRoot: true` setting ensures the container cannot run as the root user (UID 0), enhancing security by enforcing non-privileged execution.

9. **A** - OnFailure restart policy restarts the container only if it exits with a non-zero (error) status code.

10. **D** - Using `envFrom` with `configMapRef` exposes all key-value pairs from a ConfigMap as environment variables in the container.

---

## Study Resources

- [Lab README](README.md) - Core Pod concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Pod topics
- [Official Pod Documentation](https://kubernetes.io/docs/concepts/workloads/pods/)
