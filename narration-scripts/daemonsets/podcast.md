# DaemonSets - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening (1 min)

Welcome to this session on Kubernetes DaemonSets. DaemonSets are a specialized Pod controller that ensures exactly one Pod runs on each node in your cluster. While they're less common than Deployments or StatefulSets, understanding DaemonSets is important for CKAD certification and essential for managing node-level infrastructure in Kubernetes.

Today we'll explore what makes DaemonSets unique, the real-world scenarios where they're the right choice, and how they differ from other Pod controllers. We'll cover node selection mechanisms, HostPath volumes for accessing node resources, update strategies, and the exam-specific knowledge you need to work with DaemonSets quickly and confidently.

DaemonSets manage node-level services like monitoring agents, log collectors, network plugins, and storage daemons. These are the infrastructure components that must run on every node to make Kubernetes work effectively. Let's dive into how DaemonSets accomplish this and when you should use them.

---

## What Makes DaemonSets Different (2 min)

To understand DaemonSets, let's contrast them with Deployments, which you're probably more familiar with.

With a Deployment, you specify the number of replicas you want - say, three Pods. Kubernetes distributes these three Pods across available nodes based on scheduling algorithms, resource availability, and constraints. You explicitly control the replica count, and Kubernetes handles distribution.

With a DaemonSet, you don't specify a replica count at all. Instead, you say "I want exactly one Pod on every node" - or more precisely, "one Pod on every node that matches my criteria." Kubernetes automatically maintains this by creating a Pod when a new node joins the cluster, removing the Pod when a node is removed, and ensuring exactly one Pod per node, never more, never less.

This automatic scaling behavior is fundamental. In a cluster with three nodes, a DaemonSet creates three Pods. Add a fourth node, and Kubernetes automatically creates a fourth Pod on that node. Remove a node, and its DaemonSet Pod goes with it. You never manually adjust the number of replicas because it's determined by the number of matching nodes.

The name "DaemonSet" comes from Unix daemons - background processes that run continuously on systems. Similarly, DaemonSet Pods are background services running on every node, providing node-level functionality.

Key differences from Deployments: DaemonSets have no replicas field in their spec - it's not needed. The scheduler doesn't place DaemonSet Pods using normal scheduling logic - the DaemonSet controller handles placement directly. DaemonSets commonly use HostPath volumes to access node resources, which is rare in Deployments. And update behavior differs - DaemonSets delete old Pods before creating new ones, while Deployments do the opposite.

Understanding these differences is crucial for CKAD. When you see "ensure one Pod per node" or "node-level service," think DaemonSet.

---

## Common Use Cases (2 min)

DaemonSets serve specific infrastructure roles. Let's explore the real-world scenarios where they're the right choice.

Monitoring and metrics collection is a primary use case. Tools like Prometheus Node Exporter collect hardware and OS metrics from each node - CPU usage, memory, disk I/O, network statistics. These metrics are node-specific, so you need an agent on every node. Datadog and New Relic agents follow the same pattern, monitoring all containers running on their respective nodes.

Log collection is another major use case. Fluentd collects logs from all containers on a node by reading from the node's log directories. Filebeat ships log files to central logging systems like Elasticsearch. These collectors need access to node-level log paths, making DaemonSets the natural fit.

Network infrastructure relies heavily on DaemonSets. CNI plugins like Calico, Weave, and Flannel manage pod networking on each node. They configure network routing, enforce network policies, and provide overlay networking. Kube-proxy, though technically a system component, is deployed as a DaemonSet in many clusters. It handles network routing rules for Services on each node.

Storage plugins use DaemonSets too. Ceph agents manage distributed storage per node, and GlusterFS daemons provide storage services. These need local agents on each node to manage disk resources and provide storage to Pods.

Security and compliance tools run as DaemonSets. Falco monitors runtime security on each node, detecting suspicious behavior and policy violations. Sysdig provides deep system visibility per node for troubleshooting and forensics.

The pattern is clear: if your application needs to work with node-level resources like logs, metrics, network interfaces, or storage, or if it provides infrastructure services that must run on every node, DaemonSet is likely the right choice.

