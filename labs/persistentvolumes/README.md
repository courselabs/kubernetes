#

## PersistentVolumeClaims in YAML

## Data in the container's writeable layer

```
kubectl apply -f labs/persistentvolumes/specs/pi
```

> Browse to :30010/pi?dp=30000 or :8010/pi?dp=30000, you'll see it takes over a second to calculate the response and send it

Refresh and the response will be instant - the calculation is cached in Nginx:

```
kubectl exec deploy/pi-proxy -- ls /tmp
```

Now stop the container process, which will force a Pod restart:

```
kubectl exec deploy/pi-proxy -- kill 1

kubectl get po -l app=pi-proxy
```

Check the /tmp folder in the new container:

```
kubectl exec deploy/pi-proxy -- ls /tmp
```

Empty. Refresh your Pi app and it will take another second to load, because the cache is empty so it gets calculated again.

> Data in the container writeable layer has the same lifecycle as the container. When the container is replaced, the data is lost.

## Pod storage in EmptyDir volumes

The simplest type of volume is called `EmptyDir` - it creates an empty directory at the Pod level, which Pod containers can mount.

You can use it for data which is not permanent, but which you'd like to survive a restart. It's perfect for keeping a local cache of data.

- [](labs/persistentvolumes/specs/caching-proxy-emptydir/nginx.yaml) - uses an EmptyDir volume, mounting it to the /tmp directory

This is a change to the Pod spec, so you'll get a new Pod with a new empty directory volume:

```
kubectl apply -f labs/persistentvolumes/specs/caching-proxy-emptydir

kubectl wait --for=condition=Ready pod -l app=pi-proxy,storage=emptydir
```

Refresh your page to see the Pi calculation happen again - the result gets cached:

```
kubectl exec deploy/pi-proxy -- ls /tmp
```

> The container sees the same filesystem structure, but now the /tmp folder is mounted from the EmptyDir volume

Stop the Nginx process and the Pod will restart, but this time the data in the /tmp folder is available to the new container:

```
kubectl exec deploy/pi-proxy -- kill 1

kubectl get pods  -l app=pi-proxy,storage=emptydir 

kubectl exec deploy/pi-proxy -- ls /tmp
```

Refresh the site and it loads instantly.

EmptyDir volumes keep their data for the life of the Pod. Force a rollout and the new Pod starts with an empty directory:

```
kubectl rollout restart deploy/pi-proxy

kubectl wait --for=condition=Ready pod -l app=pi-proxy,storage=emptydir

kubectl exec deploy/pi-proxy -- ls /tmp
```

Empty. Refresh your Pi app and it will need to calculate the response again.

> Data in EmptyDir volumes has the same lifecycle as the Pod. When the Pod is replaced, the data is lost.

## External storage with PersistentVolumeClaims

Persistent storage is about using volumes which have a separate lifecyle - so the data persists when containers and Pods get replaced.

Storage in Kubernetes is pluggable, and production clusters will usually have multiple types on offer:

```
kubectl get storageclass
```

You'll see a single StorageClass in Docker Desktop and K3d, but in a cloud service like AKS you'd see many, each with different properties (e.g. a fast SSD that can be attached to one Pod, or a shared network storage location which can be used by many Pods).

You can create a PersistentVolumeClaim with a named StorageClass, or omit the class to use the default.

- [](labs/persistentvolumes/specs/caching-proxy-pvc/pvc.yaml)

```
kubectl apply -f labs/persistentvolumes/specs/caching-proxy-pvc/pvc.yaml
```

Each StorageClass has a provisioner, which can create the storage unit on-demand:

```
kubectl get pvc

kubectl get persistentvolumes
```

> Some provisioners create storage as soon as the PVC is created - others wait for the PVC to be claimed by a Pod

This [Deployment spec]() updates the Nginx proxy to use the PVC:

```
kubectl apply -f labs/persistentvolumes/specs/caching-proxy-pvc/

kubectl wait --for=condition=Ready pod -l app=pi-proxy,storage=pvc

kubectl get pvc,pv
```

> Now the PVC is bound and the PersistentVolume exists with the requested size and access mode in the PVC

The PVC start off empty:

```
kubectl exec deploy/pi-proxy -- ls /tmp
```

Refresh the app and you'll the /tmp folder getting filled.

The data in the PVC survives Pod restarts: 

```
kubectl exec deploy/pi-proxy -- kill 1

kubectl get pods -l app=pi-proxy,storage=pvc

kubectl exec deploy/pi-proxy -- ls /tmp
```

And Pod replacements:

```
kubectl rollout restart deploy/pi-proxy

kubectl get pods -l app=pi-proxy,storage=pvc

kubectl exec deploy/pi-proxy -- ls /tmp
```

Try the app again and the new Pod still serves the response from the cache, so it will be super fast.

> Data in PersistentVolumes has its own lifecycle. It survives until the PV is removed.

## Manual PVC management with PersistentVolumes

Some provisioners delete a PV when the PVC using it gets deleted:

```
kubectl delete -f labs/persistentvolumes/specs/caching-proxy-pvc/

kubectl get pods -l app=pi-proxy

kubectl get pvc

kubectl get pv
```

When you need more control you can manually manage the PV lifecycle:

-
-
-

The PV uses the `local` volume type, which means it gets created as a directory on the node. It uses a `NodeSelector` to specify the node it should use.

```
kubectl apply -f labs/persistentvolumes/specs/caching-proxy-pv

kubectl get pvc,pv -l app=pi-proxy

kubectl get pod -l app=pi-proxy,storage=local
```

The PV and PVC exist - they may be Bound or Pending, but the Pod will stay in the Pending state.

The events will tell us why:

```
kubectl describe pod -l app=pi-proxy,storage=local
```

The PV can't find a node matching the label selector, and the unhelpul Pod message tells us that the Pod can't be scheduled because there's no node where it can follow the PV.

Add a label and everything will flow through:

```
kubectl label node $(kubectl get nodes -o jsonpath='{.items[0].metadata.name}') k8sfun=y

kubectl get nodes --show-labels

kubectl describe pod -l app=pi-proxy,storage=local
```

Now the Pod is scheduled - but there's another error. Let's fix it in the lab :)

## Lab

You'll need to get access to your node, so you can create the path the PV needs to use.

`md -p /volumes/pi-proxy` will do it, but the hard part is getting a connection to the server.

Most Kubernetes deployments don't give you remote access to the nodes. You can't use `ssh`, so you'll need to think of another way which only needs `kubectl`.

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

## Cleanup

```
kubectl delete all,cm,pvc,pv -l co.courselabs.k8s=persistentvolumes
```