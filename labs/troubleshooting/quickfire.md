# Troubleshooting - Quickfire Questions

Test your knowledge of troubleshooting Kubernetes applications with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. Which command shows recent events for a Pod?

A) kubectl logs pod-name
B) kubectl describe pod pod-name
C) kubectl events pod-name
D) kubectl get events pod-name

### 2. How do you view logs from a crashed/terminated container?

A) kubectl logs pod-name --crashed
B) kubectl logs pod-name --previous
C) kubectl logs pod-name --failed
D) Logs are not available from terminated containers

### 3. What does the ImagePullBackOff status indicate?

A) The container is out of memory
B) Kubernetes cannot pull the container image
C) The Pod is being evicted
D) The network is down

### 4. How do you execute a command inside a running container?

A) kubectl run pod-name -- command
B) kubectl exec pod-name -- command
C) kubectl execute pod-name command
D) kubectl ssh pod-name command

### 5. What does the CrashLoopBackOff status mean?

A) The cluster is overloaded
B) The container keeps crashing and Kubernetes is backing off between restart attempts
C) The image cannot be found
D) The node is failing

### 6. Which command shows resource usage (CPU/memory) for Pods?

A) kubectl get pods --show-usage
B) kubectl top pods
C) kubectl describe pods
D) kubectl stats pods

### 7. How do you view logs from a specific container in a multi-container Pod?

A) kubectl logs pod-name
B) kubectl logs pod-name -c container-name
C) kubectl logs pod-name/container-name
D) kubectl logs container-name

### 8. What is the first thing to check when a Pod is stuck in Pending state?

A) Pod logs
B) Network connectivity
C) Events and node resources (kubectl describe pod)
D) Container image

### 9. How do you debug a Pod that fails to start by creating a temporary debugging container?

A) kubectl debug pod-name
B) kubectl exec --debug pod-name
C) kubectl run --debug
D) kubectl attach pod-name

### 10. What does the ErrImagePull error indicate?

A) The container ran out of disk space
B) There was an error pulling the container image (wrong name, tag, or registry auth)
C) The Pod's memory limit was exceeded
D) The cluster's image quota was exceeded

---

## Answers

1. **B** - `kubectl describe pod pod-name` shows detailed information including recent events at the bottom. `kubectl get events` also works but needs filtering.

2. **B** - `kubectl logs pod-name --previous` shows logs from the previous (terminated) container instance, useful for debugging crashes.

3. **B** - ImagePullBackOff means Kubernetes attempted to pull the container image but failed, and is backing off between retry attempts. Check image name, tag, and registry credentials.

4. **B** - `kubectl exec pod-name -- command` executes a command in a container. Use `-it` for interactive shell: `kubectl exec -it pod-name -- bash`.

5. **B** - CrashLoopBackOff indicates the container keeps crashing (exiting with error). Kubernetes restarts it with exponentially increasing delays. Check logs with `kubectl logs`.

6. **B** - `kubectl top pods` shows current CPU and memory usage. Requires the metrics-server to be installed in the cluster.

7. **B** - Use `-c container-name` to specify which container's logs to view: `kubectl logs pod-name -c container-name`.

8. **C** - Check events with `kubectl describe pod pod-name` to see why the Pod is Pending. Common causes: insufficient resources, image pull issues, or PVC binding problems.

9. **A** - `kubectl debug pod-name` (Kubernetes 1.18+) creates an ephemeral debug container. You can also use `kubectl debug node/node-name` for node-level debugging.

10. **B** - ErrImagePull indicates an error pulling the container image. Common causes: wrong image name/tag, missing registry credentials, or network issues.

---

## Study Resources

- [Lab README](README.md) - Core troubleshooting concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific troubleshooting topics
- [Official Troubleshooting Documentation](https://kubernetes.io/docs/tasks/debug/)
