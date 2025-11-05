# Network Policy - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now practiced creating NetworkPolicies with ingress and egress rules, using pod and namespace selectors, and controlling traffic based on labels and ports.

Here's what you need to know for CKAD: NetworkPolicy is core exam content. You'll create policies to allow or deny specific traffic patterns. The exam expects you to understand NetworkPolicy syntax and translate security requirements into correct policy YAML.

That's what we're going to focus on in this next section: exam-specific NetworkPolicy scenarios and rapid creation techniques.

## What Makes CKAD Different

The CKAD exam tests practical network security implementation. You'll see requirements like "allow traffic from frontend Pods to backend Pods on port 8080" or "deny all traffic to database Pods except from the app namespace." You need to translate these into NetworkPolicy YAML quickly.

For NetworkPolicy specifically, the exam will test you on:

**Understanding default behavior** - Knowing that Kubernetes allows all traffic by default, and that creating a NetworkPolicy targeting Pods (via podSelector) immediately denies all traffic except what the policy explicitly allows. This "deny by default" behavior is crucial.

**Writing pod selectors** - Using `spec.podSelector` to choose which Pods the policy applies to. Using `matchLabels` for exact matches or `matchExpressions` for complex selections. Understanding that empty `{}` means all Pods in the namespace.

**Configuring ingress rules** - Using `spec.ingress` to allow incoming traffic. Adding `from` clauses with `podSelector` (same namespace), `namespaceSelector` (any Pod in matching namespaces), or both together (specific Pods in specific namespaces). Adding `ports` to restrict protocols and port numbers.

**Configuring egress rules** - Using `spec.egress` to allow outgoing traffic. Similar to ingress but using `to` instead of `from`. Understanding that DNS usually needs to be explicitly allowed for egress policies.

**Combining selectors** - Understanding that `podSelector` and `namespaceSelector` within the same array element means AND (both must match), while separate array elements mean OR (either can match). This syntax subtlety is frequently tested.

**Common patterns** - Knowing standard patterns: deny all (empty ingress/egress), allow from namespace (namespaceSelector only), allow from specific Pods (podSelector only), allow on specific port (ports with protocol and port number).

## What's Coming

In the upcoming CKAD-focused video, we'll drill on exam scenarios. You'll practice creating NetworkPolicies in under 2 minutes for common patterns. You'll translate security requirements into correct YAML quickly. You'll troubleshoot policy syntax errors.

We'll cover exam patterns: denying all traffic to sensitive Pods, allowing traffic from frontend to backend on specific ports, allowing cross-namespace communication for shared services, combining ingress and egress for complete isolation, and allowing DNS while blocking other external traffic.

We'll also explore time-saving techniques: using YAML templates for common patterns, knowing that `kubectl explain networkpolicy.spec` shows structure, understanding that policies are additive (multiple policies combine to allow traffic), and verifying pod labels before writing selectors.

Finally, we'll practice complete scenarios including deploying applications and NetworkPolicies together, timing ourselves to ensure efficient execution.

## Exam Mindset

Remember: NetworkPolicy syntax is specific and must be exact. The difference between `podSelector` in the policy spec versus `podSelector` in ingress/egress rules is crucial - one selects which Pods the policy applies to, the other selects which Pods are allowed to communicate.

Practice NetworkPolicy creation until the structure is muscle memory. When you see "allow traffic from app=frontend to app=backend on port 8080," you should immediately visualize the correct YAML structure.

Let's dive into CKAD-specific NetworkPolicy scenarios!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with NetworkPolicy demonstrations
- Serious but encouraging tone - this is exam preparation

**Tone:**
- Shift from learning to drilling
- Emphasize syntax precision
- Build confidence through systematic approaches

**Key Messages:**
- NetworkPolicy is core CKAD content
- Syntax is specific and must be exact
- Understand selector combinations deeply
- The upcoming content focuses on exam techniques

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
