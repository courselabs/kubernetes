# Services - Practical Exercises Script

**Duration:** 15-20 minutes
**Accompaniment:** Live terminal demonstration
**Audience:** CKAD candidates following hands-on lab exercises

---

## Introduction (0:00-0:30)

Welcome to the practical exercises for Kubernetes Services. In this demo, we'll work through the hands-on lab, creating and testing different types of Services.

Make sure you have a Kubernetes cluster running and kubectl configured. You should have completed the Pods lab before this one, as we'll be building on those concepts.

All the YAML files we'll use are in the labs/services directory. Let's get started.

## Setting Up Test Pods (0:30-3:00)

First, we need some Pods to work with. We're going to create two simple Pods - whoami and sleep. The whoami Pod runs a web service that tells us information about itself, and the sleep Pod is a utility container we'll use for testing.

Let's look at the Pod definitions first:

```bash
cat labs/services/specs/pods/whoami.yaml
```

Notice the labels section in the metadata. The whoami Pod has the label "app: whoami". This label is crucial - it's how our Service will find this Pod.

Now let's look at the sleep Pod:

```bash
cat labs/services/specs/pods/sleep.yaml
```

This is a simple Pod that runs a sleep command, giving us a container we can exec into for testing.

Let's create both Pods:

```bash
kubectl apply -f labs/services/specs/pods
```

Kubectl can apply multiple YAML files from a directory at once. This is a handy time-saver in the CKAD exam.

Now let's check the status and see the Pod details:

```bash
kubectl get pods -o wide --show-labels
```

Look at the output. Each Pod has its own IP address. The whoami Pod has the label "app=whoami" that we saw in the YAML. These are the key pieces of information we need.

Now let's try something interesting. Can the sleep Pod find the whoami Pod by name?

```bash
kubectl exec sleep -- nslookup whoami
```

It fails. Even though both Pods exist, they can't find each other by name. Pod names don't create DNS entries. This is exactly the problem Services solve.

## Creating a ClusterIP Service (3:00-6:00)

Let's create a Service to provide a stable network endpoint for the whoami Pod.

First, let's look at the Service definition:

```bash
cat labs/services/specs/services/whoami-clusterip.yaml
```

Let me explain the important parts here. The kind is Service, which tells Kubernetes what type of resource this is.

The spec has a selector with "app: whoami". This is how the Service finds Pods - it looks for Pods with this label. Remember, our whoami Pod has exactly this label.

The ports section defines how traffic flows. The Service listens on port 80, and it forwards traffic to targetPort 80 on the Pods. These happen to be the same, but they don't have to be.

Let's create the Service:

```bash
kubectl apply -f labs/services/specs/services/whoami-clusterip.yaml
```

Now let's examine it:

```bash
kubectl get service whoami
```

Look at the TYPE column - it says ClusterIP. The CLUSTER-IP column shows the IP address assigned to this Service. This IP is stable - it won't change unless we delete the Service.

Let's get more details:

```bash
kubectl describe svc whoami
```

This shows us several important things. The Type is ClusterIP, so this is an internal-only Service. The IP is the same we saw before. The Port shows 80/TCP - that's what the Service listens on.

Most importantly, look at the Endpoints section. It shows the IP address of our whoami Pod. The Service has successfully found the Pod using the label selector.

## Testing Service Discovery (6:00-8:30)

Now for the magic moment - let's try that DNS lookup again:

```bash
kubectl exec sleep -- nslookup whoami
```

Success! This time it works. The DNS lookup returns the Service IP address. Kubernetes automatically created a DNS entry when we created the Service.

Now let's actually access the whoami service:

```bash
kubectl exec sleep -- curl -s http://whoami
```

Beautiful. The sleep Pod can now access whoami using its Service name. The request went to the Service IP, and the Service forwarded it to the whoami Pod.

Now let's demonstrate why Services are so important. We're going to delete the whoami Pod and recreate it. The new Pod will have a different IP address, but watch what happens to the Service.

First, let's see the current Pod IP:

```bash
kubectl get pods -o wide -l app=whoami
```

Note that IP address. Now let's delete the Pod:

```bash
kubectl delete pods -l app=whoami
```

Notice we used a label selector with kubectl delete. Labels aren't just for Services - you can use them with kubectl commands too. This is incredibly useful for managing related resources.

Now let's recreate the Pod:

```bash
kubectl apply -f labs/services/specs/pods
```

And check its IP address:

```bash
kubectl get pods -o wide -l app=whoami
```

See that? Different IP address. But let's try our curl command again:

```bash
kubectl exec sleep -- curl -s http://whoami
```

It still works! The Service IP didn't change, and the Service automatically updated its endpoints to route to the new Pod IP. Let's verify that:

```bash
kubectl exec sleep -- nslookup whoami
```

Same Service IP as before. The Service provides stability on top of ephemeral Pods.

