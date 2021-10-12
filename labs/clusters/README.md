# Kubernetes Clusters

A single-node cluster is fine for a local environment, but a real cluster will always be multi-node for high availability and scale. In a production cluster the core Kubernetes components - called the control plane - run in dedicated nodes. You won't run any of your own app components on those nodes, so they're dedicated to Kubernetes. The control plane is usually replicated across three nodes. Then you have as many worker nodes as you need to run your apps, which could be tens or hundreds.

You can install Kubernetes on servers or VMs using the [Kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/) tool. In the cloud you would use the command line or web UI for your platform (e.g. [az aks create](https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az_aks_create) for Azure, [eksctl create cluster](https://eksctl.io/usage/creating-and-managing-clusters/) for AWS and [gcloud container clusters create](https://cloud.google.com/kubernetes-engine/docs/quickstart#create_cluster) for GCP). We'll use k3d to create multi-node local environments.

## Reference

- [kubeadm init](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/) - to initialize a new cluster
- [kubeadm join](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-join/) - to join a new node to an existing cluster
- [k3d cluster create](https://k3d.io/v5.0.0/usage/commands/k3d_cluster_create/) - creating local clusers with k3d
- [Taints and tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) - marking nodes
- [Deprecated API Migration Guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide/) - managing API version upgrades

## Cluster versions & API support

Kubernetes moves fast - there are three releases per year, and a release may add or change resource specifications. The API version in your YAML spec defines which resource version you're using, and not all clusters support all API versions.

k3d is great for spinning up specific Kubernetes versions quickly, so you can run the exact version you have in your production environment.

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

Create two clusters, one using a recent Kubernetes version and one using an old release:

```
k3d cluster create labs-clusters-116 --image rancher/k3s:v1.16.15-k3s1

k3d cluster create labs-clusters-122 --image rancher/k3s:v1.22.2-k3s2
```

Switch to the older cluster and check the API versions:

```
kubectl config use-context k3d-labs-clusters-116

kubectl get nodes

kubectl api-versions
```

> You'll see `networking.k8s.io/v1beta1` - which contains a beta version of the Ingress spec

You can create a [beta Ingress spec](.\specs\ingress\v1beta1\whoami.yaml) on this cluster:

```
k apply -f labs\clusters\specs\ingress\v1beta1
```

Switch to the newer cluster and compare the API versions:

```
kubectl config use-context k3d-labs-clusters-122

kubectl api-versions
```

> `networking.k8s.io/v1beta1` is no longer listed

```
# the same YAML spec fails on this cluster:
kubectl apply -f labs\clusters\specs\ingress\v1beta1
```

You'll see _error: unable to recognize "labs\\clusters\\specs\\ingress\\v1beta1\\whoami.yaml": no matches for kind "Ingress" in version "networking.k8s.io/v1beta1"_. There's no fix for this - you need to update your YAML to use the [v1 Ingress spec](.\specs\ingress\v1\ingress.yaml), which uses a different schema.

We don't need those clusters now, so we can remove them:

```
k3d cluster delete labs-clusters-116 labs-clusters-122
```

## Create a multi-node cluster

We'll create a multi-node cluster to see how Kubernetes manages Pods across multiple nodes.

This will build a cluster with one control plan node and two worker nodes, publishing ports so we can send traffic into NodePort Services using `localhost`:

```
k3d cluster create lab-clusters --servers 1 --agents 2 -p "30700-30799:30700-30799"
```

You can see the nodes are actually Docker containers:

```
docker container ls
```

📋 List the nodes showing extra details, including the container runtime, and then print all the labels for the nodes.

<details>
  <summary>Not sure how?</summary>

The wide output adds node IP address and component versions:

```
kubectl get nodes -o wide
```

Nodes are like any object, you can add labels to the output:

```
kubectl get nodes --show-labels
```

</details><br />

> All Kubernetes nodes have standard labels - including the hostname, operating system (Linux or Windows) and the CPU architecture (Intel or Arm). 

Control plane nodes have an additional label to identify them, and many platforms add their own labels (e.g. region and zone for cloud clusters).

## Taints and tolerations

- whoami with 4 replicas, on each node

k apply -f labs\clusters\specs\whoami

kubectl get po -o wide -l app=whoami

kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints --no-headers 

kubectl taint nodes k3d-lab-clusters-agent-1 disk=hdd:NoSchedule

> Pods still running 

kubectl taint nodes k3d-lab-clusters-server-0 workload=system:NoExecute

> Pods evicted, recreated agent 1 & 0 

k rollout restart deploy whoami

> New pods, no toleration all on agent 0

kubectl get po -o wide -l app=whoami

k apply -f labs\clusters\specs\whoami\update

> Spread on agents 0 and 1, not server

## Scheduling

DaemonSet with Linux node selector:

k apply -f labs\clusters\specs\ingress-controller 

> 2 nodes, agents - toleration for taint

kubectl get po -n ingress-nginx -o wide -l app.kubernetes.io/name=ingress-nginx

For control plane only:


k apply -f labs\clusters\specs\ingress-controller/update

kubectl get po -n ingress-nginx -o wide -l app.kubernetes.io/name=ingress-nginx

## Adding & removing nodes

k3d node stop k3d-lab-clusters-agent-1

kubectl get nodes --watch

> Node stops straigt away, takes 30+ sec for Kubernetes to notice; status -> NotReady

kubectl get po -o wide -A

> Pods replaced; old stay as Terminating - node not there to confirm removal
k delete node k3d-lab-clusters-agent-1

kubectl get nodes


k3d node create -c lab-clusters new-node

kubectl get nodes --watch

> Joins, NotReady -> Ready; no Pods

k3d node stop k3d-lab-clusters-server-0

kubectl get nodes 

> Timeout, no API server; control plane LB in prod

k3d node start k3d-lab-clusters-server-0

## Lab 

Maintenance - remove pods and flag node for no more pods, add node back in and rebalance whoami pods


## Cleanup

k3d cluster delete lab-clusters

kubectl config use-context docker-desktop