

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
kubectl create configmap -n infra build-config --from-literal=RELEASE_VERSION=21.09 --from-literal=REGISTRY_DOMAIN=docker.io  --from-literal=REGISTRY_REPOSITORY=<your-registry-id>
```

k get deploy -n infra --watch

> all come online

## Push the source code to your local Git server

http://localhost:30300

- username `kiamol`
- password `kiamol`

> There's a repository called kiamol we can use

```
git remote -v

git remote add gogs http://localhost:30300/kiamol/kiamol.git

git push --set-upstream gogs main
```

> All the code is in your local Git server. This is the buid pipeline: http://localhost:30300/kiamol/kiamol/src/main/labs/jenkins/project/Jenkinsfile

## Run the pipeline in Jenkins

http://localhost:30880

Log in

- username `kiamol`
- password `kiamol`

Browse to project http://localhost:30880/job/kiamol/

Click Enable; wait a minute or click Build Now

View logs; all OK then check your registry, e.g. https://hub.docker.com/r/sixeyed/whoami-lab/tags


## Add the deployment stage

Test deployment locally with new image:

helm upgrade --install whoami-dev --set serverImage=docker.io/sixeyed/whoami-lab:21.09-1 labs\jenkins\project\helm\whoami

curl localhost:30820

Helm commented out in Jenkinsfile - needs a registry secret in int namespace:

```
k create ns integration-test

k label ns integration-test kubernetes.courselabs.co=jenkins

```

Assuming you have your creds in the same session;

```
kubectl create secret docker-registry -n integration-test registry-creds --docker-server=$REGISTRY_SERVER --docker-username=$REGISTRY_USER --docker-password=$REGISTRY_PASSWORD
```

Now uncomment the stage and push the changes to Gogs

```
# remove /* and */ comment lines from Jenkinsfile

git add --all 'Enable CD'

git push gogs
```

Hit Build Now a few times - check build succeeds

k get rs -n integration-test -o wide

> You should see the updated build versions in the image tags

## Lab

Update the release:

- latest golang sdk on latest alpine OS
- image doesn't need OS tools


## Cleanup

helm uninstall whoami-dev

helm uninstall whoami-int -n integration-test

k delete ns -l kubernetes.courselabs.co=jenkins