# Affinity - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (20-25 minutes)

---

### Section 1: CKAD Exam Context and Scope (2 min)
**[00:00-02:00]**

Welcome to CKAD exam preparation for Pod scheduling and affinity. While affinity is marked as advanced and beyond core CKAD requirements, understanding these concepts will make you a more effective Kubernetes developer and may appear in exam scenarios.

Let me be clear about what to expect. The CKAD exam primarily tests core application development skills. However, affinity and anti-affinity patterns frequently appear in real-world scenarios, especially when deploying high-availability applications or optimizing performance.

In this session, we'll focus on practical exam skills:
- Recognizing when to use affinity versus simpler mechanisms
- Reading and understanding affinity rules in existing deployments
- Quickly identifying why Pods are pending due to affinity constraints
- Using kubectl commands to troubleshoot scheduling issues
- Common patterns you can apply quickly under exam time pressure

The key takeaway: you won't need to write complex affinity rules from scratch, but you should be able to work with existing ones and troubleshoot scheduling problems efficiently.

---

### Section 2: Understanding Affinity Types and Operators (3 min)
**[02:00-05:00]**

Let's start with the fundamentals. There are three types of affinity in Kubernetes: node affinity, Pod affinity, and Pod anti-affinity.

Node affinity controls which nodes can run your Pods based on node labels. It comes in two flavors: required and preferred. The full name is requiredDuringSchedulingIgnoredDuringExecution. That's a mouthful, so focus on the key parts: "required" means it must be satisfied, "IgnoredDuringExecution" means running Pods won't be evicted if rules change.

Let me show you the structure by checking the explain output.

Notice the structure. Required affinity uses nodeSelectorTerms with matchExpressions. Each match expression has a key, operator, and values.

The operators are critical for CKAD:
- In: value must be in the list
- NotIn: value must not be in the list
- Exists: key must exist, value doesn't matter
- DoesNotExist: key must not exist
- Gt: greater than (for numeric values)
- Lt: less than (for numeric values)

Here's a practical example. If you want Pods only on Linux nodes with SSD storage, you would create a pod and add node affinity. In the exam, you might be given this requirement and need to modify an existing spec. The key is knowing the structure.

Pod affinity and anti-affinity use the same concepts but add a topology key. This defines the scope: kubernetes.io/hostname means same node, topology.kubernetes.io/zone means same zone.

---

### Section 3: Quick Command Reference for CKAD (3 min)
**[05:00-08:00]**

Let me show you the essential kubectl commands for working with affinity in the exam. These will save you precious time.

First, checking node labels - this is critical because affinity rules depend on labels. You can show all node labels, show specific labels as columns, or find nodes with a specific label.

Adding labels to nodes is straightforward. Use kubectl label with the node name and key-value pair. Updating an existing label requires the --overwrite flag. Remove a label by adding a minus suffix to the key name.

Checking Pod placement and troubleshooting involves several commands. You can see which node each Pod is on with the wide output. Check affinity rules on a running Pod by getting its YAML and grepping for affinity. See why a Pod is pending by describing it and checking the Events section.

The describe command is your best friend for debugging affinity issues. The Events section will tell you exactly which affinity constraints couldn't be satisfied.

For quick debugging of scheduling issues, check if any nodes match your selector, check node capacity, and see if nodes are tainted using custom columns.

Memorize these patterns. In the exam, every second counts, and knowing these commands by heart will save you valuable time.

---

### Section 4: Common CKAD Patterns - Node Affinity (4 min)
**[08:00-12:00]**

Now let's walk through common exam patterns. I'll show you templates you can reuse quickly.

Pattern 1: Schedule on specific node type.

Scenario: "Create a deployment that only runs on nodes with label environment=production."

The fastest approach is to generate a base deployment and then edit it to add node affinity. In the Pod template spec, add an affinity section with nodeAffinity, requiredDuringSchedulingIgnoredDuringExecution, nodeSelectorTerms, and matchExpressions. The match expression has the key, operator In, and values including production.

