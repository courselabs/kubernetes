# Ingress - Quickfire Questions

Test your knowledge of Kubernetes Ingress with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary purpose of an Ingress in Kubernetes?

A) To create internal cluster networking
B) To expose HTTP and HTTPS routes from outside the cluster to Services
C) To replace Services entirely
D) To provide load balancing between Pods

### 2. What must be installed in a cluster for Ingress resources to work?

A) LoadBalancer Service
B) Ingress Controller
C) API Gateway
D) DNS Server

### 3. Which field in an Ingress spec defines path-based routing rules?

A) routes
B) paths
C) rules
D) backends

### 4. How do you configure host-based routing in an Ingress?

A) Using multiple Ingress resources
B) Using the `host` field in the rules section
C) Using annotations
D) Using multiple Services

### 5. What is the default Ingress class in Kubernetes?

A) nginx
B) traefik
C) There is no default; it must be specified or configured
D) default

### 6. How do you enable TLS/SSL termination in an Ingress?

A) Configure TLS in the Service
B) Add a `tls` section with secretName in the Ingress spec
C) Use a LoadBalancer Service
D) TLS is enabled by default

### 7. What type of Secret is used for TLS certificates in Ingress?

A) Opaque
B) kubernetes.io/tls
C) kubernetes.io/dockerconfigjson
D) certificate

### 8. Which path type performs exact matching of the URL path?

A) Prefix
B) Exact
C) ImplementationSpecific
D) Match

### 9. How can you route traffic to different Services based on URL paths?

A) Create multiple Ingress resources
B) Use multiple `paths` entries under a rule with different backends
C) Use multiple Services with the same selector
D) It's not possible; use separate hosts instead

### 10. What annotation is commonly used to configure URL rewriting in Nginx Ingress?

A) nginx.ingress.kubernetes.io/rewrite-target
B) ingress.kubernetes.io/url-rewrite
C) kubernetes.io/rewrite-path
D) nginx.io/path-rewrite

---

## Answers

1. **B** - Ingress exposes HTTP and HTTPS routes from outside the cluster to Services within the cluster. It provides URL-based routing, SSL termination, and name-based virtual hosting.

2. **B** - An Ingress Controller must be installed for Ingress resources to function. Popular controllers include Nginx, Traefik, HAProxy, and cloud-provider-specific controllers.

3. **C** - The `rules` field defines routing rules, including hosts, paths, and backend Services. Each rule can have multiple paths pointing to different backends.

4. **B** - Use the `host` field in the rules section to route traffic based on the HTTP Host header (e.g., app.example.com, api.example.com).

5. **C** - There is no default Ingress class. You must either specify `ingressClassName` in the Ingress spec or configure a default IngressClass in the cluster.

6. **B** - Add a `tls` section in the Ingress spec with `hosts` and `secretName` referencing a kubernetes.io/tls Secret containing the certificate and key.

7. **B** - TLS certificates for Ingress are stored in Secrets of type `kubernetes.io/tls`, created with `kubectl create secret tls`.

8. **B** - The `Exact` pathType matches the URL path exactly. `Prefix` matches based on URL path prefix, and `ImplementationSpecific` depends on the Ingress controller.

9. **B** - Define multiple paths under a rule, each with a different path value and backend Service. For example, `/api` to api-service and `/web` to web-service.

10. **A** - The `nginx.ingress.kubernetes.io/rewrite-target` annotation is used to rewrite URLs before forwarding to the backend Service (e.g., `/app` → `/`).

---

## Study Resources

- [Lab README](README.md) - Core Ingress concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Ingress topics
- [Official Ingress Documentation](https://kubernetes.io/docs/concepts/services-networking/ingress/)
