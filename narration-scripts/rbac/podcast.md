# RBAC - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening: Security in Kubernetes (1 min)

Welcome to this deep dive on Kubernetes Role-Based Access Control, commonly known as RBAC. Today we'll explore one of the most critical aspects of Kubernetes security - controlling who can do what within your cluster.

RBAC is a significant topic for the CKAD exam, representing a key part of the "Application Environment, Configuration and Security" domain which accounts for 25% of the exam. But beyond passing the exam, RBAC is essential knowledge for running secure production workloads.

Every application running in Kubernetes has an identity, and that identity determines what it can access. By default, Kubernetes follows the principle of least privilege - everything starts with no permissions, and you must explicitly grant access. This "deny by default" approach is a security best practice that prevents accidental exposure of sensitive cluster operations.

We'll cover how RBAC works, how to grant permissions to applications, common troubleshooting scenarios, and exam strategies for handling RBAC questions quickly and accurately.

---

## Understanding RBAC Fundamentals (2 min)

RBAC in Kubernetes has an elegant two-part design that separates what permissions exist from who has those permissions.

The first part is the Role - this defines what actions can be performed on which resources. Think of it as a job description that lists specific capabilities, like "can read Pods" or "can create Deployments." A Role contains rules that specify API groups, resources, and verbs. The API group identifies which Kubernetes API the resource belongs to - core resources like Pods and Services use an empty string, while Deployments use the "apps" group, and Jobs use "batch." The resources are the Kubernetes object types you want to grant access to. And the verbs are the actions allowed - common verbs include get, list, and watch for reading data; create for new objects; update and patch for modifications; and delete for removal.

The second part is the RoleBinding - this connects a Role to a subject. The subject can be a user, a group, or a ServiceAccount. Think of the RoleBinding as the assignment that says "this identity gets these permissions."

This separation is powerful because you can define a Role once and apply it to multiple subjects, or assign multiple roles to the same subject. This makes RBAC manageable even in large, complex clusters.

For example, you might create a Role called "pod-viewer" that grants get and list permissions on Pods. Then you create a RoleBinding that assigns this Role to a ServiceAccount called "monitoring-app." Now that application can view Pods but cannot modify or delete them.

---

## ServiceAccounts: Identity for Applications (2 min)

ServiceAccounts are particularly important for the CKAD exam because they provide identity for applications running in Pods that need to interact with the Kubernetes API.

When you create a ServiceAccount, Kubernetes automatically generates an authentication token. This token is mounted into any Pod that uses that ServiceAccount, typically at the path /var/run/secrets/kubernetes.io/serviceaccount/token. The Pod can use this token to authenticate API requests to the Kubernetes API server.

By default, every Pod uses a ServiceAccount. If you don't specify one, the Pod uses the "default" ServiceAccount in its namespace. However, the default ServiceAccount has no special permissions - it can authenticate but is not authorized to do anything meaningful.

Best practice is to create a dedicated ServiceAccount for each application that needs API access. This follows the principle of least privilege and gives you fine-grained control over permissions. You attach a ServiceAccount to a Pod by setting the serviceAccountName field in the Pod spec.

For security, if your application doesn't need to access the Kubernetes API, you should disable the automatic token mounting by setting automountServiceAccountToken to false. This reduces your security exposure - if an attacker compromises your container, they won't find a token they could use to query or modify cluster resources.

---

## Namespace-Scoped and Cluster-Scoped RBAC (2 min)

RBAC comes in two scopes: namespace-scoped and cluster-scoped.

Roles and RoleBindings are namespace-scoped. They only grant permissions to resources within a specific namespace. When you create a Role, you specify which namespace it belongs to, and the permissions only apply to resources in that namespace. This is perfect for applications that only need access to resources in their own namespace.

For permissions that span multiple namespaces, or access to cluster-wide resources like Nodes, you use ClusterRoles and ClusterRoleBindings. These work exactly like their namespace-scoped counterparts, but apply across the entire cluster.

Interestingly, you can use a ClusterRole with a regular RoleBinding to apply cluster-defined permissions to a specific namespace. This pattern lets you define standard permission sets once as ClusterRoles, then apply them selectively to different namespaces. This is exactly how Kubernetes' built-in roles work.

Kubernetes provides several built-in ClusterRoles that cover common use cases. The "view" role provides read-only access to most resources but excludes Secrets for security reasons. The "edit" role allows creating and modifying most resources but doesn't grant access to RBAC resources themselves - this prevents users from escalating their own permissions. The "admin" role provides full access within a namespace, including RBAC management. And "cluster-admin" is the superuser role with unrestricted access to everything.

For the exam, using these built-in ClusterRoles with RoleBindings is often faster than creating custom Roles.

