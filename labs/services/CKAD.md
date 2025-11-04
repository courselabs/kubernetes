# Services - CKAD Exam Topics

This document covers the CKAD exam requirements for Kubernetes Services. Make sure you've completed the [basic Services lab](README.md) first, as it covers the fundamental concepts of ClusterIP, NodePort, and LoadBalancer services.

## CKAD Services Requirements

The CKAD exam expects you to understand and work with:

- Service types and use cases
- Endpoints and EndpointSlices
- Multi-port Services
- Headless Services
- Services without selectors (external services)
- ExternalName Services
- Session affinity
- DNS and service discovery
- Service troubleshooting

## API Specs

- [Service](https://kubernetes.io/docs/reference/kubernetes-api/service-resources/service-v1/)
- [Endpoints](https://kubernetes.io/docs/reference/kubernetes-api/service-resources/endpoints-v1/)
- [EndpointSlice](https://kubernetes.io/docs/reference/kubernetes-api/service-resources/endpoint-slice-v1/)

## Understanding Endpoints

When a Service is created with a selector, Kubernetes automatically creates an **Endpoints** object. This object tracks which Pod IP addresses match the Service selector.

From the basic lab, you should have the whoami service deployed. Check its endpoints:

```
kubectl get endpoints whoami

kubectl describe endpoints whoami
```

The Endpoints object lists all the IP addresses of Pods that match the Service selector. This is how the Service knows where to route traffic.

### Endpoints vs EndpointSlices

**EndpointSlices** are a newer API that scales better for Services with many endpoints:

```
kubectl get endpointslices

kubectl describe endpointslice whoami
```

> EndpointSlices split large endpoint lists into multiple objects, improving performance in large clusters.

**TODO**: Add example showing EndpointSlice details and comparison with classic Endpoints

## Multi-Port Services

Services can expose multiple ports for applications that listen on different ports (e.g., HTTP on 8080, metrics on 9090).

**TODO**: Create spec file `specs/services/whoami-multiport.yaml` showing:
- Multiple ports in the Service spec
- Named ports for clarity
- Different targetPort values

**TODO**: Add exercise:
1. Deploy a multi-port Service
2. Test connectivity to each port
3. Show how to reference ports by name

### Named Ports in Pods

You can name ports in Pod specs and reference them in Services:

**TODO**: Create example showing:
- Pod spec with named ports
- Service targeting named ports (e.g., targetPort: http-web)
- Benefits for version upgrades when port numbers change

## Headless Services

A **headless Service** has no ClusterIP (set `clusterIP: None`). Instead of load balancing, DNS returns all Pod IP addresses directly.

Use cases:
- StatefulSets (covered in the [statefulsets lab](../statefulsets/README.md))
- Client-side load balancing
- Service discovery without load balancing

**TODO**: Create spec file `specs/services/whoami-headless.yaml`

**TODO**: Add exercise showing:
```
# Deploy headless service
kubectl apply -f labs/services/specs/services/whoami-headless.yaml

# DNS lookup returns all Pod IPs, not a Service IP
kubectl exec sleep -- nslookup whoami-headless
```

Expected behavior:
- Multiple A records, one per Pod
- No ClusterIP assigned
- Clients can choose which Pod to connect to

## Services Without Selectors

Services don't always target Pods. You can create a Service without a selector to:
- Route to external services (databases, APIs outside the cluster)
- Manually manage endpoints
- Migrate services gradually

When you create a Service without a selector, Kubernetes doesn't create Endpoints automatically. You must create them manually.

**TODO**: Create example specs:
- `specs/services/external-api-service.yaml` - Service with no selector
- `specs/services/external-api-endpoints.yaml` - Manual Endpoints object

**TODO**: Add exercise demonstrating:
1. Creating a Service without selectors
2. Creating corresponding Endpoints manually
3. Updating Endpoints when external IPs change
4. Use case: accessing external database at specific IP:port

## ExternalName Services

**ExternalName** Services provide a DNS CNAME alias to an external service. They don't proxy traffic; they just return a DNS record.

**TODO**: Create spec file `specs/services/external-database.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: database.example.com
```

**TODO**: Add exercise showing:
```
# Deploy ExternalName service
kubectl apply -f labs/services/specs/services/external-database.yaml

# DNS lookup returns CNAME to external service
kubectl exec sleep -- nslookup external-db
```

Use cases:
- Reference external services by Kubernetes-internal names
- Switch between internal and external services without code changes
- Gradual migration to Kubernetes

## Session Affinity

By default, Services load balance requests randomly across Pods. **Session affinity** ensures requests from the same client go to the same Pod.

**TODO**: Create spec file `specs/services/whoami-sessionaffinity.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: whoami-sticky
spec:
  selector:
    app: whoami
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600
  ports:
    - port: 80
      targetPort: 80
```

**TODO**: Add exercise demonstrating:
1. Deploy service without session affinity - show requests distributed
2. Deploy service with `sessionAffinity: ClientIP`
3. Make multiple requests and verify they go to the same Pod
4. Use case: applications with in-memory sessions

## DNS and Service Discovery

### DNS Names and Namespaces

Services are accessible via DNS in multiple formats:

- **Same namespace**: `<service-name>`
- **Cross-namespace**: `<service-name>.<namespace>`
- **Fully qualified**: `<service-name>.<namespace>.svc.cluster.local`

**TODO**: Add exercise demonstrating:
```
# Create namespace and resources
kubectl create namespace ckad-services-test
kubectl run test-pod -n ckad-services-test --image=nginx

# Create service in default namespace
kubectl apply -f labs/services/specs/services/whoami-clusterip.yaml

# Test different DNS formats from different namespace
kubectl exec -n ckad-services-test test-pod -- curl whoami.default
kubectl exec -n ckad-services-test test-pod -- curl whoami.default.svc.cluster.local

# Test from same namespace (default)
kubectl exec sleep -- curl whoami
```

### SRV Records

Services also create SRV DNS records for port discovery:

**TODO**: Add example:
```
# Query SRV records for named ports
kubectl exec sleep -- nslookup -type=srv _http._tcp.whoami.default.svc.cluster.local
```

Use case: Clients can discover which ports a service offers

## Service Troubleshooting

### Common Issues and Debugging

**1. Service has no endpoints**

```
kubectl get endpoints <service-name>
```

Causes:
- No Pods match the label selector
- Pods are not ready (failing readiness probes)
- Label mismatch between Service selector and Pod labels

**TODO**: Create troubleshooting exercise with intentional misconfigurations:
- Service with label selector that doesn't match any Pods
- Pods with wrong labels
- Pods stuck in non-Ready state

**2. DNS resolution fails**

```
# Check DNS is working
kubectl exec sleep -- nslookup kubernetes.default

# Check service exists
kubectl get svc <service-name>

# Verify namespace
kubectl get svc <service-name> -n <namespace>
```

**3. Connection timeouts**

```
# Check endpoints exist
kubectl get endpoints <service-name>

# Check Pod status
kubectl get pods -l <service-selector>

# Test direct Pod connectivity
kubectl exec sleep -- curl <pod-ip>:<port>
```

**TODO**: Add comprehensive troubleshooting exercise covering:
- DNS issues
- Network policies blocking traffic
- Port mismatches (Service port vs targetPort vs containerPort)
- Namespace issues
- Endpoint readiness

### Using kubectl port-forward for Testing

You can bypass Services and connect directly to Pods for debugging:

```
# Forward local port to Pod
kubectl port-forward pod/<pod-name> 8080:80

# Forward to a Service (picks a random Pod)
kubectl port-forward service/<service-name> 8080:80
```

**TODO**: Add exercise showing when to use port-forward vs Services

## Service Network Policies

Services work with Network Policies to control traffic flow. This is covered in detail in the [networkpolicy lab](../networkpolicy/README.md).

Key concepts:
- Network Policies control which Pods can connect to Services
- Policies use label selectors for both source and destination
- By default, all traffic is allowed

**TODO**: Add brief example showing:
- Service with NetworkPolicy restricting access
- Testing allowed and denied connections
- Reference to full NetworkPolicy lab

## CKAD Exam Tips

### Quick Service Creation

You can create Services imperatively with kubectl:

```
# Create ClusterIP service
kubectl expose pod whoami --port=80 --name=whoami-svc

# Create NodePort service
kubectl expose pod whoami --type=NodePort --port=80 --name=whoami-np

# Create LoadBalancer service
kubectl expose pod whoami --type=LoadBalancer --port=80 --name=whoami-lb

# Expose deployment (common pattern)
kubectl expose deployment myapp --port=80 --target-port=8080
```

### Verify Service Configuration

Quick checks during the exam:

```
# Get service details
kubectl get svc <name>
kubectl describe svc <name>

# Check endpoints
kubectl get endpoints <name>

# Test connectivity
kubectl run test --rm -it --image=busybox -- wget -O- <service-name>:<port>

# Check DNS
kubectl run test --rm -it --image=busybox -- nslookup <service-name>
```

### Common Exam Scenarios

**TODO**: Add practice scenarios matching CKAD exam format:

1. **Scenario 1**: Create a deployment with 3 replicas and expose it with a ClusterIP service on port 8080
2. **Scenario 2**: Create a NodePort service that exposes an existing deployment on port 30080
3. **Scenario 3**: Debug why a service has no endpoints and fix the issue
4. **Scenario 4**: Create a headless service for a StatefulSet
5. **Scenario 5**: Configure session affinity for a web application
6. **Scenario 6**: Create a multi-port service exposing HTTP (80) and HTTPS (443)
7. **Scenario 7**: Set up an ExternalName service to reference an external API
8. **Scenario 8**: Fix DNS resolution issues between namespaces

## Lab Challenge

Build a complete microservices application demonstrating all Service types:

**TODO**: Create complete lab exercise with:

1. **Frontend** (3 replicas)
   - Deployment with whoami or nginx
   - LoadBalancer service on port 80
   - Session affinity enabled

2. **Backend API** (2 replicas)
   - Deployment with simple API
   - ClusterIP service on port 8080
   - Multi-port: API on 8080, metrics on 9090

3. **Database** (StatefulSet)
   - StatefulSet with 1 replica
   - Headless service for direct Pod access
   - ClusterIP service for read access

4. **External Service**
   - ExternalName service pointing to external API
   - Service without selector for external database

5. **Testing Requirements**
   - Frontend can access backend via DNS
   - Backend can access database via headless service
   - Backend can reach external service
   - Create NetworkPolicy restricting database access to backend only

**Success criteria:**
- All services have correct endpoints
- DNS resolution works across namespaces
- External access works via LoadBalancer/NodePort
- Session affinity maintains sticky sessions
- Network policies enforce access controls

## Cleanup

Remove all CKAD practice resources:

```
kubectl delete pod,svc,deployment,statefulset -l kubernetes.courselabs.co=services

# If you created test namespaces
kubectl delete namespace ckad-services-test
```

## Further Reading

- [Service API Documentation](https://kubernetes.io/docs/concepts/services-networking/service/)
- [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [EndpointSlices](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
- [Service Topology](https://kubernetes.io/docs/concepts/services-networking/service-topology/) (advanced)

---

> Back to [basic Services lab](README.md) | [Course contents](../../README.md)
