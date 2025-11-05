# Troubleshooting Application Modeling - CKAD Exam Preparation

**Duration:** 25-30 minutes
**Format:** CKAD exam-focused scenarios for multi-resource applications
**Target:** CKAD certification candidates

---

## Introduction (1 minute)

Welcome to CKAD preparation for application modeling troubleshooting. This combines configuration management (ConfigMaps, Secrets), storage (PersistentVolumes), and namespaces—all critical CKAD topics.

**CKAD Domains Covered:**
- **Application Design and Build** (20%) - ConfigMaps, Secrets, multi-container pods
- **Application Deployment** (20%) - Deployments with configuration
- **Services & Networking** (20%) - Service connectivity
- **Application Observability & Maintenance** (15%) - Troubleshooting
- **Application Environment, Configuration & Security** (25%) - ConfigMaps, Secrets, SecurityContexts

**Why This Matters:**
- Almost every CKAD question involves configuration
- Multi-resource troubleshooting combines multiple domains
- Namespace management is fundamental
- Fast diagnosis is essential for time management

**Today's Comprehensive Coverage:**
1. ConfigMap and Secret troubleshooting patterns
2. PersistentVolume issues and fixes
3. Namespace-related problems
4. Multi-resource dependency debugging
5. Rapid-fire practice scenarios
6. Time-saving techniques

Let's master multi-resource troubleshooting!

---

## Section 1: ConfigMap Troubleshooting (6 minutes)

### Common ConfigMap Failure Patterns (1.5 minutes)

**Pattern 1: ConfigMap Not Found**

**Symptom:**
```
Pod Status: CreateContainerConfigError
Events: configmap "app-config" not found
```

**Causes:**
1. ConfigMap doesn't exist
2. ConfigMap in wrong namespace
3. Typo in ConfigMap name

**Quick Diagnosis:**
```bash
# Check if exists
kubectl get cm -n <namespace>

# Check all namespaces
kubectl get cm -A | grep <name>

# Check pod reference
kubectl get pod <name> -n <namespace> -o yaml | grep -A 3 configMap
```

**Pattern 2: Key Not Found**

**Symptom:**
```
Pod runs but application fails
Events: key "database_url" not found in ConfigMap "app-config"
```

**Diagnosis:**
```bash
# Check actual keys
kubectl get cm app-config -n <namespace> -o jsonpath='{.data}'

# Check what pod expects
kubectl get pod <name> -n <namespace> -o yaml | grep -A 5 configMapKeyRef
```

### Scenario 1: Missing ConfigMap (2 minutes)

**CKAD Question:** "The webapp deployment in namespace `prod` has pods in CreateContainerConfigError. The application expects configuration from a ConfigMap named `webapp-config`. Fix the issue."

**Solution Process:**

```bash
# 1. Confirm the problem
kubectl get pods -n prod
# Shows: CreateContainerConfigError

kubectl describe pod <name> -n prod
# Events: configmap "webapp-config" not found

# 2. Check if ConfigMap exists anywhere
kubectl get cm webapp-config -n prod
# Not found

kubectl get cm -A | grep webapp-config
# Found in default namespace!

# 3. Move to correct namespace
kubectl get cm webapp-config -n default -o yaml | \
  kubectl apply -n prod -f -

# OR create fresh
kubectl create cm webapp-config -n prod \
  --from-literal=PORT=8080 \
  --from-literal=LOG_LEVEL=info

# 4. Verify fix
kubectl get pods -n prod --watch
# Wait for pod to become Running

# 5. Verify configuration loaded
kubectl logs <pod-name> -n prod
# Should show config loaded successfully
```

**Time Target:** 2 minutes

### Scenario 2: Key Name Mismatch (2 minutes)

**CKAD Question:** "The api-server deployment is running but the application logs show 'DATABASE_URL not set'. The ConfigMap `db-config` exists with the database connection. Fix the configuration."

**Solution Process:**

