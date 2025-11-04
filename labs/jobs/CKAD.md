# Jobs and CronJobs for CKAD

This document extends the [basic jobs lab](README.md) with CKAD exam-specific scenarios and requirements.

## CKAD Exam Context

Jobs and CronJobs are important CKAD topics. You'll need to:
- Create Jobs and CronJobs imperatively and declaratively
- Understand completion, parallelism, and restart policies
- Handle job failures with backoff limits
- Work with CronJob schedules and concurrency
- Trigger one-off Jobs from CronJobs
- Debug failed Jobs and view logs

**Exam Tip:** Jobs are immutable once created (you can't change the Pod template). Always delete and recreate rather than trying to edit.

## API specs

- [Job (batch/v1)](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#job-v1-batch)
- [CronJob (batch/v1)](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#cronjob-v1-batch) - Note: Graduated to stable in v1.21+
- [PodTemplate spec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#podtemplatespec-v1-core)

## Imperative Job Creation

Speed is critical in CKAD, so master imperative commands:

```
# Create a Job that runs a command once
kubectl create job hello --image=busybox -- echo "Hello World"

# Create a Job from a CronJob (trigger immediately)
kubectl create job manual-run --from=cronjob/my-cronjob

# Generate Job YAML without creating
kubectl create job test-job --image=nginx --dry-run=client -o yaml > job.yaml

# View Job status
kubectl get jobs
kubectl describe job hello

# View Pods created by Job
kubectl get pods --show-labels
kubectl get pods -l job-name=hello

# View Job logs
kubectl logs -l job-name=hello
kubectl logs job/hello  # shorthand

# Delete Job (also deletes its Pods)
kubectl delete job hello
```

📋 Create a Job called `date-job` that runs the `date` command using the `busybox` image, check its completion, view logs, then delete it.

<details>
  <summary>Solution</summary>

```
kubectl create job date-job --image=busybox -- date
kubectl get jobs
kubectl wait --for=condition=complete job/date-job --timeout=60s
kubectl logs job/date-job
kubectl delete job date-job
```

</details><br />

## Job Restart Policies

Jobs require a restart policy of `Never` or `OnFailure` - the default `Always` is not valid.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi-job
spec:
  template:
    spec:
      containers:
      - name: pi
        image: perl:5.34
        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(100)"]
      restartPolicy: Never  # or OnFailure
```

**Key Differences:**

| Restart Policy | Behavior | Use Case |
|---------------|----------|----------|
| `Never` | Failed Pod is not restarted; Job creates new Pod | When failures need fresh Pod (network/node issues) |
| `OnFailure` | Container restarts in same Pod | Quick container failures, save Pod creation overhead |

📋 Create a Job with restart policy `OnFailure` that runs `exit 1` (will fail), watch the Pod restart multiple times.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: failing-job
spec:
  backoffLimit: 4
  template:
    spec:
      containers:
      - name: fail
        image: busybox
        command: ["sh", "-c", "echo Attempt failed; exit 1"]
      restartPolicy: OnFailure
EOF

# Watch the Pod restart (RESTARTS column increments)
kubectl get pods -l job-name=failing-job --watch

# After 4 failures, the Job stops trying
kubectl describe job failing-job
```

</details><br />

## Job Completions and Parallelism

Jobs can run multiple Pods to completion, either sequentially or in parallel:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: parallel-job
spec:
  completions: 5      # Total successful Pods required
  parallelism: 2      # Max Pods running concurrently
  template:
    spec:
      containers:
      - name: worker
        image: busybox
        command: ["sh", "-c", "echo Processing work; sleep 10; echo Done"]
      restartPolicy: Never
```

**Key Fields:**

- **`completions`**: How many Pods must successfully complete (default: 1)
- **`parallelism`**: How many Pods run simultaneously (default: 1)
- **`backoffLimit`**: Max retry attempts for failed Pods (default: 6)

### CKAD Scenario: Parallel Processing

Create a Job that processes 10 items with 3 workers in parallel:

```
cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: process-items
spec:
  completions: 10
  parallelism: 3
  template:
    spec:
      containers:
      - name: processor
        image: busybox
        command: ["sh", "-c", "echo Processing item \$HOSTNAME; sleep 5"]
      restartPolicy: Never
EOF

# Watch Pods being created and completed
kubectl get pods -l job-name=process-items --watch

# Check Job progress
kubectl get job process-items
```

📋 Create a Job that completes 8 tasks with 4 running in parallel, and sets a backoff limit of 3.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: batch-job
spec:
  completions: 8
  parallelism: 4
  backoffLimit: 3
  template:
    spec:
      containers:
      - name: worker
        image: busybox
        command: ["sh", "-c", "echo Work completed; sleep 2"]
      restartPolicy: Never
EOF

kubectl get job batch-job --watch
```

</details><br />

## Imperative CronJob Creation

```
# Create a CronJob that runs every minute
kubectl create cronjob hello --image=busybox --schedule="*/1 * * * *" \
  -- echo "Hello from CronJob"

# Create CronJob that runs daily at 2am
kubectl create cronjob backup --image=backup-image --schedule="0 2 * * *" \
  -- /backup.sh

# Generate CronJob YAML
kubectl create cronjob test --image=nginx --schedule="0 */6 * * *" \
  --dry-run=client -o yaml > cronjob.yaml

# View CronJobs
kubectl get cronjobs
kubectl get cj  # shorthand

# View Jobs created by CronJob
kubectl get jobs --watch

# Create Job from CronJob (trigger now)
kubectl create job manual-backup --from=cronjob/backup

# Suspend a CronJob (stops creating new Jobs)
kubectl patch cronjob hello -p '{"spec":{"suspend":true}}'

# Resume a CronJob
kubectl patch cronjob hello -p '{"spec":{"suspend":false}}'

# Delete CronJob (doesn't delete existing Jobs)
kubectl delete cronjob hello
```

## Cron Schedule Expressions

CronJobs use standard cron syntax: `minute hour day-of-month month day-of-week`

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

### Common CKAD Schedule Patterns

```
*/5 * * * *      # Every 5 minutes
0 * * * *        # Every hour (on the hour)
0 */6 * * *      # Every 6 hours
0 9 * * *        # Daily at 9am
0 9 * * 1        # Every Monday at 9am
0 0 1 * *        # First day of every month at midnight
30 3 * * 0       # Every Sunday at 3:30am
0 2 * * 1-5      # Weekdays at 2am
*/15 9-17 * * *  # Every 15 minutes during business hours (9am-5pm)
```

📋 Create a CronJob called `report` that runs every day at midnight and prints "Daily report" using the busybox image.

<details>
  <summary>Solution</summary>

```
kubectl create cronjob report --image=busybox \
  --schedule="0 0 * * *" \
  -- echo "Daily report"

# Verify the schedule
kubectl get cronjob report
kubectl describe cronjob report | grep Schedule

# Trigger it manually to test
kubectl create job report-manual --from=cronjob/report
kubectl logs job/report-manual
```

</details><br />

## CronJob Concurrency Policies

The `concurrencyPolicy` controls what happens if a new Job is scheduled while the previous one is still running:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup
spec:
  schedule: "0 2 * * *"
  concurrencyPolicy: Forbid  # Allow | Forbid | Replace
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup-image
          restartPolicy: OnFailure
```

**Concurrency Options:**

| Policy | Behavior |
|--------|----------|
| `Allow` (default) | Multiple Jobs can run concurrently |
| `Forbid` | Skip new Job if previous still running |
| `Replace` | Cancel existing Job and start new one |

### CKAD Scenario: Long-Running Job Protection

```
cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: CronJob
metadata:
  name: long-task
spec:
  schedule: "*/2 * * * *"  # Every 2 minutes
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: worker
            image: busybox
            command: ["sh", "-c", "echo Starting; sleep 180; echo Done"]
          restartPolicy: Never
EOF

# Watch Jobs - if one is still running when next is scheduled, it's skipped
kubectl get jobs --watch
```

## Job and CronJob Time Limits

TODO: Add section covering:
- `activeDeadlineSeconds` - Maximum time Job can run
- `startingDeadlineSeconds` - Deadline for starting missed CronJobs
- TTL (Time To Live) for automatic Job cleanup
- Examples of each with CKAD scenarios

## Successful Jobs History Limits

CronJobs keep history of completed and failed Jobs:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup
spec:
  schedule: "0 3 * * *"
  successfulJobsHistoryLimit: 3  # Keep last 3 successful
  failedJobsHistoryLimit: 1      # Keep last 1 failed
  jobTemplate:
    # ... job spec
```

**Defaults:**
- `successfulJobsHistoryLimit`: 3
- `failedJobsHistoryLimit`: 1

📋 Create a CronJob that runs every minute, keeps 5 successful job histories and 2 failed ones.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: CronJob
metadata:
  name: frequent-task
spec:
  schedule: "*/1 * * * *"
  successfulJobsHistoryLimit: 5
  failedJobsHistoryLimit: 2
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: task
            image: busybox
            command: ["echo", "Task completed"]
          restartPolicy: Never
EOF

# Wait a few minutes and check history
kubectl get jobs
```

</details><br />

## Debugging Failed Jobs

### Check Job Status

```
# Get Job status
kubectl get job failing-job
# Shows COMPLETIONS column: 0/1 means 0 successful out of 1 required

# Detailed Job information
kubectl describe job failing-job
# Look for: Pods Statuses, Events, and "Failed" conditions

# Check Job conditions
kubectl get job failing-job -o jsonpath='{.status.conditions[*].type}'
```

### Check Pod Status and Logs

```
# Find Pods created by Job
kubectl get pods -l job-name=failing-job

# Check Pod events
kubectl describe pod <pod-name>
# Look for: State, Last State, Restart Count, Events

# View container logs
kubectl logs -l job-name=failing-job
kubectl logs -l job-name=failing-job --previous  # Previous container logs

# For multiple Pods, view all logs
kubectl logs -l job-name=my-job --all-containers=true
```

### Common Failure Patterns

1. **ImagePullBackOff**: Wrong image name or no pull access
2. **CrashLoopBackOff**: Container starts but immediately crashes
3. **Error/ContainerCannotRun**: Command not found or invalid
4. **Pending**: Resource constraints or scheduling issues

### CKAD Debug Scenario

```
# Create a failing Job
cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: debug-me
spec:
  backoffLimit: 2
  template:
    spec:
      containers:
      - name: app
        image: busybox
        command: ["nonexistent-command"]
      restartPolicy: Never
EOF

# Debug it
kubectl get job debug-me
kubectl get pods -l job-name=debug-me
kubectl describe pod <pod-name>  # Check Events
kubectl logs <pod-name>  # May not work if container never started
```

📋 Create a Job that will fail due to wrong command, identify the error, fix it and recreate.

<details>
  <summary>Solution</summary>

```
# Create failing Job
kubectl create job broken --image=nginx -- /bin/wrong-command

# Check status
kubectl get job broken
kubectl get pods -l job-name=broken

# Describe to see error
kubectl describe pod <pod-name>
# You'll see: "executable file not found"

# Fix: delete and recreate with correct command
kubectl delete job broken
kubectl create job fixed --image=nginx -- /bin/sh -c "echo Success"

# Verify
kubectl logs job/fixed
```

</details><br />

## Suspending and Resuming CronJobs

CronJobs can be suspended to prevent new Jobs from being created:

```
# Suspend a CronJob (imperative)
kubectl patch cronjob my-cronjob -p '{"spec":{"suspend":true}}'

# Resume a CronJob
kubectl patch cronjob my-cronjob -p '{"spec":{"suspend":false}}'

# Or edit directly
kubectl edit cronjob my-cronjob
# Change spec.suspend: true

# Check suspension status
kubectl get cronjob my-cronjob
# SUSPEND column shows True/False
```

### CKAD Scenario: Suspend During Maintenance

```
# Create a CronJob
kubectl create cronjob backup --image=busybox \
  --schedule="*/5 * * * *" \
  -- echo "Backing up"

# Suspend it (e.g., during maintenance window)
kubectl patch cronjob backup -p '{"spec":{"suspend":true}}'

# Verify - no new Jobs created
kubectl get cronjobs backup
kubectl get jobs --watch

# Resume after maintenance
kubectl patch cronjob backup -p '{"spec":{"suspend":false}}'
```

## Creating Jobs from CronJobs

In the exam, you may need to trigger a CronJob immediately without waiting:

```
# Create Job from CronJob (copies the jobTemplate)
kubectl create job manual-run --from=cronjob/my-cronjob

# With custom name
kubectl create job backup-now --from=cronjob/backup

# Verify
kubectl get jobs
kubectl logs job/backup-now
```

📋 Create a CronJob that runs weekly, then manually trigger it twice with different job names.

<details>
  <summary>Solution</summary>

```
# Create weekly CronJob
kubectl create cronjob weekly-report --image=busybox \
  --schedule="0 0 * * 0" \
  -- echo "Weekly report generated"

# Manually trigger with custom names
kubectl create job report-jan --from=cronjob/weekly-report
kubectl create job report-feb --from=cronjob/weekly-report

# Check both Jobs
kubectl get jobs
kubectl logs job/report-jan
kubectl logs job/report-feb
```

</details><br />

## Job Label Selectors

Jobs automatically create a `job-name` label on their Pods:

```
# Get Pods from specific Job
kubectl get pods -l job-name=my-job

# Get all Job-created Pods
kubectl get pods -l job-name

# Delete all Pods from a Job (Job will recreate if not complete)
kubectl delete pods -l job-name=my-job

# View logs from all Pods in Job
kubectl logs -l job-name=my-job

# Get Jobs by custom label
kubectl get jobs -l app=batch-processor
```

You can also add your own labels to the Pod template for easier management.

## CKAD Exam Patterns and Tips

### Common Exam Tasks

1. **Create one-off Job**
   ```
   kubectl create job task --image=busybox -- <command>
   ```

2. **Create parallel Job**
   - Generate YAML with dry-run
   - Add `completions` and `parallelism`
   - Apply and verify

3. **Create CronJob with schedule**
   ```
   kubectl create cronjob name --image=img --schedule="* * * * *" -- cmd
   ```

4. **Trigger CronJob immediately**
   ```
   kubectl create job manual --from=cronjob/name
   ```

5. **Suspend/Resume CronJob**
   ```
   kubectl patch cronjob name -p '{"spec":{"suspend":true}}'
   ```

6. **Debug failed Job**
   - Check Job status
   - Describe Pods
   - View logs
   - Fix and recreate

### Time-Saving Tips

1. **Use imperative commands** for simple Jobs/CronJobs
2. **Use --from=cronjob/** to quickly test CronJobs
3. **Use -l job-name=** for Job-related operations
4. **Remember Jobs are immutable** - delete and recreate to fix
5. **Check backoffLimit** if Job keeps retrying
6. **Use describe** for debugging - shows clear error messages

### Exam Gotchas

1. **Restart policy** - Must be `Never` or `OnFailure` (not `Always`)
2. **Job immutability** - Can't update Pod template in existing Job
3. **CronJob timezone** - Schedules use controller's timezone (usually UTC)
4. **Job cleanup** - Jobs don't auto-delete; CronJobs keep history
5. **Completion vs Success** - Job shows completed but check if Pods succeeded
6. **Label selection** - Use `job-name` label automatically created by Jobs

## Practice Exercises

### Exercise 1: Parallel Batch Processing

Create a Job that:
- Runs 20 tasks total
- Runs 5 tasks in parallel
- Each task sleeps for 5 seconds then prints "Task complete"
- Has a backoff limit of 3
- Uses restart policy `Never`

Verify it completes successfully and check the total runtime.

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: batch-processing
spec:
  completions: 20
  parallelism: 5
  backoffLimit: 3
  template:
    spec:
      containers:
      - name: worker
        image: busybox
        command: ["sh", "-c", "sleep 5; echo Task complete"]
      restartPolicy: Never
EOF

# Watch it run (should take ~20 seconds with 5 parallel)
kubectl get job batch-processing --watch
kubectl get pods -l job-name=batch-processing

# Check logs
kubectl logs -l job-name=batch-processing
```

</details><br />

### Exercise 2: CronJob with Suspend/Resume

Create a CronJob that:
- Runs every 2 minutes
- Prints the current date and hostname
- Keeps 5 successful and 3 failed job histories
- Uses concurrency policy `Forbid`

Then:
1. Let it run and create 2 jobs
2. Suspend it
3. Create a manual job from it
4. Resume it

<details>
  <summary>Solution</summary>

```
cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: CronJob
metadata:
  name: date-reporter
spec:
  schedule: "*/2 * * * *"
  successfulJobsHistoryLimit: 5
  failedJobsHistoryLimit: 3
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: reporter
            image: busybox
            command: ["sh", "-c", "date; hostname"]
          restartPolicy: Never
EOF

# Wait for 2 Jobs to be created
kubectl get jobs --watch

# Suspend
kubectl patch cronjob date-reporter -p '{"spec":{"suspend":true}}'
kubectl get cronjob date-reporter

# Manual trigger
kubectl create job manual-report --from=cronjob/date-reporter
kubectl logs job/manual-report

# Resume
kubectl patch cronjob date-reporter -p '{"spec":{"suspend":false}}'
```

</details><br />

### Exercise 3: Job Failure and Recovery

Create a Job that will fail initially, then fix it:

1. Create a Job with wrong command that will fail
2. Set backoffLimit to 2
3. Watch it fail
4. Delete it
5. Create corrected version
6. Verify success

TODO: Add detailed solution

## Advanced CKAD Topics

TODO: Add sections on:
- Job completion mode: Indexed vs NonIndexed
- Using Job with PersistentVolumeClaims
- Init containers in Jobs
- Sidecar patterns (not recommended but possible)
- Job pod failure policy (1.25+)
- CronJob timezone support (1.25+)
- Pod failure cost and backoff strategies

## Common Pitfalls

1. **Forgetting restart policy** - Default `Always` is invalid for Jobs
2. **Trying to update Job** - Jobs are immutable; must delete and recreate
3. **Wrong cron syntax** - Test expressions, remember it's UTC typically
4. **Job not cleaning up** - Jobs don't auto-delete; use TTL or manual cleanup
5. **Backoff limit reached** - Job stops retrying; check Pod events for reason
6. **CronJob timezone** - Schedules are in controller timezone, not local
7. **Concurrent Jobs** - Default `Allow` may cause resource issues
8. **Missing job-name label** - Use `-l job-name=` not generic labels
9. **Logs disappear** - Old Jobs/Pods deleted by history limit
10. **OnFailure vs Never** - OnFailure restarts container, Never creates new Pod

## Quick Reference

### Job Commands
```bash
# Create
kubectl create job NAME --image=IMAGE -- CMD

# Get status
kubectl get jobs
kubectl describe job NAME

# Logs
kubectl logs job/NAME
kubectl logs -l job-name=NAME

# Delete (deletes Pods too)
kubectl delete job NAME
```

### CronJob Commands
```bash
# Create
kubectl create cronjob NAME --image=IMAGE --schedule="CRON" -- CMD

# Get status
kubectl get cronjobs
kubectl describe cronjob NAME

# Trigger manually
kubectl create job MANUAL-NAME --from=cronjob/NAME

# Suspend/Resume
kubectl patch cronjob NAME -p '{"spec":{"suspend":true}}'
kubectl patch cronjob NAME -p '{"spec":{"suspend":false}}'

# Delete
kubectl delete cronjob NAME
```

### Common Cron Schedules
```
*/5 * * * *      Every 5 minutes
0 * * * *        Every hour
0 0 * * *        Daily at midnight
0 0 * * 0        Weekly on Sunday
0 0 1 * *        Monthly on 1st
```

## Cleanup

```
# Delete specific Job
kubectl delete job my-job

# Delete all Jobs with label
kubectl delete jobs -l app=batch

# Delete CronJob (keeps existing Jobs)
kubectl delete cronjob my-cronjob

# Delete CronJob and all its Jobs
kubectl delete cronjob my-cronjob
kubectl delete jobs -l parent-cronjob=my-cronjob  # if labeled

# Delete completed Jobs
kubectl delete jobs --field-selector status.successful=1

# Delete all Jobs in namespace
kubectl delete jobs --all
```

## Next Steps

After mastering Jobs and CronJobs for CKAD:
1. Practice [ConfigMaps](../configmaps/) - Often used with Jobs
2. Study [Secrets](../secrets/) - For sensitive Job data
3. Review [Resource Management](../productionizing/) - Limits for Jobs
4. Explore [ServiceAccounts](../rbac/) - Jobs often need specific permissions

---

## Study Checklist for CKAD

- [ ] Create Jobs imperatively with kubectl create
- [ ] Set restart policies (Never vs OnFailure)
- [ ] Configure completions and parallelism
- [ ] Set and understand backoffLimit
- [ ] Create CronJobs with various schedules
- [ ] Understand cron expression syntax
- [ ] Trigger Jobs manually from CronJobs
- [ ] Suspend and resume CronJobs
- [ ] Set concurrencyPolicy appropriately
- [ ] Configure history limits
- [ ] Debug failed Jobs using describe and logs
- [ ] Use job-name label for Pod selection
- [ ] Delete and recreate Jobs (remember immutability)
- [ ] Generate Job/CronJob YAML with --dry-run
- [ ] Understand when Jobs complete vs fail
