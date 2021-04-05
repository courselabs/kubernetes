# Scaling and Managing Pods with Deployments

You don't often create Pods directly because that isn't flexible - you can't update Pods to release application updates, and you can only scale them by manually deploying new Pods.

Instead you'll use a [controller]() - a Kubernetes object which manages other objects. The controller you'll use most for Pods is the [Deployment](), which has features to support upgrades and scale.

Deployments use a template to create Pods, and a label selector to identify the Pods they own.

## Deployment YAML

Deployments definitions have the usual metadata. 

The spec is more interesting - it includes a label selector but also a Pod spec. The Pod spec is the same format you would use to define a Pod in YAML, except you don't include a name.

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami
spec:
  selector:
    matchLabels:
      app: whoami
  template:
    metadata:
      labels:
        app: whoami
    spec:
      containers:
        - name: app
          image: sixeyed/whoami:21.04.01
```

The labels in the Pod metadata must include the labels in the selector for the Deployment, or you'll get an error when you try to apply the YAML.

* `spec.selector`- list of labels to find Pods
* `spec.template` - the template to use to create Pods
* `spec.template.metadata` - metadata for the Pods - no `name` field
* `spec.template.metadata.labels` - labels to apply to Pods, must include those in the selector
* `spec.template.spec` - full Pod spec

## Create a Deployment for the whoami app

Delete Pods from the previous lab:

```
kubectl delete pods -l app=whoami

kubectl get pods -l app=whoami

kubectl apply -f labs/deployments/specs/deployments/whoami-v1.yaml

kubectl get pods -l app=whoami 
```

> Deployments apply their own naming system when they create Pods, they end with a random string

Deployments are first-class objects, you work with them in Kubectl in the usual way:

```
kubectl get deployments

kubectl get deployments -o wide

kubectl describe deploy whoami
```

> The events talk about another object called a [ReplicaSet]() - we'll get to that soon

## Scaling Deployments

The Deployment knows how to create Pods from the template in the spec. You can create as many replicas - copies of the same Pod spec - as your cluster can handle.

You can scale **imperatively** with Kubectl:

```
kubectl scale deploy whoami --replicas 3

kubectl get pods -l app=whoami
```

But now your running Deployment object is different from the spec you have in source control. This is bad. Source control should be the true description of the application - in a production environment all your deployments will be automated from the YAML in source control and any changes someone makes manually with Kubectl will get overwritten.

So it's better to make the changes **declaratively in YAML** - [whoami-v1-scale.yaml](deployments/specs/deployments/whoami-v1-scale.yaml) sets a replica level of 2:

```
kubectl apply -f labs/deployments/specs/deployments/whoami-v1-scale.yaml

kubectl get pods -l app=whoami
```

> The Deployment removes one Pod, because the current state does not match the desired state in the YAML

## Working with managed Pods

Because Pod names are random, you'll manage them in Kubectl using labels. We've done that with `get`, and it works for `logs` too:

```
kubectl logs -l app=whoami 
```

And if you need to run commands in the Pod, you can use exec at the Deployment level:

```
kubectl exec deploy/whoami -- hostname
```

> Still no shell in the container image :)

The Pod spec in the Deployment template applies the app=whoami label:

```
kubectl get pods -o wide --show-labels -l app=whoami
```

The label selector in your Service matches that label:

```
# apply the LoadBalancer and NodePort Services:
kubectl apply -f labs/services/specs/services/whoami-nodeport.yaml -f labs/services/specs/services/whoami-loadbalancer.yaml

kubectl get endpoints whoami-np whoami-lb
```

So you can still access the app from your machine:

```
# either
curl http://<load-balancer-ip>:8080

# e.g. on Docker Desktop:
curl http://localhost:8080

# or
curl http://<node-ip>:30010

# e.g. on Kind:
curl http://localhost:30010
```

## Updating the application

Application updates usually mean a change to the Pod spec - a new container image, or a configuraion change. You can't change the spec of a running Pod, but you can change the Pod spec in a Deployment. It makes the change by starting up new Pods and terminating the old ones.

[]() changes a configuration setting for the app. It's an environment variable setting, but those are fixed for the life of a Pod container, so this change means new Pods.

```
# open a new terminal to monitor the Pods:
kubectl get po -l app=whoami --watch

# apply the change:
kubectl apply -f labs/deployments/specs/deployments/whoami-v2.yaml
```

Try the app again - you'll see a smaller output and if you repeat your requests are load-balanced:

```
# either
curl http://<load-balancer-ip>:8080

# or
curl http://<node-ip>:30010
```

Deployments store previous specifications in the Kubernetes database, and you can easily rollback if your release is broken:

```
kubectl rollout history deploy/whoami

kubectl rollout undo deploy/whoami

kubectl get po -l app=whoami
```

> Try the app again and you'll see we're back to the full output

## Understanding ReplicaSets

Did you notice a pattern in the Pod names in the last exercise? When you rolled back your update, you might have seen that the new Pods had the same prefix as the previous set of Pods.

Deployments create the Pod names but they're not totally random - the pattern is [deployment-name]-[template-hash]-[random-suffix]. You can update a Deployment spec without changing the Pod spec (e.g. to set replicas) and that doesn't cause Pod replacement.

When you change the Pod spec in the template, that does mean new Pods - and the Deployment delegates responsibility for creating Pods to ReplicaSets:

```
kubectl get replicaset
```

> The name is the Deployment name plus the template hash

Deployments manage updates by creating ReplicaSets and managing the number of desired Pods for the ReplicaSet. Replaced specs are scaled down to 0, but if a new upate matches an old spec, the original ReplicaSet gets re-used.

```
# in a new terminal:
kubectl get rs --watch

kubectl apply -f labs/deployments/specs/deployments/whoami-v2.yaml
```

> You'll see a **rolling update** - the new ReplicaSet is scaled up incrementally, while the old one is scaled down

## Lab

Rolling updates aren't always what you want - they mean the old and new versions of your app are running at the same time, both processing requests.

You may want a blue-green deployment instead, where you have both versions running but only one is receiving traffic.

Use Deployments and Services to create a blue-green update for the whoami app. You'll need two replicas running for v1 and two for v2, but only v2 should receive traffic. Your update should switch traffic to the v2 Pods without any changes to Deployments.

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

