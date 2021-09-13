

k apply -f D:\scm\github\courselabs\kubernetes\labs\monitoring\solution\prometheus-config.yaml

k -n monitoring rollout restart deploy/prometheus

> Browse to Prometheus target config - check all up:

![](/img/monitoring-lab-targets.png)

D:\scm\github\courselabs\kubernetes\labs\monitoring\dashboards\cluster.json


![](/img/monitoring-lab-dashboard.png)