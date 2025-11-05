# Kustomize Introduction - Concept Slideshow
**Duration: 10-12 minutes**

---

## Slide 1: Title Slide (0:30)

Welcome to this introduction to Kustomize, a template-free way to customize Kubernetes application configurations. In this session, we'll explore how Kustomize enables you to manage environment-specific configurations without the complexity of templating.

Kustomize is a required topic for the CKAD exam. Unlike Helm, which is supplementary, you must understand Kustomize to succeed on the exam.

---

## Slide 2: The Configuration Management Challenge (1:00)

Managing Kubernetes applications across multiple environments presents challenges.

Consider a typical scenario: you have the same application deployed to development, staging, and production. Each environment needs different configurations:
- Development: 1 replica, NodePort service, debug logging
- Staging: 3 replicas, LoadBalancer service, info logging
- Production: 5 replicas, LoadBalancer with specific IPs, resource limits, error logging

Without a management tool, you face these issues:
- Duplicating YAML files for each environment
- Risk of configuration drift between environments
- Difficulty tracking what's different between environments
- Manual effort to keep common configurations synchronized
- No clear relationship between environment configs

Kustomize solves these problems with a declarative, overlay-based approach.

---

## Slide 3: What is Kustomize? (1:00)

Kustomize is a configuration management tool that works without templates.

Key characteristics:
- Built into kubectl (version 1.14+) - no separate installation needed
- Works with standard Kubernetes YAML files
- Uses overlays and patches to customize base configurations
- No special template syntax to learn
- Purely declarative - everything is YAML

The fundamental principle: define a base configuration, then create overlays that modify that base for specific environments.

Importantly, Kustomize doesn't generate or modify your files on disk. It processes them in memory and sends the result to kubectl, keeping your source files clean and readable.

---

## Slide 4: Kustomize vs Helm (1:00)

Let's understand when to use Kustomize versus Helm.

**Kustomize strengths:**
- Simpler learning curve - just YAML
- Built into kubectl - no extra tools
- Template-free - easier to read and maintain
- Perfect for environment-specific configurations
- Better for GitOps workflows

**Helm strengths:**
- Package distribution via repositories
- Chart versioning
- Complex logic in templates
- Community ecosystem of shared applications
- Better for third-party application deployment

**In practice:**
Many teams use both. Helm for third-party applications (databases, monitoring, message queues) and Kustomize for their own application configurations across environments.

**For CKAD:**
You must know both. Kustomize is required, Helm is supplementary. Kustomize questions are more likely on the exam.

---

## Slide 5: Core Concept - Base (1:30)

The base is your common configuration that applies to all environments.

A base contains:
- Standard Kubernetes YAML files (Deployments, Services, ConfigMaps, etc.)
- A kustomization.yaml file listing the resources

The base should be generic enough to work in any environment. Think of it as your "default" or "reference" configuration.

Example base structure:
```
base/
├── kustomization.yaml
├── deployment.yaml
└── service.yaml
```

The kustomization.yaml file is simple:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
```

This tells Kustomize which files to include. The base contains no environment-specific details - those come from overlays.

---

## Slide 6: Core Concept - Overlays (1:30)

Overlays customize the base for specific environments.

An overlay:
- References a base configuration
- Applies environment-specific changes
- Can add, modify, or patch any aspect of the base

Example overlay structure:
```
overlays/
├── dev/
│   └── kustomization.yaml
├── staging/
│   └── kustomization.yaml
└── prod/
    ├── kustomization.yaml
    └── resources-patch.yaml
```

Each overlay's kustomization.yaml references the base and applies customizations:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namePrefix: prod-
namespace: production
replicas:
  - name: myapp
    count: 5
```

This overlay:
- Uses the base configuration
- Adds "prod-" prefix to resource names
- Deploys to production namespace
- Sets 5 replicas

The beauty: each overlay is small and focused on differences, while the base contains the common configuration.

---

## Slide 7: Core Concept - Patches (1:30)

Patches provide fine-grained control over specific fields.

Kustomize supports two types of patches:

**Strategic Merge Patches:**
Standard YAML that merges with the base. Only specify fields you want to change:
```yaml
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
```

**JSON Patches (RFC 6902):**
Precise operations for complex modifications:
```yaml
- op: replace
  path: /spec/replicas
  value: 3
- op: add
  path: /spec/template/spec/containers/0/env/-
  value:
    name: LOG_LEVEL
    value: debug
```

Strategic merge patches are simpler and more common. JSON patches are for complex scenarios where you need surgical precision.

For CKAD, focus on strategic merge patches - they're more intuitive and cover most use cases.

---

## Slide 8: Kustomization Features (1:30)

The kustomization.yaml file supports many transformations.

