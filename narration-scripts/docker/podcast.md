# Container Images and Dockerfiles - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening (1 min)

Welcome to this session on container images and Dockerfiles. This is a core CKAD topic in the "Application Design and Build" domain, worth twenty percent of the exam. While Kubernetes orchestrates containers, you need to understand how those containers are built in the first place.

Today we'll explore Dockerfiles and how they define container images, multi-stage builds that separate build environments from runtime environments, image optimization techniques for smaller and faster images, build context and caching strategies, proper image tagging for Kubernetes, and how to troubleshoot image-related issues in Pods.

For CKAD, you'll need to write or modify Dockerfiles, build images using docker build, understand multi-stage patterns, and correctly reference custom images in Pod and Deployment specifications. Let's dive into these essential container skills.

---

## Why Dockerfiles Matter for CKAD (2 min)

As a Kubernetes application developer, you're not just deploying existing images - you're often creating custom images for your applications. Understanding Dockerfiles is essential for this work.

In the real world, you'll build custom application images packaging your code, dependencies, and configuration. You'll modify existing images, adding tools, updating configurations, or installing additional software. You'll need to troubleshoot image issues like understanding why images are large and slow to pull, why builds are slow and bust cache frequently, or why containers fail with "file not found" errors that trace back to build context issues.

You'll also optimize for production, creating small efficient images that minimize attack surface and reduce pull times. And you'll ensure repeatability, so builds produce identical results regardless of where or when they run.

The CKAD exam may require you to write basic Dockerfiles from scratch or modify existing ones to fix issues or add functionality. You'll need to understand multi-stage builds, which are the standard pattern for production images. You'll build images using docker build commands with appropriate flags. And you'll reference your custom images correctly in Kubernetes manifests.

This isn't just about passing the exam - understanding container image creation makes you a more effective Kubernetes developer who can troubleshoot the full stack from build to deployment.

---

## Dockerfile Fundamentals (3 min)

Let's explore the core Dockerfile instructions you need to master.

FROM specifies the base image, the foundation your image builds upon. Every Dockerfile starts with FROM. You might use FROM ubuntu:20.04 for a general Ubuntu base, FROM node:16-alpine for Node.js applications with a minimal Alpine Linux base, or FROM golang:1.16 AS builder for Go builds, where the AS clause names the build stage for multi-stage builds.

RUN executes commands during the build process. Each RUN instruction creates a new layer in the image. You might use RUN apt-get update && apt-get install -y curl to install packages, combining commands to minimize layers. Or RUN npm install to install Node.js dependencies. The key is that RUN happens at build time, not when containers start.

COPY and ADD transfer files from your build context into the image. COPY is simpler and preferred. COPY package.json period copies a file, or COPY period period copies everything. ADD has extra features like extracting tar archives and downloading URLs, but these features are rarely needed. Stick with COPY unless you specifically need ADD's capabilities.

WORKDIR sets the working directory for subsequent instructions. It's like running cd but creates the directory if it doesn't exist. WORKDIR /app changes to the app directory, making subsequent COPY and RUN commands execute there.

ENV sets environment variables available in the container. ENV NODE_ENV=production sets Node environment mode. ENV PORT=3000 configures the application port. These variables are baked into the image and available when containers run.

EXPOSE documents which ports the container listens on. EXPOSE 8080 indicates the app uses port 8080. Important: EXPOSE doesn't actually publish the port - it's documentation for users and a signal to Kubernetes about what ports exist.

CMD specifies the default command to run when containers start. CMD ["npm", "start"] runs npm start. Only one CMD per Dockerfile - the last one wins. CMD can be overridden when running containers.

ENTRYPOINT defines the main executable. Unlike CMD, ENTRYPOINT isn't easily overridden. ENTRYPOINT ["./myapp"] makes the container always run myapp. You can combine ENTRYPOINT and CMD where ENTRYPOINT is the executable and CMD provides default arguments.

Understanding that each instruction creates a layer is crucial. Layers are cached and reused between builds. This makes subsequent builds faster when earlier layers haven't changed. But it also means image size accumulates - each RUN command adds a layer, even if it deletes files created earlier.

---

## Multi-Stage Builds (4 min)

