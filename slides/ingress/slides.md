---
layout: cover
---

# Kubernetes Ingress

<div class="abs-br m-6 flex gap-2">
  <carbon-network-3 class="text-6xl text-blue-400" />
</div>

<div v-click class="mt-8 text-xl opacity-80">
HTTP/HTTPS routing to services in your cluster
</div>

---
layout: center
---

# The Problem Without Ingress

<div v-click="1">

```mermaid
graph TB
    A[App 1] --> NP1[NodePort :30001]
    B[App 2] --> NP2[NodePort :30002]
    C[App 3] --> NP3[NodePort :30003]
    NP1 --> X1[<carbon-warning/> Non-standard ports]
    NP2 --> X2[<carbon-warning/> Firewall complexity]
    NP3 --> X3[<carbon-warning/> Poor UX]
    style NP1 fill:#fbbf24
    style NP2 fill:#fbbf24
    style NP3 fill:#fbbf24
    style X1 fill:#ef4444
    style X2 fill:#ef4444
    style X3 fill:#ef4444
```

</div>

<div v-click="2" class="mt-8">

```mermaid
graph TB
    A[App 1] --> LB1[LoadBalancer<br/>34.1.2.3]
    B[App 2] --> LB2[LoadBalancer<br/>34.1.2.4]
    C[App 3] --> LB3[LoadBalancer<br/>34.1.2.5]
    LB1 --> X[<carbon-warning/> Expensive!]
    LB2 --> X
    LB3 --> X
    style LB1 fill:#60a5fa
    style LB2 fill:#60a5fa
    style LB3 fill:#60a5fa
    style X fill:#ef4444
```

</div>

<div v-click="3" class="mt-6 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> 10 apps = 10 load balancers!
</div>

---
layout: center
---

# What is Ingress?

<div v-click="1">

```mermaid
graph TB
    I[Ingress<br/>Single Entry Point] --> S1[Service: frontend]
    I --> S2[Service: api]
    I --> S3[Service: admin]
    S1 --> P1[Pods]
    S2 --> P2[Pods]
    S3 --> P3[Pods]
    style I fill:#60a5fa
    style S1 fill:#4ade80
    style S2 fill:#4ade80
    style S3 fill:#4ade80
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="2">
<carbon-gateway class="text-5xl text-blue-400 mb-2" />
<strong>Smart Reverse Proxy</strong><br/>
<span class="text-sm opacity-80">Routes HTTP/HTTPS traffic</span>
</div>
<div v-click="3">
<carbon-money class="text-5xl text-green-400 mb-2" />
<strong>Cost Effective</strong><br/>
<span class="text-sm opacity-80">One LoadBalancer for all apps</span>
</div>
</div>

---
layout: center
---

# Ingress Architecture

<div v-click="1">

```mermaid
graph LR
    IC[Ingress Controller<br/>Nginx/Traefik] --> IR1[Ingress Resource<br/>app1-rules]
    IC --> IR2[Ingress Resource<br/>app2-rules]
    IC --> IR3[Ingress Resource<br/>app3-rules]
    IR1 --> S1[Service]
    IR2 --> S2[Service]
    IR3 --> S3[Service]
    style IC fill:#60a5fa
    style IR1 fill:#4ade80
    style IR2 fill:#4ade80
    style IR3 fill:#4ade80
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="2">
<carbon-container-software class="text-4xl text-blue-400 mb-2" />
<strong>Ingress Controller</strong><br/>
<span class="text-sm opacity-80">Actual reverse proxy (Deployment)</span>
</div>
<div v-click="3">
<carbon-rule class="text-4xl text-green-400 mb-2" />
<strong>Ingress Resources</strong><br/>
<span class="text-sm opacity-80">Routing rules (YAML manifests)</span>
</div>
</div>

<div v-click="4" class="mt-6 text-center text-yellow-400">
<carbon-checkmark class="inline-block text-2xl" /> Controller watches API, updates config dynamically
</div>

---
layout: center
---