**Common transformations:**

**namePrefix/nameSuffix:**
Add prefixes or suffixes to resource names:
```yaml
namePrefix: dev-
nameSuffix: -v2
```

**namespace:**
Set namespace for all resources:
```yaml
namespace: production
```

**commonLabels:**
Add labels to all resources:
```yaml
commonLabels:
  environment: production
  team: backend
```

**images:**
Update container image tags:
```yaml
images:
  - name: myapp
    newTag: v2.0.1
```

**replicas:**
Set replica counts:
```yaml
replicas:
  - name: myapp
    count: 5
```

**configMapGenerator/secretGenerator:**
Generate ConfigMaps and Secrets from files or literals:
```yaml
configMapGenerator:
  - name: app-config
    literals:
      - LOG_LEVEL=info
      - MAX_CONNECTIONS=100
```

These built-in features handle most customization needs without patches.

---

## Slide 9: How Kustomize Works (1:00)

Let's understand the Kustomize workflow.

When you run `kubectl apply -k overlays/prod/`:

1. Kustomize reads the overlay's kustomization.yaml
2. It reads the base configuration referenced by the overlay
3. It applies all transformations in order:
   - Name prefixes/suffixes
   - Namespace changes
   - Label additions
   - Image updates
   - Replica changes
   - Patches
4. It generates final YAML in memory
5. It sends that YAML to kubectl
6. kubectl applies it to the cluster

You can preview the generated YAML without applying:
```bash
kubectl kustomize overlays/prod/
```

This shows exactly what will be sent to the cluster - perfect for debugging.

The key insight: Kustomize processes everything in memory. Your source files remain unchanged, making them safe for version control.

---

## Slide 10: Kustomize in Practice (1:00)

How do teams typically use Kustomize?

**Common structure:**
```
.
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── overlays/
    ├── dev/
    │   └── kustomization.yaml
    ├── staging/
    │   ├── kustomization.yaml
    │   └── replica-patch.yaml
    └── prod/
        ├── kustomization.yaml
        ├── replica-patch.yaml
        └── resources-patch.yaml
```

**Deployment workflow:**
```bash
# Deploy to dev
kubectl apply -k overlays/dev

# Deploy to staging
kubectl apply -k overlays/staging

# Deploy to production
kubectl apply -k overlays/prod
```

**Version control:**
Everything goes in git. Base and overlays track together. When you update the base, all overlays inherit the change automatically.

**GitOps integration:**
Kustomize works perfectly with GitOps tools like ArgoCD and Flux. They can watch overlay directories and automatically deploy changes.

---

## Slide 11: Best Practices (1:00)

Guidelines for effective Kustomize usage:

**Keep the base generic:**
The base should work for any environment. No environment-specific values, names, or namespaces in the base.

**Small, focused overlays:**
Each overlay should only define what's different. Don't duplicate the entire base configuration.

**Prefer built-in transformations:**
Use namePrefix, replicas, images, etc. instead of patches when possible. They're simpler and less error-prone.

**Use patches sparingly:**
Patches are powerful but can be hard to understand. Use them only when built-in features can't handle your needs.

**Test locally:**
Always run `kubectl kustomize` to preview before applying. Catch errors early.

**Namespace isolation:**
Use different namespaces for each environment. This provides separation and allows running multiple environments in one cluster.

**Consistent labeling:**
Add common labels through kustomization.yaml. This makes filtering and cleanup easier.

---

## Slide 12: Kustomize and CKAD (1:00)

For the CKAD exam, focus on these essential skills:

**Must know:**
- Creating kustomization.yaml files from scratch
- Using kubectl apply -k to deploy
- Understanding base/overlay pattern
- Common transformations: namePrefix, namespace, replicas, images
- Creating simple strategic merge patches
- Using kubectl kustomize to preview

**Exam expectations:**
- Create a kustomization for existing YAML files
- Add overlays for different environments
- Modify image tags or replica counts via overlay
- Troubleshoot kustomization errors
- Understand kustomization structure

**Time-saving tips:**
- Use kubectl kustomize to validate syntax
- Know common kustomization.yaml fields by heart
- Practice creating overlays quickly
- Understand error messages

The exam is performance-based. You'll work with real kustomization files, not theoretical questions. Practice is essential.

---

## Slide 13: Summary and Next Steps (0:30)

Let's recap the key concepts:
- Kustomize manages configurations without templates
- Base contains common configuration
- Overlays customize for specific environments
- Patches enable fine-grained modifications
- Built into kubectl - no extra installation
- Perfect for environment-specific configurations
- Required knowledge for CKAD exam

In our next session, we'll work through hands-on exercises deploying applications with Kustomize across multiple environments, putting these concepts into practice.

Thank you for your attention.
