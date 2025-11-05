# Deployments - Exercises Narration Script

**Duration:** 15-20 minutes
**Format:** Screen recording with live demonstration
**Prerequisite:** Kubernetes cluster running, completed Pods lab

---

## Opening

Welcome back! In the previous video, we covered Deployment concepts. Now it's time to get hands-on. In this demo, we'll create Deployments, scale applications, perform rolling updates, and practice rollbacks - all essential skills for working with Kubernetes and for the CKAD exam.

Make sure you have a Kubernetes cluster running. I'm using Docker Desktop, but any distribution works fine.

Let's get started!

## Verify Clean Environment

First, let's make sure we have a clean workspace.

```powershell
kubectl get all
```

Good, we're starting with an empty default namespace. If you completed the Pods lab, make sure you've cleaned up those resources first.

## Create Your First Deployment

Let's look at the simplest Deployment specification. I'll open the whoami-v1.yaml file.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami
  labels:
    kubernetes.courselabs.co: deployments
spec:
  selector:
    matchLabels:
      app: whoami
  template:
    metadata:
      labels:
        app: whoami
        version: v1
    spec:
      containers:
        - name: app
          image: sixeyed/whoami:21.04
```

This looks similar to a Pod spec, but notice the key differences:

The **apiVersion** is "apps/v1" not just "v1" because Deployments are in the apps API group.

The **spec** contains three main parts:
- The **selector** defines how the Deployment finds its Pods using the label "app: whoami"
- The **template** is the Pod template - notice it's the same Pod spec we've seen before
- The template **metadata** includes labels that must match the selector

Notice there's no **replicas** field here. When omitted, it defaults to 1.

Let's create this Deployment.

```powershell
kubectl apply -f labs/deployments/specs/deployments/whoami-v1.yaml
```

The output says "deployment.apps/whoami created". Now let's see what Kubernetes created.

```powershell
kubectl get all
```

Excellent! Look at what we have:
- A **Deployment** named whoami
- A **ReplicaSet** with a generated name - whoami plus a hash
- A **Pod** with an even longer name - the ReplicaSet name plus another hash

This shows the three-tier architecture we discussed. The Deployment created the ReplicaSet, and the ReplicaSet created the Pod.

## Exploring Deployment Information

Let's get detailed information about our Deployment.

```powershell
kubectl get deployment whoami
```

The output shows:
- **READY**: 1/1 - one Pod ready out of one desired
- **UP-TO-DATE**: 1 - one Pod has the current template
- **AVAILABLE**: 1 - one Pod is accepting traffic

Now let's see more details with the wide output.

```powershell
kubectl get deployment whoami -o wide
```

This adds the containers, images, and selector information. Very useful for quick verification.

For even more detail, let's describe the Deployment.

```powershell
kubectl describe deployment whoami
```

Look at all this information:
- The replica count and current status
- The Pod template details
- The selector being used
- Conditions showing the Deployment is available and progressing
- Events showing what the Deployment controller did

In the Events section, you can see it mentions creating the ReplicaSet. The Deployment doesn't create Pods directly - it delegates that to the ReplicaSet.

Let's look at that ReplicaSet.

```powershell
kubectl get replicaset
```

The ReplicaSet name is the Deployment name plus a hash of the Pod template. Let's describe it.

```powershell
kubectl describe replicaset <replicaset-name>
```

The ReplicaSet's job is simpler - it just ensures the correct number of Pods exist. It doesn't handle updates or rollbacks; that's the Deployment's responsibility.

## Scaling Deployments Imperatively

Let's scale our application up. First, I'll show you the imperative approach with kubectl scale.

```powershell
kubectl scale deployment whoami --replicas 3
```

The output says "deployment.apps/whoami scaled". Let's check the Pods.

```powershell
kubectl get pods -l app=whoami
```

Excellent! Now we have three Pods running. Notice they all share the same prefix from the ReplicaSet, but each has a unique random suffix.

Let's watch the Deployment status.

```powershell
kubectl get deployment whoami
```

Now it shows READY 3/3, UP-TO-DATE 3, and AVAILABLE 3. The Deployment ensured all replicas are running.

But here's the problem with imperative commands: our running state doesn't match our YAML file anymore. If someone else applies the original YAML, they'll scale us back down to 1 replica without realizing it.

This is why declarative management is better for production.

## Scaling Deployments Declaratively

Let's scale declaratively using YAML. I'll look at the whoami-v1-scale.yaml file.

```yaml
spec:
  replicas: 2
  selector:
    matchLabels:
      app: whoami
  template:
    # ... rest of template
