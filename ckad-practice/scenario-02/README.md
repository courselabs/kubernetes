# Scenario 2: Multi-Container Application

**Difficulty**: Intermediate
**Time Limit**: 15 minutes
**CKAD Domains**: Application Design & Build (20%), Application Environment, Configuration & Security (25%)

## Scenario

You need to deploy a logging application with a sidecar container that processes logs. The application uses sensitive database credentials that must be stored securely.

## Requirements

Complete the following tasks:

1. **Create a namespace** called `logging-app`

2. **Create a Secret** called `db-credentials` in the `logging-app` namespace with:
   - `DB_USERNAME=admin`
   - `DB_PASSWORD=s3cr3tP@ssw0rd`
   - `DB_HOST=postgres.default.svc.cluster.local`

3. **Create a Pod** called `app-with-logging` in the `logging-app` namespace with:

   **Main container (app):**
   - Name: `app`
   - Image: `busybox:1.36`
   - Command: `sh -c "while true; do echo $(date) - Application log message >> /var/log/app.log; sleep 5; done"`
   - Mount a volume at `/var/log` (emptyDir)
   - Environment variables from the `db-credentials` Secret

   **Sidecar container (log-processor):**
   - Name: `log-processor`
   - Image: `busybox:1.36`
   - Command: `sh -c "tail -f /var/log/app.log | grep 'Application'"`
   - Mount the same volume at `/var/log` (emptyDir)

   **Volume:**
   - Name: `log-volume`
   - Type: `emptyDir`

   **Pod labels:** `app=logging`, `type=multi-container`

4. **Verify** that both containers are running and the log-processor is reading logs from the app container

## Verification

Run these commands to verify your solution:

```bash
# Check namespace
kubectl get namespace logging-app

# Check Secret
kubectl get secret db-credentials -n logging-app
kubectl get secret db-credentials -n logging-app -o jsonpath='{.data.DB_USERNAME}' | base64 -d

# Check Pod
kubectl get pod app-with-logging -n logging-app
kubectl describe pod app-with-logging -n logging-app

# Verify both containers are running
kubectl get pod app-with-logging -n logging-app -o jsonpath='{.status.containerStatuses[*].name}'

# Check app container logs
kubectl logs app-with-logging -n logging-app -c app --tail=10

# Check log-processor sidecar logs
kubectl logs app-with-logging -n logging-app -c log-processor --tail=10

# Verify environment variables in app container
kubectl exec app-with-logging -n logging-app -c app -- env | grep DB_
```

## Success Criteria

- [ ] Namespace `logging-app` exists
- [ ] Secret contains all three credentials
- [ ] Pod has 2/2 containers Running
- [ ] App container is writing logs to shared volume
- [ ] Log-processor container is reading and filtering logs
- [ ] Environment variables from Secret are available in app container
- [ ] Both containers can access the shared volume

## Clean Up

```bash
kubectl delete namespace logging-app
```

## Hints

<details>
  <summary>Click to see hints</summary>

### Hint 1: Multi-Container Pods
Define multiple containers in the `spec.containers` array. Each container is a separate entry with its own name, image, and command.

### Hint 2: Shared Volumes
Define the volume in `spec.volumes` and mount it in each container using `volumeMounts` with the same volume name.

### Hint 3: Secrets as Environment Variables
Use `envFrom` with `secretRef` to load all Secret keys as environment variables.

### Hint 4: Testing Logs
Use `-c` flag with kubectl logs to specify which container's logs to view.

</details>

## Time Allocation Suggestion

- Namespace and Secret: 2 minutes
- Pod YAML structure: 6 minutes
- Volume and mount configuration: 3 minutes
- Verification: 4 minutes

---

[See Solution](solution.md)
