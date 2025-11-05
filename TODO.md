# CKAD Curriculum 2025 - Repository TODO List

**Generated**: 2025-11-05
**Curriculum Version**: CKAD v1.34
**Current Repository Coverage**: ~80%

This document tracks all work needed to fully align the repository with the official CKAD v1.34 exam curriculum.

---

## Executive Summary

The repository has **excellent foundational coverage** with 31+ labs, but requires critical updates to match the 2025 CKAD curriculum:

### Critical Gaps (Exam Topics Missing)
- ❌ **Kustomize** - Required topic with NO lab coverage
- ⚠️ **SecurityContexts** - Partial coverage, needs dedicated lab
- ⚠️ **API Deprecations** - Missing from curriculum
- ⚠️ **Container Image Building** - Lab exists but not emphasized for CKAD

### Repository Status
- ✅ **16 CKAD-ready labs** - Production quality, curriculum-aligned
- 🟡 **8 labs need enhancement** - Good content, needs CKAD focus
- 🔴 **2 critical new labs required** - Kustomize, SecurityContexts
- 📚 **5 non-CKAD labs** - Already moved to labs-advanced/

---

## Priority 1: Critical Gaps (REQUIRED for CKAD Coverage)

### 🔥 CRITICAL: Create Kustomize Lab

**Location**: `labs/kustomize/`
**Status**: ❌ **LAB MISSING - EXAM TOPIC REQUIRED**
**CKAD Domain**: Application Deployment (20%)
**Estimated Effort**: 6-8 hours

**Required Content**:
- [ ] Create `labs/kustomize/README.md` with tutorial
- [ ] Create `labs/kustomize/CKAD.md` for exam-focused content
- [ ] Create `labs/kustomize/hints.md`
- [ ] Create `labs/kustomize/solution.md`
- [ ] Create base/overlay structure examples
- [ ] Create kustomization.yaml templates
- [ ] Dev/staging/prod overlay examples
- [ ] ConfigMap/Secret generation examples
- [ ] Patch examples (strategic merge, JSON)
- [ ] Multi-base composition examples
- [ ] Integration with `kubectl apply -k`
- [ ] Comparison with Helm (when to use which)
- [ ] Practice exercises with solutions
- [ ] Troubleshooting common kustomize errors
- [ ] Lab challenge: Build multi-environment setup
- [ ] Quickfire questions
- [ ] Narration script in `narration-scripts/kustomize/`

**Acceptance Criteria**:
- Works on Docker Desktop, k3d, and kind
- Clear explanation of bases vs overlays
- Practical CKAD exam scenarios
- 60-90 minute completion time
- Clean labels: `kubernetes.courselabs.co=kustomize`

---

### 🔥 CRITICAL: Create Security/SecurityContexts Lab

**Location**: `labs/security/` or enhance existing
**Status**: ⚠️ **PARTIAL COVERAGE - NEEDS DEDICATED LAB**
**CKAD Domain**: Application Environment, Configuration & Security (25%)
**Estimated Effort**: 6-8 hours

**Required Content**:
- [ ] Create dedicated `labs/security/README.md` OR enhance `labs/security/`
- [ ] Create `labs/security/CKAD.md` for exam focus
- [ ] SecurityContext at Pod level
- [ ] SecurityContext at container level
- [ ] runAsUser and runAsGroup examples
- [ ] fsGroup for volume permissions
- [ ] Capabilities (add/drop) examples
- [ ] privileged containers (and when NOT to use)
- [ ] allowPrivilegeEscalation settings
- [ ] readOnlyRootFilesystem examples
- [ ] SELinux options (awareness level)
- [ ] Security best practices for CKAD
- [ ] Common security hardening patterns
- [ ] Troubleshooting permission errors
- [ ] Practice exercises: Secure an insecure deployment
- [ ] Lab challenge: Production-ready security config
- [ ] Quickfire questions
- [ ] Narration script in `narration-scripts/security/`

**Acceptance Criteria**:
- Covers all CKAD security requirements
- Practical examples with visible security impact
- Troubleshooting scenarios included
- 75-90 minute completion time
- Integration with existing productionizing lab

---

### 🟠 HIGH: Add API Deprecations Content

**Location**: Add to existing `labs/troubleshooting/` or `labs/api-versions/`
**Status**: ⚠️ **TOPIC MISSING FROM CURRICULUM**
**CKAD Domain**: Application Observability and Maintenance (15%)
**Estimated Effort**: 3-4 hours

