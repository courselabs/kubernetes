# Rollouts and Deployment Strategies - CKAD Exam Preparation

**Duration:** 25-30 minutes
**Format:** CKAD exam-focused scenarios and rapid-fire practice
**Target:** CKAD exam candidates preparing for Application Deployment domain (20%)

---

## Introduction (1 minute)

Welcome to the CKAD exam preparation session for deployment strategies and rollouts. This topic represents 20% of your exam score in the Application Deployment domain.

**What makes this CKAD-critical:**
- You WILL get questions about updating deployments
- You WILL need to implement rollback scenarios
- You MAY need to implement blue/green or canary strategies
- Speed matters—you need to execute these tasks in under 5 minutes

**Exam Format Reminder:**
- Performance-based, not multiple choice
- Time-limited (2 hours for ~15-20 questions)
- Real Kubernetes cluster environment
- kubectl and official docs are available

**Today's Focus:**
1. Core rollout commands and configuration
2. Rapid deployment updates
3. Rollback operations under pressure
4. Blue/green and canary implementation
5. Troubleshooting failed rollouts
6. Time-saving techniques

Let's master the skills you need to ace deployment questions!

---

## Section 1: Essential Rollout Commands (4 minutes)

### Quick Reference: Must-Know Commands (1 minute)

**Exam Tip:** Memorize  and —you'll use these constantly.

### Scenario 1: Quick Image Update (2 minutes)

**CKAD Question:** "Update the nginx deployment in the default namespace to use image nginx:1.21-alpine. Ensure zero downtime."

**Solution:**

**Time Target:** Complete in under 2 minutes

**Verification:**

### Scenario 2: Rollback Failed Deployment (1 minute)

**CKAD Question:** "The webapp deployment has been updated with a bad image and pods are crashing. Roll back to the previous working version."

**Solution:**

**Time Target:** Complete in under 90 seconds

**Common Pitfall:** Don't waste time trying to fix the image in the YAML—just rollback!

---

## Section 2: Rollout Strategy Configuration (5 minutes)

### Understanding maxSurge and maxUnavailable (1.5 minutes)

These two parameters control how Kubernetes performs rolling updates:

**maxSurge:**
- Maximum number of pods ABOVE desired count during rollout
- Can be absolute number (e.g., ) or percentage (e.g., )
- Default: 25%
- Higher value = faster rollout, more resources needed

**maxUnavailable:**
- Maximum number of pods that can be UNAVAILABLE during rollout
- Can be absolute number or percentage
- Default: 25%
- Higher value = faster rollout, more risk

**Common Configurations:**

| Configuration | maxSurge | maxUnavailable | Behavior | Use Case |
|---------------|----------|----------------|----------|----------|
| Fast & Safe | 100% | 0 | Create all new pods first | Critical services |
| Slow & Safe | 1 | 0 | One at a time | Conservative updates |
| Balanced | 25% | 25% | Default behavior | Most applications |
| Fast & Risky | 100% | 100% | Fastest possible | Dev environments |

### Scenario 3: Configure Conservative Rollout (2 minutes)

**CKAD Question:** "Configure the api-server deployment to update one pod at a time, ensuring at least the desired number of pods are always available."

**Solution:**

Add/modify the strategy section:

**Verification:**

**Time Target:** 2-3 minutes including verification

### Scenario 4: Recreate Strategy (1.5 minutes)

**CKAD Question:** "The legacy-app deployment must be updated using the Recreate strategy because it cannot run multiple versions simultaneously."

**Solution:**

Change strategy:

**Warning:** This causes downtime! Ensure the question allows it.

**Verification:**

---

## Section 3: Blue/Green Deployments (6 minutes)

### Concept Refresher (1 minute)

**Blue/Green Strategy:**
- Two complete environments (blue and green)
- Service selector controls which environment serves traffic
- Instant switchover by changing selector
- Easy rollback by switching selector back

**Key CKAD Skills:**
- Creating deployments with version labels
- Using  to update Service selector
- Verifying traffic routing

### Scenario 5: Implement Blue/Green (4 minutes)

**CKAD Question:** "Implement a blue/green deployment for the payment-api application. Currently, the blue version (v1.0) is serving traffic. Deploy the green version (v2.0) and prepare it for switchover, but don't switch traffic yet."

**Solution Steps:**

**Step 1: Create Blue Deployment (current production)**

Edit blue-deployment.yaml:

**Step 2: Create Service**

Edit service.yaml:

**Step 3: Create Green Deployment**

Edit green-deployment.yaml:

**Step 4: Verify Setup**

**Time Target:** 4-5 minutes for full setup

### Scenario 6: Switch Traffic to Green (1 minute)

**CKAD Question:** "Switch the payment-api service to route traffic to the green version."

**Solution:**

**Rollback if needed:**

**Time Target:** Under 1 minute

