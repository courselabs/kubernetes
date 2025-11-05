# Logging - Quickfire Questions

Test your knowledge of Kubernetes logging with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. How do you view logs from a running Pod?

A) kubectl show logs pod-name
B) kubectl get logs pod-name
C) kubectl logs pod-name
D) kubectl log pod-name

### 2. How do you stream logs in real-time (follow mode)?

A) kubectl logs pod-name -w
B) kubectl logs pod-name --follow
C) kubectl logs pod-name --stream
D) kubectl logs pod-name --watch

### 3. What is the EFK stack?

A) Envoy, Fluentd, Kubernetes
B) Etcd, Fluentd, Kube-proxy
C) Elasticsearch, Fluentd, Kibana
D) Elasticsearch, Filebeat, Kibana

### 4. Where are container logs typically stored on the node?

A) /var/log/containers/
B) Both A and B (symlinked)
C) /var/log/pods/
D) /var/log/kubernetes/

### 5. How do you view logs from a specific container in a multi-container Pod?

A) kubectl logs pod-name container-name
B) kubectl logs -c container-name pod-name
C) kubectl logs pod-name/container-name
D) kubectl logs pod-name -c container-name

### 6. What is the purpose of a log aggregation system in Kubernetes?

A) To compress log files
B) To centralize logs from all Pods and nodes for searching and analysis
C) To encrypt logs
D) To delete old logs

### 7. How long are container logs retained by default?

A) Until the container is deleted
B) Until log rotation occurs based on size/time limits
C) Forever
D) 7 days

### 8. What is Fluentd's role in logging?

A) Log rotation
B) Log collection and forwarding
C) Log visualization
D) Log storage

### 9. How do you view logs from the previous instance of a crashed container?

A) kubectl logs pod-name --previous
B) kubectl logs pod-name --last
C) kubectl logs pod-name --old
D) kubectl logs pod-name --crashed

### 10. What is structured logging?

A) Compressing log files
B) Encrypting sensitive log data
C) Organizing log files in directories
D) Outputting logs in a consistent, parseable format (often JSON)

---

## Answers

1. **C** - `kubectl logs pod-name` displays logs from a Pod's container. For multi-container Pods, specify the container with `-c`.

2. **B** - `kubectl logs pod-name --follow` (or `-f`) streams logs in real-time, similar to `tail -f`. `--follow` is the long form of `-f`.

3. **C** - EFK (Elasticsearch, Fluentd, Kibana) is a popular logging stack: Fluentd collects logs, Elasticsearch stores/indexes them, Kibana visualizes them.

4. **B** - Logs are stored in both `/var/log/pods/` (organized by namespace/pod/container) and `/var/log/containers/` (symlinks with flattened naming). CRI writes to the former.

5. **D** - Use `-c container-name` to specify which container's logs to view: `kubectl logs pod-name -c container-name`.

6. **B** - Log aggregation centralizes logs from all Pods and nodes into a searchable system, making it easier to troubleshoot distributed applications.

7. **B** - Container logs are rotated based on size (often 10MB) and count limits (often 5 files). Exact behavior depends on the container runtime and node configuration.

8. **B** - Fluentd is a log collector and forwarder. It collects logs from various sources, processes/enriches them, and forwards to destinations like Elasticsearch.

9. **A** - `kubectl logs pod-name --previous` (or `-p`) shows logs from the previous (terminated/crashed) container instance, useful for debugging crashes.

10. **D** - Structured logging outputs logs in a consistent, machine-parseable format (typically JSON with fields like timestamp, level, message) rather than unstructured text.

---

## Study Resources

- [Lab README](README.md) - Logging concepts and EFK stack setup
- [CKAD Requirements](CKAD.md) - CKAD logging topics
- [Official Logging Documentation](https://kubernetes.io/docs/concepts/cluster-administration/logging/)
