
## Publishing the configurable app

```
kubectl apply -f labs/ingress/solution/ingress
```

```
./labs/ingress/add-to-hosts.ps1 configurable.local

./labs/ingress/add-to-hosts.sh configurable.local
```

> https://configurable.local:8040

But check the cert - it's the default cert from the ingress controller. Why?

```
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail 100 | grep Error
```

The controller expects to find the Secret in the same namespace as the Ingress object. How would you fix that?

## Using standard HTTP and HTTPS ports

```
kubectl apply -f labs/ingress/solution/controller

kubectl get svc -n ingress-nginx
```

- https://configurable.local
- http://configurable.local
- http://pi.local
- http://localhost

## Why can't you do this with a cluster that doesn't support LoadBalancer Services and only NodePort?

NodePorts are restricted to the unprivileged port range - 30000+. You can't have a NodePort listen on 80 or 443.