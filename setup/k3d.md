
[Install k3d](https://k3d.io/#installation)

```
k3d cluster create kube-fundamentals -p "30000-30030:30000-30030@server[0]"

kubectl config use-context k3d-kube-fundamentals
```