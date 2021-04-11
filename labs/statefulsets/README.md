
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


## Communication with StatefulSet Pods

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

kubectl get po -l app=products-db --watch
```


```
# Ctrl-C to exit the watch

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

> Browse to localhost:8020 / localhost:30020 and sign in:

* system (dropdown): PostgreSQL
* server (already filled): products-db-0.products-db.default.svc.cluster.local 
* username: postgres
* password: w1dgetar!0
* database: postgres
* Permanent login: checked

![](img/adminer-login.png)


Now you can browse to the Products table and see the data:

- http://localhost:8020/?pgsql=products-db-0.products-db.default.svc.cluster.local&username=postgres&db=postgres&ns=public&select=products

OR:

- http://localhost:30020/?pgsql=products-db-0.products-db.default.svc.cluster.local&username=postgres&db=postgres&ns=public&select=products

Click the pencil icon in the _Modify_ column and make a change to one row, like editing the name of a product:


![](img/adminer-updated.png)

Now click _Logout_ in the top right and log in again to the replica. The connection details are all the same except the server name, which uses the Service for Pod 1:

* server: products-db-1.products-db.default.svc.cluster.local 

Click _select_ for the Products table and you'll see the change you made to the primary server has been replicated to the secondary. If you try to edit a row here you'll get an error message because the secondary is read-only.

## Use PersistentVolumeClaims with a StatefulSet

Update uses consecutive rollout, starting from the last Pod in the set and moving backwards to the first. That means secondaries are replaced before the primary:

```
kubectl apply -f labs/statefulsets/specs/products-db/update

kubectl get po -l app=products-db --watch
```

> You'll see products-db-1 terminate and be replaced first, then products-db-0 when the new products-db-1 is running

The consecutive rollout is more time-consuming but safer - if there's a problem with the rollout, the secondary may be unavailable but the primary will still be there.

```
# Ctrl-C to exit the watch
```

Go back to the Adminer website, logout of the secondary and log back in to the primary:

* : products-db-0.products-db.default.svc.cluster.local

Click _select_ to query the _products_ table - your changes are gone. The database files in the Pods are saved in the container filesystem, so Pod replacements mean you lose all your data.

StatefulSets have a special relationship with PersistentVolumeClaims, so you can request a PVC for each Pod which stays linked to the Pod. Pod-1 will have its own PVC and when you deploy an update the new Pod-1 will attach to the same PVC as the previous Pod-1:

- [](labs/statefulsets/specs/products-db-pvc/statefulset-with-pvc.yaml) - updates the StatefulSet spec to add a volume claim template; Kubernetes uses the template to create a PVC for each Pod in the StatefulSet.

Try and update the StatefulSet - like other controllers, changes to the Pod spec are restricted so this will fail:

```
kubectl apply -f labs/statefulsets/specs/products-db-pvc
```

You need to delete the original StatefulSet first:

```
kubectl delete statefulset products-db

kubectl apply -f labs/statefulsets/specs/products-db-pvc

kubectl get pvc -l app=products-db --watch
```

> You'll see a PVC for Pod-0 gets created, then when Pod-0 is running another PVC gets created for Pod-1

The PVC template doesn't specify a StorageClass so it will use the default for your cluster.

Now when you update the StatefulSet, the new Pods will use the original PVCs:

-[]()

```
# Ctrl-C

kubectl apply -f labs/statefulsets/specs/products-db-pvc/update

kubectl get pods -l app=products-db --watch

kubectl get pvc -l app=products-db
```

> The Pods are new but the PVCs are old - the new Pods attach to the PVCs and the data is already initialized

```
kubectl logs -l app=products-db --tail 100 | grep Skipping
```

## Lab


```
kubectl apply -f labs/statefulsets/specs/simple-proxy
```