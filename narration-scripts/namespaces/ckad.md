# Namespaces - CKAD Exam Preparation
## Narration Script for Exam-Focused Training
**Duration:** 15-20 minutes

---

## Introduction (0:00 - 1:00)

"Welcome to CKAD exam preparation for Namespaces. This topic appears frequently in the exam, both directly and as a requirement for other tasks."

"Key exam context:
- Questions often specify which namespace to use
- You'll switch namespaces many times during the exam
- Some questions test namespace isolation and resource quotas
- Cross-namespace communication is a common scenario
- Missing the namespace is one of the most common mistakes"

"In the next 15-20 minutes, we'll cover:
- Fast namespace creation and switching
- Resource quota scenarios
- Cross-namespace service discovery
- Time-saving techniques
- Practice exercises"

**Setup:**

---

## Section 1: Imperative Namespace Commands (1:00 - 4:00)

### Speed Technique #1: Quick Creation (1:00 - 2:00)

"The fastest way to create a namespace:"

"That's it! Much faster than writing YAML."

**Generate YAML if needed:**

"But in the exam, imperative creation is almost always faster unless you need specific labels or annotations."

### Speed Technique #2: Context Switching (2:00 - 3:00)

"Two methods to work in a namespace:"

**Method 1: Using -n flag**

"Pros: Explicit, no confusion
Cons: More typing, easy to forget"

**Method 2: Change context**

"Pros: Less typing, cleaner
Cons: Can forget which namespace you're in"

### Exam Strategy Decision (3:00 - 4:00)

"My recommendation:
- **Use context switching** when a question focuses on one namespace
- **Use -n flag** when jumping between namespaces in a single question
- **Always verify** your namespace before critical operations"

**Quick verification:**

"Practice both methods. Use what feels natural under pressure."

---

## Section 2: Resource Quotas (4:00 - 8:00)

### Understanding Quota Requirements (4:00 - 5:00)

"Critical exam knowledge: When a namespace has ResourceQuota for CPU or memory, **every Pod must specify resource requests and limits**."

"This catches many candidates:"

### The Problem (5:00 - 6:00)

"Now try to create a Pod without resources:"

"It fails! Check the events:"

"Error: 'failed quota: compute-quota: must specify limits.cpu, limits.memory, requests.cpu, requests.memory'"

### The Solution (6:00 - 7:00)

"Always specify resources when quotas exist:"

"Or with YAML:"

### Checking Quota Usage (7:00 - 8:00)

"Verify the quota is being tracked:"

"Output shows:
- Hard limits: Maximum allowed
- Used: Currently consumed
- Remaining capacity"

**Exam tip:** "If Pods won't start, check for quotas with . This saves minutes of debugging."

---

## Section 3: Cross-Namespace Communication (8:00 - 11:00)

### DNS Patterns (8:00 - 9:00)

"Services are namespace-scoped, but DNS allows cross-namespace access."

**Three DNS formats:**

### Exam Scenario: Multi-Namespace App (9:00 - 10:30)

"Common exam task: Deploy frontend and backend in different namespaces."

"Now test connectivity from frontend to backend:"

### ConfigMap Scoping Challenge (10:30 - 11:00)

"Important limitation: ConfigMaps and Secrets cannot be referenced across namespaces."

"If the exam asks you to configure cross-namespace communication:
- Create the ConfigMap in the SAME namespace as the Pod
- Store the FQDN service name in the ConfigMap
- The Pod references the local ConfigMap
- The service name points to the other namespace"

**Example:**

"ConfigMap is in frontend namespace (where the Pod is), but the URL points to backend namespace."

---

## Section 4: Common Exam Patterns (11:00 - 15:00)

### Pattern 1: Namespace Isolation (11:00 - 12:00)

"Task: Deploy the same application in dev and prod namespaces with different configurations."

"Same Pod name, same service name, but isolated in different namespaces."

### Pattern 2: Resource Quota Enforcement (12:00 - 13:00)

"Task: Create a namespace with quota that limits it to 3 Pods and 1 CPU core total."

"Try to deploy 4 Pods:"

### Pattern 3: ServiceAccount in Namespace (13:00 - 14:00)

"ServiceAccounts are namespace-scoped. Common exam task:"

