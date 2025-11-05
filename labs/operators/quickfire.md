# Operators and Custom Resources - Quickfire Questions

Test your knowledge of Kubernetes Operators and Custom Resources with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is a Custom Resource Definition (CRD)?

A) A predefined Kubernetes resource
B) An extension that defines a new resource type in Kubernetes
C) A configuration file for resources
D) A deprecated API version

### 2. What is a Kubernetes Operator?

A) A human administrator
B) A pattern combining CRDs and custom controllers to manage applications
C) A command-line tool
D) A network operator

### 3. How do you create a custom resource after defining a CRD?

A) kubectl create crd resource-name
B) kubectl apply -f custom-resource.yaml (using the CRD's kind)
C) kubectl custom create resource-name
D) CRDs create resources automatically

### 4. What is the Operator pattern designed to do?

A) Replace Kubernetes administrators
B) Encode operational knowledge and automate application management
C) Monitor cluster performance
D) Manage user access

### 5. Which tool is commonly used to build Operators?

A) kubectl
B) Operator SDK or kubebuilder
C) Helm
D) Docker

### 6. What does a Controller do in the Operator pattern?

A) Controls network traffic
B) Watches for changes to resources and reconciles desired state
C) Manages user permissions
D) Schedules Pods

### 7. Can you query custom resources using kubectl?

A) No, you need special tools
B) Yes, using kubectl get <custom-resource-type>
C) Only with the Kubernetes dashboard
D) Only through the API directly

### 8. What is the purpose of the spec section in a custom resource?

A) To define the resource's status
B) To define the desired state of the custom resource
C) To store metadata
D) To define permissions

### 9. Where are CRDs stored in Kubernetes?

A) In ConfigMaps
B) In etcd as cluster-scoped resources
C) In Secrets
D) In the controller

### 10. What is a common use case for Operators?

A) Running simple stateless applications
B) Managing complex stateful applications like databases
C) Creating Pods only
D) Network routing

---

## Answers

1. **B** - A CRD (Custom Resource Definition) extends Kubernetes by defining a new resource type with its own API, schema, and validation rules.

2. **B** - An Operator is a pattern that combines CRDs (custom resources) with custom controllers to automate the management of complex applications using operational knowledge.

3. **B** - After creating a CRD, you create instances of the custom resource using `kubectl apply -f custom-resource.yaml`, where the YAML uses the kind defined in the CRD.

4. **B** - The Operator pattern encodes domain-specific operational knowledge (installation, upgrades, backups, failure recovery) into automated controllers.

5. **B** - Operator SDK and kubebuilder are popular frameworks for building Operators. They generate scaffolding code and simplify controller development.

6. **B** - A Controller continuously watches for changes to resources (via the API server) and reconciles the actual state with the desired state defined in the resource spec.

7. **B** - Yes, custom resources are first-class Kubernetes objects. Use `kubectl get <crd-name>`, `kubectl describe`, `kubectl delete`, etc., just like built-in resources.

8. **B** - The `spec` section defines the desired state of the custom resource. The controller reads this and takes actions to achieve that state.

9. **B** - CRDs are stored in etcd as cluster-scoped resources. Once defined, they extend the Kubernetes API and can be used cluster-wide.

10. **B** - Operators excel at managing complex stateful applications like databases (PostgreSQL, MongoDB), message queues (Kafka), and monitoring stacks (Prometheus) that require operational expertise.

---

## Study Resources

- [Lab README](README.md) - Operators and CRD concepts
- [CKAD Requirements](CKAD.md) - CKAD custom resource topics
- [Official Operator Pattern Documentation](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
- [Official CRD Documentation](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)
