# API Versions and Deprecations - CKAD Introduction

**Duration:** 2-3 minutes
**Format:** Talking head or screen with exam resources visible
**Purpose:** Bridge from basic exercises to exam-focused preparation

---

## Transition to Exam Preparation

Excellent work on the hands-on exercises! You've now practiced discovering API versions, exploring resource structures with `kubectl explain`, and migrating manifests between API versions.

Here's the key point for CKAD: API version questions appear directly in the exam, and they're usually quick wins if you know the right commands. The exam may give you manifests with deprecated APIs that you must fix, or ask you to identify the correct API version for a specific resource type. Time management is critical - these questions should take 3-4 minutes maximum.

That's what we're going to focus on in this next section: fast, accurate API version troubleshooting under exam conditions.

## What Makes CKAD Different

The CKAD exam is practical and time-limited. When you encounter API version questions, you can't afford to spend 10 minutes researching the correct format. You need systematic approaches and memorized patterns.

For API versions specifically, the exam will test you on:

**Identifying current API versions** - You'll need to quickly find the correct apiVersion for resources like Ingress, CronJob, or PodDisruptionBudget. The answer is always available through `kubectl api-resources`, but you need to execute this command reflexively.

**Fixing deprecated API errors** - When you see "no matches for kind Ingress in version networking.k8s.io/v1beta1", you must immediately recognize this as a deprecated API issue, find the current version, and fix the manifest. This entire workflow should take under 2 minutes.

**Understanding schema changes** - API migrations sometimes involve more than just changing the version number. The v1 Ingress requires a `pathType` field that wasn't needed in v1beta1. The v1 Ingress uses `service.name` instead of `serviceName`. You need to spot and fix these structural differences quickly.

**Using kubectl explain efficiently** - When you're unsure about required fields or valid values, `kubectl explain` gives you instant answers without leaving the terminal. You must use this tool reflexively to verify schema requirements.

**Common API version patterns** - Memorizing that core resources use v1, workloads use apps/v1, jobs use batch/v1, and networking resources use networking.k8s.io/v1 saves precious seconds during the exam.

## What's Coming

In the upcoming CKAD-focused video, we'll drill on exam-specific scenarios. You'll practice finding API versions in under 30 seconds per resource. You'll fix deprecated API manifests in under 2 minutes each. You'll use `kubectl explain` to verify schema requirements quickly.

We'll cover the most common deprecated API patterns you might encounter: Deployment from extensions/v1beta1 to apps/v1, Ingress from v1beta1 to v1, and CronJob from v1beta1 to v1. For each pattern, you'll learn the exact changes required.

We'll also develop a troubleshooting decision tree. When you see an API error, you'll know exactly which command to run first, what to look for in the output, and how to fix the issue systematically. This removes guesswork and saves time.

Finally, we'll discuss time-saving exam strategies: using `kubectl api-resources` instead of searching documentation, leveraging `kubectl explain` for schema verification, testing fixes with `--dry-run=server` before applying, and knowing when to move on if stuck.

## Exam Mindset

Remember: API version questions are knowledge checks, not puzzles. The exam isn't trying to trick you - it's verifying that you can work efficiently with Kubernetes APIs. If you know the commands and patterns, these are straightforward points.

Practice the workflows until they're automatic. When you see a deprecated API error, your hands should execute `kubectl api-resources | grep <resource>` before your brain finishes thinking about it.

Let's dive into CKAD-specific API version scenarios!

---

## Recording Notes

**Visual Setup:**
- Can show terminal with quick command demonstrations
- Serious but encouraging tone - this is exam preparation

**Tone:**
- Shift from learning to drilling
- Emphasize speed and accuracy
- Build confidence through systematic approaches

**Key Messages:**
- API version questions are quick wins with the right commands
- kubectl api-resources and kubectl explain are your best friends
- Memorize common patterns to save time
- The upcoming content focuses on speed and accuracy

**Timing:**
- Transition opening: 30 sec
- What Makes CKAD Different: 1 min
- What's Coming: 45 sec
- Exam Mindset: 30 sec

**Total: ~2.75 minutes**
