# Security Contexts - Practical Exercises
## Narration Script for Hands-On Demonstration
**Duration:** 15-18 minutes

---

## Setup and Introduction (0:00 - 0:30)

"Welcome to the practical exercises for Kubernetes Security Contexts. We'll work through examples that demonstrate the security concepts we covered, from basic non-root execution to complex capability management."

**Preparation:**


"Let's start by seeing the problem: containers running as root by default."

---

## Exercise 1: Understanding the Default Risk (0:30 - 2:30)

### The Insecure Default (0:30 - 1:30)

"First, let's create a Pod without any security context and see what user it runs as:"


"Output: 'root'. The container is running as the root user!"

"Let's see more details:"


"This shows UID 0 (root), GID 0 (root), and full group memberships. If an attacker compromises this container, they have root privileges."

### What This Means (1:30 - 2:30)

"Let's demonstrate what a root user can do:"


"All of these succeed because we're root. In a real attack, this could mean:
- Installing malware
- Modifying application code
- Creating backdoors
- Accessing secrets"

"Let's clean up and do it right:"


---

## Exercise 2: Pod-Level Security Context (2:30 - 5:00)

### Implementing Non-Root Execution (2:30 - 3:30)

"Now let's create a Pod with security settings at the Pod level:"


"Notice the `securityContext` at the Pod spec level:
- runAsUser: 1000 - runs as UID 1000
- runAsGroup: 3000 - primary GID 3000
- fsGroup: 2000 - volume group ownership"


"Output shows UID 1000, GID 3000, with groups including 2000. No more root!"

### Testing Restrictions (3:30 - 5:00)

"Now let's see what this user can and cannot do:"


"This might fail with 'whoami: cannot find name for user ID 1000'. That's fine - the user exists but doesn't have a name in /etc/passwd. The ID command shows it's working."

"Try to perform a privileged operation:"


"It fails! Non-root users can't install packages. This is exactly what we want - limiting the blast radius of a compromise."

**Key learning:** "Pod-level security context applies to all containers in the Pod. It's a good place to set baseline security."

---

## Exercise 3: Container-Level Security Context (5:00 - 8:00)

### More Restrictive Container Settings (5:00 - 6:00)

"Container-level settings override Pod-level settings and can be more specific:"


"This spec has both Pod and container-level contexts. The container adds:
- readOnlyRootFilesystem: true - makes the filesystem immutable
- allowPrivilegeEscalation: false - prevents escalation"


### Testing Read-Only Filesystem (6:00 - 7:00)

"The read-only filesystem is a powerful security feature:"


"It fails! 'Read-only file system'. The container can't modify anything."

"This means an attacker can't:
- Install malware
- Modify application code
- Create backdoor files
- Persist changes"

### Understanding the Impact (7:00 - 8:00)

"But wait - how do applications work without being able to write?"

"They need specific writable locations for:
- Temporary files (/tmp)
- Cache directories
- Log files
- Runtime state

We'll see how to handle this in the next exercise with volumes."

---

## Exercise 4: Read-Only Filesystem with Writable Volumes (8:00 - 10:30)

### The Problem (8:00 - 8:30)

"Many applications need to write temporary files. Let's see how to allow that while keeping the root filesystem read-only:"


"This spec:
- Sets readOnlyRootFilesystem: true
- Mounts an emptyDir volume at /tmp
- The volume is writable, but the rest of the filesystem is not"

### Testing the Solution (8:30 - 9:30)


"Fails! Read-only filesystem."


"Success! The file is created in /tmp because that's a writable volume."

### Best Practice Pattern (9:30 - 10:30)

"This is the recommended pattern:
1. Set readOnlyRootFilesystem: true
2. Identify paths that need writes
3. Mount emptyDir volumes for those paths
4. Application works normally, filesystem is otherwise immutable"

"Common paths that need volumes:
- /tmp - temporary files
- /var/cache - cache directories
- /var/run - runtime files
- /var/log - if logging to filesystem"

**CKAD tip:** "Practice adding emptyDir volumes quickly. In the exam, you'll often need to make a container read-only and add a /tmp volume."

---

## Exercise 5: Linux Capabilities (10:30 - 13:00)

### Dropping All Capabilities (10:30 - 11:30)

"The most secure approach is to drop all capabilities:"


