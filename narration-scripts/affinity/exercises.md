# Affinity and Pod Scheduling - Practical Demo
## Narration Script for Hands-On Exercises (15-18 minutes)

---

### Section 1: Environment Setup (2 min)
**[00:00-02:00]**

Welcome to this hands-on demonstration of Pod scheduling with affinity in Kubernetes. In this session, we'll work through practical examples showing how to control Pod placement using node affinity, Pod affinity, and Pod anti-affinity.

Before we start, I need to mention that this lab uses a multi-node cluster created with k3d. If you're following along, you'll want to set up k3d first. Let me show you the quick installation.

Good, we have k3d version 5 installed. Now let's create a three-node cluster specifically for this affinity lab. We'll create one control plane node and two worker nodes, with a Pod limit of 5 per worker node to make our demonstrations more visible.

This takes a moment to create. While it's spinning up, let me explain what we've done. The servers flag gives us one control plane node, agents gives us two worker nodes. The port mapping will let us access NodePort services. And we've limited worker nodes to 5 Pods maximum to easily demonstrate scheduling constraints.

Now let's verify our cluster is ready.

Perfect. We have three nodes: one server (control plane) and two agents (workers).

---

### Section 2: Node Affinity Basics (3 min)
**[02:00-05:00]**

Let's start with node affinity. First, I'll deploy a simple application without any affinity rules to see the default behavior.

This creates a Deployment with six replicas of the whoami application. Let's see where these Pods landed.

Notice the Pods are distributed across all three nodes, including the control plane server. In a default k3d setup, the control plane can run workloads. But in production Kubernetes, control plane nodes are typically tainted to prevent user workloads.

Now, let's add our first node affinity rule. This updated spec requires Pods to run on nodes that don't have the control plane role label, and also requires a custom CIS compliance label.

Let's check what happened to our Pods.

Interesting. We see some Pods in the Pending state. Let's investigate why.

The scheduler is telling us "zero of three nodes are available: three nodes didn't match Pod's node affinity selector." This is because our affinity rule requires a label cis-compliance equals verified, but we haven't added that label to any nodes yet.

Let's fix this by labeling one of our worker nodes.

Now watch what happens.

Some Pods started scheduling on agent-1. But notice we still don't have full capacity. Let's check the pending Pods again.

Ah, now we see a different error: "zero of three nodes are available: one Too many pods, two nodes didn't match Pod's node affinity." The agent-1 node has reached its 5-Pod limit, and the other nodes don't have the required label. This demonstrates how node capacity constraints interact with affinity rules.

---

### Section 3: Node Topology Labels (2 min)
**[05:00-07:00]**

Before we continue with Pod affinity, we need to set up node topology labels. In a real cloud environment, these labels are automatically applied, but in our k3d cluster, we need to add them manually.

Let's check the current topology labels.

Every node has a hostname label by default. Now let's add region and zone labels to simulate a multi-zone cloud deployment.

Now all nodes are in the "lab" region, with the server and agent-0 in zone "lab-a" and agent-1 in zone "lab-b." Let's verify.

Perfect. These topology labels will be crucial for our Pod affinity demonstrations.

---

### Section 4: Pod Affinity for Co-location (3 min)
**[07:00-10:00]**

Now let's explore Pod affinity. First, let's start fresh by deleting our previous deployment.

This new spec uses Pod affinity to require all Pods to run in the same region. The topology key specifies the level where grouping happens.

Let's see where the Pods landed.

All Pods are running on worker nodes, which makes sense because they're all in the same region. The Pod affinity rule doesn't restrict them further since every node satisfies the "same region" constraint.

Now let's try something more restrictive - spreading across zones using anti-affinity.

This spec combines Pod affinity to keep everything in one region, with Pod anti-affinity to avoid having Pods in the same zone. Let's check the results.

Notice we only have two Pods running - one in zone lab-a and one in zone lab-b. Let's see why the others are pending.

The anti-affinity rule states Pods shouldn't run on a node if there's already another Pod from this deployment in the same zone. Since we have two zones and six replicas with required anti-affinity, only two can actually schedule. This is too restrictive for our needs.

