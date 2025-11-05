# Services - Quickfire Questions

Test your knowledge of Kubernetes Services with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the default Service type in Kubernetes?

A) NodePort
B) LoadBalancer
C) ExternalName
D) ClusterIP

### 2. How does a Service find which Pods to route traffic to?

A) By label selector
B) By namespace
C) By Pod IP address
D) By Pod name

### 3. What is the purpose of the `targetPort` field in a Service specification?

A) The external port exposed outside the cluster
B) The port on the Pod where traffic gets sent
C) The port used for health checks
D) The port the Service listens on

### 4. What happens when you create a headless Service (clusterIP: None)?

A) The Service automatically becomes a LoadBalancer
B) The Service only works with StatefulSets
C) The Service gets no IP address and DNS returns all Pod IPs
D) The Service is not accessible from within the cluster

### 5. Which Service type exposes your application on each Node's IP at a static port?

A) NodePort
B) ClusterIP
C) LoadBalancer
D) ExternalName

### 6. What Kubernetes object tracks which Pod IP addresses match a Service selector?

A) Endpoints
B) ServiceEndpoint
C) PodSelector
D) ServiceBinding

### 7. How can you expose multiple ports from the same Service?

A) Define multiple entries in the `ports` array
B) It's not possible; use separate Services
C) Use a LoadBalancer Service type only
D) Create multiple Services with the same selector

### 8. What is the purpose of an ExternalName Service?

A) To assign external IP addresses to Pods
B) To create external load balancers
C) To expose Pods externally via DNS
D) To map a Service to an external DNS name (CNAME record)

### 9. When troubleshooting a Service that's not routing traffic correctly, what should you check first?

A) The cluster DNS configuration
B) The LoadBalancer IP
C) The Endpoints to verify Pods are being selected
D) The Service type

### 10. What is session affinity (also called sticky sessions) in Services?

A) Ensuring all requests go to the same Pod
B) Preventing Pods from being deleted during traffic
C) Load balancing across all available Pods
D) Routing requests from the same client to the same Pod

---

## Answers

1. **D** - ClusterIP is the default Service type, which provides an internal IP address accessible only within the cluster.

2. **A** - Services use label selectors to find Pods. The Service's selector matches labels on Pods, and those Pods become endpoints for the Service.

3. **B** - The `targetPort` is the port on the Pod where the Service forwards traffic. The `port` field is what the Service listens on.

4. **C** - A headless Service (clusterIP: None) has no ClusterIP. DNS queries return all Pod IPs directly, allowing client-side load balancing or service discovery without a proxy.

5. **A** - NodePort Services expose the application on each Node's IP at a static port (in the range 30000-32767 by default), making it accessible from outside the cluster.

6. **A** - The Endpoints object tracks which Pod IP addresses match a Service's selector. Kubernetes automatically creates and updates this object.

7. **A** - You can define multiple port mappings in the `ports` array of a Service spec. Each port should have a unique name.

8. **D** - ExternalName Services map a Kubernetes Service name to an external DNS name, effectively creating a CNAME record for service discovery.

9. **C** - Check the Endpoints object first. If it's empty or doesn't show the expected Pod IPs, the Service selector likely doesn't match any Pod labels.

10. **D** - Session affinity (sessionAffinity: ClientIP) ensures that requests from the same client IP are routed to the same Pod, useful for stateful applications.

---

## Study Resources

- [Lab README](README.md) - Core Service concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Service topics
- [Official Service Documentation](https://kubernetes.io/docs/concepts/services-networking/service/)
