# API Versions and Deprecations - Concept Introduction
## Narration Script for Slideshow (8-10 minutes)

---

### Slide 1: Introduction to API Versioning (1 min)
**[00:00-01:00]**

Welcome to this session on Kubernetes API Versions and Deprecations. This is a critical topic for the CKAD exam and real-world Kubernetes operations.

Kubernetes APIs evolve continuously. New features are added, existing features improve, and sometimes old features are deprecated and removed. Understanding how Kubernetes manages this evolution through API versioning is essential for maintaining applications across cluster upgrades.

In this slideshow, we'll cover three main areas:
- How Kubernetes API versioning works - alpha, beta, and stable
- The deprecation policy and timeline
- How to identify and migrate deprecated APIs

This knowledge will help you avoid breaking deployments during cluster upgrades and ensure your manifests remain compatible with newer Kubernetes versions.

---

### Slide 2: Why API Versioning Matters (1 min)
**[01:00-02:00]**

Let's understand why this topic matters for CKAD candidates and Kubernetes users.

First, **cluster upgrades can break applications**. If your manifests use deprecated APIs that have been removed in the new cluster version, your deployments will fail. This is a common problem in production environments.

Second, **CKAD exam compatibility**. The exam may test your ability to identify deprecated APIs and migrate resources to current versions. You need to know the tools and commands.

Third, **best practices**. Using stable APIs instead of beta or alpha versions ensures your applications are production-ready and won't break unexpectedly.

Finally, **troubleshooting**. When you see errors like "no matches for kind Ingress in version networking.k8s.io/v1beta1," you need to quickly identify this as a deprecation issue and know how to fix it.

---

### Slide 3: API Maturity Levels (1 min)
**[02:00-03:00]**

Kubernetes APIs go through three maturity levels: alpha, beta, and stable.

**Alpha APIs** have version names like v1alpha1 or v1alpha2. These are experimental features that may be buggy or incomplete. They can be removed at any time without notice. Alpha APIs are disabled by default in most clusters and should never be used in production.

**Beta APIs** have version names like v1beta1 or v1beta2. These are well-tested features considered safe for use, but details may still change. Beta APIs are enabled by default. Kubernetes guarantees support for at least one release after deprecation. You can use beta APIs in production with caution, but plan to migrate to stable versions.

**Stable APIs** have version names like v1 or v2. These are production-ready, widely adopted, and will be supported for many releases. Stable APIs are the recommended choice for all production workloads. Once an API reaches stable status, it follows a strict deprecation policy before any removal.

Understanding these levels helps you assess the risk of using different API versions in your deployments.

---

### Slide 4: API Groups and Versions (1 min)
**[03:00-04:00]**

Kubernetes organizes APIs into groups to manage related resources together. Understanding the structure helps you read manifests and troubleshoot issues.

The **apiVersion** field in YAML has the format group slash version. For example, apps/v1 means the apps group, version 1. Some examples:
- apps/v1 for Deployments, StatefulSets, DaemonSets
- batch/v1 for Jobs and CronJobs
- networking.k8s.io/v1 for Ingress
- policy/v1 for PodDisruptionBudget

The **core group** is special - it has no group name in the apiVersion field. You just see v1 for Pods, Services, ConfigMaps, and other core resources.

Cloud providers and third-party tools can add custom API groups. For example, cert-manager.io/v1 for certificate management resources.

When you see an error about API versions, understanding this structure helps you quickly identify which resource and version is affected.

---

### Slide 5: Deprecation Policy and Timeline (1 min)
**[04:00-05:00]**

Kubernetes follows a formal deprecation policy to give users time to migrate before APIs are removed.

For **stable APIs** (v1, v2, etc.), deprecated versions are supported for 12 months or 3 releases, whichever is longer. This gives you ample time to update your manifests.

For **beta APIs** (v1beta1, v1beta2), the support window is 9 months or 3 releases. This shorter timeline reflects that beta APIs are not considered fully stable.

For **alpha APIs** (v1alpha1, v1alpha2), there's no guaranteed support timeline. They can be removed in any release. This is why alpha APIs should never be used in production.

When an API version is deprecated, Kubernetes announces it in release notes. The old version continues working during the deprecation window, giving you time to migrate. After the deprecation period, the API version is removed and manifests using it will fail.

The key takeaway: always monitor release notes before upgrading your cluster, and proactively migrate away from deprecated APIs.

---

### Slide 6: Common Deprecated APIs (Historical Reference) (1 min)
**[05:00-06:00]**

Let's look at some historically significant API deprecations that affected many users. Understanding these helps you recognize deprecation patterns.

**Kubernetes 1.16** removed extensions/v1beta1 for Deployments, ReplicaSets, and DaemonSets. Users had to migrate to apps/v1. This was a major change that broke many clusters during upgrades.

**Kubernetes 1.22** removed extensions/v1beta1 and networking.k8s.io/v1beta1 for Ingress. The stable networking.k8s.io/v1 became the only option. The v1 Ingress also changed its schema, requiring updates to pathType and other fields.

**Kubernetes 1.25** removed batch/v1beta1 for CronJob and policy/v1beta1 for PodDisruptionBudget. Users had to migrate to batch/v1 and policy/v1 respectively.

**Kubernetes 1.25** also completely removed PodSecurityPolicy, replacing it with Pod Security Standards. This was a fundamental shift in security policy enforcement.

These historical changes teach us an important lesson: major deprecations happen regularly, and you must stay current with your API versions.

