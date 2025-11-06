# Advanced Troubleshooting - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening: Beyond Basic Troubleshooting (1 min)

Welcome to this exploration of advanced Kubernetes troubleshooting techniques. Building on the fundamental troubleshooting skills from our previous session, today we'll dive deeper into complex scenarios, multi-component debugging, and advanced diagnostic patterns that separate competent CKAD candidates from exceptional ones.

The CKAD exam includes challenging troubleshooting questions where problems aren't immediately obvious. Multiple things might be wrong simultaneously. Error messages might be misleading. You'll need to understand how Kubernetes components interact, trace issues across layers, and identify subtle configuration problems under time pressure.

We'll cover troubleshooting multi-container Pods, debugging ReplicaSets and Deployments, identifying RBAC and admission control issues, diagnosing persistent volume problems, performance troubleshooting, and advanced networking scenarios. These skills not only help you pass the exam but make you effective at production Kubernetes operations.

---

## Multi-Container Pod Debugging (3 min)

Multi-container Pods add complexity to troubleshooting because issues can arise from container interactions, shared resources, or initialization ordering.

First, understand that multi-container Pods come in several patterns. Sidecar containers run alongside the main application, providing supporting functionality like log collection or proxying. Init containers run before application containers, performing initialization tasks. Adapter containers transform the main container's output. Ambassador containers proxy network connections.

When troubleshooting multi-container Pods, start by identifying which container is failing. kubectl get pods shows overall Pod status but doesn't indicate which container has issues. Use kubectl describe pod to see per-container status. The Containers section lists each container with its status, restart count, and whether it's ready.

For init container failures, the Pod stays in Init status. kubectl describe pod shows which init container failed and why. Use kubectl logs pod-name -c init-container-name to see init container logs. Remember that init containers run sequentially - if the second init container fails, the first one completed successfully. Fix them in order.

For sidecar container failures, the Pod might show Running status even if a sidecar is crashing. kubectl get pods shows READY as something like "1/2", meaning one of two containers is ready. kubectl describe pod shows which container is failing. Use kubectl logs pod-name -c sidecar-name to diagnose the sidecar issue.

A common multi-container problem is shared volume conflicts. Multiple containers accessing the same volume might have permission issues or file locking conflicts. Check volume mounts in the Pod spec - are multiple containers writing to the same files? Check file permissions and ownership using kubectl exec into each container.

Another issue is resource contention. In multi-container Pods, all containers share the Pod's resource allocation. If one container uses excessive CPU or memory, others might be starved. Use kubectl top pods to see total Pod resource usage. Individual container metrics require more detailed monitoring tools or looking at cgroup limits inside the containers.

Init container timing issues can be subtle. An init container might succeed during initial Pod creation but fail during restarts if external dependencies changed. For example, an init container that downloads configuration from a URL succeeds initially but fails later if that URL becomes unavailable. Check init container logs from current and previous runs.

Network traffic between containers in the same Pod uses localhost, not Service networking. If a sidecar proxy expects the main container to connect via localhost on a specific port, verify the port numbers match. Use netstat inside containers to see listening ports.

---

## Deployment and ReplicaSet Issues (3 min)

Deployments and ReplicaSets add layers of abstraction that can hide the root cause of problems. Understanding how to debug through these layers is crucial.

When a Deployment exists but no Pods appear, don't just check the Deployment - check the ReplicaSet. kubectl get replicasets shows ReplicaSets created by the Deployment. kubectl describe replicaset shows why Pods aren't being created. Common causes include invalid Pod template spec, resource quota exceeded, or admission control blocking Pod creation.

Admission control errors are particularly tricky because they occur between the ReplicaSet and Pod creation. The Deployment and ReplicaSet appear healthy, but Pods never materialize. kubectl describe replicaset shows events like "Error creating: admission webhook denied the request." You need to identify which admission controller is blocking creation and fix the Pod template to comply.

For rolling update issues, examine multiple ReplicaSets. kubectl get replicasets shows old and new ReplicaSets with their current and desired replica counts. During a stuck rollout, you might see the new ReplicaSet with some Pods ready but not reaching desired count, while the old ReplicaSet still has Pods running. kubectl describe deployment shows rollout status and conditions. Common issues include new Pods failing readiness probes, insufficient resources for scaling up, or maxUnavailable and maxSurge settings preventing progress.

