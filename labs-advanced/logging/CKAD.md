# CKAD Exam Preparation: Application Logging

This document covers logging topics required for the Certified Kubernetes Application Developer (CKAD) exam. The [basic logging lab](README.md) covers centralized logging with EFK - this document focuses on kubectl logging commands and patterns you need for the exam.

## Prerequisites

Before starting this lab, you should be familiar with:
- Basic Pod and Deployment concepts
- Container stdout and stderr
- Multi-container Pods
- Volume concepts

## CKAD Logging Topics Covered

- kubectl logs command and all options
- Viewing logs from single and multi-container Pods
- Streaming and filtering logs
- Previous container logs
- Viewing logs from multiple Pods
- Multi-container logging patterns
- Sidecar container for logging
- Shared volumes for log files
- Log debugging strategies
- Common logging issues and solutions

## kubectl logs Basics

### Single Container Pods

View logs from a single container Pod:

```bash
# View logs from a Pod
kubectl logs <pod-name>

# View logs from a Deployment (targets first pod)
kubectl logs deployment/<deployment-name>

# View logs from a Service (targets first pod behind service)
kubectl logs service/<service-name>

# View logs using label selector
kubectl logs -l app=myapp

# View logs with timestamps
kubectl logs <pod-name> --timestamps

# View logs with human-readable timestamps
kubectl logs <pod-name> --timestamps=true
```

📋 **CKAD Essential**: Know how to quickly view logs by Pod name, Deployment name, and label selector.

### Filtering Log Output

Control how many log lines you see:

```bash
# Show last 20 lines
kubectl logs <pod-name> --tail=20

# Show logs from last hour
kubectl logs <pod-name> --since=1h

# Show logs from last 5 minutes
kubectl logs <pod-name> --since=5m

# Show logs since specific time
kubectl logs <pod-name> --since-time=2024-01-01T10:00:00Z

# Combine filters
kubectl logs <pod-name> --tail=50 --since=1h --timestamps
```

📋 **CKAD Exam Tip**: Use `--tail` to limit output when logs are very long.

### Streaming Logs

Follow logs in real-time:

```bash
# Stream logs (like tail -f)
kubectl logs <pod-name> --follow
kubectl logs <pod-name> -f  # Short form

# Stream with tail
kubectl logs <pod-name> -f --tail=10

# Stream from deployment
kubectl logs deployment/<deployment-name> -f
```

⚠️ **Exam Note**: Use Ctrl+C to stop streaming logs.

### Previous Container Logs

View logs from crashed or restarted containers:

```bash
# View logs from previous container instance
kubectl logs <pod-name> --previous
kubectl logs <pod-name> -p  # Short form

# Useful when container is in CrashLoopBackOff
kubectl logs <pod-name> -p

# Check current container status
kubectl get pod <pod-name>
```

📋 **CKAD Critical**: If a Pod keeps restarting, use `--previous` to see why it crashed.

**TODO**: Create example with crashing container: `specs/ckad/crash-loop-example.yaml`

## Multi-Container Pod Logging

### Specifying Container Name

When a Pod has multiple containers, specify which one:

```bash
# List containers in a Pod
kubectl get pod <pod-name> -o jsonpath='{.spec.containers[*].name}'

# View logs from specific container
kubectl logs <pod-name> -c <container-name>
kubectl logs <pod-name> --container=<container-name>

# Stream logs from specific container
kubectl logs <pod-name> -c <container-name> -f

# Previous logs from specific container
kubectl logs <pod-name> -c <container-name> --previous
```

📋 **CKAD Pattern**: Always specify container name in multi-container Pods.

### Viewing All Container Logs

View logs from all containers in a Pod:

```bash
# All containers (Kubernetes 1.19+)
kubectl logs <pod-name> --all-containers=true

# All containers with prefix showing container name
kubectl logs <pod-name> --all-containers --prefix=true

# Stream all containers
kubectl logs <pod-name> --all-containers -f
```

**TODO**: Create multi-container example: `specs/ckad/multi-container-logs.yaml`

### Init Container Logs

View logs from init containers:

```bash
# List init containers
kubectl get pod <pod-name> -o jsonpath='{.spec.initContainers[*].name}'

# View init container logs
kubectl logs <pod-name> -c <init-container-name>

# Check init container status
kubectl describe pod <pod-name> | grep -A 5 "Init Containers:"
```

📋 **CKAD Debugging**: If Pod is stuck in Init phase, check init container logs.

**TODO**: Create init container logging example: `specs/ckad/init-container-logs.yaml`

## Logging from Multiple Pods

### Using Label Selectors

