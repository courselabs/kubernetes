# Rollouts and Deployment Strategies - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening: The Update Challenge (1 min)

Welcome to this deep dive on Kubernetes deployment strategies and rollouts. This is a core topic for the CKAD exam, representing 20% of the Application Deployment domain. Today, we'll explore how Kubernetes manages application updates safely and efficiently.

Every production Kubernetes environment constantly deploys updates - new application features, security patches, configuration changes, and infrastructure updates. The fundamental challenge is: how do you update running applications without causing downtime or impacting users? This isn't just an academic question - it's a daily reality in production operations and a critical skill for the CKAD exam.

Kubernetes provides four main deployment strategies, each with different risk and resource trade-offs: rolling updates for gradual transitions, blue/green for instant switchover, canary for gradual exposure, and recreate for simple all-at-once updates. Understanding when to use each strategy and how to implement them quickly is essential for exam success.

We'll cover how rolling updates work, how to configure them for different scenarios, how to rollback failed deployments, and how to implement blue/green and canary patterns - all skills you'll need both on the exam and in real-world Kubernetes operations.

---

## Rolling Updates: The Default Strategy (3 min)

Rolling updates are Kubernetes' default deployment strategy, and for good reason. They provide zero-downtime updates while managing risk and resource consumption effectively.

Here's how a rolling update works. When you trigger an update - perhaps by changing the container image - Kubernetes doesn't immediately replace all your Pods. Instead, it creates new Pods with the updated version, waits for them to become ready, then terminates old Pods. It repeats this process until all Pods are updated. During the rollout, both old and new versions run concurrently. This is a critical point - your application must support running multiple versions simultaneously.

Rolling updates are controlled by two key parameters: maxSurge and maxUnavailable. These parameters define how aggressively Kubernetes performs the update.

MaxSurge specifies the maximum number of extra Pods above your desired count during the rollout. It can be an absolute number like "3" or a percentage like "25%". The default is 25%. A higher maxSurge means a faster rollout because Kubernetes can create more new Pods in parallel, but it requires more cluster resources. Setting maxSurge to 100% creates all new Pods immediately - this is the fastest rollout but requires double the resources temporarily.

MaxUnavailable specifies how many Pods can be unavailable during the rollout. It also accepts absolute numbers or percentages, with a default of 25%. A higher maxUnavailable means faster rollouts but higher risk because more of your capacity is unavailable at once.

Let me walk through some practical configurations. For a fast but safe rollout, set maxSurge to 100% and maxUnavailable to 0. This creates all new Pods first, waits for them to be ready, then terminates old Pods. There's no reduction in capacity, but you need spare cluster resources. For a conservative rollout, set maxSurge to 1 and maxUnavailable to 0. This updates one Pod at a time, ensuring your full capacity is always available. It's slower but minimally risky. The balanced default of 25% for both values works well for most applications - it's a middle ground between speed and resource consumption.

Understanding these parameters is crucial for the CKAD exam. You might be asked to configure a slow, conservative rollout, or a fast rollout for a development environment. Knowing how maxSurge and maxUnavailable interact lets you tune the rollout strategy to match requirements.

---

## Rollback Operations (2 min)

Here's a critical fact for the CKAD exam: Kubernetes does not automatically rollback failed deployments. You must monitor and manually intervene. This surprises many people who expect automatic rollback on failure, but Kubernetes leaves that decision to you.

However, Kubernetes does make rollbacks easy by maintaining revision history. Each time you update a Deployment, Kubernetes creates a new ReplicaSet. The old ReplicaSet isn't deleted - it's scaled to zero and kept for rollback purposes. By default, Kubernetes retains the last 10 revisions.

The rollback workflow is straightforward. You can view rollout history with kubectl rollout history, which shows all previous revisions. To rollback to the previous version, use kubectl rollout undo. To rollback to a specific revision, add the --to-revision flag with the revision number.

