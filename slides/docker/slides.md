---
layout: cover
---

# Container Images and Dockerfiles

<div class="abs-br m-6 flex gap-2">
  <carbon-container-software class="text-6xl text-blue-400" />
</div>

<div v-click="1" class="mt-8 text-xl opacity-80">
Application Design and Build • 20% of CKAD exam
</div>

<div v-click="2" class="mt-6 text-lg">
<carbon-edit class="inline-block text-xl text-green-400" /> Dockerfile structure and multi-stage builds
</div>

<div v-click="3" class="mt-2 text-lg">
<carbon-image class="inline-block text-xl text-purple-400" /> Image optimization and build context
</div>

<div v-click="4" class="mt-2 text-lg">
<carbon-tag class="inline-block text-xl text-yellow-400" /> Tagging and using custom images in Kubernetes
</div>

---
layout: center
---

# Why Dockerfiles Matter for CKAD

<div v-click="1" class="mb-6">

```mermaid
graph TB
    D[Kubernetes Developer] --> B[Build custom images]
    D --> M[Modify existing images]
    D --> T[Troubleshoot image issues]
    D --> O[Optimize for production]
    style D fill:#60a5fa
    style B fill:#4ade80
    style M fill:#4ade80
    style T fill:#4ade80
    style O fill:#4ade80
```

</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div v-click="2">
<carbon-edit class="inline-block text-2xl text-blue-400" /> Write/modify Dockerfiles
</div>
<div v-click="3">
<carbon-layers class="inline-block text-2xl text-green-400" /> Multi-stage builds
</div>
<div v-click="4">
<carbon-image class="inline-block text-2xl text-purple-400" /> Build and tag images
</div>
<div v-click="5">
<carbon-tag class="inline-block text-2xl text-yellow-400" /> Reference in Pod specs
</div>
</div>

---
layout: center
---

# Dockerfile Basics

<div v-click="1" class="mb-4">

```dockerfile
FROM node:16
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

</div>

<div class="grid grid-cols-2 gap-4 text-xs">
<div v-click="2">
<carbon-data-base class="inline-block text-2xl text-blue-400" /> <strong>FROM:</strong> Base image
</div>
<div v-click="3">
<carbon-terminal class="inline-block text-2xl text-green-400" /> <strong>RUN:</strong> Execute commands
</div>
<div v-click="4">
<carbon-document class="inline-block text-2xl text-purple-400" /> <strong>COPY/ADD:</strong> Add files
</div>
<div v-click="5">
<carbon-folder class="inline-block text-2xl text-yellow-400" /> <strong>WORKDIR:</strong> Set directory
</div>
<div v-click="6">
<carbon-list class="inline-block text-2xl text-red-400" /> <strong>ENV:</strong> Environment variables
</div>
<div v-click="7">
<carbon-network-3 class="inline-block text-2xl text-orange-400" /> <strong>EXPOSE:</strong> Document port
</div>
<div v-click="8">
<carbon-play class="inline-block text-2xl text-teal-400" /> <strong>CMD:</strong> Default command
</div>
<div v-click="9">
<carbon-terminal class="inline-block text-2xl text-pink-400" /> <strong>ENTRYPOINT:</strong> Main executable
</div>
</div>

<div v-click="10" class="mt-6 text-center text-sm opacity-80">
<carbon-layers class="inline-block text-2xl text-blue-400" /> Each instruction creates a layer
</div>

---
layout: center
---

# Multi-Stage Builds

<div v-click="1" class="mb-6">

```mermaid
graph LR
    S1["Stage 1: Build<br/>(SDK Image)<br/>golang:1.16"] --> S2["Stage 2: Test<br/>Run Tests"]
    S2 --> S3["Stage 3: Runtime<br/>(Minimal Image)<br/>alpine:3.14"]
    S3 --> F["Final: Small Image<br/>+ compiled artifacts"]
    style S1 fill:#ef4444
    style S2 fill:#fbbf24
    style S3 fill:#4ade80
    style F fill:#60a5fa
```

</div>

<div v-click="2" class="text-center mb-4 opacity-80">
Multiple FROM statements • Each FROM starts a new stage
</div>

<div class="grid grid-cols-2 gap-6">
<div v-click="3">
<carbon-tool-box class="text-4xl text-red-400 mb-2" />
<strong>Build Stage</strong><br/>
<span class="text-sm opacity-80">Large SDK with compilers</span>
</div>
<div v-click="4">
<carbon-container-software class="text-4xl text-green-400 mb-2" />
<strong>Runtime Stage</strong><br/>
<span class="text-sm opacity-80">Minimal image with artifacts</span>
</div>
</div>

<div v-click="5" class="mt-6 text-center text-lg">
<carbon-arrow-down class="inline-block text-2xl text-yellow-400" /> Result: 800MB → 50MB
</div>

---
layout: center
---

# Build Stages and Targets

<div v-click="1" class="mb-4">

```dockerfile
FROM golang:1.16 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp

