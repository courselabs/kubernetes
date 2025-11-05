# Troubleshooting Application Modeling - CKAD Exam Preparation

**Duration:** 25-30 minutes
**Format:** CKAD exam-focused scenarios for multi-resource applications
**Target:** CKAD certification candidates

---

## Introduction (1 minute)

Welcome to CKAD preparation for application modeling troubleshooting. This combines configuration management (ConfigMaps, Secrets), storage (PersistentVolumes), and namespaces—all critical CKAD topics.

**CKAD Domains Covered:**
- **Application Design and Build** (20%) - ConfigMaps, Secrets, multi-container pods
- **Application Deployment** (20%) - Deployments with configuration
- **Services & Networking** (20%) - Service connectivity
- **Application Observability & Maintenance** (15%) - Troubleshooting
- **Application Environment, Configuration & Security** (25%) - ConfigMaps, Secrets, SecurityContexts

**Why This Matters:**
- Almost every CKAD question involves configuration
- Multi-resource troubleshooting combines multiple domains
- Namespace management is fundamental
- Fast diagnosis is essential for time management

**Today's Comprehensive Coverage:**
1. ConfigMap and Secret troubleshooting patterns
2. PersistentVolume issues and fixes
3. Namespace-related problems
4. Multi-resource dependency debugging
5. Rapid-fire practice scenarios
6. Time-saving techniques

Let's master multi-resource troubleshooting!

---

## Section 1: ConfigMap Troubleshooting (6 minutes)

### Common ConfigMap Failure Patterns (1.5 minutes)

**Pattern 1: ConfigMap Not Found**

**Symptom:**

**Causes:**
1. ConfigMap doesn't exist
2. ConfigMap in wrong namespace
3. Typo in ConfigMap name

**Quick Diagnosis:**

**Pattern 2: Key Not Found**

**Symptom:**

**Diagnosis:**

### Scenario 1: Missing ConfigMap (2 minutes)

**CKAD Question:** "The webapp deployment in namespace  has pods in CreateContainerConfigError. The application expects configuration from a ConfigMap named . Fix the issue."

**Solution Process:**

**Time Target:** 2 minutes

### Scenario 2: Key Name Mismatch (2 minutes)

**CKAD Question:** "The api-server deployment is running but the application logs show 'DATABASE_URL not set'. The ConfigMap  exists with the database connection. Fix the configuration."

**Solution Process:**

**Time Target:** 2 minutes

### Scenario 3: ConfigMap in Wrong Namespace (1.5 minutes)

**CKAD Question:** "Create a ConfigMap in namespace  with key  and value , then update the  deployment to use it."

**Solution:**

Add to container spec:

**Time Target:** 1-2 minutes

---

## Section 2: Secret Troubleshooting (5 minutes)

### Common Secret Failure Patterns (1 minute)

**Similar to ConfigMaps, plus:**

1. **Encoding issues** - Must be base64 encoded in YAML
2. **Type mismatches** - docker-registry, tls, basic-auth, opaque
3. **Permission issues** - RBAC preventing access

### Scenario 4: Missing Secret (2 minutes)

**CKAD Question:** "The database pod is in CreateContainerConfigError. It expects a Secret named  with keys  and . Create the Secret and fix the pod."

**Solution:**

**Time Target:** 2 minutes

### Scenario 5: Docker Registry Secret (2 minutes)

**CKAD Question:** "The app deployment can't pull images from private registry . Create an image pull secret and configure the deployment to use it."

**Solution:**

Add to pod spec:

**Time Target:** 2 minutes

### Scenario 6: TLS Secret for Ingress (1 minute)

**CKAD Question:** "Create a TLS secret named  from certificate file  and key file ."

**Solution:**

Add:

**Time Target:** 1 minute

---

## Section 3: PersistentVolume Troubleshooting (6 minutes)

### PVC Lifecycle and States (1 minute)

**States:**
- **Pending** - Waiting for binding
- **Bound** - Successfully bound to PV
- **Released** - PVC deleted, PV not yet reclaimed
- **Failed** - Reclamation failed

**Binding Requirements:**
- Storage size (PV >= PVC)
- Access modes compatible
- Storage class matches (if specified)
- Volume mode matches

### Scenario 7: PVC Stuck in Pending (3 minutes)

**CKAD Question:** "The data-storage PVC in namespace  is stuck in Pending state. The pod using it can't start. Fix the issue."