```

This sets replicas to 2. Everything else is the same.

```powershell
kubectl apply -f labs/deployments/specs/deployments/whoami-v1-scale.yaml
```

Now check the Pods again.

```powershell
kubectl get pods -l app=whoami
```

One Pod was terminated! Kubernetes compared the desired state (2 replicas) with the actual state (3 replicas) and removed one Pod to match.

This is declarative configuration in action. The YAML file is the source of truth.

## Working with Managed Pods

Because Pod names are generated, we use labels to work with them.

Let's check the logs from all whoami Pods.

```powershell
kubectl logs -l app=whoami
```

Kubernetes streams logs from all matching Pods. In production, you'd use a centralized logging system, but this is handy for quick checks.

You can also execute commands at the Deployment level.

```powershell
kubectl exec deploy/whoami -- hostname
```

This runs the hostname command in one of the Pods. Kubernetes picks a Pod for you.

Let's try something that will fail.

```powershell
kubectl exec deploy/whoami -- /app/whoami
```

This command fails! The whoami application tries to bind to port 80, but it's already bound in the container. This demonstrates that exec runs commands inside the existing container - it doesn't create a new one.

## Verify Pod Details

Let's look at our Pods more closely.

```powershell
kubectl get pods -o wide --show-labels -l app=whoami
```

Perfect! We can see:
- The IP addresses assigned to each Pod
- The node they're running on
- All their labels, including "app=whoami" and "version=v1"

## Deploy Services

Pods have dynamic IP addresses that change when they're recreated. That's why we use Services for stable networking.

Let's deploy Services for our Deployment. I'll apply all the Service specs.

```powershell
kubectl apply -f labs/deployments/specs/services/
```

This creates two Services - a LoadBalancer and a NodePort. Let's check the endpoints.

```powershell
kubectl get endpoints whoami-np whoami-lb
```

The endpoints show both Pod IP addresses! The Services use the same "app=whoami" label selector, so they automatically found our Pods.

Now we can access the application from outside the cluster.

```powershell
curl http://localhost:8080
```

Great! We get a response with the hostname and other details. Try it again.

```powershell
curl http://localhost:8080
```

Notice the hostname changed? That's load balancing across our two Pods.

You can also use the NodePort.

```powershell
curl http://localhost:30010
```

Same result - the Services are distributing traffic across both Pods.

## Performing a Rolling Update

Now let's update our application. In the real world, this might be deploying a new container image with bug fixes or features.

Let me show you the whoami-v2.yaml file.

```yaml
spec:
  replicas: 2
  template:
    metadata:
      labels:
        app: whoami
        version: v2
    spec:
      containers:
        - name: app
          image: sixeyed/whoami:21.04
          env:
            - name: WHOAMI_MODE
              value: q
