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

**[Execute command]**

That's it - one command. You can use the shorthand "sa" instead of "serviceaccount":

**[Execute command]**

For listing ServiceAccounts:

**[Execute command, show output including default SA]**

Every namespace has a "default" ServiceAccount that's used by Pods if you don't specify a different one. Let's look at the details:

**[Execute command, highlight tokens section]**

Notice Kubernetes automatically creates a token for this ServiceAccount. When a Pod uses this ServiceAccount, this token is mounted into the container.

Now, how do you attach a ServiceAccount to a Pod? The fastest way is using kubectl set:

**[Execute commands]**

The set serviceaccount command works on Pods, Deployments, StatefulSets, and DaemonSets. Let's verify:

**[Execute command, show "myapp"]**

For Deployments, you can set it at creation or update it:

**[Execute commands]**

This is much faster than editing YAML during the exam. Speaking of which, let's talk about a critical security feature - disabling ServiceAccount token mounting.

---

## Disabling Token Mounting for Security (2:30)

**[Time: 6:30 total]**

Most applications don't need access to the Kubernetes API. Mounting the ServiceAccount token creates an unnecessary security risk. If an attacker compromises your container, they could potentially use that token.

You can disable token mounting at two levels. First, at the Pod level:

**[Execute command]**

Let's verify the token isn't mounted:

**[Execute command]**

Better yet, disable it at the ServiceAccount level so all Pods using that ServiceAccount inherit this security posture:

**[Execute command]**

This is a best practice question that might appear on the exam: "Make this Pod more secure by preventing API access." The answer is setting automountServiceAccountToken to false.

Let's move on to complex RBAC rules.

---

## Complex RBAC Rules (4:00)

**[Time: 10:30 total]**

In real-world scenarios and exam questions, you'll often need Roles with multiple resources and permissions. Let me show you the patterns.

First, let's create a Role that grants permissions to multiple resource types:

**[Execute command, show YAML output]**

Notice it creates separate rules for each resource type. But what about resources in different API groups? Let's say we need access to Pods and Deployments:

**[Execute commands]**

The key here is remembering which resources belong to which API groups. Let me show you how to check:

**[Execute command, highlight APIVERSION column]**

This shows you the API group for each resource. Core resources like Pods, Services, ConfigMaps, and Secrets use an empty API group - just empty quotes in your Role. Deployments, StatefulSets, and DaemonSets use "apps". Jobs and CronJobs use "batch". Ingresses use "networking.k8s.io".

For the exam, memorize these common ones. Let's talk about subresources next.

Some resources have subresources that need explicit permissions. The most common example is Pod logs:

**[Execute command]**

This Role allows viewing Pods and their logs. Without the pods/log permission, you could see the Pod exists but couldn't read its logs. Other important subresources include pods/exec for kubectl exec access, and deployments/scale for scaling operations.

Now let's discuss resourceNames - a powerful but tricky feature.

---

## Resource-Specific Permissions (2:30)

**[Time: 13:00 total]**

Sometimes you need to grant access to specific named resources, not all resources of a type. This is done with resourceNames:

**[Execute commands]**

This Role only allows getting those two specific Secrets. Let's bind it and test:

**[Execute commands, show yes and no]**

This is powerful for limiting access. However, there's a critical limitation you must know for the exam: resourceNames works with get, delete, update, and patch, but NOT with list or watch. If you try to use resourceNames with list, the permission won't work.

This catches many people by surprise on the exam. Remember: specific resources can be accessed individually, but you can't list "just these resources."

---

## Built-in ClusterRoles (3:00)

**[Time: 16:00 total]**

Kubernetes provides built-in ClusterRoles that cover common permission sets. Using these is often faster than creating custom Roles. Let's explore them:

**[Execute command]**

These four roles form a hierarchy of increasing permissions. Let's examine what "view" provides:

**[Execute command, scroll through permissions]**

The "view" role gives read-only access to most resources, but notice it excludes Secrets and some ConfigMaps for security reasons. You can see Pods, Services, Deployments, but you can't see Secrets.

The "edit" role adds modification capabilities:

**[Execute command]**

With "edit", you can create, update, and delete Pods, Services, Deployments, and other application resources, but you still can't modify RBAC resources themselves. This prevents users from escalating their own permissions.

The "admin" role gives full access within a namespace, including RBAC management:

**[Execute command]**

And "cluster-admin" is the superuser role with unrestricted access to everything.

For the exam, here's a key pattern: use built-in ClusterRoles with RoleBindings to grant standard permissions in specific namespaces. Let's see this in action:

