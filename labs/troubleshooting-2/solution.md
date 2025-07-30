# Solution

There are several issues preventing the app from working:

## Issue 1: Missing Namespace

The namespace `troubleshooting-2` doesn't exist. Create it first:

```
kubectl create ns troubleshooting-2
```

## Issue 2: Secret Data Format

The Secret uses plaintext values in the `data` field, but Kubernetes expects base64-encoded values. The Secret should use `stringData` for plaintext or encode the values in base64. 

## Issue 3: Non-existent StorageClass

The specs deploy now but the Pod stays in the Pending state:

```
kubectl describe po -n troubleshooting-2
```

The PVC specifies a StorageClass `fast-ssd` that won't exist in the cluster. The Pod will stay Pending because the PVC can't be bound. 

Either remove the storageClassName to use the default or specify a  StorageClass which is available in your cluster. But you can't update the storage class for a PVC so you will need to delete it first:

```
kubectl delete pvc --all -n troubleshooting-2
```

## Issue 4: ConfigMap in Wrong Namespace

Now the Pod is stuck in ContainerCreating state:

```
kubectl describe po -n troubleshooting-2
```

The ConfigMap is created in the default namespace but the Pod expects it in `troubleshooting-2`. Set the namespace in the ConfigMap spec or deploy it using the `-n` flag.

## Issue 5: Deployment Uses Incorrect Mount

The Pod runs now but keeps crashing. The logs aren't too helpful:

```
kubectl -n troubleshooting-2 logs deploy/troubleshooting-app
```

The container exits because it can't find the nginx binary. The Deployment is mounting the PVC volume to `/usr/sbin`. That replaces the folder containing the binaries with an empty one.

## Working Solution

The corrected specs are in the solution folder:

```
kubectl apply -f labs/troubleshooting-2/solution/
```

Now you can browse to http://localhost:8040 or http://localhost:30040 and see the app working correctly.