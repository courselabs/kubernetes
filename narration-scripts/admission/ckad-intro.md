# Admission Control - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now experienced how admission controllers validate and mutate resources, and you've seen how Gatekeeper provides declarative policy management.

But here's the key point for CKAD: while admission control is advanced material beyond the core exam requirements, you absolutely will encounter scenarios where admission policies block your deployments. The exam isn't testing whether you can implement admission controllers - it's testing whether you can quickly diagnose and fix problems when policies reject your resources.

That's exactly what we're going to focus on in this next section.

## What Makes CKAD Different

The CKAD exam is a practical, time-limited test performed in live Kubernetes clusters. You don't get to choose whether admission controllers are present - they're part of the environment, and you must work within their constraints.

For admission control specifically, the exam will test you on:

**Pod Security Standards** - You'll need to configure Pods that comply with baseline or restricted security policies. This means setting proper security contexts, running as non-root, dropping capabilities, and avoiding privileged containers.

**ResourceQuota troubleshooting** - You might encounter mysterious deployment failures with "exceeded quota" errors. You'll need to quickly check namespace quotas, understand what's consuming resources, and either reduce your requests or free up quota.

**LimitRange constraints** - When Pods fail to create because they exceed maximum resource limits, you must identify the LimitRange constraints and adjust your specifications accordingly.

**Webhook policy violations** - In clusters with custom admission policies or Gatekeeper constraints, you'll see errors about missing labels, incorrect configurations, or policy violations. You need to read these error messages, find the constraint details, and fix your manifests.

**Troubleshooting location** - Critically, admission errors don't appear in Pod events - they appear in ReplicaSet events. You must know to check `kubectl describe replicaset` when Pods aren't being created.

## What's Coming

In the upcoming CKAD-focused video, we'll work through practical troubleshooting scenarios. You'll see exactly how to diagnose Pod Security Standard violations, how to identify ResourceQuota exhaustion, how to work with LimitRange constraints, and how to read and satisfy Gatekeeper policies.

We'll focus on the essential kubectl commands for debugging: checking ReplicaSet events, describing ResourceQuotas, checking namespace labels for Pod Security settings, and finding Gatekeeper constraints. These are the commands that will save you time when deployments fail.

We'll also cover time-saving strategies. When you have two hours to complete 15-20 exam tasks, you can't afford to spend 10 minutes debugging an admission error. You need a systematic approach: check the error, identify the constraint, fix the manifest, move on.

## Exam Mindset

Remember: admission control errors are troubleshooting scenarios, not trick questions. The error messages tell you exactly what's wrong - you just need to know where to find them and how to interpret them quickly.

Practice the troubleshooting workflow until it's automatic. When a deployment shows 0 ready replicas, your reflex should be to check the ReplicaSet events immediately.

Let's dive into CKAD-specific admission control troubleshooting!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with troubleshooting commands
- Serious but encouraging tone - this is practical exam preparation

**Tone:**
- Shift from learning to troubleshooting
- Emphasize practical, time-efficient debugging
- Build confidence while being realistic about complexity

**Key Messages:**
- You won't implement admission control, but you will troubleshoot it
- Error messages are your friend - read them carefully
- Check ReplicaSet events, not Pod events
- The upcoming content focuses on quick diagnosis and fixes

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