---

## Practical RBAC Patterns (3 min)

Let me walk you through common RBAC patterns you'll encounter in real-world Kubernetes and on the CKAD exam.

Pattern one: Application accessing ConfigMaps and Secrets. You create a ServiceAccount for your application, create a Role that grants get and list permissions on configmaps and secrets, create a RoleBinding that connects the Role to the ServiceAccount, and configure your Pod to use that ServiceAccount. This pattern appears frequently - applications often need to read configuration data from the API rather than having it injected as environment variables.

Pattern two: Monitoring system reading Pod metrics. You create a ClusterRole with get, list, and watch permissions on pods, and a ClusterRoleBinding to grant cluster-wide access. The watch permission is important here - it allows the monitoring system to receive real-time updates when Pods change, rather than repeatedly polling.

Pattern three: Cross-namespace access. Applications sometimes need to access resources in other namespaces. For example, a backend service in the "app" namespace needs to read ConfigMaps in the "shared" namespace. The key insight is that the Role and RoleBinding must be in the namespace containing the resources you want to access. So you create a Role in "shared" namespace, and a RoleBinding in "shared" namespace, but the subject of that binding is the ServiceAccount from "app" namespace. When specifying a ServiceAccount from another namespace, use the format "namespace colon name" in your RoleBinding.

Pattern four: Fine-grained access to specific resources. Sometimes you need to grant access to specific named resources, not all resources of a type. You use the resourceNames field in your Role. For example, granting access to read two specific Secrets but not others. However, there's a critical limitation - resourceNames works with get, delete, update, and patch, but not with list or watch. This catches many people by surprise on the exam.

---

## Complex RBAC Rules (2 min)

In real scenarios, you often need Roles with multiple resources and different permission levels. Understanding how to structure complex rules is important.

First, resources in different API groups require separate rules. If you need access to both Pods and Deployments, you create one rule with an empty API group for Pods, and another rule with "apps" API group for Deployments. For the exam, memorize the common API groups: core resources like Pods, Services, ConfigMaps, and Secrets use an empty string; Deployments, StatefulSets, and DaemonSets use "apps"; Jobs and CronJobs use "batch"; and Ingresses use "networking.k8s.io."

Second, some resources have subresources that need explicit permissions. The most common example is Pod logs. To allow viewing Pod logs, you need permissions on both "pods" and "pods/log" as a subresource. Without the pods/log permission, you could see the Pod exists but couldn't read its logs. Other important subresources include pods/exec for kubectl exec access, and deployments/scale for scaling operations.

Third, you can grant different permission levels in different scopes. For example, an application might have full management capabilities in the default namespace - get, list, watch, create, update, delete on Pods. But cluster-wide, using a ClusterRole, it only has read permissions - get, list, and watch. This demonstrates layered security - full control where needed, but read-only everywhere else.

---

## Troubleshooting RBAC Issues (3 min)

Troubleshooting RBAC is a critical exam skill. When you encounter permission errors, you need to diagnose and fix them quickly under time pressure.

The typical symptom is a 403 Forbidden error. Your application logs show it cannot access a resource, or kubectl commands fail with "forbidden: User cannot get resource." Your troubleshooting workflow has clear steps.

First, identify which ServiceAccount the Pod or application is using. Use kubectl describe pod and look for the serviceAccount field. If it's blank or shows "default," that's often the issue - the default ServiceAccount has no permissions.

Second, verify what permissions that ServiceAccount has using kubectl auth can-i. This command tests whether a subject has permission to perform a specific action. You can use the --as flag to impersonate a ServiceAccount. The format is "system:serviceaccount:namespace:name" - for example, "system:serviceaccount:default:my-app" tests the my-app ServiceAccount in the default namespace. This command returns yes or no, making it perfect for verification.

Third, check if the Role and RoleBinding exist and are configured correctly. Common mistakes include RoleBindings in the wrong namespace, the roleRef pointing to a non-existent Role, incorrect API groups in the Role rules - like using an empty string for Deployments when it should be "apps", and subjects in the RoleBinding not matching the actual ServiceAccount name.

Fourth, for cross-namespace access issues, remember that the Role and RoleBinding must be in the namespace containing the resources, not the namespace of the ServiceAccount.

Fifth, if permissions work in one namespace but not another, you need either separate Role and RoleBinding in each namespace, or ClusterRole and ClusterRoleBinding for cluster-wide access.

The kubectl auth can-i command is your best friend for troubleshooting. Always use it to verify permissions before and after making changes. Don't assume your RBAC configuration is correct - verify it.

---

## CKAD Exam Speed Techniques (3 min)

Time management is crucial for the CKAD exam. Let me share speed techniques specifically for RBAC questions.

