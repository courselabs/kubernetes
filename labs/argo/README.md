

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

git push --set-upstream gogs main
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
 --path labs/argo/project/helm `
 --dest-server https://kubernetes.default.svc `
 --dest-namespace whoami
```

## Cleanup

k delete ns -l kubernetes.courselabs.co=argo