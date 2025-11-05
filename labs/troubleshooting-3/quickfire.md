# Troubleshooting 3 - Quickfire Questions

Test your expert-level troubleshooting knowledge with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. How do you view all events across all namespaces sorted by time?

A) kubectl get events --all-namespaces --sort-by='.metadata.creationTimestamp'
B) kubectl get events -A --sort-by='.lastTimestamp'
C) kubectl events --all --sort-time
D) kubectl get events --sort

### 2. What is the purpose of the --dry-run=client flag?

A) To test cluster connectivity
B) To simulate resource creation without actually creating it
C) To show what would happen without making server-side changes
D) Both B and C

### 3. How do you watch for changes to resources in real-time?

A) kubectl monitor <resource>
B) kubectl watch <resource>
C) kubectl get <resource> --watch
D) kubectl stream <resource>

### 4. Which command shows the resource requests and limits for all Pods in a namespace?

A) kubectl get pods -o custom-columns=NAME:.metadata.name,CPU_REQ:.spec.containers[*].resources.requests.cpu,MEM_REQ:.spec.containers[*].resources.requests.memory
B) kubectl describe pods | grep -i resources
C) kubectl top pods --requests
D) kubectl resources pods

### 5. How do you check why a PersistentVolumeClaim is not binding?

A) kubectl logs pvc pvc-name
B) kubectl describe pvc pvc-name
C) kubectl events pvc pvc-name
D) kubectl status pvc pvc-name

### 6. What command shows the API resources supported by your cluster?

A) kubectl api-resources
B) kubectl get resources
C) kubectl resources list
D) kubectl api-list

### 7. How do you temporarily change a Pod's restart policy for debugging?

A) kubectl set restart pod-name Never
B) kubectl patch pod pod-name --type=json -p='[{"op":"replace","path":"/spec/restartPolicy","value":"Never"}]'
C) You cannot change a Pod's restart policy after creation
D) kubectl edit pod pod-name

### 8. Which command shows which node a Pod is running on?

A) kubectl get pod pod-name -o wide
B) kubectl describe pod pod-name | grep Node
C) kubectl get pod pod-name -o jsonpath='{.spec.nodeName}'
D) All of the above

### 9. How do you export all resources in a namespace to YAML?

A) kubectl get all -o yaml > backup.yaml
B) kubectl export namespace namespace-name
C) kubectl get all -n namespace-name -o yaml > backup.yaml
D) kubectl backup namespace-name

### 10. What is the purpose of kubectl explain?

A) To show detailed error explanations
B) To display documentation for resource fields
C) To explain cluster status
D) To show Pod logs with context

---

## Answers

1. **B** - `kubectl get events --all-namespaces --sort-by='.lastTimestamp'` or `kubectl get events -A --sort-by='.lastTimestamp'` shows all events sorted by time.

2. **D** - `--dry-run=client` validates resources client-side without sending to the server. `--dry-run=server` sends to server for validation without creating. Both simulate without actual creation.

3. **C** - `kubectl get <resource> --watch` (or `-w`) streams updates in real-time. Watch stops on errors and can be restarted.

4. **A** - Use custom columns with jsonpath to extract specific fields. The command shown displays Pod names with CPU and memory requests (though it's complex for multiple containers).

5. **B** - `kubectl describe pvc pvc-name` shows status, events, and reasons why a PVC isn't binding (e.g., no matching PV, wrong StorageClass, insufficient capacity).

6. **A** - `kubectl api-resources` lists all resource types available in the cluster, including short names, API groups, and whether they're namespaced.

7. **C** - Most Pod spec fields, including restartPolicy, are immutable after creation. You must delete and recreate the Pod to change them.

8. **D** - All three methods work: `-o wide` shows the node column, `describe` shows it in output, and jsonpath directly extracts the `spec.nodeName` field.

9. **C** - `kubectl get all -n namespace-name -o yaml > backup.yaml` exports resources. Note: "all" doesn't include everything (ConfigMaps, Secrets, PVCs require separate exports).

10. **B** - `kubectl explain <resource>` shows documentation for resource fields. Use `kubectl explain <resource>.spec.field` for specific fields, and `--recursive` for all nested fields.

---

## Study Resources

- [Lab README](README.md) - Expert troubleshooting scenarios
- [Troubleshooting Lab 1](../troubleshooting/README.md) - Basic troubleshooting
- [Troubleshooting Lab 2](../troubleshooting-2/README.md) - Intermediate troubleshooting
- [Official kubectl Reference](https://kubernetes.io/docs/reference/kubectl/)
