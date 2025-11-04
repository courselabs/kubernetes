# CKAD Practice: PersistentVolumes and Storage

This guide covers CKAD exam requirements for working with persistent volumes and storage. Complete the [basic lab](README.md) first to understand the fundamentals.

## CKAD Exam Relevance

**Exam Domain**: Application Environment, Configuration and Security (25%)
- Understand and define resource requirements and limits
- Understand ConfigMaps and Secrets
- **Create and consume PersistentVolumeClaims for storage**

## Quick Reference

### Common kubectl Commands

```bash
# List storage resources
kubectl get pv                           # PersistentVolumes (cluster-wide)
kubectl get pvc                          # PersistentVolumeClaims (namespaced)
kubectl get sc                           # StorageClasses

# Describe for troubleshooting
kubectl describe pvc <name>
kubectl describe pv <name>

# Check Pod volume mounts
kubectl describe pod <name> | grep -A 5 Volumes
kubectl exec <pod> -- df -h              # Check mounted filesystems

# Delete PVC (may delete PV depending on reclaim policy)
kubectl delete pvc <name>
```

### Access Modes Quick Reference

| Mode | Abbreviation | Description | Use Case |
|------|--------------|-------------|----------|
| ReadWriteOnce | RWO | Read-write by single node | Most common, default for block storage |
| ReadOnlyMany | ROX | Read-only by multiple nodes | Shared configuration data |
| ReadWriteMany | RWX | Read-write by multiple nodes | Shared application data (requires NFS/similar) |
| ReadWriteOncePod | RWOP | Read-write by single Pod | Kubernetes 1.22+ for strict single-Pod access |

## CKAD Scenarios

### Scenario 1: Create a PVC and Mount in a Pod

**Time Target**: 3-4 minutes

Create a PVC requesting 500Mi of storage, then deploy a Pod that uses it.

```bash
# Create PVC
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
EOF

# Create Pod using the PVC
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: app-storage
EOF

# Verify
kubectl get pvc app-storage
kubectl exec app-pod -- df -h /data
```

**Verification**:
- PVC should be in `Bound` status
- Pod should be in `Running` status
- `/data` should show mounted filesystem with ~500Mi capacity

### Scenario 2: Shared Volume Between Containers

**Time Target**: 4-5 minutes

<!-- TODO: Add example showing logs aggregator sidecar pattern -->

Create a multi-container Pod where one container writes data and another reads it using a shared volume.

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: shared-volume-pod
spec:
  volumes:
  - name: shared-data
    emptyDir: {}
  containers:
  - name: writer
    image: busybox
    command: ["/bin/sh", "-c"]
    args:
      - while true; do
          echo "$(date) - Log entry" >> /data/app.log;
          sleep 5;
        done
    volumeMounts:
    - name: shared-data
      mountPath: /data
  - name: reader
    image: busybox
    command: ["/bin/sh", "-c"]
    args:
      - tail -f /data/app.log
    volumeMounts:
    - name: shared-data
      mountPath: /data
EOF

# Verify both containers can access the shared volume
kubectl logs shared-volume-pod -c writer
kubectl logs shared-volume-pod -c reader
```

**Key Learning**: EmptyDir volumes are shared between all containers in a Pod.

### Scenario 3: Use Specific StorageClass

**Time Target**: 3-4 minutes

<!-- TODO: Add examples for different cloud providers (AWS EBS, Azure Disk, GCP PD) -->

Create a PVC using a specific StorageClass (useful when cluster has multiple storage types).

```bash
# First, check available StorageClasses
kubectl get storageclass

# Create PVC with specific StorageClass
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: fast-storage
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: <your-storage-class-name>  # Replace with actual name
  resources:
    requests:
      storage: 1Gi
EOF

kubectl get pvc fast-storage
```

**Exam Tip**: If no `storageClassName` is specified, the default StorageClass is used.

### Scenario 4: Troubleshoot Pending PVC

**Time Target**: 3-4 minutes

Common reasons why a PVC stays in `Pending` state:

```bash
# Create a PVC that might have issues
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: debug-pvc
spec:
  accessModes:
    - ReadWriteMany  # May not be supported by default StorageClass
  resources:
    requests:
      storage: 100Gi  # May exceed available storage
