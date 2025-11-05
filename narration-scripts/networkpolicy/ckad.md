# Network Policy CKAD Exam Preparation - Narration Script
**Duration:** 20-25 minutes
**Format:** CKAD exam-focused scenarios and patterns
**Target Audience:** CKAD exam candidates

---

## Introduction [0:00-1:00]

Welcome to the NetworkPolicy CKAD exam preparation session. This is where we focus specifically on what you need to know for the Certified Kubernetes Application Developer exam.

NetworkPolicy is classified as a supplementary topic for CKAD, which means it's helpful to know and may appear on the exam, but it's not as heavily weighted as core topics. However, when it does appear, candidates often struggle with it because it requires writing YAML from scratch - there are no imperative commands to help you.

In this session, we'll cover the exam-specific knowledge you need: common patterns, typical scenarios you'll encounter, debugging techniques, and most importantly, the common pitfalls that trip up exam candidates.

By the end of this session, you'll be able to quickly write NetworkPolicy YAML during the exam and troubleshoot connectivity issues efficiently. Let's dive in.

---

## Section 1: Exam Context & Fundamentals [1:00-4:00]

**[1:00-1:30] What CKAD Expects**

For the CKAD exam, you need to demonstrate these NetworkPolicy competencies:

Understanding ingress and egress traffic control - knowing which direction each rule type affects.

Using pod selectors and namespace selectors - selecting the right Pods and understanding scope.

Configuring port-based restrictions - allowing specific protocols and ports.

Applying CIDR-based rules - using IP blocks for external access control.

Implementing default deny policies - the foundational security pattern.

Debugging network connectivity issues - troubleshooting when things don't work.

The exam is performance-based. You'll be given a scenario and asked to create policies that implement specific security requirements. Speed matters, so you need to write YAML confidently without constantly referring to documentation.

**[1:30-2:30] Critical Exam Tip: Additive Nature**

The single most important concept for the exam is that NetworkPolicy is additive. Let me emphasize this because it affects every policy you write.

When multiple NetworkPolicies select the same Pod, they combine to create a union of allowed traffic. If any policy allows a specific traffic pattern, that traffic is permitted. You cannot write a policy to deny traffic that another policy allows.

This is identical to RBAC's behavior. It's a whitelist model: you start with no access and explicitly grant permissions.

Here's what this means practically: if one policy allows traffic from app=frontend, and another policy allows traffic from app=backend, both frontend and backend can reach the target Pod. The policies don't conflict; they combine.

The corollary is important: to block traffic, you simply don't allow it in any policy. There is no explicit deny rule.

Always test connectivity after applying policies. On the exam, verification is crucial. Don't just apply a policy and move on - test that it works as intended.

**[2:30-4:00] No Imperative Commands**

Here's a challenge unique to NetworkPolicy: there's no kubectl create command that generates a complete, functional policy. You must write YAML from scratch or use templates.

You can run this command:

```
kubectl create networkpolicy my-policy --dry-run=client -o yaml > netpol.yaml
```

But this only generates an empty skeleton. You still need to fill in podSelector, policyTypes, ingress rules, and egress rules. It's often faster to write the YAML from memory than to use this command.

My recommendation: memorize a few templates. Have a mental template for common patterns like allow-from-specific-pod, allow-to-api, and default-deny. During the exam, you can type these quickly and modify them for the specific scenario.

Practice writing policies from scratch until it becomes automatic. Use vim or nano efficiently - know how to create YAML files, edit them, and apply them quickly.

Common commands you'll use frequently:

Get policies: `kubectl get netpol`

Describe policy details: `kubectl describe networkpolicy my-policy`

Apply your YAML: `kubectl apply -f netpol.yaml`

Delete if you need to fix it: `kubectl delete networkpolicy my-policy`

---

## Section 2: Default Deny Patterns [4:00-7:00]

**[4:00-5:00] Three Essential Patterns**

Default deny policies are fundamental. You'll almost certainly encounter them on the exam. There are three patterns you must know cold.

Deny all ingress: This blocks all incoming traffic but allows outgoing traffic. The YAML has policyTypes with Ingress listed, but no ingress rules defined. An empty podSelector means it applies to all Pods in the namespace.

Deny all egress: This blocks all outgoing traffic but allows incoming traffic. The YAML has policyTypes with Egress listed, but no egress rules. Pods can receive connections but cannot initiate them or even resolve DNS.

