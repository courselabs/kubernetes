# Deployments - Introduction Script

**Duration:** 10-12 minutes
**Accompaniment:** Slideshow presentation
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening (Slide 1: Title)

Welcome to this module on Kubernetes Deployments. Deployments are the workload controller you'll use most frequently in Kubernetes, and they're absolutely essential for the CKAD exam. In this video, we'll explore what Deployments are, why they're critical for production workloads, and how they enable zero-downtime updates and scaling.

## Why Not Just Use Pods? (Slide 2: Pod Limitations)

In the previous module, we learned about Pods - the smallest deployable unit in Kubernetes. So you might be wondering, why do we need Deployments?

The answer is simple: Pods alone aren't flexible enough for real-world applications.

Think about what happens in production. You need to:
- Release application updates without downtime
- Scale your application up and down based on demand
- Recover automatically when something goes wrong
- Roll back to previous versions when updates fail

If you only use Pods, you'd have to handle all of this manually. You'd be manually creating new Pods, deleting old ones, managing names, tracking versions - it quickly becomes unmanageable.

This is where Deployments come in. They automate all of this complexity.

## What is a Deployment? (Slide 3: Deployment Definition)

A Deployment is a Kubernetes controller - an object that manages other objects.

Specifically, a Deployment manages Pods. It uses a Pod template to create and manage multiple identical Pods, handling:
- Initial Pod creation
- Scaling the number of replicas
- Rolling updates when you change the Pod spec
- Rollback to previous versions
- Self-healing when Pods fail

The key concept is declarative configuration. You tell Kubernetes what you want - "I want 3 replicas of this application" - and the Deployment controller works continuously to make that happen.

## The Role of ReplicaSets (Slide 4: Deployment Architecture)

Here's something important to understand: Deployments don't actually create Pods directly. Instead, they use another controller called a ReplicaSet.

The architecture looks like this:
- **Deployment** - Manages ReplicaSets, handles updates and rollbacks
- **ReplicaSet** - Manages Pods, ensures the desired number of replicas
- **Pods** - Run your containers

You'll rarely work with ReplicaSets directly, but understanding this layered architecture explains how rolling updates work.

When you update a Deployment:
1. The Deployment creates a new ReplicaSet with the updated Pod template
2. It scales up the new ReplicaSet while scaling down the old one
3. Once complete, the old ReplicaSet remains at zero replicas for rollback purposes

This is how Kubernetes achieves zero-downtime deployments.

## Deployment Anatomy (Slide 5: YAML Structure)

Let's look at a basic Deployment specification.

Like all Kubernetes resources, Deployments use YAML with four essential fields: apiVersion, kind, metadata, and spec.

For Deployments:
- **apiVersion** is "apps/v1"
- **kind** is "Deployment"
- **metadata** includes the Deployment name and labels
- **spec** defines the desired state

The Deployment spec has three critical components:

**selector** - Defines which Pods this Deployment manages using label matching. This must match the labels in the Pod template.

**replicas** - The desired number of Pod copies. Default is 1 if not specified.

**template** - The Pod template used to create new Pods. This is exactly the same Pod spec you learned in the Pods module, minus the name field since Deployments generate names automatically.

The labels in the Pod template must include all labels specified in the selector, or you'll get an error. This ensures the Deployment can identify its Pods.

## Scaling Applications (Slide 6: Replica Management)

One of the primary features of Deployments is easy scaling.

You can scale imperatively with kubectl commands for quick adjustments, or declaratively by updating the YAML specification.

When you scale up:
- The Deployment tells the ReplicaSet to increase desired replicas
- The ReplicaSet creates new Pods from the template
- Kubernetes schedules them across available nodes

When you scale down:
- The ReplicaSet terminates excess Pods gracefully
- Applications receive termination signals to shut down cleanly
- The Deployment ensures the correct number remains running

Declarative scaling is preferred for production because your YAML files in source control always match what's running in the cluster.

## Rolling Updates (Slide 7: Update Strategy)

Rolling updates are where Deployments truly shine. This is the default strategy for releasing application updates.

When you update the Pod template - maybe a new container image or configuration change - the Deployment:

1. Creates a new ReplicaSet with the updated template
2. Gradually scales up the new ReplicaSet
3. Simultaneously scales down the old ReplicaSet
4. Ensures a minimum number of Pods are always available
5. Waits for new Pods to be ready before continuing

This provides zero-downtime deployments. Your users never experience an outage because some Pods are always serving traffic.

You can control the rolling update behavior with two parameters:

**maxSurge** - Maximum number of Pods above the desired count during updates. Default is 25%.

**maxUnavailable** - Maximum number of Pods that can be unavailable during updates. Default is 25%.

Setting maxUnavailable to zero guarantees zero downtime, while maxSurge controls how quickly the update rolls out.

## Recreate Strategy (Slide 8: Alternative Updates)

Deployments also support a Recreate strategy.

With Recreate:
- All old Pods are terminated first
- Only then are new Pods created
- This causes downtime but ensures old and new versions never run simultaneously

When would you use Recreate?
- Your application can't handle multiple versions running together
- You're doing database migrations that require exclusive access
- Resource constraints prevent running both versions
- You need to release shared resources before starting new Pods

For the CKAD exam, know both strategies and when to apply each.

## Rollback Capabilities (Slide 9: Deployment History)

One of the most powerful Deployment features is easy rollbacks.

Kubernetes stores your Deployment's revision history. Each time you update the Pod template, it creates a new revision.

You can:
- View the rollout history to see all revisions
- Inspect specific revisions to see what changed
- Roll back to any previous revision
- Roll forward again if needed

Rollbacks work by scaling up an old ReplicaSet and scaling down the current one - the same process as a regular update, just in reverse.

