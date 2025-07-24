# Claude Assistant Context for Kubernetes Training Materials

## Repository Overview

This repository contains hands-on Kubernetes training materials organized as a structured course. Each topic is covered in its own lab directory under `labs/`, with the content hosted at https://kubernetes.courselabs.co.

## Repository Structure

- `labs/` - Core training modules (30+ topics covering all aspects of Kubernetes)
- `hackathon/` - End-to-end project demonstrating real-world application deployment
- `setup/` - Environment setup instructions and configurations
- `scripts/` - Utility scripts for image management and environment setup
- `img/` - Screenshots and diagrams referenced in the labs

## Lab Structure Pattern

Each lab follows a consistent structure:
- `README.md` - Main tutorial with step-by-step instructions
- `hints.md` - Additional guidance for exercises
- `solution.md` - Complete solutions to lab exercises
- `specs/` - Directory containing YAML manifests and configurations
- `solution/` - Directory with solution files for lab exercises

## Key Lab Topics

### Fundamentals
- **pods** - Basic Pod concepts, creating and managing containers
- **services** - Networking Pods with Services (ClusterIP, NodePort, LoadBalancer)
- **deployments** - Managing application deployments and scaling
- **configmaps** - Configuration management
- **secrets** - Secure configuration data management

### Storage & Persistence
- **persistentvolumes** - Volume management and persistent storage
- **statefulsets** - Stateful application deployments

### Networking
- **ingress** - HTTP/HTTPS routing and load balancing
- **networkpolicy** - Network security and segmentation

### Advanced Topics
- **rbac** - Role-Based Access Control and security
- **helm** - Package management with Helm charts
- **kustomize** - Configuration management without templates
- **operators** - Custom resource definitions and operators
- **monitoring** - Prometheus and Grafana setup
- **logging** - Centralized logging with ELK stack

### CI/CD & GitOps
- **jenkins** - CI/CD pipeline setup
- **argo** - GitOps with ArgoCD
- **buildkit** - Container image building in cluster

### Production Readiness
- **productionizing** - Health checks, resource limits, autoscaling
- **troubleshooting** - Debugging techniques and best practices
- **admission** - Admission controllers and policy enforcement

## Common Commands to Run

### Linting and Validation
```bash
# Check YAML syntax (if yamllint is available)
find labs/ -name "*.yaml" -exec yamllint {} \;

# Validate Kubernetes manifests (requires cluster access)
kubectl apply --dry-run=client -f labs/<topic>/specs/
```

### Testing Labs
```bash
# Deploy a lab's specs
kubectl apply -f labs/<topic>/specs/

# Clean up lab resources (each lab has cleanup instructions)
kubectl delete pod,svc,deployment -l kubernetes.courselabs.co=<topic>
```

### Image Management
```bash
# Pull images for offline use
./scripts/pull-images.sh

# Sync images to registry
./scripts/imageSync.ps1  # Windows
```

## Content Guidelines

### Lab Content Structure
1. **Introduction** - Brief overview of the topic
2. **API specs** - Links to official Kubernetes documentation
3. **YAML overview** - Collapsible detailed explanation of resource specs
4. **Step-by-step exercises** - Hands-on tasks with kubectl commands
5. **Lab challenge** - Independent exercise to reinforce learning
6. **Cleanup** - Commands to remove created resources

### Common Applications Used
- **whoami** - Simple web service for networking demos
- **sleep** - Basic pod for testing and troubleshooting
- **nginx** - Web server for ingress and service examples
- **pi** - CPU-intensive app for resource management examples

## Environment Support

The labs support multiple Kubernetes distributions:
- Docker Desktop (recommended for local development)
- K3s/K3d
- Minikube
- Kind
- Cloud providers (AKS, EKS, GKE)

## Best Practices for Assistance

1. **Always check the existing structure** before suggesting changes
2. **Maintain consistency** with existing lab formats and patterns
3. **Test configurations** against multiple Kubernetes distributions when possible
4. **Follow the cleanup pattern** - every lab should have clear resource cleanup
5. **Use standard labels** - labs use `kubernetes.courselabs.co=<topic>` for easy cleanup
6. **Reference official docs** - always link to canonical Kubernetes documentation

## Troubleshooting Commands

```bash
# Check cluster status
kubectl get nodes
kubectl get pods --all-namespaces

# Debug pod issues
kubectl describe pod <pod-name>
kubectl logs <pod-name>

# Check resource usage
kubectl top nodes
kubectl top pods

# Validate YAML
kubectl apply --dry-run=client -f <file>
```

## VS Code Lab Test Harness Extension

The repository includes a custom VS Code extension for automated lab testing:

### Location
- **Path**: `src/lab-test-harness/`
- **Version**: 1.7.3
- **Purpose**: Execute code blocks from lab README files in VS Code terminals

### Features
- **Automatic Execution**: Runs PowerShell and container code blocks from lab READMEs
- **Smart Error Detection**: Only executes PowerShell/container blocks, skips bash/YAML reference blocks
- **Failure Handling**: Comments with `# this_will_fail` or `# this_could_fail` mark expected failures
- **kubectl exec Support**: Handles interactive and non-interactive container execution properly
- **Cleanup Control**: Optional cleanup execution (defaults to skip for learning)
- **Error Tracking**: Creates TODO.md files for unexpected command failures

### Installation
```powershell
cd src/lab-test-harness
./install-extension.ps1
```

### Usage
1. **Command Palette**: `Lab: Run Lab Test Harness`
2. **Select Lab**: Choose from discovered labs or auto-detect current location
3. **Choose Cleanup**: Skip cleanup (recommended) or run cleanup commands
4. **Automatic Execution**: Extension runs all code blocks with 1s delays
5. **Stop Anytime**: `Ctrl+Shift+Escape` to halt execution

### Code Block Support
- **PowerShell blocks** (````powershell`): Full execution with error tracking
- **Container blocks** (````container`): Execute as-is without PowerShell wrapping  
- **kubectl exec commands**: No error checking (container context)
- **Expected failures**: Mark with `# this_will_fail` or `# this_could_fail` comments

### Commands
| Command | Keybinding | Description |
|---------|------------|-------------|
| `Lab: Run Lab Test Harness` | - | Run complete lab or selected parts |
| `Lab: Run Selected Code Block` | `Ctrl+Shift+Enter` | Execute code block at cursor |
| `Lab: Stop Lab Execution` | `Ctrl+Shift+Escape` | Stop currently running execution |

### Error Tracking
- **TODO.md Creation**: Automatic generation when commands fail unexpectedly
- **Immediate Updates**: Files created as soon as errors occur (survives cancellation)
- **Manual Review**: Extension provides guidance on verifying ❌/✅ indicators
- **Expected Failures**: Commands with failure markers are ignored

### Technical Details
- **Single Terminal**: Uses one terminal per lab execution
- **Working Directory**: Always starts from repository root for relative paths
- **Window Management**: Closes all editors and opens README in preview mode
- **Version Tracking**: Displays version number during installation

## Working with This Repository

- Default branch: `main`
- Current branch: `updates-2507`
- All changes should maintain backward compatibility
- Lab solutions should work on the minimum supported Kubernetes version
- Screenshots and images are stored in `img/` directory