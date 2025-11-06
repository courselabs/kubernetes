# Ingress - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening (1 min)

Welcome to this deep dive on Kubernetes Ingress, one of the most practical and frequently-tested topics for CKAD certification. Ingress is how you expose HTTP and HTTPS applications to the outside world in production Kubernetes clusters, and understanding it thoroughly is essential for both the exam and real-world operations.

Without Ingress, you'd need to use NodePort services with non-standard port numbers, creating a poor user experience, or provision separate LoadBalancer services for each application, which becomes expensive quickly with cloud providers. Imagine running ten applications - that's ten load balancers, ten public IP addresses, and ten times the cost. Ingress solves this elegantly by providing a single entry point that routes traffic to multiple services based on hostnames and URL paths.

In this session, we'll explore what Ingress is, how it works, the two main routing strategies you'll use, how to configure TLS for HTTPS, and most importantly - the practical skills and troubleshooting techniques you need for the CKAD exam. This is supplementary material for CKAD, but it appears frequently enough that you should be well-prepared.

---

## Understanding Ingress Architecture (2 min)

Ingress has a two-part architecture that's important to understand. First, you have the Ingress Controller, which is the actual reverse proxy handling incoming traffic. This is typically a deployment running nginx, Traefik, HAProxy, or another HTTP proxy software. The controller watches the Kubernetes API for Ingress resources and dynamically reconfigures itself when routing rules change.

Second, you have Ingress Resources, which are Kubernetes objects defining routing rules. These are YAML manifests in the networking.k8s.io API group. You might have one Ingress resource per application, all sharing the same controller. This separation of concerns is elegant - the controller is infrastructure, deployed once by platform teams. The Ingress resources are application configuration, managed by development teams alongside their deployments and services.

The controller is exposed to external traffic through a LoadBalancer or NodePort service. All HTTP requests hit this single entry point. The controller examines each request's hostname and URL path, matches them against all Ingress resources in the cluster, determines which service should handle the request, and forwards it accordingly.

Here's a crucial detail that many people miss: the Ingress Controller doesn't forward requests to services. It queries the Kubernetes API to get the endpoints backing each service - the actual Pod IP addresses - and forwards requests directly to those Pods. This direct-to-Pod routing is more efficient because it avoids the extra network hop through the service. However, it means the controller needs cluster-wide permissions to read service endpoints, which is why you'll see RBAC rules in controller deployment manifests.

The controller continuously watches for changes to Ingress resources, services, and endpoints, updating its routing configuration dynamically without restarts. This makes Ingress perfect for dynamic environments where applications are constantly being deployed and updated.

---

## Host-Based Routing (2 min)

Let's explore the first major routing strategy: host-based routing, sometimes called virtual hosting. This is where the Ingress Controller examines the HTTP Host header in each request and routes based on the hostname.

Imagine you have three applications: a public website, a REST API, and an admin portal. With host-based routing, you assign each a subdomain. Requests to www.example.com go to the frontend service. Requests to api.example.com route to the API service. And requests to admin.example.com route to the admin portal.

This pattern is clean and intuitive. Each application gets its own subdomain, making bookmarking and sharing easy. It also allows using different TLS certificates for different hostnames if needed for compliance or organizational reasons.

In your Ingress resource YAML, host-based routing is specified in the rules section. Each rule contains a host field like "api.example.com" and then defines which service receives traffic for that hostname. You can have multiple rules in one Ingress resource, or split them across multiple Ingress resources - the controller merges all the rules regardless of how you organize them.

Some controllers support wildcard hostnames like "star dot example dot com" to catch all subdomains, though this isn't universal across all controller implementations. The most portable approach is explicitly listing each hostname you want to support.

One important consideration: you need DNS records pointing these hostnames to your Ingress Controller's external IP address. In production, these are real DNS entries. In development environments, you often use the hosts file on your local machine to map hostnames to localhost or your cluster's IP address.

Host-based routing is the most common pattern for production deployments, especially in multi-tenant environments or when you want clear separation between different applications.

---

## Path-Based Routing (2 min)

The second routing strategy is path-based routing, where the URL path determines which service receives the request, all under the same hostname.

Using our previous example, with path-based routing everything uses the same domain myapp.example.com. Requests to myapp.example.com/frontend go to the frontend service. Requests to myapp.example.com/api route to the API service. And myapp.example.com/admin goes to the admin portal.

This approach is useful when you want a unified domain for your entire application platform, or when you're constrained on the number of hostnames you can use. It's also common in microservices architectures where you want all services behind a single API gateway hostname.

Path-based routing has two important path matching types. The Prefix type matches the beginning of the path. If you specify path "/api", it matches "/api", "/api/users", "/api/v2/orders", and any other path starting with "/api". This is the most common and flexible option.

The Exact type requires an exact match. If you specify path "/health", it matches only "/health" and nothing else - not "/health/check" or "/healthz". Use Exact for specific endpoints where you need precise control, like health checks or webhooks.

