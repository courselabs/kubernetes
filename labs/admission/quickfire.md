# Admission Controllers - Quickfire Questions

Test your knowledge of Kubernetes Admission Controllers with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is an Admission Controller in Kubernetes?

A) A monitoring tool
B) A network policy enforcer
C) A plugin that intercepts API requests before objects are persisted
D) A component that schedules Pods

### 2. When do Admission Controllers run in the API request flow?

A) Before authentication
B) During Pod scheduling
C) After authentication and authorization, before persistence
D) After object creation

### 3. What are the two types of Admission Webhooks?

A) Pre and Post
B) Creating and Updating
C) Mutating and Validating
D) Allow and Deny

### 4. What can a Mutating Admission Webhook do?

A) Modify (mutate) objects before they are persisted
B) Monitor resource changes
C) Only reject requests
D) Delete existing objects

### 5. What is the PodSecurityAdmission controller used for?

A) Scanning for vulnerabilities
B) Managing Pod networking
C) Encrypting Pod data
D) Enforcing Pod Security Standards (restricted, baseline, privileged)

### 6. Which admission controller automatically injects sidecar containers?

A) ContainerInjection
B) PodPreset
C) SidecarInjector
D) MutatingAdmissionWebhook (custom implementation)

### 7. What does the NamespaceLifecycle admission controller prevent?

A) Creating too many namespaces
B) Deleting system namespaces
C) Creating resources in non-existent or terminating namespaces
D) Cross-namespace communication

### 8. What is the LimitRanger admission controller responsible for?

A) Rate limiting API requests
B) Network bandwidth limiting
C) Limiting the number of Pods
D) Enforcing resource limits and requests based on LimitRange objects

### 9. How do you configure which admission controllers are enabled?

A) Via RBAC rules
B) Via ConfigMap
C) Via API server flags (--enable-admission-plugins)
D) Via kubectl commands

### 10. What is the purpose of the ResourceQuota admission controller?

A) To calculate billing
B) To monitor resource usage
C) To enforce resource consumption limits in namespaces
D) To optimize resource allocation

---

## Answers

1. **C** - Admission Controllers are plugins that intercept Kubernetes API requests after authentication and authorization but before the object is persisted to etcd.

2. **C** - Admission Controllers run after a request has been authenticated and authorized but before the object is persisted to the cluster's datastore.

3. **C** - The two types of Admission Webhooks are Mutating (which can modify objects) and Validating (which can only accept or reject requests).

4. **A** - Mutating Admission Webhooks can modify (mutate) objects during the admission process, such as adding labels, annotations, or injecting sidecar containers.

5. **D** - PodSecurityAdmission enforces Pod Security Standards (restricted, baseline, privileged) at the namespace level, replacing the deprecated PodSecurityPolicy.

6. **D** - Custom MutatingAdmissionWebhooks are commonly used to inject sidecar containers (e.g., Istio's envoy proxy, Vault agent injector).

7. **C** - NamespaceLifecycle prevents creating objects in namespaces that don't exist or are being terminated, and prevents deletion of system namespaces.

8. **D** - LimitRanger enforces LimitRange constraints in a namespace, setting default requests/limits and enforcing minimum/maximum values for resources.

9. **C** - Admission controllers are configured via API server startup flags: `--enable-admission-plugins` and `--disable-admission-plugins`.

10. **C** - ResourceQuota admission controller enforces ResourceQuota constraints, ensuring that resource consumption (CPU, memory, object counts) doesn't exceed defined limits.

---

## Study Resources

- [Lab README](README.md) - Admission controller concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific admission topics
- [Official Admission Controllers Documentation](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/)
