# Kustomize - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening (1 min)

Welcome to this deep dive on Kustomize, the template-free way to customize Kubernetes configurations. Unlike Helm which is supplementary material for CKAD, Kustomize is a required topic - you will definitely encounter it on the exam and you must be proficient with it.

Kustomize solves a fundamental configuration management problem: how do you deploy the same application to multiple environments with different configurations, without duplicating YAML files or introducing complex templating? The answer is elegant - you define a base configuration that's common to all environments, then create overlays that specify only what's different for each environment.

What makes Kustomize particularly appealing is its simplicity. There's no special template syntax to learn. Everything is pure YAML - standard Kubernetes manifests that anyone can read and understand. Better yet, Kustomize is built into kubectl from version 1.14 onwards, so there's no separate tool to install or manage.

We'll explore how Kustomize works, the base and overlay pattern, how to use patches for complex customizations, the built-in transformation features, and most importantly - the practical skills and speed techniques you need to ace the CKAD exam.

---

## The Configuration Management Challenge (2 min)

Let's start by understanding the problem Kustomize solves. Imagine you have a web application that you deploy to three environments: development, staging, and production.

In development, you want one replica, a NodePort service for local access, debug logging enabled, and minimal resource limits. In staging, you need three replicas, a LoadBalancer service, info-level logging, and moderate resource limits for testing. In production, you need five replicas, a LoadBalancer with specific IP addresses, error-only logging, strict resource limits, and additional security contexts.

Without a configuration management tool, you face painful challenges. You end up duplicating YAML files for each environment, creating deployment-dev.yaml, deployment-staging.yaml, and deployment-prod.yaml. This leads to maintenance nightmares - when you need to change something common like the container image or a label, you must update three files and keep them synchronized.

Configuration drift becomes inevitable. Someone updates the staging file but forgets production. Now your environments are inconsistent and you don't even realize it until something breaks in production. Tracking differences between environments is difficult - you can't easily see what's different about production versus staging without manually comparing files.

There's also no clear relationship between environment configurations. Are they based on a common template? Did someone copy and modify? The history and reasoning are lost.

Kustomize solves all of these problems with a declarative, overlay-based approach. You write your application configuration once in a base, then create small overlay files that specify only the differences for each environment. The base and overlays are clearly related through directory structure and configuration files. All changes are version-controlled and easily auditable.

---

## How Kustomize Works (3 min)

Let's understand Kustomize's processing model before diving into the specifics. When you run kubectl apply -k pointing to a directory, Kustomize reads a special file called kustomization.yaml in that directory. This file tells Kustomize which resources to include and what transformations to apply.

The key insight is that Kustomize processes everything in memory. It reads your YAML files, applies transformations, generates the final Kubernetes manifests, and sends them to kubectl. Your source files remain completely unchanged on disk. This is powerful because your base configuration stays clean and readable, with no template syntax or placeholders cluttering the YAML.

The processing happens in a specific order. First, Kustomize reads all resources listed in the kustomization.yaml file. Second, it applies name prefixes or suffixes if configured. Third, it applies namespace changes. Fourth, it adds common labels to all resources. Fifth, it updates container image tags. Sixth, it applies replica count changes. Seventh, it processes any patches - either strategic merge patches or JSON patches. Finally, it generates ConfigMaps and Secrets from generators. The result is complete, valid Kubernetes YAML that gets sent to the API server.

You can preview this generated YAML without applying it using kubectl kustomize directory-path. This shows exactly what will be sent to the cluster, which is invaluable for debugging and understanding what Kustomize is doing.

The base and overlay pattern is central to how Kustomize works. The base contains your common configuration - standard Kubernetes YAML files and a kustomization.yaml that lists them. Think of the base as your default or reference configuration that works generically across environments.

Overlays reference the base and apply environment-specific customizations. An overlay has its own kustomization.yaml that points to the base using a relative path, then specifies transformations like name prefixes, namespace, replica counts, or patches. When you apply an overlay, Kustomize loads the base, applies the overlay's transformations, and generates the final output.

This creates a clear hierarchy. The base at the center contains common configuration. Dev, staging, and production overlays surround it, each adding their specific customizations. The relationship is explicit and version-controlled. Changes to the base automatically flow to all overlays, while each overlay maintains its unique configuration.

---

## Base Configuration Pattern (2 min)

Let's examine what goes into a base configuration. The base should be generic enough to work in any environment, containing no environment-specific values, names, or namespaces.

A typical base directory structure contains a kustomization.yaml file listing the resources, and standard Kubernetes YAML files like deployment.yaml, service.yaml, and configmap.yaml. These are completely normal Kubernetes manifests with no special syntax.

The kustomization.yaml file in the base is simple and straightforward. It specifies apiVersion kustomize.config.k8s.io/v1beta1 and kind Kustomization - these identify it as a Kustomize configuration. Then it lists resources as an array of file paths. That's it for a basic base.

