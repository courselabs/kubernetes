# DaemonSets - CKAD Requirements

This document covers the CKAD (Certified Kubernetes Application Developer) exam requirements for DaemonSets, building on the basics covered in [README.md](README.md).

## CKAD Exam Requirements

The CKAD exam expects you to understand and implement:
- DaemonSet creation and management
- Update strategies (RollingUpdate vs OnDelete)
- Node selection with nodeSelector, node affinity, and taints/tolerations
- Init containers in DaemonSet Pods
- HostPath volumes and security considerations
- Pod affinity/anti-affinity with DaemonSets
- Differences between DaemonSets and Deployments
- Troubleshooting DaemonSet issues
- Common use cases (logging, monitoring, networking)

## DaemonSet Basics

DaemonSets ensure exactly one Pod runs on each node (or a subset of nodes). Unlike Deployments, you cannot specify the number of replicas - Kubernetes automatically creates Pods based on the number of matching nodes.

### Basic DaemonSet Spec

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  labels:
    app: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      containers:
      - name: node-exporter
        image: prom/node-exporter:latest
        ports:
        - containerPort: 9100
          name: metrics
```

Key differences from Deployments:
- No `replicas` field (automatic based on nodes)
- Update strategy defaults differ
- Scheduling behavior differs

📋 Create a DaemonSet that runs a simple web server on all nodes.

<details>
  <summary>Not sure how?</summary>

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: webserver
spec:
  selector:
    matchLabels:
      app: webserver
  template:
    metadata:
      labels:
        app: webserver
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
```

```bash
kubectl apply -f daemonset.yaml
kubectl get daemonset webserver
kubectl get pods -l app=webserver -o wide
```

</details><br/>

## Update Strategies

DaemonSets support two update strategies that control how Pods are replaced during updates.

### RollingUpdate (Default)

Pods are updated automatically when the DaemonSet spec changes:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: logging-agent
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1  # or percentage like "20%"
  selector:
    matchLabels:
      app: logging-agent
  template:
    metadata:
      labels:
        app: logging-agent
    spec:
      containers:
      - name: fluentd
        image: fluent/fluentd:v1.15
```

- **maxUnavailable**: Maximum number of Pods that can be unavailable during update
- Default: `maxUnavailable: 1` (one node at a time)
- Can be number or percentage (e.g., "20%")

### OnDelete

Pods are updated only when manually deleted:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: logging-agent
spec:
  updateStrategy:
    type: OnDelete
  selector:
    matchLabels:
      app: logging-agent
  template:
    metadata:
      labels:
        app: logging-agent
    spec:
      containers:
      - name: fluentd
        image: fluent/fluentd:v1.16  # Updated version
```

Workflow with OnDelete:
1. Update DaemonSet spec (`kubectl apply`)
2. DaemonSet is updated but Pods remain unchanged
3. Manually delete Pods one by one
4. New Pods created with updated spec

```bash
# Update DaemonSet
kubectl apply -f daemonset-updated.yaml

# Check Pods (still running old version)
kubectl get pods -l app=logging-agent

# Manually delete Pods to trigger update
kubectl delete pod -l app=logging-agent --field-selector spec.nodeName=node-1
```

> **TODO**: Add example showing side-by-side comparison of RollingUpdate vs OnDelete behavior

📋 Create a DaemonSet with OnDelete strategy, update it, and manually control the rollout.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete solution showing controlled rollout with OnDelete

</details><br/>

## Node Selection

Control which nodes run DaemonSet Pods using node selectors, affinity, or tolerations.

### Node Selectors

Simple label-based node selection:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ssd-monitor
spec:
  selector:
    matchLabels:
      app: ssd-monitor
  template:
    metadata:
      labels:
        app: ssd-monitor
    spec:
      nodeSelector:
        disktype: ssd  # Only run on nodes with this label
      containers:
      - name: monitor
        image: monitoring-agent:latest
```

```bash
# Label nodes
kubectl label nodes node-1 disktype=ssd
kubectl label nodes node-2 disktype=ssd

# Verify DaemonSet Pods
kubectl get pods -l app=ssd-monitor -o wide
```

### Node Affinity

More expressive node selection with required and preferred rules:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: gpu-monitor
spec:
  selector:
    matchLabels:
      app: gpu-monitor
  template:
    metadata:
      labels:
        app: gpu-monitor
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: gpu
                operator: In
                values:
                - nvidia
                - amd
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            preference:
              matchExpressions:
              - key: gpu-type
                operator: In
                values:
                - high-memory
```

