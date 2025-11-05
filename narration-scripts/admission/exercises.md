# Admission Control - Practical Demo
## Narration Script for Hands-On Exercises (15-18 minutes)

### Section 1: Setup and Custom Webhooks (4 min)
**[00:00-04:00]**

Welcome to the admission control hands-on lab. We'll deploy custom admission webhooks, see them in action, then use OPA Gatekeeper for policy enforcement.

First, let's deploy cert-manager to handle TLS certificates for our webhooks:

```bash
kubectl apply -f labs/admission/specs/cert-manager
kubectl get pods -n cert-manager --watch
```

Admission webhooks require HTTPS with trusted certificates. Cert-manager automates certificate generation. Now create a self-signed issuer:

```bash
kubectl apply -f labs/admission/specs/cert-manager/issuers
kubectl describe issuer selfsigned
```

The webhook server is a Node.js application that validates Pod specifications:

```bash
kubectl apply -f labs/admission/specs/webhook-server
kubectl get certificate
kubectl describe secret admission-webhook-cert
```

Test the HTTPS endpoint:

```bash
kubectl apply -f labs/admission/specs/sleep
kubectl exec sleep -- curl https://admission-webhook.default.svc
```

You see a certificate error - that's expected as curl doesn't trust our self-signed cert.

---

### Section 2: Validating Webhooks in Action (4 min)
**[04:00-08:00]**

Now let's configure the validating webhook:

```bash
kubectl apply -f labs/admission/specs/validating-webhook
kubectl describe validatingwebhookconfiguration servicetokenpolicy
```

This webhook rejects Pods that don't set automountServiceAccountToken to false. Let's test:

```bash
kubectl apply -f labs/admission/specs/whoami
kubectl get deploy whoami
kubectl describe deploy whoami
```

The Deployment exists but no Pods run. Check the ReplicaSet:

```bash
kubectl describe rs -l app=whoami
```

See the admission error: "automountServiceAccountToken must be set to false". The webhook blocked Pod creation.

Fix it:

```bash
kubectl apply -f labs/admission/specs/whoami/fix
kubectl get pods -l app=whoami
```

Now Pods run because they meet the webhook's requirements.

---

### Section 3: Mutating Webhooks (3 min)
**[08:00-11:00]**

Mutating webhooks modify resources automatically. Deploy one:

```bash
kubectl apply -f labs/admission/specs/mutating-webhook
kubectl describe mutatingwebhookconfiguration nonrootpolicy
```

This webhook adds securityContext.runAsNonRoot=true to all Pods. Deploy the pi app:

```bash
kubectl apply -f labs/admission/specs/pi
kubectl get pods -l app=pi-web
kubectl describe pod -l app=pi-web
```

The Pod shows CreateContainerConfigError. The webhook set runAsNonRoot=true, but the nginx image runs as root by default. Fix with a non-root image:

```bash
kubectl apply -f labs/admission/specs/pi/fix
kubectl get pods -l app=pi-web
```

This demonstrates mutating webhooks silently changing your specs.

---

### Section 4: OPA Gatekeeper (4 min)
**[11:00-15:00]**

Clean up custom webhooks and deploy Gatekeeper:

```bash
kubectl delete ns,all,ValidatingWebhookConfiguration,MutatingWebhookConfiguration -l kubernetes.courselabs.co=admission
kubectl apply -f labs/admission/specs/opa-gatekeeper
kubectl get crd | grep gatekeeper
```

Create constraint templates (policy definitions):

```bash
kubectl apply -f labs/admission/specs/opa-gatekeeper/templates
kubectl get crd | grep constraints
```

Gatekeeper created CRDs for each template. Now create constraints (policy instances):

```bash
kubectl apply -f labs/admission/specs/opa-gatekeeper/constraints
kubectl get requiredlabels
kubectl describe requiredlabels requiredlabels-ns
```

The description shows existing violations. Gatekeeper policies are discoverable through kubectl.

---

### Section 5: Lab Challenge and Cleanup (2 min)
**[15:00-17:00]**

Deploy the APOD app - it will fail due to policy violations:

```bash
kubectl apply -f labs/admission/specs/apod
```

Your task: Fix the manifests to satisfy these policies:
1. Namespace needs label: kubernetes.courselabs.co
2. Pods need labels: app and version
3. Pods in apod namespace need resource limits

Solution approach: Edit YAML files to add required labels and resource limits, then reapply.

Cleanup:

```bash
kubectl delete ns -l kubernetes.courselabs.co=admission
kubectl delete crd -l gatekeeper.sh/system
```

Summary: We saw how validating webhooks enforce policies, mutating webhooks modify resources, and Gatekeeper provides declarative policy management. Key takeaway: Always check ReplicaSet events when Deployments don't create Pods - that's where admission errors appear.
