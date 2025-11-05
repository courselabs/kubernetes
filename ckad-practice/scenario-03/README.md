# Scenario 3: Database with Persistent Storage

**Difficulty**: Intermediate
**Time Limit**: 15 minutes
**CKAD Domains**: Application Design & Build (20%), Services & Networking (20%)

## Scenario

Deploy a PostgreSQL database using a StatefulSet with persistent storage. The database needs stable network identity and persistent data storage that survives Pod restarts.

## Requirements

1. **Create a namespace** called `database`

2. **Create a Service** called `postgres` in the `database` namespace:
   - Type: ClusterIP
   - Port: 5432
   - Selector: `app=postgres`
   - ClusterIP: None (headless service)

3. **Create a StatefulSet** called `postgres` in the `database` namespace:
   - Replicas: 2
   - Image: `postgres:14-alpine`
   - Labels: `app=postgres`
   - Service name: `postgres`
   - Environment variable: `POSTGRES_PASSWORD=mysecretpassword`
   - Container port: 5432
   - Volume mount at `/var/lib/postgresql/data` with name `data`
   - VolumeClaimTemplate:
     - Name: `data`
     - Access mode: ReadWriteOnce
     - Storage: 1Gi
     - Storage class: Use cluster default

## Verification

```bash
# Check resources
kubectl get all,pvc -n database

# Check StatefulSet
kubectl get statefulset postgres -n database
kubectl describe statefulset postgres -n database

# Verify stable network identity
kubectl run -it --rm psql-test --image=postgres:14-alpine -n database --restart=Never -- \
  psql -h postgres-0.postgres.database.svc.cluster.local -U postgres -c '\l'

# Check PVCs
kubectl get pvc -n database

# Verify data persistence
kubectl exec postgres-0 -n database -- psql -U postgres -c "CREATE DATABASE testdb;"
kubectl delete pod postgres-0 -n database
kubectl wait --for=condition=Ready pod/postgres-0 -n database --timeout=120s
kubectl exec postgres-0 -n database -- psql -U postgres -c "\l" | grep testdb
```

## Success Criteria

- [ ] Namespace `database` exists
- [ ] Headless service is created
- [ ] StatefulSet has 2 replicas running
- [ ] Each Pod has a PVC bound to a PV
- [ ] Pods have stable network identities (postgres-0, postgres-1)
- [ ] Data persists after Pod deletion

## Clean Up

```bash
kubectl delete namespace database
```

## Hints

<details>
  <summary>Click to see hints</summary>

### Hint 1: Headless Service
Set `clusterIP: None` to create a headless service for StatefulSet.

### Hint 2: StatefulSet serviceName
The `spec.serviceName` must match the headless service name.

### Hint 3: VolumeClaimTemplate
Define under `spec.volumeClaimTemplates` - StatefulSet automatically creates PVCs.

</details>

[See Solution](solution.md)
