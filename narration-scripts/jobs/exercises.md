# Jobs and CronJobs - Practical Exercises
## Narration Script for Hands-On Demonstration
**Duration:** 15-18 minutes

---

## Setup and Introduction (0:00 - 0:30)

"Welcome to the hands-on portion of our Jobs and CronJobs session. We'll work through practical examples that demonstrate the concepts we just covered."

**Preparation check:**


"Make sure you're connected to your practice cluster and in the default namespace. Let's begin with a simple one-off Job."

---

## Exercise 1: Creating a Simple Job (0:30 - 3:00)

### Demo: One-off Pi Calculation (0:30 - 2:00)

"Our first example uses a Pi calculation application. Normally it runs as a web service, but we can also use it for one-off calculations."

**Navigate to the spec:**


"Notice the key elements:
- API version: batch/v1 - Jobs are in the batch API group
- Kind: Job - not a Deployment
- The template section contains a standard Pod spec
- restartPolicy is set to Never - this is required for Jobs
- The command overrides the default to run a calculation"

**Deploy the Job:**


"The Job is created immediately. Let's check its status. You'll see it shows 0/1 completions initially, then transitions to 1/1 when complete."

### Finding and Checking Job Pods (2:00 - 3:00)

"Jobs automatically apply a label to the Pods they create. Let's use that to find our Pod."


"See the 'job-name=pi-job-one' label? That's automatically added. We can use it to filter:"


"There's our Pi calculation! The Pod ran, computed Pi to 50 decimal places, and exited successfully."

**Key learning point:** "Notice the Job and Pod are still here even though the work is complete. This is by design - you can examine logs and debug issues. Jobs don't automatically clean up."

---

## Exercise 2: Job Immutability (3:00 - 5:00)

### Attempting to Update a Job (3:00 - 4:00)

"Let's try to update our Job to calculate more decimal places."


"This spec changes the calculation from 50 to 500 decimal places. Let's try to apply it:"


"You'll see an error: 'field is immutable'. This is a critical concept - **Jobs cannot be updated**."

### The Correct Approach (4:00 - 5:00)

"To run a different Job, you must delete the old one first:"


"Watch as the new Job creates its Pod. When it completes, check the logs - you'll see 500 decimal places this time."

**Exam tip:** "Don't waste time trying to edit Jobs. Delete and recreate - it's faster."

---

## Exercise 3: Parallel Job Execution (5:00 - 8:00)

### Understanding Parallel Jobs (5:00 - 5:45)

"Now let's run multiple Pods to completion using a single Job. This is useful for batch processing where you have a known amount of work to do."


"Notice two new fields:
- completions: 3 - we need 3 Pods to successfully complete
- parallelism: 3 - run up to 3 Pods concurrently

Each Pod will calculate Pi to a random number of decimal places."

### Running Parallel Work (5:45 - 7:00)


"The Job shows 0/3 completions initially. Let's watch the Pods:"


"Notice all three Pods start simultaneously because parallelism is 3. Watch them progress through ContainerCreating, Running, and then Completed."

"Press Ctrl-C when all three have completed."

### Examining Results (7:00 - 8:00)


"You'll see logs from all three Pods - pages and pages of Pi! Each calculated to a different precision."


"The describe output shows:
- Pod Statuses: 3 Succeeded
- Events showing each Pod creation
- The completion time

This is how you track progress on batch processing jobs."

---

## Exercise 4: CronJobs for Scheduled Tasks (8:00 - 12:00)

### Creating a CronJob (8:00 - 9:30)

"Let's move on to CronJobs - Jobs that run on a schedule. We'll create a cleanup CronJob that removes old Jobs."


"We have three files:
- cronjob.yaml - the CronJob definition
- rbac.yaml - permissions for the cleanup script
- configmap.yaml - the cleanup script itself"


"Key elements of this CronJob:
- schedule: '*/1 * * * *' - runs every minute
- concurrencyPolicy: Forbid - don't start a new Job if the previous is still running
- jobTemplate: contains a complete Job specification
- The Job runs kubectl commands inside the cluster"

**Security note:** "This requires RBAC permissions - the Pod needs a ServiceAccount with rights to list and delete Jobs."

### Deploying and Watching CronJobs (9:30 - 11:30)


"The CronJob is created but hasn't run yet. Let's watch for Jobs to be created:"


"Wait up to one minute. You'll see a cleanup Job appear with a timestamp in its name. The CronJob controller creates these automatically."

"See how our Pi Jobs from earlier start disappearing? That's the cleanup script working. The CronJob runs every minute, finds completed Jobs, and removes them."

