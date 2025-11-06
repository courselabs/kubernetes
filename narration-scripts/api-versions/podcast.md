# API Versions and Deprecations - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening (1 min)

Welcome to this deep dive on Kubernetes API Versions and Deprecations. This is a critical topic for both CKAD certification and real-world Kubernetes operations.

Kubernetes is a living, evolving system. New features arrive, existing APIs improve, and sometimes old APIs are deprecated and eventually removed. Understanding how Kubernetes manages this evolution through API versioning is essential for maintaining applications across cluster upgrades and avoiding deployment failures.

Today we'll explore how Kubernetes API versioning works, the deprecation policy and timelines, and most importantly - how to identify and migrate deprecated APIs before they break your applications. For CKAD candidates, this knowledge helps you troubleshoot "no matches for kind" errors quickly and update manifests to current API versions under time pressure.

---

## Understanding API Maturity Levels (2 min)

Let's start with the three maturity levels that Kubernetes uses for APIs: alpha, beta, and stable.

Alpha APIs have version names like v1alpha1 or v1alpha2. These are experimental features that may be incomplete or buggy. They're disabled by default in most clusters and can be removed at any time without notice or backward compatibility guarantees. You should never use alpha APIs in production environments - they're strictly for testing and experimentation.

Beta APIs use version names like v1beta1 or v1beta2. These are well-tested features considered safe for use, but implementation details may still change. Beta APIs are enabled by default in clusters. Kubernetes guarantees support for at least one release after deprecation, giving you time to migrate. You can use beta APIs in production, but you should plan to migrate to stable versions as they become available.

Stable APIs have version names like v1 or v2 - just a plain number without alpha or beta suffixes. These are production-ready, widely adopted, and will be supported for many releases. Once an API reaches stable status, it follows a strict deprecation policy that gives you twelve months or three releases, whichever is longer, to migrate away. Stable APIs are always the recommended choice for production workloads.

Understanding these levels helps you assess risk. When you see an API version in a manifest, you immediately know whether it's experimental, maturing, or production-ready.

---

## API Groups and Versions (2 min)

Kubernetes organizes APIs into groups to manage related resources together. Understanding this structure helps you read manifests and troubleshoot issues effectively.

The apiVersion field in your YAML manifests has the format group slash version. For example, apps/v1 means the apps API group, version 1. Different resource types live in different groups. Deployments, StatefulSets, and DaemonSets use apps/v1. Jobs and CronJobs use batch/v1. Ingress resources use networking.k8s.io/v1. PodDisruptionBudgets use policy/v1.

There's a special case called the core group. Core resources like Pods, Services, ConfigMaps, and Secrets don't have a group name - their apiVersion is just v1. This is because they were part of the original Kubernetes design before API groups were introduced.

Cloud providers and third-party tools can add custom API groups. For example, cert-manager adds cert-manager.io/v1 for certificate management resources. This extensibility is a key strength of Kubernetes, but it also means you need to understand which APIs are built-in and which come from extensions.

When you encounter an error about API versions, understanding this group/version structure helps you quickly identify which resource and API version is causing the problem.

---

## The Deprecation Policy (2 min)

Kubernetes follows a formal deprecation policy to give users time to migrate before APIs are removed. This policy varies by maturity level.

For stable APIs like v1 or v2, deprecated versions are supported for twelve months or three releases, whichever is longer. This generous timeline ensures you have ample opportunity to update your manifests. For example, if a stable API is deprecated in Kubernetes 1.22, it will remain available through at least 1.25, or for twelve months, whichever comes later.

Beta APIs have a shorter support window - nine months or three releases. This reflects that beta APIs are not considered fully stable and may need to evolve more quickly. While still substantial, this shorter timeline means you should prioritize migrating away from beta APIs.

Alpha APIs have no guaranteed support timeline whatsoever. They can be removed in any release without notice. This is why using alpha APIs in production is strongly discouraged - your deployments could break on any cluster upgrade.

When an API version is deprecated, Kubernetes announces it in the release notes. The old version continues working during the deprecation window, giving you time to migrate. After the deprecation period expires, the API version is removed entirely, and manifests using it will fail with "no matches for kind" errors.

The key takeaway: always monitor release notes before upgrading your cluster, and proactively migrate away from deprecated APIs rather than waiting for them to break.

---

## Historical Deprecations and Patterns (3 min)

Let's examine some historically significant API deprecations to understand the patterns you'll encounter.

Kubernetes 1.16 was a major milestone that removed extensions/v1beta1 for Deployments, ReplicaSets, and DaemonSets. Users had to migrate to apps/v1, which had been stable for several releases. This change affected countless clusters and taught the community an important lesson about staying current with API versions. Many organizations that delayed migration faced painful emergency updates during cluster upgrades.

