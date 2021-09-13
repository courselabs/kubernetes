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


# Milestone 3

The completed manifests are in these folders:

- `monitoring` includes the Deployments, Services and configuration for Prometheus and Grafana

- `load-test` has the Job for the Fortio load test

- `helm/templates` updates all the Pod controllers to specify annotations in the Pod metadata, to include or exclude from Prometheus and to set the port and path.

## Steps 1-2

Deploy the monitoring stack - these objects are created in the `monitoring` namespace:

```
kubectl apply -f ./monitoring/
```

> Check the Prometheus targets (e.g. http://localhost:30990/targets) - you'll see none listed.

> Check Grafana (e.g. http://localhost:30300) - navigate to the Widgetario dashboard and you'll see lots of panels, but no data

## Step 3

Deploy the app with Helm (using your own chart or the chart in the `Data` folder), to the correct namespace:

```
helm install -n widgetario-prod --create-namespace -f helm/local.yaml widg-prod helm/widgetario
```

> Check the app (e.g. http://localhost:30080) and when all the Pods are running you should see the site. Refresh the Prometheus targets and you'll see it's still empty.

## Step 4

You can add the annotations with Kubectl:

```
kubectl -n widgetario-prod annotate pods -l component=stock-api prometheus.io/scrape=true

kubectl -n widgetario-prod annotate pods -l component=products-api prometheus.io/scrape=true

kubectl -n widgetario-prod annotate pods -l component=web prometheus.io/scrape=true

kubectl -n widgetario-prod annotate pods -l component=products-api prometheus.io/path=/actuator/prometheus

kubectl -n widgetario-prod annotate pods -l component=web prometheus.io/port=5001
```

OR deploy the updated Helm chart with the annotations:

```
helm upgrade -n widgetario-prod -f local.yaml widg-prod widgetario
```

Now you'll see the application components listed as Prometheus targets, all in the `UP` status.

## Step 5

Run your jobs:

```
kubectl apply -f ./load-test/
```

Each Pod runs load tests for 60 seconds, and the Job will run three sets of two concurrent Pods. As the Pods are running, check your Grafana dashboard to see the HTTP response times and CPU and memory usage increase.