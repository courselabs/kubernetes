# Secrets - CKAD Exam Preparation Narration Script

**Duration:** 20-25 minutes
**Format:** Exam-focused scenarios and advanced techniques
**Audience:** Developers preparing for the CKAD certification exam

---

## Introduction (0:00 - 0:45)

Welcome to the CKAD exam preparation session for Secrets. This is where we move beyond basics and focus on exam-specific scenarios, speed optimization, and advanced troubleshooting.

The CKAD exam tests Secrets heavily because they're fundamental to real-world Kubernetes deployments. You'll encounter Secret questions both standalone and integrated into larger application scenarios. With only 2 hours for 15-20 questions, speed and accuracy are critical.

In this session, we'll cover:
- All Secret creation methods with speed techniques
- Every Secret type including docker-registry and TLS
- Advanced consumption patterns with selective mounting
- Update strategies and immutable Secrets
- Comprehensive troubleshooting methodology
- Timed exam scenarios with solutions

Have your cluster ready. We'll be working through everything in real-time. Let's make sure you're fully prepared.

**[Pause for 2 seconds]**

---

## Section 1: Rapid Secret Creation (0:45 - 4:00)

### Method 1: From Literal Values (0:45 - 1:30)

**[Start typing]**

In the exam, imperative commands are your fastest option. Let's create a Secret with multiple values:

```bash
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=secretpass123 \
  --from-literal=database=production
```

**[Execute]**

Three key-value pairs in one command. Verify it:

```bash
kubectl get secret db-credentials -o yaml
```

**[Execute and show base64-encoded values]**

All values are automatically base64-encoded. This took about 15 seconds.

**Exam tip**: Chain multiple --from-literal flags. Use up-arrow to recall and modify commands instead of retyping.

### Method 2: From Environment Files (1:30 - 2:15)

**[Continue]**

For many values, env files are faster. Create one:

```bash
cat > database.env <<EOF
DB_HOST=postgres.default.svc.cluster.local
DB_PORT=5432
DB_USER=appuser
DB_PASSWORD=secretpass
DB_NAME=production
EOF
```

**[Execute]**

Create the Secret:

```bash
kubectl create secret generic db-config --from-env-file=database.env
```

**[Execute]**

Verify:

```bash
kubectl describe secret db-config
```

**[Execute]**

Five settings created instantly. This is ideal when questions provide multiple values.

**Exam tip**: If you see key=value pairs in the question, copy them to a file and use from-env-file.

### Method 3: From Files (2:15 - 3:00)

**[Continue]**

For configuration files or certificates:

```bash
cat > app-config.json <<EOF
{
  "api_key": "sk-abc123xyz",
  "endpoint": "https://api.example.com",
  "timeout": 30
}
EOF
```

**[Execute]**

Create Secret with filename as key:

```bash
kubectl create secret generic app-secrets --from-file=app-config.json
```

**[Execute]**

Or with custom key name:

```bash
kubectl create secret generic app-secrets-custom \
  --from-file=config=app-config.json
```

**[Execute]**

Verify the difference:

```bash
kubectl get secret app-secrets -o jsonpath='{.data}' | jq
kubectl get secret app-secrets-custom -o jsonpath='{.data}' | jq
```

**[Execute both]**

First uses "app-config.json" as the key, second uses "config". Read the question carefully for which format they want.

### Method 4: Using --dry-run for YAML (3:00 - 4:00)

**[Continue]**

Generate Secret YAML without creating it:

```bash
kubectl create secret generic my-secret \
  --from-literal=api-key=abc123 \
  --from-literal=api-secret=xyz789 \
  --dry-run=client -o yaml
```

**[Execute and show output]**

This shows exactly what will be created. You can pipe it to a file:

```bash
kubectl create secret generic my-secret \
  --from-literal=api-key=abc123 \
  --dry-run=client -o yaml > secret.yaml
```

**[Execute]**

Edit if needed, then apply:

```bash
kubectl apply -f secret.yaml
```

**[Execute]**

**Exam tip**: Use --dry-run=client -o yaml to preview, especially for complex Secrets. It's faster than writing YAML from scratch.

---

## Section 2: Secret Types - Docker Registry and TLS (4:00 - 7:30)

### Docker Registry Secrets (4:00 - 5:30)

**[Continue]**

Docker registry Secrets are common in exams for pulling private images. Create one:

```bash
kubectl create secret docker-registry my-registry-cred \
  --docker-server=registry.example.com \
  --docker-username=myuser \
  --docker-password=mypassword \
  --docker-email=user@example.com
```

