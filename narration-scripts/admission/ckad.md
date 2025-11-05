# Admission Control - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (18-22 minutes)

### Section 1: CKAD Exam Context (2 min)
**[00:00-02:00]**

While admission control is advanced, you'll encounter it in CKAD scenarios - mainly troubleshooting when policies block your deployments.

Key exam skills include recognizing admission controller errors, debugging Pods stuck due to admission policies, understanding Pod Security Standards, working with ResourceQuota and LimitRange, and reading Gatekeeper constraints.

You won't write webhooks, but you must troubleshoot when they block you. Essential commands include kubectl describe on ReplicaSets, checking events sorted by creation time, describing resource quotas and limit ranges, and checking namespace labels for Pod Security settings.

---

### Section 2: Pod Security Standards (4 min)
**[02:00-06:00]**

Pod Security Standards are enforced at namespace level via labels. There are three levels:

Privileged means no restrictions. Baseline prevents known privilege escalations. And Restricted enforces hardened security requirements.

Let me show you how to apply enforcement. We'll label a namespace to enforce baseline security.

Baseline prevents several dangerous configurations: hostNetwork, hostPID, hostIPC are not allowed. Privileged containers are blocked. HostPath volumes cannot be used. And you can't add capabilities except for the safe ones.

Restricted mode additionally requires running as non-root, dropping ALL capabilities, setting a seccomp profile, and preventing privilege escalation.

Here's a common error you'll see - it says the Pod violates PodSecurity baseline because a container has privileged set to true.

The fix is simple - remove the privileged setting or set it to false in the container's security context.

For restricted mode, you'll need a more comprehensive security context configuration. At the Pod level, set runAsNonRoot to true, specify a user ID, and configure a seccomp profile with type RuntimeDefault. In each container, set allowPrivilegeEscalation to false and drop ALL capabilities.

---

### Section 3: ResourceQuota Troubleshooting (3 min)
**[06:00-09:00]**

ResourceQuota enforces namespace limits. Here's a common error - it says exceeded quota for compute-quota. The requested memory is 2Gi, but the namespace is already using 8Gi of a 10Gi limit.

To debug this, describe the resource quota in the namespace.

The output shows the used and hard limits for each resource. In this case, memory limits are at 8Gi of 10Gi, and there are 8 pods of a maximum 10.

You have three solutions: reduce resources in your Pod spec, delete other Pods to free up quota, or increase the quota if you have permission.

Let me show you option one - edit the deployment and reduce the memory limit from 2Gi to 1Gi.

For option two, you could scale down another deployment to zero replicas.

Then check the quota again to verify you now have headroom.

---

### Section 4: LimitRange Defaults (2 min)
**[09:00-11:00]**

LimitRange sets defaults and constraints. Here's an error example - maximum memory usage per Container is 1Gi, but the requested limit is 2Gi.

Check the LimitRange in the namespace to see what constraints are set.

The output shows default values, default requests, maximum, and minimum for both memory and CPU.

If your container doesn't specify resources, LimitRange applies these defaults automatically. If you exceed the maximum, your requests are rejected.

---

### Section 5: Webhook and Gatekeeper Debugging (4 min)
**[11:00-15:00]**

When validation webhooks block your requests, you'll see an error like this - admission webhook validate.app.io denied the request with a message saying you must provide labels like "app" and "version".

Here are the debug steps. First, check which constraints exist in the cluster. You can get all constraints across namespaces, or get specific types like requiredlabels.

Second, describe the constraint to see its requirements. Look for the Match section showing which resources it applies to, Parameters showing what's required, and any current Violations.

Third, fix your YAML by adding the required labels in the metadata section.

For deployment failures, always check the ReplicaSet. The deployment might show 0 of 3 ready, but describing the deployment may not show the error. The error appears when you describe the ReplicaSet for that app.

---

### Section 6: Common Scenarios and Quick Fixes (5 min)
**[15:00-20:00]**

Let me walk through some common scenarios.

Scenario 1: Deployment not creating Pods. When you get the deployment, it shows 0 of 3 ready. Describing the ReplicaSet reveals an admission webhook denied the request. The fix is to read the error message carefully and add the required fields it specifies.

Scenario 2: Pod Security violation. The error says violates PodSecurity baseline for using hostNetwork. The fix is to remove hostNetwork from your spec, or change the namespace policy if appropriate.

Scenario 3: ResourceQuota exceeded. Describing the resource quota shows pods at 10 of 10 - you're at the limit. The fix is to delete a Pod or scale down a deployment to free up quota.

Scenario 4: Missing required labels. The error says you must provide the "app" label. The fix is adding it to your metadata labels section.

---

### Section 7: Exam Strategy (2 min)
**[20:00-22:00]**

Here's a checklist for admission issues during the exam:

If your deployment exists but no Pods appear, check the ReplicaSet. If the error mentions a webhook, read the message and fix the specified field. If it mentions quota, check kubectl describe resourcequota. If it mentions PodSecurity, check namespace labels and adjust your securityContext. If you're still stuck, check LimitRange and events.

Time-saving commands include checking ReplicaSets with tail to see just the recent events, getting namespace labels with show-labels, describing resource quotas, and listing all constraints across namespaces.

Common mistakes to avoid: checking the Deployment instead of the ReplicaSet for admission errors, not reading the full error message, forgetting about namespace-scoped policies, and not verifying quota after making changes.

Practice identifying admission errors in under 2 minutes. Move on quickly if stuck - don't let admission questions consume more than 5 minutes.

Good luck with CKAD!