**Solution Process:**

**Common Mismatches:**

**Size Mismatch:**

**Access Mode Mismatch:**

**Time Target:** 3 minutes

### Scenario 8: Multiple Pods and RWO Volume (2 minutes)

**CKAD Question:** "A deployment with 3 replicas is trying to use a ReadWriteOnce PVC. Only one pod is Running, the others are stuck in ContainerCreating. Fix the issue."

**Problem:** ReadWriteOnce volumes can only be mounted by pods on the same node.

**Solution A: Change to RWX (if supported)**

**Solution B: Use StatefulSet with per-pod volumes**

**Solution C: Use hostPath with node affinity (development only)**

For development/testing only - not production suitable.

**Time Target:** 2 minutes

---

## Section 4: Namespace Troubleshooting (4 minutes)

### Namespace Scope Rules (1 minute)

**Namespace-Scoped Resources:**
- Pods, Deployments, Services
- ConfigMaps, Secrets
- PersistentVolumeClaims
- ServiceAccounts
- Roles, RoleBindings

**Cluster-Scoped Resources:**
- PersistentVolumes
- Nodes
- StorageClasses
- ClusterRoles, ClusterRoleBindings
- Namespaces themselves

**Key Rule:** Namespace-scoped resources can only reference other resources in the same namespace (with few exceptions).

### Scenario 9: Cross-Namespace Configuration (2 minutes)

**CKAD Question:** "The webapp deployment in namespace  needs to access the API service in namespace . Update the configuration."

**Solution:**

Add:

**Time Target:** 2 minutes

### Scenario 10: Moving Resources Between Namespaces (1 minute)

**CKAD Question:** "A ConfigMap  in namespace  needs to be available in namespace ."

**Solution:**

**Time Target:** 1 minute

---

## Section 5: Multi-Resource Debugging (5 minutes)

### Debugging Workflow for Complex Applications (1.5 minutes)

**Step 1: Map Dependencies**

**Step 2: Check Each Layer**

**Step 3: Follow Error Trail**

### Scenario 11: Full Stack Troubleshooting (3.5 minutes)

**CKAD Question:** "Deploy a complete application stack in namespace  with:
- Deployment  using image 
- ConfigMap  with 
- Secret  with 
- PVC  requesting 1Gi
- Service  exposing port 80

The deployment should mount the PVC at , load config from ConfigMap, and secret from Secret."

**Solution:**

**Time Target:** 5 minutes (full deployment from scratch)

---

## Section 6: Rapid-Fire Practice (3 minutes)

### Quick Drill 1 (45 seconds)

**Task:** "ConfigMap  in namespace  is missing. Create it with ."

### Quick Drill 2 (45 seconds)

**Task:** "Secret  needs key  with value  in namespace ."

### Quick Drill 3 (45 seconds)

**Task:** "PVC  in namespace  is Pending. Create a matching 2Gi PV."

### Quick Drill 4 (45 seconds)

**Task:** "Move ConfigMap  from  to  namespace."

---

## Section 7: Time-Saving Techniques (2 minutes)

### Quick Resource Creation (1 minute)

### Quick Verification (1 minute)

---

## Section 8: CKAD Exam Checklist (1 minute)

**Before leaving a question:**

✅ **All resources in correct namespace**

✅ **ConfigMaps and Secrets exist**

✅ **Key names match references**

✅ **PVCs are Bound**

✅ **Pods are Running and Ready**

✅ **Services have endpoints**

✅ **Application responds**

---

## Summary: CKAD Mastery (1 minute)

**Must-Know Commands:**

**Common Patterns:**
- CreateContainerConfigError → Missing ConfigMap/Secret
- Pending PVC → No matching PV available
- No endpoints → Selector/label mismatch
- Cross-namespace → Use FQDN for services

**Time Management:**
- Simple ConfigMap/Secret: 1-2 minutes
- PVC issue: 2-3 minutes
- Full stack deployment: 5-7 minutes
- Always verify before moving on!

**Final Tips:**
1. Check namespace first - most common mistake
2. Use  for speed
3. Verify key names match exactly
4. Test connectivity after configuration
5. Don't forget to verify fixes work!

**Remember:** Application modeling questions combine multiple CKAD domains. Master these patterns and you'll excel!

---

**Total Duration:** 25-30 minutes
**Practice Goal:** Complete any multi-resource scenario in under 5 minutes!

Good luck on your CKAD exam!