```bash
# 1. Check what keys exist in ConfigMap
kubectl get cm db-config -o jsonpath='{.data}' | jq
# Shows: {"database-url": "postgres://..."}  # Note: hyphen not underscore!

# 2. Check what pod expects
kubectl get deployment api-server -o yaml | grep -A 5 configMapKeyRef
# Shows: key: DATABASE_URL  # Looking for underscore

# 3. Fix option A: Update ConfigMap key
kubectl edit cm db-config
# Change: database-url → DATABASE_URL

# 3. Fix option B: Update deployment reference
kubectl edit deployment api-server
# Change: key: DATABASE_URL → key: database-url

# 4. Restart pods to pick up change
kubectl rollout restart deployment/api-server

# 5. Verify
kubectl logs <pod-name> | grep DATABASE
# Should show: "Using DATABASE_URL: postgres://..."
```

**Time Target:** 2 minutes

### Scenario 3: ConfigMap in Wrong Namespace (1.5 minutes)

**CKAD Question:** "Create a ConfigMap in namespace `app` with key `api-endpoint` and value `http://api.example.com`, then update the `frontend` deployment to use it."

**Solution:**

```bash
# 1. Create ConfigMap in correct namespace
kubectl create cm frontend-config -n app \
  --from-literal=api-endpoint=http://api.example.com

# 2. Update deployment to reference it
kubectl edit deployment frontend -n app
```

Add to container spec:
```yaml
env:
- name: API_ENDPOINT
  valueFrom:
    configMapKeyRef:
      name: frontend-config
      key: api-endpoint
```

```bash
# 3. Verify
kubectl get pods -n app
kubectl logs <pod-name> -n app | grep API_ENDPOINT
```

**Time Target:** 1-2 minutes

---

## Section 2: Secret Troubleshooting (5 minutes)

### Common Secret Failure Patterns (1 minute)

**Similar to ConfigMaps, plus:**

1. **Encoding issues** - Must be base64 encoded in YAML
2. **Type mismatches** - docker-registry, tls, basic-auth, opaque
3. **Permission issues** - RBAC preventing access

### Scenario 4: Missing Secret (2 minutes)

**CKAD Question:** "The database pod is in CreateContainerConfigError. It expects a Secret named `db-credentials` with keys `username` and `password`. Create the Secret and fix the pod."

**Solution:**

```bash
# 1. Confirm problem
kubectl describe pod <db-pod-name>
# Events: secret "db-credentials" not found

# 2. Create Secret (kubectl handles base64 encoding)
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=supersecret

# 3. Verify Secret created
kubectl get secret db-credentials
kubectl describe secret db-credentials
# Should show: username: 5 bytes, password: 11 bytes

# 4. Delete pod to force recreation
kubectl delete pod <db-pod-name>

# 5. Verify pod starts
kubectl get pods --watch
kubectl logs <new-pod-name> | grep -i connect
# Should show successful database connection
```

**Time Target:** 2 minutes

### Scenario 5: Docker Registry Secret (2 minutes)

**CKAD Question:** "The app deployment can't pull images from private registry `myregistry.com`. Create an image pull secret and configure the deployment to use it."

**Solution:**

```bash
# 1. Create docker-registry secret
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.com \
  --docker-username=myuser \
  --docker-password=mypassword \
  --docker-email=user@example.com

# 2. Update deployment
kubectl edit deployment app
```

Add to pod spec:
```yaml
spec:
  imagePullSecrets:
  - name: regcred
  containers:
  - name: app
    image: myregistry.com/myapp:v1
```

```bash
# 3. Verify pods can pull image
kubectl get pods --watch
# Should transition from ImagePullBackOff to Running

# 4. Verify with describe
kubectl describe pod <name> | grep -i "pull.*success"
```

**Time Target:** 2 minutes

### Scenario 6: TLS Secret for Ingress (1 minute)

**CKAD Question:** "Create a TLS secret named `webapp-tls` from certificate file `tls.crt` and key file `tls.key`."

**Solution:**

```bash
# Create TLS secret
kubectl create secret tls webapp-tls \
  --cert=tls.crt \
  --key=tls.key

# Verify
kubectl get secret webapp-tls
kubectl describe secret webapp-tls
# Should show: tls.crt: ... bytes, tls.key: ... bytes

# Use in Ingress
kubectl edit ingress webapp
```

Add:
```yaml
spec:
  tls:
  - hosts:
    - webapp.example.com
    secretName: webapp-tls
```

