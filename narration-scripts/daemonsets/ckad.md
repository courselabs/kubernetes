# DaemonSets - CKAD Exam Preparation
## Narration Script for Exam Readiness Session

**Duration: 15-20 minutes**
**Target Audience: CKAD Exam Candidates**
**Delivery Style: Exam-focused, concise, time-efficient**

---

## Introduction (90 seconds)

Welcome to the CKAD exam preparation session for DaemonSets. While DaemonSets are supplementary material for CKAD, they can appear on the exam, and understanding them demonstrates solid Kubernetes knowledge.

**Session Objectives**:
1. Review essential DaemonSet concepts for the exam
2. Practice timed scenarios with realistic constraints
3. Master troubleshooting techniques
4. Avoid common mistakes and pitfalls
5. Learn quick reference commands

**Exam Context**: DaemonSets are part of the "Application Deployment" domain (20% of exam). You might see 1-2 questions involving DaemonSets, often combined with:
- Node selection and affinity
- Init containers
- HostPath volumes
- Update strategies

**Time Management**: With 6-8 minutes per question, DaemonSets questions should be faster than StatefulSets (no headless Service, no volumeClaimTemplates). Target: 3-5 minutes per DaemonSet question.

**Key Advantage**: DaemonSets are simpler than StatefulSets, so they're less likely to consume excessive exam time. Master the basics and you'll handle these questions efficiently.

Let's start with essential commands and quick reference material.

---

## Section 1: Essential Commands and Quick Reference (2-3 minutes)

### 1.1 Core kubectl Commands (90 seconds)

Here are the commands you must know by heart for DaemonSet questions:

**Create and View**:

**Update and Rollout Management**:

**Pod Management**:

**Node Operations**:

**Deletion**:

**Memory Aid**: Use  not  - saves 8 characters every time.

### 1.2 DaemonSet vs Deployment - Quick Comparison (60 seconds)

Know this cold for the exam:

| Feature | DaemonSet | Deployment |
|---------|-----------|------------|
| **Replicas** | Automatic (one per node) | Manual specification |
| **Scaling** | Add/remove nodes or change labels | Change replica count |
| **Update Default** | RollingUpdate (delete first) | RollingUpdate (create first) |
| **Use Case** | Node-level services | Application workloads |
| **HostPath** | Common | Rare |

**Decision Tree for Exam**:
- Question mentions "every node" or "each node" → DaemonSet
- Question mentions "log collector" or "monitoring agent" → Likely DaemonSet
- Question specifies "3 replicas" → Deployment or StatefulSet
- Question mentions "node resources" or HostPath → Likely DaemonSet

---

## Section 2: Scenario 1 - Create Basic DaemonSet (3-4 minutes)

### 2.1 Scenario Setup (30 seconds)

**Time Target: 3-4 minutes**

**Exam Question Format**:

"Create a DaemonSet named  that runs busybox:latest with the command . The DaemonSet should have the label . Verify that one Pod is running on each node."

**Constraints**:
- Namespace: default
- Must verify solution works
- Efficient execution required

### 2.2 Solution Walkthrough (2-3 minutes)

**Step 1: Create the DaemonSet** (2 minutes target)

**Critical Points**:
- No  field - common mistake to include one
-  must match 
-  is an array of strings

**Time-Saving Tip**: In the exam, don't overthink the YAML structure. DaemonSets are simpler than StatefulSets - just Pod spec, selector, and template.

**Step 2: Verify DaemonSet Created** (30 seconds target)

Check that  matches your cluster's node count.

**Step 3: Verify Pods Running** (30 seconds target)

Verify:
- One Pod per node (check the NODE column)
- All Pods in Running status

**Exam Time Check**: This should take 3-4 minutes maximum. If you're over 5 minutes, you need more practice with YAML syntax.

### 2.3 Common Mistakes (30 seconds)

❌ **Mistake 1**: Adding a  field - DaemonSets don't have one

❌ **Mistake 2**: Label mismatch between selector and template

❌ **Mistake 3**: Wrong API version (use )

❌ **Mistake 4**: Not verifying Pods are actually running

✅ **Success Criteria**: DaemonSet exists, DESIRED equals node count, all Pods Running.

---

## Section 3: Scenario 2 - DaemonSet with HostPath Volume (3-4 minutes)

### 3.1 Scenario Setup (30 seconds)

**Time Target: 3-4 minutes**

**Exam Question Format**:

"Create a DaemonSet named  that runs busybox with the command . Mount the host's  directory as a read-only volume at  in the container."

**Key Challenge**: Correct HostPath volume configuration.

### 3.2 Solution Walkthrough (2-3 minutes)

**Step 1: Create DaemonSet with HostPath** (2-3 minutes target)

**Critical Points**:
-  must match  (both )
-  is specified at the volumeMount level
-  validates that  exists as a directory
-  can be different from 

**Common HostPath Types**:
-  - must exist (most common for exam)
-  - create if doesn't exist
-  - must exist as a file
-  - for Unix sockets (e.g., Docker socket)

