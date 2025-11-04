# ConfigMaps - CKAD Requirements

This document covers the CKAD (Certified Kubernetes Application Developer) exam requirements for ConfigMaps, building on the basics covered in [README.md](README.md).

## CKAD Exam Requirements

The CKAD exam expects you to understand and implement:
- Creating ConfigMaps using multiple methods (YAML, imperative commands, from files)
- Consuming ConfigMaps as environment variables (individual keys and all keys)
- Consuming ConfigMaps as volume mounts (entire ConfigMap and selective keys)
- Using subPath to mount individual files without overwriting directories
- Understanding ConfigMap update behavior and immutability
- Troubleshooting ConfigMap-related issues
- ConfigMap size limits and best practices

## Creating ConfigMaps - Multiple Methods

### Method 1: From YAML (Declarative)

The standard approach using YAML manifests:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default
data:
  # Simple key-value pairs
  database_host: "mysql.default.svc.cluster.local"
  database_port: "3306"
  log_level: "info"

  # File-like data
  app.properties: |
    server.port=8080
    server.timeout=30
    cache.enabled=true

  config.json: |
    {
      "features": {
        "darkMode": true,
        "notifications": false
      }
    }
```

### Method 2: From Literal Values (Imperative)

Quick creation from command line:

```bash
# Single literal
kubectl create configmap app-config --from-literal=database_host=mysql.default.svc.cluster.local

# Multiple literals
kubectl create configmap app-config \
  --from-literal=database_host=mysql.default.svc.cluster.local \
  --from-literal=database_port=3306 \
  --from-literal=log_level=info
```

### Method 3: From Files

Create ConfigMap from existing configuration files:

```bash
# From a single file (key = filename, value = file contents)
kubectl create configmap nginx-config --from-file=nginx.conf

# From a single file with custom key name
kubectl create configmap nginx-config --from-file=custom-name=nginx.conf

# From multiple files
kubectl create configmap app-config \
  --from-file=app.properties \
  --from-file=config.json

# From a directory (creates one key per file in directory)
kubectl create configmap app-config --from-file=./config-dir/
```

> **TODO**: Add example showing the difference in ConfigMap structure when using default vs custom key names

### Method 4: From Environment Files

Create from `.env` file format:

```bash
# Contents of app.env:
# DATABASE_HOST=mysql
# DATABASE_PORT=3306
# LOG_LEVEL=info

kubectl create configmap app-config --from-env-file=app.env
```

📋 Create a ConfigMap using all four methods and compare the resulting YAML structure.

<details>
  <summary>Not sure how?</summary>

```bash
# View the ConfigMap YAML
kubectl get configmap app-config -o yaml

# Or describe it
kubectl describe configmap app-config
```

> **TODO**: Add complete exercise showing output differences between methods

</details><br/>

## Consuming ConfigMaps as Environment Variables

### Loading All Keys as Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-config
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "env && sleep 3600"]
    envFrom:
    - configMapRef:
        name: app-config
```

### Loading Individual Keys as Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-selective-config
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "env && sleep 3600"]
    env:
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_host
    - name: DATABASE_PORT
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_port
    - name: CUSTOM_VALUE
      value: "hardcoded-value"  # Mix with direct values
```

### Using ConfigMap with envFrom Prefix

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-prefix
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "env && sleep 3600"]
    envFrom:
    - configMapRef:
        name: app-config
      prefix: APP_CONFIG_
```

> This prefixes all keys with `APP_CONFIG_` (e.g., `APP_CONFIG_database_host`)

📋 Create a Pod that uses both `envFrom` and individual `env` entries, then verify which takes precedence.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution showing precedence rules when same key is defined multiple ways

</details><br/>

## Consuming ConfigMaps as Volume Mounts

### Mounting Entire ConfigMap

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-volume
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "ls -la /config && cat /config/* && sleep 3600"]
    volumeMounts:
    - name: config-volume
      mountPath: /config
      readOnly: true
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

> Each key in the ConfigMap becomes a file in `/config/`

### Mounting Specific Keys