"The capabilities section:
- drop: [\"ALL\"] - removes all Linux capabilities
- The container has minimal privileges"


"This might fail because we dropped network-related capabilities. The exact behavior depends on how ping is implemented."

### Adding Specific Capabilities (11:30 - 12:30)

"Sometimes you need specific capabilities. Let's see how to add them:"


"This spec:
- Drops ALL capabilities (start secure)
- Adds NET_ADMIN - allows network configuration"


### Understanding the Pattern (12:30 - 13:00)

"The security pattern:
1. Drop ALL capabilities
2. Add ONLY what you need
3. Be specific - don't add more than necessary"

"Common scenarios:
- Web server on port 80: add NET_BIND_SERVICE
- Network tools: add NET_ADMIN
- File ownership changes: add CHOWN
- Time services: add SYS_TIME"

**Exam tip:** "If a question mentions running a web server on port 80 as non-root, you'll need NET_BIND_SERVICE capability."

---

## Exercise 6: Preventing Privilege Escalation (13:00 - 14:30)

### Understanding the Threat (13:00 - 13:45)

"Even with non-root users, some mechanisms could allow privilege escalation:"


"The key setting: allowPrivilegeEscalation: false

This prevents:
- setuid binaries from gaining root
- Process gaining more privileges than its parent
- Exploitation of capability mechanisms"


### Testing the Protection (13:45 - 14:30)


"It fails! The setuid mechanism is blocked."

"This is critical defense-in-depth:
- Even if an attacker finds a setuid binary
- Even if they find a way to execute privileged commands
- They can't escalate beyond their initial privileges"

**Best practice:** "Always set allowPrivilegeEscalation: false when running as non-root. It's a free security improvement with no downsides."

---

## Exercise 7: Filesystem Group Permissions (14:30 - 16:00)

### Understanding fsGroup (14:30 - 15:15)

"When non-root containers need to access volumes, fsGroup sets the group ownership:"


"This spec:
- runAsUser: 1000 - runs as non-root
- fsGroup: 2000 - volumes owned by group 2000
- Volume mounted at /data"


"The /data directory is owned by group 2000. The container is in group 2000, so it can write to it."

### Testing Volume Access (15:15 - 16:00)


"The file is created with group 2000 ownership."

**Use case:** "Multiple containers in a Pod need shared storage. Set fsGroup at the Pod level, and all containers can access the volumes."

---

## Exercise 8: Lab Challenge - Secure Nginx (16:00 - 18:00)

### Understanding Requirements (16:00 - 16:45)

"The lab challenge asks us to create a secure nginx deployment with specific requirements:

1. Must not run as root
2. Read-only root filesystem
3. nginx needs writable /var/cache/nginx and /var/run
4. Drop all capabilities except NET_BIND_SERVICE
5. No privilege escalation
6. Run as user ID 101 (nginx user in the image)"

"This is a realistic CKAD exam question. Let's think through the solution:"

### Solution Approach (16:45 - 17:30)

"We need to combine several security features:"


### Key Decisions (17:30 - 18:00)

"Breaking down the solution:
- runAsUser: 101 - nginx image's non-root user
- runAsNonRoot: true - enforces the requirement
- readOnlyRootFilesystem: true - immutable container
- Two emptyDir volumes - nginx needs to write cache and PID files
- Drop ALL, add NET_BIND_SERVICE - minimal capabilities
- allowPrivilegeEscalation: false - prevent escalation"

"I encourage you to write this YAML yourself. Check the solution.md file for the complete spec."

"Test your deployment:"


---

## Summary and Best Practices (18:00 - 18:30)

### Security Checklist

"For every production Pod, verify:

✓ runAsNonRoot: true - enforce non-root
✓ runAsUser: <non-zero> - explicit UID
✓ readOnlyRootFilesystem: true - immutable container
✓ allowPrivilegeEscalation: false - prevent escalation
✓ capabilities.drop: [\"ALL\"] - minimal capabilities
✓ seccompProfile: RuntimeDefault - system call filtering

Plus:
✓ Resource limits - prevent resource exhaustion
✓ Network policies - restrict network access
✓ Service accounts - proper RBAC"

### Common Mistakes

"Avoid these pitfalls:

✗ Forgetting to add emptyDir volumes with readOnlyRootFilesystem
✗ Not setting allowPrivilegeEscalation: false
✗ Adding unnecessary capabilities
✗ Running as root in production
✗ Using privileged: true without clear justification
✗ Not testing security settings in non-prod first"

---

## Cleanup (18:30)


---

## Transition to CKAD Exam Prep

"Now you've seen SecurityContexts in action. In the CKAD exam prep section, we'll focus on:
- Quickly adding security contexts to existing Pods
- Time-saving techniques for common patterns
- Debugging security-related failures
- Practice exercises under time pressure
- Exam-specific patterns and gotchas

Let's get exam-ready!"
