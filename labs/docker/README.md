# Container Images and Dockerfiles

> 🎯 **CKAD Exam Relevance**: Container image building is a core topic in the "Application Design and Build" domain (20% of exam). You need to understand how to define, build, and modify container images using Dockerfiles.

## Why Container Images Matter for CKAD

As a Kubernetes developer, you need to understand container images because:

- **You'll build custom application images** - Most real-world applications aren't just stock images from Docker Hub
- **You'll modify existing images** - Adding configuration, tools, or customizing base images
- **You'll troubleshoot image issues** - Understanding layers, caching, and build context helps debug problems
- **You'll optimize for production** - Small, efficient images deploy faster and use fewer resources

In the CKAD exam, you may need to:
- Write or modify a Dockerfile
- Build an image from a Dockerfile
- Use multi-stage builds to create lean production images
- Tag and reference images correctly in Pod/Deployment specs

## Docker Image Optimization

📘 **CKAD Supplementary** - Helpful for CKAD, may appear on exam

The key to optimizing Docker builds is to use the right base images, and keep your application images small with multi-stage builds. Multi-stage builds use the standard Dockerfile syntax, with multiple stages separated with `FROM` commands. They give you a repeatable build with minimal dependencies.

Multi-stage builds are a great way to centralize your toolset - developers and build servers just need Docker and the source code, all the tools come packaged in Docker images, so everyone's using the same versions.

## Reference

