# NetworkPolicy for CKAD

This document extends the [basic networkpolicy lab](README.md) with CKAD exam-specific scenarios and requirements.

## CKAD Exam Context

NetworkPolicy is a critical CKAD topic. You need to:
- Understand ingress and egress traffic control
- Use pod selectors and namespace selectors
- Configure port-based restrictions
- Apply CIDR-based rules
- Implement default deny policies
- Debug network connectivity issues

**Exam Tip:** NetworkPolicy is **additive** - multiple policies combine to allow traffic. Start with no access, then add what you need. Always test connectivity after applying policies.

**Important:** Not all Kubernetes clusters enforce NetworkPolicy. The exam environment should support it, but local dev clusters may not (Docker Desktop doesn't, Calico/Cilium do).

## API specs

- [NetworkPolicy (networking.k8s.io/v1)](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#networkpolicy-v1-networking-k8s-io)
- [NetworkPolicy concepts](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

## NetworkPolicy Basics

NetworkPolicies work at the Pod level (not Service level):
- Select Pods using label selectors
- Define ingress (incoming) and/or egress (outgoing) rules
- Rules are **allow-lists** (whitelist model)
- Multiple policies are **additive** (union of all rules)
- Without any policy, all traffic is allowed

### Basic Structure

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: my-policy
  namespace: default
spec:
  podSelector:        # Which Pods this policy applies to
    matchLabels:
      app: myapp
  policyTypes:        # Which traffic directions to control
  - Ingress
  - Egress
  ingress:           # Rules for incoming traffic
  - from:
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - protocol: TCP
      port: 80
  egress:            # Rules for outgoing traffic
  - to:
    - podSelector:
        matchLabels:
          role: backend
    ports:
    - protocol: TCP
      port: 3306
```

## Imperative vs Declarative

**Important:** NetworkPolicy has **no imperative create command**. You must write YAML.

```
# Generate template (requires YAML editing)
kubectl create networkpolicy my-policy --dry-run=client -o yaml > netpol.yaml

# Apply NetworkPolicy
kubectl apply -f netpol.yaml

# Get NetworkPolicies
kubectl get networkpolicies
kubectl get netpol  # shorthand

# Describe to see details
kubectl describe networkpolicy my-policy

# Delete
kubectl delete networkpolicy my-policy
```

## Default Deny Policies

Best practice: Start with default deny, then explicitly allow required traffic.

### Deny All Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}  # Empty selector = applies to all Pods
  policyTypes:
  - Ingress
  # No ingress rules = deny all incoming traffic
```

### Deny All Egress

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-egress
spec:
  podSelector: {}
  policyTypes:
  - Egress
  # No egress rules = deny all outgoing traffic
```

### Deny All Ingress and Egress

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

📋 Create a default deny-all policy in your namespace, deploy two nginx pods, and verify they cannot communicate.

<details>
  <summary>Solution</summary>

```
# Create deny-all policy
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

# Deploy test pods
kubectl run pod1 --image=nginx
kubectl run pod2 --image=busybox --command -- sleep 3600

# Wait for pods to be ready (they won't be fully ready due to network policy)
kubectl get pods

# Try to communicate (this will fail)
kubectl exec pod2 -- wget -O- --timeout=2 http://pod1
# Should timeout or fail

# Check network policy
kubectl describe networkpolicy default-deny-all
```

</details><br />

## Ingress Rules (Incoming Traffic)

Ingress rules control traffic **to** Pods selected by `podSelector`.

### Allow from Specific Pods

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
```

This allows traffic **to** `app=backend` pods **from** `app=frontend` pods.

### Allow from Specific Namespaces

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-namespace
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          team: platform
```

This allows traffic **to** `app=api` pods **from** any pod in namespaces labeled `team=platform`.

### Allow from Specific Pods in Specific Namespaces

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-pod-in-namespace
spec:
  podSelector:
    matchLabels:
      app: database
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          env: production
      podSelector:
        matchLabels:
          app: backend
```

**Important:** When `namespaceSelector` and `podSelector` are in the **same** list item (same `-`), it's an **AND** condition - pods must match both.

### Allow from Pods OR Namespaces

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-multiple-sources
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web
    - namespaceSelector:
        matchLabels:
          env: test
```

**Important:** Multiple items in the `from` list (multiple `-`) are **OR** conditions - traffic from either source is allowed.

### Allow from IP Blocks (CIDR)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-cidr
spec:
  podSelector:
    matchLabels:
      app: public-api
  ingress:
  - from:
    - ipBlock:
        cidr: 192.168.1.0/24
        except:
        - 192.168.1.5/32
```

This allows traffic from `192.168.1.0/24` except from `192.168.1.5`.

### Allow on Specific Ports

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-http-https
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
  - from:
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
```

This allows traffic to ports 80 and 443 only.

📋 Create a NetworkPolicy that allows ingress to `app=api` pods on port 8080 from `app=web` pods only.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-from-web
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web
    ports:
    - protocol: TCP
      port: 8080
EOF

kubectl describe netpol api-allow-from-web
```

</details><br />

## Egress Rules (Outgoing Traffic)

Egress rules control traffic **from** Pods selected by `podSelector`.

### Allow to Specific Pods

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-to-backend
spec:
  podSelector:
    matchLabels:
      app: frontend
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: backend
```

### Allow DNS (Critical for Most Apps)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
spec:
  podSelector:
    matchLabels:
      app: myapp
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
```

**Important:** Most applications need DNS. If you have egress policies, you typically need to allow DNS explicitly.

### Allow to External IPs

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-external-api
spec:
  podSelector:
    matchLabels:
      app: web
  egress:
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 169.254.169.254/32  # Block cloud metadata service
    ports:
    - protocol: TCP
      port: 443
```

### Combined Egress Rules

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-egress
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Egress
  egress:
  # Allow DNS
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53
  # Allow to backend on port 8080
  - to:
    - podSelector:
        matchLabels:
          app: backend
    ports:
    - protocol: TCP
      port: 8080
  # Allow HTTPS to internet
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
    ports:
    - protocol: TCP
      port: 443
```

📋 Create a NetworkPolicy for `app=frontend` pods that allows egress to `app=api` pods on port 8080 and allows DNS.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-egress
spec:
  podSelector:
    matchLabels:
      app: frontend
  policyTypes:
  - Egress
  egress:
  # Allow DNS
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
  # Allow to API
  - to:
    - podSelector:
        matchLabels:
          app: api
    ports:
    - protocol: TCP
      port: 8080
EOF
```

</details><br />

## Common CKAD Patterns

### Pattern 1: Three-Tier Application

Web tier → API tier → Database tier

```yaml
---
# Database: Allow ingress from API only
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
      port: 3306
---
# API: Allow ingress from web, egress to db
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
      port: 3306
---
# Web: Allow ingress from anywhere, egress to api
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-policy
spec:
  podSelector:
    matchLabels:
      tier: web
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector: {}  # Allow from any pod
    ports:
    - protocol: TCP
      port: 80
  egress:
  - to:
    - podSelector:
        matchLabels:
          tier: api
    ports:
    - protocol: TCP
      port: 8080
```

### Pattern 2: Namespace Isolation

Isolate namespaces from each other:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: namespace-isolation
  namespace: prod
spec:
  podSelector: {}  # All pods in this namespace
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector: {}  # Only from pods in same namespace
```

### Pattern 3: Allow All Ingress

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
  - {}  # Empty rule = allow all
```

### Pattern 4: Allow All Egress

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
  - {}  # Empty rule = allow all
```

## Testing NetworkPolicy

### Test Connectivity Between Pods

```bash
# Get pod IPs
kubectl get pods -o wide

# Test with wget (for HTTP)
kubectl exec pod1 -- wget -O- --timeout=2 http://pod2

# Test with curl
kubectl exec pod1 -- curl -m 2 http://pod2

# Test with nc (netcat) for any port
kubectl exec pod1 -- nc -zv pod2-ip 8080

# Test with ping (ICMP - often blocked by default)
kubectl exec pod1 -- ping -c 2 pod2-ip
```

### Test DNS Resolution

```bash
# Check if DNS works
kubectl exec pod1 -- nslookup kubernetes.default

# Check service DNS
kubectl exec pod1 -- nslookup my-service

# Check cross-namespace
kubectl exec pod1 -- nslookup my-service.other-namespace.svc.cluster.local
```

### Debug NetworkPolicy

```bash
# List all NetworkPolicies
kubectl get networkpolicies --all-namespaces

# Describe to see which pods are selected
kubectl describe networkpolicy my-policy

# Check pod labels
kubectl get pods --show-labels

# Check if pod is affected by any policy
kubectl get networkpolicies --all-namespaces -o yaml | grep -A 5 "podSelector"
```

## CKAD Exam Scenarios

### Scenario 1: Allow Web to API Communication

**Task:** You have `app=web` and `app=api` pods. Create a NetworkPolicy so web can access api on port 8080.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-web
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web
    ports:
    - protocol: TCP
      port: 8080
EOF
```

</details><br />

### Scenario 2: Namespace-Level Isolation

**Task:** Create a NetworkPolicy in the `prod` namespace that only allows traffic from pods within the same namespace.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: prod-isolation
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector: {}
EOF
```

</details><br />

### Scenario 3: Allow Only Specific Namespaces

**Task:** Create a NetworkPolicy for `app=api` pods that allows ingress only from pods in namespaces labeled `env=prod`.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-prod-namespace
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          env: prod
EOF
```

</details><br />

### Scenario 4: Database with Multiple Clients

**Task:** Create a NetworkPolicy for `app=database` pods that allows ingress on port 5432 from both `app=api` and `app=analytics` pods.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-allow-clients
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api
    - podSelector:
        matchLabels:
          app: analytics
    ports:
    - protocol: TCP
      port: 5432
EOF
```

</details><br />

### Scenario 5: Egress with DNS

**Task:** Create a NetworkPolicy for `app=web` pods that allows egress to `app=api` on port 8080 and allows DNS queries.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-egress-policy
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Egress
  egress:
  # DNS
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53
  # API access
  - to:
    - podSelector:
        matchLabels:
          app: api
    ports:
    - protocol: TCP
      port: 8080
EOF
```

Note: DNS selector might vary by cluster. You may need:
```yaml
podSelector:
  matchLabels:
    k8s-app: kube-dns
```

</details><br />

## Advanced Topics

TODO: Add sections on:
- Named ports in NetworkPolicy
- Combining multiple NetworkPolicies (order and precedence)
- NetworkPolicy for StatefulSets with stable network identities
- Using endPort for port ranges (1.22+)
- NetworkPolicy best practices for microservices
- Performance considerations with many policies

## Common CKAD Pitfalls

1. **Forgetting DNS** - Egress policies often block DNS, causing "unknown host" errors
2. **Empty podSelector meaning** - `podSelector: {}` means ALL pods (not none)
3. **AND vs OR confusion** - Same list item = AND, different items = OR
4. **Policy not enforced** - Not all clusters support NetworkPolicy (check CNI)
5. **Service vs Pod** - NetworkPolicy works on Pods, not Services
6. **policyTypes required** - If you specify `policyTypes`, you must list what you want
7. **Namespace labels** - namespaceSelector needs namespace to have labels
8. **Bidirectional communication** - Allowing A→B doesn't allow B→A (need both policies)
9. **Port names** - Using named ports requires matching container port names
10. **CIDR for pod IPs** - Pod IPs change, use pod/namespace selectors instead

## NetworkPolicy Rules Reference

### podSelector Scope

```yaml
spec:
  podSelector: {}           # All pods in current namespace
  podSelector:              # Specific pods in current namespace
    matchLabels:
      app: web
```

### Ingress From

```yaml
ingress:
- from:
  - podSelector:           # Pods in same namespace
      matchLabels:
        app: web
  - namespaceSelector:     # OR: All pods in matching namespaces
      matchLabels:
        env: prod
  - ipBlock:               # OR: IP ranges
      cidr: 10.0.0.0/8
```

### Ingress From (AND condition)

```yaml
ingress:
- from:
  - namespaceSelector:     # Pods must match both
      matchLabels:
        env: prod
    podSelector:
      matchLabels:
        app: web
```

### Egress To

```yaml
egress:
- to:
  - podSelector:           # Same rules as ingress
      matchLabels:
        app: api
  ports:
  - protocol: TCP
    port: 8080
```

### Port Specifications

```yaml
ports:
- protocol: TCP            # TCP or UDP
  port: 80                 # Target port
- protocol: TCP
  port: 443
  endPort: 8443           # Port range (1.22+)
```

## Quick Reference Commands

```bash
# Get NetworkPolicies
kubectl get networkpolicy
kubectl get netpol
kubectl get netpol --all-namespaces

# Describe policy
kubectl describe networkpolicy my-policy

# Get policy YAML
kubectl get networkpolicy my-policy -o yaml

# Delete policy
kubectl delete networkpolicy my-policy

# Test connectivity
kubectl exec pod1 -- wget -O- --timeout=2 http://pod2
kubectl exec pod1 -- nc -zv pod2-ip port

# Check pod labels (for troubleshooting)
kubectl get pods --show-labels

# Check namespace labels
kubectl get namespaces --show-labels
```

## Practice Exercises

### Exercise 1: Complete Three-Tier App

Deploy a three-tier application (web, api, database) with:
- Default deny-all policy
- Web accepts traffic from anywhere on port 80
- Web can connect to API on port 8080
- API accepts traffic from web only
- API can connect to database on port 5432
- Database accepts traffic from API only
- All pods can access DNS

TODO: Add detailed solution with YAML

### Exercise 2: Cross-Namespace Communication

- Create two namespaces: `frontend` and `backend`
- Label `backend` namespace with `tier=backend`
- Deploy app in `frontend`, api in `backend`
- Create NetworkPolicy allowing frontend app to access backend api
- Verify communication works cross-namespace

TODO: Add step-by-step solution

### Exercise 3: Egress Restriction

Create a policy that:
- Applies to `app=restricted` pods
- Allows egress to internal services only (10.0.0.0/8)
- Blocks all external traffic
- Allows DNS

TODO: Add detailed solution

## Cleanup

```bash
# Delete specific NetworkPolicy
kubectl delete networkpolicy my-policy

# Delete all NetworkPolicies in namespace
kubectl delete networkpolicy --all

# Delete by label
kubectl delete networkpolicy -l app=myapp

# Delete in specific namespace
kubectl delete networkpolicy --all -n production
```

## Next Steps

After mastering NetworkPolicy for CKAD:
1. Practice [Namespaces](../namespaces/) - Often combined with NetworkPolicy
2. Study [Services](../services/) - Understanding pod-to-service communication
3. Review [RBAC](../rbac/) - Access control complement to network control
4. Explore [Ingress](../ingress/) - External access patterns

---

## Study Checklist for CKAD

- [ ] Understand NetworkPolicy structure (podSelector, policyTypes, ingress, egress)
- [ ] Create default deny policies (ingress, egress, both)
- [ ] Write ingress rules with podSelector
- [ ] Write ingress rules with namespaceSelector
- [ ] Combine pod and namespace selectors (AND vs OR)
- [ ] Use ipBlock for CIDR-based rules
- [ ] Write egress rules for outbound traffic
- [ ] Always include DNS in egress policies
- [ ] Configure port-specific rules
- [ ] Understand policy additivity (multiple policies combine)
- [ ] Test connectivity with wget/curl/nc
- [ ] Debug policies with describe and labels
- [ ] Create namespace isolation policies
- [ ] Implement multi-tier application network security
- [ ] Recognize when NetworkPolicy is not enforced (CNI support)
