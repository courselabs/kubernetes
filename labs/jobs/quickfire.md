# Jobs - Quickfire Questions

Test your knowledge of Kubernetes Jobs and CronJobs with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary purpose of a Job in Kubernetes?

A) To schedule recurring tasks
B) To run Pods continuously
C) To replace Deployments
D) To run Pods to completion and ensure a specified number succeed

### 2. What happens to Pods created by a Job after they complete successfully?

A) They are automatically deleted
B) They are converted to regular Pods
C) They remain in Completed state by default
D) They are restarted

### 3. Which field in a Job spec defines how many Pods should complete successfully?

A) successfulPods
B) replicas
C) completions
D) targetCompletions

### 4. What does the `parallelism` field control in a Job?

A) The maximum number of Pods running concurrently
B) The total number of Pods to create
C) The number of retries for failed Pods
D) The number of successful completions required

### 5. What is the default restart policy for Pods in a Job?

A) Always
B) IfNotPresent
C) OnFailure
D) Never

### 6. How do you create a Job that runs on a schedule?

A) Use a Deployment with a schedule annotation
B) Use a CronJob
C) Jobs cannot run on schedules
D) Use a Job with a schedule field

### 7. What does `spec.backoffLimit` control in a Job?

A) The delay between Pod creations
B) The number of retries before considering the Job failed
C) The maximum runtime for each Pod
D) The time to wait before starting the Job

### 8. In a CronJob, what does the schedule `0 2 * * *` mean?

A) At 2:00 AM every day
B) Every hour on the 2nd minute
C) Every 2 hours
D) Every 2 minutes

### 9. What is the purpose of `activeDeadlineSeconds` in a Job spec?

A) Maximum duration the Job can run before being terminated
B) Delay between retries
C) Time to keep completed Pods
D) Time to wait before starting the Job

### 10. Which field in a CronJob spec controls how many completed Jobs to retain?

A) jobHistoryLimit
B) historyLimit
C) successfulJobsHistoryLimit
D) retentionPolicy

---

## Answers

1. **D** - Jobs are designed to run Pods to completion, ensuring a specified number of Pods complete successfully. Unlike Deployments, they don't restart completed Pods.

2. **C** - By default, completed Pods remain in Completed state and are not automatically deleted. This allows you to check logs. You can configure `ttlSecondsAfterFinished` for automatic cleanup.

3. **C** - The `completions` field specifies how many Pods must complete successfully for the Job to be considered complete. Default is 1.

4. **A** - The `parallelism` field controls the maximum number of Pods that can run concurrently for the Job. Default is 1.

5. **C** - Jobs default to `OnFailure` restart policy, which restarts failed Pods. You can also use `Never`, but `Always` is not allowed for Jobs.

6. **B** - CronJobs create Jobs on a schedule using cron syntax. They're the standard way to run scheduled tasks in Kubernetes.

7. **B** - `backoffLimit` specifies the number of retries before considering a Job failed. Default is 6. After reaching this limit, the Job is marked as failed.

8. **A** - The cron schedule `0 2 * * *` means: minute 0, hour 2, any day of month, any month, any day of week = 2:00 AM daily.

9. **A** - `activeDeadlineSeconds` sets the maximum duration (in seconds) a Job can run. If exceeded, the Job is terminated and marked as failed.

10. **C** - `successfulJobsHistoryLimit` controls how many completed successful Jobs to retain. `failedJobsHistoryLimit` controls failed Jobs. Defaults are 3 and 1 respectively.

---

## Study Resources

- [Lab README](README.md) - Core Job and CronJob concepts
- [CKAD Requirements](CKAD.md) - CKAD-specific Job topics
- [Official Jobs Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
- [Official CronJobs Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