## Understanding External Services (8:30-10:00)

Now let's talk about exposing applications outside the cluster. There are two main Service types for this - NodePort and LoadBalancer.

A NodePort Service opens a specific port on every node in your cluster. Any traffic to that port on any node gets forwarded to your Pods.

A LoadBalancer Service integrates with your cloud provider to create an actual load balancer. This only works in environments that support it - cloud platforms like AWS, Azure, GCP, and some local environments like Docker Desktop.

Let's look at the configurations for both:

```bash
cat labs/services/specs/services/whoami-nodeport.yaml
```

Notice the type is NodePort, and we've specified nodePort: 30010. This means port 30010 will be opened on every node. The Service still listens on port 8010 internally, and forwards to targetPort 80 on the Pods.

Now let's look at the LoadBalancer:

```bash
cat labs/services/specs/services/whoami-loadbalancer.yaml
```

The type is LoadBalancer, and it listens on port 8080. No nodePort is needed - the load balancer handles external access.

We can deploy both Services at the same time:

```bash
kubectl apply -f labs/services/specs/services/whoami-nodeport.yaml -f labs/services/specs/services/whoami-loadbalancer.yaml
```

Now let's look at all our Services:

```bash
kubectl get svc -l app=whoami
```

We have three Services now, all routing to the same whoami Pod. The ClusterIP Service we created earlier, plus our new NodePort and LoadBalancer Services.

If you're on a cluster that supports LoadBalancers, you'll see an external IP in the EXTERNAL-IP column. If not, it will show pending forever - that's normal for environments without LoadBalancer support.

## Testing External Access (10:00-12:00)

Here's something important to understand - NodePort and LoadBalancer Services also create a ClusterIP. This means they can be accessed both internally and externally.

Let's test internal access to both Services:

```bash
kubectl exec sleep -- curl -s http://whoami-lb:8080
```

That's accessing the LoadBalancer Service internally. Notice we use the Service name and the port from the Service spec.

Now the NodePort:

```bash
kubectl exec sleep -- curl -s http://whoami-np:8010
```

Both work internally. The LoadBalancer Service listens on port 8080, the NodePort on 8010, but both forward to the same Pod.

Now let's test external access from our local machine. If you're using Docker Desktop or a similar environment where localhost works:

```bash
curl http://localhost:8080
```

This accesses the LoadBalancer Service externally. If this doesn't work in your environment, don't worry - not all clusters expose localhost access.

Let's try the NodePort:

```bash
curl http://localhost:30010
```

Notice we use the nodePort value - 30010 - for external access, not the Service port.

If you're on a cloud cluster, you'd use the node's public IP address for NodePort access, or the LoadBalancer's external IP.

## Understanding Endpoints (12:00-13:30)

Let's dig deeper into how Services actually know where to send traffic.

When you create a Service with a selector, Kubernetes creates an Endpoints object:

```bash
kubectl get endpoints whoami
```

This shows the IP addresses of all Pods that match the Service selector. Let's get more detail:

```bash
kubectl describe endpoints whoami
```

The Addresses section lists the Pod IPs that are receiving traffic. The Ports section shows which port traffic is sent to.

All three of our Services - the ClusterIP, NodePort, and LoadBalancer - have the same selector, so they all use the same Pod. That's why we see the same endpoint IP in all of them.

What happens if no Pods match the selector? Let's demonstrate that.

## Lab Challenge Introduction (13:30-14:00)

Now it's time for you to experiment on your own. The lab challenge asks you to explore two scenarios:

First, create a Service whose selector doesn't match any Pods. What happens? How can you tell that the Service has no targets?

Second, create multiple whoami Pods and a Service that matches all of them. What happens when you make requests to the Service? How does it distribute traffic?

These are important scenarios to understand for the CKAD exam. Service troubleshooting often comes down to checking whether endpoints exist and whether labels match.

## Lab Solution Preview (14:00-16:00)

Let me give you some hints without completely solving the challenge.

For the first scenario, you could create a Service with a selector that doesn't match any existing Pods. Try this:

```bash
kubectl create service clusterip test-svc --tcp=80:80
```

Then check its endpoints:

```bash
kubectl get endpoints test-svc
```

You'll see it has no endpoints. The Service exists, but it can't route traffic anywhere. If you try to access it, the connection will fail.

For the second scenario, you need multiple Pods with the same labels. You could modify the whoami Pod spec to create multiple copies, or better yet, use a label selector that matches multiple Pods.

Then check the endpoints:

```bash
kubectl get endpoints whoami -o yaml
```

You'll see multiple IP addresses in the addresses list. Each time you make a request to the Service, it picks one of these Pods.

Make requests in a loop and you'll see responses from different Pods:

```bash
kubectl exec sleep -- sh -c "for i in 1 2 3 4 5; do curl -s http://whoami | grep -i hostname; done"
```

The Service is load balancing across all matching Pods.