**[Execute commands]**

This grants the "developer" ServiceAccount full edit permissions, but only in the "dev" namespace. The ClusterRole defines the permissions, but the RoleBinding restricts where they apply. This is a common exam pattern.

---

## Cross-Namespace Access (3:30)

**[Time: 19:30 total]**

Applications often need to access resources in other namespaces. This is a common exam scenario: "ServiceAccount in namespace A needs to read ConfigMaps in namespace B."

Let's set up this scenario:

**[Execute commands]**

Now, to grant the "backend" ServiceAccount in "app" namespace access to ConfigMaps in "shared" namespace, we create a Role in the "shared" namespace:

**[Execute command]**

And here's the key - we create a RoleBinding in the "shared" namespace, but reference the ServiceAccount from the "app" namespace:

**[Execute command]**

Notice the serviceaccount format: namespace colon name. The RoleBinding is in "shared" namespace, the Role is in "shared" namespace, but the ServiceAccount is in "app" namespace. Let's verify:

**[Execute commands, show yes for shared, no for app]**

Perfect! The ServiceAccount can access ConfigMaps in "shared" but not in its own namespace. This demonstrates precise control over cross-namespace access.

For the exam, remember: the Role and RoleBinding must be in the namespace containing the resources you want to access, but the subject can be from any namespace.

---

## Troubleshooting RBAC Issues (4:00)

**[Time: 23:30 total]**

Troubleshooting RBAC is a critical exam skill. Let's walk through common scenarios and diagnostic techniques.

Scenario one: Your Pod is getting 403 Forbidden errors. Here's your troubleshooting workflow:

**[Create a problem scenario]**

**[Execute command]**

First, identify which ServiceAccount the Pod is using:

**[Execute command]**

If it returns nothing or "default", that's likely the issue. The default ServiceAccount has no permissions. Let's check:

**[Execute command, show no]**

Confirmed. Now we need to either create a new ServiceAccount with permissions, or grant permissions to the default ServiceAccount. Best practice is a new ServiceAccount:

**[Execute commands]**

Let's verify the fix:

**[Execute command, show yes]**

Perfect. Scenario two: Permissions work in one namespace but not another.

**[Execute commands, show yes and no]**

The ServiceAccount has permissions in "default" but not "prod". Two solutions: create Role and RoleBinding in the "prod" namespace, or use ClusterRole and ClusterRoleBinding for cluster-wide access:

**[Execute commands]**

Now let's verify cluster-wide access:

**[Execute commands, show yes for both]**

Excellent. One more troubleshooting tip: if permissions seem correct but still don't work, check the API group. This is a common mistake:

**[Execute commands, show apiGroups: [apps]]**

Notice kubectl correctly used "apps" as the API group. But if you were writing YAML and used an empty apiGroups, it wouldn't work. Always verify API groups with kubectl api-resources.

---

## Exam Speed Techniques (3:00)

**[Time: 26:30 total]**

Time management is crucial for the CKAD exam. Let me share speed techniques for RBAC questions.

First, always use imperative commands when possible. Here's a complete RBAC setup in one command chain:

**[Execute command chain]**

That's ServiceAccount creation, Role creation, RoleBinding creation, and verification - all in one copy-paste. Learn to chain commands with && for sequential execution.

Second, master the kubectl auth can-i command format. This is your verification tool:

Third, use dry-run and kubectl set for faster Pod updates:

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

**[Execute commands as a walkthrough]**

**Question pattern two**: "Grant the ServiceAccount permissions to read ConfigMaps."

Your response:

**[Execute commands]**

**Question pattern three**: "Fix the permission issue preventing this Pod from accessing Secrets."

Your troubleshooting steps:

**Question pattern four**: "Grant cluster-wide read access to Pods."

Your response:

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

1. **ServiceAccount Format**: 
   - This exact format is required for  flag
   - Namespace is mandatory even if it's "default"

2. **Common API Groups** (write on screen/whiteboard):
   - Core (Pod, Service, ConfigMap, Secret): 
   - apps (Deployment, StatefulSet, DaemonSet): 
   - batch (Job, CronJob): 
   - networking.k8s.io (Ingress, NetworkPolicy): 

3. **Speed Commands** (create reference sheet):
   bash
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
``set -o historysystem:serviceaccount:NS:NAMEkubectl auth can-i` before moving on
- If stuck, create using imperative commands and verify, rather than debugging YAML
- Remember: ServiceAccount subject format includes namespace even for default
