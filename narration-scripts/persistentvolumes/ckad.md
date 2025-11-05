# PersistentVolumes CKAD Exam Preparation
## Narration Script for Exam-Focused Practice

**Duration**: 25-30 minutes
**Format**: Exam-focused practice scenarios with timing
**Audience**: CKAD exam candidates
**Objective**: Master PVC creation and usage under exam conditions with practical scenarios and troubleshooting

---

## Introduction [0:00-1:30]

Welcome to this CKAD exam preparation session focused on PersistentVolumes and storage. In the CKAD exam, storage questions typically appear under the "Application Environment, Configuration and Security" domain, which represents 25% of the exam.

The good news: storage questions are usually straightforward and can be completed quickly—3 to 6 minutes per question. The challenge is working under time pressure with potential distractions.

Today we'll cover:
- Quick command reference for the exam
- Time-boxed practice scenarios matching exam difficulty
- Common troubleshooting patterns
- Exam-specific tips and pitfalls to avoid
- Speed techniques for creating resources quickly

Before we dive in, make sure you have:
- A working Kubernetes cluster (any distribution works)
- kubectl configured and working
- A text editor (vim, nano, or whatever you're comfortable with in the exam)
- A timer to practice time management

Let's get started.

---

## Quick Reference and Exam Context [1:30-3:30]

**[1:30-2:30] Essential Commands - Commit These to Memory**

In the exam, speed matters. Here are the commands you'll use most:

**Listing Resources**:

**Troubleshooting**:

**Verification**:

**Deletion**:

**[2:30-3:30] Access Modes - Critical for CKAD**

You must know these access modes and their abbreviations:

| Mode | Abbreviation | When to Use |
|------|--------------|-------------|
| **ReadWriteOnce** | RWO | Default choice. Single node read-write. Works with most storage. |
| **ReadOnlyMany** | ROX | Shared read-only data across nodes. Less common. |
| **ReadWriteMany** | RWX | Shared read-write across nodes. Requires NFS or similar. |
| **ReadWriteOncePod** | RWOP | Single Pod exclusive access. Kubernetes 1.22+. |

**Exam tip**: If the question doesn't specify, use ReadWriteOnce. It's supported by all default StorageClasses. ReadWriteMany is a trap—it requires special storage that most clusters don't have by default.

**Critical point**: Access modes are case-sensitive in YAML. "ReadWriteOnce" is correct; "readwriteonce" will fail validation.

---

## Scenario 1: Basic PVC Creation and Pod Mounting [3:30-7:30]

**[3:30-4:00] Scenario Setup**

**Exam Question Simulation**:

"Create a PersistentVolumeClaim named 'app-storage' in the default namespace requesting 500Mi of storage with ReadWriteOnce access mode. Then create a Pod named 'app-pod' using the nginx:alpine image that mounts this PVC at /data. Verify the Pod is running and the volume is mounted."

**Time Target**: 3-4 minutes
**Points**: 4%

Let's tackle this together with exam timing in mind. Start your timer now.

**[4:00-5:30] Solution - Step by Step**

**Step 1: Create the PVC** (60 seconds)

The fastest approach is using kubectl apply with a heredoc:

Immediately check the status:

You should see it either "Bound" or "Pending." If Pending, that's often okay—some provisioners wait for a Pod to claim it.

**Step 2: Create the Pod** (90 seconds)

**Step 3: Verify** (30 seconds)

**[5:30-7:30] Exam Technique Analysis**

**What made this fast:**
1. Using heredoc (<<EOF) instead of creating separate files
2. Typing PVC and Pod specs from memory (practice this!)
3. Immediate verification after each step
4. Not overthinking—the question is straightforward

**Common mistakes to avoid:**
- Typo in volume name—must match between volumes[] and volumeMounts[]
- Forgetting the hyphen before "ReadWriteOnce" in accessModes
- Wrong indentation in YAML (use spaces, not tabs)
- Not verifying before moving to the next question

**Time management tip**: If you finish in 3 minutes, don't second-guess yourself. Mark the question for review and move on. You can always come back if you have time at the end.

---

## Scenario 2: Shared Volume Between Containers [7:30-11:30]

**[7:30-8:00] Scenario Setup**

**Exam Question Simulation**:

"Create a Pod named 'shared-volume-pod' with two containers. The first container named 'writer' should use the busybox image and continuously write timestamps to /data/app.log. The second container named 'reader' should use the busybox image and tail this log file. Both containers should share an EmptyDir volume."

**Time Target**: 4-5 minutes
**Points**: 5%

This tests multi-container Pods and volume sharing—a common exam pattern. Timer starts now.

**[8:00-10:00] Solution with Commentary**

**Verification**:

**[10:00-11:30] Key Learning Points**

**Exam insights:**
- EmptyDir volumes are defined in spec.volumes, not in a separate resource
- Both containers mount the same named volume
- The volume name "shared-data" is referenced in both volumeMounts
- Each container can mount the same volume to different paths if needed

**Why this question matters:**
- Tests understanding of multi-container Pods
- Demonstrates volume sharing within a Pod
- Common pattern: sidecar containers for logging, metrics, or proxying

**Gotcha**: In the command and args syntax, remember to escape the dollar sign:  not , otherwise the date is evaluated when the YAML is created, not when the container runs.

**Speed tip**: Practice writing multi-container Pod specs. They're longer but follow predictable patterns. If you have this memorized, you can type it in 2-3 minutes.

---

## Scenario 3: Troubleshooting Pending PVC [11:30-15:00]

**[11:30-12:00] Scenario Setup**

**Exam Question Simulation**:

"A Pod named 'broken-pod' in the default namespace is not starting. Investigate and fix the issue. The Pod should use an nginx:alpine image with a PVC mounted at /data. Make the Pod run successfully."

You find this Pod already exists:

**Time Target**: 3-4 minutes
**Points**: 4%

This is a troubleshooting scenario. Timer starts now.

**[12:00-13:30] Troubleshooting Process**

**Step 1: Check the Pod** (30 seconds)

Look at the Events section at the bottom. You'll likely see:

This is the most common PVC issue in the exam—the PVC doesn't exist.

**Step 2: Check what PVC the Pod expects** (20 seconds)

Or from the describe output, note the PVC name: "missing-pvc"

**Step 3: Create the missing PVC** (90 seconds)

**Step 4: Verify** (30 seconds)

If the Pod doesn't recover automatically, you might need to delete and recreate it (depends on how long it was stuck).

**[13:30-15:00] Troubleshooting Patterns for CKAD**

**Common PVC Problems in Exam**:

1. **PVC doesn't exist**: Create it with appropriate specs
2. **PVC pending**: Check StorageClass exists and supports requested access mode
3. **Access mode not supported**: Change ReadWriteMany to ReadWriteOnce
4. **Storage request too large**: Reduce the size request
5. **Wrong namespace**: PVCs are namespaced; ensure you're in the right namespace

**Troubleshooting workflow:**

**Time-saving tip**: The describe command is your best friend. 80% of issues are visible in the Events section. Don't waste time checking logs or exec-ing into containers when the issue is at the infrastructure level.

---

## Scenario 4: Multi-Volume Pod [15:00-19:00]

**[15:00-15:30] Scenario Setup**

**Exam Question Simulation**:

"Create a Pod named 'multi-volume-app' with:
- A container using busybox image running: sleep 3600
- A PersistentVolumeClaim named 'db-storage' requesting 1Gi mounted at /data
- An EmptyDir volume mounted at /cache
- An EmptyDir volume mounted at /logs
- A ConfigMap named 'app-config' with key 'config.json' mounted at /config/config.json

Create any necessary resources."

**Time Target**: 5-6 minutes
**Points**: 6%

This tests multiple volume types—a realistic exam scenario. Start your timer.

**[15:30-18:00] Solution - Building It Up**

**Step 1: Create the ConfigMap** (45 seconds)

Alternatively:

**Step 2: Create the PVC** (45 seconds)

**Step 3: Create the Pod** (3 minutes)

**Step 4: Verify** (30 seconds)

**[18:00-19:00] Key Exam Techniques**

**What this tests:**
- Ability to work with multiple volume types simultaneously
- Understanding that different volume types serve different purposes
- Proper YAML structure with multiple volumes and mounts

**Speed technique:**
- Create supporting resources (ConfigMap, PVC) first
- Build Pod spec methodically: containers, then volumeMounts, then volumes
- Each volumeMount references a volume by name
- Volume definitions match the volume type (pvc, emptyDir, configMap)

**Pattern to memorize:**

---

## Scenario 5: Data Persistence Verification [19:00-22:30]

**[19:00-19:30] Scenario Setup**

**Exam Question Simulation**:

"Create a PVC named 'persistent-data' requesting 100Mi. Create a Pod named 'writer-pod' that writes the current date to /data/important.txt. After the Pod writes the data, delete the Pod and create a new Pod named 'reader-pod' that reads and displays the same file. Verify data persisted."

**Time Target**: 4-5 minutes
**Points**: 5%

This explicitly tests your understanding of PVC lifecycle. Timer starts.

**[19:30-21:30] Solution - Demonstrating Persistence**

**Step 1: Create PVC and Writer Pod** (2 minutes)

**Step 2: Verify data was written** (20 seconds)

**Step 3: Delete writer Pod** (10 seconds)

**Step 4: Create reader Pod** (90 seconds)

**Step 5: Verify persistence** (20 seconds)

**[21:30-22:30] Understanding PVC Lifecycle**

**Key concept demonstrated:**
- PVC lifecycle is independent of Pod lifecycle
- Data in a PV persists across Pod deletions
- Multiple Pods can use the same PVC (if access mode allows)
- The same PVC can be used by different Pods over time

**Exam relevance:**
- Confirms you understand persistent vs. ephemeral storage
- Tests ability to work with Pod lifecycle
- Requires proper use of kubectl logs and wait commands

**Critical for CKAD:**
This pattern appears frequently:
1. Create PVC
2. Use in Pod A
3. Delete Pod A
4. Use same PVC in Pod B
5. Verify data persisted

If the data doesn't persist, you used the wrong volume type (probably EmptyDir instead of PVC).

---

## Common Exam Pitfalls and How to Avoid Them [22:30-25:00]

**[22:30-23:30] The Top 5 Mistakes**

**1. PVC in Wrong Namespace**

Mistake:

Solution: Always verify your namespace context:

**2. Access Mode Incompatibility**

Mistake: Requesting ReadWriteMany when StorageClass only supports ReadWriteOnce

Solution:

**3. Forgetting to Wait for PVC Binding**

Mistake: Creating a Pod immediately after PVC without checking if it's bound

Solution:

**4. Volume Name Mismatch**

Mistake:

Solution: Names must match exactly. Copy-paste the volume name to avoid typos.

**5. Case Sensitivity in Access Modes**

Mistake:

Solution: Always use PascalCase: ReadWriteOnce, ReadWriteMany, ReadOnlyMany

**[23:30-25:00] Speed Techniques for the Exam**

**Use YAML Templates**

Create a template file once, reuse for multiple questions:

**Use Dry-Run for Boilerplate**

**Master Vim/Nano Basics**

The exam provides vim and nano. Practice these commands:
- Vim:  (insert),  (save and quit),  (quit without saving)
- Nano:  (save),  (exit)

**Practice Typing Speed**

Time yourself creating a PVC+Pod from scratch:
- Goal: Under 3 minutes
- Practice until you can type common patterns without thinking

**Use kubectl Documentation**

The exam allows access to kubernetes.io. Know how to quickly find:

Copy examples and modify them—don't start from scratch.

---

## Practice Exercise: Timed Challenge [25:00-29:00]

**[25:00-25:30] Final Challenge Setup**

Let's do one comprehensive timed exercise that combines multiple concepts.

**Challenge**: Complete all tasks in 8 minutes total:

1. Create a PVC named 'webapp-storage' requesting 250Mi with ReadWriteOnce access
2. Create a Deployment named 'webapp' with 2 replicas using nginx:alpine
3. Mount the PVC to /usr/share/nginx/html in all Pods
4. Verify both Pods are running and have the volume mounted
5. Delete one Pod and verify the new replacement Pod also has the volume

**Start your timer now—8 minutes on the clock!**

**[25:30-27:30] Solution - No Commentary, Just Speed**

**[27:30-29:00] Performance Review**

**If you completed in:**
- **Under 6 minutes**: Excellent! You're ready for the exam.
- **6-8 minutes**: Good pace. Practice to improve speed.
- **Over 8 minutes**: Keep practicing. Focus on typing speed and knowing patterns by heart.

**Debrief:**
- Did you encounter any errors? Troubleshoot them now.
- Which part took the longest? That's what to practice.
- Could you have verified faster? Learn shortcuts.

**Final preparation steps:**
1. Practice this exercise daily until you consistently finish in under 6 minutes
2. Create your own variations—different images, mount paths, sizes
3. Practice with intentional errors and fix them quickly
4. Work in a terminal-only environment (no autocomplete)

---

## Exam Day Tips and Strategy [29:00-30:00]

**Time Management:**
- Budget 3-5 minutes per storage question
- If stuck after 2 minutes, mark for review and move on
- Come back to difficult questions with remaining time

**Verification Strategy:**
- Always verify resources after creation
- Use  and  liberally
- Check Pod logs if behavior seems wrong

**Resource Cleanup:**
- Exam environment persists between questions
- Clean up resources when done: 
- Prevents confusion and resource conflicts

**Read Questions Carefully:**
- Note the namespace (default? specific?)
- Note exact resource names (case-sensitive)
- Note specific requirements (image versions, mount paths)

**Use Available Resources:**
- Kubernetes documentation is allowed
- Search for examples, don't memorize everything
- Copy-paste examples and modify them

**Stay Calm:**
- Storage questions are usually straightforward
- If a PVC isn't working, it's usually a simple typo or missing resource
- Don't panic—methodically troubleshoot

**Practice Environment:**
- Use a cluster similar to exam (different distros behave slightly differently)
- Practice without autocomplete
- Time yourself on every practice session

---

## Wrap-Up and Next Steps [30:00-31:00]

**Summary:**

Today we covered comprehensive CKAD storage scenarios:
- Basic PVC creation and mounting (3-4 minutes)
- Multi-container shared volumes (4-5 minutes)
- Troubleshooting pending PVCs (3-4 minutes)
- Multi-volume Pods (5-6 minutes)
- Data persistence verification (4-5 minutes)

**Your Preparation Checklist:**

- [ ] Can create PVC from memory in under 60 seconds
- [ ] Can create Pod with PVC mount in under 2 minutes
- [ ] Know all access modes and when to use them
- [ ] Can troubleshoot common PVC issues in under 3 minutes
- [ ] Practiced with EmptyDir, ConfigMap, and PVC volumes
- [ ] Comfortable with multi-container Pods sharing volumes
- [ ] Can verify volume mounts and data persistence
- [ ] Know the kubectl commands for storage resources

**Next Practice Steps:**

1. Work through the official Kubernetes documentation examples
2. Create your own practice scenarios with variations
3. Practice in a terminal-only environment
4. Join study groups and share knowledge
5. Review StatefulSets lab for advanced persistent storage patterns

**Additional Resources:**
- Official CKAD curriculum on CNCF GitHub
- Kubernetes documentation: kubernetes.io/docs/concepts/storage/
- Practice platforms: killer.sh, Katacoda scenarios
- Join CKAD study communities on Slack, Discord

Good luck with your CKAD exam preparation. With consistent practice of these scenarios, you'll be confident and fast when exam day comes.

**Clean up your practice environment:**

Thank you and happy studying!

---

**End of CKAD Exam Prep Session: 25-31 minutes total**

*Timing notes:*
- *Adjust based on audience proficiency level*
- *Advanced students can skip basic explanations (saves 3-5 minutes)*
- *Beginners may need extra time for troubleshooting scenarios*
- *Practice exercise can be extended with additional challenges*
- *Allow time for questions after each major scenario*