The actual resource files - deployment.yaml and service.yaml - are pure Kubernetes YAML. This is a critical advantage of Kustomize over templating systems. Anyone can read these files without understanding a template language. You can copy them directly from Kubernetes documentation. You can validate them with kubectl --dry-run. There are no placeholders or special syntax to decode.

When designing your base, think about what's truly common across all environments. The container image name probably belongs in the base - you'll change tags per environment, but the image name stays consistent. The service port configuration likely belongs in the base - the port number doesn't usually change between environments. Labels that identify the application should be in the base.

What shouldn't be in the base? Replica counts that vary by environment. Resource limits that differ for dev versus production. Namespace assignments - the base shouldn't assume a namespace. Environment-specific configuration values. Node selectors or affinity rules that are environment-specific. These belong in overlays.

---

## Overlay Configuration and Transformations (3 min)

Overlays are where environment-specific customizations happen. An overlay references a base and applies transformations to customize it for a particular environment.

The overlay directory structure typically looks like this: an overlays directory containing subdirectories for each environment - dev, staging, production. Each environment directory has its own kustomization.yaml and optionally some patch files.

The kustomization.yaml in an overlay starts by referencing the base. In Kustomize versions prior to 3.0, you used the bases field. In current versions, you use the resources field and provide a relative path to the base directory, like "../../base". This makes the relationship explicit.

Then you apply transformations using built-in Kustomize features. The namePrefix field adds a prefix to all resource names - for example, "dev-" creates resources named dev-deployment and dev-service. This allows deploying multiple environments to the same namespace without name conflicts.

The namespace field sets the namespace for all resources. This is cleaner than adding namespace to each resource individually.

The replicas field overrides replica counts for specific deployments. You provide an array with the deployment name and the desired count. For example, setting replicas for deployment "myapp" to five scales it to five replicas in this environment.

The images field updates container image tags without modifying the deployment YAML. You specify the image name and the newTag. This is perfect for deploying different versions to different environments - dev might use the "latest" tag while production uses a specific version like "v2.0.1".

The commonLabels field adds labels to all resources. This is useful for tracking which environment resources belong to or for enabling bulk operations with kubectl label selectors.

ConfigMapGenerator and SecretGenerator create ConfigMaps and Secrets from literals or files. Kustomize adds a hash suffix to the generated names, and when the content changes, a new ConfigMap is created with a different hash. This triggers rolling updates automatically because the Pod template references change.

These built-in transformations handle most customization needs without requiring patches. They're fast to write, easy to understand, and less error-prone than patches.

---

## Patches for Complex Customizations (3 min)

When built-in transformations aren't sufficient, patches provide fine-grained control over specific fields. Kustomize supports two types of patches, though for CKAD you'll primarily use strategic merge patches.

Strategic merge patches are partial YAML documents that merge with the base configuration. You only specify the fields you want to change or add. The merge happens intelligently based on the resource type - Kubernetes knows how to merge different field types like maps, lists, and scalars.

Let's walk through a practical example. Suppose you need to add resource limits to the production environment. Create a file called resources-patch.yaml in your production overlay directory. In this file, write a partial Deployment manifest specifying only what you're changing: the API version, kind, metadata name to identify which resource to patch, and then the spec tree diving down to containers, identifying the container by name, and specifying the resources section with limits and requests.

In your production kustomization.yaml, reference this patch file using the patches field, specifying the path to the patch file. When Kustomize processes the overlay, it merges this partial YAML with the base Deployment, adding the resources section while keeping everything else from the base.

Strategic merge patches follow the structure of the original resource. You must include enough identification - API version, kind, and name - for Kustomize to match the patch to the base resource. Then you specify the path to the field you're changing using the same structure as the full resource.

For containers specifically, you identify the container by name rather than position in the array. This is important because it makes patches resilient to changes in container order.

JSON patches, also called RFC 6902 patches, provide surgical precision for complex modifications. They use a JSON format with operations like add, remove, replace, and move. Each operation specifies an exact path using JSON pointer syntax and a value. For example, an operation with op "replace", path "/spec/replicas", and value 3 changes the replica count to three.

JSON patches are more complex to write and harder to read, but they enable modifications that strategic merge patches can't handle, like removing items from arrays or moving fields. For the CKAD exam, focus on strategic merge patches - they cover the vast majority of scenarios and are more intuitive.

One critical detail: patch file names must match the target resource. If your base has deployment.yaml, your patch should reference the same resource by name in its metadata section. The path to the patch file can be anything, but the resource identification must be exact.

---

## CKAD Exam Strategy for Kustomize (3 min)

Let's focus on practical strategies for handling Kustomize questions efficiently in the CKAD exam.

For creating a base, use kubectl to generate YAML quickly rather than writing from scratch. Run kubectl create deployment with --dry-run=client -o yaml to generate a deployment, redirect to deployment.yaml. Generate a service similarly. Then create the kustomization.yaml by hand - it's just a few lines listing the resources.

