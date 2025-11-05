# Troubleshooting for CKAD - Exam Preparation

**Duration:** 25-30 minutes
**Format:** Comprehensive CKAD exam preparation with scenarios
**Target:** CKAD certification candidates

---

## Introduction (1 minute)

Welcome to comprehensive CKAD troubleshooting preparation. Troubleshooting is not a separate exam domain—it's a critical skill you'll need across ALL domains.

**CKAD Exam Requirements:**
- Evaluate cluster and node logging
- Understand and debug application deployment issues
- Monitor applications
- Debug services and networking issues
- Troubleshoot pod failures and application issues

**Why This Matters:**
- Wrong answers in other domains often stem from troubleshooting failures
- You must diagnose issues quickly (5-7 minutes max per question)
- No points for partially working solutions
- Troubleshooting is tested in almost every question

**Today's Comprehensive Coverage:**
1. Core troubleshooting commands
2. Common pod failure scenarios
3. Service and networking issues
4. Configuration problems
5. Rapid-fire practice scenarios
6. Time-saving techniques

Let's master CKAD troubleshooting!

---

## Section 1: Core Troubleshooting Commands (4 minutes)

### Essential kubectl Commands (1.5 minutes)

**Level 1: Overview (Start here!)**

```bash
# Get resource status
kubectl get pods
kubectl get pods -o wide                # Node placement, IP addresses
kubectl get pods --all-namespaces       # Cluster-wide view
kubectl get events --sort-by='.lastTimestamp'  # Recent events

# Get everything in namespace
kubectl get all
kubectl get all -A                      # All namespaces
```

**Level 2: Detailed Investigation**

```bash
# Describe resources (shows events!)
kubectl describe pod <pod-name>
kubectl describe service <service-name>
kubectl describe node <node-name>

# View logs
kubectl logs <pod-name>
kubectl logs <pod-name> -c <container-name>    # Multi-container
kubectl logs <pod-name> --previous             # Previous crash
kubectl logs <pod-name> --tail=50              # Last 50 lines
kubectl logs <pod-name> -f                     # Follow/stream
```

**Level 3: Interactive Debugging**

```bash
# Execute commands in containers
kubectl exec <pod-name> -- <command>
kubectl exec -it <pod-name> -- /bin/sh
kubectl exec <pod-name> -c <container-name> -- <command>  # Multi-container

# Debug with temporary pod
kubectl run debug --image=busybox -it --rm -- sh

# Port forwarding for testing
kubectl port-forward <pod-name> <local-port>:<pod-port>
kubectl port-forward service/<service-name> <local-port>:<service-port>
```

### Quick Reference Table (1 minute)

| Problem Type | Primary Command | Secondary Command |
|--------------|----------------|-------------------|
| Pod won't start | `kubectl describe pod` | `kubectl get events` |
| Pod crashing | `kubectl logs --previous` | `kubectl describe pod` |
| Service not routing | `kubectl get endpoints` | `kubectl describe svc` |
| Config issues | `kubectl describe pod` | `kubectl get cm/secret` |
| Resource constraints | `kubectl describe pod` | `kubectl top nodes` |
| Network connectivity | `kubectl exec -- curl` | `kubectl port-forward` |

### Time-Saving Aliases (1 minute)

```bash
# Set at exam start
alias k=kubectl
alias kgp='kubectl get pods'
alias kd='kubectl describe'
alias kl='kubectl logs'
alias ke='kubectl exec -it'

# Usage
kgp -o wide
kd pod my-pod
kl my-pod --previous
ke my-pod -- sh
```

**CKAD Tip:** Practice with aliases until they're muscle memory!

---

## Section 2: Common Pod Failure Scenarios (10 minutes)

### Scenario 1: ImagePullBackOff / ErrImagePull (2 minutes)

**Symptoms:**
- Pod status: `ImagePullBackOff` or `ErrImagePull`
- Pod stuck, never reaches Running
- Restart count: 0

**Common Causes:**
1. Incorrect image name or tag
2. Image doesn't exist in registry
3. Private registry authentication failure
4. Network connectivity to registry

**Diagnosis Process:**

```bash
# Check pod status
kubectl get pods
# Shows: ImagePullBackOff

# Describe pod for details
kubectl describe pod <pod-name>
```

