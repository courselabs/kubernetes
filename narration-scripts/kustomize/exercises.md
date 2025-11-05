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
```
base/
├── kustomization.yaml
├── deployment.yaml
└── service.yaml
```

Let me examine the kustomization.yaml file:

The kustomization file lists the resources to include - it's very simple. Just a list of YAML files.

Now looking at the deployment.yaml, this is standard Kubernetes YAML. No special syntax, no template variables. Just a regular Deployment with 2 replicas running the whoami image.

The service.yaml is also standard - a ClusterIP service exposing port 8080.

This is the power of Kustomize: the base configuration is pure, readable Kubernetes YAML. Anyone can understand it without learning a template language.

Let's deploy this base configuration directly:

```bash
kubectl apply -k labs/kustomize/specs/base
```

The `-k` flag tells kubectl to process the kustomization.yaml file in that directory.

Let's see what was created:

```bash
kubectl get all -l app=whoami
```

We have a deployment with 2 replicas and a service. Let's check the image tag:

```bash
kubectl get pods -l app=whoami -o jsonpath='{.items[0].spec.containers[0].image}'
```

This shows the base image tag. Notice the objects don't have any environment-specific naming or configuration.

Now let's delete this base deployment to prepare for using overlays:

```bash
kubectl delete -k labs/kustomize/specs/base
```

The `-k` flag works with delete too, removing everything defined in the kustomization.

---

## Exercise 2: Development Environment Overlay (2:30)

**Timing: 2:30-5:00**

Now let's deploy to a development environment using an overlay.

Looking at the dev overlay structure:
```
overlays/dev/
└── kustomization.yaml
```

The dev overlay kustomization references the base and applies customizations:
- References ../../base (relative path to base)
- Adds "dev-" prefix to all resource names
- Sets namespace to "dev"

This is a simple overlay - just name and namespace changes, no patches needed.

Let's create the dev namespace and deploy:

```bash
kubectl create namespace dev

kubectl apply -k labs/kustomize/specs/overlays/dev
```

Check what was created:

```bash
kubectl get all -n dev
```

Perfect! Notice all resources have the "dev-" prefix. Let's verify the deployment details:

```bash
kubectl get deployment -n dev -o wide
```

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

```bash
kubectl create namespace staging

kubectl apply -k labs/kustomize/specs/overlays/staging
```

Now let's compare dev and staging:

```bash
kubectl get deploy -n dev dev-whoami -o jsonpath='{.spec.replicas}'
echo " replicas in dev"

kubectl get deploy -n staging staging-whoami -o jsonpath='{.spec.replicas}'
echo " replicas in staging"

kubectl get deploy -n staging staging-whoami -o jsonpath='{.spec.template.spec.containers[0].image}'
```

Excellent! Staging has 3 replicas (vs 2 in dev) and uses a different image tag. All from a simple overlay that only specifies the differences.

This demonstrates Kustomize's efficiency: the base contains common configuration, overlays contain only environment-specific changes. No duplication, easy to maintain.

---

## Exercise 4: Production Environment with Patches (3:00)

**Timing: 7:30-10:30**

Production requires more configuration: higher replica count, resource limits, and specific labels. This needs patches.

Looking at the prod overlay structure:
```
overlays/prod/
├── kustomization.yaml
├── replica-patch.yaml
└── resources-patch.yaml
```

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

```bash
kubectl create namespace production

kubectl apply -k labs/kustomize/specs/overlays/prod
```

Inspect the production deployment:

```bash
kubectl get deploy -n production prod-whoami -o jsonpath='{.spec.replicas}'
echo " replicas in production"

kubectl get deploy -n production -o yaml | grep -A 10 resources:
```

Perfect! Production has 5 replicas and resource limits applied through the patches.

Let's also view what Kustomize generated before it was applied. This is useful for debugging:

```bash
kubectl kustomize labs/kustomize/specs/overlays/prod
```

This shows the complete YAML that was sent to kubectl. You can see all the overlays and patches merged together with the base.

---

## Exercise 5: Understanding Kustomize Features (2:00)

**Timing: 10:30-12:30**

Let's explore some other Kustomize features briefly.

**ConfigMap Generation:**

Kustomize can generate ConfigMaps from literals or files:

```yaml
configMapGenerator:
  - name: app-config
    literals:
      - APP_ENV=production
      - LOG_LEVEL=info
```

This creates a ConfigMap with a hash suffix for versioning. When values change, a new ConfigMap is created, triggering pod restarts.

**Common Labels:**

Add labels to all resources:

```yaml
commonLabels:
  environment: production
  team: platform
```

These labels are applied to every resource in the kustomization, making filtering and management easier.

**Name Prefixes and Suffixes:**

We've seen namePrefix in action. nameSuffix works the same way:

```yaml
namePrefix: prod-
nameSuffix: -v2
```

This would create resources named "prod-whoami-v2".

**JSON Patches:**

For complex modifications, use JSON patches:

```yaml
patchesJson6902:
  - target:
      group: apps
      version: v1
      kind: Deployment
      name: myapp
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 3
```

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

```bash
mkdir -p labs/kustomize/specs/overlays/qa
```

Now create the kustomization.yaml file:

```bash
cat > labs/kustomize/specs/overlays/qa/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
  - ../../base

namePrefix: qa-

namespace: qa

commonLabels:
  environment: qa

replicas:
  - name: whoami
    count: 4

images:
  - name: sixeyed/whoami:latest
    newTag: v1-alpine
EOF
```

Let me preview what this will generate:

```bash
kubectl kustomize labs/kustomize/specs/overlays/qa
```

Looking at the output:
- Resources have "qa-" prefix
- Namespace is set to "qa"
- Labels include "environment: qa"
- Replicas set to 4
- Image tag is v1-alpine

Perfect! Now let's deploy:

```bash
kubectl create namespace qa

kubectl apply -k labs/kustomize/specs/overlays/qa
```

Verify the deployment:

```bash
kubectl get all -n qa

kubectl get deploy -n qa qa-whoami -o jsonpath='{.spec.replicas}'
echo " replicas"

kubectl get deploy -n qa qa-whoami -o jsonpath='{.spec.template.spec.containers[0].image}'

kubectl get deploy -n qa qa-whoami -o jsonpath='{.metadata.labels.environment}'
```

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
```bash
kubectl apply -k <directory>
```

**View generated YAML without applying:**
```bash
kubectl kustomize <directory>
```

**Delete resources from a kustomization:**
```bash
kubectl delete -k <directory>
```

**Validate kustomization structure:**
```bash
kubectl kustomize <directory> > /dev/null && echo "Valid"
```

**Compare differences between overlays:**
```bash
diff <(kubectl kustomize overlays/dev) <(kubectl kustomize overlays/prod)
```

The `-k` flag is the key to remember. It works with apply, delete, diff, and other kubectl commands.

---

## Cleanup and Summary (1:00)

**Timing: 17:30-18:30**

Let's clean up all our environments:

```bash
kubectl delete -k labs/kustomize/specs/overlays/dev
kubectl delete -k labs/kustomize/specs/overlays/staging
kubectl delete -k labs/kustomize/specs/overlays/prod
kubectl delete -k labs/kustomize/specs/overlays/qa

kubectl delete namespace dev staging production qa
```

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