Understanding path precedence is crucial, especially for the exam. When multiple paths could match a request, Exact matches always win over Prefix matches. Among Prefix matches, longer paths take priority over shorter ones. For example, if you have both "/api" and "/api/v2" as Prefix paths, a request to "/api/v2/users" matches the more specific "/api/v2" rule.

You can also combine host-based and path-based routing. Different hostnames, each with different paths. This gives maximum routing flexibility for complex applications with many services.

---

## Controller-Specific Features and Annotations (2 min)

The Ingress API provides standard routing capabilities, but each controller offers additional features through annotations. These are metadata fields in your Ingress resource that the controller reads to enable advanced functionality.

For the Nginx Ingress Controller, which you'll most commonly encounter in the CKAD exam, useful annotations include response caching to improve performance and reduce backend load, rewrite-target to modify URL paths before forwarding to the backend, SSL redirect to automatically redirect HTTP requests to HTTPS, rate limiting to prevent abuse, CORS configuration for cross-origin requests, and various timeout settings.

These annotations are controller-specific. The same annotation won't work across different controllers. If you switch from Nginx to Traefik, you'll need to update your annotations to use Traefik's syntax. However, the basic routing rules in the spec section remain portable.

Let's talk about a practical example. Suppose your backend service expects requests at the root path "/", but you want to expose it under "/api" in your Ingress. You use the nginx.ingress.kubernetes.io/rewrite-target annotation to rewrite "/api/users" to "/users" before forwarding to the backend. This keeps your service implementation clean while providing flexible external URLs.

Another common pattern is enabling response caching. Add the nginx.ingress.kubernetes.io/proxy-cache-valid annotation to cache successful responses for a specified time. This dramatically improves performance for CPU-intensive applications like image processing or report generation. The controller caches responses and serves them directly for subsequent requests, avoiding backend load.

In the CKAD exam, you might need to use annotations for tasks like enabling HTTPS redirects or configuring rewrite rules. The exam environment typically includes documentation, so you can look up specific annotation syntax when needed. Focus on understanding what annotations do rather than memorizing exact syntax.

---

## TLS and HTTPS Configuration (3 min)

HTTPS support is a common exam requirement and essential for production deployments. The process involves two steps: creating a TLS secret with your certificate and private key, then referencing that secret in your Ingress resource.

Let's walk through this process. First, you need TLS certificates. For the exam or development, you'll create self-signed certificates using openssl. The command generates a certificate and private key that you'll use for testing. For production, you'd obtain certificates from a proper certificate authority like Let's Encrypt.

Once you have certificates, create a Kubernetes secret of type kubernetes.io/tls. The kubectl create secret tls command makes this easy. You provide the certificate file with --cert and the private key with --key. The secret must contain two specific keys: tls.crt for the certificate and tls.key for the private key. These names are required - the Ingress Controller looks for exactly these keys.

In your Ingress resource, add a TLS section in the spec, before the rules section. Each TLS entry specifies which hosts the certificate covers and which secret contains the certificate data. The hosts listed in the TLS section should match the hosts in your routing rules. You can have multiple TLS entries if you need different certificates for different hostnames.

A common pattern is automatic HTTP to HTTPS redirection. You don't want users accidentally accessing your application over unencrypted HTTP. Add an annotation to your Ingress - for Nginx, it's nginx.ingress.kubernetes.io/ssl-redirect set to "true". Now any HTTP request automatically receives a redirect response to the HTTPS version of the URL.

Testing HTTPS locally requires accepting self-signed certificates. When using curl, add the -k flag to skip certificate validation. Browsers will show a security warning that you can bypass in development. For production, always use proper certificates from a trusted certificate authority.

One important detail for troubleshooting: if TLS isn't working, verify the secret exists in the same namespace as your Ingress resource. Secrets are namespace-scoped and cannot be referenced across namespaces. Use kubectl describe secret to verify it has the tls.crt and tls.key keys. Check the Ingress Controller logs if the certificate isn't being loaded - they'll show specific errors about missing or invalid certificates.

---

## Troubleshooting Ingress Issues (3 min)

Let's walk through systematic troubleshooting for Ingress problems, which is critical for the CKAD exam.

The most common issue is services not being found. When you create an Ingress that references a service that doesn't exist or is in the wrong namespace, the controller can't route traffic. First, verify your Ingress exists with kubectl get ingress. Second, describe the Ingress and check for events or warnings - you might see messages about services not found. Third, verify the service exists in the same namespace with kubectl get svc. Remember, Ingress resources can only reference services in the same namespace.

Path type issues cause subtle problems. If you use Prefix when you meant Exact, too many requests get routed to your service. If an exam question says "exactly /api" or "only /api", you need pathType Exact. The symptom is unexpected traffic reaching services that shouldn't receive it. The fix is changing pathType to Exact and reapplying.

