# Docker and Container Basics - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now practiced working with container images, building custom images with Dockerfiles, running containers, and pushing to registries.

Here's what you need to know for CKAD: The exam doesn't test Docker commands directly, but it absolutely tests container concepts. You'll specify container images in Pods, understand image pull behavior, troubleshoot image pull failures, and diagnose container crashes. Container knowledge is foundational.

That's what we're going to focus on in this next section: applying container knowledge to Kubernetes Pod specifications and troubleshooting.

## What Makes CKAD Different

The CKAD exam assumes container knowledge. You won't build Docker images during the exam, but you'll work with containers constantly through Pod specifications. Understanding how containers work helps you troubleshoot faster and configure Pods correctly.

For container-related CKAD content, the exam may test you on:

**Image specification in Pods** - Setting `image` in container specs using proper naming: `registry/repository:tag`. Understanding that missing tags default to `latest`. Knowing how to reference images from private registries.

**Image pull policies** - Understanding `imagePullPolicy`: Always (always pull), Never (never pull, must exist locally), IfNotPresent (pull if not cached). Knowing that `latest` tag uses Always by default, while versioned tags use IfNotPresent.

**Container commands and arguments** - Using `command` to override ENTRYPOINT and `args` to override CMD from the Dockerfile. Understanding how these interact and when to use each.

**Working directories** - Setting `workingDir` in container specs to change the starting directory, overriding Dockerfile WORKDIR.

**Troubleshooting image pull failures** - Diagnosing "ImagePullBackOff" or "ErrImagePull" errors. Understanding authentication failures for private registries, checking image name spelling, and verifying image tags exist.

**Understanding container exit codes** - Knowing that exit code 0 means success, non-zero means failure. Recognizing common codes: 137 (OOMKilled), 143 (SIGTERM), 1 (general error). Using these to diagnose crashes.

## What's Coming

In the upcoming CKAD-focused video, we'll focus on container concepts as they apply to Kubernetes. You'll practice specifying images correctly in Pod specs. You'll troubleshoot image pull failures and container crashes. You'll understand how Dockerfile instructions translate to Pod configurations.

We'll cover exam patterns: specifying container images with full registry paths, setting image pull policies appropriately, overriding container commands and args, using imagePullSecrets for private registries, and diagnosing why containers won't start or keep crashing.

We'll also explore troubleshooting workflows: when you see ImagePullBackOff, check image name, tag, and registry authentication. When you see CrashLoopBackOff, check container logs and exit code. When you see OOMKilled, check memory limits and requests.

Finally, we'll ensure you can translate container knowledge to Kubernetes pod specifications quickly and accurately.

## Exam Mindset

Remember: CKAD tests Kubernetes, not Docker. But container knowledge makes you faster and more effective. Understanding how images, commands, and containers work helps you configure Pods correctly and troubleshoot efficiently.

When you see container errors in the exam, your container knowledge helps you diagnose faster. Don't waste time guessing - use systematic troubleshooting based on container fundamentals.

Let's dive into applying container knowledge to CKAD scenarios!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with Pod configurations
- Serious but encouraging tone - this is exam preparation

**Tone:**
- Shift from Docker commands to Kubernetes applications
- Emphasize troubleshooting value
- Build confidence through knowledge transfer

**Key Messages:**
- CKAD doesn't test Docker commands directly
- Container knowledge helps troubleshooting
- Image pull and crash issues are common
- The upcoming content connects containers to Kubernetes

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
