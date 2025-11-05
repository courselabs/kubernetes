# BuildKit and Container Building - Quickfire Questions

Test your knowledge of BuildKit and in-cluster container building with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is BuildKit?

A) A Kubernetes tool
B) An improved backend for building Docker/OCI images with better performance and features
C) A container runtime
D) A registry

### 2. What advantages does BuildKit offer over traditional Docker builds?

A) Only faster builds
B) Parallel builds, better caching, secrets handling, and multi-platform builds
C) Only better caching
D) No advantages

### 3. How do you enable BuildKit for Docker builds?

A) It's always enabled
B) Set DOCKER_BUILDKIT=1 environment variable
C) Install a plugin
D) Use --buildkit flag

### 4. What is the purpose of building containers in-cluster?

A) To save disk space
B) To build images without Docker Desktop and push directly to registries
C) To encrypt images
D) To reduce image size

### 5. What is Kaniko?

A) A Japanese word
B) A tool for building container images from Dockerfiles inside Kubernetes
C) A container registry
D) A monitoring tool

### 6. What is the main advantage of Kaniko?

A) Faster builds
B) Can build images without requiring Docker daemon or privileged containers
C) Smaller images
D) Better security scanning

### 7. What format does BuildKit support for build output?

A) Only Docker images
B) Docker images, OCI images, tar archives, and registry push
C) Only OCI images
D) Only tar files

### 8. What is a multi-stage build optimization that BuildKit enables?

A) Sequential stage execution
B) Parallel execution of independent stages
C) Automatic stage merging
D) Stage caching only

### 9. How does BuildKit handle secrets during builds?

A) Stores them in the image
B) Supports --secret flag to mount secrets without storing in image layers
C) Encrypts them
D) Secrets are not supported

### 10. What is the buildctl command?

A) A BuildKit controller
B) The CLI for BuildKit daemon (buildkitd)
C) A Docker alias
D) A build configuration tool

---

## Answers

1. **B** - BuildKit is an improved build backend for Docker/OCI images, offering better performance, caching, and features like parallel builds and secret mounting.

2. **B** - BuildKit provides: parallel build stage execution, efficient layer caching, secure secret handling, multi-platform image builds, and better build output options.

3. **B** - Set `DOCKER_BUILDKIT=1` environment variable to enable BuildKit for Docker builds. Docker Desktop has it enabled by default in recent versions.

4. **B** - Building in-cluster eliminates the need for Docker Desktop/daemon on developer machines and allows direct pushing to registries from CI/CD pipelines.

5. **B** - Kaniko is a tool that builds container images from Dockerfiles inside Kubernetes or other containerized environments without requiring Docker daemon.

6. **B** - Kaniko's main advantage is building images in Kubernetes without requiring Docker daemon or running privileged containers, improving security.

7. **B** - BuildKit supports multiple output formats: Docker image format, OCI image format, tar archives, and direct push to registries.

8. **B** - BuildKit can execute independent build stages in parallel, significantly reducing build time for multi-stage Dockerfiles.

9. **B** - BuildKit's `--secret` flag mounts secrets into the build without storing them in image layers or build history, keeping credentials secure.

10. **B** - `buildctl` is the command-line client for interacting with the BuildKit daemon (buildkitd), providing low-level build control and debugging.

---

## Study Resources

- [Lab README](README.md) - BuildKit and in-cluster building
- [Official BuildKit Documentation](https://github.com/moby/buildkit)
- [Kaniko Documentation](https://github.com/GoogleContainerTools/kaniko)