**Exam tip:** "If a question asks for a Pod with a specific ServiceAccount, the SA must exist in the same namespace as the Pod."

### Pattern 4: Bulk Operations (14:00 - 15:00)

"Working with resources across namespaces:"

**Exam warning:** "Be very careful with namespace deletion. It's immediate and irreversible!"

---

## Section 5: Time-Saving Techniques (15:00 - 17:00)

### Quick Reference Commands (15:00 - 16:00)

**Namespace operations:**

**Context operations:**

**Resource quotas:**

### Helpful Aliases (16:00 - 17:00)

"Set these up at the start of your exam:"

"Usage examples:"

---

## Section 6: Practice Exercises (17:00 - 20:00)

### Exercise 1: Quick Setup (17:00 - 18:00)

"Timed exercise - 2 minutes:"

**Task:** "Create a namespace called 'practice', switch to it, create a Pod named 'test' running nginx, verify it's running, then switch back to default."

**Timer starts...**

<details>
<summary>Solution</summary>

</details>

### Exercise 2: Quota Challenge (18:00 - 19:00)

"Timed exercise - 3 minutes:"

**Task:** "Create a namespace 'restricted' with a ResourceQuota limiting it to 2 Pods, 500m CPU, and 512Mi memory. Deploy two nginx Pods that fit within this quota. Attempt a third Pod and explain why it fails."

**Timer starts...**

<details>
<summary>Solution</summary>

Explanation: "Pod limit of 2 has been reached."
</details>

### Exercise 3: Cross-Namespace Communication (19:00 - 20:00)

"Timed exercise - 3 minutes:"

**Task:** "Create namespace 'api' with a Pod named 'backend' running nginx on port 80, expose it as a service. Create namespace 'web' with a Pod named 'frontend' running busybox (sleep 3600). From the frontend Pod, successfully access the backend service using its FQDN."

**Timer starts...**

<details>
<summary>Solution</summary>

</details>

---

## Section 7: Exam Strategy and Checklist (20:00 - 21:00)

### Time Management

"For namespace-related questions:
- Simple namespace creation: 15-30 seconds
- Creating with ResourceQuota: 2-3 minutes
- Cross-namespace deployment: 3-5 minutes
- Debugging quota issues: 2-3 minutes"

### Pre-Exam Checklist

**Commands to memorize:**

**Common exam pitfalls:**
1. ✗ Forgetting which namespace you're in
2. ✗ Not specifying resources when quotas exist
3. ✗ Using short service names across namespaces
4. ✗ Trying to reference ConfigMaps across namespaces
5. ✗ Not verifying namespace before operations

**Success checklist:**
1. ✓ Set up aliases at exam start
2. ✓ Always verify current namespace
3. ✓ Use context switching for focused work
4. ✓ Check for ResourceQuotas if Pods won't start
5. ✓ Use FQDNs for cross-namespace services
6. ✓ Practice rapid namespace creation and switching

---

## Cleanup (21:00)

---

## Final Tips

"Three keys to namespace success in CKAD:

1. **Awareness:** Always know which namespace you're in. Make it muscle memory to check.

2. **Speed:** Master imperative commands. Create namespaces in seconds, not minutes.

3. **Understanding:** Know what's namespace-scoped vs cluster-scoped. Know when resources can cross namespace boundaries.

Namespaces appear in almost every CKAD exam question - either explicitly or implicitly. Get comfortable with them, and you'll save time throughout the entire exam.

Good luck!"

---

## Additional Practice Recommendations

Practice these scenarios daily until the exam:

1. **Speed drill:** Create 5 namespaces, deploy a Pod in each, verify all running - under 5 minutes

2. **Quota mastery:** Set up namespace with quotas, deploy Pods that fit, attempt to exceed, explain errors - under 3 minutes

3. **Context switching:** Switch between 3 namespaces, perform operations in each, switch back to default - under 2 minutes

4. **Cross-namespace comms:** Deploy multi-tier app across namespaces, verify connectivity - under 5 minutes

5. **Troubleshooting:** Debug why Pods won't start in namespace with quotas - under 2 minutes

**Target:** Complete all 5 scenarios in under 20 minutes total before your exam day.
