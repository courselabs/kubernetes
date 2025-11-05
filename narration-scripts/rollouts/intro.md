# Rollouts and Deployment Strategies - Concept Introduction

**Duration:** 10-12 minutes
**Format:** Concept slideshow presentation
**Audience:** CKAD exam candidates and Kubernetes practitioners

---

## Slide 1: Introduction (30 seconds)

Welcome to this session on Kubernetes deployment strategies and rollouts. This is a core topic for the CKAD exam, accounting for 20% of the Application Deployment domain. Today, we'll explore how Kubernetes manages application updates safely and efficiently.

**Key Point:** Every code change, library update, or OS patch requires a rollout. Understanding deployment strategies is essential for zero-downtime updates in production.

---

## Slide 2: The Update Challenge (1 minute)

In production Kubernetes environments, you'll constantly deploy updates:
- **New application features** - Rolling out v2, v3, and beyond
- **Security patches** - OS and library vulnerabilities need immediate fixes
- **Configuration changes** - Some apps require pod restarts for config updates
- **Infrastructure updates** - Node maintenance and cluster upgrades

**The Challenge:** How do you update running applications without causing downtime or impacting users?

**Visual:** Show diagram of traditional deployment with downtime vs. Kubernetes zero-downtime deployment.

---

## Slide 3: Deployment Strategies Overview (1.5 minutes)

Kubernetes supports four main deployment strategies, each with different risk and resource trade-offs:

**Strategy Comparison Table:**

| Strategy | Risk Level | Downtime | Resource Usage | Best For |
|----------|------------|----------|----------------|----------|
| **Rolling Update** | Low | None | Medium | Most applications |
| **Blue/Green** | Very Low | None | High (2x) | Critical services |
| **Canary** | Low | None | Medium | High-risk changes |
| **Recreate** | High | Yes | Low | Development/testing |

**Key Insight:** There's no one-size-fits-all strategy. Your choice depends on your application's requirements, risk tolerance, and available resources.

---

## Slide 4: Rolling Updates - The Default Strategy (2 minutes)

Rolling updates are Kubernetes' default deployment strategy, and for good reason.

**How It Works:**
1. Create new pods with updated version
2. Wait for new pods to become ready
3. Terminate old pods
4. Repeat until all pods are updated

**Key Configuration Parameters:**
- **maxSurge:** Maximum number of extra pods during rollout (default: 25%)
- **maxUnavailable:** Maximum pods that can be unavailable (default: 25%)

**Example Scenarios:**
- **Fast rollout:** `maxSurge: 100%`, `maxUnavailable: 0%` - Creates all new pods immediately
- **Conservative rollout:** `maxSurge: 1`, `maxUnavailable: 0` - Updates one pod at a time
- **Balanced rollout:** `maxSurge: 25%`, `maxUnavailable: 25%` - Default behavior

**Important:** Both old and new versions run concurrently during rollout. Your application must support this!

**Visual:** Animation showing rolling update with 3 replicas, demonstrating pod creation and termination sequence.

---

## Slide 5: Rollback Capabilities (1.5 minutes)

**Critical CKAD Concept:** Kubernetes does NOT automatically rollback failed deployments. You must monitor and manually intervene.

**Rollout History:**
- Kubernetes maintains revision history for deployments
- Each rollout creates a new ReplicaSet
- Old ReplicaSets are retained (default: 10 revisions)

**Rollback Commands:**
```bash
# View rollout history
kubectl rollout history deployment/myapp

# Rollback to previous version
kubectl rollout undo deployment/myapp

# Rollback to specific revision
kubectl rollout undo deployment/myapp --to-revision=3

# Monitor rollout status
kubectl rollout status deployment/myapp
```

**Key Point:** A rollback reverts the Pod spec, not the entire Deployment spec. Your rollout strategy settings remain unchanged.

---

## Slide 6: Blue/Green Deployments (2 minutes)

Blue/Green provides instant switchover with zero risk to users.

**The Concept:**
- **Blue** = Current production version (e.g., v1)
- **Green** = New version being prepared (e.g., v2)
- Only one version serves traffic at a time
- Switch traffic instantly by updating Service selector

**How It Works:**
1. Deploy green version alongside blue
2. Test green thoroughly (without affecting users)
3. Switch Service selector from blue to green
4. Monitor green in production
5. Keep blue running as instant rollback option
6. Decommission blue once green is stable

**CKAD Implementation:**
```bash
# Switch from blue to green
kubectl patch service myapp-svc -p '{"spec":{"selector":{"version":"green"}}}'

# Instant rollback if needed
kubectl patch service myapp-svc -p '{"spec":{"selector":{"version":"blue"}}}'
```

**Advantages:**
- Instant switchover (just update selector)
- Easy instant rollback
- Full production testing before going live
- No mixed versions serving traffic

**Drawbacks:**
- Requires 2x resources (both versions running)
- Complex with stateful apps or database migrations
- Not suitable for all scenarios