---

## Node Selection and Targeting (3 min)

One of DaemonSet's most powerful features is the ability to target specific nodes. Let's explore the three approaches.

By default, a DaemonSet creates a Pod on every node in the cluster. You simply define the DaemonSet with a selector and Pod template, and Kubernetes handles the rest. This is appropriate when you genuinely need the service on all nodes, like cluster-wide monitoring or logging.

For more targeted deployments, use nodeSelector in the Pod template spec. Node selectors are simple key-value pairs that must match node labels. For example, if you add nodeSelector with disktype: ssd, Pods only run on nodes labeled with disktype equals ssd. This is perfect for scenarios like deploying a DaemonSet only to GPU nodes by selecting gpu equals true, or only to production nodes using environment equals production, or only to nodes with fast storage using disktype equals ssd.

Node selectors provide dynamic behavior. When you label a node with a matching label, the DaemonSet automatically creates a Pod on that node. Remove the label, and the DaemonSet removes its Pod from that node. This dynamic adjustment makes DaemonSets ideal for heterogeneous clusters with different node types.

The third approach uses tolerations to run on special nodes. Some nodes have taints that prevent normal Pod scheduling - particularly control plane nodes. Control plane nodes are usually tainted with node-role.kubernetes.io/master or node-role.kubernetes.io/control-plane with NoSchedule effect, preventing user workloads from consuming their resources.

But infrastructure DaemonSets often need to run even on control plane nodes. Monitoring agents should collect metrics from all nodes, including masters. Network plugins must configure networking on every node. To achieve this, add tolerations to your DaemonSet Pod template that match the master node taints. The toleration says "this Pod can run on tainted nodes that would normally repel it."

You can combine node selectors and tolerations for complex scenarios. For instance, "run on all nodes with SSDs, including master nodes" uses both nodeSelector for the SSD requirement and tolerations for the master taint.

For CKAD, understand that nodeSelector is specified in the Pod template spec, not at the DaemonSet level. Practice adding tolerations for common taints. And remember that changing node labels dynamically affects which Pods the DaemonSet creates.

---

## HostPath Volumes and Node Access (3 min)

DaemonSets commonly need access to node resources, which is achieved through HostPath volumes. Let's understand this important pattern and its security implications.

A HostPath volume mounts a directory or file from the node's filesystem directly into the Pod. Unlike normal volumes that provide storage isolated to the Pod, HostPath gives direct access to the node's files. This is powerful but potentially dangerous.

Common HostPath use cases in DaemonSets include log collection, where you mount /var/log to read container and system logs. Container runtime access mounts the Docker socket at /var/run/docker.sock or the containerd socket, allowing the Pod to interact with the container runtime for monitoring or management. System metrics collection mounts /proc and /sys directories to read kernel and system information. And node filesystem access might mount /etc or /var for reading configuration or state files.

HostPath volumes have a type field that provides validation. The Directory type means the path must exist as a directory on the node. DirectoryOrCreate tells Kubernetes to create the directory if it doesn't exist. File means it must exist as a file. FileOrCreate creates it if needed. And Socket means it must exist as a Unix domain socket, used for things like the Docker socket.

Security considerations are critical with HostPath. Pods with HostPath access can read sensitive node files like /etc/shadow, private keys, or cloud credentials. They can write to node directories, potentially affecting the host system or other containers. And a compromised container with HostPath access creates a significant security risk.

Best practices for HostPath include using readOnly: true in volumeMounts whenever possible - if you only need to read logs, don't grant write access. Limit HostPath usage to trusted workloads like official monitoring and logging tools, not arbitrary applications. Use Pod Security Standards to restrict which Pods can use HostPath - the baseline standard blocks most HostPath usage, and restricted blocks it entirely except for specific allowed paths. Always specify the type field for validation, catching errors if paths don't exist as expected.

For CKAD scenarios, expect questions involving DaemonSets that mount node directories for log collection or monitoring. Practice the HostPath syntax: volumes at the Pod level with name, hostPath with path and type. Then volumeMounts in the container spec with name, mountPath, and optionally readOnly.

