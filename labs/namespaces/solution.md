# Lab Solution


```
kubectl apply -f labs/namespaces/solution/

kubectl get svc -n front-end 
```

> Browse to http://localhost:8040/pi?dp=40000 - the response will take a couple of seconds

Confirm the cache is being used:

```
kubectl exec -n front-end deploy/pi-proxy -- ls /tmp
```

> Refresh the web app and your response will be instant