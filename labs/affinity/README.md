
## Reference

- [Standard node labels & taints](https://kubernetes.io/docs/reference/labels-annotations-taints/)

## Node affinity

Create a multi-node cluster:

```
k3d cluster create lab-affinity --servers 1 --agents 2 --no-lb -p "30780-30799:30780-30799@server[0]" --k3s-agent-arg '--kubelet-arg=max-pods=5' --k3s-server-arg --disable=servicelb --k3s-server-arg --disable=traefik


k get nodes

k describe node k3d-lab-affinity-agent-1
```

> Capacity _pods: 5_

k apply -f labs\affinity\specs\whoami

> Cannot express node is not control plane with nodeselector

> Worker nodes with CIS compliance

k apply -f labs\affinity\specs\whoami\update-compliance-required

> All Pods pending

Label a node with CIS compliance:

```
k label node k3d-lab-affinity-agent-1 cis-compliance=verified
```

> 5 Pods created on -1, one pending - not enough capacity on node



k get pods -l app=whoami -o wide


k delete svc,deploy -l kubernetes.courselabs.co=affinity


## Pod affinity 



## Pod anti-affinity

## EXTRA Node affinity for multi-arch

## Lab

- node affinity, preferred with weight

## Cleanup

k3d cluster delete lab-affinity