Multi-stage builds are one of the most important patterns for production images, and they're a common CKAD topic. Let's understand what they are and why they matter.

A multi-stage Dockerfile contains multiple FROM statements, each starting a new stage. Think of each stage as a separate environment. Early stages might be build environments with compilers and development tools. Later stages are runtime environments with only what's needed to run the application.

The key benefit is separation of concerns. You need different things at build time versus runtime. At build time, you need compilers, build tools, development dependencies, and full SDK images. At runtime, you only need the compiled binary or application code, runtime dependencies, and minimal base images.

Without multi-stage builds, you'd either create fat images containing both build and runtime dependencies, wasting space and increasing attack surface. Or you'd use separate Dockerfiles and manual copy steps between them, making builds complex and error-prone.

Multi-stage builds solve this elegantly. Let's walk through a typical Go application pattern. The first stage uses FROM golang:1.16 AS builder, naming this stage "builder." It sets WORKDIR /app and copies go.mod and go.sum to download dependencies. It runs go mod download to fetch dependencies. It copies the source code with COPY period period. And finally RUN go build -o myapp compiles the application.

The second stage uses FROM alpine:3.14 for a minimal runtime environment. It sets WORKDIR /app. Then critically, it uses COPY --from=builder /app/myapp period to copy only the compiled binary from the builder stage. It doesn't copy source code, doesn't copy dependencies, doesn't copy build tools. Just the final binary. Then CMD ["./myapp"] runs the application.

The resulting image is tiny - maybe five to fifteen megabytes - compared to hundreds of megabytes if it included the full Go SDK. The builder stage is discarded after the build completes, never becoming part of the final image.

You can name stages with AS and reference them in COPY --from=stagename. You can have multiple stages - maybe a build stage, a test stage that runs unit tests, and a final stage for the runtime. You can even build specific stages using docker build --target=stagename, useful for testing intermediate stages.

BuildKit, the modern Docker build engine, optimizes multi-stage builds automatically. It only builds stages that are needed. If your final stage doesn't reference an intermediate stage, BuildKit skips it entirely. It also runs independent stages in parallel when possible, speeding up builds.

For CKAD, expect questions involving multi-stage builds. Practice the pattern: FROM sdk AS builder, build steps, FROM minimal, COPY --from=builder, and CMD. This pattern appears across languages - Go, Java, Node.js, Python - with similar structures but language-specific details.

---

## Image Layers and Caching (3 min)

Understanding image layers and build caching is crucial for efficient Dockerfile writing and for troubleshooting slow builds.

Each Dockerfile instruction creates a layer. These layers stack on top of each other to form the final image. Layers are immutable - once created, they never change. They're identified by cryptographic hashes based on their contents.

Docker caches layers aggressively. When you rebuild an image, Docker checks if it can reuse layers from previous builds. For each instruction, Docker looks at the instruction itself and the files it references. If nothing changed, it reuses the cached layer. If something changed, it rebuilds that layer and all subsequent layers.

This cache invalidation cascades. As soon as one layer changes, all layers after it must be rebuilt, even if their instructions haven't changed. This is why instruction order matters enormously.

Here's a bad pattern. COPY period period copies all source code. Then RUN npm install installs dependencies. Every time you change any source file - which happens constantly during development - the COPY layer changes. This invalidates npm install's cache, forcing a complete dependency reinstall even though package.json didn't change.

Here's the good pattern. COPY package.json period copies only the dependency manifest. Then RUN npm install installs dependencies. This layer only rebuilds when package.json changes. Then COPY period period copies source code. Now source changes don't invalidate the dependency installation. You only reinstall when dependencies actually change, which is much less frequent.

The principle is: put frequently changing content as late as possible. Order instructions from least frequently changing to most frequently changing. Copy dependency manifests before source code. Run package installations before copying application code. Download rarely-changing assets before adding often-modified content.

For CKAD, understand this ordering principle and be able to identify inefficient Dockerfiles that will have poor cache hit rates. When debugging slow builds, look for COPY instructions that invalidate cache unnecessarily.

---

## Build Context and dockerignore (2 min)

The build context is a frequently misunderstood concept that causes real problems if ignored.

When you run docker build -t myapp period, that final period is the build context path. Docker packages everything in that directory and sends it to the Docker daemon. This entire directory becomes available for COPY and ADD instructions.

If your build context is large - say it contains node_modules with thousands of files, git history, log files, or other unneeded content - Docker spends significant time packaging and sending all that data. Builds slow down dramatically. You might see "sending build context" taking seconds or even minutes.

The .dockerignore file solves this problem. It works like .gitignore, specifying files and directories to exclude from the build context. Common entries include node_modules/ since you're installing fresh during the build, .git/ which you never need in images, *.log to exclude log files, .env and .env.* to prevent accidentally copying secrets, and build artifacts like dist/, target/, or bin/.

Best practice: always create a .dockerignore file, even for simple projects. At minimum, exclude version control directories, dependency directories that will be regenerated, temporary files and logs, and any files containing secrets or credentials.

For CKAD, understand that COPY period period copies from the build context, not from arbitrary filesystem locations. If a file isn't in the build context, you can't COPY it. And understand that large build contexts slow builds significantly, fixed by .dockerignore.

---

## Image Tagging for Kubernetes (2 min)

Proper image tagging is essential for managing applications in Kubernetes. Let's understand tagging conventions and best practices.

Image tag format is registry slash namespace slash name colon tag. Each part is optional except name. Examples include nginx:1.21 for Docker Hub official images - no registry or namespace specified, defaulting to Docker Hub and library namespace. myapp:v1.0.0 for local images - no registry or namespace, just name and tag. gcr.io/myproject/myapp:latest for Google Container Registry with full specification. Or myregistry.io/team/app:sha-abc123 for private registries with commit SHA tags.

Best practices for production: never use latest tag in production manifests. Latest is ambiguous - it doesn't tell you what version is running. Use specific version numbers or commit SHAs. Tag with semantic versions like v1.0.0, v1.2.3. Optionally create convenience tags like v1.0 and v1 pointing to latest patch and minor versions. Or tag with git commit SHAs for precise reproducibility, especially useful for continuous deployment.

Build with multiple tags using docker build -t myapp:v1.0.0 -t myapp:v1.0 -t myapp:v1 period. This creates one image with three tags.

For CKAD, know the tag format and understand best practices. When creating Deployments, use specific tags, not latest. When the question says "production-ready," interpret that as requiring specific version tags.

---

## Using Images in Kubernetes (2 min)

After building images, you need to reference them correctly in Kubernetes resources. Let's cover the key considerations.

In Pod or Deployment specs, containers have an image field specifying the full image name with tag. They also have imagePullPolicy controlling when Kubernetes pulls the image.

ImagePullPolicy has three options. Always means pull the image from the registry every time a Pod is created, even if the image exists locally. This is the default for latest tag and ensures you always get current images, but slows Pod startup. IfNotPresent means use the local image if available, only pulling if it's not cached. This is the default for specific version tags and is faster. Never means only use local images, never pulling from registries. This works for locally built images but fails if the image doesn't exist on the node.

For local development with tools like Docker Desktop, images you build locally are automatically available to Kubernetes. Use imagePullPolicy: IfNotPresent or Never to avoid unnecessary pull attempts. For Kind or Minikube, you need to load images explicitly using kind load docker-image myapp:v1 or minikube image load myapp:v1.

For production, use imagePullPolicy: IfNotPresent with specific version tags. This balances caching benefits with reliable updates when you deploy new versions. Use Always only when you genuinely need to pull every time, which is rare.

Image pull secrets are required for private registries. Create a Secret with registry credentials using kubectl create secret docker-registry. Then reference it in Pod specs with imagePullSecrets. Without proper secrets, Pods fail with ImagePullBackOff errors.

For CKAD, understand imagePullPolicy options and defaults. Know when to use each. Practice creating image pull secrets for private registry scenarios.

---

## Troubleshooting Image Issues (2 min)

Let's cover common image-related problems you'll encounter and need to debug, especially during the CKAD exam.

ImagePullBackOff or ErrImagePull means Kubernetes can't pull the image. Check kubectl get pods to see the status, then kubectl describe pod to check events. Common causes include wrong image name or tag - check for typos. Image doesn't exist in the registry - verify with docker pull locally. Missing registry credentials - create and reference image pull secrets. Or network issues preventing registry access.

