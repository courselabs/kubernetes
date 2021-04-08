# Isolating Workloads with Namespaces

One of the great features of Kubernetes is that you can run any type of application - many organizations are looking to migrate their whole application landscape onto Kubernetes. That could make operations difficult if there was no way to segregate the cluster, so Kubernetes has [namespaces]().

Namespaces are Kubernetes resources which are a container for other resources. You can use them to isolate workloads, and how you do the isolation is up to you. You may have a production cluster with a different namespace for each application, and a non-production cluster with namespaces for each environment (dev, test, uat).

You introduce some complexity using namespaces but they give you a lot of safeguards so you can confidently run multiple workloads on a single cluster without compromising scale or security.

## Namespace API spec

The basic YAML for a namespace is extremely simple:

```
apiVersion: v1
kind: Namespace
metadata:
  name: whoami
```

That's it :) The namespace needs a name, and for every resource you want to create inside the namespace, you add that name to that object's metadata:

```
apiVersion: v1
kind: Pod
metadata:
  name: whoami
  namespace: whoami
```

Namespaces can't be nested, it's a single-level hierarchy used to partition the cluster.

## Creating and using namespaces

The core components of Kubernetes itself run in Pods and Services - but you don't see them in Kubectl because they're in a separate namespace:

```
kubectl get pods

kubectl get namespaces

kubectl get pods -n kube-system
```

> The `-n` flag tells Kubectl which namespace to use; if you don't include it, commands use the default namespace

Everything we've deployed so far has been created in the `default` namespace.

What you'll see in `kube-system` depends on your Kubernetes distribution, but it should include a DNS server Pod.

You can work with system resources in the same way as your own apps, but you need to include the namespace in the Kubectl command:

```
kubectl logs -l k8s-app=kube-dns

kubectl logs -l k8s-app=kube-dns -n kube-system
```

Adding a namespace to every command is time-consuming, and Kubectl has [contexts]() to let you set the default namespace for commands:

```
kubectl config get-contexts

cat ~/.kube/config
```

> Contexts are how you switch between clusters too; the cluster API server details are stored in your kubeconfig file 

You can create a new context to point to a remote cluster, or a specific namespace on a cluster. Contexts include authentication details, so they should be managed carefully.

You can't clone contexts, but you can create new ones and update the settings for an existing context:

```
kubectl config set-context --current --namespace kube-system
```

> Sets your current context to use the `kube-system` namespace by default

All Kubectl commands work against the cluster and namespace in the current context.

```
kubectl get po

kubectl logs -l k8s-app=kube-dns 

kubectl get po -n default
```

Let's switch back so we don't accidentally do anything dangerous in the system namespace:

```
kubectl config set-context --current --namespace default
```

## Deploying objects to namespaces

Object specs can include the target namespace in the YAML. If it is not specified you can set the namespace with Kubectl.

- [sleep-pod.yaml](specs/sleep-pod.yaml) defines a Pod with no namespace, so Kubectl decides the namespace - using the default for the context, or an explicit namespace

```
kubectl apply -f labs/namespaces/specs/sleep-pod.yaml -n default

kubectl apply -f labs/namespaces/specs/sleep-pod.yaml -n kube-system

kubectl get pods -l app=sleep --all-namespaces
```

> Namespace access can be restricted with RBAC, but in your dev environment you'll have cluster admin permissions so you can see everythign

If you're using namespaces to isolate applications, you'll include the namespace spec with the model and specify the namespace in all the objects:

- [whoami/01-namespace.yaml](labs/namespaces/specs/whoami/01-namespace.yaml) - defines the namespace
- [whoami/deployment.yaml](labs/namespaces/specs/whoami/deployment.yaml) - defines a Deployment for the namespace
- [whoami/services.yaml](labs/namespaces/specs/whoami/services.yaml) - defines Services; the label selectors only apply to Pods in the same namespace as the Service

Kubectl can deploy all the YAML in a folder, but it doesn't check the objects for dependencies and create them in the correct order. 

Mostly that's fine because of the loosely-coupled architecture - Services can be created before a Deployment and vice-versa. But namespaces need to exist before any objects can be created in them, so the namespace YAML is called `01_namespaces.yaml` to ensure it gets created first (Kubectl processes files in order by filename).

```
kubectl apply -f labs/namespaces/specs/whoami

kubectl get svc -n whoami
```

If you're using namespaces to group applications or environments, your top-level objects (Deployments, Services, ConfigMaps) don't need so many labels. You'll work with them inside a namespace so you don't need labels to help with admin tasks.

Here's another app where all the components will be isolated in their own namespace:

- [configurable/01-namespace.yaml](labs/namespaces/specs/configurable/01-namespace.yaml) - the new namespace
- [configurable/configmap.yaml](labs/namespaces/specs/configurable/configmap.yaml) - ConfigMap with app settings
- [configurable/deployment.yaml](labs/namespaces/specs/configurable/deployment.yaml) - Deployment which references the ConfigMap. Config objects need to be in the same namespace as the Pod.

Deploy the app and use Kubectl to list Deployments in all namespaces:

```
kubectl apply -f labs/namespaces/specs/configurable

kubectl get deploy -A --show-labels
```

You can only use Kubectl with one namespace or all namespaces, so you might want additional labels for objects like Services, so you can list across all namespace and filter by label:

```
kubectl get svc -A -l co.courselabs.k8sfun=namespaces
```

