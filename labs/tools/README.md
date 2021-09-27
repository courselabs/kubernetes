
## Reference

- [Dashboard - web UI](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/)
- [K9s - console UI](https://github.com/derailed/k9s)
- [Kubectl plugins - Krew](https://krew.sigs.k8s.io/plugins/)
- [Kubewatch - chat notification](
https://github.com/bitnami-labs/kubewatch)
___

## * **Do this first if you use Docker Desktop** *

There's a [bug in the default RBAC setup](https://github.com/docker/for-mac/issues/4774) in Docker Desktop, which means permissions are not applied correctly. If you're using Kubernetes in Docker Desktop, run this to fix the bug:

```
# on Docker Desktop for Mac (or WSL2 on Windows):
sudo chmod +x ./scripts/fix-rbac-docker-desktop.sh
./scripts/fix-rbac-docker-desktop.sh

# OR on Docker Desktop for Windows (PowerShell):
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force
./scripts/fix-rbac-docker-desktop.ps1
```
___

## Dashboard

Deploy metrics server:

k top nodes

k apply -f labs\tools\specs\metrics-server

Deploy some resources:

k apply -f labs\tools\specs\rng


> http://localhost:30080

Click Go, should see a random number


k apply -f labs\tools\specs\dashboard

k describe sa rng-admin-user -n kubernetes-dashboard

k get secret -n kubernetes-dashboard rng-admin-user-token

> SA auth token stored in a secret, contents auto-generated

kubectl -n kubernetes-dashboard get secret rng-admin-user-token -o go-template="{{.data.token | base64decode}}"

> Prints out token, copy to clipboard

https://localhost:30043

- Accept security risk - self-signed SSL cert
- Paste token - admin creds
- Empty screens, browse around - change ns
- Can view Pods etc. in all ns - not secrets
- Pods - check logs, exec 
- Can view all in rng ns
- Can edit only in rng ns

## K9s

https://github.com/derailed/k9s#installation

```
# Windows - using Admin window
choco install k9s

# Mac
brew install k9s

# Linux
curl -sS https://webinstall.dev/k9s | bash
```

Run in read-only mode - uses your default cluster admin context:

```
k9s --readonly
```

Keyboard navigation 

- numbers to switch ns
- 0 for all
- up.down to select pod
- l for logs
- esc to go back

Switch resources:

- :svc
- :cm
- :secrets - x to decode

Ctrl-C to exit

Create a context for the RNG admin user

```
kubectl -n kubernetes-dashboard get secret rng-admin-user-token -o go-template="{{.data.token | base64decode}}"

kubectl config set-credentials rng-admin --token=<your-sa-token>

k config get-contexts  

kubectl config set-context rng --user=rng-admin --cluster=<your-cluster-name>
```

Launch k9s as rng user:

```
k9s -n rng --context rng
```

- navigate, can see pods but only shell into rng pods
- :secrets - error
- back to :pods, select rng ns 1
- :secrets - u to check usage


## Kubectl plugins - Krew

https://krew.sigs.k8s.io/docs/user-guide/setup/install/

> Add to path and restart shell (or restart Code)

```
kubectl krew 

kubectl krew search rbac
```

> Will likely need admin permissions 

kubectl krew install rbac-view

kubectl rbac-view

> Browse to URL; comprehensive but unwieldy

kubectl krew install who-can

kubectl who-can get secrets -n rng

> Not complete

kubectl auth can-i get secrets -n rng --as system:serviceaccount:kubernetes-dashboard:rng-admin-user


kubectl krew install access-matrix

 kubectl access-matrix --sa kubernetes-dashboard:rng-admin-user

 kubectl access-matrix --sa kubernetes-dashboard:rng-admin-user -n rng


## Kubewatch (Slack integration)

Slack - create new workspace, call the first channel lab-tools

- https://slack.com/intl/en-gb/get-started#/createnew

Add the bot app to get an API token, call it kubewatch:

- https://courselabsworkspace.slack.com/apps/A0F7YS25R-bots?utm_source=in-prod&utm_medium=inprod-btn_app_install-index-click&tab=more_info

- in the channel - `/invite @kubewatch`


helm repo add bitnami https://charts.bitnami.com/bitnami

helm install --name kubewatch bitnami/kubewatch --values=labs\tools\kubewatch\values.yaml --set='slack.channel=#YOUR_CHANNEL,slack.token=xoxb-YOUR_TOKEN'


helm install kubewatch -n default --values=labs\tools\kubewatch\values.yaml --set='slack.channel=#lab-tools,slack.token=xoxb-2558897489664-2535299245714-7jYPn24C9FuoBiyjr5XWHIeI' bitnami/kubewatch


k logs -n default -l app.kubernetes.io/name=kubewatch

> RBAC issue, can be ignored

k delete po -n rng -l app=numbers-api



