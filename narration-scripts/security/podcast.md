# Security - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening: Security in Kubernetes (1 min)

Welcome to this deep dive on Kubernetes security. This is a critical topic for the CKAD exam, representing a substantial portion of the "Application Environment, Configuration and Security" domain which accounts for 25% of the exam. More importantly, security is fundamental to running production workloads safely.

Kubernetes security operates on multiple layers - from cluster-level policies down to individual container configurations. Today we'll focus on application-level security, particularly Pod security contexts, which are directly relevant to the CKAD exam and your daily work as a Kubernetes developer.

By default, containers run with significant privileges that create security risks. They might run as root, have access to host resources, or possess Linux capabilities they don't need. Security contexts let you lock down these permissions, following the principle of least privilege - granting only the minimum access required for the application to function.

We'll cover security contexts at both Pod and container levels, Linux capabilities, running as non-root users, filesystem permissions, Pod Security Standards, and practical patterns for securing applications on the CKAD exam.

---

## Understanding Security Contexts (2 min)

Security contexts define privilege and access control settings for Pods and containers. Think of them as the security policy that governs how containers interact with the host system and each other.

Security contexts can be specified at two levels: the Pod level and the container level. Pod-level security contexts apply to all containers in the Pod, establishing baseline security settings. Container-level security contexts override Pod-level settings for specific containers, allowing fine-grained control. This two-level hierarchy gives you flexibility - set secure defaults at the Pod level, then make exceptions for specific containers that need different permissions.

The most important security context fields you'll encounter include runAsUser and runAsGroup, which specify the user ID and group ID the container process runs as. By default, many container images run as root, user ID zero, which is dangerous. Setting runAsUser to a non-root ID is a fundamental security practice.

The runAsNonRoot field is a boolean that validates the container is not running as root. If set to true and the container tries to run as root, Kubernetes blocks it from starting. This provides enforcement, not just configuration.

The fsGroup field sets the group ownership for mounted volumes. This is crucial for applications that need to write to persistent storage - without the correct fsGroup, the application might not have permission to access its data.

The readOnlyRootFilesystem field makes the container's root filesystem read-only, preventing any writes to the container filesystem. This dramatically reduces the attack surface - even if an attacker compromises the container, they can't install tools or modify system files. Applications that need to write data can use volume mounts for specific directories.

---

## Running as Non-Root Users (2 min)

Running containers as non-root users is one of the most effective security practices, yet it's often overlooked because many base images default to root for convenience.

Why does this matter? If a container runs as root and an attacker exploits a vulnerability, they have root privileges inside the container. While container isolation provides some protection, running as root increases risk significantly. An attacker might escape the container, access sensitive host resources, or exploit kernel vulnerabilities.

Setting runAsUser to a non-root ID solves this. For example, runAsUser: 1000 runs the container as user ID 1000. The actual username doesn't matter - only the numeric ID. Many container images include a non-root user you can specify, or you can build images that create appropriate users.

The challenge is that many applications expect to run as root and might fail when run as non-root. They might try to bind to privileged ports below 1024, write to system directories, or access files they don't own. This is where you need to test your applications. Use runAsNonRoot: true to enforce non-root execution - if the container tries to run as root, it won't start, giving you immediate feedback.

For the CKAD exam, you'll encounter scenarios requiring non-root execution. Practice adding runAsUser and runAsNonRoot fields to Pod specs. Know how to troubleshoot permission errors that result from running as non-root, typically involving fsGroup for volume permissions or readOnlyRootFilesystem with specific writable volume mounts.

---

## Linux Capabilities (2 min)

Linux capabilities break down the monolithic root privilege into fine-grained permissions. Instead of being root or not-root, you can grant specific capabilities needed for particular tasks.

For example, the NET_BIND_SERVICE capability allows binding to ports below 1024 without being root. The CHOWN capability allows changing file ownership. The SYS_TIME capability allows setting the system clock. There are dozens of capabilities covering different privileged operations.

In Kubernetes security contexts, you work with capabilities through two fields: add for granting additional capabilities and drop for removing capabilities. By default, containers have a set of capabilities that Docker and Kubernetes grant. Best practice is dropping all capabilities you don't need, then adding back only required ones.

A common pattern is: capabilities drop ALL to remove all default capabilities, then capabilities add with specific ones like NET_BIND_SERVICE if needed. This follows the principle of least privilege - start with nothing, add only what's necessary.

For the CKAD exam, understand that capabilities are container-level settings, not Pod-level. You might see questions about running services that need to bind to port 80 without running as root - the solution is setting runAsUser to non-root and adding NET_BIND_SERVICE capability.

