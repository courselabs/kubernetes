# Jobs - Quickfire Questions

Test your knowledge of Kubernetes Jobs and CronJobs with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the primary purpose of a Job in Kubernetes?

A) To run Pods continuously
B) To run Pods to completion and ensure a specified number succeed
C) To replace Deployments
D) To schedule recurring tasks

### 2. What happens to Pods created by a Job after they complete successfully?

A) They are automatically deleted
B) They remain in Completed state by default
C) They are restarted
D) They are converted to regular Pods

### 3. Which field in a Job spec defines how many Pods should complete successfully?

A) replicas
B) completions
C) successfulPods
D) targetCompletions

### 4. What does the `parallelism` field control in a Job?

A) The total number of Pods to create
B) The maximum number of Pods running concurrently
C) The number of successful completions required
D) The number of retries for failed Pods

### 5. What is the default restart policy for Pods in a Job?

A) Always
B) OnFailure
C) Never
D) IfNotPresent

### 6. How do you create a Job that runs on a schedule?

A) Use a Job with a schedule field
B) Use a CronJob
C) Use a Deployment with a schedule annotation
D) Jobs cannot run on schedules

### 7. What does `spec.backoffLimit` control in a Job?

A) The time to wait before starting the Job
B) The number of retries before considering the Job failed
C) The maximum runtime for each Pod
D) The delay between Pod creations

### 8. In a CronJob, what does the schedule `0 2 * * *` mean?

A) Every 2 minutes
B) At 2:00 AM every day
C) Every hour on the 2nd minute
D) Every 2 hours

### 9. What is the purpose of `activeDeadlineSeconds` in a Job spec?

A) Time to wait before starting the Job
B) Maximum duration the Job can run before being terminated
C) Time to keep completed Pods
D) Delay between retries

### 10. Which field in a CronJob spec controls how many completed Jobs to retain?

A) historyLimit
B) successfulJobsHistoryLimit
C) jobHistoryLimit
D) retentionPolicy

---

## Answers

1. **B** - Jobs are designed to run Pods to completion, ensuring a specified number of Pods complete successfully. Unlike Deployments, they don't restart completed Pods.

2. **B** - By default, completed Pods remain in Completed state and are not automatically deleted. This allows you to check logs. You can configure `ttlSecondsAfterFinished` for automatic cleanup.

3. **B** - The `completions` field specifies how many Pods must complete successfully for the Job to be considered complete. Default is 1.

4. **B** - The `parallelism` field controls the maximum number of Pods that can run concurrently for the Job. Default is 1.

5. **B** - Jobs default to `OnFailure` restart policy, which restarts failed Pods. You can also use `Never`, but `Always` is not allowed for Jobs.

6. **B** - CronJobs create Jobs on a schedule using cron syntax. They're the standard way to run scheduled tasks in Kubernetes.

7. **B** - `backoffLimit` specifies the number of retries before considering a Job failed. Default is 6. After reaching this limit, the Job is marked as failed.

8. **B** - The cron schedule `0 2 * * *` means: minute 0, hour 2, any day of month, any month, any day of week = 2:00 AM daily.

9. **B** - `activeDeadlineSeconds` sets the maximum duration (in seconds) a Job can run. If exceeded, the Job is terminated and marked as failed.

10. **B** - `successfulJobsHistoryLimit` controls how many completed successful Jobs to retain. `failedJobsHistoryLimit` controls failed Jobs. Defaults are 3 and 1 respectively.

---

## Study Resources

- [Lab README](README.md) - Core Job and CronJob concepts
- [CKAD Requirements](CKAD.md) - CKAD-specific Job topics
- [Official Jobs Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
- [Official CronJobs Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
