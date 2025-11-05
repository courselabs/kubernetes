# Rollouts - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now practiced triggering rolling updates, monitoring rollout status, pausing and resuming updates, executing rollbacks, and configuring update strategies.

Here's what you need to know for CKAD: Rollout operations are guaranteed exam content. You'll update Deployments, check rollout status, and potentially rollback changes. The exam expects fast, confident execution of rollout commands.

That's what we're going to focus on in this next section: exam-specific rollout scenarios and command mastery.

## What Makes CKAD Different

The CKAD exam tests practical update management. You'll see requirements like "update the nginx deployment to version 1.19" or "rollback the failed deployment update." You need to execute these operations quickly and verify success.

For rollouts specifically, the exam will test you on:

**Triggering updates efficiently** - Using `kubectl set image deployment/name container=image:tag` for quick image updates. Or using `kubectl edit` to modify the Deployment spec directly. Both trigger automatic rolling updates. Understanding that updates happen when the Pod template changes.

**Monitoring rollout status** - Using `kubectl rollout status deployment/name` to watch update progress. Understanding status messages: "Waiting for deployment to roll out," "successfully rolled out," or errors indicating problems. Knowing when to wait versus when to investigate.

**Checking rollout history** - Using `kubectl rollout history deployment/name` to see all revisions. Adding `--revision=N` to see specific revision details. Understanding that this history is what enables targeted rollbacks.

**Executing rollbacks** - Using `kubectl rollout undo deployment/name` to revert to the previous version. Using `--to-revision=N` to rollback to a specific earlier version. Understanding that rollback is instant because old ReplicaSets are preserved.

**Pausing and resuming** - Using `kubectl rollout pause deployment/name` to freeze updates mid-rollout. Verifying the new version before continuing with `kubectl rollout resume deployment/name`. Understanding when this control is valuable.

**Update strategy configuration** - Setting `maxSurge` and `maxUnavailable` in the Deployment's strategy section. Understanding that maxSurge allows extra Pods during updates (needs resources), while maxUnavailable allows fewer Pods (saves resources but reduces availability).

## What's Coming

In the upcoming CKAD-focused video, we'll drill on exam scenarios. You'll practice updating Deployments in under 30 seconds. You'll check rollout status immediately. You'll execute rollbacks when needed.

We'll cover exam patterns: updating container images for new versions, verifying rollout completion before moving on, rolling back failed updates quickly, checking revision history to understand changes, and configuring update strategies for specific requirements.

We'll also explore time-saving techniques: using `kubectl set image` as the fastest update method, knowing that `kubectl rollout status -w` watches in real-time, understanding that rollback is safe and instant, verifying the result with `kubectl get pods` showing new Pod names, and using `kubectl describe deployment` to see update progress details.

Finally, we'll practice complete scenarios timing ourselves to ensure rollout operations don't consume excessive exam time.

## Exam Mindset

Remember: Rollout commands should be reflexive. When you see "update deployment," your hands should execute `kubectl set image` immediately. When you see "rollback," execute `kubectl rollout undo` without hesitation.

Practice these commands until they're muscle memory. The exam is time-limited, and rollout operations should be quick wins, not time sinks.

Let's dive into CKAD-specific rollout scenarios!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with rollout demonstrations
- Serious but encouraging tone - this is exam preparation

**Tone:**
- Shift from learning to drilling
- Emphasize command speed and verification
- Build confidence through repetition

**Key Messages:**
- Rollouts are guaranteed CKAD content
- Commands should be reflexive and fast
- Always verify rollout completion
- The upcoming content focuses on speed

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
