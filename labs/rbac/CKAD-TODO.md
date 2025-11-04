# CKAD RBAC Lab - TODO List

This document tracks the additional materials needed to complete the CKAD RBAC lab.

## Required Spec Files

### ServiceAccount Management
- [ ] `specs/ckad/serviceaccounts/basic-sa.yaml` - Complete example with SA, Role, RoleBinding, and Pod
- [ ] `specs/ckad/serviceaccounts/no-token-pod.yaml` - Pod and SA with token mounting disabled
- [ ] `specs/ckad/serviceaccounts/multiple-sas.yaml` - Multiple ServiceAccounts for different apps

### Complex RBAC Rules
- [ ] `specs/ckad/roles/multi-resource-role.yaml` - Role with multiple resources and API groups
- [ ] `specs/ckad/roles/named-resources.yaml` - Role using resourceNames for specific resources
- [ ] `specs/ckad/roles/subresources.yaml` - Role with subresource permissions (logs, exec)
- [ ] `specs/ckad/roles/all-verbs.yaml` - Examples of all common verbs

### Built-in ClusterRoles
- [ ] `specs/ckad/builtin-roles/view-example.yaml` - Using view ClusterRole
- [ ] `specs/ckad/builtin-roles/edit-example.yaml` - Using edit ClusterRole
- [ ] `specs/ckad/builtin-roles/admin-example.yaml` - Using admin ClusterRole
- [ ] `specs/ckad/builtin-roles/extending-view.yaml` - Extending built-in view role

### RoleBindings and ClusterRoleBindings
- [ ] `specs/ckad/rolebindings/clusterrole-in-namespace.yaml` - ClusterRole bound to namespace via RoleBinding
- [ ] `specs/ckad/rolebindings/multiple-subjects.yaml` - RoleBinding with multiple subjects
- [ ] `specs/ckad/rolebindings/user-and-group.yaml` - Bindings for Users and Groups

### Aggregated ClusterRoles
- [ ] `specs/ckad/clusterroles/aggregated.yaml` - Aggregated ClusterRole example
- [ ] `specs/ckad/clusterroles/extend-builtin.yaml` - Extending built-in roles via aggregation

### Resource-Specific RBAC
- [ ] `specs/ckad/rbac-secrets/secret-manager.yaml` - Role for managing secrets
- [ ] `specs/ckad/rbac-secrets/secret-reader-specific.yaml` - Read specific secrets only
- [ ] `specs/ckad/rbac-configmaps/configmap-editor.yaml` - Full ConfigMap management
- [ ] `specs/ckad/rbac-configmaps/configmap-reader.yaml` - Read-only ConfigMap access
- [ ] `specs/ckad/rbac-deployments/deployment-manager.yaml` - Deployment management permissions

### Cross-Namespace Access
- [ ] `specs/ckad/cross-namespace/cross-ns-access.yaml` - ServiceAccount accessing different namespace
- [ ] `specs/ckad/cross-namespace/shared-resources.yaml` - Shared namespace pattern
- [ ] `specs/ckad/cross-namespace/namespace-lister.yaml` - Permission to list namespaces

### Isolation and Security
- [ ] `specs/ckad/isolation/namespace-isolation.yaml` - Dev/Prod namespace isolation
- [ ] `specs/ckad/isolation/least-privilege.yaml` - Minimal permissions example
- [ ] `specs/ckad/isolation/overly-permissive.yaml` - Anti-pattern example (for learning)

## Required Exercise Files

### Exercise 1: Basic ServiceAccount Setup
- [ ] `specs/ckad/exercises/ex1-basic-rbac/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex1-basic-rbac/requirements.yaml` - Initial setup
- [ ] `specs/ckad/exercises/ex1-basic-rbac/solution.yaml` - Complete solution
- [ ] `specs/ckad/exercises/ex1-basic-rbac/verification.sh` - Test script