**[Execute]**

Examine it:

```bash
kubectl get secret my-registry-cred -o yaml
```

**[Execute and show the .dockerconfigjson key]**

The Secret contains a .dockerconfigjson field with base64-encoded Docker credentials. Now use it in a Pod:

```yaml
cat > pod-private-image.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: private-app
spec:
  containers:
  - name: app
    image: registry.example.com/myapp:v1
  imagePullSecrets:
  - name: my-registry-cred
EOF
```

**[Execute]**

Apply it:

```bash
kubectl apply -f pod-private-image.yaml
```

**[Execute]**

Check status:

```bash
kubectl get pod private-app
```

**[Execute]**

It will fail because the registry doesn't exist, but you can see it attempts to use the credentials. In the exam, the registry will be real.

**Exam scenario**: "Create a Pod that pulls an image from a private registry at registry.example.com using credentials user/pass."

**Solution**: Create docker-registry Secret, then reference it with imagePullSecrets.

### TLS Secrets (5:30 - 7:30)

**[Continue]**

TLS Secrets store certificates and keys for HTTPS. First, create a self-signed certificate for testing:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=example.com/O=example"
```

**[Execute]**

Now create the TLS Secret:

```bash
kubectl create secret tls my-tls-cert \
  --cert=tls.crt \
  --key=tls.key
```

**[Execute]**

Examine it:

```bash
kubectl get secret my-tls-cert -o yaml
```

**[Execute and show tls.crt and tls.key fields]**

TLS Secrets automatically validate that both certificate and key are present. These are commonly used with Ingress:

```yaml
cat > ingress-tls.yaml <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
spec:
  tls:
  - hosts:
    - example.com
    secretName: my-tls-cert
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp
            port:
              number: 80
EOF
```

**[Execute]**

**Exam tip**: TLS Secret questions often combine with Ingress configuration. Know both topics well.

---

## Section 3: Using Secrets in Pods (7:30 - 12:00)

### As Environment Variables - All Keys (7:30 - 8:30)

**[Continue]**

Load all Secret keys as environment variables:

```yaml
cat > pod-env-all.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: app-env-all
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'env | grep DB_ && sleep 3600']
    envFrom:
    - secretRef:
        name: db-config
EOF
```

**[Execute]**

Apply and check:

```bash
kubectl apply -f pod-env-all.yaml
kubectl logs app-env-all
```

**[Execute]**

All keys from db-config are now environment variables. Simple and fast.

### As Environment Variables - Specific Keys (8:30 - 9:30)

**[Continue]**

Load only specific keys and optionally rename them:

```yaml
cat > pod-env-specific.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: app-env-specific
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'echo User: \$DATABASE_USER, Pass: \$DATABASE_PASSWORD && sleep 3600']
    env:
    - name: DATABASE_USER
      valueFrom:
        secretKeyRef:
          name: db-credentials
          key: username
    - name: DATABASE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-credentials
          key: password
EOF
```

**[Execute]**

Apply and verify:

```bash
kubectl apply -f pod-env-specific.yaml
kubectl logs app-env-specific
```

**[Execute]**

Only specified keys are loaded, and we renamed them (username -> DATABASE_USER).

**Exam tip**: Use envFrom when you need all keys. Use env when you need specific keys or want to rename them.

### As Volume Mounts - Entire Secret (9:30 - 10:30)

**[Continue]**

Mount all Secret keys as files:

```yaml
cat > pod-volume-all.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: app-volume-all
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'ls -la /etc/secrets && cat /etc/secrets/* && sleep 3600']
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: db-credentials
EOF
```

**[Execute]**

Apply and check:

```bash
kubectl apply -f pod-volume-all.yaml
kubectl logs app-volume-all
```

**[Execute]**

Each Secret key becomes a file. The key is the filename, the value is the file contents (decoded).

### As Volume Mounts - Specific Keys (10:30 - 11:30)

**[Continue]**

Mount only specific keys with custom filenames:

```yaml
cat > pod-volume-selective.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: app-volume-selective
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'ls -la /etc/config && cat /etc/config/* && sleep 3600']
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
      readOnly: true
  volumes:
  - name: config-volume
    secret:
      secretName: db-credentials
      items:
      - key: username
        path: db-user.txt
      - key: password
        path: db-pass.txt
        mode: 0400
