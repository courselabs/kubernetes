# Pods - CKAD Exam Preparation Script

**Duration:** 25-30 minutes
**Format:** Screen recording with live demonstration
**Focus:** CKAD exam scenarios and requirements

---

## Opening

Welcome to the CKAD-focused session on Pods. In this video, we'll go beyond the basics and cover everything you need to know about Pods for the Certified Kubernetes Application Developer exam.

The CKAD exam tests your ability to work quickly and accurately with Kubernetes resources. For Pods specifically, you need to master multi-container patterns, resource management, health probes, security contexts, and scheduling.

Let's dive into each of these areas with practical examples.

## Multi-Container Pods - Sidecar Pattern

One of the most common exam scenarios involves multi-container Pods. Let's start with the sidecar pattern, where a helper container runs alongside your main application.

I'll create a Pod with two containers sharing a volume. The main container is an nginx web server, and the sidecar generates content that nginx serves.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-with-sidecar
spec:
  volumes:
  - name: html
    emptyDir: {}
  containers:
  - name: nginx
    image: nginx
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html
  - name: content-generator
    image: debian
    volumeMounts:
    - name: html
      mountPath: /html
    command: ["/bin/sh", "-c"]
    args:
      - while true; do
          date > /html/index.html;
          sleep 10;
        done
```

Let me break this down:

First, we define a volume called "html" using emptyDir. This creates an empty directory that exists as long as the Pod exists.

The nginx container mounts this volume at /usr/share/nginx/html - where nginx serves files from.

The content-generator container mounts the same volume at /html and runs a loop that writes the current date to index.html every 10 seconds.

Both containers share the same volume, so the sidecar's output becomes nginx's content.

```powershell
kubectl apply -f multi-container-sidecar.yaml
```

Let's verify both containers are running.

```powershell
kubectl get pods web-with-sidecar
```

See the READY column shows "2/2" - both containers are running.

Let's test it by executing curl in the nginx container.

```powershell
kubectl exec web-with-sidecar -c nginx -- curl localhost
```

Perfect! We get the current date. Wait 10 seconds and run it again - the date updates. The sidecar is continuously updating content that nginx serves.

This pattern is incredibly useful for:
- Log shipping sidecars that collect and forward logs
- Configuration reloaders that watch for config changes
- Monitoring agents that collect metrics

For the exam, remember that containers in a Pod communicate over localhost and can share volumes.

## Resource Requests and Limits

Resource management is critical for the CKAD exam. You need to understand requests, limits, and Quality of Service classes.

Let me create a Pod with resource constraints.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

The requests specify the minimum guaranteed resources:
- 64 MiB of memory
- 250 millicores of CPU (that's 0.25 cores or 25% of one CPU)

The limits specify the maximum:
- 128 MiB of memory
- 500 millicores (0.5 cores or 50% of one CPU)

```powershell
kubectl apply -f resource-demo.yaml
```

Now let's check the Quality of Service class.

```powershell
kubectl describe pod resource-demo | grep -A 5 "QoS Class"
```

The QoS Class is "Burstable" because we have requests that are less than limits. This means:
- The Pod is guaranteed the requested resources
- It can burst up to the limits if resources are available
- During resource pressure, BestEffort Pods are evicted first, then Burstable, then Guaranteed

For a Guaranteed QoS class, requests must equal limits for all containers and all resources.

Let me show you what happens when a container exceeds its memory limit. I'll create a Pod that tries to allocate more memory than allowed.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: memory-limit-test
spec:
  containers:
  - name: app
    image: polinux/stress
    resources:
      requests:
        memory: "50Mi"
      limits:
        memory: "100Mi"
    command: ["stress"]
    args: ["--vm", "1", "--vm-bytes", "150M", "--vm-hang", "1"]
```

This Pod tries to allocate 150MB when the limit is 100MB.

```powershell
kubectl apply -f memory-limit-test.yaml
```

Let's watch what happens.

```powershell
kubectl get pods memory-limit-test --watch
```

After a few seconds, you'll see the STATUS change to "OOMKilled" - Out Of Memory Killed. The container exceeded its memory limit and was terminated.

```powershell
kubectl describe pod memory-limit-test
```

In the Events, you'll see "Container was OOMKilled" - this is exactly what happens when you misconfigure memory limits. This is a common exam scenario where you need to troubleshoot failing Pods.

## Liveness and Readiness Probes

