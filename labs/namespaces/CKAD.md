# Namespaces for CKAD

This document extends the [basic namespaces lab](README.md) with CKAD exam-specific scenarios and requirements.

## CKAD Exam Context

In the CKAD exam, you'll frequently work with namespaces to:
- Isolate exam tasks from each other
- Demonstrate understanding of resource scoping
- Work with resource quotas and limits
- Manage cross-namespace communication

**Exam Tip:** Always verify which namespace you're working in before running commands. Use `kubectl config set-context --current --namespace <name>` or the `-n` flag consistently.

## API specs

- [Namespace](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#namespace-v1-core)
- [ResourceQuota](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#resourcequota-v1-core)
- [LimitRange](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#limitrange-v1-core)

## Imperative Namespace Management

The CKAD exam rewards speed, so you should be comfortable with imperative commands:

```
# Create a namespace imperatively
kubectl create namespace ckad-practice

# Create with a specific manifest
kubectl create namespace dev --dry-run=client -o yaml > namespace.yaml

# Set as default for current context
kubectl config set-context --current --namespace ckad-practice

# List all namespaces
kubectl get namespaces
kubectl get ns

# Describe a namespace to see resource quotas
kubectl describe ns ckad-practice

# Delete a namespace (WARNING: deletes all resources inside)
kubectl delete namespace ckad-practice
```

📋 Create a namespace called `exam-prep`, set it as your default, create a pod called `nginx` running `nginx:alpine`, then switch back to the `default` namespace.

<details>
  <summary>Solution</summary>

```
kubectl create namespace exam-prep
kubectl config set-context --current --namespace exam-prep
kubectl run nginx --image=nginx:alpine
kubectl get pods
kubectl config set-context --current --namespace default
```

</details><br />

## Resource Quotas in CKAD

Resource quotas limit the total resources that can be consumed in a namespace. This is a key CKAD topic.

### Understanding ResourceQuota

A ResourceQuota can limit:
- **Compute resources**: CPU, memory requests and limits
- **Object counts**: Pods, Services, ConfigMaps, Secrets, PVCs
- **Storage**: Total storage requests

Example quota spec:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: dev
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "10"
```

### CKAD Scenario: Applying Quotas

Create a namespace with quotas and test the limits:

```
# Create namespace
kubectl create namespace quota-test

# Create a quota (you'll need to write the YAML in exam)
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: mem-cpu-quota
  namespace: quota-test
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
    pods: "5"
EOF

# Check the quota
kubectl describe quota -n quota-test
```

**Important for CKAD**: When a namespace has a ResourceQuota for CPU or memory, **every** Pod must specify resource requests and limits, or it will be rejected.

Try creating a pod without resource limits:

```
kubectl -n quota-test run nginx --image=nginx

# This will fail - check the error
kubectl -n quota-test get pods
kubectl -n quota-test get events
```

📋 Create a Pod in the `quota-test` namespace with resource requests and limits that will be accepted.

<details>
  <summary>Solution</summary>

```
kubectl -n quota-test run nginx --image=nginx \
  --requests=cpu=100m,memory=128Mi \
  --limits=cpu=200m,memory=256Mi

# Or with YAML:
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  namespace: quota-test
spec:
  containers:
  - name: nginx
    image: nginx
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "200m"
        memory: "256Mi"
EOF

# Verify quota usage
kubectl describe quota mem-cpu-quota -n quota-test
```

</details><br />

## LimitRanges in CKAD

TODO: Add detailed LimitRange section covering:
- Default resource limits for containers
- Min/Max constraints
- Default request values
- LimitRange vs ResourceQuota differences
- CKAD exam scenarios with LimitRanges

## ServiceAccounts and Namespaces

ServiceAccounts are namespace-scoped. Each namespace gets a `default` ServiceAccount automatically.

```
# List ServiceAccounts in a namespace
kubectl get serviceaccounts -n default
kubectl get sa -n default

# Create a ServiceAccount
kubectl create serviceaccount my-sa -n default

# Create a pod using a specific ServiceAccount
kubectl run pod-with-sa --image=nginx \
  --serviceaccount=my-sa \
  -n default
```

📋 Create a namespace `app-namespace`, create a ServiceAccount `app-sa` in it, and run a pod using that ServiceAccount.

<details>
  <summary>Solution</summary>

```
kubectl create namespace app-namespace
kubectl create serviceaccount app-sa -n app-namespace
kubectl run app-pod --image=nginx --serviceaccount=app-sa -n app-namespace

# Verify
kubectl describe pod app-pod -n app-namespace | grep -i serviceaccount
```

</details><br />

TODO: Add section on:
- ServiceAccount tokens and mounting
- Using ServiceAccounts with RBAC
- Default ServiceAccount behavior

## Cross-Namespace Communication

This is critical for CKAD - understanding how pods in different namespaces communicate.

### Service DNS Patterns

Services are namespace-scoped. DNS follows this pattern:

```
<service-name>.<namespace>.svc.cluster.local
```

- **Short name** (`service-name`): Only works within the same namespace
- **Namespace-qualified** (`service-name.namespace`): Works across namespaces
- **FQDN** (`service-name.namespace.svc.cluster.local`): Full qualified name

### CKAD Scenario: Cross-Namespace Service Access

Let's create services in different namespaces and test connectivity:

```
# Create two namespaces
kubectl create namespace frontend
kubectl create namespace backend

# Deploy a backend service
kubectl -n backend run db --image=nginx --port=80
kubectl -n backend expose pod db --port=80

# Deploy a frontend pod with a test container
kubectl -n frontend run web --image=busybox --command -- sleep 3600
```

Test DNS resolution from the frontend namespace:

```
# This will fail - service is in different namespace
kubectl -n frontend exec web -- nslookup db

# This will work - namespace-qualified
kubectl -n frontend exec web -- nslookup db.backend

# This will work - FQDN
kubectl -n frontend exec web -- nslookup db.backend.svc.cluster.local

# Test actual connectivity
kubectl -n frontend exec web -- wget -qO- http://db.backend
```

📋 Create a ConfigMap in the `backend` namespace that contains the correct DNS name for the `db` service, then mount it in the `web` pod.

<details>
  <summary>Solution</summary>

```
# Create ConfigMap with service URL
kubectl -n backend create configmap db-config \
  --from-literal=DB_HOST=db.backend.svc.cluster.local

# You'd need to recreate the pod to mount the ConfigMap
# In the exam, you might need to write this YAML:
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: web
  namespace: frontend
spec:
  containers:
  - name: busybox
    image: busybox
    command: ["sleep", "3600"]
    env:
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: db-config
          key: DB_HOST
EOF

# Note: This requires the ConfigMap to be in the same namespace
# For cross-namespace ConfigMap access, see solution notes
```

**Important**: ConfigMaps and Secrets are namespace-scoped and cannot be directly referenced across namespaces. You need to create them in the same namespace as the pod.

</details><br />

TODO: Add detailed section on:
- Cross-namespace ConfigMap/Secret strategies
- NetworkPolicy with namespace selectors
- Best practices for multi-namespace applications

## Namespace-Scoped vs Cluster-Scoped Resources

Understanding resource scope is important for CKAD:

**Namespace-scoped resources:**
- Pods, Deployments, ReplicaSets, StatefulSets, DaemonSets
- Services, Endpoints
- ConfigMaps, Secrets
- ServiceAccounts
- PersistentVolumeClaims (PVCs)
- ResourceQuotas, LimitRanges
- NetworkPolicies
- Ingresses

**Cluster-scoped resources:**
- Nodes
- Namespaces themselves
- PersistentVolumes (PVs)
- StorageClasses
- ClusterRoles, ClusterRoleBindings
- CustomResourceDefinitions (CRDs)

```
# List all API resources with their scope
kubectl api-resources --namespaced=true
kubectl api-resources --namespaced=false

# Get cluster-scoped resources (no -n flag needed)
kubectl get nodes
kubectl get pv
kubectl get clusterroles
```

## CKAD Exam Patterns and Tips

### Common Exam Tasks

1. **Create namespace and set context**
   ```
   kubectl create ns exam-task-1
   kubectl config set-context --current --namespace exam-task-1
   ```

2. **Deploy application with quotas**
   - Create namespace
   - Apply ResourceQuota
   - Deploy pods with resource requests/limits
   - Verify quota usage

3. **Cross-namespace service discovery**
   - Deploy services in different namespaces
   - Configure pods to communicate using FQDN
   - Test connectivity

4. **Resource isolation**
   - Deploy similar apps in different namespaces
   - Apply different quotas/limits
   - Verify isolation

### Time-Saving Tips

1. **Use aliases**
   ```
   alias k=kubectl
   alias kn='kubectl config set-context --current --namespace'
   ```

2. **Always verify namespace before running commands**
   ```
   kubectl config view --minify | grep namespace
   ```

3. **Use `-n` flag vs changing context**
   - Changing context is safer but slower
   - Using `-n` is faster but requires discipline
   - In exam, use what you're comfortable with

4. **Imperative commands with --dry-run**
   ```
   # Generate YAML quickly
   kubectl create quota my-quota --hard=cpu=2,memory=2Gi \
     --namespace=test --dry-run=client -o yaml > quota.yaml
   ```

## Practice Exercises

### Exercise 1: Multi-Namespace Application

Deploy a three-tier application across namespaces:
- `database` namespace: MySQL pod and service
- `api` namespace: API pod that connects to database
- `web` namespace: Web frontend that connects to API

Requirements:
- Apply ResourceQuota to each namespace (cpu: 1, memory: 1Gi)
- All pods must have resource requests and limits
- Test cross-namespace communication
- Use ConfigMaps for service discovery

TODO: Add detailed solution and YAML specs

### Exercise 2: Quota Enforcement

Create a namespace `limited-resources` with the following constraints:
- Maximum 3 pods
- Maximum 2 CPU cores total
- Maximum 2Gi memory total
- Try to exceed limits and observe behavior

TODO: Add step-by-step solution

### Exercise 3: Namespace Migration

Move an application from namespace `dev` to namespace `prod`:
- Export existing resources
- Modify namespace references
- Apply to new namespace
- Verify functionality
- Clean up old namespace

TODO: Add detailed migration procedure

## Advanced CKAD Topics

TODO: Add sections on:
- Pod Security Standards per namespace
- Network isolation with NetworkPolicy namespace selectors
- Resource quotas with priority classes
- Namespace lifecycle and finalizers
- Automating namespace creation with templates

## Common Pitfalls

1. **Forgetting to set namespace** - Always verify with `kubectl config view --minify | grep namespace`

2. **Resource requirements with quotas** - When ResourceQuota exists, all containers need requests/limits

3. **ConfigMap/Secret scope** - Cannot reference across namespaces directly

4. **Service DNS short names** - Only work within same namespace

5. **Label selectors** - Don't span namespaces; Services only select pods in same namespace

6. **Default namespace** - Never assume; always specify explicitly in exam

## Cleanup

```
# Clean up all practice namespaces
kubectl delete namespace quota-test
kubectl delete namespace frontend
kubectl delete namespace backend
kubectl delete namespace exam-prep

# Or delete multiple at once
kubectl delete ns quota-test frontend backend exam-prep
```

## Next Steps

After mastering namespaces for CKAD:
1. Practice [RBAC](../rbac/) for namespace-level access control
2. Study [NetworkPolicy](../networkpolicy/) for namespace isolation
3. Review [Resource Management](../productionizing/) for production patterns
4. Explore [Multi-tenancy patterns](https://kubernetes.io/docs/concepts/security/multi-tenancy/)

---

## Study Checklist for CKAD

- [ ] Create namespaces imperatively
- [ ] Set and switch namespace context
- [ ] Apply ResourceQuotas
- [ ] Create LimitRanges
- [ ] Deploy pods with resource requests/limits
- [ ] Create and use ServiceAccounts in namespaces
- [ ] Resolve services across namespaces using DNS
- [ ] List resources across all namespaces
- [ ] Understand namespace-scoped vs cluster-scoped resources
- [ ] Handle ConfigMap/Secret namespace scoping
- [ ] Clean up resources by deleting namespaces