EOF
```

**[Execute]**

Apply and verify:

```bash
kubectl apply -f pod-volume-selective.yaml
kubectl logs app-volume-selective
```

**[Execute]**

Only username and password are mounted, renamed to db-user.txt and db-pass.txt. The password file has mode 0400 (read-only for owner).

**Exam tip**: Use items with path to select specific keys and rename files. Use mode to set file permissions.

### SubPath for Individual Files (11:30 - 12:00)

**[Continue]**

Critical pattern for avoiding directory overwrites:

```yaml
cat > pod-subpath.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: app-subpath
spec:
  containers:
  - name: nginx
    image: nginx
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/nginx/ssl/tls.crt
      subPath: tls.crt
      readOnly: true
    - name: secret-volume
      mountPath: /etc/nginx/ssl/tls.key
      subPath: tls.key
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: my-tls-cert
EOF
```

**[Execute]**

Apply and check:

```bash
kubectl apply -f pod-subpath.yaml
kubectl exec app-subpath -- ls -la /etc/nginx/ssl/
```

**[Execute]**

Individual files are mounted without replacing the entire directory.

**Critical exam point**: Always use subPath when mounting into directories with existing files.

---

## Section 4: Managing Secret Updates (12:00 - 15:00)

### Understanding Update Behavior (12:00 - 13:00)

**[Continue]**

Create a test Pod with both environment variables and volume mounts:

```yaml
cat > pod-update-test.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: update-test
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'while true; do echo "ENV: \$DB_USER"; echo "FILE: \$(cat /secrets/username)"; sleep 5; done']
    env:
    - name: DB_USER
      valueFrom:
        secretKeyRef:
          name: db-credentials
          key: username
    volumeMounts:
    - name: secret-volume
      mountPath: /secrets
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: db-credentials
EOF
```

**[Execute]**

Apply and watch logs:

```bash
kubectl apply -f pod-update-test.yaml
kubectl logs -f update-test &
```

**[Execute]**

Now update the Secret:

```bash
kubectl patch secret db-credentials \
  -p '{"stringData":{"username":"updated-admin"}}'
```

**[Execute]**

Watch the logs. Within 60 seconds:
- ENV: Still shows "admin" (old value)
- FILE: Shows "updated-admin" (new value)

**[Press Ctrl+C to stop logs]**

**Key point**: Environment variables NEVER update. Volume mounts update automatically with a delay.

**Exam tip**: If asked about updating configuration without Pod restart, use volume mounts.

### Pattern 1: Annotation-Based Updates (13:00 - 14:00)

**[Continue]**

Force Deployment rollout when Secret changes using annotations:

```yaml
cat > deployment-annotated.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        config-version: "v1"
    spec:
      containers:
      - name: app
        image: busybox
        command: ['sh', '-c', 'env && sleep 3600']
        envFrom:
        - secretRef:
            name: db-credentials
EOF
```

**[Execute]**

Apply:

```bash
kubectl apply -f deployment-annotated.yaml
```

**[Execute]**

Now update both Secret and Deployment:

```bash
kubectl patch secret db-credentials \
  -p '{"stringData":{"username":"new-user"}}'

kubectl patch deployment myapp \
  -p '{"spec":{"template":{"metadata":{"annotations":{"config-version":"v2"}}}}}'
```

**[Execute both]**

The annotation change triggers automatic rollout:

```bash
kubectl rollout status deployment myapp
```

**[Execute]**

New Pods pick up the new Secret values.

### Pattern 2: Immutable Secrets with Versioning (14:00 - 15:00)

**[Continue]**

Create immutable Secret with version in name:

```yaml
cat > secret-v1.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials-v1
stringData:
  username: admin
  password: pass123
immutable: true
EOF
```

**[Execute]**

Apply:

```bash
kubectl apply -f secret-v1.yaml
```

**[Execute]**

Try to update it:

```bash
kubectl patch secret db-credentials-v1 \
  -p '{"stringData":{"username":"new-user"}}'
```

**[Execute and show error]**

It fails! Immutable Secrets cannot be updated. To update, create a new version:

```yaml
cat > secret-v2.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials-v2
stringData:
  username: new-admin
  password: newpass456
immutable: true
EOF
```

**[Execute]**

Apply v2:

```bash
kubectl apply -f secret-v2.yaml
```

**[Execute]**

Update Deployment to reference v2:

```bash
kubectl set env deployment/myapp --from=secret/db-credentials-v2
```

**[Execute]**

Kubernetes performs rolling update automatically. Benefits:
- Protection against accidental changes
- Better performance (no watching for changes)
- Easy rollback (just reference previous version)

**Exam tip**: If question mentions "production" or "prevent updates", think immutable Secrets.

---

## Section 5: Troubleshooting Secrets (15:00 - 18:30)

### Issue 1: Secret Not Found (15:00 - 15:45)

**[Continue]**

Create Pod referencing non-existent Secret:

```yaml
cat > pod-missing-secret.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: broken-app
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'sleep 3600']
    envFrom:
    - secretRef:
        name: nonexistent-secret