The privileged field is the opposite of capability management - it grants all capabilities and removes most security restrictions. Setting privileged: true gives the container nearly unrestricted access to the host. Use this only when absolutely necessary, like for system-level tools or container runtimes. For the exam, if you see privileged containers in a question about security hardening, that's likely what needs to be fixed.

---

## Filesystem Security (2 min)

Controlling filesystem access is crucial for container security. Two key settings manage this: readOnlyRootFilesystem and fsGroup.

Setting readOnlyRootFilesystem: true makes the container's root filesystem immutable. The container can read files but cannot write, modify, or delete anything. This prevents attackers from persisting in the container, installing tools, or modifying executables. It's a powerful security measure.

However, most applications need to write somewhere - logs, temporary files, cache data, or application state. The solution is mounting specific directories as writable volumes. For example, mount an emptyDir volume to /tmp for temporary files, or a PersistentVolume to /data for application state. These volumes are writable even when the root filesystem is read-only.

The fsGroup field solves permission issues with mounted volumes. When you mount a volume, the files might have ownership and permissions that your container can't access. Setting fsGroup to a specific group ID causes Kubernetes to change the group ownership of all files in the volume to that ID, and ensure they're group-writable. This lets your non-root container access the data.

A common pattern combines these: runAsUser: 1000 to run as non-root, runAsNonRoot: true to enforce it, fsGroup: 1000 to ensure volume access, and readOnlyRootFilesystem: true with specific writable volume mounts. This creates a secure, locked-down container that can still function properly.

For the CKAD exam, practice creating Pods with read-only root filesystems and appropriate volume mounts. Understand how to troubleshoot permission denied errors by adjusting runAsUser, fsGroup, and volume permissions.

---

## Pod Security Standards (3 min)

Pod Security Standards, often abbreviated PSS, provide a modern approach to enforcing Pod security policies across your cluster. They replaced the deprecated PodSecurityPolicy mechanism.

There are three standard levels: Privileged, Baseline, and Restricted. Privileged is unrestricted - it allows everything. This is the default if you don't configure any Pod Security. It's appropriate for trusted system components but not for general application workloads.

Baseline is minimally restrictive, preventing known privilege escalations. It blocks several dangerous configurations: hostNetwork, hostPID, and hostIPC are not allowed, preventing containers from sharing host namespaces. Privileged containers are blocked. HostPath volumes cannot be used, preventing direct host filesystem access. You can't add dangerous capabilities beyond a safe default set. This level is appropriate for most applications that don't require special privileges.

Restricted is heavily restrictive, implementing Pod hardening best practices. Everything from Baseline applies, plus additional requirements: containers must run as non-root, all capabilities must be dropped, seccomp profiles must be set to Runtime/Default or Localhost, and privilege escalation must be prevented with allowPrivilegeEscalation: false. This is appropriate for security-critical applications.

Pod Security Standards are enforced at the namespace level using labels. For example, the label pod-security.kubernetes.io/enforce=baseline tells Kubernetes to enforce Baseline security for all Pods in that namespace.

There are three modes of operation: enforce mode rejects Pods that violate the standard, preventing them from being created. Audit mode allows Pods but logs violations for review. Warn mode allows Pods but shows warnings to users. You can use different modes simultaneously - for example, enforce Baseline while warning about Restricted violations, allowing gradual hardening.

For the CKAD exam, understand how to recognize Pod Security Standard violations. Common errors include: "violates PodSecurity baseline: hostNetwork=true" or "violates PodSecurity restricted: runAsNonRoot != true". The solution is modifying the Pod security context to meet the required standard.

---

## Practical Security Patterns (2 min)

Let me walk you through common security patterns you'll implement in real-world Kubernetes and on the CKAD exam.

Pattern one: basic application hardening. Set runAsNonRoot: true and runAsUser to a specific non-root ID like 1000. Set readOnlyRootFilesystem: true. Mount an emptyDir volume to /tmp for temporary files. This works for most stateless applications and provides strong baseline security.

Pattern two: application with persistent data. Add fsGroup: 1000 to ensure the application can access mounted volumes. Mount a PersistentVolume to your data directory. The combination of runAsUser, fsGroup, and readOnlyRootFilesystem with specific writable mounts provides both security and functionality.

Pattern three: web server on privileged port. Set runAsUser: 1000 for non-root execution. Drop all capabilities with drop: ["ALL"]. Add back only NET_BIND_SERVICE capability. Now your application can bind to port 80 or 443 without running as root.

Pattern four: complying with Restricted Pod Security Standard. Set runAsNonRoot: true. Drop all capabilities. Set allowPrivilegeEscalation: false. Set seccompProfile to type: RuntimeDefault. Set readOnlyRootFilesystem: true with appropriate volume mounts. This passes all Restricted checks.