Health probes are essential for production workloads and frequent exam topics. Let's implement both liveness and readiness probes.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: probe-demo
spec:
  containers:
  - name: app
    image: nginx
    ports:
    - containerPort: 80
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 3
      periodSeconds: 3
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
```

The liveness probe:
- Makes an HTTP GET request to / on port 80
- Waits 3 seconds after container start before first check
- Checks every 3 seconds
- Restarts the container if the probe fails

The readiness probe:
- Also uses HTTP GET to /
- Waits 5 seconds before first check
- Checks every 5 seconds
- Removes Pod from Service endpoints if it fails (but doesn't restart)

```powershell
kubectl apply -f probe-demo.yaml
```

Let's check the probe status.

```powershell
kubectl describe pod probe-demo
```

Look for the Liveness and Readiness sections. You'll see the probe configurations and their current status.

Now let me show you different probe types. Probes can use:
- HTTP GET (like we just did)
- TCP Socket (check if a port is open)
- Exec (run a command in the container)

Here's an exec probe example:

```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5
```

This runs `cat /tmp/healthy` inside the container. If the command returns 0 (success), the probe passes.

And here's a TCP socket probe:

```yaml
livenessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 20
```

This checks if port 8080 is accepting connections.

For the exam, you should be comfortable creating all three types of probes quickly.

## Security Contexts

Security contexts define privilege and access control settings. This is increasingly important for the CKAD exam.

Let's create a Pod that runs as a non-root user with security constraints.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-demo
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "sleep 3600"]
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
```

This configuration:
- Runs the container as user ID 1000, group 3000
- Sets file system group to 2000 for volume ownership
- Prevents privilege escalation
- Drops all Linux capabilities

```powershell
kubectl apply -f security-demo.yaml
```

Let's verify the security settings.

```powershell
kubectl exec security-demo -- id
```

See? The process is running as uid 1000 and gid 3000, exactly as specified.

For a more secure configuration, we can add a read-only root filesystem:

```yaml
securityContext:
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1000
```

The readOnlyRootFilesystem: true makes the container's root filesystem read-only, preventing any modifications. Your application can still write to mounted volumes.

The runAsNonRoot: true ensures Kubernetes rejects the Pod if the image tries to run as root.

## Environment Variables and ConfigMaps

The exam often requires you to configure Pods with environment variables from various sources.

Let's create a ConfigMap first.

```powershell
kubectl create configmap app-config --from-literal=APP_ENV=production --from-literal=LOG_LEVEL=info
```

Now a Pod that uses it:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: env-demo
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "env | sort"]
    env:
    - name: STATIC_VAR
      value: "static-value"
    - name: APP_ENV
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: APP_ENV
    envFrom:
    - configMapRef:
        name: app-config
```

This shows three ways to set environment variables:
1. Static values with name and value
2. Single values from ConfigMap using valueFrom
3. All keys from ConfigMap using envFrom

```powershell
kubectl apply -f env-demo.yaml
```

Let's check the environment variables.

```powershell
kubectl logs env-demo
```

You'll see STATIC_VAR, APP_ENV, and LOG_LEVEL all populated. The envFrom loaded both APP_ENV and LOG_LEVEL from the ConfigMap.

The same patterns work with Secrets - just replace configMapKeyRef with secretKeyRef.

## Init Containers

Init containers run before your application containers and are commonly tested in the exam.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-demo
spec:
  initContainers:
  - name: wait-for-service
    image: busybox
    command: ['sh', '-c', 'until nslookup myservice; do echo waiting for myservice; sleep 2; done']
  containers:
  - name: app
    image: nginx
```

This init container waits for a service called "myservice" to be resolvable before the main container starts.

```powershell
kubectl apply -f init-demo.yaml
```

Let's watch the status.

```powershell
kubectl get pods init-demo --watch
```

The Pod will be stuck in "Init:0/1" status because the service doesn't exist. Let's check the details.

```powershell
kubectl describe pod init-demo
```

In the Events, you'll see the init container is running and waiting. The main nginx container won't start until the init container completes successfully.

This pattern is useful for:
- Waiting for dependencies to be ready
- Downloading configuration or data before app starts
- Running database migrations
- Setting up the environment

Init containers run sequentially in the order defined, and each must complete successfully before the next starts.

Let me create the service to unblock it.

```powershell
kubectl create service clusterip myservice --tcp=80:80
```

Now watch the Pod again.

```powershell
kubectl get pods init-demo
```

The init container completed, and the app container is now running!

## Pod Scheduling with Node Selectors

For the exam, you need to understand basic Pod scheduling. Let's start with node selectors.

First, let's label a node.

```powershell
kubectl get nodes
kubectl label nodes <node-name> disktype=ssd
```

Now create a Pod that requires that label:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: node-selector-demo
spec:
  nodeSelector:
    disktype: ssd
  containers:
  - name: app
    image: nginx
