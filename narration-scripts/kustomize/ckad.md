# Kustomize - CKAD Exam Preparation
**Duration: 18-22 minutes**

---

## Introduction (1:00)

Welcome to the CKAD exam preparation session for Kustomize. Unlike Helm which is supplementary, Kustomize is a required topic for CKAD certification. You will encounter Kustomize questions on the exam.

In this session, we'll focus on:
- CKAD-specific Kustomize skills
- Fast kustomization creation techniques
- Common exam scenarios
- Troubleshooting approaches
- Timed practice exercises

The CKAD exam is performance-based with strict time limits. Kustomize skills must be fast and accurate. Let's focus on what matters for exam success.

---

## CKAD Exam Scope for Kustomize (2:00)

**Timing: 0:00-3:00**

Let's clarify exactly what you need to know.

**Essential Skills:**
- Creating kustomization.yaml files from scratch
- Using kubectl apply -k to deploy
- Creating base configurations
- Creating overlays for different environments
- Using common transformations: namePrefix, namespace, replicas, images
- Creating simple strategic merge patches
- Using kubectl kustomize to preview and validate
- Troubleshooting kustomization errors

**Important - But Less Critical:**
- JSON patches (RFC 6902)
- ConfigMap/Secret generators
- Complex patch scenarios
- Advanced kustomization features

**NOT Required:**
- Kustomize standalone CLI (exam uses kubectl built-in)
- Remote bases
- Complex component compositions
- Kustomize plugins

**Exam Context:**
Kustomize questions typically appear as:
- "Create a kustomization for these YAML files"
- "Modify the deployment in environment X to use Y replicas"
- "Create overlays for dev and prod environments"
- "Fix the broken kustomization"

You must be fast and accurate. Practice is essential.

---

## Essential Kustomization Structure (2:00)

**Timing: 3:00-5:00**

Let's memorize the core kustomization.yaml structure.

**Minimal kustomization.yaml:**
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
```

This is the absolute minimum - just listing resources.

**Common overlay kustomization.yaml:**
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
  - ../../base

namePrefix: prod-
namespace: production

commonLabels:
  environment: production

replicas:
  - name: myapp
    count: 5

images:
  - name: myapp
    newTag: v2.0.0
```

**With patches:**
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
  - ../../base

patchesStrategicMerge:
  - replica-patch.yaml
  - resources-patch.yaml
```

Memorize these structures. You should be able to write them from memory in under 30 seconds.

---

## Time-Saving Techniques (3:00)

**Timing: 5:00-8:00**

Speed is critical in the CKAD exam. Here are techniques to work faster.

**Technique 1: Quick Base Creation**

Don't create files one by one. Use kubectl to generate base YAML:

```bash
# Create base directory
mkdir -p base

# Generate deployment YAML
kubectl create deployment myapp --image=nginx --dry-run=client -o yaml > base/deployment.yaml

# Generate service YAML
kubectl create service clusterip myapp --tcp=80:80 --dry-run=client -o yaml > base/service.yaml

# Create kustomization
cat > base/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
EOF
```

This creates a complete base in seconds.

**Technique 2: Quick Overlay Creation**

Use heredoc to create overlays quickly:

```bash
mkdir -p overlays/prod

cat > overlays/prod/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namePrefix: prod-
namespace: production
replicas:
  - name: myapp
    count: 5
EOF
```

**Technique 3: Validate Immediately**

Always validate before applying:

```bash
kubectl kustomize overlays/prod/
```

If there's an error, you'll see it immediately without applying to the cluster.

**Technique 4: Use Built-in Features First**

Before writing a patch:
- Need to change replicas? Use replicas field
- Need to change image tag? Use images field
- Need to add labels? Use commonLabels field
- Need name prefix? Use namePrefix field

Patches are slower to write. Use built-in features when possible.

**Technique 5: Quick Strategic Merge Patch**

When you do need a patch:

```bash
cat > overlays/prod/resources-patch.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
      - name: myapp
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
EOF
```

Only include the fields you're changing, not the entire resource.

---

## Common Exam Scenarios (6:00)

**Timing: 8:00-14:00**

Let's walk through typical CKAD scenarios.

**Scenario 1: Create Base Configuration**

Task: "Create a base kustomization for the YAML files in the /app directory."

Given files: deployment.yaml, service.yaml, configmap.yaml

Solution:
```bash
cd /app

