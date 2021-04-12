# Preparing for Production

It's straightforward to model your apps in Kubernetes and get them running, but there's more work to do before you get to production.

Kubernetes can fix apps which have temporary failures, automatically scale up apps which are under load and add security controls around containers.

These are the things you'll add to your application models to get ready for production.

## Self-healing apps with readiness probes

We know Kubernetes restarts Pods when the container exits, but the app inside the container could stop responding and Kubernetes won't know.

The whoami app has a nice feature we can use to trigger a failure:

```
kubectl apply -f labs/productionizing/specs/whoami
```

The app is running in two Pods - make a POST command and one of them will switch to a failed state:

```
# if you're on Windows, run this to use the correct curl:
. ./scripts/windows-tools.ps1

curl http://localhost:8010

curl --data '503' http://localhost:8010/health

curl -i http://localhost:8010
```

> Repeat and you'll get some OK responses and some 503s - the Pod with the broken app doesn't fix itself

You can tell Kubernetes how to test your app is healthy with [container probes](). You define the action for the probe, and Kubernetes runs it repeatedly to make sure the app is healthy:

- [deployment-with-readiness.yaml](specs/whoami/update/deployment-with-readiness.yaml) - adds a readiness probe, which makes an HTTP call to the /health endpoint of the app every 5 seconds

Deploy the update and check the new Pods:

```
kubectl apply -f labs/productionizing/specs/whoami/update

kubectl wait --for=condition=Ready pod -l app=whoami,update=readiness

kubectl describe pod -l app=whoami
```

> You'll see the readiness check listed in the output

These are new Pods so the app is healthy in both; trip one Pod into the unhealthy state and you'll see the status change:

```
curl --data '503' http://localhost:8010/health

kubectl get po -l app=whoami --watch
```

> One Pod changes the Ready column - now 0/1 containers are ready

If a readiness check fails, the Pod is removed from the Service and it won't receive any traffic:

```
# Ctrl-C to exit the watch

kubectl get endpoints whoami-np

curl http://localhost:8010
```

> Only the healthy Pod is in enlisted in the Service, so you will always get an OK response.

If this was a real app the 503 could be happening if the app is overloaded. Removing it from the Service could give it time to fix itself.

## Self-repairing apps with liveness probes

Readiness probes isolate failed Pods from the Service load balancer, but they don't take action to repair the app. 

For that you can use a [liveness probe]() which will restart the Pod with a new container if the probe fails:

- [deployment-with-liveness.yaml](specs/whoami/update2/deployment-with-liveness.yaml) - adds a liveness check which uses the same test as the readiness probe

You'll often have the same tests for readiness and liveness, but the liveness check has more significant consequences, so you'll want it to run less frequently and have a higher failure threshold.

```
kubectl apply -f labs/productionizing/specs/whoami/update2

kubectl wait --for=condition=Ready pod -l app=whoami,update=liveness
```

Now when you cause one of the new Pods to fail, it will be restarted:

```
curl --data '503' http://localhost:8010/health

kubectl get po -l app=whoami --watch
```

> One Pod will become ready 0/1 -then it will restart, and then become ready 1/1 again 

```
# Ctrl-C 

kubectl get endpoints whoami-np
```

> Both Pod IPs are in the Service list - when the restarted Pod passed the readiness check it was added  

Other types of probe exist, so this isn't just for HTTP apps. This Postgres Pod uses a TCP probe and a command probe:

- [products-db.yaml](specs/products-db/products-db.yaml) - has a readiness probe to test Postgres is listening and a liveness probe to test the database is usable

```
kubectl apply -f labs/productionizing/specs/products-db

kubectl describe po -l app=products-db
```

> Liveness and readiness show `#success` and `#failure` numbers - but these are thresholds in the spec, not the status of the probes

Sucessful probe results are not shown in Kubectl, even as events in `describe` because they would flood the database and logs.