# Ingress Controller Options

<div v-click="1">

```mermaid
mindmap
  root((Ingress<br/>Controllers))
    Nginx
      Most popular
      Community maintained
      Rich features
    Traefik
      Auto configuration
      Let's Encrypt
      Dynamic environments
    Contour
      CNCF project
      Envoy Proxy
      Service mesh
    HAProxy
      High performance
      Enterprise support
    Cloud Native
      AWS ALB
      GCP GCLB
      Azure AppGW
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
<carbon-kubernetes class="inline-block text-3xl text-blue-400" /> For CKAD: Focus on <strong>Nginx</strong>
</div>

---
layout: center
---

# Host-Based Routing

<div v-click="1">

```mermaid
graph TB
    I[Ingress Controller<br/>:80/:443] --> H1{Host Header?}
    H1 -->|app1.example.com| S1[frontend-service]
    H1 -->|api.example.com| S2[api-service]
    H1 -->|admin.example.com| S3[admin-service]
    S1 --> P1[Pods]
    S2 --> P2[Pods]
    S3 --> P3[Pods]
    style I fill:#60a5fa
    style H1 fill:#fbbf24
    style S1 fill:#4ade80
    style S2 fill:#4ade80
    style S3 fill:#4ade80
```

</div>

<div v-click="2" class="mt-8 text-center text-xl">
<carbon-tag class="inline-block text-3xl text-purple-400" /> Different hostname → Different service
</div>

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
<div v-click="3">
<carbon-checkmark class="text-3xl text-green-400 mb-1" />
Clean separation, bookmarkable
</div>
<div v-click="4">
<carbon-certificate class="text-3xl text-blue-400 mb-1" />
Different TLS certs per host
</div>
</div>

---
layout: center
---

# Path-Based Routing

<div v-click="1">

```mermaid
graph TB
    I[Ingress Controller<br/>myapp.example.com] --> P1{Path?}
    P1 -->|/frontend| S1[frontend-service]
    P1 -->|/api| S2[api-service]
    P1 -->|/admin| S3[admin-service]
    S1 --> P1P[Pods]
    S2 --> P2P[Pods]
    S3 --> P3P[Pods]
    style I fill:#60a5fa
    style P1 fill:#fbbf24
    style S1 fill:#4ade80
    style S2 fill:#4ade80
    style S3 fill:#4ade80
```

</div>

<div v-click="2" class="mt-8 text-center text-xl">
<carbon-network-3 class="inline-block text-3xl text-blue-400" /> Same hostname, different path → Different service
</div>

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
<div v-click="3">
<carbon-rule class="text-3xl text-purple-400 mb-1" />
<strong>Prefix:</strong> /api matches /api/users
</div>
<div v-click="4">
<carbon-checkmark class="text-3xl text-green-400 mb-1" />
<strong>Exact:</strong> /health matches only /health
</div>
</div>

---
layout: center
---

# Ingress Resource Structure

<div v-click="1" class="mb-4">

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
```

</div>

<div class="grid grid-cols-2 gap-4 text-xs">
<div v-click="2">
<carbon-tag class="inline-block text-2xl text-blue-400" /> <strong>ingressClassName:</strong> Which controller
</div>
<div v-click="3">
<carbon-network-3 class="inline-block text-2xl text-green-400" /> <strong>host:</strong> Hostname (optional)
</div>
<div v-click="4">
<carbon-rule class="inline-block text-2xl text-purple-400" /> <strong>path:</strong> URL path
</div>
<div v-click="5">
<carbon-flow class="inline-block text-2xl text-yellow-400" /> <strong>pathType:</strong> Prefix or Exact
</div>
<div v-click="6">
<carbon-container-software class="inline-block text-2xl text-red-400" /> <strong>backend:</strong> Target service
</div>
<div v-click="7">
<carbon-network-1 class="inline-block text-2xl text-teal-400" /> <strong>port:</strong> Service port
</div>
</div>

---
layout: center
---

