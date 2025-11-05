# Monitoring - Quickfire Questions

Test your knowledge of Kubernetes monitoring with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the Metrics Server in Kubernetes?

A) A logging aggregator
B) A cluster-wide aggregator of resource usage metrics
C) A monitoring dashboard
D) An alerting system

### 2. Which command shows CPU and memory usage for Pods?

A) kubectl top pods
B) kubectl stats pods
C) kubectl monitor pods
D) kubectl metrics pods

### 3. What metrics format does Prometheus use?

A) Text-based format with labels
B) JSON
C) XML
D) Binary

### 4. What is a ServiceMonitor in Prometheus Operator?

A) A metrics exporter
B) A CRD that defines how to monitor a Service
C) A Service type
D) A monitoring dashboard

### 5. Which Kubernetes resource provides health check information?

A) Monitor
B) Probe (liveness, readiness, startup)
C) HealthCheck
D) Status

### 6. What port do Kubernetes components typically expose metrics on?

A) 9090
B) 8080
C) 3000
D) Various ports, often using /metrics endpoint

### 7. What is Grafana primarily used for?

A) Visualizing metrics through dashboards
B) Collecting metrics
C) Alerting only
D) Storing metrics

### 8. What does kubectl top nodes show?

A) Network traffic per node
B) Pod count per node
C) CPU and memory usage per node
D) Disk usage per node

### 9. What is the purpose of kube-state-metrics?

A) To monitor nodes only
B) To replace Metrics Server
C) To expose cluster-level metrics about Kubernetes objects
D) To collect application logs

### 10. Which annotation is commonly used to enable Prometheus scraping?

A) prometheus.io/scrape: "true"
B) prometheus.io/enable: "true"
C) monitoring.io/enable: "true"
D) metrics.io/scrape: "true"

---

## Answers

1. **B** - Metrics Server is a cluster-wide aggregator of resource usage data (CPU, memory). It's required for `kubectl top` commands and Horizontal Pod Autoscaler.

2. **A** - `kubectl top pods` shows current CPU and memory usage for Pods. `kubectl top nodes` shows node-level metrics. Requires Metrics Server.

3. **A** - Prometheus uses a simple text-based format with labels (key-value pairs) for metrics. Example: `http_requests_total{method="GET",status="200"} 1234`.

4. **B** - A ServiceMonitor is a CRD in Prometheus Operator that declaratively defines how Prometheus should discover and scrape metrics from a Service.

5. **B** - Probes (liveness, readiness, startup) provide health check information. Kubernetes uses these to determine Pod health and readiness for traffic.

6. **D** - Kubernetes components expose metrics on various ports (kubelet on 10250, API server on 6443, etc.), typically at the `/metrics` endpoint in Prometheus format.

7. **A** - Grafana is a visualization and analytics platform. It creates dashboards to visualize metrics from various sources like Prometheus, Elasticsearch, and InfluxDB.

8. **C** - `kubectl top nodes` displays CPU and memory usage for each node in the cluster, showing both usage and percentage of capacity.

9. **C** - kube-state-metrics exposes cluster-level metrics about Kubernetes object states (Pod count, Deployment status, resource requests/limits) that Metrics Server doesn't provide.

10. **A** - The annotation `prometheus.io/scrape: "true"` (along with `prometheus.io/port` and `prometheus.io/path`) is commonly used to configure Prometheus scraping for Pods and Services.

---

## Study Resources

- [Lab README](README.md) - Monitoring concepts and Prometheus setup
- [CKAD Requirements](CKAD.md) - CKAD monitoring topics
- [Official Monitoring Documentation](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/)