---

## Update Strategies (3 min)

DaemonSets support two update strategies that control how Pods are replaced during updates. Understanding these is critical because DaemonSet update behavior differs fundamentally from Deployments.

The RollingUpdate strategy is the default. When you update the DaemonSet Pod template, Kubernetes automatically replaces Pods. However, here's the key difference from Deployments: DaemonSets terminate the old Pod before creating the new one on each node. Deployments do the opposite - they create the new Pod, wait for it to be ready, then terminate the old one.

Why this difference? Because DaemonSets ensure exactly one Pod per node. You can't have two Pods from the same DaemonSet on one node, so Kubernetes must remove the old one before creating the new one. This means DaemonSet updates can cause brief service interruptions per node.

RollingUpdate has a maxUnavailable parameter that controls update speed. A value of 1 means update one node at a time. A value of 2 means update two nodes simultaneously. You can also use percentages like 20%. The parameter represents how many nodes can have their Pod missing during the update.

The update process works like this: DaemonSet spec is updated with a new container image or configuration. The controller picks a node and terminates its Pod. After termination, it creates a new Pod with the updated spec. Once that Pod is ready, it moves to the next node. This continues until all nodes are updated.

The OnDelete strategy provides manual control. With OnDelete, updates don't happen automatically. When you update the DaemonSet spec, existing Pods continue running with the old spec unchanged. Updates only happen when you manually delete Pods. Each deleted Pod is recreated with the new spec. This gives you complete control over the rollout timing.

Use cases for OnDelete include critical infrastructure where you want to control exactly when updates happen, coordinating updates with external systems or maintenance windows, testing updates on one node before rolling out cluster-wide, and implementing custom rollout logic with automation tools.

For CKAD scenarios, if a question asks for "automatic updates," use RollingUpdate which is the default. If it asks for "manual control over Pod updates" or "update only when you delete Pods," use OnDelete. Practice the syntax: updateStrategy at the DaemonSet spec level with type: RollingUpdate or OnDelete, and for RollingUpdate, optionally specify rollingUpdate with maxUnavailable.

---

## Init Containers in DaemonSets (2 min)

Init containers are frequently used with DaemonSets to prepare the node environment before the main container starts. Let's explore this powerful pattern.

Init containers run before main application containers and must complete successfully before the main containers start. They share volumes with the main containers, allowing data passing between initialization and runtime phases.

Common init container patterns in DaemonSets include setting up host configuration. You might use an init container with a privileged security context to run sysctl commands that configure kernel parameters like enabling IP forwarding. This must happen before the main networking daemon starts.

Another pattern is waiting for dependencies. The init container might poll until a required service is available before allowing the main container to start. For example, a networking DaemonSet might wait until the API server is reachable.

Downloading configuration is another use case. The init container fetches configuration files from a configuration service or Git repository, writes them to a shared volume, then exits. The main container reads those files when it starts.

Installing or updating binaries on the host is possible with init containers that mount host directories. They can copy executables or libraries to node paths before the main application runs.

The key benefit of init containers in DaemonSets is reliable ordering. You guarantee that setup completes before the main service starts. If initialization fails, the Pod stays in Init status and doesn't create a broken main container. And init containers can use different images with different tools than the main container, keeping the main image minimal.

For CKAD, practice the syntax: initContainers is an array in the Pod spec, just like containers. Each init container has a name, image, command, and optionally volumeMounts. Init containers execute in order - first init container completes, then second, and so on, before any main containers start.

---

## Troubleshooting DaemonSets (2 min)

Let's cover common DaemonSet issues and how to diagnose them quickly for the CKAD exam.

The most common issue is Pods not scheduling. You create a DaemonSet but see DESIRED: 0 and no Pods exist. This almost always means no nodes match your nodeSelector criteria. Check node labels with kubectl get nodes --show-labels. Verify your nodeSelector actually matches some nodes. If you're using a nodeSelector for disktype equals ssd but no nodes have that label, the DaemonSet creates zero Pods.

