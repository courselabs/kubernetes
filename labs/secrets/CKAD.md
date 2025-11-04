# Secrets - CKAD Exam Topics

This document covers the CKAD exam requirements for Kubernetes Secrets. Make sure you've completed the [basic Secrets lab](README.md) first, as it covers fundamental concepts of creating and using Secrets.

## CKAD Secrets Requirements

The CKAD exam expects you to understand and work with:

- Imperative Secret creation (literals, files, env-files)
- Declarative Secret creation (YAML)
- Different Secret types (Opaque, docker-registry, TLS, etc.)
- Using Secrets as environment variables (env and envFrom)
- Using Secrets as volume mounts
- Managing Secret updates and triggering rollouts
- imagePullSecrets for private registries
- Security best practices and troubleshooting

## API Specs

- [Secret](https://kubernetes.io/docs/reference/kubernetes-api/config-and-storage-resources/secret-v1/)
- [ServiceAccount](https://kubernetes.io/docs/reference/kubernetes-api/authentication-resources/service-account-v1/)

## Imperative Secret Creation

In the CKAD exam, you'll often create Secrets imperatively for speed. Understanding all the creation methods is critical.

### From Literal Values

```
# Create from single literal
kubectl create secret generic my-secret --from-literal=password=mysecretpass

# Create from multiple literals
kubectl create secret generic my-secret \
  --from-literal=username=admin \
  --from-literal=password=secretpass123 \
  --from-literal=database=mydb

# Verify creation
kubectl get secret my-secret
kubectl describe secret my-secret
```

### From Files

```
# Create from single file (key = filename, value = file contents)
kubectl create secret generic app-config --from-file=config.json

# Create from multiple files
kubectl create secret generic app-secrets \
  --from-file=./secrets/cert.pem \
  --from-file=./secrets/key.pem

# Create with custom key name
kubectl create secret generic tls-certs \
  --from-file=certificate=./cert.pem \
  --from-file=private-key=./key.pem
```

### From Env Files

```
# Create from env file (each line becomes a key-value pair)
kubectl create secret generic db-config --from-env-file=database.env

# Example database.env content:
# DB_HOST=postgres.example.com
# DB_PORT=5432
# DB_USER=appuser
# DB_PASSWORD=secretpass
```

### Exam Tip: Dry Run for YAML

Generate Secret YAML without creating it:

```
kubectl create secret generic my-secret \
  --from-literal=key1=value1 \
  --from-literal=key2=value2 \
  --dry-run=client -o yaml > secret.yaml

# Edit if needed, then apply
kubectl apply -f secret.yaml
```

**TODO**: Add practice exercise with multiple creation methods and verification steps

## Secret Types

Kubernetes supports multiple Secret types for different use cases. The `type` field is metadata that helps validate content and provides usage hints.

### Opaque Secrets (default)

Default type for arbitrary key-value data:

```
kubectl create secret generic my-secret --from-literal=key=value
```

**TODO**: Create example showing Opaque secret YAML structure

### Docker Registry Secrets

For pulling images from private registries:

```
kubectl create secret docker-registry regcred \
  --docker-server=https://registry.example.com \
  --docker-username=myuser \
  --docker-password=mypassword \
  --docker-email=user@example.com

# View the generated secret
kubectl get secret regcred -o yaml
```

Use in Pod spec:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: private-app
spec:
  containers:
  - name: app
    image: registry.example.com/myapp:v1
  imagePullSecrets:
  - name: regcred
```

**TODO**: Create complete example specs:
- `specs/secrets-types/docker-registry-secret.yaml`
- `specs/secrets-types/pod-with-imagepullsecret.yaml`

**TODO**: Add exercise demonstrating:
1. Creating docker-registry secret
2. Using it in a Pod to pull private image
3. Troubleshooting failed image pulls

### TLS Secrets

For storing TLS certificates and keys:

```
# Create from certificate files
kubectl create secret tls my-tls-cert \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem

# View structure
kubectl get secret my-tls-cert -o yaml
```

The TLS Secret type automatically validates that `tls.crt` and `tls.key` fields are present.

**TODO**: Create example specs:
- `specs/secrets-types/tls-secret.yaml`
- `specs/secrets-types/ingress-with-tls.yaml` (showing TLS secret usage)

**TODO**: Add exercise:
1. Generate self-signed certificate
2. Create TLS secret
3. Use in Ingress resource (reference to ingress lab)

### ServiceAccount Token Secrets

ServiceAccount tokens can be stored as Secrets (though in newer Kubernetes versions, these are auto-projected):

```
# ServiceAccount automatically gets a Secret
kubectl create serviceaccount my-sa

kubectl get sa my-sa -o yaml
kubectl get secrets
```

**TODO**: Add section explaining:
- Legacy vs projected tokens
- How ServiceAccounts use Secrets
- When to manually create token secrets

### Basic Auth Secrets

For HTTP basic authentication:

```
kubectl create secret generic basic-auth \
  --from-literal=username=admin \
  --from-literal=password=secretpass \
  --type=kubernetes.io/basic-auth
```

**TODO**: Add example showing basic-auth secret used with Ingress

### SSH Auth Secrets

For SSH private keys:

```
kubectl create secret generic ssh-key \
  --from-file=ssh-privatekey=~/.ssh/id_rsa \
  --type=kubernetes.io/ssh-auth
```

**TODO**: Add example showing SSH secret mounted for git operations

## Using Secrets in Pods

### As Environment Variables

#### Using envFrom (all keys)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-secrets
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'env']
    envFrom:
    - secretRef:
        name: my-secret
```

All keys from the Secret become environment variables.

#### Using env (specific keys)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-secrets
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'echo $DB_PASSWORD']
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
    - name: DB_USER
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
```

Only specified keys are loaded, and you can rename them.

**TODO**: Create comprehensive example:
- `specs/usage/secret-multi-keys.yaml` - Secret with multiple keys
- `specs/usage/pod-env-from.yaml` - Using envFrom
- `specs/usage/pod-env-specific.yaml` - Using specific env keys
- `specs/usage/pod-env-renamed.yaml` - Renaming keys during import

**TODO**: Add exercise demonstrating:
1. Create Secret with multiple database config values
2. Deploy Pod using envFrom (all variables)
3. Deploy Pod using env with specific keys
4. Deploy Pod renaming keys (DB_PASS -> DATABASE_PASSWORD)
5. Verify environment variables in each Pod

### As Volume Mounts

Mounting Secrets as files in containers:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-secret-volume
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'cat /etc/secrets/config.json']
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: app-config
```

Each key in the Secret becomes a file in the mount directory.

#### Mounting Specific Keys

```yaml
volumes:
- name: secret-volume
  secret:
    secretName: app-config
    items:
    - key: config.json
      path: application-config.json
    - key: database.conf
      path: db/database.conf
```

You can:
- Select specific keys to mount
- Rename files (key -> path)
- Set custom file permissions

**TODO**: Create examples:
- `specs/usage/pod-volume-mount.yaml` - Mount entire Secret
- `specs/usage/pod-volume-selective.yaml` - Mount specific keys
- `specs/usage/pod-volume-permissions.yaml` - Custom file modes

**TODO**: Add exercise:
1. Create Secret with multiple config files
2. Mount entire Secret as volume
3. Mount only specific keys with custom paths
4. Set file permissions (mode: 0400)
5. Verify file contents and permissions in Pod

## Managing Secret Updates

### Understanding Update Behavior

**Environment Variables**: Static for Pod lifetime - never update even if Secret changes

**Volume Mounts**: Kubernetes updates them automatically (with cache delay), but apps may not reload

From the basic lab, you learned about hot reloads and manual rollouts. Here are CKAD-specific patterns:

### Pattern 1: Annotation-Based Updates

Force Deployment rollout when Secret changes by updating Pod template metadata:

**TODO**: Create complete example:
- `specs/updates/app-secret-v1.yaml` - Initial Secret
- `specs/updates/deployment-v1.yaml` - Deployment with annotation
- `specs/updates/app-secret-v2.yaml` - Updated Secret (same name)
- `specs/updates/deployment-v2.yaml` - Updated with new annotation value

Example annotation approach:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    metadata:
      annotations:
        config-version: "v1"  # Change this to trigger rollout
    spec:
      containers:
      - name: app
        image: myapp:latest
        envFrom:
        - secretRef:
            name: app-secret
```

**TODO**: Add step-by-step exercise:
1. Deploy app with secret and annotation
2. Update Secret data
3. Update annotation in Deployment (v1 -> v2)
4. Verify rollout triggered automatically
5. Show how to rollback if needed

### Pattern 2: Immutable Secrets with Versioned Names

Create new Secret with version suffix instead of updating:

**TODO**: Create example:
- `specs/updates/app-secret-v1.yaml` - Secret named app-secret-v1
- `specs/updates/app-secret-v2.yaml` - Secret named app-secret-v2
- `specs/updates/deployment-rolling.yaml` - Deployment referencing version

```yaml
# Update process:
# 1. Create app-secret-v2
# 2. Update Deployment to reference app-secret-v2
# 3. Automatic rollout happens
# 4. Can rollback by reverting to app-secret-v1
```

**TODO**: Add exercise comparing both patterns with pros/cons

### Immutable Secrets (Kubernetes 1.21+)

Mark Secrets as immutable for security and performance:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: immutable-secret
data:
  key: dmFsdWU=
immutable: true
```

Benefits:
- Prevents accidental updates
- Improves performance (Kubernetes doesn't watch for changes)
- Must delete and recreate to update

**TODO**: Add example and exercise demonstrating immutable Secrets

## Security Best Practices

### Encoding vs Encryption

**Critical Understanding**: Base64 encoding is NOT encryption!

```
# Anyone with kubectl access can decode Secrets
kubectl get secret my-secret -o jsonpath='{.data.password}' | base64 -d
```

**TODO**: Add comprehensive security section covering:

1. **Encryption at Rest**
   - How to enable etcd encryption
   - Cloud provider default encryption
   - Reference to cluster setup docs

2. **RBAC for Secrets**
   - Creating Roles that deny Secret access
   - Separating Secret management from app deployment
   - Example RBAC policies (reference to rbac lab)

3. **External Secret Management**
   - Brief overview of External Secrets Operator
   - HashiCorp Vault integration
   - AWS Secrets Manager / Azure Key Vault
   - Note: Out of CKAD scope but important to know

4. **Avoiding Secrets in Git**
   - Never commit encoded Secrets to version control
   - Using .gitignore for secret files
   - Sealed Secrets for GitOps workflows

**TODO**: Create examples:
- `specs/security/rbac-deny-secrets.yaml` - Role denying Secret access
- `specs/security/rbac-secrets-only.yaml` - Role allowing only Secret management

## Troubleshooting Secrets

### Common Issues

**1. Secret Not Found**

```
# Check Secret exists
kubectl get secret my-secret

# Check namespace
kubectl get secret my-secret -n correct-namespace

# Pod must be in same namespace as Secret
kubectl get pods -o wide
```

**TODO**: Create troubleshooting exercise with:
- Pod referencing non-existent Secret
- Pod in wrong namespace
- Secret with typo in name

**2. Decoding Base64 Values**

```
# View Secret data (encoded)
kubectl get secret my-secret -o yaml

# Decode specific key
kubectl get secret my-secret -o jsonpath='{.data.password}' | base64 -d

# Decode all keys
kubectl get secret my-secret -o json | jq -r '.data | map_values(@base64d)'
```

**3. Pod Fails to Start**

```
# Check events
kubectl describe pod myapp

# Common errors:
# - "secret 'my-secret' not found"
# - "key 'password' not found in secret 'my-secret'"

# Verify Secret has required keys
kubectl describe secret my-secret
```

**TODO**: Create comprehensive troubleshooting lab:
1. Pod with missing Secret reference
2. Pod with wrong Secret key name
3. Secret in different namespace
4. Secret created after Pod (Pod doesn't auto-restart)
5. Volume mount path conflicts
6. File permission issues

**4. Environment Variables Not Set**

```
# Check if Secret is loaded
kubectl exec myapp -- env | grep PASSWORD

# Common issues:
# - Wrong secret name in secretRef/secretKeyRef
# - Wrong key name in secretKeyRef
# - Pod not restarted after Secret creation
```

**5. Volume Mount Issues**

```
# Check if volume is mounted
kubectl exec myapp -- ls /etc/secrets

# Check file contents
kubectl exec myapp -- cat /etc/secrets/config.json

# Check permissions
kubectl exec myapp -- ls -la /etc/secrets

# Common issues:
# - Wrong mountPath
# - Volume not defined in Pod spec
# - Items reference non-existent keys
```

**TODO**: Add systematic debugging guide with decision tree

## Using Secrets with ServiceAccounts

ServiceAccounts can automatically mount Secrets as imagePullSecrets:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp-sa
imagePullSecrets:
- name: regcred

---
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  serviceAccountName: myapp-sa
  containers:
  - name: app
    image: registry.example.com/myapp:v1
```

The Pod automatically gets access to the registry Secret through the ServiceAccount.

**TODO**: Create examples:
- `specs/serviceaccount/sa-with-imagepullsecret.yaml`
- `specs/serviceaccount/pod-using-sa.yaml`

**TODO**: Add exercise:
1. Create docker-registry Secret
2. Create ServiceAccount referencing Secret
3. Create Pod using ServiceAccount
4. Verify image pull works
5. Show how multiple Pods can share same ServiceAccount

## CKAD Exam Tips

### Speed Commands

```
# Quick Secret creation
kubectl create secret generic db-creds --from-literal=user=admin --from-literal=pass=secret

# Generate YAML
kubectl create secret generic my-secret --from-literal=key=value --dry-run=client -o yaml

# View decoded data quickly
kubectl get secret my-secret -o jsonpath='{.data.password}' | base64 -d

# Create from file and view
kubectl create secret generic config --from-file=app.conf --dry-run=client -o yaml

# Test Secret in Pod quickly
kubectl run test --rm -it --image=busybox --restart=Never -- env | grep KEY
```

### Common Patterns

**Pattern: Secret → Environment Variable**
```
kubectl create secret generic db --from-literal=password=secret123
kubectl run myapp --image=myapp:v1 --env="DB_PASS=value"  # Won't work with secretKeyRef imperatively
# Must use YAML for secretKeyRef
```

**Pattern: Quick Test Pod with Secret**
```yaml
kubectl run test --image=busybox -it --rm --restart=Never -- sh
# Then manually create with secretRef added
```

**TODO**: Add 10 rapid-fire practice scenarios matching exam format

## Lab Challenge: Multi-Tier Application with Secrets

Build a complete application demonstrating all Secret patterns:

**TODO**: Create comprehensive challenge with:

### Requirements

1. **Database Tier**
   - StatefulSet with MySQL/PostgreSQL
   - Root password from Secret (environment variable)
   - TLS certificates mounted as volumes
   - Custom database config file from Secret

2. **Backend API Tier**
   - Deployment with 2 replicas
   - Database connection string from Secret
   - API keys as environment variables
   - JWT signing key mounted as file
   - Pull from private registry (imagePullSecret)

3. **Frontend Tier**
   - Deployment with 3 replicas
   - Backend API URL from ConfigMap (not Secret)
   - Feature flags from environment
   - TLS certificates for HTTPS

4. **Configuration Updates**
   - Update database password
   - Trigger rolling update using annotation pattern
   - Update API key using versioned Secret name
   - Verify zero-downtime updates

5. **Troubleshooting Tasks**
   - Fix Pod with wrong Secret reference
   - Debug environment variable not appearing
   - Resolve namespace mismatch
   - Fix file permission issue in volume mount

**Success Criteria:**
- All Pods running and healthy
- Secrets properly isolated by tier
- No plain-text secrets in YAML files committed to git
- Updates trigger automatic rollouts
- Can decode and verify all Secret values
- Application functions end-to-end

**TODO**: Create all necessary specs in `specs/challenge/` directory

## Advanced Topics (Beyond CKAD)

Brief mention of advanced patterns:

### External Secrets Operator

Syncs Secrets from external secret stores (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault):

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-secret
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: database-credentials
  data:
  - secretKey: password
    remoteRef:
      key: prod/db/password
```

> Not required for CKAD but important for production systems

### Sealed Secrets

Encrypt Secrets for safe storage in Git:

```
# Install kubeseal CLI
# Encrypt Secret
kubeseal -f secret.yaml -w sealed-secret.yaml

# Commit sealed-secret.yaml to Git
# Deploy - controller decrypts in-cluster
kubectl apply -f sealed-secret.yaml
```

> Popular GitOps pattern but out of CKAD scope

**TODO**: Add links to external resources for these topics

## Quick Reference

### Creation

```bash
# From literals
kubectl create secret generic NAME --from-literal=KEY=VALUE

# From files
kubectl create secret generic NAME --from-file=PATH

# From env file
kubectl create secret generic NAME --from-env-file=FILE

# Docker registry
kubectl create secret docker-registry NAME --docker-server=SERVER --docker-username=USER --docker-password=PASS

# TLS
kubectl create secret tls NAME --cert=CERT --key=KEY
```

### Usage in Pods

```yaml
# Environment - all keys
envFrom:
- secretRef:
    name: secret-name

# Environment - specific key
env:
- name: VAR_NAME
  valueFrom:
    secretKeyRef:
      name: secret-name
      key: key-name

# Volume mount
volumes:
- name: vol-name
  secret:
    secretName: secret-name
volumeMounts:
- name: vol-name
  mountPath: /path
```

### Viewing

```bash
# List secrets
kubectl get secrets

# Describe (shows keys, not values)
kubectl describe secret NAME

# View YAML (base64 encoded)
kubectl get secret NAME -o yaml

# Decode value
kubectl get secret NAME -o jsonpath='{.data.KEY}' | base64 -d
```

## Cleanup

```
kubectl delete all,secret,sa -l kubernetes.courselabs.co=secrets

# If you created test namespaces
kubectl delete namespace ckad-secrets-test
```

## Further Reading

- [Secrets Documentation](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Secrets Best Practices](https://kubernetes.io/docs/concepts/security/secrets-good-practices/)
- [Encrypting Secret Data at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
- [Managing Secrets with kubectl](https://kubernetes.io/docs/tasks/configmap-secret/)

---

> Back to [basic Secrets lab](README.md) | [Course contents](../../README.md)
