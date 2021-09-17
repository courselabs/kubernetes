## Reference

- [NetworkPolicy spec](https://v1-18.docs.kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#networkpolicy-v1-networking-k8s-io)
- [Network plugins (CNI)](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/)
- [Common NetworkPolicy recipes](https://github.com/ahmetb/kubernetes-network-policy-recipes)
- [Create a k3d cluster with Calico CNI](https://k3d.io/usage/guides/calico/)


## Deploy app


k apply -f labs\network-policy\specs\apod

> Wait for Pods to be ready, browse to http://localhost:30816, all works

Apply deny-all policy:

```
k apply -f labs\network-policy\specs\deny-all
```

> Refresh http://localhost:30816, still works


## Try on a new cluster with NetworkPolicy support

```
k3d cluster create lab-calico --k3s-server-arg '--flannel-backend=none'  -p "30800-30900:30800-30900@server[0]"
```

k get nodes


> NotReady

k apply -f labs\network-policy\specs\k3d

kubectl get pods -n kube-system --watch

> Calico Pods

k get nodes

> Ready

k apply -f labs\network-policy\specs\apod

> Wait for Pods to be ready, browse to http://localhost:30816, all works

Apply deny-all policy:

```
k apply -f labs\network-policy\specs\deny-all
```

> Refresh http://localhost:30816, times out
 
```
# fails - bad address 
k exec deploy/apod-web -- wget -O- http://apod-api/image
```

To be sure, get the IP address and try:

```
k get po -l app=apod-api -o wide

k exec deploy/apod-web -- wget -O- http://<pod-ip-address>/image
```

## Deploy app policies

- allow dns
- ingress to apis
- egress from web

k apply -f labs\network-policy\specs\apod\network-policies

k exec deploy/apod-web -- wget -O- http://apod-api/image

> Refresh http://localhost:30816, OK

## Lab

Policies only use Pod selectors; malicious with access to other namespaces could gain access:

k apply -f labs\network-policy\specs\apod-hack

k exec sleep -- wget -O- http://apod-api/image

- change app to use `apod` namespace
- change policies to restrict to `apod` ns

(delete existing APOD app to clear down)