Kubernetes 1.22 removed multiple beta Ingress versions, consolidating on networking.k8s.io/v1 as the only option. This deprecation was particularly challenging because the v1 Ingress API included schema changes. The pathType field became required, and the backend structure changed from simple serviceName and servicePort fields to a nested structure using service with name and port subfields. This meant migration wasn't just changing the version number - you had to restructure your YAML.

Kubernetes 1.25 removed batch/v1beta1 for CronJob and policy/v1beta1 for PodDisruptionBudget, completing their migration to stable v1 APIs. This same release also completely removed PodSecurityPolicy, replacing it with Pod Security Standards - a fundamental shift in how Kubernetes approaches security policy enforcement.

These historical changes reveal a pattern: major deprecations happen regularly as APIs mature, and you must stay current with your API versions. Waiting until an upgrade forces migration creates unnecessary pressure and risk. It's much better to migrate proactively during normal maintenance windows.

---

## Discovering Available APIs (2 min)

How do you know which API versions your cluster supports? Kubectl provides several commands to discover this information, and these are essential tools for both day-to-day work and the CKAD exam.

The kubectl api-versions command lists all API versions available in your cluster. When you run this, you'll see output like apps/v1, batch/v1, networking.k8s.io/v1, and many others. This shows what your cluster can accept.

Even more useful is kubectl api-resources, which shows every resource type with its API version, whether it's namespaced, and its short name. For example, you'll see that deployments use apps/v1, are namespaced, and have the short name deploy. This command is invaluable for quickly finding the correct API version for any resource type.

To find a specific resource's API version, you can filter the output. For example, kubectl api-resources followed by grep ingress shows you that Ingress uses networking.k8s.io/v1.

To check what API version a running resource is using, use kubectl get with output format yaml or json. For instance, kubectl get deployment myapp -o yaml, then look at the apiVersion field. This helps you identify which resources in your cluster might be using deprecated APIs.

For understanding the structure of an API, kubectl explain is invaluable. Running kubectl explain ingress shows you the current API structure, required fields, and field descriptions. This is particularly useful during the CKAD exam when you need quick reference without searching documentation.

---

## Identifying Deprecated APIs in Your Resources (3 min)

Before upgrading a cluster, you need to identify which of your resources use deprecated APIs. Kubernetes provides warnings, and several tools can help with this discovery process.

When you apply a manifest with a deprecated API, kubectl shows a warning message. You might see something like "Warning: extensions/v1beta1 Deployment is deprecated in v1.9+, unavailable in v1.16+". Pay attention to these warnings - they're telling you that migration is needed.

You can scan all resources in your cluster by using kubectl get all with the --all-namespaces flag and output as json, then examining the apiVersion fields. However, this only shows what's currently deployed. Your Git repository might contain manifests using deprecated APIs that haven't been applied yet, so you need to scan your source files as well.

Several open-source tools help identify deprecated APIs more systematically. Kubent, which stands for Kubernetes No Trouble, scans your running cluster for deprecated APIs and generates a report. Pluto detects deprecated API versions in both files and Helm charts, making it useful for pre-deployment checks. The kubectl-convert plugin, which we'll discuss more in a moment, helps migrate manifests to newer versions.

The Kubernetes deprecation guide in the official documentation lists all deprecated APIs organized by version. This should be your first stop before any cluster upgrade. Check which APIs are being removed in your target version, then search your codebase for those API versions.

Being proactive about identifying deprecated APIs prevents painful surprises during upgrades. It's much easier to migrate during planned maintenance than during an emergency upgrade that's blocked by deprecated APIs.

---

## The kubectl convert Tool (2 min)

The kubectl convert plugin is designed specifically to help you migrate YAML manifests to newer API versions. While it's not included in the standard kubectl binary, it's an important tool to understand.

You need to install kubectl convert separately, either through your package manager or by downloading it from the Kubernetes release page. Once installed, the basic usage is straightforward: kubectl convert -f old-manifest.yaml --output-version apps/v1.

This reads your old manifest and outputs the converted version using the specified API version. You can redirect the output to a new file or pipe it directly to kubectl apply for testing.

The important thing to understand is that kubectl convert handles more than just version number changes. It also adapts structural changes in the API. For example, when converting Ingress from networking.k8s.io/v1beta1 to v1, it adds required pathType fields and restructures the backend specification to match the new schema.

However, kubectl convert has limitations. It can't always automatically handle complex schema modifications, especially when there are significant behavioral changes. Always review the converted YAML carefully and test it in a non-production environment before applying to production.

