# Productionizing - Quickfire Questions

Test your knowledge of production-ready Kubernetes applications with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. Which probe checks if a container is ready to accept traffic?

A) Liveness probe
B) Readiness probe
C) Startup probe
D) Health probe

### 2. What happens when a liveness probe fails?

A) The Pod is removed from Service endpoints
B) The container is restarted
C) The Pod is deleted
D) An alert is triggered

### 3. What is the purpose of resource requests in a Pod spec?

A) To limit maximum resource usage
B) To guarantee minimum resources for scheduling decisions
C) To monitor resource usage
D) To set billing rates

### 4. What happens if a container exceeds its CPU limit?

A) The container is killed
B) The container is throttled (CPU time limited)
C) The Pod is evicted
D) Nothing, limits are only advisory

### 5. What is the purpose of a startup probe?

A) To check when a container is ready for traffic
B) To provide extra time for slow-starting containers before liveness checks
C) To restart failed containers
D) To initialize configuration

### 6. Which metric is used by the Horizontal Pod Autoscaler (HPA) by default?

A) Memory usage
B) Network traffic
C) CPU utilization
D) Request count

### 7. What is a PodDisruptionBudget (PDB) used for?

A) To limit resource usage
B) To ensure a minimum number of Pods remain available during disruptions
C) To schedule Pods on specific nodes
D) To set cost budgets

### 8. What does setting `readinessProbe.initialDelaySeconds: 10` do?

A) Delays Pod startup by 10 seconds
B) Waits 10 seconds after container starts before first readiness check
C) Runs the probe every 10 seconds
D) Waits 10 seconds before marking the Pod ready

### 9. What is the recommended pattern for handling configuration in production?

A) Hard-code configuration in containers
B) Use ConfigMaps and Secrets
C) Use environment variables only
D) Store in /etc directory

### 10. What is graceful shutdown in Kubernetes?

A) Immediately terminating Pods
B) Allowing Pods time to finish requests before termination using preStop hooks and terminationGracePeriodSeconds
C) Restarting Pods slowly
D) Draining nodes before shutdown

---

## Answers

1. **B** - Readiness probes determine if a Pod is ready to receive traffic. Failed readiness probes remove the Pod from Service endpoints but don't restart the container.

2. **B** - When a liveness probe fails, Kubernetes restarts the container (subject to the restart policy). This helps recover from deadlocks or hung states.

3. **B** - Resource requests guarantee minimum resources and are used by the scheduler to place Pods on nodes with sufficient capacity. They don't limit usage.

4. **B** - When a container exceeds its CPU limit, it's throttled (CPU time is restricted). Exceeding memory limits causes OOMKilled (termination).

5. **B** - Startup probes provide extra time for slow-starting containers. Liveness and readiness probes don't start until the startup probe succeeds.

6. **C** - HPA uses CPU utilization by default. You can configure it to use memory or custom metrics from the metrics server or custom metrics APIs.

7. **B** - PodDisruptionBudgets ensure a minimum number (or percentage) of Pods remain available during voluntary disruptions like node drains or updates.

8. **B** - `initialDelaySeconds` waits the specified time after the container starts before performing the first probe. This prevents probes during startup.

9. **B** - Use ConfigMaps for non-sensitive configuration and Secrets for sensitive data. This separates config from code and enables environment-specific settings.

10. **B** - Graceful shutdown uses `terminationGracePeriodSeconds` (default 30s) and optional `preStop` hooks to allow Pods to finish in-flight requests before termination.

---

## Study Resources

- [Lab README](README.md) - Production readiness concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific production topics
- [Official Pod Lifecycle Documentation](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
