# Operators - CKAD Requirements

This document covers the CKAD (Certified Kubernetes Application Developer) exam requirements for Operators and Custom Resources, building on the basics covered in [README.md](README.md).

## CKAD Exam Requirements

The CKAD exam expects you to understand and implement:
- Understanding Custom Resource Definitions (CRDs)
- Creating and managing custom resources
- Working with operator-managed applications
- Understanding the operator pattern
- Querying and describing custom resources
- Troubleshooting operator deployments
- Understanding controller patterns
- Working with Helm operators

## Custom Resource Definitions (CRDs)

CRDs extend Kubernetes by adding new resource types to the API.

### Basic CRD Structure

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: backends.stable.example.com
spec:
  group: stable.example.com
  names:
    plural: backends
    singular: backend
    kind: Backend
    shortNames:
    - be
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              replicas:
                type: integer
                minimum: 1
                maximum: 10
              image:
                type: string
              port:
                type: integer
```

### CRD Components

**metadata.name**: Must be `<plural>.<group>`

**spec.group**: API group for the custom resource (e.g., `stable.example.com`)

**spec.names**: Defines how the resource is referenced
- `plural`: Plural name for CLI (`kubectl get backends`)
- `singular`: Singular name (`kubectl get backend mybackend`)
- `kind`: The kind field in YAML manifests
- `shortNames`: Abbreviations (`kubectl get be`)

**spec.scope**: Either `Namespaced` or `Cluster`

**spec.versions**: List of API versions
- `served`: Whether this version is enabled
- `storage`: Which version is used for storage (only one can be true)
- `schema`: OpenAPI v3 schema for validation

### Creating a Simple CRD

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: applications.apps.example.com
spec:
  group: apps.example.com
  names:
    plural: applications
    singular: application
    kind: Application
    shortNames:
    - app
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              name:
                type: string
              version:
                type: string
              replicas:
                type: integer
                minimum: 1
              image:
                type: string
            required:
            - name
            - image
```

Deploy the CRD:

```bash
kubectl apply -f crd.yaml
kubectl get crds
kubectl describe crd applications.apps.example.com
```

### Creating Custom Resources

Once the CRD is installed, you can create custom resources:

```yaml
apiVersion: apps.example.com/v1
kind: Application
metadata:
  name: myapp
  namespace: default
spec:
  name: myapp
  version: "1.0"
  replicas: 3
  image: nginx:alpine
```

```bash
kubectl apply -f myapp.yaml
kubectl get applications
kubectl get app  # Using short name
kubectl describe application myapp
```

📋 Create a CRD for a "Database" resource with fields for engine, version, and storage size.

<details>
  <summary>Not sure how?</summary>

> **TODO**: Add complete CRD and custom resource example with validation

</details><br/>

### CRD Validation

Add validation rules using OpenAPI schema:

```yaml
schema:
  openAPIV3Schema:
    type: object
    properties:
      spec:
        type: object
        properties:
          size:
            type: string
            enum:
            - small
            - medium
            - large
          replicas:
            type: integer
            minimum: 1
            maximum: 5
          email:
            type: string
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
          tags:
            type: array
            items:
              type: string
        required:
        - size
        - replicas
```

> **TODO**: Add example showing validation failures with different scenarios

### Additional Printer Columns

Customize the output of `kubectl get`:

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: applications.apps.example.com
spec:
  group: apps.example.com
  names:
    plural: applications
    singular: application
    kind: Application
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
    additionalPrinterColumns:
    - name: Version
      type: string
      jsonPath: .spec.version
    - name: Replicas
      type: integer
      jsonPath: .spec.replicas
    - name: Age
      type: date
      jsonPath: .metadata.creationTimestamp
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              version:
                type: string
              replicas:
                type: integer
```

Result:
```bash
kubectl get applications
# NAME    VERSION   REPLICAS   AGE
# myapp   1.0       3          5m
```

### Subresources

Enable status and scale subresources:

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: applications.apps.example.com
spec:
  group: apps.example.com
  names:
    plural: applications
    singular: application
    kind: Application
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
    subresources:
      status: {}  # Enable status subresource
      scale:      # Enable scale subresource
        specReplicasPath: .spec.replicas
        statusReplicasPath: .status.replicas
        labelSelectorPath: .status.labelSelector
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              replicas:
                type: integer
          status:
            type: object
            properties:
              replicas:
                type: integer
              labelSelector:
                type: string
```

