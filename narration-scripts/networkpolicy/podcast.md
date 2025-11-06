# Network Policy - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening: The Security Challenge (1 min)

Welcome to this deep dive on Kubernetes Network Policy. Today we'll explore how to control network traffic between Pods and external endpoints in your Kubernetes cluster.

By default, Kubernetes uses a flat networking model where every Pod can communicate with every other Pod, regardless of namespace or node. While this simplifies development, it creates significant security gaps. You cannot segregate networks, prevent unauthorized access, or implement zero-trust principles without additional controls.

NetworkPolicy is the solution. It's a Kubernetes API resource that acts as a firewall for your Pods, allowing you to specify exactly which traffic is permitted and which is denied. While NetworkPolicy is a supplementary topic for CKAD, it's essential security knowledge that every Kubernetes practitioner needs.

We'll cover how NetworkPolicy works, the key patterns you'll use in production, and most importantly for CKAD candidates - how to write policies from scratch and troubleshoot connectivity issues during the exam.

---

## Understanding NetworkPolicy Fundamentals (3 min)

Let's start with what NetworkPolicy is and how it operates. NetworkPolicy is a Kubernetes resource that specifies how groups of Pods can communicate with each other and with external endpoints. Think of it as firewall rules for your containers.

NetworkPolicy has several key characteristics that shape how you use it. First, it's namespace-scoped - policies are created within a namespace and apply only to Pods in that namespace. Second, it's Pod-centric - policies select target Pods using label selectors, just like Deployments and Services do. Third, and this is crucial, NetworkPolicy is additive. When multiple policies select the same Pod, they combine to create a union of allowed traffic. This is identical to how RBAC works - it's a whitelist model where you explicitly grant permissions rather than deny them.

Fourth, NetworkPolicy uses a deny-by-default model. Once a Pod is selected by any policy, all traffic to or from that Pod is blocked unless explicitly allowed by a policy rule. Finally, NetworkPolicy is direction-aware - you control ingress, which is incoming traffic, and egress, which is outgoing traffic, completely independently.

One critical consideration: NetworkPolicy depends on your CNI plugin. Not all network plugins enforce policies. Docker Desktop, which many developers use locally, does not enforce NetworkPolicy. The policies are stored in the cluster but have no effect on actual traffic. To properly test NetworkPolicy, you need a CNI plugin that supports enforcement, like Calico, Cilium, or Weave. This is why many tutorials use k3d clusters with Calico installed - it provides a lightweight environment where policies actually work.

Let's look at the structure of a NetworkPolicy resource. Every policy has four main components. First, the podSelector determines which Pods the policy applies to. An empty selector - just empty curly braces - means the policy applies to all Pods in that namespace. Second, policyTypes specifies whether you're controlling Ingress, Egress, or both. This is crucial because if you specify policyTypes but don't include rules for those types, traffic is completely blocked for that direction. Third, the ingress section contains rules for incoming traffic - which sources can reach the selected Pods and on which ports. Fourth, the egress section contains rules for outgoing traffic - which destinations the selected Pods can reach and on which ports.

---

## Policy Evaluation and Additivity (2 min)

Understanding how Kubernetes evaluates NetworkPolicy is essential for both creating policies and troubleshooting issues.

Here's the evaluation flow: First, if no NetworkPolicy selects a Pod, all traffic is allowed to and from that Pod. This is the default state in Kubernetes - completely open networking. Once a Pod is selected by any NetworkPolicy, the Pod enters a default deny state for the policy types specified in that policy. If the policy specifies Ingress in policyTypes, all incoming traffic is now blocked by default. If it specifies Egress, all outgoing traffic is blocked.

Then, traffic is evaluated against all policies that select the Pod. If any policy allows the traffic, it's permitted. This is the additive nature - policies combine to expand permissions, never to restrict them.

This means you cannot write a policy to explicitly deny traffic. There's no deny rule in NetworkPolicy. If one policy allows traffic from app equals frontend and another policy allows traffic from app equals backend, both frontend and backend Pods can reach the target. The policies don't conflict; they combine. The only way to deny traffic is to not allow it in any policy.

