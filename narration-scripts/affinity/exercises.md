# Affinity and Pod Scheduling - Practical Demo
## Narration Script for Hands-On Exercises (15-18 minutes)

---

### Section 1: Environment Setup (2 min)
**[00:00-02:00]**

Welcome to this hands-on demonstration of Pod scheduling with affinity in Kubernetes. In this session, we'll work through practical examples showing how to control Pod placement using node affinity, Pod affinity, and Pod anti-affinity.

Before we start, I need to mention that this lab uses a multi-node cluster created with k3d. If you're following along, you'll want to set up k3d first. Let me show you the quick installation.

```bash
# Check if k3d is installed
k3d version
```

Good, we have k3d version 5 installed. Now let's create a three-node cluster specifically for this affinity lab. We'll create one control plane node and two worker nodes, with a Pod limit of 5 per worker node to make our demonstrations more visible.

```bash
k3d cluster create labs-affinity --servers 1 --agents 2 \
  -p "30780-30799:30780-30799" \
  --k3s-arg '--kubelet-arg=max-pods=5@agent:*' \
  --k3s-arg '--disable=metrics-server@server:0' \
  --k3s-arg '--disable=traefik@server:0'
```

This takes a moment to create. While it's spinning up, let me explain what we've done. The servers flag gives us one control plane node, agents gives us two worker nodes. The port mapping will let us access NodePort services. And we've limited worker nodes to 5 Pods maximum to easily demonstrate scheduling constraints.

Now let's verify our cluster is ready:

```bash
kubectl get nodes
```

Perfect. We have three nodes: one server (control plane) and two agents (workers).

---

### Section 2: Node Affinity Basics (3 min)
**[02:00-05:00]**

Let's start with node affinity. First, I'll deploy a simple application without any affinity rules to see the default behavior.

```bash
kubectl apply -f labs/affinity/specs/whoami
```

This creates a Deployment with six replicas of the whoami application. Let's see where these Pods landed:

```bash
kubectl get pods -l app=whoami -o wide
```

Notice the Pods are distributed across all three nodes, including the control plane server. In a default k3d setup, the control plane can run workloads. But in production Kubernetes, control plane nodes are typically tainted to prevent user workloads.

Now, let's add our first node affinity rule. This updated spec requires Pods to run on nodes that don't have the control plane role label, and also requires a custom CIS compliance label.

```bash
kubectl apply -f labs/affinity/specs/whoami/compliance-required
```

Let's check what happened to our Pods:

```bash
kubectl get pods -l app=whoami -o wide
```

Interesting. We see some Pods in the Pending state. Let's investigate why:

```bash
kubectl describe pod -l app=whoami,update=compliance-required | grep -A 5 Events
```

The scheduler is telling us "0 of 3 nodes are available: 3 node(s) didn't match Pod's node affinity/selector." This is because our affinity rule requires a label cis-compliance equals verified, but we haven't added that label to any nodes yet.

Let's fix this by labeling one of our worker nodes:

```bash
kubectl label node k3d-labs-affinity-agent-1 cis-compliance=verified
```

Now watch what happens:

```bash
kubectl get rs -l app=whoami
```

Some Pods started scheduling on agent-1. But notice we still don't have full capacity. Let's check the pending Pods again:

```bash
kubectl describe pod -l app=whoami,update=compliance-required | tail -20
```

Ah, now we see a different error: "0 of 3 nodes are available: 1 Too many pods, 2 node(s) didn't match Pod's node affinity." The agent-1 node has reached its 5-Pod limit, and the other nodes don't have the required label. This demonstrates how node capacity constraints interact with affinity rules.

---

### Section 3: Node Topology Labels (2 min)
**[05:00-07:00]**

Before we continue with Pod affinity, we need to set up node topology labels. In a real cloud environment, these labels are automatically applied, but in our k3d cluster, we need to add them manually.

Let's check the current topology labels:

```bash
kubectl get nodes -L kubernetes.io/hostname
```

Every node has a hostname label by default. Now let's add region and zone labels to simulate a multi-zone cloud deployment:

```bash
kubectl label node --all topology.kubernetes.io/region=lab
kubectl label node k3d-labs-affinity-server-0 topology.kubernetes.io/zone=lab-a
kubectl label node k3d-labs-affinity-agent-0 topology.kubernetes.io/zone=lab-a
kubectl label node k3d-labs-affinity-agent-1 topology.kubernetes.io/zone=lab-b
```

Now all nodes are in the "lab" region, with the server and agent-0 in zone "lab-a" and agent-1 in zone "lab-b." Let's verify:

```bash
kubectl get nodes -L topology.kubernetes.io/region,topology.kubernetes.io/zone
```

Perfect. These topology labels will be crucial for our Pod affinity demonstrations.

---

### Section 4: Pod Affinity for Co-location (3 min)
**[07:00-10:00]**

Now let's explore Pod affinity. First, let's start fresh by deleting our previous deployment:

```bash
kubectl delete deploy whoami
```

This new spec uses Pod affinity to require all Pods to run in the same region. The topology key specifies the level where grouping happens:

```bash
kubectl apply -f labs/affinity/specs/whoami/colocate-region
```

Let's see where the Pods landed:

```bash
kubectl get pods -l app=whoami -o wide
```

All Pods are running on worker nodes, which makes sense because they're all in the same region. The Pod affinity rule doesn't restrict them further since every node satisfies the "same region" constraint.

Now let's try something more restrictive - spreading across zones using anti-affinity:

```bash
kubectl delete deploy whoami
kubectl apply -f labs/affinity/specs/whoami/spread-zone
```

This spec combines Pod affinity to keep everything in one region, with Pod anti-affinity to avoid having Pods in the same zone. Let's check the results:

```bash
kubectl get pods -l app=whoami,update=spread-zone -o wide
```

Notice we only have two Pods running - one in zone lab-a and one in zone lab-b. Let's see why the others are pending:

```bash
kubectl describe pod -l app=whoami,update=spread-zone | grep "Warning.*FailedScheduling" -A 2
```

The anti-affinity rule states Pods shouldn't run on a node if there's already another Pod from this deployment in the same zone. Since we have two zones and six replicas with required anti-affinity, only two can actually schedule. This is too restrictive for our needs.

---

### Section 5: Preferred Affinity Rules (3 min)
**[10:00-13:00]**

The previous example used required anti-affinity, which is too strict. Let's see how preferred affinity gives us better results:

```bash
kubectl delete deploy whoami
kubectl apply -f labs/affinity/specs/whoami/prefer-spread-zone
```

This spec says: "all Pods must run in the same region, and within the region, Pods should prefer to spread across zones, but it's okay to run multiple Pods in the same zone if necessary."

Let's check the distribution:

```bash
kubectl get pods -l app=whoami,update=prefer-spread-zone -o wide
```

Excellent! Now all six replicas are running. The scheduler tried to spread them across zones, so we should see at least one Pod in each zone, with the extra Pods distributed as evenly as possible.

Let's count how many Pods are on each node:

```bash
kubectl get pods -l app=whoami,update=prefer-spread-zone -o wide | \
  awk 'NR>1 {print $7}' | sort | uniq -c
```

Perfect. This demonstrates the power of preferred affinity - it gives guidance to the scheduler without creating impossible constraints.

Now, let's look at weighted preferences. This deployment specifies a weight of 80 for preferring SSD nodes:

```bash
kubectl get deployment whoami -o yaml | grep -A 10 "preferredDuringScheduling"
```

Weights range from 1 to 100, with higher weights indicating stronger preferences. If you have multiple preferred terms, the scheduler calculates a score for each node based on how well it matches all preferences, then picks the node with the highest score.

---

### Section 6: Lab Challenge (3 min)
**[13:00-16:00]**

Now it's time for a hands-on challenge to test your understanding. The goal is to create a Deployment where:
- Pods only run on worker nodes with a cis-compliance label
- Pods prefer nodes labeled cis-compliance equals verified
- Pods can also run on nodes labeled cis-compliance equals in-progress, but with lower priority
- We want five Pods on the verified node and only one on the in-progress node

First, let's prepare the nodes:

```bash
# Agent-1 already has cis-compliance=verified
# Let's add in-progress to agent-0
kubectl label node k3d-labs-affinity-agent-0 cis-compliance=in-progress
```

Now, let's create a Deployment spec that meets these requirements. I'll walk you through the solution:

```bash
cat << 'EOF' > whoami-challenge.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami
  labels:
    kubernetes.courselabs.co: affinity
spec:
  replicas: 6
  selector:
    matchLabels:
      app: whoami
      update: challenge
  template:
    metadata:
      labels:
        app: whoami
        update: challenge
    spec:
      affinity:
        nodeAffinity:
          # Required: must have cis-compliance label
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: cis-compliance
                operator: Exists
              - key: node-role.kubernetes.io/control-plane
                operator: DoesNotExist
          # Preferred: strongly prefer verified
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 80
            preference:
              matchExpressions:
              - key: cis-compliance
                operator: In
                values:
                - verified
          - weight: 20
            preference:
              matchExpressions:
              - key: cis-compliance
                operator: In
                values:
                - in-progress
      containers:
      - name: whoami
        image: sixeyed/whoami:21.04
        ports:
        - containerPort: 80
EOF

kubectl delete deploy whoami
kubectl apply -f whoami-challenge.yaml
```

Let's check the distribution:

```bash
kubectl get pods -l app=whoami,update=challenge -o wide
```

Perfect! Notice how most Pods landed on agent-1 (verified), with only one or two on agent-0 (in-progress). The weights guided the scheduler to prefer the verified node strongly while still allowing the in-progress node as a fallback.

---

### Section 7: Wrap-up and Cleanup (2 min)
**[16:00-18:00]**

That completes our practical demonstration of Pod scheduling with affinity. Let's review what we've covered:

We started with basic node affinity, seeing how required rules create hard constraints that must be met. We saw how Pods stay in Pending state when no nodes match the affinity requirements.

We then explored Pod affinity and anti-affinity, using topology keys to control whether Pods should be co-located or spread apart. We saw how required anti-affinity can be too restrictive, leaving Pods pending.

Finally, we looked at preferred affinity rules with weights, showing how they provide guidance to the scheduler without creating impossible constraints. This gives you the best of both worlds - influence over placement without risking unschedulable Pods.

Let's clean up our resources:

```bash
kubectl delete svc,deploy -l kubernetes.courselabs.co=affinity
```

If you want to continue using this cluster for other labs, you can leave it running. Otherwise, you can delete the cluster entirely:

```bash
k3d cluster delete labs-affinity
```

And if you want to switch back to your default cluster, like Docker Desktop:

```bash
kubectl config use-context docker-desktop
```

Thank you for following along with this demonstration. These affinity patterns are powerful tools for optimizing your Kubernetes deployments. In production, you'll often combine multiple affinity types to express sophisticated placement strategies that balance performance, availability, and resource utilization.
