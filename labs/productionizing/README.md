#

## Self-healing apps with container probes

```
kubectl apply -f labs/productionizing/specs/whoami
```

TODO - curl.ps1, remove-alias

```
curl http://localhost:8010

curl --data '503' http://localhost:8010/health

curl -i http://localhost:8010
```

> Repeat and you'll get some OK responses and some 503s - the Pod with the broken app doesn't fix itself


```
kubectl apply -f labs/productionizing/specs/whoami/update

kubectl wait --for=condition=Ready pod -l app=whoami,update=readiness

kubectl describe pod -l app=whoami
```

> Readiness:      http-get http://:80/health delay=0s timeout=1s period=5s #success=1 #failure=3

```
curl --data '503' http://localhost:8010/health

kubectl get po -l app=whoami --watch
```

> One Pod changes the Ready column - now 0/1 containers are ready

```
# Ctrl-C 

kubectl get endpoints whoami-np

curl http://localhost:8010
```

> Only the healthy Pod is in enlisted in the Services, so you will always get an OK response

Readiness probes isolate failed Pods from the Service load balancer, but they don't take action to repair the app. For that you can use a liveness probe, which will restart the Pod with a new container if the probe fails:

- []()


```
kubectl apply -f labs/productionizing/specs/whoami/update2

kubectl wait --for=condition=Ready pod -l app=whoami,update=liveness
```

```
curl --data '503' http://localhost:8010/health

kubectl get po -l app=whoami --watch
```

> One Pod will become ready 0/1 -then it will restart, and then become ready again 

```
# Ctrl-C 

kubectl get endpoints whoami-np
```

> Both Pod IPs are in the Service list - when the restarted Pod passed the readiness check it was added  

Other types of probe TCP and exec:

- []()

```
kubectl apply -f labs/productionizing/specs/products-db

kubectl describe po -l app=products-db
```

> Liveness and readiness have `#success` and `#failure` - but these are thresholds in the spec, not the status of the probes

Sucessful probe results are not shown in Kubectl, even as events in `describe` because they would flood the database.

## Autoscaling compute-intensive workloads

[metrics-server](https://github.com/kubernetes-sigs/metrics-server)

```
kubectl top nodes
```

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

## Pod security 

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

## Lab

Adding production concerns is often something you'll do after you've done the initial modelling and got your app running. 

So your task is to add container probes and security settings to the whoami app (that app isn't compute intensive, so we don't need an HPA).

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

## Cleanup

When you're done **after you've tried the lab**, you can remove all the objects:

```
kubectl delete all,hpa -l co.courselabs.k8sfun=productionizing
```