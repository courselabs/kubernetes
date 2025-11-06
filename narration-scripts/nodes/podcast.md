# Examining Nodes with Kubectl - Podcast Script

**Duration:** 16-18 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening: Understanding Your Cluster Infrastructure (1 min)

Welcome to this deep dive on examining Kubernetes nodes with kubectl. While nodes might seem like infrastructure-level concerns outside a developer's scope, understanding how to query and inspect nodes is essential for CKAD certification and effective Kubernetes troubleshooting.

Nodes are the worker machines - physical servers, virtual machines, or cloud instances - that run your containers. Every Pod you deploy runs on a node, and when things go wrong, understanding node state often reveals the root cause. A Pod stuck in Pending might be caused by insufficient node resources, incorrect labels, or node conditions like memory pressure.

Today we'll cover how to efficiently query nodes, understand their capacity and allocatable resources, work with node labels for scheduling, format output for quick answers, and most importantly - how to troubleshoot Pod scheduling issues by examining node information. These are fundamental CKAD skills that can save you precious minutes during the exam.

---

## What Are Nodes and Why They Matter (2 min)

Let's start with what nodes are in the Kubernetes architecture. Nodes are the machines that do the actual work of running your containers. Each node runs several critical components that enable the Kubernetes cluster to function.

First, every node runs the kubelet, which is the primary node agent. The kubelet receives Pod specifications from the API server and ensures containers are running and healthy. It's the bridge between Kubernetes control plane and the actual container runtime.

Second, nodes run a container runtime - this could be Docker, containerd, or CRI-O. The runtime actually creates and manages containers. When you deploy a Pod, the kubelet talks to the container runtime to pull images, start containers, and monitor their status.

Third, nodes run kube-proxy, the network proxy. This implements Kubernetes Service networking, ensuring traffic to a Service IP address gets routed to the correct Pods. It handles the load balancing and network rules that make Services work.

Kubernetes stores all node information in its database, making it queryable through kubectl. This is powerful - you can inspect node capacity, labels, conditions, running Pods, and resource allocation all through the API without directly accessing the node machines.

For developers and CKAD candidates, nodes matter because Pod scheduling depends on node properties. When you create a Pod, the Kubernetes scheduler examines all nodes to find one that meets the Pod's requirements - sufficient CPU and memory, matching labels, tolerated taints, and available resources. Understanding how to query node information helps you troubleshoot when scheduling fails or when you want to control where Pods run.

---

## Essential Node Commands (2 min)

Let's cover the essential commands you'll use to query nodes. These should become muscle memory for the CKAD exam.

The most basic command is kubectl get nodes. This lists all nodes with their name, status, roles, age, and Kubernetes version. The status column is critical - you want to see Ready, which means the node is healthy and can accept workloads. If you see NotReady, that node has a problem and won't receive new Pods.

For more information, use kubectl get nodes with the -o wide flag. This adds columns showing the node's internal IP address, external IP if it has one, operating system, kernel version, and container runtime version. This is useful when you need to verify what runtime is being used or see the OS distribution.

For comprehensive details, use kubectl describe nodes to see information about all nodes, or kubectl describe node followed by a specific node name to focus on one. The describe output is extensive - it shows labels, annotations, taints, capacity and allocatable resources, conditions, running Pods with their resource requests, and recent events. When troubleshooting scheduling issues, describe is your primary diagnostic tool.

You can also use kubectl get nodes with show-labels to see all labels on every node. Labels are key-value pairs that provide metadata about nodes - things like availability zone, instance type, whether the node has GPU accelerators, or custom labels you've added yourself. Labels are used heavily in Pod scheduling with node selectors and node affinity.

Finally, kubectl explain is invaluable for understanding the node resource structure. Use kubectl explain node to see the top-level fields, kubectl explain node.status for status-related fields, or kubectl explain node.status.capacity to understand capacity reporting. This works offline and doesn't require documentation access, making it perfect for the exam environment.

---

