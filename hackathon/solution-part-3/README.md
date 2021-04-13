
Delete the previous database:

```
kubectl delete deploy products-db

kubectl delete svc products-db

kubectl delete pvc -l app=products-db
```

```
kubectl apply -f hackathon/solution-part-3/configMaps/ -f hackathon/solution-part-3/secrets/ -f hackathon/solution-part-3/statefulsets/  -f hackathon/solution-part-3/deployments/ -f hackathon/solution-part-3/services/
```

Restart Pods with changed config:

```
kubectl rollout restart deploy/products-api deploy/stock-api
```

Cleanup:

