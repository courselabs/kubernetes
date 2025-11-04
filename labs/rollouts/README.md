# Updates with Staged Rollouts

> 🎯 **CKAD Exam Relevance**: Deployment strategies are a core topic in the "Application Deployment" domain (20% of exam). You must understand rolling updates, blue/green deployments, and canary deployments.

Pod controllers manage Pods for you - when you update the Pod spec the controller rolls out the change by removing old Pods and creating new ones. You'll do this all the time - every OS patch, library update and new feature will be an update. Depending on your app, config changes might need a rollout too.

You can configure the controller to tweak how the rollout happens - you might choose a slow but safe update for a critical component. Deployment objects are the typical Pod controller, but all the controllers have rollout options.

## Deployment Strategies Overview

CKAD requires understanding of three main deployment strategies:

| Strategy | Description | Risk Level | Downtime | Resource Usage |
|----------|-------------|------------|----------|----------------|
| **Rolling Update** | Gradually replace old pods with new ones | Low | None | Medium (extra pods during rollout) |
| **Blue/Green** | Run two complete environments, switch traffic | Very Low | None | High (2x resources) |
| **Canary** | Roll out to small subset first, then full | Low | None | Medium (extra pods for canary) |
| **Recreate** | Delete all old pods, then create new | High | Yes | Low (no extra resources) |

## Reference 