An important nuance: a rollback reverts the Pod template spec - things like container images, environment variables, and volume mounts. It does not revert the entire Deployment spec. Your rollout strategy settings, replica count, and other Deployment-level configurations remain unchanged. If you had configured a fast rollout strategy, the rollback will also use that fast strategy.

You can monitor a rollout's progress with kubectl rollout status. This command watches the rollout and reports when it completes or if it's stuck. This is essential during the exam - you want confirmation that your update succeeded before moving to the next question.

For exam speed, remember these commands: kubectl set image to quickly update the container image, kubectl rollout status to monitor progress, and kubectl rollout undo to rollback. These three commands handle most rollout scenarios you'll encounter on the exam.

---

## Blue/Green Deployments (3 min)

Blue/green deployments provide instant switchover with zero risk to users. This strategy is perfect for critical services where you want thorough testing before exposing users to changes.

The concept is elegantly simple. You have two complete environments - blue representing your current production version, and green representing your new version. Only one environment serves traffic at a time. You deploy green alongside blue, test green thoroughly without affecting users, then switch traffic instantly by updating the Service selector. If problems arise, you switch back just as instantly.

In Kubernetes, implementing blue/green means creating two separate Deployments. Let's say you have a Deployment called app-blue running version 1, with three replicas, and each Pod is labeled with "version: blue". Your Service selects Pods with "version: blue" in its selector. Now you deploy app-green with version 2, also with three replicas, but labeled with "version: green". Both Deployments are running, but the Service only sends traffic to blue.

After deploying green, you can test it directly - perhaps by creating a temporary Service that points to green, or by port-forwarding to a green Pod. Once you're confident green is working correctly, you switch production traffic by patching the Service selector. The command is: kubectl patch service app-svc with a JSON patch that changes the selector from "version: blue" to "version: green". This happens instantly - no Pod restarts, no waiting. Users immediately start hitting green instead of blue.

The beauty of blue/green is the instant rollback capability. If you detect issues with green, you simply patch the Service selector back to blue. Again, this is instantaneous. You have blue still running, ready to take traffic at a moment's notice.

The trade-off is resource consumption. You're running two complete environments simultaneously - that's double the Pods, double the memory, double the CPU. For large applications, this can be expensive. You also need to keep blue running even after switching to green, at least until you're confident green is stable. Eventually you'll scale down or delete blue, but typically you'd wait hours or even days before doing so.

For the CKAD exam, blue/green implementation tests your ability to create Deployments with appropriate labels, create Services with proper selectors, and use kubectl patch to update the Service. Practice the patch command format - it's easy to make syntax errors under exam pressure.

---

## Canary Deployments (3 min)

Canary deployments minimize risk by gradually exposing users to new versions. The name comes from "canary in a coal mine" - using a small population as an early warning system for problems.

The strategy works like this: you deploy your new version alongside the stable version, but with a small number of replicas. The Service load-balances traffic across all Pods, so only a small percentage of requests hit the new version. You monitor metrics like error rates, latency, and performance. If everything looks good, you gradually scale up the canary and scale down the stable version. If problems appear, you quickly scale the canary to zero, affecting only that small percentage of users.

In Kubernetes, implementing canary means running two Deployments with the same labels but different versions. Let's walk through an example. You have app-stable running version 1 with four replicas. Your Service selects "app: myapp" without specifying a version. Now you deploy app-canary running version 2 with just one replica. Both Deployments have the label "app: myapp", so the Service load-balances across all five Pods. With one canary Pod and four stable Pods, approximately 20% of requests hit the canary.

The key phrase is "approximately" - Kubernetes Services don't provide precise traffic control. They distribute requests across endpoints relatively evenly, but you can't guarantee exactly 20%. For rough traffic percentages, this approach works fine.

