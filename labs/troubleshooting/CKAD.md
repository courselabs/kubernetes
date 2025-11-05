# Troubleshooting for CKAD

This guide covers the troubleshooting skills and knowledge required for the Certified Kubernetes Application Developer (CKAD) exam.

## CKAD Troubleshooting Requirements

The CKAD exam expects you to be able to:
- Evaluate cluster and node logging
- Understand and debug application deployment issues
- Monitor applications
- Debug services and networking issues
- Troubleshoot Pod failures and application issues

## Core Troubleshooting Commands

### Essential kubectl Commands

```bash
# Get overview of resources
kubectl get pods
kubectl get pods -o wide
kubectl get pods --all-namespaces
kubectl get events --sort-by='.lastTimestamp'

# Detailed information about resources
kubectl describe pod <pod-name>
kubectl describe service <service-name>
kubectl describe node <node-name>

# View logs
kubectl logs <pod-name>
kubectl logs <pod-name> -c <container-name>  # for multi-container pods
kubectl logs <pod-name> --previous            # logs from previous container instance
kubectl logs <pod-name> --tail=50             # last 50 lines
kubectl logs <pod-name> -f                    # follow logs

# Execute commands in containers
kubectl exec <pod-name> -- <command>
kubectl exec -it <pod-name> -- /bin/sh
kubectl exec <pod-name> -c <container-name> -- <command>  # for multi-container pods

# Debug with a temporary pod
kubectl run debug --image=busybox -it --rm -- sh

# Port forwarding for testing
kubectl port-forward <pod-name> <local-port>:<pod-port>
kubectl port-forward service/<service-name> <local-port>:<service-port>
```

## Common Pod Failure Scenarios

### 1. ImagePullBackOff / ErrImagePull

**Symptoms:**
- Pod status shows `ImagePullBackOff` or `ErrImagePull`
- Pod cannot start

**Common Causes:**
- Incorrect image name or tag
- Image doesn't exist in the registry
- Private registry authentication issues
- Network connectivity to registry

**Diagnosis:**
```bash
kubectl describe pod <pod-name>
# Look for events showing image pull errors
```

**TODO:** Add specs and hands-on exercise for:
- ImagePullBackOff scenario with incorrect image name
- Private registry authentication failure
- Solution files demonstrating proper image pull secrets

### 2. CrashLoopBackOff

**Symptoms:**
- Pod repeatedly crashes and restarts
- Status shows `CrashLoopBackOff`
- Restart count increases

**Common Causes:**
- Application error at startup
- Missing dependencies or configuration
- Incorrect command or arguments
- Failed liveness probe

**Diagnosis:**
```bash
kubectl logs <pod-name>
kubectl logs <pod-name> --previous
kubectl describe pod <pod-name>
```

**TODO:** Add specs and hands-on exercise for:
- Application with startup crash (e.g., missing environment variable)
- Incorrect command in container spec
- Failed liveness probe causing restarts
- Solution demonstrating proper configuration

### 3. Pod Pending

**Symptoms:**
- Pod remains in `Pending` state
- Pod never gets scheduled to a node

**Common Causes:**
- Insufficient cluster resources (CPU/memory)
- Node selector or affinity rules can't be satisfied
- PersistentVolumeClaim not bound
- Taints and tolerations mismatch

**Diagnosis:**
```bash
kubectl describe pod <pod-name>
# Look for scheduling errors in events
kubectl get nodes
kubectl describe node <node-name>
kubectl top nodes  # check resource usage
```

**TODO:** Add specs and hands-on exercise for:
- Pod with excessive resource requests
- Pod with node selector that doesn't match any node
- PVC binding issues
- Solution with appropriate resource requests and node selectors

### 4. Container Not Ready

**Symptoms:**
- Pod status shows `Running` but not `Ready`
- Container fails readiness checks

**Common Causes:**
- Readiness probe failing
- Application not ready to serve traffic
- Incorrect readiness probe configuration

