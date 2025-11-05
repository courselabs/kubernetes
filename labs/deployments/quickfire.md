# Deployments - Quickfire Questions

Test your knowledge of Kubernetes Deployments with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary advantage of using Deployments instead of creating Pods directly?

A) Deployments are faster to create
B) Deployments don't require a container image
C) Deployments use less cluster resources
D) Deployments support scaling, updates, and rollbacks

### 2. What must be true about the labels in a Deployment's Pod template?

A) They must match the labels in the Deployment's metadata
B) They must be unique across all Deployments
C) They can be omitted if using default labels
D) They must include all labels specified in the Deployment's selector

### 3. What is the default deployment strategy in Kubernetes?

A) RollingUpdate
B) Recreate
C) Canary
D) Blue-Green

### 4. What does `maxUnavailable: 0` mean in a RollingUpdate strategy?

A) Zero Pods can be unavailable during the update (zero-downtime)
B) All Pods will be deleted before creating new ones
C) The deployment will fail
D) No Pods can be updated

### 5. Which command shows the rollout history of a Deployment?

A) kubectl describe deployment myapp
B) kubectl rollout history deployment/myapp
C) kubectl get deployment --history
D) kubectl logs deployment/myapp

### 6. How do you rollback to the previous revision of a Deployment?

A) kubectl rollback deployment myapp
B) kubectl revert deployment myapp
C) kubectl rollout reverse deployment/myapp
D) kubectl rollout undo deployment/myapp

### 7. When should you use the Recreate deployment strategy instead of RollingUpdate?

A) When your app cannot handle multiple versions running simultaneously
B) When deploying for the first time
C) When you have limited Pods
D) When you want zero downtime

### 8. What Kubernetes object does a Deployment create to manage Pods?

A) ReplicaSet
B) DaemonSet
C) StatefulSet
D) PodController

### 9. What does `maxSurge: 2` mean in a RollingUpdate strategy with 5 replicas?

A) Only 2 Pods will be updated at a time
B) 2 Pods will always be unavailable
C) The update will fail if more than 2 Pods exist
D) Up to 2 additional Pods can be created during the update (7 total)

### 10. Which command pauses a deployment rollout?

A) kubectl stop rollout deployment/myapp
B) kubectl pause deployment myapp
C) kubectl deployment pause myapp
D) kubectl rollout pause deployment/myapp

---

## Answers

1. **D** - Deployments provide declarative updates, scaling, and rollback capabilities. They manage ReplicaSets which manage Pods, offering much more flexibility than creating Pods directly.

2. **D** - The Pod template's labels must include all labels specified in the Deployment's selector. The selector uses these labels to identify which Pods belong to the Deployment.

3. **A** - RollingUpdate is the default strategy, which gradually replaces old Pods with new ones, minimizing downtime.

4. **A** - `maxUnavailable: 0` ensures that no Pods become unavailable during the update, achieving zero-downtime deployments. New Pods must be ready before old ones are terminated.

5. **B** - `kubectl rollout history deployment/myapp` shows the revision history, including change-causes if recorded with `--record` or via annotations.

6. **D** - `kubectl rollout undo deployment/myapp` rolls back to the previous revision. You can specify a specific revision with `--to-revision=N`.

7. **A** - Use Recreate when your application cannot handle multiple versions running simultaneously (e.g., database schema changes, incompatible versions). It terminates all old Pods before creating new ones.

8. **A** - Deployments create and manage ReplicaSets. Each update creates a new ReplicaSet, allowing easy rollbacks by scaling old ReplicaSets back up.

9. **D** - `maxSurge: 2` allows up to 2 additional Pods beyond the desired count during updates. With 5 replicas, you could have up to 7 Pods temporarily during the rollout.

10. **D** - `kubectl rollout pause deployment/myapp` pauses the rollout. Resume with `kubectl rollout resume deployment/myapp`. This is useful for canary deployments or fixing issues mid-rollout.

---

## Study Resources

- [Lab README](README.md) - Core Deployment concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Deployment topics
- [Official Deployment Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
