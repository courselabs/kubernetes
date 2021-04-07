# Lab Solution


## Create a Pod with a HostPath volume


```
kubectl apply -f labs/persistentvolumes/solution
```

```
kubectl exec pod/sleep -- ls /node-root

kubectl exec pod/sleep -- mkdir -p /node-root/volumes/pi-proxy
```

```
kubectl describe pod -l app=pi-proxy,storage=local

kubectl rollout restart deploy/pi-proxy
```

## Test the storage lifecycle

Refresh the Pi web app so the results are calculated and stored in the cache.

```
kubectl exec pod/sleep -- ls /node-root/volumes/pi-proxy
```

Remove the Nginx Pod and the ReplicaSet creates a replacement:

```
kubectl delete pod -l app=pi-proxy,storage=local

kubectl get pod -l app=pi-proxy,storage=local
```

The new Pod starts with the same cache:

```
kubectl exec deploy/pi-proxy --ls /tmp
```