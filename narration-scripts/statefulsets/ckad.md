# StatefulSets - CKAD Exam Preparation
## Narration Script for Exam Readiness Session

**Duration: 25-30 minutes**
**Target Audience: CKAD Exam Candidates**
**Delivery Style: Exam-focused, practical, with timing emphasis**

---

## Introduction (2 minutes)

Welcome to the CKAD exam preparation session for StatefulSets. While StatefulSets are supplementary material for CKAD, they do appear on the exam, and understanding them demonstrates comprehensive Kubernetes knowledge.

**Session Objectives**:
1. Review CKAD-relevant StatefulSet concepts
2. Practice timed scenarios you might encounter on the exam
3. Learn troubleshooting techniques for common issues
4. Master the quick reference commands
5. Avoid common pitfalls and mistakes

**Exam Context**: StatefulSets fall under the "Application Deployment" domain (20% of exam). You might see 1-2 questions involving StatefulSets, often combined with topics like:
- PersistentVolumeClaims and storage
- Init containers
- Multi-container Pod patterns
- Service networking

**Time Pressure Reality**: On the CKAD exam, you have approximately 2 hours for 15-20 questions. That's 6-8 minutes per question. StatefulSet questions take longer due to sequential Pod creation, so efficiency is critical.

Let's begin with a quick reference review, then move into timed scenarios.

---

## Section 1: Quick Reference and Essential Commands (3-4 minutes)

### 1.1 Core kubectl Commands (90 seconds)

Let me walk you through the commands you must know by heart for the exam.

**Creating and Managing StatefulSets**:

**Monitoring StatefulSet Operations**:

**Working with StatefulSet Pods**:

**Critical Exam Tip**: Use  as the shorthand for StatefulSet. Every second counts on the exam.

### 1.2 StatefulSet vs Deployment - Exam Comparison (90 seconds)

The exam may test your understanding of when to use each controller. Here's what you need to remember:

**StatefulSet Indicators** (use StatefulSet when you see):
- "stable network identity required"
- "ordered deployment"
- "persistent storage per replica"
- "primary-secondary architecture"
- "database" or "message queue"

**Deployment Indicators** (use Deployment when you see):
- "stateless application"
- "web server"
- "API service"
- "fast scaling required"
- No mention of per-Pod storage

**Memory Aid**: If the question mentions specific Pod names or DNS names for individual Pods, it's likely a StatefulSet scenario.

**Exam Reality**: The question will often explicitly state "create a StatefulSet," so you won't always need to choose. But understanding the difference helps with troubleshooting questions.

---

## Section 2: Scenario 1 - Create Basic StatefulSet with Headless Service (5-6 minutes)

### 2.1 Scenario Setup (30 seconds)

**Time Target: 5-6 minutes**

**Exam Question Format**:

"Create a StatefulSet named  with 3 replicas running nginx:alpine. Each Pod should expose port 80. Create the necessary Service to enable stable network identities for each Pod. Verify that you can resolve individual Pod DNS names."

**Constraints**:
- Namespace: default
- Must use imperative commands where possible
- Must verify the solution works

Let's work through this step-by-step with timing.

### 2.2 Solution Walkthrough (4-5 minutes)

**Step 1: Create the Headless Service** (90 seconds target)

The headless Service is mandatory. You must create this first:

**Critical Points**:
-  - this makes it headless (easily forgotten)
- Service name  will be referenced in the StatefulSet
- Selector  must match Pod labels

**Time-Saving Tip**: In the exam, copy and paste from the question where possible. The question might give you the Service name and labels.

**Step 2: Create the StatefulSet** (2-3 minutes target)

**Critical Points**:
-  - must match the Service name
-  must match 
- No  field would default to 1, so explicitly set it

**Step 3: Verify Pod Creation** (30 seconds target)

Wait for all three Pods to reach Running status. Press Ctrl+C when done.

**Exam Tip**: Don't just run  once. Use  and wait for confirmation. Points are often lost for incomplete solutions.

**Step 4: Verify DNS Resolution** (60 seconds target)

This should return the IP of Pod web-0. If it works, your solution is complete.

**Exam Time Check**: This should take 5-6 minutes. If you're over 7 minutes, you need more practice.

### 2.3 Common Mistakes to Avoid (30 seconds)

❌ **Mistake 1**: Forgetting  - StatefulSet will be created but DNS won't work correctly

❌ **Mistake 2**: Mismatched names between  field and actual Service name

❌ **Mistake 3**: Label selector mismatch - Service, StatefulSet, and Pod labels must align

❌ **Mistake 4**: Not waiting for Pods to be Ready before moving to the next question

