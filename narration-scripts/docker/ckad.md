# Container Images - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-20 minutes)

### Section 1: CKAD Image Building Requirements (2 min)
**[00:00-02:00]**

CKAD "Application Design and Build" domain (20%) includes container image creation.

Exam tasks include:
- Write or modify a Dockerfile
- Build an image from Dockerfile
- Use multi-stage builds
- Tag images correctly
- Reference images in Pod/Deployment specs
- Troubleshoot image pull issues

Essential commands are docker build with tag, docker tag for creating additional tags, docker image ls to list images, and kubectl set image to update deployments.

### Section 2: Quick Dockerfile Patterns (3 min)
**[02:00-05:00]**

A basic Dockerfile starts with a FROM instruction for the base image, sets a WORKDIR, copies package files, runs npm install or similar dependency installation, copies the application code, exposes a port, and sets the CMD to run the application.

For multi-stage builds in Go, the first stage uses golang as builder, copies dependencies, downloads modules, copies source code, and builds the binary. The second stage uses a minimal alpine image, copies only the compiled binary from the builder stage, and sets the CMD to run it. This produces much smaller final images.

For multi-stage builds in Node, the builder stage installs dependencies and builds the application. The final stage uses a smaller alpine image, copies only the built artifacts and production dependencies from the builder, then runs the application. This avoids including development dependencies and build tools in the final image.

### Section 3: Build and Tag Efficiently (3 min)
**[05:00-08:00]**

Build with tag using docker build -t with your image name and version.

You can apply multiple tags in a single build command by adding multiple -t flags for each tag like v1.0.0, v1.0, and latest.

Tag an existing image using docker tag with the source and target names. This is useful for adding registry prefixes or additional version tags.

Quick patterns include: Build from a specific directory by providing the path. Build with a specific Dockerfile using the -f flag. Build a specific stage from a multi-stage Dockerfile using the --target flag.

Time-saving tip: Use dry-run with kubectl create deployment to generate YAML templates with your image already specified.

### Section 4: Using Images in Kubernetes (3 min)
**[08:00-11:00]**

In the Pod spec, containers have an image field with your image name and tag, and an imagePullPolicy.

ImagePullPolicy decision tree: If using the latest tag, use Always to always pull. For specific versions, use IfNotPresent to only pull if not cached. For local images only, use Never.

Update images imperatively using kubectl set image on the deployment, then check rollout status to verify the update.

Check the current image by describing the deployment and grepping for Image, or use jsonpath to extract the container image field directly.

### Section 5: Troubleshooting Image Issues (3 min)
**[11:00-14:00]**

ImagePullBackOff means the image cannot be pulled. Get pods to see the status, then describe the pod to check events for the specific error.

Common causes include: Wrong image name or tag, image doesn't exist in the registry, missing registry credentials, or network/registry issues.

Fixes include: Verify the image name using docker image ls. Check if pull secrets exist and describe them to verify configuration. Fix the image reference using kubectl set image with the correct name and tag.

ErrImagePull versus ImagePullBackOff: ErrImagePull means the first attempt failed. ImagePullBackOff means multiple failures have occurred and Kubernetes is backing off before retrying.

### Section 6: Exam Scenarios (3 min)
**[14:00-17:00]**

Scenario 1: Build and deploy. Build the image with docker build and tag, create the deployment referencing that image with kubectl create, then expose it as a service.

Complete this in under 3 minutes.

Scenario 2: Update Dockerfile and rebuild. Edit the Dockerfile, rebuild with a new tag like v2, update the deployment with kubectl set image, then check rollout status to verify.

Scenario 3: Fix ImagePullBackOff. Describe the pod to read the error message, then fix the image reference either by editing the deployment or using kubectl set image with the correct tag.

### Section 7: Exam Tips (2 min)
**[17:00-19:00]**

Speed tips: Use imperative commands to generate YAML. Know common Dockerfile patterns by heart. Practice typing docker build commands quickly. Use describe for troubleshooting efficiently.

Common mistakes include: Typos in image name or tag, wrong build context path, forgetting to specify a tag which defaults to latest, using Always pull policy with local images, and not checking if the build succeeded before proceeding.

Checklist: Can you write a basic Dockerfile? Can you write a multi-stage Dockerfile? Do you know docker build -t syntax? Can you tag images multiple ways? Do you know imagePullPolicy options? Can you update deployment images? Can you troubleshoot ImagePullBackOff?

Practice until these operations take less than 3 minutes each.