### Exercise 2: Multi-Resource Role
- [ ] `specs/ckad/exercises/ex2-multi-resource/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex2-multi-resource/namespace-setup.yaml` - Setup dev namespace
- [ ] `specs/ckad/exercises/ex2-multi-resource/solution.yaml` - Complete solution
- [ ] `specs/ckad/exercises/ex2-multi-resource/tests.sh` - Permission tests

### Exercise 3: Cross-Namespace Access
- [ ] `specs/ckad/exercises/ex3-cross-namespace/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex3-cross-namespace/setup.yaml` - Multi-namespace setup
- [ ] `specs/ckad/exercises/ex3-cross-namespace/solution.yaml` - Complete solution
- [ ] `specs/ckad/exercises/ex3-cross-namespace/verify.sh` - Verification script

### Exercise 4: Troubleshoot RBAC
- [ ] `specs/ckad/exercises/ex4-troubleshoot/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex4-troubleshoot/broken-setup.yaml` - Broken configuration
- [ ] `specs/ckad/exercises/ex4-troubleshoot/app-pod.yaml` - Pod that fails
- [ ] `specs/ckad/exercises/ex4-troubleshoot/solution.yaml` - Fixed configuration
- [ ] `specs/ckad/exercises/ex4-troubleshoot/debugging-steps.md` - Troubleshooting walkthrough

### Exercise 5: Production Deployment
- [ ] `specs/ckad/exercises/ex5-production/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex5-production/requirements.md` - Security requirements
- [ ] `specs/ckad/exercises/ex5-production/solution.yaml` - Complete production setup
- [ ] `specs/ckad/exercises/ex5-production/checklist.md` - Security checklist

## Additional Documentation

### Troubleshooting Guides
- [ ] `docs/rbac-troubleshooting-guide.md` - Common RBAC errors and solutions
- [ ] `docs/rbac-debugging-workflow.md` - Step-by-step debugging process
- [ ] `docs/permission-denied-flowchart.md` - Decision tree for fixing access issues

### Reference Materials
- [ ] `docs/api-groups-reference.md` - Complete API groups for common resources
- [ ] `docs/verbs-reference.md` - All verbs and what they mean
- [ ] `docs/builtin-roles-comparison.md` - Comparison table of view/edit/admin
- [ ] `docs/serviceaccount-format-guide.md` - ServiceAccount naming formats

### Security Best Practices
- [ ] `docs/rbac-security-checklist.md` - Production RBAC checklist
- [ ] `docs/least-privilege-patterns.md` - Common minimal permission patterns
- [ ] `docs/rbac-anti-patterns.md` - What NOT to do

## Solution Document
- [ ] `solution-ckad.md` - Solutions for all CKAD exercises with explanations

## Testing Materials

### Verification Scripts
- [ ] `tests/verify-serviceaccount.sh` - Test SA creation and usage
- [ ] `tests/verify-permissions.sh` - Automated permission testing
- [ ] `tests/verify-cross-namespace.sh` - Cross-namespace access tests
- [ ] `tests/rbac-audit.sh` - Audit RBAC configurations

### Exam Simulation
- [ ] `exam-sim/scenario-1-create-sa.md` - Timed exercise: Create SA and bind
- [ ] `exam-sim/scenario-2-multi-resource.md` - Timed exercise: Complex role
- [ ] `exam-sim/scenario-3-troubleshoot.md` - Timed exercise: Debug RBAC
- [ ] `exam-sim/scenario-4-builtin-roles.md` - Timed exercise: Use built-in roles
- [ ] `exam-sim/scenario-5-production.md` - Timed exercise: Secure deployment

## Suggested Spec Content Details

### ServiceAccount Examples
Should demonstrate:
- Creating ServiceAccount imperatively and declaratively
- Attaching ServiceAccount to Pods
- Disabling token mounting (both methods)
- Token location in Pod filesystem
- Verification commands