## Node Capacity and Allocatable Resources (2 min)

Understanding node capacity versus allocatable resources is critical for troubleshooting Pod scheduling failures.

Node capacity represents the total resources available on the physical or virtual machine. When you describe a node and look at the Capacity section, you see the total CPU cores and total memory on that machine. For example, a node might have a capacity of 4 CPU cores and 16 gigabytes of memory.

However, Pods cannot use all of this capacity. The system needs to reserve resources for operating system processes, the kubelet itself, container runtime, and other system daemons. The Allocatable section shows resources available for Pods - this is capacity minus system reservations.

For example, a node with 4 CPU capacity might show 3800 milliCPU as allocatable. That 200 milliCPU difference is reserved for system components. Similarly, memory might show 16 gigabytes capacity but only 15 gigabytes allocatable after system reservations.

This distinction matters when troubleshooting. If a Pod requests 2 CPU cores but the node only has 1.5 CPU allocatable remaining even though capacity is 4 CPU, the Pod cannot be scheduled there. The scheduler uses allocatable resources, not capacity, when making placement decisions.

When you describe a node, you also see allocated resources, which shows how much of the allocatable amount is currently requested by running Pods. This is expressed as absolute values and percentages. If you see CPU at 90 percent or memory at 95 percent, the node is nearly full and may not accept new Pods.

One common exam scenario: a Pod is stuck in Pending, and when you describe the node, you discover allocated resources are at 100 percent. The solution might be scaling down other workloads, adding more nodes, or reducing the pending Pod's resource requests.

---

## Node Labels and Pod Scheduling (3 min)

Node labels are key-value pairs that provide metadata about nodes. Understanding how to view and manipulate labels is essential because they're the primary mechanism for controlling where Pods run.

Kubernetes automatically applies several standard labels to nodes. The kubernetes.io/hostname label contains the node's name. The kubernetes.io/os label shows the operating system - typically linux but could be windows. The kubernetes.io/arch label shows CPU architecture like amd64, arm64, or others. Cloud providers add topology labels like topology.kubernetes.io/zone showing the availability zone and topology.kubernetes.io/region showing the geographic region.

You can add custom labels to nodes for any purpose. Common patterns include labeling nodes by their role, like disktype equals ssd for nodes with fast storage, environment equals production for production workload nodes, or workload equals database for nodes dedicated to database Pods.

To view labels, use kubectl get nodes with the show-labels flag. This shows all labels in a single line, which can be hard to read. For specific labels, use kubectl get nodes with -L followed by label keys, which adds those labels as separate columns in the output. For example, kubectl get nodes -L kubernetes.io/os,kubernetes.io/arch shows OS and architecture as readable columns.

To add a label to a node, use kubectl label node followed by the node name and the key equals value pair. For example, kubectl label node worker-1 disktype equals ssd. To update an existing label, you need the overwrite flag, like kubectl label node worker-1 disktype equals nvme --overwrite. To remove a label, use kubectl label node worker-1 disktype- with a minus sign after the key.

Labels become powerful when combined with Pod scheduling constraints. The simplest mechanism is node selector in your Pod spec. You specify a map of labels that nodes must have. For example, if your Pod spec includes nodeSelector with disktype equals ssd, the scheduler only considers nodes with that label. The Pod will stay in Pending if no nodes match.

More advanced scheduling uses node affinity, which allows you to express preferences with weights, use operators like In and NotIn, and create complex rules. But the underlying mechanism is still labels - the scheduler matches node labels against your affinity rules to make placement decisions.

For CKAD, you need to quickly view node labels, add labels when needed, and understand how node selectors use labels to constrain scheduling. Practice these operations until they're automatic.

---

## Node Status and Conditions (2 min)

Node conditions indicate the health and state of a node. Understanding these conditions helps you troubleshoot cluster problems and identify why Pods might not be scheduling.