---

### Slide 7: Discovering API Versions in Your Cluster (1 min)
**[06:00-07:00]**

How do you know which API versions your cluster supports? Kubectl provides several commands to discover this information.

The **kubectl api-versions** command lists all API versions available in your cluster. You'll see entries like apps/v1, batch/v1, networking.k8s.io/v1. This shows what the cluster can accept.

The **kubectl api-resources** command is even more useful. It shows every resource type, its API version, whether it's namespaced, and its short name. For example, you'll see that deployments use apps/v1, are namespaced, and have the short name deploy.

To find a specific resource's API version, you can grep the output:
kubectl api-resources | grep ingress

To check what API version a running resource is using, use kubectl get with output YAML or JSON:
kubectl get deployment myapp -o yaml | grep apiVersion

For understanding the structure of an API, kubectl explain is invaluable:
kubectl explain ingress

These commands are essential for CKAD exam success and day-to-day Kubernetes work.

---

### Slide 8: Identifying Deprecated APIs in Your Resources (1 min)
**[07:00-08:00]**

Before upgrading a cluster, you need to identify which of your resources use deprecated APIs. Kubernetes provides warnings, and several tools can help.

When you **kubectl apply** a manifest with a deprecated API, kubectl shows a warning message. For example: "Warning: extensions/v1beta1 Deployment is deprecated in v1.9+, unavailable in v1.16+". Pay attention to these warnings.

You can scan all resources in your cluster to find their API versions:
kubectl get all --all-namespaces -o json | grep apiVersion

However, this only shows what's currently deployed. Your Git repository might have manifests using deprecated APIs that haven't been applied yet.

Several open-source tools help identify deprecated APIs:
- **kubent** (Kubernetes No Trouble) scans your cluster for deprecated APIs
- **Pluto** detects deprecated API versions in files and Helm charts
- **kubectl-convert** helps migrate manifests to newer versions

The **Kubernetes deprecation guide** in the official documentation lists all deprecated APIs by version. Check this before any cluster upgrade.

Being proactive about identifying deprecated APIs prevents painful surprises during upgrades.

---

### Slide 9: The kubectl convert Tool (1 min)
**[08:00-09:00]**

The kubectl convert plugin helps you migrate YAML manifests to newer API versions. This tool is essential for managing API deprecations.

kubectl convert is a separate plugin, not included in the standard kubectl binary. You need to install it separately using your package manager or by downloading from the Kubernetes release page.

The basic usage is:
kubectl convert -f old-manifest.yaml --output-version apps/v1

This reads the old manifest and outputs the converted version using the specified API version. You can redirect the output to a new file or pipe it directly to kubectl apply.

Important note: kubectl convert handles structural changes in the API, not just version numbers. For example, when converting Ingress from networking.k8s.io/v1beta1 to networking.k8s.io/v1, it updates the schema changes like adding pathType fields.

However, kubectl convert has limitations. It can't always automatically convert complex changes, especially when significant schema modifications occurred. Always review the converted YAML and test it before applying to production.

For the CKAD exam, you should understand what kubectl convert does and know the basic syntax, even if you don't use it extensively.

---

### Slide 10: Migration Strategies and Best Practices (1 min)
**[09:00-10:00]**

Let's discuss strategies for successfully managing API migrations in real-world environments.

**Strategy 1: Proactive monitoring**. Don't wait for cluster upgrades to discover deprecated APIs. Regularly scan your cluster and manifests using tools like kubent or Pluto. Make API updates part of your routine maintenance.

**Strategy 2: Test before production**. Always test API migrations in a development or staging environment before touching production. Some API changes involve schema modifications that might break your workflows.

**Strategy 3: Update source of truth**. If you use GitOps or store manifests in Git, update those source files, not just the running cluster. Otherwise, the next deployment will reintroduce the old API version.

**Strategy 4: Gradual migration**. For large deployments, migrate applications incrementally rather than all at once. This reduces risk and makes troubleshooting easier.

**Strategy 5: Use stable APIs**. When deploying new applications, always use stable API versions (v1, v2), not beta versions. This minimizes future migration work.

**Best practice for CKAD**: Always check the Kubernetes deprecation guide before cluster upgrades. Know how to use kubectl api-resources, kubectl convert, and kubectl explain. Practice identifying and fixing deprecated APIs under time pressure.

---

### Slide 11: Summary and Key Takeaways (1 min)
**[10:00-11:00]**

Let's summarize the key concepts about Kubernetes API versions and deprecations.

**API maturity levels**: Alpha is experimental and unstable, beta is tested but may change, stable is production-ready and supported long-term. Always prefer stable APIs for production workloads.

**Deprecation timeline**: Stable APIs get 12 months or 3 releases of support, beta gets 9 months or 3 releases, alpha has no guarantees. Plan migrations well in advance.

**Discovery commands**: kubectl api-versions shows available versions, kubectl api-resources shows resource details, kubectl explain provides documentation. Master these for the CKAD exam.

**Migration tools**: kubectl convert helps migrate manifests, kubent and Pluto scan for deprecated APIs. Use these proactively before cluster upgrades.

**Best practices**: Monitor deprecation warnings, test migrations in non-production first, update source of truth in Git, and always use stable APIs for new deployments.

For CKAD exam success, know how to identify deprecated APIs using kubectl commands, understand the difference between alpha, beta, and stable, and practice converting manifests to newer versions.

Thank you for following along. The next session will provide hands-on practice with these concepts.