```

```powershell
kubectl apply -f node-selector-demo.yaml
```

The Pod will only schedule on nodes with the disktype=ssd label.

```powershell
kubectl get pod node-selector-demo -o wide
```

You can see which node it scheduled on - it should be the one we labeled.

## Quick Command Reference for CKAD

Let me show you some imperative commands that can save time in the exam.

Generate a Pod YAML without creating it:

```powershell
kubectl run test-pod --image=nginx --dry-run=client -o yaml > pod.yaml
```

This creates the YAML file you can then edit.

Create a Pod with environment variables:

```powershell
kubectl run env-pod --image=nginx --env="ENV=production" --env="DEBUG=false"
```

Execute a command and get just the output:

```powershell
kubectl run busybox --image=busybox --rm -it --restart=Never -- echo "Hello CKAD"
```

The --rm flag deletes the Pod after it exits, and --restart=Never creates a simple Pod instead of a Deployment.

Get Pod YAML from a running Pod:

```powershell
kubectl get pod env-pod -o yaml > existing-pod.yaml
```

These imperative commands are huge time-savers in the exam when you need to quickly generate templates.

## Cleanup

Let's clean up all the resources we created.

```powershell
kubectl delete pod --all
kubectl delete configmap app-config
kubectl delete service myservice
```

## CKAD Exam Tips for Pods

Let me share some specific exam tips:

**Time Management:**
- Use kubectl run to generate YAML quickly
- Practice typing common configurations from memory
- Know the structure of multi-container Pods cold

**Common Scenarios:**
- Adding a sidecar container to an existing Pod
- Configuring resource requests and limits
- Implementing health probes
- Running containers as non-root
- Using ConfigMaps and Secrets for configuration

**Troubleshooting:**
- Always check kubectl describe for Events
- Use kubectl logs to see container output
- Remember OOMKilled means memory limit exceeded
- CrashLoopBackOff means container keeps failing

**Must-Know kubectl Commands:**
- kubectl run - create Pods quickly
- kubectl get pods -o wide - see IP and node
- kubectl describe pod - detailed information
- kubectl logs - container output
- kubectl exec - run commands in containers
- kubectl delete pod - remove Pods

**YAML Essentials:**
- Multi-container syntax with containers array
- Resource requests and limits structure
- All three probe types (httpGet, tcpSocket, exec)
- Security context at both Pod and container level
- Init containers array
- Environment variables from ConfigMaps and Secrets

## Practice Exercise

Here's a practice exercise that combines multiple concepts:

Create a Pod named "exam-practice" that:
1. Runs two containers: nginx and a busybox sidecar
2. The nginx container has a liveness probe on port 80
3. Resource requests: 100m CPU, 128Mi memory
4. Resource limits: 200m CPU, 256Mi memory
5. Runs as non-root user (UID 1000)
6. Has environment variables from a ConfigMap named "app-config"
7. The sidecar container writes to a shared volume

Pause the video and try to create this from scratch. Then check your solution against the sample answer.

This type of multi-requirement question is common in the CKAD exam.

## Summary

In this video, we covered all the CKAD Pod requirements:

- Multi-container patterns with shared volumes
- Resource requests, limits, and QoS classes
- Liveness, readiness, and startup probes
- Security contexts for non-root execution
- Environment variables from ConfigMaps and Secrets
- Init containers for setup tasks
- Pod scheduling with node selectors
- Time-saving imperative commands

## Next Steps

You're now ready to tackle Pods in the CKAD exam. Practice these scenarios until you can create them quickly without references.

Next, we'll move on to higher-level controllers like Deployments, which build on everything you've learned about Pods.

Keep practicing, and good luck with your CKAD preparation!

---

## Recording Notes

**Screen Setup:**
- Terminal full screen for most demos
- Split screen when showing YAML and terminal output
- Use clear, readable terminal font (14-16pt)

**Key Demonstrations:**
1. Multi-container with shared volume (show both containers working)
2. OOMKilled scenario (let viewers see the failure)
3. Probes in action (show describe output)
4. Security context verification (show id command output)
5. Init container blocking (show waiting state then resolution)

**Exam Tips to Emphasize:**
- Speed is critical - practice imperative commands
- You can have kubectl.io docs open - know what to search for
- Read questions carefully - they often have multiple requirements
- Verify your work with kubectl get and describe

**Common Mistakes to Address:**
- Forgetting to indent containers as an array
- Mixing up requests and limits
- Wrong probe type for the scenario
- Not setting both runAsUser and runAsNonRoot

**Practice Suggestions:**
- Set a timer and create Pods under time pressure
- Practice all probe types multiple times
- Memorize the multi-container structure
- Know security context fields by heart

**Timing Breakdown:**
- Opening and overview: 2 min
- Multi-container sidecar: 4 min
- Resource management: 5 min
- Health probes: 5 min
- Security contexts: 4 min
- Environment variables: 3 min
- Init containers: 4 min
- Scheduling: 2 min
- Quick commands: 3 min
- Exam tips: 4 min
- Practice exercise: 2 min
- Summary: 2 min

**Total: ~40 minutes**
