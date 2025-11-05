# RBAC - Quickfire Questions

Test your knowledge of Kubernetes Role-Based Access Control (RBAC) with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What does RBAC stand for in Kubernetes?

A) Resource-Based Access Control
B) Role-Based Access Control
C) Rule-Based Authentication Control
D) Runtime-Based Authorization Control

### 2. What is the difference between a Role and a ClusterRole?

A) Roles are for users, ClusterRoles are for ServiceAccounts
B) Roles are namespaced, ClusterRoles are cluster-wide
C) There is no difference
D) ClusterRoles are deprecated

### 3. What binds a Role to a user or ServiceAccount?

A) RoleAssignment
B) RoleBinding
C) PermissionBinding
D) Authorization

### 4. Which resources can be specified in a Role or ClusterRole?

A) Only Pods and Services
B) Any Kubernetes API resources
C) Only namespaced resources
D) Only cluster-wide resources

### 5. What is the purpose of a ServiceAccount?

A) To provide user authentication
B) To provide an identity for Pods to access the Kubernetes API
C) To manage service configurations
D) To create Services automatically

### 6. How do you grant a ServiceAccount cluster-admin privileges?

A) Create a RoleBinding with cluster-admin Role
B) Create a ClusterRoleBinding with cluster-admin ClusterRole
C) Add the ServiceAccount to the admin group
D) Set admin: true in ServiceAccount spec

### 7. What verbs can be specified in RBAC rules?

A) Only get, list, and watch
B) get, list, watch, create, update, patch, delete
C) read and write only
D) execute and manage

### 8. Can a ClusterRole be bound at the namespace level?

A) No, ClusterRoles must use ClusterRoleBindings
B) Yes, using a RoleBinding to grant namespace-scoped permissions
C) Only for system ClusterRoles
D) Only with admin approval

### 9. What is the default ServiceAccount in every namespace?

A) admin
B) default
C) system
D) namespace-sa

### 10. How do you check if a user or ServiceAccount can perform an action?

A) kubectl check permission
B) kubectl auth can-i <verb> <resource>
C) kubectl verify access
D) kubectl test-auth

---

## Answers

1. **B** - RBAC stands for Role-Based Access Control, Kubernetes' authorization mechanism for controlling access to API resources.

2. **B** - Roles are namespaced (apply within a specific namespace), while ClusterRoles are cluster-wide and can apply to cluster-scoped resources or across all namespaces.

3. **B** - RoleBindings bind a Role to subjects (users, groups, or ServiceAccounts). ClusterRoleBindings bind ClusterRoles.

4. **B** - Roles and ClusterRoles can specify permissions for any Kubernetes API resources (Pods, Services, Deployments, etc.) with specified verbs.

5. **B** - ServiceAccounts provide an identity for processes running in Pods, allowing them to authenticate with the Kubernetes API server and access resources based on RBAC rules.

6. **B** - Use a ClusterRoleBinding to bind the cluster-admin ClusterRole to the ServiceAccount. This grants full cluster access.

7. **B** - RBAC verbs include: get, list, watch, create, update, patch, delete, and special verbs like * (all) and deletecollection.

8. **B** - Yes, you can use a RoleBinding to bind a ClusterRole within a specific namespace, granting those permissions only in that namespace.

9. **B** - Every namespace has a "default" ServiceAccount automatically created. Pods use this if no ServiceAccount is specified.

10. **B** - `kubectl auth can-i <verb> <resource>` checks permissions. Example: `kubectl auth can-i create pods` or `kubectl auth can-i create pods --as=system:serviceaccount:default:mysa`.

---

## Study Resources

- [Lab README](README.md) - Core RBAC concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific RBAC topics
- [Official RBAC Documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