### Tolerations for Tainted Nodes

Allow DaemonSet Pods to run on tainted nodes:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-problem-detector
spec:
  selector:
    matchLabels:
      app: node-problem-detector
  template:
    metadata:
      labels:
        app: node-problem-detector
    spec:
      tolerations:
      # Run on master nodes
      - key: node-role.kubernetes.io/master
        effect: NoSchedule
      # Run on nodes with disk pressure
      - key: node.kubernetes.io/disk-pressure
        effect: NoSchedule
      # Run on all nodes regardless of taints
      - operator: Exists
        effect: NoSchedule
      containers:
      - name: detector
        image: k8s.gcr.io/node-problem-detector:v0.8.10
```

Common tolerations for system DaemonSets:

```yaml
tolerations:
# Tolerate master/control-plane nodes
- key: node-role.kubernetes.io/master
  effect: NoSchedule
- key: node-role.kubernetes.io/control-plane
  effect: NoSchedule

# Tolerate not-ready nodes
- key: node.kubernetes.io/not-ready
  effect: NoExecute

# Tolerate unreachable nodes
- key: node.kubernetes.io/unreachable
  effect: NoExecute

# Tolerate any taint (use for critical system pods)
- operator: Exists
```

> **TODO**: Add example showing DaemonSet deployment on master nodes using tolerations

📋 Create a DaemonSet that runs on nodes labeled `monitoring=enabled` and tolerates node pressure conditions.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete solution with nodeSelector and tolerations

</details><br/>

## Init Containers in DaemonSets

Init containers run before main containers and are useful for setup tasks.

### Common Use Cases

1. **Waiting for dependencies**
2. **Downloading configuration**
3. **Setting up volumes**
4. **Security/compliance checks**

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: app-with-init
spec:
  selector:
    matchLabels:
      app: app-with-init
  template:
    metadata:
      labels:
        app: app-with-init
    spec:
      initContainers:
      # Init container 1: Download configuration
      - name: config-downloader
        image: busybox
        command: ['sh', '-c']
        args:
        - |
          echo "Downloading config..."
          wget -O /config/app.conf http://config-server/app.conf
        volumeMounts:
        - name: config
          mountPath: /config

      # Init container 2: Set permissions
      - name: permission-setter
        image: busybox
        command: ['sh', '-c']
        args:
        - |
          chown -R 1000:1000 /data
          chmod 755 /data
        volumeMounts:
        - name: data
          mountPath: /data

      containers:
      - name: app
        image: myapp:latest
        volumeMounts:
        - name: config
          mountPath: /etc/app
        - name: data
          mountPath: /var/app/data

      volumes:
      - name: config
        emptyDir: {}
      - name: data
        hostPath:
          path: /var/lib/myapp
          type: DirectoryOrCreate
```

### Init Container Patterns

**Pattern 1: Wait for Service**

```yaml
initContainers:
- name: wait-for-db
  image: busybox
  command: ['sh', '-c']
  args:
  - |
    until nslookup mysql.default.svc.cluster.local; do
      echo "Waiting for mysql service..."
      sleep 2
    done
```

**Pattern 2: Clone Git Repository**

```yaml
initContainers:
- name: git-clone
  image: alpine/git
  command: ['git', 'clone']
  args:
  - 'https://github.com/user/config.git'
  - '/config'
  volumeMounts:
  - name: config
    mountPath: /config
```

**Pattern 3: Generate Configuration**

```yaml
initContainers:
- name: config-generator
  image: busybox
  command: ['sh', '-c']
  args:
  - |
    cat > /config/app.conf <<EOF
    NODE_NAME=${NODE_NAME}
    POD_IP=${POD_IP}
    EOF
  env:
  - name: NODE_NAME
    valueFrom:
      fieldRef:
        fieldPath: spec.nodeName
  - name: POD_IP
    valueFrom:
      fieldRef:
        fieldPath: status.podIP
  volumeMounts:
  - name: config
    mountPath: /config
```

> **TODO**: Add example showing init container failure handling and retry behavior

📋 Create a DaemonSet with multiple init containers that prepare the environment before the main application starts.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete solution with chained init containers

</details><br/>

## HostPath Volumes

DaemonSets commonly use HostPath volumes to access node resources.

