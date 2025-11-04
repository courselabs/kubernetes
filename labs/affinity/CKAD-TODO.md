# CKAD Affinity Lab - TODO List

This document tracks the additional materials needed to complete the CKAD affinity lab.

## Required Spec Files

### Node Affinity Examples
- [ ] `specs/ckad/node-affinity-required.yaml` - Basic required node affinity
- [ ] `specs/ckad/node-affinity-preferred.yaml` - Preferred node affinity with weights
- [ ] `specs/ckad/node-affinity-combined.yaml` - Both required and preferred together
- [ ] `specs/ckad/node-affinity-operators.yaml` - Examples of all operators (In, NotIn, Exists, DoesNotExist, Gt, Lt)
- [ ] `specs/ckad/node-affinity-multiple-terms.yaml` - Multiple nodeSelectorTerms (OR logic)
- [ ] `specs/ckad/node-affinity-multiple-expressions.yaml` - Multiple matchExpressions (AND logic)

### Pod Affinity Examples
- [ ] `specs/ckad/pod-affinity-basic.yaml` - Basic pod affinity (co-location)
- [ ] `specs/ckad/pod-affinity-preferred.yaml` - Preferred pod affinity with weight
- [ ] `specs/ckad/pod-affinity-multiple.yaml` - Multiple affinity rules

### Pod Anti-Affinity Examples
- [ ] `specs/ckad/pod-anti-affinity-basic.yaml` - Basic anti-affinity (spreading)
- [ ] `specs/ckad/pod-anti-affinity-required.yaml` - Required anti-affinity for HA
- [ ] `specs/ckad/pod-anti-affinity-preferred.yaml` - Preferred anti-affinity

### Topology Examples
- [ ] `specs/ckad/topology-hostname.yaml` - Using hostname topology key
- [ ] `specs/ckad/topology-zone.yaml` - Using zone topology key
- [ ] `specs/ckad/topology-region.yaml` - Using region topology key

### Common Patterns
- [ ] `specs/ckad/patterns/ha-spread-zones.yaml` - High availability across zones
- [ ] `specs/ckad/patterns/colocate-cache.yaml` - Co-locate app with cache
- [ ] `specs/ckad/patterns/spread-replicas.yaml` - Spread replicas across nodes
- [ ] `specs/ckad/patterns/region-with-zone-spread.yaml` - Regional with zone spreading
- [ ] `specs/ckad/patterns/avoid-noisy.yaml` - Avoid noisy neighbors
- [ ] `specs/ckad/patterns/avoid-control-plane.yaml` - Keep off control plane nodes
- [ ] `specs/ckad/patterns/specific-node-type.yaml` - Run on specific node types
- [ ] `specs/ckad/patterns/gpu-nodes.yaml` - Schedule on GPU nodes

### Standard Labels Examples
- [ ] `specs/ckad/standard-labels/os-arch.yaml` - Using OS and arch labels
- [ ] `specs/ckad/standard-labels/region-zone.yaml` - Using region and zone labels
- [ ] `specs/ckad/standard-labels/instance-type.yaml` - Using instance type labels

### Troubleshooting Scenarios
- [ ] `specs/ckad/troubleshooting/pending-affinity.yaml` - Pod stuck pending due to affinity
- [ ] `specs/ckad/troubleshooting/no-matching-nodes.yaml` - No nodes match requirements
- [ ] `specs/ckad/troubleshooting/anti-affinity-blocking.yaml` - Anti-affinity preventing scheduling
- [ ] `specs/ckad/troubleshooting/wrong-topology-key.yaml` - Incorrect topology key
- [ ] `specs/ckad/troubleshooting/label-mismatch.yaml` - Label value mismatch

### Combined Affinity Examples
- [ ] `specs/ckad/combined/node-and-pod-affinity.yaml` - Node + pod affinity together
- [ ] `specs/ckad/combined/affinity-and-anti-affinity.yaml` - Both affinity types
- [ ] `specs/ckad/combined/multi-rule-complex.yaml` - Complex multi-rule setup

## Required Exercise Files

### Exercise 1: Basic Node Affinity
- [ ] `specs/ckad/exercises/ex1-node-affinity/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex1-node-affinity/requirements.md` - What to create
- [ ] `specs/ckad/exercises/ex1-node-affinity/setup.sh` - Label nodes for exercise
- [ ] `specs/ckad/exercises/ex1-node-affinity/solution.yaml` - Complete solution
- [ ] `specs/ckad/exercises/ex1-node-affinity/verify.sh` - Verification script

### Exercise 2: Pod Anti-Affinity for HA
- [ ] `specs/ckad/exercises/ex2-anti-affinity/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex2-anti-affinity/requirements.md` - Specifications
- [ ] `specs/ckad/exercises/ex2-anti-affinity/solution.yaml` - Solution with anti-affinity
- [ ] `specs/ckad/exercises/ex2-anti-affinity/verify.sh` - Check pod distribution