```

The change is subtle - we added an environment variable `WHOAMI_MODE=q`. This configures the app to return less output.

Environment variables are set when the container starts and can't be changed after. So this requires new Pods.

Let me open a second terminal to watch the Pods during the update.

```powershell
kubectl get pods -l app=whoami --watch
```

Now let's apply the update.

```powershell
kubectl apply -f labs/deployments/specs/deployments/whoami-v2.yaml
```

Watch the terminal! You can see:
1. A new Pod is created
2. It becomes ready
3. An old Pod is terminated
4. Another new Pod is created
5. When it's ready, the second old Pod is terminated

This is a rolling update. At every moment, at least one Pod was available. This is zero-downtime deployment.

Let's verify the update worked.

```powershell
curl http://localhost:8080
```

The output is much shorter now! The environment variable changed the application's behavior. Make a few more requests to see load balancing across both new Pods.

## Understanding the ReplicaSet Changes

Let's look at the ReplicaSets now.

```powershell
kubectl get replicaset
```

Interesting! Now we have **two** ReplicaSets:
- The old one, scaled to 0 replicas
- The new one, with 2 replicas

This is how rolling updates work. The Deployment:
1. Created a new ReplicaSet with the updated Pod template
2. Scaled up the new ReplicaSet
3. Scaled down the old ReplicaSet
4. Kept the old ReplicaSet for rollback purposes

## Viewing Rollout History

Kubernetes tracks deployment history. Let's view it.

```powershell
kubectl rollout history deployment/whoami
```

We can see two revisions:
- Revision 1: Our original deployment
- Revision 2: The update we just applied

Let's get details about a specific revision.

```powershell
kubectl rollout history deployment/whoami --revision=2
```

This shows the full Pod template for that revision. You can compare revisions to understand what changed.

## Rolling Back

What if our update had a bug? Kubernetes makes rollback easy.

```powershell
kubectl rollout undo deployment/whoami
```

This command rolls back to the previous revision. Let's watch what happens.

```powershell
kubectl get pods -l app=whoami --watch
```

It's doing another rolling update, but this time back to version 1! The old ReplicaSet is scaled back up, and the new one is scaled down.

Stop watching (Ctrl+C) and test the application.

```powershell
curl http://localhost:8080
```

We're back to the full output! The rollback worked.

Check the ReplicaSets again.

```powershell
kubectl get replicaset
```

Now the original ReplicaSet is active with 2 replicas, and the v2 ReplicaSet is at 0.

Look at the rollout history again.

```powershell
kubectl rollout history deployment/whoami
```

Notice revision 1 is gone, and we now have revisions 2 and 3. When you roll back, it creates a new revision - it doesn't actually go back to revision 1. This maintains a linear history.

## Lab Exercise: Blue-Green Deployment

Now it's time for the lab challenge. The task is to implement a blue-green deployment pattern.

In a blue-green deployment:
- You run two versions simultaneously
- Only one receives traffic at a time
- You switch traffic by updating the Service selector
- You can quickly switch back if there are issues

Here's my approach: I'll create two separate Deployments and use Service label selectors to control which one receives traffic.

Let me create the blue deployment - version 1.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami-blue
spec:
  replicas: 2
  selector:
    matchLabels:
      app: whoami-bg
      version: blue
  template:
    metadata:
      labels:
        app: whoami-bg
        version: blue
    spec:
      containers:
        - name: app
          image: sixeyed/whoami:21.04
```

Notice the labels: both "app=whoami-bg" and "version=blue".

And the green deployment - version 2.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whoami-green
spec:
  replicas: 2
  selector:
    matchLabels:
      app: whoami-bg
      version: green
  template:
    metadata:
      labels:
        app: whoami-bg
        version: green
    spec:
      containers:
        - name: app
          image: sixeyed/whoami:21.04
          env:
            - name: WHOAMI_MODE
              value: q
```

Same labels structure, but "version=green" and includes the environment variable.

Now the key: the Service. Initially, it points to blue.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: whoami-bg
spec:
  selector:
    app: whoami-bg
    version: blue
  ports:
    - port: 80
  type: LoadBalancer
```

The selector matches both "app=whoami-bg" AND "version=blue", so only blue Pods get traffic.

Let me deploy these.

```powershell
kubectl apply -f labs/deployments/solution/lab/
```

Check what we created.

```powershell
kubectl get deployments,pods -l app=whoami-bg
```

Perfect! Both deployments are running with 2 replicas each, but let's check which receives traffic.

```powershell
curl http://localhost:8080
```

We get the full output, so blue is receiving traffic. Make a few requests - you'll see load balancing across the two blue Pods.

Now let's switch to green. I'll update the Service.

```yaml
spec:
  selector:
    app: whoami-bg
    version: green  # Changed from blue
```

