# Isolating Workloads with Namespaces

Kubernetes usage...

Namespaces are Kubernetes resources which are a container for other resources. 

Isolation types - app, env, bu

## Namespace API spec

The basic YAML for a namespace is extremely simple:

```
apiVersion: v1
kind: Namespace
metadata:
  name: whoami
```

That's it :) The namespace needs a name, and for every resource you want to create inside the namespace, you add that name to the object's metadata:

```
apiVersion: v1
kind: Pod
metadata:
  name: whoami
  namespace: whoami
```

Namespaces can't be nested, it's a single-level hierarchy used to partition the cluster.

## Creating and using namespaces

The core components of Kubernetes run in Pods and Services - but you don't see them in Kubectl because they're in a separate namespace:

```
kubectl get pods

kubectl get namespaces

kubectl get pods -n kube-system
```

> The `-n` flag tells Kubectl which namespace to use; if you don't include it, commands use the `default` namespace

What you'll see in `kube-system` depends on your Kubernetes distribution, but it should include a DNS server Pod.

You can work with system resources in the same way as your own apps, but you need to include the namespace in every command:

```
kubectl logs -l k8s-app=kube-dns

kubectl logs -l k8s-app=kube-dns -n kube-system
```

Adding a namespace to every command is time-consuming, and Kubectl has [contexts]() to let you set the default namespace for commands:

```
kubectl config get-contexts

cat ~/.kube/config
```

> Contexts are how you switch between clusters too; the details are stored in your kubeconfig file 

You can create a new context to point to a remote cluster, or a specific namespace on a cluster. Contexts include authentication details, so they should be managed carefully.

You can't clone contexts, but you can create new ones and update the settings for an existing context:

```
kubectl config set-context --current --namespace kube-system
```

All Kubectl commands work against the cluster and namespace in the current context.

```
kubectl get po

kubectl logs -l k8s-app=kube-dns 
```

Let's switch back so we don't accidentally do anything dangerous in the system namespace:

```
kubectl config set-context --current --namespace default
```

## Deploying objects to namespaces

Object specs can include the target namespace in the YAML. If it is not specified you can set the namespace with Kubectl.

- []() will create a Pod in the current namespace for the context

```
kubectl apply -f labs/namespaces/specs/sleep-pod.yaml -n default

kubectl apply -f labs/namespaces/specs/sleep-pod.yaml -n kube-system

kubectl get pods -l app=sleep --all-namespaces
```

> Namespace access can be restricted with RBAC, but in your dev environment you'll have cluster admin permissions

If you're using namespaces to isolate applications, you'll include the namespace spec with the model and specify the namespace in all the objects:

- []()
- []()
- []()

Kubectl can deploy all the YAML in a folder, but it doesn't check the objects and create them in dependency order. 

Mostly that's fine because of the loose-coupling - Services can be created before a Deployment and vice-versa. Namespaces need to exist before any objects can be created in them, so the namespace YAML is called `01_namespaces.yaml` to ensure it gets created first.

```
kubectl apply -f labs/namespaces/specs/whoami

kubectl get svc -n whoami
```

If you're using namespaces to group applications or environments, your top-level objects (Deployments, Services, ConfigMaps) don't need so many labels. You'll work with them inside a namespace so you don't need labels to help with admin tasks.

- []()
- []() configmap
- []() service - will only find Pods in the same namespace
- []() deployment - configmap & secret refs only apply in same namespace

```
kubectl apply -f labs/namespaces/specs/configurable

kubectl get deploy -A
```

But you can only use Kubectl with one namespace or all namespaces, so you might want some labels:

```
kubectl get svc -A -l co.courselabs.k8sfun=namespaces
```

## Namespaces and Service DNS

Networking in Kubernetes is flat, so any Pod in any namespace can access another Pod by its IP address.

DNS is namespace-scoped, so if you want to resolve the IP address for a Service name you should include the namespace:

- `whoami-np` is a local domain name, so it will only look for the Service whoami-np in the same namespace where it runs
- `whoami-np.whoami.svc.cluster.local` is a fully-qualified domain name (FQDN), which will look for the Service whoami-np in the whoami namespace

```
kubectl exec pod/sleep -- nslookup whoami-np

kubectl exec pod/sleep -- nslookup whoami-np.whoami.svc.cluster.local
```

> As a best-practice you should use FQDNs to communicate between components. It makes your deployment less flexible because you can't change the namespace without also changing app config, but it removes a potentially confusing failure point.

## Applying resource limits


- ns limit
- pi with limit; slower
- increase limit - pod stays Pending

```
kubectl apply -f labs/namespaces/specs/pi

kubectl -n pi get quota

kubectl -n pi get po
```

> Try the app /pi?dp=30000; on my machine it takes about 10.5 seconds to respond

---
Not every dev Kubernetes setup enforces CPU limitations, so you might not see the change if you're using Kind or k3d. 
Docker Desktop does enforce them, and so do all the production Kubernetes platforms.
---

Bump the processing power:

```
kubectl apply -f labs/namespaces/specs/pi/mid-cpu

kubectl describe po -l app=pi-web,cpu=mid -n pi
```

> Refresh /pi?dp=30000; on my machine it now takes about 1.2 seconds to respond

Try and go to the max:

```
kubectl apply -f labs/namespaces/specs/pi/max-cpu

kubectl -n pi get rs -l app=pi-web

kubectl -n pi describe rs -l app=pi-web,cpu=max
```

> You'll see a nice, clear error telling you that the quota has been exceeded. Kubernetes will keep trying, in case the quota changes

## **EXTRA** Context switching with Kubectx and Kubens

When you work with a lot of Kubernetes clusters each with lots of namespaces, it gets very difficult to manage them.

There's a great tool called [kubectx]() which helps with that - it's cross-platform and it lets you easily switch between clusters and namespaces:

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
And if you set up a fancy shell with ZSH and Powerlevel10k you'll get a reminder which context and namespace you're using when you type `k`:

![](/img/ohmyzsh.png)

## Lab

That Pi service takes too long to run, it was better when it ran with a proxy to cache the responses.

Add a caching proxy in front of the Pi app, and be aware that the ops team want all proxies in a namespace called `front-end`.

You can use the Nginx setup in `labs/persistentvolumes/specs/pi` as a starting point, but remember the pi-web Service is in its own namespace now.

And we don't want any port clashes, so for the proxy let's use `8040` for tje LoadBalancer Service and `30040` for the NodePort.

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

## Cleanup

When you're done **after you've tried the lab**, you can remove all the objects:

```
# deleting a namespace deletes everything inside it:
kubectl delete ns -l co.courselabs.k8sfun=namespaces

# which just leaves the sleep Pods:
kubectl delete po -A -l co.courselabs.k8sfun=namespaces
```