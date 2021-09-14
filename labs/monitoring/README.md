# Monitoring with Prometheus and Grafana


## Reference

- Prom k8s sd
- client libraries
- exporters

<details>
  <summary>Prometheus configuration</summary>

The Prometheus server runs in a Pod and connects to the Kubernetes API to find other Pods. You can configure service discovery to be opt-in (no Pods monitored by default), or opt-out (all Pods monitored by default). Application Pods use annotations to configure how they need to be monitored.

```
scrape_configs:
  - job_name: 'app'
    kubernetes_sd_configs:
      - role: pod 

    relabel_configs:
      - source_labels: 
          - __meta_kubernetes_namespace
        regex: widgetario
        action: keep
        # ^ only include Pods in the

      - source_labels: 
          - __meta_kubernetes_pod_annotationpresent_prometheus_io_scrape
          - __meta_kubernetes_pod_annotation_prometheus_io_scrape
        regex: true;true
        action: keep
```



# deploy app

k apply -f labs\monitoring\specs\fulfilment-processor

k get all -l kubernetes.courselabs.co=monitoring

http://localhost:9110/metrics or http://localhost:30910/metrics 

# deploy monitoring

k apply -f labs\monitoring\specs\monitoring

k get all -n monitoring

http://localhost:9090/targets or http://localhost:3990/targets 

Switch to _graph_ page, check the metrics for `fulfilment_requests_total`

# check in grafana

http://localhost:3000

- admin
- labs

import dashboard from `labs\monitoring\dashboards\fulfilment-processor.json`

# lab - kube-state-metrics deployment, load grafana dashboard


k apply -f D:\scm\github\courselabs\kubernetes\labs\monitoring\specs\cluster-metrics

k get pods -l kubernetes.courselabs.co=monitoring

- add both to prom scrape
- load cluster dasboard

## Cleanup

```
k delete ns,deploy,svc -l kubernetes.courselabs.co=monitoring
```