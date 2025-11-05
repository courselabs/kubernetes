# Network Policy Practical Exercises - Narration Script
**Duration:** 15-18 minutes
**Format:** Hands-on demonstration following README.md
**Target Audience:** CKAD candidates and Kubernetes practitioners

---

## Introduction [0:00-0:30]

Welcome to the NetworkPolicy practical exercises. In this session, we'll work hands-on with Kubernetes NetworkPolicy to secure a real application. We'll deploy a distributed application, apply network policies, and observe how they control traffic flow.

We'll be working with the APOD application - Astronomy Picture of the Day - which consists of three components: a web frontend, an API service, and a logging service. Through this example, you'll learn how to implement default deny policies, allow specific traffic patterns, and troubleshoot network connectivity issues.

Let's begin by setting up our environment and deploying the application.

---

## Part 1: Deploy the APOD Application [0:30-2:30]

**[0:30-1:00] Application Overview**

Let's start by understanding what we're deploying. The APOD application is a simple three-tier application:

The web component serves the user interface and is exposed via a NodePort Service on port 30016.

The API component provides REST endpoints to fetch astronomy picture data from NASA's public API.

The log component is another REST API that records user activity.

All three components are defined with standard Kubernetes resources - Deployments and Services. There's nothing special about the specs themselves; they're regular application deployments without any network policies initially.

**[1:00-1:30] Deploy the Application**

Let's deploy all the components. I'll apply the manifests from the apod directory:

```
kubectl apply -f labs/networkpolicy/specs/apod
```

We should see three Deployments and three Services being created. Let's check the status:

```
kubectl get pods,svc -l kubernetes.courselabs.co=networkpolicy
```

Wait for all Pods to reach the Running state with all containers ready. This usually takes 30 seconds to a minute depending on whether the images are already cached.

**[1:30-2:30] Verify Application Functionality**

Now that the Pods are running, let's verify the application works. Open a browser and navigate to http://localhost:30016.

You should see the Astronomy Picture of the Day website. The web frontend is successfully communicating with both the API and log services. Take note of this working state - we're about to break it with network policies, and then fix it properly.

The key observation here is that in a default Kubernetes cluster, all Pods can communicate freely. The web Pod can reach the API and log Pods without any restrictions. This is the flat networking model we discussed in the concepts presentation.

---

## Part 2: Implement Default Deny Policy [2:30-5:00]

**[2:30-3:15] Understanding Default Deny**

Now let's implement a default deny-all policy. This is a common security practice - block all traffic by default, then explicitly allow only what's necessary.

Let me show you the policy we're about to apply. Opening the default-deny.yaml file:

```
kubectl apply -f labs/networkpolicy/specs/deny-all
```

Let's examine what we just created:

```
kubectl get netpol
```

We can use `netpol` as a shorthand for networkpolicies. Let's describe it to see the details:

```
kubectl describe netpol default-deny
```

Notice the podSelector is empty - just curly braces. This means the policy applies to ALL Pods in this namespace. The policyTypes include both Ingress and Egress, but there are no rules defined for either. This effectively blocks all incoming and outgoing traffic.

**[3:15-4:15] Testing the Policy Effect**

Now, here's something interesting. Refresh the browser at http://localhost:30016.

In most cases, the application still works. Why? Because most Kubernetes clusters don't actually enforce NetworkPolicy. Docker Desktop, which many of you might be using, doesn't have a CNI plugin that supports NetworkPolicy enforcement.

The policy is created and stored in the cluster, but it's not being applied to the actual network traffic. To really see NetworkPolicy in action, we need a cluster with a CNI plugin that supports policy enforcement, like Calico or Cilium.

Let's verify that the policy isn't being enforced by trying to communicate between Pods:

```
kubectl exec deploy/apod-web -- wget -O- http://apod-api/image
```

This should still work if your CNI doesn't enforce policies. The web Pod can still reach the API Pod despite the deny-all policy.

**[4:15-5:00] Cleanup and Preparation**

Since we need a policy-enforcing cluster, let's clean up this deployment:

```
kubectl delete -f labs/networkpolicy/specs/apod
```

If you're already using k3d, stop your existing cluster to prevent port collisions:

```
k3d cluster stop k8s
```

Now we'll set up a new cluster with Calico CNI, which does enforce NetworkPolicy. This is where the real learning happens.

---

## Part 3: Create a Policy-Enforcing Cluster [5:00-8:00]

**[5:00-6:00] Install k3d CLI (if needed)**

If you don't already have k3d installed, you'll need it now. k3d is a tool that creates Kubernetes clusters where each node runs inside a Docker container. It's lightweight and perfect for testing advanced features like network policies.

