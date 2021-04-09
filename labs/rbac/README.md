# Role-Based Access Control

Kubernetes supports fine-grained access control, so you can decide who has permission to work with resources in your cluster, and what they can do with them.

There are two parts to RBAC decoupling permissions and who has the permissions - that lets you model security with a managable number of objects:

- [Roles]() deinfe access permissions for resources (like Pods and Secrets), allowing specific actions (like create and delete)
- [RoleBindings]() grant the permissions in a Role to a subject, which could be a Kubectl user or an app running in a Pod.

Roles and RoleBindings apply to objects in a specific namespace; there are also [ClusterRole]() and [ClusterRoleBindings]() which have a similar API and secure access to objects across all namespaces.

## Role and RoleBinding API spec

Roles contain a set of permissions as **rules**:

```
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-viewer
  namespace: default 
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
```

Each rule secures access to one or more types of resource. For each rule:

- `apiGroups` - the namespace of the resource, which you use in the `apiVersion` in object metadata; Pods are just `v1` so the apiGroup is blank, Deployments are `apps/v1` so the apiGroup would be `apps`
- `resources` - the type of the resource, which you use as the `kind` in object metadata
- `verbs` - the actions the role allows to be performed on the resource

This role equates to Kubectl `get pods` and `describe pod` permissions in the `default` namespace.

RoleBindings apply a role to a set of **subjects**:

```
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: student-pod-viewer
  namespace: default 
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: pod-viewer
subjects:
- kind: User
  name: student@courselabs.co
  namespace: default
```

- `namespace` needs to match the namespace in the Role
- `roleRef` refers to the Role by name
- `subjects` are the Users, Groups or ServiceAccounts having the role applied - they can be in different namespaces

___
## * **Do this first if you use Docker Desktop** *

There's a [bug in the default RBAC setup]() in Docker Desktop, which means permissions are not applied correctly. If you're using Kubernetes in Docker Desktop, run this to fix the bug:

```
# on Docker Desktop for Mac (or WSL2 on Windows):
kubectl patch clusterrolebinding docker-for-desktop-binding --type=json --patch $'[{"op":"replace", "path":"/subjects/0/name", "value":"system:serviceaccounts:kube-system"}]'

# OR on Docker Desktop for Windows (PowerShell):
kubectl patch clusterrolebinding docker-for-desktop-binding --type=json --patch '[{\"op\":\"replace\", \"path\":\"/subjects/0/name\", \"value\":\"system:serviceaccounts:kube-system\"}]'
```
___

## Securing API access with Service Accounts

Authentication for end-user access is a bit more involved, so we'll start with internal access to the cluster.

We'll use a simple web app which connects to the Kubernetes API server to get a list of Pods, it displays them and lets you delete them.

Create a sleep Deployment so we'll have a Pod to see in the app:

```
kubectl apply -f labs/rbac/specs/sleep.yaml
```

The initial app spec doesn't include any RBAC rules, but it does include a specific security account for the Pod:

- [kube-explorer/deployment.yaml](labs/rbac/specs/kube-explorer/deployment.yaml) - creates a ServiceAccount and sets the Pod spec to use that ServiceAccount

```
kubectl apply -f labs/rbac/specs/kube-explorer
```

> Browse to the app at localhost:8010 or localhost:30010

You'll see an error. The app is trying to connect to the Kubernetes REST API to get a list of Pods, but it's getting a 403 Forbidden error message.

Kubernetes automatically populates an authentication token in the Pod, which the app uses to connect to the API server:

```
kubectl describe pod -l app=kube-explorer
```

> You'll see a volume mounted at `/var/run/secrets/kubernetes.io/serviceaccount` - that's not in the Pod spec, it's a Kubernetes default to add it

```
kubectl exec deploy/kube-explorer -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
```

> That's the authentication token for the Service Account, so Kubernetes knows the identity of the API client

So the app is **authenticated** and it's allowed to use the API, but the account is not **authorized** to list Pods. Security principals - ServiceAccounts, Groups and Users - start off with no permissions and need to be granted acces to resources.

