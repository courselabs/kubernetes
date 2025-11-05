# CKAD-Focused Deployment Specs

This directory contains production-ready deployment examples demonstrating all CKAD best practices.

## Files

### production-ready.yaml
A comprehensive example showing:
- ✅ **All three probe types** (startup, readiness, liveness) with detailed comments
- ✅ **Resource requests and limits** (cpu, memory)
- ✅ **Rolling update strategy** (maxSurge, maxUnavailable)
- ✅ **High availability** (3 replicas)
- ✅ **Security context** (non-root user, dropped capabilities)
- ✅ **Proper labels and annotations** (including change-cause)
- ✅ **ConfigMap and Secret** examples
- ✅ **Service** with NodePort for testing

## Usage

Deploy the production-ready example:

```bash
# Deploy all resources:
kubectl apply -f labs/deployments/specs/ckad/production-ready.yaml

# Check the deployment:
kubectl get all -n production-demo

# Describe deployment to see probe configuration:
kubectl describe deployment webapp -n production-demo

# Test the application:
curl localhost:30021

# Watch pods during updates:
kubectl get pods -n production-demo --watch

# Update the image (triggers rolling update):
kubectl set image deployment/webapp webapp=sixeyed/whoami:v2 -n production-demo

# Check rollout status:
kubectl rollout status deployment/webapp -n production-demo

# View rollout history:
kubectl rollout history deployment/webapp -n production-demo

# Rollback if needed:
kubectl rollout undo deployment/webapp -n production-demo

# Cleanup:
kubectl delete namespace production-demo
```

## CKAD Exam Tips

### Probe Selection
- **Startup probe**: Use for slow-starting apps (>15s startup time)
- **Readiness probe**: Always use; removes pod from service if failing
- **Liveness probe**: Use for detecting deadlocks; restarts pod if failing

### Resource Management
- **Always set requests**: Scheduler uses these for placement
- **Set limits carefully**: Too low = OOMKilled, too high = waste
- **Typical ratios**: limits = 2x requests (cpu), 1.5x requests (memory)

### Rolling Update Strategy
- **maxSurge**: Extra pods during update (default 25%)
- **maxUnavailable**: How many can be down (default 25%)
- **Zero downtime**: Set maxUnavailable=0, maxSurge=1

### Quick Reference

```yaml
# Minimum production deployment:
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - resources:
          requests: { cpu: 100m, memory: 128Mi }
          limits: { cpu: 500m, memory: 256Mi }
        readinessProbe:
          httpGet: { path: /health, port: 8080 }
        livenessProbe:
          httpGet: { path: /health, port: 8080 }
```

## See Also

- Main deployments lab: `labs/deployments/README.md`
- CKAD exam guide: `labs/deployments/CKAD.md`
- Official docs: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
