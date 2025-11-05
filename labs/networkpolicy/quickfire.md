# NetworkPolicy - Quickfire Questions

Test your knowledge of Kubernetes NetworkPolicies with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the default network behavior in Kubernetes if no NetworkPolicy is applied?

A) All Pods can communicate with all Pods
B) Only traffic within the same namespace is allowed
C) All traffic is denied
D) Only egress traffic is allowed

### 2. What happens when a NetworkPolicy selects a Pod?

A) The Pod becomes isolated and only allowed traffic defined in policies is permitted
B) The Pod is deleted
C) The Pod's network is disabled
D) The Pod cannot receive any traffic

### 3. Which field in a NetworkPolicy spec selects which Pods the policy applies to?

A) matchPods
B) selector
C) podSelector
D) targetSelector

### 4. How do you create a default deny-all ingress policy?

A) Set ingress: deny in the spec
B) Use the denyAll: true field
C) Create a NetworkPolicy with empty podSelector and no ingress rules
D) Delete all NetworkPolicies

### 5. What are the two types of traffic rules in a NetworkPolicy?

A) Ingress and Egress
B) Receive and Send
C) Input and Output
D) Inbound and Outbound

### 6. How do you allow traffic from Pods with specific labels?

A) Using podSelector in the ingress/egress from/to section
B) Using matchLabels in policyTypes
C) Using namespaceSelector only
D) Using labelSelector

### 7. What does a NetworkPolicy require to function?

A) LoadBalancer Service
B) A network plugin that supports NetworkPolicies (e.g., Calico, Cilium)
C) DNS Server
D) Ingress Controller

### 8. How do you allow egress traffic to external IP addresses?

A) Egress to external IPs is not possible
B) Using externalIPs field
C) Using ipBlock with cidr in the egress to section
D) Using podSelector with external IPs

### 9. Can you select Pods in other namespaces in a NetworkPolicy?

A) Yes, by default all namespaces are included
B) No, NetworkPolicies only apply within the same namespace
C) Only if the namespaces have the same labels
D) Yes, using namespaceSelector in from/to rules

### 10. What is the purpose of the `except` field in an ipBlock?

A) To create exceptions for specific Pods
B) To specify allowed IPs
C) To deny all traffic except specific IPs
D) To exclude specific IPs or ranges from the allowed cidr

---

## Answers

1. **A** - By default, Kubernetes allows all Pods to communicate with all other Pods and Services. NetworkPolicies are opt-in and must be explicitly created.

2. **A** - When at least one NetworkPolicy selects a Pod, that Pod becomes isolated. Only traffic explicitly allowed by NetworkPolicies (ingress or egress) is permitted.

3. **C** - The `podSelector` field specifies which Pods the NetworkPolicy applies to, using label selectors. An empty `podSelector` selects all Pods in the namespace.

4. **C** - A NetworkPolicy with empty `podSelector: {}` and an empty `ingress: []` array (or omitting ingress) creates a default deny-all ingress policy for all Pods.

5. **A** - NetworkPolicies have two types of rules: `ingress` (incoming traffic to selected Pods) and `egress` (outgoing traffic from selected Pods).

6. **A** - Use `podSelector` in the `from` section (for ingress) or `to` section (for egress) to allow traffic from/to Pods matching specific labels.

7. **B** - NetworkPolicies require a CNI network plugin that supports them, such as Calico, Cilium, Weave, or Romana. Default plugins like Flannel may not support NetworkPolicies.

8. **C** - Use `ipBlock` with `cidr` notation in the egress `to` section to allow traffic to specific external IP ranges (e.g., `cidr: 0.0.0.0/0`).

9. **D** - Yes, use `namespaceSelector` in the `from` (ingress) or `to` (egress) section to select Pods in namespaces matching specific labels. You can combine with `podSelector`.

10. **D** - The `except` field in an `ipBlock` excludes specific CIDR ranges from the allowed `cidr`. For example, allow 10.0.0.0/8 except 10.1.0.0/16.

---

## Study Resources

- [Lab README](README.md) - Core NetworkPolicy concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific NetworkPolicy topics
- [Official NetworkPolicy Documentation](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
