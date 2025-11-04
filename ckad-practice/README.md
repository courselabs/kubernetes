# CKAD Practice Scenarios

Exam-style practice scenarios to prepare for the Certified Kubernetes Application Developer (CKAD) certification.

## About These Scenarios

These scenarios simulate the CKAD exam environment:

- **Timed exercises**: Each scenario has a suggested time limit (10-15 minutes)
- **Multi-topic problems**: Combine multiple CKAD domains in one scenario
- **Performance-based**: You must implement working solutions, not just answer questions
- **Real Kubernetes**: Deploy to your cluster and verify the results
- **Exam-like format**: Tasks are described with specific requirements you must meet

## How to Use These Scenarios

1. **Set a timer**: Use the suggested time limit to simulate exam pressure
2. **Read carefully**: Make sure you understand all requirements before starting
3. **Work efficiently**: Practice using kubectl imperative commands and quick YAML editing
4. **Verify your work**: Test that your solution meets all requirements
5. **Review the solution**: After attempting, compare with the provided solution
6. **Identify gaps**: Note topics where you struggled and review those labs

## Scenarios

| Scenario | Topics Covered | Difficulty | Time Limit | CKAD Domains |
|----------|----------------|------------|------------|--------------|
| [Scenario 1: Web Application Deployment](scenario-01/README.md) | Deployments, Services, ConfigMaps | Beginner | 12 min | Design & Build, Networking |
| [Scenario 2: Multi-Container Application](scenario-02/README.md) | Multi-container Pods, Volumes, Secrets | Intermediate | 15 min | Design & Build, Config & Security |
| [Scenario 3: Database with Persistent Storage](scenario-03/README.md) | StatefulSets, PersistentVolumes, Services | Intermediate | 15 min | Design & Build, Networking |
| [Scenario 4: Application Update and Rollback](scenario-04/README.md) | Deployments, Rolling Updates, Rollbacks | Intermediate | 12 min | Deployment, Observability |
| [Scenario 5: Secure Application Configuration](scenario-05/README.md) | Secrets, ConfigMaps, RBAC, ServiceAccounts | Advanced | 18 min | Config & Security |
| [Scenario 6: Network Security](scenario-06/README.md) | NetworkPolicy, Services, Ingress | Advanced | 15 min | Services & Networking |

## Tips for Success

### Speed Up Your kubectl Workflow

```bash
# Use aliases (add to ~/.bashrc or ~/.zshrc)
alias k=kubectl
alias kgp='kubectl get pods'
alias kgs='kubectl get svc'
alias kd='kubectl describe'
alias kdel='kubectl delete'

# Enable kubectl autocompletion
source <(kubectl completion bash)
complete -F __start_kubectl k  # if using alias

# Use imperative commands to generate YAML
kubectl create deployment nginx --image=nginx --dry-run=client -o yaml > deployment.yaml
kubectl expose deployment nginx --port=80 --dry-run=client -o yaml > service.yaml
kubectl create configmap myconfig --from-literal=key=value --dry-run=client -o yaml > configmap.yaml
```

### Common kubectl Patterns for CKAD

```bash
# Quick Pod creation
kubectl run mypod --image=nginx --restart=Never

# Generate Deployment YAML
kubectl create deployment myapp --image=nginx --replicas=3 --dry-run=client -o yaml

# Expose a Deployment
kubectl expose deployment myapp --port=80 --target-port=8080 --type=ClusterIP

# Create ConfigMap from literals
kubectl create configmap myconfig --from-literal=db_host=mysql --from-literal=db_port=3306

# Create Secret
kubectl create secret generic mysecret --from-literal=password=secret123

# Quick edit
kubectl edit deployment myapp

# Force delete stuck resources
kubectl delete pod mypod --grace-period=0 --force

# Get resource YAML
kubectl get deployment myapp -o yaml

# Explain resources
kubectl explain pod.spec.containers
kubectl explain deployment.spec.strategy
```

### Time Management Strategy

- **Read all requirements first** (1 min) - Understand what you need to build
- **Plan your approach** (1 min) - Decide on imperative vs declarative, order of operations
- **Implement** (8-10 min) - Create resources efficiently
- **Verify** (2-3 min) - Test that everything works
- **Clean up** (1 min) - If time allows, verify no extra resources

### Troubleshooting Quick Reference

```bash
# Pod not starting?
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # if pod crashed

# Service not working?
kubectl get endpoints <service-name>
kubectl describe service <service-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Resource status
kubectl get all -n <namespace>
```

## Scoring Yourself

After completing each scenario:

- ✅ **Pass**: All requirements met within time limit
- ⚠️ **Partial**: Most requirements met, or completed but over time
- ❌ **Review needed**: Multiple requirements not met or significantly over time

Track your progress and focus on scenarios where you need improvement.

## Additional Practice Resources

- [Official Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [CKAD Curriculum](https://github.com/cncf/curriculum/blob/master/CKAD_Curriculum_v1.34.pdf)

## Before You Start

Make sure you have:

- A working Kubernetes cluster (Docker Desktop, minikube, kind, etc.)
- kubectl configured and working
- Completed the prerequisite labs (Pods, Services, Deployments, ConfigMaps, Secrets)

Good luck with your CKAD preparation! Remember: speed comes with practice.
