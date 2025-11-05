# Ingress Concepts - Slideshow Narration Script

**Duration:** 10-12 minutes
**Format:** Concept slideshow with diagrams
**Audience:** Kubernetes learners preparing for CKAD or working with production clusters

---

## Slide 1: Title Slide (0:00-0:30)
**Duration:** 30 seconds

**Visual:** Title slide with "Kubernetes Ingress: HTTP/HTTPS Routing"

**Narration:**
"Welcome to this session on Kubernetes Ingress. In this presentation, we'll explore how Kubernetes manages external HTTP and HTTPS traffic to services running inside your cluster. Ingress is a critical component for production deployments, and understanding it thoroughly is essential for the CKAD certification exam."

---

## Slide 2: The Problem Without Ingress (0:30-2:00)
**Duration:** 90 seconds

**Visual:** Diagram showing multiple services with NodePort or LoadBalancer, cluttered and expensive

**Narration:**
"Before we dive into Ingress, let's understand the problem it solves. Imagine you have multiple applications running in your Kubernetes cluster - a frontend web app, a REST API, and an admin portal. How do you expose these to external users?

Without Ingress, you have two main options. First, you could use NodePort services, but these expose your applications on non-standard ports like 30000, 30001, and so on. This creates a poor user experience and complicates your firewall rules.

Second, you could use LoadBalancer services, which give you proper port 80 and 443 access. However, each LoadBalancer service typically provisions a separate cloud load balancer, which becomes expensive quickly. If you have ten applications, you'd need ten load balancers, each with its own public IP address.

Neither solution is elegant or cost-effective for multiple applications."

---

## Slide 3: What is Ingress? (2:00-3:30)
**Duration:** 90 seconds

**Visual:** Architecture diagram showing Ingress Controller and Ingress Resources

**Narration:**
"Kubernetes Ingress solves this problem by providing a single entry point for HTTP and HTTPS traffic. Think of it as a smart reverse proxy that routes requests to the appropriate services based on rules you define.

Ingress has two key components. First, the Ingress Controller, which is the actual reverse proxy handling incoming traffic. This is typically a deployment running software like Nginx, Traefik, or HAProxy. The controller watches the Kubernetes API for changes and dynamically reconfigures itself.

Second, Ingress Resources, which are Kubernetes objects that define routing rules. These are YAML manifests that specify which requests should go to which services. You might have one Ingress resource per application, all sharing the same controller.

The beauty of this architecture is that you only need one LoadBalancer service for the Ingress Controller, and then all your applications can share that single entry point. This is both cost-effective and operationally simpler."

---

## Slide 4: Ingress Controller Options (3:30-4:45)
**Duration:** 75 seconds

**Visual:** Logos and comparison of popular Ingress Controllers (Nginx, Traefik, Contour, HAProxy, Istio Gateway)

**Narration:**
"There are several Ingress Controller implementations available, each with different features and strengths.

The Nginx Ingress Controller is the most widely used and battle-tested. It's maintained by the Kubernetes community and provides excellent performance with a rich set of features through annotations.

Traefik is popular for its automatic configuration and built-in Let's Encrypt support, making it excellent for dynamic environments.

Contour is a Cloud Native Computing Foundation project built on Envoy Proxy, offering advanced routing capabilities and better integration with service mesh architectures.

For the CKAD exam, you'll most commonly encounter Nginx, so that's what we'll focus on. However, the concepts apply across all controllers. The Ingress Resources you write are largely portable - you primarily change annotations when switching controllers."

---

## Slide 5: Host-Based Routing (4:45-6:15)
**Duration:** 90 seconds

**Visual:** Diagram showing requests to different hostnames routing to different services

**Narration:**
"Let's explore the two main routing strategies, starting with host-based routing. This is sometimes called virtual hosting, similar to what you'd configure in Apache or Nginx directly.

With host-based routing, the Ingress Controller examines the HTTP Host header in each request and routes it accordingly. For example, requests to 'app1.example.com' go to the frontend service, while requests to 'api.example.com' go to the API service, and 'admin.example.com' routes to the admin portal.

This approach is clean and intuitive. Each application gets its own subdomain, and users can bookmark specific applications easily. It also allows you to use different TLS certificates for different hostnames if needed.

In your Ingress resource, you specify the host field in each rule. You can even use wildcard hostnames like 'star dot example dot com' to catch all subdomains, though not all controllers support this feature.

Host-based routing is the most common pattern for multi-tenant applications or when you want clear separation between different services."

---

## Slide 6: Path-Based Routing (6:15-7:45)
**Duration:** 90 seconds

**Visual:** Diagram showing requests to different paths on same hostname routing to different services

**Narration:**
"The second routing strategy is path-based routing, where the URL path determines which service receives the request.

With path-based routing, all requests go to the same hostname, but different URL paths route to different services. For example, 'myapp.example.com/frontend' goes to the frontend service, 'myapp.example.com/api' routes to the API service, and 'myapp.example.com/admin' goes to the admin portal.