- [Multi-stage build docs](https://docs.docker.com/develop/develop-images/multistage-build/)

- [Official SDK images on Docker Hub](https://hub.docker.com/search?type=image&image_filter=official&category=languages)

<details>
  <summary>Sample Dockerfiles</summary>

It's the standard `docker build` command for multi-stage builds. The Dockerfile syntax uses multiple `FROM` instructions; the patterns are the same for all languages, but the individual details are specific.

These are samples in the major languages:

- [Java app using Maven build](https://github.com/sixeyed/widgetario/blob/main/src/products-api/java/Dockerfile)
- [Go application using Go modules](https://github.com/sixeyed/widgetario/blob/main/src/stock-api/golang/Dockerfile)
- [.NET Core app using Alpine images](https://github.com/sixeyed/widgetario/blob/main/src/web/dotnet/Dockerfile)

</details><br/>

## Multi-Stage Dockerfiles

There are two build engines in Docker - the original and [BuildKit](). They both produce compatible images, but BuildKit is optimized and it's the default in recent Docker installations. 

We'll start by using the original build engine so it's clear what's happening in the build - later we'll switch to BuildKit which has better performance:

```
# on macOS or Linux:
export DOCKER_BUILDKIT=0

# OR with PowerShell:
$env:DOCKER_BUILDKIT=0
```

Here's a [simple multi-stage Dockerfile](./simple/Dockerfile):

- the `base` stage uses Alpine and simulates adding some dependencies
- the `build` stage builds on the base and simulates an app build
- the `test` stage starts from the base, copies in the build output and simulates automated testing
- the final stage starts from base and copies in the build output

📋 Build an image called `simple` from the `labs/docker/simple` Dockerfile.

<details>
  <summary>Not sure how?</summary>

```
# just a normal build:
docker build -t simple ./labs/docker/simple/
```

</details><br/>

> All the stages run, but the final app image only has content explicitly added from earlier stages.

Run a container from the image and it prints content from the base and build stages:

```
docker run simple
```

> The final image doesn't have the additional content from the test stage.

# BuildKit and build targets

BuildKit is an alternative build engine in Docker. It's heavily optimized for multi-stage builds, running stages in parallel and skipping stages if the output isn't used.

Switch to BuildKit by setting an environment variable:

```
# on macOS or Linux:
export DOCKER_BUILDKIT=1

# OR with PowerShell: 
$env:DOCKER_BUILDKIT=1
```

Now repeat the build for the simple Dockerfile - this time Docker will use BuildKit:

```
docker build -t simple:buildkit ./labs/docker/simple/
```

> You'll see output from different stages at the same time - and if you look closely you'll see the test stage is skipped.

📋 Run a container from the new image. Is the output the same? Compare the image details.

<details>
  <summary>Not sure how?</summary>

```
# run a container - the output is the same:
docker run simple:buildkit

# list images - they're the same size but not the same image:
docker image ls simple
```

</details><br/>

BuildKit skips the test stage because none of the output is used in later stages. You can explicitly build an image up to a specific stage with the `target` flag:

```
docker build -t simple:test --target test ./labs/docker/simple/
```

- `--target` states the target stage, Docker will build all stages up to and including the named one

> This image is the output of the test stage *not* the final stage.

📋 Run a container from the test build, printing the contents of the build.txt file.

<details>
  <summary>Not sure how?</summary>

```
# no output here - the test stage has no CMD instruction
docker run simple:test

# run the cat command to see the output
docker run simple:test cat /build.txt
```

</details><br/>

> The output is from the build stage plus the test stage.


## Simple Go application

Real multi-stage builds use an SDK (Software Development Kit) image to compile the app in the build stage and a smaller runtime image (with no build tools) to package the compiled app.

The images you use and the commands you run are different for each language, but you'll find [official images on Docker Hub for all the major platforms](https://hub.docker.com/search?q=&type=image&image_filter=official&category=languages), including:

- [maven](https://hub.docker.com/_/maven) and [gradle](https://hub.docker.com/_/gradle) to build Java apps - using [openjdk]() for the runtime image
- [python](https://hub.docker.com/_/python) - has Pip installed for dependencies
- [node](https://hub.docker.com/_/node) for Node.js apps - this has NPM so you can install packages in the build stage
- [golang](https://hub.docker.com/_/golang) for Go apps - they don't need a runtime so the final image can start from [scratch](https://hub.docker.com/_/scratch)
- [dotnet/sdk](https://hub.docker.com/_/microsoft-dotnet-sdk/) for .NET Core/5 apps, using [dotnet/runtime](https://hub.docker.com/_/microsoft-dotnet-runtime/) or [dotnet/aspnet](https://hub.docker.com/_/microsoft-dotnet-aspnet/) for the final app image

We won't cover different languages in detail. The [whoami Dockerfile](./whoami/Dockerfile) shows how the pattern works, using a Go application:

- the builder stages starts from the Go SDK image
- it installs the OS packages needed to build the app
- then it copies the library list and runs `go mod download` to install the app's dependencies
- next it copies the source code and compiles the app
- the final app image sets up the container environment
- then it copies in the compiled output from the builder

📋 Build an image called `whoami` from the folder `labs/docker/whoami`.

<details>
  <summary>Not sure how?</summary>

```
docker build -t whoami ./labs/docker/whoami/
```

</details><br/>

> You'll see all the stage output from BuildKit.

SDK images are typically very large, having the whole build toolset. You don't want to use an SDK image in your final stage, otherwise you'll have all that stuff in your app image.

📋 Compare the sizes of the `whoami` and `golang` images.

<details>
  <summary>Not sure how?</summary>

```
docker pull golang:1.16.4-alpine

docker image ls -f reference=whoami -f reference=golang
```

</details><br/>

> Woah! The SDK image is over 300MB; the app image is under 10MB.


The app is a simple web server. Run a container publishing a random port and find the port:

```
docker run -d -P --name whoami1 whoami

docker port whoami1
```

> The `EXPOSE` instruction tells Docker the target port for the container; when you use the `-P` flag Docker publishes all exposed ports.

Now you can use the app:

```
curl http://localhost:<port>
```

> The server just prints some details about the environment and the request.

## CKAD Practice: Build, Tag, and Deploy

This section walks through a complete CKAD workflow: building a custom image, tagging it properly, and deploying it to Kubernetes.

### Exercise 1: Build and Tag Images

In CKAD scenarios, you'll often need to build an image with a specific tag. Practice the common patterns:

```
# Build with a version tag:
docker build -t whoami:v1 ./labs/docker/whoami/

# Build with multiple tags (latest + version):
docker build -t whoami:v2 -t whoami:latest ./labs/docker/whoami/

# Build and tag for a registry (e.g., for pushing):
docker build -t myregistry.io/myapp/whoami:v1 ./labs/docker/whoami/
```

📋 Build the whoami image with three different tags: `whoami:dev`, `whoami:1.0.0`, and `whoami:1.0`.

<details>
  <summary>Not sure how?</summary>

```
# You can tag during build:
docker build -t whoami:dev -t whoami:1.0.0 -t whoami:1.0 ./labs/docker/whoami/

# Or tag an existing image:
docker tag whoami:dev whoami:1.0.0
docker tag whoami:dev whoami:1.0

# Verify all tags exist:
docker image ls whoami
```

</details><br/>

### Exercise 2: Using Custom Images in Kubernetes

Once you've built a custom image, you need to reference it correctly in your Kubernetes specs. Here's a deployment that uses our whoami image:

📋 Create a deployment using your custom `whoami:v1` image. The spec file is in [specs/whoami-deployment.yaml](./specs/whoami-deployment.yaml).

<details>
  <summary>Not sure how?</summary>

```
# Apply the deployment:
kubectl apply -f labs/docker/specs/whoami-deployment.yaml

# Check the pods are running:
kubectl get pods -l app=whoami

# Describe a pod to verify it's using your image:
kubectl describe pod -l app=whoami | grep Image
```

</details><br/>

Check the deployment is working by accessing the service:

```
# Create a service:
kubectl apply -f labs/docker/specs/whoami-service.yaml

# Get the service port:
kubectl get svc whoami-svc

# If using a NodePort service, access it:
curl http://localhost:<nodePort>
```

### Exercise 3: Update Deployment with New Image Version

A common CKAD task is updating a deployment to use a new image version:

```
# First, build a new version:
docker build -t whoami:v2 ./labs/docker/whoami/

# Update the deployment to use v2:
kubectl set image deployment/whoami whoami=whoami:v2

# Watch the rollout:
kubectl rollout status deployment/whoami

# Verify the new version is running:
kubectl describe deployment whoami | grep Image
```

📋 Rollback the deployment to v1, then check the rollout history.

<details>
  <summary>Not sure how?</summary>

```
# Rollback to previous version:
kubectl rollout undo deployment/whoami

# Check rollout status:
kubectl rollout status deployment/whoami

# View rollout history:
kubectl rollout history deployment/whoami

# Verify we're back to v1:
kubectl describe deployment whoami | grep Image
```

</details><br/>

### Exercise 4: ImagePullPolicy and Debugging

Understanding `imagePullPolicy` is crucial for CKAD:

- `Always` - Always pull the image from registry (default for `latest` tag)
- `IfNotPresent` - Use local image if available, otherwise pull
- `Never` - Only use local image, fail if not present

When using locally-built images in Kubernetes (like Kind, Minikube, Docker Desktop):

```
# For Kind, load your local image into the cluster:
kind load docker-image whoami:v1

# For Minikube:
minikube image load whoami:v1

# For Docker Desktop, images are automatically available

# Then use imagePullPolicy: IfNotPresent or Never in your specs
```

Common image-related debugging commands:

```
# Check if pod is in ImagePullBackOff or ErrImagePull:
kubectl get pods

# Get detailed error information:
kubectl describe pod <pod-name>

# Check events for image pull issues:
kubectl get events --sort-by='.lastTimestamp'

# Verify image exists locally:
docker image ls | grep whoami
```

### Key Takeaways for CKAD

1. **Tagging**: Always use specific version tags (not `latest`) for production deployments
2. **Multi-stage builds**: Create small, secure images by separating build and runtime stages
3. **Image references**: Format is `[registry/][namespace/]name:tag`
4. **ImagePullPolicy**: Know when to use `Always`, `IfNotPresent`, or `Never`
5. **Troubleshooting**: Use `kubectl describe pod` to debug image pull issues
6. **Updates**: Use `kubectl set image` or `kubectl apply` to update image versions
7. **Rollbacks**: Know how to rollback to previous image versions

## Lab

Apps need special Linux permissions to listen on the standard HTTP ports - even inside a container.

The whoami app supports an option to configure the port it listens on, so you can use a non-standard port and potentially run with tighter security.

Your goal for this lab is to run the whoami app in a container - using the `-port` application argument to listen on a specific port. What happens when you run a container with the `-P` (`--publish-all`) option? Does Docker map the new port correctly?

What do you need to do to run a working container?

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

___
## Cleanup

Cleanup by removing all the whoami containers:

```
docker rm -f $(docker ps -q --filter="name=whoami")
```