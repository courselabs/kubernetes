# Operators Exercises - Practical Demo
**Duration: 20-25 minutes**

---

## Setup and Introduction (1:00)

Welcome to the hands-on Operators exercises. In this session, we'll work with real operators, experiencing how they simplify complex application deployment and management.

Important note: Some operators don't support ARM64 processors. If you're using Apple Silicon, you may encounter issues with certain exercises.

We'll be working with:
- Creating and managing Custom Resource Definitions (CRDs)
- Deploying the NATS operator for message queues
- Deploying the MySQL operator for databases
- Understanding operator-managed resources
- Completing a lab challenge with a full application stack

Let's begin by exploring Custom Resource Definitions.

---

## Exercise 1: Understanding Custom Resource Definitions (3:00)

**Timing: 0:00-4:00**

Before working with full operators, let's understand CRDs at a fundamental level.

We have a simple CRD that defines a "Student" resource. Let's look at it:

The student-crd.yaml defines:
- API group and version
- Resource names (plural, singular, kind)
- Schema with fields: email and company
- Additional printer columns for kubectl output

This CRD is just a schema definition. It tells Kubernetes how to store and display Student resources, but it doesn't include any logic or automation.

Let's install it:


Now let's verify the CRD was created:


We see our new "students" CRD. Let's get more details:


The description shows the schema, validation rules, and how resources will be displayed.

Now Kubernetes understands the Student resource type. Let's create some students.

We have YAML files for two students - Edwin who works at Microsoft, and Priti who works at Google.


Let's list our students:


Perfect! We see both students with their companies displayed. This works because the CRD specified additional printer columns.

Let's get details for Priti:


We see all the student information. This demonstrates that CRDs allow you to extend Kubernetes with your own resource types.

Important point: This is just storage. The CRD doesn't do anything beyond letting us create and store these resources. For automation and logic, we need an operator with a controller.

---

## Exercise 2: Installing the NATS Operator (4:00)

**Timing: 4:00-8:00**

Now let's work with a real operator. NATS is a high-performance message queue, and it has an operator that simplifies deployment and management.

The NATS operator deployment includes:
- RBAC resources (ServiceAccount, ClusterRole, ClusterRoleBinding)
- A Deployment running the operator Pod

Let's install it:


Notice the output shows multiple resources being created. Let's check what CRDs the operator installed:


Interesting! We now see NatsCluster and NatsServiceRole CRDs in addition to our Student CRD. But we didn't apply these CRDs - how did they get created?

The NATS operator Pod installed them programmatically using the Kubernetes API. Let's verify the operator has permission to do this:


Yes, the operator's ServiceAccount has permission to create CRDs. This is common for operators - they often install their own CRDs as part of their initialization.

Let's check the operator Pod:


The operator is running and watching for NatsCluster resources.

---

## Exercise 3: Creating a NATS Cluster with the Operator (5:00)

**Timing: 8:00-13:00**

Now let's use the operator to deploy a message queue cluster.

We have a NatsCluster custom resource that defines a 3-server NATS cluster running version 2.5:


A single resource was created. But let's see what the operator did:


The operator created multiple Pods and Services! There's no Deployment or ReplicaSet - the operator is directly managing these Pods.

Let's check the operator logs to see what happened:


The logs show the operator detecting the NatsCluster resource and creating the infrastructure. This is the controller loop in action.

Let's look at one of the NATS Pods:


In the "Controlled By" section, we see "NatsCluster/msgq". The operator is the controller for these Pods.

This is unusual - most operators use Deployments or StatefulSets to manage Pods. NATS operator directly manages Pods to have fine-grained control over the cluster formation.

Let's test the operator's high-availability capabilities. Delete one of the Pods:


Watch what happens:


A new Pod named msgq-2 appears! The operator detected the Pod deletion and recreated it to maintain the desired state of 3 servers.

Check the operator logs:


The logs show the operator detecting the deletion and creating a replacement. This is continuous reconciliation in action.

---

## Exercise 4: Installing the MySQL Operator (4:00)

**Timing: 13:00-17:00**