**Step 2: Verify Pods Started** (60 seconds target)

You should see log output from the host's syslog.

**Exam Time Check**: Should complete in 3-4 minutes.

### 3.3 Troubleshooting HostPath Issues (30 seconds)

If Pods are not Running:

**Common issues**:
- Path doesn't exist on node (wrong  specified)
- Permission denied (may need securityContext)
- Wrong volumeMount name reference

**Quick Fix**: If path validation fails, use  instead of .

---

## Section 4: Scenario 3 - DaemonSet with Node Selector (3-4 minutes)

### 4.1 Scenario Setup (30 seconds)

**Time Target: 3-4 minutes**

**Exam Question Format**:

"Create a DaemonSet named  that runs on nodes labeled . Use the nginx:alpine image. Then label one node with  and verify the Pod is created on that node."

**Skills Tested**: Node selection, dynamic behavior, verification.

### 4.2 Solution Walkthrough (2-3 minutes)

**Step 1: Create DaemonSet with nodeSelector** (90 seconds target)

**Critical Point**:  is part of the Pod spec (), not the DaemonSet spec.

**Step 2: Verify DaemonSet but No Pods** (30 seconds target)

You should see  because no nodes match the selector.

No Pods exist yet.

**Step 3: Label a Node** (60 seconds target)

**Step 4: Verify Pod Created** (30 seconds target)

You should see one Pod created on the labeled node.

**Exam Time Check**: Should complete in 3-4 minutes.

### 4.3 Key Concepts (30 seconds)

**Dynamic Behavior**:
- Label a node → DaemonSet creates Pod
- Remove label → DaemonSet deletes Pod
- Relabel node → Pod moves

**Use Cases**:
- GPU nodes: 
- Production nodes: 
- SSD nodes: 
- Zone-specific: 

**Exam Tip**: If a question mentions specific node types or subsets, use nodeSelector.

---

## Section 5: Scenario 4 - Update Strategy OnDelete (2-3 minutes)

### 5.1 Scenario Setup (30 seconds)

**Time Target: 2-3 minutes**

**Exam Question Format**:

"Configure the DaemonSet  to use manual update control. When you update the image, Pods should only be updated when you manually delete them."

**Key Concept**: OnDelete update strategy.

### 5.2 Solution Walkthrough (90 seconds)

**Step 1: Update DaemonSet with OnDelete Strategy** (60 seconds target)

**Critical Field**: 

**Step 2: Verify Pods NOT Updated** (30 seconds target)

Pods are still running with the old spec. The update didn't trigger a rollout.

**Step 3: Manually Trigger Update** (30 seconds target)

The new Pod will have the updated image.

**Exam Time Check**: Should complete in 2-3 minutes.

### 5.3 RollingUpdate vs OnDelete (30 seconds)

**RollingUpdate** (default):

Automatic updates when spec changes.

**OnDelete**:

Manual updates only when Pods are deleted.

**Exam Decision**:
- Question says "automatic updates" → RollingUpdate
- Question says "manual control" or "one at a time" → OnDelete

---

## Section 6: Scenario 5 - Init Container Pattern (2-3 minutes)

### 6.1 Scenario Setup (30 seconds)

**Time Target: 2-3 minutes**

**Exam Question Format**:

"Create a DaemonSet named  that runs nginx:alpine. Before nginx starts, an init container should create a custom index.html file in a shared volume."

**Key Concept**: Init containers with shared volumes.

### 6.2 Solution Walkthrough (90 seconds)

**Critical Points**:
- Init container and main container share the volume 
- Init container writes to 
- Main container reads from 
- Volume uses  for temporary storage

**Verification** (30 seconds):

Should show the custom HTML.

### 6.3 Init Container Patterns (30 seconds)

**Common exam patterns**:

**Pattern 1: Wait for dependency**:

**Pattern 2: Download config**:

**Pattern 3: Set permissions**:

---

## Section 7: Troubleshooting Common Issues (2-3 minutes)

### 7.1 Issue 1: Pods Not Scheduling (60 seconds)

**Symptoms**:

**Diagnosis**:

**Common causes**:
- nodeSelector doesn't match any nodes
- Nodes have taints without corresponding tolerations
- All nodes are tainted as NoSchedule

**Quick Fix**:

### 7.2 Issue 2: Update Not Happening (60 seconds)

**Symptoms**: You updated the DaemonSet but Pods still have old spec.

**Diagnosis**:

**If it says "OnDelete"**:
- This is expected behavior
- You must manually delete Pods for updates

**Fix**:

### 7.3 Issue 3: HostPath Volume Failures (60 seconds)

**Symptoms**: Pods in CrashLoopBackOff or Error state.

**Diagnosis**:

**Common causes**:
- Path doesn't exist on node
- Wrong  specified
- Permission denied

**Fixes**:

**If path doesn't exist**:

**If permission issues**:

---

## Section 8: Exam Tips and Best Practices (2-3 minutes)

### 8.1 Time Management (90 seconds)

