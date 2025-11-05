# Rollouts - Quickfire Questions

Test your knowledge of Kubernetes Deployment rollouts with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. Which command shows the rollout status of a Deployment?

A) kubectl status deployment/myapp
B) kubectl rollout status deployment/myapp
C) kubectl get deployment myapp --status
D) kubectl describe deployment myapp

### 2. How do you pause a Deployment rollout?

A) kubectl stop deployment/myapp
B) kubectl pause deployment/myapp
C) kubectl rollout pause deployment/myapp
D) kubectl deployment pause myapp

### 3. What is the purpose of pausing a rollout?

A) To stop all Pods
B) To make multiple changes without triggering multiple rollouts
C) To save resources
D) To prevent all updates permanently

### 4. How do you view the rollout history of a Deployment?

A) kubectl history deployment/myapp
B) kubectl rollout history deployment/myapp
C) kubectl logs deployment/myapp
D) kubectl get deployment myapp --history

### 5. What does kubectl rollout undo do?

A) Deletes the Deployment
B) Rolls back to the previous revision
C) Cancels pending rollouts
D) Restarts all Pods

### 6. How do you roll back to a specific revision?

A) kubectl rollout undo deployment/myapp --to-revision=3
B) kubectl rollback deployment/myapp --revision=3
C) kubectl revert deployment/myapp -r 3
D) kubectl rollout revert deployment/myapp --version=3

### 7. What triggers a Deployment rollout?

A) Only image changes
B) Changes to Pod template (image, env, labels in template, etc.)
C) Only scaling operations
D) Only when manually triggered

### 8. What does minReadySeconds in a Deployment spec control?

A) Minimum time Pods must exist
B) Minimum time a Pod must be ready before considering it available
C) Time to wait between Pod deletions
D) Startup timeout

### 9. How do you record the reason for a rollout in the history?

A) Use --record flag (deprecated) or add kubernetes.io/change-cause annotation
B) Use --message flag
C) Use --comment flag
D) It's automatic

### 10. What happens to old ReplicaSets after a successful rollout?

A) They are deleted immediately
B) They are scaled to 0 and retained based on revisionHistoryLimit
C) They are archived
D) They continue running

---

## Answers

1. **B** - `kubectl rollout status deployment/myapp` shows the progress of a rollout, blocking until completion or failure.

2. **C** - `kubectl rollout pause deployment/myapp` pauses the rollout. Resume with `kubectl rollout resume deployment/myapp`.

3. **B** - Pausing allows making multiple changes (e.g., image + env vars) without triggering multiple rollouts. Resume once to apply all changes together.

4. **B** - `kubectl rollout history deployment/myapp` shows all revisions. Add `--revision=N` to see details of a specific revision.

5. **B** - `kubectl rollout undo deployment/myapp` rolls back to the previous revision. It doesn't delete the Deployment or cancel pending rollouts.

6. **A** - `kubectl rollout undo deployment/myapp --to-revision=3` rolls back to a specific revision number from the history.

7. **B** - Any change to the Pod template (.spec.template) triggers a rollout. This includes image, env vars, volumes, labels in template, etc. Scaling does not trigger a rollout.

8. **B** - `minReadySeconds` specifies the minimum time a newly created Pod should be ready (without any containers crashing) before considering it available.

9. **A** - Use the `kubernetes.io/change-cause` annotation on the Deployment to record the reason. The `--record` flag (deprecated) automatically adds this.

10. **B** - Old ReplicaSets are scaled to 0 but retained for rollback. The `revisionHistoryLimit` (default 10) controls how many old ReplicaSets to keep.

---

## Study Resources

- [Lab README](README.md) - Rollout strategies and management
- [Deployments Lab](../deployments/README.md) - Basic Deployment concepts
- [Official Deployments Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