You can check the permissions of a user with the `auth can-i` command:

```
kubectl auth can-i get pods -n default --as system:serviceaccount:default:kube-explorer
```

> This command works for users and ServiceAccounts - the ServiceAccount ID includes the namespace and name

RBAC rules are applied when a request is made to the API server, so we can fix this app by deploying a Role and RoleBinding:

- [role-pod-manager.yaml](labs/rbac/specs/kube-explorer/rbac-namespace/role-pod-manager.yaml) - creates a Role with permissions to list and delete Pods in the default namespace
- [rolebinding-pod-manager-sa.yaml](labs/rbac/specs/kube-explorer/rbac-namespace/rolebinding-pod-manager-sa.yaml) - creates a RoleBinding applying the new Role to the app's Service Account

```
kubectl apply -f labs/rbac/specs/kube-explorer/rbac-namespace/default.yaml

kubectl auth can-i get pods -n default --as system:serviceaccount:default:kube-explorer
```

Now the app has the permissions it needs. Refresh the site and you'll see a Pod list. You can delete the sleep Pod, then go back to the main page and you'll see a replacement Pod created by the ReplicaSet.

## Granting cluster-wide permissions

The role binding restricts access to the default namespace, the same ServiceAccount can't see Pods in the system namespace:

```
kubectl auth can-i get pods -n kube-system --as system:serviceaccount:default:kube-explorer
```

You can grant access to Pods in each namespace with more Roles and RoleBindings, but if you want permissions to apply across all namespaces you can use a ClusterRole and ClusterRoleBinding:

- [clusterrole-pod-reader.yaml](labs/rbac/specs/kube-explorer/rbac-cluster/clusterrole-pod-reader.yaml) - sets Pod permissions for the cluster; note there is no namespace in the metadata
- [](labs/rbac/specs/kube-explorer/rbac-cluster/clusterrolebinding-pod-reader-sa.yaml) - applies the role to the app's ServiceAccount


```
kubectl apply -f labs/rbac/specs/kube-explorer/rbac-cluster/

kubectl auth can-i get pods -n kube-system --as system:serviceaccount:default:kube-explorer

kubectl auth can-i delete pods -n kube-system --as system:serviceaccount:default:kube-explorer
```

> Browse to the app with a namespace in the querystring, e.g. http://localhost:8010/?ns=kube-system or http://localhost:30010/?ns=kube-system

The app can see Pods in other namespaces, but it can't delete them.

RBAC permissions are finely controlled. The app only has access to Pod resources - if you click the _Service Accounts_ link the app shows the 403 Forbidden error again.


## Creating a new end-user

Kubernetes manages authorization with roles and bindings but it does not have an authentication system. It expects clients (e.g. Kubectl users) to be authenticated by a trusted system, and then it uses the authenticated identity to apply role permissions.

Production Kubernetes systems integrate with third-party identity providers - Azure AD for AKS, OpenID Connect and LDAP are other options. For a dev cluster you can use Kubernetes to create a client certificate which users can authenticate with.

The steps for that are wrapped up in the user-cert-generator app:

- [](labs/rbac/specs/user-cert-generator/01_service-account.yaml)  - ServiceAccount for the app, needs to be created before clusterrolebinding
- [](labs/rbac/specs/user-cert-generator/02_rbac.yaml) - roles and bindings so the app can request a cert from Kubernetes 
- [](labs/rbac/specs/user-cert-generator/03_pod.yaml) - the application Pod

