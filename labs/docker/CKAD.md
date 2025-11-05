# CKAD Exam Guide: Container Images and Dockerfiles

## Why Container Images Matter for CKAD

**Domain**: Application Design and Build (20% of exam)
**Importance**: ⭐⭐⭐⭐ HIGH - Core developer skill

Understanding how to **define, build, and modify container images** is a **required topic** for CKAD. You will face questions that require you to:
- Write or modify a Dockerfile
- Build container images using `docker build`
- Use multi-stage builds for efficient images
- Understand image layers and caching
- Reference images correctly in Kubernetes manifests
- Tag and version images appropriately

**Time estimate**: 6-10 minutes per container image question on the exam

---

## Quick Reference for the Exam

### Basic Dockerfile Structure

```dockerfile
# Start from a base image
FROM ubuntu:22.04

# Set working directory
WORKDIR /app

# Copy files
COPY app.js /app/

# Install dependencies
RUN apt-get update && apt-get install -y nodejs

# Set environment variables
ENV NODE_ENV=production

# Expose ports (documentation only)
EXPOSE 3000

# Define startup command
CMD ["node", "app.js"]
```

### Multi-Stage Build Pattern

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /app/myapp

# Final stage (smaller)
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/myapp /app/
CMD ["/app/myapp"]
```

### Essential Docker Commands

```bash
# Build an image
docker build -t myapp:v1.0 .

# Build with specific Dockerfile
docker build -t myapp:v1.0 -f Dockerfile.prod .

# Build multi-stage to specific target
docker build -t myapp:test --target test .

# List images
docker images

# Run container to test
docker run myapp:v1.0

# Tag image
docker tag myapp:v1.0 myapp:latest

# Push to registry (if needed)
docker push myregistry/myapp:v1.0
```

---

## Exam Scenarios You'll Face

### Scenario 1: Create a Basic Dockerfile

**Task**: "Create a Dockerfile for a Python application with requirements.txt."

**Solution**:
```dockerfile
FROM python:3.11-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

**Build**:
```bash
docker build -t python-app:v1.0 .
```

### Scenario 2: Multi-Stage Build

**Task**: "Create a multi-stage Dockerfile for a Go application that minimizes the final image size."

**Solution**:
```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app

# Final stage
FROM scratch
COPY --from=builder /app /app
CMD ["/app"]
```

**Build**:
```bash
docker build -t go-app:v1.0 .
```

### Scenario 3: Modify Existing Dockerfile

**Task**: "Modify the Dockerfile to run as non-root user."

**Solution**:
```dockerfile
FROM python:3.11-alpine

# Create non-root user
RUN adduser -D appuser

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# Switch to non-root user
USER appuser

CMD ["python", "app.py"]
```

### Scenario 4: Build and Use in Kubernetes

**Task**: "Build an image and create a Pod that uses it."

**Solution**:
```bash
# Build image
docker build -t my-app:v2.0 .

# Create Pod YAML
cat <<EOF > pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
  - name: app
    image: my-app:v2.0
    imagePullPolicy: Never  # For local images
EOF

# Apply
kubectl apply -f pod.yaml
```

---

## Essential Dockerfile Instructions (Know These!)

### Core Instructions

| Instruction | Purpose | Example |
|-------------|---------|---------|
| `FROM` | Base image (required) | `FROM ubuntu:22.04` |
| `WORKDIR` | Set working directory | `WORKDIR /app` |
| `COPY` | Copy files from host | `COPY app.js /app/` |
| `ADD` | Copy + extract archives | `ADD archive.tar.gz /app/` |
| `RUN` | Execute commands | `RUN apt-get update` |
| `CMD` | Default container command | `CMD ["python", "app.py"]` |
| `ENTRYPOINT` | Container executable | `ENTRYPOINT ["/bin/myapp"]` |
| `ENV` | Set environment variable | `ENV NODE_ENV=production` |
| `EXPOSE` | Document port (metadata) | `EXPOSE 8080` |
| `USER` | Set user/UID | `USER 1000` |

### COPY vs ADD

```dockerfile
# ✅ Use COPY for simple file copying
COPY app.js /app/

# ⚠️ Use ADD only when you need extraction
ADD archive.tar.gz /app/  # Auto-extracts

# ❌ Don't use ADD for simple copies
ADD app.js /app/  # Prefer COPY
```

### RUN vs CMD vs ENTRYPOINT

```dockerfile
# RUN - Executes during build (creates layer)
RUN apt-get update && apt-get install -y nodejs

# CMD - Default command when container starts (can be overridden)
CMD ["node", "app.js"]

# ENTRYPOINT - Main executable (harder to override)
ENTRYPOINT ["python"]
CMD ["app.py"]  # Default args for ENTRYPOINT
```