### Role Examples
Should include:
- Single resource, single verb (simplest)
- Multiple resources, multiple verbs
- Different API groups (core, apps, batch)
- resourceNames usage and limitations
- Subresource permissions
- Comments explaining API group selection

### RoleBinding Examples
Should demonstrate:
- Binding Role to ServiceAccount
- Binding ClusterRole to ServiceAccount (namespace scope)
- Multiple subjects in one binding
- Cross-namespace subject references
- Verification with `kubectl auth can-i`

### Aggregation Examples
Should show:
- Aggregated ClusterRole structure
- Multiple component ClusterRoles
- Label selectors for aggregation
- How built-in roles use aggregation
- Extending built-in view/edit/admin

### Cross-Namespace Examples
Should include:
- ServiceAccount in namespace A
- Role in namespace B
- RoleBinding in namespace B referencing SA from A
- Verification commands
- Use cases (monitoring, shared configs)

### Troubleshooting Scenarios

**Scenario 1**: Missing ServiceAccount
- Pod spec references non-existent SA
- Error message example
- Debugging steps
- Solution

**Scenario 2**: Wrong API Group
- Role has incorrect API group
- Permissions don't work
- How to identify correct API group
- Solution

**Scenario 3**: Namespace Mismatch
- Role in one namespace
- RoleBinding in different namespace
- Error message
- Solution

**Scenario 4**: Missing Subresource Permission
- Can list pods but not get logs
- Need pods/log subresource
- Solution

**Scenario 5**: resourceNames with List
- Role uses resourceNames with list verb
- Doesn't work as expected
- Explanation and solution

## Integration with Existing Lab

- [ ] Update main README.md to reference CKAD.md
- [ ] Add CKAD label to all new specs: `kubernetes.courselabs.co: rbac-ckad`
- [ ] Ensure examples work with kube-explorer app
- [ ] Cross-reference basic lab and CKAD content
- [ ] Add CKAD callout boxes in basic README where appropriate

## Priority Order

### High Priority (Core CKAD Topics)
1. ServiceAccount examples (basic-sa, no-token)
2. Multi-resource role examples
3. Built-in ClusterRole usage examples
4. Exercise 1 solution (basic RBAC)
5. Exercise 4 solution (troubleshooting)

### Medium Priority (Advanced Patterns)
6. Cross-namespace access examples
7. Aggregated ClusterRole examples
8. Resource-specific RBAC (secrets, configmaps)
9. Exercise 2 & 3 solutions
10. Troubleshooting guides

### Low Priority (Nice-to-Have)
11. Exercise 5 (comprehensive production)
12. Exam simulation scenarios
13. Additional reference documentation
14. Security best practices guides
15. Automated testing scripts

## Notes

- All specs should follow existing lab patterns
- Use kube-explorer app for interactive demonstrations where possible
- Include verification commands with every example
- Add comments in YAML explaining non-obvious choices
- Test all examples on Docker Desktop and k3d
- Ensure cleanup works with label selectors
- Pin image versions (no :latest tags)
- Include both imperative and declarative approaches
- Add timing notes for exam simulation scenarios
- Cross-reference Kubernetes official documentation

## Example Applications for RBAC

Consider creating demo apps that:
- [ ] Read from ConfigMaps (needs ConfigMap get permission)
- [ ] Write to Secrets (needs Secret create/update permission)
- [ ] List other Pods (needs Pod list permission)
- [ ] Scale Deployments (needs Deployment scale permission)
- [ ] Access logs of other Pods (needs Pod/log permission)

These would make the RBAC requirements more concrete and testable.

## Documentation Enhancements

- [ ] Add decision tree: "Which RBAC object do I need?"
- [ ] Add flowchart: "Debugging RBAC permission denied"
- [ ] Add table: "API groups quick reference"
- [ ] Add table: "Verbs and their meanings"
- [ ] Add comparison: "Role vs ClusterRole usage patterns"
- [ ] Add diagram: "RBAC object relationships"

---

Use this checklist to track progress on completing the CKAD RBAC lab materials.