View logs from multiple Pods matching labels:

```bash
# View logs from all pods with label (shows most recent)
kubectl logs -l app=myapp

# View with timestamps to identify pod
kubectl logs -l app=myapp --timestamps --prefix

# Stream from all matching pods
kubectl logs -l app=myapp -f

# Specify container in multi-container setup
kubectl logs -l app=myapp -c web -f

# Limit output per pod
kubectl logs -l app=myapp --tail=10
```

⚠️ **Limitation**: `kubectl logs -l` shows logs from all matching Pods but can be overwhelming. Consider using `--tail` and `--since`.

### Viewing Logs from Specific Pods

```bash
# Get pod names with label
kubectl get pods -l app=myapp -o name

# Loop through pods (shell script)
for pod in $(kubectl get pods -l app=myapp -o name); do
  echo "=== $pod ==="
  kubectl logs $pod --tail=20
done

# View logs from specific replica
kubectl logs deployment/myapp --tail=20
```

📋 **CKAD Exam**: Practice quickly getting logs from Deployments with multiple replicas.

## Multi-Container Logging Patterns

### Pattern 1: Sidecar for Log Streaming

Stream log files to stdout using a sidecar container:

**TODO**: Create example `specs/ckad/sidecar-logging.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-logging
spec:
  volumes:
  - name: shared-logs
    emptyDir: {}

  containers:
  # Application container writing to file
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/app
    # App writes logs to /var/log/app/app.log

  # Sidecar container streaming logs to stdout
  - name: log-streamer
    image: busybox:1.35
    args:
    - /bin/sh
    - -c
    - tail -n+1 -f /var/log/app/app.log
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/app
      readOnly: true
```

View logs from the sidecar:
```bash
kubectl logs app-with-logging -c log-streamer
```

📋 **CKAD Use Case**: Apps that log to files need a sidecar to stream logs to stdout.

### Pattern 2: Multiple Log Streams

Stream different log files using multiple sidecars:

**TODO**: Create example `specs/ckad/multi-log-streams.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-multi-logs
spec:
  volumes:
  - name: shared-logs
    emptyDir: {}

  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log
    # App writes to /var/log/access.log and /var/log/error.log

  # Sidecar for access logs
  - name: access-log
    image: busybox:1.35
    args: [/bin/sh, -c, 'tail -n+1 -f /var/log/access.log']
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log
      readOnly: true

  # Sidecar for error logs
  - name: error-log
    image: busybox:1.35
    args: [/bin/sh, -c, 'tail -n+1 -f /var/log/error.log']
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log
      readOnly: true
```

View different log streams:
```bash
# View access logs
kubectl logs app-multi-logs -c access-log

# View error logs
kubectl logs app-multi-logs -c error-log

# View all logs
kubectl logs app-multi-logs --all-containers --prefix
```

### Pattern 3: Log Rotation with Sidecar

Handle log rotation in the sidecar:

**TODO**: Create example `specs/ckad/log-rotation.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-rotation
spec:
  volumes:
  - name: shared-logs
    emptyDir: {}

  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log

  - name: log-rotator
    image: busybox:1.35
    args:
    - /bin/sh
    - -c
    - |
      while true; do
        tail -n+1 -f /var/log/app.log 2>/dev/null || true
        sleep 1
      done
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log
      readOnly: true
```

📋 **CKAD Pattern**: Log rotation scenarios might appear in exam - sidecar continues after rotation.

## Logging Best Practices

### Application Logging to stdout/stderr

**Best Practice**: Applications should log to stdout (standard output) and stderr (standard error):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: good-logging-example
spec:
  containers:
  - name: app
    image: nginx:1.21
    # Nginx logs to stdout/stderr by default
    # Access logs: stdout
    # Error logs: stderr
```

Why stdout/stderr:
- ✅ No disk management needed
- ✅ Kubernetes automatically collects logs
- ✅ `kubectl logs` works out of the box
- ✅ Log aggregation systems can collect logs
- ✅ No volume mounting needed

### Structured Logging

Use JSON format for easier parsing:

**TODO**: Create example `specs/ckad/structured-logging.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: structured-logs
spec:
  containers:
  - name: app
    image: myapp:1.0
    env:
    - name: LOG_FORMAT
      value: json
    # Application outputs:
    # {"timestamp":"2024-01-01T10:00:00Z","level":"INFO","message":"Request processed"}
```

Benefits:
- Easier to parse and filter
- Better for log aggregation
- Structured data extraction
- Searchable in log systems

### Log Levels

Configure appropriate log levels:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: log-levels
spec:
  containers:
  - name: app
    image: myapp:1.0
    env:
    - name: LOG_LEVEL
      value: INFO  # DEBUG, INFO, WARN, ERROR
```

