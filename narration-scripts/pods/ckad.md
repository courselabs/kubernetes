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

Let me break this down:

First, we define a volume called "html" using emptyDir. This creates an empty directory that exists as long as the Pod exists.

The nginx container mounts this volume at /usr/share/nginx/html - where nginx serves files from.

The content-generator container mounts the same volume at /html and runs a loop that writes the current date to index.html every 10 seconds.

Both containers share the same volume, so the sidecar's output becomes nginx's content.

Let's verify both containers are running.

See the READY column shows "2/2" - both containers are running.

Let's test it by executing curl in the nginx container.

Perfect! We get the current date. Wait 10 seconds and run it again - the date updates. The sidecar is continuously updating content that nginx serves.

This pattern is incredibly useful for:
- Log shipping sidecars that collect and forward logs
- Configuration reloaders that watch for config changes
- Monitoring agents that collect metrics

For the exam, remember that containers in a Pod communicate over localhost and can share volumes.

## Resource Requests and Limits

Resource management is critical for the CKAD exam. You need to understand requests, limits, and Quality of Service classes.

Let me create a Pod with resource constraints.

The requests specify the minimum guaranteed resources:
- 64 MiB of memory
- 250 millicores of CPU (that's 0.25 cores or 25% of one CPU)

The limits specify the maximum:
- 128 MiB of memory
- 500 millicores (0.5 cores or 50% of one CPU)

Now let's check the Quality of Service class.

The QoS Class is "Burstable" because we have requests that are less than limits. This means:
- The Pod is guaranteed the requested resources
- It can burst up to the limits if resources are available
- During resource pressure, BestEffort Pods are evicted first, then Burstable, then Guaranteed

For a Guaranteed QoS class, requests must equal limits for all containers and all resources.

Let me show you what happens when a container exceeds its memory limit. I'll create a Pod that tries to allocate more memory than allowed.

This Pod tries to allocate 150MB when the limit is 100MB.

Let's watch what happens.

After a few seconds, you'll see the STATUS change to "OOMKilled" - Out Of Memory Killed. The container exceeded its memory limit and was terminated.

In the Events, you'll see "Container was OOMKilled" - this is exactly what happens when you misconfigure memory limits. This is a common exam scenario where you need to troubleshoot failing Pods.

## Liveness and Readiness Probes

Health probes are essential for production workloads and frequent exam topics. Let's implement both liveness and readiness probes.

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

Let's check the probe status.

Look for the Liveness and Readiness sections. You'll see the probe configurations and their current status.

Now let me show you different probe types. Probes can use:
- HTTP GET (like we just did)
- TCP Socket (check if a port is open)
- Exec (run a command in the container)

Here's an exec probe example:

This runs  inside the container. If the command returns 0 (success), the probe passes.

And here's a TCP socket probe:

This checks if port 8080 is accepting connections.

For the exam, you should be comfortable creating all three types of probes quickly.

## Security Contexts

Security contexts define privilege and access control settings. This is increasingly important for the CKAD exam.

Let's create a Pod that runs as a non-root user with security constraints.

This configuration:
- Runs the container as user ID 1000, group 3000
- Sets file system group to 2000 for volume ownership
- Prevents privilege escalation
- Drops all Linux capabilities

Let's verify the security settings.

See? The process is running as uid 1000 and gid 3000, exactly as specified.

For a more secure configuration, we can add a read-only root filesystem:

The readOnlyRootFilesystem: true makes the container's root filesystem read-only, preventing any modifications. Your application can still write to mounted volumes.

The runAsNonRoot: true ensures Kubernetes rejects the Pod if the image tries to run as root.

## Environment Variables and ConfigMaps

The exam often requires you to configure Pods with environment variables from various sources.

Let's create a ConfigMap first.

Now a Pod that uses it:

This shows three ways to set environment variables:
1. Static values with name and value
2. Single values from ConfigMap using valueFrom
3. All keys from ConfigMap using envFrom

Let's check the environment variables.

You'll see STATIC_VAR, APP_ENV, and LOG_LEVEL all populated. The envFrom loaded both APP_ENV and LOG_LEVEL from the ConfigMap.

The same patterns work with Secrets - just replace configMapKeyRef with secretKeyRef.

## Init Containers

Init containers run before your application containers and are commonly tested in the exam.

This init container waits for a service called "myservice" to be resolvable before the main container starts.

Let's watch the status.

The Pod will be stuck in "Init:0/1" status because the service doesn't exist. Let's check the details.

In the Events, you'll see the init container is running and waiting. The main nginx container won't start until the init container completes successfully.

This pattern is useful for:
- Waiting for dependencies to be ready
- Downloading configuration or data before app starts
- Running database migrations
- Setting up the environment

Init containers run sequentially in the order defined, and each must complete successfully before the next starts.

Let me create the service to unblock it.

Now watch the Pod again.

The init container completed, and the app container is now running!

## Pod Scheduling with Node Selectors

For the exam, you need to understand basic Pod scheduling. Let's start with node selectors.

First, let's label a node.

Now create a Pod that requires that label:

The Pod will only schedule on nodes with the disktype=ssd label.

You can see which node it scheduled on - it should be the one we labeled.

## Quick Command Reference for CKAD

Let me show you some imperative commands that can save time in the exam.

Generate a Pod YAML without creating it:

This creates the YAML file you can then edit.

Create a Pod with environment variables:

Execute a command and get just the output:

The --rm flag deletes the Pod after it exits, and --restart=Never creates a simple Pod instead of a Deployment.

Get Pod YAML from a running Pod:

These imperative commands are huge time-savers in the exam when you need to quickly generate templates.

## Cleanup

Let's clean up all the resources we created.

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