---

## Multi-Stage Builds (IMPORTANT!)

### Why Multi-Stage?

1. **Smaller images** - Final image doesn't include build tools
2. **Faster deploys** - Less data to transfer
3. **More secure** - Fewer packages = smaller attack surface
4. **Cleaner** - Separation of build and runtime

### Pattern for Compiled Languages

```dockerfile
# Stage 1: Build
FROM golang:1.21 AS builder
WORKDIR /src
COPY . .
RUN go build -o myapp

# Stage 2: Runtime
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /src/myapp .
CMD ["./myapp"]
```

### Pattern for Node.js/Python

```dockerfile
# Stage 1: Dependencies
FROM node:18 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]
```

### Build Specific Stage

```bash
# Build only the builder stage (for testing)
docker build -t myapp:builder --target builder .
```

---

## Exam Tips & Time Savers

### ✅ DO This

1. **Use multi-stage for compiled apps**:
   ```dockerfile
   FROM golang:1.21 AS builder
   # Build here
   FROM alpine
   COPY --from=builder /app /app
   ```

2. **Combine RUN commands** to reduce layers:
   ```dockerfile
   # ✅ Good - one layer
   RUN apt-get update && \
       apt-get install -y nodejs && \
       rm -rf /var/lib/apt/lists/*

   # ❌ Bad - three layers
   RUN apt-get update
   RUN apt-get install -y nodejs
   RUN rm -rf /var/lib/apt/lists/*
   ```

3. **Copy dependencies before source** (better caching):
   ```dockerfile
   # ✅ Good - cache layers
   COPY package.json .
   RUN npm install
   COPY . .  # Source changes don't invalidate npm install

   # ❌ Bad - rebuilds everything on source change
   COPY . .
   RUN npm install
   ```

4. **Use specific tags, not :latest**:
   ```dockerfile
   # ✅ Good
   FROM node:18.17-alpine

   # ❌ Bad
   FROM node:latest
   ```

5. **Run as non-root**:
   ```dockerfile
   RUN adduser -D appuser
   USER appuser
   ```

### ❌ DON'T Do This

1. **Don't use :latest in production**:
   ```dockerfile
   # ❌ Unpredictable
   FROM ubuntu:latest

   # ✅ Specific version
   FROM ubuntu:22.04
   ```

2. **Don't leave secrets in images**:
   ```dockerfile
   # ❌ Secret in image history
   RUN echo "password123" > /app/secret

   # ✅ Use build args or runtime secrets
   ARG API_KEY
   # Or mount secrets at runtime
   ```

3. **Don't install unnecessary packages**:
   ```dockerfile
   # ❌ Bloated image
   RUN apt-get install -y build-essential python3 git curl wget

   # ✅ Only what you need
   RUN apt-get install -y python3
   ```

---

## Common Base Images

### Official Language Images

| Language | Image | Size | Use Case |
|----------|-------|------|----------|
| Python | `python:3.11-alpine` | Small | Production apps |
| Node.js | `node:18-alpine` | Small | Production apps |
| Java | `eclipse-temurin:17-jre` | Medium | Runtime only |
| Go | `golang:1.21-alpine` | Builder | Build stage |
| Go | `alpine:3.18` or `scratch` | Tiny | Final stage |
| .NET | `mcr.microsoft.com/dotnet/aspnet:7.0` | Medium | ASP.NET apps |

### Special Images

| Image | Purpose |
|-------|---------|
| `scratch` | Empty image (for static binaries) |
| `alpine` | Minimal Linux (5MB) |
| `ubuntu:22.04` | Full-featured Linux |
| `busybox` | Minimal utilities |

---

## Using Images in Kubernetes

### Local Images (Development)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: app
    image: myapp:v1.0
    imagePullPolicy: Never  # Don't pull, use local
```

### Registry Images (Production)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: app
    image: myregistry.com/myapp:v1.0
    imagePullPolicy: IfNotPresent  # Pull if not cached
```

### Image Pull Policies

| Policy | When It Pulls | Use Case |
|--------|---------------|----------|
| `Always` | Every time | Latest :tag |
| `IfNotPresent` | If not cached | Versioned tags |
| `Never` | Never | Local dev images |

---

## Troubleshooting on the Exam

### Error: "docker: not found" or Build Fails

**Cause**: Docker not available or incorrect command
**Fix**: Check your environment, ensure docker is running

### Error: "COPY failed"

**Cause**: File doesn't exist in build context
**Fix**: Ensure file is in the same directory as Dockerfile or subdirectory

