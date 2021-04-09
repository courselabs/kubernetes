
# Ingress

## Deploy an Ingress Controller

```
kubectl apply -f labs/ingress/spec/ingress-controller

kubectl get all -n ingress-nginx

```

> Browse to localhost:8000 / localhost:30000 - 404



## Publish a default app through ingress

```
kubectl apply -f labs/ingress/spec/nginx
```

And the ingress rule:

```
kubectl apply -f labs/ingress/spec/nginx/ingress

kubectl get ingress
```


> Browse to localhost:8000 / localhost:30000


## Publish an app to a specific host address

```
kubectl apply -f labs/ingress/spec/whoami

kubectl get ingress
```

```
.\labs\ingress\add-to-hosts.ps1 whoami.local

./labs/ingress/add-to-hosts.sh whoami.local
```

> Browse to whoami.local:8000 / whoami.local:30000; refresh to see load-balancing

## Use ingress with response caching

- pi

## Create a TLS cert for HTTPS access




## Expose apps through HTTPS

## Lab

- configurable

## Cleanup

When you're done **after you've tried the lab**, you can remove all the objects:

```
kubectl delete all,secret,ingress,ns -l co.courselabs.k8s=ingress
```