# Operators - CKAD Exam Preparation
**Duration: 20-25 minutes**

---

## Introduction (1:00)

Welcome to the CKAD exam preparation session for Operators and Custom Resources. While full operator development is beyond CKAD scope, understanding Custom Resource Definitions and working with operator-managed applications is part of the exam.

In this session, we'll focus on:
- CKAD-relevant CRD and custom resource skills
- Creating and managing custom resources
- Working with operator-deployed applications
- Troubleshooting operator issues
- Timed practice scenarios

The exam is performance-based. You need to work quickly and accurately with CRDs and custom resources. Let's focus on what matters for exam success.

---

## CKAD Exam Scope for Operators (2:00)

**Timing: 0:00-3:00**

Let's clarify exactly what you need to know.

**CKAD Relevant (Required):**
- Understanding what CRDs are and their purpose
- Creating custom resources from existing CRDs
- Listing and describing custom resources with kubectl
- Understanding that operators extend Kubernetes
- Working with operator-managed applications
- Basic troubleshooting of custom resources

**Beyond CKAD (Advanced):**
- Creating Custom Resource Definitions from scratch
- Building operators or controllers
- Complex operator development
- Operator SDK or Kubebuilder
- Writing validation webhooks
- Advanced operator patterns

**What the Exam Tests:**
- Can you work with existing CRDs?
- Can you create custom resources correctly?
- Can you query and describe custom resources?
- Can you troubleshoot operator-deployed applications?
- Do you understand the relationship between CRDs, custom resources, and operators?

You're a user of operators, not a developer of operators. Focus on practical usage.

---

## Understanding CRD Structure (3:00)

**Timing: 3:00-6:00**

While you won't create CRDs on the exam, understanding their structure helps you work with them.

**Basic CRD Structure:**
```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: backends.stable.example.com  # Must be <plural>.<group>
spec:
  group: stable.example.com
  names:
    plural: backends
    singular: backend
    kind: Backend
    shortNames:
    - be
  scope: Namespaced  # or Cluster
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
              image:
                type: string
```

**Key Points to Understand:**

**metadata.name Format:**
Must be `<plural>.<group>`. For example, `backends.stable.example.com`.

**spec.names:**
Defines how you reference the resource:
- `plural`: Used with kubectl get (e.g., `kubectl get backends`)
- `singular`: Used with kubectl get single resource
- `kind`: Used in YAML manifests
- `shortNames`: Abbreviations for kubectl

**spec.scope:**
- `Namespaced`: Resources belong to a namespace
- `Cluster`: Resources are cluster-wide

**spec.versions.schema:**
OpenAPI v3 schema defining valid fields and their types.

You can use `kubectl explain` to understand CRD structure:
```bash
kubectl explain backends.spec
kubectl explain backends.spec.replicas
```

---

## Working with Custom Resources (3:00)

**Timing: 6:00-9:00**

This is the core CKAD skill: creating and managing custom resources.

**Creating a Custom Resource:**

Once a CRD is installed, you create resources with standard YAML:

```yaml
apiVersion: stable.example.com/v1
kind: Backend
metadata:
  name: my-backend
  namespace: default
spec:
  replicas: 3
  image: nginx:alpine
```

Apply it:
```bash
kubectl apply -f backend.yaml
```

**Quick Creation from Command Line:**

For the exam, you might need to create custom resources quickly:

```bash
cat > backend.yaml <<EOF
apiVersion: stable.example.com/v1
kind: Backend
metadata:
  name: my-backend
spec:
  replicas: 3
  image: nginx:alpine
EOF

kubectl apply -f backend.yaml
```

**Listing Custom Resources:**

```bash
# Full resource name
kubectl get backends

# Short name (if defined)
kubectl get be

# All namespaces
kubectl get backends -A

# With labels
kubectl get backends -l environment=prod

# Output formats
kubectl get backends -o yaml
kubectl get backends -o json
kubectl get backends -o wide
```

**Describing Custom Resources:**

```bash
kubectl describe backend my-backend

# Get specific field
kubectl get backend my-backend -o jsonpath='{.spec.replicas}'

# Custom columns
kubectl get backends -o custom-columns=NAME:.metadata.name,REPLICAS:.spec.replicas
```

**Updating Custom Resources:**

```bash
# Edit interactively
kubectl edit backend my-backend

# Patch specific field
kubectl patch backend my-backend --type='merge' -p '{"spec":{"replicas":5}}'

# Replace from file
kubectl apply -f backend-updated.yaml
```

**Deleting Custom Resources:**

```bash
kubectl delete backend my-backend
kubectl delete backends --all
kubectl delete backends -l environment=dev
```

All standard kubectl commands work with custom resources!

---

## Common Exam Scenarios (5:00)

**Timing: 9:00-14:00**

Let's practice typical exam scenarios.

**Scenario 1: List Available CRDs**

