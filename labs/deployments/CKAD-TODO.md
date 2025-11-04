# CKAD Deployments Lab - TODO List

This document tracks the additional materials needed to complete the CKAD deployments lab.

## Required Spec Files

### Deployment Strategies
- [ ] `specs/ckad/strategy-rolling.yaml` - RollingUpdate strategy with explicit configuration
- [ ] `specs/ckad/strategy-recreate.yaml` - Recreate strategy example

### Rolling Update Configuration
- [ ] `specs/ckad/rolling-update-config.yaml` - Example demonstrating maxSurge and maxUnavailable

### Resource Management
- [ ] `specs/ckad/resources.yaml` - Deployment with resource requests and limits

### Health Checks
- [ ] `specs/ckad/readiness-probe.yaml` - Readiness probe configuration
- [ ] `specs/ckad/liveness-probe.yaml` - Liveness probe configuration
- [ ] `specs/ckad/startup-probe.yaml` - Startup probe configuration
- [ ] `specs/ckad/all-probes.yaml` - Comprehensive example with all probe types

### Multi-Container Patterns
- [ ] `specs/ckad/init-containers.yaml` - Init container example
- [ ] `specs/ckad/sidecar.yaml` - Sidecar container example (with logging sidecar)
- [ ] `specs/ckad/multi-container.yaml` - Combined init + sidecar pattern

### Advanced Deployment Patterns
- [ ] `specs/ckad/canary/whoami-main.yaml` - Main deployment for canary pattern
- [ ] `specs/ckad/canary/whoami-canary.yaml` - Canary deployment
- [ ] `specs/ckad/canary/service.yaml` - Service for canary routing
- [ ] `specs/ckad/blue-green/whoami-blue.yaml` - Production-ready blue deployment
- [ ] `specs/ckad/blue-green/whoami-green.yaml` - Production-ready green deployment
- [ ] `specs/ckad/blue-green/service-blue.yaml` - Service targeting blue
- [ ] `specs/ckad/blue-green/service-green.yaml` - Service targeting green

### Production Best Practices
- [ ] `specs/ckad/production-ready.yaml` - Complete production-ready deployment template

## Required Exercise Files

### Exercise Solutions
- [ ] `solution-ckad.md` - Solutions for all CKAD exercises
- [ ] `specs/ckad/exercises/ex1-zero-downtime.yaml` - Exercise 1 template
- [ ] `specs/ckad/exercises/ex1-solution.yaml` - Exercise 1 solution
- [ ] `specs/ckad/exercises/ex2-broken.yaml` - Exercise 2 broken deployment
- [ ] `specs/ckad/exercises/ex2-solution.yaml` - Exercise 2 solution
- [ ] `specs/ckad/exercises/ex3-canary/` - Exercise 3 complete canary setup
- [ ] `specs/ckad/exercises/ex4-multi-container.yaml` - Exercise 4 template
- [ ] `specs/ckad/exercises/ex4-solution.yaml` - Exercise 4 solution
- [ ] `specs/ckad/exercises/ex5-production.yaml` - Exercise 5 solution (from scratch)

### Troubleshooting Exercises
- [ ] `specs/ckad/troubleshooting/failed-image.yaml` - Wrong image name scenario
- [ ] `specs/ckad/troubleshooting/no-resources.yaml` - Insufficient resources scenario
- [ ] `specs/ckad/troubleshooting/failed-probe.yaml` - Failed health check scenario
- [ ] `specs/ckad/troubleshooting/crash-loop.yaml` - CrashLoopBackOff scenario

### Scenario-Based Exercises
- [ ] `specs/ckad/scenarios/` - Directory with exam-style scenarios
  - [ ] `scenario-1-update.yaml` - Update version scenario
  - [ ] `scenario-2-rollback.yaml` - Rollback scenario
  - [ ] `scenario-3-scale.yaml` - Scaling scenario
  - [ ] `scenario-4-resources.yaml` - Add resources scenario
  - [ ] `scenario-5-strategy.yaml` - Configure strategy scenario

## Documentation Enhancements

### Change Tracking
- [ ] Add example showing proper use of `kubernetes.io/change-cause` annotation
- [ ] Create example workflow for tracking deployment history

### Additional Content
- [ ] Add more detailed explanations for probe parameters
- [ ] Include timing diagrams for rolling updates
- [ ] Add resource calculation examples
- [ ] Include common error messages and solutions

## Suggested Spec Content Details

### Strategy Examples
Should demonstrate:
- Clear difference between RollingUpdate and Recreate
- Typical use cases for each
- Expected behavior during updates

### Health Check Examples
Should include:
- HTTP GET probes (most common)
- TCP socket probes
- Exec command probes
- Realistic timing configurations
- Working endpoint paths

### Multi-Container Examples
Should demonstrate:
- Init container waiting for service dependency
- Init container preparing volumes
- Sidecar for log shipping (fluent-bit or fluentd)
- Shared volume between containers

### Canary Example
Should include:
- Realistic replica ratios (80/20 or 90/10)
- Monitoring approach
- Gradual cutover steps
- Rollback procedure

### Blue-Green Example
Enhancement needed:
- Add resource requests/limits to existing solution
- Add health checks
- Add proper annotations
- Increase replicas for HA (3+)
- Add monitoring labels

### Production-Ready Template
Must include all CKAD requirements:
- Multiple replicas (3)
- Resource requests and limits
- All three probe types or justification
- Proper rolling update configuration
- Meaningful labels and annotations
- Security context (if applicable)
- Image pull policy

## Testing Checklist

Once specs are created, test each:
- [ ] YAML syntax validation (`kubectl apply --dry-run=client`)
- [ ] Actually deploy to cluster
- [ ] Verify expected behavior
- [ ] Test on Docker Desktop
- [ ] Test on k3d/kind
- [ ] Ensure cleanup works properly

## Integration with Existing Lab

- [ ] Ensure CKAD.md references work with existing lab structure
- [ ] Update main README.md to reference CKAD.md
- [ ] Add CKAD label to all new specs: `kubernetes.courselabs.co: deployments-ckad`
- [ ] Ensure consistent naming conventions
- [ ] Cross-link between basic and CKAD content

## Priority Order

### High Priority (Core CKAD Topics)
1. Production-ready deployment spec
2. Resource management example
3. Health check examples (readiness, liveness)
4. Rolling update configuration
5. Exercise solutions

### Medium Priority (Advanced Patterns)
6. Canary deployment complete example
7. Enhanced blue-green specs
8. Multi-container patterns
9. Troubleshooting scenarios

### Low Priority (Nice-to-Have)
10. Additional documentation
11. Scenario variations
12. Advanced troubleshooting cases

## Notes

- All specs should use `sixeyed/whoami` or other images already in the repo
- Follow existing naming conventions (whoami-*.yaml)
- Include comments in YAML for learning purposes
- Ensure all specs can be cleaned up with the label selector
- Test that specs work on minimum supported Kubernetes version
- Keep examples simple but production-realistic

---

Use this checklist to track progress on completing the CKAD deployments lab materials.