### Exercise 3: Co-locate with Cache
- [ ] `specs/ckad/exercises/ex3-colocate/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex3-colocate/cache-deployment.yaml` - Redis cache setup
- [ ] `specs/ckad/exercises/ex3-colocate/app-template.yaml` - Starting point
- [ ] `specs/ckad/exercises/ex3-colocate/solution.yaml` - App with pod affinity
- [ ] `specs/ckad/exercises/ex3-colocate/verify.sh` - Verify co-location

### Exercise 4: Zone Spreading
- [ ] `specs/ckad/exercises/ex4-zone-spread/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex4-zone-spread/setup.sh` - Label nodes with zones
- [ ] `specs/ckad/exercises/ex4-zone-spread/requirements.md` - What to achieve
- [ ] `specs/ckad/exercises/ex4-zone-spread/solution.yaml` - Regional + zone spreading
- [ ] `specs/ckad/exercises/ex4-zone-spread/verify.sh` - Check distribution

### Exercise 5: Troubleshoot Pending Pods
- [ ] `specs/ckad/exercises/ex5-troubleshoot/README.md` - Exercise instructions
- [ ] `specs/ckad/exercises/ex5-troubleshoot/broken-deployment.yaml` - Broken config
- [ ] `specs/ckad/exercises/ex5-troubleshoot/debugging-steps.md` - How to debug
- [ ] `specs/ckad/exercises/ex5-troubleshoot/solution.yaml` - Fixed configuration
- [ ] `specs/ckad/exercises/ex5-troubleshoot/explanation.md` - What was wrong

## Solution Document
- [ ] `solution-ckad.md` - Solutions for all CKAD exercises with explanations

## Additional Documentation

### Reference Guides
- [ ] `docs/affinity-operators-reference.md` - All operators with examples
- [ ] `docs/topology-keys-guide.md` - Common topology keys and when to use
- [ ] `docs/standard-labels-reference.md` - Kubernetes standard labels
- [ ] `docs/required-vs-preferred.md` - When to use each type
- [ ] `docs/weight-calculation.md` - How scheduler calculates weights

### Troubleshooting Guides
- [ ] `docs/debugging-pending-pods.md` - Step-by-step debugging process
- [ ] `docs/affinity-troubleshooting-flowchart.md` - Decision tree for debugging
- [ ] `docs/common-affinity-errors.md` - Error messages and solutions
- [ ] `docs/scheduling-failures-guide.md` - Understanding scheduling failures

### Pattern Documentation
- [ ] `docs/ha-patterns.md` - High availability affinity patterns
- [ ] `docs/performance-patterns.md` - Co-location for performance
- [ ] `docs/anti-patterns.md` - What NOT to do with affinity
- [ ] `docs/production-best-practices.md` - Affinity in production

### Comparison Guides
- [ ] `docs/affinity-vs-nodeSelector.md` - When to use which
- [ ] `docs/affinity-vs-taints.md` - Comparison with taints/tolerations
- [ ] `docs/pod-vs-node-affinity.md` - Choosing the right type

## Testing Materials

### Verification Scripts
- [ ] `tests/verify-node-affinity.sh` - Test node affinity placement
- [ ] `tests/verify-pod-spreading.sh` - Test anti-affinity spreading
- [ ] `tests/verify-colocate.sh` - Test pod affinity co-location
- [ ] `tests/label-test-cluster.sh` - Label nodes for testing

### Exam Simulation
- [ ] `exam-sim/scenario-1-node-placement.md` - Timed: Node affinity setup
- [ ] `exam-sim/scenario-2-spread-zones.md` - Timed: Zone spreading
- [ ] `exam-sim/scenario-3-colocate.md` - Timed: Co-locate pods
- [ ] `exam-sim/scenario-4-avoid-control-plane.md` - Timed: Control plane avoidance
- [ ] `exam-sim/scenario-5-debug-pending.md` - Timed: Troubleshoot affinity

### Test Cluster Setup
- [ ] `setup/k3d-multi-node.sh` - Create multi-node k3d cluster
- [ ] `setup/label-zones.sh` - Add zone labels to nodes
- [ ] `setup/label-regions.sh` - Add region labels
- [ ] `setup/cleanup.sh` - Clean up test resources

## Suggested Spec Content Details

### Node Affinity Examples
Should demonstrate:
- All operators (In, NotIn, Exists, DoesNotExist, Gt, Lt)
- Required vs preferred
- Multiple nodeSelectorTerms (OR logic)
- Multiple matchExpressions (AND logic)
- Combining with nodeSelector
- Using standard Kubernetes labels
- Weight examples (1-100)

