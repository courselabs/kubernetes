# RBAC CKAD Exam Preparation - Narration Script
**Duration: 25-30 minutes**
**Format: Advanced topics and exam strategies following CKAD.md**

---

## Introduction (1:00)

Welcome to the CKAD exam preparation session for Role-Based Access Control. This session builds on the basic RBAC concepts and takes you deeper into advanced topics, troubleshooting techniques, and exam strategies.

RBAC questions appear in the "Application Environment, Configuration and Security" domain, which represents 25% of the CKAD exam. You'll likely face scenarios requiring ServiceAccount creation, permission configuration, and troubleshooting.

This session covers complex RBAC rules, built-in ClusterRoles, cross-namespace access, troubleshooting patterns, and most importantly - speed techniques for the time-constrained exam environment.

Let's begin with advanced ServiceAccount management.

---

## ServiceAccount Deep Dive (3:00)

**[Time: 4:00 total]**

For the CKAD exam, you must be comfortable creating and managing ServiceAccounts quickly. Let's explore both imperative and declarative approaches.

**[Terminal ready]**

The fastest way to create a ServiceAccount is imperatively:

```bash
kubectl create serviceaccount myapp
```

**[Execute command]**

That's it - one command. You can use the shorthand "sa" instead of "serviceaccount":

```bash
kubectl create sa webapp
```

**[Execute command]**

For listing ServiceAccounts:

```bash
kubectl get sa
```

**[Execute command, show output including default SA]**

Every namespace has a "default" ServiceAccount that's used by Pods if you don't specify a different one. Let's look at the details:

```bash
kubectl describe sa myapp
```

**[Execute command, highlight tokens section]**

Notice Kubernetes automatically creates a token for this ServiceAccount. When a Pod uses this ServiceAccount, this token is mounted into the container.

Now, how do you attach a ServiceAccount to a Pod? The fastest way is using kubectl set:

```bash
kubectl run testpod --image=nginx --dry-run=client -o yaml > pod.yaml
kubectl apply -f pod.yaml
kubectl set serviceaccount pod testpod myapp
```

**[Execute commands]**

The set serviceaccount command works on Pods, Deployments, StatefulSets, and DaemonSets. Let's verify:

```bash
kubectl get pod testpod -o jsonpath='{.spec.serviceAccountName}'
```

**[Execute command, show "myapp"]**

For Deployments, you can set it at creation or update it:

```bash
kubectl create deployment webapp --image=nginx --replicas=2
kubectl set serviceaccount deployment webapp webapp
```

**[Execute commands]**

This is much faster than editing YAML during the exam. Speaking of which, let's talk about a critical security feature - disabling ServiceAccount token mounting.

---

## Disabling Token Mounting for Security (2:30)

**[Time: 6:30 total]**

Most applications don't need access to the Kubernetes API. Mounting the ServiceAccount token creates an unnecessary security risk. If an attacker compromises your container, they could potentially use that token.

You can disable token mounting at two levels. First, at the Pod level:

```bash
kubectl run secure-app --image=nginx --dry-run=client -o yaml | \
  sed '/^spec:/a\  automountServiceAccountToken: false' | \
  kubectl apply -f -
```

**[Execute command]**

Let's verify the token isn't mounted:

```bash
kubectl exec secure-app -- ls /var/run/secrets/kubernetes.io/serviceaccount/ 2>&1 || echo "No token directory - as expected"
```

**[Execute command]**

Better yet, disable it at the ServiceAccount level so all Pods using that ServiceAccount inherit this security posture:

```bash
kubectl create sa secure-sa --dry-run=client -o yaml | \
  sed '/^metadata:/a\automountServiceAccountToken: false' | \
  kubectl apply -f -
```

**[Execute command]**

This is a best practice question that might appear on the exam: "Make this Pod more secure by preventing API access." The answer is setting automountServiceAccountToken to false.

Let's move on to complex RBAC rules.

---

## Complex RBAC Rules (4:00)

**[Time: 10:30 total]**

In real-world scenarios and exam questions, you'll often need Roles with multiple resources and permissions. Let me show you the patterns.

