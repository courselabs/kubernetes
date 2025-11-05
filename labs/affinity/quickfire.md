# Affinity and Anti-Affinity - Quickfire Questions

Test your knowledge of Kubernetes Pod Affinity and Anti-Affinity with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the difference between nodeSelector and node affinity?

A) nodeSelector is deprecated
B) Node affinity only works with labels
C) They are the same thing
D) Node affinity provides more expressive and flexible node selection

### 2. What are the two types of node affinity?

A) Strict and Flexible
B) Hard and Soft
C) Mandatory and Optional
D) RequiredDuringScheduling and PreferredDuringScheduling

### 3. What does "IgnoredDuringExecution" mean in affinity rules?

A) The rule is only checked during scheduling, not for running Pods
B) The rule causes Pod eviction
C) The Pod ignores the rule
D) The rule is never enforced

### 4. What is Pod affinity used for?

A) To schedule Pods near other Pods with specific labels
B) To schedule Pods on specific nodes
C) To set resource limits
D) To prevent Pods from scheduling

### 5. What is Pod anti-affinity used for?

A) To isolate networks
B) To spread Pods across nodes to avoid co-location
C) To delete existing Pods
D) To prevent Pods from running

### 6. What does the topologyKey field specify in Pod affinity rules?

A) The label key used to define topology domains (e.g., hostname, zone)
B) The Pod's priority
C) The network topology
D) The node's CPU architecture

### 7. Which affinity type would you use to ensure high availability by spreading replicas across zones?

A) Pod anti-affinity with topologyKey: topology.kubernetes.io/zone
B) Node selector with zone labels
C) Taints and tolerations
D) Node affinity with zone labels

### 8. Can you combine multiple affinity rules in a single Pod spec?

A) Only if they're all preferred rules
B) No, only one rule is allowed
C) Yes, you can use node affinity, Pod affinity, and Pod anti-affinity together
D) Only node and Pod affinity

### 9. What happens if a Pod's required affinity rule cannot be satisfied?

A) The Pod runs anyway
B) The rule is converted to preferred
C) The Pod remains in Pending state
D) The Pod is deleted

### 10. Which operator in node affinity matches if the label key exists, regardless of value?

A) In
B) NotIn
C) DoesNotExist
D) Exists

---

## Answers

1. **D** - Node affinity provides more expressive rules than nodeSelector, including logical operators (In, NotIn, Exists), required/preferred rules, and weight-based preferences.

2. **D** - The two types are `requiredDuringSchedulingIgnoredDuringExecution` (hard requirement) and `preferredDuringSchedulingIgnoredDuringExecution` (soft preference with weights).

3. **A** - "IgnoredDuringExecution" means the affinity rule is only enforced during Pod scheduling. Running Pods won't be evicted if the rule becomes violated.

4. **A** - Pod affinity schedules Pods near other Pods matching specific labels, useful for co-locating related services (e.g., web tier with cache tier).

5. **B** - Pod anti-affinity spreads Pods across nodes or zones to avoid co-location, improving availability and fault tolerance.

6. **A** - The topologyKey specifies which node label to use for defining topology domains. Common values: `kubernetes.io/hostname` (node), `topology.kubernetes.io/zone` (availability zone).

7. **A** - Pod anti-affinity with `topologyKey: topology.kubernetes.io/zone` spreads Pods across availability zones, ensuring no two replicas share the same zone.

8. **C** - Yes, you can combine node affinity, Pod affinity, and Pod anti-affinity in a single Pod spec. All rules are evaluated during scheduling.

9. **C** - If a required affinity rule cannot be satisfied, the Pod remains in Pending state until a suitable node becomes available.

10. **D** - The `Exists` operator matches nodes where the specified label key exists, regardless of its value. `DoesNotExist` is the opposite.

---

## Study Resources

- [Lab README](README.md) - Affinity and anti-affinity concepts
- [CKAD Requirements](CKAD.md) - CKAD-specific scheduling topics
- [Official Affinity Documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)
