
```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

helm repo update
```

```
helm search repo ingress-nginx --versions

helm show values ingress-nginx/ingress-nginx --version 4.0.1
```

```
helm install -n ingress --create-namespace -f labs\helm\ingress-nginx\dev.yaml ingress-nginx ingress-nginx/ingress-nginx --version 4.0.1

# output docs include sample Ingress spec

helm ls

helm ls -A
```

```
k get ns

k get svc -n ingress
```

> http://localhost:30080

That's a lot of work to see a 404...