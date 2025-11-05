# Network Policy Concepts - Narration Script
**Duration:** 8-10 minutes
**Format:** Concept slideshow presentation
**Target Audience:** CKAD candidates and Kubernetes practitioners

---

## Slide 1: Title & Introduction [0:00-0:30]

**Visual:** Title slide with NetworkPolicy icon

Welcome to this session on Kubernetes Network Policies. In this presentation, we'll explore how NetworkPolicy enables you to control network traffic flow between Pods and external endpoints in your Kubernetes cluster. By the end of this session, you'll understand the fundamental concepts needed to secure your applications at the network layer.

Network Policy is a supplementary topic for the CKAD exam, and while it may appear on the exam, it's an essential security control that every Kubernetes practitioner should understand.

---

## Slide 2: The Problem - Flat Networking [0:30-1:30]

**Visual:** Diagram showing Pods communicating freely across namespaces and nodes

By default, Kubernetes uses a flat networking model. This means that every Pod in the cluster can communicate with every other Pod, regardless of which namespace or node they're on. Similarly, Services have cluster-wide IP addresses that are accessible from anywhere within the cluster.

While this makes it easy to model distributed applications and simplifies development, it creates significant security gaps. Without network controls, you cannot:
- Segregate networks within the cluster
- Prevent applications from reaching outside the cluster
- Isolate sensitive workloads from other applications
- Enforce zero-trust network principles

This is where NetworkPolicy comes in. It allows you to model network access as part of your application deployment, treating network security as code.

---

## Slide 3: NetworkPolicy Overview [1:30-2:30]

**Visual:** NetworkPolicy resource structure diagram

NetworkPolicy is a Kubernetes API resource that specifies how groups of Pods can communicate with each other and with other network endpoints. Think of it as a firewall for your Pods.

Key characteristics of NetworkPolicy:
- **Namespace-scoped:** Policies are applied within a namespace
- **Pod-centric:** Policies select Pods using label selectors
- **Additive:** Multiple policies combine to allow traffic - like RBAC
- **Whitelist model:** Traffic starts denied, you explicitly allow what's needed
- **Direction-aware:** You can control ingress (incoming) and egress (outgoing) traffic separately

It's important to note that NetworkPolicy depends on your CNI plugin. Not all network plugins enforce policies. Docker Desktop, for example, doesn't enforce NetworkPolicy, while Calico, Cilium, and Weave do.

---

## Slide 4: Policy Structure & Components [2:30-3:45]

**Visual:** Annotated YAML showing main components

Let's look at the structure of a NetworkPolicy resource. Every NetworkPolicy has four main components:

First, the **podSelector** determines which Pods the policy applies to. An empty selector - just curly braces - means the policy applies to all Pods in that namespace.

Second, **policyTypes** specifies whether you're controlling Ingress, Egress, or both. This is crucial because if you specify policyTypes, you must include rules for those types, or traffic will be blocked.

Third, the **ingress** section contains rules for incoming traffic. These rules specify which sources can reach the selected Pods and on which ports.

Fourth, the **egress** section contains rules for outgoing traffic. These rules specify which destinations the selected Pods can reach and on which ports.

Remember: if you don't specify any rules under ingress or egress, but you list those policyTypes, you've effectively created a deny-all policy for that direction.

---

## Slide 5: Pod Selectors - Choosing Your Target [3:45-4:45]

**Visual:** Diagram showing label selectors matching Pods

Pod selectors are the foundation of NetworkPolicy. They determine which Pods your policy will affect.

Using the **podSelector** field, you match Pods based on their labels. For example, a selector with "app: backend" will apply the policy to all Pods labeled with app equals backend in the same namespace.

An empty podSelector - just empty curly braces - is special. It matches ALL Pods in that namespace. This is commonly used for default deny policies that apply to everything.

Pod selectors work just like they do in Deployments, Services, and other Kubernetes resources. You can use matchLabels for exact matches, or matchExpressions for more complex selection logic with operators like In, NotIn, Exists, and DoesNotExist.

The key thing to remember: podSelector operates within the current namespace. To select Pods in other namespaces, you use namespaceSelector, which we'll discuss next.

---

## Slide 6: Ingress Rules - Controlling Incoming Traffic [4:45-6:00]

**Visual:** Traffic flow diagram showing ingress sources

Ingress rules control traffic coming into your Pods. Each ingress rule has two main parts: the source specification and optional port restrictions.

For sources, you have three options:

**podSelector** allows traffic from specific Pods in the same namespace. For example, allowing traffic from Pods labeled "app: frontend" to reach your backend Pods.

**namespaceSelector** allows traffic from all Pods in namespaces matching specific labels. This is essential for cross-namespace communication. For instance, allowing traffic from any Pod in namespaces labeled "env: production".

**ipBlock** allows traffic from specific IP address ranges using CIDR notation. This is useful for allowing traffic from specific external networks or blocking certain IP ranges. You can use the "except" field to exclude specific addresses from the CIDR block.

You can combine multiple sources in an ingress rule. When they're separate list items - separate dashes - they work as OR conditions. When namespaceSelector and podSelector are in the same list item, they work as an AND condition, requiring both to match.

For ports, you specify the protocol - typically TCP or UDP - and the port number. You can list multiple ports in a single rule.

---

## Slide 7: Egress Rules - Controlling Outgoing Traffic [6:00-7:15]