FROM alpine:3.14 AS runtime
COPY --from=builder /app/myapp /usr/local/bin/
CMD ["myapp"]
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="2">
<carbon-tag class="text-4xl text-blue-400 mb-2" />
<strong>Name stages with AS</strong><br/>
<span class="text-sm opacity-80">Reference in later stages</span>
</div>
<div v-click="3">
<carbon-target class="text-4xl text-green-400 mb-2" />
<strong>Build specific stage</strong><br/>
<span class="text-sm opacity-80">docker build --target builder</span>
</div>
</div>

<div v-click="4" class="mt-6 text-center">
<carbon-lightning class="inline-block text-3xl text-yellow-400" /> BuildKit: Skip unused stages, run in parallel
</div>

---
layout: center
---

# SDK Images vs Runtime Images

<div v-click="1">

```mermaid
graph TB
    subgraph SDK["SDK Images (Build Stage)"]
        G[golang:1.16<br/>300-800MB]
        M[maven:3.8-openjdk-11]
        N[node:16]
        P[python:3.9]
    end
    subgraph Runtime["Runtime Images (Final Stage)"]
        A[alpine:3.14<br/>10-100MB]
        S[scratch<br/>0MB]
        J[openjdk:11-jre-slim]
        NA[node:16-alpine]
    end
    SDK --> Runtime
    style SDK fill:#ef4444,color:#fff
    style Runtime fill:#4ade80,color:#000
```

</div>

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="2">
<carbon-tool-box class="text-4xl text-red-400 mb-2" />
<strong>SDK: 300-800MB</strong><br/>
<span class="text-sm opacity-80">Compilers and build tools</span>
</div>
<div v-click="3">
<carbon-container-software class="text-4xl text-green-400 mb-2" />
<strong>Runtime: 10-100MB</strong><br/>
<span class="text-sm opacity-80">Only what's needed</span>
</div>
</div>

---
layout: center
---

# Image Layers and Caching

<div v-click="1">

```mermaid
graph TB
    L1["Layer 1: FROM node:16<br/>✓ Cached"] --> L2["Layer 2: COPY package.json<br/>✓ Cached"]
    L2 --> L3["Layer 3: RUN npm install<br/>✓ Cached"]
    L3 --> L4["Layer 4: COPY . .<br/>✗ Changed"]
    L4 --> L5["Layer 5: CMD<br/>✗ Rebuild"]
    style L1 fill:#4ade80
    style L2 fill:#4ade80
    style L3 fill:#4ade80
    style L4 fill:#fbbf24
    style L5 fill:#fbbf24
```

</div>

<div v-click="2" class="mt-6 text-center opacity-80">
Layers cached based on content • Order matters!
</div>

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="3">
<carbon-checkmark class="text-4xl text-green-400 mb-2" />
<strong>Good Pattern</strong><br/>
<span class="text-sm opacity-80">Copy dependencies first<br/>Source code last</span>
</div>
<div v-click="4">
<carbon-close class="text-4xl text-red-400 mb-2" />
<strong>Bad Pattern</strong><br/>
<span class="text-sm opacity-80">Copy all files first<br/>Invalidates cache</span>
</div>
</div>

---
layout: center
---

# Build Context

<div v-click="1">

```mermaid
graph LR
    D[docker build -t app .] --> C[Build Context<br/>'.' directory]
    C --> S[Sent to Docker daemon]
    S --> B[Available to COPY/ADD]
    style C fill:#60a5fa
    style S fill:#fbbf24
    style B fill:#4ade80
```

</div>

<div v-click="2" class="mt-6 text-center opacity-80">
All files in context are sent • Large contexts slow builds
</div>

<div v-click="3" class="mt-6 mb-4 text-center text-lg">
<carbon-document class="inline-block text-3xl text-blue-400" /> .dockerignore
</div>

<div v-click="4" class="text-sm">

```
node_modules/
.git/
*.log
.env
.DS_Store
```

</div>

<div v-click="5" class="mt-6 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> COPY . . copies from context, not arbitrary locations
</div>

---
layout: center
---

# Image Tagging for Kubernetes

<div v-click="1" class="mb-6 text-center text-lg opacity-80">
Tag format: [registry/][namespace/]name:tag
</div>

<div v-click="2" class="mb-6">