### Basic HostPath Usage

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-collector
spec:
  selector:
    matchLabels:
      app: log-collector
  template:
    metadata:
      labels:
        app: log-collector
    spec:
      containers:
      - name: collector
        image: fluent/fluentd
        volumeMounts:
        - name: varlog
          mountPath: /var/log
          readOnly: true
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
          type: Directory
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
          type: Directory
```

### HostPath Types

```yaml
volumes:
- name: example
  hostPath:
    path: /path/on/host
    type: Directory          # Must exist as directory
    # type: DirectoryOrCreate # Create if doesn't exist
    # type: File             # Must exist as file
    # type: FileOrCreate     # Create file if doesn't exist
    # type: Socket           # Must exist as Unix socket
    # type: CharDevice       # Must exist as character device
    # type: BlockDevice      # Must exist as block device
```

### Security Considerations

HostPath volumes have security implications:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: secure-host-access
spec:
  selector:
    matchLabels:
      app: secure-host-access
  template:
    metadata:
      labels:
        app: secure-host-access
    spec:
      # Security context for the Pod
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000

      containers:
      - name: app
        image: myapp:latest
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        volumeMounts:
        - name: host-data
          mountPath: /host-data
          readOnly: true  # Read-only when possible

      volumes:
      - name: host-data
        hostPath:
          path: /var/lib/data
          type: Directory
```

> **TODO**: Add example showing risks of unrestricted HostPath access

### Common HostPath Use Cases

1. **Log Collection**
   ```yaml
   - hostPath:
       path: /var/log
   ```

2. **Container Runtime Socket**
   ```yaml
   - hostPath:
       path: /var/run/docker.sock
       type: Socket
   ```

3. **Host Metrics**
   ```yaml
   - hostPath:
       path: /proc
   - hostPath:
       path: /sys
   ```

4. **Certificate Storage**
   ```yaml
   - hostPath:
       path: /etc/ssl/certs
       type: Directory
   ```

📋 Create a DaemonSet that collects logs from `/var/log` with appropriate security settings.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete solution with secure log collection DaemonSet

</details><br/>

## Host Networking and Ports

DaemonSets can use host networking for direct node access.

### Host Network Mode

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: network-monitor
spec:
  selector:
    matchLabels:
      app: network-monitor
  template:
    metadata:
      labels:
        app: network-monitor
    spec:
      hostNetwork: true  # Use host network namespace
      hostPID: true      # Use host PID namespace (optional)
      hostIPC: true      # Use host IPC namespace (optional)
      dnsPolicy: ClusterFirstWithHostNet  # Maintain k8s DNS

      containers:
      - name: monitor
        image: network-monitor:latest
        ports:
        - containerPort: 9100
          hostPort: 9100  # Expose on host
          protocol: TCP
```

### Host Ports

Expose container ports directly on the node:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      containers:
      - name: exporter
        image: prom/node-exporter
        ports:
        - containerPort: 9100
          hostPort: 9100  # Accessible at node-ip:9100
          name: metrics
```

> **TODO**: Add example showing difference between hostNetwork and hostPort

## Pod Affinity with DaemonSets

Schedule Pods relative to DaemonSet Pods.

### Co-locate with DaemonSet Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: debug-pod
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: nginx-ds  # DaemonSet Pod label
        topologyKey: kubernetes.io/hostname
  containers:
  - name: debug
    image: busybox
    command: ['sleep', '3600']
```

This Pod will be scheduled on the same node as the DaemonSet Pod.

### Avoid DaemonSet Pods

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchLabels:
                  app: heavy-daemonset
              topologyKey: kubernetes.io/hostname
      containers:
      - name: app
        image: myapp:latest
```

> **TODO**: Add practical example showing debug Pod scheduled with DaemonSet Pod for troubleshooting

## Resource Management

Set resource requests and limits for DaemonSet Pods.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: resource-managed
spec:
  selector:
    matchLabels:
      app: resource-managed
  template:
    metadata:
      labels:
        app: resource-managed
    spec:
      containers:
      - name: app
        image: myapp:latest
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"

      # Priority for critical system DaemonSets
      priorityClassName: system-node-critical
```

### Priority Classes for DaemonSets

System DaemonSets should use priority classes:

- `system-node-critical` - Highest priority for critical node services
- `system-cluster-critical` - High priority for critical cluster services

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: critical-system-ds
spec:
  selector:
    matchLabels:
      app: critical-system
  template:
    metadata:
      labels:
        app: critical-system
    spec:
      priorityClassName: system-node-critical
      containers:
      - name: app
        image: critical-app:latest
```