The most important condition is Ready. When a node's Ready condition is True, the node is healthy and can accept new Pods. When Ready is False, something is wrong with the node - maybe the kubelet stopped responding, the container runtime crashed, or network connectivity was lost. When a node is NotReady, the scheduler won't place new Pods there, and existing Pods might be evicted if the condition persists.

Other conditions indicate specific resource pressure situations. MemoryPressure means the node is low on available memory. When this condition is True, the kubelet might start evicting Pods to reclaim memory. DiskPressure means the node is low on disk space - either on the root filesystem or the image filesystem. This can prevent new images from being pulled or new Pods from starting.

PIDPressure indicates the node is running too many processes. Linux systems have a limit on the number of process IDs, and hitting this limit prevents new processes from starting, including new containers. NetworkUnavailable means the network on the node is not correctly configured, which will prevent Pods from communicating.

When you run kubectl describe node and look at the Conditions section, you see all of these with their status, last transition time, and reason. Under normal operation, Ready should be True and all pressure conditions should be False.

In the CKAD exam, if you encounter Pods stuck in Pending or failing to start, always check node conditions. A node might appear in kubectl get nodes output but have conditions indicating it's not truly healthy. This explains why the scheduler isn't placing Pods there.

---

## Output Formatting for Efficient Queries (2 min)

The CKAD exam is time-constrained, so you need to extract information quickly. Kubectl provides several output formats that help you get exactly what you need without manual filtering.

The default output format is a human-readable table. This is fine for browsing but not optimal when you need specific information. The -o wide flag adds more columns to the table, showing additional details like IP addresses and runtime versions.

For complete information, use -o yaml or -o json to see the full node resource as structured data. YAML is more human-readable while JSON is better for programmatic processing. These formats show every field, which can be overwhelming, but they're useful when you need to see the complete state.

For scripting or quick extraction of specific values, use JSONPath queries with -o jsonpath. JSONPath lets you specify exactly which field you want. For example, kubectl get node worker-1 -o jsonpath equals single quote curly brace dot status dot capacity dot cpu curly brace returns just the CPU capacity number. For memory, use dot status dot capacity dot memory. For container runtime version, use dot status dot nodeInfo dot containerRuntimeVersion.

One gotcha with JSONPath: when label keys contain slashes like kubernetes.io/arch, you need to escape them with bracket notation instead of dot notation. Use curly brace dot metadata dot labels bracket quote kubernetes dot io slash arch quote bracket curly brace.

For custom table output, use -o custom-columns to define your own columns. This combines the readability of tables with the precision of JSONPath. You specify column names and the JSONPath for each column's data.

For the CKAD exam, memorize a few key JSONPath patterns for common queries. Being able to extract a specific value in five seconds versus thirty seconds adds up across the exam. Practice combining kubectl commands with JSONPath until it's natural.

---

## Troubleshooting Pod Scheduling with Node Information (3 min)

Let's walk through how node information helps troubleshoot the most common CKAD scenario - a Pod stuck in Pending state.

When a Pod is pending, the scheduler couldn't find a suitable node. Your first step is kubectl describe pod to see the events section, which usually contains the scheduler's reason for not placing the Pod. Common messages include "insufficient CPU," "insufficient memory," "node didn't match Pod's node affinity," or "node had taints that the Pod didn't tolerate."

Once you know the general reason, examine nodes to understand the specific issue. If the error mentions insufficient resources, check node capacity and allocated resources. Use kubectl describe nodes and look at the Allocated resources section. If CPU or memory is at or near 100 percent, you've found your problem - there's no room for the new Pod.

The solution might be scaling down less critical workloads, reducing the resource requests in your pending Pod, or if you have control over the cluster, adding more nodes. In the CKAD exam environment, you typically can't add nodes, so you focus on adjusting Pod specs or cleaning up existing resources.

If the error mentions node selectors or affinity not matching, you need to verify node labels. Use kubectl get nodes with show-labels or kubectl get nodes -L followed by the specific label keys you're interested in. Compare the labels on your nodes against the node selector or affinity rules in your Pod spec. If no nodes have the required labels, you have two options - add the labels to appropriate nodes using kubectl label node, or modify the Pod spec to use labels that actually exist.

