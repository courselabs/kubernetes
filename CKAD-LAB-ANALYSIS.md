# CKAD Lab Coverage Analysis

**Date**: 2025-11-04
**Curriculum Version**: CKAD v1.34
**Repository**: kubernetes-ckad

## Executive Summary

This repository contains **31 labs** covering Kubernetes fundamentals through advanced topics. Analysis against the official CKAD v1.34 curriculum reveals:

- ✅ **Strong coverage** of core CKAD topics (85%)
- ⚠️ **Critical gaps** requiring new labs (Kustomize, SecurityContexts)
- 📝 **Enhancement needed** for several existing labs
- ❌ **Non-CKAD labs** that should be archived or moved (8 labs)

---

## CKAD Curriculum Coverage Matrix

### Domain 1: Application Design and Build (20%)

| Curriculum Topic | Lab Coverage | Status | Notes |
|------------------|--------------|--------|-------|
| Define, build and modify container images | `docker/` | ⚠️ NEEDS ELEVATION | Lab exists but marked low priority; needs CKAD focus |
| Choose right workload resource | `deployments/`, `daemonsets/`, `jobs/`, `statefulsets/` | ✅ EXCELLENT | All major workload types covered |
| Multi-container Pod patterns | `pods/` | ✅ GOOD | Sidecar, init containers covered |
| Persistent and ephemeral volumes | `persistentvolumes/` | ✅ GOOD | PV, PVC, storage classes covered |

**Domain Assessment**: 85% covered, needs container image building emphasis

### Domain 2: Application Deployment (20%)

| Curriculum Topic | Lab Coverage | Status | Notes |
|------------------|--------------|--------|-------|
| Deployment strategies (blue/green, canary) | `rollouts/` | ✅ GOOD | MaxSurge/maxUnavailable covered |
| Rolling updates & rollbacks | `deployments/` | ✅ EXCELLENT | Complete coverage |
| Helm package manager | `helm/` | ✅ GOOD | Charts, values, releases covered |
| **Kustomize** | **NONE** | ❌ **CRITICAL GAP** | **Required topic - lab missing!** |

**Domain Assessment**: 75% covered, **KUSTOMIZE LAB REQUIRED**

### Domain 3: Application Observability and Maintenance (15%)

| Curriculum Topic | Lab Coverage | Status | Notes |
|------------------|--------------|--------|-------|
| **API deprecations** | **NONE** | ⚠️ **MISSING** | Needs explicit coverage |
| Probes and health checks | `productionizing/` | ✅ EXCELLENT | Liveness, readiness, startup probes |
| Built-in CLI tools | `nodes/`, `tools/` | ✅ GOOD | kubectl top, describe, events |
| Container logs | `pods/`, `troubleshooting/` | ✅ EXCELLENT | kubectl logs, multi-container |
| Debugging in Kubernetes | `troubleshooting/`, `troubleshooting-2/`, `troubleshooting-3/` | ✅ EXCELLENT | Three comprehensive labs |

**Domain Assessment**: 85% covered, needs API deprecation topic

### Domain 4: Application Environment, Configuration and Security (25%)

| Curriculum Topic | Lab Coverage | Status | Notes |
|------------------|--------------|--------|-------|
| CRDs and Operators | `operators/` | ✅ GOOD | Custom resources covered |
| Authentication, authorization, admission | `rbac/`, `admission/` | ⚠️ NEEDS WORK | RBAC good; admission beyond CKAD scope |
| Requests, limits, quotas | `namespaces/`, `productionizing/` | ✅ EXCELLENT | Complete coverage |
| ConfigMaps | `configmaps/` | ✅ EXCELLENT | Environment vars and volumes |
| Secrets | `secrets/` | ✅ EXCELLENT | Creation, consumption, types |
| ServiceAccounts | `rbac/` | ✅ GOOD | Covered with RBAC |
| **Application Security (SecurityContexts, Capabilities)** | **PARTIAL** | ⚠️ **NEEDS DEDICATED LAB** | Critical CKAD topic, needs expansion |

**Domain Assessment**: 70% covered, **SECURITY LAB REQUIRED**

### Domain 5: Services and Networking (20%)

| Curriculum Topic | Lab Coverage | Status | Notes |
|------------------|--------------|--------|-------|
| NetworkPolicies | `networkpolicy/` | ✅ EXCELLENT | Ingress/egress rules, selectors |
| Services (access & troubleshooting) | `services/` | ✅ EXCELLENT | All service types, DNS, endpoints |
| Ingress rules | `ingress/` | ✅ EXCELLENT | Path/host routing, TLS |

**Domain Assessment**: 100% covered

---

## Lab Status Summary

### 🟢 CKAD-READY LABS (Keep As-Is) - 16 Labs

These labs directly support CKAD exam preparation and are production-ready:

| Lab | Domain | Completeness | CKAD Priority |
|-----|--------|--------------|---------------|
| `pods/` | Design & Build | ✅ Complete | **HIGH** - Core fundamental |
| `services/` | Networking | ✅ Complete | **HIGH** - Core fundamental |
| `deployments/` | Deployment | ✅ Complete | **HIGH** - Core fundamental |
| `configmaps/` | Config & Security | ✅ Complete | **HIGH** - Core fundamental |
| `secrets/` | Config & Security | ✅ Complete | **HIGH** - Core fundamental |
| `namespaces/` | Config & Security | ✅ Complete | **HIGH** - Resource isolation |
| `jobs/` | Design & Build | ✅ Complete | **HIGH** - Workload controller |
| `productionizing/` | Observability | ✅ Complete | **HIGH** - Health checks critical |
| `nodes/` | Observability | ✅ Complete | **HIGH** - CLI tools, querying |
| `troubleshooting/` | Observability | ✅ Complete | **HIGH** - Practical debugging |
| `troubleshooting-2/` | Observability | ✅ Complete | **HIGH** - Config troubleshooting |
| `networkpolicy/` | Networking | ✅ Complete | **MEDIUM** - Network security |
| `ingress/` | Networking | ✅ Complete | **MEDIUM** - HTTP routing |
| `persistentvolumes/` | Design & Build | ✅ Complete | **MEDIUM** - Storage management |
| `rbac/` | Config & Security | ✅ Complete | **MEDIUM** - Authorization |
| `helm/` | Deployment | ✅ Complete | **MEDIUM** - Package management |

### 🟡 NEEDS WORK / ENHANCEMENT - 8 Labs

These labs need updates to better align with CKAD requirements:

| Lab | Issue | Action Required | Priority |
|-----|-------|-----------------|----------|
| `docker/` | Marked low priority but CKAD requires container images | **Enhance**: Add CKAD-specific image build scenarios | **HIGH** |
| `rollouts/` | Good but could be clearer on CKAD deployment strategies | **Enhance**: Add explicit blue/green and canary examples | **MEDIUM** |
| `daemonsets/` | Complete but CKAD emphasis on when to use | **Enhance**: Add decision matrix for workload types | **LOW** |
| `statefulsets/` | Complete but less emphasized in CKAD | **Review**: Ensure CKAD-relevant patterns highlighted | **LOW** |
| `affinity/` | Advanced topic, may overcomplicate CKAD prep | **Review**: Mark as advanced/optional for CKAD | **LOW** |
| `clusters/` | Multi-cluster less relevant to CKAD | **Review**: Extract CKAD-relevant parts (taints/tolerations) | **LOW** |
| `troubleshooting-3/` | Helm + Ingress debugging, good but advanced | **Review**: Mark as advanced practice | **LOW** |
| `admission/` | Beyond CKAD scope | **Move**: Archive or mark as "Beyond CKAD" | **LOW** |

### 🔴 CRITICAL GAPS - New Labs Required

| Missing Topic | CKAD Domain | Curriculum Weight | Priority |
|---------------|-------------|-------------------|----------|
| **Kustomize** | Application Deployment (20%) | **Explicit requirement** | **🔥 CRITICAL** |
| **SecurityContexts & Capabilities** | Config & Security (25%) | **Core security topic** | **🔥 CRITICAL** |
| **API Deprecations** | Observability (15%) | **Explicit requirement** | **HIGH** |

### ❌ NON-CKAD LABS (Archive/Move) - 7 Labs

These labs are valuable for Kubernetes learning but NOT relevant to CKAD certification:

| Lab | Reason | Recommendation |
|-----|--------|----------------|
| `monitoring/` | Prometheus/Grafana beyond CKAD scope | Move to "Advanced Topics" or archive |
| `logging/` | EFK stack beyond CKAD scope | Move to "Advanced Topics" or archive |
| `buildkit/` | In-cluster building not in CKAD | Move to "CI/CD Topics" or archive |
| `jenkins/` | CI/CD pipelines not in CKAD | Move to "CI/CD Topics" or archive |
| `argo/` | GitOps not in CKAD curriculum | Move to "GitOps Topics" or archive |
| `tools/` | Dashboard/K9s helpful but not required | Mark as "Optional Tools" |
| `operators/` | CRDs yes, but full operators beyond scope | Keep CRD basics, archive operator pattern |

---

## Action Plan & TODO List

### Priority 1: Critical Gaps (Required for CKAD Coverage)

- [ ] **CREATE NEW LAB: `kustomize/`**
  - Overview of Kustomize vs Helm
  - Base and overlay structure
  - Kustomization.yaml configuration
  - Common use cases (dev/staging/prod)
  - Integration with kubectl apply -k
  - Hands-on exercises with multiple overlays
  - **Estimated effort**: 4-6 hours

- [ ] **CREATE NEW LAB: `security/` or enhance existing content**
  - SecurityContexts (Pod and container level)
  - runAsUser, runAsGroup, fsGroup
  - Capabilities (add/drop)
  - privileged containers
  - allowPrivilegeEscalation
  - readOnlyRootFilesystem
  - SELinux options
  - Hands-on security hardening exercises
  - **Estimated effort**: 4-6 hours