> **TODO**: Add example showing preemption behavior with priority classes

## Differences: DaemonSet vs Deployment

| Feature | DaemonSet | Deployment |
|---------|-----------|------------|
| **Replicas** | Automatic (one per node) | Manual specification |
| **Scheduling** | One per node | Distributed by scheduler |
| **Update Strategy** | RollingUpdate (remove first) | RollingUpdate (create first) |
| **Use Case** | Node-level services | Application workloads |
| **Scaling** | Add/remove nodes | Change replica count |
| **Node Selector** | Common | Less common |
| **HostPath Volumes** | Common | Rare |

### When to Use DaemonSet

- **Monitoring agents** (node-exporter, datadog-agent)
- **Log collectors** (fluentd, filebeat)
- **Network plugins** (calico, weave)
- **Storage plugins** (ceph, glusterfs)
- **Security agents** (falco, sysdig)
- **Node maintenance** (node-problem-detector)

### When to Use Deployment

- **Stateless applications**
- **APIs and web services**
- **Background workers**
- **Anything needing horizontal scaling**

> **TODO**: Add decision tree diagram for choosing between DaemonSet and Deployment

## Troubleshooting DaemonSets

### Common Issues

**Issue 1: Pods Not Scheduling**

```bash
# Check DaemonSet status
kubectl get daemonset my-ds

# Check Pod status
kubectl get pods -l app=my-ds

# Describe DaemonSet for events
kubectl describe daemonset my-ds

# Check node labels
kubectl get nodes --show-labels

# Common causes:
# - nodeSelector doesn't match any nodes
# - Insufficient node resources
# - Taints without tolerations
# - Pod security policy violations
```

**Issue 2: Update Stuck**

```bash
# Check update status
kubectl rollout status daemonset/my-ds

# Check rollout history
kubectl rollout history daemonset/my-ds

# Check Pod events
kubectl describe pod -l app=my-ds

# Common causes:
# - Invalid image
# - Misconfigured probes
# - Resource constraints
# - maxUnavailable too restrictive
```

**Issue 3: Pods on Wrong Nodes**

```bash
# Check Pod distribution
kubectl get pods -l app=my-ds -o wide

# Verify node labels
kubectl get nodes -L disktype,zone

# Check DaemonSet node selector
kubectl get daemonset my-ds -o yaml | grep -A 5 nodeSelector

# Verify tolerations
kubectl get daemonset my-ds -o yaml | grep -A 10 tolerations
```

### Debugging Commands

```bash
# Get DaemonSet details
kubectl get daemonset
kubectl get daemonset my-ds -o yaml
kubectl describe daemonset my-ds

# Check rollout status
kubectl rollout status daemonset/my-ds
kubectl rollout history daemonset/my-ds

# Rollback if needed
kubectl rollout undo daemonset/my-ds
kubectl rollout undo daemonset/my-ds --to-revision=2

# Check Pods
kubectl get pods -l app=my-ds -o wide
kubectl describe pod -l app=my-ds
kubectl logs -l app=my-ds
kubectl logs -l app=my-ds --previous  # Previous container logs

# Check node readiness
kubectl get nodes
kubectl describe node node-1

# Check Pod scheduling
kubectl get events --sort-by='.lastTimestamp'
kubectl describe node node-1 | grep -A 10 "Non-terminated Pods"

# Delete and recreate specific Pod
kubectl delete pod my-ds-abc123

# Force delete if stuck
kubectl delete pod my-ds-abc123 --grace-period=0 --force
```

> **TODO**: Add troubleshooting scenario with step-by-step resolution

## Lab Exercises

### Exercise 1: Create Multi-Node DaemonSet

Create a DaemonSet that:
- Runs nginx on all nodes
- Uses RollingUpdate strategy with maxUnavailable=1
- Includes resource requests and limits
- Exposes metrics on hostPort 9090

> **TODO**: Add complete solution with verification steps

### Exercise 2: Controlled Rollout with OnDelete

Create a DaemonSet with OnDelete strategy:
1. Deploy initial version
2. Update to new version
3. Manually control rollout one node at a time
4. Rollback if issues occur

> **TODO**: Add complete solution showing manual rollout process

### Exercise 3: Node Selection Scenarios

Create three DaemonSets:
1. Runs only on nodes labeled `env=production`
2. Runs only on nodes with SSD storage
3. Runs on all nodes including master/control-plane

> **TODO**: Add complete solution with node labeling