EOF
```

**[Execute]**

Apply:

```bash
kubectl apply -f pod-missing-secret.yaml
kubectl get pod broken-app
```

**[Execute]**

Status: CreateContainerConfigError. Describe it:

```bash
kubectl describe pod broken-app | tail -10
```

**[Execute and show "secret 'nonexistent-secret' not found"]**

**Debugging steps**:

```bash
# List all Secrets
kubectl get secrets

# Check correct namespace
kubectl get secrets -n correct-namespace

# Verify Secret name spelling
```

**Solution 1**: Create the missing Secret.

**Solution 2**: Make it optional:

```yaml
envFrom:
- secretRef:
    name: nonexistent-secret
    optional: true
```

Pod will start even without the Secret.

### Issue 2: Wrong Key Name (15:45 - 16:30)

**[Continue]**

Reference non-existent key:

```yaml
cat > pod-wrong-key.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: wrong-key
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'sleep 3600']
    env:
    - name: DB_USER
      valueFrom:
        secretKeyRef:
          name: db-credentials
          key: wrong_key
EOF
```

**[Execute]**

Apply and check:

```bash
kubectl apply -f pod-wrong-key.yaml
kubectl get pod wrong-key
kubectl describe pod wrong-key | tail -10
```

**[Execute]**

Error: "key 'wrong_key' not found in Secret 'db-credentials'"

**Debugging**:

```bash
kubectl describe secret db-credentials
```

**[Execute and show correct keys]**

Fix the key name in Pod spec.

**Exam tip**: Always verify Secret keys with describe before creating Pods.

### Issue 3: Namespace Mismatch (16:30 - 17:00)

**[Continue]**

Secrets must be in the same namespace as Pods:

```bash
# Create Secret in default namespace
kubectl create secret generic app-secret --from-literal=key=value

# Try to use it from different namespace
kubectl create namespace test
kubectl run testpod -n test --image=busybox --restart=Never \
  --env="KEY=value" -- sleep 3600

kubectl set env pod/testpod -n test --from=secret/app-secret
```

**[Execute]**

This will fail because the Secret is in default, not test.

**Solution**: Create Secret in the correct namespace:

```bash
kubectl create secret generic app-secret -n test --from-literal=key=value
```

**[Execute]**

### Issue 4: Volume Mount Overwrites Directory (17:00 - 18:00)

**[Continue]**

Classic mistake:

```yaml
cat > pod-bad-mount.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: nginx-broken
spec:
  containers:
  - name: nginx
    image: nginx
    volumeMounts:
    - name: secret-volume
      mountPath: /usr/share/nginx/html
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: db-credentials
EOF
```

**[Execute]**

Apply and check:

```bash
kubectl apply -f pod-bad-mount.yaml
kubectl exec nginx-broken -- ls /usr/share/nginx/html
```

**[Execute]**

Instead of index.html, you see Secret keys. The mount replaced the entire directory.

**Solution**: Use subPath or mount to different directory.

### Issue 5: Decoding for Verification (18:00 - 18:30)

**[Continue]**

Quick commands for debugging Secret values:

```bash
# View encoded
kubectl get secret db-credentials -o yaml

# Decode specific key
kubectl get secret db-credentials -o jsonpath='{.data.username}' | base64 -d

# Decode all keys with jq
kubectl get secret db-credentials -o json | \
  jq -r '.data | map_values(@base64d)'
```

**[Execute all]**

**Exam tip**: Use jsonpath with base64 -d to quickly verify Secret values.

---

## Section 6: ServiceAccounts with imagePullSecrets (18:30 - 19:30)

**[Continue]**

ServiceAccounts can reference docker-registry Secrets, automatically providing credentials to all Pods:

```yaml
cat > sa-with-secret.yaml <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
imagePullSecrets:
- name: my-registry-cred
---
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sa
spec:
  serviceAccountName: app-sa
  containers:
  - name: app
    image: registry.example.com/myapp:v1