```dockerfile
# ❌ File not in context
COPY /home/user/app.js /app/

# ✅ Relative to Dockerfile
COPY app.js /app/
```

### Error: "no such file or directory" in Container

**Cause**: Forgot to COPY file or wrong WORKDIR
**Fix**:
```dockerfile
WORKDIR /app
COPY app.js .  # Copies to /app/app.js
```

### Large Image Size

**Cause**: Using full SDK in final stage
**Fix**: Use multi-stage build

```dockerfile
# ❌ Large (includes build tools)
FROM golang:1.21
COPY . .
RUN go build -o app
CMD ["./app"]

# ✅ Small (only runtime)
FROM golang:1.21 AS builder
RUN go build -o app
FROM alpine
COPY --from=builder /app .
CMD ["./app"]
```

---

## Practice Scenarios (Time Yourself: 8 minutes each)

### Practice 1: Basic Dockerfile

Create a Dockerfile for a Node.js app with package.json.

<details>
<summary>Solution</summary>

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build:
```bash
docker build -t node-app:v1.0 .
```
</details>

### Practice 2: Multi-Stage Go Build

Create a multi-stage Dockerfile for a Go app that produces a minimal image.

<details>
<summary>Solution</summary>

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app

FROM scratch
COPY --from=builder /app /app
CMD ["/app"]
```

Build:
```bash
docker build -t go-app:v1.0 .
```
</details>

### Practice 3: Add Non-Root User

Modify a Dockerfile to run as UID 1000.

<details>
<summary>Solution</summary>

```dockerfile
FROM python:3.11-alpine

RUN adduser -D -u 1000 appuser

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

USER 1000

CMD ["python", "app.py"]
```
</details>

### Practice 4: Build and Deploy

Build an image and create a Deployment using it.

<details>
<summary>Solution</summary>

```bash
# Build
docker build -t myapp:v2.0 .

# Create deployment
kubectl create deployment myapp --image=myapp:v2.0 --dry-run=client -o yaml > deployment.yaml

# Edit to add imagePullPolicy
vi deployment.yaml
# Add: imagePullPolicy: Never (under image line)

# Apply
kubectl apply -f deployment.yaml
```
</details>

---

## Common Exam Patterns

### Pattern 1: "Build a container image"

**Approach**:
1. Create or modify Dockerfile
2. Use `docker build -t <name>:<tag> .`
3. Verify with `docker images`
4. Test with `docker run <image>`

### Pattern 2: "Optimize image size"

**Approach**:
1. Use multi-stage build
2. Use alpine or small base images
3. Combine RUN commands
4. Remove build artifacts

### Pattern 3: "Create Pod using custom image"

**Approach**:
1. Build image with specific tag
2. Create Pod YAML
3. Set `imagePullPolicy: Never` for local images
4. Apply and verify

---

## Exam Day Checklist

Before completing a container image question:

- [ ] **Dockerfile syntax** - FROM, COPY, RUN, CMD correct?
- [ ] **Working directory** - WORKDIR set?
- [ ] **Multi-stage** - Need to minimize size?
- [ ] **Build command** - Correct tag and context (`.`)?
- [ ] **Test locally** - Does `docker run` work?
- [ ] **Kubernetes manifest** - imagePullPolicy set correctly?

---

## Key Points to Remember

1. **FROM is required** - Every Dockerfile starts with FROM
2. **Multi-stage saves space** - Build stage + final stage
3. **COPY before build** - Dependencies first, source last (caching)
4. **Combine RUNs** - Use && to reduce layers
5. **Use specific tags** - Not :latest
6. **Run as non-root** - USER instruction for security
7. **EXPOSE is documentation** - Doesn't actually expose ports
8. **imagePullPolicy: Never** - For local images in Kubernetes

---

## Time Management

**Typical exam question**: 8-10 minutes

| Task | Time |
|------|------|
| Read requirements | 1 min |
| Write/modify Dockerfile | 3-4 min |
| Build image | 2-3 min |
| Test and verify | 2-3 min |

If stuck beyond 10 minutes → **flag and move on**

---

## Additional Resources

During the exam you can access:
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

**Bookmark these** before the exam!

---

## Summary

✅ **Master these for CKAD**:
- Basic Dockerfile syntax (FROM, COPY, RUN, CMD)
- Multi-stage builds for size optimization
- docker build command with tags
- Using images in Kubernetes Pods/Deployments
- imagePullPolicy options
- Security: running as non-root
- Layer caching optimization

🎯 **Exam weight**: 20% (Application Design & Build domain)
⏱️ **Time per question**: 8-10 minutes
📊 **Difficulty**: Medium (requires hands-on practice)

Practice building images until you can write Dockerfiles and build commands without looking at references!
