# Kustomize Exercises - Practical Demo
**Duration: 15-18 minutes**

---

## Setup and Introduction (0:30)

Welcome to the hands-on Kustomize exercises. In this session, we'll manage application configurations across multiple environments using Kustomize's base and overlay pattern.

We'll be working with:
- Deploying base configurations
- Creating environment-specific overlays
- Using patches for complex customizations
- Viewing generated YAML
- Completing a lab challenge

Let's begin by exploring the base configuration.

---

## Exercise 1: Understanding the Base Configuration (2:00)

**Timing: 0:30-2:30**

First, let's examine the base configuration structure. We have a whoami application that we'll deploy to multiple environments.

Looking at the base directory structure:


Let me examine the kustomization.yaml file:

The kustomization file lists the resources to include - it's very simple. Just a list of YAML files.

Now looking at the deployment.yaml, this is standard Kubernetes YAML. No special syntax, no template variables. Just a regular Deployment with 2 replicas running the whoami image.

The service.yaml is also standard - a ClusterIP service exposing port 8080.

This is the power of Kustomize: the base configuration is pure, readable Kubernetes YAML. Anyone can understand it without learning a template language.

Let's deploy this base configuration directly:


The `-k` flag tells kubectl to process the kustomization.yaml file in that directory.

Let's see what was created:


We have a deployment with 2 replicas and a service. Let's check the image tag:


This shows the base image tag. Notice the objects don't have any environment-specific naming or configuration.

Now let's delete this base deployment to prepare for using overlays:


The `-k` flag works with delete too, removing everything defined in the kustomization.

---

## Exercise 2: Development Environment Overlay (2:30)

**Timing: 2:30-5:00**

Now let's deploy to a development environment using an overlay.

Looking at the dev overlay structure:


The dev overlay kustomization references the base and applies customizations:
- References ../../base (relative path to base)
- Adds "dev-" prefix to all resource names
- Sets namespace to "dev"

This is a simple overlay - just name and namespace changes, no patches needed.

Let's create the dev namespace and deploy:


Check what was created:


Perfect! Notice all resources have the "dev-" prefix. Let's verify the deployment details:


The replica count and image tag come from the base configuration. The overlay only changed the name prefix and namespace. This is exactly what we want - reuse the base, customize only what's different.

---

## Exercise 3: Staging Environment Overlay (2:30)

**Timing: 5:00-7:30**

The staging environment needs different configuration: more replicas and a different image tag.

Looking at the staging overlay kustomization:
- References the base
- Adds "staging-" prefix
- Sets namespace to "staging"
- Overrides replicas to 3
- Changes image tag using the images field

The images field is a Kustomize built-in feature for updating container image tags. No patch needed.

Let's deploy to staging:


Now let's compare dev and staging:


Excellent! Staging has 3 replicas (vs 2 in dev) and uses a different image tag. All from a simple overlay that only specifies the differences.

This demonstrates Kustomize's efficiency: the base contains common configuration, overlays contain only environment-specific changes. No duplication, easy to maintain.

---

## Exercise 4: Production Environment with Patches (3:00)

**Timing: 7:30-10:30**

Production requires more configuration: higher replica count, resource limits, and specific labels. This needs patches.

Looking at the prod overlay structure:


The kustomization references:
- The base
- Two patch files
- Adds "prod-" prefix
- Sets namespace to "production"

Let's examine the patches:

The replica-patch.yaml increases replicas to 5. This is a strategic merge patch - just specify the fields to change.

The resources-patch.yaml adds resource limits and requests. Again, only specifying what needs to change.

Strategic merge patches are intuitive: write YAML for the fields you want to modify, and Kustomize merges it with the base.

Let's deploy to production:


Inspect the production deployment:


Perfect! Production has 5 replicas and resource limits applied through the patches.

Let's also view what Kustomize generated before it was applied. This is useful for debugging:


This shows the complete YAML that was sent to kubectl. You can see all the overlays and patches merged together with the base.

---

## Exercise 5: Understanding Kustomize Features (2:00)

**Timing: 10:30-12:30**

Let's explore some other Kustomize features briefly.

**ConfigMap Generation:**

Kustomize can generate ConfigMaps from literals or files:


This creates a ConfigMap with a hash suffix for versioning. When values change, a new ConfigMap is created, triggering pod restarts.

**Common Labels:**

Add labels to all resources:


These labels are applied to every resource in the kustomization, making filtering and management easier.

**Name Prefixes and Suffixes:**

We've seen namePrefix in action. nameSuffix works the same way:


This would create resources named "prod-whoami-v2".

**JSON Patches:**

For complex modifications, use JSON patches:


JSON patches give surgical precision but are more complex. Use strategic merge patches when possible.

For CKAD, focus on strategic merge patches and built-in transformations. They cover most scenarios.

---

## Exercise 6: Lab Challenge - QA Environment (4:00)

**Timing: 12:30-16:30**

Now for the lab challenge. Create a new overlay for a QA environment with these requirements:
- Namespace: qa
- Name prefix: qa-
- Replicas: 4
- Custom label: environment=qa
- Image tag: v1-alpine

Let me work through this step by step:

First, create the overlay directory structure:


Now create the kustomization.yaml file:


Let me preview what this will generate:


Looking at the output:
- Resources have "qa-" prefix
- Namespace is set to "qa"
- Labels include "environment: qa"
- Replicas set to 4
- Image tag is v1-alpine

Perfect! Now let's deploy:


Verify the deployment:


Excellent! All requirements met:
- QA namespace
- qa- prefix on resources
- 4 replicas
- environment=qa label
- v1-alpine image tag

This demonstrates how quickly you can create new environments with Kustomize. The entire overlay is about 15 lines of YAML.

---

## Common Kustomize Commands (1:00)

**Timing: 16:30-17:30**

Let's review the essential Kustomize commands:

**Apply a kustomization:**


**View generated YAML without applying:**


**Delete resources from a kustomization:**


**Validate kustomization structure:**


**Compare differences between overlays:**


The `-k` flag is the key to remember. It works with apply, delete, diff, and other kubectl commands.

---

## Cleanup and Summary (1:00)

**Timing: 17:30-18:30**

Let's clean up all our environments:


Let's review what we've covered:

**Key Concepts:**
- Base configuration with common settings
- Overlays for environment-specific customization
- Built-in transformations: namePrefix, namespace, replicas, images
- Strategic merge patches for complex changes
- ConfigMap and Secret generators

**Best Practices:**
- Keep base generic and environment-agnostic
- Make overlays small and focused on differences
- Use built-in features before resorting to patches
- Preview with kubectl kustomize before applying
- Version control everything - base and overlays

**CKAD Relevance:**
- Required exam topic
- Must know kustomization.yaml structure
- Practice creating overlays quickly
- Understand error messages
- Know how to troubleshoot kustomization issues

You now have hands-on experience with Kustomize across multiple environments. In the next session, we'll focus on CKAD exam-specific scenarios and time-saving techniques.

Thank you for following along with these exercises.