**What to look for in events:**
```
Events:
  Type     Reason     Message
  ----     ------     -------
  Normal   Pulling    Pulling image "ngnix:latest"
  Warning  Failed     Failed to pull image "ngnix:latest": rpc error: code = Unknown desc = Error response from daemon: pull access denied for ngnix, repository does not exist or may require 'docker login'
  Warning  Failed     Error: ErrImagePull
```

**Common Fixes:**

```bash
# Fix 1: Correct image name typo
kubectl set image deployment/app app=nginx:latest  # Was "ngnix"

# Fix 2: Add correct tag
kubectl set image deployment/app app=nginx:1.21  # Was missing tag

# Fix 3: Add image pull secret (private registry)
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=user@example.com

# Update deployment to use secret
kubectl edit deployment app
```

Add to pod spec:
```yaml
spec:
  imagePullSecrets:
  - name: regcred
  containers:
  - name: app
    image: myregistry.com/app:v1
```

**CKAD Practice Question:**

"The nginx-web deployment in the default namespace is failing to start. Fix the issue so all pods are running."

**Quick Solution:**
```bash
kubectl get pods | grep nginx-web
kubectl describe pod <pod-name> | grep -A 10 Events
# Identify image issue
kubectl set image deployment/nginx-web nginx=nginx:latest
kubectl rollout status deployment/nginx-web
```

**Time Target:** 2 minutes

---

### Scenario 2: CrashLoopBackOff (2.5 minutes)

**Symptoms:**
- Pod status: `CrashLoopBackOff`
- Restart count continuously increasing
- Pod alternates between Running and CrashLoopBackOff

**Common Causes:**
1. Application error at startup
2. Missing dependencies (environment variables, external services)
3. Incorrect command or arguments
4. Failed liveness probe (too aggressive)
5. OOMKilled (out of memory)

**Diagnosis Process:**

```bash
# Check pod status
kubectl get pods
# Shows: CrashLoopBackOff, RESTARTS: 5

# CRITICAL: Check previous logs (current logs show restart, not crash!)
kubectl logs <pod-name> --previous

# Check describe for termination reason
kubectl describe pod <pod-name>
```

**What to look for:**

**In describe output:**
```
Last State:     Terminated
  Reason:       Error
  Exit Code:    1
  Started:      Mon, 01 Jan 2024 10:00:00 +0000
  Finished:     Mon, 01 Jan 2024 10:00:05 +0000

# Or for OOMKilled:
Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
```

**In logs:**
```bash
kubectl logs <pod-name> --previous
```

Look for:
- Missing environment variables
- Connection errors to databases/services
- Configuration file errors
- Application exceptions

**Common Fixes:**

```bash
# Fix 1: Add missing environment variable
kubectl set env deployment/app DATABASE_URL=postgres://db:5432/mydb

# Fix 2: Fix incorrect command
kubectl edit deployment app
```

Change:
```yaml
spec:
  containers:
  - name: app
    command: ["python"]
    args: ["app.py"]  # Was: ["app"]
```

```bash
# Fix 3: Adjust liveness probe (too aggressive)
kubectl edit deployment app
```

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30  # Was: 5
  periodSeconds: 10
  failureThreshold: 3      # Was: 1
```

```bash
# Fix 4: Increase memory limit (OOMKilled)
kubectl edit deployment app
```

```yaml
resources:
  limits:
    memory: "512Mi"  # Was: "128Mi"
  requests:
    memory: "256Mi"
```

**CKAD Practice Question:**

"The api-server deployment is crash looping. Diagnose and fix the issue."

**Quick Solution:**
```bash
kubectl get pods | grep api-server
kubectl logs <pod-name> --previous
# See error: "DATABASE_URL environment variable not set"
kubectl set env deployment/api-server DATABASE_URL=postgres://db:5432/api
kubectl get pods --watch  # Verify fix
```

**Time Target:** 3 minutes

---

### Scenario 3: Pod Pending (2 minutes)

**Symptoms:**
- Pod status: `Pending`
- Pod never gets scheduled to a node
- Remains pending indefinitely

**Common Causes:**
1. Insufficient cluster resources (CPU/memory)
2. Node selector/affinity rules can't be satisfied
3. PersistentVolumeClaim not bound
4. Taints and tolerations mismatch

**Diagnosis Process:**

```bash
# Check pod status
kubectl get pods
# Shows: STATUS: Pending

