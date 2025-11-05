# Managing Application Configuration with Kustomize

Kustomize is a template-free way to customize Kubernetes application configurations. Unlike Helm which uses templates, Kustomize works with standard Kubernetes YAML files and applies patches and overlays to create environment-specific variants. Kustomize is built into `kubectl` (from version 1.14+), making it a native Kubernetes tool for managing configuration across multiple environments.

## Reference

- [Kustomize documentation](https://kustomize.io/)

- [kubectl apply -k command](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/)

- [Kustomization file reference](https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/)

- [Kustomize GitHub repository](https://github.com/kubernetes-sigs/kustomize)

## API specs

- [Kustomization](https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/)

<details>
  <summary>YAML overview</summary>

## Kustomization.yaml Structure

A `kustomization.yaml` file declares the resources to manage and the transformations to apply:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# Resources to include
resources:
  - deployment.yaml
  - service.yaml

# Common labels applied to all resources
commonLabels:
  app: myapp
  managed-by: kustomize

# Namespace for all resources
namespace: default

# Name prefix/suffix for resources
namePrefix: dev-
```

## Base and Overlay Pattern

**Base** contains the common resource definitions:
```
base/
├── kustomization.yaml
├── deployment.yaml
└── service.yaml
```

**Overlays** reference the base and apply environment-specific patches:
```
overlays/
├── dev/
│   └── kustomization.yaml
├── staging/
│   └── kustomization.yaml
└── prod/
    ├── kustomization.yaml
    └── replica-patch.yaml
```

The overlay `kustomization.yaml` references the base:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# Reference to base
bases:
  - ../../base

# Environment-specific customizations
namePrefix: prod-
namespace: production

replicas:
  - name: myapp
    count: 5
```

</details><br/>

## Kustomize vs Helm

Before we start, let's understand when to use Kustomize vs Helm:

| Feature | Kustomize | Helm |
|---------|-----------|------|
| **Approach** | Overlay & patch existing YAML | Template with variables |
| **Learning Curve** | Simpler, uses standard YAML | Steeper, needs template syntax |
| **Built into kubectl** | Yes (kubectl apply -k) | No, separate CLI needed |
| **Package Management** | No built-in registry | Yes, Helm repositories |
| **Version Management** | No built-in versioning | Chart versions |
| **Use Case** | Same app, different environments | Distributable application packages |
| **CKAD Relevance** | Required exam topic | Required exam topic |

> **For CKAD**: You need to know both! Kustomize is perfect for environment-specific configs (dev/staging/prod), while Helm is better for packaging reusable applications.

## Create a Base Configuration

Let's start with a simple application - a web app that needs different configurations for dev, staging, and production.

First, look at the base resources:

- [base/deployment.yaml](./specs/base/deployment.yaml) - basic Deployment with default settings
- [base/service.yaml](./specs/base/service.yaml) - Service to expose the app
- [base/kustomization.yaml](./specs/base/kustomization.yaml) - Kustomization file listing the resources

📋 Apply the base configuration using `kubectl apply -k`

<details>
  <summary>Not sure how?</summary>

```
kubectl apply -k labs/kustomize/specs/base
```

The `-k` flag tells kubectl to look for a `kustomization.yaml` file and process it.

</details><br/>

Check what was created:

```
kubectl get all -l app=whoami

kubectl get pods -l app=whoami -o jsonpath='{.items[0].spec.containers[0].image}'
```

> You should see 2 replicas running with the base image tag. The objects have no environment-specific naming.

📋 Delete the base deployment to prepare for overlay usage

<details>
  <summary>Not sure how?</summary>

```
kubectl delete -k labs/kustomize/specs/base
```

</details><br/>

## Using Overlays for Different Environments

Now let's deploy environment-specific variants using overlays. Each overlay references the base and applies customizations.

### Development Environment

Look at the dev overlay:

- [overlays/dev/kustomization.yaml](./specs/overlays/dev/kustomization.yaml) - references base, adds `dev-` prefix, uses dev namespace

📋 Deploy the dev environment using the overlay

<details>
  <summary>Not sure how?</summary>

```
kubectl create namespace dev

kubectl apply -k labs/kustomize/specs/overlays/dev
```

</details><br/>

Check the dev resources:

```
kubectl get all -n dev

kubectl get deployment -n dev -o wide
```

> Notice the `dev-` prefix on all resource names. The image tag and replica count come from the base.

### Staging Environment

The staging overlay adds more replicas and changes the image tag:

- [overlays/staging/kustomization.yaml](./specs/overlays/staging/kustomization.yaml) - 3 replicas, staging namespace, different image tag

📋 Deploy the staging environment

<details>
  <summary>Not sure how?</summary>

```
kubectl create namespace staging

kubectl apply -k labs/kustomize/specs/overlays/staging
```

</details><br/>

Compare dev and staging:

```
kubectl get deploy -n dev dev-whoami -o jsonpath='{.spec.replicas}'

kubectl get deploy -n staging staging-whoami -o jsonpath='{.spec.replicas}'

kubectl get deploy -n staging staging-whoami -o jsonpath='{.spec.template.spec.containers[0].image}'
```

> Staging has more replicas and a different image tag, all managed through the overlay.

### Production Environment

Production needs the most configuration: more replicas, resource limits, and specific labels.

- [overlays/prod/kustomization.yaml](./specs/overlays/prod/kustomization.yaml) - references base and patches
- [overlays/prod/replica-patch.yaml](./specs/overlays/prod/replica-patch.yaml) - increases replicas
- [overlays/prod/resources-patch.yaml](./specs/overlays/prod/resources-patch.yaml) - adds resource limits

📋 Deploy the production environment

<details>
  <summary>Not sure how?</summary>

```
kubectl create namespace production

kubectl apply -k labs/kustomize/specs/overlays/prod
```

</details><br/>

Inspect the production deployment:

```
kubectl get deploy -n production -o yaml | grep -A 10 resources:

kubectl get deploy -n production prod-whoami -o jsonpath='{.spec.replicas}'
```

> Production has 5 replicas and resource limits applied through patches.

## Common Kustomize Features

### ConfigMap and Secret Generators

Kustomize can generate ConfigMaps and Secrets from files or literals:

```yaml
# In kustomization.yaml
configMapGenerator:
  - name: app-config
    literals:
      - APP_ENV=production
      - LOG_LEVEL=info
    files:
      - config.properties

secretGenerator:
  - name: app-secrets
    literals:
      - API_KEY=secret123
```

### Strategic Merge Patches

Patch specific fields without replacing the entire resource:

```yaml
# patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
        - name: myapp
          env:
            - name: ENVIRONMENT
              value: production
```

### JSON Patches (JSON 6902)

Precise modifications using JSON patch syntax:

```yaml
# In kustomization.yaml
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

## Viewing Generated YAML

You can see what Kustomize will generate without applying:

```
kubectl kustomize labs/kustomize/specs/overlays/prod
```

This shows the final YAML after all transformations, useful for debugging.

## Lab Exercise

Create a new overlay for a **qa** environment with these requirements:

- Namespace: `qa`
- Name prefix: `qa-`
- Replicas: 4
- Add a custom label: `environment: qa`
- Use image tag: `v1-alpine`

📋 Create the overlay directory and kustomization.yaml file, then deploy to your cluster.

<details>
  <summary>Need help?</summary>

Check [hints.md](hints.md) for guidance, or [solution.md](solution.md) for the complete solution.

</details><br/>

## Common Kustomize Commands

```bash
# Apply a kustomization
kubectl apply -k <directory>

# View generated YAML without applying
kubectl kustomize <directory>

# Delete resources from a kustomization
kubectl delete -k <directory>

# Validate kustomization structure
kubectl kustomize <directory> > /dev/null && echo "Valid"
```

## Best Practices

1. **Keep base generic** - The base should work for any environment
2. **Small overlays** - Only customize what's different per environment
3. **Use patches sparingly** - Prefer Kustomize built-ins (replicas, images) over patches
4. **Version control** - Keep all overlays in git for tracking changes
5. **Test locally** - Use `kubectl kustomize` to preview before applying
6. **Namespace isolation** - Use different namespaces for each environment
7. **Label consistently** - Apply common labels for easy filtering

## Cleanup

Remove all the environments:

```
kubectl delete -k labs/kustomize/specs/overlays/dev
kubectl delete -k labs/kustomize/specs/overlays/staging
kubectl delete -k labs/kustomize/specs/overlays/prod

kubectl delete namespace dev staging production
```

If you created the qa environment:

```
kubectl delete -k labs/kustomize/specs/overlays/qa
kubectl delete namespace qa
```

## Key Takeaways

1. **Template-free** - Kustomize works with standard YAML, no special syntax
2. **Built into kubectl** - No additional tools needed (kubectl apply -k)
3. **Base + Overlays** - Reuse common configs, customize per environment
4. **Patches** - Strategic merge or JSON patches for specific changes
5. **Generators** - Create ConfigMaps and Secrets declaratively
6. **CKAD Essential** - You must know how to use Kustomize for the exam

## CKAD Exam Tips

- Practice creating `kustomization.yaml` files from scratch
- Know how to use `kubectl apply -k` and `kubectl kustomize`
- Understand base/overlay patterns for environment management
- Be familiar with common transformations: namePrefix, nameSuffix, replicas, images
- Know how to patch resources using strategic merge patches
- Remember: `-k` flag works with apply, delete, diff, and other kubectl commands