Task: "List all Custom Resource Definitions in the cluster."

Solution:
```bash
kubectl get crds

# More details
kubectl get crds -o wide

# Specific CRD
kubectl describe crd backends.stable.example.com
```

Time: 30 seconds

**Scenario 2: Create Custom Resource**

Task: "Create a Backend resource named 'web-backend' with 3 replicas using image nginx:1.25."

Solution:
```bash
# First, check the CRD to understand required fields
kubectl describe crd backends.stable.example.com

# Or use explain
kubectl explain backends.spec

# Create the resource
cat > web-backend.yaml <<EOF
apiVersion: stable.example.com/v1
kind: Backend
metadata:
  name: web-backend
spec:
  replicas: 3
  image: nginx:1.25
EOF

kubectl apply -f web-backend.yaml

# Verify
kubectl get backends
kubectl describe backend web-backend
```

Time: 2-3 minutes

**Scenario 3: Modify Custom Resource**

Task: "Update the web-backend to use 5 replicas."

Solution:
```bash
# Quick patch
kubectl patch backend web-backend --type='merge' -p '{"spec":{"replicas":5}}'

# Verify
kubectl get backend web-backend -o jsonpath='{.spec.replicas}'
```

Time: 1 minute

**Scenario 4: Work with Operator-Managed Resources**

Task: "A PostgresCluster named 'production-db' is deployed. Find all Pods managed by this operator."

Solution:
```bash
# Check the custom resource
kubectl describe postgrescluster production-db

# Find managed resources (operators typically use labels)
kubectl get pods -l app.kubernetes.io/instance=production-db

# Alternative: check all resources
kubectl get all -l app.kubernetes.io/instance=production-db

# Check StatefulSet (databases often use StatefulSets)
kubectl get statefulset -l app.kubernetes.io/instance=production-db
```

Time: 2 minutes

**Scenario 5: Troubleshoot Failing Custom Resource**

Task: "The Backend resource 'api-backend' isn't working. Investigate and fix."

Solution workflow:
```bash
# Check custom resource status
kubectl get backend api-backend
kubectl describe backend api-backend

# Check if operator is running
kubectl get pods -l app=backend-operator
kubectl logs -l app=backend-operator --tail=50

# Check resources created by operator
kubectl get all -l managed-by=backend-operator

# Common issues:
# 1. Operator not running
# 2. Invalid spec in custom resource
# 3. RBAC permissions missing
# 4. Resources created but failing

# Fix example: update invalid spec
kubectl edit backend api-backend
```

Time: 3-5 minutes

---

## Querying Custom Resources Efficiently (2:00)

**Timing: 14:00-16:00**

Speed matters in the exam. Practice these query techniques.

**Quick Status Check:**

```bash
# Get all custom resources of a type
kubectl get backends

# Check specific fields
kubectl get backends -o custom-columns=NAME:.metadata.name,REPLICAS:.spec.replicas,IMAGE:.spec.image

# JSONPath for specific data
kubectl get backend my-backend -o jsonpath='{.spec.replicas}'

# Check status conditions (if CRD has status)
kubectl get backend my-backend -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
```

**Finding Related Resources:**

```bash
# Resources managed by custom resource
kubectl get all -l app.kubernetes.io/instance=CUSTOM_RESOURCE_NAME

# Events related to custom resource
kubectl get events --field-selector involvedObject.name=my-backend

# Check operator logs
kubectl logs -l app=operator-name --tail=100
```

**Validation Before Creating:**

```bash
# Use dry-run to validate
kubectl apply -f backend.yaml --dry-run=client

# Explain to understand required fields
kubectl explain backends.spec
kubectl explain backends.spec.replicas
```

---

## Understanding Operator-Managed Applications (3:00)

**Timing: 16:00-19:00**

The exam may ask you to work with applications deployed by operators.

**Key Understanding:**

Operators create standard Kubernetes resources. When troubleshooting:

**1. Identify the Custom Resource:**
```bash
# Find custom resources in namespace
kubectl get all,crd -A

# Get specific types
kubectl api-resources --api-group=stable.example.com
```

**2. Check Custom Resource Status:**
```bash
kubectl describe backend my-backend

# Look for:
# - Spec (desired state)
# - Status (actual state)
# - Events (recent changes)
# - Conditions (health indicators)
```

**3. Find Managed Resources:**
```bash
# Check for owner references
kubectl get pods -o yaml | grep -A 5 ownerReferences

# Use labels (common pattern)
kubectl get all -l app.kubernetes.io/instance=my-backend
kubectl get all -l managed-by=backend-operator
```

**4. Check Operator Health:**
```bash
# Is operator running?
kubectl get pods -l app=backend-operator

# Check logs
kubectl logs -l app=backend-operator --tail=100

# Check RBAC
kubectl auth can-i create deployments --as system:serviceaccount:default:backend-operator
```

**Example Workflow:**

