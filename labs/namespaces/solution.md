# Lab Solution

My solution creates a new namespace for Nginx to run in, and uses a FQDN in the Nginx config to proxy the Pi web app - and specifies the correct port:

- [solution/01-namespace.yaml](solution/01-namespace.yaml) - the `front-end` namespace
- [nginx-configMap.yaml](solution/nginx-configMap.yaml) - the configuration, using `http://pi-web-np.pi.svc.cluster.local:8030` as the `proxy_pass` setting
- [nginx-deployment.yaml](solution/nginx-deployment.yaml) - Deployment using the namespace and ConfigMap
- [nginx-services.yaml](solution/nginx-services.yaml) - Services using the new ports

Deploy the proxy, which uses the app in the existing `pi` namespace:

```
kubectl apply -f labs/namespaces/solution/

kubectl get svc -n front-end 
```

> Browse to (e.g.) http://localhost:8040/pi?dp=40000 - the response will take a couple of seconds

Confirm the cache is being used:

```
kubectl exec -n front-end deploy/pi-proxy -- ls /tmp
```

> Refresh the web app and your response will be instant