Installation is straightforward with package managers:

On Windows with Chocolatey:
```
choco install k3d
```

On macOS with Homebrew:
```
brew install k3d
```

On Linux:
```
curl -s https://raw.githubusercontent.com/rancher/k3d/main/install.sh | bash
```

Verify the installation:
```
k3d version
```

Make sure you're on k3d version 5 or later. The commands have changed significantly between versions.

**[6:00-7:00] Create Cluster Without Default Networking**

Now let's create a k3d cluster without the default Flannel CNI:

```
k3d cluster create labs-netpol -p "30000-30040:30000-30040@server:0" --k3s-arg '--flannel-backend=none@server:0' --k3s-arg '--disable=servicelb@server:0' --k3s-arg '--disable=traefik@server:0' --k3s-arg '--disable=metrics-server@server:0'
```

Let me explain these options: we're creating a single-node cluster named labs-netpol. The `-p` flag publishes ports 30000-30040 to localhost so we can access NodePort services. The k3s-arg flags disable Flannel and other default features we don't need.

This creates the cluster but without any CNI plugin. Let's check the cluster status:

```
kubectl get nodes
```

Notice the node is in NotReady state. Without a network plugin, the cluster cannot function. Even the CoreDNS deployment won't run:

```
kubectl get deploy -n kube-system
```

CoreDNS is scaled to zero or stuck pending because it requires networking to function.

**[7:00-8:00] Install Calico CNI**

Now we'll install Calico, which is a popular CNI plugin that supports NetworkPolicy. Calico runs as a DaemonSet and uses privileged init containers to configure the host network. This is why we're using k3d - we don't want to modify the network configuration of our main system.

Apply the Calico manifest:

```
kubectl apply -f labs/networkpolicy/specs/k3d
```

Watch the Pods in the kube-system namespace:

```
kubectl get pods -n kube-system --watch
```

You'll see several Calico Pods starting: calico-node, calico-kube-controllers, and others. Wait for them all to be Running and Ready. This usually takes one to two minutes.

Once Calico is running, check the node status again:

```
kubectl get nodes
```

The node should now be Ready. CoreDNS should also be running. Our cluster is now ready, and importantly, it will enforce NetworkPolicy rules.

---

## Part 4: Deploy and Secure the Application [8:00-12:00]

**[8:00-9:00] Deploy Application on New Cluster**

Now let's deploy the APOD application again, this time on our policy-enforcing cluster:

```
kubectl apply -f labs/networkpolicy/specs/apod
```

Wait for the Pods to become ready:

```
kubectl get pods -l kubernetes.courselabs.co=networkpolicy
```

Once they're running, verify the application works by browsing to http://localhost:30016. The application should load normally, showing the astronomy picture of the day.

Now apply the default deny-all policy again:

```
kubectl apply -f labs/networkpolicy/specs/deny-all
```

Check that it was created:

```
kubectl get netpol
```

**[9:00-10:00] Observe Policy Enforcement**

Now refresh the browser at http://localhost:30016. This time, the application will timeout and fail to load. This is what proper NetworkPolicy enforcement looks like.

The web Pod cannot communicate with the API or log Pods because all traffic is blocked. But it's even more restrictive than that - the Pods cannot even resolve DNS names.

Let's verify this. First, try to access the API by name from the web Pod:

```
kubectl exec deploy/apod-web -- wget -O- http://apod-api/image
```

This will fail with a "bad address" message - the web Pod cannot resolve the apod-api service name to an IP address because DNS traffic is also blocked by the egress policy.

Let's confirm this isn't just a DNS issue by using the Pod IP directly:

```
kubectl get po -l app=apod-api -o wide
```

Note the IP address, then try to access it directly:

```
kubectl exec deploy/apod-web -- wget -O- -T2 http://<pod-ip-address>/image
```

Replace <pod-ip-address> with the actual IP. This will also timeout because the egress policy blocks all outgoing traffic from the web Pod, and the ingress policy blocks all incoming traffic to the API Pod.

**[10:00-12:00] Apply Component-Specific Policies**

Now we need to explicitly model the communication paths between components. We have three policies to apply:

The log policy allows ingress from the web Pod to the API port, with no egress since the log component doesn't make outgoing calls.

The web policy allows ingress from any location - because it's public-facing - and egress to both API Pods plus the DNS server.

The API policy allows ingress from the web Pod and egress to the DNS server and to specific IP ranges where the NASA API is hosted.

Let's apply these policies:

```
kubectl apply -f labs/networkpolicy/specs/apod/network-policies
```

Check what was created:

```
kubectl get netpol
```