This is incredibly valuable when deployments go wrong. Instead of scrambling to fix a broken release, you simply roll back with one command and investigate the issue without pressure.

## Deployment Lifecycle (Slide 10: Status and Conditions)

Deployments have a lifecycle with different states and conditions.

**States:**
- **Progressing** - The Deployment is actively rolling out changes
- **Complete** - All replicas are updated and available
- **Failed** - The rollout has failed, possibly due to image pull errors or insufficient resources

**Conditions** track specific aspects:
- **Available** - Minimum number of Pods are running
- **Progressing** - Deployment is making progress toward desired state
- **ReplicaFailure** - ReplicaSet couldn't create Pods

Kubernetes provides commands to monitor these states in real-time, which is essential during deployments and critical for troubleshooting in the CKAD exam.

## Labels and Selectors (Slide 11: Pod Management)

Deployments rely heavily on labels and selectors.

The selector in the Deployment spec uses **matchLabels** to find Pods it manages. This can be a simple equality match or more complex expressions using **matchExpressions**.

Why does this matter?
- Multiple Deployments can run in the same namespace
- Services use the same label selectors to find Pods
- You can manually query Pods by label
- Labels enable blue-green and canary deployments

Best practice: Use consistent, meaningful labels like:
- app: application-name
- version: v1 or v2
- tier: frontend or backend
- environment: production or staging

This makes management, troubleshooting, and advanced deployment patterns much easier.

## Deployment Best Practices (Slide 12: Production Patterns)

Before we move to hands-on exercises, let's cover deployment best practices:

1. **Always use Deployments, not bare Pods** - In production, Pods should always be managed by a controller.

2. **Specify resource requests and limits** - Ensures proper scheduling and prevents resource exhaustion.

3. **Implement readiness probes** - Critical for zero-downtime updates. New Pods won't receive traffic until ready.

4. **Set appropriate replica counts** - At least 2 for high availability, more based on load.

5. **Use rolling update strategy with maxUnavailable: 0** - Guarantees zero downtime.

6. **Pin image versions** - Never use :latest in production. Use specific version tags.

7. **Keep rollout history** - The default is 10 revisions. Adjust based on your needs.

8. **Use annotations for change tracking** - Document why each change was made.

## CKAD Exam Relevance (Slide 13: Exam Requirements)

For the CKAD exam, Deployments are core material. You'll need to:

- Create Deployments from scratch and using imperative commands
- Scale Deployments declaratively and imperatively
- Perform rolling updates by changing images or configuration
- Configure rolling update parameters (maxSurge, maxUnavailable)
- Roll back failed deployments
- View and understand rollout history
- Implement zero-downtime deployment strategies
- Troubleshoot deployment issues
- Understand ReplicaSets and their relationship to Deployments

Time management is critical in the exam. Practice creating Deployments quickly using kubectl create commands to generate YAML, then edit as needed.

The exam tests your ability to work fast and accurately. Know the kubectl shortcuts: "deploy" for Deployment, "rs" for ReplicaSet.

## Summary (Slide 14: Key Takeaways)

Let's recap what we've covered:

- Deployments are controllers that manage Pods, providing scaling, updates, and rollbacks
- They use ReplicaSets as an intermediate layer to manage Pod replicas
- The Deployment spec includes a selector, replica count, and Pod template
- Rolling updates enable zero-downtime releases by gradually replacing Pods
- Recreate strategy is available when simultaneous versions aren't acceptable
- Rollback capabilities provide safety for production deployments
- Labels and selectors enable flexible Pod management
- Deployments are fundamental for the CKAD exam

## Next Steps (Slide 15: Moving Forward)

Now that you understand Deployment concepts, it's time for hands-on practice.

In the next video, we'll work through practical exercises where you'll:
- Create your first Deployment
- Scale applications up and down
- Perform rolling updates
- Roll back changes
- Implement zero-downtime deployments

After that, we'll dive into CKAD-specific scenarios including:
- Advanced deployment strategies
- Health checks and readiness
- Resource management
- Blue-green and canary deployments
- Exam-style practice scenarios

Thank you for watching, and let's move on to the practical demonstrations!

---

## Presentation Notes

**Slide Suggestions:**
1. Title slide with "Kubernetes Deployments" and CKAD emphasis
2. Diagram showing Pod limitations (manual management)
3. Deployment controller concept with arrows showing management
4. Three-tier architecture: Deployment → ReplicaSet → Pods
5. YAML structure with annotated sections
6. Scaling visualization showing replicas increasing/decreasing
7. Rolling update animation showing gradual Pod replacement
8. Recreate strategy showing downtime period
9. Rollback timeline showing revision history
10. Deployment lifecycle state diagram
11. Labels and selectors with visual matching
12. Production best practices checklist
13. CKAD exam requirements matrix
14. Summary bullet points
15. Course progression roadmap

**Timing Guide:**
- Opening: 1 min
- Why Not Pods: 1.5 min
- What is a Deployment: 1 min
- ReplicaSets: 1.5 min
- YAML Structure: 1.5 min
- Scaling: 1 min
- Rolling Updates: 1.5 min
- Recreate Strategy: 1 min
- Rollbacks: 1 min
- Lifecycle: 1 min
- Labels and Selectors: 1 min
- Best Practices: 1.5 min
- CKAD Relevance: 1.5 min
- Summary: 0.5 min
- Next Steps: 0.5 min

**Total: ~16 minutes**

**Key Concepts to Emphasize:**
- Declarative vs imperative management
- Zero-downtime updates
- ReplicaSet role in updates
- Rollback safety net
- Label selector importance

**Visual Elements:**
- Use animations to show rolling updates
- Diagram the three-tier architecture clearly
- Show before/after states for scaling
- Timeline visualization for rollbacks
- Color-code old vs new Pods in update demos