**Time Target:** 1 minute

---

## Section 3: PersistentVolume Troubleshooting (6 minutes)

### PVC Lifecycle and States (1 minute)

**States:**
- **Pending** - Waiting for binding
- **Bound** - Successfully bound to PV
- **Released** - PVC deleted, PV not yet reclaimed
- **Failed** - Reclamation failed

**Binding Requirements:**
- Storage size (PV >= PVC)
- Access modes compatible
- Storage class matches (if specified)
- Volume mode matches

### Scenario 7: PVC Stuck in Pending (3 minutes)

**CKAD Question:** "The data-storage PVC in namespace `app` is stuck in Pending state. The pod using it can't start. Fix the issue."

**Solution Process:**

```bash
# 1. Check PVC status
kubectl get pvc -n app
# Shows: STATUS: Pending

# 2. Describe PVC to see requirements
kubectl describe pvc data-storage -n app
# Note:
# - Requested: 5Gi
# - Access Modes: ReadWriteOnce
# - StorageClass: <none> or standard

# 3. Check available PVs
kubectl get pv
# Look for Available PVs

kubectl get pv -o custom-columns=NAME:.metadata.name,CAPACITY:.spec.capacity.storage,ACCESS:.spec.accessModes,STATUS:.status.phase

# 4. Check if any PV matches
# If no matching PV, create one

kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: data-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /mnt/data
EOF

# 5. Verify PVC binds
kubectl get pvc -n app --watch
# Should transition to: Bound

# 6. Verify pod starts
kubectl get pods -n app
# Should now be Running
```

**Common Mismatches:**

**Size Mismatch:**
```yaml
# PVC needs:
storage: 10Gi

# PV offers:
storage: 5Gi  # Too small!
```

**Access Mode Mismatch:**
```yaml
# PVC needs:
accessModes:
- ReadWriteMany

# PV offers:
accessModes:
- ReadWriteOnce  # Incompatible!
```

**Time Target:** 3 minutes

### Scenario 8: Multiple Pods and RWO Volume (2 minutes)

**CKAD Question:** "A deployment with 3 replicas is trying to use a ReadWriteOnce PVC. Only one pod is Running, the others are stuck in ContainerCreating. Fix the issue."

**Problem:** ReadWriteOnce volumes can only be mounted by pods on the same node.

**Solution A: Change to RWX (if supported)**

```bash
# Check if RWX storage is available
kubectl get storageclass
# Look for one that supports ReadWriteMany

# Delete existing PVC and create new one with RWX
kubectl delete pvc app-data
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
EOF
```

**Solution B: Use StatefulSet with per-pod volumes**

```bash
# Convert Deployment to StatefulSet
kubectl delete deployment app

kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: app
spec:
  serviceName: app
  replicas: 3
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
      - name: app
        image: myapp:latest
        volumeMounts:
        - name: data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 1Gi
EOF
```

**Solution C: Use hostPath with node affinity (development only)**

For development/testing only - not production suitable.

**Time Target:** 2 minutes

---

## Section 4: Namespace Troubleshooting (4 minutes)

### Namespace Scope Rules (1 minute)

**Namespace-Scoped Resources:**
- Pods, Deployments, Services
- ConfigMaps, Secrets
- PersistentVolumeClaims
- ServiceAccounts
- Roles, RoleBindings

**Cluster-Scoped Resources:**
- PersistentVolumes
- Nodes
- StorageClasses
- ClusterRoles, ClusterRoleBindings
- Namespaces themselves

**Key Rule:** Namespace-scoped resources can only reference other resources in the same namespace (with few exceptions).

### Scenario 9: Cross-Namespace Configuration (2 minutes)

**CKAD Question:** "The webapp deployment in namespace `frontend` needs to access the API service in namespace `backend`. Update the configuration."

**Solution:**

```bash
# 1. Check service in backend namespace
kubectl get svc -n backend
# Note the service name (e.g., "api")

# 2. Use fully qualified domain name
# Format: <service>.<namespace>.svc.cluster.local

# 3. Update frontend ConfigMap
kubectl create cm webapp-config -n frontend \
  --from-literal=API_URL=http://api.backend.svc.cluster.local:8080

# 4. Update deployment to use ConfigMap
kubectl edit deployment webapp -n frontend
```

