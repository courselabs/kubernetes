Welcome to the Kubernetes labs.

These are hands-on resources to help you learn Kubernetes.

## Pre-reqs

 - [Set up Kubernetes and a Git client](./setup/README.md)
 - Download your repo
    - Open a terminal (PowerShell on Windows; any shell on Linux/macOS)
    - Run: `git clone https://github.com/courselabs/kubernetes.git`
     - Open the folder: `cd kubernetes`
- _For advanced topics_
    - Install [Helm](https://helm.sh/docs/intro/install/), [ArgoCD](https://argoproj.github.io/argo-cd/getting_started/#2-download-argo-cd-cli) and [k3d](https://k3d.io/v4.4.8/#installation) command line tools
- _Optional_
    - Install [Visual Studio Code](https://code.visualstudio.com) (free - Windows, macOS and Linux) to browse the repo and documentation

## CKAD Certification Track

These labs align with the [Certified Kubernetes Application Developer (CKAD)](https://www.cncf.io/training/certification/ckad/) exam curriculum (v1.34). The CKAD certification focuses on the skills needed to design, build, and deploy cloud-native applications on Kubernetes.

**Exam Details:**
- Duration: 2 hours
- Format: Performance-based (hands-on tasks in real Kubernetes environment)
- Passing score: 66%
- Kubernetes version: v1.34
- [Official CKAD Curriculum](https://github.com/cncf/curriculum/blob/master/CKAD_Curriculum_v1.34.pdf)
- [CNCF Certification Resources](https://www.cncf.io/training/certification/)

### Recommended Learning Path

**Estimated Total Study Time: 35-45 hours**

#### Phase 1: Fundamentals (10-12 hours) 🎯
*Master the core building blocks - essential for all CKAD domains*

1. [Nodes](labs/nodes/README.md) - Understanding cluster architecture and kubectl basics (2h)
2. [Pods](labs/pods/README.md) - Pod lifecycle, multi-container patterns, init containers (3h)
3. [Services](labs/services/README.md) - ClusterIP, NodePort, LoadBalancer, DNS (3h)
4. [Deployments](labs/deployments/README.md) - Scaling, rolling updates, rollbacks (3h)

#### Phase 2: Configuration & Storage (8-10 hours) 🎯
*Application Design and Build (20% of exam) + Config & Security (25% of exam)*

5. [ConfigMaps](labs/configmaps/README.md) - Environment variables, configuration files (2h)
6. [Secrets](labs/secrets/README.md) - Sensitive data management (2h)
7. [PersistentVolumes](labs/persistentvolumes/README.md) - Storage classes, PVCs, volume types (3h)
8. [Namespaces](labs/namespaces/README.md) - Resource isolation, quotas, limits (2h)

#### Phase 3: Application Deployment (6-8 hours) 🎯
*Application Deployment domain (20% of exam)*

9. [Helm](labs/helm/README.md) - Package management, charts, values (3h)
10. [Rollouts](labs/rollouts/README.md) - Deployment strategies, maxSurge, maxUnavailable (2h)
11. [Jobs and CronJobs](labs/jobs/README.md) - Batch processing, scheduled tasks (2h)

#### Phase 4: Production Readiness (6-8 hours) 🎯
*Application Observability and Maintenance (15% of exam)*

12. [Production readiness](labs/productionizing/README.md) - Liveness, readiness, startup probes, resource management (3h)
13. [Troubleshooting](labs/troubleshooting/README.md) - Debugging pods, logs, events (2h)
14. [Troubleshooting 2](labs/troubleshooting-2/README.md) - Configuration troubleshooting (2h)

#### Phase 5: Security & Networking (5-7 hours) 📘
*Services & Networking (20%) + Security aspects of Config domain (25%)*

15. [RBAC](labs/rbac/README.md) - Role-Based Access Control, ServiceAccounts (2h)
16. [NetworkPolicy](labs/networkpolicy/README.md) - Network security, ingress/egress rules (2h)
17. [Ingress](labs/ingress/README.md) - HTTP routing, path/host rules, TLS (2h)

#### Phase 6: Advanced Workloads (3-4 hours) 📘
*Supplementary topics for comprehensive understanding*

18. [StatefulSets](labs/statefulsets/README.md) - Stateful application patterns (2h)
19. [DaemonSets](labs/daemonsets/README.md) - Node-level workloads (1h)

#### Phase 7: Practice & Review (4-6 hours) 🎯
*Apply your knowledge in realistic scenarios*

20. [Troubleshooting 3](labs/troubleshooting-3/README.md) - Advanced debugging scenarios (2h)
21. [Hackathon](hackathon/README.md) - End-to-end application deployment (3h)

### CKAD Domain Mapping

The CKAD exam consists of five domains with the following weights:

| Domain | Weight | Key Labs |
|--------|--------|----------|
| **Application Design and Build** | 20% | Pods, Deployments, PersistentVolumes, Jobs |
| **Application Deployment** | 20% | Deployments, Rollouts, Helm |
| **Application Observability and Maintenance** | 15% | Production readiness, Troubleshooting (all 3 labs), Nodes |
| **Application Environment, Configuration and Security** | 25% | ConfigMaps, Secrets, RBAC, Namespaces |
| **Services and Networking** | 20% | Services, Ingress, NetworkPolicy |

### Study Tips

- **Practice, practice, practice**: The CKAD is 100% hands-on. Complete all lab exercises.
- **Speed matters**: You'll have ~8-10 tasks in 2 hours. Practice working quickly with kubectl.
- **Master kubectl**: Learn shortcuts, aliases, and imperative commands to save time.
- **Use kubectl explain**: During the exam, `kubectl explain <resource>` is your friend.
- **Bookmark wisely**: You can access kubernetes.io docs during the exam.
- **Learn YAML structure**: Be comfortable creating and editing resource manifests.
- **Time management**: Don't get stuck - flag difficult questions and move on.

### Legend
- 🎯 **CKAD Core Topic** - High priority for exam preparation
- 📘 **CKAD Supplementary** - Helpful for comprehensive understanding
- 🔧 **Advanced (Beyond CKAD)** - Useful for Kubernetes mastery but not required for CKAD

### Additional CKAD Resources

- [Kubernetes Official Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [CKAD Candidate Handbook](https://www.cncf.io/training/certification/ckad/)
- [Kubernetes API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)

---

## Core Kubernetes

- [Nodes](labs/nodes/README.md)
- [Pods](labs/pods/README.md)
- [Services](labs/services/README.md)
- [Deployments](labs/deployments/README.md)

## Application Modelling

- [ConfigMaps](labs/configmaps/README.md)
- [Secrets](labs/secrets/README.md)
- [PersistentVolumes](labs/persistentvolumes/README.md)
- [Namespaces](labs/namespaces/README.md)

## Advanced Application Modelling

- [Role-based Access Control (RBAC)](labs/rbac/README.md)
- [DaemonSets](labs/daemonsets/README.md)
- [Ingress](labs/ingress/README.md)
- [Jobs and CronJobs](labs/jobs/README.md)
- [StatefulSets](labs/statefulsets/README.md)

## Operating Kubernetes

- [Production readiness](labs/productionizing/README.md)
- [Monitoring](labs/monitoring/README.md)
- [Logging](labs/logging/README.md)

## Continuous Integration and Continuous Deployment (CI/CD)

- [Image optimizing](labs/docker/README.md)
- [BuildKit](labs/buildkit/README.md)
- [Helm](labs/helm/README.md)
- [Rollouts](labs/rollouts/README.md)
- [Jenkins](labs/jenkins/README.md)
- [ArgoCD](labs/argo/README.md)

## Advanced Kubernetes

- [NetworkPolicy](labs/networkpolicy/README.md)
- [Admission](labs/admission/README.md)
- [Operators](labs/operators/README.md)

## Production Operations

- [Clusters](labs/clusters/README.md)
- [Affinity](labs/affinity/README.md)
- [Tools](labs/tools/README.md)

## Real Kubernetes

- [Troubleshooting](labs/troubleshooting/README.md)
- [Hackathon!](hackathon/README.md)

### Credits

Created by [@EltonStoneman](https://twitter.com/EltonStoneman) ([sixeyed](https://github.com/sixeyed)): Freelance Consultant and Trainer. Author of [Learn Docker in a Month of Lunches](https://www.manning.com/books/learn-docker-in-a-month-of-lunches), [Learn Kubernetes in a Month of Lunches](https://www.manning.com/books/learn-kubernetes-in-a-month-of-lunches) and [many Pluralsight courses](https://pluralsight.pxf.io/c/1197078/424552/7490?u=https%3A%2F%2Fwww.pluralsight.com%2Fauthors%2Felton-stoneman).