```mermaid
graph TB
    E1["nginx:1.21<br/>Docker Hub, official"]
    E2["myapp:v1.0.0<br/>Local, semantic version"]
    E3["gcr.io/project/app:latest<br/>Google Container Registry"]
    E4["myregistry.io/team/app:sha-abc123<br/>Private registry, commit hash"]
    style E1 fill:#4ade80
    style E2 fill:#60a5fa
    style E3 fill:#a78bfa
    style E4 fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-6">
<div v-click="3">
<carbon-checkmark class="text-4xl text-green-400 mb-2" />
<strong>Best Practices</strong><br/>
<span class="text-sm opacity-80">Specific versions<br/>Semantic versioning<br/>Commit SHAs</span>
</div>
<div v-click="4">
<carbon-close class="text-4xl text-red-400 mb-2" />
<strong>Avoid</strong><br/>
<span class="text-sm opacity-80">Using :latest<br/>No version tags<br/>Overwriting tags</span>
</div>
</div>

---
layout: center
---

# Using Custom Images in Kubernetes

<div v-click="1" class="mb-4">

```yaml
spec:
  containers:
  - name: app
    image: myapp:v1
    imagePullPolicy: IfNotPresent
```

</div>

<div v-click="2">

```mermaid
graph LR
    B[docker build -t myapp:v1 .] --> P[Pod Spec]
    P --> PP[imagePullPolicy]
    PP --> A[Always: Pull every time]
    PP --> I[IfNotPresent: Use local]
    PP --> N[Never: Only local]
    style B fill:#60a5fa
    style A fill:#ef4444
    style I fill:#4ade80
    style N fill:#fbbf24
```

</div>

<div class="grid grid-cols-3 gap-4 mt-6 text-xs">
<div v-click="3" class="text-center">
<carbon-download class="text-3xl text-red-400 mb-1" />
<strong>Always</strong><br/>
Default for :latest
</div>
<div v-click="4" class="text-center">
<carbon-checkmark class="text-3xl text-green-400 mb-1" />
<strong>IfNotPresent</strong><br/>
Local development
</div>
<div v-click="5" class="text-center">
<carbon-close class="text-3xl text-yellow-400 mb-1" />
<strong>Never</strong><br/>
Local only
</div>
</div>

---
layout: center
---

# Common Issues and Optimization

<div class="grid grid-cols-2 gap-6 mt-4">
<div v-click="1">
<carbon-warning class="text-4xl text-red-400 mb-2" />
<strong>Common Issues</strong><br/>
<span class="text-sm opacity-80">• Large image sizes<br/>• Slow builds<br/>• ImagePullBackOff<br/>• Build context too large</span>
</div>
<div v-click="2">
<carbon-lightning class="text-4xl text-green-400 mb-2" />
<strong>Optimization Tips</strong><br/>
<span class="text-sm opacity-80">• Multi-stage builds<br/>• Alpine/slim variants<br/>• Combine RUN commands<br/>• Use .dockerignore</span>
</div>
</div>

<div v-click="3" class="mt-8 mb-4 text-center">
<carbon-clean class="inline-block text-3xl text-blue-400" /> Combine cleanup in same layer:
</div>

<div v-click="4" class="text-xs">

```dockerfile
RUN apt-get update && \
    apt-get install -y pkg && \
    rm -rf /var/lib/apt/lists/*
```

</div>

<div v-click="5" class="mt-4 text-center opacity-80">
Don't install unnecessary packages
</div>

---
layout: center
---

# Summary

<div v-click="1">

```mermaid
mindmap
  root((Dockerfiles))
    Multi-stage
      Build stage SDK
      Runtime stage minimal
      Small images
    Layers & Cache
      Order matters
      Dependencies first
      Source code last
    Build Context
      Sent to daemon
      Use dockerignore
      Keep small
    Tagging
      Specific versions
      Avoid latest
      Semantic versioning
    Kubernetes
      imagePullPolicy
      IfNotPresent for dev
      Image reference in Pod
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Multi-stage builds separate build/runtime environments
</div>

<div v-click="3" class="mt-2 text-center text-lg">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Layer order matters for cache efficiency
</div>

---
layout: center
---

# CKAD Exam Focus

<div v-click="1" class="text-center mb-6">
<carbon-certificate class="inline-block text-6xl text-blue-400" />
</div>

<div class="grid grid-cols-2 gap-4 text-sm">
<div v-click="2">
<carbon-edit class="inline-block text-2xl text-green-400" /> Write basic Dockerfiles
</div>
<div v-click="3">
<carbon-layers class="inline-block text-2xl text-green-400" /> Multi-stage build pattern
</div>
<div v-click="4">
<carbon-terminal class="inline-block text-2xl text-green-400" /> Build and tag images
</div>
<div v-click="5">
<carbon-tag class="inline-block text-2xl text-green-400" /> Reference correctly in specs
</div>
<div v-click="6">
<carbon-debug class="inline-block text-2xl text-green-400" /> Troubleshoot image pull issues
</div>
<div v-click="7">
<carbon-settings class="inline-block text-2xl text-green-400" /> Understand imagePullPolicy
</div>
</div>

<div v-click="8" class="mt-8 text-center text-lg">
<carbon-terminal class="inline-block text-3xl text-purple-400" /> Practice: Build multi-stage images for your language!
</div>