"The database deployed by an operator isn't accessible."

```bash
# Step 1: Find the custom resource
kubectl get mysqlclusters
kubectl describe mysqlcluster my-db

# Step 2: Check managed resources
kubectl get pods -l app.kubernetes.io/instance=my-db
kubectl get services -l app.kubernetes.io/instance=my-db

# Step 3: Troubleshoot failing pod
kubectl describe pod my-db-0
kubectl logs my-db-0

# Step 4: Check operator
kubectl logs -l app=mysql-operator --tail=50

# Step 5: Fix (might be resource limits, configuration, etc.)
kubectl edit mysqlcluster my-db
```

---

## Practice Exercise 1: Complete CRD Workflow (3:00)

**Timing: 19:00-22:00**

Timed exercise - you have 3 minutes.

**Scenario:**
A CRD named `databases.db.example.com` is installed in the cluster. Create a Database resource named 'app-db' with the following:
- engine: postgres
- version: "14"
- storage: 10Gi
- replicas: 2

Then verify it's created and check its status.

**Start timing...**

**Solution:**
```bash
# Check CRD structure
kubectl explain databases.spec

# Create resource
cat > app-db.yaml <<EOF
apiVersion: db.example.com/v1
kind: Database
metadata:
  name: app-db
spec:
  engine: postgres
  version: "14"
  storage: 10Gi
  replicas: 2
EOF

kubectl apply -f app-db.yaml

# Verify
kubectl get databases
kubectl describe database app-db
kubectl get database app-db -o jsonpath='{.spec.engine}'

# Cleanup
kubectl delete database app-db
rm app-db.yaml
```

Target time: 2-3 minutes. Practice until you're comfortable.

---

## Practice Exercise 2: Troubleshooting (2:00)

**Timing: 22:00-24:00**

**Scenario:**
An Application custom resource named 'web-app' exists, but no pods are running. Investigate and determine the likely cause.

**Solution workflow:**
```bash
# Check custom resource
kubectl get applications
kubectl describe application web-app

# Look for status, conditions, events

# Check operator
kubectl get pods -l app=application-operator
kubectl logs -l app=application-operator --tail=50

# Check for managed resources
kubectl get all -l app.kubernetes.io/instance=web-app

# Common causes:
# 1. Operator not running -> restart operator
# 2. Invalid spec -> fix custom resource
# 3. RBAC issues -> check permissions
# 4. Resource limits -> check cluster capacity

# Example fix:
kubectl edit application web-app
# OR
kubectl patch application web-app --type='merge' -p '{"spec":{"image":"correct-image"}}'
```

---

## Exam Tips and Best Practices (1:00)

**Before the Exam:**
- Practice creating custom resources quickly
- Know how to use kubectl explain with CRDs
- Practice finding operator-managed resources
- Understand owner references and labels
- Know basic troubleshooting workflow

**During the Exam:**
- Use `kubectl explain` to understand CRD structure
- Use `kubectl describe` to see custom resource status
- Check operator logs when things don't work
- Remember: custom resources use standard kubectl commands
- Look for labels to find managed resources

**Common Mistakes to Avoid:**
- Forgetting apiVersion must include the group
- Using wrong kind (check CRD names)
- Not checking if CRD is installed first
- Ignoring status and conditions in custom resources
- Not checking if operator is running

**Time Management:**
- Check CRD exists: 30 seconds
- Create custom resource: 2-3 minutes
- Update custom resource: 1 minute
- Troubleshoot operator issue: 3-5 minutes

**Key Commands to Remember:**
```bash
kubectl get crds
kubectl explain RESOURCE.spec
kubectl get CUSTOM_RESOURCE
kubectl describe CUSTOM_RESOURCE NAME
kubectl get all -l app.kubernetes.io/instance=NAME
kubectl logs -l app=OPERATOR_NAME
```

---

## Summary (1:00)

**Essential CKAD Skills:**
- Working with Custom Resource Definitions
- Creating and managing custom resources
- Querying custom resources with kubectl
- Understanding operator-managed applications
- Basic troubleshooting of operators

**Key Concepts:**
- CRDs extend Kubernetes API
- Custom resources are instances of CRDs
- Operators = CRDs + Controllers
- Standard kubectl commands work with custom resources
- Operators create and manage standard Kubernetes resources

**Practice Focus:**
- Create custom resources quickly (target: 2-3 minutes)
- Query and describe resources (target: 1 minute)
- Find operator-managed resources (target: 2 minutes)
- Troubleshoot operator issues (target: 3-5 minutes)

**Remember:**
- You're using operators, not building them
- Focus on practical skills, not theory
- Speed comes from practice
- Know the troubleshooting workflow

Operators and CRDs represent Kubernetes extensibility. While not the core focus of CKAD, understanding how to work with them is essential for modern Kubernetes applications.

Good luck with your CKAD preparation!