**Visual:** Diagram showing blue and green deployments with service selector pointing to each.

---

## Slide 7: Canary Deployments (2 minutes)

Canary deployments minimize risk by gradually exposing users to new versions.

**The Concept:**
Named after "canary in a coal mine" - early warning system for problems. Roll out to a small subset first, then gradually increase.

**How It Works:**
1. Deploy canary version with small pod count (e.g., 1 pod = 20% traffic)
2. Monitor metrics: errors, latency, performance
3. Gradually scale up canary, scale down stable
4. Complete rollout when canary reaches 100%
5. Easy rollback: scale canary to 0

**CKAD Implementation:**
Two Deployments with same labels, different versions:
- **Stable:** 4 replicas (v1) = 80% traffic
- **Canary:** 1 replica (v2) = 20% traffic
- Service load-balances across all 5 pods

**Progression Example:**
```
Start:    4 stable (80%) + 1 canary (20%)
Step 1:   3 stable (50%) + 3 canary (50%)
Step 2:   0 stable (0%)  + 4 canary (100%)
Complete: Remove stable deployment
```

**Advantages:**
- Minimal user impact (only small percentage exposed)
- Gradual rollout with monitoring at each stage
- Easy rollback by scaling down canary
- Data-driven deployment decisions

**Drawbacks:**
- More complex than rolling updates
- Requires good monitoring/metrics
- Traffic distribution may not be perfectly equal

**Visual:** Diagram showing traffic distribution across stable and canary pods.

---

## Slide 8: Recreate Strategy (1 minute)

The Recreate strategy is the simplest but most disruptive approach.

**How It Works:**
1. Terminate ALL existing pods
2. Wait for termination to complete
3. Create all new pods

**When to Use:**
- Development and testing environments
- Applications that cannot run multiple versions simultaneously
- Database schema changes requiring incompatible versions
- When downtime is acceptable

**Configuration:**
```yaml
spec:
  strategy:
    type: Recreate
```

**Warning:** A bad deployment will take your application completely offline. Use with extreme caution in production.

**Visual:** Timeline showing downtime period between old pods terminating and new pods starting.

---

## Slide 9: Choosing the Right Strategy (1.5 minutes)

**Decision Matrix for CKAD Scenarios:**

| Choose... | When... | CKAD Example |
|-----------|---------|--------------|
| **Rolling Update** | Default choice, app supports multiple versions, moderate risk | "Update nginx to version 1.21 with zero downtime" |
| **Blue/Green** | Zero downtime critical, need thorough testing, can afford 2x resources | "Deploy payment service with instant rollback capability" |
| **Canary** | High-risk changes, want to limit user exposure, have good monitoring | "Deploy new search algorithm to 10% of users first" |
| **Recreate** | App cannot run multiple versions, downtime acceptable, minimal resources | "Update legacy app with incompatible schema changes" |

**Key Questions to Ask:**
1. Can my app run multiple versions simultaneously?
2. How much downtime can I tolerate?
3. What resources are available in my cluster?
4. How critical is instant rollback capability?
5. Do I have monitoring to detect issues?

---

## Slide 10: CKAD Exam Tips (1 minute)

**What You Must Know:**
1. **Rolling update configuration** - maxSurge, maxUnavailable
2. **Rollback commands** - undo, history, status
3. **Blue/Green implementation** - Using Service selector patching
4. **Canary implementation** - Using multiple Deployments with same labels
5. **Update strategies** - When to use each approach

**Common Exam Tasks:**
- "Update deployment to new version with zero downtime"
- "Implement canary deployment with 20% traffic to new version"
- "Rollback failed deployment to previous version"
- "Configure slow rollout (one pod at a time)"
- "Switch traffic between blue and green versions"

**Time-Saving Commands:**
```bash
# Quick image update
kubectl set image deployment/myapp myapp=myapp:v2

# Monitor rollout
kubectl rollout status deployment/myapp

# Quick rollback
kubectl rollout undo deployment/myapp
```

---

## Slide 11: Key Takeaways (1 minute)

**Essential Concepts:**
1. **No automatic rollback** - You must monitor and intervene
2. **Choose wisely** - Each strategy has trade-offs
3. **Test thoroughly** - Before any production rollout
4. **Monitor actively** - During and after deployment
5. **Plan for failure** - Always have rollback strategy

**CKAD Success Formula:**
- Understand all four strategies
- Know when to use each
- Master kubectl rollout commands
- Practice blue/green and canary implementations
- Be comfortable with Service selector patching

**Remember:** In production, deployment strategy is not just about rolling out changes—it's about managing risk while delivering value.

---

## Slide 12: Hands-On Preview (30 seconds)

In the next session, we'll get hands-on experience with:
- Fast and slow rolling updates
- Implementing blue/green deployments
- Creating canary rollouts
- Handling failed deployments and rollbacks
- Using Helm for managed deployments

**Get ready to apply these concepts in real scenarios!**

---

**Total Time:** 10-12 minutes
**Next:** Practical exercises and demonstrations
