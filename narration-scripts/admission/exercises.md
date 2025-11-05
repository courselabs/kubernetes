# Admission Control - Practical Demo
## Narration Script for Hands-On Exercises (15-18 minutes)

### Section 1: Setup and Custom Webhooks (4 min)
**[00:00-04:00]**

Welcome to the admission control hands-on lab. We'll deploy custom admission webhooks, see them in action, then use OPA Gatekeeper for policy enforcement.

First, let's deploy cert-manager to handle TLS certificates for our webhooks.

Admission webhooks require HTTPS with trusted certificates. Cert-manager automates certificate generation. Now we'll create a self-signed issuer.

The webhook server is a Node.js application that validates Pod specifications.

Now let's test the HTTPS endpoint.

You'll see a certificate error - that's expected as curl doesn't trust our self-signed cert.

---

### Section 2: Validating Webhooks in Action (4 min)
**[04:00-08:00]**

Now let's configure the validating webhook.

This webhook rejects Pods that don't set automountServiceAccountToken to false. Let's test it.

The Deployment exists but no Pods run. Check the ReplicaSet to see why.

See the admission error: "automountServiceAccountToken must be set to false". The webhook blocked Pod creation.

Now let's fix it by applying the corrected configuration.

Now Pods run because they meet the webhook's requirements.

---

### Section 3: Mutating Webhooks (3 min)
**[08:00-11:00]**

Mutating webhooks modify resources automatically. Let's deploy one.

This webhook adds securityContext.runAsNonRoot=true to all Pods. Let's deploy the pi app to see this in action.

The Pod shows CreateContainerConfigError. The webhook set runAsNonRoot=true, but the nginx image runs as root by default. Let's fix this with a non-root image.

This demonstrates how mutating webhooks can silently change your specifications.

---

### Section 4: OPA Gatekeeper (4 min)
**[11:00-15:00]**

Let's clean up the custom webhooks and deploy Gatekeeper.

Now we'll create constraint templates, which are policy definitions.

Gatekeeper created CRDs for each template. Now we'll create constraints, which are policy instances.

The description shows existing violations. Gatekeeper policies are discoverable through kubectl, which makes them easy to work with.

---

### Section 5: Lab Challenge and Cleanup (2 min)
**[15:00-17:00]**

Let's deploy the APOD app - it will fail due to policy violations.

Your task is to fix the manifests to satisfy these policies:
1. Namespace needs label: kubernetes.courselabs.co
2. Pods need labels: app and version
3. Pods in apod namespace need resource limits

Solution approach: Edit YAML files to add required labels and resource limits, then reapply.

Time for cleanup.

Summary: We saw how validating webhooks enforce policies, mutating webhooks modify resources, and Gatekeeper provides declarative policy management. Key takeaway: Always check ReplicaSet events when Deployments don't create Pods - that's where admission errors appear.

---

## Recording Notes

**Timing:**
- Section 1: 4 minutes
- Section 2: 4 minutes
- Section 3: 3 minutes
- Section 4: 4 minutes
- Section 5: 2 minutes
- Total: 17 minutes

**Key Points:**
- Emphasize the difference between validating and mutating webhooks
- Show how admission errors appear in ReplicaSet events, not Pod events
- Demonstrate that Gatekeeper provides better discoverability than custom webhooks
- Highlight that mutating webhooks can cause unexpected behavior

**Visual Focus:**
- Show certificate generation with cert-manager
- Highlight the admission error messages in describe output
- Display how Gatekeeper constraints show violations
- Keep terminal output visible for key commands
