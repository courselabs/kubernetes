# Services - CKAD Exam Preparation Script

**Duration:** 25-30 minutes
**Accompaniment:** Live terminal demonstration with exam scenarios
**Audience:** CKAD candidates preparing for exam-level challenges
**Prerequisites:** Completed basic Services lab (README.md exercises)

---

## Introduction (0:00-1:00)

Welcome to the CKAD exam preparation module for Kubernetes Services. This session covers the advanced Service topics you'll encounter on the exam.

We'll work through endpoints and EndpointSlices, multi-port Services, headless Services, ExternalName Services, session affinity, and troubleshooting scenarios. These are the topics that separate basic understanding from exam-ready competence.

The CKAD exam is timed and practical. You won't just need to understand these concepts - you'll need to implement them quickly and correctly under pressure. Let's get started.

## Understanding Endpoints in Depth (1:00-4:00)

Let's start by really understanding how Services route traffic. From the basic lab, you should have a Service and Pod running. If not, let's create them:

When you create a Service with a selector, Kubernetes automatically creates an Endpoints object:

This is the connection between Services and Pods. Let's look at it in detail:

You'll see the Pod IP addresses under the Addresses section. This is the list of targets the Service will route traffic to.

The Endpoints object has the same name as the Service - "whoami". Kubernetes keeps these synchronized automatically. When a Pod matching the selector is created, it's added to the endpoints. When a Pod is deleted or becomes unhealthy, it's removed.

Let's see this in action. First, let's look at the current endpoints in YAML format:

Look at the subsets section. It contains addresses (the Pod IPs) and ports. Now let's delete the whoami Pod:

Immediately check the endpoints:

The endpoints disappear almost instantly. Kubernetes saw the Pod was deleted and updated the Endpoints object.

Now recreate the Pod:

And check again:

The endpoint is back, but with a new IP address because the Pod was recreated.

This automatic management is what makes Services so powerful. You never have to manually manage these endpoints - Kubernetes does it for you based on label selectors.

## EndpointSlices (4:00-5:30)

EndpointSlices are the newer version of Endpoints. They solve a scalability problem with the original Endpoints API.

Let's look at them:

You'll see an EndpointSlice for each Service. Let's examine the whoami one:

The information is similar to Endpoints, but the format is different. EndpointSlices have a label that associates them with their Service.

The key difference is scalability. In the original Endpoints API, all Pod IPs for a Service are stored in a single object. If you have a Service with 1000 Pods, that's 1000 IPs in one object. Every update to any endpoint requires updating this large object.

EndpointSlices split the list into multiple objects, each containing up to 100 endpoints by default. This dramatically reduces the size of individual objects and the load on the API server.

For the CKAD exam, you should know that EndpointSlices exist and understand why they're better for large-scale Services. You'll typically interact with the Endpoints API for troubleshooting, but EndpointSlices are what's actually used under the hood.

## Multi-Port Services (5:30-8:30)

Many applications expose multiple ports. A web application might serve HTTP on port 8080 and expose metrics on port 9090. Services can handle this with multi-port configurations.

Let's create a multi-port Service. Here's what the YAML would look like:

Notice that each port has a name. When you have multiple ports, naming them is required. This makes it clear what each port is for.

The Service will listen on both port 80 and port 443, and forward to the corresponding ports on the Pods.

Let's say you want to expose the whoami application on two different ports. We'll create this Service:

Now let's check the Service:

You'll see both ports listed. The Service listens on 80 and 8080, both forwarding to port 80 on the Pod.

Let's test both ports:

Both work, routing to the same Pod but on different Service ports.

This is useful when you want to expose the same backend service on different ports for different purposes - maybe one for internal use, one for external.

## Named Ports (8:30-10:00)

Here's a powerful feature - you can name ports in your Pod spec and reference those names in Services.

Let's say you have a Pod spec like this:

The ports are named "http-web" and "metrics". Now your Service can reference these names:

Notice targetPort uses the port name, not a number. This is incredibly useful for version upgrades.

If you upgrade your application and the HTTP port changes from 80 to 8080, you just update the Pod spec's containerPort. The Service continues to work because it references the port by name, not number.

For the CKAD exam, know that you can reference ports by name and understand when this is useful. It's a best practice for production environments.

## Headless Services (10:00-12:30)

