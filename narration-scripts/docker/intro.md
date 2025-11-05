# Container Images and Dockerfiles - Concept Introduction
## Narration Script for Slideshow (10-12 minutes)

### Slide 1: Introduction (1 min)
**[00:00-01:00]**

Welcome to Container Images and Dockerfiles - a core CKAD topic in "Application Design and Build" (20% of exam).

Topics: Dockerfile structure, multi-stage builds, image optimization, build context, tagging, and using custom images in Kubernetes.

You'll need to write or modify Dockerfiles, build images, and reference them correctly in Pod/Deployment specs.

### Slide 2: Why Dockerfiles Matter for CKAD (1 min)
**[01:00-02:00]**

As a Kubernetes developer:
- Build custom application images (not just use stock images)
- Modify existing images (add configuration, tools, customization)
- Troubleshoot image issues (layers, caching, build context)
- Optimize for production (small, efficient images)

CKAD exam may require: writing/modifying Dockerfiles, building images, multi-stage builds, correct image references in specs.

### Slide 3: Dockerfile Basics (1 min)
**[02:00-03:00]**

Core instructions:
- **FROM**: Base image
- **RUN**: Execute commands during build
- **COPY/ADD**: Add files from build context
- **WORKDIR**: Set working directory
- **ENV**: Set environment variables
- **EXPOSE**: Document port (doesn't publish)
- **CMD**: Default command
- **ENTRYPOINT**: Main executable

Each instruction creates a layer. Layers are cached for efficiency.

### Slide 4: Multi-Stage Builds (1 min)
**[03:00-04:00]**

Multiple FROM statements in one Dockerfile. Each FROM starts a new stage.

Purpose: Separate build environment from runtime environment.

Pattern:
1. Build stage: Use SDK image (large, has compilers)
2. Test stage: Run tests
3. Final stage: Use minimal runtime image, copy compiled artifacts

Result: Small production image without build tools. Repeatable builds without local toolchains.

### Slide 5: Build Stages and Targets (1 min)
**[04:00-05:00]**

Name stages:
```dockerfile
FROM golang:1.16 AS builder
FROM alpine:3.14 AS runtime
```

Build specific stage:
```bash
docker build --target builder -t myapp:test .
```

BuildKit optimization: Skips unused stages, runs stages in parallel. Enable with `DOCKER_BUILDKIT=1`.

### Slide 6: SDK Images and Runtimes (1 min)
**[05:00-06:00]**

SDK images (build stage):
- golang:1.16 - Go compiler and tools
- maven:3.8-openjdk-11 - Java build tools
- node:16 - NPM and Node.js build
- python:3.9 - Pip and Python libraries

Runtime images (final stage):
- alpine:3.14 - Minimal Linux
- golang compiled binaries can use scratch (empty image)
- openjdk:11-jre-slim - Java runtime only
- node:16-alpine - Node.js without build tools

SDK images: 300-800MB. Runtime images: 10-100MB. Huge difference!

### Slide 7: Image Layers and Caching (1 min)
**[06:00-07:00]**

Each Dockerfile instruction creates a layer. Layers are cached based on content.

Order matters: Put frequently changing content last to maximize cache hits.

Good pattern:
```dockerfile
COPY package.json .
RUN npm install  # Cached if package.json unchanged
COPY . .  # Source code changes frequently, goes last
```

Bad pattern:
```dockerfile
COPY . .  # Invalidates cache on any file change
RUN npm install  # Must reinstall even if package.json unchanged
```

### Slide 8: Build Context (1 min)
**[07:00-08:00]**

Build context: Directory sent to Docker daemon (`.` in `docker build -t app .`).

All files in context are sent. Large contexts slow builds.

Use `.dockerignore` to exclude:
```
node_modules/
.git/
*.log
```

For CKAD: Understand build context path matters. `COPY . .` copies from context, not arbitrary locations.

### Slide 9: Image Tagging for Kubernetes (1 min)
**[08:00-09:00]**

Tag format: `[registry/][namespace/]name:tag`

Examples:
- `nginx:1.21` - Docker Hub, official
- `myapp:v1.0.0` - Local image, semantic version
- `gcr.io/project/myapp:latest` - Google Container Registry
- `myregistry.io/team/app:sha-abc123` - Private registry, commit hash

Best practices:
- Use specific versions, not `latest`
- Tag with version numbers or commit SHAs
- Multiple tags: `myapp:v1.0.0`, `myapp:v1.0`, `myapp:v1`

### Slide 10: Using Custom Images in Kubernetes (1 min)
**[09:00-10:00]**

After building:
```bash
docker build -t myapp:v1 .
```

Reference in Pod:
```yaml
spec:
  containers:
  - name: app
    image: myapp:v1
    imagePullPolicy: IfNotPresent
```

ImagePullPolicy:
- `Always`: Always pull (default for `:latest`)
- `IfNotPresent`: Use local if available
- `Never`: Only use local

For local development (Docker Desktop, Minikube): Use `IfNotPresent` or `Never` with local builds.

### Slide 11: Common Issues and Optimization (1 min)
**[10:00-11:00]**

Common issues:
- Large image sizes: Use multi-stage builds, alpine bases
- Slow builds: Optimize layer order, use .dockerignore
- ImagePullBackOff: Wrong image name, tag, or registry auth
- Build context too large: Add .dockerignore

Optimization tips:
- Use official slim/alpine variants
- Combine RUN commands: `RUN apt-get update && apt-get install -y pkg && rm -rf /var/lib/apt/lists/*`
- Don't install unnecessary packages
- Use multi-stage builds

### Slide 12: Summary (1 min)
**[11:00-12:00]**

Key concepts: Multi-stage builds separate build/runtime, image layers and caching, build context and .dockerignore, proper tagging, imagePullPolicy.

For CKAD: Write basic Dockerfiles, understand multi-stage pattern, build and tag images, reference correctly in Kubernetes specs, troubleshoot image pull issues.

Practice: Build a multi-stage image for your language, understand the output, deploy to Kubernetes.
