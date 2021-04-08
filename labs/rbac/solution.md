# Lab Solution


## Kube-explorer RBAC

```
kubectl auth can-i get serviceaccounts -n default --as system:serviceaccount:default:kube-explorer
```

- [](labs/rbac/solution/service-account-viewer.yaml)

```
kubectl apply -f labs/rbac/solution/service-account-viewer.yaml

kubectl auth can-i get serviceaccounts -n default --as system:serviceaccount:default:kube-explorer
```

## Securing the sleep Deployment

```
kubectl exec deploy/sleep -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
```

- [](labs/rbac/solution/sleep-without-sa-token.yaml)


```
kubectl apply -f labs/rbac/solution/sleep-without-sa-token.yaml

kubectl wait --for=condition=Ready pod -l app=sleep,sa-token=none

kubectl exec deploy/sleep -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
```

```
kubectl get pod -l app=sleep,sa-token=none -o jsonpath='{.items[0].spec.serviceAccountName}'

kubectl describe pod -l app=sleep,sa-token=none
```