---

### Section 5: Preferred Affinity Rules (3 min)
**[10:00-13:00]**

The previous example used required anti-affinity, which is too strict. Let's see how preferred affinity gives us better results.

This spec says: "all Pods must run in the same region, and within the region, Pods should prefer to spread across zones, but it's okay to run multiple Pods in the same zone if necessary."

Let's check the distribution.

Excellent! Now all six replicas are running. The scheduler tried to spread them across zones, so we should see at least one Pod in each zone, with the extra Pods distributed as evenly as possible.

Let's count how many Pods are on each node.

Perfect. This demonstrates the power of preferred affinity - it gives guidance to the scheduler without creating impossible constraints.

Now, let's look at weighted preferences. This deployment specifies a weight of 80 for preferring SSD nodes.

Weights range from 1 to 100, with higher weights indicating stronger preferences. If you have multiple preferred terms, the scheduler calculates a score for each node based on how well it matches all preferences, then picks the node with the highest score.

---

### Section 6: Lab Challenge (3 min)
**[13:00-16:00]**

Now it's time for a hands-on challenge to test your understanding. The goal is to create a Deployment where:
- Pods only run on worker nodes with a cis-compliance label
- Pods prefer nodes labeled cis-compliance equals verified
- Pods can also run on nodes labeled cis-compliance equals in-progress, but with lower priority
- We want five Pods on the verified node and only one on the in-progress node

First, let's prepare the nodes. Agent-1 already has cis-compliance equals verified. Let's add in-progress to agent-0.

Now, let's create a Deployment spec that meets these requirements. I'll walk you through the solution.

The key parts of this solution: We use required node affinity with the Exists operator to ensure any node with a cis-compliance label can be used, and we also exclude the control plane. Then we use preferred affinity with different weights - 80 for verified and 20 for in-progress - to strongly guide the scheduler toward verified nodes.

Let's check the distribution.

Perfect! Notice how most Pods landed on agent-1 (verified), with only one or two on agent-0 (in-progress). The weights guided the scheduler to prefer the verified node strongly while still allowing the in-progress node as a fallback.

---

### Section 7: Wrap-up and Cleanup (2 min)
**[16:00-18:00]**

That completes our practical demonstration of Pod scheduling with affinity. Let's review what we've covered:

We started with basic node affinity, seeing how required rules create hard constraints that must be met. We saw how Pods stay in Pending state when no nodes match the affinity requirements.

We then explored Pod affinity and anti-affinity, using topology keys to control whether Pods should be co-located or spread apart. We saw how required anti-affinity can be too restrictive, leaving Pods pending.

Finally, we looked at preferred affinity rules with weights, showing how they provide guidance to the scheduler without creating impossible constraints. This gives you the best of both worlds - influence over placement without risking unschedulable Pods.

Let's clean up our resources.

If you want to continue using this cluster for other labs, you can leave it running. Otherwise, you can delete the cluster entirely.

And if you want to switch back to your default cluster, like Docker Desktop, you can do that as well.

Thank you for following along with this demonstration. These affinity patterns are powerful tools for optimizing your Kubernetes deployments. In production, you'll often combine multiple affinity types to express sophisticated placement strategies that balance performance, availability, and resource utilization.

---

## Recording Notes

**Timing:**
- Section 1: 2 minutes
- Section 2: 3 minutes
- Section 3: 2 minutes
- Section 4: 3 minutes
- Section 5: 3 minutes
- Section 6: 3 minutes
- Section 7: 2 minutes
- Total: 18 minutes

**Key Points:**
- Emphasize the difference between required and preferred affinity
- Show how capacity constraints interact with affinity rules
- Demonstrate the power of weights in preferred affinity
- Highlight topology keys for zone-based scheduling

**Visual Focus:**
- Show Pod distribution across nodes clearly
- Highlight pending Pods and their reasons
- Display node labels when they're relevant
- Keep the relationship between weights and Pod placement visible