For the CKAD exam, you should understand what kubectl convert does and know the basic syntax, even if you don't use it extensively. Sometimes manually updating the YAML is faster than running the convert command, especially for simple changes.

---

## Migration Strategies (2 min)

Let's discuss practical strategies for successfully managing API migrations in real-world environments.

First, proactive monitoring. Don't wait for cluster upgrades to discover deprecated APIs. Regularly scan your cluster and manifests using tools like kubent or Pluto. Make API updates part of your routine maintenance cycle, not emergency work.

Second, test before production. Always test API migrations in a development or staging environment before touching production. Some API changes involve schema modifications that might break your workflows in unexpected ways. Catching these issues in staging prevents production incidents.

Third, update your source of truth. If you use GitOps or store manifests in Git, update those source files, not just the running cluster. Otherwise, the next deployment will reintroduce the old API version, undoing your migration work. Your source repository and running cluster must stay synchronized.

Fourth, gradual migration. For large deployments with many applications, migrate incrementally rather than all at once. This reduces risk and makes troubleshooting easier when issues arise. You can migrate one application, verify it works, then move to the next.

Fifth, always use stable APIs for new deployments. When creating new applications, use stable API versions like v1 or v2, not beta versions. This minimizes future migration work since stable APIs are supported much longer.

---

## CKAD Exam Focus (3 min)

Let's focus on what you need to master for the CKAD exam. API version questions appear regularly and can be quick wins if you know the patterns.

Time management is critical. API version questions should take no more than three to four minutes. These are usually straightforward if you know the commands.

Essential commands to memorize: kubectl api-resources followed by grep to find the correct API version for any resource type. kubectl api-versions to see what your cluster supports. kubectl explain for quick reference on resource structure. And kubectl convert for migrating files, though manual editing is often faster.

Common exam scenarios include identifying the correct API version for a resource type. The answer is usually to run kubectl api-resources and grep for the resource name. You might need to fix a manifest that uses a deprecated API - change the apiVersion field and verify no schema changes are needed by using kubectl explain. You could be asked to convert resources to current versions - use kubectl convert or manually edit the YAML. And you'll definitely encounter troubleshooting "no matches for kind" errors, which are always API version issues.

Let me walk you through a typical scenario. The question says "What API version should be used for creating an Ingress resource?" You run kubectl api-resources, pipe it to grep ingress, and the output shows networking.k8s.io/v1. That's your answer. Total time: under thirty seconds.

Another common pattern: "A deployment fails with error: no matches for kind Ingress in version networking.k8s.io/v1beta1. Fix it." You immediately recognize this as a deprecated API error. Run kubectl api-resources to find the current version, which is networking.k8s.io/v1. Check kubectl explain ingress to see if there are schema changes - yes, pathType is now required. Update the YAML to use networking.k8s.io/v1, add pathType: Prefix to each path, and apply. Total time: under two minutes.

Practice these patterns until they're muscle memory. Know the current API versions for common resources: v1 for core resources, apps/v1 for workloads, batch/v1 for jobs, networking.k8s.io/v1 for networking, policy/v1 for policies. Don't waste time looking these up during the exam.

---

## Summary and Key Takeaways (1 min)

Let's summarize the critical concepts about Kubernetes API versions and deprecations.

API maturity levels indicate stability and support commitments. Alpha is experimental and unstable, beta is tested but may change, stable is production-ready and supported long-term. Always prefer stable APIs for production workloads.

The deprecation timeline gives you time to migrate. Stable APIs get twelve months or three releases of support after deprecation. Beta gets nine months or three releases. Alpha has no guarantees. Plan migrations well in advance of these deadlines.

Discovery commands are your tools for understanding API versions. Kubectl api-versions shows available versions. Kubectl api-resources shows resource details with their current API versions. Kubectl explain provides inline documentation. Master these commands for efficient CKAD performance.

Migration tools help automate updates. Kubectl convert migrates manifests to newer versions. Kubent and Pluto scan for deprecated APIs in clusters and files. Use these proactively before cluster upgrades, not reactively when deployments break.

Best practices keep you ahead of deprecations. Monitor deprecation warnings from kubectl. Test migrations in non-production environments first. Update source of truth in Git repositories, not just running clusters. Always use stable APIs for new deployments to minimize future migration work.

For CKAD exam success, know how to identify deprecated APIs using kubectl commands, understand the difference between alpha, beta, and stable, and practice converting manifests to newer versions quickly under time pressure.

Remember - API version issues are preventable. Stay current with API versions, test before upgrading, and treat deprecation warnings seriously. Thank you for listening, and good luck with your CKAD preparation!