We now have four policies: the default-deny and three component-specific policies. Let's verify the web Pod can now reach the API:

```
kubectl exec deploy/apod-web -- wget -O- -T2 http://apod-api/image
```

This should now succeed, returning JSON data from the API. Let's look at the API policy in detail:

```
kubectl describe netpol apod-api
```

Notice the egress rules include both the DNS selector and specific CIDR blocks for the NASA API endpoints. This allows the API Pod to fetch data from the external service while still being restricted.

Now refresh the browser at http://localhost:30016. The application is working again, but this time with proper network security in place. Only the explicitly allowed communication paths are permitted.

---

## Part 5: Lab Challenge - Enhanced Security [12:00-15:00]

**[12:00-13:00] Identify the Security Gap**

We have the application running with network policies, but there's still a security vulnerability. Let me show you.

The policies use label selectors to control access. For example, the apod-api policy allows ingress from Pods labeled "app: apod-web". But what if someone deploys a malicious Pod with that same label?

Let's test this. I'll deploy a sleep Pod that has the apod-web label:

```
kubectl apply -f labs/networkpolicy/specs/apod-hack
```

Now let's use this Pod to bypass our security:

```
kubectl exec sleep -- wget -O- http://apod-api/image
```

This succeeds. The sleep Pod can access the API because it has the correct label, even though it's not the legitimate web application. This is a label-based access control vulnerability.

The solution is to deploy the application to a dedicated namespace and use namespace selectors in the policies to restrict access to Pods from that specific namespace. This provides an additional layer of security.

**[13:00-14:00] Lab Task Instructions**

Your challenge is to fix this security issue. Here are the two tasks:

First, modify all the application manifests to deploy to a custom namespace called "apod" instead of the default namespace.

Second, update the network policies to restrict ingress traffic to only allow Pods from the apod namespace. This prevents Pods in other namespaces from accessing the application components, even if they have matching labels.

You'll need to delete the existing APOD deployment to start fresh. Then recreate everything in the new namespace with updated policies.

Take 5 to 10 minutes to work on this. Use the hints file if you get stuck, and check the solution if you need guidance.

**[14:00-15:00] Solution Walkthrough**

Let's walk through the solution. First, delete the existing deployment:

```
kubectl delete -f labs/networkpolicy/specs/apod
kubectl delete netpol default-deny
```

Create the apod namespace:

```
kubectl create namespace apod
```

Now you need to update each manifest file to include `namespace: apod` in the metadata section. Alternatively, you can use `kubectl apply -f <file> -n apod` to override the namespace.

For the network policies, you need to add namespaceSelector to the ingress rules. For example, in the apod-api policy:

```yaml
ingress:
- from:
  - namespaceSelector:
      matchLabels:
        kubernetes.io/metadata.name: apod
    podSelector:
      matchLabels:
        app: apod-web
```

This requires both the namespace label AND the pod label to match. The namespace selector and pod selector in the same list item create an AND condition.

After applying the updated manifests and policies, test that the application works:

```
kubectl get pods -n apod
```

Browse to http://localhost:30016 - it should work.

Now verify that Pods from outside the namespace cannot access the API:

```
kubectl run test --image=busybox --command -- sleep 3600
kubectl exec test -- wget -O- --timeout=2 http://apod-api.apod/image
```

This should timeout, proving that namespace-based isolation is working correctly.

---

## Conclusion [15:00-15:30]

**Summary**

In this practical session, we've accomplished several things:

We deployed a multi-tier application and observed default Kubernetes networking behavior.

We implemented a default deny-all NetworkPolicy and learned that not all CNI plugins enforce policies.

We created a k3d cluster with Calico CNI to properly enforce NetworkPolicy.

We applied component-specific policies to allow only necessary communication paths.

We identified and fixed a label-based security vulnerability using namespace selectors.

**Key Takeaways**

Remember these practical lessons:

Always test in an environment that enforces NetworkPolicy. Docker Desktop won't help you learn this properly.

Start with default deny, then add allow rules. It's easier to reason about and more secure.

Don't forget DNS in egress policies - this is the most common mistake.

Use namespace selectors for cross-namespace isolation. Labels alone are not sufficient for security.

Test your policies thoroughly. Use kubectl exec with wget or curl to verify connectivity works as expected and fails where it should.

**Next Steps**

I recommend practicing these exercises multiple times until you can write policies from memory. On the CKAD exam, you won't have time to look up syntax - you need to know the structure cold.

Try creating policies for different application architectures. Practice with three-tier apps, microservices, and cross-namespace scenarios.

Thank you for following along with this practical demonstration. Now you're ready for the CKAD-specific scenarios in the exam prep session.