EOF

# Troubleshooting steps
kubectl get pvc debug-pvc
kubectl describe pvc debug-pvc  # Check Events section

# Common issues and solutions:
# 1. Unsupported access mode → Change to ReadWriteOnce
# 2. No StorageClass available → Specify valid storageClassName
# 3. Insufficient storage → Reduce storage request
# 4. No nodes with required labels (for local PV) → Add labels to nodes
```

**Troubleshooting Checklist**:
1. Check PVC status: `kubectl get pvc`
2. View events: `kubectl describe pvc <name>`
3. Check available StorageClasses: `kubectl get sc`
4. Verify StorageClass provisioner is running
5. Check if cluster has capacity for requested size

### Scenario 5: Pod with Multiple Volumes

**Time Target**: 5-6 minutes

Create a Pod with multiple volume types (common in real-world scenarios).

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: db-storage
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  config.json: |
    {
      "database": "/data/db",
      "cache": "/cache",
      "logs": "/logs"
    }
---
apiVersion: v1
kind: Pod
metadata:
  name: multi-volume-app
spec:
  containers:
  - name: app
    image: busybox
    command: ["/bin/sh", "-c", "cat /config/config.json && sleep 3600"]
    volumeMounts:
    - name: persistent-data
      mountPath: /data
    - name: cache-data
      mountPath: /cache
    - name: logs
      mountPath: /logs
    - name: config
      mountPath: /config
  volumes:
  - name: persistent-data
    persistentVolumeClaim:
      claimName: db-storage
  - name: cache-data
    emptyDir: {}
  - name: logs
    emptyDir: {}
  - name: config
    configMap:
      name: app-config
EOF

# Verify all volumes are mounted
kubectl exec multi-volume-app -- df -h
kubectl exec multi-volume-app -- cat /config/config.json
```

**Key Learning**: Different volume types serve different purposes:
- PVC for persistent data
- EmptyDir for temporary/cache data
- ConfigMap for configuration files

### Scenario 6: Data Persistence After Pod Deletion

**Time Target**: 4-5 minutes

Demonstrate that PVC data persists even when Pods are deleted.

```bash
# Create PVC and Pod
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: persistent-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi
---
apiVersion: v1
kind: Pod
metadata:
  name: writer-pod
spec:
  containers:
  - name: writer
    image: busybox
    command: ["/bin/sh", "-c"]
    args:
      - echo "Important data: $(date)" > /data/important.txt &&
        cat /data/important.txt &&
        sleep 3600
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: persistent-data
EOF

# Wait for Pod to write data
sleep 5
kubectl logs writer-pod

# Delete the Pod
kubectl delete pod writer-pod

# Create new Pod with same PVC
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: reader-pod
spec:
  containers:
  - name: reader
    image: busybox
    command: ["/bin/sh", "-c"]
    args:
      - cat /data/important.txt && sleep 3600
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: persistent-data
EOF

# Verify data persisted
kubectl logs reader-pod
```

**Key Learning**: PVC lifecycle is independent of Pod lifecycle.

## Advanced CKAD Topics

### Volume SubPaths

Use `subPath` to mount specific files or subdirectories from a volume:

<!-- TODO: Add more subPath examples with real-world use cases (e.g., sharing PVC between multiple deployments) -->

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: subpath-example
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: config-volume
      mountPath: /etc/nginx/nginx.conf
      subPath: nginx.conf  # Mount only this file, not entire ConfigMap
  volumes:
  - name: config-volume
    configMap:
      name: nginx-config
```

**Use Case**: When you need to mount a single file without hiding other files in the target directory.

### Volume Expansion

<!-- TODO: Add step-by-step example of expanding a PVC (requires StorageClass with allowVolumeExpansion: true) -->
<!-- TODO: Document which volume types support expansion and which don't -->

Some StorageClasses support volume expansion:

```bash
# Check if StorageClass allows expansion
kubectl get sc -o yaml | grep allowVolumeExpansion

# Expand PVC (if supported)
kubectl patch pvc <pvc-name> -p '{"spec":{"resources":{"requests":{"storage":"2Gi"}}}}'

