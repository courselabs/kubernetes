# CKAD Study Guide

**Certified Kubernetes Application Developer (CKAD) Preparation Guide**

**Exam Version**: v1.34
**Last Updated**: 2025-11-04
**Estimated Study Time**: 40-60 hours

---

## About the CKAD Exam

The Certified Kubernetes Application Developer (CKAD) exam is a **performance-based certification** that validates your ability to:
- Design, build, and deploy cloud-native applications for Kubernetes
- Configure application resources and use core primitives
- Observe and debug applications
- Manage application security and configuration

**Exam Details:**
- **Duration**: 2 hours
- **Format**: Performance-based (command line tasks)
- **Passing Score**: 66%
- **Environment**: Browser-based terminal with kubectl and other tools
- **Questions**: 15-20 performance-based tasks
- **Resources**: kubernetes.io documentation allowed during exam

---

## CKAD Domains & Lab Mapping

### Domain 1: Application Design and Build (20%)

**Topics Covered:**
- Define, build and modify container images
- Choose and use the right workload resource
- Understand multi-container Pod design patterns
- Utilize persistent and ephemeral volumes

**Required Labs:**

| Priority | Lab | Time | Key Concepts |
|----------|-----|------|--------------|
| 🎯 HIGH | `pods/` | 90 min | Pod basics, multi-container patterns, init containers, sidecar pattern |
| 🎯 HIGH | `deployments/` | 90 min | Deployments, ReplicaSets, scaling, workload selection |
| 🎯 HIGH | `jobs/` | 60 min | Jobs, CronJobs, batch workloads |
| 🎯 HIGH | `docker/` | 90 min | Container images, Dockerfile, building images, multi-stage builds |
| 📘 MEDIUM | `persistentvolumes/` | 90 min | PersistentVolumes, PersistentVolumeClaims, StorageClasses |
| 📘 MEDIUM | `daemonsets/` | 60 min | DaemonSets, node-level workloads |
| 📘 MEDIUM | `statefulsets/` | 90 min | StatefulSets, ordered deployment, stable storage |

**Domain 1 Total Time**: ~9.5 hours

---

### Domain 2: Application Deployment (20%)

**Topics Covered:**
- Use Kubernetes primitives to implement common deployment strategies
- Understand Deployments and rolling updates
- Use Helm package manager
- Use Kustomize for configuration management

**Required Labs:**

| Priority | Lab | Time | Key Concepts |
|----------|-----|------|--------------|
| 🎯 HIGH | `deployments/` | 90 min | Rolling updates, rollbacks, deployment strategies |
| 🎯 HIGH | `rollouts/` | 75 min | MaxSurge, maxUnavailable, blue/green, canary deployments |
| 📘 MEDIUM | `helm/` | 90 min | Helm charts, values files, releases, templating |
| ⚠️ CRITICAL | `kustomize/` | 90 min | **MISSING - TO BE CREATED** - Base/overlays, patches |

**Domain 2 Total Time**: ~5.5 hours (plus pending Kustomize lab)

---

### Domain 3: Application Observability and Maintenance (15%)

**Topics Covered:**
- Understand API deprecations
- Implement probes and health checks
- Use provided tools to monitor Kubernetes applications
- Utilize container logs
- Debug in Kubernetes

**Required Labs:**

| Priority | Lab | Time | Key Concepts |
|----------|-----|------|--------------|
| 🎯 HIGH | `productionizing/` | 90 min | Liveness probes, readiness probes, startup probes, resource limits |
| 🎯 HIGH | `nodes/` | 60 min | kubectl top, describe, events, cluster inspection |
| 🎯 HIGH | `troubleshooting/` | 90 min | Debugging pods, logs, events, common issues |
| 🎯 HIGH | `troubleshooting-2/` | 90 min | ConfigMap/Secret issues, environment variable debugging |
| 📘 MEDIUM | `pods/` | 30 min | Multi-container logging (from earlier lab) |
| ⚠️ TODO | API Deprecations | 45 min | **MISSING - TO BE ADDED** - kubectl convert, version migration |

**Domain 3 Total Time**: ~6 hours

---

### Domain 4: Application Environment, Configuration and Security (25%)

**Topics Covered:**
- Discover and use resources that extend Kubernetes (CRD)
- Understand authentication, authorization and admission control
- Understand and define resource requirements, limits and quotas
- Understand ConfigMaps and Secrets
- Create and consume Secrets
- Understand ServiceAccounts
- Understand Application Security (SecurityContexts, Capabilities)

**Required Labs:**

