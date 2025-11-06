# Admission Control - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening (1 min)

Welcome to this deep dive on Kubernetes Admission Control. This is an advanced topic that sits at the intersection of security, policy enforcement, and troubleshooting - all critical areas for CKAD certification and real-world Kubernetes operations.

While you won't be implementing admission controllers in the CKAD exam, you will absolutely encounter scenarios where admission policies block your deployments. Understanding how admission control works helps you troubleshoot these mysterious failures quickly and effectively.

We'll explore what admission controllers are, how they enforce policies, the different types of webhooks you'll encounter, and most importantly - how to debug when admission control blocks you during the exam.

---

## Understanding the API Request Flow (2 min)

To understand admission control, let's trace what happens when you run kubectl apply to create a resource.

First, your request reaches the API server and goes through authentication - proving who you are. Then authorization checks what you're allowed to do using RBAC or other authorization modes.

After passing authentication and authorization, your request enters the admission control phase. This is the final gatekeeper before your resource is persisted to etcd. There are two types of admission controllers that run in sequence.

Mutating admission runs first and can modify your object - things like injecting sidecar containers or adding default values. Then validating admission runs and can accept or reject the object based on policies.

Only after passing all admission controllers is your object actually persisted to etcd. This means admission control is your last line of defense - it can prevent invalid or insecure configurations from ever entering your cluster.

This is why admission errors are particularly important to understand. By the time admission control rejects your resource, you've already passed authentication and authorization. The rejection isn't about permissions - it's about policy compliance or configuration requirements.

---

## Why Admission Control Matters (2 min)

Admission control serves several critical purposes in Kubernetes operations.

For security enforcement, you can require all containers to run as non-root users, block privileged containers, or enforce specific image registries. This prevents dangerous configurations from being deployed, even if users have RBAC permissions.

For policy compliance, admission control ensures all resources have required labels, stay within resource limits, or follow naming conventions. This maintains organizational standards across teams and applications.

For automatic configuration, mutating admission controllers can inject environment variables, add sidecar containers for logging or monitoring, or apply default resource limits. This reduces manual configuration and ensures consistency without requiring developers to remember every detail.

For multi-tenancy, admission control prevents teams from interfering with each other by enforcing namespace quotas, network policies, or resource limits. This is essential in shared cluster environments.

For CKAD specifically, you won't implement admission controllers, but you will encounter scenarios where admission policies block your deployments. Understanding how they work helps you troubleshoot these issues quickly during the time-pressured exam environment.

---

## Built-in Admission Controllers (2 min)

Kubernetes includes many built-in admission controllers, some always enabled by default. Let me highlight the ones you'll encounter most frequently.

NamespaceLifecycle prevents operations in namespaces that are being deleted or don't exist. This is why you can't create resources in terminating namespaces - it's not a bug, it's intentional protection.

LimitRanger enforces LimitRange constraints, applying default resource requests and limits to containers that don't specify them. This is why sometimes your containers have resource limits even though you didn't set them explicitly.

ResourceQuota enforces namespace quotas on CPU, memory, Pod count, and other resources. It's why deployments sometimes fail with "exceeded quota" errors even though you have RBAC permissions.

ServiceAccount automatically injects the default service account into Pods that don't specify one. This is why every Pod has credentials to access the Kubernetes API, even if you don't configure it.

PodSecurity enforces Pod Security Standards - baseline, restricted, or privileged. This replaced the deprecated PodSecurityPolicy and is increasingly important for security compliance.

These controllers run automatically and silently. As a developer, you typically only see their effects when deployments are rejected or your configurations are modified unexpectedly.

---

## Validating Admission Webhooks (2 min)

Validating admission webhooks are custom HTTP servers that can accept or reject resource requests based on your organization's specific policies.

When a resource is created or updated, Kubernetes calls your webhook server with the resource details as JSON. Your webhook examines the request and returns either "allowed: true" or "allowed: false" with a reason message.

Common use cases include requiring specific labels on all resources, enforcing image registry whitelists, validating resource naming conventions, checking that security contexts are properly configured, and preventing use of certain features or APIs.

The webhook server typically runs as a Deployment inside your cluster, exposed via a Service. The webhook must be served over HTTPS with a valid TLS certificate - Kubernetes won't call insecure webhooks.

When a validating webhook rejects a request, the resource isn't created, and you see an error message explaining why. This makes policies explicit and enforceable. However, from a troubleshooting perspective, these messages appear in unexpected places - not always where you first look.

In practice, when you deploy an application and the Deployment is created but no Pods appear, the admission error doesn't show up in the Deployment events. Instead, it appears in the ReplicaSet events. This is a critical troubleshooting technique for CKAD - always check the ReplicaSet when Pods don't appear.

---

## Mutating Admission Webhooks (2 min)

While validating webhooks say "yes" or "no," mutating webhooks can actually modify your resource before it's created.