First, let's create a Role that grants permissions to multiple resource types:

```bash
kubectl create role app-manager \
  --verb=get,list,watch \
  --resource=pods,services,configmaps \
  --dry-run=client -o yaml
```

**[Execute command, show YAML output]**

Notice it creates separate rules for each resource type. But what about resources in different API groups? Let's say we need access to Pods and Deployments:

```bash
kubectl create role multi-api-manager \
  --verb=get,list \
  --resource=pods \
  --dry-run=client -o yaml > role.yaml

cat >> role.yaml <<EOF
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "update", "patch"]
EOF

kubectl apply -f role.yaml
```

**[Execute commands]**

The key here is remembering which resources belong to which API groups. Let me show you how to check:

```bash
kubectl api-resources | grep -E "^NAME|^pods|^deployments|^jobs|^ingress"
```

**[Execute command, highlight APIVERSION column]**

This shows you the API group for each resource. Core resources like Pods, Services, ConfigMaps, and Secrets use an empty API group - just empty quotes in your Role. Deployments, StatefulSets, and DaemonSets use "apps". Jobs and CronJobs use "batch". Ingresses use "networking.k8s.io".

For the exam, memorize these common ones. Let's talk about subresources next.

Some resources have subresources that need explicit permissions. The most common example is Pod logs:

```bash
kubectl create role pod-logger --verb=get,list --resource=pods --dry-run=client -o yaml | \
  sed '/resources:/a\- apiGroups: [""]\n  resources: ["pods/log"]\n  verbs: ["get"]' | \
  kubectl apply -f -
```

**[Execute command]**

This Role allows viewing Pods and their logs. Without the pods/log permission, you could see the Pod exists but couldn't read its logs. Other important subresources include pods/exec for kubectl exec access, and deployments/scale for scaling operations.

Now let's discuss resourceNames - a powerful but tricky feature.

---

## Resource-Specific Permissions (2:30)

**[Time: 13:00 total]**

Sometimes you need to grant access to specific named resources, not all resources of a type. This is done with resourceNames:

```bash
kubectl create secret generic db-password --from-literal=password=secret123
kubectl create secret generic api-key --from-literal=key=abc123

cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: specific-secrets-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["db-password", "api-key"]
  verbs: ["get"]
EOF
```

**[Execute commands]**

This Role only allows getting those two specific Secrets. Let's bind it and test:

```bash
kubectl create sa secret-reader
kubectl create rolebinding secret-reader-binding \
  --role=specific-secrets-reader \
  --serviceaccount=default:secret-reader

kubectl auth can-i get secret/db-password --as=system:serviceaccount:default:secret-reader
kubectl auth can-i get secret/other-secret --as=system:serviceaccount:default:secret-reader
```

**[Execute commands, show yes and no]**

This is powerful for limiting access. However, there's a critical limitation you must know for the exam: resourceNames works with get, delete, update, and patch, but NOT with list or watch. If you try to use resourceNames with list, the permission won't work.

This catches many people by surprise on the exam. Remember: specific resources can be accessed individually, but you can't list "just these resources."

---

## Built-in ClusterRoles (3:00)

**[Time: 16:00 total]**

Kubernetes provides built-in ClusterRoles that cover common permission sets. Using these is often faster than creating custom Roles. Let's explore them:

```bash
kubectl get clusterroles | grep -E "^view|^edit|^admin|^cluster-admin"
```

**[Execute command]**

These four roles form a hierarchy of increasing permissions. Let's examine what "view" provides:

```bash
kubectl describe clusterrole view | head -40
```

**[Execute command, scroll through permissions]**

The "view" role gives read-only access to most resources, but notice it excludes Secrets and some ConfigMaps for security reasons. You can see Pods, Services, Deployments, but you can't see Secrets.

The "edit" role adds modification capabilities:

```bash
kubectl describe clusterrole edit | grep -A 5 "PolicyRule"
```

**[Execute command]**

With "edit", you can create, update, and delete Pods, Services, Deployments, and other application resources, but you still can't modify RBAC resources themselves. This prevents users from escalating their own permissions.