This behavior is intentional and consistent with RBAC. It encourages a whitelist approach where you explicitly enumerate allowed communication paths. This is more secure and easier to reason about than a model with both allow and deny rules where evaluation order matters.

When troubleshooting, always check all policies that might select a Pod. Use kubectl describe networkpolicy to see what traffic is allowed, and kubectl get pods with show-labels to understand which policies apply to which Pods.

---

## Default Deny Patterns (2 min)

Default deny policies are a best practice in network security and a common pattern on the CKAD exam. The concept is simple: block all traffic by default, then explicitly allow only what's necessary. This follows the principle of least privilege.

There are three common default deny patterns you need to know cold. First, deny all ingress. This creates a policy with Ingress listed in policyTypes but no ingress rules defined. This blocks all incoming traffic to selected Pods. Traffic can still leave the Pods unless you also restrict egress. This is useful when you want to control what can reach your Pods but don't want to restrict their outbound communication yet.

Second, deny all egress. This creates a policy with Egress in policyTypes but no egress rules. This blocks all outgoing traffic. Pods can receive traffic but cannot initiate connections or even resolve DNS names. This is an extremely restrictive policy that requires you to explicitly allow DNS and all required destinations.

Third, deny all traffic in both directions. This combines both - policyTypes includes both Ingress and Egress with no rules for either. This completely isolates Pods from all network communication. This is useful as a starting point when you want maximum security and will layer specific allow rules on top.

These policies typically use an empty podSelector to apply to all Pods in a namespace. Once in place, you add additional policies on top to selectively allow required communication paths. Remember, because policies are additive, the allow rules combine with the deny-all policy to create exactly the permissions you need.

---

## Ingress Rules: Controlling Incoming Traffic (3 min)

Ingress rules control traffic coming into your Pods. Each ingress rule specifies sources that are allowed to reach the selected Pods and optionally restricts which ports can be accessed.

For sources, you have three options. First, podSelector allows traffic from specific Pods in the same namespace. For example, you might allow traffic from Pods labeled app equals frontend to reach your backend Pods. The podSelector in the from section matches the source Pods, while the podSelector at the top of the policy selects the destination Pods. This is a common point of confusion - make sure you understand which selector is which.

Second, namespaceSelector allows traffic from all Pods in namespaces matching specific labels. This is essential for cross-namespace communication. For instance, you might allow traffic from any Pod in namespaces labeled env equals production. Here's something important to understand: namespaceSelector matches namespaces by their labels, not by their names directly. You need to ensure namespaces have appropriate labels before using namespaceSelector.

Third, ipBlock allows traffic from specific IP address ranges using CIDR notation. This is useful for allowing traffic from specific external networks or for allowing node IPs. You can use the except field to exclude specific addresses from the CIDR block. For example, you might allow traffic from 192.168.1.0/24 except 192.168.1.5.

You can combine multiple sources in an ingress rule, and this is where AND versus OR logic becomes critical. When namespaceSelector and podSelector are separate list items - separate dashes in the YAML - they work as OR conditions. Traffic is allowed if it matches either condition. When namespaceSelector and podSelector are in the same list item - no additional dash - they work as an AND condition, requiring both to match. This means the Pod must have the specified label and must be in a namespace with the specified label.

For ports, you specify the protocol - typically TCP or UDP - and the port number. You can list multiple ports in a single rule. You can also use named ports that reference the container's port names, but be careful - the names must match exactly.

A practical example helps clarify this. Imagine you have a backend API that should only be accessible from your frontend Pods. You would create a NetworkPolicy that selects app equals backend Pods, then in the ingress section, you specify a from clause with podSelector matching app equals frontend, and a ports clause allowing TCP port 8080. This allows only the frontend Pods to reach the backend on that specific port.

---

## Egress Rules and the DNS Requirement (3 min)

Egress rules control traffic leaving your Pods. The structure mirrors ingress rules, but there's one critical addition that trips up almost everyone: DNS.

For destinations, you use the same three selector types as ingress. PodSelector allows traffic to specific Pods in the same namespace. NamespaceSelector allows traffic to Pods in specific namespaces. IpBlock allows traffic to specific IP ranges, often used for external APIs or databases.

