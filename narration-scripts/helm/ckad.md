# Helm - CKAD Exam Preparation
**Duration: 20-25 minutes**

---

## Introduction (1:00)

Welcome to the CKAD exam preparation session for Helm. While Helm is marked as "supplementary" for CKAD, it can appear on the exam, and understanding Helm is valuable for real-world Kubernetes work.

In this session, we'll focus on:
- CKAD-relevant Helm skills
- Time-saving techniques for the exam
- Common exam scenarios
- Troubleshooting approaches
- Practice exercises under time pressure

The CKAD exam is performance-based and time-constrained. Every command must be executed efficiently. Let's focus on the Helm skills that will help you succeed.

---

## CKAD Exam Scope for Helm (2:00)

**Timing: 0:00-3:00**

Let's clarify what you need to know about Helm for CKAD.

**Essential Skills:**
- Installing charts from repositories
- Overriding values with --set flags
- Using custom values files
- Upgrading releases
- Rolling back releases
- Listing and inspecting releases
- Basic troubleshooting of Helm deployments

**NOT Required:**
- Creating charts from scratch
- Writing complex templates
- Chart repository management
- Helm plugins or extensions
- Helm hooks or lifecycle management

**Exam Context:**
Helm questions typically appear as:
- "Deploy application X using this Helm chart"
- "Upgrade the release with these new values"
- "Fix the failing Helm deployment"
- "Ensure this application is running with specified configuration"

The exam provides you with necessary chart repositories and documentation. Your job is to execute commands correctly and quickly.

---

## Essential Commands Quick Reference (2:00)

**Timing: 3:00-5:00**

Let's review the core commands you must know by heart.

**Repository Management:**
```bash
helm repo add NAME URL          # Add repository
helm repo update                 # Update repository indexes
helm search repo KEYWORD         # Find charts
helm show values CHART           # Display default values
```

**Release Management:**
```bash
helm install NAME CHART          # Install new release
helm install NAME CHART --set key=value  # Install with custom value
helm install NAME CHART -f values.yaml   # Install with values file
helm upgrade NAME CHART          # Upgrade release
helm upgrade NAME CHART --reuse-values   # Upgrade keeping old values
helm rollback NAME REVISION      # Rollback to specific revision
helm uninstall NAME              # Delete release
```

**Information:**
```bash
helm list                        # List releases
helm list -A                     # List releases in all namespaces
helm status NAME                 # Show release status
helm history NAME                # Show revision history
helm get values NAME             # Show values used in release
```

**Debugging:**
```bash
helm install NAME CHART --dry-run --debug  # Preview without installing
helm template NAME CHART         # Render templates locally
kubectl get all -l app.kubernetes.io/instance=NAME  # See created objects
```

Practice typing these commands until they're muscle memory.

---

## Time-Saving Techniques (3:00)

**Timing: 5:00-8:00**

The CKAD exam is time-constrained. Here are techniques to work faster with Helm.

**Technique 1: Use --set for Single Values**

Instead of creating a values file for one or two settings:
```bash
# Faster
helm install myapp repo/chart --set replicas=3 --set port=8080

# Slower (don't do this in exam)
cat > values.yaml <<EOF
replicas: 3
port: 8080
EOF
helm install myapp repo/chart -f values.yaml
```

**Technique 2: Combine Multiple --set Flags**

You can chain multiple --set flags in one command:
```bash
helm install myapp repo/chart \
  --set service.type=NodePort \
  --set service.nodePort=30080 \
  --set replicaCount=2 \
  --set image.tag=v2.0
```

**Technique 3: Use Namespace Flags**

Always specify namespace in the command rather than switching contexts:
```bash
helm install myapp repo/chart -n production --create-namespace
```

The --create-namespace flag creates the namespace if it doesn't exist, saving you a separate kubectl command.

**Technique 4: Preview Before Applying**

Use --dry-run to catch errors before actually installing:
```bash
helm install myapp repo/chart --set replicas=3 --dry-run
```

This validates your syntax and values without modifying the cluster.

**Technique 5: Quick Verification**

After installing, verify quickly:
```bash
helm list | grep myapp && kubectl get pods -l app.kubernetes.io/instance=myapp
```

This confirms the release exists and pods are running in one line.

---

## Common Exam Scenarios (5:00)

**Timing: 8:00-13:00**

Let's walk through typical CKAD exam scenarios involving Helm.

**Scenario 1: Deploy Application from Repository**

