# Centralized Logging with Elasticsearch, Fluentd and Kibana (EFK)


## Reference

- [Kubernetes logging architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/#logging-at-the-node-level)
- Fluent Bit configuration

```
[INPUT]
  Name              tail
  Tag               kube.<namespace_name>.<container_name>.<pod_name>.<container_id>-
  Tag_Regex         (?<pod_name>[a-z0-9](?:[-a-z0-9]*[a-z0-9])?(?:\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*)_(?<namespace_name>[^_]+)_(?<container_name>.+)-(?<container_id>[a-z0-9]{64})\.log$
  Path              /var/log/containers/*.log
```

- tails all files in the path
- uses the regex over the filename to extract metadata

```
[OUTPUT]
  Name            es
  Match           kube.default.*
  Host            elasticsearch
  Index           app-logs
  Generate_ID     On
```

- selects logs from Pods in the default namespace
- stores them in Elasticsearch in the index app-logs

## Pod logs

```
k apply -f labs\logging\specs\fulfilment-api

k logs -l app=fulfilment,component=api
```

```
k apply -f labs\logging\specs\jumpbox

k exec -it jumpbox -- sh

ls /var/log/containers

# use cat to read the contents of API log

exit
```

> Each container on the node has a .log file

Files are named with a pattern:

```
fulfilment-processor-7695b895d7-h878q_default_app-260923b9ceb2c8223ebff38c2c3d81c2cd6301edfb3ae88ddebb1d1a6a19ad2c.log
```

`[pod-name]_[namespace]_[container_name]_[container-id]`


## EFK stack

k apply -f labs\logging\specs\logging

k get all -n logging


> Pods can use the Elasticsearch REST API to insert & query data

```
k exec -it jumpbox -- sh

curl http://elasticsearch.logging.svc.cluster.local:9200/_cat/indices
```

> Output shows logs being stored:

```
yellow open app-logs  85auSZIAQ2SYpflMN7NYGQ 5 1 12984 0   3.4mb   3.4mb
yellow open sys-logs  aKQAl5XvQWaC30upiwo71Q 5 1   106 0 658.9kb 658.9kb
green  open .kibana_1 bEezIodMQ_6FoJ8cQ5mP5A 1 0     0 0    230b    230b
```

## Kibana

> http://localhost:5601 or http://localhost:30561 

Left menu:

- stack management
- index patterns
- create index pattern
  - name `app-logs`
  - time field `@timestamp`

Left menu

- Discover
- Select `app-logs` index pattern

> See all container logs, plus metadata (namespace, pod, image etc.)

```
curl http://localhost:30811/documents
```

## Add system logs

Add index pattern

Left menu:

- stack management
- index patterns
- create index pattern
  - name `sys-logs`
  - time field `@timestamp`


Switch to Discover - filter to show logs from Kubernetes API server

Click field `kubernetes.labels.component`, and you'll see all the values.

Select `kube-apiserver` to see the API logs

## lab - Logging sidecar

```
k apply -f labs\logging\specs\fulfilment-processor
```

k logs -l app=fulfilment,component=processor

Check Kibana - none

k exec deploy/fulfilment-processor -- cat /app/logs/fulfilment-processor.log

Add another container, read the log file from the app container and echo it out

## Cleanup

```
k delete ns,deploy,svc,po -l kubernetes.courselabs.co=logging
```