📋 **CKAD Tip**: DEBUG logs useful for troubleshooting, INFO for production.

## Log Debugging Strategies

### Strategy 1: Check Pod Status First

Before checking logs, verify Pod status:

```bash
# Check pod status
kubectl get pods

# Common statuses requiring log checks:
# - CrashLoopBackOff: Container keeps failing
# - Error: Container exited with error
# - Running: Check logs for application errors
# - Pending: Might not have logs yet

# Describe pod for events
kubectl describe pod <pod-name>
```

### Strategy 2: Check Previous Logs for Crashes

For crashing containers:

```bash
# 1. Check current status
kubectl get pod <pod-name>

# 2. Check events
kubectl describe pod <pod-name> | grep -A 10 Events

# 3. Check previous container logs
kubectl logs <pod-name> --previous

# 4. Check for error patterns
kubectl logs <pod-name> -p | grep -i error
```

**TODO**: Create crashing app example: `specs/ckad/troubleshooting/crash-loop.yaml`

### Strategy 3: Multi-Container Debugging

For Pods with multiple containers:

```bash
# 1. List all containers
kubectl get pod <pod-name> -o jsonpath='{.spec.containers[*].name}'

# 2. Check status of each container
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[*].name}'

# 3. Check logs from each container
kubectl logs <pod-name> -c container1
kubectl logs <pod-name> -c container2

# 4. Check if any container is restarting
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[*].restartCount}'
```

### Strategy 4: Time-Based Debugging

Focus on specific time periods:

```bash
# Logs from last failure
kubectl logs <pod-name> --since=10m --previous

# Current logs since restart
kubectl logs <pod-name> --since=5m

# Compare before and after
kubectl logs <pod-name> --since=1h --until=30m
```

### Strategy 5: Pattern Matching

Search logs for specific patterns:

```bash
# Find errors
kubectl logs <pod-name> | grep -i error

# Find warnings
kubectl logs <pod-name> | grep -i warn

# Find specific message
kubectl logs <pod-name> | grep "connection failed"

# Count occurrences
kubectl logs <pod-name> | grep -c "error"

# Context around match
kubectl logs <pod-name> | grep -A 5 -B 5 "error"
```

## Common Logging Issues

### Issue 1: No Logs Available

**Symptoms**: `kubectl logs` returns nothing

**Causes & Solutions**:

```bash
# 1. Container not started yet
kubectl get pod <pod-name>  # Check status
kubectl describe pod <pod-name>  # Check events

# 2. Application not logging to stdout
# Add sidecar or modify app to log to stdout

# 3. Container already crashed
kubectl logs <pod-name> --previous

# 4. Wrong container in multi-container pod
kubectl get pod <pod-name> -o jsonpath='{.spec.containers[*].name}'
kubectl logs <pod-name> -c <correct-container>
```

**TODO**: Create example: `specs/ckad/troubleshooting/no-logs.yaml`

### Issue 2: Logs Truncated

**Symptoms**: Old logs disappear

**Cause**: Kubernetes rotates logs automatically

**Solutions**:

```bash
# View more history
kubectl logs <pod-name> --tail=1000

# Use centralized logging (EFK, Loki)
# See main logging lab

# Increase log retention (cluster setting)
# Not controllable per-pod
```

### Issue 3: Logs from Wrong Pod

**Symptoms**: Seeing unexpected logs

**Solutions**:

```bash
# Verify pod name
kubectl get pods -l app=myapp

# Check which pod you're viewing
kubectl get pod <pod-name> -o wide

# View logs with prefix to confirm source
kubectl logs <pod-name> --prefix

# In multi-replica deployments
kubectl logs deployment/myapp  # Only shows one pod
kubectl logs -l app=myapp --prefix  # Shows all pods
```

### Issue 4: Multi-Container Confusion

**Symptoms**: Error "a container name must be specified"

**Solution**:

```bash
# List containers in pod
kubectl get pod <pod-name> -o jsonpath='{.spec.containers[*].name}'

# Specify container
kubectl logs <pod-name> -c <container-name>

# Or view all
kubectl logs <pod-name> --all-containers
```

### Issue 5: Init Container Failures

**Symptoms**: Pod stuck in Init phase

**Solutions**:

```bash
# List init containers
kubectl describe pod <pod-name> | grep -A 10 "Init Containers"

# View init container logs
kubectl logs <pod-name> -c <init-container-name>

# Check init container status
kubectl get pod <pod-name> -o jsonpath='{.status.initContainerStatuses}'
```