> If you're interested in how the cert is created, it's all in this [shell script](https://github.com/sixeyed/kiamol/blob/master/ch17/docker-images/user-cert-generator/start.sh)

Run the app to create a client certificate:

```
kubectl apply -f labs/rbac/specs/user-cert-generator/

kubectl wait --for=condition=Ready pod user-cert-generator

kubectl logs user-cert-generator
```

The new user's certificate and key are in the Pod container's filesystem. You can copy them out to your local machine:

```
kubectl cp user-cert-generator:/certs/user.key user.key
kubectl cp user-cert-generator:/certs/user.crt user.crt
```

Create a new context for Kubectl to use the new user's certificate:

```
# save the cert in Kubeconfig to authenticate the user:
kubectl config set-credentials labreader --client-key=./user.key --client-certificate=./user.crt --embed-certs=true

# set the cluster for the new context to the same as the current context:
kubectl config set-context labreader --user=labreader --cluster $(kubectl config view --minify -o jsonpath='{.clusters[0].name}')

# check your new context:
kubectl config get-contexts
```

You can use the new user directly with your context, and you'll see they're authenticated but they have no permissions:

```
kubectl apply -f labs/rbac/specs/sleep.yaml --context labreader

kubectl get pods --as reader@courselabs.co
```


## Granting end-user and group permissions

Just like Service Accounts, new client users start with zero permissions.

You apply permissions in the same way, with RoleBindings and ClusterRoleBindings. The subject of the binding can either be the name of the user, or the group they belong to.

Different authentication systems represent that in different ways; the certificate we're using includes the user name and group:

```
openssl x509 -in user.crt -noout -subject

# if you don't have OpenSSL installed, this is what you would have seen:
# subject=C = UK, ST = LONDON, L = London, O = courselabs, CN = reader@courselabs.co
```

- CN is the Common Name - in Kubernetes that's the user name
- O is the Organization - Kubernetes uses it as the group name

We can create a group permission, so all courselabs users can list Pods, show Pod details and print logs:

- [clusterrole-podviewer.yaml](specs/group/clusterrole-podviewer.yaml) - role with Pod and log permissions
- [clusterrolebinding-podviewer-courselabs.yaml](specs/group/clusterrolebinding-podviewer-courselabs.yaml) - binding for the role to the group


```
kubectl apply -f labs/rbac/specs/group

kubectl get pods --context labreader

kubectl get pods -n kube-system --context labreader
```

The new permissions also allow the reader to get Pod details and print logs, but that's all:

```
kubectl describe pods -l app=sleep --context labreader

kubectl logs user-cert-generator --tail=3 --context labreader

kubectl delete pod user-cert-generator --context labreader

kubectl get secrets --context labreader
```

## Applying ClusterRoles to specific namespaces

There are built-in ClusterRoles which give a good starting point for general access - including `view`, `edit` and `admin`.

ClusterRoles can be bound to subjects cluster-wide with a ClusterRoleBinding **or** to specific namespaces with a RoleBinding:

- [rolebinding-edit-default.yaml](specs/user/rolebinding-edit-default.yaml) - applies the `edit` ClusterRole to the new user, restricted to the `default` namespace

```
kubectl apply -f labs/rbac/specs/user/

kubectl auth can-i delete po/user-cert-generator --as reader@courselabs.co

kubectl delete pod user-cert-generator --context labreader
```
The user can now delete Pods in the default namespace. If there were other users in the same group then they wouldn't have this permission - it's specifically bound to the user.

But the ClusterRole is limited to the `default` namespace:

```
kubectl delete pod --all -n kube-system --context labreader
```

## Lab

You need to be familiar with RBAC. You'll certainly have restricted permissions in production clusters, and if you need new access you'll get it more quickly if you give the admin a Role and RoleBinding for what you need.

Get some practice by deploying new RBAC rules so the ServiceAccount view in the kube-explorer app works correctly, for objects in the default namespace.

Oh - one more thing :) Mounting the ServiceAccount token in the Pod is  default behaviour but most app don't use the Kubernetes API server. It's a potential security issue so can you amend the sleep Pod so it doesn't have a token mounted.

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

## Cleanup

When you're done **after you've tried the lab**, you can remove all the objects:

```
kubectl delete pod,deploy,svc,serviceaccount,role,rolebinding,clusterrole,clusterrolebinding -A -l co.courselabs.k8sfun=rbac
```