Another frequent issue is no endpoints. The Ingress and Service exist, but there are no Pods backing the service, causing 502 or 503 errors when you try to access the application. Check the service endpoints with kubectl get endpoints. If the list is empty or shows none, there are no Pods matching the service selector. Verify pods exist with the correct labels using kubectl get pods with a label selector. Create or fix the deployment to match the service selector.

IngressClass configuration matters in clusters with multiple controllers. If you don't specify an ingressClassName in your Ingress spec, it uses the default IngressClass. Check available classes with kubectl get ingressclass. If your Ingress isn't being processed, you might need to explicitly set the ingressClassName field to match your controller.

Cross-namespace complexity arises when you have applications spread across multiple namespaces. Remember that Ingress resources cannot reference services in other namespaces. The solution is creating separate Ingress resources in each namespace. You can use the same hostname across multiple Ingress resources - the controller merges the rules. For example, an Ingress in the frontend namespace handles paths "/web" and "/app", while an Ingress in the backend namespace handles path "/api", all for the same hostname.

For CKAD exam troubleshooting, follow this workflow: First, describe the Ingress and check for events. Second, verify the service exists in the same namespace. Third, check the service has endpoints. Fourth, test the service directly with port-forward to isolate Ingress issues. Fifth, if still stuck, check the Ingress Controller logs for specific errors. This systematic approach quickly identifies problems.

---

## CKAD Exam Strategy for Ingress (3 min)

Let's focus on practical strategies for handling Ingress questions in the CKAD exam efficiently.

The kubectl create ingress command is your best friend for speed. The syntax is kubectl create ingress name --rule="host/path*=service:port". The asterisk indicates Prefix matching. For example, kubectl create ingress api --rule="api.example.com/api*=api-service:8080" creates a complete Ingress resource for host-based routing with a path prefix. For multiple rules, chain multiple --rule flags. This is dramatically faster than writing YAML from scratch.

For more complex scenarios, use the --dry-run=client -o yaml pattern to generate a template, then edit it. Generate the basic structure with kubectl create ingress, output to YAML, save to a file, then edit to add TLS configuration, annotations, or additional customization. This hybrid approach is often fastest for exam questions requiring specific features.

Time management is critical. Simple Ingress creation should take two to three minutes. TLS configuration adds another two minutes. Troubleshooting should take three to four minutes. Complex multi-service routing might take five to seven minutes. Don't spend more than eight minutes on any single Ingress question.

Common exam patterns include creating an Ingress for a deployment with specific routing, adding HTTPS to an existing Ingress, troubleshooting why an Ingress returns 404 errors, and combining multiple services under one hostname with different paths. Practice these until you can complete them quickly.

Error patterns you'll encounter: 404 errors usually mean your routing rules don't match the requested URL, or the service name is wrong. 502 or 503 errors mean no backends are available - check your service endpoints. 500 errors typically indicate backend application problems - check pod logs, not Ingress configuration.

Remember that path matching is case-sensitive and spaces matter. The path "/api" is different from "/Api" or "/ api". Double-check your paths carefully.

For speed, memorize the structure of common annotations you might need. The SSL redirect annotation, the rewrite-target annotation for path manipulation, and the CORS enable annotation. You can look up exact syntax in documentation, but knowing what you're looking for saves time.

Finally, verify immediately after creating an Ingress. Don't assume it worked - check with kubectl get ingress, describe to see any warnings, and test with curl if possible. Catching errors early prevents wasting time later.

---

## Summary and Key Takeaways (1 min)

Let's recap the essential Ingress concepts for CKAD success.

Ingress provides HTTP and HTTPS routing through two components: Ingress Controllers that run as deployments and process traffic, and Ingress Resources that define routing rules. Host-based routing routes by hostname, perfect for multiple applications with distinct domains. Path-based routing routes by URL path, ideal for microservices under a unified domain. You can combine both strategies for maximum flexibility.

Path types matter: Prefix matches paths starting with your specified value, while Exact requires precise matching. Longer and more specific paths take priority over shorter ones. TLS configuration requires creating a kubernetes.io/tls secret and referencing it in the Ingress TLS section. Annotations enable controller-specific features like caching, rewrites, and redirects.

For CKAD exam success: Use kubectl create ingress to generate Ingress resources quickly. Understand path types and precedence rules. Know how to add TLS configuration. Remember that Ingress resources must be in the same namespace as their services. Troubleshoot systematically by checking the Ingress, verifying services, checking endpoints, and testing services directly.

Practice the common patterns until they're automatic: creating simple Ingress resources, adding TLS configuration, troubleshooting 404 and 502 errors, and combining multiple services with different routing rules.

Ingress is how production Kubernetes exposes applications to users. Master these concepts and you'll be well-prepared for both the CKAD exam and real-world Kubernetes operations.

Thank you for listening, and good luck with your Ingress journey and CKAD preparation.