With status subresource:
```bash
# Update status separately from spec
kubectl patch application myapp --subresource=status --type=merge -p '{"status":{"replicas":3}}'
```

With scale subresource:
```bash
# Use kubectl scale command
kubectl scale application myapp --replicas=5
```

> **TODO**: Add example demonstrating status and scale subresources

## Understanding the Operator Pattern

Operators = Custom Resources + Controllers

### Controller Pattern

A controller watches Kubernetes resources and takes action to reconcile desired state with actual state.

**Controller Loop:**
1. Watch for resource changes (Create, Update, Delete)
2. Compare desired state (spec) with actual state (status)
3. Take action to reconcile differences
4. Update resource status
5. Repeat

### Operator Components

**Custom Resource Definition (CRD)**
- Defines the schema for custom resources
- Installed in the cluster
- Extends the Kubernetes API

**Custom Resource (CR)**
- Instance of a CRD
- Defines desired state
- Created by users

**Controller**
- Watches custom resources
- Reconciles desired state
- Usually runs as a Deployment
- Requires RBAC permissions

```
┌─────────────────────────────────────────────┐
│           Operator Pattern                   │
│                                              │
│  ┌──────────┐      ┌──────────────────┐    │
│  │   CRD    │─────▶│  Custom Resource │    │
│  │(Schema)  │      │  (User creates)  │    │
│  └──────────┘      └──────────┬───────┘    │
│                               │              │
│                               │ watches      │
│                               ▼              │
│                      ┌─────────────────┐    │
│                      │   Controller    │    │
│                      │   (Reconciles)  │    │
│                      └────────┬────────┘    │
│                               │              │
│                               │ creates      │
│                               ▼              │
│                   ┌──────────────────────┐  │
│                   │  Kubernetes Objects  │  │
│                   │ (Deployments, etc.)  │  │
│                   └──────────────────────┘  │
└─────────────────────────────────────────────┘
```

> **TODO**: Add diagram showing operator workflow

## Working with Operators

### Installing an Operator

Most operators are installed via manifests or Helm charts.

**Via Manifests:**
```bash
# Install CRDs
kubectl apply -f https://example.com/operator/crds.yaml

# Install operator
kubectl apply -f https://example.com/operator/operator.yaml

# Verify installation
kubectl get crds
kubectl get pods -n operator-namespace
kubectl logs -n operator-namespace -l app=operator
```

**Via Helm:**
```bash
# Add Helm repository
helm repo add operator https://example.com/charts
helm repo update

# Install operator
helm install my-operator operator/operator-chart

# Verify installation
helm list
kubectl get crds
kubectl get pods
```

### Operator Permissions (RBAC)

Operators need permissions to watch and manage resources:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myoperator
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: myoperator
rules:
# Watch custom resources
- apiGroups: ["apps.example.com"]
  resources: ["applications"]
  verbs: ["get", "list", "watch", "update", "patch"]
- apiGroups: ["apps.example.com"]
  resources: ["applications/status"]
  verbs: ["update", "patch"]
