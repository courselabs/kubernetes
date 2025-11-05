# API Versions - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-20 minutes)

---

### Section 1: CKAD Exam Relevance (2 min)
**[00:00-02:00]**

Welcome to CKAD exam preparation for Kubernetes API versions and deprecations. This topic appears directly in exam scenarios and is critical for troubleshooting.

You'll encounter API version questions in several forms:
- Identifying the correct API version for a resource type
- Fixing manifests that use deprecated APIs
- Converting resources to current versions
- Troubleshooting "no matches for kind" errors

Time allocation: Spend no more than 3-4 minutes on API version questions. These are usually quick wins if you know the commands.

Essential commands to memorize: kubectl api-resources with grep, kubectl api-versions, kubectl explain for resources, and kubectl convert for file conversion.

Let's practice these systematically.

---

### Section 2: Finding Current API Versions (3 min)
**[02:00-05:00]**

Scenario: "What API version should be used for creating an Ingress resource?"

Quick solution: Use kubectl api-resources and grep for ingress.

The output shows ingresses with networking.k8s.io/v1 as true Ingress. The answer is networking.k8s.io/v1. This command works for any resource type.

You can check common CKAD resources with a single grep pattern matching deployments, services, pods, ingress, cronjob, job, configmap, and secret.

Memorize these patterns:
- Core resources like Pod, Service, ConfigMap, Secret use v1
- Workloads like Deployment, StatefulSet, DaemonSet use apps/v1
- Jobs including Job and CronJob use batch/v1
- Networking resources like Ingress and NetworkPolicy use networking.k8s.io/v1
- Policy resources like PodDisruptionBudget use policy/v1

Practice drill: Find API version for deployment, cronjob, ingress, and poddisruptionbudget.

Time yourself - you should complete this in under 30 seconds per resource.

---

### Section 3: Fixing Deprecated API Errors (4 min)
**[05:00-09:00]**

Scenario: "A deployment fails with error: no matches for kind Ingress in version networking.k8s.io/v1beta1. Fix it."

This is a deprecated API error. Here's the systematic approach:

Step 1 takes 15 seconds: Identify current version with kubectl api-resources.
Step 2: Get the failing resource if it exists using kubectl get.
Step 3: Edit the apiVersion field, changing from v1beta1 to v1.
Step 4: Check for schema changes with kubectl explain.
Step 5: Update required fields - v1 Ingress requires pathType field.
Step 6: Apply the fixed manifest.

Common deprecated APIs you might encounter:

Deployment changed from extensions/v1beta1 to apps/v1. The key difference is that the selector field is now required with matchLabels.

Ingress changed from networking.k8s.io/v1beta1 to networking.k8s.io/v1. In the old version, backend used serviceName and servicePort. In the new version, pathType is required and backend uses a service structure with name and port number fields.

CronJob changed from batch/v1beta1 to batch/v1. Just change the version - the schema is compatible.

Practice: Fix these broken manifests in under 2 minutes each.

---

### Section 4: Using kubectl explain Efficiently (3 min)
**[09:00-12:00]**

kubectl explain is your on-demand documentation. Use it to verify API structure without leaving the terminal.

Basic usage shows deployment, deployment.spec, and deployment.spec.template information.

Find required fields by using the recursive flag with kubectl explain deployment.spec.

Scroll through output to see all fields. Required fields are typically mentioned in the description.

Exam-specific patterns:

For quick schema verification, check what fields an Ingress path needs. The output shows pathType is required in v1.

Compare API versions by specifying the api-version flag.

Find field types - for example, deployment.spec.replicas shows TYPE: integer.

Time-saving trick: Pipe to grep to find specific fields like selector, replicas, or strategy.

Practice drill: Use explain to answer these in under 30 seconds each:
1. What type is deployment.spec.replicas?
2. Is ingress.spec.rules.http.paths.pathType required?
3. What are valid values for pathType?

---

### Section 5: Quick Migration Patterns (3 min)
**[12:00-15:00]**

When you need to update a resource's API version quickly:

Pattern 1: In-place edit. Get the deployment YAML, use sed to replace the old API version with the new one, add required fields if needed, then apply.

Pattern 2: Using kubectl convert if available. Convert the old manifest to the new version and apply it.

Pattern 3: Recreate from imperative command. Get key details first, delete the old deployment, recreate with kubectl create, then reapply customizations using kubectl set commands.

Pattern 4: For simple API version changes, use kubectl edit to change apiVersion in the editor. Kubernetes applies immediately.

Choose based on complexity:
- Simple version change only: use kubectl edit
- Multiple resources: use sed with kubectl apply
- Schema changes: use kubectl convert or manual edit
- Complex customizations: recreate from imperative commands

Practice: Migrate a Deployment from extensions/v1beta1 to apps/v1 in under 2 minutes.

---

### Section 6: Troubleshooting Decision Tree (2 min)
**[15:00-17:00]**

Use this mental flowchart for API version errors:

When you see "no matches for kind X in version Y", it's an API version issue. Run kubectl api-resources to find the correct version. Update apiVersion in your YAML. Run kubectl explain to check for required fields. Then apply the updated YAML.

Common error messages and fixes:

Error 1: "no matches for kind Ingress in version networking.k8s.io/v1beta1"
Fix: Change to networking.k8s.io/v1 and add pathType field.

Error 2: "error validating data: ValidationError missing required field selector"
Fix: The apps/v1 Deployment requires spec.selector.matchLabels.

Error 3: "Unknown field serviceName in Ingress backend"
Fix: v1 Ingress uses service.name instead of serviceName.

Speed check: When you see an API error, you should identify it's an API issue in 5 seconds, find correct version in 15 seconds, check schema with explain in 30 seconds, and update and apply in 60 seconds.

Total: approximately 110 seconds maximum.

---

### Section 7: Exam Tips and Practice Scenarios (3 min)
**[17:00-20:00]**

Tip 1: Memorize common current versions - apps/v1, batch/v1, networking.k8s.io/v1, policy/v1, and v1.

Tip 2: Use api-resources, not documentation. It's faster than searching docs and always shows your cluster's versions.

Tip 3: kubectl explain is your friend. No internet needed and shows exact structure required.

Tip 4: Test with dry-run. Use kubectl apply with --dry-run=server to catch API errors without applying.

Tip 5: Don't overthink. If it says wrong API version, fix the API version. Use kubectl api-resources to find the right one. Move on quickly.

Practice Scenario 1 takes 4 minutes: "Update this Ingress to use the current API version and make it work."

The Ingress uses v1beta1 with the old backend structure. Solution: Check current version, then fix the YAML by updating apiVersion to v1, adding pathType: Prefix as required, and changing the backend structure to use service with name and port number fields.

Time yourself. With practice, this should take under 2 minutes.

Final Exam Strategy: Read question carefully - create or fix? For create, use current stable versions. For fix, use kubectl api-resources first. Don't spend more than 4 minutes on API questions. Move on if stuck, flag for review.

Good luck with your CKAD exam!