**Required Content**:
- [ ] Section on checking for deprecated APIs
- [ ] Using `kubectl api-resources` to find versions
- [ ] Using `kubectl convert` command
- [ ] Migration strategies for deprecated resources
- [ ] Checking API version compatibility
- [ ] Understanding deprecation policies
- [ ] Examples: v1beta1 to v1 migrations
- [ ] Practice scenarios for version updates
- [ ] Add to existing troubleshooting lab OR api-versions lab
- [ ] Update CKAD.md files accordingly

**Acceptance Criteria**:
- Covers CKAD exam requirements
- Practical kubectl commands
- Real deprecation examples
- 30-45 minute section

---

### 🟠 HIGH: Enhance docker/ Lab for CKAD

**Location**: `labs/docker/`
**Status**: ✅ EXISTS but ⚠️ NEEDS CKAD ELEVATION
**CKAD Domain**: Application Design and Build (20%)
**Estimated Effort**: 3-4 hours

**Required Updates**:
- [ ] Update `labs/docker/CKAD.md` with exam focus
- [ ] Add CKAD context: Why developers need image building
- [ ] Simplify to focus on Dockerfile basics
- [ ] Multi-stage build examples for CKAD
- [ ] Practice: Build, tag, push workflow
- [ ] Link to deployment usage (custom images)
- [ ] CKAD-style exercises (timed scenarios)
- [ ] Quick image building reference
- [ ] Common Dockerfile mistakes
- [ ] Update priority from LOW to HIGH in study guide
- [ ] Ensure 60-90 minute completion time

**Acceptance Criteria**:
- Clear CKAD relevance
- Practical build scenarios
- Integration with deployment workflows
- Exam-style exercises

---

## Priority 2: Lab Enhancements (Improve CKAD Alignment)

### 🟡 ENHANCE: rollouts/ Lab

**Location**: `labs/rollouts/`
**Status**: ✅ GOOD but needs explicit deployment strategies
**Estimated Effort**: 2-3 hours

**Updates Needed**:
- [ ] Add explicit blue/green deployment section
- [ ] Add explicit canary deployment section
- [ ] Add decision matrix: When to use each strategy
- [ ] CKAD-style timed exercises
- [ ] Enhance CKAD.md with strategy comparison table
- [ ] Add quickfire questions on strategies
- [ ] Update narration script with strategies

**Acceptance Criteria**:
- Clear blue/green examples
- Clear canary examples
- Decision guidance included

---

### 🟡 ENHANCE: rbac/ Lab

**Location**: `labs/rbac/`
**Status**: ✅ GOOD but ServiceAccounts need emphasis
**Estimated Effort**: 2-3 hours
**Reference**: See existing `labs/rbac/CKAD-TODO.md` for detailed checklist

**Priority Updates from CKAD-TODO.md**:
- [ ] Complete High Priority items from `labs/rbac/CKAD-TODO.md`:
  - [ ] ServiceAccount examples (basic-sa, no-token)
  - [ ] Multi-resource role examples
  - [ ] Built-in ClusterRole usage examples
  - [ ] Exercise 1 solution (basic RBAC)
  - [ ] Exercise 4 solution (troubleshooting)
- [ ] Ensure ServiceAccounts prominently covered
- [ ] Add Pod-to-API-server access patterns
- [ ] Add troubleshooting scenarios
- [ ] Update CKAD.md with ServiceAccount focus

**Acceptance Criteria**:
- ServiceAccounts are primary focus
- Practical RBAC troubleshooting
- CKAD exam scenarios covered

---

### 🟡 REVIEW: deployments/ Lab

**Location**: `labs/deployments/`
**Status**: ✅ EXCELLENT but has outstanding TODO items
**Estimated Effort**: 3-4 hours
**Reference**: See existing `labs/deployments/CKAD-TODO.md` for detailed checklist

**Priority Updates from CKAD-TODO.md**:
- [ ] Complete High Priority items from `labs/deployments/CKAD-TODO.md`:
  - [ ] Production-ready deployment spec
  - [ ] Resource management example
  - [ ] Health check examples (readiness, liveness)
  - [ ] Rolling update configuration
  - [ ] Exercise solutions
- [ ] Add startup probe examples (newer feature)
- [ ] Ensure all three probe types covered
- [ ] Add production-ready template

**Acceptance Criteria**:
- All probe types covered
- Production patterns demonstrated
- Resource management examples

---

### 🟡 REVIEW: affinity/ Lab

**Location**: `labs/affinity/`
**Status**: ✅ EXISTS but beyond core CKAD
**Estimated Effort**: 2 hours
**Reference**: See existing `labs/affinity/CKAD-TODO.md` for detailed checklist