# Monitor expansion progress
kubectl describe pvc <pvc-name>
```

**Exam Note**: Not all storage types support expansion. Check the StorageClass configuration.

### ReadWriteMany Volumes

<!-- TODO: Add practical exercise deploying NFS provisioner or using hostPath with RWX -->
<!-- TODO: Add troubleshooting section for RWX issues in different cluster types -->

For scenarios requiring shared storage across multiple Pods:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: shared-storage
spec:
  accessModes:
    - ReadWriteMany  # Multiple nodes can mount read-write
  resources:
    requests:
      storage: 5Gi
  # storageClassName: nfs-storage  # Typically requires NFS or similar
```

**Important**:
- Default StorageClasses (like AWS EBS, Azure Disk) typically only support `ReadWriteOnce`
- `ReadWriteMany` requires network storage (NFS, CephFS, etc.)
- Check your cluster's available StorageClasses

## CKAD Practice Exercises

### Exercise 1: Quick PVC Creation

**Objective**: Create resources quickly (exam time pressure simulation)

1. Create a PVC named `webapp-storage` requesting 250Mi with ReadWriteOnce access
2. Create a Deployment named `webapp` with 2 replicas using `nginx:alpine` image
3. Mount the PVC to `/usr/share/nginx/html` in all Pods
4. Verify all Pods are running and have the volume mounted

**Time Limit**: 5 minutes

<details>
<summary>Solution</summary>

```bash
# Create PVC
kubectl create -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: webapp-storage
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 250Mi
EOF

# Create Deployment
kubectl create deployment webapp --image=nginx:alpine --replicas=2 --dry-run=client -o yaml | \
kubectl patch -f - --dry-run=client -o yaml --type=json -p='[
  {
    "op": "add",
    "path": "/spec/template/spec/volumes",
    "value": [{"name": "storage", "persistentVolumeClaim": {"claimName": "webapp-storage"}}]
  },
  {
    "op": "add",
    "path": "/spec/template/spec/containers/0/volumeMounts",
    "value": [{"name": "storage", "mountPath": "/usr/share/nginx/html"}]
  }
]' | kubectl apply -f -

# Verify
kubectl get pvc webapp-storage
kubectl get pods -l app=webapp
kubectl exec -it deployment/webapp -- df -h /usr/share/nginx/html
```

</details>

### Exercise 2: Debug Storage Issues

**Objective**: Troubleshoot common PVC problems

You're given a Pod that won't start due to storage issues. Fix it.

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: broken-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: missing-pvc  # This PVC doesn't exist!
EOF
```

**Tasks**:
1. Identify why the Pod is failing
2. Create the missing PVC
3. Verify the Pod starts successfully

**Time Limit**: 3 minutes

<details>
<summary>Solution</summary>

```bash
# Check Pod status
kubectl get pod broken-pod
kubectl describe pod broken-pod  # Shows: PVC "missing-pvc" not found

# Create the missing PVC
kubectl create -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: missing-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi
EOF

# Delete and recreate Pod (or wait for kubelet to retry)
kubectl delete pod broken-pod
kubectl apply -f <original-pod-spec>

# Verify
kubectl get pod broken-pod
kubectl get pvc missing-pvc
```

</details>

### Exercise 3: Multi-Container Shared Storage

**Objective**: Implement sidecar pattern with shared volumes

<!-- TODO: Expand this exercise with more realistic scenarios (e.g., log rotation, metric collection) -->

Create a Pod with:
1. Main container: `nginx:alpine` serving files from `/usr/share/nginx/html`
2. Sidecar container: `busybox` writing the current date to `/html/index.html` every 5 seconds
3. Both containers share an EmptyDir volume

Verify you can curl the nginx service and see updated timestamps.

**Time Limit**: 6 minutes

<details>
<summary>Solution</summary>

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: shared-web-pod
  labels:
    app: shared-web
spec:
  volumes:
  - name: html
    emptyDir: {}
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html
  - name: writer
    image: busybox
    command: ["/bin/sh", "-c"]
    args:
      - while true; do
          echo "<h1>Last updated: $(date)</h1>" > /html/index.html;
          sleep 5;
        done
    volumeMounts:
    - name: html
      mountPath: /html
---
apiVersion: v1
kind: Service
metadata:
  name: shared-web
spec:
  selector:
    app: shared-web
  ports:
  - port: 80
    targetPort: 80
  type: NodePort
EOF

# Wait for Pod to be ready
kubectl wait --for=condition=Ready pod/shared-web-pod

# Test (wait a few seconds between calls to see timestamp change)
kubectl exec shared-web-pod -c nginx -- cat /usr/share/nginx/html/index.html
sleep 6
kubectl exec shared-web-pod -c nginx -- cat /usr/share/nginx/html/index.html
```