Mutating webhooks run before validating webhooks. They receive the resource specification and can return a JSON patch that modifies it. Kubernetes applies these modifications before continuing with validation.

Common mutations include injecting sidecar containers for logging, monitoring, or service mesh proxies, adding environment variables or volume mounts, setting default security contexts or resource limits, adding labels or annotations automatically, and rewriting image references to use a local registry.

For example, a service mesh like Istio uses mutating webhooks to inject the Envoy sidecar proxy into every Pod. You don't modify your Deployment specs - the webhook does it automatically.

The key difference is that validating webhooks are about enforcement, while mutating webhooks are about automation. Both are powerful tools for cluster administrators.

However, mutating webhooks can cause unexpected behavior. Imagine you deploy a Pod and it fails with an error about running as non-root. You check your YAML and you never set runAsNonRoot anywhere. What happened? A mutating webhook added that security context automatically. This can be confusing when troubleshooting.

---

## OPA Gatekeeper Framework (2 min)

Open Policy Agent, or OPA Gatekeeper, is a popular policy framework that implements admission control using a declarative policy language called Rego.

Rather than writing custom webhook servers in Python, Go, or Node.js, you write policies in Rego. Gatekeeper provides all the webhook infrastructure - you just provide the policies.

Gatekeeper uses two key resources: ConstraintTemplates define generic policy rules, like "require specific labels on resources." Constraints create instances of templates with specific parameters, like "require labels app and version on all Pods."

The major advantage of Gatekeeper is discoverability. Custom webhooks are black boxes - you don't know what policies exist without external documentation or tribal knowledge. Gatekeeper constraints are Kubernetes resources you can list and describe using kubectl, making policies visible and manageable.

Gatekeeper also provides audit functionality, showing existing resources that violate policies. This helps you understand policy impact before enforcement and identify which resources need remediation.

From a CKAD perspective, if you encounter Gatekeeper in the exam, you can list constraints to see what policies are active, describe constraints to understand their requirements, and read the status section to see any violations.

---

## Pod Security Standards (2 min)

Pod Security Standards, or PSS, are a modern, built-in admission control mechanism for enforcing Pod security policies.

There are three levels: Privileged means unrestricted - allows everything. Baseline is minimally restrictive and prevents known privilege escalations. Restricted is heavily restricted and follows Pod hardening best practices.

PSS is applied at the namespace level using labels. For example, the label pod-security.kubernetes.io/enforce equals baseline would enforce baseline security in that namespace.

There are three modes of enforcement: enforce mode rejects violations, audit mode allows violations but logs them, and warn mode allows violations but shows a warning to the user.

Baseline prevents several dangerous configurations - hostNetwork, hostPID, hostIPC are not allowed. Privileged containers are blocked. HostPath volumes cannot be used. You can't add capabilities except for the safe ones.

Restricted mode additionally requires running as non-root, dropping ALL capabilities, setting a seccomp profile, and preventing privilege escalation.

PSS replaced PodSecurityPolicy, which was deprecated and removed in Kubernetes 1.25. For CKAD, understand PSS basics and recognize pod security errors when you see them. You'll need to modify security contexts to comply with the namespace policy.

---

## ResourceQuota and LimitRange (2 min)

ResourceQuota and LimitRange are built-in admission controllers that manage resource consumption and are frequent sources of deployment failures.

ResourceQuota enforces namespace-level limits on resources. When you try to create a Pod that would exceed the quota, the admission controller rejects it with a clear error message. Common quotas include pods for maximum number of Pods, requests.cpu and requests.memory for the sum of all requests, limits.cpu and limits.memory for the sum of all limits, and persistentvolumeclaims for the number of PVCs.

LimitRange enforces per-resource constraints and can set defaults. It defines minimum, maximum, and default values for resource requests and limits. When you create a container without specifying resources, LimitRange applies defaults automatically. This is why your containers sometimes have resource limits you didn't set.

These are among the most common causes of mysterious deployment failures in both real environments and the CKAD exam. You see errors like "exceeded quota: compute-resources, requested: limits.memory equals 2Gi, used: limits.memory equals 8Gi, limited: limits.memory equals 10Gi."

For troubleshooting, always check kubectl describe resourcequota and kubectl describe limitrange in the namespace. These commands show current usage, limits, and defaults, helping you understand what needs to change.

---

## Troubleshooting Admission Failures (3 min)

When admission controllers reject your resources, quick troubleshooting is essential, especially in the time-constrained CKAD exam environment.

The typical symptom is that your Deployment creates successfully but Pods don't appear. This is the key indicator of admission failures. The Deployment exists, kubectl shows it, but the desired replica count never matches the ready count.

First step: check the ReplicaSet, not the Deployment. Admission errors appear in the ReplicaSet events. Use kubectl describe replicaset with a label selector for your app.