## Troubleshooting Tips (16:00-17:30)

Let me share some troubleshooting techniques you'll need for the CKAD exam.

If a Service isn't working, always check the endpoints first:

```bash
kubectl get endpoints <service-name>
```

No endpoints? Check the selector:

```bash
kubectl describe service <service-name>
```

Look at the Selector line and compare it to your Pod labels:

```bash
kubectl get pods --show-labels
```

If the labels don't match exactly, the Service won't find the Pods.

For DNS issues, test from a Pod:

```bash
kubectl exec sleep -- nslookup <service-name>
```

If DNS fails, the problem might be with the DNS service itself or the namespace.

For connectivity issues, check that your ports line up:
- The Service port is what clients connect to
- The targetPort must match the container port in the Pod
- The nodePort (if used) is for external access

Quick port check:

```bash
kubectl describe service <service-name>
kubectl describe pod <pod-name>
```

## Cleanup (17:30-18:00)

When you're done experimenting, cleanup is easy. All the resources in this lab have the label "kubernetes.courselabs.co=services":

```bash
kubectl delete pod,svc -l kubernetes.courselabs.co=services
```

This deletes all Pods and Services with that label. Using labels for cleanup is a best practice - it's fast, safe, and you don't have to remember every resource you created.

Let's verify everything is cleaned up:

```bash
kubectl get pod,svc -l kubernetes.courselabs.co=services
```

Should show no resources found.

## Summary (18:00-19:00)

Let's recap what we've demonstrated in this lab:

We created Pods with labels and showed that Pods can't find each other by name without Services.

We created a ClusterIP Service that uses label selectors to find Pods and provides a stable DNS name and IP address.

We saw how Services automatically update their endpoints when Pods are recreated, maintaining stable networking despite Pod IP changes.

We created NodePort and LoadBalancer Services for external access, and saw how they also provide internal ClusterIP access.

We explored how endpoints track which Pods receive traffic from a Service.

We looked at troubleshooting techniques - checking endpoints, verifying labels, and testing DNS resolution.

## Next Steps (19:00-19:30)

You've now seen Services in action. Make sure you complete the lab challenge to reinforce these concepts.

In the next video, we'll tackle CKAD-specific scenarios including headless Services, multi-port Services, ExternalName Services, and exam-style troubleshooting exercises.

Practice is key for the CKAD exam. Try creating Services using kubectl expose. Get comfortable with the imperative commands. Time yourself to see how quickly you can create and test a Service.

Thank you for following along, and I'll see you in the CKAD preparation video!

---

## Demonstration Notes

**Required Setup:**
- Kubernetes cluster (Docker Desktop, k3d, or cloud cluster)
- kubectl configured and working
- Terminal with clear, large font
- Labs repository cloned locally

**Pre-Demo Checklist:**
- Clean cluster state (no conflicting resources)
- Test all commands beforehand
- Verify LoadBalancer support or plan alternative
- Have YAML files readily accessible
- Prepare for potential timing issues with pod creation

**Timing Guide:**
- Introduction: 0.5 min
- Setting Up Test Pods: 2.5 min
- Creating ClusterIP Service: 3 min
- Testing Service Discovery: 2.5 min
- Understanding External Services: 1.5 min
- Testing External Access: 2 min
- Understanding Endpoints: 1.5 min
- Lab Challenge Introduction: 0.5 min
- Lab Solution Preview: 2 min
- Troubleshooting Tips: 1.5 min
- Cleanup: 0.5 min
- Summary: 1 min
- Next Steps: 0.5 min

**Total: ~19 minutes**

**Command Reference:**
```bash
# Setup
kubectl apply -f labs/services/specs/pods
kubectl get pods -o wide --show-labels

# ClusterIP Service
kubectl apply -f labs/services/specs/services/whoami-clusterip.yaml
kubectl get service whoami
kubectl describe svc whoami

# Testing
kubectl exec sleep -- nslookup whoami
kubectl exec sleep -- curl -s http://whoami

# External Services
kubectl apply -f labs/services/specs/services/whoami-nodeport.yaml -f labs/services/specs/services/whoami-loadbalancer.yaml
kubectl get svc -l app=whoami

# Endpoints
kubectl get endpoints whoami
kubectl describe endpoints whoami

# Cleanup
kubectl delete pod,svc -l kubernetes.courselabs.co=services
```

**Troubleshooting During Demo:**
- If pods take time to start, talk about pod lifecycle while waiting
- If LoadBalancer shows pending, explain cloud vs local environments
- If curl fails, check pod status and explain container startup time
- Have backup commands ready for platform-specific issues

**Presentation Tips:**
- Type commands slowly and deliberately
- Read output aloud and explain what you're looking at
- Use cat to show YAML before applying it
- Emphasize the cause-and-effect relationship
- Pause after major concepts to let them sink in
- Keep terminal output clean - clear between major sections