**Visual:** Traffic flow diagram showing egress destinations

Egress rules control traffic leaving your Pods. The structure mirrors ingress rules, but with a critical addition: DNS.

For destinations, you use the same three selector types:

**podSelector** allows traffic to specific Pods in the same namespace.

**namespaceSelector** allows traffic to Pods in specific namespaces.

**ipBlock** allows traffic to specific IP ranges - often used for external APIs or databases.

Here's the critical point about egress: if you define ANY egress rules, you must explicitly allow DNS. Most applications need to resolve service names to IP addresses. Without DNS access, your applications will fail with "unknown host" or "bad address" errors.

To allow DNS, you create an egress rule targeting the kube-system namespace where CoreDNS runs, specifically allowing UDP port 53. The exact selector might vary by cluster - you might need to match the label "k8s-app: kube-dns" or "name: kube-system" depending on your environment.

This is one of the most common mistakes when implementing NetworkPolicy - forgetting to allow DNS access.

---

## Slide 8: Default Deny Policies [7:15-8:15]

**Visual:** Side-by-side comparison of default deny patterns

Default deny policies are a best practice in network security. The concept is simple: block all traffic by default, then explicitly allow only what's necessary. This follows the principle of least privilege.

There are three common default deny patterns:

**Deny all ingress** creates a policy with policyTypes Ingress but no ingress rules. This blocks all incoming traffic to selected Pods. Traffic can still leave the Pods unless you also restrict egress.

**Deny all egress** creates a policy with policyTypes Egress but no egress rules. This blocks all outgoing traffic. Pods can receive traffic but cannot initiate connections or even resolve DNS names.

**Deny all traffic** combines both - policyTypes includes both Ingress and Egress with no rules for either. This completely isolates Pods from all network communication.

These policies typically use an empty podSelector to apply to all Pods in a namespace. Once in place, you layer additional policies on top to selectively allow required communication paths.

Remember: NetworkPolicy is additive. Multiple policies combine to create a union of allowed traffic. You cannot use a policy to deny traffic that another policy allows.

---

## Slide 9: Policy Evaluation & Additivity [8:15-9:00]

**Visual:** Flowchart showing policy evaluation logic

Understanding how Kubernetes evaluates NetworkPolicy is crucial. Here's the evaluation flow:

First, if NO NetworkPolicy selects a Pod, all traffic is allowed to and from that Pod. This is the default state in Kubernetes.

Once a Pod is selected by ANY NetworkPolicy, the Pod enters a "default deny" state for the policy types specified in that policy.

Then, traffic is evaluated against ALL policies that select the Pod. If any policy allows the traffic, it's permitted. This is the additive nature of NetworkPolicy.

This means you cannot write a policy to explicitly deny traffic. If one policy allows traffic and another doesn't mention it, the traffic is allowed. The only way to deny traffic is to not allow it in any policy.

This behavior is intentional and consistent with RBAC. It encourages a whitelist approach where you explicitly enumerate allowed communication paths rather than trying to block specific patterns.

When troubleshooting, always check ALL policies that might select a Pod. Use "kubectl describe networkpolicy" and "kubectl get pods --show-labels" to understand which policies apply to which Pods.

---

## Slide 10: Common Patterns & Best Practices [9:00-10:00]

**Visual:** Architecture diagram showing typical patterns

Let's look at common NetworkPolicy patterns you'll encounter in production:

**Three-tier application security:** For applications with web, API, and database tiers, you create policies that allow web to communicate with API, API to communicate with database, but prevent web from directly accessing database. Each tier gets a policy defining its allowed ingress and egress paths.

**Namespace isolation:** Create a policy in each namespace that only allows traffic from Pods within that same namespace. This prevents cross-namespace communication unless explicitly allowed. Combined with RBAC, this creates strong tenant isolation.

**External API access:** For Pods that need to call external services, use egress policies with ipBlock to allow traffic only to specific IP ranges. This prevents unauthorized external communication and data exfiltration.

**Public-facing services:** For services exposed to the internet, create ingress policies that allow traffic from anywhere, but carefully control their egress to prevent them from being used as pivot points if compromised.

Best practices to remember:
- Start with default deny policies
- Always include DNS in egress policies
- Use namespace labels for cross-namespace communication
- Document your network topology alongside your policies
- Test connectivity after applying policies
- Use descriptive names for policies that indicate their purpose

---

## Slide 11: Summary & Key Takeaways [10:00-10:30]

**Visual:** Key points summary

Let's recap the essential concepts:

NetworkPolicy is Kubernetes' native network security mechanism. It works at the Pod level using label selectors to control both ingress and egress traffic.

Policies are additive - multiple policies combine to allow traffic. There's no explicit deny; you control access by not allowing it.

Remember the critical points: ingress controls incoming traffic, egress controls outgoing traffic. Always allow DNS when using egress policies. Not all CNI plugins enforce NetworkPolicy.

Pod selectors choose Pods by labels, namespace selectors enable cross-namespace rules, and ipBlock allows CIDR-based restrictions.

Default deny policies are best practice - block everything, then explicitly allow required paths.

NetworkPolicy is supplementary for CKAD, but it's fundamental for production security. Practice creating policies, testing connectivity, and debugging issues. Remember that on the exam, there's no imperative command - you must write YAML.

Thank you for your attention. Now let's move to the practical exercises where we'll apply these concepts hands-on.
