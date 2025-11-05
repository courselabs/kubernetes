# RBAC - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now practiced creating Roles and RoleBindings, working with ServiceAccounts, understanding ClusterRoles, and testing permissions with `kubectl auth can-i`.

Here's what you need to know for CKAD: RBAC appears in exam scenarios, particularly around ServiceAccounts for Pods. You'll create ServiceAccounts, bind permissions to them, and configure Pods to use them. The exam expects you to understand RBAC syntax and common patterns.

That's what we're going to focus on in this next section: exam-specific RBAC scenarios and rapid configuration techniques.

## What Makes CKAD Different

The CKAD exam tests practical RBAC usage for application permissions. You'll see requirements like "create a ServiceAccount for an application that needs to list Pods" or "troubleshoot why a Pod can't access the API server." You need to create ServiceAccounts and Roles quickly.

For RBAC specifically, the exam may test you on:

**Creating ServiceAccounts** - Using `kubectl create serviceaccount name` for quick creation. Understanding that ServiceAccounts are namespaced and provide identity for Pods to access the Kubernetes API.

**Creating Roles with specific permissions** - Using `kubectl create role` with `--verb` and `--resource` flags for simple scenarios, or writing YAML for complex permissions. Understanding the verbs: get, list, watch, create, update, patch, delete. Knowing resource names and apiGroups.

**Creating RoleBindings** - Using `kubectl create rolebinding` to connect Roles to ServiceAccounts. Understanding that RoleBindings specify role name and subject (serviceAccount, user, or group). Getting the syntax right: `subjects` is an array with `kind`, `name`, and `namespace`.

**Configuring Pods to use ServiceAccounts** - Adding `serviceAccountName` in the Pod spec. Understanding that if not specified, Pods use the `default` ServiceAccount which has minimal permissions.

**Testing permissions** - Using `kubectl auth can-i verb resource --as=system:serviceaccount:namespace:sa-name` to verify permissions before deploying Pods. This saves debugging time.

**Troubleshooting Forbidden errors** - When Pods or kubectl commands fail with "Forbidden," checking what ServiceAccount is in use, verifying the Role grants necessary permissions, and ensuring the RoleBinding connects them correctly.

## What's Coming

In the upcoming CKAD-focused video, we'll drill on exam scenarios. You'll practice creating ServiceAccounts and Roles in under 2 minutes. You'll bind them correctly. You'll configure Pods to use custom ServiceAccounts.

We'll cover exam patterns: creating ServiceAccounts with specific permissions for applications, granting read-only access to Pods and Services, allowing application Pods to create ConfigMaps, using ClusterRoles for cluster-scoped resources, and troubleshooting API access errors.

We'll also explore time-saving techniques: using imperative commands for simple RBAC setup, knowing that `kubectl create role` syntax with `--verb=get,list --resource=pods` is fastest, verifying permissions with `kubectl auth can-i` before creating Pods, and understanding common apiGroups: core (v1), apps (v1), batch (v1).

Finally, we'll practice complete scenarios including creating ServiceAccounts, Roles, RoleBindings, and Pods together, timing ourselves for efficiency.

## Exam Mindset

Remember: RBAC syntax is specific. The main components are straightforward: ServiceAccount (identity), Role (permissions), RoleBinding (connection), and Pod configuration. Practice until creating this chain is automatic.

When you see "create a ServiceAccount with permissions to list Pods," you should immediately think: create ServiceAccount, create Role with get/list verbs on pods resource, create RoleBinding, configure Pod to use ServiceAccount.

Let's dive into CKAD-specific RBAC scenarios!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with RBAC demonstrations
- Serious but encouraging tone - this is exam preparation

**Tone:**
- Shift from learning to drilling
- Emphasize security and least privilege
- Build confidence through systematic approaches

**Key Messages:**
- RBAC appears in CKAD for ServiceAccounts
- Know the chain: ServiceAccount → Role → RoleBinding → Pod
- Use kubectl auth can-i for verification
- The upcoming content focuses on exam techniques

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
