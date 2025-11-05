# Logging - Quickfire Questions

Test your knowledge of Kubernetes logging with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. How do you view logs from a running Pod?

A) kubectl log pod-name
B) kubectl logs pod-name
C) kubectl get logs pod-name
D) kubectl show logs pod-name

### 2. How do you stream logs in real-time (follow mode)?

A) kubectl logs pod-name --watch
B) kubectl logs pod-name --stream
C) kubectl logs pod-name --follow
D) kubectl logs pod-name -w

### 3. What is the EFK stack?

A) Elasticsearch, Filebeat, Kibana
B) Elasticsearch, Fluentd, Kibana
C) Etcd, Fluentd, Kube-proxy
D) Envoy, Fluentd, Kubernetes

### 4. Where are container logs typically stored on the node?

A) /var/log/pods/
B) /var/log/containers/
C) /var/log/kubernetes/
D) Both A and B (symlinked)

### 5. How do you view logs from a specific container in a multi-container Pod?

A) kubectl logs pod-name container-name
B) kubectl logs pod-name -c container-name
C) kubectl logs pod-name/container-name
D) kubectl logs -c container-name pod-name

### 6. What is the purpose of a log aggregation system in Kubernetes?

A) To delete old logs
B) To centralize logs from all Pods and nodes for searching and analysis
C) To compress log files
D) To encrypt logs

### 7. How long are container logs retained by default?

A) Forever
B) Until the container is deleted
C) Until log rotation occurs based on size/time limits
D) 7 days

### 8. What is Fluentd's role in logging?

A) Log storage
B) Log visualization
C) Log collection and forwarding
D) Log rotation

### 9. How do you view logs from the previous instance of a crashed container?

A) kubectl logs pod-name --crashed
B) kubectl logs pod-name --previous
C) kubectl logs pod-name --old
D) kubectl logs pod-name --last

### 10. What is structured logging?

A) Organizing log files in directories
B) Outputting logs in a consistent, parseable format (often JSON)
C) Compressing log files
D) Encrypting sensitive log data

---

## Answers

1. **B** - `kubectl logs pod-name` displays logs from a Pod's container. For multi-container Pods, specify the container with `-c`.

2. **C** - `kubectl logs pod-name --follow` (or `-f`) streams logs in real-time, similar to `tail -f`. `--follow` is the long form of `-f`.

3. **B** - EFK (Elasticsearch, Fluentd, Kibana) is a popular logging stack: Fluentd collects logs, Elasticsearch stores/indexes them, Kibana visualizes them.

4. **D** - Logs are stored in both `/var/log/pods/` (organized by namespace/pod/container) and `/var/log/containers/` (symlinks with flattened naming). CRI writes to the former.

5. **B** - Use `-c container-name` to specify which container's logs to view: `kubectl logs pod-name -c container-name`.

6. **B** - Log aggregation centralizes logs from all Pods and nodes into a searchable system, making it easier to troubleshoot distributed applications.

7. **C** - Container logs are rotated based on size (often 10MB) and count limits (often 5 files). Exact behavior depends on the container runtime and node configuration.

8. **C** - Fluentd is a log collector and forwarder. It collects logs from various sources, processes/enriches them, and forwards to destinations like Elasticsearch.

9. **B** - `kubectl logs pod-name --previous` (or `-p`) shows logs from the previous (terminated/crashed) container instance, useful for debugging crashes.

10. **B** - Structured logging outputs logs in a consistent, machine-parseable format (typically JSON with fields like timestamp, level, message) rather than unstructured text.

---

## Study Resources

- [Lab README](README.md) - Logging concepts and EFK stack setup
- [CKAD Requirements](CKAD.md) - CKAD logging topics
- [Official Logging Documentation](https://kubernetes.io/docs/concepts/cluster-administration/logging/)
