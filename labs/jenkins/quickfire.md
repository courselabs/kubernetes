# Jenkins CI/CD - Quickfire Questions

Test your knowledge of Jenkins for Kubernetes CI/CD with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What is Jenkins primarily used for?

A) Container orchestration
B) Continuous Integration and Continuous Delivery (CI/CD) automation
C) Service mesh
D) Container registry

### 2. What is a Jenkins Pipeline?

A) A network pipeline
B) A suite of plugins and code defining the CI/CD workflow
C) A container image
D) A Kubernetes resource

### 3. What are the two types of Jenkins Pipelines?

A) Simple and Complex
B) Declarative and Scripted
C) Sequential and Parallel
D) Basic and Advanced

### 4. What is a Jenkinsfile?

A) A log file
B) A text file containing Pipeline definition, stored in version control
C) A configuration file for Jenkins server
D) A Docker file

### 5. What is the purpose of Jenkins agents (slaves)?

A) To monitor Jenkins
B) To execute build jobs on different machines/containers
C) To store artifacts
D) To manage users

### 6. How can Jenkins integrate with Kubernetes?

A) It cannot integrate
B) Using the Kubernetes plugin to dynamically provision agent Pods
C) Only through manual configuration
D) Only in cloud environments

### 7. What is a Jenkins stage?

A) A deployment environment
B) A logical subdivision of a Pipeline (e.g., Build, Test, Deploy)
C) A server tier
D) A container

### 8. What does the Jenkins Kubernetes plugin do?

A) Deploys to Kubernetes only
B) Dynamically provisions Jenkins agents as Kubernetes Pods
C) Monitors Kubernetes clusters
D) Replaces kubectl

### 9. What is the purpose of Jenkins credentials?

A) User authentication only
B) Securely storing and managing sensitive information like passwords, API tokens, SSH keys
C) Container credentials only
D) Network authentication

### 10. What is a Jenkins Multibranch Pipeline?

A) A pipeline with multiple stages
B) A pipeline that automatically creates sub-pipelines for each branch in a repository
C) A distributed pipeline
D) A parallel pipeline

---

## Answers

1. **B** - Jenkins is an automation server for CI/CD, automating building, testing, and deploying applications through customizable pipelines.

2. **B** - A Jenkins Pipeline is a suite of plugins supporting implementing and integrating continuous delivery pipelines, defined as code in a Jenkinsfile.

3. **B** - The two types are Declarative (structured, easier syntax with `pipeline {}` block) and Scripted (more flexible, Groovy-based with `node {}` block).

4. **B** - A Jenkinsfile is a text file containing the Pipeline definition, typically stored in source control alongside application code, enabling "Pipeline as Code."

5. **B** - Jenkins agents (formerly called slaves) are machines/containers that execute build jobs, allowing distributed builds and isolation of build environments.

6. **B** - The Kubernetes plugin allows Jenkins to dynamically provision agent Pods in Kubernetes, scaling build capacity and providing isolated build environments.

7. **B** - A stage is a logical block in a Pipeline that groups related steps (e.g., "Build" stage might compile code, "Test" stage runs tests).

8. **B** - The Jenkins Kubernetes plugin dynamically creates Jenkins agent Pods on-demand for builds, automatically cleaning them up afterward, providing efficient resource usage.

9. **B** - Jenkins credentials securely store sensitive information (passwords, tokens, keys, certificates) with encryption, access control, and integration into Pipelines.

10. **B** - A Multibranch Pipeline automatically discovers branches and pull requests in a repository, creating a sub-pipeline for each, enabling CI/CD per branch.

---

## Study Resources

- [Lab README](README.md) - Jenkins CI/CD concepts
- [Official Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Kubernetes Plugin](https://plugins.jenkins.io/kubernetes/)
