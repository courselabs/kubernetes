
## Job API spec

## Run a one-off task in a Job

```
kubectl apply -f labs/jobs/specs/pi/one

kubectl get jobs
```

```
kubectl get pods -l job-name=pi-job-one

kubectl logs -l job-name=pi-job-one
```

```
kubectl get jobs
```

> 1/1 completions - no automatic cleanup

```
kubectl apply -f labs/jobs/specs/pi/one
```

## Run a Job with multiple concurrent tasks


```
kubectl apply -f labs/jobs/specs/pi/many

kubectl get jobs -l app=pi-many
```

```
kubectl get pods -l app=pi-many

kubectl get pods -l job-name=pi-job-many

kubectl logs -l job-name=pi-job-many
```

```
kubectl describe job pi-job-many
```

> Shows Pod creation events and Pod statuses

## Manage failures in Jobs


```
kubectl apply -f labs/jobs/specs/pi/one-failing

kubectl get jobs pi-job-one-failing
```

```
kubectl get pods -l job-name=pi-job-one-failing
```

> RunContainerError status & multiple restarts until CrashLoopBackoff

May want new Pods instead:

```
# this will fail:
kubectl apply -f labs/jobs/specs/pi/one-failing/update

kubectl delete jobs pi-job-one-failing

kubectl apply -f labs/jobs/specs/pi/one-failing/update
```

```
kubectl get pods -l job-name=pi-job-one-failing --watch
```

> ContainerCannotRun status, 0 restarts & up to 4 Pods

```
kubectl logs -l job-name=pi-job-one-failing

kubectl describe pods -l job-name=pi-job-one-failing
```

## Schedule tasks with CronJobs

```
kubectl get jobs

kubectl get pods -l job-name
```

> Not cleaned up, whether succesfully completed or failed

```
kubectl apply -f labs/jobs/specs/cleanup

kubectl get cronjob

kubectl get jobs --watch
```

> You'll see the list change, so only completed jobs remain

```
# Ctrl-C

kubectl get jobs 

kubectl get pods -l job-name --show-labels
```

> The failed job is still there and the cleanup job is still there - the CronJob doesn't automatically delete it

```
kubectl logs -l app=job-cleanup
```

Clean all jobs:

```
kubectl apply -f labs/jobs/specs/cleanup/update

kubectl get jobs --watch
```

```
# Ctrl-C

kubectl get pods -l job-name --show-labels
```

> All gone - except the latest cleanup Job