For example, if your Pod's node selector requires disktype equals ssd but no nodes have that label, kubectl label node worker-1 disktype=ssd solves the problem. After adding the label, the scheduler's next reconciliation loop should place the Pod on that node.

If the error mentions taints that the Pod doesn't tolerate, check node taints with kubectl describe node and look at the Taints line. Nodes can be tainted to repel Pods unless the Pod specifically tolerates that taint. Control plane nodes are commonly tainted to prevent user workloads from running there. The solution is either adding a toleration to your Pod spec or removing the taint from the node if appropriate.

Another common scenario: all nodes are showing Ready status but a Pod still won't schedule. Check if nodes are cordoned, meaning they're marked unschedulable. When you cordon a node for maintenance, existing Pods continue running but new Pods won't be scheduled there. Use kubectl get nodes and check if any show SchedulingDisabled status. If so, use kubectl uncordon followed by the node name to re-enable scheduling.

---

## CKAD Exam Strategies and Speed Tips (2 min)

Let's focus on practical strategies for handling node operations efficiently during the CKAD exam.

First, use kubectl shortcuts. You can abbreviate nodes as no, so kubectl get no instead of kubectl get nodes. Every second saved counts. Tab completion is your friend - type kubectl get no <tab> to autocomplete node names rather than typing them fully.

Second, memorize the key commands you'll use repeatedly. Kubectl get nodes for a quick status check. Kubectl describe node followed by a name for detailed troubleshooting. Kubectl get nodes with show-labels to see labels. Kubectl label node followed by name and key-value to add labels. These four commands cover 90 percent of node operations you'll need.

Third, know your JSONPath patterns for common queries. CPU capacity, memory capacity, and container runtime version are frequently requested. Have these JSONPath expressions memorized so you can type them instantly.

Fourth, when troubleshooting Pod scheduling, always check nodes first. A common exam mistake is spending minutes examining Pod specs when the issue is simply that no nodes have available resources. Kubectl describe nodes piped to grep for "Allocated resources" shows you resource utilization across all nodes in seconds.

Fifth, practice the complete troubleshooting workflow until it's automatic. Pod is Pending, describe the Pod to see scheduler messages, identify the constraint type, query relevant node information, adjust either the Pod spec or node labels as needed, verify the Pod schedules. This workflow should take under a minute for straightforward scenarios.

Finally, don't overthink node operations. CKAD tests your ability to query cluster state and troubleshoot application-level issues. You won't be asked to configure nodes, install components, or perform deep infrastructure work. Focus on the developer-centric node skills - viewing labels, checking capacity, understanding conditions, and using that information to fix Pod scheduling problems.

---

## Summary and Key Takeaways (1 min)

Let's summarize the essential node concepts for CKAD success.

Nodes are the worker machines that run your containers. Understanding node state is critical for troubleshooting Pod scheduling issues. The Ready condition indicates whether a node is healthy and available for workloads.

Node capacity shows total resources on the machine. Node allocatable shows resources available for Pods after system reservations. The scheduler uses allocatable amounts when making placement decisions. Always check allocated resources when troubleshooting Pending Pods.

Node labels are key-value pairs used for scheduling. Standard labels include hostname, OS, architecture, and topology information. You add custom labels with kubectl label node, view them with kubectl get nodes and show-labels, and use them in Pod specs with node selector or node affinity.

Essential commands: kubectl get nodes for status, kubectl describe node for details, kubectl get nodes with show-labels for labels, kubectl label node for adding labels, and kubectl explain node for documentation.

For exam success, memorize common commands and JSONPath patterns. When Pods are Pending, check node capacity, labels, and conditions first. Practice the troubleshooting workflow until it's automatic. Node operations should never slow you down during the exam.

Master these skills and you'll confidently handle any node-related question in the CKAD exam. Thank you for listening, and good luck with your preparation!