**TODO**: Create example: `specs/ckad/troubleshooting/init-failure.yaml`

## CKAD Lab Exercises

### Exercise 1: Basic Log Viewing

Create a deployment and practice basic log commands:
1. Create deployment with 3 replicas
2. View logs from specific pod
3. View logs from deployment
4. View logs with timestamps
5. View last 20 lines only
6. Stream logs in real-time

**TODO**: Create exercise in `specs/ckad/exercises/ex1-basic-logs/`

### Exercise 2: Multi-Container Logging

Create a Pod with multiple containers:
1. Main application container
2. Sidecar container for logging
3. Practice viewing logs from each container
4. View all container logs together
5. Stream specific container logs

**TODO**: Create exercise in `specs/ckad/exercises/ex2-multi-container/`

### Exercise 3: Troubleshoot Crashing Container

Given a Pod that keeps crashing:
1. Identify the container that's failing
2. View current logs (if available)
3. View previous container logs
4. Identify the error causing crash
5. Fix the issue

**TODO**: Create exercise in `specs/ckad/exercises/ex3-crash-debug/`

### Exercise 4: Sidecar for File Logs

Modify a Pod that logs to files:
1. Application writes logs to /var/log/app.log
2. Add sidecar container to stream logs to stdout
3. Use shared volume between containers
4. Verify logs visible via kubectl logs

**TODO**: Create exercise in `specs/ckad/exercises/ex4-sidecar-logs/`

### Exercise 5: Multi-Pod Log Aggregation

Work with a deployment having multiple replicas:
1. Create deployment with 5 replicas
2. View logs from all pods using label selector
3. Filter logs by time (last 10 minutes)
4. Stream logs from all pods
5. Find specific error across all pods

**TODO**: Create exercise in `specs/ckad/exercises/ex5-multi-pod-logs/`

## Common CKAD Exam Scenarios

### Scenario 1: View Recent Logs

"Show the last 50 log lines from the deployment 'webapp'"

```bash
kubectl logs deployment/webapp --tail=50
```

### Scenario 2: Stream Logs from Service

"Stream logs from the service 'api' and watch for errors"

```bash
kubectl logs service/api -f | grep -i error
```

### Scenario 3: Debug Crashed Container

"A pod 'backend' is in CrashLoopBackOff. Find out why it's crashing"

```bash
# Check previous container logs
kubectl logs backend --previous

# or
kubectl logs backend -p
```

### Scenario 4: Multi-Container Logs

"View logs from the 'app' container in the pod 'frontend'"

```bash
kubectl logs frontend -c app
```

### Scenario 5: Logs from Init Container

"Check logs from init container 'setup' in pod 'myapp'"

```bash
kubectl logs myapp -c setup
```

### Scenario 6: Add Logging Sidecar

"The pod 'legacy-app' logs to /var/log/app.log. Add a sidecar to stream these logs to stdout"

```yaml
# Edit the pod spec to add:
volumes:
- name: logs
  emptyDir: {}

# In existing container, add:
volumeMounts:
- name: logs
  mountPath: /var/log

# Add new sidecar container:
- name: log-streamer
  image: busybox:1.35
  args: [/bin/sh, -c, 'tail -n+1 -f /var/log/app.log']
  volumeMounts:
  - name: logs
    mountPath: /var/log
    readOnly: true
```

### Scenario 7: Find Errors Across Pods

"Find all error messages in pods with label app=frontend from the last hour"

```bash
kubectl logs -l app=frontend --since=1h | grep -i error
```

### Scenario 8: Compare Logs Before/After

"View logs from 'api' pod from 10-5 minutes ago to identify when issue started"

```bash
kubectl logs api --since=10m | head -n 50
```

## Quick Command Reference for CKAD

### Basic Commands

```bash
# View logs
kubectl logs <pod-name>
kubectl logs deployment/<name>
kubectl logs service/<name>
kubectl logs -l <label-selector>

# View logs from specific container
kubectl logs <pod-name> -c <container-name>

# View all containers
kubectl logs <pod-name> --all-containers

# View previous container
kubectl logs <pod-name> --previous
kubectl logs <pod-name> -p
```

### Filtering Options

```bash
# Limit output
kubectl logs <pod-name> --tail=<number>

# Since time
kubectl logs <pod-name> --since=<duration>
# Examples: --since=1h, --since=30m, --since=5s

# With timestamps
kubectl logs <pod-name> --timestamps

# With prefix (pod/container name)
kubectl logs <pod-name> --prefix
```

### Streaming Options

