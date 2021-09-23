

## Reference

- Kubeadm
- K3d
- [Taints and tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)


## Create a multi-node cluster


```
k3d cluster create lab-clusters --servers 1 --agents 2 --no-lb -p "30700-30799:30700-30799@server[0]"
```

If using Docker, check the node containers:

```
docker container ls
```

k get nodes

k get nodes -o wide

k get nodes --show-labels

> OS & CPU arch


## Taints and tolerations

- whoami with 4 replicas, on each node

k apply -f labs\clusters\specs\whoami

k get po -o wide -l app=whoami

kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints --no-headers 

kubectl taint nodes k3d-lab-clusters-agent-1 disk=hdd:NoSchedule

> Pods still running 

kubectl taint nodes k3d-lab-clusters-server-0 workload=system:NoExecute

> Pods evicted, recreated agent 1 & 0 

k rollout restart deploy whoami

> New pods, no toleration all on agent 0

k get po -o wide -l app=whoami

k apply -f labs\clusters\specs\whoami\update

> Spread on agents 0 and 1, not server

## Scheduling

DaemonSet with Linux node selector:

k apply -f labs\clusters\specs\ingress-controller 

> 2 nodes, agents - toleration for taint

k get po -n ingress-nginx -o wide -l app.kubernetes.io/name=ingress-nginx

For control plane only:


k apply -f labs\clusters\specs\ingress-controller/update

k get po -n ingress-nginx -o wide -l app.kubernetes.io/name=ingress-nginx

## Adding & removing nodes

k3d node stop k3d-lab-clusters-agent-1

k get nodes --watch

> Node stops straigt away, takes 30+ sec for Kubernetes to notice; status -> NotReady

k get po -o wide -A

> Pods replaced; old stay as Terminating - node not there to confirm removal
k delete node k3d-lab-clusters-agent-1

k get nodes


k3d node create -c lab-clusters new-node

k get nodes --watch

> Joins, NotReady -> Ready; no Pods

k3d node stop k3d-lab-clusters-server-0

k get nodes 

> Timeout, no API server; control plane LB in prod

k3d node start k3d-lab-clusters-server-0

## Lab 

Maintenance - remove pods and flag node for no more pods, add node back in and rebalance whoami pods