The "admin" role gives full access within a namespace, including RBAC management:

```bash
kubectl describe clusterrole admin | grep -E "Role|Binding"
```

**[Execute command]**

And "cluster-admin" is the superuser role with unrestricted access to everything.

For the exam, here's a key pattern: use built-in ClusterRoles with RoleBindings to grant standard permissions in specific namespaces. Let's see this in action:

```bash
kubectl create namespace dev
kubectl create sa developer -n dev

kubectl create rolebinding dev-editor \
  --clusterrole=edit \
  --serviceaccount=dev:developer \
  --namespace=dev
```

**[Execute commands]**

This grants the "developer" ServiceAccount full edit permissions, but only in the "dev" namespace. The ClusterRole defines the permissions, but the RoleBinding restricts where they apply. This is a common exam pattern.

---

## Cross-Namespace Access (3:30)

**[Time: 19:30 total]**

Applications often need to access resources in other namespaces. This is a common exam scenario: "ServiceAccount in namespace A needs to read ConfigMaps in namespace B."

Let's set up this scenario:

```bash
kubectl create namespace app
kubectl create namespace shared

kubectl create sa backend -n app
kubectl create configmap shared-config --from-literal=setting=value -n shared
```

**[Execute commands]**

Now, to grant the "backend" ServiceAccount in "app" namespace access to ConfigMaps in "shared" namespace, we create a Role in the "shared" namespace:

```bash
kubectl create role config-reader \
  --verb=get,list \
  --resource=configmaps \
  --namespace=shared
```

**[Execute command]**

And here's the key - we create a RoleBinding in the "shared" namespace, but reference the ServiceAccount from the "app" namespace:

```bash
kubectl create rolebinding backend-config-reader \
  --role=config-reader \
  --serviceaccount=app:backend \
  --namespace=shared
```

**[Execute command]**

Notice the serviceaccount format: namespace colon name. The RoleBinding is in "shared" namespace, the Role is in "shared" namespace, but the ServiceAccount is in "app" namespace. Let's verify:

```bash
kubectl auth can-i get configmaps -n shared --as=system:serviceaccount:app:backend
kubectl auth can-i get configmaps -n app --as=system:serviceaccount:app:backend
```

**[Execute commands, show yes for shared, no for app]**

Perfect! The ServiceAccount can access ConfigMaps in "shared" but not in its own namespace. This demonstrates precise control over cross-namespace access.

For the exam, remember: the Role and RoleBinding must be in the namespace containing the resources you want to access, but the subject can be from any namespace.

---

## Troubleshooting RBAC Issues (4:00)

**[Time: 23:30 total]**

Troubleshooting RBAC is a critical exam skill. Let's walk through common scenarios and diagnostic techniques.

Scenario one: Your Pod is getting 403 Forbidden errors. Here's your troubleshooting workflow:

**[Create a problem scenario]**

```bash
kubectl run problem-app --image=nginx
# Assume this app needs to list Pods but is failing
```

**[Execute command]**

First, identify which ServiceAccount the Pod is using:

```bash
kubectl get pod problem-app -o jsonpath='{.spec.serviceAccountName}'
```

**[Execute command]**

If it returns nothing or "default", that's likely the issue. The default ServiceAccount has no permissions. Let's check:

```bash
kubectl auth can-i list pods --as=system:serviceaccount:default:default
```

**[Execute command, show no]**

Confirmed. Now we need to either create a new ServiceAccount with permissions, or grant permissions to the default ServiceAccount. Best practice is a new ServiceAccount:

```bash
kubectl create sa problem-app
kubectl create role pod-reader --verb=get,list --resource=pods
kubectl create rolebinding problem-app-reader \
  --role=pod-reader \
  --serviceaccount=default:problem-app
kubectl set serviceaccount pod problem-app problem-app
```

**[Execute commands]**

Let's verify the fix:

```bash
kubectl auth can-i list pods --as=system:serviceaccount:default:problem-app
```

**[Execute command, show yes]**

Perfect. Scenario two: Permissions work in one namespace but not another.

