# Troubleshooting Advanced Kubernetes Components - Concept Introduction

**Duration:** 10-12 minutes
**Format:** Concept slideshow presentation
**Audience:** Advanced practitioners (Beyond CKAD core requirements)
**Note:** This content goes beyond CKAD exam requirements but builds on foundational concepts

---

## Slide 1: Introduction (30 seconds)

Welcome to troubleshooting advanced Kubernetes components. This session covers Helm charts, Ingress controllers, and StatefulSets—topics that extend beyond core CKAD but are valuable for real-world Kubernetes work.

**Important Note:** While StatefulSets and basic Ingress concepts appear in CKAD, this lab focuses on advanced troubleshooting with Helm packaging, which is beyond CKAD scope.

**Today's Focus:**
- Helm chart troubleshooting
- Ingress configuration issues
- StatefulSet-specific problems
- Complex multi-component debugging

**Value for CKAD Candidates:** Even if not exam-required, these skills demonstrate advanced Kubernetes proficiency.

---

## Slide 2: Scope and CKAD Relevance (1 minute)

### What's CKAD-Relevant

**In Scope:**
- Basic StatefulSet concepts (covered in core CKAD)
- Basic Ingress usage (covered in core CKAD)
- Troubleshooting methodologies (always relevant)
- Reading and understanding YAML specs

**Beyond CKAD:**
- Helm chart creation and templates
- Helm troubleshooting commands
- Advanced Ingress configuration
- Complex StatefulSet patterns

### Why Learn This Anyway?

1. **Real-world relevance** - Production systems use these tools
2. **Career advancement** - Shows advanced Kubernetes skills
3. **Context for CKAD** - Understanding the broader ecosystem
4. **Problem-solving skills** - Transferable debugging approaches

**Recommendation:** Focus on core CKAD topics first, then return to this as enrichment.

---

## Slide 3: Helm Overview (1.5 minutes)

### What is Helm?

**Helm** is a package manager for Kubernetes - think "apt" or "yum" for Kubernetes applications.

**Key Concepts:**
- **Chart** - Package of Kubernetes resources
- **Release** - Installed instance of a chart
- **Repository** - Collection of charts
- **Values** - Configuration parameters for charts
- **Templates** - Kubernetes manifests with placeholders

**Why Helm?**
- Package complex applications (multiple resources)
- Parameterize configurations (dev, staging, prod)
- Version and rollback releases
- Share applications via repositories

### Helm Architecture

```
Chart (templates + values)
  ↓
Helm CLI (render templates)
  ↓
Kubernetes Manifests
  ↓
Kubernetes API (apply resources)
```

**Visual:** Diagram showing Helm chart structure and deployment flow.

---

## Slide 4: Common Helm Issues (2 minutes)

### Issue 1: Template Rendering Errors

**Problem:** Invalid Go template syntax breaks chart installation.

**Example:**
```yaml
# Wrong
replicas: {{ .Values.replicaCount  # Missing closing }}

# Right
replicas: {{ .Values.replicaCount }}
```

**Symptoms:**
```
Error: parse error at (deployment.yaml:10): unclosed action
```

**Diagnosis:**
```bash
# Dry-run to test templates
helm install myapp ./chart --dry-run --debug

# Check rendered output
helm template myapp ./chart
```

### Issue 2: Missing or Wrong Values

**Problem:** Chart expects values that aren't provided.

**Example:**
```yaml
# values.yaml missing
image:
  repository: myapp
  # tag: is missing!

# deployment.yaml uses
image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
# Results in: image: myapp:<no value>
```

**Symptoms:**
- ImagePullBackOff (if tag is missing)
- Service errors (if ports missing)
- CreateContainerConfigError (if config refs missing)

### Issue 3: Release Conflicts

**Problem:** Release name already exists or has failed state.

**Commands:**
```bash
# List releases
helm list --all-namespaces

# Show release history
helm history <release-name>

# Uninstall stuck release
helm uninstall <release-name>
```

### Issue 4: Dependency Issues

**Problem:** Chart depends on other charts that aren't installed.

```yaml
# Chart.yaml
dependencies:
- name: postgresql
  version: 12.x.x
  repository: https://charts.bitnami.com/bitnami
```

**Fix:**
```bash
# Update dependencies
helm dependency update ./chart
```

**Visual:** Flowchart showing Helm troubleshooting decision tree.

---