| Priority | Lab | Time | Key Concepts |
|----------|-----|------|--------------|
| 🎯 HIGH | `configmaps/` | 75 min | ConfigMaps, environment variables, volume mounts, config injection |
| 🎯 HIGH | `secrets/` | 75 min | Secrets types, creation, consumption, base64 encoding |
| 🎯 HIGH | `namespaces/` | 75 min | ResourceQuotas, LimitRanges, namespace isolation |
| 🎯 HIGH | `productionizing/` | 45 min | Resource requests and limits (from earlier lab) |
| 📘 MEDIUM | `rbac/` | 90 min | Roles, RoleBindings, ServiceAccounts, ClusterRoles |
| 📘 MEDIUM | `operators/` | 60 min | Custom Resource Definitions (CRD basics only) |
| ⚠️ CRITICAL | `security/` | 90 min | **MISSING - TO BE CREATED** - SecurityContexts, capabilities, privilege |

**Domain 4 Total Time**: ~8.5 hours (plus pending Security lab)

---

### Domain 5: Services and Networking (20%)

**Topics Covered:**
- Demonstrate basic understanding of NetworkPolicies
- Provide and troubleshoot access to applications via services
- Use Ingress rules to expose applications

**Required Labs:**

| Priority | Lab | Time | Key Concepts |
|----------|-----|------|--------------|
| 🎯 HIGH | `services/` | 90 min | ClusterIP, NodePort, LoadBalancer, service discovery, DNS |
| 📘 MEDIUM | `networkpolicy/` | 90 min | Network segmentation, ingress/egress rules, pod selectors |
| 📘 MEDIUM | `ingress/` | 90 min | HTTP routing, path/host rules, TLS, ingress controllers |

**Domain 5 Total Time**: ~4.5 hours

---

## Recommended Learning Path

### Phase 1: Fundamentals (Week 1-2) - 12 hours
**Goal**: Master core Kubernetes resources and basic operations

1. **Day 1-2**: `pods/` (90 min) → Basic pod operations, containers, labels
2. **Day 2-3**: `services/` (90 min) → Service types, networking basics
3. **Day 3-4**: `deployments/` (90 min) → Declarative deployments, scaling
4. **Day 4-5**: `configmaps/` (75 min) → Configuration management
5. **Day 5-6**: `secrets/` (75 min) → Secure configuration
6. **Day 6-7**: `namespaces/` (75 min) → Multi-tenancy, quotas
7. **Day 7-8**: `nodes/` (60 min) → Cluster inspection, kubectl mastery
8. **Day 8-9**: `docker/` (90 min) → Image building and management

**Checkpoint**: Can you deploy a multi-container pod with config and secrets?

---

### Phase 2: Application Lifecycle (Week 3) - 8 hours
**Goal**: Deploy, update, and manage application workloads

1. **Day 1-2**: `rollouts/` (75 min) → Update strategies, rollbacks
2. **Day 2-3**: `jobs/` (60 min) → Batch processing, cron jobs
3. **Day 3-4**: `helm/` (90 min) → Package management
4. **Day 4-5**: `daemonsets/` (60 min) → Node-level workloads
5. **Day 5-7**: `statefulsets/` (90 min) → Stateful applications
6. **Day 7**: `persistentvolumes/` (90 min) → Persistent storage

**Checkpoint**: Can you perform a rolling update and rollback a deployment?

---

### Phase 3: Production & Observability (Week 4) - 10 hours
**Goal**: Monitor, debug, and production-harden applications

1. **Day 1-2**: `productionizing/` (90 min) → Health checks, resource management
2. **Day 3-4**: `troubleshooting/` (90 min) → Debugging pods and workloads
3. **Day 4-5**: `troubleshooting-2/` (90 min) → Config and environment issues
4. **Day 6-7**: Review all observability topics (60 min)
5. **Day 7**: Practice timed scenarios (90 min)

**Checkpoint**: Can you debug a failing pod and fix health check issues?

---

### Phase 4: Security & Networking (Week 5) - 8 hours
**Goal**: Secure applications and configure networking

1. **Day 1-2**: `rbac/` (90 min) → Authorization, service accounts
2. **Day 2-3**: Security Lab ⚠️ (90 min) → SecurityContexts, capabilities
3. **Day 3-4**: `networkpolicy/` (90 min) → Network isolation
4. **Day 4-5**: `ingress/` (90 min) → HTTP routing, TLS
5. **Day 5-7**: `operators/` (60 min) → Custom resources (basics)

**Checkpoint**: Can you create a network policy and configure RBAC?

---

### Phase 5: Advanced Topics (Week 6) - 6 hours
**Goal**: Cover remaining CKAD topics and practice

1. **Day 1-2**: Kustomize Lab ⚠️ (90 min) → Configuration overlays
2. **Day 2-3**: API Deprecations ⚠️ (45 min) → Version migration
3. **Day 3-4**: `troubleshooting-3/` (90 min) → Advanced scenarios
4. **Day 4-7**: Review weak areas, practice exercises (120 min)