**Priority Updates**:
- [ ] Mark as "Advanced/Optional for CKAD" in study guide
- [ ] Focus CKAD.md on when you MIGHT need affinity
- [ ] Consider completing HIGH priority items from `labs/affinity/CKAD-TODO.md`:
  - [ ] Basic node affinity examples
  - [ ] Basic pod affinity and anti-affinity
  - [ ] Standard labels examples
  - [ ] Common patterns (HA spread, co-locate)
- [ ] OR mark entire detailed TODO as "beyond CKAD scope"

**Decision Needed**:
- Keep as advanced optional topic?
- Complete for comprehensive coverage?
- Archive detailed TODO as "nice-to-have"?

---

### 🟡 REVIEW: daemonsets/ Lab

**Location**: `labs/daemonsets/`
**Status**: ✅ COMPLETE but needs workload decision guidance
**Estimated Effort**: 1-2 hours

**Updates Needed**:
- [ ] Add decision matrix: When to use DaemonSet vs Deployment
- [ ] Add to CKAD.md: Workload type selection guidance
- [ ] Emphasize "one per node" use cases
- [ ] Add to study guide as "understanding when to use"

---

### 🟡 REVIEW: statefulsets/ Lab

**Location**: `labs/statefulsets/`
**Status**: ✅ COMPLETE but needs CKAD focus
**Estimated Effort**: 1-2 hours

**Updates Needed**:
- [ ] Review CKAD.md for exam-relevant patterns
- [ ] Highlight ordered deployment/deletion
- [ ] Emphasize stable network identities
- [ ] Add decision guidance: StatefulSet vs Deployment

---

### 🟡 REVIEW: clusters/ Lab

**Location**: `labs/clusters/`
**Status**: Multi-cluster less relevant to CKAD
**Estimated Effort**: 1-2 hours

**Updates Needed**:
- [ ] Extract CKAD-relevant parts (taints/tolerations)
- [ ] Mark multi-cluster aspects as advanced
- [ ] Update CKAD.md to focus on single-cluster topics
- [ ] Consider moving to labs-advanced/ if primarily multi-cluster

---

### 🟡 REVIEW: troubleshooting-3/ Lab

**Location**: `labs/troubleshooting-3/`
**Status**: ✅ GOOD but advanced
**Estimated Effort**: 1 hour

**Updates Needed**:
- [ ] Mark as "Advanced Practice" in study guide
- [ ] Ensure CKAD.md reflects optional status
- [ ] Good for exam prep but not required curriculum

---

## Priority 3: Repository Organization

### 📁 UPDATE: Study Guide and Documentation

**Status**: ✅ Exists but needs updates
**Estimated Effort**: 2-3 hours

**Updates Needed**:
- [ ] Update `CKAD-STUDY-GUIDE.md` with:
  - [ ] Mark Kustomize as available (once created)
  - [ ] Mark Security lab as available (once created)
  - [ ] Update docker/containers lab as HIGH priority
  - [ ] Revise time estimates if needed
  - [ ] Update total study time
- [ ] Update `CKAD-LAB-ANALYSIS.md` with:
  - [ ] Current coverage statistics
  - [ ] Mark critical gaps as "in progress" or "completed"
  - [ ] Update recommendations based on current status
- [ ] Update `CKAD-CURRICULUM.md` if needed for v1.34

---

### 📁 VERIFY: Lab Organization

**Status**: ✅ Already organized
**Estimated Effort**: 1 hour (verification only)

**Verification Tasks**:
- [ ] Confirm all non-CKAD labs in `labs-advanced/`:
  - [x] argo/ - ✅ Already moved
  - [x] buildkit/ - ✅ Already moved
  - [x] jenkins/ - ✅ Already moved
  - [x] logging/ - ✅ Already moved
  - [x] monitoring/ - ✅ Already moved
- [ ] Check if any remaining labs should move to labs-advanced/
- [ ] Ensure labs-advanced/README.md exists explaining scope
- [ ] Verify all labs/ directory contains only CKAD-relevant content

---

### 📝 UPDATE: Lab README Headers

**Status**: ⚠️ NEEDS IMPLEMENTATION
**Estimated Effort**: 2-3 hours

**Updates Needed**:
- [ ] Add CKAD relevance badges to each lab README:
  - [ ] "🎯 CKAD Core Topic" for high-priority labs
  - [ ] "📘 CKAD Supplementary" for medium-priority labs
  - [ ] "🔧 Advanced (Beyond CKAD)" for optional labs