cat > kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
  - configmap.yaml
EOF

# Validate
kubectl kustomize .

# Apply
kubectl apply -k .
```

Time: 1 minute

**Scenario 2: Create Production Overlay**

Task: "Create a production overlay that deploys the app with 5 replicas, prod- prefix, in production namespace, using image tag v2.0."

Solution:
```bash
mkdir -p overlays/prod

cat > overlays/prod/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namePrefix: prod-
namespace: production
replicas:
  - name: myapp
    count: 5
images:
  - name: nginx
    newTag: v2.0
EOF

# Create namespace
kubectl create namespace production

# Validate
kubectl kustomize overlays/prod

# Apply
kubectl apply -k overlays/prod
```

Time: 2-3 minutes

**Scenario 3: Add Resource Limits via Patch**

Task: "Modify the production overlay to add resource limits: 512Mi memory, 500m CPU."

Solution:
```bash
cat > overlays/prod/resources-patch.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
      - name: myapp
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
EOF

# Update kustomization to include patch
cat >> overlays/prod/kustomization.yaml <<EOF
patchesStrategicMerge:
  - resources-patch.yaml
EOF

# Validate and apply
kubectl kustomize overlays/prod
kubectl apply -k overlays/prod
```

Time: 2-3 minutes

**Scenario 4: Create Multiple Environment Overlays**

Task: "Create dev, staging, and prod overlays with 1, 3, and 5 replicas respectively."

Solution:
```bash
# Dev overlay
mkdir -p overlays/dev
cat > overlays/dev/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namePrefix: dev-
namespace: dev
replicas:
  - name: myapp
    count: 1
EOF

# Staging overlay
mkdir -p overlays/staging
cat > overlays/staging/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namePrefix: staging-
namespace: staging
replicas:
  - name: myapp
    count: 3
EOF

# Production overlay
mkdir -p overlays/prod
cat > overlays/prod/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namePrefix: prod-
namespace: production
replicas:
  - name: myapp
    count: 5
EOF

# Create namespaces and deploy
kubectl create namespace dev staging production
kubectl apply -k overlays/dev
kubectl apply -k overlays/staging
kubectl apply -k overlays/prod
```

Time: 4-5 minutes

---

## Troubleshooting Kustomize (3:00)

**Timing: 14:00-17:00**

Quick troubleshooting workflow for exam scenarios.

**Error: "no such file or directory"**

Problem: kustomization.yaml references non-existent file

Solution:
```bash
# Check what files exist
ls -la

# Verify resources list matches actual files
cat kustomization.yaml

# Fix the kustomization.yaml to reference correct files
```

**Error: "failed to find an object with apps_v1_Deployment|myapp"**

Problem: Patch references wrong resource name

Solution:
```bash
# Check actual resource name in base
grep "name:" base/deployment.yaml

# Update patch to use correct name
# The name in the patch must match the name in the base
```

**Error: "accumulating resources: accumulation err"**

Problem: Invalid base path in overlay

Solution:
```bash
# Check relative path to base
# From overlays/prod/, base is ../../base
# From overlays/dev/region/, base is ../../../base

# Fix the bases path in kustomization.yaml
```

**Error: "invalid image"**

Problem: Incorrect image syntax in kustomization

Solution:
```bash
# Correct syntax:
images:
  - name: nginx          # Original image name
    newTag: v2.0         # New tag
  # OR
  - name: nginx
    newName: mynginx     # New image name
    newTag: v2.0

# Common mistake:
images:
  - name: nginx:latest   # Don't include tag in name
    newTag: v2.0
```

**Debugging Technique:**

Always use `kubectl kustomize` to see what will be applied:

```bash
kubectl kustomize overlays/prod/

# If error, fix and retry
# Once valid, apply
kubectl apply -k overlays/prod/
```

---

## Practice Exercise 1: Complete Setup (3:00)

**Timing: 17:00-20:00**

Timed exercise - you have 3 minutes.

**Task:**
Create a complete kustomize setup:
- Base with nginx deployment (2 replicas) and service
- Dev overlay: dev-, dev namespace, 1 replica
- Prod overlay: prod-, production namespace, 3 replicas, image tag 1.25
- Deploy both environments

**Start timing...**

**Solution:**
```bash
# Create base
mkdir -p base
kubectl create deployment nginx --image=nginx --replicas=2 --dry-run=client -o yaml > base/deployment.yaml
kubectl create service clusterip nginx --tcp=80:80 --dry-run=client -o yaml > base/service.yaml