</details>

### Exercise 4: StatefulSet with PVC Templates

<!-- TODO: Complete this exercise with full StatefulSet example -->
<!-- TODO: Add steps to demonstrate PVC retention after StatefulSet scaling down and up -->

**Objective**: Understand how StatefulSets manage persistent storage

**Time Limit**: 8 minutes

This is an advanced topic that may appear in CKAD scenarios involving databases or stateful applications.

```bash
# TODO: Add complete StatefulSet example
# Should demonstrate:
# - volumeClaimTemplates
# - Each Pod gets its own PVC
# - PVCs persist even when StatefulSet is scaled down
```

## Common Exam Pitfalls

### 1. PVC in Wrong Namespace
```bash
# PVCs are namespaced! Ensure you're in the correct namespace
kubectl config set-context --current --namespace=<target-namespace>
```

### 2. Access Mode Incompatibility
```bash
# ReadWriteMany not supported by most default StorageClasses
# Use ReadWriteOnce for most scenarios
```

### 3. Forgetting to Wait for PVC Binding
```bash
# Always verify PVC is Bound before using it
kubectl get pvc <name>
kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/<name> --timeout=60s
```

### 4. Volume Name Mismatch
```yaml
# Ensure volume name matches between spec.volumes and spec.containers.volumeMounts
volumes:
- name: my-data  # Name here
  persistentVolumeClaim:
    claimName: my-pvc
containers:
- volumeMounts:
  - name: my-data  # Must match name above
    mountPath: /data
```

### 5. Case Sensitivity in Access Modes
```yaml
# Correct
accessModes:
  - ReadWriteOnce

# Wrong (will fail validation)
accessModes:
  - readwriteonce
```

## Exam Tips

1. **Use kubectl create for speed**: `kubectl create` can be faster than writing YAML from scratch for simple resources
2. **Learn the dry-run pattern**: `kubectl create ... --dry-run=client -o yaml > file.yaml` for templates
3. **Practice without autocomplete**: The exam environment may have limited autocomplete
4. **Bookmark kubectl docs**: Know how to quickly find examples in https://kubernetes.io/docs/
5. **Check resources immediately**: After creating PVC, always check status before moving on
6. **Time management**: Don't spend too long troubleshooting one resource; move on and come back if time permits

## Quick Command Reference Card

```bash
# Create PVC imperatively (no direct kubectl create pvc command, use YAML)
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mypvc
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
EOF

# List all storage resources
kubectl get pv,pvc,sc

# Describe for troubleshooting
kubectl describe pvc <name>

# Check Pod volume mounts
kubectl describe pod <name> | grep -A 10 Volumes
kubectl exec <pod> -- mount | grep <mount-path>

# Delete PVC (be careful - may delete data!)
kubectl delete pvc <name>

# Force delete stuck PVC
kubectl patch pvc <name> -p '{"metadata":{"finalizers":null}}'
kubectl delete pvc <name> --force --grace-period=0
```

## Additional Resources

- [Official Kubernetes PV/PVC Documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
- [Storage Class Documentation](https://kubernetes.io/docs/concepts/storage/storage-classes/)
- [Volume Types Reference](https://kubernetes.io/docs/concepts/storage/volumes/)
- [CKAD Exam Curriculum](https://github.com/cncf/curriculum)

## Next Steps

After completing these exercises:
1. Practice creating PVCs and Pods under time pressure
2. Experiment with different StorageClasses in your cluster
3. Learn about StatefulSets and volume claim templates
4. Study [StatefulSets lab](../statefulsets/) for advanced persistent storage patterns

---

> Return to [basic PersistentVolumes lab](README.md) | [Course index](../../README.md)
