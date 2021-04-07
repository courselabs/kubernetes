# Lab Solution

Pods can share volumes, provided the access mode allows it. That won't do here though because the volume can't be created.

To get access to the node's disk, create a new Pod with a `HostPath` volume targeting the root path `/`.

## Create a Pod with a HostPath volume

[sleep-with-pv.yaml](solution/sleep-with-pv.yaml) uses a HostPath volume in the Pod spec; the spec also includes affinity rules to make sure it uses the same node that the PV uses.

Deploy the Pod:

```
kubectl apply -f labs/persistentvolumes/solution
```

The Pod container mounts the root of the node's disk to `/node-root` inside the container; that's how you can create a directory on the node's disk:

```
kubectl exec pod/sleep -- ls /node-root

kubectl exec pod/sleep -- mkdir -p /node-root/volumes/pi-proxy
```

Now the PV can be created and the Pod deployed, but it's probably in a backoff loop. Restart the rollout to create a new Pod, and it will start successfully:


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