Deny all traffic: This combines both - policyTypes lists both Ingress and Egress with no rules for either. Complete isolation. No traffic in or out.

The key to understanding these: when you specify a policyType but provide no rules for that type, you've created a default deny for that direction.

**[5:00-6:00] Practice Scenario: Verify Denial**

Let me walk through a quick practice scenario. The exam might ask you to create a default deny policy and verify that it blocks traffic.

First, create the policy with an empty podSelector and both policyTypes:

```
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
EOF
```

Then create test Pods:

```
kubectl run pod1 --image=nginx
kubectl run pod2 --image=busybox --command -- sleep 3600
```

Verify they cannot communicate:

```
kubectl exec pod2 -- wget -O- --timeout=2 http://pod1
```

This should fail with a timeout. That's your verification that the policy is working.

**[6:00-7:00] Common Mistake: Empty Selector Meaning**

A common exam mistake is misunderstanding what an empty podSelector means. Let me clarify:

`podSelector: {}` - empty curly braces - means ALL Pods. Not none. ALL. This is crucial.

If you want to select NO Pods, you don't use NetworkPolicy at all, or you use a selector that matches nothing, like a label that doesn't exist.

Empty podSelector is intentional and powerful. It's how you apply a policy to every Pod in a namespace, which is exactly what you want for default deny policies.

Remember: empty selector equals universal application within that namespace. This is consistent with other Kubernetes resources - an empty selector in a Service selects all Pods, for example.

---

## Section 3: Ingress Rules - Exam Scenarios [7:00-11:00]

**[7:00-8:00] Basic Pod-to-Pod Communication**

The most common exam scenario: allow traffic from one set of Pods to another.

For example: "Allow traffic from app=web Pods to app=api Pods on port 8080."

The pattern is straightforward. The policy's podSelector targets the destination - the Pods receiving traffic. The ingress from section specifies the source - the Pods sending traffic.

Here's the structure:

```yaml
spec:
  podSelector:
    matchLabels:
      app: api          # Apply to API Pods
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web      # Allow from web Pods
    ports:
    - protocol: TCP
      port: 8080        # On this port only
```

Notice the podSelector at the top selects the API Pods - the target. The podSelector inside from selects the web Pods - the source. This is a common point of confusion, so make sure you understand which selector does what.

**[8:00-9:00] Cross-Namespace Communication**

A more advanced scenario: "Allow Pods in namespace frontend to access app=api Pods in namespace backend."

This requires namespaceSelector. Here's the key insight: namespaceSelector matches namespaces by their labels, not by their names directly.

First, you need to verify or add a label to the namespace:

```
kubectl label namespace frontend tier=frontend
```

Then your policy uses namespaceSelector:

```yaml
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          tier: frontend
```

This allows traffic from any Pod in any namespace labeled tier=frontend.

If you want to be more specific - only certain Pods in certain namespaces - you combine both selectors in the same list item:

```yaml
- from:
  - namespaceSelector:
      matchLabels:
        tier: frontend
    podSelector:
      matchLabels:
        app: web
```

This is an AND condition: the Pod must be labeled app=web AND must be in a namespace labeled tier=frontend. Both conditions must be true.

**[9:00-10:00] OR vs AND Logic**

Understanding OR versus AND logic in ingress rules is critical for the exam. This trips up many candidates.

When namespaceSelector and podSelector are in the same list item - the same dash - it's an AND condition. Both must match.

When they're in separate list items - separate dashes - it's an OR condition. Either can match.

Example of OR:

```yaml
ingress:
- from:
  - podSelector:
      matchLabels:
        app: web
  - namespaceSelector:
      matchLabels:
        env: prod
```

This allows traffic from app=web Pods in the current namespace OR from any Pod in namespaces labeled env=prod.

Example of AND:

```yaml
ingress:
- from:
  - namespaceSelector:
      matchLabels:
        env: prod
    podSelector:
      matchLabels:
        app: web
```

This allows traffic from app=web Pods that are in namespaces labeled env=prod. Both conditions required.

On the exam, read the requirements carefully. "From web OR from prod namespace" versus "from web Pods in prod namespace" - these are different requirements.

**[10:00-11:00] CIDR-Based Rules**

