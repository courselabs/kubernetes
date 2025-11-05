# Troubleshooting 3 - Quickfire Questions

Test your expert-level troubleshooting knowledge with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. How do you view all events across all namespaces sorted by time?

A) kubectl events --all --sort-time
B) kubectl get events --sort
C) kubectl get events -A --sort-by='.lastTimestamp'
D) kubectl get events --all-namespaces --sort-by='.metadata.creationTimestamp'

### 2. What is the purpose of the --dry-run=client flag?

A) To simulate resource creation without actually creating it
B) Both B and C
C) To show what would happen without making server-side changes
D) To test cluster connectivity

### 3. How do you watch for changes to resources in real-time?

A) kubectl watch <resource>
B) kubectl stream <resource>
C) kubectl monitor <resource>
D) kubectl get <resource> --watch

### 4. Which command shows the resource requests and limits for all Pods in a namespace?

A) kubectl describe pods | grep -i resources
B) kubectl resources pods
C) kubectl top pods --requests
D) kubectl get pods -o custom-columns=NAME:.metadata.name,CPU_REQ:.spec.containers[*].resources.requests.cpu,MEM_REQ:.spec.containers[*].resources.requests.memory

### 5. How do you check why a PersistentVolumeClaim is not binding?

A) kubectl events pvc pvc-name
B) kubectl logs pvc pvc-name
C) kubectl status pvc pvc-name
D) kubectl describe pvc pvc-name

### 6. What command shows the API resources supported by your cluster?

A) kubectl resources list
B) kubectl api-list
C) kubectl get resources
D) kubectl api-resources

### 7. How do you temporarily change a Pod's restart policy for debugging?

A) kubectl patch pod pod-name --type=json -p='[{"op":"replace","path":"/spec/restartPolicy","value":"Never"}]'
B) kubectl set restart pod-name Never
C) You cannot change a Pod's restart policy after creation
D) kubectl edit pod pod-name

### 8. Which command shows which node a Pod is running on?

A) kubectl get pod pod-name -o wide
B) kubectl get pod pod-name -o jsonpath='{.spec.nodeName}'
C) All of the above
D) kubectl describe pod pod-name | grep Node

### 9. How do you export all resources in a namespace to YAML?

A) kubectl get all -n namespace-name -o yaml > backup.yaml
B) kubectl backup namespace-name
C) kubectl export namespace namespace-name
D) kubectl get all -o yaml > backup.yaml

### 10. What is the purpose of kubectl explain?

A) To show Pod logs with context
B) To display documentation for resource fields
C) To show detailed error explanations
D) To explain cluster status

---

## Answers

1. **C** - `kubectl get events --all-namespaces --sort-by='.lastTimestamp'` or `kubectl get events -A --sort-by='.lastTimestamp'` shows all events sorted by time.

2. **B** - `--dry-run=client` validates resources client-side without sending to the server. `--dry-run=server` sends to server for validation without creating. Both simulate without actual creation.

3. **D** - `kubectl get <resource> --watch` (or `-w`) streams updates in real-time. Watch stops on errors and can be restarted.

4. **D** - Use custom columns with jsonpath to extract specific fields. The command shown displays Pod names with CPU and memory requests (though it's complex for multiple containers).

5. **D** - `kubectl describe pvc pvc-name` shows status, events, and reasons why a PVC isn't binding (e.g., no matching PV, wrong StorageClass, insufficient capacity).

6. **D** - `kubectl api-resources` lists all resource types available in the cluster, including short names, API groups, and whether they're namespaced.

7. **C** - Most Pod spec fields, including restartPolicy, are immutable after creation. You must delete and recreate the Pod to change them.

8. **C** - All three methods work: `-o wide` shows the node column, `describe` shows it in output, and jsonpath directly extracts the `spec.nodeName` field.

9. **A** - `kubectl get all -n namespace-name -o yaml > backup.yaml` exports resources. Note: "all" doesn't include everything (ConfigMaps, Secrets, PVCs require separate exports).

10. **B** - `kubectl explain <resource>` shows documentation for resource fields. Use `kubectl explain <resource>.spec.field` for specific fields, and `--recursive` for all nested fields.

---

## Study Resources

- [Lab README](README.md) - Expert troubleshooting scenarios
- [Troubleshooting Lab 1](../troubleshooting/README.md) - Basic troubleshooting
- [Troubleshooting Lab 2](../troubleshooting-2/README.md) - Intermediate troubleshooting
- [Official kubectl Reference](https://kubernetes.io/docs/reference/kubectl/)
