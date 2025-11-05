# Admission Controllers - Quickfire Questions

Test your knowledge of Kubernetes Admission Controllers with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is an Admission Controller in Kubernetes?

A) A component that schedules Pods
B) A plugin that intercepts API requests before objects are persisted
C) A network policy enforcer
D) A monitoring tool

### 2. When do Admission Controllers run in the API request flow?

A) Before authentication
B) After authentication and authorization, before persistence
C) After object creation
D) During Pod scheduling

### 3. What are the two types of Admission Webhooks?

A) Mutating and Validating
B) Creating and Updating
C) Allow and Deny
D) Pre and Post

### 4. What can a Mutating Admission Webhook do?

A) Only reject requests
B) Modify (mutate) objects before they are persisted
C) Delete existing objects
D) Monitor resource changes

### 5. What is the PodSecurityAdmission controller used for?

A) Encrypting Pod data
B) Enforcing Pod Security Standards (restricted, baseline, privileged)
C) Scanning for vulnerabilities
D) Managing Pod networking

### 6. Which admission controller automatically injects sidecar containers?

A) PodPreset
B) MutatingAdmissionWebhook (custom implementation)
C) SidecarInjector
D) ContainerInjection

### 7. What does the NamespaceLifecycle admission controller prevent?

A) Creating too many namespaces
B) Creating resources in non-existent or terminating namespaces
C) Deleting system namespaces
D) Cross-namespace communication

### 8. What is the LimitRanger admission controller responsible for?

A) Rate limiting API requests
B) Enforcing resource limits and requests based on LimitRange objects
C) Limiting the number of Pods
D) Network bandwidth limiting

### 9. How do you configure which admission controllers are enabled?

A) Via ConfigMap
B) Via API server flags (--enable-admission-plugins)
C) Via kubectl commands
D) Via RBAC rules

### 10. What is the purpose of the ResourceQuota admission controller?

A) To monitor resource usage
B) To enforce resource consumption limits in namespaces
C) To calculate billing
D) To optimize resource allocation

---

## Answers

1. **B** - Admission Controllers are plugins that intercept Kubernetes API requests after authentication and authorization but before the object is persisted to etcd.

2. **B** - Admission Controllers run after a request has been authenticated and authorized but before the object is persisted to the cluster's datastore.

3. **A** - The two types of Admission Webhooks are Mutating (which can modify objects) and Validating (which can only accept or reject requests).

4. **B** - Mutating Admission Webhooks can modify (mutate) objects during the admission process, such as adding labels, annotations, or injecting sidecar containers.

5. **B** - PodSecurityAdmission enforces Pod Security Standards (restricted, baseline, privileged) at the namespace level, replacing the deprecated PodSecurityPolicy.

6. **B** - Custom MutatingAdmissionWebhooks are commonly used to inject sidecar containers (e.g., Istio's envoy proxy, Vault agent injector).

7. **B** - NamespaceLifecycle prevents creating objects in namespaces that don't exist or are being terminated, and prevents deletion of system namespaces.

8. **B** - LimitRanger enforces LimitRange constraints in a namespace, setting default requests/limits and enforcing minimum/maximum values for resources.

9. **B** - Admission controllers are configured via API server startup flags: `--enable-admission-plugins` and `--disable-admission-plugins`.

10. **B** - ResourceQuota admission controller enforces ResourceQuota constraints, ensuring that resource consumption (CPU, memory, object counts) doesn't exceed defined limits.

---

## Study Resources

- [Lab README](README.md) - Admission controller concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific admission topics
- [Official Admission Controllers Documentation](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/)
