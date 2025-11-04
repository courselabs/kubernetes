# CKAD Practice: Essential Tools and kubectl Productivity

This guide covers CKAD exam essentials for kubectl usage, productivity tips, and debugging tools. The [basic lab](README.md) covers additional operational tools like Dashboard and K9s.

## CKAD Exam Relevance

**Exam Domain**: All domains (cross-cutting skill)
- **kubectl proficiency is critical** - Most exam tasks are completed via kubectl
- **Time management** - Efficient kubectl usage saves precious exam minutes
- **Debugging skills** - Quick troubleshooting with logs, describe, and exec
- **Resource monitoring** - Using metrics to identify issues

> **Note**: The exam environment provides kubectl with autocompletion and kubectl documentation access. Practice both!

## Quick Reference

### Essential kubectl Commands for CKAD

```bash
# Get resources (all variations)
kubectl get pods                          # List Pods in current namespace
kubectl get pods -A                       # All namespaces
kubectl get pods -n <namespace>           # Specific namespace
kubectl get pods -o wide                  # More details (node, IP)
kubectl get pods -o yaml                  # Full YAML output
kubectl get pods -o json                  # JSON output
kubectl get pods --show-labels            # Show all labels
kubectl get pods -l app=web               # Filter by label
kubectl get pods --field-selector status.phase=Running

# Describe (detailed information + events)
kubectl describe pod <name>
kubectl describe deployment <name>

# Logs
kubectl logs <pod-name>                   # Current logs
kubectl logs <pod-name> -f                # Follow/stream logs
kubectl logs <pod-name> -c <container>    # Specific container
kubectl logs <pod-name> --previous        # Previous container (after crash)
kubectl logs <pod-name> --tail=50         # Last 50 lines
kubectl logs <pod-name> --since=1h        # Last hour

# Exec into containers
kubectl exec <pod> -- <command>           # Run single command
kubectl exec -it <pod> -- sh              # Interactive shell
kubectl exec -it <pod> -c <container> -- sh  # Specific container

# Edit resources
kubectl edit pod <name>                   # Edit in default editor
kubectl edit deployment <name>

# Delete resources
kubectl delete pod <name>
kubectl delete pod <name> --force --grace-period=0  # Force delete
kubectl delete -f file.yaml
kubectl delete pod,svc -l app=web         # Delete by label

# Debugging
kubectl describe pod <name>               # Check events section
kubectl logs <name>                       # Check application logs
kubectl get events --sort-by=.metadata.creationTimestamp
kubectl top pods                          # Resource usage (requires metrics-server)
kubectl top nodes

# Port forwarding (test services locally)
kubectl port-forward pod/<name> 8080:80
kubectl port-forward svc/<name> 8080:80

# Copy files to/from containers
kubectl cp <pod>:/path/to/file ./local-file
kubectl cp ./local-file <pod>:/path/to/file
```

### kubectl Productivity Shortcuts

```bash
# Aliases (set these up before the exam if allowed)
alias k=kubectl
alias kgp='kubectl get pods'
alias kgs='kubectl get svc'
alias kgd='kubectl get deployments'
alias kdp='kubectl describe pod'
alias kl='kubectl logs'
alias kex='kubectl exec -it'

# Short names for resources
kubectl get po         # pods
kubectl get svc        # services
kubectl get deploy     # deployments
kubectl get rs         # replicasets
kubectl get cm         # configmaps
kubectl get ns         # namespaces
kubectl get pvc        # persistentvolumeclaims
kubectl get pv         # persistentvolumes
kubectl get sts        # statefulsets
kubectl get ds         # daemonsets
kubectl get ing        # ingresses
kubectl get sa         # serviceaccounts

# Multiple resources at once
kubectl get pods,svc,deployments
kubectl get all                           # Most common resources
kubectl delete all -l app=myapp           # Delete multiple types
```

## CKAD Scenarios

### Scenario 1: Fast Resource Creation with Generators

**Time Target**: 2-3 minutes per task

Use `kubectl create` and `kubectl run` to generate resources quickly instead of writing YAML from scratch.