Sometimes you need to allow or block traffic based on IP addresses. The exam might ask: "Allow traffic from IP range 192.168.1.0/24 except 192.168.1.5."

This uses ipBlock:

```yaml
ingress:
- from:
  - ipBlock:
      cidr: 192.168.1.0/24
      except:
      - 192.168.1.5/32
```

The cidr field specifies the allowed range. The except field lists specific IPs or ranges to exclude from that CIDR.

Common use cases: allowing traffic from specific external networks, allowing traffic from node networks, or blocking cloud metadata services like 169.254.169.254.

Note that ipBlock works with actual IP addresses, not DNS names. If the exam gives you a hostname, you cannot use it directly in ipBlock - you'd need to resolve it to IPs first.

---

## Section 4: Egress Rules - The DNS Trap [11:00-15:00]

**[11:00-12:00] Always Allow DNS**

This is the number one mistake on the exam: forgetting to allow DNS in egress policies.

Here's what happens: you create an egress policy that allows your web Pod to connect to your API Pod. You test it:

```
kubectl exec web-pod -- wget http://api-service/endpoint
```

It fails with "bad address" or "unknown host." Why? Because the Pod cannot resolve the service name api-service to an IP address. DNS is blocked.

Every egress policy must include a rule allowing DNS unless you're explicitly blocking all outgoing traffic. DNS uses UDP port 53 to the kube-system namespace where CoreDNS runs.

The standard pattern:

```yaml
egress:
- to:
  - namespaceSelector:
      matchLabels:
        name: kube-system
  ports:
  - protocol: UDP
    port: 53
```

Some clusters label the kube-system namespace differently, or you might need to select the CoreDNS Pods specifically:

```yaml
- to:
  - namespaceSelector: {}
    podSelector:
      matchLabels:
        k8s-app: kube-dns
  ports:
  - protocol: UDP
    port: 53
```

On the exam, if DNS isn't working, check your egress policies first. This is the most likely culprit.

**[12:00-13:30] Allow Egress to Specific Services**

After DNS, you need to allow egress to your actual destination services.

Scenario: "Allow app=web Pods to connect to app=api Pods on port 8080."

This is an egress policy on the web Pods:

```yaml
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: api
    ports:
    - protocol: TCP
      port: 8080
```

But remember, you also need DNS:

```yaml
egress:
- to:
  - namespaceSelector: {}
    podSelector:
      matchLabels:
        k8s-app: kube-dns
  ports:
  - protocol: UDP
    port: 53
- to:
  - podSelector:
      matchLabels:
        app: api
  ports:
  - protocol: TCP
    port: 8080
```

Notice these are two separate list items - two separate dashes under egress. Each dash creates a separate rule. The Pod can access DNS OR the API. These are OR'd together.

**[13:30-15:00] Allow External Access**

Sometimes Pods need to access external services outside the cluster. The exam might ask: "Allow web Pods to access external HTTPS services."

This uses ipBlock with 0.0.0.0/0 to represent "any IP":

```yaml
egress:
- to:
  - ipBlock:
      cidr: 0.0.0.0/0
  ports:
  - protocol: TCP
    port: 443
```

This allows HTTPS to anywhere. You can make it more restrictive:

```yaml
- to:
  - ipBlock:
      cidr: 0.0.0.0/0
      except:
      - 169.254.169.254/32  # Block cloud metadata
      - 10.0.0.0/8          # Block internal network
  ports:
  - protocol: TCP
    port: 443
```

The except field blocks specific ranges even though 0.0.0.0/0 would normally include them.

A complete example with DNS and external access:

```yaml
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
    ports:
    - protocol: TCP
      port: 443
```

This is a realistic pattern you'll use often: allow DNS and allow HTTPS to the internet.

---

## Section 5: Common CKAD Patterns [15:00-18:00]

**[15:00-16:00] Three-Tier Application**

A classic exam scenario: secure a three-tier application with web, API, and database layers.

Requirements:
- Web accepts traffic from anywhere on port 80
- Web can connect to API on port 8080
- API accepts traffic from web only
- API can connect to database on port 5432
- Database accepts traffic from API only
- All can access DNS

This requires three policies. Here's the database policy:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-policy
spec:
  podSelector:
    matchLabels:
      tier: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: api
    ports:
    - protocol: TCP
      port: 5432
