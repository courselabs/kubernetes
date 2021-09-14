# Building Docker Images with BuildKit

## Run the BuildKit server

k apply -f labs\buildkit\specs\buildkitd

k logs -l app=buildkitd

This is a server we can use to build container images from a Dockerfile.

## Build an image with BuildKit


k apply -f labs\buildkit\specs\sleep

k exec -it sleep -- sh

Install the BuildKit release:

```
wget https://github.com/moby/buildkit/releases/download/v0.9.0/buildkit-v0.9.0.linux-amd64.tar.gz

tar xvf buildkit-v0.9.0.linux-amd64.tar.gz
```


Download a Dockerfile:

```
cd bin

wget https://raw.githubusercontent.com/courselabs/kubernetes/main/labs/docker/simple/Dockerfile

cat Dockerfile
```

Build it:

```
./buildctl --addr tcp://buildkitd:1234 \
  build --frontend=dockerfile.v0 \
        --local context=. \
        --local dockerfile=. \
        --output type=image,name=simple
```

> You'll see familiar output feom Docker build, but the image is building on the remote BuildKit server

## Push image builds to a registry


BuildKit can automatically push images to a registry, but it needs to be authenticated. Try building and pushing to the `courselabs` org on Docker Hub:

```
./buildctl --addr tcp://buildkitd:1234 \
  build --frontend=dockerfile.v0 \
        --local context=. \
        --local dockerfile=. \
        --output type=image,name=docker.io/courselabs/simple,push=true
```

> The build will work, but you'll get a 401 authorization failed error on the push

Exit the sleep Pod:

```
exit
```

- create registry secret, use Docker Hub or your own reg

windows:

```
$REGISTRY_SERVER='https://index.docker.io/v1/'
$REGISTRY_USER=Read-Host -Prompt 'Username'
$password = Read-Host -Prompt 'Password'-AsSecureString
$REGISTRY_PASSWORD = [System.Net.NetworkCredential]::new("", $password).Password
```

linux:

```
REGISTRY_SERVER='https://index.docker.io/v1/'
read REGISTRY_USER
read -s REGISTRY_PASSWORD
```

all:

```
kubectl create secret docker-registry registry-creds --docker-server=$REGISTRY_SERVER --docker-username=$REGISTRY_USER --docker-password=$REGISTRY_PASSWORD
```

Set your registry domain and repository name in a configmap:

```
kubectl create configmap build-config --from-literal=REGISTRY=docker.io  --from-literal=REPOSITORY=courselabs
```

```
k apply -f labs\buildkit\specs\buildkit-cli

k exec -it buildkit-cli -- sh

printenv

ls /root/.docker
```

> If you cat the config.json file you'll see your creds in plain text...

```
cd ~

wget https://raw.githubusercontent.com/courselabs/kubernetes/main/labs/docker/simple/Dockerfile

buildctl --addr tcp://buildkitd:1234 \
  build --frontend=dockerfile.v0 \
        --local context=. \
        --local dockerfile=. \
        --output type=image,name=${REGISTRY}/${REPOSITORY}/simple,push=true
```

> On Docker Hub you can check your page, e.g. https://hub.docker.com/r/courselabs/simple/tags; or on other registries run `docker pull ...`

## Lab

Versioning - build a new version of the Docker image and push it with a new tag. Use an environment variable for the version number, so your build command is the same every time.

___

## Cleanup

Cleanup by removing objects with this lab's label:

```
kubectl delete deploy,svc,pod -l kubernetes.courselabs.co=buildkit
```