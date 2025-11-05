# Security Contexts - CKAD Exam Preparation
## Narration Script for Exam-Focused Training
**Duration:** 20-25 minutes

---

## Introduction (0:00 - 1:00)

"Welcome to CKAD exam preparation for Security Contexts. Security is a major focus in the CKAD exam, and SecurityContext questions appear frequently."

"What you'll face in the exam:
- Add security context to existing Deployments
- Make containers run as non-root
- Implement read-only filesystems
- Manage capabilities
- Debug security-related Pod failures
- Combine multiple security features"

"Time pressure is real:
- Security questions: 4-6 minutes each
- Must understand the YAML structure perfectly
- Need to know common patterns by heart
- Debugging is often required"

**Setup:**

---

## Section 1: Essential SecurityContext Patterns (1:00 - 5:00)

### Pattern 1: Basic Non-Root (1:00 - 2:00)

"The most common exam requirement: make a Pod run as non-root."

**Quick YAML snippet to memorize:**

"Two lines. That's it. Memorize this exact format."

**Where to place it:**

**Exam tip:** "If the question doesn't specify, use Pod level - it's safer and affects all containers."

### Pattern 2: Read-Only with Temp Volume (2:00 - 3:30)

"Second most common: read-only filesystem with /tmp volume."

**Memorize this pattern:**

**Fast typing tip:**

### Pattern 3: Drop All Capabilities (3:30 - 4:30)

"Third pattern: minimal capabilities."

"Or if you need to bind to port 80:"

**Exam scenario:** "Configure nginx to run on port 80 as non-root user."

**Solution components:**
- runAsUser: 101 (nginx user)
- runAsNonRoot: true
- capabilities: drop ALL, add NET_BIND_SERVICE
- readOnlyRootFilesystem: true (best practice)
- Volumes for /var/cache/nginx and /var/run

### Pattern 4: Complete Secure Baseline (4:30 - 5:00)

"The gold standard - memorize this for any 'make it secure' question:"

"Practice typing this from memory. You should be able to write it in under 60 seconds."

---

## Section 2: Common Exam Scenarios (5:00 - 10:00)

### Scenario 1: Modify Existing Deployment (5:00 - 7:00)

"Very common: 'Add a security context to this deployment to run as non-root user 1000.'"

**Fastest approach:**

**Time-saving edit technique:**

In vi, search for  under template:

"Two minutes max for this task if you're practiced."

### Scenario 2: Debug Security Failures (7:00 - 9:00)

"Another common scenario: 'A Pod won't start. Fix the security configuration.'"

**Systematic debugging:**

**Common issues and fixes:**

**Issue 1: Image runs as root, runAsNonRoot is true**

Fix: Add runAsUser

**Issue 2: Read-only filesystem, app needs /tmp**

Fix: Add emptyDir volume for /tmp

**Issue 3: Can't bind to port 80**

Fix: Add NET_BIND_SERVICE capability

### Scenario 3: Secure an Existing App (9:00 - 10:00)

"Comprehensive question: 'Make this deployment production-ready with security best practices.'"

**Checklist approach (in order):**

1. Add runAsUser and runAsNonRoot
2. Add allowPrivilegeEscalation: false
3. Add readOnlyRootFilesystem: true
4. Identify needed writable paths, add volumes
5. Add capabilities: drop ALL
6. Add specific capabilities if needed
7. Add seccompProfile: RuntimeDefault
8. Verify with kubectl apply

"Practice this checklist until it's automatic. In the exam, you can quickly verify you haven't missed anything."

---

## Section 3: Field-Level Details (10:00 - 14:00)

### Pod-Level vs Container-Level (10:00 - 11:00)

"Understanding the difference is crucial for the exam."

**Pod-level only:**
- fsGroup
- fsGroupChangePolicy
- supplementalGroups
- sysctls

**Container-level only:**
- capabilities
- privileged
- readOnlyRootFilesystem

**Both levels:**
- runAsUser
- runAsGroup
- runAsNonRoot
- seLinuxOptions
- seccompProfile

**Override behavior:**

### Capabilities Quick Reference (11:00 - 12:00)

"Know these for the exam:"

| Capability | When You Need It |
|------------|------------------|
| NET_BIND_SERVICE | Web server on port 80/443 |
| NET_ADMIN | Network configuration tools |
| SYS_TIME | Time synchronization |
| CHOWN | Change file ownership |
| DAC_OVERRIDE | Override file permissions |

**Syntax (memorize exactly):**

"Note: capabilities is an array, even for one item!"

### Common Volume Paths (12:00 - 13:00)

"When adding readOnlyRootFilesystem, these paths commonly need volumes:"

**nginx:**
- /var/cache/nginx
- /var/run

**Most apps:**
- /tmp
- /var/tmp

**Custom apps:**
- Application-specific cache directory
- Log directory if logging to filesystem

**Quick addition:**

### User and Group IDs (13:00 - 14:00)

"Common user IDs in container images:"

| Image | User ID | Notes |
|-------|---------|-------|
| nginx | 101 | nginx user |
| redis | 999 | redis user |
| postgres | 999 | postgres user |
| node | 1000 | node user |

**How to find the user in an image:**

"In the exam, if the question doesn't specify a user ID, 1000 is safe for most cases."

---

## Section 4: Speed Techniques (14:00 - 17:00)

### Technique 1: YAML Templates (14:00 - 15:00)

"Create reusable snippets before the exam."

**Basic non-root template:**