**Diagnosis:**
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
# Check readiness probe configuration and failures
```

The basic lab already covers some of these scenarios - see the [main lab](README.md) for hands-on practice.

### 5. Init Container Issues

**Symptoms:**
- Pod stuck in `Init` state
- Init containers failing

**Common Causes:**
- Init container command failing
- Dependencies not available
- Network issues

**Diagnosis:**
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name> -c <init-container-name>
```

**TODO:** Add specs and hands-on exercise for:
- Pod with failing init container
- Init container waiting for dependency
- Solution demonstrating proper init container patterns

### 6. Multi-Container Pod Issues

**Symptoms:**
- Some containers running, others failing
- Sidecar containers not working correctly

**Common Causes:**
- Container-specific configuration errors
- Volume mount issues between containers
- Network communication issues between containers

**Diagnosis:**
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name> -c <container-name>
kubectl exec <pod-name> -c <container-name> -- <command>
```

**TODO:** Add specs and hands-on exercise for:
- Multi-container pod with sidecar failure
- Volume sharing issues between containers
- Solution demonstrating proper multi-container patterns

## Service and Networking Troubleshooting

### Service Not Routing to Pods

**Common Issues:**
1. **Selector Mismatch** - Service selector doesn't match Pod labels
2. **Port Mismatch** - Service targetPort doesn't match container port
3. **Named Port Mismatch** - Port names don't match between Service and Pod
4. **No Endpoints** - No pods match the service selector

**Diagnosis:**
```bash
kubectl get service <service-name>
kubectl describe service <service-name>
kubectl get endpoints <service-name>
kubectl get pods -l <label-selector>
```

The basic lab covers these scenarios - see the [main lab](README.md).

### Network Policy Blocking Traffic

**TODO:** Add specs and hands-on exercise for:
- NetworkPolicy blocking expected traffic
- Debugging network connectivity between pods
- Using temporary debug pods to test connectivity
- Solution with proper NetworkPolicy configuration

### DNS Resolution Issues

**TODO:** Add specs and hands-on exercise for:
- Service DNS not resolving
- Debugging CoreDNS issues
- Testing DNS resolution from pods
- Solution demonstrating DNS troubleshooting

## Configuration Issues

### ConfigMap and Secret Problems

**Common Issues:**
- ConfigMap or Secret doesn't exist
- Incorrect key references in Pod spec
- Volume mount path conflicts
- Environment variable name conflicts

**Diagnosis:**
```bash
kubectl get configmap
kubectl describe configmap <configmap-name>
kubectl get secret
kubectl describe secret <secret-name>
kubectl describe pod <pod-name>
```

**TODO:** Add specs and hands-on exercise for:
- Pod referencing non-existent ConfigMap
- ConfigMap key mismatch
- Secret mounting issues
- Solution demonstrating proper ConfigMap/Secret usage

### Volume Mounting Issues

**Common Issues:**
- Volume not mounting to container
- PersistentVolumeClaim not binding
- Mount path conflicts
- Permission issues with mounted volumes

**TODO:** Add specs and hands-on exercise for:
- PVC in Pending state (no matching PV)
- Volume mount path conflicts
- Permission issues with volumes
- Solution with proper PVC and volume configuration

## Advanced Troubleshooting Techniques

### Using Ephemeral Debug Containers

```bash
# Create a debug container in an existing pod (Kubernetes 1.23+)
kubectl debug <pod-name> -it --image=busybox --target=<container-name>