Task: "Install the nginx chart from the bitnami repository in the web namespace with 3 replicas on NodePort 30080."

Solution approach:
```bash
# Add repository if not already present
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search for chart (if unsure of exact name)
helm search repo bitnami/nginx

# Install with requirements
helm install nginx bitnami/nginx \
  -n web \
  --create-namespace \
  --set replicaCount=3 \
  --set service.type=NodePort \
  --set service.nodePorts.http=30080

# Verify
helm list -n web
kubectl get pods -n web
curl localhost:30080
```

Time to complete: 2-3 minutes

**Scenario 2: Upgrade Release with New Values**

Task: "Upgrade the nginx release to use image tag 1.25.0 and increase replicas to 5."

Solution approach:
```bash
# Upgrade with new values
helm upgrade nginx bitnami/nginx \
  -n web \
  --reuse-values \
  --set image.tag=1.25.0 \
  --set replicaCount=5

# Verify
kubectl get pods -n web -l app.kubernetes.io/instance=nginx
```

Time to complete: 1 minute

**Scenario 3: Fix Failing Deployment**

Task: "The prometheus release in monitoring namespace is failing. Fix it."

Solution approach:
```bash
# Check release status
helm list -n monitoring
helm status prometheus -n monitoring

# Check pods
kubectl get pods -n monitoring -l app.kubernetes.io/instance=prometheus

# Check logs
kubectl logs -n monitoring -l app.kubernetes.io/instance=prometheus --tail=50

# Common issues and fixes:
# - Wrong image tag: upgrade with correct tag
# - Port conflict: upgrade with different port
# - Resource limits: upgrade removing limits or increasing them

# Example fix for image tag issue:
helm upgrade prometheus repo/prometheus \
  -n monitoring \
  --reuse-values \
  --set image.tag=v2.45.0
```

Time to complete: 3-5 minutes depending on issue

**Scenario 4: Rollback After Failed Upgrade**

Task: "The recent upgrade to redis broke the application. Rollback to the previous working version."

Solution approach:
```bash
# Check history
helm history redis -n cache

# Rollback to previous revision
helm rollback redis -n cache

# Or rollback to specific revision
helm rollback redis 3 -n cache

# Verify
kubectl get pods -n cache -l app.kubernetes.io/instance=redis
```

Time to complete: 1-2 minutes

---

## Troubleshooting Helm Deployments (3:00)

**Timing: 13:00-16:00**

Quick troubleshooting workflow for Helm issues in the exam.

**Step 1: Check Release Status**
```bash
helm list -A  # Find the release and its namespace
helm status RELEASE -n NAMESPACE  # Check status and notes
```

**Step 2: Check Kubernetes Objects**
```bash
kubectl get all -n NAMESPACE -l app.kubernetes.io/instance=RELEASE
kubectl get pods -n NAMESPACE -l app.kubernetes.io/instance=RELEASE
```

**Step 3: Check Pod Issues**
```bash
kubectl describe pod POD_NAME -n NAMESPACE
kubectl logs POD_NAME -n NAMESPACE
```

**Step 4: Check Values**
```bash
helm get values RELEASE -n NAMESPACE  # See what values were used
helm get manifest RELEASE -n NAMESPACE  # See actual YAML applied
```

**Common Issues and Solutions:**

**Issue: Image Pull Error**
```bash
# Fix: Update image tag or pull policy
helm upgrade RELEASE CHART -n NAMESPACE --reuse-values \
  --set image.tag=correct-tag \
  --set image.pullPolicy=IfNotPresent
```

**Issue: Port Conflict**
```bash
# Fix: Change port
helm upgrade RELEASE CHART -n NAMESPACE --reuse-values \
  --set service.nodePort=30081
```

**Issue: Insufficient Resources**
```bash
# Fix: Reduce resource requests
helm upgrade RELEASE CHART -n NAMESPACE --reuse-values \
  --set resources.requests.memory=128Mi \
  --set resources.requests.cpu=100m
```

**Issue: Wrong Configuration**
```bash
# Fix: Rollback or upgrade with correct values
helm rollback RELEASE -n NAMESPACE
# OR
helm upgrade RELEASE CHART -n NAMESPACE --reuse-values --set correct.value=true
```

---

## Working with Values Files (2:00)

**Timing: 16:00-18:00**

Sometimes the exam provides a values file or asks you to use one.

**When to Use Values Files:**
- Multiple related values to set
- Complex nested configurations
- Values file provided in the question

