# StatefulSets - Practical Exercises
## Narration Script for Hands-On Demo

**Duration: 18-22 minutes**
**Target Audience: CKAD Candidates**
**Delivery Style: Step-by-step demonstration with explanations**

---

## Introduction (60 seconds)

Welcome to the hands-on StatefulSets lab session. In this demo, we'll work through the exercises from the StatefulSets lab, deploying real applications and exploring StatefulSet behavior in a live Kubernetes cluster.

**What We'll Cover**:
1. Deploy a simple StatefulSet with stable network identities
2. Understand Pod communication patterns and DNS resolution
3. Deploy a replicated PostgreSQL database with persistent storage
4. Work through the lab challenge

**Prerequisites Check**:
Before we begin, ensure you have:
- A working Kubernetes cluster (Docker Desktop, minikube, or similar)
- kubectl configured and connected
- The lab files from `labs/statefulsets/`

Let's get started.

---

## Section 1: Deploy a Simple StatefulSet (4-5 minutes)

### 1.1 Introduction to the Simple Example (45 seconds)

We'll start with a StatefulSet running Nginx. While Nginx doesn't truly need a StatefulSet, this example demonstrates the StatefulSet pattern without complex database logic.

This deployment includes:
- A **headless Service** for stable network identities
- **External Services** (LoadBalancer and NodePort) for external access
- A **ConfigMap** with shell scripts for initialization
- A **StatefulSet** with init containers modeling a stable startup workflow

The pattern simulates a primary-secondary architecture where:
- Pod-0 acts as the primary
- Pods 1 and 2 act as secondaries and wait for the primary to be ready

### 1.2 Examining the Specs (90 seconds)

Let's look at the key files:

**First, the headless Service** (`labs/statefulsets/specs/simple/services.yaml`):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: simple-statefulset
spec:
  clusterIP: None  # This makes it headless
  selector:
    app: simple-statefulset
  ports:
  - port: 8010
    targetPort: 80
