# Secrets - Quickfire Questions

Test your knowledge of Kubernetes Secrets with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary difference between ConfigMaps and Secrets?

A) ConfigMaps cannot be mounted as volumes
B) Secrets are faster to access
C) Secrets are base64-encoded and designed for sensitive data
D) Secrets are encrypted at rest by default

### 2. Which Secret type should you use for storing Docker registry credentials?

A) kubernetes.io/dockerconfigjson
B) kubernetes.io/basic-auth
C) kubernetes.io/tls
D) Opaque

### 3. How are Secret values encoded in YAML?

A) SHA-256
B) Base64
C) AES-256
D) Plain text

### 4. Which kubectl command creates a generic Secret from literal values?

A) kubectl apply secret mysecret --data password=secret123
B) kubectl create secret generic mysecret --from-literal=password=secret123
C) kubectl secret create mysecret --value password=secret123
D) kubectl create secret mysecret --literal password=secret123

### 5. How do you consume a Secret as environment variables in a Pod?

A) Using `volumes` only
B) Using `configMapRef` with secret name
C) Secrets cannot be used as environment variables
D) Using `envFrom` with `secretRef` or `env` with `secretKeyRef`

### 6. What is a security concern when using Secrets as environment variables?

A) They cannot be updated
B) They are automatically logged in plain text
C) They are slower than volume mounts
D) They may be exposed in logs, crash dumps, or to child processes

### 7. How do you create a TLS Secret from certificate files?

A) kubectl apply secret tls --certificate=cert.pem --private-key=key.pem
B) kubectl create secret tls mytls --cert=cert.pem --key=key.pem
C) kubectl create secret generic mytls --from-file=cert.pem --from-file=key.pem
D) kubectl create tls mytls --cert=cert.pem --key=key.pem

### 8. When you mount a Secret as a volume, what permissions do the files have by default?

A) 400 (r--------)
B) 644 (rw-r--r--)
C) 755 (rwxr-xr-x)
D) 600 (rw-------)

### 9. Can you update a Secret after it has been created?

A) Yes, using kubectl edit or kubectl apply
B) Only for Opaque Secrets
C) Only by deleting and recreating it
D) No, Secrets are immutable

### 10. What is the recommended way to reference Secrets in Pod specs to avoid startup failures?

A) Use optional: true in the secretKeyRef
B) Use ConfigMaps instead
C) Always create Secrets before Pods
D) Create Secrets with initContainers

---

## Answers

1. **C** - While Secrets are base64-encoded (not encrypted) in etcd by default, they are designed for sensitive data and have additional security controls. Encryption at rest requires additional configuration.

2. **A** - The `kubernetes.io/dockerconfigjson` type is specifically for Docker registry credentials. Create with `kubectl create secret docker-registry`.

3. **B** - Secret values in YAML are base64-encoded. This is not encryption, just encoding. Use `echo -n 'value' | base64` to encode.

4. **B** - `kubectl create secret generic mysecret --from-literal=key=value` creates an Opaque secret from literal values. You can specify multiple `--from-literal` flags.

5. **D** - Use `envFrom` with `secretRef` for all keys, or `env` with `valueFrom.secretKeyRef` for specific keys, similar to ConfigMaps.

6. **D** - Environment variables may appear in logs, crash dumps, or be inherited by child processes. Volume mounts are more secure for sensitive data.

7. **B** - `kubectl create secret tls mytls --cert=cert.pem --key=key.pem` creates a TLS secret with `tls.crt` and `tls.key` keys.

8. **D** - Secret files mounted as volumes have 0600 permissions (readable/writable by owner only) by default for security. You can override with `defaultMode`.

9. **A** - Secrets can be updated using `kubectl edit secret <name>` or `kubectl apply`. Remember to base64-encode new values. Pods using volumes will eventually see updates.

10. **A** - Using `optional: true` in `secretKeyRef` or `configMapKeyRef` allows Pods to start even if the Secret doesn't exist. However, it's better to ensure Secrets exist first.

---

## Study Resources

- [Lab README](README.md) - Core Secret concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Secret topics
- [Official Secrets Documentation](https://kubernetes.io/docs/concepts/configuration/secret/)