### Exercise 4: Init Container Setup

Create a DaemonSet with init containers that:
1. Wait for a ConfigMap to exist
2. Download configuration from a URL
3. Set up directory permissions
4. Main container uses the prepared environment

> **TODO**: Add complete solution with init container chain

### Exercise 5: HostPath Log Collection

Create a DaemonSet that:
- Collects logs from `/var/log`
- Uses read-only HostPath volumes
- Implements proper security contexts
- Exports logs to stdout

> **TODO**: Add complete solution with security best practices

### Exercise 6: Debugging with Pod Affinity

Create:
1. A DaemonSet running on all nodes
2. A debug Pod that schedules on the same node as a specific DaemonSet Pod
3. Verify both Pods can access shared HostPath

> **TODO**: Add complete solution demonstrating debugging workflow

## Common CKAD Scenarios

### Scenario 1: Deploy Monitoring Agent

> **TODO**: Add scenario deploying node-exporter DaemonSet for Prometheus

### Scenario 2: Fix Broken Update

> **TODO**: Add scenario debugging and fixing failed DaemonSet update

### Scenario 3: Migrate from Deployment to DaemonSet

> **TODO**: Add scenario converting Deployment to DaemonSet

### Scenario 4: Schedule on Tainted Nodes

> **TODO**: Add scenario with tainted nodes requiring tolerations

## Best Practices for CKAD

1. **Update Strategy**
   - Use RollingUpdate for most cases
   - Use OnDelete for critical infrastructure changes
   - Set appropriate maxUnavailable for cluster size

2. **Resource Management**
   - Always set resource requests and limits
   - Use priorityClassName for system DaemonSets
   - Monitor resource usage per node

3. **Security**
   - Minimize HostPath usage
   - Use readOnly mounts when possible
   - Apply security contexts
   - Use least-privilege service accounts

4. **Node Selection**
   - Use nodeSelector for simple cases
   - Use node affinity for complex rules
   - Add tolerations for system DaemonSets

5. **High Availability**
   - Consider maxUnavailable during updates
   - Test updates in non-production first
   - Have rollback plan ready

6. **Monitoring**
   - Expose metrics from DaemonSet Pods
   - Monitor resource usage per node
   - Alert on failed updates

## Quick Reference Commands

```bash
# Create DaemonSet
kubectl apply -f daemonset.yaml

# Get DaemonSets
kubectl get daemonset
kubectl get ds  # Short form

# Describe DaemonSet
kubectl describe daemonset my-ds

# Get DaemonSet YAML
kubectl get daemonset my-ds -o yaml

# Edit DaemonSet
kubectl edit daemonset my-ds

# Update DaemonSet from file
kubectl apply -f daemonset-updated.yaml

# Check rollout status
kubectl rollout status daemonset/my-ds

# View rollout history
kubectl rollout history daemonset/my-ds

# Rollback DaemonSet
kubectl rollout undo daemonset/my-ds
kubectl rollout undo daemonset/my-ds --to-revision=2

# Delete DaemonSet (keeps Pods)
kubectl delete daemonset my-ds --cascade=orphan

# Delete DaemonSet and Pods
kubectl delete daemonset my-ds

# Get Pods from DaemonSet
kubectl get pods -l app=my-ds -o wide

# Scale by adding node label
kubectl label node node-1 app=enabled

# Remove from node
kubectl label node node-1 app-

# Manual Pod deletion for OnDelete strategy
kubectl delete pod my-ds-abc123

# Check which nodes have DaemonSet Pods
kubectl get pods -l app=my-ds -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName

# View DaemonSet events
kubectl get events --field-selector involvedObject.kind=DaemonSet
```

## Cleanup

Remove all DaemonSets created in these exercises:

```bash
# Delete specific DaemonSet
kubectl delete daemonset my-ds

# Delete multiple DaemonSets
kubectl delete daemonset ds1 ds2 ds3

# Delete all DaemonSets with label
kubectl delete daemonset -l exercise=ckad

# Delete DaemonSet but keep Pods running
kubectl delete daemonset my-ds --cascade=orphan
```

---

## Next Steps

After mastering DaemonSets, continue with these CKAD topics:
- [Deployments](../deployments/CKAD.md) - Application deployment and scaling
- [StatefulSets](../statefulsets/CKAD.md) - Stateful application management
- [Jobs](../jobs/CKAD.md) - Batch workloads
- [Services](../services/CKAD.md) - Networking for DaemonSet Pods