```bash
kubectl create namespace prod
kubectl run app --image=nginx -n prod

kubectl auth can-i get pods --as=system:serviceaccount:default:problem-app -n default
kubectl auth can-i get pods --as=system:serviceaccount:default:problem-app -n prod
```

**[Execute commands, show yes and no]**

The ServiceAccount has permissions in "default" but not "prod". Two solutions: create Role and RoleBinding in the "prod" namespace, or use ClusterRole and ClusterRoleBinding for cluster-wide access:

```bash
kubectl create clusterrole pod-reader-cluster --verb=get,list --resource=pods
kubectl create clusterrolebinding problem-app-cluster \
  --clusterrole=pod-reader-cluster \
  --serviceaccount=default:problem-app
```

**[Execute commands]**

Now let's verify cluster-wide access:

```bash
kubectl auth can-i get pods --as=system:serviceaccount:default:problem-app -n prod
kubectl auth can-i get pods --as=system:serviceaccount:default:problem-app -n kube-system
```

**[Execute commands, show yes for both]**

Excellent. One more troubleshooting tip: if permissions seem correct but still don't work, check the API group. This is a common mistake:

```bash
kubectl create role deployment-viewer --verb=get,list --resource=deployments

kubectl get role deployment-viewer -o yaml
```

**[Execute commands, show apiGroups: [apps]]**

Notice kubectl correctly used "apps" as the API group. But if you were writing YAML and used an empty apiGroups, it wouldn't work. Always verify API groups with kubectl api-resources.

---

## Exam Speed Techniques (3:00)

**[Time: 26:30 total]**

Time management is crucial for the CKAD exam. Let me share speed techniques for RBAC questions.

First, always use imperative commands when possible. Here's a complete RBAC setup in one command chain:

```bash
kubectl create sa fast-app && \
kubectl create role fast-role --verb=get,list --resource=pods,services && \
kubectl create rolebinding fast-binding --role=fast-role --serviceaccount=default:fast-app && \
kubectl auth can-i get pods --as=system:serviceaccount:default:fast-app
```

**[Execute command chain]**

That's ServiceAccount creation, Role creation, RoleBinding creation, and verification - all in one copy-paste. Learn to chain commands with && for sequential execution.

Second, master the kubectl auth can-i command format. This is your verification tool:

```bash
# Basic format
kubectl auth can-i VERB RESOURCE

# As ServiceAccount format - memorize this!
kubectl auth can-i VERB RESOURCE --as=system:serviceaccount:NAMESPACE:NAME

# In specific namespace
kubectl auth can-i VERB RESOURCE --as=system:serviceaccount:NAMESPACE:NAME -n NAMESPACE
```

Third, use dry-run and kubectl set for faster Pod updates:

```bash
# Create deployment with ServiceAccount in one step
kubectl create deployment exam-app --image=nginx --replicas=1 --dry-run=client -o yaml | \
  sed '/^spec:/a\  serviceAccountName: myapp' | \
  kubectl apply -f -
```

**[Execute command]**

Fourth, remember the shorthand commands:
- "sa" instead of "serviceaccount"
- "cm" instead of "configmap"
- "deploy" instead of "deployment"

Finally, for exam questions about security hardening, remember these key points:
- Disable automountServiceAccountToken for Pods that don't need API access
- Use resourceNames to restrict access to specific Secrets or ConfigMaps
- Grant the minimum necessary verbs - if you only need to read, don't grant delete
- Use namespace-scoped Roles instead of ClusterRoles when possible

---

## Common Exam Scenarios (2:30)

**[Time: 29:00 total]**

Let me walk you through typical exam question patterns and how to approach them quickly.

**Question pattern one**: "Create a ServiceAccount and configure the deployment to use it."

Your response:
```bash
kubectl create sa api-access
kubectl set serviceaccount deployment backend api-access
kubectl get deployment backend -o jsonpath='{.spec.template.spec.serviceAccountName}'
```

**[Execute commands as a walkthrough]**

**Question pattern two**: "Grant the ServiceAccount permissions to read ConfigMaps."