The kustomization.yaml structure should be muscle memory. Type "apiVersion: kustomize.config.k8s.io/v1beta1", "kind: Kustomization", and "resources:" followed by your file list. Practice this until you can type it in under thirty seconds.

For creating overlays, use a heredoc or your editor to quickly create the overlay kustomization.yaml. The pattern is always the same: resources pointing to the base, then your transformations like namePrefix, namespace, replicas, and images.

Speed technique: use kubectl kustomize to validate immediately after creating files. If there's a syntax error or broken reference, you see it right away without applying to the cluster. Run kubectl kustomize overlay-path and check for errors.

Time management for the exam: creating a base should take one to two minutes. Creating a simple overlay with built-in transformations should take one minute. Creating an overlay with patches should take two to three minutes. Troubleshooting a broken kustomization should take two to three minutes. Don't spend more than five minutes on any single Kustomize question.

Common exam patterns include creating a base kustomization for existing YAML files, creating overlays for multiple environments with different replicas and image tags, adding resource limits via patches, and fixing broken kustomization files.

For troubleshooting, common errors include wrong base path in overlay - check the relative path carefully. Patch resource name mismatch - ensure the name in your patch exactly matches the base resource. Missing resources in the list - verify all files are listed in the kustomization.yaml resources array. Invalid image syntax - images should specify just the image name, with newTag separate, not the full image:tag string.

Use kubectl kustomize to see the generated output. This shows exactly what will be applied and helps identify where patches or transformations aren't working as expected.

Memorize the key transformations: namePrefix for name prefixes, namespace for setting namespace, replicas for scaling, images for updating tags, commonLabels for adding labels. These cover most exam scenarios.

For patches, prefer strategic merge over JSON patches. They're faster to write and easier to verify. Only use JSON patches if the question specifically requires operations that strategic merge can't handle.

---

## Kustomize vs Helm (2 min)

Let's briefly compare Kustomize and Helm since you'll encounter both in the CKAD exam and real-world work. Understanding when to use each makes you a more effective Kubernetes practitioner.

Kustomize has a simpler learning curve because everything is pure YAML. There's no template syntax to learn. It's built into kubectl, so there's no separate tool to install or manage. The configuration is template-free, making it easier to read and maintain. Kustomize excels at managing environment-specific configurations - the overlay pattern is perfect for dev, staging, and production deployments. It also works beautifully with GitOps workflows where you want declarative configuration stored in git.

Helm provides package distribution through chart repositories. Charts can be versioned and shared across teams and organizations. Helm's templating supports complex logic and conditionals that Kustomize doesn't. The community ecosystem offers charts for almost any popular application - databases, monitoring tools, message queues. Helm is better for third-party application deployment where you're consuming, not creating, the configuration.

In practice, many teams use both. They install third-party dependencies like PostgreSQL or Redis using Helm charts from Bitnami or official repositories. They manage their own application configurations using Kustomize with base and overlay patterns. This combines the strengths of both approaches.

For the CKAD exam, you must know both, but Kustomize is required while Helm is supplementary. Expect more Kustomize questions. Practice creating bases and overlays until it's automatic. Understand patches and transformations deeply. Be comfortable troubleshooting broken kustomization files.

The key difference in philosophy: Helm uses templates with placeholders that get filled in with values. Kustomize uses base configurations that get patched and transformed. Helm is about parameterization. Kustomize is about composition and transformation. Both have their place in the Kubernetes ecosystem.

---

## Summary and Key Takeaways (1 min)

Let's recap the essential Kustomize concepts for CKAD success and real-world operations.

Kustomize manages configurations without templates using pure YAML. The base contains common configuration shared across environments. Overlays customize the base for specific environments. Built-in transformations handle most needs: namePrefix, namespace, replicas, images, commonLabels. Patches enable fine-grained modifications when built-in features aren't sufficient.

The kustomization.yaml file is the heart of Kustomize, listing resources and specifying transformations. It's built into kubectl with the -k flag - kubectl apply -k applies a kustomization, kubectl kustomize previews output without applying, kubectl delete -k removes kustomization resources.

For CKAD success: memorize the kustomization.yaml structure and type it quickly, use kubectl to generate base YAML rather than writing from scratch, prefer built-in transformations over patches when possible, use kubectl kustomize to validate before applying, understand strategic merge patches for complex scenarios, practice common patterns until automatic.

Kustomize is required CKAD knowledge. You will see it on the exam. Practice creating bases and overlays for different environments. Practice adding patches to customize specific fields. Practice troubleshooting broken kustomization files. Make these operations fast and automatic.

The beauty of Kustomize is its simplicity. No template syntax, no complex logic, just YAML files organized with clear relationships. Master the base and overlay pattern, and you'll handle any Kustomize scenario in the exam or production environments.

Thank you for listening, and good luck with your Kustomize journey and CKAD preparation.
