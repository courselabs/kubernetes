# Advanced Kubernetes Labs

## Overview

This directory contains **advanced Kubernetes topics** that extend beyond the scope of the **Certified Kubernetes Application Developer (CKAD)** exam. While these labs are valuable for real-world Kubernetes operations and platform engineering, they are **not required for CKAD certification**.

---

## 🔧 Labs in This Directory

### CI/CD & GitOps
- **`jenkins/`** - CI/CD pipeline automation with Jenkins on Kubernetes
- **`argo/`** - GitOps continuous delivery with ArgoCD
- **`buildkit/`** - In-cluster container image building with BuildKit

### Observability & Operations
- **`monitoring/`** - Application and cluster monitoring with Prometheus and Grafana
- **`logging/`** - Centralized logging with Elasticsearch, Fluentd, and Kibana (EFK stack)

---

## When to Study These Labs

### For CKAD Candidates
If you're preparing for the **CKAD exam**, focus on the labs in the main `/labs` directory first. These advanced topics are **NOT tested on the CKAD exam**.

**Complete these first:**
- Core labs: pods, services, deployments, configmaps, secrets
- Observability: troubleshooting, productionizing (health checks)
- See: [CKAD-STUDY-GUIDE.md](../CKAD-STUDY-GUIDE.md) for the recommended path

### For Kubernetes Platform Engineers
These labs are excellent for:
- **DevOps Engineers** building CI/CD pipelines on Kubernetes
- **Platform Engineers** setting up observability stacks
- **SREs** implementing monitoring and logging solutions
- **Post-CKAD learners** expanding their Kubernetes expertise

---

## Lab Descriptions

### `jenkins/` - CI/CD with Jenkins
**Topics Covered:**
- Deploying Jenkins on Kubernetes
- Kubernetes plugin for dynamic agents
- Pipeline-as-code with Jenkinsfiles
- Building and deploying applications from Jenkins

**Why Beyond CKAD:**
The CKAD exam focuses on **application deployment**, not CI/CD pipeline construction. While understanding CI/CD is valuable, the exam tests your ability to deploy and manage applications, not build automation pipelines.

**Prerequisites**: Familiarity with Jenkins basics, CI/CD concepts

---

### `argo/` - GitOps with ArgoCD
**Topics Covered:**
- Installing and configuring ArgoCD
- GitOps workflow and principles
- Application syncing from Git repositories
- Declarative continuous delivery

**Why Beyond CKAD:**
ArgoCD and GitOps are **operational patterns** for managing deployments, not part of the core CKAD curriculum. The exam focuses on imperative and declarative Kubernetes operations, not specific GitOps tooling.

**Prerequisites**: Git basics, understanding of Kubernetes deployments

---

### `buildkit/` - In-Cluster Image Building
**Topics Covered:**
- Building container images inside Kubernetes
- BuildKit architecture and security
- Rootless container builds
- Alternative to Docker-in-Docker

**Why Beyond CKAD:**
While the CKAD exam covers **container image basics** (Dockerfiles, multi-stage builds), in-cluster building with BuildKit is an advanced operational pattern not required for the exam.

**Prerequisites**: Docker/container fundamentals, `docker/` lab completion

---

### `monitoring/` - Prometheus & Grafana
**Topics Covered:**
- Deploying Prometheus for metrics collection
- ServiceMonitor and PodMonitor resources
- Grafana dashboards and visualization
- Alerting with Alertmanager

**Why Beyond CKAD:**
The CKAD exam covers **application observability** through kubectl tools, logs, and events. While monitoring is critical in production, setting up full observability stacks like Prometheus/Grafana is beyond the exam scope.

**Prerequisites**: Understanding of Kubernetes services, basic metrics concepts

---

### `logging/` - Centralized Logging (EFK Stack)
**Topics Covered:**
- Elasticsearch for log storage and search
- Fluentd for log collection and aggregation
- Kibana for log visualization and analysis
- DaemonSet patterns for cluster-wide logging

**Why Beyond CKAD:**
The CKAD exam focuses on **accessing container logs** with `kubectl logs`, not setting up centralized logging infrastructure. Understanding logs is critical, but deploying EFK stacks is an operational concern beyond the exam.

**Prerequisites**: Understanding of logs, DaemonSets, persistent storage

---

## Relationship to CKAD Curriculum

| CKAD Domain | Coverage in These Labs | CKAD Requirement |
|-------------|------------------------|------------------|
| Application Design and Build | ❌ Not covered | Core requirement |
| Application Deployment | 🟡 Argo/Jenkins assist deployment | Not required tooling |
| Observability and Maintenance | 🟡 Monitoring/logging extend observability | kubectl tools sufficient |
| Environment, Config & Security | ❌ Not covered | Core requirement |
| Services and Networking | ❌ Not covered | Core requirement |

**Summary**: These labs **supplement** Kubernetes knowledge but are **not substitutes** for CKAD core topics.

---

## Study Recommendations

### If You're Preparing for CKAD
1. ✅ **Complete all core labs first** (see [CKAD-STUDY-GUIDE.md](../CKAD-STUDY-GUIDE.md))
2. ✅ **Pass the CKAD exam**
3. ✅ **Then explore these advanced labs** to expand your expertise

**Priority Order for CKAD:**
```
/labs (CKAD core topics) → CKAD Exam → /labs-advanced (post-certification)
```

### If You're Building Production Systems
1. ✅ **Start with core labs** to understand Kubernetes fundamentals
2. ✅ **Explore these advanced labs** to build production-ready platforms
3. ✅ **Integrate monitoring, logging, and CI/CD** into your workflow

**Priority Order for Production:**
```
/labs (fundamentals) → /labs-advanced (operations) → Production deployment
```

---

## Additional Learning Resources

### CI/CD & GitOps
- **ArgoCD Documentation**: https://argo-cd.readthedocs.io/
- **Jenkins Kubernetes Plugin**: https://plugins.jenkins.io/kubernetes/
- **GitOps Principles**: https://opengitops.dev/

### Observability
- **Prometheus Documentation**: https://prometheus.io/docs/
- **Grafana Tutorials**: https://grafana.com/tutorials/
- **CNCF Observability Landscape**: https://landscape.cncf.io/

### General Kubernetes Operations
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **CNCF Landscape**: https://landscape.cncf.io/

---

## Questions?

- **CKAD Exam Preparation**: See [CKAD-STUDY-GUIDE.md](../CKAD-STUDY-GUIDE.md)
- **Lab Coverage Analysis**: See [CKAD-LAB-ANALYSIS.md](../CKAD-LAB-ANALYSIS.md)
- **Main Lab Directory**: See [/labs](../labs/)

---

*These labs are maintained as part of the kubernetes-ckad repository but are clearly separated to avoid confusion with CKAD exam preparation materials.*

*Last updated: 2025-11-04*