Another cause is taints without tolerations. If all nodes are tainted and your DaemonSet doesn't have matching tolerations, no Pods will schedule. Check node taints with kubectl describe node and look for Taints. Add appropriate tolerations to your DaemonSet Pod template.

Pods failing to start often involves HostPath issues. The Pod is created but enters CrashLoopBackOff or Error state. Use kubectl describe pod to check events. Common errors include "path doesn't exist" if you specified type: Directory but the path isn't on the node. Fix this by either creating the path on nodes or changing type to DirectoryOrCreate. Permission denied errors mean the container can't access the host path, requiring a securityContext with appropriate privileges or capabilities.

Updates not happening indicates you're using OnDelete strategy. Check kubectl describe daemonset and look at Update Strategy. If it says OnDelete, updates only happen when you manually delete Pods. Either change to RollingUpdate or manually delete Pods to trigger updates.

For CKAD troubleshooting workflow: If no Pods exist, check node labels and taints. If Pods exist but aren't running, use kubectl describe pod for events. If updates aren't applying, check the update strategy. Remember that DaemonSet Pods are tied to nodes, so node issues directly affect DaemonSet behavior.

---

## CKAD Exam Focus (2 min)

Let's focus on what you need to master for the CKAD exam. DaemonSets are supplementary material but can appear in one to two questions.

Essential commands to memorize: kubectl get daemonset or kubectl get ds using the short form. Kubectl describe ds to see detailed information and events. Kubectl rollout status ds/name to monitor updates. And kubectl rollout undo ds/name for rollbacks.

Key concepts for the exam: DaemonSets have no replicas field - don't try to add one, it will error. Node selectors go in the Pod template spec, not at the DaemonSet level. Update strategy determines rollout behavior - RollingUpdate for automatic, OnDelete for manual. HostPath volumes are common with DaemonSets for node resource access. And init containers prepare the node or environment before the main container starts.

Common exam scenarios include deploying a log collector to all nodes. Create a DaemonSet with a HostPath volume mounting /var/log. Create a monitoring agent on specific nodes using nodeSelector to target labeled nodes. Implement manual update control by setting updateStrategy to OnDelete. And troubleshoot why a DaemonSet has no Pods by checking node labels and selectors.

Time management: DaemonSet questions should take three to five minutes maximum. They're simpler than StatefulSets - no headless Service required, no volumeClaimTemplates, no stable network identity. If you're spending more than five minutes, you're overthinking it.

Practice creating DaemonSets from scratch until you can write the basic YAML structure from memory. Know the relationship between DESIRED count and node count - they should match unless using node selectors. Understand that DaemonSets scale by adding or removing nodes or changing node labels, not by changing a replica count.

---

## Summary and Key Takeaways (1 min)

Let's recap the essential concepts about DaemonSets for CKAD success.

DaemonSets ensure exactly one Pod runs on each node, with automatic scaling based on node count. They're used for node-level services like monitoring agents, log collectors, network plugins, and storage daemons.

DaemonSets differ from Deployments in key ways: no replicas field, automatic one-per-node placement, common use of HostPath volumes, and update behavior that deletes before creating.

Node selection uses nodeSelector for simple label matching or tolerations for running on tainted nodes like control plane nodes. Node selector changes dynamically affect which Pods the DaemonSet creates.

HostPath volumes provide access to node resources but carry security implications. Always use readOnly when possible, specify the type field for validation, and restrict HostPath usage to trusted workloads.

Update strategies include RollingUpdate for automatic node-by-node updates with maxUnavailable controlling speed, and OnDelete for manual control where you delete Pods to trigger updates.

Init containers prepare the node or environment before main containers start, handling tasks like configuration setup, dependency waiting, or system configuration.

For CKAD exam success, know the core concepts and differences from Deployments, practice creating DaemonSets with nodeSelector and HostPath, understand both update strategies, and master the troubleshooting workflow for scheduling issues.

DaemonSets are a specialized tool for specific scenarios. Master the basics, practice the syntax, and you'll handle any DaemonSet question the exam throws at you. Thank you for listening, and good luck with your CKAD preparation!
