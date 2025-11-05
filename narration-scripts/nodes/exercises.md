# Examining Nodes - Practical Demo
## Narration Script for Hands-On Exercises (12-15 minutes)

### Section 1: Basic Node Queries (3 min)


List nodes:


Shows name, status, roles, age, version. Get more details:


Adds IP addresses, OS, kernel, container runtime. Describe a node:


Lots of information: labels, taints, capacity, allocatable, conditions, allocated resources, events.

Find node capacity:


See how much CPU and memory the node has.

### Section 2: Understanding Node Information (3 min)


Check CPU capacity:


Check memory:


Check container runtime:


Check allocated resources:


Shows percentage of CPU and memory allocated to Pods.

### Section 3: Working with Labels (3 min)


View all labels:


View specific labels as columns:


Add a custom label:


View the new label:


Remove a label:


Labels critical for Pod scheduling with nodeSelector.

### Section 4: Output Formatting (2 min)


Get node info in YAML:


Get in JSON:


Use JSONPath for specific fields:


Note: Escape dots in label names for JSONPath.

### Section 5: Using kubectl explain (2 min)


Get node documentation:


Drill into fields:


See full structure:


This shows all available fields. Essential for understanding what information is available.

### Section 6: Lab Exercise (2 min)


Task: Find your node's labels showing CPU architecture and operating system.

Approach:


Summary: kubectl provides rich node information through get, describe, and various output formats. Master these commands for efficient cluster troubleshooting and CKAD exam success.