Path-based routing is useful when you want a unified domain for your entire application platform, or when you're constrained on the number of hostnames you can use. It's also common in microservices architectures where you want all services under a single API gateway.

You have two path matching types to choose from. The Prefix type matches the beginning of the path, so '/api' matches '/api/users' and '/api/orders'. The Exact type requires an exact match, so '/health' matches only '/health' and not '/health/check'.

You can also combine both strategies - using different hostnames with different paths on each hostname. This gives you maximum routing flexibility for complex applications."

---

## Slide 7: Ingress Resource Structure (7:45-9:15)
**Duration:** 90 seconds

**Visual:** Annotated YAML showing key Ingress resource fields

**Narration:**
"Let's look at the structure of an Ingress resource. At the top, you specify the API version 'networking.k8s.io/v1' and kind 'Ingress'. These resources are namespaced, so you typically deploy them alongside your application in the same namespace.

The spec section contains the routing rules. First, you can optionally specify an IngressClassName to choose which controller should handle this Ingress. This is important in clusters with multiple controllers installed.

The rules section is a list of routing rules. Each rule can specify a host for host-based routing. If you omit the host, it becomes a default catch-all rule.

Under each rule, the http section contains paths. Each path defines three key things: the path itself like '/api', the pathType which is usually Prefix or Exact, and the backend which specifies which service should receive the traffic.

The backend section references a service by name and port. You can reference the port by number like 8080, or by name like 'http' if your service has named ports. Using named ports is actually preferable because it makes your Ingress resources more maintainable.

You can also specify a TLS section at the spec level to configure HTTPS, which we'll explore in more detail during the practical exercises."

---

## Slide 8: How Ingress Controllers Work (9:15-10:30)
**Duration:** 75 seconds

**Visual:** Flow diagram showing request path through Ingress Controller to Pods

**Narration:**
"Let's understand what happens when a request hits your cluster. The Ingress Controller receives the incoming HTTP or HTTPS request, typically on ports 80 or 443.

The controller examines the request's Host header and URL path, then matches these against all Ingress resources in the cluster. When it finds a matching rule, it determines which service should handle the request.

Here's a crucial point: the Ingress Controller doesn't forward the request to the service itself. Instead, it queries the Kubernetes API to get the list of endpoints backing that service - the actual Pod IP addresses. Then it forwards the request directly to one of those Pods, performing its own load balancing.

This direct-to-Pod routing is efficient because it avoids an extra network hop through the service. However, it means the Ingress Controller must have cluster-wide permissions to read service endpoints, which is why you'll see RBAC rules in the controller's deployment manifests.

The controller continuously watches the Kubernetes API for changes to Ingress resources, services, and endpoints, dynamically updating its routing configuration without restarts."

---

## Slide 9: Controller-Specific Features with Annotations (10:30-11:30)
**Duration:** 60 seconds

**Visual:** Example YAML showing common Nginx annotations

**Narration:**
"The Ingress API provides a standard set of routing capabilities, but each controller offers additional features through annotations. These are metadata fields that the controller reads to enable advanced functionality.

For the Nginx Ingress Controller, common annotations include response caching to improve performance, rewrite-target to modify request paths before forwarding them to the backend, SSL redirect to automatically redirect HTTP requests to HTTPS, rate limiting to prevent abuse, and CORS configuration for cross-origin requests.

These annotations are controller-specific. If you switch from Nginx to Traefik, you'll need to update your annotations to use Traefik's syntax. However, the basic routing rules in the spec section remain the same.

In the CKAD exam, you might need to use annotations for tasks like enabling HTTPS redirects or configuring rewrite rules. The exam environment typically includes documentation, so you can look up the specific annotation syntax during the test."

---

## Slide 10: Default Backends (11:30-12:00)
**Duration:** 30 seconds

**Visual:** Diagram showing traffic flow to default backend when no rules match

**Narration:**
"Finally, let's discuss default backends. When a request doesn't match any Ingress rules, the controller can forward it to a default backend service instead of returning a 404 error.

Most controllers have a built-in default backend that returns a generic 404 page. However, you can override this by specifying a defaultBackend section in your Ingress resource, pointing to your own service that provides a custom error page or landing page.

This is useful for branding purposes or to provide helpful navigation when users reach an invalid URL."

---

## Slide 11: Summary and Key Takeaways (12:00-12:30)
**Duration:** 30 seconds

**Visual:** Bullet-pointed summary slide

**Narration:**
"To summarize, Ingress provides HTTP and HTTPS routing for your Kubernetes applications through two components: the Ingress Controller, which is the actual proxy, and Ingress Resources, which define routing rules.

You can route traffic based on hostnames, URL paths, or a combination of both. Use annotations for controller-specific features. And remember that Ingress resources and services must be in the same namespace.

In our next session, we'll put this knowledge into practice with hands-on exercises deploying real applications with Ingress routing. Thank you for watching."

---

**End of Script**