```

The API policy has both ingress and egress:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-policy
spec:
  podSelector:
    matchLabels:
      tier: api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: web
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          tier: database
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
```

Notice the API policy allows egress to database AND DNS. Both are required.

**[16:00-17:00] Namespace Isolation**

Another common pattern: isolate a namespace so Pods can only talk to each other, not to Pods in other namespaces.

This is actually simple:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: namespace-isolation
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector: {}
```

This applies to all Pods in the prod namespace - empty podSelector at the top. It allows ingress from all Pods - empty podSelector in the from section. But because namespaceSelector is not specified, it defaults to the current namespace only.

Result: Pods in prod can communicate with each other, but Pods from other namespaces cannot reach Pods in prod.

If you want egress isolation too, add:

```yaml
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector: {}
  egress:
  - to:
    - podSelector: {}
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
```

Now Pods can only talk to each other and to DNS. Complete namespace isolation.

**[17:00-18:00] Allow-All Patterns**

Sometimes you need to explicitly allow all traffic, usually to override a more restrictive policy.

Allow all ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all-ingress
spec:
  podSelector:
    matchLabels:
      app: public
  policyTypes:
  - Ingress
  ingress:
  - {}
```

That empty curly braces in the ingress list means "allow from anywhere." No from section at all.

Allow all egress:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all-egress
spec:
  podSelector:
    matchLabels:
      app: unrestricted
  policyTypes:
  - Egress
  egress:
  - {}
