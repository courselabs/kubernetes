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

```bash
# Check if ingress controller exists
kubectl get pods -A | grep ingress

# If not, deploy it
kubectl apply -f labs/ingress/specs/ingress-controller

# Verify ingress controller running
kubectl get pods -n ingress-nginx
```

### Step 2: Attempt Helm Installation (2 minutes)

**Try to install the broken chart:**

```bash
# Install the Helm chart
helm upgrade --install broken-app labs/troubleshooting-3/specs/app-chart/ \
  --create-namespace \
  --namespace troubleshooting-3

# What happens?
```

**Expected:** Installation fails with errors. Note the error messages.

**Common Helm errors:**
- Template parsing errors
- Missing required values
- Resource validation failures

**Investigate the failure:**

```bash
# Check Helm release status
helm list -n troubleshooting-3

# View release history
helm history broken-app -n troubleshooting-3

# Get detailed error info
helm status broken-app -n troubleshooting-3
```

### Step 3: Diagnosis - Helm Chart Issues (4 minutes)

**Validate templates without installing:**

```bash
# Dry-run to test templates
helm install broken-app labs/troubleshooting-3/specs/app-chart/ \
  --dry-run --debug \
  --namespace troubleshooting-3

# Or render templates to see output
helm template broken-app labs/troubleshooting-3/specs/app-chart/ \
  --namespace troubleshooting-3
```

**Check chart structure:**

```bash
# List chart files
ls -la labs/troubleshooting-3/specs/app-chart/

# Check values file
cat labs/troubleshooting-3/specs/app-chart/values.yaml

# Check templates
ls labs/troubleshooting-3/specs/app-chart/templates/
```

**Common issues to look for:**
- Missing closing braces in templates `{{ }}`
- Undefined values references
- Invalid YAML indentation
- Missing required fields

**Fix Helm template errors:**

```bash
# Edit problematic templates
vi labs/troubleshooting-3/specs/app-chart/templates/<template-name>.yaml

# Common fixes:
# - Fix Go template syntax
# - Add missing values to values.yaml
# - Correct indentation
# - Fix resource references
```

### Step 4: Diagnosis - Ingress Issues (3 minutes)

**Once Helm installs, check Ingress:**

```bash
# Check ingress resource
kubectl get ingress -n troubleshooting-3

# Describe ingress
kubectl describe ingress -n troubleshooting-3

# Check ingress backend services exist
kubectl get svc -n troubleshooting-3
```

**Common Ingress issues:**
- Service name mismatch
- Wrong port numbers
- Missing host configuration
- TLS secret issues

**Test Ingress routing:**

```bash
# Test with curl (include Host header)
curl -H "Host: whoami.local" http://localhost:8000

# Or add to /etc/hosts
echo "127.0.0.1 whoami.local" | sudo tee -a /etc/hosts

# Then access directly
curl http://whoami.local:8000
```

### Step 5: Diagnosis - StatefulSet Issues (3 minutes)

**Check StatefulSet status:**

```bash
# Check StatefulSet
kubectl get statefulset -n troubleshooting-3

# Check pods
kubectl get pods -n troubleshooting-3

# Check PVCs
kubectl get pvc -n troubleshooting-3
```

**Common StatefulSet issues:**
- PVCs not binding (no PV available)
- Missing headless service
- Pods stuck in pending/init
- Ordered startup blocking

**Fix PVC issues:**

```bash
# If PVCs pending, create PVs
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv-0
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /tmp/postgres-data-0
  persistentVolumeReclaimPolicy: Retain
EOF
```

### Step 6: Fix All Issues (4 minutes)

**Systematic fixes:**

1. Fix Helm template syntax errors
2. Update values.yaml with missing required values
3. Fix Ingress service references
4. Create PVs for StatefulSet PVCs
5. Ensure headless service exists
6. Fix service selectors

**Upgrade Helm release with fixes:**

```bash
# After fixing chart files
helm upgrade broken-app labs/troubleshooting-3/specs/app-chart/ \
  --namespace troubleshooting-3

# Monitor deployment
kubectl get pods -n troubleshooting-3 --watch
```

### Step 7: Verification (3 minutes)

**Comprehensive checks:**

```bash
# 1. Helm release successful
helm status broken-app -n troubleshooting-3

# 2. All pods running
kubectl get pods -n troubleshooting-3
# All should be Running and Ready

# 3. StatefulSet healthy
kubectl get statefulset -n troubleshooting-3

# 4. PVCs bound
kubectl get pvc -n troubleshooting-3
# All should be Bound

# 5. Services have endpoints
kubectl get endpoints -n troubleshooting-3

# 6. Ingress configured
kubectl get ingress -n troubleshooting-3

# 7. Application responds
curl http://whoami.local:8000
# Should return: whoami response
```

---

## Cleanup (1 minute)

```bash
# Uninstall Helm release
helm uninstall broken-app -n troubleshooting-3

# Delete PVCs (not deleted automatically)
kubectl delete pvc --all -n troubleshooting-3

# Delete namespace
kubectl delete namespace troubleshooting-3
```

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