After monitoring the canary at 20%, you might progress to 50% by scaling to three canary replicas and three stable replicas. Then to 100% canary by scaling canary to four replicas and stable to zero. Each stage gives you a checkpoint where you can evaluate metrics and decide whether to proceed or rollback.

Rollback is simple - scale the canary to zero. Users immediately stop hitting the problematic version. This is why canary is excellent for high-risk changes - you limit the blast radius of any issues.

The progression speed depends on your confidence and monitoring capabilities. In production, you might hold at each stage for hours or even days, collecting metrics and analyzing behavior. For the CKAD exam, you'd typically execute the scaling operations quickly since you won't have real monitoring systems available.

The exam might ask you to implement a canary deployment with specific traffic percentages. Remember the formula: canary percentage equals canary replicas divided by total replicas. If you need 20% canary with five total Pods, that's one canary Pod and four stable Pods. If you need 30% with ten total Pods, that's three canary and seven stable.

---

## Recreate Strategy (1 min)

The recreate strategy is the simplest but most disruptive approach. Kubernetes terminates all existing Pods, waits for termination to complete, then creates all new Pods. This causes downtime - there's a period where your application has zero running Pods.

When would you use this? In development and testing environments where downtime is acceptable. For applications that cannot run multiple versions simultaneously - perhaps due to database schema incompatibilities or shared state that would conflict between versions. Or when you're doing major infrastructure changes that require a clean slate.

To configure recreate strategy, you set strategy type to "Recreate" in your Deployment spec. That's it - there are no additional parameters like maxSurge or maxUnavailable because those concepts don't apply.

The danger of recreate is that a bad deployment takes your application completely offline. If your new Pods fail to start - maybe because of a bad image or incorrect configuration - your application stays down until you fix it. Even rolling back uses the recreate strategy, so there's continued downtime during recovery.

For the CKAD exam, you should know how to configure recreate strategy and understand when it's appropriate. You probably won't be asked to use it in production scenarios, but you might see questions about development environments or specific applications that require it.

---

## Practical Rollout Patterns (2 min)

Let me walk you through common rollout patterns you'll encounter in the CKAD exam and real-world operations.

Pattern one: simple image update with default rolling update. This is the most common scenario. You use kubectl set image deployment your-app your-container=new-image:tag. Then kubectl rollout status to monitor progress. This uses the default rollout strategy - 25% maxSurge and maxUnavailable. It's fast enough, safe enough, and requires no special configuration.

Pattern two: conservative rollout for critical services. You edit the Deployment to set maxSurge to 1 and maxUnavailable to 0. This updates one Pod at a time, ensuring full capacity is always available. Then you apply the updated Deployment spec. This pattern appears in exam questions about high-availability services that can't tolerate any capacity reduction.

Pattern three: fast rollout for development environments. Set maxSurge to 100% and maxUnavailable to 25% or higher. This prioritizes speed over resource efficiency. You might see this in questions about development or testing namespaces.

Pattern four: blue/green for instant switchover. Create two Deployments with different version labels, create a Service with a version selector, deploy and test the new version, then patch the Service selector to switch traffic. Rollback by patching the selector back.

Pattern five: canary for gradual validation. Create two Deployments with the same app label but different names, scale them to achieve desired traffic distribution, monitor at each stage, and gradually shift traffic by adjusting replica counts. Rollback by scaling canary to zero.

For exam success, practice executing each pattern until it's muscle memory. You should be able to implement a basic rolling update in under two minutes, a blue/green setup in four to five minutes, and a canary deployment in five to six minutes.

---

## Troubleshooting Failed Rollouts (2 min)

Troubleshooting failed rollouts quickly is critical for the CKAD exam. When a rollout fails, you need to diagnose and fix it in just a few minutes.

Common symptoms include Pods stuck in ImagePullBackOff - usually meaning the image doesn't exist or you don't have pull permissions. Pods in CrashLoopBackOff - the container starts but immediately crashes. Rollouts that never complete - some Pods become ready but others don't. Or Deployments showing only partial ready counts like "2 of 3 replicas ready".