# Describe for scheduling errors
kubectl describe pod <pod-name>
```

**What to look for in events:**

```
Events:
  Type     Reason            Message
  ----     ------            -------
  Warning  FailedScheduling  0/3 nodes are available: 3 Insufficient cpu.

# Or:
  Warning  FailedScheduling  0/3 nodes are available: 3 node(s) didn't match node selector.

# Or:
  Normal   FailedMount       PersistentVolumeClaim is not bound: "data-pvc"
```

**Additional Diagnosis:**

```bash
# Check node resources
kubectl top nodes
kubectl describe nodes

# Check PVC status
kubectl get pvc
kubectl describe pvc <pvc-name>

# Check node selectors
kubectl get pod <pod-name> -o yaml | grep -A 3 nodeSelector
```

**Common Fixes:**

```bash
# Fix 1: Reduce resource requests
kubectl edit deployment app
```

```yaml
resources:
  requests:
    cpu: 100m       # Was: 2000m
    memory: 128Mi   # Was: 4Gi
```

```bash
# Fix 2: Remove/fix node selector
kubectl edit deployment app
# Remove or correct nodeSelector section

# Fix 3: Create PersistentVolume for PVC
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: data-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /data
EOF

# Fix 4: Add toleration for tainted nodes
kubectl edit deployment app
```

```yaml
spec:
  tolerations:
  - key: "key1"
    operator: "Equal"
    value: "value1"
    effect: "NoSchedule"
```

**CKAD Practice Question:**

"The worker deployment has pods stuck in Pending state. Fix the issue."

**Quick Solution:**
```bash
kubectl get pods | grep worker
kubectl describe pod <pod-name>
# See: "0/3 nodes available: Insufficient memory"
kubectl edit deployment worker
# Reduce resources.requests.memory from 8Gi to 512Mi
kubectl get pods --watch
```

**Time Target:** 2 minutes

---

### Scenario 4: Container Not Ready (1.5 minutes)

**Symptoms:**
- Pod status: `Running`
- READY column shows: 0/1 or 0/2
- Service doesn't route traffic to pod

**Common Causes:**
1. Readiness probe failing
2. Application slow to start
3. Incorrect readiness probe configuration

**Diagnosis:**

```bash
kubectl get pods
# Shows: READY 0/1, STATUS: Running

kubectl describe pod <pod-name>
# Check readiness probe config and events
```

**Look for:**
```
Events:
  Type     Reason     Message
  ----     ------     -------
  Warning  Unhealthy  Readiness probe failed: HTTP probe failed with statuscode: 404
```

**Common Fixes:**

```bash
# Fix 1: Correct readiness probe path
kubectl edit deployment app
```

```yaml
readinessProbe:
  httpGet:
    path: /ready        # Was: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
```

```bash
# Fix 2: Increase timing for slow startup
kubectl edit deployment app
```

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 30  # Was: 5
  periodSeconds: 10
  failureThreshold: 3
```

**Time Target:** 1-2 minutes

---

### Scenario 5: Init Container Issues (1 minute)

**Symptoms:**
- Pod status: `Init:0/1`, `Init:Error`, or `Init:CrashLoopBackOff`
- Pod stuck in Init phase

**Diagnosis:**

```bash
kubectl get pods
# Shows: Init:0/1

kubectl describe pod <pod-name>
# Check Init Containers section

kubectl logs <pod-name> -c <init-container-name>
```

**Common Fixes:**

```bash
# Fix init container command
kubectl edit deployment app
# Correct command/args in initContainers section

# Or remove if not needed
kubectl edit deployment app
# Delete initContainers section
```

**Time Target:** 1-2 minutes

---

### Scenario 6: Multi-Container Pod Issues (1 minute)

**Symptoms:**
- Pod shows READY: 1/2 (one container not ready)
- Need to troubleshoot specific container

**Diagnosis:**

```bash
kubectl get pods
# Shows: READY 1/2

kubectl describe pod <pod-name>
# Check each container's status

# Check specific container logs
kubectl logs <pod-name> -c <container-name>

# Exec into specific container
kubectl exec <pod-name> -c <container-name> -- sh
```

