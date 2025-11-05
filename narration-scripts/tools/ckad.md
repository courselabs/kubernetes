# kubectl Productivity - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-18 minutes)

### Section 1: CKAD Time Management (2 min)
**[00:00-02:00]**

CKAD: 2 hours, 15-20 questions, ~7-8 minutes per question. kubectl speed is critical.

Time breakdown per question:
- Read/understand: 60 sec
- Plan approach: 30 sec
- Execute: 4-5 min
- Verify: 30-60 sec

Slow kubectl = <4 min execution. Fast kubectl = 5-6 min execution. That's the difference between completing the exam or running out of time.

### Section 2: Essential Speed Commands (3 min)
**[02:00-05:00]**

Memorize these patterns:

**Create resources**:
```bash
kubectl run <name> --image=<image>
kubectl create deployment <name> --image=<image> --replicas=N
kubectl create service clusterip <name> --tcp=<port>:<targetPort>
kubectl create configmap <name> --from-literal=KEY=VALUE
kubectl create secret generic <name> --from-literal=KEY=VALUE
kubectl create job <name> --image=<image> -- <command>
kubectl create cronjob <name> --image=<image> --schedule="* * * * *" -- <command>
```

**Generate YAML**:
```bash
kubectl run <name> --image=<image> --dry-run=client -o yaml > file.yaml
kubectl create deployment <name> --image=<image> --dry-run=client -o yaml > file.yaml
```

**Quick edits**:
```bash
kubectl edit <resource> <name>
kubectl set image deployment/<name> <container>=<image>
kubectl scale deployment/<name> --replicas=N
kubectl expose deployment/<name> --port=80
```

### Section 3: Debugging Speed Patterns (3 min)
**[05:00-08:00]**

Standard debug workflow (<2 min per issue):

```bash
# 1. Check status (10 sec)
kubectl get pods

# 2. Describe for details (20 sec)
kubectl describe pod <name> | tail -20

# 3. Check logs if running (20 sec)
kubectl logs <name>

# 4. Check events (20 sec)
kubectl get events --sort-by=.metadata.creationTimestamp | tail -10

# 5. Exec if needed (30 sec)
kubectl exec -it <name> -- sh
```

Most issues solved by describe. Events section shows admission errors, scheduling failures, image pull issues.

**Quick checks**:
```bash
# Why won't Pod start?
kubectl describe pod <name> | grep -A 5 Events

# What's the error?
kubectl logs <name> --previous  # After crash

# Resource issues?
kubectl top pods
kubectl describe node <node>
```

### Section 4: Output Formatting for Speed (3 min)
**[08:00-11:00]**

**Common patterns**:
```bash
# Wide output (nodes, IPs)
kubectl get pods -o wide

# Just names
kubectl get pods -o name

# Specific field
kubectl get pod <name> -o jsonpath='{.spec.containers[0].image}'

# Multiple fields
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName

# With labels
kubectl get pods --show-labels
kubectl get pods -L app,version
```

**Filtering**:
```bash
# By label
kubectl get pods -l app=web
kubectl get pods -l 'env in (prod,staging)'

# By field
kubectl get pods --field-selector status.phase=Running
kubectl get pods --field-selector spec.nodeName=worker-1
```

**Time-saver**: Use JSONPath or custom-columns instead of parsing YAML manually.

### Section 5: Context and Namespace Efficiency (2 min)
**[11:00-13:00]**

Set namespace immediately:
```bash
kubectl config set-context --current --namespace=<namespace>
```

Saves typing `-n <namespace>` on every command.

Verify current namespace:
```bash
kubectl config view --minify | grep namespace
```

Quick namespace operations:
```bash
# Create
kubectl create namespace dev

# All namespaces
kubectl get pods -A

# Specific namespace (if not set as current)
kubectl get pods -n kube-system
```

**Exam tip**: First thing when reading a question - check if it specifies a namespace. Set it immediately.

### Section 6: Exam Scenario Practice (3 min)
**[13:00-16:00]**

**Scenario 1: Deploy and expose** (Target: 2 min)
```bash
kubectl create namespace app
kubectl config set-context --current --namespace=app
kubectl create deployment web --image=nginx --replicas=3
kubectl expose deployment web --port=80 --target-port=80
kubectl get pods,svc
```

**Scenario 2: Update image** (Target: 1 min)
```bash
kubectl set image deployment/web nginx=nginx:1.21-alpine
kubectl rollout status deployment/web
```

**Scenario 3: Debug ImagePullBackOff** (Target: 2 min)
```bash
kubectl get pods  # See error
kubectl describe pod <name> | tail -10  # Read error
# Fix: kubectl set image deployment/web nginx=nginx:alpine
```

**Scenario 4: ConfigMap and Secret** (Target: 2 min)
```bash
kubectl create configmap app-config --from-literal=DB_HOST=mysql
kubectl create secret generic db-secret --from-literal=password=secret123
# Update deployment to use them
kubectl set env deployment/web --from=configmap/app-config
```

Practice these until under target time.

### Section 7: Exam Day Strategy (2 min)
**[16:00-18:00]**

**Before exam**:
- Set up autocomplete
- Create key aliases (if allowed)
- Practice typing without looking

**During exam**:
1. Read question fully
2. Check namespace requirement
3. Use imperative commands when possible
4. --dry-run for complex YAML
5. Verify with quick kubectl get
6. Move on if stuck (flag for review)

**Time allocation**:
- Simple questions (labels, port-forward): 3-4 min
- Medium (deployment, configmap): 5-7 min
- Complex (network policy, multi-resource): 10-12 min

**Common time wasters**:
- Writing YAML from scratch (use generators)
- Reading full YAML output (use JSONPath)
- Not using autocomplete (slow typing)
- Not setting namespace context (typing -n every time)
- Debugging wrong object (check ReplicaSet for Deployment issues)

**Quick wins**:
- kubectl run for single Pods
- kubectl create for standard resources
- kubectl set image for updates
- kubectl describe for debugging
- kubectl explain for syntax

**Checklist**:
- [ ] Can create any resource in <60 sec
- [ ] Can debug any issue in <2 min
- [ ] Know all short resource names
- [ ] Can use JSONPath for queries
- [ ] Have imperative patterns memorized
- [ ] Can set namespace context quickly

Practice until these operations are reflexive. In the exam, your fingers should move before your brain finishes thinking.

Good luck!