✅ **Success Criteria**: Three Pods with names web-0, web-1, web-2 in Running status, and DNS resolution works.

---

## Section 3: Scenario 2 - StatefulSet with PersistentVolumeClaims (6-7 minutes)

### 3.1 Scenario Setup (30 seconds)

**Time Target: 6-7 minutes**

**Exam Question Format**:

"Create a StatefulSet named  with 3 replicas using nginx:alpine. Each Pod should have its own PersistentVolumeClaim requesting 100Mi of storage, mounted at /usr/share/nginx/html. Create the necessary headless Service."

**Key Challenge**: The volumeClaimTemplates syntax is complex and easy to get wrong under pressure.

### 3.2 Solution Walkthrough (5-6 minutes)

**Step 1: Create Headless Service** (60 seconds target)

**Step 2: Create StatefulSet with volumeClaimTemplates** (3-4 minutes target)

This is the most time-consuming part. Take care with the indentation:

**Critical Points**:
-  is at the same indentation level as 
- The  in volumeClaimTemplates () must match the  in the container spec
-  is an array - note the brackets
- Storage size uses 

**Common Syntax Errors**:
- Wrong indentation (YAML is sensitive)
- Forgetting the array brackets for 
- Typo in  (it's templates, plural)

**Step 3: Verify PVCs Were Created** (60 seconds target)

You should see three PVCs created:
- 
- 
- 

**Naming Pattern**: 

Wait for all PVCs to reach Bound status.

**Step 4: Verify Pods and Mounts** (30 seconds target)

This confirms the volume is mounted correctly.

**Exam Time Check**: This should take 6-7 minutes maximum. The volumeClaimTemplates section is where most time is spent.

### 3.3 Troubleshooting PVC Issues (60 seconds)

If PVCs don't bind, common causes are:

**Issue 1: No StorageClass Available**

If no default StorageClass exists, you need to specify one or the PVC will remain Pending.

**Issue 2: Insufficient Storage**

Check events for "no persistent volumes available" or capacity issues.

**Issue 3: Access Mode Not Supported**
Some StorageClasses don't support ReadWriteOnce. Check the StorageClass capabilities.

**Exam Tip**: If PVCs are stuck in Pending for more than 30 seconds, check the events with . Don't waste time waiting - investigate and fix.

---

## Section 4: Scenario 3 - Accessing Individual Pods via DNS (4-5 minutes)

### 4.1 Scenario Setup (30 seconds)

**Time Target: 4-5 minutes**

**Exam Question Format**:

"You have a StatefulSet named  running in the default namespace. Verify that each Pod can be accessed individually using DNS names. Document the DNS name pattern."

**Skills Tested**: DNS understanding, testing methodology, Pod access patterns.

### 4.2 Solution Walkthrough (3-4 minutes)

**Step 1: Identify the Service Name** (30 seconds target)

This shows the Service name associated with the StatefulSet (let's assume it's ).

**Step 2: Deploy a Test Pod** (60 seconds target)

This gives you a shell inside the cluster network.

**Step 3: Test DNS Resolution** (90 seconds target)

From inside the test Pod:

**Step 4: Document the Pattern** (30 seconds target)

The DNS pattern is:

In this case:
- 
- 
- 

**Exam Tip**: The exam might ask you to write this in a text file:

### 4.3 DNS Shorthand Forms (30 seconds)

You should also know the shorthand forms that work within the same namespace:

**Full Form** (works everywhere):

**Short Forms** (within the same namespace):

**Exam Relevance**: Questions about connecting one Pod to a specific StatefulSet Pod will require this knowledge.

---

## Section 5: Scenario 4 - Parallel Pod Management (4-5 minutes)

### 5.1 Scenario Setup (30 seconds)

**Time Target: 4-5 minutes**

**Exam Question Format**:

"Create a StatefulSet named  with 5 replicas using nginx:alpine. The Pods should be created simultaneously, not sequentially. Verify that all Pods start at the same time."

**Key Concept**: Using  for faster startup.

### 5.2 Solution Walkthrough (3-4 minutes)

**Step 1: Create Headless Service** (60 seconds target)

**Step 2: Create StatefulSet with Parallel Policy** (2 minutes target)

**Key Addition**: 

This tells Kubernetes to create all Pods simultaneously instead of waiting for each to be Ready.

**Step 3: Observe Parallel Creation** (60 seconds target)

**What to Observe**: All five Pods should appear and enter ContainerCreating/Running status at approximately the same time, not sequentially.

**Exam Verification**: The question might ask you to confirm the behavior by checking Pod creation timestamps:

All timestamps should be within a few seconds of each other.

### 5.3 When to Use Parallel vs Ordered (30 seconds)

**Use OrderedReady (default)** when:
- Pods depend on previous Pods being ready
- Database primary-replica setups
- Leader election scenarios

**Use Parallel** when:
- Pods are independent
- Faster startup is beneficial
- Cache layers, stateless workers with persistent state
- Still need stable names but not ordered startup

**Exam Tip**: If the question says "Pods should start simultaneously" or "fastest possible startup," use .

---

## Section 6: Scenario 5 - Scaling and PVC Retention (5-6 minutes)

### 6.1 Scenario Setup (30 seconds)

**Time Target: 5-6 minutes**

**Exam Question Format**:

"A StatefulSet named  is running with 3 replicas, each with a PVC. Scale it down to 1 replica, then back up to 3 replicas. Verify that the data in the PVCs is preserved."

**Key Concept**: PVCs persist when scaling down and reattach when scaling back up.

### 6.2 Solution Walkthrough (4-5 minutes)

Assuming the StatefulSet already exists:

**Step 1: Write Test Data** (90 seconds target)

**Step 2: Scale Down** (60 seconds target)

**Observe**: Pods are removed in reverse order - Pod-2, then Pod-1. Pod-0 remains.

**Step 3: Verify PVCs Still Exist** (30 seconds target)

**Critical Observation**: All three PVCs are still there, even though only one Pod is running. This is StatefulSet's safety mechanism.

**Step 4: Scale Back Up** (60 seconds target)

**Observe**: Pod-1 and Pod-2 are recreated, in order.

**Step 5: Verify Data Persistence** (60 seconds target)

**Expected Result**: The file still contains "Persistent data" because Pod-2 reattached to its original PVC.

### 6.3 PVC Cleanup Considerations (30 seconds)

**Key Exam Point**: When you delete a StatefulSet, PVCs are NOT deleted.

To clean up completely:

**Exam Scenario**: You might be asked to "clean up all resources" - remember to delete PVCs explicitly.

**Manual Cleanup Pattern**:

---

## Section 7: Troubleshooting Common StatefulSet Issues (4-5 minutes)

### 7.1 Issue 1: Pods Stuck in Pending (90 seconds)

**Symptoms**:

**Diagnosis Steps**:

**Common Fixes**:

**If PVC can't bind**:

**If resource constraints**:

**Exam Tip**: Don't spend more than 2 minutes troubleshooting. If you can't fix it quickly, move to the next question and come back if time permits.

### 7.2 Issue 2: Headless Service Forgotten (60 seconds)

**Symptoms**: StatefulSet exists but Pods have no individual DNS names.

**Diagnosis**:

**Fix**:

**If clusterIP is not None**, delete and recreate the Service (you can't patch this field).

### 7.3 Issue 3: Update Stuck (60 seconds)

**Symptoms**:

**Diagnosis**:

**Common Causes**:
- Image pull errors
- Misconfigured liveness/readiness probes
- Resource limits too restrictive

**Quick Fix**:

**Exam Tip**: If an update is stuck, rollback immediately and check the Pod events to understand why the new version failed.

### 7.4 Issue 4: Label Mismatch (60 seconds)

**Symptoms**: Pods are created but not registered with the Service.

**Diagnosis**:

**Fix**: Ensure all three match:
1. Service 
2. StatefulSet 
3. StatefulSet 

---

## Section 8: Exam Tips and Best Practices (2-3 minutes)

### 8.1 Time Management Strategies (90 seconds)

**1. Memorize the Headless Service Pattern**:
Keep this template in your mind:

You should be able to type this in under 30 seconds.

**2. Use kubectl apply with Heredocs**:
Faster than creating separate files:

**3. Don't Wait for Sequential Creation in Timed Mode**:
If you create a StatefulSet with 5 replicas, don't sit and watch all 5 Pods start. Verify Pod-0 starts, then move to the next task. Come back later to verify completion.

**4. Use --watch Efficiently**:

But press Ctrl+C as soon as you see the expected state. Don't waste time watching.

**5. Leverage kubectl scale**:

This is faster than editing YAML.

### 8.2 Common Exam Pitfalls to Avoid (90 seconds)

**Pitfall 1: Forgetting clusterIP: None**
✅ **Solution**: Always double-check the Service spec includes .

**Pitfall 2: Wrong volumeClaimTemplates Indentation**
✅ **Solution**: volumeClaimTemplates is at the same level as , not inside it.

**Pitfall 3: Not Verifying PVCs Are Bound**
✅ **Solution**: Always run  and ensure all PVCs show "Bound" status.

**Pitfall 4: Mismatched serviceName**
✅ **Solution**: The StatefulSet's  must exactly match the Service's .

**Pitfall 5: Expecting Instant Pod Creation**
✅ **Solution**: StatefulSets create Pods sequentially. Budget time for this in your answer.

**Pitfall 6: Not Cleaning Up PVCs**
✅ **Solution**: When asked to "clean up all resources," remember to delete PVCs separately.

**Pitfall 7: Using Wrong DNS Format**
✅ **Solution**: Memorize: 

---

## Section 9: Quick Command Reference Card (2 minutes)

### 9.1 Essential Commands for the Exam (2 minutes)

Let me give you the must-know commands in rapid-fire format:

**Create and View**:

**Scale**:

**Update**:

**Rollout Management**:

**Pod Access**:

**PVC Management**:

**DNS Testing**:

**Cleanup**:

**Combined Cleanup**:

**Memory Aid**: Write "sts" not "statefulset" - saves 10 characters every time.

---

## Section 10: Practice Exercise - Full Exam Simulation (3-4 minutes)

### 10.1 Timed Challenge (30 seconds setup)

**Your challenge**: Complete this in 7 minutes or less.

**Exam Question**:

"Create a StatefulSet named  with the following requirements:
- 3 replicas
- Image: mysql:8.0
- Environment variable: MYSQL_ROOT_PASSWORD=password
- Each Pod should have a 1Gi PVC mounted at /var/lib/mysql
- Create the required Service
- Verify all Pods are Running and all PVCs are Bound"

**Start your timer now.**

### 10.2 Solution (For Review) (2-3 minutes)

After attempting it yourself, here's the optimal solution:

**Time Target**: 6-7 minutes total.

### 10.3 Self-Assessment (30 seconds)

**If you completed in**:
- **Under 6 minutes**: Excellent, you're exam-ready for StatefulSet questions
- **6-7 minutes**: Good, but practice the volumeClaimTemplates section more
- **7-8 minutes**: You need more practice to build speed
- **Over 8 minutes**: Review the syntax and practice daily until you're under 7 minutes

**Focus Areas for Improvement**:
- If you struggled with the Service: Practice creating headless Services until it's automatic
- If you struggled with volumeClaimTemplates: Write out this section 5 times to build muscle memory
- If you struggled with verification: Practice the verification commands separately

---

## Conclusion and Next Steps (2 minutes)

### Summary of Key Exam Points (90 seconds)

Let's recap the absolute essentials for the CKAD exam:

**1. Mandatory Components**:
- Headless Service with  (most common mistake)
- StatefulSet with  field
- Label alignment across Service, StatefulSet, and Pods

**2. volumeClaimTemplates Syntax**:
- Same indentation level as 
-  must match 
-  is an array with brackets

**3. DNS Pattern**:
- 
- Memorize this format

**4. Time Management**:
- StatefulSets take longer due to sequential creation
- Don't watch Pods starting - verify and move on
- Come back to check completion later

**5. Troubleshooting Priority**:
- PVC binding issues (check StorageClass, capacity, access modes)
- Service configuration (verify clusterIP: None and selectors)
- Label mismatches (Service, StatefulSet, Pods must all match)

**6. Cleanup**:
- Always delete PVCs separately when cleaning up
- Use labels for bulk deletion: 

### Practice Recommendations (30 seconds)

**Before the exam**:

1. **Daily Practice**: Create 2-3 StatefulSets from scratch daily for one week
2. **Timed Drills**: Set a 6-minute timer and create a StatefulSet with PVCs
3. **Memorization**: Write the headless Service and volumeClaimTemplates syntax from memory
4. **Troubleshooting**: Practice the common issues section until diagnosis is instant
5. **Review**: Study the CKAD.md file and complete all practice exercises

**Exam Day Strategy**:
- When you see a StatefulSet question, immediately create the headless Service
- Use heredocs with kubectl apply - it's faster than separate files
- Verify each step before moving on
- Budget 7-8 minutes for StatefulSet questions
- If stuck, mark it and come back - don't let one question consume too much time

**Final Thought**: StatefulSets are only 1-2 questions on the exam. Master the basics, practice until you're confident, but don't over-invest time at the expense of core topics like Deployments, Services, and ConfigMaps.

Good luck on your CKAD exam!

---

## Additional Resources

**Official Documentation** (allowed during exam):
- https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/
- https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/

**Practice Labs**:
- Complete the full StatefulSets lab (README.md)
- Work through all exercises in CKAD.md
- Try the lab challenge without looking at the solution

**Next Topics to Review**:
- PersistentVolumes and PersistentVolumeClaims
- Services and DNS
- Init containers
- Multi-container Pod patterns

**Total Duration**: 25-30 minutes

---
