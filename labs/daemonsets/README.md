


## DaemonSet with HostPath

```
kubectl apply -f labs/daemonsets/specs/nginx
```

```
kubectl get daemonset

kubectl get po -l app=nginx -o wide

kubectl get endpoints nginx-np
```

> Browse to the app localhost:30010 or localhost:8010


```
kubectl exec daemonset/nginx -- ls /var/log/nginx
```

- [](labs/daemonsets/specs/sleep-with-hostPath.yaml)

```
kubectl apply -f labs/daemonsets/specs/sleep-with-hostPath.yaml

kubectl get po -l app -o wide
```

> Same node

```
kubectl exec daemonset/nginx -- ls -l /var/log/nginx

kubectl exec pod/sleep -- ls -l /node-root/volumes/nginx-logs
```


## Updating DaemonSets

## Selecting Nodes