Here's the critical point about egress: if you define any egress rules, you must explicitly allow DNS. Most applications need to resolve service names to IP addresses. Without DNS access, your applications fail with errors like unknown host or bad address. This is the number one mistake when implementing NetworkPolicy, and it's a common exam pitfall.

To allow DNS, you create an egress rule targeting the kube-system namespace where CoreDNS runs, specifically allowing UDP port 53. The exact selector might vary by cluster. You might need to match the namespace label name equals kube-system, or you might need to select the CoreDNS Pods directly with a podSelector matching k8s-app equals kube-dns. On the CKAD exam, the environment should have consistent labels, but always verify if DNS isn't working.

Let me walk through a complete example. Imagine your web application needs to call an internal API service and also needs to access external HTTPS services. Your egress policy needs three rules. First, allow DNS by targeting kube-system namespace on UDP port 53. Second, allow traffic to your API Pods using podSelector matching app equals api on TCP port 8080. Third, allow HTTPS to the internet using ipBlock with CIDR 0.0.0.0/0 on TCP port 443.

These three rules are separate list items under egress, creating OR logic. The Pod can access DNS or the API or external HTTPS. If any rule allows the traffic, it's permitted. Without the DNS rule, your Pod couldn't resolve api-service to an IP address, so even though you allowed traffic to the API Pods, the connection would fail at DNS resolution before the API rule even matters.

When troubleshooting egress issues, always test DNS first. Run nslookup or a similar command inside your Pod. If DNS resolution fails, check your egress policy for the DNS rule. If DNS works but connections still fail, then check whether your destination selector and ports match the target correctly.

---

## Common CKAD Patterns (3 min)

Let's explore the common NetworkPolicy patterns you'll encounter on the CKAD exam and in production environments.

The first pattern is the three-tier application security model. Imagine an application with web, API, and database tiers. You want to allow web to communicate with API, API to communicate with database, but prevent web from directly accessing the database. Each tier gets a policy defining its allowed ingress and egress paths. The database policy allows ingress only from app equals API Pods. The API policy allows ingress from web Pods and egress to database Pods plus DNS. The web policy allows ingress from anywhere - because it's public-facing - and egress to API Pods plus DNS. This creates a layered security model where each tier has exactly the access it needs and no more.

The second pattern is namespace isolation. This prevents cross-namespace communication unless explicitly allowed. You create a policy in each namespace that allows traffic only from Pods within that same namespace. The trick is using an empty namespaceSelector - just empty curly braces - or omitting namespaceSelector entirely, which defaults to the current namespace. Combined with RBAC namespace isolation, this creates strong tenant separation in multi-tenant clusters.

The third pattern is external API access control. For Pods that need to call external services, you use egress policies with ipBlock to allow traffic only to specific IP ranges. This prevents unauthorized external communication and data exfiltration. For example, if your application calls a payment processing API at specific IP addresses, you can create an egress rule that allows only those IPs on HTTPS, preventing the Pod from accessing other external services even if compromised.

The fourth pattern is the label-based access control vulnerability and its fix. This is commonly tested on the exam. Policies use label selectors to control access. If your API policy allows ingress from Pods labeled app equals frontend, what happens if someone deploys a malicious Pod with that same label? They can access your API. The solution is using namespace selectors in combination with Pod selectors. Deploy each application to its own namespace, label the namespace, and require both the namespace label and the Pod label to match. This prevents Pods from other namespaces accessing your resources even if they have matching Pod labels.

---

## CKAD Exam Strategies (2 min)

For the CKAD exam, you need specific strategies because NetworkPolicy has unique challenges compared to other topics.

First, understand there's no kubectl create command that generates a complete, functional NetworkPolicy. You can run kubectl create networkpolicy with the generate flag, but it only creates an empty skeleton. You still need to fill in all the important parts. It's often faster to write the YAML from memory than to use this command and then edit it extensively.

My recommendation is to memorize a few templates. Have a mental template for common patterns like allow from specific Pods, allow egress to API with DNS, and default deny. During the exam, you can type these quickly and modify them for the specific scenario. Practice writing policies from scratch until it becomes automatic.

