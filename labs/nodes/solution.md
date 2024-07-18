# Lab Solution

The easiest way to see labels for an object is with the `show-labels` option to the `get command`:

```
kubectl get nodes --show-labels
```

To see specific label values you can print the labels as columns - this adds CPU architecture and OS to the table:

```
kubectl get nodes --label-columns kubernetes.io/arch,kubernetes.io/os
```

Alternatively you can query the labels field in the metadata using JSONPath:

```
kubectl get node <node-name> -o jsonpath='{.metadata.labels}'
```

Or you can query for specific values with a Go template:

```
# with Bash/pwsh:
kubectl get node <node-name> -o go-template='{{index .metadata.labels "kubernetes.io/arch"}}'

# OR with Windows PowerShell (which doesn't like the forward slash in the label key):
kubectl get node <node-name> -o go-template='{{index .metadata.labels `"kubernetes.io/arch`"}}'
```

> Back to the [exercises](README.md).