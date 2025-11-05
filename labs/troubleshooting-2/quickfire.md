# Troubleshooting 2 - Quickfire Questions

Test your advanced troubleshooting knowledge with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. How do you check the current API server version?

A) kubectl cluster-info
B) kubectl api-versions
C) kubectl get apiserver
D) kubectl version

### 2. What does the Evicted status on a Pod indicate?

A) The Pod's image was not found
B) The Pod was manually deleted
C) The Pod crashed
D) The Pod was removed due to node resource pressure

### 3. How do you get detailed information about all resources of a specific type?

A) kubectl get <resource-type> -o yaml
B) kubectl list <resource-type> --verbose
C) kubectl info <resource-type>
D) kubectl describe all <resource-type>

### 4. Which command shows the current state of cluster nodes?

A) kubectl get nodes
B) kubectl describe nodes
C) kubectl node status
D) kubectl cluster nodes

### 5. How do you copy files from a Pod to your local machine?

A) kubectl cp pod-name:/path/file ./local-file
B) kubectl copy pod-name:/path/file ./local-file
C) kubectl download pod-name:/path/file
D) kubectl get file pod-name:/path/file

### 6. What is the purpose of kubectl port-forward?

A) To change Service ports
B) To expose Services externally
C) To forward local ports to a Pod or Service for testing
D) To configure network policies

### 7. How do you view the YAML definition of a running resource?

A) kubectl show <resource> <name>
B) kubectl describe <resource> <name>
C) kubectl get <resource> <name> -o yaml
D) kubectl yaml <resource> <name>

### 8. Which command forces deletion of a stuck Pod?

A) kubectl delete pod pod-name --force
B) kubectl delete pod pod-name --force --grace-period=0
C) kubectl remove pod pod-name --force
D) kubectl kill pod pod-name

### 9. How do you check if a specific API resource is available in your cluster?

A) kubectl api-resources | grep <resource>
B) kubectl check resource <resource>
C) kubectl verify <resource>
D) kubectl has <resource>

### 10. What does kubectl diff do?

A) Compares two clusters
B) Shows differences between current and applied configurations
C) Compares two resources
D) Shows API version differences

---

## Answers

1. **D** - `kubectl version` shows both client and server (API server) versions. `--short` flag provides a concise output.

2. **D** - Evicted status means the Pod was removed due to node resource pressure (disk, memory, or PID pressure). Check node conditions with `kubectl describe node`.

3. **A** - `kubectl get <resource-type> -o yaml` outputs all resources of that type in YAML format. For detailed info on a specific resource, use `kubectl describe`.

4. **A** - `kubectl get nodes` shows node status. Add `-o wide` for more details or use `kubectl describe nodes` for comprehensive information.

5. **A** - `kubectl cp pod-name:/path/file ./local-file` copies files. For multi-container Pods, specify container with `-c container-name`.

6. **C** - `kubectl port-forward` forwards local ports to Pods or Services for testing and debugging without exposing them externally. Example: `kubectl port-forward pod-name 8080:80`.

7. **C** - `kubectl get <resource> <name> -o yaml` outputs the complete YAML definition. Use `-o json` for JSON format.

8. **B** - `kubectl delete pod pod-name --force --grace-period=0` forces immediate deletion. Use cautiously as it bypasses graceful shutdown.

9. **A** - `kubectl api-resources` lists all available resource types. Pipe to `grep` to search for specific resources: `kubectl api-resources | grep deployment`.

10. **B** - `kubectl diff -f file.yaml` shows differences between the current live configuration and the configuration in the file before applying.

---

## Study Resources

- [Lab README](README.md) - Advanced troubleshooting scenarios
- [Troubleshooting Lab 1](../troubleshooting/README.md) - Basic troubleshooting
- [Official Debug Documentation](https://kubernetes.io/docs/tasks/debug/)