Look for specific error patterns. "Admission webhook denied the request" means a validating webhook blocked you. "Exceeded quota" means ResourceQuota limits are reached. "Violates PodSecurity" means Pod Security Standards blocked you. "Failed to create pod: admission webhook X denied" gives you the webhook name.

Your troubleshooting workflow should be: First, read the error message carefully - it usually tells you exactly what's wrong and what field needs to change. Second, check namespace labels for Pod Security Standards using kubectl get namespace with show-labels. Third, check ResourceQuota using kubectl describe resourcequota. Fourth, check LimitRange using kubectl describe limitrange. Fifth, list webhook configurations using kubectl get validatingwebhookconfiguration or get constraints if Gatekeeper is installed.

For webhook errors, describe the webhook or constraint to understand what it's checking. For quota errors, either reduce resource requests in your Pod spec, delete other resources to free quota, or scale down other deployments.

The key skill is recognizing admission errors versus other failure types, then using the right kubectl commands to investigate quickly.

---

## Common CKAD Scenarios (3 min)

Let me walk through common scenarios you'll encounter in the CKAD exam.

Scenario one: Deployment not creating Pods. You create a Deployment and it exists, but kubectl get pods shows nothing. You describe the Deployment and see "0 of 3 replicas ready" but no clear error. This is an admission failure. Check the ReplicaSet - that's where the error appears. You might see "admission webhook denied the request: must provide labels app and version." The fix is adding those labels to your Pod template metadata.

Scenario two: Pod Security violation. You create a Pod and see an error "violates PodSecurity baseline: hostNetwork equals true." The namespace enforces baseline security which blocks hostNetwork. The fix is removing hostNetwork from your Pod spec, or if truly necessary, checking if you can change the namespace policy.

Scenario three: ResourceQuota exceeded. Your Pod creation fails with "exceeded quota: compute-quota, requested: requests.memory equals 2Gi." You describe the resource quota and see memory requests at 8Gi of 10Gi. You only have 2Gi headroom, so your 2Gi Pod would exceed it. Options: reduce your Pod's memory request to 1Gi, delete another Pod to free quota, or scale down another deployment.

Scenario four: LimitRange maximum exceeded. Error says "maximum memory usage per Container is 1Gi, requested 2Gi." You describe limitrange and see max memory is 1Gi. You must reduce your container's memory limit to 1Gi or less.

Scenario five: Missing required labels from Gatekeeper. Error says "you must provide label: app." You list requiredlabels constraints, describe the constraint to see requirements, and add the app label to your metadata.

---

## Exam Strategy and Time Management (2 min)

Here's a practical checklist for handling admission issues during the CKAD exam.

If your deployment exists but no Pods appear, immediately check the ReplicaSet. Don't waste time looking at the Deployment events - the error is in the ReplicaSet.

If the error mentions a webhook, read the message completely and fix the specified field. The error usually tells you exactly what to add or change.

If it mentions quota, run kubectl describe resourcequota in the namespace. Check current usage versus limits and decide whether to reduce your requests or free up existing quota.

If it mentions PodSecurity, check namespace labels with kubectl get namespace your-namespace show-labels. Then adjust your security context to meet the baseline or restricted requirements.

If you're still stuck, check LimitRange and look at recent events across the namespace.

Time-saving commands: kubectl describe replicaset with tail to see just recent events. kubectl get namespace with show-labels. kubectl describe resourcequota. kubectl get constraints for Gatekeeper policies.

Common mistakes to avoid: checking the Deployment instead of the ReplicaSet for admission errors. Not reading the full error message - the details matter. Forgetting about namespace-scoped policies like Pod Security Standards. Not verifying quota or limits after making changes.

Practice identifying admission errors in under two minutes. Don't let admission questions consume more than five minutes of exam time. Move on if stuck - you can come back to it.

---

## Summary and Key Takeaways (1 min)

Let's summarize the critical concepts for admission control.

Admission controllers sit between authorization and persistence, providing the final check on resource requests. They can validate, mutate, or reject operations.

Built-in controllers like LimitRanger, ResourceQuota, and PodSecurity handle common requirements automatically. Understanding these helps troubleshoot deployment issues quickly.

Validating webhooks enforce custom policies by accepting or rejecting requests. Mutating webhooks automatically modify resources. Both can cause unexpected deployment failures.

OPA Gatekeeper provides a declarative framework for policies where constraints are discoverable Kubernetes resources.

Pod Security Standards are the modern approach to Pod security with three levels: privileged, baseline, and restricted.

For CKAD success: admission errors appear in ReplicaSet events, not Deployment events. Always check the ReplicaSet first when Pods don't appear. Understand ResourceQuota and LimitRange troubleshooting. Recognize Pod Security Standard violations and know how to fix security contexts.

Remember - admission control is about policy enforcement, not permissions. If you pass RBAC but still can't create resources, it's admission control blocking you.

Thank you for listening. Good luck with your CKAD preparation!
