# Ingress - CKAD Exam Topics

This document covers the CKAD exam requirements for Kubernetes Ingress. Make sure you've completed the [basic Ingress lab](README.md) first, as it covers fundamental concepts of Ingress controllers and routing.

## CKAD Ingress Requirements

The CKAD exam expects you to understand and work with:

- Ingress resource structure and rules
- Path types (Prefix, Exact, ImplementationSpecific)
- Host-based and path-based routing
- Multiple paths and backends in a single Ingress
- IngressClass and controller selection
- TLS/HTTPS configuration
- Default backends
- Annotations for controller-specific features
- Cross-namespace considerations
- Troubleshooting Ingress issues

## API Specs

- [Ingress (networking.k8s.io/v1)](https://kubernetes.io/docs/reference/kubernetes-api/service-resources/ingress-v1/)
- [IngressClass (networking.k8s.io/v1)](https://kubernetes.io/docs/reference/kubernetes-api/service-resources/ingress-class-v1/)

## Ingress Architecture Review

**Reminder from basic lab:**
- **Ingress Controller** - Reverse proxy (Nginx, Traefik, Contour, etc.)
- **Ingress Resources** - Kubernetes objects defining routing rules
- **Services** - Backends that Ingress routes to (must be ClusterIP or NodePort)

The controller watches for Ingress resources and configures itself accordingly.

## Path Types

Ingress supports three path matching types, critical for the exam:

### Prefix Path Type

Matches URL paths by prefix (most common):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /app
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 8080
```

**Matches:**
- `/app` ✅
- `/app/` ✅
- `/app/page` ✅
- `/app/admin/dashboard` ✅

**Does NOT match:**
- `/application` ❌
- `/apps` ❌

### Exact Path Type

Matches only the exact path:

```yaml
paths:
- path: /api/health
  pathType: Exact
  backend:
    service:
      name: health-service
      port:
        number: 8080
```

**Matches:**
- `/api/health` ✅

**Does NOT match:**
- `/api/health/` ❌
- `/api/health/check` ❌
- `/api/healthcheck` ❌

### ImplementationSpecific Path Type

Matching depends on the Ingress controller implementation:

```yaml
paths:
- path: /admin
  pathType: ImplementationSpecific
  backend:
    service:
      name: admin-service
      port:
        number: 80
```

> Avoid using this in the exam unless specifically instructed

**TODO**: Create comprehensive examples:
- `specs/path-types/prefix-ingress.yaml`
- `specs/path-types/exact-ingress.yaml`
- `specs/path-types/mixed-paths.yaml` - Combining multiple path types

**TODO**: Add exercise demonstrating:
1. Deploy app with multiple endpoints
2. Create Ingress with Prefix paths
3. Create Ingress with Exact paths
4. Test various URLs to understand matching behavior
5. Show priority when paths overlap

## Host-Based Routing

Route traffic based on the HTTP Host header:

### Single Host

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: single-host
spec:
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

### Multiple Hosts

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-host
spec:
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
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app2-service
            port:
              number: 80
```

### Wildcard Hosts

Some controllers support wildcard domains:

```yaml
rules:
- host: "*.example.com"
  http:
    paths:
    - path: /
      pathType: Prefix
      backend:
        service:
          name: wildcard-service
          port:
            number: 80
```

> Check your controller documentation - not all support wildcards

**TODO**: Create examples:
- `specs/host-routing/single-host.yaml`
- `specs/host-routing/multi-host.yaml`
- `specs/host-routing/wildcard-host.yaml`

**TODO**: Add exercise:
1. Deploy multiple applications
2. Create Ingress routing different hosts to different backends
3. Test with curl using Host headers
4. Show how to use /etc/hosts for local testing

## Path-Based Routing

Route to different backends based on URL path:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-routing
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      - path: /web
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 3000
```

**Routing behavior:**
- `myapp.example.com/api/users` → api-service:8080
- `myapp.example.com/web/dashboard` → web-service:80
- `myapp.example.com/admin/settings` → admin-service:3000

### Path Priority and Ordering

When multiple paths could match:
1. Exact matches take priority over Prefix
2. Longer Prefix paths take priority over shorter ones
3. Order in the spec may matter (controller-specific)

**Example:**

```yaml
paths:
- path: /api/v2
  pathType: Prefix
  backend:
    service:
      name: api-v2-service
      port:
        number: 8080
- path: /api
  pathType: Prefix
  backend:
    service:
      name: api-v1-service
      port:
        number: 8080
```

Request `/api/v2/users` matches both, but goes to api-v2-service (longer prefix).

**TODO**: Create examples:
- `specs/path-routing/multi-path.yaml`
- `specs/path-routing/path-priority.yaml`
- `specs/path-routing/combined-host-path.yaml`

**TODO**: Add exercise demonstrating:
1. Deploy frontend, backend API, and admin services
2. Create single Ingress routing paths to different services
3. Test routing with curl
4. Show path priority with overlapping paths

## Combining Host and Path Routing

Complex routing combining both host and path rules:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: complex-routing
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-v1
            port:
              number: 8080
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 8080
  - host: admin.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-portal
            port:
              number: 80
```

**TODO**: Create comprehensive routing example combining all patterns

## IngressClass

IngressClass allows multiple Ingress controllers in a cluster:

### Defining IngressClass

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx
```

### Using IngressClass in Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
spec:
  ingressClassName: nginx  # Specifies which controller to use
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

### Default IngressClass

Mark one IngressClass as default:

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: k8s.io/ingress-nginx
```

Ingresses without `ingressClassName` use the default.

**TODO**: Create examples:
- `specs/ingressclass/nginx-class.yaml`
- `specs/ingressclass/traefik-class.yaml`
- `specs/ingressclass/ingress-with-class.yaml`

**TODO**: Add exercise:
1. View existing IngressClasses
2. Create Ingress specifying IngressClass
3. Create Ingress without IngressClass (uses default)
4. Show how to change controller for an Ingress

## TLS/HTTPS Configuration

Configure TLS certificates for HTTPS traffic:

### Creating TLS Secret

From the basic lab's [ingress-https.md](ingress-https.md):

```
kubectl create secret tls my-tls-secret \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem
```

### Using TLS in Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: my-tls-secret
  rules:
  - host: myapp.example.com
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

**Behavior:**
- HTTPS traffic uses the TLS certificate
- HTTP traffic may be redirected to HTTPS (controller-dependent)
- Certificate must match the hostname

### Multiple TLS Certificates

Different certs for different hosts:

```yaml
spec:
  tls:
  - hosts:
    - app1.example.com
    secretName: app1-tls
  - hosts:
    - app2.example.com
    secretName: app2-tls
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
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app2-service
            port:
              number: 80
```

### Wildcard TLS Certificates

Single cert for multiple subdomains:

```yaml
spec:
  tls:
  - hosts:
    - "*.example.com"
    secretName: wildcard-tls
  rules:
  - host: app1.example.com
    # ... rules ...
  - host: app2.example.com
    # ... rules ...
```

**TODO**: Create TLS examples:
- `specs/tls/self-signed-cert-script.sh` - Generate test certificates
- `specs/tls/tls-secret.yaml`
- `specs/tls/ingress-with-tls.yaml`
- `specs/tls/multi-cert-ingress.yaml`

**TODO**: Add comprehensive TLS exercise:
1. Generate self-signed certificate
2. Create TLS Secret
3. Deploy app with HTTPS Ingress
4. Test with curl (--insecure for self-signed)
5. Show certificate details
6. Configure HTTP to HTTPS redirect

## Default Backend

Fallback service when no rules match:

### Controller Default Backend

Most controllers have built-in default backends (404 page).

### Custom Default Backend in Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-with-default
spec:
  defaultBackend:
    service:
      name: default-service
      port:
        number: 80
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

**Behavior:**
- Requests to `app.example.com/other` → default-service
- Requests to unknown hosts → default-service
- Requests to `app.example.com/api` → api-service

**TODO**: Create examples demonstrating default backend behavior

## Annotations

Controller-specific features via annotations:

### Common Nginx Annotations

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: annotated-ingress
  annotations:
    # Rewrite target path
    nginx.ingress.kubernetes.io/rewrite-target: /

    # Enable CORS
    nginx.ingress.kubernetes.io/enable-cors: "true"

    # SSL redirect
    nginx.ingress.kubernetes.io/ssl-redirect: "true"

    # Rate limiting
    nginx.ingress.kubernetes.io/limit-rps: "10"

    # Client body size
    nginx.ingress.kubernetes.io/proxy-body-size: "8m"

    # Response caching (from basic lab)
    nginx.ingress.kubernetes.io/proxy-cache-valid: "200 30m"
spec:
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

### Rewrite Target

Transform request paths before sending to backend:

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
```

**Request transformation:**
- Client requests: `/api/users`
- Backend receives: `/users`

### HTTP to HTTPS Redirect

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
```

### Custom Timeouts

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
```

**TODO**: Create comprehensive annotation examples:
- `specs/annotations/rewrite-target.yaml`
- `specs/annotations/cors-enabled.yaml`
- `specs/annotations/rate-limiting.yaml`
- `specs/annotations/custom-timeouts.yaml`

**TODO**: Add exercise demonstrating:
1. Deploy API at `/backend/api`
2. Use rewrite-target to strip `/backend` prefix
3. Enable CORS for cross-origin requests
4. Configure rate limiting
5. Test and verify transformations

## Cross-Namespace Considerations

### Ingress and Service Namespaces

**Important:** Ingress can only reference Services in the **same namespace**.

```yaml
# In namespace: app-namespace
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  namespace: app-namespace  # Must match Service namespace
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service  # Must exist in app-namespace
            port:
              number: 80
```

### Multi-Namespace Routing Pattern

Create separate Ingresses in each namespace:

```yaml
# Namespace: frontend
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
  namespace: frontend
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
---
# Namespace: api
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: api
spec:
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

**Result:** Single host routes to services in different namespaces.

### ExternalName Service Workaround

To reference services across namespaces (advanced pattern):

```yaml
# In namespace: app-namespace
apiVersion: v1
kind: Service
metadata:
  name: cross-ns-service
  namespace: app-namespace
spec:
  type: ExternalName
  externalName: service-name.other-namespace.svc.cluster.local
```

Then reference `cross-ns-service` in your Ingress.

**TODO**: Create namespace examples:
- `specs/namespaces/multi-namespace-setup.yaml`
- `specs/namespaces/cross-namespace-routing.yaml`

**TODO**: Add exercise:
1. Create two namespaces with services
2. Create Ingress in each namespace
3. Route same hostname to services in different namespaces
4. Show namespace isolation and limitations

## Troubleshooting Ingress

### Common Issues

**1. Ingress Created But Not Working**

```
# Check Ingress status
kubectl get ingress
kubectl describe ingress <name>

# Look for:
# - Address field populated
# - Events showing controller processing
# - Backend service exists
```

**Common causes:**
- Ingress controller not installed
- Wrong IngressClass specified
- Service doesn't exist
- Service in different namespace

**2. 404 Not Found**

```
# Verify Service exists
kubectl get svc <service-name>

# Check Service endpoints
kubectl get endpoints <service-name>

# Verify path and pathType
kubectl describe ingress <name>
```

**Common causes:**
- Path doesn't match request
- PathType incorrect (Exact vs Prefix)
- No Pods backing the Service
- Service selector doesn't match Pods

**3. 502 Bad Gateway / 503 Service Unavailable**

```
# Check Pod status
kubectl get pods -l <service-selector>

# Check Pod readiness
kubectl describe pod <pod-name>

# Test Service directly
kubectl port-forward svc/<service-name> 8080:80
curl localhost:8080
```

**Common causes:**
- Pods not ready
- Service port mismatch
- Application not listening on expected port
- Readiness probe failing

**4. TLS/HTTPS Issues**

```
# Verify TLS Secret exists
kubectl get secret <tls-secret>

# Check Secret type
kubectl get secret <tls-secret> -o yaml

# Verify certificate
kubectl get secret <tls-secret> -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text -noout
```

**Common causes:**
- Secret doesn't exist
- Secret wrong type (not `kubernetes.io/tls`)
- Certificate expired
- Hostname doesn't match certificate

**5. Host Header Not Matching**

```
# Test with curl specifying Host header
curl -H "Host: app.example.com" http://<ingress-ip>

# Check exact hostname in Ingress
kubectl get ingress <name> -o yaml
```

**Common causes:**
- DNS not configured
- /etc/hosts not updated
- Typo in hostname
- Wildcard not supported

**TODO**: Create comprehensive troubleshooting lab:
- `specs/troubleshooting/broken-ingress-1.yaml` - Wrong namespace
- `specs/troubleshooting/broken-ingress-2.yaml` - Service doesn't exist
- `specs/troubleshooting/broken-ingress-3.yaml` - Wrong path type
- `specs/troubleshooting/broken-ingress-4.yaml` - TLS secret missing
- `specs/troubleshooting/broken-ingress-5.yaml` - No backend pods

**TODO**: Add systematic debugging exercise with decision tree

## Port References

You can reference Service ports by name or number:

### By Port Number

```yaml
backend:
  service:
    name: app-service
    port:
      number: 8080
```

### By Port Name

```yaml
backend:
  service:
    name: app-service
    port:
      name: http
```

**Service must have named port:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
  ports:
  - name: http
    port: 8080
    targetPort: 8080
```

**Benefits of named ports:**
- More readable
- Port number can change without updating Ingress

**TODO**: Add example comparing port number vs name references

## CKAD Exam Tips

### Speed Commands

```bash
# Generate Ingress YAML (Kubernetes 1.19+)
kubectl create ingress my-ingress \
  --rule="host.example.com/path*=service:port" \
  --dry-run=client -o yaml > ingress.yaml

# Examples:
kubectl create ingress simple \
  --rule="app.example.com/=app-svc:80"

kubectl create ingress multi-path \
  --rule="app.example.com/api/*=api-svc:8080" \
  --rule="app.example.com/web/*=web-svc:80"

# With TLS
kubectl create ingress tls-ingress \
  --rule="secure.example.com/=app-svc:443,tls=my-tls-secret"
```

### Quick Verification

```bash
# Check Ingress
kubectl get ingress
kubectl describe ingress <name>

# Test with curl
curl -H "Host: app.example.com" http://<ingress-ip>

# Check controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Verify backend service
kubectl get svc <service-name>
kubectl get endpoints <service-name>
```

### Common Exam Patterns

**Pattern 1: Expose existing deployment**
```bash
# Create deployment and service
kubectl create deployment web --image=nginx
kubectl expose deployment web --port=80

# Create Ingress
kubectl create ingress web \
  --rule="web.example.com/=web:80" \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Pattern 2: Fix broken Ingress**
```bash
# Check Ingress definition
kubectl get ingress <name> -o yaml

# Verify service exists in same namespace
kubectl get svc -n <namespace>

# Check events
kubectl describe ingress <name>
```

**Pattern 3: Add TLS to existing Ingress**
```bash
# Create TLS secret
kubectl create secret tls my-tls --cert=tls.crt --key=tls.key

# Edit Ingress to add TLS section
kubectl edit ingress <name>
```

**TODO**: Add 10 rapid-fire CKAD practice scenarios

## Lab Challenge: Complete Multi-Service Application

Build a production-ready ingress configuration:

**TODO**: Create comprehensive challenge with:

### Requirements

1. **Three-Tier Application**
   - Frontend: Static web app (nginx) - `/`
   - Backend API: REST API - `/api/*`
   - Admin Portal: Management UI - `/admin/*`

2. **Routing Requirements**
   - Single hostname: `myapp.example.com`
   - Path-based routing to three services
   - Default backend for unmatched paths

3. **TLS Configuration**
   - HTTPS enabled with self-signed certificate
   - HTTP automatically redirects to HTTPS
   - Certificate covers `myapp.example.com`

4. **Advanced Features**
   - API rate limiting (10 requests/second)
   - Admin portal with basic auth
   - Response caching for static assets
   - CORS enabled for API endpoints
   - Custom 404 page

5. **Multi-Environment Setup**
   - Separate Ingresses for `dev`, `staging`, `prod` namespaces
   - Different hostnames per environment
   - Shared TLS certificate

6. **Troubleshooting Tasks**
   - Fix Ingress with wrong service reference
   - Debug 404 errors from path mismatch
   - Resolve TLS certificate issues
   - Fix cross-namespace service access

**Success Criteria:**
- All paths route correctly
- HTTPS works with valid certificate
- HTTP redirects to HTTPS
- Rate limiting active on API
- Admin portal requires authentication
- Can access app from each environment
- All troubleshooting issues resolved

**TODO**: Create all specs in `specs/challenge/` directory

## Quick Reference Card

### Basic Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: basic-ingress
spec:
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

### With TLS

```yaml
spec:
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls
  rules:
  # ... rules ...
```

### With IngressClass

```yaml
spec:
  ingressClassName: nginx
  rules:
  # ... rules ...
```

### Multiple Paths

```yaml
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-svc
            port:
              number: 8080
      - path: /web
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80
```

### Common Annotations

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/limit-rps: "10"
```

## Cleanup

```
kubectl delete all,secret,ingress,ingressclass -l kubernetes.courselabs.co=ingress

# If you created test namespaces
kubectl delete namespace dev staging prod
```

## Further Reading

- [Ingress Documentation](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Nginx Annotations](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/)
- [TLS Certificates with cert-manager](https://cert-manager.io/docs/)

---

> Back to [basic Ingress lab](README.md) | [HTTPS setup](ingress-https.md) | [Course contents](../../README.md)
