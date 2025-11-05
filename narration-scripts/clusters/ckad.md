# Kubernetes Clusters - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-20 minutes)

### Section 1: CKAD Node Operations (3 min)
**[00:00-03:00]**

CKAD tests node querying and basic maintenance, not cluster setup.

Essential commands include kubectl get nodes, kubectl describe node, kubectl get nodes with show-labels, kubectl get nodes with label columns using -L, and kubectl top nodes which requires metrics-server.

Node information you need includes capacity, allocatable, conditions, labels, and taints.

### Section 2: Taints and Tolerations (4 min)
**[03:00-07:00]**

To add a taint, use kubectl taint node with the key-value pair and effect, like dedicated=gpu:NoSchedule.

To remove a taint, add a minus sign after the taint specification.

In the Pod spec, you add tolerations with the key, operator Equal, the value, and the effect NoSchedule.

To tolerate any value, use the Exists operator which only checks for the key presence, not specific values.

### Section 3: Node Maintenance Workflow (3 min)
**[07:00-10:00]**

The complete workflow has five steps. First, cordon the node with kubectl cordon to mark it unschedulable. Second, check what will be evicted by getting pods across all namespaces and grepping for the node. Third, drain the node with kubectl drain, using ignore-daemonsets and delete-emptydir-data flags. Fourth, perform your maintenance work. Fifth, uncordon the node to make it schedulable again.

Common drain flags include: ignore-daemonsets which is required for DaemonSet Pods, delete-emptydir-data to delete Pods with emptyDir volumes, force for force deletion (use carefully), and grace-period to set wait time before force kill.

### Section 4: Node Labels and Selectors (3 min)
**[10:00-13:00]**

Add labels with kubectl label node. To update an existing label, use the overwrite flag. To remove a label, add a minus sign after the key name.

In the Pod spec, use nodeSelector with the key-value pair like disktype: ssd.

Standard labels you should know include kubernetes.io/hostname, kubernetes.io/os for linux or windows, kubernetes.io/arch for amd64 or arm64, topology.kubernetes.io/zone, and topology.kubernetes.io/region.

### Section 5: Troubleshooting Node Issues (3 min)
**[13:00-16:00]**

When a Pod is Pending due to node issues, check events by describing the Pod.

Common messages include "nodes didn't match node selector", "Insufficient cpu", or "node(s) had taints that pod didn't tolerate".

Debug steps: Get nodes to check status, describe the node to check capacity and taints, and get nodes with your label selector to verify labels exist.

### Section 6: Exam Practice Scenarios (2 min)
**[16:00-18:00]**

Scenario 1: Label a node and deploy Pods there. Label the node with your key-value, create a Pod with dry-run, add the nodeSelector, then apply.

Scenario 2: Drain a node for maintenance. Cordon the node, drain with ignore-daemonsets, wait for maintenance completion, then uncordon.

Scenario 3: Fix Pod that won't schedule due to taint. Describe the Pod to see the taint error, then add the appropriate toleration to your Pod spec.

### Section 7: Exam Tips (2 min)
**[18:00-20:00]**

Time management: Node operations should take less than 3 minutes.

Quick reference commands: For info, use kubectl get nodes and kubectl describe node. For labels, use kubectl label node and kubectl get nodes with -L. For taints, use kubectl taint node with the effect, and add minus to remove. For maintenance, use kubectl cordon, drain, and uncordon.

Common mistakes include: Forgetting ignore-daemonsets on drain, not checking nodes before troubleshooting Pods, and confusing taints (applied to nodes) with tolerations (applied to Pods).

Practice until these commands are muscle memory!
