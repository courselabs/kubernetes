# Hints

The app should be deployed to a namespace called `troubleshooting-app`.

First check if the namespace exists and if the resources are deployed:

- `kubectl get ns`
- `kubectl get all -n troubleshooting-app`

Look for Pods that are crashing or not starting. Check the Pod logs and descriptions:

- `kubectl describe pod -n troubleshooting-app <pod-name>`
- `kubectl logs -n troubleshooting-app <pod-name>`

Common issues with application modeling:

1. **ConfigMap/Secret mounting**: Check if the ConfigMap or Secret exists in the same namespace
2. **Volume mounting**: Verify PersistentVolumeClaim is bound and accessible
3. **Namespace isolation**: Resources must be in the same namespace to reference each other
4. **Permissions**: Some volume types need specific permissions or security contexts

Check the resources individually:

- `kubectl get cm -n troubleshooting-app`
- `kubectl get secret -n troubleshooting-app`
- `kubectl get pvc -n troubleshooting-app`
- `kubectl get pv`

> Still stuck? Check the [solution](solution.md)