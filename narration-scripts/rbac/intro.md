# RBAC Concepts - Narration Script (Slideshow)
**Duration: 10-12 minutes**
**Format: Concept presentation with slides**

---

## Slide 1: Introduction to RBAC (1:00)

Welcome to our session on Kubernetes Role-Based Access Control, or RBAC. In this presentation, we'll explore how Kubernetes implements fine-grained security to control who can do what within your cluster.

RBAC is a critical topic for the CKAD exam, representing a significant portion of the "Application Environment, Configuration and Security" domain. But more importantly, it's essential knowledge for running secure production workloads.

Let's begin by understanding what RBAC is and why it matters.

---

## Slide 2: What is RBAC? (1:30)

Kubernetes RBAC is a security framework that controls access to cluster resources. It answers two fundamental questions:

First: "Who are you?" - This is authentication, handled by ServiceAccounts for applications or external identity providers for users.

Second: "What can you do?" - This is authorization, controlled by RBAC rules.

By default, Kubernetes follows the principle of least privilege - all users and applications start with no permissions. You must explicitly grant access to resources. This "deny by default" approach is a security best practice that prevents accidental exposure of sensitive cluster operations.

---

## Slide 3: The Two Parts of RBAC (1:30)

RBAC in Kubernetes has an elegant two-part design that separates what permissions exist from who has those permissions.

The first part is the Role - this defines what actions can be performed on which resources. Think of it as a job description that lists specific capabilities, like "can read Pods" or "can create Deployments."

The second part is the RoleBinding - this connects a Role to a subject, which could be a user, a group, or a ServiceAccount. Think of this as the assignment that says "this person gets this job."

This separation is powerful because you can define a Role once and apply it to multiple subjects, or assign multiple roles to the same subject. This makes RBAC manageable even in large, complex clusters.

---

## Slide 4: Roles - Defining Permissions (1:30)

Let's dive deeper into Roles. A Role contains one or more rules that define permissions for specific resources within a namespace.

Each rule has three key components:

The API Group - this identifies which Kubernetes API the resource belongs to. Core resources like Pods use an empty string, while Deployments use "apps," and Jobs use "batch."

The Resources - these are the Kubernetes object types, like pods, services, or configmaps.

And the Verbs - these are the actions allowed on those resources. Common verbs include get, list, watch for reading; create for new objects; update and patch for modifications; and delete for removal.

For example, a Role might grant permissions to "get" and "list" Pods, which would allow viewing Pod information but not modifying or deleting them.

---

## Slide 5: Role Example (1:00)

Here's a concrete example. This Role is named "pod-viewer" and it grants permission to get and list Pods in the default namespace.

Notice the apiGroups is set to an empty string - this is because Pods are core resources in the v1 API.

The resources array lists "pods," and the verbs array includes "get" and "list," which correspond to kubectl commands like "kubectl get pods" and "kubectl describe pod."

This Role is namespace-scoped, meaning it only applies to Pods within the namespace specified in the metadata - in this case, "default."

---

## Slide 6: RoleBindings - Granting Permissions (1:30)

Once you have a Role defined, you need a RoleBinding to apply those permissions to a subject.

The roleRef section references the Role we want to apply - it specifies the kind as "Role" and the name matches our Role definition.

The subjects section lists who receives these permissions. In this example, we're granting the permissions to a user with the email "student@courselabs.co."

Subjects can be Users, which represent human users authenticated through external systems; Groups, which represent collections of users; or ServiceAccounts, which represent application identities within Kubernetes.

The key point is that both the Role and RoleBinding must be in the same namespace for namespace-scoped permissions.

---

## Slide 7: ServiceAccounts - Identity for Applications (1:30)

ServiceAccounts are particularly important for the CKAD exam because they provide identity for Pods that need to interact with the Kubernetes API.

When you create a ServiceAccount, Kubernetes automatically generates an authentication token. This token is mounted into any Pod that uses that ServiceAccount, typically at the path /var/run/secrets/kubernetes.io/serviceaccount/token.

Your application can use this token to authenticate API requests to the Kubernetes API server. This is how applications can query cluster state, watch for changes, or even create and modify resources.

Best practice: create a dedicated ServiceAccount for each application with only the permissions that application needs. Never share ServiceAccounts between different applications, and avoid using the default ServiceAccount for applications that access the API.

---

## Slide 8: ClusterRoles and ClusterRoleBindings (1:30)

So far, we've discussed Roles and RoleBindings, which are namespace-scoped. But what if you need permissions that span multiple namespaces, or access to cluster-wide resources like Nodes?

That's where ClusterRoles and ClusterRoleBindings come in. They work exactly like their namespace-scoped counterparts, but apply across the entire cluster.