**1. DaemonSets are Quick**:
- No headless Service (unlike StatefulSets)
- No volumeClaimTemplates
- Target: 3-5 minutes per DaemonSet question

**2. Use Heredocs for Speed**:

**3. Verification Shortcuts**:

**4. Don't Watch Unnecessarily**:
- Use  to see first Pod start
- Press Ctrl+C immediately when status is clear
- Move to next task

**5. Label Nodes Efficiently**:

### 8.2 Common Exam Pitfalls (90 seconds)

**Pitfall 1: Including replicas Field**
✅ **Solution**: Remember - DaemonSets have NO replicas field

**Pitfall 2: Expecting Deployment Update Behavior**
✅ **Solution**: DaemonSets delete old Pods before creating new ones

**Pitfall 3: Wrong HostPath Type**
✅ **Solution**: Use  for existing paths,  for new paths

**Pitfall 4: Init Container Not Sharing Volume**
✅ **Solution**: Ensure both init and main containers reference the same volume name

**Pitfall 5: Not Verifying Node Count**
✅ **Solution**: Always check that DESIRED matches your node count

**Pitfall 6: Forgetting to Label Nodes**
✅ **Solution**: When using nodeSelector, remember to actually label nodes

**Pitfall 7: Wrong Selector Syntax**
✅ **Solution**: It's  (Pod spec) not  or 

---

## Section 9: Quick Command Reference Card (90 seconds)

### 9.1 Must-Know Commands

**Creation and Viewing**:

**Pod Operations**:

**Updates and Rollouts**:

**Node Operations**:

**Troubleshooting**:

**Deletion**:

---

## Section 10: Practice Exercise - Full Exam Simulation (3-4 minutes)

### 10.1 Timed Challenge (30 seconds)

**Your challenge**: Complete this in 5 minutes or less.

**Exam Question**:

"Create a DaemonSet named  with these requirements:
- Image: fluent/fluentd:latest
- Label: app=fluentd
- Mount host's  as read-only at  in the container
- Use OnDelete update strategy
- Should only run on nodes labeled 
- Verify the DaemonSet is created but no Pods exist (nodes not labeled yet)"

**Start your timer now.**

### 10.2 Solution (2-3 minutes)

After attempting it yourself:

**Time Target**: 4-5 minutes total.

### 10.3 Self-Assessment (30 seconds)

**If you completed in**:
- **Under 4 minutes**: Excellent, exam-ready for DaemonSet questions
- **4-5 minutes**: Good, but practice the YAML structure more
- **5-6 minutes**: You need more practice to build speed
- **Over 6 minutes**: Review the syntax daily until under 5 minutes

**Focus Areas**:
- Struggled with YAML structure? Practice writing DaemonSets from scratch
- Struggled with nodeSelector? Practice the Pod spec structure
- Struggled with HostPath? Practice volume syntax

---

## Conclusion and Next Steps (90 seconds)

### Summary of Key Exam Points (60 seconds)

**Must-Know Concepts**:

**1. No Replicas Field**:
- DaemonSets automatically match node count
- Don't try to set replicas

**2. Update Strategy Differences**:
- RollingUpdate: Automatic, deletes before creating
- OnDelete: Manual, update by deleting Pods

**3. Node Selection**:
-  for simple label matching
- Tolerations for tainted nodes
- Labels are dynamic - add label, get Pod

**4. HostPath Volumes**:
- Specify  for validation
- Use  when possible
- Common types: Directory, DirectoryOrCreate, File, Socket

**5. Init Containers**:
- Run before main containers
- Share volumes with main containers
- Perfect for setup tasks

**6. Time Management**:
- Target 3-5 minutes per DaemonSet question
- Simpler than StatefulSets
- Verify quickly and move on

### Practice Recommendations (30 seconds)

**Before the exam**:
1. **Daily Practice**: Create 2-3 DaemonSets from scratch daily
2. **Timed Drills**: Set a 4-minute timer, practice under pressure
3. **Memorization**: Write DaemonSet YAML structure from memory
4. **Comparisons**: Practice explaining differences from Deployments
5. **Troubleshooting**: Practice the diagnosis commands

**Exam Day Strategy**:
- DaemonSet questions should be quick wins
- Don't overcomplicate - the YAML is straightforward
- Verify with  and 
- If nodeSelector is involved, verify the label logic
- Move on quickly - don't burn time on simple questions

**Final Thought**: DaemonSets are less common than Deployments but easier than StatefulSets. Master the basics, practice the syntax, and these should be confidence-building questions on exam day.

Good luck on your CKAD exam!

---

## Additional Resources

**Official Documentation** (allowed during exam):
- https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/
- https://kubernetes.io/docs/concepts/workloads/pods/init-containers/

**Practice Labs**:
- Complete the full DaemonSets lab (README.md)
- Work through all exercises in CKAD.md
- Try the lab challenges

**Next Topics to Review**:
- Deployments (core topic, higher priority)
- Services and networking
- Init containers and multi-container patterns
- Node affinity and taints/tolerations

**Total Duration**: 15-20 minutes

---
