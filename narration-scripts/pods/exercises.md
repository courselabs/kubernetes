# Pods - Exercises Narration Script

**Duration:** 15-20 minutes
**Format:** Screen recording with live demonstration
**Prerequisite:** Kubernetes cluster running (Docker Desktop, k3d, or similar)

---

## Opening

Welcome back! In the previous video, we covered the concepts behind Kubernetes Pods. Now it's time to get hands-on. In this demo, we'll create Pods, interact with them, and explore their capabilities.

Make sure you have a Kubernetes cluster running and kubectl configured. I'm using Docker Desktop, but any Kubernetes distribution will work fine.

Let's get started!

## Verify Cluster Access

First, let's make sure our cluster is ready.


Great! I can see my node is ready. Now let's check if there are any existing Pods.


As expected, there are no resources in the default namespace. We're starting with a clean slate.

## Create Your First Pod

Kubernetes uses declarative configuration with YAML files. Let's look at the simplest possible Pod specification.

I'll open the whoami-pod.yaml file in the labs/pods/specs directory.


This is as simple as it gets. We're specifying:
- API version v1 for Pods
- The kind is Pod
- The metadata includes just the name "whoami"
- The spec defines one container named "app" running the whoami image

The whoami application is a simple web service that returns information about itself. Perfect for demonstrations.

Let's deploy this Pod using kubectl apply.


The output says "pod/whoami created". Kubernetes has accepted our request and is now working to make it happen.

Let's check the status.


Excellent! The Pod is running. Notice the STATUS is "Running", READY shows "1/1" meaning one container out of one is ready, and RESTARTS is 0.

Now, one of the powerful features of Kubernetes is that it doesn't matter where the YAML comes from. Let me show you - we can actually apply the same configuration from a URL.


See? It says "pod/whoami unchanged". Kubernetes compared the desired state in the YAML with the current state and determined nothing needs to change. This is declarative configuration in action.

## Exploring Pod Information

Let's get more information about our Pod. The "get pods" command has several useful options.