```bash
# Create Pod
kubectl run nginx --image=nginx --port=80
kubectl run busybox --image=busybox --rm -it --restart=Never -- sh

# Create Deployment
kubectl create deployment web --image=nginx --replicas=3

# Create Service
kubectl expose deployment web --port=80 --target-port=80 --type=ClusterIP
kubectl create service clusterip web --tcp=80:80

# Create ConfigMap
kubectl create configmap app-config --from-literal=KEY=VALUE
kubectl create configmap app-config --from-file=config.txt
kubectl create configmap app-config --from-env-file=.env

# Create Secret
kubectl create secret generic db-secret --from-literal=password=secret123
kubectl create secret docker-registry regcred --docker-server=<server> \
  --docker-username=<user> --docker-password=<pass>

# Create Job
kubectl create job hello --image=busybox -- echo "Hello World"

# Create CronJob
kubectl create cronjob hello --image=busybox --schedule="*/5 * * * *" \
  -- echo "Hello"

# Generate YAML without creating
kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml
kubectl create deployment web --image=nginx --dry-run=client -o yaml > deploy.yaml
```

**Key Learning**: Use generators to create base YAML, then edit as needed. Much faster than writing from scratch!

### Scenario 2: Efficient Debugging Workflow

**Time Target**: 3-5 minutes

When a Pod isn't working, follow this systematic debugging approach.

```bash
# Step 1: Check Pod status
kubectl get pods
# STATUS could be: Pending, Running, CrashLoopBackOff, Error, ImagePullBackOff

# Step 2: Describe Pod (most important command!)
kubectl describe pod <name>
# Check: Events section, Container states, Volumes, Node assignment

# Step 3: Check logs
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # If pod restarted

# Step 4: Exec into pod (if running)
kubectl exec -it <pod-name> -- sh
# Check: network connectivity, filesystem, env vars

# Step 5: Check related resources
kubectl get events --field-selector involvedObject.name=<pod-name>
kubectl describe node <node-name>  # If scheduling issues
kubectl get pvc  # If volume issues

# Common issues and quick checks:
# - ImagePullBackOff: Check image name and pull secrets
# - CrashLoopBackOff: Check logs with --previous
# - Pending: Check describe for scheduling issues
# - Init:0/1: Init container hasn't completed
# - OOMKilled: Memory limits too low
```

**Practice Example**:

```bash
# Deploy a broken pod
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: broken-app
spec:
  containers:
  - name: app
    image: nginx:wrong-tag  # This image doesn't exist
    ports:
    - containerPort: 80
EOF

# Debug it
kubectl get pods                    # See ImagePullBackOff
kubectl describe pod broken-app     # See error in events
kubectl delete pod broken-app       # Clean up

# Fix and redeploy
kubectl run broken-app --image=nginx:alpine
```

### Scenario 3: Using --dry-run and -o yaml for Quick Edits

**Time Target**: 2-3 minutes

Modify existing resources quickly by generating YAML, editing, and reapplying.

```bash
# Get current resource as YAML and save
kubectl get deployment web -o yaml > web.yaml

# Or get current state without status
kubectl get deployment web -o yaml --export > web.yaml  # Deprecated
# Better: use dry-run to regenerate clean YAML

# Example: Change deployment replicas
kubectl scale deployment web --replicas=5 --dry-run=client -o yaml | kubectl apply -f -

# Example: Change image
kubectl set image deployment/web nginx=nginx:1.20 --dry-run=client -o yaml | kubectl apply -f -

# Example: Add env var to existing deployment
kubectl set env deployment/web NEW_VAR=value --dry-run=client -o yaml | kubectl apply -f -

# Quick edit in place
kubectl edit deployment web
# Opens in vi/nano, save to apply changes immediately
```

**Pro Tip**: Combine `get`, edit the YAML, and `apply` for complex changes.

### Scenario 4: Working with Labels and Selectors

**Time Target**: 2-3 minutes

Labels are critical for CKAD - filtering, selecting, and organizing resources.

```bash
# Add labels to existing resources
kubectl label pod nginx app=web
kubectl label pod nginx tier=frontend env=prod

# Update existing label (requires --overwrite)
kubectl label pod nginx env=dev --overwrite

# Remove label (add minus suffix)
kubectl label pod nginx env-

# Get resources by label
kubectl get pods -l app=web
kubectl get pods -l app=web,tier=frontend
kubectl get pods -l 'env in (prod,dev)'
kubectl get pods -l 'env notin (test)'
kubectl get pods -l app  # Has label 'app' (any value)

# Show labels
kubectl get pods --show-labels

# Use label columns
kubectl get pods -L app,tier,env

# Delete by label
kubectl delete pods -l app=web

# Label nodes (for node selectors)
kubectl label node <node-name> disktype=ssd
```

**Practice Exercise**:

```bash
# Create 3 pods with different labels
kubectl run web1 --image=nginx --labels=app=web,env=prod
kubectl run web2 --image=nginx --labels=app=web,env=dev
kubectl run api --image=nginx --labels=app=api,env=prod

# Query them
kubectl get pods -l app=web                    # Both web pods
kubectl get pods -l env=prod                   # web1 and api
kubectl get pods -l app=web,env=prod           # Just web1
kubectl get pods -l 'env in (prod,dev)'        # All 3

# Clean up
kubectl delete pods -l app
```

### Scenario 5: Resource Monitoring with Metrics Server

**Time Target**: 2-3 minutes

<!-- TODO: Add example of identifying resource-constrained pods and how to fix them -->

Check resource usage to identify performance issues.

```bash
# Install metrics-server (if not present)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Wait for metrics to be available (30-60 seconds)
kubectl get deployment metrics-server -n kube-system

# View node resources
kubectl top nodes
# Shows CPU and memory usage per node

# View pod resources
kubectl top pods
kubectl top pods -n kube-system
kubectl top pods --sort-by=cpu
kubectl top pods --sort-by=memory
kubectl top pods -l app=web

# View container resources (in multi-container pods)
kubectl top pod <name> --containers

# Check if resources are defined
kubectl describe pod <name> | grep -A 5 "Requests\|Limits"
```

**Use Cases**:
- Identify pods consuming excessive resources
- Verify resource requests/limits are appropriate
- Debug OOMKilled issues
- Check node capacity before deploying

### Scenario 6: Context and Namespace Management

**Time Target**: 1-2 minutes

Efficiently switch between namespaces and contexts during the exam.

```bash
# View current context
kubectl config current-context

# View all contexts
kubectl config get-contexts

# Switch context
kubectl config use-context <context-name>

# Set default namespace for current context
kubectl config set-context --current --namespace=<namespace>

# Create namespace
kubectl create namespace dev
kubectl create ns prod  # Short form

# Quick namespace switch (per command)
kubectl get pods -n dev
kubectl get pods -n prod
kubectl get pods --all-namespaces  # or -A

# Verify current namespace
kubectl config view --minify | grep namespace

# Work in specific namespace for multiple commands
alias kn='kubectl config set-context --current --namespace'
kn dev
kubectl get pods  # Now in dev namespace
kn default
```

**Exam Tip**: Set namespace context immediately when a question specifies a namespace.

### Scenario 7: Quick Testing with Temporary Pods

**Time Target**: 1-2 minutes

Create temporary test pods for debugging network, DNS, or connectivity issues.

```bash
# Create temporary pod that auto-deletes
kubectl run test --image=busybox --rm -it --restart=Never -- sh

# Inside the pod:
wget -O- http://service-name
nslookup service-name
env
ping pod-ip
exit  # Pod is automatically deleted

# Test network from existing pod
kubectl exec -it <pod> -- wget -O- http://service-name
kubectl exec -it <pod> -- nslookup service-name

# Test with curl
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never \
  -- curl http://service-name

# Test DNS resolution
kubectl run dns-test --image=busybox --rm -it --restart=Never \
  -- nslookup kubernetes.default

# Test service connectivity
kubectl run netcat-test --image=busybox --rm -it --restart=Never \
  -- nc -zv service-name 80
```

**Use Cases**:
- Verify service is accessible
- Test DNS resolution
- Check network connectivity between pods
- Debug ingress/service issues

## Essential kubectl Plugins for CKAD

While plugins may not be available in the exam, knowing them helps in practice:

### kubectx and kubens (Context/Namespace Switching)

```bash
# Install via krew
kubectl krew install ctx
kubectl krew install ns

# Quick context switching
kubectl ctx                    # List contexts
kubectl ctx <context-name>     # Switch context

# Quick namespace switching
kubectl ns                     # List namespaces
kubectl ns <namespace>         # Switch namespace
```

### kubectl-debug (Advanced Debugging)

```bash
kubectl krew install debug

# Create debug container in running pod
kubectl debug <pod-name> -it --image=busybox
```

### Other Useful Plugins

```bash
# View resource usage and permissions
kubectl krew install access-matrix
kubectl krew install who-can
kubectl krew install resource-capacity

# See what you can do
kubectl who-can create pods
kubectl access-matrix
```

## CKAD Time-Saving Techniques

### 1. Use Autocomplete

```bash
# If not enabled, enable it:
source <(kubectl completion bash)
echo "source <(kubectl completion bash)" >> ~/.bashrc

# Then use Tab for autocomplete:
kubectl get po<TAB>
kubectl get pods nginx-<TAB>
kubectl -n kube-<TAB>
```

### 2. Use --help and kubectl explain