## Namespaces and Service DNS

Networking in Kubernetes is flat, so any Pod in any namespace can access another Pod by its IP address.

Services is namespace-scoped, so if you want to resolve the IP address for a Service using its DNS name you can include the namespace:

- `whoami-np` is a local domain name, so it will only look for the Service whoami-np in the same namespace where the lookup runs
- `whoami-np.whoami.svc.cluster.local` is a fully-qualified domain name (FQDN), which will look for the Service whoami-np in the whoami namespace

```
kubectl exec pod/sleep -- nslookup whoami-np

kubectl exec pod/sleep -- nslookup whoami-np.whoami.svc.cluster.local
```

> As a best-practice you should use FQDNs to communicate between components. It makes your deployment less flexible because you can't change the namespace without also changing app config, but it removes a potentially confusing failure point.

## Applying resource limits

Namespaces aren't just for logically grouping components, you can also enforce quotas on a namespace to limit the resources which can be deployed.

This is a useful safeguard to ensure some apps don't use all the processing power of the cluster, starving other apps. [Resource quotas]() at the namespace level work together with [resource limits and requests]() at the Pod level. 

The Pi app we've used before is compute-intensive, so to keep our cluster usable for other apps we'll deploy it in a new namespace with a CPU quota applied:

- [pi/02-cpu-limit-quota.yaml](labs/namespaces/specs/pi/02-cpu-limit-quota.yaml) - defines a quota which sets a total limits of 4 CPU cores across all Pods in the namespace
- [pi/web-deployment.yaml](labs/namespaces/specs/pi/web-deployment.yaml) - defines a Deployment with one Pod which has a limit of 125 millicores (0.125 of one core)

Resource **requests** specify how much memory or CPU the Pod would like allocated when it is created; resource **limits** specify the maximum memory or CPU the Pod can access.

There's no Nginx proxy for this release of the Pi app and the CPU allocation is very small, so the calculations will not be fast.

```
kubectl apply -f labs/namespaces/specs/pi

kubectl -n pi get quota

kubectl -n pi get po
```

> Try the app at /pi?dp=30000; on my machine it takes about 10.5 seconds to respond

___
Not every dev Kubernetes setup enforces CPU limitations, so you might not see the app responding slowly if you're using Kind or k3d. Docker Desktop does enforce them, and so do all the production Kubernetes platforms.
___

[mid-cpu\web-deployment.yaml](labs\namespaces\specs\pi\mid-cpu\web-deployment.yaml) bumps the processing power to 2.5 CPU cores:

```
kubectl apply -f labs/namespaces/specs/pi/mid-cpu

kubectl describe po -l app=pi-web,cpu=mid -n pi
```

> Refresh /pi?dp=30000; on my machine it now takes about 1.2 seconds to respond

Try and go to the max - [max-cpu\web-deployment.yaml](labs\namespaces\specs\pi\max-cpu\web-deployment.yaml) sets a limit of 4.5 CPU cores, which is greater than the quota for the namespace:

```
kubectl apply -f labs/namespaces/specs/pi/max-cpu

kubectl -n pi get rs -l app=pi-web

kubectl -n pi describe rs -l app=pi-web,cpu=max
```

> The new ReplicaSet never scales up to the desired count. You'll see a nice, clear error telling you that the quota has been exceeded. Kubernetes will keep trying, in case the quota changes

## **EXTRA** Context switching with Kubectx and Kubens

When you work with a lot of Kubernetes clusters each with lots of namespaces, it gets very difficult to manage them.

There's a great tool called [kubectx](https://kubectx.dev/) which helps with that - it's cross-platform and it lets you easily switch between clusters, along with the partner tool `kubens` for switching namespaces.

They are very useful tools as you use Kubernetes more, you can install them from the [releases](https://github.com/ahmetb/kubectx/releases), or with:

```
# Windows
choco install kubectx kubens

# macOS
brew install kubectx kubens
```

Then use to manage namespaces like this:

```
# list all namespaces
kubens

# switch to pi
kubens pi

# toggle back to the previous namespace:
kubens -
```

I have aliases in all my shells:

```
alias d="docker"
alias k="kubectl"
alias kx="kubectx"
alias kn="kubens"
```

So my typical workflow is:

```
kx <client-cluster>
kn <namespace>
k etc.

kx -
```
And if you set up a fancy shell with [ZSH and PowerLevel10K](https://medium.com/@shivam1/make-your-terminal-beautiful-and-fast-with-zsh-shell-and-powerlevel10k-6484461c6efb) you'll get a reminder which context and namespace you're using when you type `k`:

![](/img/ohmyzsh.png)

## Lab

That Pi service takes too long to run, it was better when it ran with a proxy to cache the responses.

Add a caching proxy in front of the Pi app, and be aware that the ops team want all proxies in a namespace called `front-end`.

You can use the Nginx setup in `labs/persistentvolumes/specs/pi` as a starting point, but remember the pi-web Service is in its own namespace now.

And we don't want any port clashes, so for the proxy let's use `8040` for the LoadBalancer Service and `30040` for the NodePort.

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

## Cleanup

When you're done **after you've tried the lab**, you can remove all the objects:

```
# deleting a namespace deletes everything inside it:
kubectl delete ns -l co.courselabs.k8sfun=namespaces

# which just leaves the sleep Pods:
kubectl delete po -A -l co.courselabs.k8sfun=namespaces
```