EOF
```

**[Execute]**

Apply:

```bash
kubectl apply -f sa-with-secret.yaml
```

**[Execute]**

The Pod automatically gets registry credentials through the ServiceAccount. No need to specify imagePullSecrets in every Pod.

**Exam scenario**: "All Pods in namespace should pull from private registry."

**Solution**: Create ServiceAccount with imagePullSecrets, use it as default or in all Pods.

---

## Section 7: Exam Scenarios and Speed Techniques (19:30 - 23:00)

### Scenario 1: Database Credentials Setup (19:30 - 20:30)

**[Continue]**

**Exam question**: "Create a Secret with database credentials (host, port, user, password) and use it in a Deployment running postgres client."

**Time limit**: 5 minutes

**Solution**:

```bash
# Step 1: Create Secret (30 seconds)
kubectl create secret generic db-creds \
  --from-literal=host=postgres.default.svc.cluster.local \
  --from-literal=port=5432 \
  --from-literal=username=dbuser \
  --from-literal=password=dbpass123

# Step 2: Create Deployment (60 seconds)
kubectl create deployment db-client --image=postgres:14 \
  --replicas=1 -- sleep 3600

# Step 3: Add Secret as env vars (30 seconds)
kubectl set env deployment/db-client --from=secret/db-creds

# Step 4: Verify (30 seconds)
kubectl rollout status deployment/db-client
kubectl exec deploy/db-client -- env | grep -E "host|port|username|password"
```

**[Execute all]**

Total time: 2.5 minutes. Well under the limit.

**Speed tip**: kubectl set env is much faster than editing YAML.

### Scenario 2: TLS Certificate for Ingress (20:30 - 21:30)

**[Continue]**

**Exam question**: "Create TLS Secret from provided certificate files and configure Ingress to use HTTPS."

**Solution**:

```bash
# Step 1: Create TLS Secret (15 seconds)
kubectl create secret tls app-tls --cert=tls.crt --key=tls.key

# Step 2: Create Ingress with TLS (90 seconds)
kubectl create ingress secure-app \
  --rule="app.example.com/*=myapp:80,tls=app-tls"

# Step 3: Verify (15 seconds)
kubectl get ingress secure-app -o yaml | grep tls -A 5
```

**[Execute]**

Total: ~2 minutes.

**Exam tip**: The --rule flag with tls= parameter creates Ingress with TLS in one command.

### Scenario 3: Private Registry Access (21:30 - 22:30)

**[Continue]**

**Exam question**: "Deploy application from private registry gcr.io/myproject using credentials."

**Solution**:

```bash
# Step 1: Create docker-registry Secret (30 seconds)
kubectl create secret docker-registry gcr-creds \
  --docker-server=gcr.io \
  --docker-username=_json_key \
  --docker-password="$(cat key.json)" \
  --docker-email=user@example.com

# Step 2: Create Deployment with imagePullSecrets (60 seconds)
kubectl create deployment myapp --image=gcr.io/myproject/myapp:v1 \
  --replicas=2 --port=8080

kubectl patch deployment myapp \
  -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"gcr-creds"}]}}}}'

# Step 3: Verify (15 seconds)
kubectl get pods -l app=myapp
kubectl describe pod -l app=myapp | grep -A 3 "Image:"
```

**[Execute]**

**Alternative with ServiceAccount**:

```bash
kubectl create sa app-sa
kubectl patch sa app-sa \
  -p '{"imagePullSecrets":[{"name":"gcr-creds"}]}'
kubectl set sa deployment/myapp app-sa
```

**[Execute]**

### Scenario 4: Multi-Source Configuration (22:30 - 23:00)

**[Continue]**

**Exam question**: "Application needs database password from Secret, host from ConfigMap, and custom timeout as direct env var."

**Solution**:

```yaml
cat > pod-multi-source.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: app
    image: myapp:v1
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: db-config
          key: host
    - name: DB_TIMEOUT
      value: "30"
EOF
```

**[Execute]**

**Speed technique**: Use kubectl run with --dry-run, then edit:

```bash
kubectl run myapp --image=myapp:v1 --dry-run=client -o yaml > pod.yaml
# Edit to add env sources
kubectl apply -f pod.yaml
```

---

## Section 8: Quick Command Reference (23:00 - 24:00)

**[Continue speaking while showing reference]**

Essential commands for the exam:

**Creation**:
```bash
# Generic from literals
kubectl create secret generic NAME --from-literal=KEY=VALUE

# From env file
kubectl create secret generic NAME --from-env-file=FILE

# From files
kubectl create secret generic NAME --from-file=PATH