Pod template hash labels help identify which ReplicaSet manages which Pods. Each ReplicaSet adds a pod-template-hash label to its Pods. kubectl get pods --show-labels reveals which ReplicaSet owns each Pod. This is useful when multiple versions are running during rollouts.

Deployment strategy issues manifest differently. With Recreate strategy, all Pods terminate before new ones start, causing temporary downtime. With RollingUpdate, both versions run concurrently, which might expose application issues. If an application can't handle multiple versions simultaneously, rolling updates cause problems.

StatefulSet-specific issues include Pods stuck in Pending because PersistentVolumeClaims can't bind, Pods not starting in order because earlier Pods aren't Ready, or Pods not getting stable DNS names because the headless Service selector is wrong.

DaemonSet issues usually involve node affinity or tolerations. If a DaemonSet Pod isn't running on a specific node, check if the node has taints that the DaemonSet doesn't tolerate. kubectl describe node shows taints. The DaemonSet Pod template needs matching tolerations.

---

## RBAC and Admission Control Debugging (3 min)

Security-related issues like RBAC denials and admission control blocks are common and sometimes confusing to diagnose.

RBAC failures typically show as "Forbidden" errors. The key is determining which ServiceAccount is being used and what permissions it has. For applications making API calls, kubectl describe pod shows which ServiceAccount the Pod uses. Default is "default" ServiceAccount, which has minimal permissions.

Use kubectl auth can-i to test permissions. kubectl auth can-i get pods --as=system:serviceaccount:namespace:serviceaccount-name tests whether that ServiceAccount can get Pods. This quickly identifies missing permissions without needing to reproduce application behavior.

Common RBAC mistakes include forgetting to create the Role or RoleBinding, incorrect API groups in Role rules (for example, using empty string for Deployments when it should be "apps"), RoleBindings pointing to non-existent Roles, or subjects in RoleBindings not matching the actual ServiceAccount name or namespace.

For cross-namespace RBAC, remember that RoleBindings can reference subjects from any namespace, but the Role must be in the namespace containing the resources being accessed. If a ServiceAccount in namespace-a needs to read ConfigMaps in namespace-b, the Role and RoleBinding must both be in namespace-b.

Admission control issues are harder to diagnose because they're not RBAC-related. The application or user has permission to create resources, but admission controllers reject them anyway.

Pod Security Standards violations show messages like "violates PodSecurity baseline: hostNetwork=true". The fix is modifying the Pod security context to comply. Check namespace labels to see which Pod Security Standard is enforced: kubectl get namespace namespace-name --show-labels.

ResourceQuota violations show as "exceeded quota" errors. kubectl describe resourcequota in the namespace shows current usage versus limits. You need to either reduce resource requests in your Pod spec or free up quota by deleting other resources.

LimitRange violations indicate Pod resources exceed per-Pod limits. kubectl describe limitrange shows maximum and minimum values. Adjust your Pod spec to fit within these bounds.

Custom admission webhooks are the trickiest because their logic is custom. Webhook rejection messages usually explain what's wrong: "must provide labels app and version" tells you exactly what to add. Read error messages carefully - they usually contain the solution.

---

## Persistent Volume Troubleshooting (3 min)

Storage issues manifest in various ways and require understanding the PV, PVC, and StorageClass relationships.

When a Pod is Pending with a message about volumes, the issue is usually PVC binding. kubectl get pvc shows PVC status. If status is Pending, the PVC hasn't bound to a PersistentVolume. kubectl describe pvc shows events explaining why binding failed.

Common PVC binding failures include no PersistentVolume matching the request (check storage size, accessModes, and storageClassName), StorageClass doesn't exist or can't provision volumes, or the requested storage size exceeds what's available.

For static provisioning without StorageClasses, you manually create PersistentVolumes. The PVC must match the PV's capacity, accessModes, and any labels. Even a small mismatch prevents binding. Check both PV and PVC specs carefully.

For dynamic provisioning with StorageClasses, kubectl get storageclass shows available classes. If the StorageClass in your PVC doesn't exist, the PVC stays Pending forever. If the StorageClass exists but provisioning fails, check the StorageClass provisioner logs - these are usually controller Pods in system namespaces like kube-system.

AccessMode mismatches cause confusion. ReadWriteOnce means one node can mount read-write, not one Pod. Multiple Pods on the same node can share ReadWriteOnce volumes. ReadWriteMany means multiple nodes can mount. If you have Pods on different nodes sharing a volume, you need ReadWriteMany, but not all storage systems support this.

