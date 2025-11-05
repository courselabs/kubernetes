# Admission Control - Concept Introduction
## Narration Script for Slideshow (10-12 minutes)

---

### Slide 1: Introduction to Admission Control (1 min)
**[00:00-01:00]**

Welcome to this session on Kubernetes Admission Control. This advanced topic, while beyond core CKAD requirements, is crucial for understanding how Kubernetes enforces policies and validates resources.

Admission control sits between the Kubernetes API server and resource persistence. It's the final gatekeeper that can validate, mutate, or reject your resource requests before they're stored in etcd.

We'll cover three main areas:
- What admission controllers are and when they run
- Validating webhooks that enforce policies
- Mutating webhooks that automatically modify resources
- OPA Gatekeeper as a policy framework

Understanding admission control helps you troubleshoot mysterious deployment failures and implement security policies.

---

### Slide 2: The Kubernetes API Request Flow (1 min)
**[01:00-02:00]**

To understand admission control, let's trace what happens when you run kubectl apply.

First, your request reaches the API server and goes through **authentication** - proving who you are. Then **authorization** checks what you're allowed to do using RBAC or other authorization modes.

After passing authentication and authorization, your request enters the **admission control phase**. This is where admission controllers examine and potentially modify your request.

There are two types: **mutating admission** runs first and can modify the object, like injecting sidecar containers or adding default values. Then **validating admission** runs and can accept or reject the object based on policies.

Only after passing all admission controllers is the object **persisted to etcd**. This means admission control is your last line of defense - it can prevent invalid or insecure configurations from entering your cluster.

---

### Slide 3: Why Admission Control Matters (1 min)
**[02:00-03:00]**

Admission control serves several critical purposes in Kubernetes operations.

**Security enforcement**: You can require all containers to run as non-root users, block privileged containers, or enforce image registries. This prevents dangerous configurations from being deployed.

**Policy compliance**: Ensure all resources have required labels, stay within resource limits, or follow naming conventions. This maintains organizational standards.

**Automatic configuration**: Inject environment variables, add sidecar containers for logging or monitoring, or apply default resource limits. This reduces manual configuration and ensures consistency.

**Multi-tenancy**: Prevent teams from interfering with each other by enforcing namespace quotas, network policies, or resource limits.

For CKAD, you won't implement admission controllers, but you will encounter scenarios where admission policies block your deployments. Understanding how they work helps you troubleshoot these issues quickly.

---

### Slide 4: Built-in Admission Controllers (1 min)
**[03:00-04:00]**

Kubernetes includes many built-in admission controllers, some always enabled by default.

**NamespaceLifecycle** prevents operations in namespaces that are being deleted or don't exist. This is why you can't create resources in terminating namespaces.

**LimitRanger** enforces LimitRange constraints, applying default resource requests and limits to containers that don't specify them.

**ResourceQuota** enforces namespace quotas on CPU, memory, Pod count, and other resources. It's why deployments sometimes fail with "exceeded quota" errors.

**ServiceAccount** automatically injects the default service account into Pods that don't specify one. This is why every Pod has credentials to access the Kubernetes API.

**PodSecurity** enforces Pod Security Standards (baseline, restricted, privileged), replacing the deprecated PodSecurityPolicy. This is increasingly important for security.

These controllers run automatically. As a developer, you see their effects when deployments are rejected or modified.

---

### Slide 5: Validating Admission Webhooks (1 min)
**[04:00-05:00]**

Validating admission webhooks are custom HTTP servers that can accept or reject resource requests based on your organization's policies.

When a resource is created or updated, Kubernetes calls your webhook server with the resource details. Your webhook examines the request and returns either "allowed: true" or "allowed: false" with a reason.

Common use cases include:
- Requiring specific labels on all resources
- Enforcing image registry whitelists
- Validating resource naming conventions
- Checking that security contexts are properly configured
- Preventing use of certain features or APIs

The webhook server typically runs as a Deployment inside your cluster, exposed via a Service. The webhook must be served over HTTPS with a valid TLS certificate - Kubernetes won't call insecure webhooks.

When a validating webhook rejects a request, the resource isn't created, and the user sees an error message explaining why. This makes policies explicit and enforceable.

---

### Slide 6: Mutating Admission Webhooks (1 min)
**[05:00-06:00]**

While validating webhooks say "yes" or "no," mutating webhooks can actually modify the resource before it's created.

Mutating webhooks run before validating webhooks. They receive the resource specification and can return a JSON patch that modifies it. Kubernetes applies these modifications before continuing with validation.

Common mutations include:
- Injecting sidecar containers for logging, monitoring, or service mesh
- Adding environment variables or volume mounts
- Setting default security contexts or resource limits
- Adding labels or annotations automatically
- Rewriting image references to use a local registry

For example, a service mesh like Istio uses mutating webhooks to inject the Envoy sidecar proxy into every Pod. You don't modify your Deployment specs - the webhook does it automatically.

The key difference: validating webhooks are about enforcement, mutating webhooks are about automation. Both are powerful tools for cluster administrators to ensure consistency and security.

---

### Slide 7: Webhook Configuration (1 min)
**[06:00-07:00]**

Configuring admission webhooks requires creating ValidatingWebhookConfiguration or MutatingWebhookConfiguration resources.

These configurations specify:
- **Which resources and operations trigger the webhook** - like Pods on CREATE and UPDATE
- **The webhook server endpoint** - typically a ClusterIP Service URL
- **Namespace and object selectors** - to limit which resources are affected
- **Failure policy** - what happens if the webhook server is unavailable (Ignore or Fail)