Second, understand the time management challenge. NetworkPolicy questions can be time-consuming because you're writing YAML from scratch. Read requirements carefully, start with a template, write the YAML in an editor - don't try to use cat with heredoc as it's too error prone - then apply and test incrementally. Don't write three policies and then test. Write one, apply it, test it with kubectl exec and wget or curl, then move to the next. If you're stuck after two minutes of debugging, move on. Get partial credit if you can, then come back if time permits.

Third, know your testing commands cold. Use kubectl exec with wget and timeout flags to test HTTP connectivity quickly. Use netcat to test arbitrary ports. Use nslookup to verify DNS works. Know how to get Pod IPs when you need to test without DNS. These commands need to be muscle memory.

Fourth, practice the common debugging workflow. When something doesn't work, list all policies with kubectl get networkpolicy. Describe the policy to see what it's doing. Check Pod labels with show-labels to ensure they match your selectors. Check namespace labels for namespaceSelector issues. If you're using a practice environment, verify your CNI enforces NetworkPolicy - look for Calico, Cilium, or Weave Pods in kube-system.

---

## Common Pitfalls and Mistakes (2 min)

Let me run through the most common mistakes candidates make with NetworkPolicy on the CKAD exam.

First, forgetting DNS in egress policies. We've emphasized this repeatedly because it's the number one failure point. Always include DNS when you have egress rules.

Second, empty podSelector confusion. Remember, empty curly braces means all Pods in the namespace, not none. This is intentional and consistent with other Kubernetes resources.

Third, AND versus OR logic. Same list item equals AND, separate items equal OR. The exam might ask for OR logic and candidates write AND by putting everything in the same item.

Fourth, policy not enforced. If your practice cluster doesn't support NetworkPolicy, your policies won't work and your practice is wasted. Use a CNI that enforces policies for meaningful practice.

Fifth, working with Services versus Pods. NetworkPolicy works on Pods, not Services. Use Pod labels in your selectors, not Service names. The policy doesn't know about Services at all - it operates at the Pod and IP level.

Sixth, forgetting policyTypes. If you specify policyTypes, you must list Ingress, Egress, or both. Forgetting this can cause unexpected blocking because Kubernetes doesn't know which directions you want to control.

Seventh, namespace labels. NamespaceSelector requires namespaces to have labels. Don't assume they're there. Check with kubectl get namespace with show-labels and add labels with kubectl label namespace if needed.

Eighth, bidirectional communication. Allowing Pod A to talk to Pod B doesn't automatically allow Pod B to talk to Pod A. You need ingress and egress policies for both directions if you want bidirectional communication.

Ninth, using CIDR for Pod communication. Don't use ipBlock for Pod-to-Pod communication. Pod IPs can change when Pods restart. Use podSelector instead, which works with labels regardless of IP changes.

Tenth, testing on platforms that don't enforce policies. If you're practicing on Docker Desktop, your policies look like they work but aren't actually being enforced. This gives you false confidence.

---

## Summary and Key Takeaways (1 min)

Let's recap the essential concepts for NetworkPolicy success.

NetworkPolicy is Kubernetes' native network security mechanism. It works at the Pod level using label selectors to control both ingress and egress traffic. Policies are additive - multiple policies combine to allow traffic. There's no explicit deny; you control access by not allowing it.

Remember the critical points: ingress controls incoming traffic, egress controls outgoing traffic. Always allow DNS when using egress policies unless you explicitly want to block it. Not all CNI plugins enforce NetworkPolicy - you need Calico, Cilium, Weave, or similar.

PodSelector chooses Pods by labels within the same namespace. NamespaceSelector enables cross-namespace rules by matching namespace labels. IpBlock allows CIDR-based restrictions for external traffic or specific IP ranges.

Default deny policies are best practice - block everything, then explicitly allow required paths. For CKAD, you need to write policies from scratch, so practice until common patterns are muscle memory.

For exam success: memorize templates for common patterns, practice writing YAML quickly, know your testing commands, always verify DNS in egress policies, understand AND versus OR logic, and don't spend more than five minutes on any single question.

NetworkPolicy is supplementary for CKAD, but when it appears, candidates who practiced thoroughly can complete these questions in just a few minutes, while unprepared candidates struggle. Be in the first group.

Thank you for listening. Practice these concepts hands-on and you'll be well-prepared for NetworkPolicy scenarios in the CKAD exam. Good luck with your preparation!
