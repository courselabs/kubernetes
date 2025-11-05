# Kubernetes Tools - Practical Demo
## Narration Script for Hands-On Exercises (12-15 minutes)

### Section 1: Setting Up Productivity (2 min)
**[00:00-02:00]**

Enable autocomplete:
```bash
source <(kubectl completion bash)
kubectl get po<TAB>  # Test it
```

Create aliases:
```bash
alias k=kubectl
alias kgp='kubectl get pods'
alias kdp='kubectl describe pod'
k get nodes  # Test alias
```

These save seconds per command. Over 20 exam questions, that's minutes saved.

### Section 2: Imperative Commands (3 min)
**[02:00-05:00]**

Create resources quickly:
```bash
# Pod
kubectl run test-pod --image=nginx

# Deployment
kubectl create deployment web --image=nginx --replicas=3

# Service
kubectl expose deployment web --port=80 --target-port=80

# ConfigMap
kubectl create configmap app-config --from-literal=DB_HOST=mysql

# Secret
kubectl create secret generic db-secret --from-literal=password=secret123
```

Generate YAML without creating:
```bash
kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml
kubectl create deployment app --image=nginx --replicas=3 --dry-run=client -o yaml > deploy.yaml
```

Edit and apply. Much faster than writing from scratch.

### Section 3: Output Formatting (3 min)
**[05:00-08:00]**

Different formats:
```bash
kubectl get pods
kubectl get pods -o wide
kubectl get pods -o yaml
kubectl get pods --show-labels
kubectl get pods -L app,version
```

JSONPath queries:
```bash
# Get image
kubectl get pod nginx -o jsonpath='{.spec.containers[0].image}'

# Get node
kubectl get pod nginx -o jsonpath='{.spec.nodeName}'

# Get all images
kubectl get pods -o jsonpath='{.items[*].spec.containers[*].image}'
```

Custom columns:
```bash
kubectl get pods -o custom-columns=NAME:.metadata.name,IMAGE:.spec.containers[0].image,NODE:.spec.nodeName
```

### Section 4: Debugging Workflow (3 min)
**[08:00-11:00]**

Deploy broken app:
```bash
kubectl run broken --image=nginx:wrong-tag
```

Debug systematically:
```bash
# 1. Check status
kubectl get pod broken

# 2. Describe for events
kubectl describe pod broken | tail -20

# 3. Check logs (if running)
kubectl logs broken

# 4. Fix and redeploy
kubectl delete pod broken
kubectl run broken --image=nginx:alpine
```

For running app with issues:
```bash
# Check logs
kubectl logs <pod> -f

# Exec into container
kubectl exec -it <pod> -- sh

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp | tail -20
```

### Section 5: kubectl explain Practice (2 min)
**[11:00-13:00]**

Use explain for documentation:
```bash
# What fields does a Pod have?
kubectl explain pod.spec

# What's a livenessProbe?
kubectl explain pod.spec.containers.livenessProbe

# What are deployment strategies?
kubectl explain deployment.spec.strategy
```

When stuck on syntax during exam, use explain instead of guessing or searching docs.

### Section 6: Rapid Practice Drill (2 min)
**[13:00-15:00]**

Time yourself on these tasks:

1. Create deployment with 3 replicas (<30 sec)
2. Expose as service (<20 sec)
3. Scale to 5 replicas (<15 sec)
4. Check which node pods are on (<20 sec)
5. Get pod images (<20 sec)

Solution:
```bash
kubectl create deployment app --image=nginx --replicas=3
kubectl expose deployment app --port=80
kubectl scale deployment app --replicas=5
kubectl get pods -o wide
kubectl get pods -o jsonpath='{.items[*].spec.containers[*].image}'
```

Goal: Complete all in <90 seconds. Practice until you can.

Summary: Master imperative commands, output formats, debugging workflow, and explain. These productivity techniques are the difference between passing and failing the time-pressured CKAD exam.
