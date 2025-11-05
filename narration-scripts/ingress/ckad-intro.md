# Ingress - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now practiced installing Ingress controllers, creating Ingress resources with host and path-based routing, configuring TLS termination, and troubleshooting routing issues.

Here's what you need to know for CKAD: Ingress is guaranteed exam content. You'll create Ingress resources with routing rules, potentially configure TLS, and troubleshoot when routing doesn't work. The exam expects you to know Ingress syntax and common patterns without looking them up.

That's what we're going to focus on in this next section: exam-specific Ingress scenarios and rapid creation techniques.

## What Makes CKAD Different

The CKAD exam tests practical Ingress configuration. You'll see requirements like "route traffic for app.example.com to the web service" or "configure path-based routing for /app and /api." You need to translate these into correct Ingress YAML quickly.

For Ingress specifically, the exam will test you on:

**Rapid Ingress creation** - Using `kubectl create ingress` with `--rule` flags for basic scenarios, or using `--dry-run=client -o yaml` to generate base manifests for complex routing. The imperative command syntax is tricky, so knowing when to use YAML is important.

**Host-based routing configuration** - Setting `host` in Ingress rules to route based on hostname. Understanding that each host can have multiple paths. Knowing that missing host means "match any hostname" which is useful for testing.

**Path-based routing syntax** - Configuring `paths` with `path`, `pathType`, and `backend` fields. Understanding the three pathTypes: Prefix (matches /path and /path/*), Exact (matches only exact /path), and ImplementationSpecific (controller-dependent). The exam will specify which type to use.

**Backend Service configuration** - Correctly specifying `backend.service.name` and `backend.service.port.number` (or `backend.service.port.name`). This syntax changed in networking.k8s.io/v1, and getting it wrong means your Ingress doesn't route.

**TLS configuration** - Creating Secrets with TLS certificates using `kubectl create secret tls`, referencing them in Ingress `tls` sections with `hosts` and `secretName`. Understanding that TLS termination happens at the Ingress controller.

**Troubleshooting Ingress issues** - Checking Ingress status with `kubectl get ingress`, verifying backend Services exist and have endpoints, examining Ingress controller logs, and understanding common errors like "service not found" or "no endpoints available."

## What's Coming

In the upcoming CKAD-focused video, we'll drill on exam scenarios. You'll practice creating Ingress resources in under 2 minutes with various routing patterns. You'll configure TLS quickly. You'll troubleshoot common issues systematically.

We'll cover exam patterns: host-based routing to different Services, path-based routing within a single host, combining host and path routing, configuring TLS with certificates from Secrets, and understanding default backends for unmatched routes.

We'll also explore time-saving techniques: using YAML templates for complex Ingress rules, knowing that `kubectl create ingress` helps for simple cases but YAML is often faster for complex routing, verifying backend Services exist before creating Ingress, and using `kubectl explain ingress.spec.rules` for syntax reference.

Finally, we'll practice complete scenarios including creating Services and Ingress together, timing ourselves to ensure efficient execution.

## Exam Mindset

Remember: Ingress syntax in networking.k8s.io/v1 is specific and must be exact. The `pathType` field is required, and the backend structure uses `service.name` and `service.port.number`. Getting these details wrong means your Ingress won't work.

Practice Ingress creation until the YAML structure is muscle memory. When you see "route app.example.com to service web on port 80," you should immediately visualize the correct YAML.

Let's dive into CKAD-specific Ingress scenarios!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with Ingress demonstrations
- Serious but encouraging tone - this is exam preparation

**Tone:**
- Shift from learning to drilling
- Emphasize syntax accuracy
- Build confidence through systematic approaches

**Key Messages:**
- Ingress is guaranteed CKAD content
- Syntax is specific and must be exact
- Know all pathTypes and when to use each
- The upcoming content focuses on exam techniques

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