### Pod Affinity Examples
Should include:
- Basic co-location pattern
- Multiple pod affinity rules
- Different topology keys
- Required vs preferred
- Using matchLabels vs matchExpressions
- Namespace considerations

### Pod Anti-Affinity Examples
Should demonstrate:
- Spreading across nodes
- Spreading across zones
- Required for strict HA
- Preferred for best effort
- Avoiding noisy neighbors
- Per-deployment isolation

### Troubleshooting Examples
Should include:
- Pending pod due to no matching nodes
- Anti-affinity blocking scheduling
- Wrong label values
- Wrong topology key
- Too many replicas for anti-affinity
- Namespace issues with pod affinity

### Combined Examples
Should show:
- Node affinity + pod affinity together
- Pod affinity + anti-affinity together
- Multiple rules of different types
- Complex production scenarios
- Common real-world patterns

## Integration with Existing Lab

- [ ] Update main README.md to reference CKAD.md
- [ ] Add CKAD label to all new specs: `kubernetes.courselabs.co: affinity-ckad`
- [ ] Ensure examples work with k3d multi-node setup
- [ ] Test examples on Docker Desktop (single node scenarios)
- [ ] Cross-reference basic lab affinity examples

## Priority Order

### High Priority (Core CKAD Topics)
1. Basic node affinity examples (required and preferred)
2. Basic pod affinity and anti-affinity
3. Standard labels examples
4. Common patterns (HA spread, co-locate)
5. Exercise 1 & 5 (basic node affinity, troubleshooting)

### Medium Priority (Important Patterns)
6. Topology key examples (hostname, zone, region)
7. Combined affinity examples
8. Exercise 2 & 3 (anti-affinity, co-location)
9. Troubleshooting scenarios
10. Operators reference

### Low Priority (Nice-to-Have)
11. Exercise 4 (zone spreading)
12. Exam simulation scenarios
13. Advanced patterns
14. Performance optimization guides
15. Comparison guides

## Setup Requirements

### Multi-Node Cluster
Most affinity examples require multiple nodes. Provide:
- k3d cluster creation command
- Node labeling script
- Instructions for adding zone/region labels
- Cleanup instructions

### Labels Needed
Standard setup should include:
- `disktype=ssd` on some nodes, `disktype=hdd` on others
- `node-type=compute` on worker nodes
- `topology.kubernetes.io/zone=zone-a` and `zone-b`
- `topology.kubernetes.io/region=us-west`
- `cis-compliance=verified` and `in-progress`

## Example Deployments

Create test applications:
- [ ] Simple nginx deployment for node affinity practice
- [ ] Redis cache for co-location practice
- [ ] Web app deployment for zone spreading
- [ ] Batch job for noisy neighbor example
- [ ] Database for anti-affinity practice

## Command Cheat Sheets

- [ ] Node labeling commands
- [ ] Checking pod placement commands
- [ ] Debugging affinity commands
- [ ] Quick YAML generation commands
- [ ] Event checking commands

## Visual Aids

Consider creating:
- [ ] Diagram: Node affinity vs pod affinity
- [ ] Diagram: Topology key scopes (node, zone, region)
- [ ] Flowchart: Which affinity type to use
- [ ] Diagram: Required vs preferred scheduling
- [ ] Table: Operator comparison
- [ ] Diagram: AND vs OR logic in affinity rules

## Documentation Enhancements

- [ ] Add decision matrix: "Should I use required or preferred?"
- [ ] Add comparison table: Node affinity vs nodeSelector vs taints
- [ ] Add examples of affinity in production (multi-AZ, multi-region)
- [ ] Add performance considerations
- [ ] Add scaling considerations with affinity

## Testing Checklist

Once specs are created:
- [ ] Validate YAML syntax
- [ ] Deploy to multi-node k3d cluster
- [ ] Verify pods schedule as expected
- [ ] Test on single-node cluster (Docker Desktop)
- [ ] Verify troubleshooting examples show expected errors
- [ ] Test all exercises have working solutions
- [ ] Verify cleanup removes all resources

## Notes

- Focus on practical CKAD exam scenarios
- Include both required and preferred examples
- Show common mistakes and how to avoid them
- Emphasize debugging skills
- Use realistic labels (not foo/bar)
- Test on both multi-node (k3d) and single-node (Docker Desktop)
- Include namespace considerations
- Show interaction with other scheduling features
- Add timing notes for exam scenarios (typically 5-8 minutes)
- Cross-reference official Kubernetes documentation

## Common Exam Patterns to Cover

1. Schedule on specific node type (GPU, SSD, etc.)
2. Spread pods across availability zones
3. Keep pods away from control plane
4. Co-locate app with database/cache
5. Debug pending pods due to affinity
6. Combine multiple affinity rules
7. Use preferred weights for priority
8. Avoid running with specific workloads

---

Use this checklist to track progress on completing the CKAD affinity lab materials.
