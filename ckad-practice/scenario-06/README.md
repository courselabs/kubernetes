# Scenario 6: Network Security

**Difficulty**: Advanced
**Time Limit**: 15 minutes
**CKAD Domains**: Services & Networking (20%)

## Scenario

Deploy a three-tier application with proper network segmentation using NetworkPolicies. Only specific communication paths should be allowed.

## Requirements

1. **Create a namespace** called `three-tier`

2. **Deploy frontend application**:
   - Deployment: `frontend`, image: `nginx:alpine`, replicas: 2
   - Labels: `tier=frontend`, `app=web`
   - Service: `frontend-svc`, type: ClusterIP, port: 80

3. **Deploy backend application**:
   - Deployment: `backend`, image: `nginx:alpine`, replicas: 2
   - Labels: `tier=backend`, `app=api`
   - Service: `backend-svc`, type: ClusterIP, port: 8080 → 80

4. **Deploy database**:
   - Deployment: `database`, image: `postgres:14-alpine`, replicas: 1
   - Labels: `tier=database`, `app=db`
   - Environment: `POSTGRES_PASSWORD=dbpass`
   - Service: `database-svc`, type: ClusterIP, port: 5432

5. **Create NetworkPolicies**:

   **Policy 1: database-policy**
   - Apply to: Pods with label `tier=database`
   - Allow ingress: Only from Pods with label `tier=backend` on port 5432
   - Deny all other ingress

   **Policy 2: backend-policy**
   - Apply to: Pods with label `tier=backend`
   - Allow ingress: Only from Pods with label `tier=frontend` on port 80
   - Deny all other ingress

## Verification

```bash
# Check all resources
kubectl get all,networkpolicy -n three-tier

# Test allowed connections
# Frontend → Backend (should work)
kubectl run test-frontend --image=busybox -n three-tier --labels="tier=frontend" --rm -it --restart=Never -- wget -qO- backend-svc:8080

# Backend → Database (should work)
kubectl run test-backend --image=busybox -n three-tier --labels="tier=backend" --rm -it --restart=Never -- nc -zv database-svc 5432

# Test blocked connections
# Frontend → Database (should fail)
kubectl run test-frontend --image=busybox -n three-tier --labels="tier=frontend" --rm -it --restart=Never -- nc -zv database-svc 5432 -w 3

# External → Backend (should fail)
kubectl run test-external --image=busybox -n three-tier --rm -it --restart=Never -- nc -zv backend-svc 8080 -w 3
```

## Success Criteria

- [ ] All three tiers are deployed with services
- [ ] Frontend can communicate with backend
- [ ] Backend can communicate with database
- [ ] Frontend CANNOT communicate with database
- [ ] Unlabeled Pods cannot communicate with backend or database

## Clean Up

```bash
kubectl delete namespace three-tier
```

[See Solution](solution.md)
