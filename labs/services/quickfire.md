# Services - Quickfire Questions

Test your knowledge of Kubernetes Services with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is the default Service type in Kubernetes?

A) NodePort
B) LoadBalancer
C) ClusterIP
D) ExternalName

### 2. How does a Service find which Pods to route traffic to?

A) By Pod name
B) By Pod IP address
C) By label selector
D) By namespace

### 3. What is the purpose of the `targetPort` field in a Service specification?

A) The port the Service listens on
B) The port on the Pod where traffic gets sent
C) The external port exposed outside the cluster
D) The port used for health checks

### 4. What happens when you create a headless Service (clusterIP: None)?

A) The Service gets no IP address and DNS returns all Pod IPs
B) The Service is not accessible from within the cluster
C) The Service only works with StatefulSets
D) The Service automatically becomes a LoadBalancer

### 5. Which Service type exposes your application on each Node's IP at a static port?

A) ClusterIP
B) NodePort
C) LoadBalancer
D) ExternalName

### 6. What Kubernetes object tracks which Pod IP addresses match a Service selector?

A) ServiceEndpoint
B) PodSelector
C) Endpoints
D) ServiceBinding

### 7. How can you expose multiple ports from the same Service?

A) Create multiple Services with the same selector
B) Define multiple entries in the `ports` array
C) Use a LoadBalancer Service type only
D) It's not possible; use separate Services

### 8. What is the purpose of an ExternalName Service?

A) To expose Pods externally via DNS
B) To map a Service to an external DNS name (CNAME record)
C) To create external load balancers
D) To assign external IP addresses to Pods

### 9. When troubleshooting a Service that's not routing traffic correctly, what should you check first?

A) The Service type
B) The Endpoints to verify Pods are being selected
C) The LoadBalancer IP
D) The cluster DNS configuration

### 10. What is session affinity (also called sticky sessions) in Services?

A) Ensuring all requests go to the same Pod
B) Routing requests from the same client to the same Pod
C) Load balancing across all available Pods
D) Preventing Pods from being deleted during traffic

---

## Answers

1. **C** - ClusterIP is the default Service type, which provides an internal IP address accessible only within the cluster.

2. **C** - Services use label selectors to find Pods. The Service's selector matches labels on Pods, and those Pods become endpoints for the Service.

3. **B** - The `targetPort` is the port on the Pod where the Service forwards traffic. The `port` field is what the Service listens on.

4. **A** - A headless Service (clusterIP: None) has no ClusterIP. DNS queries return all Pod IPs directly, allowing client-side load balancing or service discovery without a proxy.

5. **B** - NodePort Services expose the application on each Node's IP at a static port (in the range 30000-32767 by default), making it accessible from outside the cluster.

6. **C** - The Endpoints object tracks which Pod IP addresses match a Service's selector. Kubernetes automatically creates and updates this object.

7. **B** - You can define multiple port mappings in the `ports` array of a Service spec. Each port should have a unique name.

8. **B** - ExternalName Services map a Kubernetes Service name to an external DNS name, effectively creating a CNAME record for service discovery.

9. **B** - Check the Endpoints object first. If it's empty or doesn't show the expected Pod IPs, the Service selector likely doesn't match any Pod labels.

10. **B** - Session affinity (sessionAffinity: ClientIP) ensures that requests from the same client IP are routed to the same Pod, useful for stateful applications.

---

## Study Resources

- [Lab README](README.md) - Core Service concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific Service topics
- [Official Service Documentation](https://kubernetes.io/docs/concepts/services-networking/service/)