# Docker registry
kubectl create secret docker-registry NAME \
  --docker-server=SERVER --docker-username=USER \
  --docker-password=PASS --docker-email=EMAIL

# TLS
kubectl create secret tls NAME --cert=CERT --key=KEY

# Dry run to YAML
kubectl create secret generic NAME --from-literal=key=val \
  --dry-run=client -o yaml > secret.yaml
```

**Inspection**:
```bash
# List Secrets
kubectl get secrets

# Describe (hides values)
kubectl describe secret NAME

# View YAML (base64 encoded)
kubectl get secret NAME -o yaml

# Decode specific key
kubectl get secret NAME -o jsonpath='{.data.KEY}' | base64 -d
```

**Deployment Integration**:
```bash
# Add Secret to Deployment
kubectl set env deployment/NAME --from=secret/SECRET-NAME

# Patch for imagePullSecrets
kubectl patch deployment NAME \
  -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"SECRET"}]}}}}'
```

**Debugging**:
```bash
# Check env vars in Pod
kubectl exec POD -- env | grep KEY

# Check mounted files
kubectl exec POD -- ls -la /path
kubectl exec POD -- cat /path/file

# Describe Pod for errors
kubectl describe pod POD | tail -20
```

---

## Section 9: Exam Tips and Best Practices (24:00 - 25:00)

**[Continue]**

Critical exam tips:

**Time Management**:
- Creating a Secret: 20-30 seconds
- Using it in a Pod: 30-60 seconds
- Complete Secret question: 3-5 minutes max
- If taking longer, skip and return later

**Command Efficiency**:
- kubectl create secret for speed
- kubectl set env for adding to Deployments
- kubectl patch for specific changes
- --dry-run=client -o yaml to preview

**Common Mistakes**:
- Forgetting quotes around values with special characters
- Using ConfigMap instead of Secret (or vice versa)
- Mounting without subPath and breaking directories
- Not setting optional: true when Secret might not exist
- Namespace mismatch between Secret and Pod

**What to Memorize**:
- secretRef vs secretKeyRef syntax
- imagePullSecrets structure
- TLS Secret field names (tls.crt, tls.key)
- Volume mount with items and mode
- subPath syntax

**Verification Checklist**:
1. kubectl get secret - exists
2. kubectl describe secret - has correct keys
3. kubectl get pod - running
4. kubectl logs pod - started correctly
5. kubectl exec pod -- env or ls - values present

**Final Tips**:
- Practice with timer
- Learn vim basics for quick edits
- Use kubectl explain when stuck
- Read questions twice
- Move on if stuck, come back later

---

## Conclusion (25:00)

**[Wrap up]**

Secrets are fundamental to CKAD and appear throughout the exam. Master these skills:

- All creation methods with speed
- Every Secret type especially docker-registry and TLS
- Both consumption patterns with advanced options
- Troubleshooting methodology
- Update strategies including immutable Secrets
- Critical subPath pattern

Practice until you can complete any Secret task in under 5 minutes. The exam rewards speed and accuracy.

Good luck with your CKAD exam. Keep practicing, stay calm, and remember: kubectl is your best friend.

---

## Presenter Notes

**Timing Checkpoints:**
- Section 2 complete by 7:30
- Section 5 complete by 18:30
- Section 7 complete by 23:00

**Key Emphasis Points:**
- Speed techniques for exam (kubectl create, kubectl set env)
- docker-registry and TLS Secrets (high-value exam topics)
- Troubleshooting methodology (describe -> logs -> exec)
- subPath to avoid directory overwrites
- Immutable Secrets with versioning

**Demo Preparation:**
- Pre-create certificate files for TLS demos
- Have sample key.json for docker-registry
- Test all commands before recording
- Prepare YAML files for copy-paste

**Pacing:**
- Sections 1-3: Moderate pace, thorough demonstration
- Section 5: Slower pace, emphasize troubleshooting
- Section 7: Faster pace, show speed in action
- Section 8: Very fast, rapid-fire reference

**Common Questions:**
- "Which is faster?" - Imperative commands
- "When to use YAML?" - Complex scenarios or for version control
- "How to debug fast?" - describe pod, then describe secret
- "Forgot syntax?" - kubectl create --help and kubectl explain

**Security Emphasis:**
- Repeatedly stress base64 is not encryption
- Mention RBAC and encryption at rest
- Reference external secret stores
- Explain real-world security practices

**Additional Resources:**
- kubernetes.io docs (allowed in exam)
- kubectl cheat sheet
- killer.sh CKAD simulator
- Practice labs and exercises
