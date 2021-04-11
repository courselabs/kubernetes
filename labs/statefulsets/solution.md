
```
kubectl apply -f labs/statefulsets/solution
```

```
k get po -l app=nginx-statefulset --watch

k get pvc -l app=nginx-statefulset
```

```
curl -v localhost:8040
```

> Repeat and you'll see `X-Cache: HIT` in the response headers

```
k exec nginx-statefulset-0 -- ls /cache

k exec nginx-statefulset-1 -- ls /cache
```