The CA bundle field contains the certificate authority that signed the webhook server's TLS certificate. This is how Kubernetes trusts the HTTPS connection.

A critical consideration is the **failure policy**. If set to Fail and your webhook server is down, no resources matching the rules can be created. This can lock you out of your cluster. If set to Ignore, operations continue when the webhook is unavailable.

For development and testing, webhooks often use namespace selectors to avoid affecting system namespaces like kube-system, preventing accidental lockouts.

---

### Slide 8: OPA Gatekeeper Introduction (1 min)
**[07:00-08:00]**

Open Policy Agent (OPA) Gatekeeper is a popular policy framework that implements admission control using a declarative policy language called Rego.

Rather than writing custom webhook servers in Python, Go, or Node.js, you write policies in Rego. Gatekeeper provides the webhook infrastructure, you just provide the policies.

Gatekeeper uses two key resources:
- **ConstraintTemplates** define generic policy rules (like "require specific labels")
- **Constraints** create instances of templates with specific parameters (like "require labels: app and version")

The advantage is discoverability. Custom webhooks are black boxes - you don't know what policies exist without external documentation. Gatekeeper constraints are Kubernetes resources you can list and describe, making policies visible and manageable through kubectl.

Gatekeeper also provides audit functionality, showing existing resources that violate policies. This helps you understand policy impact before enforcement.

---

### Slide 9: Pod Security Standards (1 min)
**[08:00-09:00]**

Pod Security Standards (PSS) are a modern, built-in admission control mechanism for enforcing Pod security policies.

There are three levels:
- **Privileged** - unrestricted, allows everything
- **Baseline** - minimally restrictive, prevents known privilege escalations
- **Restricted** - heavily restricted, follows Pod hardening best practices

PSS is applied at the namespace level using labels. For example:
pod-security.kubernetes.io/enforce=baseline

Three modes of enforcement:
- **enforce** - violations are rejected
- **audit** - violations are allowed but logged
- **warn** - violations are allowed but user sees a warning

Baseline prevents hostNetwork, hostPID, privileged containers, and other dangerous configurations. Restricted additionally requires running as non-root, dropping all capabilities, and other hardening measures.

PSS replaced PodSecurityPolicy, which was deprecated and removed in Kubernetes 1.25. For CKAD, understand PSS basics and recognize pod security errors.

---

### Slide 10: ResourceQuota and LimitRange Admission (1 min)
**[09:00-10:00]**

ResourceQuota and LimitRange are built-in admission controllers that manage resource consumption.

**ResourceQuota** enforces namespace-level limits on resources. When you try to create a Pod that would exceed the quota, the admission controller rejects it with a clear error message. Common quotas:
- pods: maximum number of Pods
- requests.cpu and requests.memory: sum of all requests
- limits.cpu and limits.memory: sum of all limits
- persistentvolumeclaims: number of PVCs

**LimitRange** enforces per-resource constraints and can set defaults. It defines minimum, maximum, and default values for resource requests and limits. When you create a container without specifying resources, LimitRange applies defaults automatically.

These are among the most common causes of mysterious deployment failures. You see errors like "exceeded quota: compute-resources, requested: limits.memory=2Gi, used: limits.memory=8Gi, limited: limits.memory=10Gi."

For troubleshooting, always check: kubectl describe resourcequota and kubectl describe limitrange in the namespace.

---

### Slide 11: Troubleshooting Admission Failures (1 min)
**[10:00-11:00]**

When admission controllers reject your resources, quick troubleshooting is essential.

Symptom: Deployment creates but Pods don't. First, check the ReplicaSet:
kubectl describe rs -l app=myapp

Admission errors appear in the ReplicaSet events, not the Deployment. Look for messages like:
- "admission webhook denied the request"
- "exceeded quota"
- "violates PodSecurity"
- "failed to create pod: admission webhook X denied"

Next steps:
1. Read the error message carefully - it usually tells you exactly what's wrong
2. Check namespace labels for Pod Security Standards
3. Check ResourceQuota: kubectl describe resourcequota -n namespace
4. Check LimitRange: kubectl describe limitrange -n namespace
5. List webhook configurations: kubectl get validatingwebhookconfiguration

For webhook errors, describe the webhook to understand what it's checking. For quota errors, either reduce resource requests or delete other resources.

The key skill is recognizing admission errors versus other failure types, then using the right kubectl commands to investigate.

---

### Slide 12: Summary and Key Takeaways (1 min)
**[11:00-12:00]**

Let's summarize admission control concepts.

**Admission controllers** sit between authorization and persistence, providing the final check on resource requests. They can validate, mutate, or reject operations.

**Built-in controllers** like LimitRanger, ResourceQuota, and PodSecurity handle common requirements automatically. Understanding these helps troubleshoot deployment issues.

**Validating webhooks** enforce custom policies by accepting or rejecting requests. They're about enforcement and compliance.

**Mutating webhooks** automatically modify resources, enabling automation and consistency without manual configuration.

**OPA Gatekeeper** provides a declarative framework for policies without writing webhook code. Policies become discoverable Kubernetes resources.

**Pod Security Standards** are the modern approach to Pod security, replacing PodSecurityPolicy. Know the three levels: privileged, baseline, restricted.

For CKAD: You won't implement admission control, but you must troubleshoot when it blocks your deployments. Remember: check ReplicaSet events for admission errors, understand ResourceQuota and LimitRange, and recognize Pod Security Standard violations.

Thank you for following along. The next session provides hands-on practice with these concepts.