**Read-only template:**

**Store these in a practice document. During the exam, you can reference your notes (if allowed) or have them memorized.**

### Technique 2: kubectl explain (15:00 - 16:00)

"kubectl explain is your friend in the exam:"

"Don't waste time memorizing every field. Use explain to verify syntax during the exam."

### Technique 3: Partial YAML Edits (16:00 - 17:00)

"You don't always need complete YAML files."

**kubectl patch for quick changes:**

**Or use kubectl set (for supported fields):**

"Patch is fast but error-prone. Edit is slower but more forgiving. Choose based on your comfort level."

---

## Section 5: Practice Exercises (17:00 - 23:00)

### Exercise 1: Quick Non-Root Conversion (17:00 - 18:00)

"Timed exercise - 2 minutes:"

**Task:** "A deployment named 'webapp' exists with nginx:alpine. Modify it to run as non-root user 1000 and prevent privilege escalation."

**Timer starts...**

<details>
<summary>Solution</summary>

</details>

### Exercise 2: Read-Only Filesystem (18:00 - 19:30)

"Timed exercise - 3 minutes:"

**Task:** "Create a Pod named 'secure-app' with nginx:alpine that has:
- Read-only root filesystem
- Non-root user (nginx UID 101)
- Writable /tmp and /var/cache/nginx"

**Timer starts...**

<details>
<summary>Solution</summary>

</details>

### Exercise 3: Capabilities Management (19:30 - 21:00)

"Timed exercise - 3 minutes:"

**Task:** "Create a Pod 'web-server' with nginx that:
- Runs as user 101
- Drops all capabilities
- Adds only NET_BIND_SERVICE
- Has read-only root filesystem with /var/cache/nginx and /var/run writable"

**Timer starts...**

<details>
<summary>Solution</summary>

</details>

### Exercise 4: Debug Security Failure (21:00 - 22:30)

"Timed exercise - 3 minutes:"

**Setup:**

**Task:** "This Pod won't start. Debug and fix it."

**Timer starts...**

<details>
<summary>Solution</summary>

</details>

### Exercise 5: Complete Secure Deployment (22:30 - 23:00)

"Timed exercise - 4 minutes:"

**Task:** "Create a Deployment 'secure-web' with 2 replicas of nginx that implements all security best practices:
- Non-root (user 101)
- Read-only filesystem
- No privilege escalation
- Drop all capabilities, add NET_BIND_SERVICE
- RuntimeDefault seccomp
- Necessary writable volumes"

**I'll leave this as homework. Check the solution in the lab materials.**

---

## Section 6: Exam Strategy (23:00 - 25:00)

### Time Management (23:00 - 23:45)

"Security questions typically take 4-6 minutes:"
- Simple non-root: 2 minutes
- Read-only filesystem: 3-4 minutes
- Full security hardening: 5-6 minutes
- Debug security failure: 3-5 minutes

"Budget accordingly. Don't spend more than 8 minutes on any single question."

### Verification Checklist (23:45 - 24:15)

"After making security changes, always verify:"

"These four checks take 30 seconds and prevent mistakes."

### Common Exam Mistakes (24:15 - 25:00)

"Avoid these pitfalls:"

1. ✗ Forgetting runAsUser when runAsNonRoot is true
2. ✗ Not adding volumes with readOnlyRootFilesystem
3. ✗ Wrong YAML indentation for securityContext
4. ✗ Adding securityContext at wrong level (Pod vs Container)
5. ✗ Forgetting to verify Pod actually starts
6. ✗ Not using allowPrivilegeEscalation: false
7. ✗ Wrong capabilities syntax (it's an array!)
8. ✗ Spending too long on one question

---

## Final Review (25:00)

### Security Context Checklist for CKAD

"Before exam day, ensure you can:"

- [ ] Write basic non-root security context from memory (1 minute)
- [ ] Add read-only filesystem with /tmp volume (2 minutes)
- [ ] Drop all capabilities and add specific ones (1 minute)
- [ ] Debug common security-related Pod failures (3 minutes)
- [ ] Edit existing Deployments to add security (2 minutes)
- [ ] Combine multiple security features correctly (4 minutes)
- [ ] Use kubectl explain to verify syntax (30 seconds)
- [ ] Verify Pods actually work after changes (30 seconds)

### Key Syntax to Memorize

"Practice writing this until you can do it perfectly in 60 seconds."

---

## Closing Advice

"Security Contexts are one of the most testable topics in CKAD because:
- They're universally applicable
- They combine multiple concepts
- They require both knowledge and hands-on skills
- They're essential for production"

"Three keys to success:

1. **Memorize the patterns** - Don't waste time looking up basic syntax
2. **Practice the workflow** - Get your muscle memory trained
3. **Debug systematically** - Follow your checklist every time

You're now prepared for SecurityContext questions on the CKAD exam. Keep practicing these exercises until they're second nature. Good luck!"

---

## Additional Resources

**Practice more:**
- Secure 10 different applications with various requirements
- Debug 5 broken security configurations in under 15 minutes
- Write complete secure Pod specs from memory
- Convert insecure Deployments to secure ones quickly

**Study references:**
- Official docs: kubernetes.io/docs/tasks/configure-pod-container/security-context/
- Pod Security Standards: kubernetes.io/docs/concepts/security/pod-security-standards/
- Linux capabilities: man7.org/linux/man-pages/man7/capabilities.7.html
- kubectl explain: Your best friend during the exam!