```powershell
kubectl apply -f labs/deployments/solution/lab/whoami-service-green.yaml
```

Test immediately.

```powershell
curl http://localhost:8080
```

Now we get the short output! The Service instantly switched to the green Pods.

The beauty of this pattern:
- Both versions are fully warmed up and ready
- Switching is instantaneous
- Rolling back is just as fast - reapply the blue Service
- No Pods need to be created or destroyed during the switch

This is perfect for critical production deployments where you want minimal risk.

## Cleanup

Before we finish, let's clean up everything we created.

```powershell
kubectl delete deployment,service -l kubernetes.courselabs.co=deployments
```

This removes all Deployments and Services we created using the common label.

For the lab resources:

```powershell
kubectl delete deployment,service -l app=whoami-bg
```

Verify everything is gone.

```powershell
kubectl get all
```

Perfect! We're back to a clean namespace.

## Summary

In this demo, we covered:

- Creating Deployments from YAML specifications
- Understanding the Deployment → ReplicaSet → Pod hierarchy
- Scaling applications imperatively with kubectl scale
- Scaling declaratively with YAML updates
- Working with Pods using labels and selectors
- Performing rolling updates by changing the Pod template
- Monitoring updates in real-time
- Viewing rollout history
- Rolling back to previous versions
- Implementing blue-green deployments for instant cutover

These are all essential skills for production Kubernetes work and for the CKAD exam.

## Key Takeaways

Remember these important points:

1. **Declarative is better than imperative** - Your YAML should always match reality
2. **Rolling updates provide zero downtime** - At least one Pod is always available
3. **ReplicaSets enable updates** - New ReplicaSet for new template, old one kept for rollback
4. **Rollbacks are safe and easy** - One command reverts to the previous working version
5. **Labels enable advanced patterns** - Blue-green, canary, and other strategies rely on label selectors

## Next Steps

Now that you've seen Deployments in action, we're ready for CKAD-specific scenarios.

In the next video, we'll explore:
- Advanced deployment strategies (RollingUpdate configuration, Recreate)
- Health checks ensuring zero-downtime updates
- Resource requests and limits for production
- Advanced rollout management (pause, resume, status)
- Canary deployments
- Production best practices
- Exam-style exercises and quick commands

Thanks for following along, and I'll see you in the CKAD preparation video!

---

## Recording Notes

**Screen Setup:**
- Terminal on left (70% width) for most demonstrations
- Split screen when showing YAML files
- Two terminals side-by-side when watching Pods during updates
- Clear terminal between major sections

**Key Demonstrations:**
1. Deployment creation showing three-tier architecture
2. Scaling imperatively then declaratively (emphasize the difference)
3. Rolling update with watch window visible
4. Rollback showing ReplicaSet behavior
5. Blue-green switch showing instant cutover

**Commands to Type Carefully:**
- Long resource names (use tab completion on screen)
- Label selectors with -l flag
- JSONPath queries if used
- Multiple resource types in one command

**Timing Breakdown:**
- Environment setup: 1 min
- First Deployment: 3 min
- Exploring Deployment info: 3 min
- Imperative scaling: 2 min
- Declarative scaling: 2 min
- Working with Pods: 2 min
- Services setup: 1 min
- Rolling update demo: 4 min
- ReplicaSet explanation: 2 min
- Rollout history: 1 min
- Rollback demo: 2 min
- Lab exercise (blue-green): 5 min
- Cleanup and summary: 2 min

**Total: ~30 minutes**

**Common Mistakes to Avoid:**
- Going too fast during the rolling update (pause to let viewers observe)
- Not explaining why declarative is better
- Forgetting to show both terminals during update watch
- Not verifying the application actually changed after update

**Points to Emphasize:**
- Zero-downtime nature of rolling updates
- ReplicaSets are the implementation detail
- Rollback safety net
- Labels as the key to advanced patterns
- Source control as source of truth

**Visual Highlights:**
- Split screen for update watching is crucial
- Clear terminal output for get commands
- Highlight the READY and AVAILABLE columns
- Show curl responses clearly
- Terminal colors help distinguish old/new Pods