A ClusterRole defines permissions without a namespace restriction. A ClusterRoleBinding grants those permissions cluster-wide.

Interestingly, you can also use a ClusterRole with a regular RoleBinding to apply cluster-defined permissions to a specific namespace. This pattern lets you define standard permission sets once as ClusterRoles, then apply them selectively to different namespaces.

This is exactly how Kubernetes' built-in roles like "view," "edit," and "admin" work.

---

## Slide 9: Built-in ClusterRoles (1:00)

Kubernetes provides several built-in ClusterRoles that cover common use cases.

The "view" role provides read-only access to most resources, but excludes Secrets and ConfigMaps for security reasons.

The "edit" role allows creating and modifying most resources, including Pods and Services, but doesn't grant access to RBAC resources themselves.

The "admin" role provides full access within a namespace, including RBAC management, but can't modify the namespace itself or resource quotas.

Finally, "cluster-admin" is the superuser role with unrestricted access to everything in the cluster.

For the CKAD exam, you should know when to use these built-in roles versus creating custom ones.

---

## Slide 10: RBAC in Action - Common Patterns (1:30)

Let me share the most common RBAC patterns you'll encounter in real-world Kubernetes and on the CKAD exam.

Pattern one: Application accessing ConfigMaps and Secrets. Create a ServiceAccount, grant it a Role with get and list permissions on configmaps and secrets, bind it with a RoleBinding, and configure your Pod to use that ServiceAccount.

Pattern two: Monitoring system reading Pod metrics. Use a ClusterRole with get, list, and watch permissions on pods, and a ClusterRoleBinding to grant cluster-wide access.

Pattern three: CI/CD pipeline deploying applications. Create a Role with full permissions on deployments, services, and configmaps in a specific namespace. Bind it to a ServiceAccount that your pipeline uses.

Pattern four: Disabling API access for security. For Pods that don't need API access, set automountServiceAccountToken to false to reduce your attack surface.

---

## Slide 11: Troubleshooting RBAC (1:00)

RBAC issues are common, and you need to know how to diagnose them quickly, especially during the exam.

The most important tool is "kubectl auth can-i" - this tests whether a user or ServiceAccount has permission to perform a specific action. You can test as yourself, or impersonate other subjects using the "--as" flag.

Common issues include: missing Roles or RoleBindings, incorrect API groups in Role rules, RoleBindings referencing non-existent Roles, or subjects in the wrong namespace.

Always check that your Role and RoleBinding are in the correct namespace, that the roleRef matches your Role name, and that your ServiceAccount exists before creating the binding.

---

## Slide 12: Security Best Practices (1:00)

Before we conclude, let's review security best practices for RBAC.

Always follow the principle of least privilege - grant only the minimum permissions required for each application or user to function.

Create dedicated ServiceAccounts for each application - never share ServiceAccounts between different apps or use the default ServiceAccount for applications that access the API.

Disable token mounting for Pods that don't need API access using automountServiceAccountToken: false.

Use namespaces to isolate environments like development, staging, and production, with different RBAC rules for each.

Regularly audit your RBAC configuration to identify overly permissive roles, especially ClusterRoleBindings which grant cluster-wide access.

And finally, use resourceNames in Roles when you need to restrict access to specific named resources, like a particular Secret.

---

## Slide 13: Summary and Next Steps (0:30)

To summarize: RBAC provides fine-grained access control in Kubernetes through Roles that define permissions and RoleBindings that grant those permissions to subjects.

ServiceAccounts provide identity for applications, while ClusterRoles and ClusterRoleBindings extend permissions across namespaces.

For CKAD exam success, practice creating ServiceAccounts, Roles, and RoleBindings using imperative commands for speed, and always verify permissions with "kubectl auth can-i."

Now let's move to our hands-on exercises where you'll apply these concepts in real scenarios.

Thank you for your attention.

---

**End of Presentation: 10-12 minutes**

## Notes for Presenter

**Pacing**: Each slide has an approximate time allocation. Adjust based on audience questions.

**Visuals**:
- Slide 5: Show YAML with syntax highlighting
- Slide 6: Diagram showing Role → RoleBinding → ServiceAccount flow
- Slide 10: Flowchart of common patterns
- Slide 11: Terminal screenshot of kubectl auth can-i commands

**Engagement**:
- Pause after Slide 8 for questions
- Ask audience if they've encountered RBAC issues in their work
- Encourage note-taking on the command reference in Slide 11

**Transitions**: Use clear verbal transitions between concept groups:
- After Slide 6: "Now that we understand Roles and RoleBindings, let's talk about identity..."
- After Slide 8: "With both namespace and cluster-scoped RBAC covered, let's look at practical patterns..."