Mount only selected keys from the ConfigMap:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-selective-mount
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "ls -la /config && sleep 3600"]
    volumeMounts:
    - name: config-volume
      mountPath: /config
      readOnly: true
  volumes:
  - name: config-volume
    configMap:
      name: app-config
      items:
      - key: app.properties
        path: application.properties  # Rename the file
      - key: config.json
        path: config.json
```

### Using subPath to Avoid Overwriting Directories

**Problem**: Volume mounts replace the entire target directory, potentially breaking apps.

**Solution**: Use `subPath` to mount individual files:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-with-config
spec:
  containers:
  - name: nginx
    image: nginx
    volumeMounts:
    - name: config-volume
      mountPath: /etc/nginx/nginx.conf
      subPath: nginx.conf  # Mount only this file, not entire /etc/nginx
      readOnly: true
  volumes:
  - name: config-volume
    configMap:
      name: nginx-config
```

> **TODO**: Add example showing what happens without subPath (directory gets replaced)

📋 Create a ConfigMap with nginx configuration and mount it using subPath to avoid breaking the container.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete solution with nginx ConfigMap and working subPath mount

</details><br/>

## File Permissions for ConfigMap Volumes

Control file permissions when mounting ConfigMaps:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-permissions
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "ls -la /config && sleep 3600"]
    volumeMounts:
    - name: config-volume
      mountPath: /config
      readOnly: true
  volumes:
  - name: config-volume
    configMap:
      name: app-config
      defaultMode: 0644  # rw-r--r--
      items:
      - key: app.properties
        path: app.properties
        mode: 0600  # rw------- (override default)
```

> **TODO**: Add example showing verification of file permissions inside container

## ConfigMap Updates and Propagation

### Update Behavior

- **Environment Variables**: NOT updated when ConfigMap changes (requires Pod restart)
- **Volume Mounts**: Updated automatically after a short delay (kubelet sync period)

```bash
# Update a ConfigMap
kubectl edit configmap app-config

# For environment variables: must restart Pod
kubectl delete pod app-with-config
kubectl apply -f pod.yaml

# For volume mounts: wait for automatic update (up to 60 seconds)
kubectl exec app-with-volume -- watch cat /config/app.properties
```

> **TODO**: Add hands-on example showing update propagation timing

### Immutable ConfigMaps

Make ConfigMaps immutable for better performance and safety:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-immutable
data:
  database_host: "mysql.default.svc.cluster.local"
immutable: true
```