Now let's talk about headless Services. These are Services where you set clusterIP: None.

A headless Service doesn't do load balancing. Instead, DNS returns all the Pod IP addresses directly. Let's create one:

Let's check the Service:

Notice the CLUSTER-IP shows "None". This Service has no cluster IP address.

Now let's do a DNS lookup:

Instead of returning a single IP address like a normal Service, this returns the IP addresses of all matching Pods. Each Pod gets its own DNS A record.

This is useful in several scenarios. StatefulSets use headless Services so each Pod can be addressed individually by a predictable DNS name. Some applications, like databases, need to know about all replicas for clustering. Some client libraries do their own load balancing and just need the list of backend IPs.

Let's create multiple whoami Pods to see this better:

Wait for them to start, then do the DNS lookup again:

Now you should see multiple IP addresses in the response - one for each whoami Pod.

For the CKAD exam, understand what headless Services are, how to create them (clusterIP: None), and when to use them. They're less common than regular Services, but critical for StatefulSets and certain application patterns.

## Services Without Selectors (12:30-15:00)

Here's an interesting capability - you can create a Service without a selector. This is useful for routing to external systems or manually managing endpoints.

Let's create a Service for an external database:

Notice there's no selector. Let's check what happened:

No endpoints were created automatically. We have to create them manually:

The Endpoints object must have the same name as the Service. We manually specify the IP address and port.

Now check again:

The Service now has endpoints pointing to our external IP address. Applications can use the name "external-database" and it routes to 10.0.1.50:5432.

This is powerful for migrations. You can start with a Service pointing to an external database, then gradually migrate that database into Kubernetes. Once it's running as a Pod with the right labels, you just add a selector to the Service. The Service name stays the same, so applications don't need to change.

For the CKAD exam, understand that Services without selectors require manual Endpoints management. Know how to create both the Service and the Endpoints object.

## ExternalName Services (15:00-17:00)

ExternalName Services are different - they don't route traffic at all. They just create a DNS CNAME record.

Let's create one:

This Service doesn't have a cluster IP or endpoints. Let's check:

The TYPE is ExternalName, and the EXTERNAL-IP shows the DNS name we specified.

Let's do a DNS lookup:

DNS returns a CNAME record pointing to api.example.com. No traffic routing happens in Kubernetes - the client resolves the CNAME and connects directly to the external service.

This is useful for a few scenarios. You can reference external services using Kubernetes-internal names, making it easier to switch between environments. You can gradually migrate services into Kubernetes by changing the ExternalName to a regular ClusterIP Service later.

For the CKAD exam, know that ExternalName Services create DNS aliases without routing traffic through Kubernetes.

## Session Affinity (17:00-19:00)

By default, Services load balance requests randomly. Each request might go to a different Pod. But sometimes you need requests from the same client to go to the same Pod - this is called session affinity or sticky sessions.

Let's create a Service with session affinity:

The key setting is sessionAffinity: ClientIP. This tells Kubernetes to route requests from the same client IP to the same Pod.

The timeoutSeconds is how long the affinity lasts. After 300 seconds (5 minutes) without a request, the affinity expires.

Let's test this. First, make sure we have multiple whoami Pods:

We should have three from earlier. Now let's make multiple requests:

You should see the same hostname in all responses. The requests are all coming from the same source (the sleep Pod), so session affinity routes them all to the same backend Pod.

Compare this to a Service without session affinity:

These responses will likely show different hostnames as the Service load balances across different Pods.

For the CKAD exam, know how to configure session affinity and understand when it's useful. It's good for applications with in-memory sessions, but it's not a complete solution for stateful applications.

## DNS and Service Discovery (19:00-21:00)

Let's talk about DNS naming in depth. Services are accessible via DNS in multiple formats.

Within the same namespace, you can use just the Service name:

But Services exist within namespaces. Let's create a Service in a different namespace:

Now try to access it from the default namespace:

That fails. The Service is in a different namespace. To access it, you need to include the namespace:

The format is service-name.namespace. This works from any namespace.

There's also a fully qualified domain name:

The full format is service-name.namespace.svc.cluster.local. You rarely need this, but it's good to know it exists.

For the CKAD exam, understand DNS naming across namespaces. Many exam scenarios involve applications in different namespaces that need to communicate.

Services also create SRV records for port discovery:

This returns the port information for the Service. It's not commonly used, but it's part of the DNS spec.

## Service Troubleshooting (21:00-24:30)

Troubleshooting Services is a critical CKAD skill. Let's work through common issues.

**Problem 1: Service has no endpoints**

Let's create a Service with a selector that doesn't match any Pods:

Check the endpoints:

No endpoints. The selector "app: nonexistent" doesn't match any Pods. Let's verify:

No Pods found. This is the most common Service issue - label mismatch.

How do you debug this? First, check what selector the Service is using:

Look at the Selector line. Then check what labels your Pods actually have:

The fix is to either change the Service selector or add the correct labels to the Pods.

**Problem 2: Port mismatch**

Let's say you have a Service pointing to the wrong port:

The Service forwards to targetPort 8080, but whoami listens on port 80. Let's test:

This will timeout or fail. How do you debug this?

Check the Service:

Look at the TargetPort. Then check what port the Pod is actually listening on:

Look at the Ports section in the container spec. The targetPort must match the containerPort.

**Problem 3: Pods not ready**

Services only route to Pods that are in the Ready state. If your Pods are failing readiness probes, they won't receive traffic.

Let's check Pod status:

If a Pod shows 0/1 under READY, it's not receiving traffic. Check why:

Look at the Conditions section and Events. The Pod might be failing readiness probes, or the container might not have started properly.

**Problem 4: DNS not resolving**

If DNS isn't working at all, test the DNS service:

This should always work - kubernetes.default is the Service for the API server. If this fails, the problem is with DNS, not your specific Service.

Check that the kube-dns or CoreDNS Pods are running:

For the CKAD exam, practice these troubleshooting workflows until they're automatic. You need to diagnose and fix Service issues quickly.

## Exam Scenarios (24:30-27:30)

Let's work through some exam-style scenarios.

**Scenario 1: Quick Service Creation**

You need to expose an existing deployment as a Service. The fastest way is imperative:

This creates a ClusterIP Service in one command. For a NodePort:

For the exam, practice these imperative commands. They're faster than writing YAML.

**Scenario 2: Multi-Port Service**

Create a Service that exposes ports 80 and 443. You'll need declarative YAML for this:

Practice writing multi-port Services from scratch.

**Scenario 3: Troubleshooting**

A developer says their Service isn't working. How do you diagnose it?

Memorize this troubleshooting workflow.

**Scenario 4: Cross-Namespace Communication**

You have a frontend in namespace "frontend" and a backend in namespace "backend". The frontend needs to call the backend.

The backend Service is exposed in its namespace:

The frontend Pod needs to use the full DNS name:

Practice this pattern - it's common in microservices scenarios.

## Cleanup and Summary (27:30-29:00)

Let's clean up all the resources we created:

Let's summarize what we've covered for the CKAD exam:

**Key Concepts:**
- Endpoints and EndpointSlices track which Pods receive traffic
- Multi-port Services support applications with multiple ports
- Named ports enable version independence
- Headless Services return Pod IPs directly without load balancing
- Services without selectors require manual Endpoints management
- ExternalName Services create DNS CNAME aliases
- Session affinity enables sticky sessions based on client IP
- DNS naming varies by namespace (service, service.namespace, FQDN)
- Troubleshooting involves checking endpoints, labels, ports, and Pod readiness

**Exam Strategies:**
- Use imperative commands (kubectl expose) when possible
- Know how to write multi-port Service YAML quickly
- Memorize the troubleshooting workflow (endpoints, labels, ports, DNS)
- Practice cross-namespace scenarios
- Understand when to use each Service type
- Be able to quickly verify Service configuration

## Next Steps (29:00-30:00)

You now have the knowledge you need for Services on the CKAD exam. But knowledge isn't enough - you need practice.

Set yourself time-based challenges. Can you create a multi-port Service in 2 minutes? Can you troubleshoot a broken Service in 3 minutes?

Work through the scenarios we covered multiple times until they're muscle memory.

Review the official Kubernetes documentation on Services. The exam allows you to use the docs, so know where to find information quickly.

Practice on different Kubernetes distributions to see how LoadBalancers and NodePorts behave in different environments.

Services are fundamental to Kubernetes networking. Master them, and you'll be well-prepared for this portion of the CKAD exam.

Thank you for watching, and good luck with your exam preparation!

---