cat > base/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
EOF

# Create dev overlay
mkdir -p overlays/dev
cat > overlays/dev/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namePrefix: dev-
namespace: dev
replicas:
  - name: nginx
    count: 1
EOF

# Create prod overlay
mkdir -p overlays/prod
cat > overlays/prod/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namePrefix: prod-
namespace: production
replicas:
  - name: nginx
    count: 3
images:
  - name: nginx
    newTag: "1.25"
EOF

# Deploy
kubectl create namespace dev production
kubectl apply -k overlays/dev
kubectl apply -k overlays/prod

# Verify
kubectl get pods -n dev
kubectl get pods -n production

# Cleanup
kubectl delete -k overlays/dev
kubectl delete -k overlays/prod
kubectl delete namespace dev production
rm -rf base overlays
```

How did you do? Target time is 3 minutes. Practice until you can complete it comfortably.

---

## Practice Exercise 2: Fix Broken Kustomization (2:00)

**Timing: 20:00-22:00**

**Scenario:**
A kustomization is failing with errors. Fix it.

**Broken kustomization:**
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../base
namePrefix: prod-
namespace: production
replicas:
  - name: webapp
    count: 5
images:
  - name: myapp:latest
    newTag: v2.0
```

**Problems:**
1. Base path might be wrong (depends on directory structure)
2. Image name includes tag (should be just image name)
3. Need to verify replica name matches deployment

**Solution process:**
```bash
# Validate
kubectl kustomize .

# Error: invalid image
# Fix images section:
images:
  - name: myapp
    newTag: v2.0

# Validate again
kubectl kustomize .

# Error: failed to find object
# Fix replicas - check actual deployment name:
grep "name:" ../base/deployment.yaml

# Update replicas to match
replicas:
  - name: myapp  # Must match actual deployment name
    count: 5

# Validate final
kubectl kustomize .

# Apply
kubectl apply -k .
```

---

## Exam Tips and Best Practices (1:00)

**Before the Exam:**
- Practice creating kustomization.yaml from memory
- Know the base/overlay directory structure by heart
- Practice common transformations without looking them up
- Time yourself on standard scenarios

**During the Exam:**
- Use kubectl kustomize to validate before applying
- Start with built-in features, use patches only if needed
- Create namespaces before applying overlays
- Check resource names match between base and patches
- Use heredoc for quick file creation

**Common Mistakes to Avoid:**
- Including tag in image name (images field)
- Wrong relative path to base in overlays
- Patch resource name doesn't match base
- Forgetting apiVersion and kind in kustomization.yaml
- Not validating before applying

**Time Allocation:**
- Create base: 1-2 minutes
- Create simple overlay: 1 minute
- Create overlay with patch: 2-3 minutes
- Troubleshoot issue: 2-3 minutes

**Key Command:**
```bash
kubectl kustomize <dir>  # Preview and validate
kubectl apply -k <dir>   # Apply
kubectl delete -k <dir>  # Delete
```

---

## Summary (1:00)

**Essential Knowledge:**
- kustomization.yaml structure (apiVersion, kind, resources)
- Base and overlay pattern
- Common transformations: namePrefix, namespace, replicas, images
- Strategic merge patches for complex changes
- kubectl apply -k and kubectl kustomize commands

**Practice Focus:**
- Create base configurations quickly (target: 1-2 minutes)
- Create overlays from memory (target: 1 minute)
- Add patches when needed (target: 2 minutes)
- Debug broken kustomizations (target: 2-3 minutes)

**Key Success Factors:**
- Speed comes from practice, not theory
- Use kubectl kustomize to validate everything
- Know the structure by heart - no time to look it up
- Prefer built-in features over patches
- Practice complete scenarios end-to-end

Kustomize is a required CKAD topic. You must be comfortable and fast with it. Practice the scenarios in this session until they're automatic, then practice more.

Good luck with your CKAD preparation!
