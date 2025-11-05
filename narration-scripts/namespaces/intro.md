# Namespaces - Concept Introduction
## Narration Script for Slideshow Presentation
**Duration:** 8-10 minutes

---

## Slide 1: Introduction (0:00 - 0:45)

**Title: Isolating Workloads with Namespaces**

Welcome to this session on Kubernetes Namespaces. Today we'll explore one of Kubernetes' most powerful organizational features.

Namespaces allow you to partition a single Kubernetes cluster into multiple virtual clusters. This enables you to:
- Run multiple environments (dev, test, prod) on one cluster
- Isolate different applications or teams
- Apply resource quotas and limits per namespace
- Manage access controls at the namespace level

This is a core CKAD exam topic, so understanding namespaces is essential for both the certification and real-world Kubernetes operations.

**[Transition to next slide]**

---

## Slide 2: The Multi-Tenancy Problem (0:45 - 2:00)

**Title: Why Namespaces Matter**

Imagine you're running a large Kubernetes cluster with:
- 50 different applications
- Multiple teams (platform, data, web, mobile)
- Different environments (dev, staging, production)
- Hundreds of Pods, Services, and ConfigMaps

Without organization, this becomes chaos:
- Name collisions between applications
- Accidental deletion of production resources
- Resource contention - one app consuming all cluster resources
- Difficult access control - everyone can see everything
- No cost tracking per team or application

**Namespaces solve these problems** by providing logical isolation within a single physical cluster.

**[Transition to next slide]**

---

## Slide 3: What Are Namespaces? (2:00 - 3:15)

**Title: Understanding Namespace Architecture**

A namespace is a **virtual cluster boundary** within your physical cluster.

**Key characteristics:**
- Namespaces contain resources (Pods, Services, ConfigMaps, etc.)
- Resources in one namespace are isolated from another
- Names must be unique within a namespace, but can be reused across namespaces
- You can have a "web" service in both "dev" and "prod" namespaces
- Namespaces are flat - they cannot be nested

**Default namespaces in every cluster:**
- **default** - Where resources go if no namespace is specified
- **kube-system** - Kubernetes system components (DNS, dashboard, etc.)
- **kube-public** - Publicly readable resources
- **kube-node-lease** - Node heartbeat information (Kubernetes 1.13+)

Think of namespaces as folders in a filesystem - they organize and separate content, but everything still runs on the same underlying infrastructure.

**[Transition to next slide]**

---

## Slide 4: Namespace Scoping (3:15 - 4:30)

**Title: What's Namespaced and What's Not?**

Not all Kubernetes resources are namespace-scoped. Understanding this distinction is critical.

**Namespace-scoped resources:**
- Pods, Deployments, ReplicaSets, StatefulSets
- Services, Endpoints
- ConfigMaps, Secrets
- ServiceAccounts
- PersistentVolumeClaims
- ResourceQuotas, LimitRanges
- NetworkPolicies, Ingresses

**Cluster-scoped resources:**
- Nodes
- Namespaces themselves
- PersistentVolumes
- StorageClasses
- ClusterRoles, ClusterRoleBindings

**Why does this matter?**
- Namespace-scoped resources need `-n namespace` flag
- Cluster-scoped resources are global, visible to all
- PersistentVolumes are cluster-wide; PersistentVolumeClaims are namespace-specific

**Exam tip:** Use `kubectl api-resources --namespaced=true` to list all namespace-scoped resources.

**[Transition to next slide]**

---

## Slide 5: Resource Quotas (4:30 - 6:00)

**Title: Controlling Resource Usage**

Resource Quotas limit the total resources that can be consumed in a namespace.

**What can be limited:**

**Compute resources:**
- CPU requests and limits (total across all Pods)
- Memory requests and limits
- Example: Maximum 4 CPU cores and 8GB RAM for the "dev" namespace

**Object counts:**
- Maximum number of Pods, Services, ConfigMaps, Secrets
- Maximum number of PersistentVolumeClaims
- Example: Limit "test" namespace to 10 Pods

**Storage:**
- Total storage requests across all PVCs
- Storage by StorageClass

**Critical behavior:** When a namespace has ResourceQuota for CPU or memory, **every Pod must specify resource requests and limits**, or it will be rejected.

**Use cases:**
- Prevent runaway applications from consuming all cluster resources
- Fair resource allocation among teams
- Cost management in cloud environments
- Enforce capacity planning

**[Transition to next slide]**

---

## Slide 6: Limit Ranges (6:00 - 7:00)

**Title: Default and Constrained Resource Limits**

LimitRanges work alongside ResourceQuotas but at the Pod/container level.

**What LimitRanges provide:**

**1. Default values:**
- If a Pod doesn't specify resources, LimitRange applies defaults
- Prevents the "must specify resources" error with quotas

**2. Min/Max constraints:**
- Enforce minimum resource requests (no tiny containers)
- Enforce maximum limits (no huge containers)

