# CKAD Logging Lab - TODO List

This document tracks the additional materials needed to complete the CKAD logging lab.

## Required Spec Files

### Basic Logging Examples
- [ ] `specs/ckad/single-container.yaml` - Simple single container pod for basic logging
- [ ] `specs/ckad/deployment-logging.yaml` - Deployment with multiple replicas for log practice
- [ ] `specs/ckad/structured-logging.yaml` - App that outputs JSON logs

### Multi-Container Logging
- [ ] `specs/ckad/multi-container-logs.yaml` - Pod with 3+ containers for practice
- [ ] `specs/ckad/sidecar-logging.yaml` - Application with log sidecar pattern
- [ ] `specs/ckad/multi-log-streams.yaml` - Multiple sidecars for different log files
- [ ] `specs/ckad/log-rotation.yaml` - Sidecar handling log rotation

### Init Container Logging
- [ ] `specs/ckad/init-container-logs.yaml` - Pod with init containers that log
- [ ] `specs/ckad/init-multi-stage.yaml` - Multiple init containers with different logs

### Troubleshooting Scenarios
- [ ] `specs/ckad/troubleshooting/crash-loop.yaml` - Container in CrashLoopBackOff
- [ ] `specs/ckad/troubleshooting/no-logs.yaml` - Container not logging to stdout
- [ ] `specs/ckad/troubleshooting/init-failure.yaml` - Init container failing
- [ ] `specs/ckad/troubleshooting/oom-killed.yaml` - Container being OOMKilled
- [ ] `specs/ckad/troubleshooting/slow-start.yaml` - Container with delayed logging

### Log Patterns
- [ ] `specs/ckad/patterns/stdout-stderr.yaml` - Proper stdout/stderr logging
- [ ] `specs/ckad/patterns/file-to-stdout.yaml` - Converting file logs to stdout
- [ ] `specs/ckad/patterns/log-levels.yaml` - Different log level configurations
- [ ] `specs/ckad/patterns/timestamp-formats.yaml` - Various timestamp formats

### Volume-Based Logging
- [ ] `specs/ckad/volumes/emptydir-logs.yaml` - EmptyDir for log sharing
- [ ] `specs/ckad/volumes/hostpath-logs.yaml` - HostPath for node log access (demo only)
- [ ] `specs/ckad/volumes/shared-logs.yaml` - Multiple containers sharing log volume

## Required Exercise Files

### Exercise 1: Basic Log Viewing
- [ ] `specs/ckad/exercises/ex1-basic-logs/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex1-basic-logs/deployment.yaml` - Deployment to practice with
- [ ] `specs/ckad/exercises/ex1-basic-logs/commands.md` - List of commands to practice
- [ ] `specs/ckad/exercises/ex1-basic-logs/solution.md` - Expected outputs

### Exercise 2: Multi-Container Logging
- [ ] `specs/ckad/exercises/ex2-multi-container/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex2-multi-container/pod.yaml` - Multi-container pod
- [ ] `specs/ckad/exercises/ex2-multi-container/solution.md` - Commands and outputs

### Exercise 3: Troubleshoot Crashing Container
- [ ] `specs/ckad/exercises/ex3-crash-debug/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex3-crash-debug/broken-app.yaml` - Crashing container
- [ ] `specs/ckad/exercises/ex3-crash-debug/debugging-steps.md` - Step-by-step debug process
- [ ] `specs/ckad/exercises/ex3-crash-debug/solution.md` - How to identify and fix

### Exercise 4: Sidecar for File Logs
- [ ] `specs/ckad/exercises/ex4-sidecar-logs/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex4-sidecar-logs/app-base.yaml` - Starting point (file logging)
- [ ] `specs/ckad/exercises/ex4-sidecar-logs/app-solution.yaml` - With sidecar added
- [ ] `specs/ckad/exercises/ex4-sidecar-logs/verification.md` - How to verify it works

### Exercise 5: Multi-Pod Log Aggregation
- [ ] `specs/ckad/exercises/ex5-multi-pod-logs/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex5-multi-pod-logs/deployment.yaml` - Deployment with 5 replicas
- [ ] `specs/ckad/exercises/ex5-multi-pod-logs/tasks.md` - Tasks to complete
- [ ] `specs/ckad/exercises/ex5-multi-pod-logs/solution.md` - Commands and techniques

## Solution Document
- [ ] `solution-ckad.md` - Solutions for all CKAD exercises with explanations

## Additional Documentation

### Command Reference Guides
- [ ] `docs/kubectl-logs-cheatsheet.md` - Quick reference for all log commands
- [ ] `docs/log-filtering-guide.md` - Guide to --tail, --since, --timestamps
- [ ] `docs/multi-container-commands.md` - Commands specific to multi-container pods

### Troubleshooting Guides
- [ ] `docs/crash-loop-debugging.md` - Step-by-step guide for CrashLoopBackOff
- [ ] `docs/init-container-troubleshooting.md` - Debug init container failures
- [ ] `docs/no-logs-scenarios.md` - Why logs might not appear and solutions
- [ ] `docs/log-debugging-flowchart.md` - Decision tree for log debugging

### Pattern Documentation
- [ ] `docs/sidecar-pattern-guide.md` - Complete guide to logging sidecars
- [ ] `docs/logging-best-practices.md` - Application logging best practices
- [ ] `docs/stdout-vs-files.md` - When to use each approach

### Demo Applications
- [ ] `apps/logger-app/` - Simple app that logs to stdout with different levels
- [ ] `apps/file-logger-app/` - App that writes to log files
- [ ] `apps/crash-app/` - App that intentionally crashes with error logs
- [ ] `apps/multi-log-app/` - App that writes to multiple log files

## Testing Materials

