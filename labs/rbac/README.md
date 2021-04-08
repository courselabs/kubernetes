# Role-Based Access Control


## Role and RoleBinding API spec



## Securing API access with Service Accounts

We'll use a simple app which connects to the Kubernetes API server to list Pods, and let you delete them.

Create a sleep Deployment so we'll have a Pod to see in the app:

```
kubectl apply -f labs/rbac/specs/sleep.yaml
```

- sa
- pod spec
- default permissions

```
kubectl apply -f labs/rbac/specs/kube-explorer
```

> Browse to the app at localhost:8010 or localhost:30010

There's an error. The app is trying to connect to the Kubernetes REST API to get a list of Pods, but it's getting a 403 Forbidden error message.

The app is using a Service Account, and Kubernetes automatically populates an authentication token in the Pod:

```
kubectl describe pod -l app=kube-explorer
```

> You'll see a volume mounted at `/var/run/secrets/kubernetes.io/serviceaccount` - that's not in the Pod spec, it's a Kubernetes default to add it

```
kubectl exec deploy/kube-explorer -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
```

> That's the authentication token for the Service Account, which the app uses to connect

So the app is authenticated but not authorized. Service Accounts start off with no permissions and need to be granted acces to resources.

```
kubectl auth can-i get pods -n default --as system:serviceaccount:default:kube-explorer
```

RBAC rules are applied when a request is made to the API server, so we can fix this app by deploying a Role and RoleBinding:

- [](labs/rbac/specs/kube-explorer/rbac-namespace/default.yaml)


```
kubectl apply -f labs/rbac/specs/kube-explorer/rbac-namespace/default.yaml

kubectl auth can-i get pods -n default --as system:serviceaccount:default:kube-explorer
```

Refresh the site and you'll see a Pod list. You can delete the sleep Pod, then go back to the main page and you'll see a new Pod created by the ReplicaSet.

## Granting cluster-wide permissions

The role binding restricts access to the default namespace:

```
kubectl auth can-i get pods -n kube-system --as system:serviceaccount:default:kube-explorer
```

You can grant access to Pods in each namespace with more Roles and RoleBindings, but if you want permissions to apply across all namespaces you can use a ClusterRole and ClusterRoleBinding:

- [](labs/rbac/specs/kube-explorer/rbac-cluster/pod-reader.yaml)


```
kubectl apply -f labs/rbac/specs/kube-explorer/rbac-cluster/

kubectl auth can-i get pods -n kube-system --as system:serviceaccount:default:kube-explorer

kubectl auth can-i delete pods -n kube-system --as system:serviceaccount:default:kube-explorer
```

> Browse to the app with a namespace in the querystring, e.g. http://localhost:8010/?ns=kube-system

The app can see Pods in other namespaces, but it can't delete them.

RBAC permissions are finely controlled. The app only has access to Pods - if you click the _Service Accounts_ link the app shows the 403 Forbidden error again.


## Creating a new end-user

- auth devolved
- new user with certs

- [](labs/rbac/specs/user-cert-generator/01_service-account.yaml)  - needs to exist before clusterrolebinding
- [](labs/rbac/specs/user-cert-generator/02_rbac.yaml) - CSR weorkflow (Kubernetes is a CA)
- [](labs/rbac/specs/user-cert-generator/03_pod.yaml) - RBAC needs to be applied first

```
kubectl apply -f labs/rbac/specs/user-cert-generator/
```


## Granting and testing end-user permissions

- role & cluster role & bindings
## Lab

sleep pod without sa token

kube-explorer access to service accounts in default ns

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

## Cleanup

When you're done **after you've tried the lab**, you can remove all the objects:

```

kubectl delete 

```