Benefits:
- Protects against accidental updates
- Improves cluster performance (kube-apiserver doesn't watch for changes)
- For updates, must delete and recreate ConfigMap + Pods

> **TODO**: Add example showing error when trying to update immutable ConfigMap

📋 Create an immutable ConfigMap, deploy a Pod using it, then try to update the ConfigMap.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution showing immutable ConfigMap behavior and proper update workflow

</details><br/>

## Binary Data in ConfigMaps

ConfigMaps can store binary data using `binaryData` field:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: binary-config
binaryData:
  # Base64-encoded binary data
  image.png: iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
data:
  # Regular text data
  config.txt: "text configuration"
```

Create from binary file:

```bash
# Kubernetes automatically base64-encodes binary files
kubectl create configmap binary-config --from-file=image.png
```

> **TODO**: Add example showing binary file mounted and used in Pod

## ConfigMap Size Limits

- Maximum ConfigMap size: **1 MiB** (1,048,576 bytes)
- Includes all keys and values combined
- Best practice: Keep ConfigMaps small and focused

> **TODO**: Add example demonstrating size limit error

## Optional ConfigMaps

Make ConfigMap references optional to avoid Pod startup failures:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-optional-config
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "env && sleep 3600"]
    envFrom:
    - configMapRef:
        name: app-config
        optional: true  # Pod starts even if ConfigMap doesn't exist
    volumeMounts:
    - name: config-volume
      mountPath: /config
      readOnly: true
  volumes:
  - name: config-volume
    configMap:
      name: optional-config
      optional: true  # Pod starts even if ConfigMap doesn't exist
```

📋 Create a Pod referencing a non-existent ConfigMap with and without the optional flag.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add solution showing difference in Pod behavior with optional vs required ConfigMaps

</details><br/>

## Using ConfigMaps with Command Arguments

Inject ConfigMap values into container command/args:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-args
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c"]
    args:
    - |
      echo "Database: $(DATABASE_HOST):$(DATABASE_PORT)"
      echo "Log Level: $(LOG_LEVEL)"
      sleep 3600
    env:
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_host
    - name: DATABASE_PORT
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_port
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: log_level
```

> **TODO**: Add example showing ConfigMap values in args without environment variables

## Troubleshooting ConfigMaps

### Common Issues

1. **Pod in CreateContainerConfigError state**
   ```bash
   kubectl describe pod app-with-config
   # Look for: "configmap "app-config" not found"
   ```

2. **Wrong key name**
   ```bash
   kubectl describe pod app-with-config
   # Look for: "key "wrong_key" not found in ConfigMap"
   ```

3. **Volume mount overwrites directory**
   - Use `subPath` to mount individual files
   - Or mount to a different directory and symlink

4. **ConfigMap updates not reflecting**
   - Environment variables: require Pod restart
   - Volume mounts: wait up to 60 seconds
   - Check kubelet sync period

### Debugging Commands

```bash
# List all ConfigMaps
kubectl get configmaps

# View ConfigMap contents
kubectl describe configmap app-config
kubectl get configmap app-config -o yaml

# Check which Pods use a ConfigMap
kubectl get pods -o json | jq '.items[] | select(.spec.volumes[]?.configMap.name=="app-config") | .metadata.name'

# View environment variables in running Pod
kubectl exec app-with-config -- env

# View mounted files in Pod
kubectl exec app-with-config -- ls -la /config
kubectl exec app-with-config -- cat /config/app.properties

# Check Pod events for ConfigMap errors
kubectl describe pod app-with-config
```

> **TODO**: Add troubleshooting scenario with step-by-step debugging

## Lab Exercises

### Exercise 1: Multi-Method ConfigMap Creation

Create the same configuration using three different methods and verify the output is identical:

1. Create ConfigMap from YAML with these settings:
   - `app.name=myapp`
   - `app.version=1.0.0`
   - `app.environment=production`

2. Create the same ConfigMap using `--from-literal`

3. Create the same ConfigMap using `--from-env-file`

> **TODO**: Add complete solution with verification steps

### Exercise 2: Mixed Environment Variable Sources

Create a Pod that gets configuration from:
- A ConfigMap (database settings)
- Hardcoded environment variables (app name)
- Another ConfigMap with prefix (feature flags)

Verify the final environment variables and check for conflicts.

> **TODO**: Add complete solution showing precedence rules

### Exercise 3: Selective Key Mounting

Create a ConfigMap with 5 different configuration files. Create a Pod that:
- Mounts only 2 specific files to `/config`
- Renames one file during mounting
- Sets custom file permissions (0600)

> **TODO**: Add complete solution with verification

### Exercise 4: ConfigMap Update Propagation

Create a ConfigMap and two Pods:
1. Pod A: Uses ConfigMap as environment variables
2. Pod B: Uses ConfigMap as volume mount

Update the ConfigMap and observe:
- Which Pod sees the changes?
- How long does it take?
- What's needed to update the other Pod?

> **TODO**: Add complete solution with timing observations

### Exercise 5: Fixing Broken Volume Mounts

Debug and fix a Pod that's in CrashLoopBackoff due to incorrect ConfigMap volume mount that overwrites the application directory.

> **TODO**: Add broken spec and solution using subPath

### Exercise 6: Immutable ConfigMap Workflow

Create an immutable ConfigMap and demonstrate the proper workflow to update it:
1. Create immutable ConfigMap and Pod
2. Attempt to update (observe error)
3. Perform rolling update with new ConfigMap

> **TODO**: Add complete solution showing version-tagged ConfigMaps

## Common CKAD Scenarios

### Scenario 1: Application Configuration Migration

> **TODO**: Add scenario migrating app from environment variables to ConfigMap

### Scenario 2: Multi-Environment Configuration

> **TODO**: Add scenario managing dev/staging/prod configs with ConfigMaps

### Scenario 3: Configuration Hot-Reload

> **TODO**: Add scenario demonstrating apps that detect ConfigMap changes

### Scenario 4: Large Configuration Files

> **TODO**: Add scenario handling config files approaching size limit

## Best Practices for CKAD

1. **Naming Conventions**
   - Use descriptive names: `app-config`, `nginx-config`
   - Version immutable ConfigMaps: `app-config-v1`, `app-config-v2`

2. **Organization**
   - One ConfigMap per application/component
   - Separate environment-specific configs
   - Don't mix secrets with regular config (use Secrets instead)

3. **Size Management**
   - Keep ConfigMaps under 1 MiB
   - Split large configurations into multiple ConfigMaps
   - Consider external config stores for very large files

4. **Update Strategy**
   - Use immutable ConfigMaps for production
   - Version your ConfigMaps
   - Use Deployment rolling updates when changing config

5. **Security**
   - Use `readOnly: true` for volume mounts
   - Set appropriate file permissions (defaultMode)
   - Never store sensitive data (passwords, keys) in ConfigMaps

6. **Environment Variables vs. Files**
   - Use environment variables for: simple values, feature flags
   - Use files for: complex configs, multi-line data, structured data (JSON/YAML)

7. **Handling Missing ConfigMaps**
   - Use `optional: true` for non-critical config
   - Validate ConfigMap exists before deploying dependent resources

## Quick Reference Commands

```bash
# Create ConfigMap from literals
kubectl create configmap myconfig --from-literal=key1=value1 --from-literal=key2=value2

# Create ConfigMap from file
kubectl create configmap myconfig --from-file=config.properties

# Create ConfigMap from directory
kubectl create configmap myconfig --from-file=./config-dir/

# Create ConfigMap from env file
kubectl create configmap myconfig --from-env-file=app.env

# Create ConfigMap with custom key name
kubectl create configmap myconfig --from-file=custom-key=config.properties

# View ConfigMap
kubectl get configmap myconfig -o yaml
kubectl describe configmap myconfig

# Edit ConfigMap
kubectl edit configmap myconfig

# Update ConfigMap from file
kubectl create configmap myconfig --from-file=config.properties --dry-run=client -o yaml | kubectl apply -f -

# Delete ConfigMap
kubectl delete configmap myconfig

# List Pods using a ConfigMap (volume)
kubectl get pods -o json | jq '.items[] | select(.spec.volumes[]?.configMap.name=="myconfig") | .metadata.name'

# Check environment variables in Pod
kubectl exec mypod -- env
kubectl exec mypod -- printenv KEY_NAME

# Check mounted files in Pod
kubectl exec mypod -- ls -la /config
kubectl exec mypod -- cat /config/config.properties

# Watch for ConfigMap changes in mounted volume
kubectl exec mypod -- watch -n 1 cat /config/config.properties
```

## Integration with Other Resources

### ConfigMaps with Deployments

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:1.0
        envFrom:
        - configMapRef:
            name: app-config
        volumeMounts:
        - name: config-volume
          mountPath: /config
          readOnly: true
      volumes:
      - name: config-volume
        configMap:
          name: app-files-config
```

### ConfigMaps with StatefulSets

> **TODO**: Add example showing ConfigMap per StatefulSet Pod using init containers

### ConfigMaps with Jobs/CronJobs

> **TODO**: Add example showing ConfigMap with batch workloads

## Cleanup

Remove all ConfigMaps created in these exercises:

```bash
# Delete specific ConfigMap
kubectl delete configmap app-config

# Delete multiple ConfigMaps
kubectl delete configmap config1 config2 config3

# Delete all ConfigMaps with label
kubectl delete configmap -l app=myapp

# Delete all ConfigMaps in namespace (careful!)
kubectl delete configmap --all
```

---

## Next Steps

After mastering ConfigMaps, continue with these CKAD topics:
- [Secrets](../secrets/CKAD.md) - Secure configuration management
- [Persistent Volumes](../persistentvolumes/CKAD.md) - Stateful storage
- [Deployments](../deployments/CKAD.md) - Rolling updates with configuration changes
- [Jobs](../jobs/CKAD.md) - ConfigMaps with batch workloads