You won't easily be able to trigger a failure in this one, but if there is a problem with Postgres, Kubernetes will take care of it.

## Autoscaling compute-intensive workloads



```
kubectl top nodes
```

[metrics-server](https://github.com/kubernetes-sigs/metrics-server)
> 

```
# if you see "error: Metrics API not available"

kubectl apply -f labs/productionizing/specs/metrics-server

kubectl top nodes
```

```
kubectl apply -f labs/productionizing/specs/pi
```

> Browse to http://localhost:8020/pi?dp=100000

```
kubectl top pod -l app=pi-web 
```

> Takes a moment to catch up, but you'll see it peak at 250m - that Pod is maxed

- []() HPA

```
kubectl apply -f labs/productionizing/specs/pi/update

kubectl get hpa pi-cpu --watch
```

> Open 2 of browser tabs pointing to localhost:8020/pi?dp=100000; that's enough work to max out the Pod and trigger the HPA

The HPA will start more Pods. After a while the workload falls so the average CPU across Pods is below the threshold and then the HPA scales down.

Here's my output after watching for a few minutes:

```
NAME     REFERENCE           TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
pi-cpu   Deployment/pi-web   0%/75%    1         5         1          2m52s
pi-cpu   Deployment/pi-web   198%/75%   1         5         1          4m2s
pi-cpu   Deployment/pi-web   66%/75%    1         5         3          5m2s
pi-cpu   Deployment/pi-web   0%/75%     1         5         3          6m2s
pi-cpu   Deployment/pi-web   0%/75%     1         5         3          10m
pi-cpu   Deployment/pi-web   0%/75%     1         5         1          11m
```

___
## **EXTRA** Pod security 

<details>
  <summary>Restricting what Pod containers can do</summary>

Container resource limits are necessary for HPAs, but you should have them in all your Pod specs because they provide a layer of security. Applying CPU and memory limits protects the nodes, and means workloads can't max out resources and starve other Pods.

Security is a very large topic in containers, but there are a few features you should aim to include in all your specs:

- changing the user to ensure the container process doesn't run as `root`
- don't mount the Service Account API token unless your app needs it
- add a [Security Context]() to limit the OS capabilities the app can use

Kubernetes doesn't apply these by default, because they can cause breaking changes in your app.

```
kubectl exec deploy/pi-web -- whoami

kubectl exec deploy/pi-web -- cat /var/run/secrets/kubernetes.io/serviceaccount/token

kubectl exec deploy/pi-web -- chown root:root /app/Pi.Web.dll
```

- []() - alternative version which adds security details


```
kubectl apply -f labs/productionizing/specs/pi-secure/

kubectl get pod -l app=pi-secure-web --watch
```

> The spec is more secure, but the app fails. Check the logs and you'll see it doesn't have permission to listen on the port.

Port 80 is privileged inside the container; this is a .NET app which can be configured to listen on a different port:

- []()

```
kubectl apply -f labs/productionizing/specs/pi-secure/update

kubectl wait --for=condition=Ready pod -l app=pi-secure-web,update=ports
```

The Pod container is running, so the app is listening, and now it's more secure:

```
kubectl exec deploy/pi-secure-web -- whoami

kubectl exec deploy/pi-secure-web -- cat /var/run/secrets/kubernetes.io/serviceaccount/token

kubectl exec deploy/pi-secure-web -- chown root:root /app/Pi.Web.dll
```

This is not the end of security. Securing containers is a multi-layered approach which starts with your securing your images, but this is a good step up in the default Pod security.

</details>

___
## Lab

Adding production concerns is often something you'll do after you've done the initial modelling and got your app running. 

So your task is to add container probes and security settings to the whoami app (that app isn't compute intensive, so we don't need an HPA).

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

## Cleanup

When you're done **after you've tried the lab**, you can remove all the objects:

```
kubectl delete all,hpa -l co.courselabs.k8sfun=productionizing
```