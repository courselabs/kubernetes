# Ingress CKAD Exam Preparation - Narration Script

**Duration:** 20-25 minutes
**Format:** Exam-focused tutorial with practical demonstrations
**Prerequisite:** Basic Ingress lab completed
**Target Audience:** CKAD exam candidates

---

## Introduction (0:00-1:30)
**Duration:** 90 seconds

**Screen:** Terminal with Kubernetes cluster ready

**Narration:**
"Welcome to the CKAD-focused Ingress session. Ingress is classified as supplementary content for CKAD, meaning it may appear on the exam but isn't guaranteed. However, when it does appear, it's often combined with other topics like services, deployments, and troubleshooting, making it a high-value skill to master.

In the CKAD exam, you'll work under time pressure with limited access to external resources. The good news is that kubernetes.io documentation is available, including Ingress examples and API references.

In this session, we'll cover exactly what you need to know for the exam: path types and how they match URLs, host and path-based routing patterns, IngressClass selection, TLS configuration, troubleshooting broken Ingress resources, and time-saving kubectl commands. We'll work through practical examples that mirror real exam questions.

Let's start by ensuring you have the Ingress Controller from the basic lab still running. If not, deploy it now."

**Commands:**
```bash
kubectl get pods -n ingress-nginx
```

---

## Part 1: Path Types Deep Dive (1:30-5:00)
**Duration:** 3 minutes 30 seconds

### Understanding Path Matching (1:30-2:30)

**Screen:** Terminal and editor

**Narration:**
"Path types are critical for the CKAD exam because they determine exactly which requests match your Ingress rules. There are three path types, but you'll primarily use two: Prefix and Exact.

Prefix is the most common. It matches the beginning of the URL path, including everything after it. If your path is '/api', it matches '/api', '/api/', '/api/users', and '/api/v2/products'. Think of it as 'starts with' matching.

Exact requires an exact match with no trailing content. If your path is '/health', it matches only '/health', not '/health/' or '/health/check'. Use Exact when you need precise control over specific endpoints.

There's also ImplementationSpecific, which depends on your Ingress Controller. Avoid this in the exam unless specifically instructed, as behavior varies between controllers."

### Prefix Path Type Example (2:30-3:45)

**Screen:** Terminal

**Narration:**
"Let's create a practical example. I'll deploy a simple application and create an Ingress with Prefix path matching."

**Commands:**
```bash
# Create test deployment
kubectl create deployment api-v1 --image=gcr.io/google-samples/hello-app:1.0
kubectl expose deployment api-v1 --port=8080

# Create Ingress with Prefix
kubectl create ingress api-prefix \
  --rule="app.local/api*=api-v1:8080" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl get ingress api-prefix
```

**Narration (continued):**
"Notice I used the kubectl create ingress command with the asterisk indicating Prefix matching. This is much faster than writing YAML from scratch. Now let's verify what was created."

**Commands:**
```bash
kubectl get ingress api-prefix -o yaml | grep -A 10 "pathType"
```

**Narration (continued):**
"Perfect - the pathType is set to Prefix. This Ingress will match '/api', '/api/users', '/api/v1/products', and so on."

### Exact Path Type Example (3:45-5:00)

**Screen:** Terminal

**Narration:**
"Now let's create an Ingress with Exact matching for a health check endpoint."

**Commands:**
```bash
# Create another deployment
kubectl create deployment health --image=gcr.io/google-samples/hello-app:2.0
kubectl expose deployment health --port=8080

# Create Ingress with Exact - note the different syntax
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: health-exact
spec:
  rules:
  - host: app.local
    http:
      paths:
      - path: /health
        pathType: Exact
        backend:
          service:
            name: health
            port:
              number: 8080
EOF
```

**Narration (continued):**
"Unfortunately, kubectl create ingress doesn't have a flag for Exact paths, so we need to write the YAML directly. In the exam, you might use kubectl create to generate a template, then edit it to change the pathType to Exact. Let's verify both Ingresses."

**Commands:**
```bash
kubectl get ingress
```

---

## Part 2: Path Priority and Overlapping Rules (5:00-7:30)
**Duration:** 2 minutes 30 seconds

### Understanding Priority (5:00-6:00)

**Screen:** Terminal

**Narration:**
"A common exam scenario involves multiple paths that could match the same request. Understanding priority is essential. The rules are: Exact matches always win over Prefix matches. Among Prefix matches, longer paths take priority over shorter ones. And some controllers consider the order of rules in your spec, so put more specific rules first.

