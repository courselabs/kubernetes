
## Fast staged rollouts

Open a new (preferably split) terminal and watch the Pods:

```
kubectl get po -l app=vweb --watch
```

k apply -f labs\rollouts\specs\vweb

curl localhost:30890/v.txt



In original terminal:

```
k apply -f labs\rollouts\specs\vweb\update-fast
```

> 3 new Pods created; existing Pods remain until new Pods are ready, then terminated

curl localhost:30890/v.txt

Needs app to support multiple versions and needs spare capacity in the cluster (esp. if resource requests).


## Slow staged rollouts

Check the rollouts for the Deployment:

k rollout history deploy/vweb

Roll back to v1:

k rollout undo deploy/vweb

> Rollback uses same rollout strategy, 3x v1 Pods, v2 Pods replaced when v1 come online

k apply -f labs\rollouts\specs\vweb\update-slow

> Updates 1 Pod at a time, still multiple concurrent versions

## Big-bang rollouts

Recreate strategy - only one version live, need to rollback if any issues:


k apply -f labs\rollouts\specs\vweb\update-broken

> All Pods are terminated; new ones start - then fail

This is a bad deployment, and the Recreate strategy takes the app offline

curl localhost:30890/v.txt

There is no automatic rollback; you can manually roll back:

k rollout history deploy/vweb

k rollout undo deploy/vweb

> Still unavailable while rollback happens

## Rollouts for other Pod controllers

In the watch terminal, exit the previous watch

```
kubectl get po -l app=nginx --watch
```

daemonset, on  delete

k apply -f labs\rollouts\specs\nginx-daemonset

k apply -f labs\rollouts\specs\nginx-daemonset\update-ondelete

> Nothing happens

k delete po -l app=nginx

> Now the new Pod starts

 - statefulset

k delete ds  nginx

k apply -f labs\rollouts\specs\nginx-statefulset

> 3 pods, nginx-0 nginx-1 and nginx-2

k apply -f labs\rollouts\specs\nginx-statefulset\update-partition

> Only nginx-2 replaced


## Lab

Blue-green deployments in Helm; fix chart to allow upgrade by setting activeSlot=blue or activeSlot=green; upgrade blue to v3 with automatic rollback if it doesn't complete successfully in 30 sec

## Cleanup


helm uninstall vweb

k delete ds,statefulset,deploy,svc -l kubernetes.courselabs.co=rollouts