The wide output shows additional columns. Now we can see:
- The IP address of the Pod - this is an internal cluster IP
- The node it's running on
- Nominated node and readiness gates (which we'll discuss later)

For even more detail, we use the describe command.


Look at all this information! The describe output shows:
- The full Pod specification
- The node it's scheduled on
- Container details including image, ports, and state
- Conditions showing the Pod's health status
- Events showing what Kubernetes did to create this Pod

The Events section at the bottom is particularly useful for troubleshooting. You can see Kubernetes scheduled the Pod, pulled the image, and started the container.

## Working with Pod Logs

In production clusters, Pods might be running on any node, but you don't need direct server access. Kubernetes provides everything through kubectl.

Let's view the container logs.


The whoami application logs its startup. You can see it's listening on port 80. The logs command works with any application - Kubernetes captures stdout and stderr from your containers.

## Executing Commands in Pods

You can also run commands inside Pod containers using kubectl exec.


The exec command connects to the Pod container and runs whatever command you specify after the double dashes. Here, we ran the date command to print the current date and time inside the container.

This is incredibly useful for troubleshooting. You can check configuration files, test network connectivity, or run diagnostic tools - all without SSH access to the node.

## Deploy a Second Pod

Let's deploy another Pod to explore multi-Pod networking.

I'll look at the sleep Pod specification.


This is very similar - just a different name and image. The sleep container runs an application that does nothing except sleep forever. It's useful for testing because it has common Linux tools installed.


Let's verify both Pods are running.


Perfect! Both whoami and sleep are running.

## Interactive Shell Sessions

Now for something really useful - we can start an interactive shell inside a container.


The -it flags mean interactive with a terminal. Now I'm inside the container!

Let's explore the container environment.


The hostname is the Pod name - "sleep". Every container thinks it's running on a computer with that name.


The environment variables show various Kubernetes information. Notice the KUBERNETES_SERVICE_HOST and KUBERNETES_SERVICE_PORT - these are automatically injected so applications can communicate with the Kubernetes API.

Now let's test network connectivity. The sleep container has nslookup installed for DNS lookups.


This resolves the "kubernetes" service name to an IP address. This is the Kubernetes API server, automatically available to all Pods.

Let's try pinging it.


Note: Some Kubernetes installations don't support ICMP ping for internal addresses, so you might see packet loss. That's fine - it doesn't mean networking is broken, just that ping isn't supported.

Let me exit this shell session.


And we're back to our local terminal.

## Pod-to-Pod Networking

Every Pod gets its own IP address. Let's see how Pods communicate with each other.

First, let's get the whoami Pod's IP address.


There's the IP address. I can see it's 10.1.0.13 (yours will be different).

We could manually use this IP, but let's use kubectl's powerful JSONPath output to extract it programmatically.


JSONPath lets us query specific fields from the Kubernetes API response. The .status.podIP field contains the Pod's IP address.

Now let's make an HTTP request from the sleep Pod to the whoami Pod.


Excellent! We got a response from the whoami application. The output shows:
- The container hostname (which is the Pod name)
- The IP addresses
- The operating system
- Other environment details

This demonstrates that Pods can communicate directly using their IP addresses within the cluster.

## Understanding Pod Self-Healing

One of the key features of Pods is that they monitor containers and restart them if they fail. Let's see this in action with the lab exercise.

The lab asks us to create a Pod with a badly-configured container that keeps crashing. Let me create this YAML file.

I'll create a new file called sleep-lab.yaml with a container that's configured to exit immediately.


This image is intentionally broken - the container will exit almost immediately.


Now let's watch what happens. I'll use the watch functionality to see the Pod status update in real-time.


Watch the RESTARTS column. The Pod keeps restarting the container! After about 30 seconds, you'll see it restart once. Wait a bit longer, and it restarts again.

Let's stop watching (Ctrl+C) and get detailed information.


Look at the State section under Containers. You can see:
- The container is in a "waiting" or "crashed" state
- The restart count
- The reason for the last termination
- The exit code

The Events section shows all the restarts. Kubernetes keeps trying to run your container, implementing exponential backoff - waiting longer between each restart attempt.

This is the first layer of high availability. If your application crashes, Kubernetes automatically restarts it. Of course, if the container keeps failing, Kubernetes can't fix a broken application, but it will keep trying.

## Cleanup

Before we finish, let's clean up the Pods we created.


We can delete multiple Pods in one command by listing their names. Kubernetes will gracefully terminate each Pod.


And they're gone. Our namespace is clean again.

## Summary

In this demo, we covered:

- Creating Pods from YAML files using kubectl apply
- Viewing Pod information with get, describe, and wide output
- Reading container logs with kubectl logs
- Executing commands in containers with kubectl exec
- Using interactive shell sessions for exploration
- Pod-to-Pod networking using IP addresses
- Pod self-healing with automatic container restarts

These are essential skills for working with Kubernetes and for the CKAD exam.

## Next Steps

Now that you've seen the basics in action, we're ready to tackle CKAD-specific scenarios. In the next video, we'll explore:

- Multi-container Pods with sidecar patterns
- Resource requests and limits
- Liveness and readiness probes
- Security contexts
- Advanced Pod configuration for the exam

Thanks for following along, and I'll see you in the next video!

---

## Recording Notes

**Screen Setup:**
- Terminal on left (70% width)
- File editor on right (30% width) when showing YAML
- Full terminal when running commands

**Key Points to Emphasize:**
- Declarative nature of Kubernetes (same YAML = no change)
- Importance of describe for troubleshooting
- Pod IP addresses are ephemeral (mentioned but not over-emphasized)
- Self-healing behavior with restarts

**Commands to Type Slowly (for clarity):**
- JSONPath queries
- kubectl exec with multiple arguments
- Multi-word delete commands

**Common Mistakes to Avoid:**
- Don't go too fast when showing YAML structure
- Explain what you're doing before running commands
- Pause after important outputs to let viewers process

**Timing Breakdown:**
- Cluster verification: 1 min
- First Pod creation: 3 min
- Exploring Pod info: 3 min
- Logs and exec: 2 min
- Second Pod: 2 min
- Interactive shell: 3 min
- Pod networking: 3 min
- Self-healing demo: 4 min
- Cleanup and summary: 2 min

**Total: ~23 minutes**
