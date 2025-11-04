# CKAD Exam Curriculum (v1.34)

This document outlines the official Certified Kubernetes Application Developer (CKAD) exam curriculum from the Cloud Native Computing Foundation (CNCF).

**Source**: [CNCF Curriculum Repository](https://github.com/cncf/curriculum)
**Version**: 1.34 (matches Kubernetes v1.34)
**Exam Duration**: 2 hours
**Passing Score**: 66%
**Exam Format**: Online, proctored, performance-based test

## Exam Domains and Weightings

| Domain | Weight | Topics |
|--------|--------|--------|
| Application Design and Build | 20% | Container images, workload resources, multi-container pods, volumes |
| Application Deployment | 20% | Deployment strategies, rolling updates, Helm, Kustomize |
| Application Observability and Maintenance | 15% | API deprecations, probes, monitoring, logging, debugging |
| Application Environment, Configuration and Security | 25% | CRDs, auth, resource management, ConfigMaps, Secrets, SecurityContexts |
| Services and Networking | 20% | NetworkPolicies, Services, Ingress |

## Detailed Curriculum

### 1. Application Design and Build (20%)

- **Define, build and modify container images**
  - Understanding container image structure
  - Building images with Dockerfile
  - Modifying existing images
  - Container registry operations

- **Choose and use the right workload resource**
  - Deployment
  - DaemonSet
  - CronJob
  - Job
  - StatefulSet
  - Understanding when to use each type

- **Understand multi-container Pod design patterns**
  - Sidecar pattern
  - Init containers
  - Ambassador pattern
  - Adapter pattern

- **Utilize persistent and ephemeral volumes**
  - PersistentVolumes (PV)
  - PersistentVolumeClaims (PVC)
  - Volume types (emptyDir, hostPath, etc.)
  - Storage Classes
  - Volume mounting in Pods

### 2. Application Deployment (20%)

- **Use Kubernetes primitives to implement common deployment strategies**
  - Blue/green deployments
  - Canary deployments
  - Rolling deployments
  - Recreate strategy

- **Understand Deployments and how to perform rolling updates**
  - Deployment configuration
  - Rolling update parameters
  - Rollback procedures
  - Deployment history
  - Scaling deployments

- **Use the Helm package manager to deploy existing packages**
  - Helm installation
  - Chart management
  - Installing charts
  - Upgrading releases
  - Rolling back releases
  - Helm values configuration

- **Kustomize**
  - Understanding Kustomize basics
  - Creating overlays
  - Managing configurations
  - Kustomization files

### 3. Application Observability and Maintenance (15%)

- **Understand API deprecations**
  - Identifying deprecated APIs
  - Migrating to new API versions
  - Checking for deprecated resources

- **Implement probes and health checks**
  - Liveness probes
  - Readiness probes
  - Startup probes
  - Probe configuration (HTTP, TCP, exec)

- **Use built-in CLI tools to monitor Kubernetes applications**
  - kubectl top
  - kubectl describe
  - kubectl get events
  - Metrics server usage

- **Utilize container logs**
  - kubectl logs
  - Multi-container log access
  - Log streaming
  - Previous container logs

- **Debugging in Kubernetes**
  - kubectl exec
  - kubectl debug
  - Troubleshooting Pods
  - Troubleshooting Services
  - Network debugging

### 4. Application Environment, Configuration and Security (25%)

- **Discover and use resources that extend Kubernetes**
  - Custom Resource Definitions (CRDs)
  - Operators
  - Understanding custom resources
  - Interacting with CRDs

- **Understand authentication, authorization and admission control**
  - Authentication mechanisms
  - Authorization (RBAC)
  - Admission controllers
  - Webhook admission

- **Understand requests, limits, quotas**
  - Resource requests
  - Resource limits
  - ResourceQuotas
  - LimitRanges

- **Define resource requirements**
  - CPU requests and limits
  - Memory requests and limits
  - Ephemeral storage

- **Understand ConfigMaps**
  - Creating ConfigMaps
  - Consuming ConfigMaps as environment variables
  - Consuming ConfigMaps as volumes
  - ConfigMap updates

- **Create & consume Secrets**
  - Secret types
  - Creating Secrets
  - Consuming Secrets as environment variables
  - Consuming Secrets as volumes
  - Secret security considerations

- **Understand ServiceAccounts**
  - ServiceAccount creation
  - Pod ServiceAccount assignment
  - ServiceAccount tokens
  - RBAC with ServiceAccounts

- **Understand Application Security**
  - SecurityContexts (Pod and container level)
  - Capabilities
  - SELinux options
  - RunAsUser, RunAsGroup
  - Privileged containers
  - AllowPrivilegeEscalation

### 5. Services and Networking (20%)

- **Demonstrate basic understanding of NetworkPolicies**
  - NetworkPolicy rules
  - Ingress rules
  - Egress rules
  - Pod selectors
  - Namespace selectors
  - Default deny policies

- **Provide and troubleshoot access to applications via services**
  - Service types (ClusterIP, NodePort, LoadBalancer)
  - Service discovery
  - Endpoints
  - Service troubleshooting
  - DNS resolution

- **Use Ingress rules to expose applications**
  - Ingress resources
  - Ingress controllers
  - Path-based routing
  - Host-based routing
  - TLS termination
  - Ingress annotations

## Prerequisites

The CKAD exam assumes:
- Working knowledge of container runtimes (Docker, containerd, etc.)
- Understanding of microservice architecture
- Comfort with OCI-compliant container images
- Familiarity with Cloud Native application concepts
- Experience working with and validating Kubernetes resource definitions

## Study Resources

- [Official Kubernetes Documentation](https://kubernetes.io/docs/)
- [CNCF Curriculum GitHub Repository](https://github.com/cncf/curriculum)
- [Kubernetes API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)
- Practice labs and hands-on exercises