```bash
# Quick reference for any command
kubectl create deployment --help
kubectl run --help

# Understand resource fields
kubectl explain pod
kubectl explain pod.spec
kubectl explain pod.spec.containers
kubectl explain deployment.spec.strategy
```

### 3. Bookmark kubectl Cheat Sheet

During the exam, you can access:
- https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- https://kubernetes.io/docs/

### 4. Practice Typing Speed

```bash
# The faster you type these common patterns, the more time you save:
kubectl run <name> --image=<image> --dry-run=client -o yaml > pod.yaml
kubectl create deployment <name> --image=<image> --replicas=3
kubectl expose deployment <name> --port=80 --target-port=8080
kubectl get pods -l app=<name> -o wide
kubectl describe pod <name> | grep -A 10 Events
```

### 5. Use kubectl diff Before Applying

```bash
# See what will change before applying
kubectl diff -f deployment.yaml
kubectl apply -f deployment.yaml
```

## Common kubectl Gotchas and Fixes

### 1. Resource Already Exists

```bash
# Error: resource already exists
# Solution 1: Delete and recreate
kubectl delete pod nginx
kubectl apply -f pod.yaml

# Solution 2: Use replace
kubectl replace -f pod.yaml --force

# Solution 3: Edit in place
kubectl edit pod nginx
```

### 2. Field is Immutable

```bash
# Error: field is immutable (e.g., pod.spec)
# Solution: Delete and recreate
kubectl delete pod nginx
kubectl apply -f pod.yaml

# For deployments, this triggers rolling update
kubectl apply -f deployment.yaml  # Usually works
```

### 3. Cannot Delete Namespace

```bash
# Namespace stuck in Terminating
# Check for finalizers
kubectl get namespace <name> -o yaml

# Remove finalizers (last resort)
kubectl patch namespace <name> -p '{"metadata":{"finalizers":null}}' --type=merge
```

### 4. Pod Stays in Terminating

```bash
# Force delete
kubectl delete pod <name> --force --grace-period=0
```

### 5. Wrong Context or Namespace

```bash
# Always verify before operations
kubectl config current-context
kubectl config view --minify | grep namespace
```

## CKAD Practice Exercises

### Exercise 1: Speed Run - Create Full Application

**Objective**: Practice fast resource creation

**Task**: Deploy a complete application stack in 5 minutes:
1. Create namespace `speedrun`
2. Create ConfigMap `app-config` with `DB_HOST=mysql`
3. Create Secret `db-secret` with `password=secret123`
4. Create Deployment `web` with 3 replicas, nginx image, using ConfigMap and Secret
5. Expose deployment as ClusterIP service on port 80
6. Verify all resources and test connectivity

**Time Limit**: 5 minutes

<details>
<summary>Solution</summary>

```bash
# Set namespace context
kubectl create namespace speedrun
kubectl config set-context --current --namespace=speedrun

# Create ConfigMap
kubectl create configmap app-config --from-literal=DB_HOST=mysql

# Create Secret
kubectl create secret generic db-secret --from-literal=password=secret123

# Create Deployment with env vars
kubectl create deployment web --image=nginx --replicas=3 --dry-run=client -o yaml > web.yaml

# Edit to add env vars (or use kubectl set env)
kubectl set env deployment/web --from=configmap/app-config --dry-run=client -o yaml | kubectl apply -f -
kubectl set env deployment/web --from=secret/db-secret --keys=password --dry-run=client -o yaml | kubectl apply -f -

# Better: Create deployment and patch
kubectl create deployment web --image=nginx --replicas=3
kubectl set env deployment/web --from=configmap/app-config
kubectl set env deployment/web DB_PASSWORD=valueFrom:secretKeyRef:name=db-secret:key=password

# Expose service
kubectl expose deployment web --port=80 --target-port=80

# Verify
kubectl get all
kubectl get configmap,secret

# Test
kubectl run test --image=busybox --rm -it --restart=Never -- wget -O- http://web
```

</details>

### Exercise 2: Debug Broken Application

**Objective**: Practice systematic debugging

You're given a broken application. Fix it.

```bash
# Deploy broken app
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: broken-app
  labels:
    app: broken
spec:
  containers:
  - name: web
    image: nginx:alpine
    command: ["/bin/sh"]
    args: ["-c", "nginx && sleep 3600"]
    livenessProbe:
      httpGet:
        path: /
        port: 8080  # Wrong port!
      initialDelaySeconds: 5
      periodSeconds: 5
EOF
```

**Task**: Identify and fix all issues

**Time Limit**: 4 minutes

<details>
<summary>Solution</summary>

