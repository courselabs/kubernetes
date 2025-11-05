# Container Images - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-20 minutes)

### Section 1: CKAD Image Building Requirements (2 min)
**[00:00-02:00]**

CKAD "Application Design and Build" domain (20%) includes container image creation.

Exam tasks:
- Write or modify a Dockerfile
- Build an image from Dockerfile
- Use multi-stage builds
- Tag images correctly
- Reference images in Pod/Deployment specs
- Troubleshoot image pull issues

Essential commands:
```bash
docker build -t name:tag .
docker tag source target
docker image ls
kubectl set image deployment/app container=image:tag
```

### Section 2: Quick Dockerfile Patterns (3 min)
**[02:00-05:00]**

**Basic Dockerfile**:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Multi-stage (Go)**:
```dockerfile
FROM golang:1.16 AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o app

FROM alpine:3.14
COPY --from=builder /app/app /app
CMD ["/app"]
```

**Multi-stage (Node)**:
```dockerfile
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

### Section 3: Build and Tag Efficiently (3 min)
**[05:00-08:00]**

Build with tag:
```bash
docker build -t myapp:v1.0.0 .
```

Multiple tags:
```bash
docker build -t myapp:v1.0.0 -t myapp:v1.0 -t myapp:latest .
```

Tag existing image:
```bash
docker tag myapp:v1.0.0 registry.io/team/myapp:v1.0.0
```

Quick patterns:
```bash
# Build from specific directory
docker build -t app:v1 ./path/to/context

# Build with specific Dockerfile
docker build -t app:v1 -f Dockerfile.prod .

# Build specific stage
docker build -t app:test --target test .
```

Time-saving: Use dry-run for Kubernetes specs:
```bash
kubectl create deployment app --image=myapp:v1 --dry-run=client -o yaml > app.yaml
```

### Section 4: Using Images in Kubernetes (3 min)
**[08:00-11:00]**

Image reference in Pod:
```yaml
spec:
  containers:
  - name: app
    image: myapp:v1.0.0
    imagePullPolicy: IfNotPresent
```

ImagePullPolicy decision:
- `:latest` tag → Always
- Specific version → IfNotPresent
- Local image only → Never

Update image imperatively:
```bash
kubectl set image deployment/app app=myapp:v2.0.0
kubectl rollout status deployment/app
```

Check current image:
```bash
kubectl describe deployment app | grep Image
kubectl get deployment app -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### Section 5: Troubleshooting Image Issues (3 min)
**[11:00-14:00]**

**ImagePullBackOff**:
```bash
kubectl get pods  # See ImagePullBackOff
kubectl describe pod <name>  # Check events
```

Common causes:
1. Wrong image name/tag
2. Image doesn't exist in registry
3. Missing registry credentials
4. Network/registry issues

Fixes:
```bash
# Verify image name
docker image ls | grep myapp

# Check pull secret
kubectl get secrets
kubectl describe secret regcred

# Fix image reference
kubectl set image deployment/app app=correct-image:tag
```

**ErrImagePull** vs **ImagePullBackOff**:
- ErrImagePull: First attempt failed
- ImagePullBackOff: Multiple failures, backing off

### Section 6: Exam Scenarios (3 min)
**[14:00-17:00]**

**Scenario 1**: Build and deploy
```bash
# Build image
docker build -t webapp:v1 ./app

# Create deployment
kubectl create deployment webapp --image=webapp:v1 --replicas=3

# Expose
kubectl expose deployment webapp --port=80 --target-port=8080
```

Time: <3 minutes

**Scenario 2**: Update Dockerfile and rebuild
```bash
# Edit Dockerfile
vi Dockerfile

# Rebuild with new tag
docker build -t webapp:v2 .

# Update deployment
kubectl set image deployment/webapp webapp=webapp:v2
kubectl rollout status deployment/webapp
```

**Scenario 3**: Fix ImagePullBackOff
```bash
kubectl describe pod <name>  # Read error
# Fix image reference
kubectl edit deployment webapp
# or
kubectl set image deployment/webapp webapp=correct:tag
```

### Section 7: Exam Tips (2 min)
**[17:00-19:00]**

**Speed tips**:
1. Use imperative commands to generate YAML
2. Know common Dockerfile patterns by heart
3. Practice typing `docker build` commands
4. Use describe for troubleshooting quickly

**Common mistakes**:
- Typo in image name/tag
- Wrong build context path
- Forgetting to specify tag (defaults to latest)
- Using `Always` pull policy with local images
- Not checking if build succeeded

**Checklist**:
- [ ] Can write basic Dockerfile
- [ ] Can write multi-stage Dockerfile
- [ ] Know docker build -t syntax
- [ ] Can tag images multiple ways
- [ ] Know imagePullPolicy options
- [ ] Can update deployment image
- [ ] Can troubleshoot ImagePullBackOff

Practice until these operations take <3 minutes each.