Add:
```yaml
env:
- name: API_URL
  valueFrom:
    configMapKeyRef:
      name: webapp-config
      key: API_URL
```

```bash
# 5. Verify connectivity
kubectl exec -n frontend <pod-name> -- curl http://api.backend.svc.cluster.local:8080
```

**Time Target:** 2 minutes

### Scenario 10: Moving Resources Between Namespaces (1 minute)

**CKAD Question:** "A ConfigMap `shared-config` in namespace `default` needs to be available in namespace `team-a`."

**Solution:**

```bash
# Export and reimport
kubectl get cm shared-config -n default -o yaml | \
  sed 's/namespace: default/namespace: team-a/' | \
  kubectl apply -f -

# OR use kubectl create from existing
kubectl get cm shared-config -n default -o yaml > /tmp/config.yaml
# Edit namespace field
kubectl apply -f /tmp/config.yaml

# Verify
kubectl get cm shared-config -n team-a
```

**Time Target:** 1 minute

---

## Section 5: Multi-Resource Debugging (5 minutes)

### Debugging Workflow for Complex Applications (1.5 minutes)

**Step 1: Map Dependencies**

```
ConfigMap →
Secret →     Pod/Deployment → Service → Ingress
PVC →
```

**Step 2: Check Each Layer**

```bash
# Layer 1: Configuration resources
kubectl get cm,secret,pvc -n <namespace>

# Layer 2: Pods
kubectl get pods -n <namespace>
kubectl describe pod <name> -n <namespace>

# Layer 3: Services
kubectl get svc -n <namespace>
kubectl get endpoints -n <namespace>

# Layer 4: External access (if applicable)
kubectl get ingress -n <namespace>
```

**Step 3: Follow Error Trail**

```bash
# Start at pod events
kubectl describe pod <name> -n <namespace> | grep -A 10 Events

# If ConfigMap/Secret error → Fix that resource
# If PVC error → Check PV binding
# If running but not ready → Check probes/logs
# If service error → Check endpoints
```

### Scenario 11: Full Stack Troubleshooting (3.5 minutes)

**CKAD Question:** "Deploy a complete application stack in namespace `myapp` with:
- Deployment `webapp` using image `nginx:alpine`
- ConfigMap `webapp-config` with `MESSAGE=Hello CKAD`
- Secret `webapp-secret` with `API_KEY=secret123`
- PVC `webapp-data` requesting 1Gi
- Service `webapp-svc` exposing port 80

The deployment should mount the PVC at `/data`, load config from ConfigMap, and secret from Secret."

**Solution:**

```bash
# 1. Create namespace
kubectl create namespace myapp

# 2. Create ConfigMap
kubectl create cm webapp-config -n myapp \
  --from-literal=MESSAGE="Hello CKAD"

# 3. Create Secret
kubectl create secret generic webapp-secret -n myapp \
  --from-literal=API_KEY=secret123

# 4. Create PVC
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: webapp-data
  namespace: myapp
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF

# 5. Create Deployment
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  namespace: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: nginx:alpine
        env:
        - name: MESSAGE
          valueFrom:
            configMapKeyRef:
              name: webapp-config
              key: MESSAGE
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: webapp-secret
              key: API_KEY
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: webapp-data
EOF

# 6. Create Service
kubectl expose deployment webapp -n myapp \
  --name=webapp-svc \
  --port=80 \
  --type=ClusterIP

# 7. Verify everything
kubectl get all,cm,secret,pvc -n myapp
kubectl get pods -n myapp
kubectl describe pod -n myapp
kubectl get endpoints -n myapp

# 8. Test
kubectl exec -n myapp <pod-name> -- env | grep MESSAGE
kubectl exec -n myapp <pod-name> -- env | grep API_KEY
kubectl exec -n myapp <pod-name> -- ls /data
```

**Time Target:** 5 minutes (full deployment from scratch)

---

## Section 6: Rapid-Fire Practice (3 minutes)

### Quick Drill 1 (45 seconds)

**Task:** "ConfigMap `app-cfg` in namespace `prod` is missing. Create it with `DB_HOST=postgres.prod.svc.cluster.local`."