**Checkpoint**: Review all five domains, identify gaps

---

### Phase 6: Exam Preparation (Week 7-8) - 12 hours
**Goal**: Timed practice and exam readiness

1. **Week 7**:
   - Complete practice scenarios under time pressure
   - Focus on speed and accuracy with kubectl
   - Practice using kubernetes.io documentation efficiently
   - Identify and fix any remaining knowledge gaps

2. **Week 8**:
   - Take practice exams (killer.sh, kubernetes.io)
   - Review all lab challenges under time constraints
   - Build kubectl command muscle memory
   - Final review of all five domains

---

## Essential kubectl Commands

### Speed Tips for the Exam

**Use kubectl shortcuts:**
```bash
alias k=kubectl
k config set-context --current --namespace=<namespace>  # Switch namespace
k api-resources  # Find resource short names
k explain <resource>  # Quick API reference
```

**Imperative commands (faster for exam):**
```bash
# Create resources quickly
k run nginx --image=nginx --dry-run=client -o yaml > pod.yaml
k create deployment nginx --image=nginx --replicas=3
k expose deployment nginx --port=80 --type=NodePort
k create configmap myconfig --from-literal=key=value
k create secret generic mysecret --from-literal=password=secret
k create job myjob --image=busybox -- echo "Hello"

# Quick edits
k edit deployment nginx
k scale deployment nginx --replicas=5
k set image deployment/nginx nginx=nginx:1.21

# Debugging
k describe pod <name>
k logs <pod> -c <container>
k exec -it <pod> -- /bin/sh
k get events --sort-by='.lastTimestamp'
```

**Use -o yaml and --dry-run:**
```bash
# Generate YAML instead of memorizing syntax
k run nginx --image=nginx --dry-run=client -o yaml
k create deployment nginx --image=nginx --dry-run=client -o yaml
```

---

## Practice Exam Strategy

### Time Management
- **2 hours = 120 minutes** for 15-20 questions
- **Average: 6-8 minutes per question**
- **Flag difficult questions**, move on, return later
- **Save 20-30 minutes** for review and flagged questions

### Question Approach
1. **Read carefully** - What's the exact requirement?
2. **Set context** - Switch to correct namespace immediately
3. **Generate YAML** - Use imperative commands when possible
4. **Verify** - Always check your work (kubectl get, describe, logs)
5. **Clean up** - Delete test resources to avoid confusion

### Common Pitfalls
- ❌ **Not switching namespaces** - Always verify context
- ❌ **YAML indentation errors** - Use vim settings or careful editing
- ❌ **Forgetting labels/selectors** - Services won't find pods
- ❌ **Wrong resource types** - Job vs CronJob, Deployment vs StatefulSet
- ❌ **Not verifying** - Always check that pods are running
- ❌ **Spelling mistakes** - Resource names must match exactly

### Vim Configuration for YAML
```bash
# Add to ~/.vimrc for the exam environment
set tabstop=2
set shiftwidth=2
set expandtab
set autoindent
```

---

## Documentation Navigation

**Allowed Resources During Exam:**
- https://kubernetes.io/docs/
- https://kubernetes.io/blog/
- https://helm.sh/docs/ (if applicable)

**Bookmark These Pages:**
1. **kubectl Cheat Sheet**: kubernetes.io/docs/reference/kubectl/cheatsheet/
2. **Pod Spec**: kubernetes.io/docs/reference/generated/kubernetes-api/v1.34/#pod-v1-core
3. **Deployment Spec**: kubernetes.io/docs/reference/generated/kubernetes-api/v1.34/#deployment-v1-apps
4. **ConfigMaps**: kubernetes.io/docs/concepts/configuration/configmap/
5. **Secrets**: kubernetes.io/docs/concepts/configuration/secret/
6. **Network Policies**: kubernetes.io/docs/concepts/services-networking/network-policies/
7. **Probes**: kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
8. **Security Context**: kubernetes.io/docs/tasks/configure-pod-container/security-context/

**Search Strategy:**
- Use **Ctrl+F** to find keywords quickly
- Search for **"example"** to find YAML snippets
- Use the **API reference** for exact field names

---

## Lab Completion Checklist

Track your progress through the required labs:

### Core Labs (Must Complete)
- [ ] `pods/` - Pod fundamentals
- [ ] `services/` - Service types and networking
- [ ] `deployments/` - Deployments and scaling
- [ ] `configmaps/` - Configuration management
- [ ] `secrets/` - Secure configuration
- [ ] `namespaces/` - Resource quotas and limits
- [ ] `jobs/` - Batch workloads
- [ ] `docker/` - Container image building
- [ ] `nodes/` - Cluster inspection and kubectl
- [ ] `productionizing/` - Health checks and resource management