Let's create a scenario with overlapping paths."

**Commands:**
```bash
# Create services for API v2
kubectl create deployment api-v2 --image=gcr.io/google-samples/hello-app:2.0
kubectl expose deployment api-v2 --port=8080

# Create Ingress with overlapping paths
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-priority
spec:
  rules:
  - host: api.local
    http:
      paths:
      - path: /api/v2
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 8080
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-v1
            port:
              number: 8080
EOF
```

### Testing Priority (6:00-7:30)

**Screen:** Terminal with curl commands

**Narration:**
"Now we have two overlapping Prefix paths. Let's test how requests are routed. Add api.local to your hosts file first."

**Commands:**
```bash
./scripts/add-to-hosts.ps1 api.local 127.0.0.1

# Test different paths
curl -H "Host: api.local" http://localhost:8000/api/users
curl -H "Host: api.local" http://localhost:8000/api/v2/users
```

**Narration (continued):**
"The request to '/api/users' goes to api-v1 because it matches the '/api' Prefix. But '/api/v2/users' goes to api-v2 because '/api/v2' is a longer, more specific match. Even though both paths match as Prefixes, the longer one takes priority.

This is exactly the kind of question you might see on the CKAD exam - you're given an Ingress with overlapping rules and asked which service handles a specific request. Always remember: more specific matches win."

---

## Part 3: Multi-Path and Multi-Host Routing (7:30-11:00)
**Duration:** 3 minutes 30 seconds

### Creating a Complex Routing Scenario (7:30-9:00)

**Screen:** Terminal

**Narration:**
"A typical CKAD exam question asks you to create an Ingress that routes different paths to different services, possibly with multiple hostnames. Let's build a realistic example - a three-tier application with frontend, API, and admin components."

**Commands:**
```bash
# Create the three services
kubectl create deployment frontend --image=nginx
kubectl expose deployment frontend --port=80

kubectl create deployment backend --image=gcr.io/google-samples/hello-app:1.0
kubectl expose deployment backend --port=8080

kubectl create deployment admin --image=gcr.io/google-samples/hello-app:2.0
kubectl expose deployment admin --port=8080

# Verify services exist
kubectl get svc frontend backend admin
```

**Narration (continued):**
"Now we need to create an Ingress that routes traffic intelligently. The frontend should serve the root path, the backend should handle '/api', and the admin should be accessible at '/admin'. Let's create this in one Ingress resource."

**Commands:**
```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-path-app
spec:
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 8080
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
EOF
```

**Narration (continued):**
"Notice the order - I put the most specific paths first: '/admin', then '/api', then the root catch-all. While Kubernetes should handle priority correctly, this is good practice and matches how you'd configure most web servers."

### Adding Multiple Hosts (9:00-11:00)

**Screen:** Terminal

**Narration:**
"Now let's extend this with multiple hostnames. Suppose you also want a separate hostname for the API only."

**Commands:**
```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-host-app
spec:
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
  - host: api.myapp.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8080
  - host: admin.myapp.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 8080
EOF
```

**Narration (continued):**
"Now we have host-based routing - 'myapp.local' goes to the frontend, 'api.myapp.local' goes to the backend, and 'admin.myapp.local' goes to the admin portal. Each hostname can have its own path rules as well.

This pattern is extremely common in real-world applications and frequently appears in CKAD exam questions. You might be asked to expose multiple services through a single Ingress, or to combine host and path-based routing."

**Commands:**
```bash
kubectl get ingress
```

---

## Part 4: IngressClass Configuration (11:00-13:00)
**Duration:** 2 minutes

### Understanding IngressClass (11:00-11:45)

**Screen:** Terminal

**Narration:**
"IngressClass is important when you have multiple Ingress Controllers in a cluster - for example, both Nginx and Traefik. The IngressClass object tells Kubernetes which controller should handle which Ingress resources.

Let's check what IngressClasses exist in our cluster."

**Commands:**
```bash
kubectl get ingressclass
```

**Narration (continued):**
"You'll typically see at least one IngressClass. Notice the annotation showing which one is the default. Ingress resources without an ingressClassName specified use the default class automatically."

### Specifying IngressClass (11:45-13:00)

**Screen:** Terminal and editor

