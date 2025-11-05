# Troubleshooting Advanced Components - Practical Exercises

**Duration:** 20-25 minutes
**Format:** Live demonstration with Helm chart troubleshooting
**Note:** Advanced content beyond CKAD core requirements
**Prerequisites:** Ingress controller, Helm installed

---

## Introduction (1 minute)

This lab focuses on troubleshooting a broken Helm chart that deploys a web application with Ingress and a PostgreSQL database using StatefulSet. This represents real-world complexity beyond CKAD scope.

**The Challenge:** Fix a Helm deployment with multiple interconnected issues across Helm templating, Ingress configuration, and StatefulSet management.

**Success Criteria:**
- Helm chart installs successfully
- Application accessible via http://whoami.local:8000
- All pods healthy and running

Let's begin!

---

## Exercise: Broken Helm Chart with Ingress and StatefulSet (18-22 minutes)

### Step 1: Environment Setup (2 minutes)

**Deploy Ingress Controller:**


### Step 2: Attempt Helm Installation (2 minutes)

**Try to install the broken chart:**


**Expected:** Installation fails with errors. Note the error messages.

**Common Helm errors:**
- Template parsing errors
- Missing required values
- Resource validation failures

**Investigate the failure:**


### Step 3: Diagnosis - Helm Chart Issues (4 minutes)

**Validate templates without installing:**


**Check chart structure:**


**Common issues to look for:**
- Missing closing braces in templates `{{ }}`
- Undefined values references
- Invalid YAML indentation
- Missing required fields

**Fix Helm template errors:**


### Step 4: Diagnosis - Ingress Issues (3 minutes)

**Once Helm installs, check Ingress:**


**Common Ingress issues:**
- Service name mismatch
- Wrong port numbers
- Missing host configuration
- TLS secret issues

**Test Ingress routing:**


### Step 5: Diagnosis - StatefulSet Issues (3 minutes)

**Check StatefulSet status:**


**Common StatefulSet issues:**
- PVCs not binding (no PV available)
- Missing headless service
- Pods stuck in pending/init
- Ordered startup blocking

**Fix PVC issues:**


### Step 6: Fix All Issues (4 minutes)

**Systematic fixes:**

1. Fix Helm template syntax errors
2. Update values.yaml with missing required values
3. Fix Ingress service references
4. Create PVs for StatefulSet PVCs
5. Ensure headless service exists
6. Fix service selectors

**Upgrade Helm release with fixes:**


### Step 7: Verification (3 minutes)

**Comprehensive checks:**


---

## Cleanup (1 minute)


---

## Summary (1 minute)

**Skills Practiced:**
- Helm chart troubleshooting
- Template debugging with --dry-run and --debug
- Ingress configuration and routing
- StatefulSet PVC management
- Multi-component dependency debugging

**Key Takeaways:**
- Helm --dry-run catches template errors before installation
- Ingress requires controller + correct service refs + host headers
- StatefulSets need PVs, headless services, and ordered startup
- Complex systems require layer-by-layer diagnosis

**For CKAD Focus:**
- Master basic troubleshooting first
- Return to advanced topics after certification
- Apply same systematic approach to all resources

---

**Total Duration:** 20-25 minutes
**Note:** This is advanced enrichment content beyond core CKAD requirements