### Advanced Labs (Recommended)
- [ ] `rollouts/` - Deployment strategies
- [ ] `troubleshooting/` - Debugging pods
- [ ] `troubleshooting-2/` - Config troubleshooting
- [ ] `helm/` - Package management
- [ ] `rbac/` - Authorization and security
- [ ] `networkpolicy/` - Network segmentation
- [ ] `ingress/` - HTTP routing
- [ ] `persistentvolumes/` - Storage management

### Supplementary Labs (Optional but Helpful)
- [ ] `daemonsets/` - Node-level workloads
- [ ] `statefulsets/` - Stateful applications
- [ ] `operators/` - Custom resources (CRD basics)
- [ ] `troubleshooting-3/` - Advanced debugging
- [ ] `affinity/` - Pod scheduling (advanced)

---

## Additional Study Resources

### Official Resources
- **CNCF CKAD Exam Page**: https://www.cncf.io/certification/ckad/
- **CKAD Curriculum**: https://github.com/cncf/curriculum
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **kubectl Reference**: https://kubernetes.io/docs/reference/kubectl/

### Practice Environments
- **killer.sh**: Exam simulator (included with CNCF registration)
- **Katacoda/O'Reilly**: Interactive Kubernetes scenarios
- **Local Kubernetes**: Docker Desktop, minikube, kind, k3s

### Community Resources
- **CKAD Exercises**: https://github.com/dgkanatsios/CKAD-exercises
- **Kubernetes Slack**: kubernetes.slack.com (#ckad channel)
- **r/kubernetes**: Reddit community for questions

---

## Exam Day Tips

### Before the Exam
- [ ] Test your computer and internet connection
- [ ] Clear your desk/workspace (no papers, books, phones)
- [ ] Have government ID ready
- [ ] Use the restroom
- [ ] Ensure quiet environment for 2+ hours
- [ ] Close all other applications and browser tabs

### During the Exam
- ✅ **Read each question twice** before starting
- ✅ **Switch namespace immediately** when specified
- ✅ **Use imperative commands** to save time
- ✅ **Verify your work** before moving on
- ✅ **Flag difficult questions** - return to them later
- ✅ **Watch the clock** - don't spend too long on one question
- ✅ **Use kubectl explain** and docs when needed
- ✅ **Stay calm** - you have time to complete and review

### After Each Question
1. Verify pods are running: `kubectl get pods -n <namespace>`
2. Check logs if applicable: `kubectl logs <pod>`
3. Test functionality if applicable: `kubectl exec`, `curl`, etc.
4. Read the question again - did you complete ALL requirements?

---

## Final Preparation Checklist

### One Week Before
- [ ] Complete all core labs
- [ ] Review weak areas identified during practice
- [ ] Complete at least one full practice exam
- [ ] Practice using kubernetes.io documentation efficiently
- [ ] Build kubectl command muscle memory

### One Day Before
- [ ] Light review of notes - don't cram
- [ ] Review kubectl cheat sheet
- [ ] Test exam environment (computer, internet, workspace)
- [ ] Get good sleep

### Exam Day
- [ ] Arrive 15 minutes early
- [ ] Stay calm and focused
- [ ] Trust your preparation
- [ ] Remember: 66% to pass - you don't need perfection!

---

## Estimated Study Timeline Summary

| Phase | Focus | Duration | Hours |
|-------|-------|----------|-------|
| Phase 1 | Fundamentals | Week 1-2 | 12h |
| Phase 2 | Application Lifecycle | Week 3 | 8h |
| Phase 3 | Observability | Week 4 | 10h |
| Phase 4 | Security & Networking | Week 5 | 8h |
| Phase 5 | Advanced Topics | Week 6 | 6h |
| Phase 6 | Exam Prep | Week 7-8 | 12h |
| **Total** | **Complete CKAD Prep** | **7-8 weeks** | **56h** |

*Note: This timeline assumes 8-10 hours per week of study time. Adjust based on your schedule and prior Kubernetes experience.*

---

## Good Luck!

Remember: The CKAD exam tests **practical skills**, not theoretical knowledge. The more hands-on practice you get with these labs, the better prepared you'll be. Focus on:

1. **Speed with kubectl** - Practice imperative commands
2. **YAML familiarity** - Know common patterns by heart
3. **Debugging skills** - Most questions involve troubleshooting
4. **Time management** - Don't get stuck on one question
5. **Documentation use** - Practice finding answers quickly

**You've got this! 🎯**

---

*Last updated: 2025-11-04*
*For updates and corrections, see: CKAD-LAB-ANALYSIS.md*