- [ ] Update all existing lab README.md files (29 labs)
- [ ] Ensure consistency across all labs
- [ ] Add CKAD domain mapping to each lab

**Badge Mapping**:
- 🎯 CKAD Core: pods, services, deployments, configmaps, secrets, namespaces, jobs, productionizing, troubleshooting
- 📘 CKAD Supplementary: rollouts, helm, rbac, networkpolicy, ingress, persistentvolumes, kustomize (new), security (new)
- 🔧 Advanced: affinity, clusters, operators, tools, troubleshooting-3

---

### 📝 UPDATE: Main README/Index

**Status**: ⚠️ NEEDS CKAD SECTION
**Estimated Effort**: 1-2 hours

**Updates Needed**:
- [ ] Check if main README exists or if index.md
- [ ] Add "CKAD Certification Track" section
- [ ] List recommended lab order for CKAD prep
- [ ] Include estimated total study time (~56 hours)
- [ ] Link to CKAD-STUDY-GUIDE.md
- [ ] Link to CKAD-CURRICULUM.md
- [ ] Link to official CNCF CKAD resources
- [ ] Mention exam details (2 hours, 66% pass, v1.34)

---

## Priority 4: Content Additions (Nice-to-Have)

### 🎯 CREATE: CKAD Practice Scenarios

**Location**: `ckad-practice/` or `hackathon/ckad/`
**Status**: ❌ NOT CREATED
**Estimated Effort**: 6-8 hours

**Content Needed**:
- [ ] CKAD-style timed exercises
- [ ] Multi-step problems combining topics
- [ ] Scenario 1: Deploy multi-tier app with configs
- [ ] Scenario 2: Troubleshoot failing deployment
- [ ] Scenario 3: Implement rolling update strategy
- [ ] Scenario 4: Configure networking and policies
- [ ] Scenario 5: Secure application deployment
- [ ] Each scenario: 10-15 minute completion time
- [ ] Solutions with explanations
- [ ] Scoring rubric

**Priority**: MEDIUM (helpful but not required)

---

### 📚 CREATE: Quickfire Questions

**Status**: ⚠️ SOME LABS HAVE, STANDARDIZE
**Estimated Effort**: 4-6 hours

