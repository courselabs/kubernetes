# Container Images - Practical Demo
## Narration Script for Hands-On Exercises (15-18 minutes)

### Section 1: Simple Multi-Stage Build (3 min)


Disable BuildKit to see all stages:


Build simple multi-stage image:


Output shows base and build stage content, but not test stage.

Enable BuildKit:


BuildKit skips unused test stage. Build specific stage:


### Section 2: Real Multi-Stage Go App (4 min)


Examine multi-stage Dockerfile:


Build whoami app:


Compare image sizes:


SDK image: 300MB+, App image: <10MB. Run the app:


### Section 3: Build, Tag, and Deploy (4 min)


Build with multiple tags:


Deploy to Kubernetes:


Expose service:


### Section 4: Update and Rollback (3 min)


Build new version:


Update deployment:


Rollback:


### Section 5: ImagePullPolicy and Troubleshooting (3 min)


For local images with Docker Desktop, images are automatically available. For Kind/Minikube, load images:


Common issues:


Cleanup:


Key takeaways: Multi-stage builds create small images, proper tagging for versions, imagePullPolicy for local images, troubleshoot with describe and events.