Let's work with a more sophisticated operator. The Presslabs MySQL operator provides production-grade database clusters.

This operator is distributed as a Helm chart. Let's install it:


The operator installation includes many resources. Let's wait for it to be ready:


The operator Pod might restart once during initialization - this is normal. Once it's running and ready, let's explore what resources we need to create a database cluster.

The Helm output gives us hints:
- We need a MysqlCluster custom resource
- We need a Secret containing the admin password

Let's check the CRDs that were installed:


We see several MySQL-related CRDs. The main one is mysqlclusters.

Now let's create a database cluster. We have two files:
- A Secret with the database password
- A MysqlCluster resource defining a 2-server replicated cluster


This creates our custom resource. Now let's watch what the operator does:


We'll see Pods starting: db-mysql-0, then db-mysql-1. These take a few minutes to fully initialize.

---

## Exercise 5: Understanding Operator-Managed Resources (3:00)

**Timing: 17:00-20:00**

While the database Pods are starting, let's understand what the MySQL operator created.

First, what controller is being used?


The operator created a StatefulSet! This is more typical than NATS's approach. StatefulSets provide stable pod identity, which is perfect for databases.

Let's look at one of the database Pods once it's running:


Look at the containers section. The operator configured:
- Two init containers for setup and configuration
- The main MySQL container
- Three sidecar containers for metrics export and health checking

This is complex! The operator encoded all this operational knowledge so we don't have to.

Let's check the primary database server logs:


We see MySQL starting up and becoming ready for connections.

Now check the secondary database server:


We see replication starting from the primary. The operator configured replication automatically!

This demonstrates the power of operators: we declared "I want a 2-server MySQL cluster" and the operator handled all the complexity:
- StatefulSet configuration
- Persistent volume claims
- Init containers for setup
- Sidecar containers for monitoring
- Replication configuration
- Service creation

All from a simple custom resource declaration.

---

## Exercise 6: Lab Challenge - Complete Application Stack (5:00)

**Timing: 20:00-25:00**

Now for the lab challenge. We need to deploy a complete application stack using both operators.

First, let's clean up the existing operator-managed resources:


Watch what happens - the operators detect the deletions and clean up all the resources they created. This is proper cleanup through the operator pattern.

Now let's deploy our application:


This deploys:
- A web frontend
- A message handler
- Services for both components

Try accessing the application:


We get an error! The application needs infrastructure that doesn't exist yet.

Looking at the application code, we can see it needs:
- A NATS message queue at "msgq" service
- A MySQL database at "db-mysql" service

Our challenge: create NatsCluster and MysqlCluster resources that match these requirements.

For NATS, we need:
- Name: msgq (this creates a service named "msgq")
- 3 servers for high availability

For MySQL, we need:
- Name: db-mysql (this creates the right service name)
- The database must contain the schema for the todo app

Let me create the NATS cluster:


And the MySQL cluster:


Wait for the infrastructure to be ready:


Once everything is running, test the application:


Success! The application is working. We can create todo items through the web interface, they're posted to the NATS queue, the message handler processes them and stores them in MySQL.

We deployed complex infrastructure (message queue cluster and database cluster) using simple custom resource definitions. The operators handled all the complexity.

---

## Cleanup and Summary (1:00)

Let's clean up our work:


Let's review what we learned:

**Key Concepts:**
- CRDs extend Kubernetes with custom resource types
- Operators combine CRDs with controllers for automation
- Controllers watch resources and reconcile state continuously
- Operators encode operational knowledge and best practices
- Custom resources are managed like standard Kubernetes resources

**Operator Benefits:**
- Simplified management of complex applications
- Automatic handling of operational tasks
- Consistent interface using kubectl
- Self-healing and continuous reconciliation
- Declarative operations

**CKAD Relevance:**
- Understanding CRDs (required)
- Creating and managing custom resources (required)
- Working with operator-managed applications
- Basic troubleshooting

In the next session, we'll focus on CKAD exam-specific scenarios for working with Custom Resource Definitions and operator-managed applications.

Thank you for following along with these exercises.