```bash
# Follow logs (stream)
kubectl logs <pod-name> --follow
kubectl logs <pod-name> -f

# Follow with tail
kubectl logs <pod-name> -f --tail=20

# Follow from all matching pods
kubectl logs -l app=myapp -f
```

### Combined Options

```bash
# Most useful combinations
kubectl logs <pod-name> -f --tail=50
kubectl logs <pod-name> --previous --tail=100
kubectl logs <pod-name> -c <container> -f --since=10m
kubectl logs -l app=myapp --all-containers --prefix --tail=20
```

### Debugging Patterns

```bash
# Check for crashes
kubectl logs <pod-name> -p | grep -i error

# Find specific message
kubectl logs <pod-name> | grep "pattern"

# Count error occurrences
kubectl logs <pod-name> | grep -c "error"

# Save logs to file
kubectl logs <pod-name> > pod-logs.txt

# Compare multiple pods
kubectl logs -l app=myapp --prefix | grep "error"
```

## Exam Tips and Tricks

### Speed Tips

1. **Use shortcuts**:
   - `-f` instead of `--follow`
   - `-p` instead of `--previous`
   - `-c` instead of `--container`

2. **Label selectors**: Learn to use `-l` for multiple pods quickly

3. **Pipe to grep**: Combine with grep to find issues faster
   ```bash
   kubectl logs pod-name | grep -i error
   ```

4. **Use --tail**: Limit output when debugging
   ```bash
   kubectl logs pod-name --tail=20
   ```

5. **Tab completion**: Enable kubectl autocomplete
   ```bash
   source <(kubectl completion bash)
   ```

### Common Mistakes to Avoid

1. ❌ Forgetting `-c` with multi-container pods
   ```bash
   # Wrong (will error)
   kubectl logs multi-container-pod

   # Correct
   kubectl logs multi-container-pod -c container-name
   ```

2. ❌ Not checking previous logs for crashes
   ```bash
   # Pod is crashing, current logs may be empty
   kubectl logs crashing-pod  # Might be empty

   # Correct - check previous
   kubectl logs crashing-pod -p
   ```

3. ❌ Viewing logs before pod is ready
   ```bash
   # Check status first
   kubectl get pod pod-name

   # Wait if needed
   kubectl wait --for=condition=Ready pod/pod-name
   ```

4. ❌ Not using label selectors for deployments
   ```bash
   # Viewing one pod at a time is slow
   kubectl logs pod-1
   kubectl logs pod-2

   # Better - use label selector
   kubectl logs -l app=myapp --prefix
   ```

5. ❌ Forgetting container name in multi-container scenarios
   ```bash
   # Will error if multiple containers
   kubectl logs pod-name

   # List containers first
   kubectl get pod pod-name -o jsonpath='{.spec.containers[*].name}'

   # Then specify
   kubectl logs pod-name -c container-name
   ```

### Time-Saving Patterns

```bash
# Quick error check
kubectl logs <pod> --tail=50 | grep -i error

# Stream and filter
kubectl logs <pod> -f | grep "pattern"

# All containers with errors
kubectl logs <pod> --all-containers | grep -i error

# Check if any restarts
kubectl get pod <pod> -o jsonpath='{.status.containerStatuses[*].restartCount}'

# Logs from last restart
kubectl logs <pod> --since=<restart-time>
```

### Useful kubectl explain

```bash
# Learn about Pod logging
kubectl explain pod.spec.containers.stdout

# Learn about container status
kubectl explain pod.status.containerStatuses
```

## Logging Checklist for CKAD

- [ ] View logs from single container Pod
- [ ] View logs from Deployment
- [ ] Use label selectors to view logs
- [ ] Filter logs with --tail, --since
- [ ] Stream logs with --follow
- [ ] View previous container logs (--previous)
- [ ] Specify container in multi-container Pod
- [ ] View all containers with --all-containers
- [ ] Check init container logs
- [ ] Add timestamps to logs
- [ ] Use prefix to identify log source
- [ ] Create sidecar container for file-based logging
- [ ] Share volume between containers for logs
- [ ] Debug CrashLoopBackOff with logs
- [ ] Find errors across multiple pods
- [ ] Combine kubectl logs with grep

## Additional Resources

- [Kubernetes Logging Architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/)
- [kubectl logs Documentation](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#logs)
- [Debug Running Pods](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/)
- [Multi-Container Patterns](https://kubernetes.io/blog/2015/06/the-distributed-system-toolkit-patterns/)

## Cleanup

```bash
kubectl delete all -l kubernetes.courselabs.co=logging-ckad
```

---

> Return to [EFK centralized logging lab](README.md) | Check [solution examples](solution-ckad.md)