Containers failing with "file not found" or "cannot execute binary" often indicates build context problems. The file wasn't copied into the image correctly. Check your COPY instructions - did you copy from the right source path? Is the file in the build context? Check .dockerignore - did you accidentally exclude the file? And verify file permissions - did the COPY preserve execute permissions for binaries?

Slow image pulls mean images are too large. Check image sizes with docker image ls. If images are hundreds of megabytes or larger, optimize using multi-stage builds to remove build tools, alpine base images to reduce OS overhead, combining RUN commands to minimize layers, and removing unnecessary files in the same layer they're created.

Builds failing with "forbidden path outside build context" means COPY tried to access files outside the build context. You can't COPY period period slash somefile from the parent directory. Solution: adjust your build context path, reorganize files to be within the build context, or use build arguments to pass values instead of files.

For CKAD troubleshooting workflow: check Pod events with kubectl describe pod, verify image name and tag are correct, test pulling the image manually with docker pull, check image pull secrets if using private registries, and examine build logs if the problem traces to image creation.

---

## CKAD Exam Strategies (2 min)

Let's focus on exam-specific strategies for working efficiently with container images under time pressure.

For creating Dockerfiles, memorize common patterns for your language. The basic Node.js pattern: FROM node:16-alpine, WORKDIR /app, COPY package files, RUN npm install, COPY source code, EXPOSE port, CMD. The Go multi-stage pattern: FROM golang AS builder, build steps, FROM alpine, COPY --from=builder, CMD. Practice writing these from memory until they're automatic.

For building images, know the command structure: docker build -t name:tag path. Common flags include -t for multiple tags, -f to specify a different Dockerfile name, and --target to build a specific stage in multi-stage builds. Use --no-cache to force rebuilding without cache when debugging cache issues.

For CKAD time management, building images takes time. While docker build runs, move on to other tasks like writing Kubernetes YAML or answering theoretical questions. Don't sit watching build output. Builds can run in background while you work on other problems.

Know quick verification commands. Docker image ls lists images with sizes. Docker history myapp:v1 shows layer history and sizes. Docker inspect myapp:v1 shows detailed image metadata.

Common mistakes to avoid: forgetting to tag images, so they're tagged as none. Using latest in production manifests. Not setting imagePullPolicy appropriately for local images. Typos in image names that cause ImagePullBackOff. And wasting time on complex Dockerfiles when simple ones suffice.

Your mental checklist: can you write a basic Dockerfile? Can you write a multi-stage Dockerfile? Do you know docker build syntax? Can you tag images properly? Do you understand imagePullPolicy options? Can you troubleshoot ImagePullBackOff? Practice until these operations take less than three minutes each.

---

## Summary and Key Takeaways (1 min)

Let's recap the essential concepts about container images and Dockerfiles for CKAD success.

Dockerfiles define how images are built using instructions like FROM for base images, RUN for build commands, COPY for adding files, and CMD for default commands. Each instruction creates a layer that's cached for efficiency.

Multi-stage builds separate build environments from runtime environments. Early stages compile code with full SDKs. Final stages contain only runtime needs. Use COPY --from=stagename to transfer artifacts between stages. This creates much smaller images.

Layer caching speeds up builds. Order instructions from least to most frequently changing. Copy dependency manifests before source code. Run package installations before copying application code. This maximizes cache hits.

Build context is what Docker packages and sends to the daemon. Large contexts slow builds. Use .dockerignore to exclude unnecessary files like node_modules, .git, and logs.

Image tagging uses format registry/namespace/name:tag. In production, use specific version tags or commit SHAs, never latest. Tag images during builds with -t flags.

ImagePullPolicy controls when Kubernetes pulls images. Always pulls every time. IfNotPresent uses cache. Never only uses local. Match policy to your scenario - local development versus production.

Troubleshooting follows clear patterns. ImagePullBackOff means pull failures - check names, tags, and secrets. File not found means build context issues. Slow pulls mean oversized images needing optimization.

For CKAD exam success, memorize common Dockerfile patterns, practice multi-stage builds, understand caching and build context, know image tagging best practices, master imagePullPolicy options, and practice troubleshooting workflows. Container images are fundamental - master these skills and you'll be well-prepared.

Thank you for listening, and good luck with your CKAD preparation!
