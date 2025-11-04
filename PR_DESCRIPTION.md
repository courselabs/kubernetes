# Pull Request: Add CKAD.md documentation for five core labs

## Branch Information

**From:** `claude/add-ckad-services-lab-011CUoQRLLpTpQs7XQwg4gGk`
**To:** `ckad/2025`

**GitHub Repository:** `courselabs/kubernetes`

## PR Title

```
Add CKAD.md documentation for five core labs
```

## PR Description

### Summary

This PR adds comprehensive CKAD exam-focused documentation for five core Kubernetes labs. Each lab now has a dedicated `CKAD.md` file that covers advanced exam topics while keeping the existing `README.md` focused on fundamentals.

### Labs Updated

#### 1. Services Lab (`/labs/services/CKAD.md`)
- Endpoints & EndpointSlices
- Multi-port Services with named ports
- Headless Services (clusterIP: None)
- Services without selectors (external services)
- ExternalName Services
- Session affinity (ClientIP)
- Cross-namespace DNS resolution
- Service troubleshooting guide

#### 2. Secrets Lab (`/labs/secrets/CKAD.md`)
- Imperative Secret creation (literals, files, env-files)
- All Secret types (Opaque, docker-registry, TLS, basic-auth, SSH)
- Usage patterns (env, envFrom, volume mounts)
- Update strategies (annotations, versioned names, immutable)
- Security best practices and RBAC
- imagePullSecrets and ServiceAccount integration
- Comprehensive troubleshooting

#### 3. Ingress Lab (`/labs/ingress/CKAD.md`)
- Path types (Prefix, Exact, ImplementationSpecific)
- Host-based and path-based routing
- IngressClass configuration
- TLS/HTTPS with multiple certificates
- Controller-specific annotations (Nginx)
- Cross-namespace routing patterns
- Troubleshooting guide

#### 4. Monitoring Lab (`/labs/monitoring/CKAD.md`)
- Prometheus metric types (counter, gauge, histogram, summary)
- Prometheus annotations for Pod discovery
- Exposing metrics endpoints
- PromQL basics and common queries
- kubectl top and resource metrics
- Health checks (liveness, readiness, startup probes)
- Cluster monitoring components
- Troubleshooting monitoring issues

#### 5. Clusters Lab (`/labs/clusters/CKAD.md`)
- Node labels and selectors
- Taints and tolerations (all effect types)
- Node affinity (required, preferred, operators)
- Pod affinity and anti-affinity
- DaemonSets with node selection
- Node maintenance (cordon, drain, uncordon)
- Resource requests impact on scheduling
- API version compatibility

### Structure

Each CKAD.md file:
- ✅ Covers exam-specific topics in depth
- ✅ Includes detailed examples and patterns
- ✅ Provides troubleshooting guides
- ✅ Contains CKAD exam tips and quick commands
- ✅ Marks TODOs for spec files and exercises to be added
- ✅ Links back to basic README.md and course contents

### TODOs for Future Work

Each document includes clearly marked TODOs for:
- Example YAML spec files
- Step-by-step exercises
- Troubleshooting scenarios
- Practice challenges
- Rapid-fire CKAD-style questions

### Testing

- ✅ All files follow consistent structure
- ✅ Markdown formatting validated
- ✅ Links to existing resources preserved
- ✅ No changes to existing README.md files
- ✅ All commits properly formatted

### Commits Included

1. `9f090cf` - Add CKAD.md for Services lab
2. `b017bfa` - Add CKAD.md for Secrets lab
3. `307a97e` - Add CKAD.md for Ingress lab
4. `d70442b` - Add CKAD.md for Monitoring lab
5. `459685d` - Add CKAD.md for Clusters lab

### Files Changed

- `labs/services/CKAD.md` (new)
- `labs/secrets/CKAD.md` (new)
- `labs/ingress/CKAD.md` (new)
- `labs/monitoring/CKAD.md` (new)
- `labs/clusters/CKAD.md` (new)

## To Create the PR

### Option 1: Using GitHub Web Interface

1. Go to: https://github.com/courselabs/kubernetes/pulls
2. Click "New pull request"
3. Set base branch to: `ckad/2025`
4. Set compare branch to: `claude/add-ckad-services-lab-011CUoQRLLpTpQs7XQwg4gGk`
5. Copy the title and description above

### Option 2: Using GitHub CLI

```bash
gh pr create \
  --base ckad/2025 \
  --head claude/add-ckad-services-lab-011CUoQRLLpTpQs7XQwg4gGk \
  --title "Add CKAD.md documentation for five core labs" \
  --body-file PR_DESCRIPTION.md
```

### Option 3: Direct Link

Visit this URL to create the PR directly:
```
https://github.com/courselabs/kubernetes/compare/ckad/2025...claude/add-ckad-services-lab-011CUoQRLLpTpQs7XQwg4gGk?expand=1
```

## Review Notes

This PR adds documentation only - no code changes or modifications to existing labs. Each CKAD.md file is a standalone document that supplements the existing README.md with exam-specific content.

All TODOs are clearly marked for future enhancement work, including example specifications and practice exercises.