Pro tip: You can use a simpler nodeSelector if you just need equality matching. Just add nodeSelector with the key-value pair. Node selectors are easier to write and understand. Use them unless you need affinity's advanced features.

Pattern 2: Avoid control plane nodes.

This is extremely common. You use nodeAffinity with a matchExpression where the key is node-role.kubernetes.io/control-plane and the operator is DoesNotExist. The control plane label shouldn't be present.

Pattern 3: Specific region/zone.

For cloud environments, you would specify matchExpressions for both region and zone using the topology keys and the In operator with your desired values.

Multiple expressions in the same term use AND logic - the node must match all of them.

Pattern 4: Preferred affinity with weights.

When you want preference without hard requirements, use preferredDuringSchedulingIgnoredDuringExecution. Each preference has a weight from 1 to 100 and a matchExpression. Higher weight means stronger preference. For example, you might give SSD storage a weight of 80 and fast network a weight of 20.

---

### Section 5: Common CKAD Patterns - Pod Affinity (4 min)
**[12:00-16:00]**

Now let's look at Pod affinity and anti-affinity patterns. These are all about relationships between Pods.

Pattern 1: High availability with anti-affinity.

This is the most common exam scenario. Spread replicas across nodes using podAntiAffinity with requiredDuringSchedulingIgnoredDuringExecution. The labelSelector matches the app label, and the topologyKey is kubernetes.io/hostname, meaning different physical nodes. Each replica will be on a different node for high availability.

Important warning: If you have 3 replicas but only 2 nodes, with required anti-affinity, one Pod will stay pending. Use preferred for more flexibility.

Pattern 2: Spread across zones (preferred).

This is better for real-world scenarios. Use preferredDuringSchedulingIgnoredDuringExecution with a high weight. The podAffinityTerm has the labelSelector and topologyKey set to topology.kubernetes.io/zone. This tries to spread across zones but allows multiple Pods per zone if necessary.

Pattern 3: Co-locate with cache.

Pod affinity for performance means using requiredDuringSchedulingIgnoredDuringExecution with a labelSelector matching your cache service, like app=redis-cache, and topologyKey kubernetes.io/hostname. This says: "schedule me on the same node as Pods labeled app=redis-cache."

Pattern 4: Regional affinity with zone spreading.

You can combine node and Pod affinity. Use nodeAffinity to require the us-west region, and Pod anti-affinity with preferred scheduling to spread across zones within that region.

This demonstrates a sophisticated pattern: "stay in one region, but spread across zones within it."

---

### Section 6: Troubleshooting Affinity Issues (4 min)
**[16:00-20:00]**

Now let's focus on troubleshooting - this is critical for the exam. When Pods are pending due to affinity, you need to diagnose and fix quickly.

Issue 1: Pods stuck in Pending.

First step - always check the Pod status with kubectl get pods. If you see Pending, describe the Pod and look at the last 20 lines.

Look for messages like "0/3 nodes are available: 3 node(s) didn't match Pod's node affinity/selector."

This tells you the affinity rules can't be satisfied. Debug by checking what labels the affinity requires, then check if any nodes have those labels. If no nodes match, add the label or fix the affinity rule.

Issue 2: Anti-affinity too restrictive.

Scenario: You have required anti-affinity but not enough nodes. The error message says nodes didn't match pod affinity rules or had volume node affinity conflicts.

Solution: Change from required to preferred by editing the deployment and modifying the anti-affinity section from requiredDuringScheduling to preferredDuringScheduling, adding a weight value.

Issue 3: Pods not co-locating.

You want Pod affinity but Pods are on different nodes. Debug by checking if target Pods exist, checking which nodes they're on with wide output, and verifying your affinity label selector.

Common mistakes include wrong label selector, target Pods don't exist yet, or wrong topology key.

Issue 4: Quick decision tree.

In the exam, use this mental checklist: Is the Pod pending? Check describe for scheduling errors. Error mentions affinity/selector? Verify node labels match requirements. No nodes match? Label a node or change affinity. Anti-affinity preventing scheduling? Change required to preferred. Still stuck? Check taints, resource capacity, other constraints.