- [Rollouts for Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment)
- [Blue/green deployments in Kubernetes](https://kubernetes.io/blog/2018/04/30/zero-downtime-deployment-kubernetes-jenkins/#blue-green-deployment)
- [Helm upgrade command](https://helm.sh/docs/helm/helm_upgrade/)

## Fast staged rollouts

We'll start with a simple web application:

- [vweb/deployment.yaml](./specs/vweb/deployment.yaml) - defines a Deployment with 3 replicas of the v1 application image. There's also an init container set to sleep, so it takes a few seconds for Pods to start

Open a new terminal - split your screen if you can - and run a watch command to see Pods come online:

```
# there won't be any Pods to start with:
kubectl get po -l app=vweb --watch
```

📋 In your main terminal, deploy the app from the `labs/rollouts/specs/vweb` folder, and make an HTTP request to the `/v.txt` URL.

<details>
  <summary>Not sure how?</summary>

Create the resources:

```
kubectl apply -f labs/rollouts/specs/vweb
```

In the watch window you'll see the Pods start, the init container runs, then the Pod initializes and enters the running state

Check the Services and you'll see there's a NodePort listening on port 30018:

```
kubectl get svc 

curl localhost:30018/v.txt
```

</details><br/>

> The output from the app is just the text `v1`.

This update to the Deployment will cause a fast rollout to v2:

- [update-fast/deployment.yaml](./specs/vweb/update-fast/deployment.yaml) - `maxSurge` is set to 100% which means Kubernetes will create 3 new Pods straight away; `maxUnavailable` is set to 0 so no old Pods will be removed until new ones come online.

Deploy the update in your first terminal session, so you can see the changes in the watch session:

```
kubectl apply -f labs/rollouts/specs/vweb/update-fast
```

📋 What do you see in the terminal with the Pod watch? How does the change get made?

<details>
  <summary>Not sure?</summary>

3 new Pods are created straight away - a new ReplicaSet is created with the v2 spec and desired count of 3.

The three existing Pods remain until new Pods are ready, then they're terminated - the v1 ReplicaSet is gradually scaled down to 0.

You can see the update happening in the ReplicaSets:

```
kubectl get rs -l app=vweb
```

</details><br/>

You can try the app while the rollout is happening:

```
curl localhost:30018/v.txt
```

All the v1 and v2 Pods match the Service selector so you'll get load-balanced responses from both versions.

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

> The rollback uses the new custom rollout strategy, 3x v1 Pods come online, v2 Pods replaced when v1 Pods are running

Describe the Deployment and you'll see that the rolling update strategy hasn't changed. _A rollback reverts to the previous Pod spec_, not to the previous spec of the Deployment.

Now we're back at v1, we can see what happens with a slower rollout strategy:

- [update-slow/deployment.yaml](./specs/vweb/update-slow/deployment.yaml) - updates the image to v2, still with `maxUnavailable` of 0 so no Pods get replaced until new ones are ready; now `maxSurge` is set to 1 so only one new Pod is created at a time

Apply the new update:

```
kubectl apply -f labs/rollouts/specs/vweb/update-slow
```

📋 How is this rollout different? Are both versions running concurrently for a longer or shorter period?

<details>
  <summary>Not sure?</summary>

This rollout updates 1 Pod at a time - a v2 Pod is created, and a v1 Pod is removed when the v2 Pod comes online.

This is a much slower rollout, because Pods are replaced consecutively. Both app versions are running while the rollout happens, but for a much longer period.

</details><br/>


## Big-bang rollouts

Not all apps support running different versions during a rollout. In that case you can configure a big-bang update, where all Pods are replaced immediately instead of using a staged rollout.

- [update-broken/deployment.yaml](./specs/vweb/update-broken/deployment.yaml) - uses the `Recreate` update strategy, and removes the init container so there's no delay in the rollout

With this strategy the existing ReplicaSet will be scaled down to 0 and then a new ReplicaSet will be created with a desired scale of 3. This is not good if there's a problem with the new release - which there is with this app.

Deploy the update and check on the Pod status in your watch window:

```
kubectl apply -f labs/rollouts/specs/vweb/update-broken
```

📋 What happens with the new Pods? Is the app still available?

<details>
  <summary>Not sure?</summary>

All the existing Pods are terminated and then new ones are created.

There's a problem with those Pods - the image is broken because it has a bad startup command (you'll see that in the Pod logs).

The new Pods will never enter the running state, they'll go into CrashLoopBackOff after a while. 

With 0 Pods ready, there are no endpoints in the Service and the app is unavailable.

</details><br/>

Be careful using the Recreate strategy - a bad update will take your application offline:

```
curl localhost:30018/v.txt
```

**There is no automatic rollback in Kubernetes.** Updates need to be monitored and failed releases manually rolled back.

📋 Roll back to the previous release. Watch the Pod changes - how quickly does the app come back online?

<details>
  <summary>Not sure how?</summary>

Check the history and roll back to the previous version:

```
kubectl rollout history deploy/vweb

kubectl rollout undo deploy/vweb
```

All the failing Pods are terminated, and then the new Pods are started. They use the previous Pod spec so the app doesn't come online until the init containers have run.

</details><br/>

> The rollback doesn't change the update strategy, so the Deployment is still set to use Recreate.


## Blue/Green Deployments

Blue/green deployments minimize risk by running two complete environments side-by-side. Only one version (e.g., "blue") serves production traffic while the other (e.g., "green") is idle or being prepared. To deploy, you switch traffic from blue to green instantly.

### How Blue/Green Works

1. **Deploy green version** alongside existing blue version
2. **Test green version** thoroughly without affecting users
3. **Switch traffic** from blue to green by updating Service selector
4. **Keep blue running** as a rollback option
5. **Decommission blue** once green is stable

### CKAD Exercise: Blue/Green Deployment

Let's implement a blue/green deployment manually. First, create the blue deployment:

```
# Create the blue version:
kubectl apply -f labs/rollouts/specs/blue-green/
```

Check what was created:

```
kubectl get deploy,svc -l strategy=blue-green

kubectl get po -l app=vweb-bg
```

📋 Check which version is currently live by accessing the service.

<details>
  <summary>Not sure how?</summary>

```
# Get the service details:
kubectl get svc vweb-bg-svc

# Access the app (NodePort 30019):
curl localhost:30019/v.txt
```

The service selector is set to `version: blue` so you'll get responses from the blue deployment.

</details><br/>

Now let's deploy the green version without affecting users:

```
# Deploy green version:
kubectl apply -f labs/rollouts/specs/blue-green/green-deployment.yaml

# Verify both versions are running:
kubectl get deploy -l app=vweb-bg
kubectl get po -l app=vweb-bg
```

> Both blue and green Pods are running, but traffic still goes to blue.

Test the green version directly using Pod port-forwarding:

```
# Get a green pod name:
kubectl get po -l version=green

# Port-forward to test green directly:
kubectl port-forward <green-pod-name> 8081:80

# In another terminal:
curl localhost:8081/v.txt
```

📋 Switch production traffic to green by updating the Service selector.

<details>
  <summary>Not sure how?</summary>

```
# Patch the service to point to green:
kubectl patch service vweb-bg-svc -p '{"spec":{"selector":{"version":"green"}}}'

# Verify the switch:
curl localhost:30019/v.txt
```

Now all traffic goes to green! The blue deployment is still running as a rollback option.

</details><br/>

To rollback, simply switch the selector back:

```
# Rollback to blue:
kubectl patch service vweb-bg-svc -p '{"spec":{"selector":{"version":"blue"}}}'

# Verify:
curl localhost:30019/v.txt
```

**Blue/Green Benefits**:
- Instant switchover (just update Service selector)
- Easy rollback (switch back immediately)
- Full testing in production environment before going live

**Blue/Green Drawbacks**:
- Requires 2x resources (both versions running)
- Database migrations can be complex
- Not suitable for stateful applications without careful planning


## Canary Deployments

Canary deployments reduce risk by rolling out changes to a small subset of users first. If the canary version works well, gradually increase traffic to it. If issues arise, only a small percentage of users are affected.

### How Canary Works

1. **Deploy canary** with a small percentage of pods (e.g., 1 out of 5 = 20%)
2. **Monitor metrics** for errors, performance issues, etc.
3. **Gradually increase** canary pods while decreasing stable pods
4. **Complete rollout** when canary becomes 100%
5. **Rollback easily** by scaling canary to 0 if issues found

### CKAD Exercise: Canary Deployment

Let's implement a canary deployment using two Deployments with the same labels.

First, deploy the stable version with 4 replicas:

```
# Deploy stable version:
kubectl apply -f labs/rollouts/specs/canary/stable-deployment.yaml

# Check it's running:
kubectl get deploy vweb-canary-stable
kubectl get po -l app=vweb-canary

# Apply the service:
kubectl apply -f labs/rollouts/specs/canary/service.yaml
```

Test the stable version:

```
# All requests should show v1:
for i in {1..10}; do curl -s localhost:30020/v.txt; done
```

Now deploy the canary with just 1 replica (20% of traffic):

```
# Deploy canary version:
kubectl apply -f labs/rollouts/specs/canary/canary-deployment.yaml

# Check both deployments:
kubectl get deploy -l app=vweb-canary
kubectl get po -l app=vweb-canary
```

📋 Test the application multiple times. What percentage shows v2?

<details>
  <summary>Not sure?</summary>

```
# Make multiple requests:
for i in {1..20}; do curl -s localhost:30020/v.txt; done | sort | uniq -c
```

You should see approximately 80% v1 (stable) and 20% v2 (canary) responses, because traffic is load-balanced across all 5 pods (4 stable + 1 canary).

</details><br/>

### Canary Progression

If the canary is healthy, increase its percentage:

```
# Increase canary to 50% (3 canary, 3 stable):
kubectl scale deployment vweb-canary-canary --replicas=3
kubectl scale deployment vweb-canary-stable --replicas=3

# Test the distribution:
for i in {1..20}; do curl -s localhost:30020/v.txt; done | sort | uniq -c
```

📋 Complete the rollout to 100% canary.

<details>
  <summary>Not sure how?</summary>

```
# Scale canary up, stable down:
kubectl scale deployment vweb-canary-canary --replicas=4
kubectl scale deployment vweb-canary-stable --replicas=0

# Verify all traffic goes to v2:
for i in {1..10}; do curl -s localhost:30020/v.txt; done
```

Now you can delete the stable deployment since it's scaled to 0 and no longer needed.

</details><br/>

### Canary Rollback

If issues are detected during canary testing:

```
# Immediate rollback - scale canary to 0:
kubectl scale deployment vweb-canary-canary --replicas=0

# Scale stable back up if needed:
kubectl scale deployment vweb-canary-stable --replicas=4

# Verify all traffic is back to v1:
for i in {1..10}; do curl -s localhost:30020/v.txt; done
```

**Canary Benefits**:
- Minimal user impact (only small percentage exposed to issues)
- Gradual rollout allows monitoring at each stage
- Easy to rollback by scaling down canary

**Canary Drawbacks**:
- More complex than rolling updates
- Requires good monitoring/metrics to detect issues
- Load balancing must be traffic-based (not always equal distribution)


## Deployment Strategy Decision Matrix

Use this matrix to choose the right strategy for your CKAD scenarios:

| Choose... | When... | CKAD Example Scenario |
|-----------|---------|----------------------|
| **Rolling Update** | • Default choice for most apps<br>• App supports multiple versions running<br>• Moderate risk tolerance | "Update nginx deployment to version 1.21, ensuring zero downtime" |
| **Blue/Green** | • Zero downtime critical<br>• Need thorough pre-production testing<br>• Can afford 2x resources<br>• Easy instant rollback required | "Deploy new payment service version with ability to instantly revert" |
| **Canary** | • High-risk changes<br>• Want to limit user exposure<br>• Have good monitoring/metrics<br>• Gradual rollout preferred | "Deploy new search algorithm to 10% of users first" |
| **Recreate** | • App cannot run multiple versions<br>• Database schema changes required<br>• Downtime acceptable<br>• Minimal resources available | "Update legacy app with incompatible database schema" |

### Key CKAD Commands Summary

```
# Rolling update:
kubectl set image deployment/app app=app:v2
kubectl rollout status deployment/app
kubectl rollout undo deployment/app

# Blue/Green:
kubectl patch service app-svc -p '{"spec":{"selector":{"version":"green"}}}'

# Canary:
kubectl scale deployment app-canary --replicas=2
kubectl scale deployment app-stable --replicas=3

# Configure rollout strategy:
kubectl patch deployment app -p '{"spec":{"strategy":{"type":"RollingUpdate","rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'
```


## Lab

An alternative update strategy is a blue-green deployment, where you have two versions of your app running, but only one receives traffic. It's simple to do that with two Deployments and one Service - you change the label selector on the Service to switch between the blue and green releases.

This lab uses Helm for a blue-green update. Start by deploying the Helm chart for the simple web app:

```
helm install vweb labs/rollouts/helm/vweb
```

Browse to the app and refresh - you'll see it flickers between the blue and green releases. Hmm. The goal is to fix that so you can switch releases with a simple update like this:

```
helm upgrade --set activeSlot=green # etc. 
```

To make that work you'll need to fix the chart templates.

If you get that far, then you can experiment with automatic rollbacks - which Helm does support. 

When the green release is live, try updating the blue release to use the bad `kiamol/ch09-vweb:v3` image - using one Helm command which will rollback if the update isn't successful within 30 seconds.

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).
___