### Verification Scripts
- [ ] `tests/verify-logs.sh` - Test log viewing commands
- [ ] `tests/verify-multi-container.sh` - Test multi-container log commands
- [ ] `tests/verify-sidecar.sh` - Test sidecar logging pattern
- [ ] `tests/simulate-crash.sh` - Create crashing scenario for practice

### Exam Simulation
- [ ] `exam-sim/scenario-1-view-logs.md` - Timed: View logs from deployment
- [ ] `exam-sim/scenario-2-crash-debug.md` - Timed: Debug crashing pod
- [ ] `exam-sim/scenario-3-multi-container.md` - Timed: Multi-container log viewing
- [ ] `exam-sim/scenario-4-add-sidecar.md` - Timed: Add logging sidecar
- [ ] `exam-sim/scenario-5-find-errors.md` - Timed: Find errors across pods

## Suggested Spec Content Details

### Single Container Example
Should demonstrate:
- Simple application logging to stdout
- Different log levels (DEBUG, INFO, WARN, ERROR)
- Realistic log messages
- Timestamps in logs
- Multiple replicas for practice

### Multi-Container Example
Should include:
- Main application container
- Sidecar container
- Init container
- All containers producing logs
- Different log patterns per container
- Labels for easy selection

### Sidecar Logging Pattern
Should demonstrate:
- Application writing to log file
- Shared emptyDir volume
- Sidecar tailing log file
- Using busybox or alpine for sidecar
- Proper volume mount (readOnly for sidecar)
- Comments explaining the pattern

### Crashing Container Example
Should include:
- Container that crashes after startup
- Clear error message in logs
- Realistic error scenario (e.g., missing config, connection failure)
- Restarts visible in pod status
- Both current and previous logs available

### Init Container Example
Should demonstrate:
- Init container performing setup task
- Logging progress messages
- Possible failure scenario
- Main container that depends on init success
- Clear log messages explaining what's happening

### Multi-Log Streams Example
Should show:
- Application writing to multiple files (access.log, error.log, app.log)
- Separate sidecar for each log file
- Shared volume configuration
- How to view each stream independently
- Realistic log content in each stream

## Integration with Existing Lab

- [ ] Update main README.md to reference CKAD.md
- [ ] Add CKAD label to all new specs: `kubernetes.courselabs.co: logging-ckad`
- [ ] Ensure examples use images that are already in repo or common ones (busybox, nginx)
- [ ] Cross-reference with EFK centralized logging lab
- [ ] Show how kubectl logs feeds into centralized logging

## Priority Order

### High Priority (Core CKAD Topics)
1. Single container logging example
2. Multi-container logging example
3. Sidecar logging pattern
4. Crashing container example
5. Exercise 1 & 3 (basic logs, crash debug)

### Medium Priority (Important Patterns)
6. Init container logging example
7. Multiple log streams example
8. Exercise 2 & 4 (multi-container, sidecar)
9. Troubleshooting scenarios
10. Command reference guide

### Low Priority (Nice-to-Have)
11. Exercise 5 (multi-pod aggregation)
12. Exam simulation scenarios
13. Demo applications
14. Advanced troubleshooting guides
15. Pattern documentation

## Example Applications

### Simple Logger App (Python)
```python
import time
import logging

logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')

while True:
    logging.info("Application is running")
    time.sleep(5)
    logging.debug("Debug message")
    if time.time() % 30 < 5:
        logging.error("Simulated error occurred")
```

### File Logger App (Shell)
```bash
#!/bin/sh
while true; do
    echo "$(date) - Application log entry" >> /var/log/app/app.log
    sleep 2
done
```

### Crashing App (Python)
```python
import sys
import time

print("Starting application...")
time.sleep(5)
print("ERROR: Failed to connect to database")
sys.exit(1)
```

These should be containerized with Dockerfiles for use in examples.

## Documentation Enhancements

- [ ] Add diagrams showing log flow (app -> stdout -> kubectl logs)
- [ ] Add diagram of sidecar pattern with shared volume
- [ ] Add table comparing logging approaches (stdout vs files)
- [ ] Add decision tree: "Which logging command should I use?"
- [ ] Add comparison table of log filtering options
- [ ] Add timeline diagram of container lifecycle and logs

## Common Log Messages to Include

Examples should include realistic log messages:
- Startup messages
- Initialization steps
- Connection attempts
- Request processing
- Error messages
- Warning messages
- Debug information
- Shutdown messages

This makes practice more realistic and helps students recognize patterns.

## Container Images to Use

Prefer existing or common images:
- `busybox:1.35` - For simple sidecars
- `alpine:3.14` - Alternative for sidecars
- `nginx:1.21` - Logs to stdout by default
- `redis:6.2` - Logs to stdout
- `postgres:13` - Good for init container examples
- Custom images from courselabs registry (if available)

## Testing Checklist

Once specs are created, verify:
- [ ] YAML syntax valid (`kubectl apply --dry-run=client`)
- [ ] Actually deploy to cluster
- [ ] Verify logs appear with kubectl logs
- [ ] Test all command variations documented
- [ ] Test on Docker Desktop
- [ ] Test on k3d/kind
- [ ] Ensure cleanup removes all resources
- [ ] Verify examples match documentation

## Notes

- Focus on kubectl logs commands, not EFK stack
- Keep examples simple but realistic
- Include comments in YAML explaining log-related configurations
- Test that all commands work as documented
- Ensure crashing examples are safe and don't affect cluster
- Use resource limits to prevent runaway containers
- Include both imperative and declarative approaches where applicable
- Add timing notes for exam simulation (most scenarios: 2-5 minutes)
- Cross-reference official Kubernetes documentation

---

Use this checklist to track progress on completing the CKAD logging lab materials.
