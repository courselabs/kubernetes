# ConfigMaps - Introduction Narration Script

**Duration:** 8-10 minutes
**Format:** Concept-focused slideshow presentation
**Audience:** Developers preparing for CKAD or learning Kubernetes basics

---

## Slide 1: Title & Context (0:00 - 0:30)

Welcome to this introduction to ConfigMaps in Kubernetes. ConfigMaps are a core CKAD exam topic, and understanding them is essential for managing application configuration in production environments.

In this presentation, we'll explore what ConfigMaps are, why they exist, and how they help you build cloud-native applications that follow the twelve-factor app methodology.

**[Pause for 2 seconds]**

---

## Slide 2: The Configuration Challenge (0:30 - 1:30)

Let's start with a problem you've probably faced: how do you manage configuration for applications running in different environments?

Traditional applications often hardcode configuration values directly in the code, or bundle environment-specific config files inside container images. This creates several problems:

First, it violates the separation of concerns principle - configuration shouldn't be mixed with application code.

Second, it means you need different container images for each environment - one for development, another for staging, yet another for production. This defeats the purpose of containers, which should be portable and immutable.

Third, changing a simple configuration value requires rebuilding the entire application image, which is time-consuming and error-prone.

**[Pause for 2 seconds]**

The twelve-factor app methodology explicitly addresses this in factor three: "Store config in the environment." Kubernetes ConfigMaps are designed to solve this exact problem.

---

## Slide 3: What Are ConfigMaps? (1:30 - 2:30)

So what exactly is a ConfigMap?

A ConfigMap is a Kubernetes API object that stores non-confidential configuration data as key-value pairs. Think of it as a dictionary or hash map that lives in your Kubernetes cluster.

ConfigMaps decouple configuration from your container images, allowing you to:
- Use the same container image across multiple environments
- Update configuration without rebuilding images
- Manage configuration declaratively using YAML
- Version control your configuration separately from code

ConfigMaps store two types of data: simple key-value pairs that you'll typically surface as environment variables, and larger text data like configuration files that you'll surface as files in the container filesystem.

**[Pause for 2 seconds]**

It's important to note that ConfigMaps are designed for non-sensitive data. For passwords, API keys, and other secrets, Kubernetes provides a separate Secret resource.

---

## Slide 4: Creating ConfigMaps - Multiple Methods (2:30 - 4:00)

Kubernetes gives you flexibility in how you create ConfigMaps. Let's explore the four main methods.

**Method One: Declarative YAML**

This is the most common approach in production. You define your ConfigMap in a YAML manifest that looks like this:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_host: mysql.default.svc.cluster.local
  database_port: "3306"
  log_level: info
```

The data section contains your key-value pairs. This method works great because you can version control the YAML and apply it with kubectl apply.

**[Pause for 1 second]**

**Method Two: From Literal Values**

For quick testing or simple cases, you can create ConfigMaps directly from the command line:

```bash
kubectl create configmap app-config \
  --from-literal=database_host=mysql \
  --from-literal=database_port=3306
```

This is fast but doesn't provide the benefits of version control.

**[Pause for 1 second]**

**Method Three: From Files**

If you have existing configuration files, you can create ConfigMaps directly from them:

```bash
kubectl create configmap nginx-config --from-file=nginx.conf
```

The filename becomes the key, and the file contents become the value. You can even load entire directories at once.

**[Pause for 1 second]**

**Method Four: From Environment Files**

For .env file formats, you can use:

```bash
kubectl create configmap app-config --from-env-file=app.env
```

This parses the file and creates one key-value pair per line.

---

## Slide 5: Consuming ConfigMaps - Environment Variables (4:00 - 5:30)

Once you've created a ConfigMap, you need to inject it into your Pods. The first method is through environment variables.

**Loading All Keys**

You can load all keys from a ConfigMap into environment variables using envFrom:

```yaml
spec:
  containers:
  - name: app
    image: myapp:1.0
    envFrom:
    - configMapRef:
        name: app-config
```

This takes every key-value pair in the ConfigMap and creates a corresponding environment variable in the container.

**[Pause for 1 second]**

**Loading Individual Keys**

For more control, you can selectively load specific keys and even rename them:

```yaml
env:
- name: DATABASE_HOST
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: database_host
```

This gives you fine-grained control over which configuration values your application sees.

**[Pause for 2 seconds]**

Environment variables are great for simple values and feature flags, but they have limitations. They're visible to all processes in the container, they can collide with system variables, and they're only read when the container starts.

---

## Slide 6: Consuming ConfigMaps - Volume Mounts (5:30 - 7:00)

The second method for consuming ConfigMaps is through volume mounts, which surface configuration as files in the container filesystem.

Here's how it works:

```yaml
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: config-volume
      mountPath: /config
      readOnly: true
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

With this approach, every key in the ConfigMap becomes a file in the /config directory. The key is the filename, and the value is the file contents.

**[Pause for 1 second]**

Volume mounts have several advantages over environment variables:

First, they support complex configuration formats like JSON, YAML, or XML files. Your application can read these files just as it would in a traditional deployment.

Second, they provide better security through file permissions. You can set read-only access and control which users can access the files.

Third, and this is crucial: volume-mounted ConfigMaps can be updated dynamically. When you update a ConfigMap that's mounted as a volume, Kubernetes automatically propagates the changes to the Pod within about 60 seconds. Environment variables, by contrast, are static and require a Pod restart to pick up changes.

**[Pause for 2 seconds]**

There is one gotcha to watch out for: volume mounts replace the entire target directory. If you mount a ConfigMap to /app, it overwrites everything in that directory, which can break your application. The solution is to use subPath to mount individual files instead of entire directories.

---

## Slide 7: ConfigMaps vs Secrets (7:00 - 8:00)

Let's clarify the distinction between ConfigMaps and Secrets, as this is a common point of confusion.

**ConfigMaps** are designed for non-sensitive configuration data like:
- Application settings and feature flags
- Database hostnames and ports
- API endpoints and service URLs
- Configuration files

ConfigMaps are stored in plain text in etcd and are easily readable by anyone with cluster access.

**[Pause for 1 second]**

**Secrets**, on the other hand, are designed for sensitive data like:
- Passwords and API keys
- TLS certificates
- OAuth tokens
- SSH keys

While Secrets are base64-encoded, they're not encrypted by default. However, Kubernetes provides mechanisms to encrypt Secrets at rest in etcd, and they're handled more carefully throughout the system.

**[Pause for 1 second]**

The rule of thumb is simple: if you wouldn't commit it to a public Git repository, don't put it in a ConfigMap. Use a Secret instead.

---

## Slide 8: CKAD Exam Relevance (8:00 - 9:00)

ConfigMaps are a core CKAD exam topic, and you should expect multiple questions testing your understanding.

The exam will test you on:

**Creation methods** - You'll need to know how to create ConfigMaps imperatively with kubectl create and declaratively with YAML. Practice both approaches until they're second nature.

**Consumption patterns** - Be comfortable with both environment variable and volume mount approaches. Know when to use each method.

**Troubleshooting** - You'll need to debug common issues like missing ConfigMaps, incorrect key names, and volume mount problems. The describe and logs commands are your friends here.

**Update behavior** - Understand that environment variables don't update automatically but volume mounts do. Know when you need to restart Pods.

**[Pause for 1 second]**

Speed matters in the CKAD exam. You should be able to create a ConfigMap and inject it into a Pod in under two minutes. The imperative kubectl create commands are often faster than writing YAML from scratch, so know both approaches.

---

## Slide 9: Best Practices (9:00 - 9:45)

Before we wrap up, let's cover some best practices for working with ConfigMaps.

**Naming and Organization**
- Use descriptive names like app-config or nginx-config
- One ConfigMap per application or component
- For immutable ConfigMaps, include version numbers in the name

**Size Management**
- Keep ConfigMaps under 1 MiB total
- Split large configurations into multiple ConfigMaps
- Consider external configuration stores for very large files

**Security**
- Always use readOnly: true for volume mounts
- Set appropriate file permissions with defaultMode
- Never store sensitive data in ConfigMaps

**Update Strategy**
- Use immutable ConfigMaps in production for safety and performance
- Version your ConfigMaps and use Deployment rolling updates
- Understand your application's configuration reload behavior

---

## Slide 10: Summary & Next Steps (9:45 - 10:00)

Let's recap what we've covered today.

ConfigMaps are Kubernetes objects that store non-sensitive configuration data, decoupling it from container images. You can create them from YAML, literals, files, or environment files. You consume them through environment variables or volume mounts, each with different trade-offs.

ConfigMaps are fundamental to building cloud-native applications and are essential CKAD exam knowledge.

**[Pause for 1 second]**

In the next session, we'll get hands-on with practical exercises, creating ConfigMaps and deploying applications that consume them. We'll explore real-world scenarios and troubleshoot common issues.

Thank you for watching, and I'll see you in the exercises session.

---

## Presenter Notes

**Timing Checkpoints:**
- Slide 4 complete by 4:00
- Slide 6 complete by 7:00
- Slide 9 start by 9:00

**Emphasis Points:**
- Separation of configuration from code
- Environment variables vs volume mounts trade-offs
- ConfigMap vs Secret distinction
- CKAD exam speed requirements

**Common Questions to Address:**
- "Can I encrypt ConfigMaps?" - No, use Secrets instead
- "How big can ConfigMaps be?" - 1 MiB maximum
- "Do updates propagate automatically?" - Yes for volumes, no for env vars

**Visual Aids to Include:**
- Slide 2: Diagram showing config at different stages (dev/staging/prod)
- Slide 3: ConfigMap icon and API object structure
- Slide 4: Side-by-side comparison of all four creation methods
- Slide 5: Pod diagram with environment variables highlighted
- Slide 6: Pod diagram with volume mount illustrated
- Slide 7: ConfigMap vs Secret comparison table
- Slide 8: CKAD exam topics checklist
