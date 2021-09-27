
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

k get pods -l app=whoami -o wide

> Cannot express node is not control plane with nodeselector, pods on all nodes

> Worker nodes with CIS compliance

k apply -f labs\affinity\specs\whoami\compliance-required

k get rs -l app=whoami --watch

> Old RS scaled down to one (maxUnavailable); 3 new pods all pending (maxSurge), deployment keeps old pods running, new never come online

Label a node with CIS compliance:

```
k label node k3d-lab-affinity-agent-1 cis-compliance=verified

k get rs -l app=whoami --watch
```

> New RS goes to desired 6 - 5 Pods created on agent -1, one pending - not enough capacity on node but old RS scales to 0(maxunavailable is 1)


k get pods -l app=whoami -o wide

 Remove the label - Pods are not rescheduled:

k label node k3d-lab-affinity-agent-1 cis-compliance-

k get rs -l app=whoami



## Node topology

node topology 

k get nodes -L kubernetes.io/hostname

> Lowest level of topology - every node is different

Clusters usually add more labels to represent geography of the nodes:

k label node --all topology.kubernetes.io/region=lab

k label node k3d-lab-affinity-agent-0 topology.kubernetes.io/zone=lab-a

k label node k3d-lab-affinity-agent-1 topology.kubernetes.io/zone=lab-b

## Pod affinity & anti-affinity

k delete deploy whoami 

k apply -f labs\affinity\specs\whoami\colocate-region

k get po -l app=whoami -o wide

> Pods on both nodes, all in same region

k delete deploy whoami 

# wait for pods to go

k apply -f labs\affinity\specs\whoami\spread-zone

k get po -l app=whoami -o wide

> One Pod on each node, others all pending


k apply -f labs\affinity\specs\whoami\prefer-spread-zone

k get po -l app=whoami -o wide

> all pods running, spread across worker nodes

## Lab

- only on worker nodes with cis compliance label 

- node affinity, preferred with weight - most on agent flagged with CIS compliance, some on agent flagged CIS requested

- can you fill node 1 and have the sixth pod on node 0?

k delete deploy whoami 

## EXTRA Node affinity for multi-arch

- beta labels and final
- AND and OR logic
- required and preferred

k apply -f labs\affinity\specs\multi-arch

k get po -o wide -l app=sleep

> On server and agents - no selection on role & all nodes are linux

## Cleanup

k delete svc,deploy -l kubernetes.courselabs.co=affinity

OR

k3d cluster delete lab-affinity

Reset to previous cluster, e.g.

kubectl config use-context docker-desktop