Volume mount issues inside Pods manifest as permission denied errors. Check fsGroup in the Pod security context - it should match the group that needs access. Check volume permissions with kubectl exec and ls -la. Root-owned files might not be accessible to non-root containers.

Persistent data not persisting suggests volumes aren't actually persistent. Check if the Pod spec uses emptyDir instead of a PersistentVolumeClaim. emptyDir is temporary - data disappears when Pods are deleted. For actual persistence, you need PVCs.

StatefulSet PVC issues are amplified because each Pod needs its own PVC. If PVC provisioning fails for StatefulSet Pods, the entire StatefulSet stops scaling. Check that your cluster can provision enough volumes for all replicas. Check storage quotas in your cloud provider - you might have hit volume count or capacity limits.

---

## Performance and Resource Troubleshooting (2 min)

Performance issues are harder to diagnose than outright failures because applications still work, just slowly.

For slow application response, first check if the application is CPU or memory constrained. kubectl top pods shows current resource usage. If a Pod is at or near its CPU or memory limits, it's being throttled. CPU throttling slows applications without killing them. Memory limits cause OOMKilled terminations.

Check if nodes are overloaded. kubectl top nodes shows node-level resource usage. If nodes are at capacity, all Pods on those nodes might be slow. Check if node resource pressure exists: kubectl describe node shows conditions like MemoryPressure or DiskPressure.

Network latency can slow inter-service communication. Test latency from one Pod to another using time curl or ping. High latency suggests network policy rules causing overhead, network plugin performance issues, or cross-zone traffic in multi-zone clusters.

Readiness probe failures cause Pods to be removed from Services intermittently. The Pod appears healthy, but sometimes it doesn't receive traffic. kubectl describe pod shows readiness probe failures. Tune probe parameters - increase periodSeconds or successThreshold if transient failures are causing flapping.

Liveness probe issues cause unnecessary restarts. If a Pod restarts frequently with no apparent application crash, check liveness probes. kubectl describe pod shows restart count and liveness probe results. Overly aggressive probes kill healthy containers.

---

## Advanced Networking Troubleshooting (2 min)

Complex networking issues require deeper investigation than basic connectivity checks.

For DNS issues, check CoreDNS Pods first. kubectl get pods -n kube-system shows DNS Pods. If they're not Running, DNS won't work cluster-wide. kubectl logs on CoreDNS Pods shows DNS query issues.

For Service mesh environments, remember that sidecar proxies intercept traffic. kubectl describe pod shows if Envoy or similar sidecars are present. Proxy configuration errors cause mysterious connectivity failures. Check proxy logs separately from application logs.

NetworkPolicy debugging requires understanding policy logic. Policies are additive - if any policy selects a Pod, that Pod's traffic is denied by default unless explicitly allowed. kubectl get networkpolicies shows policies in the namespace. kubectl describe networkpolicy shows exact rules. Test connectivity with and without policies to isolate their effects.

Hairpin/NAT issues occur when Pods try to reach themselves through Services. This might not work in all network configurations. Test by accessing the Service from Pods that aren't part of the Service backend.

Firewall and security group issues affect NodePort and LoadBalancer Services. Test from outside the cluster whether the required ports are open. Cloud provider security groups might block traffic even though Kubernetes configuration is correct.

---

## Summary and Key Takeaways (1 min)

Let's summarize advanced troubleshooting for CKAD success.

For multi-container Pods, check each container separately, examine init containers first, verify shared volume permissions, and test localhost connectivity between containers.

For Deployment issues, check ReplicaSets for Pod creation errors, look for admission control blocks in ReplicaSet events, verify rolling update progress, and check Pod template hashes during rollouts.

For RBAC, use kubectl auth can-i to test permissions, verify API groups in Roles, check ServiceAccount names and namespaces, and test with the actual ServiceAccount context.

For storage, verify PVC binding, check StorageClass existence and provisioning, match accessModes to use case, and set fsGroup for permission access.

For performance, check resource limits and usage, verify readiness and liveness probes, test network latency, and identify resource pressure on nodes.

Practice complex scenarios with multiple simultaneous issues. Real troubleshooting often involves finding several problems, not just one.

Thank you for listening. Good luck with your CKAD preparation!