### Understanding CronJob Behavior (11:30 - 12:00)


"The CronJob tracks when it last ran. You can also see:
- successfulJobsHistoryLimit: how many successful Jobs to keep
- failedJobsHistoryLimit: how many failed Jobs to keep"


"The logs show what the cleanup script did - which Jobs it found and deleted."

---

## Exercise 5: Lab Challenge Walkthrough (12:00 - 16:00)

### Part 1: Suspending a CronJob (12:00 - 13:30)

"The lab asks us to suspend the cleanup CronJob without using kubectl apply. Let's do that using kubectl patch."


"Notice the SUSPEND column now shows True. No new Jobs will be created while suspended."

**Alternative approach:**


"The patch approach is faster for the exam. Learn both methods."

### Part 2: Deploying the Backup CronJob (13:30 - 14:30)

"Now let's deploy the backup CronJob from the lab:"


"This CronJob runs daily at 3 AM. We don't want to wait that long to test it!"

### Part 3: Triggering a Job Manually (14:30 - 15:30)

"The second part of the lab asks us to run a Job from this CronJob without using kubectl apply. We use the 'create job --from' command:"


"This creates a Job using the CronJob's jobTemplate. It's identical to what would run on schedule, but triggered immediately."


"The Job runs successfully. This is how you test CronJobs without waiting for the schedule."

### Lab Solution Wrap-up (15:30 - 16:00)

"Let's verify we completed all requirements:
1. ✓ Suspended the cleanup CronJob using patch
2. ✓ Deployed the backup CronJob
3. ✓ Created a manual Job from the CronJob

Two important exam techniques demonstrated here:
- kubectl patch for quick modifications
- kubectl create job --from=cronjob/ for testing scheduled jobs"

---

## Exercise 6: Failure Handling (EXTRA) (16:00 - 18:00)

### Understanding Failure Behavior (16:00 - 16:45)

"If time permits, let's explore the EXTRA section on failure handling. This demonstrates backoff limits and restart policies."


"This Job has an intentional mistake in the command. Notice:
- restartPolicy: OnFailure - container will restart in the same Pod
- No backoffLimit specified - defaults to 6 attempts"


"Watch the RESTARTS column increment. The container fails, restarts, fails again. Eventually it goes into CrashLoopBackoff."

### Changing Restart Strategy (16:45 - 17:30)

"Now let's try the Never restart policy:"


"Changes:
- restartPolicy: Never - create new Pods on failure
- backoffLimit: 4 - try up to 4 times"


"Now instead of restarts, you see new Pods being created. Each has 0 restarts but multiple Pods exist."

### Debugging Failed Jobs (17:30 - 18:00)


"The describe output shows why it failed - a typo in the command. In a real scenario, this is how you'd troubleshoot Job failures."

**Key learning:** "With OnFailure you see restarts. With Never you see multiple Pods. Choose based on whether you want fresh Pods or faster container restarts."

---

## Cleanup and Summary (18:00 - 18:30)

### Clean Up Resources

"Let's clean up our lab environment:"


"All cleaned up. Notice we used labels for efficient cleanup - this is best practice."

### Key Takeaways

"What we've demonstrated today:

1. **Simple Jobs** - Run once and complete
2. **Job Immutability** - Always delete and recreate to change
3. **Parallel Processing** - Use completions and parallelism for batch work
4. **CronJobs** - Schedule Jobs with cron expressions
5. **Manual Triggering** - Test CronJobs with 'create job --from'
6. **Suspending** - Use patch to suspend/resume CronJobs
7. **Failure Handling** - Choose appropriate restart policies and backoff limits

These patterns are essential for the CKAD exam and real-world Kubernetes operations."

---

## Common Issues and Troubleshooting

**If Jobs don't complete:**
- Check Pod status with `kubectl get pods -l job-name=<name>`
- View logs with `kubectl logs -l job-name=<name>`
- Describe the Job: `kubectl describe job <name>`

**If CronJobs don't run:**
- Check schedule syntax: `kubectl describe cronjob <name>`
- Verify it's not suspended: `kubectl get cronjob <name>`
- Check system time and timezone
- Look at events: `kubectl get events --sort-by='.lastTimestamp'`

**If Jobs keep failing:**
- Review backoffLimit - may have been exceeded
- Check Pod events for specific errors
- Verify image exists and is pullable
- Confirm command syntax is correct

---

## Transition to CKAD Exam Prep

"In our next section, we'll focus specifically on CKAD exam patterns. We'll practice imperative commands, time-saving techniques, and common exam scenarios. You'll learn how to create and debug Jobs and CronJobs quickly under exam pressure."