Your diagnostic workflow has clear steps. First, check rollout status with kubectl rollout status deployment-name. This tells you if the rollout is progressing, stuck, or failed. Second, describe the Deployment to see its events and condition messages. Third, list Pods to see their status. Fourth, describe failing Pods to see detailed error messages. Fifth, check logs of failing containers.

Common issues and fixes: if the image is wrong or doesn't exist, either update to a correct image or rollback. If configuration is wrong - maybe an environment variable refers to a non-existent ConfigMap - fix the configuration. If there are resource constraints - maybe you don't have enough CPU or memory available in your cluster - either free up resources or reduce your requests.

For the exam, don't spend too long debugging. If you quickly identify the issue and know the fix, apply it. But if you're stuck after two or three minutes, consider just rolling back to restore the working state and move to the next question. You can always return later if you have time.

The fastest fix for any rollout issue is often just kubectl rollout undo. This immediately reverts to the last working version while you figure out what went wrong. In the exam, a working rollback is better than a half-finished debug session.

---

## CKAD Exam Speed Techniques (2 min)

Let me share time-saving techniques specifically for rollout questions on the CKAD exam.

First, use kubectl set image for quick updates instead of editing YAML. The command is: kubectl set image deployment/name container-name=new-image:tag. This is much faster than kubectl edit and less error-prone.

Second, always follow updates with kubectl rollout status. Don't just apply changes and move on - verify they worked. This command blocks until the rollout completes or fails, giving you immediate feedback.

Third, use dry-run for generating base YAML. If you need to create new Deployments for blue/green or canary scenarios, use kubectl create deployment with --dry-run=client and -o yaml to generate a template. Then modify it for your needs. This is faster than writing YAML from scratch.

Fourth, master the kubectl patch command format for blue/green switchover. The syntax is: kubectl patch service name -p with a JSON patch. The JSON is: {"spec":{"selector":{"version":"green"}}}. Practice this command because the JSON syntax is easy to get wrong under pressure.

Fifth, use aliases for common commands. At the start of the exam, set up aliases like: alias k=kubectl, alias kgp="kubectl get pods", alias kgs="kubectl get svc". This saves typing throughout the exam.

Sixth, chain commands with && to execute sequences. For example: kubectl set image deployment/app app=app:v2 && kubectl rollout status deployment/app. This updates and monitors in one go.

Finally, know when to use imperative versus declarative approaches. For simple updates, imperative commands are faster. For complex configurations requiring multiple changes, editing YAML might be more efficient.

---

## Summary and Key Takeaways (1 min)

Let's summarize the critical concepts for rollout success on the CKAD exam.

Rolling updates are the default strategy, controlled by maxSurge and maxUnavailable. Higher values mean faster rollouts but more resources or risk. Kubernetes does not automatically rollback - you must monitor and manually intervene using kubectl rollout undo.

Blue/green deployments provide instant switchover by running two complete environments and changing the Service selector. This requires double the resources but gives you zero-risk testing and instant rollback.

Canary deployments minimize risk by gradually exposing users to new versions. You control traffic percentage by adjusting replica counts across two Deployments with the same labels.

Recreate strategy terminates all Pods then creates new ones, causing downtime. Use it only when appropriate - usually in development environments or for applications that can't run multiple versions.

For exam success: master kubectl set image for quick updates, kubectl rollout status for monitoring, kubectl rollout undo for rollback, and kubectl patch for blue/green switching. Practice each strategy until you can implement it quickly under pressure. Understand the trade-offs between strategies so you can choose appropriately when the exam question doesn't specify which to use.

Remember - rollouts are about managing risk while delivering updates. Choose the right strategy for the scenario, execute it efficiently, verify it worked, and be ready to rollback if needed.

Thank you for listening. Good luck with your CKAD preparation!