## Cleanup

Remove the Helm chart from the lab:

```
helm uninstall vweb
```

And all the other resources from the exercises:

```
kubectl delete ds,sts,deploy,svc -l kubernetes.courselabs.co=rollouts
```
___

## **EXTRA** Rollouts for other Pod controllers

<details>
  <summary>Update strategies for DaemonSets and StatefulSets</summary>

DaemonSets and StatefulSets also used staged rollouts, but they have different configuration options.

We'll use a new app for this. In a split terminal watch for Nginx Pods when they come online:

```
# there won't be any Pods to start with:
kubectl get po -l app=nginx --watch
```

DaemonSets are upgraded one node at a time, so by default Pods are taken down and replaced individually:

- [nginx-daemonset/1.18.yaml](./specs/nginx-daemonset/1.18.yaml) - runs a simple DaemonSet with no extra config

Create the DaemonSet with default update settings:

```
kubectl apply -f labs/rollouts/specs/nginx-daemonset
```

The [v1.20 update](./specs/nginx-daemonset/update-ondelete/1.20.yaml) bumps the image version and switches the update strategy to `OnDelete`:

```
kubectl apply -f labs/rollouts/specs/nginx-daemonset/update-ondelete
```

📋 What happens to the Nginx Pod? How can you trigger the update to start?

