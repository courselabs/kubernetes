# Scheduling with Pod and Node Affinity

Affinity is a feature where you can request Pods to be scheduled in relation to other Pods or nodes - you might want to run multiple Pods in a Deployment and have them all running on different nodes, or you might have a web application where you want web Pods running on the same node as API Pods.

You add affinity rules to your Pod specification. They can be _required_ rules, which means they act as a constraint and if they can't be met then the Pod stays in the pending state. Or they can be _preferred_ rules, which means Kubernetes will try to meet them, but if it can't it will schedule the Pods anyway.

## Reference

- [Affinity and anti-affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity) - applying to nodes and Pods

- [Affinity API spec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#affinity-v1-core) - part of the Pod spec

- [Standard node labels & taints](https://kubernetes.io/docs/reference/labels-annotations-taints/) - which you can use for node affinity

## Node affinity

We'll use a multi-node cluster so we can see how Pods get placed. [k3d](https://k3d.io) is a great tool for that.

- Install k3d from the install instructions https://k3d.io/v5.0.0/#installation **OR**

The simple way, if you have a package manager installed:

```
# On Windows using Chocolatey:
choco install k3d

# On MacOS using brew:
brew install k3d

# On Linux:
curl -s https://raw.githubusercontent.com/rancher/k3d/main/install.sh | bash
```

Test you have the CLI working:

```
k3d version
```

> The exercises use k3d **v5**. Options have changed a lot since older versions, so if youre on v4 or earlier you'll need to upgrade.

_Create a 3-node cluster where each worker node is restricted to running a maximum of 5 Pods:_

```
k3d cluster create labs-affinity --servers 1 --agents 2 -p "30780-30799:30780-30799" --k3s-arg '--kubelet-arg=max-pods=5@agent:*' --k3s-arg '--disable=servicelb@agent:*' --k3s-arg '--disable=traefik@agent:*'
```

Check the node list and confirm agent-1 has a capacity of 5 Pods:

```
k get nodes

k describe node k3d-labs-affinity-agent-1
```

📋 The control plane node doesn't have a specific Pod capacity set. What is the default capacity?

<details>
  <summary>Not sure how?</summary>

You can print the details of the node and scroll to see the capacity:

```
k describe node k3d-labs-affinity-server-0
```

Or you can print the Pod capacity directly with JSONPath:

```
k get node k3d-labs-affinity-server-0 -o jsonpath='{.status.capacity.pods}'
```

> You'll see the default capacity is 110 Pods, which is one of the [best practice recommendations](https://kubernetes.io/docs/setup/best-practices/cluster-large/)

</details><br/>

Create this [whoami Deployment](.\specs\whoami\deployment.yaml) which runs six replicas:

```
k apply -f labs\affinity\specs\whoami
```

Check the Pods and you'll see they've been scheduled across all the nodes:

```
k get pods -l app=whoami -o wide
```

> In the [clusters lab]() we saw how to use taints and tolerations, and node selectors to schedule Pods - but those options are not as flexible as affinity.

If we want to run all the Pods on nodes which have been verified as [CIS compliant]() we could add a label to the nodes and use a node selector; but if we wanted to restrict to worker nodes and not the control plane, we would have to use taints and tolerations.

Node affinity lets you set both requirements in one place:

- [compliance-required\deployment.yaml](.\specs\whoami\compliance-required\deployment.yaml) - uses the standard role label to keep Pods away from control plane nodes, and a custom CIS label to place Pods on verified nodes

> This is a _requiredDuringSchedulingIgnoredDuringExecution_ rule which means it has to be met when Pods are scheduled, but existing Pods won't be removed if they don't meet the requirements.

📋 Apply the update in the `labs\affinity\specs\whoami\compliance-required`. What happens to the existing Pods?

<details>
  <summary>Not sure?</summary>

Apply the change:
```
k apply -f labs\affinity\specs\whoami\compliance-required
```

If you watch the ReplicaSets you'll see the existing RS gets scaled down by one Pod and a new RS gets created, but never scales up to full capacity:

```
k get rs -l app=whoami --watch
```

The affinity rule doesn't affect existing Pods, but the rule is part of the Pod spec and a change to the Pod spec is rolled out by the Deployment as a new ReplicaSet.

</details><br/>

List the Pods now and you'll see the app is not at full capacity:

```
k get pods -l app=whoami -o wide
```

> There are 5 Pods from the original Pod spec - only one was terminated in the update; 3 new Pods are all in the _Pending_ state.

📋 Why are the Pods pending? What can you do to the agent-1 node to have all the Pods scheduled on it?

<details>
  <summary>Not sure?</summary>

Describe one of the new Pods (it has an extra label applied to help with that):

```
k describe po -l app=whoami,update=compliance-required
```

You'll see the problem:

_Warning  FailedScheduling  44s   default-scheduler  0/3 nodes are available: 3 node(s) didn't match Pod's node affinity/selector._

The affinity rule requires a node with the label `cis-compliance=verified`; you can add that to the agent-1 node:

```
k label node k3d-labs-affinity-agent-1 cis-compliance=verified
```

</details><br/>

When your node is ready, check the ReplicaSets:

```
k get rs -l app=whoami
```

> You'll see some of the new Pods get scheduled and start running (these will be on agent-1). The new ReplicaSet scales up, and the old one scales down - but not to full capacity.

The rollout can't complete. Describe the new Pods again and you'll see the problem:

```
k describe po -l app=whoami,update=compliance-required
```

_Warning  FailedScheduling  3m24s  default-scheduler  0/3 nodes are available: 1 Too many pods, 2 node(s) didn't match Pod's node affinity/selector._

Only one node matches the affinity requirements, and it is configured with a maximum of 5 Pods. It has no capacity to run more Pods so new ones can't be started to replace the old ones.

## Node topology

A more typical use for affinity is to enforce a spread of Pods across the nodes in a cluster. This depends on the cluster's _topology_, where the location of the nodes is represented in labels.

Every cluster adds a _hostname_ label which uniquely identifies each node:

```
k get nodes -L kubernetes.io/hostname
```

> This is thel Lowest level of topology - every node has a different label value

Clusters usually add more labels to represent the geography of the nodes. Cloud services typically add _region_ labels to identify the datacenter where the node is running, and also _zone_ labels to identify the failure zone within the region.

We'll simulate that in our cluster to give us regions and zones to work with:

```
k label node --all topology.kubernetes.io/region=lab

k label node k3d-labs-affinity-server-0 topology.kubernetes.io/zone=lab-a

k label node k3d-labs-affinity-agent-0 topology.kubernetes.io/zone=lab-a

k label node k3d-labs-affinity-agent-1 topology.kubernetes.io/zone=lab-b
```

> Now all nodes are in the `lab` region, the control plane and agent-0 are both in zone `lab-a` and agent-1 is in zone `lab-b`.

## Pod affinity & anti-affinity

You use node topology in Pod affinity rules - expressing that Pods should run on nodes where other Pods are running (or not running).

Start by deleting the whoami Deployment so we have a fresh set of Pods to work with:

```
k delete deploy whoami 
```

The new spec in [colocate-region\deployment.yaml](labs\affinity\specs\whoami\colocate-region\deployment.yaml) has two affinity rules:

- node affinity to prevent Pods running on control plane nodes
- Pod affinity to require all Pods to run on nodes in the same region

Pod affinity uses the topology key to state the level where the grouping happens - we could use our cluster labels to put all Pods in the same region, zone or node.

```
k apply -f labs\affinity\specs\whoami\colocate-region

k get po -l app=whoami -o wide
```

> Pods will be on both agent nodes, which are both in the same region

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

k3d cluster delete labs-affinity

Reset to previous cluster, e.g.

kubectl config use-context docker-desktop