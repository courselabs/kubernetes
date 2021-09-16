
## Reference

- [ArgoCD command line](https://argoproj.github.io/argo-cd/user-guide/commands/argocd/)
- [Application CRD spec](https://argoproj.github.io/argo-cd/operator-manual/application.yaml)

## Install ArgoCD

```
# Windows:
choco install argocd-cli

# Mac:
brew install argocd

# Linux:
curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x /usr/local/bin/argocd
```

Check:

```
argocd version
```

_Deploy Argo CD:_

- windows-tools

```
kubectl apply -n argocd -f labs\argo\specs\argocd

kubectl get crd -n argocd 

kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

http://localhost:30881


- login with username `admin`, password from Secret

> Browse to https://localhost:30881/settings/clusters - ArgoCD is registered with the local cluster, but there are no apps

## Create an application

ArgoCD deploys apps - which are configured pointing to a source code repo. The repo can use standard Kubernetes YAML, Helm or Kustomize. ArgoCD monitors the repo, and whenever there is a change - so the running app is out of sync of the source - it fetches the changes and updates the app.

First run a local Git server:

```
k apply -f labs\argo\specs\gogs
```

```
git remote add gogs http://localhost:30300/kiamol/kiamol.git

git push --set-upstream gogs main:master
```

Login:

- username `kiamol`
- password `kiamol`

Now connect the ArgoCD CLI to the ArgoCD server:

```
argocd login localhost:30881 --insecure --username admin --password <your-password>

argocd cluster list
```

> You can add new clusters to deploy to a remote Kubernetes cluster


Add the app:

```
argocd app create whoami `
 --repo http://gogs.infra.svc.cluster.local:3000/kiamol/kiamol.git `
 --path labs/argo/project/helm/whoami `
 --dest-server https://kubernetes.default.svc `
 --dest-namespace whoami
```

> Check in UI https://localhost:30881/applications

Select whoami app, click _App Details_ then _Paramaters_. Read from the Helm chart, but can be edited here.

## Deploy the app

kubectl get applications -n argocd

argocd app get whoami


```
# this will error
argocd app sync whoami
```

Update the app spec, set to create namespace and auto-sync with self-heal:

- app.yaml

```
k apply -f labs\argo\specs\whoami
```

> Warning because the app wasn't originally created with Kubectl

In second terminal:

```
k get rs -o wide -n whoami --watch
```

argocd app sync whoami

## Update the app

edit [values.yaml](labs\argo\project\helm\whoami\values.yaml), change the default tag to docker.io/sixeyed/whoami-lab:21.09-6 and replicas to 2

```
git add labs\argo\project\helm\whoami\values.yaml

git commit -m 'Bump to build 6'

git push gogs main:master
```

> ArgoCD updates the Deployment - in a minute or so new RS created, old one scales down

Self-heal is set so ArgoCD will repair environment drift:

```
k delete deploy whoami-server -n whoami
```

> New RS gets created, same name (Pod template hash), scales up to 2

## Lab

Create an argo app for the project in labs\argo\project\kustomize\base - this uses Kustomize instead of Helm; it's part of the repo so the URL will be the same:

- deploy to the default namespace
- set to auto-sync
- browse to the app

## Cleanup

argocd app delete lab whoami --cascade

> Deletes all the apps with cascade, which deletes all the app resources

k delete ns -l kubernetes.courselabs.co=argo