<details>
  <summary>Not sure?</summary>

Nothing happens, the original Pod is not replaced.

The update strategy means Pods won't be replaced until they're explicitly deleted:

```
kubectl delete po -l app=nginx
```

When the old Pod has terminated, the new one is created.

</details><br/>

> The OnDelete strategy lets you control when Pods are replaced, but still have the replacement rolled out automatically.

StatefulSets have another variation on update strategies. By default the Pods are replaced consecutively, starting from the last Pod in the set and working backwards to the first.

- [nginx-statefulset/1.18.yaml](./specs/nginx-statefulset/1.18.yaml) - runs a 3-Pod set with the older Nginx release

Remove the DaemonSet and create the StatefulSet. If your watch is still running you'll see the old Pod removed and three new Pods created:

```
kubectl delete ds  nginx

kubectl apply -f labs/rollouts/specs/nginx-statefulset
```

This is a StatefulSet, so the Pods have predictable names: `nginx-0`, `nginx-1` and `nginx-2`.

The [1.20 update](./specs/nginx-statefulset/update-partition/1.20.yaml) uses a partitioned update.

Deploy the update:

```
kubectl apply -f labs/rollouts/specs/nginx-statefulset/update-partition
```

📋 Which Pods get updated? How would you continue with a full rollout?

<details>
  <summary>Not sure?</summary>

The partitioned update stops the rollout at the specified Pod index - only Pod 2 gets replaced.

To continue the rollout you would need to update the partition in the YAML spec and deploy the change, or update the object directly with a patch:

```
# on macOS/Linux:
kubectl patch statefulset nginx -p '{"spec":{"updateStrategy":{"type":"RollingUpdate","rollingUpdate":{"partition":1}}}}'

# OR on Windows - you need to escape the quotes:
kubectl patch sts nginx -p '{""spec"":{""updateStrategy"":{""type"":""RollingUpdate"",""rollingUpdate"":{""partition"":1}}}}'

```

</details><br/>