Your response:
```bash
kubectl create role cm-reader --verb=get,list --resource=configmaps
kubectl create rolebinding sa-cm-reader --role=cm-reader --serviceaccount=default:api-access
kubectl auth can-i get cm --as=system:serviceaccount:default:api-access
```

**[Execute commands]**

**Question pattern three**: "Fix the permission issue preventing this Pod from accessing Secrets."

Your troubleshooting steps:
```bash
# 1. Identify ServiceAccount
kubectl get pod PODNAME -o jsonpath='{.spec.serviceAccountName}'

# 2. Check permissions
kubectl auth can-i get secrets --as=system:serviceaccount:NAMESPACE:SANAME

# 3. Create Role
kubectl create role secret-reader --verb=get,list --resource=secrets

# 4. Create RoleBinding
kubectl create rolebinding pod-secret-reader --role=secret-reader --serviceaccount=NAMESPACE:SANAME

# 5. Verify fix
kubectl auth can-i get secrets --as=system:serviceaccount:NAMESPACE:SANAME
```

**Question pattern four**: "Grant cluster-wide read access to Pods."

Your response:
```bash
kubectl create clusterrole cluster-pod-reader --verb=get,list,watch --resource=pods
kubectl create clusterrolebinding monitor-pods --clusterrole=cluster-pod-reader --serviceaccount=monitoring:monitor
kubectl auth can-i list pods --as=system:serviceaccount:monitoring:monitor -n kube-system
```

These patterns cover about 80% of RBAC exam questions. Practice until you can execute each pattern in under 30 seconds.

---

## Summary and Final Tips (1:00)

**[Time: 30:00 total]**

Let's summarize the key takeaways for CKAD RBAC success.

Master imperative commands for ServiceAccounts, Roles, and RoleBindings. They're faster than writing YAML and less error-prone under exam pressure.

Memorize common API groups: empty string for core resources, "apps" for Deployments, "batch" for Jobs, "networking.k8s.io" for Ingresses.

Always verify your work with kubectl auth can-i before moving to the next question. This catches mistakes early.

Remember the ServiceAccount format in commands: system:serviceaccount:namespace:name.

Understand the difference between namespace-scoped and cluster-scoped resources. Know when to use Role versus ClusterRole, RoleBinding versus ClusterRoleBinding.

Practice cross-namespace access scenarios - they're common on the exam.

And finally, for any security question, consider: disable token mounting, use resourceNames for specific resources, grant minimum necessary verbs, and prefer namespace-scoped roles.

With these skills and patterns, you're well-prepared for RBAC questions on the CKAD exam.

---

## Cleanup (0:30)

**[Time: 30:30 total]**

Let's clean up our exam practice environment:

```bash
kubectl delete sa --all
kubectl delete role --all
kubectl delete rolebinding --all
kubectl delete clusterrole pod-reader-cluster
kubectl delete clusterrolebinding problem-app-cluster monitor-pods
kubectl delete namespace dev app shared prod
kubectl delete pod --all
kubectl delete deployment --all
kubectl delete secret db-password api-key
```

**[Execute commands]**

You're now ready to tackle RBAC questions on the CKAD exam. Practice these patterns until they become automatic, and you'll have the speed and accuracy needed for exam success.

Good luck!

---

**End of CKAD Preparation Session: 25-30 minutes**

## Notes for Presenter

### Prerequisites
- Clean Kubernetes cluster for demonstrations
- kubectl configured and working
- Terminal with history enabled for showing command patterns
- Familiarity with CKAD exam format and timing

### Pacing Strategy
- **Faster track (25 min)**: Execute commands without showing all output, assume viewer familiarity with basic concepts
- **Standard track (27-28 min)**: Follow script as written with brief output review
- **Detailed track (30 min)**: Add extra explanation of YAML output, show more verification steps

### Critical Exam Tips to Emphasize

1. **ServiceAccount Format**: `system:serviceaccount:NAMESPACE:NAME`
   - This exact format is required for `--as` flag
   - Namespace is mandatory even if it's "default"

