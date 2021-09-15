

Gogs -> Jenkins -> BuildKit -> Docker Hub

## Deploy the build stack


k apply -f labs\jenkins\specs\infrastructure

k get deploy -n infra

> Jenkins and BuildKit not ready, need other resources

- create registry secret, use Docker Hub or your own reg

windows:

```
$REGISTRY_SERVER='https://index.docker.io/v1/'
$REGISTRY_USER=Read-Host -Prompt 'Username'
$password = Read-Host -Prompt 'Password'-AsSecureString
$REGISTRY_PASSWORD = [System.Net.NetworkCredential]::new("", $password).Password
```

linux/macOS:

```
REGISTRY_SERVER='https://index.docker.io/v1/'
read REGISTRY_USER
read -s REGISTRY_PASSWORD
```

all:

```
kubectl create secret docker-registry -n infra registry-creds --docker-server=$REGISTRY_SERVER --docker-username=$REGISTRY_USER --docker-password=$REGISTRY_PASSWORD
```

Set your registry domain and repository name in a configmap:

```
kubectl create configmap -n infra build-config --from-literal=REGISTRY=docker.io  --from-literal=REPOSITORY=<your-registry-id>
```

k get deploy -n infra --watch

> all come online

## Push the source code to your local Git server

http://localhost:30030

- username `kiamol`
- password `kiamol`

> There's a repository called kiamol we can use

```
git remote -v

git remote add gogs http://localhost:30030/kiamol/kiamol.git

git push --set-upstream gogs main
```