```

Note the `clusterIP: None` - this is mandatory for StatefulSets.

**The StatefulSet spec** (`labs/statefulsets/specs/simple/statefulset.yaml`) includes:
- `serviceName: simple-statefulset` - links to the headless Service
- `replicas: 3` - we'll create three Pods
- Init containers that implement the startup logic
- The main Nginx container

**The ConfigMap** contains two shell scripts:
1. `wait-service.sh` - ensures secondaries wait for the primary
2. `write-message.sh` - creates HTML content based on Pod identity

### 1.3 Deploying the StatefulSet (90 seconds)

Now let's deploy everything:

```bash
kubectl apply -f labs/statefulsets/specs/simple
```

Immediately watch the Pod creation:

```bash
kubectl get po -l app=simple-statefulset --watch
```

**What to observe**:
- Pod-0 appears first and goes through Init stages
- Pod-0 must reach Running status before Pod-1 is created
- This sequential pattern continues for Pod-2
- Unlike Deployments, Pod names are predictable: `simple-statefulset-0`, `simple-statefulset-1`, `simple-statefulset-2`

This sequential creation is the key behavior of StatefulSets. Press Ctrl+C once all three Pods are Running.

### 1.4 Examining the Startup Workflow (90 seconds)

Let's verify the init container logic worked correctly. Check the logs from the `wait-service` init container:

**For Pod-0 (the primary)**:
```bash
kubectl logs simple-statefulset-0 -c wait-service
```

You should see output indicating Pod-0 recognizes itself as the primary because its hostname ends in `-0`.

**For Pod-1 (a secondary)**:
```bash
kubectl logs simple-statefulset-1 -c wait-service
```

This log should show Pod-1 waiting for the DNS entry of `simple-statefulset-0.simple-statefulset` to exist before proceeding. Once the primary was ready, the secondary continued its initialization.

**Key Insight**: This demonstrates how init containers can use the Pod's hostname and DNS to implement conditional startup logic, a common pattern in StatefulSet deployments.

---

## Section 2: Communication with StatefulSet Pods (4-5 minutes)

### 2.1 Verifying Service Endpoints (60 seconds)

StatefulSets register all their Pod IPs with the associated Service. Let's verify:

```bash
kubectl get endpoints simple-statefulset
```

You should see three IP addresses listed - one for each Pod. The headless Service knows about all Pods, even though it doesn't provide load-balancing at the network level.

Compare this with the Pod IPs:

```bash
kubectl get pods -l app=simple-statefulset -o wide
```

The IPs should match the endpoint addresses.

### 2.2 DNS Resolution Testing (2 minutes)

Now let's explore the unique DNS capabilities of StatefulSets. First, deploy a sleep Pod for testing:

```bash
kubectl apply -f labs/statefulsets/specs/sleep-pod.yaml
```

**Test 1: Service-wide DNS**

Perform a DNS lookup for the Service name:

```bash
kubectl exec sleep -- nslookup simple-statefulset
```

This returns all three Pod IP addresses. The Service name resolves to all Pods.

**Test 2: Individual Pod DNS**

Now lookup a specific Pod using the full DNS name:

```bash
kubectl exec sleep -- nslookup simple-statefulset-2.simple-statefulset.default.svc.cluster.local
```

This returns only the IP address for Pod-2.

**DNS Pattern Breakdown**:
- Format: `<pod-name>.<service-name>.<namespace>.svc.cluster.local`
- Example: `simple-statefulset-2.simple-statefulset.default.svc.cluster.local`

**Why This Matters**: Applications can connect to specific Pod instances by name. For databases, this means secondaries can reliably connect to the primary at `postgres-0.postgres.default.svc.cluster.local`.

### 2.3 External Access and Load Balancing (90 seconds)

This lab includes LoadBalancer and NodePort Services for external access. Let's test the application:

**Access via LoadBalancer** (if your cluster supports it):
```bash
curl http://localhost:8010
```

**Or via NodePort**:
```bash
curl http://localhost:30010
```

Refresh multiple times (or use Ctrl+Refresh in a browser) and observe responses from different Pods. The external Services provide traditional load-balancing behavior.

**Updating Service Selectors**:

StatefulSets add the Pod name as a label. We can pin the external Service to a specific Pod:

```bash
kubectl apply -f labs/statefulsets/specs/simple/update
```

This update modifies the Service selector to target only Pod-1. Now test again:

```bash
curl http://localhost:8010
```

All responses now come from the same Pod. This demonstrates how you can selectively route traffic to specific StatefulSet replicas (useful for read-only secondaries in database clusters).

---

## Section 3: Deploy a Replicated SQL Database (6-7 minutes)

### 3.1 Introduction to the Postgres Example (60 seconds)

Now we'll deploy a real stateful application: PostgreSQL with primary-replica replication. This example truly requires StatefulSet features:
- Pod-0 will be the primary database
- Pod-1 will be a replica that streams changes from the primary
- Each Pod needs its own PersistentVolumeClaim for database storage

The complexity of setting up PostgreSQL replication is handled by a custom Docker image with initialization scripts (available in the sixeyed/widgetario repository if you're interested in the details).

### 3.2 Understanding volumeClaimTemplates (90 seconds)

This is where StatefulSets shine. Let's examine the volumeClaimTemplates section in `labs/statefulsets/specs/products-db/statefulset-with-pvc.yaml`:

```yaml
volumeClaimTemplates:
- metadata:
    name: data
  spec:
    accessModes: [ "ReadWriteOnce" ]
    resources:
      requests:
        storage: 1Gi
