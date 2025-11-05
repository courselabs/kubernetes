# Jenkins CI/CD - Quickfire Questions

Test your knowledge of Jenkins for Kubernetes CI/CD with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is Jenkins primarily used for?

A) Container registry
B) Container orchestration
C) Service mesh
D) Continuous Integration and Continuous Delivery (CI/CD) automation

### 2. What is a Jenkins Pipeline?

A) A suite of plugins and code defining the CI/CD workflow
B) A Kubernetes resource
C) A network pipeline
D) A container image

### 3. What are the two types of Jenkins Pipelines?

A) Declarative and Scripted
B) Basic and Advanced
C) Sequential and Parallel
D) Simple and Complex

### 4. What is a Jenkinsfile?

A) A Docker file
B) A log file
C) A configuration file for Jenkins server
D) A text file containing Pipeline definition, stored in version control

### 5. What is the purpose of Jenkins agents (slaves)?

A) To execute build jobs on different machines/containers
B) To manage users
C) To monitor Jenkins
D) To store artifacts

### 6. How can Jenkins integrate with Kubernetes?

A) Only through manual configuration
B) Using the Kubernetes plugin to dynamically provision agent Pods
C) Only in cloud environments
D) It cannot integrate

### 7. What is a Jenkins stage?

A) A deployment environment
B) A logical subdivision of a Pipeline (e.g., Build, Test, Deploy)
C) A server tier
D) A container

### 8. What does the Jenkins Kubernetes plugin do?

A) Monitors Kubernetes clusters
B) Dynamically provisions Jenkins agents as Kubernetes Pods
C) Replaces kubectl
D) Deploys to Kubernetes only

### 9. What is the purpose of Jenkins credentials?

A) Container credentials only
B) Securely storing and managing sensitive information like passwords, API tokens, SSH keys
C) Network authentication
D) User authentication only

### 10. What is a Jenkins Multibranch Pipeline?

A) A pipeline that automatically creates sub-pipelines for each branch in a repository
B) A parallel pipeline
C) A pipeline with multiple stages
D) A distributed pipeline

---

## Answers

1. **D** - Jenkins is an automation server for CI/CD, automating building, testing, and deploying applications through customizable pipelines.

2. **A** - A Jenkins Pipeline is a suite of plugins supporting implementing and integrating continuous delivery pipelines, defined as code in a Jenkinsfile.

3. **A** - The two types are Declarative (structured, easier syntax with `pipeline {}` block) and Scripted (more flexible, Groovy-based with `node {}` block).

4. **D** - A Jenkinsfile is a text file containing the Pipeline definition, typically stored in source control alongside application code, enabling "Pipeline as Code."

5. **A** - Jenkins agents (formerly called slaves) are machines/containers that execute build jobs, allowing distributed builds and isolation of build environments.

6. **B** - The Kubernetes plugin allows Jenkins to dynamically provision agent Pods in Kubernetes, scaling build capacity and providing isolated build environments.

7. **B** - A stage is a logical block in a Pipeline that groups related steps (e.g., "Build" stage might compile code, "Test" stage runs tests).

8. **B** - The Jenkins Kubernetes plugin dynamically creates Jenkins agent Pods on-demand for builds, automatically cleaning them up afterward, providing efficient resource usage.

9. **B** - Jenkins credentials securely store sensitive information (passwords, tokens, keys, certificates) with encryption, access control, and integration into Pipelines.

10. **A** - A Multibranch Pipeline automatically discovers branches and pull requests in a repository, creating a sub-pipeline for each, enabling CI/CD per branch.

---

## Study Resources

- [Lab README](README.md) - Jenkins CI/CD concepts
- [Official Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Kubernetes Plugin](https://plugins.jenkins.io/kubernetes/)