2. **Common API Groups** (write on screen/whiteboard):
   - Core (Pod, Service, ConfigMap, Secret): `""`
   - apps (Deployment, StatefulSet, DaemonSet): `"apps"`
   - batch (Job, CronJob): `"batch"`
   - networking.k8s.io (Ingress, NetworkPolicy): `"networking.k8s.io"`

3. **Speed Commands** (create reference sheet):
   ```bash
   # Complete RBAC setup
   kubectl create sa NAME && \
   kubectl create role NAME --verb=VERBS --resource=RESOURCES && \
   kubectl create rolebinding NAME --role=ROLE --serviceaccount=NS:SA && \
   kubectl auth can-i VERB RESOURCE --as=system:serviceaccount:NS:SA
   ```

4. **Troubleshooting Checklist**:
   - Check ServiceAccount exists
   - Verify Pod uses correct ServiceAccount
   - Confirm Role has correct API group
   - Ensure RoleBinding references correct Role
   - Test with kubectl auth can-i

### Common Student Questions

**Q: "When do I use ClusterRole vs Role?"**
A: Use Role for namespace-specific permissions (most common). Use ClusterRole for cluster-wide permissions or when you want to define permission templates to apply to multiple namespaces.

**Q: "Can I list specific resources using resourceNames?"**
A: No! resourceNames works with get, delete, update, patch - NOT with list or watch. This is a frequent exam trap.

**Q: "How do I know which API group a resource uses?"**
A: Run `kubectl api-resources | grep RESOURCE_NAME` or check the apiVersion in existing resource YAML.

**Q: "Should I disable automountServiceAccountToken in the exam?"**
A: Only if the question specifically asks about security hardening or if the Pod clearly doesn't need API access. Don't add it unless requested.

**Q: "What if I create the RoleBinding before the Role?"**
A: It won't work immediately, but if you create the Role afterward, the binding will start working. Always create in order: ServiceAccount → Role → RoleBinding.

### Terminal Setup

Before recording/presenting:
```bash
# Clean slate
kubectl delete all --all
kubectl delete sa --all --field-selector metadata.name!=default
kubectl delete role --all
kubectl delete rolebinding --all
kubectl delete clusterrole pod-reader-cluster 2>/dev/null
kubectl delete clusterrolebinding problem-app-cluster monitor-pods 2>/dev/null

# Set up common test resources
kubectl create namespace demo
kubectl run test-pod --image=nginx
```

### Demonstration Environment

**Terminal configuration**:
- Font size: 16pt minimum for visibility
- History enabled: `set -o history`
- PS1 with namespace indicator (helpful for multi-namespace demos)
- Command output clearly visible

**Screen layout**:
- Main terminal: 70% of screen
- Reference/notes: 30% of screen
- Or split terminal: commands top, output bottom

### Timing Checkpoints

Monitor these time markers:
- **4:00** - ServiceAccount section complete
- **10:30** - Complex RBAC rules complete
- **16:00** - Built-in ClusterRoles complete
- **19:30** - Cross-namespace access complete
- **23:30** - Troubleshooting complete
- **26:30** - Speed techniques complete
- **29:00** - Exam scenarios complete

If behind schedule after 16:00 mark, speed up demonstrations by executing without showing all output.

### Post-Session Resources

Provide to students:
1. Command reference sheet (all kubectl RBAC commands)
2. API groups quick reference
3. Troubleshooting flowchart
4. Practice scenarios with solutions
5. Links to Kubernetes RBAC documentation

### Follow-Up Practice Suggestions

Recommend to students:
- Set up 5-10 RBAC scenarios and time yourself solving them
- Target: < 2 minutes per scenario
- Practice typing the `system:serviceaccount:NS:NAME` format
- Create muscle memory for imperative commands
- Practice troubleshooting backward from "kubectl auth can-i" results

### Exam Day Reminders

Final tips to share:
- Bookmark Kubernetes RBAC docs page before exam starts
- Write down API groups on scratch paper/whiteboard
- Always verify with `kubectl auth can-i` before moving on
- If stuck, create using imperative commands and verify, rather than debugging YAML
- Remember: ServiceAccount subject format includes namespace even for default