```

**How This Works**:
- When Pod-0 is created, Kubernetes automatically creates a PVC named `data-products-db-0`
- When Pod-1 is created, Kubernetes creates `data-products-db-1`
- Each PVC is bound to a PersistentVolume from the default StorageClass
- If a Pod is deleted and recreated, it reattaches to its same PVC

**Key Benefit**: You don't need to manually create PVCs for each replica. The StatefulSet controller handles this automatically.

### 3.3 Deploying the Database (2 minutes)

Let's deploy the complete database stack:

```bash
kubectl apply -f labs/statefulsets/specs/products-db
```

Immediately watch the PVC creation:

```bash
kubectl get pvc -l app=products-db --watch
```

**Observe the sequence**:
1. `data-products-db-0` PVC is created and becomes Bound
2. Pod-0 starts and uses this PVC
3. Once Pod-0 is Running, `data-products-db-1` PVC is created
4. Pod-1 starts and uses the second PVC

This demonstrates the tight coupling between StatefulSet Pod creation and PVC provisioning.

### 3.4 Verifying Database Replication (2 minutes)

Let's confirm the primary and replica roles were configured correctly.

**Check the primary (Pod-0)**:

```bash
kubectl logs products-db-0
```

Look for log messages indicating:
- PostgreSQL initializing as a primary
- Database starting up
- "Database system is ready to accept connections"

**Check the replica (Pod-1)**:

```bash
kubectl logs products-db-1
```

Look for log messages indicating:
- Pod starting in replica mode
- Connecting to the primary for replication
- Starting replication stream
- "Database system is ready to accept connections"

**Verify both are running**:

```bash
kubectl logs -l app=products-db --tail 3
```

Both Pods should show they're ready to accept connections.

**What's Happening Behind the Scenes**:
- Pod-0 detected its hostname ends in `-0` and configured itself as primary
- Pod-1 detected it's not Pod-0 and configured replication pointing to `products-db-0.products-db.default.svc.cluster.local`
- The stable DNS names enable this automatic discovery

---

## Section 4: Lab Challenge - Convert Deployment to StatefulSet (4-5 minutes)

### 4.1 Challenge Overview (45 seconds)

Now it's time to apply what you've learned. The lab provides an Nginx proxy Deployment that uses an emptyDir volume for cache files. Your challenge is to convert it to a StatefulSet with a PVC for each Pod.

**Requirements**:
1. Replace the Deployment with a StatefulSet
2. Use volumeClaimTemplates instead of emptyDir
3. Configure parallel Pod creation (since Pods don't depend on each other)
4. The proxy should continue working correctly

Let's first deploy and test the current Deployment.

### 4.2 Testing the Original Deployment (60 seconds)

Deploy the proxy as it currently exists:

```bash
kubectl apply -f labs/statefulsets/specs/simple-proxy
```

Test that it works:

```bash
curl http://localhost:8040
# or browse to http://localhost:30040
```

You should see the proxied content from the StatefulSet web application. The Deployment uses an emptyDir volume at `/var/cache/nginx` for caching.

Now you need to convert this to use persistent storage via a StatefulSet.

### 4.3 Solution Walkthrough (2-3 minutes)

Here's how to approach this conversion:

**Step 1: Create a headless Service** (required for StatefulSets):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: simple-proxy
  labels:
    kubernetes.courselabs.co: statefulsets
spec:
  clusterIP: None
  selector:
    app: simple-proxy
  ports:
  - port: 80
    targetPort: 80
```

**Step 2: Convert Deployment to StatefulSet**:

Key changes needed:
- Change `kind: Deployment` to `kind: StatefulSet`
- Add `serviceName: simple-proxy`
- Add `podManagementPolicy: Parallel` (Pods don't need sequential startup)
- Replace the `volumes` section with `volumeClaimTemplates`

**Step 3: Define volumeClaimTemplates**:

```yaml
volumeClaimTemplates:
- metadata:
    name: cache
  spec:
    accessModes: [ "ReadWriteOnce" ]
    resources:
      requests:
        storage: 100Mi
```

**Step 4: Deploy and verify**:

```bash
# Remove the old Deployment
kubectl delete -f labs/statefulsets/specs/simple-proxy

# Apply the new StatefulSet
kubectl apply -f <your-solution-file>

# Watch Pods (should start in parallel)
kubectl get pods -l app=simple-proxy --watch

# Verify PVCs were created
kubectl get pvc -l app=simple-proxy

# Test the proxy still works
curl http://localhost:8040
```

**Key Points**:
- With `podManagementPolicy: Parallel`, all Pods start simultaneously
- Each Pod gets its own PVC: `cache-simple-proxy-0`, `cache-simple-proxy-1`, etc.
- Cache data persists across Pod restarts
- The proxy continues functioning correctly with persistent cache storage

You can check the full solution in `labs/statefulsets/solution.md` if you need reference.

---

## Section 5: Extra Content - SQL Client Deployment (2 minutes, optional)

### 5.1 Accessing the Database (60 seconds)

For the curious, the lab includes an extra section on deploying a SQL client to interact with the database. This is useful for testing but not required for CKAD.

The approach involves:
- Deploying a Pod with a PostgreSQL client
- Connecting to specific database Pods using their DNS names
- Running queries to verify replication

This demonstrates a real-world pattern: databases aren't publicly exposed, but you can deploy client Pods within the cluster for administration.

The detailed walkthrough is in the lab's `statefulsets-sql-client.md` file.

### 5.2 Production Considerations (60 seconds)

In production StatefulSet deployments, you'd also consider:

**Backup and Recovery**:
- Regular PVC snapshots using VolumeSnapshots
- Backup to external storage systems

**Monitoring**:
- Track Pod-specific metrics
- Alert on replication lag for databases
- Monitor PVC capacity usage per Pod

**High Availability**:
- Anti-affinity rules to spread Pods across nodes
- Pod Disruption Budgets to limit simultaneous disruptions
- ReadinessProbes and LivenessProbes for automatic recovery

**Security**:
- Use Secrets for database credentials (as shown in this lab)
- NetworkPolicies to restrict database access
- Pod Security Standards for container restrictions

---

## Section 6: Cleanup and Key Observations (2 minutes)

### 6.1 Cleanup Process (60 seconds)

Let's clean up the lab resources:

```bash
kubectl delete svc,cm,secret,statefulset,deployment,pod -l kubernetes.courselabs.co=statefulsets
```

**Important Observation**:

Now check the PVCs:

```bash
kubectl get pvc
```

The PVCs are still there! This is StatefulSet's safety mechanism - PVCs are not automatically deleted when you delete a StatefulSet or scale it down.

**To completely clean up**:

```bash
kubectl delete pvc -l app=products-db
kubectl delete pvc -l app=simple-proxy
```

**Why This Design?**: It prevents accidental data loss. In production, you'd need explicit policies for PVC cleanup when StatefulSets are removed.

### 6.2 Key Observations from the Lab (60 seconds)

Let's recap what we've learned through hands-on practice:

**1. Sequential Startup**: We saw Pods created one at a time, each waiting for the previous to be Ready.

**2. Stable Names**: Pod names were predictable (web-0, web-1, web-2), unlike the random names in Deployments.

**3. DNS Resolution**: Each Pod got its own DNS name, enabling direct Pod-to-Pod communication.

**4. Automatic PVC Management**: volumeClaimTemplates created dedicated storage for each Pod without manual intervention.

**5. PVC Persistence**: PVCs survived StatefulSet deletion, protecting data from accidental loss.

**6. Init Container Patterns**: We saw how init containers use Pod identity to implement conditional startup logic.

**7. Parallel Option**: We learned that `podManagementPolicy: Parallel` overrides sequential creation when appropriate.

---

## Conclusion (60 seconds)

This concludes our hands-on StatefulSets lab. You've now:
- Deployed StatefulSets with multiple configurations
- Explored stable network identities and DNS resolution
- Worked with volumeClaimTemplates for persistent storage
- Deployed a real replicated database
- Converted a Deployment to a StatefulSet

**Key Skills for CKAD**:
- Know how to create a headless Service
- Understand volumeClaimTemplates syntax
- Remember the `serviceName` field is required
- Be prepared for sequential Pod creation times in timed scenarios
- Know that PVCs persist after StatefulSet deletion

**Practice Recommendations**:
1. Repeat this lab until you can deploy a StatefulSet from scratch in under 5 minutes
2. Practice the DNS naming format: `<pod>.<service>.<namespace>.svc.cluster.local`
3. Experiment with scaling StatefulSets up and down
4. Try the OnDelete update strategy for manual rollout control

**Next Steps**: In the CKAD exam prep session, we'll work through timed scenarios, practice common exam questions, and review troubleshooting techniques for StatefulSets.

---

## Presentation Notes

**Demo Environment**:
- Pre-create a working cluster before the session
- Test all commands beforehand
- Have the lab files ready and accessible
- Consider using tmux or split terminals for watching resources

**Timing Flexibility**:
- Core sections (1-4): 15-17 minutes
- Optional section 5: +2 minutes
- Q&A buffer: 3-5 minutes

**Common Demo Issues**:
- PVC provisioning delays: Acknowledge and wait
- LoadBalancer pending on local clusters: Use NodePort alternative
- DNS propagation delays: Give it 5-10 seconds if lookups fail initially

**Interactive Elements**:
- Pause for questions after Section 2 (DNS)
- Allow participants to attempt the lab challenge independently
- Encourage participants to run commands in their own environments

**Engagement Tips**:
- Ask: "What do you notice about the Pod creation order?"
- Ask: "Why do you think PVCs aren't automatically deleted?"
- Encourage predictions: "What will happen when we scale this down?"

**Total Duration**: 18-22 minutes (flexible based on audience interaction)