# How Ingress Controllers Work

<div v-click="1">

```mermaid
sequenceDiagram
    participant C as Client
    participant I as Ingress Controller
    participant A as Kubernetes API
    participant P as Pod
    C->>I: HTTP Request
    I->>I: Match host + path
    I->>A: Query endpoints
    A->>I: Pod IPs
    I->>P: Forward directly to Pod
    P->>I: Response
    I->>C: Response
```

</div>

<div v-click="2" class="mt-8 text-center">
<carbon-lightning class="inline-block text-3xl text-blue-400" /> <strong>Direct-to-Pod routing</strong>
</div>

<div v-click="3" class="mt-4 text-center text-sm opacity-80">
Bypasses service for efficiency
</div>

<div v-click="4" class="mt-6 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> Controller needs RBAC to read endpoints
</div>

---
layout: center
---

# Controller-Specific Features

<div v-click="1" class="mb-4">

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "10"
```

</div>

<div class="grid grid-cols-2 gap-4 text-sm">
<div v-click="2">
<carbon-cache class="text-3xl text-blue-400 mb-1" />
<strong>Caching</strong><br/>
Response caching
</div>
<div v-click="3">
<carbon-edit class="text-3xl text-green-400 mb-1" />
<strong>Rewrite</strong><br/>
Path modification
</div>
<div v-click="4">
<carbon-locked class="text-3xl text-purple-400 mb-1" />
<strong>SSL Redirect</strong><br/>
HTTP → HTTPS
</div>
<div v-click="5">
<carbon-dashboard class="text-3xl text-yellow-400 mb-1" />
<strong>Rate Limiting</strong><br/>
Prevent abuse
</div>
</div>

<div v-click="6" class="mt-8 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> Annotations are controller-specific!
</div>

---
layout: center
---

# TLS/HTTPS Configuration

<div v-click="1" class="mb-4">

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls-secret
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
```

</div>

<div v-click="2">

```mermaid
graph LR
    T[TLS Secret] --> C[Certificate]
    T --> K[Private Key]
    T --> I[Ingress]
    I --> S[HTTPS :443]
    style T fill:#60a5fa
    style I fill:#4ade80
    style S fill:#a78bfa
```

</div>

---
layout: center
---

# Default Backend

<div v-click="1">

```mermaid
graph TB
    R[Request] --> M{Match<br/>any rule?}
    M -->|Yes| S[Service]
    M -->|No| D[Default Backend]
    D --> C[Custom 404 Page]
    style R fill:#60a5fa
    style M fill:#fbbf24
    style S fill:#4ade80
    style D fill:#ef4444
    style C fill:#a78bfa
```

</div>

<div v-click="2" class="mt-8">

```yaml
spec:
  defaultBackend:
    service:
      name: default-http-backend
      port:
        number: 80
```

</div>

<div v-click="3" class="mt-6 text-center">
<carbon-view class="inline-block text-3xl text-purple-400" /> Custom 404 or landing page
</div>

---
layout: center
---

# Multiple Rules Example

<div v-click="1" class="text-xs">

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: app1.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app1-service
            port:
              number: 80
  - host: app2.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: app2-api
            port:
              number: 8080
      - path: /web
        pathType: Prefix
        backend:
          service:
            name: app2-web
            port:
              number: 80