```bash
# Check status
kubectl get pod broken-app
# Status: Running but may show restarts

# Describe pod
kubectl describe pod broken-app
# Check Events: Liveness probe failed

# Check logs
kubectl logs broken-app
# nginx might not be starting correctly due to command override

# Issues found:
# 1. Wrong liveness probe port (8080 vs 80)
# 2. Command overrides nginx entrypoint incorrectly

# Fix by deleting and recreating
kubectl delete pod broken-app

kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: broken-app
  labels:
    app: broken
spec:
  containers:
  - name: web
    image: nginx:alpine
    livenessProbe:
      httpGet:
        path: /
        port: 80  # Fixed!
      initialDelaySeconds: 5
      periodSeconds: 5
EOF

# Verify
kubectl get pod broken-app
kubectl logs broken-app
```

</details>

### Exercise 3: Label Management

**Objective**: Practice label operations under time pressure

**Tasks**:
1. Create 5 pods with varying labels (app, tier, env)
2. List pods with label app=web
3. List pods in production environment
4. Update one pod to change environment from dev to prod
5. Delete all dev environment pods

**Time Limit**: 4 minutes

<details>
<summary>Solution</summary>

```bash
# Create pods
kubectl run web1 --image=nginx --labels=app=web,tier=frontend,env=prod
kubectl run web2 --image=nginx --labels=app=web,tier=frontend,env=dev
kubectl run api1 --image=nginx --labels=app=api,tier=backend,env=prod
kubectl run api2 --image=nginx --labels=app=api,tier=backend,env=dev
kubectl run db --image=nginx --labels=app=db,tier=database,env=prod

# List with specific labels
kubectl get pods -l app=web
kubectl get pods -l env=prod

# Update label
kubectl label pod web2 env=prod --overwrite

# Delete dev pods
kubectl delete pods -l env=dev

# Verify
kubectl get pods --show-labels
```

</details>

## Exam Tips

1. **Set namespace immediately**: `kubectl config set-context --current --namespace=<ns>`
2. **Use generators**: Don't write YAML from scratch for simple resources
3. **Use --dry-run=client -o yaml**: Generate base YAML, then edit
4. **Master describe and logs**: These solve 80% of debugging scenarios
5. **Practice autocomplete**: Tab completion saves significant time
6. **Verify before moving on**: Quick `kubectl get` to confirm success
7. **Use kubectl explain**: Quick field reference without leaving terminal
8. **Keep it simple**: If you can solve with kubectl command, don't write YAML
9. **Time management**: Don't get stuck - flag and move on
10. **Read questions carefully**: Note namespace, context, resource names

## Quick Command Reference Card

```bash
# Create
kubectl run <pod> --image=<image>
kubectl create deployment <name> --image=<image> --replicas=<n>
kubectl create service clusterip <name> --tcp=<port>:<targetPort>
kubectl create configmap <name> --from-literal=<key>=<value>
kubectl create secret generic <name> --from-literal=<key>=<value>

# View
kubectl get <resource>                    # List
kubectl get <resource> -o wide            # More details
kubectl get <resource> -o yaml            # Full YAML
kubectl describe <resource> <name>        # Detailed + events
kubectl logs <pod>                        # Logs
kubectl logs <pod> -f                     # Follow logs
kubectl logs <pod> --previous             # Previous container

# Edit
kubectl edit <resource> <name>
kubectl set image deployment/<name> <container>=<image>
kubectl scale deployment/<name> --replicas=<n>
kubectl label <resource> <name> <key>=<value>

# Debug
kubectl exec -it <pod> -- sh
kubectl port-forward <pod> <local>:<remote>
kubectl top nodes
kubectl top pods

# Delete
kubectl delete <resource> <name>
kubectl delete -f <file>
kubectl delete <resource> -l <label>

# Context/Namespace
kubectl config use-context <context>
kubectl config set-context --current --namespace=<ns>
kubectl create namespace <ns>
```

## Additional Resources

- [Official kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [kubectl Commands Reference](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands)
- [kubectl Book](https://kubectl.docs.kubernetes.io/)
- [CKAD Exam Tips](https://kubernetes.io/docs/reference/kubectl/conventions/)

## Next Steps

After mastering these tools:
1. Practice all commands without looking at references
2. Time yourself on common tasks (aim for < 2 minutes per task)
3. Review [troubleshooting lab](../troubleshooting/) for advanced debugging
4. Study all other CKAD guides in this repo
5. Take practice exams under timed conditions

---

> Return to [tools lab](README.md) | [Course index](../../README.md)
