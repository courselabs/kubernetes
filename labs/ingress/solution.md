
## Publishing the configurable app

Ingress objects reference Services in the local namespace, so you need to create your Ingress in the same namespace as the app:

- [configurable-https.yaml](solution/ingress/configurable-https.yaml) 

```
kubectl apply -f labs/ingress/solution/ingress
```

It's a new domain so you need to add it to your hosts file:

```
./labs/ingress/add-to-hosts.ps1 configurable.local 127.0.0.1

./labs/ingress/add-to-hosts.sh configurable.local 127.0.01
```

> Now you can browse to https://configurable.local:8040

But check the cert - it's the default cert from the ingress controller. Why?

The logs will tell you:

```
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail 100 | grep Error
```

The controller expects to find the Secret in the same namespace as the Ingress object. 

## Using standard HTTP and HTTPS ports

For this all you need to do is change the public ports for the ingress controller LoadBalancer Service:

- [controller/service-lb.yaml](solution/controller/service-lb.yaml)
```
kubectl apply -f labs/ingress/solution/controller

kubectl get svc -n ingress-nginx
```
Now you can use normal URLs:

- https://configurable.local
- http://configurable.local
- http://pi.local
- http://localhost

## Why can't you do this with a cluster that doesn't support LoadBalancer Services?

NodePorts are restricted to the unprivileged port range - 30000+. You can't have a NodePort listen on 80 or 443.