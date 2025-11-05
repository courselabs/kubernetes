# Docker and Container Images - Quickfire Questions

Test your knowledge of Docker and container images with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the purpose of a Dockerfile?

A) To manage container networks
B) To define instructions for building a container image
C) To run containers
D) To store container logs

### 2. Which Dockerfile instruction sets the base image?

A) PARENT
B) BASE
C) FROM
D) IMAGE

### 3. What is the difference between CMD and ENTRYPOINT in a Dockerfile?

A) CMD provides defaults that can be overridden; ENTRYPOINT sets the main command
B) They are identical
C) ENTRYPOINT is deprecated
D) CMD runs first, then ENTRYPOINT

### 4. Which Dockerfile instruction copies files into the image?

A) IMPORT
B) COPY or ADD
C) TRANSFER
D) MOVE

### 5. What does a multi-stage Dockerfile help with?

A) Running multiple containers
B) Building multiple images at once
C) Creating image backups
D) Reducing final image size by using intermediate build stages

### 6. Which command builds a Docker image from a Dockerfile?

A) docker compile -t myimage .
B) docker make -t myimage .
C) docker create -t myimage .
D) docker build -t myimage .

### 7. What is the purpose of the .dockerignore file?

A) To ignore errors during build
B) To prevent image pushing
C) To hide containers
D) To exclude files from the build context

### 8. How do you tag an image for pushing to a registry?

A) docker rename image-name registry/repository:tag
B) docker tag image-name registry/repository:tag
C) docker push --tag registry/repository:tag
D) docker label image-name registry/repository:tag

### 9. What does the RUN instruction do in a Dockerfile?

A) Defines runtime environment
B) Sets the default command for the container
C) Executes commands during image build and commits the results
D) Runs the container

### 10. What is an OCI-compliant image?

A) An image built with Docker only
B) An image following Open Container Initiative standards
C) An optimized compressed image
D) An encrypted image

---

## Answers

1. **B** - A Dockerfile contains instructions for building a container image, defining the base image, dependencies, files to copy, and commands to run.

2. **C** - The `FROM` instruction sets the base image for the build. Example: `FROM ubuntu:22.04` or `FROM node:18-alpine`.

3. **A** - CMD provides default arguments that can be overridden at runtime. ENTRYPOINT sets the main command that always runs. They can be used together.

4. **B** - Both `COPY` and `ADD` copy files into the image. `COPY` is preferred for simple file copying; `ADD` has additional features (URL support, auto-extraction).

5. **D** - Multi-stage builds use multiple `FROM` instructions to create intermediate stages. The final stage can copy artifacts from earlier stages, reducing final image size.

6. **D** - `docker build -t myimage .` builds an image from the Dockerfile in the current directory, tagging it as "myimage".

7. **D** - The `.dockerignore` file excludes files and directories from the build context, reducing build time and image size (similar to `.gitignore`).

8. **B** - `docker tag source-image registry/repository:tag` creates a new tag. Example: `docker tag myapp docker.io/username/myapp:v1.0`.

9. **C** - `RUN` executes commands during the build process and commits the results as a new image layer. Example: `RUN apt-get update && apt-get install -y curl`.

10. **B** - OCI (Open Container Initiative) compliant images follow industry standards, ensuring compatibility across different container runtimes (Docker, containerd, CRI-O, etc.).

---

## Study Resources

- [Lab README](README.md) - Container image building concepts
- [CKAD Requirements](CKAD.md) - CKAD container image topics
- [Official Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