**Time Target:** 2 minutes per container

---

## Section 3: Service and Networking Troubleshooting (6 minutes)

### Issue 1: Service Not Routing to Pods (3 minutes)

**The #1 Most Common Kubernetes Problem!**

**Symptoms:**
- Can't access application through service
- `curl service-name` times out or connection refused
- Application works with pod IP but not service

**Root Cause #1: Selector Mismatch**

**Diagnosis:**

```bash
# Step 1: Check if service has endpoints
kubectl get endpoints <service-name>
# If shows: <none>, selector doesn't match pods!

# Step 2: Compare service selector to pod labels
kubectl get service <service-name> -o jsonpath='{.spec.selector}'
echo
kubectl get pods -l <selector-from-above> --show-labels
# If no pods returned, selector doesn't match

# Step 3: See what labels pods actually have
kubectl get pods --show-labels
```

**Example Problem:**

```yaml
# Service
apiVersion: v1
kind: Service
metadata:
  name: webapp
spec:
  selector:
    app: webapp        # Looking for "webapp"
  ports:
  - port: 80
    targetPort: 8080

# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  selector:
    matchLabels:
      app: web-app     # Has "web-app" (typo!)
  template:
    metadata:
      labels:
        app: web-app   # Mismatch!
```

**Fixes:**

```bash
# Option 1: Fix service selector
kubectl edit service webapp
# Change selector to match pod labels

# Option 2: Fix pod labels
kubectl edit deployment webapp
# Change template.metadata.labels to match service selector

# Option 3: Patch service quickly
kubectl patch service webapp -p '{"spec":{"selector":{"app":"web-app"}}}'
```

**Root Cause #2: Port Mismatch**

**Diagnosis:**

```bash
# Check service ports
kubectl describe service <service-name> | grep -E "Port:|TargetPort:"
# Note the targetPort

# Check container ports
kubectl describe pod <pod-name> | grep "Port:"
# Must match service targetPort
```

**Example Problem:**

```yaml
# Service
spec:
  ports:
  - port: 80
    targetPort: 8080  # Expects container on 8080

# Container
spec:
  containers:
  - name: app
    ports:
    - containerPort: 3000  # Actually on 3000!
```

**Fixes:**

```bash
# Option 1: Fix service targetPort
kubectl edit service webapp
# Change targetPort to match container port (3000)

# Option 2: Fix container port
kubectl edit deployment webapp
# Change containerPort to match service targetPort (8080)
# Also ensure app listens on that port
```

**Root Cause #3: Named Port Mismatch**

```yaml
# Service
spec:
  ports:
  - targetPort: web-port  # Using named port

# Container
spec:
  containers:
  - ports:
    - containerPort: 8080
      name: http-port      # Different name!
```

**Fix:** Ensure port names match exactly.

**CKAD Practice Question:**

"Users cannot access the frontend service at http://frontend. Fix the issue."

**Quick Solution:**
```bash
kubectl get svc frontend
kubectl get endpoints frontend
# Shows: <none> - selector mismatch!

kubectl get svc frontend -o jsonpath='{.spec.selector}'
# Shows: app=frontend

kubectl get pods --show-labels | grep frontend
# Pods have: app=frontend-app

kubectl patch svc frontend -p '{"spec":{"selector":{"app":"frontend-app"}}}'
kubectl get endpoints frontend  # Now shows IPs
curl frontend  # Works!
```

**Time Target:** 3 minutes

---

### Issue 2: Service Type Issues (1 minute)

**Problem:** Service is ClusterIP but you need NodePort or LoadBalancer.

**Diagnosis:**

```bash
kubectl get service <service-name>
# Check TYPE column
```

**Fix:**

```bash
kubectl edit service <service-name>
```

```yaml
spec:
  type: NodePort  # Was: ClusterIP
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080  # Add for NodePort
```

---

### Issue 3: DNS Resolution Issues (1 minute)

**Problem:** Can't resolve service names.

**Diagnosis:**

```bash
# Test DNS from a pod
kubectl run -it --rm debug --image=busybox --restart=Never -- sh

# Inside pod:
nslookup kubernetes.default
nslookup <service-name>
nslookup <service-name>.<namespace>.svc.cluster.local
```