Pattern five: security troubleshooting. If a Pod won't start with a security context error, describe the Pod and check events. Look for messages about user IDs, capabilities, or Pod Security violations. Common issues: the container image expects to run as root but runAsNonRoot blocks it; the application can't write because of readOnlyRootFilesystem; volume permissions don't match runAsUser; or the namespace enforces Pod Security Standards that the Pod violates.

---

## SELinux and AppArmor (1 min)

SELinux and AppArmor are Linux security modules that provide mandatory access control. They're more advanced than security contexts but you should know they exist for the CKAD exam.

SELinux uses labels to control access. You can set SELinux options in the security context, like seLinuxOptions with level, role, type, and user fields. SELinux is common in Red Hat and CentOS-based environments.

AppArmor uses profiles to restrict what programs can do. You apply AppArmor profiles to containers using annotations, like container.apparmor.security.beta.kubernetes.io/container-name: localhost/profile-name. AppArmor is common in Ubuntu and Debian-based environments.

For the CKAD exam, you probably won't need to configure these from scratch, but you should recognize them if they appear in existing configurations. Understand they provide additional security layers beyond basic security contexts.

---

## Seccomp Profiles (1 min)

Seccomp, which stands for secure computing mode, restricts which system calls a container can make. System calls are how programs interact with the Linux kernel. By limiting available system calls, you reduce the attack surface.

In security contexts, you set seccomp profiles with seccompProfile. The most common setting is type: RuntimeDefault, which applies the container runtime's default seccomp profile. This blocks potentially dangerous system calls while allowing normal application operations.

You can also specify type: Localhost with localhostProfile pointing to a custom seccomp profile file on the node. This provides fine-grained control but requires managing profile files across your cluster.

The Restricted Pod Security Standard requires seccomp profiles to be set. If you're aiming for Restricted compliance, add seccompProfile with type: RuntimeDefault to your security context.

For the CKAD exam, know how to set seccomp profiles and recognize when they're required for Pod Security Standards compliance.

---

## CKAD Exam Scenarios (2 min)

Let me walk you through typical exam scenarios involving security.

Scenario one: "Configure the Pod to run as non-root with user ID 1000". Your solution: add securityContext at Pod level with runAsUser: 1000 and runAsNonRoot: true.

Scenario two: "The namespace enforces Baseline Pod Security. Fix the Pod so it can run". Check for violations: remove hostNetwork, hostPID, or hostIPC; remove privileged: true; remove dangerous capabilities. Apply the corrected spec.

Scenario three: "Make the container filesystem read-only while allowing the application to write logs to /var/log". Your solution: set readOnlyRootFilesystem: true, then mount an emptyDir volume to /var/log.

Scenario four: "The application needs to bind to port 443 but should not run as root". Your solution: set runAsUser to non-root, drop all capabilities, add NET_BIND_SERVICE capability.

Scenario five: "The Pod fails to start with 'violates PodSecurity restricted: must set runAsNonRoot=true'". Your solution: add runAsNonRoot: true to the security context, ensure runAsUser is set to non-zero, drop all capabilities, set seccompProfile to RuntimeDefault, and prevent privilege escalation.

For exam speed, practice adding security contexts to Pod specs quickly. Know the field names and nesting - securityContext at Pod level applies to all containers, securityContext at container level overrides Pod settings. Practice reading error messages and identifying which security field needs adjustment.

---

## Summary and Key Takeaways (1 min)

Let's summarize the critical security concepts for CKAD success.

Security contexts control privilege and access for Pods and containers. Set them at Pod level for defaults and container level for overrides. Always run as non-root when possible - use runAsUser with a non-zero ID and runAsNonRoot: true for enforcement.

Manage capabilities explicitly - drop all, then add only what's needed. Use readOnlyRootFilesystem with specific writable volume mounts to prevent filesystem modifications. Set fsGroup to ensure proper volume permissions for non-root users.

Pod Security Standards enforce security policies at the namespace level with three levels: Privileged for unrestricted, Baseline for basic security, and Restricted for hardened workloads. Violations prevent Pod creation in enforce mode.

For exam success: memorize security context field names and structure, practice adding non-root user configurations, know how to add capabilities and make filesystems read-only, understand Pod Security Standard violations and how to fix them, and practice troubleshooting permission errors related to user IDs and volume access.

Security is non-negotiable in production Kubernetes. Understanding these concepts not only helps you pass the CKAD exam but makes you a more effective and responsible Kubernetes developer.

Thank you for listening. Good luck with your CKAD preparation!