**Narration:**
"When creating an Ingress, you can explicitly specify which IngressClass to use. This is done with the ingressClassName field in the spec."

**Commands:**
```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: with-class
spec:
  ingressClassName: nginx
  rules:
  - host: class-demo.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
EOF

kubectl get ingress with-class -o yaml | grep -A 2 "ingressClassName"
```

**Narration (continued):**
"In the exam, if you're asked to create an Ingress for a specific controller, make sure to include the ingressClassName field. However, if there's only one controller or one is marked as default, you can omit this field and it will work correctly. Always check what's in the cluster with 'kubectl get ingressclass' before making assumptions."

---

## Part 5: TLS/HTTPS Configuration (13:00-16:30)
**Duration:** 3 minutes 30 seconds

### Creating a TLS Secret (13:00-14:30)

**Screen:** Terminal

**Narration:**
"HTTPS support is a common exam requirement. The process involves two steps: first, create a TLS secret containing your certificate and private key, then reference that secret in your Ingress resource.

For the exam, you'll either be given pre-existing certificate files or asked to create self-signed certificates for testing. Let's create a self-signed certificate now."

**Commands:**
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=secure.local/O=secure.local"

# Create the TLS secret
kubectl create secret tls secure-tls --cert=tls.crt --key=tls.key

# Verify the secret
kubectl get secret secure-tls
kubectl describe secret secure-tls
```

**Narration (continued):**
"The secret type must be 'kubernetes.io/tls' - the kubectl create secret tls command handles this automatically. The secret must contain two keys: 'tls.crt' for the certificate and 'tls.key' for the private key. If you're troubleshooting a broken TLS setup in the exam, verify these keys exist with kubectl describe."

### Creating an HTTPS Ingress (14:30-16:30)

**Screen:** Terminal

**Narration:**
"Now let's create an Ingress that uses this TLS certificate for HTTPS."

**Commands:**
```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - secure.local
    secretName: secure-tls
  rules:
  - host: secure.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
EOF

kubectl get ingress tls-ingress
```

**Narration (continued):**
"The TLS section comes before the rules section in the spec. Each TLS entry specifies which hosts it covers and which secret contains the certificate. The hosts in the TLS section should match the hosts in your rules.

I also added an annotation for automatic HTTP to HTTPS redirection. This is Nginx-specific but very common in production. Now let's test it."

**Commands:**
```bash
./scripts/add-to-hosts.ps1 secure.local 127.0.0.1

# Test HTTP - should redirect to HTTPS
curl -I -H "Host: secure.local" http://localhost:8000

# Test HTTPS with self-signed cert
curl -k -H "Host: secure.local" https://localhost:8443
```

**Narration (continued):**
"The HTTP request returns a 308 Permanent Redirect to HTTPS, and the HTTPS request works correctly. The '-k' flag tells curl to accept our self-signed certificate. In the exam, you'll use the kubernetes.io documentation to look up the exact annotation syntax if needed."

---

## Part 6: Troubleshooting Ingress Issues (16:30-20:00)
**Duration:** 3 minutes 30 seconds

### Common Issue 1: Service Not Found (16:30-17:30)

**Screen:** Terminal

**Narration:**
"Let's walk through common Ingress problems you'll encounter in the CKAD exam. The first and most common issue is referencing a service that doesn't exist or is in the wrong namespace.

Let me create a broken Ingress to demonstrate."

**Commands:**
```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: broken-ingress
spec:
  rules:
  - host: broken.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nonexistent-service
            port:
              number: 80
EOF

kubectl describe ingress broken-ingress
```

**Narration (continued):**
"When you describe the Ingress, look at the Events section at the bottom. You might see warnings about the service not existing. The fix is straightforward: verify the service name with 'kubectl get svc', check you're in the correct namespace, and update the Ingress to reference the correct service name.

Remember, Ingress resources can only reference services in the same namespace. You cannot route to a service in a different namespace without creating a proxy service."

### Common Issue 2: Wrong Path Type (17:30-18:30)

**Screen:** Terminal

**Narration:**
"The second common issue is using the wrong pathType. Let's say you want to match only the exact path '/api', but you used Prefix by mistake."

**Commands:**
```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wrong-pathtype
spec:
  rules:
  - host: pathtype.local
    http:
      paths:
      - path: /api
        pathType: Prefix  # Should be Exact
        backend:
          service:
            name: backend
            port:
              number: 8080