**Quick Values File Creation:**
```bash
# Create values file from command line
cat > my-values.yaml <<EOF
replicaCount: 3
service:
  type: NodePort
  nodePort: 30080
image:
  tag: v2.0
resources:
  requests:
    cpu: 100m
    memory: 128Mi
EOF

# Install with values file
helm install myapp repo/chart -f my-values.yaml -n namespace
```

**Combining Values Files and --set:**
```bash
# Values file for base configuration, --set for overrides
helm install myapp repo/chart \
  -f base-values.yaml \
  --set environment=production \
  -n prod
```

The --set flags override values from files, allowing you to have a base configuration file and environment-specific overrides.

---

## Practice Exercise 1: Timed Deployment (3:00)

**Timing: 18:00-21:00**

Let's practice a timed exercise. You have 3 minutes.

**Scenario:**
Deploy a PostgreSQL database using Helm with these requirements:
- Use the bitnami/postgresql chart
- Release name: db
- Namespace: database (create if needed)
- Set password to "mypassword"
- Set persistence to disabled
- Set replicaCount to 1
- Verify it's running

**Start timing now...**

**Solution:**
```bash
# Add repo if needed
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install
helm install db bitnami/postgresql \
  -n database \
  --create-namespace \
  --set auth.postgresPassword=mypassword \
  --set primary.persistence.enabled=false \
  --set replicaCount=1

# Verify
helm list -n database
kubectl get pods -n database -l app.kubernetes.io/instance=db

# Cleanup
helm uninstall db -n database
kubectl delete namespace database
```

How did you do? If you completed it in under 3 minutes, excellent! If not, practice until you can.

---

## Practice Exercise 2: Troubleshooting (2:00)

**Timing: 21:00-23:00**

**Scenario:**
A release named "webapp" in namespace "production" was upgraded and now pods are failing. Rollback to the previous working version.

**Solution workflow:**
```bash
# Check status
helm list -n production
helm status webapp -n production

# Check pods
kubectl get pods -n production -l app.kubernetes.io/instance=webapp

# View history
helm history webapp -n production

# Rollback
helm rollback webapp -n production

# Verify
kubectl get pods -n production -l app.kubernetes.io/instance=webapp -w
```

This should take about 1-2 minutes. Practice until it's automatic.

---

## Exam Tips and Best Practices (2:00)

**Timing: 23:00-25:00**

Final tips for using Helm effectively in the CKAD exam:

**Before the Exam:**
- Practice typing Helm commands without auto-completion
- Memorize common chart repositories (bitnami, nginx, etc.)
- Know how to quickly search for charts and view their values
- Practice the most common scenarios until they're muscle memory

**During the Exam:**
- Use --dry-run to validate before applying
- Always specify namespace with -n flag
- Use --create-namespace to save time
- Verify immediately after installing or upgrading
- Don't spend time on complex chart customization - use --set
- If a chart isn't working, move on and come back if time permits

**Common Mistakes to Avoid:**
- Forgetting --reuse-values during upgrades
- Not specifying namespace (defaults to default namespace)
- Trying to create complex values files under time pressure
- Not verifying the deployment after Helm commands
- Forgetting to update repo indexes before searching

**Time Management:**
- Simple install: 2-3 minutes
- Upgrade: 1-2 minutes
- Rollback: 1 minute
- Troubleshooting: 3-5 minutes

**Remember:**
- Helm creates standard Kubernetes objects
- You can use kubectl to inspect and troubleshoot
- The exam documentation includes Helm references
- Speed comes from practice, not memorization

---

## Summary and Next Steps (1:00)

Let's recap the CKAD essentials for Helm:

**Must Know:**
- helm install/upgrade/rollback/uninstall commands
- Using --set flags for quick value overrides
- Using --reuse-values for upgrades
- Basic troubleshooting with helm status and kubectl
- Working with chart repositories

**Practice Focus:**
- Timed deployments (target: under 3 minutes)
- Upgrade scenarios (target: under 2 minutes)
- Quick troubleshooting (target: under 5 minutes)

**Next Steps:**
- Complete practice exercises multiple times
- Time yourself on each scenario
- Practice without looking at notes
- Combine Helm with other CKAD topics

Remember: Helm is just one tool in the CKAD exam. Don't spend disproportionate time on it. Master the basics, practice for speed, and move on to other topics.

Good luck with your CKAD preparation!
