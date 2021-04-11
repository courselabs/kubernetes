
## StatefulSet API spec

## Deploy a simple StatefulSet

```
kubectl apply -f labs/statefulsets/specs/simple

kubectl get po -l app=simple-statefulset
```

```
k logs simple-statefulset-0 -c wait-service

k logs simple-statefulset-1 -c wait-service

```


## Communicate with StatefulSet Pods

```
k get endpoints simple-statefulset
```

k apply -f labs/statefulsets/specs/sleep-pod.yaml

k exec sleep -- nslookup simple-statefulset

k exec sleep -- nslookup simple-statefulset-2.simple-statefulset.default.svc.cluster.local

> localhost:8010 $ ctrl-refresh, load-balanced

kubectl apply -f labs/statefulsets/specs/simple/update

> refresh, fixed to -1

## Deploy a replicated SQL database

[setup](https://github.com/sixeyed/widgetario/tree/main/src/db/postgres-replicated)

```
kubectl apply -f labs/statefulsets/specs/products-db

kubectl get po -l app=products-db
```


```
kubectl logs products-db-0
```

> db setup

```
kubectl logs products-db-1
```

> replication setup

```
./grep.ps1

kubectl logs -l app=products-db | grep 'database system is ready'
```

## Test with a SQL client Deployment

```
kubectl apply -f labs/statefulsets/specs/adminer

kubectl wait --for=condition=Ready pod -l app=adminer-web
```

> Browse to localhost:8020 / localhost:30020

## Use PersistentVolumeClaims with a StatefulSet



## Lab