**3. Request/Limit ratios:**
- Ensure limits aren't too far above requests (prevents overcommitment)

**Example scenario:**
```yaml
LimitRange in "production" namespace:
- Default CPU request: 100m, limit: 200m
- Default memory request: 128Mi, limit: 256Mi
- Max CPU per container: 2 cores
- Max memory per container: 2Gi
```

**Key difference from ResourceQuota:**
- ResourceQuota: **Total** resources for the entire namespace
- LimitRange: **Per-container** or **per-Pod** constraints

**[Transition to next slide]**

---

## Slide 7: Cross-Namespace Communication (7:00 - 8:15)

**Title: Service Discovery Across Namespaces**

Services are namespace-scoped, but Pods can communicate across namespaces using DNS.

**DNS naming patterns:**

**1. Short name (same namespace only):**
```
web-service
```
Only resolves within the same namespace

**2. Namespace-qualified:**
```
web-service.production
```
Resolves from any namespace

**3. Fully-qualified domain name (FQDN):**
```
web-service.production.svc.cluster.local
```
Complete, unambiguous service address

**Networking note:** Kubernetes networking is flat - any Pod can reach any other Pod by IP address, regardless of namespace. Namespaces provide logical isolation, not network isolation.

**For network isolation, use NetworkPolicies** - they can restrict traffic based on namespace labels.

**[Transition to next slide]**

---

## Slide 8: ConfigMaps and Secrets Scoping (8:15 - 9:00)

**Title: Configuration Data is Namespace-Bound**

ConfigMaps and Secrets are namespace-scoped resources that **cannot be shared across namespaces**.

**Key implications:**

**1. Each namespace needs its own configuration:**
- Can't reference a ConfigMap from namespace "shared" in a Pod in namespace "app"
- Must create duplicate ConfigMaps in each namespace
- Or use tools like Kustomize/Helm to manage duplicates

**2. Service discovery across namespaces:**
- ConfigMap in "backend" namespace with database URL
- Frontend in "frontend" namespace needs that URL
- Solution: Use FQDN service names (db.backend.svc.cluster.local)

**Best practices:**
- Store environment-specific config in each namespace
- Use consistent naming across namespaces
- Document cross-namespace dependencies
- Consider using a configuration management tool

**[Transition to next slide]**

---

## Slide 9: Namespace Contexts (9:00 - 9:45)

**Title: Managing Your Working Namespace**

Every kubectl command operates against a namespace. You can specify it three ways:

**1. Using the -n flag (explicit):**
```bash
kubectl get pods -n production
kubectl apply -f app.yaml -n staging
```
Pros: Clear and explicit, no mistakes
Cons: Verbose, easy to forget

**2. Setting context namespace (implicit):**
```bash
kubectl config set-context --current --namespace production
kubectl get pods  # Now defaults to production
```
Pros: Less typing, cleaner commands
Cons: Easy to forget which namespace you're in

**3. Namespace in YAML (declarative):**
```yaml
metadata:
  name: web-app
  namespace: production
```
Pros: Self-documenting, version-controlled
Cons: Less flexible, harder to reuse YAML across namespaces

**Exam strategy:** Use context switching for focused work on one namespace. Use -n flag when jumping between namespaces to avoid mistakes.

**[Transition to next slide]**

---

## Slide 10: Namespace Lifecycle (9:45 - 10:00)

**Title: Creating and Deleting Namespaces**

Namespaces have an important lifecycle behavior to understand:

**Creation is simple:**
```bash
kubectl create namespace development
```

**Deletion is powerful:**
```bash
kubectl delete namespace development
```

**WARNING: Deleting a namespace deletes EVERYTHING inside it:**
- All Pods, Services, Deployments
- All ConfigMaps, Secrets
- All PersistentVolumeClaims
- Cannot be undone!

**Namespace deletion is async:**
- Namespace enters "Terminating" state
- Kubernetes deletes all resources inside
- Finalizers may delay deletion
- Can take minutes for large namespaces

**Best practice:**
- Use labels for bulk deletion within a namespace
- Be extremely careful with production namespaces
- Consider RBAC to prevent accidental deletion
- Always verify namespace before running delete commands

**[End of presentation]**

---

## Summary Points for Q&A

Key takeaways participants should understand:
1. Namespaces provide logical isolation within a cluster
2. Resources are either namespace-scoped or cluster-scoped
3. ResourceQuotas limit total resources per namespace
4. LimitRanges set per-Pod/container defaults and constraints
5. Services can be accessed across namespaces using FQDN
6. ConfigMaps and Secrets cannot be shared across namespaces
7. Context switching helps manage working namespace
8. Deleting a namespace deletes all resources inside it

---

## Transition to Exercises

"Now that you understand namespace concepts, let's put them into practice. In the exercises section, we'll:
- Create and manage namespaces
- Deploy applications across multiple namespaces
- Apply resource quotas and observe their effects
- Practice cross-namespace service discovery
- Learn context switching techniques

Let's see namespaces in action!"