**Common Issues:**
- CoreDNS pods not running
- Network policy blocking DNS
- Wrong service name/namespace

**Check CoreDNS:**

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns
```

---

### Issue 4: Network Policy Blocking Traffic (1 minute)

**Problem:** Network policies prevent pod communication.

**Diagnosis:**

```bash
# Check network policies
kubectl get networkpolicy
kubectl describe networkpolicy <name>

# Test connectivity
kubectl exec <source-pod> -- curl <destination-service>
```

**Fix:** Adjust network policy to allow required traffic.

---

## Section 4: Configuration Issues (3 minutes)

### ConfigMap and Secret Problems (2 minutes)

**Common Issues:**

**Issue 1: ConfigMap/Secret doesn't exist**

```bash
# Pod describe shows:
Events:
  Warning  FailedMount  MountVolume.SetUp failed: configmap "app-config" not found
```

**Fix:**

```bash
# Create missing ConfigMap
kubectl create configmap app-config --from-literal=key=value

# Or from file
kubectl create configmap app-config --from-file=config.properties
```

**Issue 2: Incorrect key reference**

```yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_url: postgres://...  # Key is "database_url"

# Pod
env:
- name: DATABASE_URL
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: DATABASE_URL  # Wrong key! Should be "database_url"
```

**Diagnosis:**

```bash
# Check ConfigMap keys
kubectl get configmap app-config -o yaml

# Check pod env reference
kubectl get pod <name> -o yaml | grep -A 5 configMapKeyRef
```

**Issue 3: Volume mount conflicts**

```yaml
# Multiple volumes trying to mount to same path
volumeMounts:
- name: config1
  mountPath: /etc/config
- name: config2
  mountPath: /etc/config  # Conflict!
```

**CKAD Practice Question:**

"The worker pod is failing with CreateContainerConfigError. Fix the issue."

**Quick Solution:**
```bash
kubectl describe pod worker
# See: "configmap 'worker-config' not found"

kubectl create configmap worker-config --from-literal=mode=batch
kubectl delete pod worker  # Force restart
kubectl get pods  # Verify running
```

**Time Target:** 2 minutes

---

## Section 5: Rapid-Fire CKAD Scenarios (4 minutes)

### Quick Drill 1 (1 minute)

**Scenario:** "Pod is in ImagePullBackOff. Fix it in under 1 minute."

```bash
kubectl describe pod <name> | grep -A 5 Events
# See: image "nignx:latest" not found
kubectl set image deployment/<name> nginx=nginx:latest
kubectl get pods --watch
```

---

### Quick Drill 2 (1 minute)

**Scenario:** "Service has no endpoints. Fix it in under 1 minute."

```bash
kubectl get endpoints <svc-name>
kubectl get svc <svc-name> -o jsonpath='{.spec.selector}'
kubectl get pods --show-labels
# Labels don't match selector
kubectl patch svc <svc-name> -p '{"spec":{"selector":{"app":"correct-label"}}}'
kubectl get endpoints <svc-name>  # Verify
```

---

### Quick Drill 3 (1 minute)

**Scenario:** "Pod is CrashLoopBackOff. Diagnose in under 1 minute."

```bash
kubectl logs <pod-name> --previous
# See error: "DATABASE_URL not set"
kubectl set env deployment/<name> DATABASE_URL=postgres://db/mydb
kubectl get pods --watch
```

---

### Quick Drill 4 (1 minute)

**Scenario:** "Pod is Pending. Fix resource constraints."

```bash
kubectl describe pod <name> | grep -A 3 Events
# See: "Insufficient memory"
kubectl edit deployment <name>
# Reduce resources.requests.memory
kubectl get pods  # Verify scheduled
```

---

## Section 6: Advanced Troubleshooting Techniques (2 minutes)

### Using Ephemeral Debug Containers (1 minute)

**Kubernetes 1.23+:**

```bash
# Create debug container in existing pod
kubectl debug <pod-name> -it --image=busybox --target=<container-name>

# Create copy of pod with debugging tools
kubectl debug <pod-name> -it --copy-to=debug-pod --container=debug --image=busybox
```

### Checking Resource Usage (1 minute)

```bash
# Check if metrics-server is available
kubectl top nodes
kubectl top pods

