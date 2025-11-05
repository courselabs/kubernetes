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

**Key Points to Understand:**

**metadata.name Format:**
Must be . For example, .

**spec.names:**
Defines how you reference the resource:
- : Used with kubectl get (e.g., )
- : Used with kubectl get single resource
- : Used in YAML manifests
- : Abbreviations for kubectl

**spec.scope:**
- : Resources belong to a namespace
- : Resources are cluster-wide

**spec.versions.schema:**
OpenAPI v3 schema defining valid fields and their types.

You can use  to understand CRD structure:

---

## Working with Custom Resources (3:00)

**Timing: 6:00-9:00**

This is the core CKAD skill: creating and managing custom resources.

**Creating a Custom Resource:**

Once a CRD is installed, you create resources with standard YAML:

Apply it:

**Quick Creation from Command Line:**

For the exam, you might need to create custom resources quickly:

**Listing Custom Resources:**

**Describing Custom Resources:**

**Updating Custom Resources:**

**Deleting Custom Resources:**

All standard kubectl commands work with custom resources!

---

## Common Exam Scenarios (5:00)

**Timing: 9:00-14:00**

Let's practice typical exam scenarios.

**Scenario 1: List Available CRDs**

Task: "List all Custom Resource Definitions in the cluster."

Solution:

Time: 30 seconds

**Scenario 2: Create Custom Resource**

Task: "Create a Backend resource named 'web-backend' with 3 replicas using image nginx:1.25."

Solution:

Time: 2-3 minutes

**Scenario 3: Modify Custom Resource**

Task: "Update the web-backend to use 5 replicas."

Solution:

Time: 1 minute

**Scenario 4: Work with Operator-Managed Resources**

Task: "A PostgresCluster named 'production-db' is deployed. Find all Pods managed by this operator."

Solution:

Time: 2 minutes

**Scenario 5: Troubleshoot Failing Custom Resource**

Task: "The Backend resource 'api-backend' isn't working. Investigate and fix."

Solution workflow:

Time: 3-5 minutes

---

## Querying Custom Resources Efficiently (2:00)

**Timing: 14:00-16:00**

Speed matters in the exam. Practice these query techniques.

**Quick Status Check:**

**Finding Related Resources:**

**Validation Before Creating:**

---

## Understanding Operator-Managed Applications (3:00)

**Timing: 16:00-19:00**

The exam may ask you to work with applications deployed by operators.

**Key Understanding:**

Operators create standard Kubernetes resources. When troubleshooting:

**1. Identify the Custom Resource:**

**2. Check Custom Resource Status:**

**3. Find Managed Resources:**

**4. Check Operator Health:**

**Example Workflow:**

"The database deployed by an operator isn't accessible."

---

## Practice Exercise 1: Complete CRD Workflow (3:00)

**Timing: 19:00-22:00**

Timed exercise - you have 3 minutes.

**Scenario:**
A CRD named  is installed in the cluster. Create a Database resource named 'app-db' with the following:
- engine: postgres
- version: "14"
- storage: 10Gi
- replicas: 2

Then verify it's created and check its status.

**Start timing...**

**Solution:**

Target time: 2-3 minutes. Practice until you're comfortable.

---

## Practice Exercise 2: Troubleshooting (2:00)

**Timing: 22:00-24:00**

**Scenario:**
An Application custom resource named 'web-app' exists, but no pods are running. Investigate and determine the likely cause.

**Solution workflow:**

---

## Exam Tips and Best Practices (1:00)

**Before the Exam:**
- Practice creating custom resources quickly
- Know how to use kubectl explain with CRDs
- Practice finding operator-managed resources
- Understand owner references and labels
- Know basic troubleshooting workflow

**During the Exam:**
- Use  to understand CRD structure
- Use  to see custom resource status
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