# Create a copy of a pod with modified settings
kubectl debug <pod-name> -it --copy-to=debug-pod --container=debug --image=busybox
```

**TODO:** Add examples demonstrating ephemeral debug containers

### Resource Quotas and Limit Ranges

**TODO:** Add specs and hands-on exercise for:
- Pod creation blocked by ResourceQuota
- LimitRange preventing pod scheduling
- Solution showing proper resource management

### Debugging Performance Issues

**TODO:** Add content covering:
- Using `kubectl top` to identify resource bottlenecks
- Analyzing resource usage with metrics-server
- Common performance anti-patterns
- Hands-on exercise with resource-constrained application

### Application-Specific Debugging

**TODO:** Add examples for:
- Java application debugging (heap dumps, thread dumps)
- Node.js application debugging
- Python application debugging
- Using appropriate debug images and tools

## CKAD Exam Tips

### Efficient Troubleshooting Workflow

1. **Start with high-level view**: `kubectl get pods -o wide`
2. **Check events**: `kubectl describe pod <pod-name>`
3. **Review logs**: `kubectl logs <pod-name>`
4. **Verify configuration**: Check selectors, labels, ports
5. **Test directly**: Use `kubectl port-forward` or `kubectl exec`
6. **Fix and reapply**: Edit YAML and redeploy

### Quick Reference: Pod Status Meanings

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| `Pending` | Pod accepted but not scheduled | Resource constraints, node selector, PVC not bound |
| `ContainerCreating` | Pod scheduled, container being created | Pulling image, mounting volumes |
| `Running` | Pod is running | Normal state (check readiness) |
| `CrashLoopBackOff` | Container repeatedly crashing | Application error, failed probe, incorrect command |
| `ImagePullBackOff` | Can't pull container image | Wrong image name, auth failure, network issue |
| `Error` | Pod terminated with error | Container command failed |
| `Completed` | Pod ran to completion | Normal for Jobs |
| `Terminating` | Pod is being deleted | Normal during deletion |

### Time-Saving kubectl Commands

```bash
# Quick aliases for exam
alias k=kubectl
alias kgp='kubectl get pods'
alias kd='kubectl describe'
alias kl='kubectl logs'

# Get all resource types in namespace
kubectl get all

# Watch resources in real-time
kubectl get pods -w

# Quick pod creation for testing
kubectl run test --image=busybox -it --rm -- sh

# Generate YAML quickly
kubectl run test --image=nginx --dry-run=client -o yaml > pod.yaml
```

## Practice Exercises

### Exercise 1: Multi-Layer Troubleshooting

**TODO:** Create a complex scenario combining:
- Deployment with incorrect replica selector
- Service with mismatched ports
- ConfigMap reference error
- Resource constraint issue
- Provide specs and solution

### Exercise 2: End-to-End Application Debugging

**TODO:** Create a full application stack with:
- Frontend service not connecting to backend
- Backend service database connection failure
- Missing environment variables
- Network policy blocking traffic
- Provide specs and solution

### Exercise 3: Performance Troubleshooting

**TODO:** Create scenario with:
- Pod with insufficient resources
- Memory leak causing OOMKilled
- CPU throttling affecting performance
- Provide specs and solution

### Exercise 4: Storage Troubleshooting

**TODO:** Create scenario with:
- StatefulSet with PVC binding issues
- Volume mount permission problems
- Data persistence verification
- Provide specs and solution

## Additional Resources

- [Kubernetes Troubleshooting Documentation](https://kubernetes.io/docs/tasks/debug/)
- [CKAD Curriculum](https://github.com/cncf/curriculum)
- [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/)
- [Debug Services](https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/)

## Summary of TODOs

This document outlines the CKAD troubleshooting requirements. The following areas need hands-on exercises and specs:

1. **ImagePullBackOff scenarios** - Wrong image, private registry auth
2. **CrashLoopBackOff scenarios** - App crashes, probe failures
3. **Pod Pending scenarios** - Resource constraints, node selectors
4. **Init container failures** - Failed init containers, dependencies
5. **Multi-container pod issues** - Sidecar failures, volume sharing
6. **NetworkPolicy issues** - Blocked traffic, connectivity testing
7. **DNS resolution problems** - Service DNS, CoreDNS debugging
8. **ConfigMap/Secret issues** - Missing configs, key mismatches
9. **Volume mounting problems** - PVC binding, permissions
10. **Ephemeral debug containers** - Practical examples
11. **Resource quotas/limits** - Quota exceeded scenarios
12. **Performance debugging** - Resource bottlenecks
13. **Application-specific debugging** - Language-specific tools
14. **Complex practice exercises** - Multi-layer scenarios

Each TODO should include:
- Failing specs in `specs/ckad-*/` directories
- Step-by-step troubleshooting guide
- Solution specs in `solution/ckad-*/` directories
- Integration with the lab test harness
