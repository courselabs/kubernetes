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

This is the absolute minimum - just listing resources.

**Common overlay kustomization.yaml:**

**With patches:**

Memorize these structures. You should be able to write them from memory in under 30 seconds.

---

## Time-Saving Techniques (3:00)

**Timing: 5:00-8:00**

Speed is critical in the CKAD exam. Here are techniques to work faster.

**Technique 1: Quick Base Creation**

Don't create files one by one. Use kubectl to generate base YAML:

This creates a complete base in seconds.

**Technique 2: Quick Overlay Creation**

Use heredoc to create overlays quickly:

**Technique 3: Validate Immediately**

Always validate before applying:

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

Only include the fields you're changing, not the entire resource.

---

## Common Exam Scenarios (6:00)

**Timing: 8:00-14:00**

Let's walk through typical CKAD scenarios.

**Scenario 1: Create Base Configuration**

Task: "Create a base kustomization for the YAML files in the /app directory."

Given files: deployment.yaml, service.yaml, configmap.yaml

Solution:

Time: 1 minute

**Scenario 2: Create Production Overlay**

Task: "Create a production overlay that deploys the app with 5 replicas, prod- prefix, in production namespace, using image tag v2.0."

Solution:

Time: 2-3 minutes

**Scenario 3: Add Resource Limits via Patch**

Task: "Modify the production overlay to add resource limits: 512Mi memory, 500m CPU."

Solution:

Time: 2-3 minutes

**Scenario 4: Create Multiple Environment Overlays**

Task: "Create dev, staging, and prod overlays with 1, 3, and 5 replicas respectively."

Solution:

Time: 4-5 minutes

---

## Troubleshooting Kustomize (3:00)

**Timing: 14:00-17:00**

Quick troubleshooting workflow for exam scenarios.

**Error: "no such file or directory"**

Problem: kustomization.yaml references non-existent file

Solution:

**Error: "failed to find an object with apps_v1_Deployment|myapp"**

Problem: Patch references wrong resource name

Solution:

**Error: "accumulating resources: accumulation err"**

Problem: Invalid base path in overlay

Solution:

**Error: "invalid image"**

Problem: Incorrect image syntax in kustomization

Solution:

**Debugging Technique:**

Always use  to see what will be applied:

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

How did you do? Target time is 3 minutes. Practice until you can complete it comfortably.

---

## Practice Exercise 2: Fix Broken Kustomization (2:00)

**Timing: 20:00-22:00**

**Scenario:**
A kustomization is failing with errors. Fix it.

**Broken kustomization:**

**Problems:**
1. Base path might be wrong (depends on directory structure)
2. Image name includes tag (should be just image name)
3. Need to verify replica name matches deployment

**Solution process:**

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