---

### Section 7: Exam Strategies and Time-Saving Tips (3 min)
**[20:00-23:00]**

Let me share strategic advice for handling affinity in the CKAD exam.

Strategy 1: Prefer simpler mechanisms.

If the question can be solved with a nodeSelector instead of node affinity, use nodeSelector. It's faster to write and less error-prone. Only use affinity when you need its advanced features.

Strategy 2: Use kubectl explain for syntax.

Don't memorize the exact YAML structure. Use kubectl explain pod.spec.affinity, kubectl explain pod.spec.affinity.nodeAffinity, or kubectl explain pod.spec.affinity.podAntiAffinity. This shows you the exact field names and structure.

Strategy 3: Generate and modify.

Start with imperative commands to create a deployment, save it to YAML with dry-run, then edit it to add affinity. This is faster than writing from scratch.

Strategy 4: Common mistakes to avoid.

Forgetting nodeSelectorTerms wrapper - the matchExpressions must be inside nodeSelectorTerms. Wrong topology key - use kubernetes.io/hostname for same node, topology.kubernetes.io/zone for same zone. Case-sensitive labels - disktype is not the same as diskType. Required anti-affinity with too many replicas - if you have 5 replicas, 3 nodes, and required anti-affinity, 2 Pods will stay pending. Not checking if target Pods exist - Pod affinity fails if the target Pods haven't been created yet.

Strategy 5: Time management.

If you encounter an affinity question, read carefully - is it asking you to create or debug? For creation, use the simplest mechanism that works. For debugging, describe Pod, check Events, look at labels. Don't spend more than 5 minutes on any single question. Flag and move on if stuck.

---

### Section 8: Practice Scenario Walkthrough (3 min)
**[23:00-26:00]**

Let's do a quick practice scenario that simulates exam conditions.

Scenario: "Deploy application 'webapp' with 3 replicas. Pods must run on Linux nodes. Pods should be spread across different availability zones if possible, but all replicas must start even if only one zone is available."

Time yourself. You have 4 minutes.

Here's my approach: Step 1 takes 30 seconds - create the base deployment with dry-run and save to YAML. Step 2 takes 2 minutes - edit the YAML to add affinity rules. You need required nodeAffinity for Linux nodes with matchExpressions checking kubernetes.io/os equals linux. Then add preferred podAntiAffinity with weight 100, the podAffinityTerm has labelSelector matching app=webapp, and topologyKey is topology.kubernetes.io/zone.

Key decisions: Required node affinity for Linux because it's a must-have. Preferred Pod anti-affinity for spreading because it's nice to have. Used preferredDuringScheduling because the question says "all replicas must start."

Step 3 takes 1 minute - apply the YAML and verify with kubectl get pods showing the app label and wide output. Step 4 takes 30 seconds - confirm success by describing the deployment and checking replicas.

Total time: 4 minutes. Practice this workflow until you can do it in under 3 minutes.

---

### Section 9: Summary and Final Tips (1 min)
**[26:00-27:00]**

Let's wrap up with key takeaways for CKAD exam success with affinity.

Remember these essentials: Node affinity controls placement based on node labels. Pod affinity co-locates, anti-affinity spreads. Required creates hard constraints, preferred creates soft preferences. Topology key defines the scope: hostname, zone, or region. Always check kubectl describe pod Events for scheduling issues.

Practical exam tips: Use nodeSelector for simple cases. Use kubectl explain for syntax help. Generate base YAML with imperative commands. Understand required vs preferred deeply. Practice troubleshooting pending Pods. Know the standard labels: hostname, os, arch, zone, region.

Time-saving commands to memorize: kubectl get nodes --show-labels, kubectl label node with key-value, kubectl describe pod and tail for recent events, kubectl get pod with yaml output and grep for affinity.

Practice these patterns until they're second nature. The exam is time-pressured, so muscle memory with these commands is crucial.

Good luck with your CKAD exam preparation!