First, always use imperative commands when possible. Creating a ServiceAccount imperatively is one command: kubectl create serviceaccount my-app. You can use the shorthand "sa" instead of "serviceaccount" to save typing. Creating a Role imperatively: kubectl create role pod-reader --verb=get,list,watch --resource=pods. Creating a RoleBinding: kubectl create rolebinding read-pods --role=pod-reader --serviceaccount=default:my-app. Notice the serviceaccount format includes the namespace even for default namespace.

Second, use kubectl set to attach ServiceAccounts to Deployments. Instead of editing YAML, use kubectl set serviceaccount deployment my-deployment my-app. This is much faster and works on Deployments, StatefulSets, and DaemonSets.

Third, chain commands with && for sequential execution. You can create a complete RBAC setup in one command: kubectl create sa my-app && kubectl create role pod-reader --verb=get --resource=pods && kubectl create rolebinding read-pods --role=pod-reader --serviceaccount=default:my-app && kubectl auth can-i get pods --as=system:serviceaccount:default:my-app. This creates everything and verifies it in one go.

Fourth, use the built-in ClusterRoles when they match your requirements. Instead of creating a custom Role for read-only access, use the built-in "view" ClusterRole with a RoleBinding. This is faster and less error-prone.

Fifth, for verification, always use kubectl auth can-i before moving to the next question. This catches mistakes early. If the command returns "no" when you expect "yes," you know immediately that something is wrong.

Finally, remember common patterns and the format of commands. The ServiceAccount format in auth can-i commands is system:serviceaccount:namespace:name. The serviceaccount format in rolebinding commands is namespace:name. These formats are easy to confuse under pressure, so practice them until they're automatic.

---

## Common Exam Scenarios (2 min)

Let me walk through typical exam question patterns and how to approach them quickly.

Scenario one: "Create a ServiceAccount and configure the deployment to use it." Your approach: kubectl create sa my-app, then kubectl set serviceaccount deployment my-deployment my-app. Two commands, done in ten seconds.

Scenario two: "Grant the ServiceAccount permissions to read ConfigMaps." Your approach: kubectl create role configmap-reader --verb=get,list --resource=configmaps, then kubectl create rolebinding read-config --role=configmap-reader --serviceaccount=default:my-app. Then verify with kubectl auth can-i get configmaps --as=system:serviceaccount:default:my-app.

Scenario three: "Fix the permission issue preventing this Pod from accessing Secrets." Your troubleshooting steps: describe the Pod to find which ServiceAccount it uses, use auth can-i to verify permissions, check if Role and RoleBinding exist, verify the API group is correct - Secrets use empty string, fix or create the missing RBAC resources, and verify again with auth can-i.

Scenario four: "Grant cluster-wide read access to Pods." Your approach: kubectl create clusterrole pod-reader --verb=get,list,watch --resource=pods, then kubectl create clusterrolebinding read-all-pods --clusterrole=pod-reader --serviceaccount=default:my-app.

Scenario five: "Make this Pod more secure by preventing API access." Your approach: kubectl patch deployment my-deployment -p '{"spec":{"template":{"spec":{"automountServiceAccountToken":false}}}}'. This disables token mounting, preventing the Pod from accessing the API.

These patterns cover the majority of RBAC exam questions. Practice until you can execute each pattern in under thirty seconds.

---

## Summary and Key Takeaways (1 min)

Let's summarize the critical concepts for RBAC success on the CKAD exam.

RBAC provides fine-grained access control through Roles that define permissions and RoleBindings that grant those permissions to subjects. ServiceAccounts provide identity for applications, allowing them to authenticate to the Kubernetes API.

Roles and RoleBindings are namespace-scoped, while ClusterRoles and ClusterRoleBindings apply cluster-wide. You can use a ClusterRole with a RoleBinding to apply standard permissions to specific namespaces.

Common API groups you must memorize: empty string for core resources, "apps" for Deployments, "batch" for Jobs, and "networking.k8s.io" for Ingresses.

For exam success: master imperative commands for speed, always verify permissions with kubectl auth can-i, remember the ServiceAccount format is namespace:name in rolebindings and system:serviceaccount:namespace:name in auth can-i commands, use built-in ClusterRoles when they match requirements, and disable automountServiceAccountToken for security when Pods don't need API access.

Troubleshoot systematically: identify the ServiceAccount, verify permissions with auth can-i, check that Role and RoleBinding exist and are correct, verify API groups match the resources, and always verify your fixes.

With these skills and patterns, you're well-prepared for RBAC questions on the CKAD exam. Remember - RBAC is about policy enforcement, not just authentication. Understanding who can do what is fundamental to Kubernetes security.

Thank you for listening. Good luck with your CKAD preparation!