```

Same thing for egress. No to section means "allow to anywhere."

These are useful when you have a default deny policy and need certain Pods to be unrestricted.

---

## Section 6: Testing and Debugging [18:00-21:00]

**[18:00-19:00] Testing Connectivity**

On the exam, you must verify your policies work. Here are the essential commands.

Test HTTP connectivity:

```
kubectl exec pod1 -- wget -O- --timeout=2 http://pod2
kubectl exec pod1 -- curl -m 2 http://service-name
```

The timeout flags are important. Without them, failed connections can hang for a long time, wasting exam time.

Test arbitrary ports with netcat:

```
kubectl exec pod1 -- nc -zv pod2-ip 8080
```

The -z flag is zero-I/O mode - just check if the port is open. -v is verbose.

Test DNS specifically:

```
kubectl exec pod1 -- nslookup kubernetes.default
kubectl exec pod1 -- nslookup my-service.my-namespace.svc.cluster.local
```

If this fails, your egress policy probably blocks DNS.

Get Pod IPs when you need to test without DNS:

```
kubectl get pods -o wide
```

Then use the IP address directly in your test commands.

**[19:00-20:00] Debugging Policies**

When something doesn't work, here's your debugging workflow.

First, list all policies in the namespace:

```
kubectl get networkpolicies
```

Describe the specific policy to see what it's doing:

```
kubectl describe networkpolicy my-policy
```

Pay attention to the "Pod Selector" line - it shows you which Pods are affected and how many match.

Check Pod labels to ensure they match your selectors:

```
kubectl get pods --show-labels
```

If labels don't match, your policy won't apply to those Pods.

Check namespace labels for namespaceSelector issues:

```
kubectl get namespaces --show-labels
```

If you're trying to match namespace "prod" but it doesn't have the required label, your policy won't work.

Verify that your CNI actually enforces NetworkPolicy:

```
kubectl get pods -n kube-system
```

Look for calico, cilium, or weave Pods. If you only see flannel, policies won't be enforced.

**[20:00-21:00] Common Debugging Scenarios**

Scenario 1: "My app can't reach the API."

Check: Does the app Pod have an egress policy? Does it allow the API Pod's selector and port? Does it allow DNS?

Quick test: Can the Pod resolve the service name?

```
kubectl exec app-pod -- nslookup api-service
```

If this fails, DNS is blocked. If it succeeds but the connection fails, the egress rule might not match the API Pod correctly.

Scenario 2: "My API isn't receiving traffic."

Check: Does the API Pod have an ingress policy? Does it allow the source Pod's selector and the correct port?

Verify the source Pod's labels:

```
kubectl get pod source-pod --show-labels
```

Make sure these labels match the podSelector in the API's ingress policy.

Scenario 3: "Cross-namespace communication isn't working."

Check: Does the namespace have the required label?

```
kubectl get namespace frontend --show-labels
```

If the label is missing, add it:

```
kubectl label namespace frontend tier=frontend
```

Then test again.

---

## Section 7: Exam Strategy and Pitfalls [21:00-24:00]

**[21:00-22:00] Top 10 Exam Pitfalls**

Let me run through the ten most common mistakes candidates make with NetworkPolicy on the CKAD exam.

1. Forgetting DNS - We've covered this extensively. Always include DNS in egress policies.

2. Empty podSelector confusion - Remember, `podSelector: {}` means ALL Pods, not none.

3. AND vs OR logic - Same list item equals AND, separate items equal OR.

4. Policy not enforced - If your cluster doesn't support NetworkPolicy, policies won't work. The exam environment should support it, but be aware.

5. Service vs Pod - NetworkPolicy works on Pods, not Services. Use Pod labels, not Service names.

6. Forgetting policyTypes - If you specify policyTypes, you must list Ingress, Egress, or both. Forgetting this can cause unexpected blocking.

7. Namespace labels - namespaceSelector requires namespaces to have labels. Don't assume they're there; check and add if needed.

8. Bidirectional communication - Allowing A to talk to B doesn't allow B to talk to A. You need policies for both directions.

9. Using port names incorrectly - Named ports in policies must match the container port names exactly.

10. CIDR for Pod IPs - Don't use ipBlock for Pod-to-Pod communication. Pod IPs can change. Use podSelector instead.

**[22:00-23:00] Time Management Strategy**

NetworkPolicy questions can be time-consuming because you're writing YAML from scratch. Here's how to manage time effectively.

Read the requirements carefully. Understand what traffic should be allowed and what should be blocked.

Start with a template. Have mental templates for common patterns like ingress-from-pods, egress-to-api, and default-deny.

Write the YAML in an editor. Don't try to use cat with heredoc on the exam - it's too error-prone. Use vim or nano to create a file, then apply it.

Test incrementally. Don't write three policies and then test. Write one, apply it, test it, then move to the next.

Use describe liberally. `kubectl describe networkpolicy` shows you exactly what's selected and what's allowed.

If it's not working and you're stuck, move on. NetworkPolicy questions aren't worth spending 20 minutes on. Get partial credit if you can, then come back if time permits.

**[23:00-24:00] Final Preparation Tips**

To be exam-ready, you need to practice writing policies from memory. Here's my recommended practice routine.

First, memorize three templates: a basic ingress policy, a basic egress policy with DNS, and a default deny policy. Write these from scratch repeatedly until you can type them without thinking.

Second, practice common scenarios. Set up test environments and secure them with policies. Three-tier apps, cross-namespace communication, namespace isolation - do each scenario at least five times.

Third, practice debugging. Intentionally break policies and practice identifying and fixing the issues quickly.

Fourth, get comfortable with kubectl exec and testing commands. wget, curl, nslookup, nc - know these cold.

Fifth, review the official Kubernetes documentation page on NetworkPolicy. The exam allows you to access documentation, so know where to find examples quickly if you need them.

Finally, remember the exam environment should enforce NetworkPolicy. If you're practicing locally, make sure you're using a CNI that enforces policies, or your practice won't reflect reality.

---

## Conclusion [24:00-25:00]

**Summary**

We've covered everything you need for NetworkPolicy on the CKAD exam.

You understand that policies are additive - multiple policies combine to allow traffic.

You know the three default deny patterns and when to use each.

You can write ingress rules using podSelector, namespaceSelector, and ipBlock.

You understand AND vs OR logic in rule combinations.

You can write egress rules and critically, you remember to always include DNS.

You know the common patterns: three-tier apps, namespace isolation, allow-all overrides.

You have testing and debugging strategies that will save you time on the exam.

And you're aware of the common pitfalls that trap other candidates.

**Final Words**

NetworkPolicy is intimidating because there's no imperative command to help you. But with practice, it becomes mechanical. You're not solving complex problems; you're applying known patterns to specific scenarios.

Put in the practice time. Write policies from scratch until it's automatic. Set up test scenarios and secure them. Break things and fix them. Build muscle memory.

Remember: on the exam, speed comes from confidence. Confidence comes from practice. Practice deliberately, practice repeatedly, and you'll be ready.

Good luck on your CKAD exam. You've got this.