EOF
```

**Narration (continued):**
"With Prefix, requests to '/api/users' will also match, which might not be what you want. If the exam question says 'exactly /api' or 'only /api', you need pathType Exact. The symptom is that too many requests are being routed to this service. Fix it by changing pathType to Exact and reapplying."

### Common Issue 3: No Endpoints (18:30-19:30)

**Screen:** Terminal

**Narration:**
"The third issue is when the Ingress and Service exist, but there are no pods backing the service. This causes 502 or 503 errors."

**Commands:**
```bash
# Create service without matching pods
kubectl create service clusterip empty-svc --tcp=80:80

cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: no-endpoints
spec:
  rules:
  - host: empty.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: empty-svc
            port:
              number: 80
EOF

# Check endpoints
kubectl get endpoints empty-svc
```

**Narration (continued):**
"Notice the endpoints list is empty or shows 'none'. The Ingress is configured correctly, but there are no pods to receive traffic. Check the service selector with 'kubectl describe svc', then verify pods exist with those labels. Create or fix the deployment to match the service selector."

### Troubleshooting Workflow (19:30-20:00)

**Screen:** Terminal showing systematic checks

**Narration:**
"Here's a systematic troubleshooting workflow for the exam. First, verify the Ingress exists with 'kubectl get ingress'. Second, describe the Ingress and check for events or warnings. Third, verify the service exists in the same namespace. Fourth, check the service has endpoints. Fifth, test the service directly with port-forward to isolate Ingress issues. And finally, check the Ingress Controller logs if needed.

This systematic approach will help you quickly identify and fix Ingress issues under exam time pressure."

**Commands:**
```bash
# Troubleshooting command sequence
kubectl get ingress
kubectl describe ingress <name>
kubectl get svc <service-name>
kubectl get endpoints <service-name>
kubectl port-forward svc/<service-name> 8080:80
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=50
```

---

## Part 7: Cross-Namespace Patterns (20:00-21:30)
**Duration:** 90 seconds

**Screen:** Terminal

**Narration:**
"A key limitation to understand is that Ingress resources can only reference services in the same namespace. This is an important architectural constraint for the exam.

If you need to route traffic to services in different namespaces, you create separate Ingress resources in each namespace. Let me demonstrate."

**Commands:**
```bash
# Create two namespaces with services
kubectl create namespace frontend-ns
kubectl create namespace api-ns

kubectl create deployment web -n frontend-ns --image=nginx
kubectl expose deployment web -n frontend-ns --port=80

kubectl create deployment api -n api-ns --image=gcr.io/google-samples/hello-app:1.0
kubectl expose deployment api -n api-ns --port=8080

# Create Ingress in each namespace
kubectl create ingress web -n frontend-ns \
  --rule="multins.local/=web:80"

kubectl create ingress api -n api-ns \
  --rule="multins.local/api*=api:8080"

# Verify both Ingresses
kubectl get ingress -A
```

**Narration (continued):**
"Now we have two Ingress resources in different namespaces, both routing the same hostname 'multins.local' but with different paths. The Ingress Controller merges these rules and routes '/api' to the api namespace and everything else to the frontend namespace. This is the correct pattern for multi-namespace routing."

---

## Part 8: Exam Speed Techniques (21:30-23:30)
**Duration:** 2 minutes

### Using kubectl create ingress (21:30-22:30)

**Screen:** Terminal with fast typing

**Narration:**
"Time management is critical in the CKAD exam. Let me show you speed techniques for working with Ingress.

First, the kubectl create ingress command generates YAML quickly. The syntax is: rule equals 'hostname/path asterisk equals service colon port'."

**Commands:**
```bash
# Generate simple Ingress
kubectl create ingress quick \
  --rule="app.example.com/=myapp:80" \
  --dry-run=client -o yaml

# Multiple rules
kubectl create ingress multi \
  --rule="app.example.com/api*=api:8080" \
  --rule="app.example.com/web*=web:80" \
  --dry-run=client -o yaml

# With TLS
kubectl create ingress secure \
  --rule="app.example.com/=myapp:443,tls=my-tls" \
  --dry-run=client -o yaml