- [ ] **CREATE NEW SECTION: API Deprecations**
  - Could be added to `troubleshooting/` or create dedicated lab
  - Using kubectl convert
  - Checking for deprecated APIs
  - Migration strategies
  - Version compatibility checking
  - **Estimated effort**: 2-3 hours

### Priority 2: Lab Enhancements

- [ ] **ENHANCE: `docker/` lab**
  - Rename to `containers/` for clarity
  - Add CKAD context: why developers need image building skills
  - Simplify to focus on Dockerfile basics, multi-stage builds
  - Add practice exercises: build, tag, push scenarios
  - Link to workload resources (Deployments using custom images)
  - **Estimated effort**: 2-3 hours

- [ ] **ENHANCE: `rollouts/` lab**
  - Add explicit section on blue/green deployments
  - Add explicit section on canary deployments
  - Add decision matrix: when to use each strategy
  - Include CKAD-style exercises
  - **Estimated effort**: 2-3 hours

- [ ] **REVIEW: `rbac/` lab**
  - Ensure ServiceAccounts are prominently covered
  - Add exercises on Pod-to-API-server access patterns
  - Add troubleshooting scenarios
  - **Estimated effort**: 1-2 hours

### Priority 3: Repository Organization

- [ ] **CREATE: `CKAD-STUDY-GUIDE.md`**
  - Map labs to CKAD domains
  - Suggested learning path
  - Time estimates per lab
  - Practice exam tips
  - **Estimated effort**: 2 hours

- [ ] **CREATE: `/labs-advanced/` directory**
  - Move non-CKAD labs here: monitoring, logging, buildkit, jenkins, argo
  - Keep them accessible but clearly separated
  - Add README explaining these are beyond CKAD scope
  - **Estimated effort**: 1 hour

- [ ] **UPDATE: Lab README headers**
  - Add CKAD relevance badges to each lab
  - "🎯 CKAD Core Topic" for high-priority labs
  - "📘 CKAD Supplementary" for medium-priority
  - "🔧 Advanced (Beyond CKAD)" for non-exam labs
  - **Estimated effort**: 2 hours

### Priority 4: Content Updates

- [ ] **UPDATE: `index.md` or main README**
  - Add "CKAD Certification Track" section
  - List recommended lab order for CKAD prep
  - Estimated study time
  - Link to official CNCF resources
  - **Estimated effort**: 1 hour

- [ ] **CREATE: Practice scenarios**
  - CKAD-style timed exercises
  - Multi-step problems combining multiple topics
  - Could be in `hackathon/` or new `ckad-practice/`
  - **Estimated effort**: 4-6 hours

---

## Coverage Statistics

| CKAD Domain | Weight | Current Coverage | Status |
|-------------|--------|------------------|--------|
| Application Design and Build | 20% | 85% | 🟡 Needs image building emphasis |
| Application Deployment | 20% | 75% | 🔴 Missing Kustomize |
| Application Observability | 15% | 85% | 🟡 Needs API deprecation topic |
| Application Environment, Config & Security | 25% | 70% | 🔴 Missing SecurityContexts lab |
| Services and Networking | 20% | 100% | ✅ Complete |
| **Overall CKAD Coverage** | **100%** | **~80%** | **🟡 Good foundation, critical gaps** |

---

## Recommendations Summary

### Immediate Actions (Week 1-2)
1. Create Kustomize lab (critical gap)
2. Create Security/SecurityContexts lab (critical gap)
3. Enhance docker/containers lab for CKAD relevance
4. Add API deprecations content

### Short-term Actions (Week 3-4)
5. Reorganize labs into CKAD vs Advanced categories
6. Create CKAD study guide
7. Update lab README headers with CKAD badges
8. Enhance rollouts lab with explicit strategies

### Long-term Actions (Month 2)
9. Create CKAD practice scenarios
10. Add timed exercises
11. Review and update all labs for Kubernetes 1.34
12. Create video walkthroughs (optional)

---

## Conclusion

The repository provides **excellent foundational coverage** of Kubernetes concepts with **31 complete, hands-on labs**. For CKAD certification alignment:

**Strengths:**
- Comprehensive coverage of core Kubernetes resources
- Excellent troubleshooting labs (3 separate labs!)
- Strong networking and services coverage
- Production-ready patterns (health checks, resource management)
- Consistent structure and quality

**Critical Needs:**
- ⚠️ **Kustomize lab** (required exam topic, currently missing)
- ⚠️ **SecurityContexts lab** (25% of exam domain, underrepresented)
- ⚠️ **Container image building** emphasis (20% of exam domain)

**Estimated Total Effort for CKAD Alignment:**
- Critical gaps: 10-15 hours
- Enhancements: 8-12 hours
- Organization: 5-8 hours
- **Total: 23-35 hours** of focused work

With these updates, the repository will provide **complete CKAD v1.34 curriculum coverage** and serve as an excellent certification preparation resource.