---

## Section 4: Canary Deployments (6 minutes)

### Concept Refresher (1 minute)

**Canary Strategy:**
- Two deployments with same labels but different versions
- Service load-balances across all pods
- Control traffic percentage by adjusting replica counts
- Gradual rollout with monitoring at each stage

**Traffic Percentage Formula:**

Example: 1 canary + 4 stable = 20% canary traffic

### Scenario 7: Implement Canary Deployment (5 minutes)

**CKAD Question:** "Implement a canary deployment for the web-app application. Start with 80% traffic to the stable version (v1.5) and 20% to the canary version (v2.0). Both versions should share the same service."

**Solution:**

**Step 1: Create Stable Deployment**

Edit stable.yaml:

**Step 2: Create Canary Deployment**

Edit canary.yaml:

**Step 3: Create Service**

Or create YAML:

**Step 4: Verify Canary Setup**

**Step 5: Progress the Canary (if question asks)**

**To 50% canary:**

**To 100% canary:**

**Rollback canary:**

**Time Target:** 5-6 minutes for full implementation

---

## Section 5: Troubleshooting Failed Rollouts (4 minutes)

### Common Rollout Failures (1 minute)

**Symptoms:**
- Pods stuck in ImagePullBackOff
- Pods in CrashLoopBackOff
- Rollout never completes
- Deployment shows READY 2/3 (not all replicas ready)

**Quick Diagnosis:**

### Scenario 8: Diagnose and Fix Failed Rollout (3 minutes)

**CKAD Question:** "The api-gateway deployment was updated but the rollout is stuck. Only 2 out of 3 replicas are ready. Diagnose the issue and fix it."

**Solution Process:**

**Step 1: Investigate**

**Step 2: Fix Based on Issue**

**If image is wrong:**

**If config is wrong:**

**If resource constraints:**

**Step 3: Verify Fix**

**Time Target:** 3-4 minutes including diagnosis and fix

---

## Section 6: Advanced Rollout Techniques (3 minutes)

### Pause and Resume Rollouts (1 minute)

**Use Case:** You want to verify a few pods before continuing the rollout.

**CKAD Scenario:** "Update the frontend deployment to version 2.0, but pause after the first new pod comes online for manual testing."

### Rollback to Specific Revision (1 minute)

### Using --record Flag (1 minute)

**Note:**  is deprecated but might still appear in exams.

**Current Best Practice:** Use annotations instead:

---

## Section 7: Time-Saving Tips for CKAD (2 minutes)

### Aliases and Shortcuts

### Quick YAML Generation

### Rapid Verification

### Using kubectl Documentation

---

## Section 8: Rapid-Fire Practice Scenarios (3 minutes)

**Try to complete each in under 2 minutes:**

### Quick Drill 1

"Update deployment 'nginx' to use image 'nginx:alpine' and verify it's running."

### Quick Drill 2

"Rollback deployment 'webapp' to the previous version."

### Quick Drill 3

"Scale deployment 'api' to 5 replicas and verify."

### Quick Drill 4

"Create a deployment 'test-app' with image 'nginx', 3 replicas, then update to 'nginx:alpine'."

### Quick Drill 5

"Check the rollout history of 'frontend' and rollback to revision 2."

---

## Section 9: Common CKAD Pitfalls (2 minutes)

### Pitfall 1: Not Waiting for Rollout to Complete

**Wrong:**

**Right:**

### Pitfall 2: Wrong Container Name

Deployments can have multiple containers. Specify the right one!

**Wrong:**

**Right:**

### Pitfall 3: Forgetting to Verify

Always verify your changes worked!

### Pitfall 4: Blue/Green Service Selector Mistakes

**Wrong:**

**Right:**

---

## Final Exam Checklist (1 minute)

**Before you leave the exam pod:**

✅ Deployment shows correct READY count (e.g., 3/3)
✅ Pods are in Running state
✅ Image version is correct
✅ Service selector points to correct pods (blue/green scenarios)
✅ Endpoints exist for services
✅ No pods in CrashLoopBackOff or ImagePullBackOff

**Quick verification command:**

---

## Summary: Must-Know for CKAD (1 minute)

**Commands to Memorize:**

**Concepts to Master:**
1. Rolling update with maxSurge/maxUnavailable
2. Rollback procedures
3. Blue/green with service selector patching
4. Canary with replica scaling
5. Troubleshooting failed rollouts

**Time Management:**
- Simple updates: 1-2 minutes
- Blue/green setup: 4-5 minutes
- Canary setup: 5-6 minutes
- Troubleshooting: 3-4 minutes

**Final Tip:** Speed comes from practice. Run through these scenarios multiple times until they're muscle memory!

---

**Total Duration:** 25-30 minutes
**Next Steps:** Practice these scenarios in a timed environment to build exam confidence!