# Manage Kubernetes resources
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "create", "update", "delete"]
- apiGroups: [""]
  resources: ["services", "configmaps", "secrets"]
  verbs: ["get", "list", "create", "update", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: myoperator
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: myoperator
subjects:
- kind: ServiceAccount
  name: myoperator
  namespace: default
```

### Operator Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myoperator
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myoperator
  template:
    metadata:
      labels:
        app: myoperator
    spec:
      serviceAccountName: myoperator
      containers:
      - name: operator
        image: example.com/myoperator:v1.0
        env:
        - name: WATCH_NAMESPACE
          value: ""  # Watch all namespaces
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
```

📋 Check what permissions an operator's service account has.

<details>
  <summary>Not sure how?</summary>

```bash
# List ClusterRoleBindings for the service account
kubectl get clusterrolebinding -o json | \
  jq '.items[] | select(.subjects[]?.name=="myoperator") | .metadata.name'

# Check specific permissions
kubectl auth can-i list deployments --as system:serviceaccount:default:myoperator
kubectl auth can-i create customresourcedefinitions --as system:serviceaccount:default:myoperator
```

> **TODO**: Add complete example showing operator RBAC verification

</details><br/>

## Common Operator Use Cases

### Database Operators

Manage database lifecycle:

```yaml
apiVersion: databases.example.com/v1
kind: PostgresCluster
metadata:
  name: production-db
spec:
  version: "14"
  replicas: 3
  storage:
    size: 100Gi
    storageClass: fast-ssd
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retention: 7
  monitoring:
    enabled: true
```

**Operator manages:**
- StatefulSet for database pods
- Services for connectivity
- ConfigMaps for configuration
- Secrets for credentials
- PersistentVolumeClaims for storage
- Backup CronJobs
- Monitoring sidecars

### Message Queue Operators

Deploy message brokers:

```yaml
apiVersion: messaging.example.com/v1
kind: KafkaCluster
metadata:
  name: event-broker
spec:
  version: "3.2"
  replicas: 3
  zookeeper:
    replicas: 3
  storage:
    size: 50Gi
  config:
    log.retention.hours: 168
    num.partitions: 10
```

### Application Operators

Manage complex applications:

```yaml
apiVersion: apps.example.com/v1
kind: ApplicationDeployment
metadata:
  name: myapp
spec:
  version: "2.0"
  components:
    frontend:
      replicas: 3
      image: myapp/frontend:2.0
    backend:
      replicas: 5
      image: myapp/backend:2.0
    cache:
      replicas: 2
      image: redis:6
  ingress:
    enabled: true
    hostname: myapp.example.com
```

> **TODO**: Add hands-on example with a real operator deployment

## Querying Custom Resources

### Basic Queries

```bash
# List all custom resources of a type
kubectl get applications
kubectl get applications -A  # All namespaces
kubectl get applications -n dev

# Get with output formats
kubectl get applications -o wide
kubectl get applications -o yaml
kubectl get applications -o json

# Use short names
kubectl get app
kubectl get apps

# Describe custom resource
kubectl describe application myapp

# Get specific fields
kubectl get application myapp -o jsonpath='{.spec.version}'
kubectl get applications -o custom-columns=NAME:.metadata.name,VERSION:.spec.version
```

### Advanced Queries

```bash
# Filter by labels
kubectl get applications -l environment=production
kubectl get applications -l 'tier in (frontend,backend)'

# Filter by field selector
kubectl get applications --field-selector metadata.namespace=default

# Watch for changes
kubectl get applications -w

# Get events for custom resource
kubectl get events --field-selector involvedObject.name=myapp

# JSONPath queries
kubectl get applications -o jsonpath='{.items[*].metadata.name}'
kubectl get applications -o jsonpath='{.items[?(@.spec.replicas>3)].metadata.name}'
```

### Checking Status

Many operators update the status subresource:

```bash
# Get full status
kubectl get application myapp -o jsonpath='{.status}' | jq

# Check specific status fields
kubectl get application myapp -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'

# Wait for condition
kubectl wait --for=condition=Ready application/myapp --timeout=300s
```

> **TODO**: Add example showing status conditions and how to interpret them

## Troubleshooting Operators

### Common Issues

**Issue 1: CRD Not Found**

```bash
# Error: "the server doesn't have a resource type 'applications'"

# Check if CRD is installed
kubectl get crds | grep applications

# Install CRD if missing
kubectl apply -f crd.yaml
```

**Issue 2: Operator Pod Not Running**

```bash
# Check operator pod status
kubectl get pods -l app=myoperator
kubectl describe pod -l app=myoperator
kubectl logs -l app=myoperator

# Common causes:
# - Image pull errors
# - RBAC permission denied
# - Resource limits too low
# - Missing dependencies
```

**Issue 3: Custom Resource Created but Nothing Happens**

```bash
# Check operator logs for errors
kubectl logs -l app=myoperator --tail=100

# Check operator is watching correct namespace
kubectl get deployment myoperator -o jsonpath='{.spec.template.spec.containers[0].env}'

# Verify RBAC permissions
kubectl auth can-i create deployments --as system:serviceaccount:default:myoperator

# Check custom resource is valid
kubectl get application myapp -o yaml
kubectl describe application myapp
```

**Issue 4: Operator Creating Wrong Resources**

```bash
# Check operator version
kubectl get deployment myoperator -o jsonpath='{.spec.template.spec.containers[0].image}'

# Check operator configuration
kubectl get configmap -l app=myoperator
kubectl describe configmap myoperator-config

# Review custom resource spec
kubectl get application myapp -o yaml
```

### Debugging Commands

```bash
# Get all custom resource types
kubectl get crds
kubectl api-resources --api-group=apps.example.com

# Check CRD details
kubectl get crd applications.apps.example.com -o yaml
kubectl explain applications.spec

# Check operator status
kubectl get deployment -l app=myoperator
kubectl get pods -l app=myoperator
kubectl logs -l app=myoperator --tail=50 -f

# Check operator RBAC
kubectl get serviceaccount myoperator -o yaml
kubectl get clusterrole myoperator -o yaml
kubectl get clusterrolebinding myoperator -o yaml

# Check custom resources
kubectl get applications -A
kubectl describe application myapp
kubectl get application myapp -o yaml

# Check objects created by operator
kubectl get all -l managed-by=myoperator
kubectl get all -l application=myapp

# Check events
kubectl get events --sort-by='.lastTimestamp'
kubectl get events --field-selector involvedObject.name=myapp

# Delete and recreate custom resource
kubectl delete application myapp
kubectl apply -f myapp.yaml
```

> **TODO**: Add step-by-step troubleshooting scenario

## Updating Custom Resources

### Updating Spec

```bash
# Edit interactively
kubectl edit application myapp

# Patch specific field
kubectl patch application myapp --type='json' \
  -p='[{"op": "replace", "path": "/spec/replicas", "value": 5}]'

# Replace from file
kubectl apply -f myapp-updated.yaml

# Using kubectl set (if supported)
kubectl set image application/myapp container=newimage:v2
```

### Updating Status (Controller Only)

```bash
# Status should only be updated by the operator
# But for testing, you can update it manually:
kubectl patch application myapp --subresource=status --type=merge \
  -p '{"status":{"replicas":5,"ready":true}}'
```

### Scaling (if scale subresource enabled)

```bash
# Use kubectl scale
kubectl scale application myapp --replicas=10

# Check current scale
kubectl get application myapp -o jsonpath='{.spec.replicas}'
```

## Deleting Custom Resources and CRDs

### Deleting Custom Resources

```bash
# Delete specific resource
kubectl delete application myapp

# Delete multiple resources
kubectl delete application app1 app2 app3

# Delete by label
kubectl delete applications -l environment=dev

# Delete all in namespace
kubectl delete applications --all
```

### Deleting CRDs

> **Warning:** Deleting a CRD deletes all custom resources of that type!

```bash
# List custom resources first
kubectl get applications -A

# Delete custom resources
kubectl delete applications --all -A

# Then delete CRD
kubectl delete crd applications.apps.example.com

# Or delete operator (which usually manages CRD deletion)
kubectl delete -f operator.yaml
```

### Cleanup Order

When removing an operator:

1. Delete custom resources (let operator clean up)
2. Wait for operator to delete managed objects
3. Delete operator deployment
4. Delete CRDs
5. Delete RBAC objects

```bash
# 1. Delete custom resources
kubectl delete applications --all

# 2. Wait for cleanup
kubectl get pods -l managed-by=myoperator --watch

# 3. Delete operator
kubectl delete deployment myoperator

# 4. Delete CRDs
kubectl delete crd applications.apps.example.com

# 5. Delete RBAC
kubectl delete serviceaccount myoperator
kubectl delete clusterrole myoperator
kubectl delete clusterrolebinding myoperator
```

> **TODO**: Add example showing proper cleanup sequence

## Lab Exercises

### Exercise 1: Create and Use a CRD

Create a CRD for "Website" resources with the following:
- Fields: domain, replicas, sslEnabled
- Validation: replicas 1-10, domain must be valid format
- Additional printer columns showing domain and replicas
- Create several Website resources and query them

> **TODO**: Add complete solution with CRD and resources

### Exercise 2: Inspect an Operator

Deploy a sample operator (NATS or MySQL from README):
1. Identify all CRDs it installs
2. Check its RBAC permissions
3. Examine its deployment configuration
4. View its logs
5. Create a custom resource and watch what happens

> **TODO**: Add complete solution with analysis

### Exercise 3: Troubleshoot Broken Operator

Given a broken operator deployment:
1. Operator pod is in CrashLoopBackoff
2. Custom resources created but nothing happens
3. Objects created but in wrong configuration

Debug and fix each issue.

> **TODO**: Add broken scenarios and solutions

### Exercise 4: Operator Lifecycle

Practice full operator lifecycle:
1. Install operator
2. Create custom resources
3. Update custom resources
4. Scale resources
5. Delete resources (observe cleanup)
6. Uninstall operator properly

> **TODO**: Add complete workflow example

### Exercise 5: Multi-Tenant Operator

Deploy operator in multi-tenant scenario:
1. Operator watches all namespaces
2. Create custom resources in different namespaces
3. Verify isolation between namespaces
4. Check RBAC permissions

> **TODO**: Add multi-namespace scenario

## Common CKAD Scenarios

### Scenario 1: Install and Configure Database Operator

> **TODO**: Add scenario deploying database with operator

### Scenario 2: Debug Failing Custom Resource

> **TODO**: Add scenario troubleshooting CR that doesn't work

### Scenario 3: Upgrade Application via Operator

> **TODO**: Add scenario showing version upgrade through CR

### Scenario 4: Backup and Restore with Operator

> **TODO**: Add scenario using operator backup capabilities

## Best Practices for CKAD

1. **Understanding Operators**
   - Know that operators = CRDs + controllers
   - Understand operators don't replace Kubernetes resources, they manage them
   - Operators are useful for complex stateful applications

2. **Working with CRDs**
   - Always check if CRD is installed before creating resources
   - Use `kubectl explain` to understand CRD fields
   - Check validation errors carefully

3. **Troubleshooting**
   - Start with operator logs
   - Check RBAC permissions
   - Verify CRDs are installed and correct version
   - Look at events for custom resources

4. **Resource Management**
   - Operators create many resources - use labels to track them
   - Clean up custom resources before uninstalling operator
   - Delete in correct order (resources → operator → CRDs)

5. **Production Use**
   - Always review operator's RBAC requirements
   - Monitor operator pod health
   - Understand what objects operator manages
   - Have rollback plan

## Quick Reference Commands

```bash
# CRDs
kubectl get crds
kubectl describe crd <name>
kubectl explain <crd-name>.spec
kubectl delete crd <name>

# Custom Resources
kubectl get <resource-type>
kubectl get <resource-type> -A
kubectl describe <resource-type> <name>
kubectl delete <resource-type> <name>

# Operators
kubectl get pods -l app=operator
kubectl logs -l app=operator -f
kubectl describe deployment operator

# RBAC
kubectl get serviceaccount <sa-name> -o yaml
kubectl get clusterrole <role-name> -o yaml
kubectl auth can-i <verb> <resource> --as system:serviceaccount:<namespace>:<sa-name>

# Troubleshooting
kubectl get events --sort-by='.lastTimestamp'
kubectl get events --field-selector involvedObject.name=<name>
kubectl get all -l <label-selector>

# API Resources
kubectl api-resources --api-group=<group>
kubectl api-versions | grep <group>
```

## Cleanup

```bash
# Delete custom resources
kubectl delete <resource-type> --all

# Delete operator
kubectl delete deployment <operator-name>

# Delete CRDs
kubectl delete crd <crd-name>

# Delete RBAC
kubectl delete serviceaccount,clusterrole,clusterrolebinding -l app=operator
```

---

## Next Steps

After mastering Operators and Custom Resources, continue with these CKAD topics:
- [Helm](../helm/CKAD.md) - Package management and templating
- [RBAC](../rbac/CKAD.md) - Advanced authorization
- [Admission Controllers](../admission/CKAD.md) - Policy enforcement
- [API Extensions](../api-extensions/CKAD.md) - Advanced cluster extensions
