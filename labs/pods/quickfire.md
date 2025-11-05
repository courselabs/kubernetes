# Pods - Quickfire Questions

Test your knowledge of Kubernetes Pods with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the minimum required fields in a Pod YAML specification?

A) apiVersion, kind, metadata (with name), spec (with containers)
B) apiVersion, kind, metadata, spec, status
C) kind, metadata, spec
D) apiVersion, metadata, containers

### 2. Which multi-container Pod pattern uses a helper container to extend the functionality of the main application?

A) Ambassador pattern
B) Adapter pattern
C) Sidecar pattern
D) Proxy pattern

### 3. What is the difference between init containers and regular containers in a Pod?

A) Init containers run after the main containers start
B) Init containers run to completion before main containers start
C) Init containers run in parallel with main containers
D) Init containers can only be used for network initialization

### 4. When a container exceeds its memory limit, what happens?

A) The container is throttled
B) The Pod is evicted from the node
C) The container is OOMKilled (terminated)
D) Kubernetes automatically increases the limit

### 5. What is the purpose of a readiness probe?

A) To restart the container if it fails
B) To remove the Pod from service endpoints if the probe fails
C) To check if the container has started
D) To monitor resource usage

### 6. Which QoS class is assigned to a Pod when requests equal limits for all containers?

A) BestEffort
B) Burstable
C) Guaranteed
D) Premium

### 7. What field in the Pod spec overrides the ENTRYPOINT defined in a container's Dockerfile?

A) args
B) command
C) entrypoint
D) cmd

### 8. What is the purpose of setting `runAsNonRoot: true` in a security context?

A) To run the container with root privileges
B) To prevent the container from running as the root user
C) To change the container's user ID to 0
D) To disable user authentication

### 9. Which restart policy should you use if you want a container to restart only when it exits with a non-zero status?

A) Always
B) Never
C) OnFailure
D) OnError

### 10. How can you expose environment variables from a ConfigMap to all containers in a Pod?

A) Using `env` with `valueFrom`
B) Using `envFrom` with `configMapRef`
C) Using `volumes` and `volumeMounts`
D) Using `configMapKeyRef` in metadata

---

## Answers

1. **A** - A Pod requires apiVersion, kind, metadata (with name), and spec (with containers array containing at least one container with name and image).

2. **C** - The sidecar pattern runs a helper container alongside the main application container to extend or enhance its functionality (e.g., log processing, monitoring).

3. **B** - Init containers run sequentially to completion before the main application containers start. They are useful for setup tasks like database migrations or configuration.

4. **C** - When a container exceeds its memory limit, it is terminated (OOMKilled). The kubelet may restart it depending on the restart policy.

5. **B** - Readiness probes determine if a Pod should receive traffic. If a readiness probe fails, the Pod is removed from service endpoints but not restarted.

6. **C** - The Guaranteed QoS class is assigned when every container has memory and CPU requests equal to their limits.

7. **B** - The `command` field in a Pod spec overrides the Dockerfile's ENTRYPOINT. The `args` field overrides CMD.

8. **B** - The `runAsNonRoot: true` setting ensures the container cannot run as the root user (UID 0), enhancing security by enforcing non-privileged execution.

9. **C** - OnFailure restart policy restarts the container only if it exits with a non-zero (error) status code.

10. **B** - Using `envFrom` with `configMapRef` exposes all key-value pairs from a ConfigMap as environment variables in the container.

---

## Study Resources

- [Lab README](README.md) - Core Pod concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Pod topics
- [Official Pod Documentation](https://kubernetes.io/docs/concepts/workloads/pods/)
