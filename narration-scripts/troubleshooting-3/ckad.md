# Troubleshooting Advanced Components - CKAD Perspective

**Duration:** 25-30 minutes
**Format:** CKAD-focused view of advanced topics
**Note:** Core CKAD + enrichment material

---

## Important Note (1 minute)

**CKAD Core vs. Advanced:**

This lab covers advanced topics. Here's what matters for CKAD:

**✅ CKAD Core (Focus Here):**
- Basic Ingress resources and routing
- Basic StatefulSet concepts
- Standard troubleshooting commands
- Multi-resource debugging approach

**📚 Beyond CKAD (Bonus):**
- Helm chart creation and debugging
- Advanced Ingress patterns
- Complex StatefulSet scenarios

**Recommendation:** If studying for CKAD, prioritize core topics in troubleshooting and troubleshooting-2 labs first.

---

## Section 1: CKAD-Relevant Ingress Basics (8 minutes)

### What CKAD Expects (2 minutes)

**You should know:**
- What an Ingress is and why it's used
- How to create basic Ingress resources
- How Ingress routes to Services
- Basic troubleshooting of Ingress connectivity

**You don't need to know:**
- Ingress controller internals
- Complex path rewrites
- Advanced TLS configuration

### Scenario 1: Create Basic Ingress (3 minutes)

**CKAD Question:** "Create an Ingress named  that routes traffic from  to service  on port 80."

**Solution:**

**Time Target:** 2-3 minutes

### Scenario 2: Ingress Troubleshooting (3 minutes)

**CKAD Question:** "The Ingress  isn't routing traffic to the backend. Diagnose and fix the issue."

**Diagnosis:**

**Common Issues:**
- Backend service doesn't exist
- Service has no endpoints (selector mismatch)
- Wrong port number
- Ingress controller not installed (but this is usually pre-configured in exam)

**Time Target:** 3 minutes

---

## Section 2: CKAD-Relevant StatefulSet Basics (8 minutes)

### What CKAD Expects (2 minutes)

**You should know:**
- Difference between Deployment and StatefulSet
- When to use StatefulSet (stateful apps like databases)
- Pod naming conventions (pod-0, pod-1, pod-2)
- Basic volumeClaimTemplates usage

**You might not need:**
- Advanced StatefulSet update strategies
- Complex partition-based rollouts
- Detailed PV/PVC reclaim policies

### Scenario 3: Create Basic StatefulSet (3 minutes)

**CKAD Question:** "Create a StatefulSet named  with 3 replicas using image . Each pod should have a PVC requesting 1Gi storage mounted at ."

**Solution:**

**Verify:**

**Time Target:** 3-4 minutes

### Scenario 4: StatefulSet Troubleshooting (3 minutes)

**CKAD Question:** "The postgres StatefulSet has pod-0 in Pending state. Fix the issue."

**Diagnosis:**

**Time Target:** 3 minutes

---

## Section 3: Multi-Resource Debugging (CKAD-Relevant) (6 minutes)

### Scenario 5: Debug Complete Application Stack (6 minutes)

**CKAD Question:** "An application stack has:
- StatefulSet  (not ready)
- Deployment  (CrashLoopBackOff)
- Service  (no endpoints)
- Ingress  (not routing)

Fix all issues so the application is accessible."

**Systematic Solution:**

**Step 1: Fix StatefulSet (2 minutes)**

**Step 2: Fix API Deployment (2 minutes)**

**Step 3: Fix Service (1 minute)**

**Step 4: Verify Ingress (1 minute)**

**Time Target:** 6 minutes total

---

## Section 4: CKAD Exam Tips (4 minutes)

### Ingress Quick Reference (2 minutes)

**Create Ingress:**

**Troubleshoot Ingress:**

### StatefulSet Quick Reference (2 minutes)

**Create StatefulSet:**

**Troubleshoot StatefulSet:**

---

## Section 5: What to Skip for CKAD (2 minutes)

**Helm - Not in CKAD Core:**
- Skip Helm chart creation
- Skip Helm template syntax
- Skip Helm debugging commands
- Focus: kubectl and YAML only

**Advanced Ingress - Limited CKAD Coverage:**
- Skip: Complex path rewrites
- Skip: Ingress controller installation
- Skip: Advanced TLS setup
- Focus: Basic HTTP routing

**Advanced StatefulSet - Limited CKAD Coverage:**
- Skip: Update strategies (OnDelete, partitions)
- Skip: PersistentVolume reclaim policies
- Skip: Advanced storage classes
- Focus: Basic StatefulSet creation and PVC binding

---

## Section 6: Core CKAD Troubleshooting Review (3 minutes)

**Priority 1: Master These First**

**Priority 2: Practice These Scenarios**

1. Pod ImagePullBackOff → Fix image
2. Pod CrashLoopBackOff → Check logs --previous
3. Service no endpoints → Fix selector
4. ConfigMap missing → Create it
5. PVC Pending → Create PV
6. Basic Ingress routing → Create Ingress resource

**Priority 3: Time Management**

- Simple fixes: 2-3 minutes
- Multi-resource: 5-7 minutes
- Complex scenarios: 8-10 minutes MAX
- Always verify before moving on

---

## Final CKAD Guidance (1 minute)

**Study Path:**

1. **First:** Master basic troubleshooting (labs/troubleshooting)
2. **Second:** Master multi-resource (labs/troubleshooting-2)
3. **Third:** Basic Ingress and StatefulSet (relevant parts of this lab)
4. **Later:** Helm and advanced patterns (after passing CKAD)

**Exam Focus:**

✅ **Do this:**
- Memorize kubectl troubleshooting commands
- Practice fixing broken YAML
- Master describe and logs commands
- Understand resource dependencies
- Time yourself on practice scenarios

❌ **Don't worry about:**
- Helm chart syntax
- Ingress controller internals
- Advanced StatefulSet patterns
- Topics explicitly marked "beyond CKAD"

**Success Formula:**
- Focus on core topics = Pass CKAD
- Add advanced topics = Excel in real world
- Practice both = Kubernetes mastery

---

**Total Duration:** 25-30 minutes
**Recommendation:** Return to this after mastering core CKAD troubleshooting!
