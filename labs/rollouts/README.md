# Updates with Staged Rollouts

Pod controllers manage Pods for you - when you update the Pod spec the controller rolls out the change by removing old Pods and creating new ones. You'll do this all the time - every OS patch, library update and new feature will be an update. Depending on your app, config changes might need a rollout too.

You can configure the controller to tweak how the rollout happens - you might choose a slow but safe update for a critical component. Deployment objects are the typical Pod controller, but all the controllers have rollout options.

## Reference 

- rollout spec
- strategies
- blue/green

## Fast staged rollouts

We'll start with a simple web application:

- [vweb\deployment.yaml](.\specs\vweb\deployment.yaml) - defines a Deployment with 3 replicas of the v1 application image. There's also an init container set to sleep, so it takes a few seconds for Pods to start

Open a new terminal - split your screen if you can - and run a watch command to see Pods come online:

```
kubectl get po -l app=vweb --watch
```

📋 In your main terminal, deploy the app from the `labs\rollouts\specs\vweb` folder, and make an HTTP request to the `/v.txt` URL.

<details>
  <summary>Not sure how?</summary>

Create the resources:

```
kubectl apply -f labs\rollouts\specs\vweb
```

Check the Services and you'll see there's a NodePort listening on port 30890:

```
kubectl get svc 

curl localhost:30890/v.txt
```

</details><br/>

This update to the Deployment will cause a fast rollout:

- [update-fast\deployment.yaml](.\specs\vweb\update-fast\deployment.yaml) - maxSurge is set to 100% which means Kubernetes will create 3 new Pods straight away; maxUnavailable is set to 0 so no old Pods will be removed until new ones come online.

Deploy the update in original terminal:

```
kubectl apply -f labs\rollouts\specs\vweb\update-fast
```

📋 What do you see in the terminal with the Pod watch? How does the change get made?

<details>
  <summary>Not sure?</summary>

You can see the update happening in the ReplicaSets:

```
kubectl get rs -l app=vweb
```

3 new Pods are created straight away - a new ReplicaSet is created with the v2 spec and desired count of 3.

The three existing Pods remain until new Pods are ready, then they're terminated - the v1 ReplicaSet is gradually scaled down to 0.

</details><br/>

You can try the app while the rollout is happening:

```
curl localhost:30890/v.txt
```

ALl the v1 and v2 Pods match the Service selector so you'll get responses from both versions.

> Staged rollouts require the app to support multiple versions running concurrently, and a fast rollout like this needs spare capacity in the cluster.


## Slow staged rollouts

Rollouts aren't a separate Kubernetes object, but you can manage the rollouts for a Pod controller with Kubectl.

Check the rollouts for the Deployment:

```
kubectl rollout history deploy/vweb
```

📋 Rollback the update, so the app is at v1 again - without applying any YAML.

<details>
  <summary>Not sure how?</summary>

The rollout command has several subcommands:

```
kubectl rollout --help
```

Use `undo` to roll back to the previous Pod spec:

```
kubectl rollout undo deploy/vweb
```

</details><br/>

> Rollback uses same rollout strategy, 3x v1 Pods, v2 Pods replaced when v1 come online

>> TODO, add deployment details check for rollout strategy

Now we're back at v1, we can see what happens with a slower rollout strategy:

- [update-slow\deployment.yaml](.\specs\vweb\update-slow\deployment.yaml) - updates the image to v2, still with maxUnavailable of 0 so no Pods get replaced until new ones are ready; now maxSurge is set to 1 so only one new Pod is created at a time

Apply the new update:

```
kubectl apply -f labs\rollouts\specs\vweb\update-slow
```


📋 How is this rollout different? Are both versions running concurrently for a longer or shorter period?

<details>
  <summary>Not sure?</summary>

> Updates 1 Pod at a time, still multiple concurrent versions


</details><br/>


## Big-bang rollouts

Recreate strategy - only one version live, need to rollback if any issues:


kubectl apply -f labs\rollouts\specs\vweb\update-broken

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

kubectl apply -f labs\rollouts\specs\nginx-daemonset

kubectl apply -f labs\rollouts\specs\nginx-daemonset\update-ondelete

> Nothing happens

kubectl delete po -l app=nginx

> Now the new Pod starts

 - statefulset

kubectl delete ds  nginx

kubectl apply -f labs\rollouts\specs\nginx-statefulset

> 3 pods, nginx-0 nginx-1 and nginx-2

kubectl apply -f labs\rollouts\specs\nginx-statefulset\update-partition

> Only nginx-2 replaced


## Lab

Blue-green deployments in Helm; fix chart to allow upgrade by setting activeSlot=blue or activeSlot=green; upgrade blue to v3 with automatic rollback if it doesn't complete successfully in 30 sec

## Cleanup


helm uninstall vweb

kubectl delete ds,statefulset,deploy,svc -l kubernetes.courselabs.co=rollouts