## Slide 5: Ingress Controller Overview (1.5 minutes)

### What is an Ingress?

**Ingress** manages external HTTP/HTTPS access to services in a cluster.

**Components:**
- **Ingress Resource** - Rules for routing traffic
- **Ingress Controller** - Implements the rules (nginx, traefik, etc.)
- **Service** - Backend services receiving traffic

**Flow:**
```
External Traffic → Ingress Controller → Ingress Rules → Service → Pods
```

### Ingress vs Service

**Service LoadBalancer:**
- One external IP per service
- Layer 4 (TCP/UDP)
- Simple but expensive (many IPs)

**Ingress:**
- One external IP for many services
- Layer 7 (HTTP/HTTPS)
- Path and host-based routing
- SSL/TLS termination

**Example:**
```
https://app.example.com/api → api-service
https://app.example.com/web → web-service
```

**Visual:** Diagram showing Ingress routing multiple services through one IP.

---

## Slide 6: Common Ingress Issues (2 minutes)

### Issue 1: Ingress Controller Not Installed

**Problem:** Ingress resource created but no controller to implement it.

**Symptoms:**
- Ingress created but no ADDRESS
- External requests fail or timeout

**Check:**
```bash
# Check if ingress controller pods exist
kubectl get pods -n ingress-nginx
kubectl get pods -A | grep ingress

# If missing, install
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### Issue 2: Service Not Found

**Problem:** Ingress references service that doesn't exist or is in wrong namespace.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
  - host: app.local
    http:
      paths:
      - path: /
        backend:
          service:
            name: webapp  # Service must exist!
            port:
              number: 80
```

**Diagnosis:**
```bash
kubectl get svc webapp  # Does it exist?
kubectl describe ingress myapp  # Check backend status
```

### Issue 3: Host/Path Not Matching

**Problem:** Requests don't match ingress rules.

```yaml
# Ingress rule
host: whoami.local
path: /

# Request
curl http://localhost:8000  # Wrong! Missing host header
```

**Fix:**
```bash
# Include host header
curl -H "Host: whoami.local" http://localhost:8000

# Or add to /etc/hosts
echo "127.0.0.1 whoami.local" >> /etc/hosts
curl http://whoami.local:8000
```

### Issue 4: TLS/Certificate Issues

**Problem:** HTTPS not working or certificate errors.

**Check:**
```bash
# Verify TLS secret exists
kubectl get secret tls-secret

# Check cert and key are valid
kubectl get secret tls-secret -o yaml
```

**Visual:** Troubleshooting flowchart for Ingress connectivity issues.

---

## Slide 7: StatefulSet Overview (1.5 minutes)

### StatefulSet vs Deployment

**Deployment:**
- Stateless applications
- Pods are interchangeable
- Random pod names
- Any pod can be replaced anytime
- Shared PVC or no persistent storage

**StatefulSet:**
- Stateful applications (databases, message queues)
- Pods have unique identities
- Predictable pod names (app-0, app-1, app-2)
- Ordered creation and deletion
- Each pod gets its own PVC

**StatefulSet Features:**
- **Stable network identity** - pod-0.service.namespace.svc.cluster.local
- **Stable storage** - PVC persists across pod restarts
- **Ordered deployment** - pod-1 only starts after pod-0 is ready
- **Ordered shutdown** - pod-2 deleted before pod-1

**Visual:** Side-by-side comparison of Deployment vs StatefulSet pod management.

---

## Slide 8: Common StatefulSet Issues (1.5 minutes)

### Issue 1: Pod Stuck in Pending (PVC Not Binding)

**Problem:** StatefulSet pod can't start because PVC isn't bound.

```bash
# Check pods
kubectl get pods
# Shows: pod-0 Pending

# Check PVCs
kubectl get pvc
# Shows: data-pod-0 Pending

# Fix: Create PV or adjust storage class
```

### Issue 2: Ordered Startup Blocking

**Problem:** Pod-1 won't start because pod-0 isn't ready.

**Symptom:**
```
pod-0: Running but not Ready (0/1)
pod-1: Pending (waiting for pod-0)
```

**Diagnosis:**
```bash
# Check why pod-0 isn't ready
kubectl describe pod pod-0
kubectl logs pod-0

# Fix pod-0 first, then pod-1 will start
```

### Issue 3: Headless Service Missing

**Problem:** StatefulSet requires headless service for DNS.

