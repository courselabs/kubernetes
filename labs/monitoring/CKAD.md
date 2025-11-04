# Monitoring - CKAD Exam Topics

This document covers the CKAD exam requirements for monitoring Kubernetes applications. Make sure you've completed the [basic Monitoring lab](README.md) first, as it covers fundamental concepts of Prometheus and Grafana.

## CKAD Monitoring Requirements

The CKAD exam expects you to understand and work with:

- Application metrics and observability
- Prometheus annotations for Pod discovery
- Exposing metrics endpoints in applications
- Understanding metric types (counters, gauges, histograms)
- ConfigMaps for Prometheus configuration
- PromQL basics for querying metrics
- Container resource metrics (CPU, memory)
- Liveness and readiness probes for health monitoring
- Troubleshooting monitoring issues

> **Note:** Full Prometheus/Grafana setup is often out of CKAD scope, but understanding how to expose metrics from your applications and configure basic monitoring is important.

## Reference

- [Prometheus](https://prometheus.io/docs/introduction/overview/)
- [Prometheus Kubernetes Service Discovery](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#kubernetes_sd_config)
- [Kubernetes Metrics APIs](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/)
- [kubectl top command](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_top/)

## Understanding Prometheus Metrics

### Metric Types

Prometheus supports four metric types:

**1. Counter** - Only increases (or resets to 0)
```
# Example: Total HTTP requests
http_requests_total 1234
```
Use for: Total requests, errors, tasks completed

**2. Gauge** - Can go up or down
```
# Example: Current memory usage
memory_usage_bytes 524288000
```
Use for: Current connections, queue depth, temperature

**3. Histogram** - Samples observations (request durations, response sizes)
```
# Example: HTTP request durations
http_request_duration_seconds_bucket{le="0.1"} 24054
http_request_duration_seconds_bucket{le="0.5"} 24300
http_request_duration_seconds_sum 3897.04
http_request_duration_seconds_count 24320
```
Use for: Request latencies, response sizes

**4. Summary** - Similar to histogram, calculates quantiles
```
# Example: Request durations with quantiles
http_request_duration_seconds{quantile="0.5"} 0.05
http_request_duration_seconds{quantile="0.9"} 0.1
http_request_duration_seconds_sum 3897.04
http_request_duration_seconds_count 24320
```
Use for: Pre-calculated percentiles

**TODO**: Create examples demonstrating:
- Simple application with all metric types
- How to choose the right metric type
- Reading and interpreting metrics output

## Prometheus Annotations for Pod Discovery

Prometheus uses Pod annotations to discover which Pods to scrape:

### Standard Annotations

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  annotations:
    prometheus.io/scrape: "true"   # Enable scraping
    prometheus.io/port: "8080"     # Metrics port (default: Pod port)
    prometheus.io/path: "/metrics" # Metrics endpoint (default: /metrics)
spec:
  containers:
  - name: app
    image: myapp:latest
    ports:
    - containerPort: 8080
      name: metrics
```

### Annotation Details

| Annotation | Purpose | Default | Example |
|------------|---------|---------|---------|
| `prometheus.io/scrape` | Enable/disable scraping | `false` | `"true"` |
| `prometheus.io/port` | Port for metrics endpoint | Container port | `"8080"` |
| `prometheus.io/path` | Metrics HTTP path | `/metrics` | `"/actuator/prometheus"` |

### Deployment with Prometheus Annotations

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: webapp
        image: mywebapp:v1
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 9090
          name: metrics
```

**Key Points:**
- Annotations go in Pod template metadata (not Deployment metadata)
- Port must match container port
- Path must return Prometheus-formatted metrics

**TODO**: Create examples:
- `specs/annotations/simple-metrics-pod.yaml`
- `specs/annotations/deployment-with-metrics.yaml`
- `specs/annotations/custom-port-and-path.yaml`

**TODO**: Add exercise:
1. Deploy app without annotations (not scraped)
2. Add prometheus.io/scrape annotation
3. Use custom port and path
4. Verify in Prometheus targets

## Exposing Metrics from Applications

### Metrics Endpoint Structure

Prometheus expects text-based metrics in this format:

```
# HELP metric_name Description of the metric
# TYPE metric_name counter|gauge|histogram|summary
metric_name{label1="value1",label2="value2"} 123.45
```

**Example metrics output:**

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1234
http_requests_total{method="POST",status="200"} 567
http_requests_total{method="GET",status="404"} 89

# HELP memory_usage_bytes Current memory usage
# TYPE memory_usage_bytes gauge
memory_usage_bytes{type="heap"} 524288000
memory_usage_bytes{type="non_heap"} 104857600

# HELP http_request_duration_seconds HTTP request durations
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 1000
http_request_duration_seconds_bucket{le="0.5"} 1500
http_request_duration_seconds_bucket{le="+Inf"} 1550
http_request_duration_seconds_sum 450.5
http_request_duration_seconds_count 1550
```

### Creating Metrics in Different Languages

**TODO**: Add examples for common languages:

**Python (using prometheus_client):**
```python
from prometheus_client import Counter, Gauge, Histogram, start_http_server

# Define metrics
requests_total = Counter('http_requests_total', 'Total requests')
active_connections = Gauge('active_connections', 'Active connections')
request_duration = Histogram('request_duration_seconds', 'Request duration')

# Expose on port 8000
start_http_server(8000)
```

**Java (Spring Boot Actuator):**
```yaml
# application.properties
management.endpoints.web.exposure.include=health,metrics,prometheus
management.metrics.export.prometheus.enabled=true
```

**Go (using prometheus/client_golang):**
```go
import "github.com/prometheus/client_golang/prometheus/promhttp"

http.Handle("/metrics", promhttp.Handler())
http.ListenAndServe(":9090", nil)
```

**Node.js (using prom-client):**
```javascript
const promClient = require('prom-client');
const register = new promClient.Registry();

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

**TODO**: Create complete working examples in `specs/applications/` for each language

## Prometheus Configuration

### ConfigMap Structure

Prometheus configuration is stored in a ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |-
    global:
      scrape_interval: 15s      # How often to scrape targets
      evaluation_interval: 15s  # How often to evaluate rules

    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
        - role: pod

        relabel_configs:
        # Only scrape pods with prometheus.io/scrape: "true"
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
          action: keep
          regex: true

        # Use custom metrics path if specified
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)

        # Use custom port if specified
        - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
          action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2
          target_label: __address__
```

### Service Discovery Configuration

**Pod-based discovery:**

```yaml
scrape_configs:
  - job_name: 'my-apps'
    kubernetes_sd_configs:
    - role: pod
      namespaces:
        names:
        - default
        - production

    relabel_configs:
    - source_labels: [__meta_kubernetes_namespace]
      action: keep
      regex: default|production

    - source_labels: [__meta_kubernetes_pod_label_app]
      target_label: application
```

**Service-based discovery:**

```yaml
scrape_configs:
  - job_name: 'kubernetes-services'
    kubernetes_sd_configs:
    - role: service

    relabel_configs:
    - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
      action: keep
      regex: true
```

**TODO**: Create comprehensive configuration examples:
- `specs/prometheus-config/basic-pod-discovery.yaml`
- `specs/prometheus-config/multi-namespace.yaml`
- `specs/prometheus-config/service-discovery.yaml`
- `specs/prometheus-config/label-based-filtering.yaml`

**TODO**: Add exercise:
1. Deploy Prometheus with basic config
2. Add new scrape job for specific namespace
3. Filter by labels
4. Update and reload Prometheus

### Reloading Configuration

After updating ConfigMap, Prometheus needs to reload:

```bash
# Option 1: Restart Prometheus Pod
kubectl rollout restart deployment/prometheus -n monitoring

# Option 2: Send SIGHUP signal (if configured)
kubectl exec -n monitoring prometheus-xyz -- kill -HUP 1

# Option 3: HTTP reload endpoint (if --web.enable-lifecycle flag set)
kubectl exec -n monitoring prometheus-xyz -- \
  curl -X POST http://localhost:9090/-/reload
```

**TODO**: Add section on configuring lifecycle management

## PromQL Basics

### Simple Queries

```promql
# Get current value
http_requests_total

# Filter by labels
http_requests_total{status="200"}
http_requests_total{method="GET", status!="404"}

# Multiple metrics
{__name__=~"http_.*"}
```

### Range Vectors

```promql
# Rate of increase over 5 minutes
rate(http_requests_total[5m])

# Increase over last hour
increase(http_requests_total[1h])

# Average over 10 minutes
avg_over_time(cpu_usage[10m])
```

### Aggregation

```promql
# Sum across all instances
sum(http_requests_total)

# Sum by label
sum(http_requests_total) by (status)

# Average by application
avg(memory_usage_bytes) by (app)

# Count of time series
count(up == 1)
```

### Common Queries for CKAD

```promql
# CPU usage per container
rate(container_cpu_usage_seconds_total[5m])

# Memory usage
container_memory_usage_bytes

# Pod count
count(kube_pod_info)

# Pods by phase
count(kube_pod_status_phase{phase="Running"})

# Container restarts
rate(kube_pod_container_status_restarts_total[1h])

# Request rate per second
rate(http_requests_total[1m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**TODO**: Create PromQL tutorial with:
- Basic query examples
- Common patterns for CKAD
- Practice exercises
- Query optimization tips

## Container Resource Metrics

### Using kubectl top

```bash
# Node resource usage
kubectl top nodes

# Pod resource usage (current namespace)
kubectl top pods

# Pod resource usage (all namespaces)
kubectl top pods --all-namespaces

# Pod resource usage with containers
kubectl top pods --containers

# Sort by CPU
kubectl top pods --sort-by=cpu

# Sort by memory
kubectl top pods --sort-by=memory
```

### Resource Metrics API

Requires metrics-server to be installed:

```bash
# Check if metrics-server is running
kubectl get deployment metrics-server -n kube-system

# Install metrics-server (if needed)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Understanding Resource Metrics

**CPU:**
- Measured in millicores (m)
- 1000m = 1 CPU core
- Shows current usage

**Memory:**
- Measured in bytes (Ki, Mi, Gi)
- Shows current working set size (resident memory)

**Example output:**

```
NAME                CPU(cores)   MEMORY(bytes)
webapp-abc123       250m         128Mi
api-def456          500m         512Mi
```

**TODO**: Create examples demonstrating:
- Installing metrics-server
- Using kubectl top in different scenarios
- Comparing metrics-server vs Prometheus
- Resource request/limit vs actual usage

## Health Checks and Observability

### Liveness and Readiness Probes

Related to monitoring but using Kubernetes health checks:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp
spec:
  containers:
  - name: app
    image: myapp:v1
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 2
      failureThreshold: 3

    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 3
      successThreshold: 1
      failureThreshold: 2
```

**Key Differences:**

| Probe | Purpose | On Failure |
|-------|---------|------------|
| Liveness | Is container alive? | Restart container |
| Readiness | Is container ready for traffic? | Remove from Service endpoints |
| Startup | Has container started? | Don't run liveness/readiness yet |

### Probe Types

**1. HTTP Probe:**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
    httpHeaders:
    - name: Custom-Header
      value: Awesome
```

**2. TCP Probe:**
```yaml
livenessProbe:
  tcpSocket:
    port: 8080
```

**3. Exec Probe:**
```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
```

**TODO**: Create comprehensive health check examples:
- `specs/health/http-probes.yaml`
- `specs/health/tcp-probes.yaml`
- `specs/health/exec-probes.yaml`
- `specs/health/startup-probe.yaml`

**TODO**: Add exercise:
1. Deploy app with liveness probe
2. Simulate failure (probe fails)
3. Watch container restart
4. Deploy with readiness probe
5. Simulate not-ready state
6. Watch endpoints update

## Cluster Monitoring Components

### cAdvisor

Container Advisor (cAdvisor) provides container resource usage metrics:

- Built into kubelet
- Exposes metrics at: `https://<node-ip>:10250/metrics/cadvisor`
- Provides: CPU, memory, network, filesystem metrics

**Key metrics:**
```
container_cpu_usage_seconds_total
container_memory_usage_bytes
container_network_receive_bytes_total
container_fs_usage_bytes
```

### kube-state-metrics

Provides cluster-level metrics about Kubernetes objects:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kube-state-metrics
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kube-state-metrics
  template:
    metadata:
      labels:
        app: kube-state-metrics
    spec:
      serviceAccountName: kube-state-metrics
      containers:
      - name: kube-state-metrics
        image: registry.k8s.io/kube-state-metrics/kube-state-metrics:v2.10.0
        ports:
        - containerPort: 8080
          name: http-metrics
```

**Key metrics:**
```
kube_pod_status_phase
kube_deployment_status_replicas
kube_node_status_condition
kube_pod_container_status_restarts_total
```

### metrics-server

Lightweight metrics aggregator for resource metrics:

```bash
# Install
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify
kubectl get apiservice v1beta1.metrics.k8s.io
```

Used by:
- `kubectl top`
- Horizontal Pod Autoscaler (HPA)
- Vertical Pod Autoscaler (VPA)

**TODO**: Create examples:
- Installing each component
- Configuring Prometheus to scrape them
- Sample dashboards for each
- Comparison of metrics from each source

## Troubleshooting Monitoring

### Common Issues

**1. Prometheus Not Scraping Pods**

```bash
# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Browse to http://localhost:9090/targets

# Common causes:
# - Missing prometheus.io/scrape annotation
# - Annotation has wrong value (must be string "true")
# - Pod not in namespace covered by scrape config
# - Network policy blocking Prometheus

# Verify annotation
kubectl get pod <name> -o jsonpath='{.metadata.annotations}'

# Check if metrics endpoint is accessible
kubectl exec <pod-name> -- curl localhost:<port>/metrics
```

**2. Metrics Endpoint Not Working**

```bash
# Test metrics endpoint directly
kubectl port-forward pod/<pod-name> 9090:9090
curl localhost:9090/metrics

# Common causes:
# - App not exposing metrics
# - Wrong port in annotation
# - Wrong path in annotation
# - Metrics library not configured

# Check pod logs
kubectl logs <pod-name>

# Verify port is open
kubectl exec <pod-name> -- netstat -tlnp
```

**3. kubectl top Not Working**

```bash
# Check metrics-server
kubectl get deployment metrics-server -n kube-system

# Check metrics-server logs
kubectl logs -n kube-system deployment/metrics-server

# Common causes:
# - metrics-server not installed
# - metrics-server can't reach kubelets
# - Certificate issues
# - Insufficient RBAC permissions

# Test metrics API
kubectl get --raw /apis/metrics.k8s.io/v1beta1/nodes
kubectl get --raw /apis/metrics.k8s.io/v1beta1/pods
```

**4. High Cardinality Issues**

```promql
# Too many unique label combinations causes problems

# Bad - unbounded user_id
http_requests_total{user_id="12345"}

# Good - categorize instead
http_requests_total{user_type="premium"}

# Check cardinality
curl localhost:9090/api/v1/status/tsdb
```

**5. Missing Metrics**

```bash
# Verify app is exposing metrics
kubectl exec <pod> -- curl localhost:8080/metrics

# Check Prometheus scrape config
kubectl get cm -n monitoring prometheus-config -o yaml

# Check Prometheus logs
kubectl logs -n monitoring deployment/prometheus

# Verify ServiceMonitor (if using Prometheus Operator)
kubectl get servicemonitor
```

**TODO**: Create comprehensive troubleshooting lab:
- `specs/troubleshooting/missing-annotation.yaml`
- `specs/troubleshooting/wrong-port.yaml`
- `specs/troubleshooting/network-policy-blocking.yaml`
- `specs/troubleshooting/high-cardinality.yaml`

**TODO**: Add systematic debugging guide with decision tree

## CKAD Exam Tips

### Quick Commands

```bash
# View Pod metrics
kubectl top pods

# View Node metrics
kubectl top nodes

# Check Pod has metrics annotation
kubectl get pod <name> -o jsonpath='{.metadata.annotations.prometheus\.io/scrape}'

# Test metrics endpoint
kubectl port-forward pod/<name> 9090:<metrics-port>
curl localhost:9090/metrics

# Quick metrics endpoint test
kubectl run test --rm -it --image=curlimages/curl --restart=Never -- \
  curl http://<pod-ip>:<port>/metrics
```

### Common Patterns

**Add Prometheus annotations to existing Deployment:**
```bash
kubectl patch deployment myapp -p '
{
  "spec": {
    "template": {
      "metadata": {
        "annotations": {
          "prometheus.io/scrape": "true",
          "prometheus.io/port": "9090"
        }
      }
    }
  }
}'
```

**Check if metrics-server is working:**
```bash
kubectl top nodes
# If error, metrics-server likely not installed
```

**Quick health check setup:**
```bash
# Generate Pod with health checks
kubectl run myapp --image=myapp:v1 --dry-run=client -o yaml > pod.yaml
# Edit to add livenessProbe and readinessProbe
```

### What to Focus On

**High Priority for CKAD:**
- Adding Prometheus annotations to Pods/Deployments
- Understanding liveness and readiness probes
- Using `kubectl top` for resource metrics
- Basic troubleshooting of metrics endpoints
- Understanding counter vs gauge metrics

**Lower Priority for CKAD:**
- Complex Prometheus configuration
- PromQL advanced queries
- Grafana dashboard creation
- Alert manager setup
- Federation and remote storage

**TODO**: Add 10 rapid-fire CKAD practice scenarios

## Lab Challenge: Monitoring Multi-Tier Application

Build a fully monitored application:

**TODO**: Create comprehensive challenge with:

### Requirements

1. **Application Components**
   - Frontend web server (expose request metrics)
   - Backend API (expose request/error metrics)
   - Worker service (expose job metrics)
   - Database (expose connection metrics via exporter)

2. **Metrics Requirements**
   - All Pods have Prometheus annotations
   - Custom metrics for each service
   - HTTP request rates, error rates
   - Business metrics (orders processed, etc.)
   - Resource usage (CPU, memory)

3. **Health Checks**
   - Liveness probes on all containers
   - Readiness probes on all containers
   - Startup probes where appropriate

4. **Prometheus Configuration**
   - Scrape all application Pods
   - Scrape kube-state-metrics
   - Multiple scrape jobs
   - Custom relabeling

5. **Verification Tasks**
   - Confirm all targets are UP in Prometheus
   - Query metrics using PromQL
   - View resource usage with kubectl top
   - Trigger liveness probe failure and recovery
   - Show readiness probe affecting Service endpoints

6. **Troubleshooting Scenarios**
   - Fix Pod with missing scrape annotation
   - Fix Pod with wrong metrics port
   - Debug metrics endpoint not responding
   - Resolve high cardinality issue

**Success Criteria:**
- All Pods discoverable by Prometheus
- All metrics endpoints returning data
- Health checks configured correctly
- Resource metrics available via kubectl top
- Can query all custom metrics in Prometheus
- All troubleshooting issues resolved

**TODO**: Create all specs in `specs/challenge/` directory

## Quick Reference

### Prometheus Annotations

```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "9090"
  prometheus.io/path: "/metrics"
```

### Health Probes

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Common kubectl Commands

```bash
kubectl top nodes
kubectl top pods
kubectl top pods --containers
kubectl get --raw /apis/metrics.k8s.io/v1beta1/pods
```

### Basic PromQL

```promql
# Current value
metric_name

# Rate over 5 minutes
rate(metric_name[5m])

# Sum by label
sum(metric_name) by (label)

# Filter
metric_name{label="value"}
```

## Cleanup

```bash
kubectl delete ns,deploy,svc,cm -l kubernetes.courselabs.co=monitoring

kubectl delete ds,deploy -n kube-system -l kubernetes.courselabs.co=monitoring

kubectl delete clusterrole,clusterrolebinding -l kubernetes.courselabs.co=monitoring
```

## Further Reading

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Kubernetes Monitoring Architecture](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/)
- [Writing Exporters](https://prometheus.io/docs/instrumenting/writing_exporters/)

---

> Back to [basic Monitoring lab](README.md) | [Course contents](../../README.md)