# Identify resource bottlenecks
kubectl top pods --sort-by=memory
kubectl top pods --sort-by=cpu

# Check if pod was OOMKilled
kubectl describe pod <name> | grep -A 3 "Last State"
# Look for: Reason: OOMKilled, Exit Code: 137
```

---

## Section 7: CKAD Troubleshooting Workflow (2 minutes)

### Standard Workflow (1 minute)

**Phase 1: Quick Assessment (30 seconds)**

```bash
kubectl get all
kubectl get pods -o wide
kubectl get events --sort-by='.lastTimestamp' | tail -20
```

**Phase 2: Detailed Diagnosis (1-2 minutes)**

```bash
# For pod issues
kubectl describe pod <name>
kubectl logs <name>
kubectl logs <name> --previous

# For service issues
kubectl get endpoints <name>
kubectl describe service <name>
```

**Phase 3: Verify Configuration (1 minute)**

```bash
# Check labels/selectors match
kubectl get svc <name> -o jsonpath='{.spec.selector}'
kubectl get pods --show-labels

# Check ports match
kubectl describe pod <name> | grep Port
kubectl describe svc <name> | grep Port

# Check ConfigMaps/Secrets exist
kubectl get cm,secret
```

**Phase 4: Fix and Verify (1-2 minutes)**

```bash
# Apply fix
kubectl edit ... # or kubectl patch ... or kubectl set ...

# Verify fix
kubectl get pods
kubectl get endpoints
curl <service> # or kubectl port-forward
```

### Pod Status Quick Reference (1 minute)

| Status | Meaning | Command to Diagnose |
|--------|---------|---------------------|
| `Pending` | Not scheduled | `kubectl describe pod` |
| `ContainerCreating` | Creating container | `kubectl describe pod` |
| `Running` | Pod running | Check READY column |
| `CrashLoopBackOff` | Repeatedly crashing | `kubectl logs --previous` |
| `ImagePullBackOff` | Can't pull image | `kubectl describe pod` |
| `Error` | Terminated with error | `kubectl logs` |
| `Completed` | Ran to completion | Normal for Jobs |
| `Terminating` | Being deleted | Wait or check for finalizers |
| `CreateContainerConfigError` | Config issue | `kubectl describe pod` |
| `Init:0/1` | Init container | `kubectl logs -c <init-container>` |

---

## Final CKAD Exam Checklist (1 minute)

**Before leaving a troubleshooting question:**

✅ **Pod is Running and Ready**
```bash
kubectl get pods <name>
# READY: 1/1, STATUS: Running
```

✅ **No restarts or crashes**
```bash
# RESTARTS: 0 (or not increasing)
```

✅ **Service has endpoints (if applicable)**
```bash
kubectl get endpoints <service-name>
# Should show pod IPs
```

✅ **Application responds**
```bash
kubectl port-forward pod/<name> 8080:80
curl localhost:8080
# Or test via service
```

✅ **No errors in events**
```bash
kubectl describe pod <name> | grep -A 10 Events
# No Warnings or Errors
```

---

## Summary: CKAD Troubleshooting Mastery (1 minute)

**Must-Know Commands:**
```bash
kubectl describe pod <name>      # Events are gold
kubectl logs <name> --previous   # For CrashLoopBackOff
kubectl get endpoints <name>     # For service issues
kubectl get pods --show-labels   # For selector issues
kubectl port-forward             # For direct testing
```

**Common Patterns:**
- ImagePullBackOff → Wrong image name
- CrashLoopBackOff → Check logs --previous
- Pending → Resource constraints
- Running but not Ready → Readiness probe
- Service not routing → Check endpoints

**Time Management:**
- Quick issues: 2-3 minutes
- Complex issues: 5-7 minutes
- Always verify fixes work!

**Final Tips:**
1. Follow systematic approach
2. Don't skip verification
3. Use aliases for speed
4. Practice until it's muscle memory
5. Stay calm under pressure

**Remember:** Troubleshooting is tested in EVERY domain. Master it and you'll pass CKAD!

---

**Total Duration:** 25-30 minutes
**Next Steps:** Practice these scenarios in timed conditions until you can diagnose any issue in under 3 minutes!

Good luck on your CKAD exam!