```yaml
# Headless service (clusterIP: None)
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  clusterIP: None  # This makes it headless!
  selector:
    app: myapp
```

**Without headless service:** Pod DNS doesn't work.

### Issue 4: PVC Reclaim Policy

**Problem:** Deleting StatefulSet doesn't delete PVCs automatically.

```bash
# Delete StatefulSet
kubectl delete statefulset myapp

# PVCs remain!
kubectl get pvc
# Shows: data-myapp-0, data-myapp-1 still exist

# Manual cleanup required
kubectl delete pvc data-myapp-0 data-myapp-1
```

**Visual:** Timeline showing StatefulSet ordered startup and shutdown.

---

## Slide 9: Helm + Ingress + StatefulSet Together (1 minute)

### The Integration Challenge

**Scenario:** Helm chart deploying PostgreSQL (StatefulSet) with Ingress for admin UI.

**Dependency Chain:**
```
Helm Chart
  ├── StatefulSet (PostgreSQL)
  │   ├── Headless Service
  │   └── PVC (per pod)
  ├── Service (admin UI)
  └── Ingress (external access)
```

**Troubleshooting Flow:**
1. Check Helm release status
2. Verify StatefulSet pods running
3. Check PVCs bound
4. Verify services have endpoints
5. Test Ingress routing

**Common Issues:**
- Helm values not propagating
- StatefulSet PVCs not binding
- Ingress referencing wrong service
- Namespace mismatches
- Port configuration errors

---

## Slide 10: Troubleshooting Methodology for Complex Systems (1.5 minutes)

### Layer-by-Layer Approach

**Layer 1: Helm (if applicable)**
```bash
helm list  # Is release installed?
helm status <release>  # What's the state?
helm get values <release>  # What values were used?
helm get manifest <release>  # What was deployed?
```

**Layer 2: StatefulSet (if applicable)**
```bash
kubectl get statefulset
kubectl describe statefulset <name>
kubectl get pods -l app=<name>  # Check all pods
kubectl get pvc  # Check per-pod volumes
```

**Layer 3: Services**
```bash
kubectl get svc
kubectl get endpoints
# For StatefulSet: check headless service exists
```

**Layer 4: Ingress (if applicable)**
```bash
kubectl get ingress
kubectl describe ingress <name>
# Check ingress controller pods running
```

**Layer 5: Network Connectivity**
```bash
# Test from within cluster
kubectl run test --image=busybox -it --rm -- wget -O- http://service:80

# Test Ingress
curl -H "Host: app.local" http://localhost:8000
```

**Visual:** Layered architecture diagram with checkpoints at each layer.

---

## Slide 11: CKAD Candidates - What to Focus On (1 minute)

### Core CKAD Topics (Priority)

✅ **Master these first:**
- Deployments (not StatefulSets for most scenarios)
- Services (ClusterIP, NodePort, LoadBalancer)
- Basic Ingress resources (simple routing)
- ConfigMaps and Secrets
- PVC usage with Deployments
- Basic troubleshooting commands

### Advanced Topics (After CKAD)

📚 **Learn later:**
- Helm chart creation
- StatefulSet advanced patterns
- Complex Ingress configurations
- Custom controllers

### What to Take Away

**Even if not exam-required:**
- Systematic debugging approach transfers
- Layer-by-layer troubleshooting applies everywhere
- Understanding dependencies is universal
- kubectl commands work for all resource types

---

## Slide 12: Key Takeaways (1 minute)

**Essential Concepts:**

1. **Helm troubleshooting starts with template validation**
2. **Ingress requires controller to be installed**
3. **StatefulSets have ordered startup/shutdown**
4. **Complex systems need layer-by-layer debugging**
5. **Check dependencies before assuming resource issues**

**Troubleshooting Priority:**
1. Verify controller/operator installed (Ingress, StatefulSet)
2. Check Helm values and rendered templates
3. Verify StatefulSet PVCs are bound
4. Check services have endpoints
5. Test Ingress routing with correct host headers

**For CKAD Candidates:**
- Focus on core topics first
- Return to advanced content after passing
- Apply same systematic troubleshooting approach
- Practice with basic resources before complex ones

**Remember:** Advanced troubleshooting builds on foundational skills. Master the basics first!

---

**Total Time:** 10-12 minutes
**Next:** Hands-on troubleshooting with Helm chart containing Ingress and StatefulSet
**Note:** This is enrichment content beyond CKAD requirements
