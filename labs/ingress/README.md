
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
./labs/ingress/add-to-hosts.ps1 whoami.local

./labs/ingress/add-to-hosts.sh whoami.local
```

> Browse to whoami.local:8000 / whoami.local:30000; refresh to see load-balancing

## Use ingress with response caching

- pi

```
kubectl apply -f labs/ingress/spec/pi

kubectl get ingress

kubectl get po -l app=pi-web
```

```
./labs/ingress/add-to-hosts.ps1 pi.local

./labs/ingress/add-to-hosts.sh pi.local
```

> Browse to http://pi.local:8000/pi?dp=25000 / http://pi.local:30000/pi?dp=25000; refresh to see no caching $ lb


```
kubectl apply -f labs/ingress/spec/pi/update
```
> Browse to http://pi.local:8000/pi?dp=25000 / http://pi.local:30000/pi?dp=25000; refresh to see cache - same dp from cache for 10m

## Create a TLS cert for HTTPS access

The ingress controller supports HTTPS - Nginx is already running with a TLS certificate:

> https://whoami.local:8040 or https://whoami.local:30040

You'll see an error because this is a self-signed certificate. You can check the cert details in your browser and you'll see something like this:

![](/img/ingress-controller-cert.png)

```
kubectl apply -f labs/ingress/spec/tls

kubectl wait --for=condition=Ready pod tls-cert-generator

kubectl logs tls-cert-generator
```

[script](https://github.com/sixeyed/kiamol/blob/master/ch15/docker-images/cert-generator/start.sh)

```
kubectl cp tls-cert-generator:/certs/server-cert.pem tls.crt
kubectl cp tls-cert-generator:/certs/server-key.pem tls.key
```

```
kubectl create secret tls https-local --key=tls.key --cert=tls.crt

kubectl label secret https-local co.courselabs.k8sfun=ingress

kubectl describe secret https-local
```



## Expose apps through HTTPS


```
kubectl apply -f labs/ingress/spec/tls/ingress

kubectl get ingress
```

- https://pi.local:8040/
- https://whoami.local:8040


Ingress also redirects HTTP requests to HTTP **but it only uses the default port, 443**:

```
curl -v http://pi.local:8040/
```

> We're using a non-standard port for HTTPS, so the redirect won't work. In a real cluster the Service for the Ingress controller would listen on ports 80 and 443.

## Lab


- configurable

```
kubectl apply -f labs/ingress/spec/configurable
```

- standard ports (lb)

## Cleanup

When you're done **after you've tried the lab**, you can remove all the objects:

```
kubectl delete all,secret,ingress,ns -l co.courselabs.k8s=ingress
```