```bash
kubectl create cm app-cfg -n prod --from-literal=DB_HOST=postgres.prod.svc.cluster.local
```

### Quick Drill 2 (45 seconds)

**Task:** "Secret `db-pass` needs key `password` with value `myP@ssw0rd` in namespace `backend`."

```bash
kubectl create secret generic db-pass -n backend --from-literal=password='myP@ssw0rd'
```

### Quick Drill 3 (45 seconds)

**Task:** "PVC `data-claim` in namespace `app` is Pending. Create a matching 2Gi PV."

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: data-pv
spec:
  capacity:
    storage: 2Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /mnt/data
EOF
```

### Quick Drill 4 (45 seconds)

**Task:** "Move ConfigMap `shared-config` from `default` to `team-a` namespace."

```bash
kubectl get cm shared-config -o yaml | sed 's/namespace: default/namespace: team-a/' | kubectl apply -f -
```

---

## Section 7: Time-Saving Techniques (2 minutes)

### Quick Resource Creation (1 minute)

```bash
# ConfigMap from literals
kubectl create cm myconfig --from-literal=key1=value1 --from-literal=key2=value2

# ConfigMap from file
kubectl create cm myconfig --from-file=config.properties

# Secret from literals
kubectl create secret generic mysecret --from-literal=password=secret

# Docker registry secret
kubectl create secret docker-registry regcred --docker-server=reg.com --docker-username=user --docker-password=pass

# TLS secret
kubectl create secret tls tls-secret --cert=tls.crt --key=tls.key
```

### Quick Verification (1 minute)

```bash
# Check everything at once
kubectl get all,cm,secret,pvc -n <namespace>

# Get ConfigMap keys
kubectl get cm <name> -o jsonpath='{.data}' | jq

# Get Secret keys (shows key names only, not values)
kubectl describe secret <name>

# Check PVC binding
kubectl get pvc -n <namespace> -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,VOLUME:.spec.volumeName

# Check all endpoints
kubectl get endpoints -A
```

---

## Section 8: CKAD Exam Checklist (1 minute)

**Before leaving a question:**

✅ **All resources in correct namespace**
```bash
kubectl get all,cm,secret,pvc -n <namespace>
```

✅ **ConfigMaps and Secrets exist**
```bash
kubectl get cm,secret -n <namespace>
```

✅ **Key names match references**
```bash
kubectl get cm <name> -o jsonpath='{.data}'
```

✅ **PVCs are Bound**
```bash
kubectl get pvc -n <namespace>  # STATUS: Bound
```

✅ **Pods are Running and Ready**
```bash
kubectl get pods -n <namespace>  # 1/1 Ready
```

✅ **Services have endpoints**
```bash
kubectl get endpoints -n <namespace>
```

✅ **Application responds**
```bash
kubectl port-forward pod/<name> 8080:80 -n <namespace>
curl localhost:8080
```

---

## Summary: CKAD Mastery (1 minute)

**Must-Know Commands:**
```bash
kubectl create cm <name> --from-literal=key=value -n <ns>
kubectl create secret generic <name> --from-literal=key=value -n <ns>
kubectl get cm,secret,pvc -n <ns>
kubectl describe pod <name> -n <ns> | grep -A 10 Events
kubectl get endpoints -n <ns>
```

**Common Patterns:**
- CreateContainerConfigError → Missing ConfigMap/Secret
- Pending PVC → No matching PV available
- No endpoints → Selector/label mismatch
- Cross-namespace → Use FQDN for services

**Time Management:**
- Simple ConfigMap/Secret: 1-2 minutes
- PVC issue: 2-3 minutes
- Full stack deployment: 5-7 minutes
- Always verify before moving on!

**Final Tips:**
1. Check namespace first - most common mistake
2. Use `kubectl create` for speed
3. Verify key names match exactly
4. Test connectivity after configuration
5. Don't forget to verify fixes work!

**Remember:** Application modeling questions combine multiple CKAD domains. Master these patterns and you'll excel!

---

**Total Duration:** 25-30 minutes
**Practice Goal:** Complete any multi-resource scenario in under 5 minutes!

Good luck on your CKAD exam!