```

</div>

<div v-click="2" class="mt-4 text-center text-sm">
<carbon-flow class="inline-block text-2xl text-blue-400" /> Combine host + path routing
</div>

---
layout: center
---

# Common Patterns

<div class="grid grid-cols-2 gap-6 mt-4">
<div v-click="1">
<carbon-application class="text-4xl text-blue-400 mb-2" />
<strong>Single App</strong><br/>
<span class="text-sm opacity-80">One host, one service<br/>app.example.com → app-service</span>
</div>
<div v-click="2">
<carbon-apps class="text-4xl text-green-400 mb-2" />
<strong>Multi-App</strong><br/>
<span class="text-sm opacity-80">Multiple hosts<br/>app1.com, app2.com, app3.com</span>
</div>
<div v-click="3">
<carbon-flow class="text-4xl text-purple-400 mb-2" />
<strong>Microservices</strong><br/>
<span class="text-sm opacity-80">Path-based routing<br/>/api, /web, /admin</span>
</div>
<div v-click="4">
<carbon-version class="text-4xl text-yellow-400 mb-2" />
<strong>A/B Testing</strong><br/>
<span class="text-sm opacity-80">Traffic splitting<br/>v1 vs v2 with annotations</span>
</div>
</div>

---
layout: center
---

# Troubleshooting

<div v-click="1">

```mermaid
graph TD
    I[Ingress Not Working] --> C1[Check Controller Running]
    C1 --> C2[Check Ingress Resource]
    C2 --> C3[Check Service Exists]
    C3 --> C4[Check Endpoints]
    C4 --> C5[Check DNS]
    style I fill:#ef4444
    style C1 fill:#fbbf24
    style C2 fill:#fbbf24
    style C3 fill:#fbbf24
    style C4 fill:#fbbf24
    style C5 fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div v-click="2">
<carbon-terminal class="inline-block text-2xl text-blue-400" /> kubectl describe ingress
</div>
<div v-click="3">
<carbon-view class="inline-block text-2xl text-green-400" /> kubectl get endpoints
</div>
<div v-click="4">
<carbon-debug class="inline-block text-2xl text-purple-400" /> Check controller logs
</div>
<div v-click="5">
<carbon-rule class="inline-block text-2xl text-yellow-400" /> Verify pathType matches
</div>
</div>

---
layout: center
---

# Summary

<div v-click="1">

```mermaid
mindmap
  root((Ingress))
    Architecture
      Controller deployment
      Resource rules
      Single entry point
    Routing
      Host-based
      Path-based
      Combine both
    Controllers
      Nginx popular
      Traefik dynamic
      Cloud native
    Features
      TLS/HTTPS
      Annotations
      Default backend
    Same Namespace
      Ingress + Service
      Must match
```

</div>

---
layout: center
---

# CKAD Exam Focus

<div v-click="1" class="text-center mb-6">
<carbon-certificate class="inline-block text-6xl text-blue-400" />
</div>

<div class="grid grid-cols-2 gap-4 text-sm">
<div v-click="2">
<carbon-edit class="inline-block text-2xl text-green-400" /> Create Ingress resources
</div>
<div v-click="3">
<carbon-network-3 class="inline-block text-2xl text-green-400" /> Host-based routing
</div>
<div v-click="4">
<carbon-rule class="inline-block text-2xl text-green-400" /> Path-based routing
</div>
<div v-click="5">
<carbon-locked class="inline-block text-2xl text-green-400" /> Configure TLS
</div>
<div v-click="6">
<carbon-settings class="inline-block text-2xl text-green-400" /> Use annotations
</div>
<div v-click="7">
<carbon-debug class="inline-block text-2xl text-green-400" /> Troubleshoot routing
</div>
<div v-click="8">
<carbon-warning class="inline-block text-2xl text-yellow-400" /> Same namespace required
</div>
<div v-click="9">
<carbon-timer class="inline-block text-2xl text-red-400" /> Practice YAML quickly
</div>
</div>

---
layout: center
---

# Next Steps

<div v-click="1" class="text-center mb-8">
<carbon-education class="inline-block text-6xl text-blue-400" />
</div>

<div v-click="2">

```mermaid
graph LR
    C[Concepts] --> H[Deploy<br/>Ingress Controller]
    H --> R[Create<br/>Routing Rules]
    H --> T[Configure<br/>TLS]
    style C fill:#4ade80
    style H fill:#60a5fa
    style R fill:#a78bfa
    style T fill:#fbbf24
```

</div>

<div v-click="3" class="mt-8 text-center text-xl">
Let's route some traffic! <carbon-arrow-right class="inline-block text-2xl" />
</div>
