# Security Contexts - Concept Introduction
## Narration Script for Slideshow Presentation
**Duration:** 10-12 minutes

---

## Slide 1: Introduction (0:00 - 0:45)

**Title: Application Security with SecurityContexts**

Welcome to this session on Kubernetes Security Contexts. Security is often an afterthought in development, but in Kubernetes, it's a critical part of production readiness.

Today we'll explore:
- Why container security matters
- SecurityContext at Pod and container levels
- Running as non-root users
- Linux capabilities and privilege escalation
- Read-only filesystems and immutable containers

This is essential knowledge for the CKAD exam and for running secure production workloads.

**[Transition to next slide]**

---

## Slide 2: The Security Problem (0:45 - 2:00)

**Title: Why Container Security Matters**

By default, containers often run as root. Let's understand why this is dangerous:

**Default behavior:**
- Container processes run as root (UID 0)
- Full access to container filesystem
- Can install packages, modify system files
- If compromised, attacker has root privileges

**Real-world scenario:**
Imagine a web application with a vulnerability. An attacker exploits it and gains shell access. If the container runs as root:
- They can modify application code
- Install malware or crypto miners
- Potentially escape to the host
- Access secrets and sensitive data
- Pivot to other containers

**The solution:** SecurityContexts provide fine-grained control over container privileges, implementing the **principle of least privilege**.

**[Transition to next slide]**

---

## Slide 3: SecurityContext Architecture (2:00 - 3:30)

**Title: Two Levels of Security Control**

Kubernetes provides SecurityContext at two levels:

**1. Pod-level SecurityContext**
- Applied to all containers in the Pod
- Defined in `spec.securityContext`
- Controls user/group IDs, filesystem settings
- Affects volume permissions
- Sets default security posture

**2. Container-level SecurityContext**
- Applied to specific containers
- Defined in `spec.containers[].securityContext`
- Overrides Pod-level settings
- Controls capabilities, privilege escalation
- More granular than Pod-level

**Hierarchy:** Container settings override Pod settings. This allows you to set secure defaults at the Pod level, then make exceptions for specific containers if needed.

**Key principle:** Start with the most restrictive settings at the Pod level, then relax only what's necessary for individual containers.

**[Transition to next slide]**

---

## Slide 4: Running as Non-Root (3:30 - 5:00)

**Title: User and Group Management**

One of the most important security practices is ensuring containers don't run as root.

**Key fields:**

**runAsUser** (Pod or Container level)
- Specifies the User ID (UID) for the container process
- Example: `runAsUser: 1000` runs as UID 1000
- Overrides the USER directive in the Dockerfile

**runAsGroup** (Pod or Container level)
- Specifies the primary Group ID (GID)
- Example: `runAsGroup: 3000`
- Files created by the process have this group ownership

**runAsNonRoot** (Container level only)
- Boolean field, typically `runAsNonRoot: true`
- **Enforces** that the container doesn't run as root
- If the image tries to run as root, the container fails to start
- Acts as a safety check

**fsGroup** (Pod level only)
- Sets group ownership for mounted volumes
- All files in volumes owned by this group
- Allows non-root users to access shared storage

**Example scenario:** Web server needs to read config files from a volume. Set `fsGroup: 2000`, and even though the container runs as UID 1000, it can access the volume because it's in group 2000.

**[Transition to next slide]**

---

## Slide 5: Read-Only Filesystems (5:00 - 6:15)

**Title: Immutable Containers**

A powerful security technique is making the container filesystem read-only.

**readOnlyRootFilesystem: true**

**Benefits:**
- Prevents attackers from modifying application code
- Can't install tools or malware
- Can't create backdoors
- Enforces container immutability
- Aligns with cloud-native principles

**Challenge:** Many applications need to write temporary files.

**Solution:** Mount writable volumes for specific paths:
```yaml
volumes:
  - name: tmp
    emptyDir: {}
  - name: cache
    emptyDir: {}

volumeMounts:
  - name: tmp
    mountPath: /tmp
  - name: cache
    mountPath: /var/cache/app
```

**Pattern:**
1. Set `readOnlyRootFilesystem: true`
2. Identify paths that need writes (logs, cache, temp files)
3. Mount emptyDir volumes for those paths
4. Application works normally, but filesystem is otherwise immutable

**CKAD tip:** This is a common exam requirement. Practice adding emptyDir volumes for /tmp quickly.

**[Transition to next slide]**

---

## Slide 6: Linux Capabilities (6:15 - 8:00)

**Title: Fine-Grained Privilege Control**

Linux capabilities divide root privileges into smaller units. Instead of all-or-nothing root access, you can grant specific capabilities.

**Understanding capabilities:**

Traditional Unix: root has **all** privileges, non-root has limited privileges.

With capabilities: Specific privileges can be granted without full root access.

**Key fields:**

**capabilities.drop**
- Remove capabilities from the container
- Best practice: `drop: ["ALL"]` - start with zero privileges
- Then add only what's needed

**capabilities.add**
- Grant specific capabilities
- Only add the minimum required

**Common capabilities:**

| Capability | What it allows | Example use |
|------------|----------------|-------------|
| NET_ADMIN | Configure network | Change routes, firewall rules |
| NET_BIND_SERVICE | Bind to ports < 1024 | Web server on port 80/443 |
| CHOWN | Change file ownership | Backup tools |
| DAC_OVERRIDE | Bypass file permissions | Administrative tools |
| SYS_TIME | Change system clock | NTP services |
| SETUID/SETGID | Change user/group | Tools that need to switch users |

**Best practice pattern:**
```yaml
securityContext:
  capabilities:
    drop: ["ALL"]
    add: ["NET_BIND_SERVICE"]
```

