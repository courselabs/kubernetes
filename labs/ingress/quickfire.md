# Ingress - Quickfire Questions

Test your knowledge of Kubernetes Ingress with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary purpose of an Ingress in Kubernetes?

A) To provide load balancing between Pods
B) To replace Services entirely
C) To create internal cluster networking
D) To expose HTTP and HTTPS routes from outside the cluster to Services

### 2. What must be installed in a cluster for Ingress resources to work?

A) Ingress Controller
B) API Gateway
C) LoadBalancer Service
D) DNS Server

### 3. Which field in an Ingress spec defines path-based routing rules?

A) paths
B) routes
C) backends
D) rules

### 4. How do you configure host-based routing in an Ingress?

A) Using the `host` field in the rules section
B) Using multiple Services
C) Using multiple Ingress resources
D) Using annotations

### 5. What is the default Ingress class in Kubernetes?

A) nginx
B) default
C) There is no default; it must be specified or configured
D) traefik

### 6. How do you enable TLS/SSL termination in an Ingress?

A) TLS is enabled by default
B) Add a `tls` section with secretName in the Ingress spec
C) Configure TLS in the Service
D) Use a LoadBalancer Service

### 7. What type of Secret is used for TLS certificates in Ingress?

A) kubernetes.io/dockerconfigjson
B) kubernetes.io/tls
C) certificate
D) Opaque

### 8. Which path type performs exact matching of the URL path?

A) Match
B) Prefix
C) ImplementationSpecific
D) Exact

### 9. How can you route traffic to different Services based on URL paths?

A) Use multiple Services with the same selector
B) It's not possible; use separate hosts instead
C) Use multiple `paths` entries under a rule with different backends
D) Create multiple Ingress resources

### 10. What annotation is commonly used to configure URL rewriting in Nginx Ingress?

A) nginx.ingress.kubernetes.io/rewrite-target
B) nginx.io/path-rewrite
C) kubernetes.io/rewrite-path
D) ingress.kubernetes.io/url-rewrite

---

## Answers

1. **D** - Ingress exposes HTTP and HTTPS routes from outside the cluster to Services within the cluster. It provides URL-based routing, SSL termination, and name-based virtual hosting.

2. **A** - An Ingress Controller must be installed for Ingress resources to function. Popular controllers include Nginx, Traefik, HAProxy, and cloud-provider-specific controllers.

3. **D** - The `rules` field defines routing rules, including hosts, paths, and backend Services. Each rule can have multiple paths pointing to different backends.

4. **A** - Use the `host` field in the rules section to route traffic based on the HTTP Host header (e.g., app.example.com, api.example.com).

5. **C** - There is no default Ingress class. You must either specify `ingressClassName` in the Ingress spec or configure a default IngressClass in the cluster.

6. **B** - Add a `tls` section in the Ingress spec with `hosts` and `secretName` referencing a kubernetes.io/tls Secret containing the certificate and key.

7. **B** - TLS certificates for Ingress are stored in Secrets of type `kubernetes.io/tls`, created with `kubectl create secret tls`.

8. **D** - The `Exact` pathType matches the URL path exactly. `Prefix` matches based on URL path prefix, and `ImplementationSpecific` depends on the Ingress controller.

9. **C** - Define multiple paths under a rule, each with a different path value and backend Service. For example, `/api` to api-service and `/web` to web-service.

10. **A** - The `nginx.ingress.kubernetes.io/rewrite-target` annotation is used to rewrite URLs before forwarding to the backend Service (e.g., `/app` → `/`).

---

## Study Resources

- [Lab README](README.md) - Core Ingress concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Ingress topics
- [Official Ingress Documentation](https://kubernetes.io/docs/concepts/services-networking/ingress/)
