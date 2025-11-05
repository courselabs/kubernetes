# Container Images - Practical Demo
## Narration Script for Hands-On Exercises (15-18 minutes)

### Section 1: Simple Multi-Stage Build (3 min)
**[00:00-03:00]**

Disable BuildKit to see all stages:
```bash
export DOCKER_BUILDKIT=0
```

Build simple multi-stage image:
```bash
docker build -t simple ./labs/docker/simple/
docker run simple
```

Output shows base and build stage content, but not test stage.

Enable BuildKit:
```bash
export DOCKER_BUILDKIT=1
docker build -t simple:buildkit ./labs/docker/simple/
```

BuildKit skips unused test stage. Build specific stage:
```bash
docker build -t simple:test --target test ./labs/docker/simple/
docker run simple:test cat /build.txt
```

### Section 2: Real Multi-Stage Go App (4 min)
**[03:00-07:00]**

Examine multi-stage Dockerfile:
```bash
cat labs/docker/whoami/Dockerfile
```

Build whoami app:
```bash
docker build -t whoami ./labs/docker/whoami/
```

Compare image sizes:
```bash
docker pull golang:1.16.4-alpine
docker image ls -f reference=whoami -f reference=golang
```

SDK image: 300MB+, App image: <10MB. Run the app:
```bash
docker run -d -P --name whoami1 whoami
docker port whoami1
curl http://localhost:<port>
```

### Section 3: Build, Tag, and Deploy (4 min)
**[07:00-11:00]**

Build with multiple tags:
```bash
docker build -t whoami:dev -t whoami:1.0.0 -t whoami:1.0 ./labs/docker/whoami/
docker image ls whoami
```

Deploy to Kubernetes:
```bash
kubectl apply -f labs/docker/specs/whoami-deployment.yaml
kubectl get pods -l app=whoami
kubectl describe pod -l app=whoami | grep Image
```

Expose service:
```bash
kubectl apply -f labs/docker/specs/whoami-service.yaml
kubectl get svc whoami-svc
```

### Section 4: Update and Rollback (3 min)
**[11:00-14:00]**

Build new version:
```bash
docker build -t whoami:v2 ./labs/docker/whoami/
```

Update deployment:
```bash
kubectl set image deployment/whoami whoami=whoami:v2
kubectl rollout status deployment/whoami
kubectl describe deployment whoami | grep Image
```

Rollback:
```bash
kubectl rollout undo deployment/whoami
kubectl rollout history deployment/whoami
```

### Section 5: ImagePullPolicy and Troubleshooting (3 min)
**[14:00-17:00]**

For local images with Docker Desktop, images are automatically available. For Kind/Minikube, load images:
```bash
# kind load docker-image whoami:v1
# minikube image load whoami:v1
```

Common issues:
```bash
# ImagePullBackOff - check events
kubectl get pods
kubectl describe pod <name>
kubectl get events --sort-by=.metadata.creationTimestamp

# Verify image exists
docker image ls | grep whoami
```

Cleanup:
```bash
kubectl delete -f labs/docker/specs/
docker rm -f $(docker ps -aq --filter="name=whoami")
```

Key takeaways: Multi-stage builds create small images, proper tagging for versions, imagePullPolicy for local images, troubleshoot with describe and events.