**Updates Needed**:
- [ ] Verify all labs have `quickfire.md`
- [ ] Ensure randomization of correct answers (already done in PR #7)
- [ ] Create quickfire questions for new labs (kustomize, security)
- [ ] Standardize format across all labs
- [ ] Add difficulty ratings (Easy/Medium/Hard)
- [ ] Map questions to CKAD domains

**Priority**: LOW (supplementary learning tool)

---

### 🎬 UPDATE: Narration Scripts

**Location**: `narration-scripts/*/`
**Status**: ✅ EXISTS for most labs
**Estimated Effort**: 3-4 hours

**Updates Needed**:
- [ ] Create narration script for kustomize/ (new lab)
- [ ] Create narration script for security/ (new lab)
- [ ] Review existing scripts for CKAD alignment
- [ ] Update docker/ narration for CKAD emphasis
- [ ] Ensure all scripts reference CKAD relevance

**Priority**: LOW (supplementary content)

---

## Summary Statistics

### Current Lab Status

| Category | Count | Status |
|----------|-------|--------|
| CKAD Core Labs (🎯) | 16 | ✅ Production Ready |
| CKAD Supplementary Labs (📘) | 8 | 🟡 Needs Enhancement |
| Advanced/Optional Labs (🔧) | 6 | ✅ Available |
| **New Labs Required** | **2** | ❌ **Kustomize, Security** |
| Labs in labs-advanced/ | 5 | ✅ Properly Organized |

### CKAD Domain Coverage

| Domain | Weight | Coverage | Status | Missing/Needs Work |
|--------|--------|----------|--------|-------------------|
| Application Design & Build | 20% | 85% | 🟡 | Container images emphasis |
| Application Deployment | 20% | 60% | 🔴 | **Kustomize lab REQUIRED** |
| Observability & Maintenance | 15% | 85% | 🟡 | API deprecations section |
| Environment, Config & Security | 25% | 70% | 🔴 | **SecurityContexts lab REQUIRED** |
| Services & Networking | 20% | 100% | ✅ | Complete |
| **OVERALL** | **100%** | **~80%** | 🟡 | **2 critical gaps** |

### Effort Estimates

| Priority | Tasks | Estimated Hours | Status |
|----------|-------|----------------|--------|
| **Priority 1: Critical Gaps** | 4 tasks | 18-24 hours | ❌ Not started |
| **Priority 2: Enhancements** | 8 tasks | 16-22 hours | 🟡 Partial |
| **Priority 3: Organization** | 4 tasks | 6-9 hours | 🟡 Partial |
| **Priority 4: Nice-to-Have** | 3 tasks | 13-18 hours | ⚠️ Optional |
| **TOTAL** | **19 tasks** | **53-73 hours** | 🟡 **In Progress** |

---

## Recommended Work Order

### Week 1-2: Critical New Labs (Must-Have)
1. ✅ **Create Kustomize lab** (6-8 hours) - BLOCKING EXAM COVERAGE
2. ✅ **Create Security/SecurityContexts lab** (6-8 hours) - BLOCKING EXAM COVERAGE
3. ✅ **Add API Deprecations content** (3-4 hours) - Required curriculum topic
4. ✅ **Enhance docker/ lab** (3-4 hours) - Elevate to CKAD focus

**Total Week 1-2**: 18-24 hours

### Week 3: High-Priority Enhancements
5. 🟡 **Complete deployments/ CKAD-TODO items** (3-4 hours)
6. 🟡 **Complete rbac/ CKAD-TODO items** (2-3 hours)
7. 🟡 **Enhance rollouts/ lab** (2-3 hours)
8. 🟡 **Review and update study guides** (2-3 hours)

**Total Week 3**: 9-13 hours

### Week 4: Organization & Polish
9. 📁 **Update study guide** (2-3 hours)
10. 📁 **Add CKAD badges to READMEs** (2-3 hours)
11. 📁 **Update main README** (1-2 hours)
12. 📁 **Review all labs for consistency** (2-3 hours)

**Total Week 4**: 7-11 hours

### Week 5+: Optional Enhancements (If Time Permits)
13. 🎯 **Create practice scenarios** (6-8 hours)
14. 📚 **Standardize quickfire questions** (4-6 hours)
15. 🎬 **Update narration scripts** (3-4 hours)

**Total Week 5+**: 13-18 hours (optional)

---

## Completion Criteria

The repository will be **100% CKAD v1.34 aligned** when:

- [x] All 5 CKAD domains have 90%+ coverage
- [ ] Kustomize lab exists and is complete
- [ ] SecurityContexts lab exists and is complete
- [ ] API deprecations topic covered
- [ ] Container image building emphasized for CKAD
- [ ] All lab CKAD.md files accurate and current
- [ ] CKAD-STUDY-GUIDE.md updated with all labs
- [ ] Clear CKAD badges on all lab READMEs
- [ ] Main README has CKAD certification track section
- [ ] Estimated study time: 45-60 hours (currently 56h + new labs)

---

## Notes and Considerations

### Testing Requirements
All new and updated labs must:
- Work on Docker Desktop (single-node)
- Work on k3d/kind (multi-node)
- Work on cloud providers (AKS, EKS, GKE)
- Use Kubernetes v1.34 features where applicable
- Be backward compatible to minimum supported version
- Have clean cleanup procedures
- Use consistent labeling: `kubernetes.courselabs.co=<topic>`

### Documentation Standards
All labs must include:
- README.md (main tutorial)
- CKAD.md (exam-focused content)
- hints.md (additional guidance)
- solution.md (complete solutions)
- quickfire.md (quiz questions)
- specs/ directory (YAML manifests)
- solution/ directory (solution files)

### Quality Checklist
Before marking items complete:
- [ ] YAML validated with `kubectl apply --dry-run=client`
- [ ] Tested on at least 2 Kubernetes distributions
- [ ] All commands verified to work
- [ ] Screenshots updated if applicable
- [ ] Links to official k8s docs included
- [ ] Estimated completion time tested
- [ ] Peer review completed
- [ ] No broken links or references

---

## References

- **CKAD Curriculum**: [CKAD-CURRICULUM.md](./CKAD-CURRICULUM.md)
- **Study Guide**: [CKAD-STUDY-GUIDE.md](./CKAD-STUDY-GUIDE.md)
- **Lab Analysis**: [CKAD-LAB-ANALYSIS.md](./CKAD-LAB-ANALYSIS.md)
- **Official CKAD**: https://www.cncf.io/training/certification/ckad/
- **Curriculum Repo**: https://github.com/cncf/curriculum

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-05 | Initial TODO created based on CKAD v1.34 curriculum review | Claude |

---

**Last Updated**: 2025-11-05
**Next Review**: After completion of Priority 1 tasks