"Drop everything, add only what's necessary."

**[Transition to next slide]**

---

## Slide 7: Privilege Escalation Prevention (8:00 - 9:00)

**Title: Preventing Privilege Escalation**

Even if a container starts with limited privileges, certain mechanisms could allow it to gain more privileges. We need to prevent this.

**allowPrivilegeEscalation**
- Boolean field (true/false)
- Controls whether a process can gain more privileges than its parent
- Set to `false` to prevent escalation

**How privilege escalation happens:**

**1. setuid binaries**
- Programs with setuid bit set
- Run with owner's privileges instead of caller's
- Example: `/bin/su` runs as root even when called by normal user

**2. File capabilities**
- Capabilities attached to executable files
- Program gains those capabilities when run

**3. Namespace manipulation**
- Using Linux namespaces to gain access

**allowPrivilegeEscalation: false** blocks these mechanisms.

**Critical for CKAD:** When running as non-root, ALWAYS set `allowPrivilegeEscalation: false`. This prevents processes from using setuid binaries or other tricks to gain root privileges.

**[Transition to next slide]**

---

## Slide 8: Privileged Containers (8:00 - 9:30)

**Title: The Nuclear Option**

Privileged containers have almost all the same access as processes running on the host.

**privileged: true**

**What it grants:**
- Access to all host devices (/dev/*)
- Ability to modify kernel parameters
- Mount host filesystems
- Bypass most security constraints
- Essentially root on the host

**Risks:**
- Container escape is much easier
- Can compromise the entire host
- Affects other containers and Pods
- Violates container isolation principles

**When (rarely) needed:**
- System-level monitoring tools (node agents)
- Container runtime management
- Network plugins (CNI)
- Storage plugins (CSI)
- Hardware access requirements

**CKAD perspective:** You should understand what privileged containers are, but in the exam, you'll likely be asked to **avoid** them and use more secure alternatives.

**Best practice:** Treat `privileged: true` as a red flag. There's almost always a better way using specific capabilities.

**[Transition to next slide]**

---

## Slide 9: Filesystem Group (9:30 - 10:30)

**Title: Volume Permission Management**

When multiple containers or Pods need to access shared volumes, you need to manage permissions carefully.

**fsGroup** (Pod-level only)

**What it does:**
- Sets group ownership on mounted volumes
- All containers in the Pod are part of this group
- Files created have this group ownership
- Allows coordinated access to shared storage

**fsGroupChangePolicy**
- `OnRootMismatch` (default): Only change permissions if root directory group mismatches
- `Always`: Always change permissions (slower, more thorough)

**Scenario:** Three containers in a Pod need to read/write shared configuration files:

```yaml
spec:
  securityContext:
    fsGroup: 2000
    runAsUser: 1000
  containers:
    - name: app
      # Runs as UID 1000, GID 2000
    - name: sidecar
      # Also runs as UID 1000, GID 2000
```

Both containers can access the volume because they're in group 2000.

**CKAD tip:** If a question involves shared volumes with non-root containers, you'll likely need fsGroup.

**[Transition to next slide]**

---

## Slide 10: Seccomp Profiles (10:30 - 11:15)

**Title: System Call Filtering**

Seccomp (Secure Computing Mode) restricts which system calls a container can make.

**seccompProfile**

**Types:**

**RuntimeDefault** (recommended)
- Uses the container runtime's default seccomp profile
- Blocks dangerous system calls
- Good balance of security and compatibility
- Works for most applications

**Unconfined**
- No seccomp filtering
- All system calls allowed
- Less secure, more compatible
- Should be avoided

**Localhost**
- Custom seccomp profile
- Stored on the node
- Maximum control and security
- Requires more expertise

**Best practice for CKAD:**
```yaml
securityContext:
  seccompProfile:
    type: RuntimeDefault
```

Simple, secure, and works for almost all applications.

**[Transition to next slide]**

---

## Slide 11: Security Best Practices Summary (11:15 - 12:00)

**Title: Building Secure Containers**

**Essential security baseline:**

```yaml
securityContext:
  # Non-root execution
  runAsNonRoot: true
  runAsUser: 1000

  # Read-only filesystem
  readOnlyRootFilesystem: true

  # Prevent escalation
  allowPrivilegeEscalation: false

  # Drop all capabilities
  capabilities:
    drop: ["ALL"]

  # Use seccomp
  seccompProfile:
    type: RuntimeDefault
```

**Add emptyDir volumes for paths that need writes:**
- /tmp
- /var/cache
- /var/log (if needed)

**DO:**
- Always run as non-root
- Use read-only filesystems when possible
- Drop all capabilities by default
- Prevent privilege escalation
- Use RuntimeDefault seccomp
- Set resource limits (defense in depth)

**DON'T:**
- Run as root
- Use privileged containers
- Add unnecessary capabilities
- Allow privilege escalation
- Skip security contexts

**[End of presentation]**

---

## Summary Points for Q&A

Key takeaways participants should understand:
1. Two levels: Pod-level and container-level SecurityContexts
2. Container settings override Pod settings
3. runAsNonRoot enforces non-root execution
4. readOnlyRootFilesystem creates immutable containers
5. Capabilities provide fine-grained privilege control
6. allowPrivilegeEscalation: false prevents escalation
7. fsGroup manages volume permissions for non-root users
8. Privileged containers should be avoided
9. RuntimeDefault seccomp is the recommended baseline

---

## Transition to Exercises

"Now that we understand SecurityContext concepts, let's see them in action. In the exercises section, we'll:
- Compare root vs non-root containers
- Implement read-only filesystems with writable volumes
- Work with Linux capabilities
- Debug security-related Pod failures
- Build a secure nginx deployment from scratch

Let's make these concepts practical!"