```

**Narration (continued):**
"Use --dry-run=client -o yaml to preview the generated YAML, then pipe it to a file or directly to kubectl apply. This saves minutes compared to writing YAML from scratch."

### Using Documentation Effectively (22:30-23:30)

**Screen:** Browser showing kubernetes.io

**Narration:**
"In the exam, you have access to kubernetes.io documentation. Know where to find Ingress examples quickly. Navigate to the API reference for Ingress, or search for 'Ingress' on kubernetes.io. The documentation includes complete examples you can copy and modify.

Pay attention to the version - make sure you're looking at documentation matching your cluster version. Use 'kubectl version' to check.

Also bookmark or remember how to find annotation documentation for your Ingress Controller. For Nginx, the annotations page lists every available feature with examples."

**Commands:**
```bash
# Check your cluster version
kubectl version --short

# Find Ingress examples in the API docs
# Navigate to: kubernetes.io/docs/reference/kubernetes-api/
```

---

## Part 9: Practice Scenarios (23:30-25:00)
**Duration:** 90 seconds

### Rapid-Fire Scenarios (23:30-24:30)

**Screen:** Terminal

**Narration:**
"Let's run through three rapid-fire scenarios that mimic exam questions.

Scenario one: Create an Ingress for a deployment called 'store' exposed on port 8080, accessible at 'store.example.com/shop'. You have 2 minutes."

**Commands:**
```bash
kubectl create ingress store \
  --rule="store.example.com/shop*=store:8080"
```

**Narration (continued):**
"Scenario two: Add HTTPS to an existing Ingress called 'webapp' using a TLS secret called 'webapp-tls' for the host 'webapp.example.com'. You have 3 minutes."

**Commands:**
```bash
kubectl get ingress webapp -o yaml > webapp-ingress.yaml
# Edit to add TLS section
kubectl apply -f webapp-ingress.yaml
```

**Narration (continued):**
"Scenario three: An Ingress called 'broken' returns 404 errors. The service exists. Find and fix the issue. You have 3 minutes."

**Commands:**
```bash
kubectl describe ingress broken
kubectl get svc -n <namespace>
# Check pathType, service name, port number, and namespace
```

### Building Exam Confidence (24:30-25:00)

**Narration:**
"These scenarios train your muscle memory for common exam tasks. Practice creating Ingress resources until you can do it without thinking about the syntax. Focus on: routing with both host and path rules, adding TLS configuration, troubleshooting systematically, and using kubectl create ingress to save time.

Remember, Ingress questions often combine with other topics. You might need to create a deployment, expose it as a service, then create an Ingress - all in one question. Practice the full workflow, not just Ingress in isolation."

---

## Conclusion (25:00-26:00)
**Duration:** 60 seconds

**Screen:** Terminal

**Narration:**
"Congratulations! You now have the Ingress knowledge required for the CKAD exam. Let's recap the essential points.

Know your path types - Prefix for starts-with matching, Exact for precise endpoints. Understand that longer and more specific paths take priority. Use kubectl create ingress to generate YAML quickly. Ingress resources must be in the same namespace as their services. For TLS, create a secret with kubectl create secret tls, then reference it in the Ingress TLS section. Troubleshoot systematically - check the Ingress, verify the service, check endpoints, test the service directly.

Practice these patterns until they become second nature. In the exam, you'll likely have 10-15 minutes per question, so efficiency is key. Use the time you save with kubectl generate commands to double-check your work and handle troubleshooting scenarios.

The skills you've learned today apply directly to production Kubernetes clusters as well. Ingress is how most real-world applications expose HTTP services to users.

Now clean up your practice resources, and good luck on your CKAD exam!"

**Commands:**
```bash
kubectl delete namespace frontend-ns api-ns
kubectl delete ingress --all
kubectl delete deployment --all
kubectl delete svc --all
```

---

**End of Script**

**Total Runtime:** Approximately 26 minutes

**Key Exam Topics Covered:**
- ✅ Path types (Prefix, Exact) with examples
- ✅ Host-based routing
- ✅ Path-based routing
- ✅ Multi-path and multi-host routing
- ✅ IngressClass configuration
- ✅ TLS/HTTPS setup
- ✅ Cross-namespace considerations
- ✅ Troubleshooting workflow
- ✅ Speed techniques with kubectl
- ✅ Documentation usage
- ✅ Practice scenarios

**Time Management for CKAD:**
- Simple Ingress creation: 2-3 minutes
- TLS configuration: 4-5 minutes
- Troubleshooting: 3-4 minutes
- Complex multi-service routing: 5-7 minutes
