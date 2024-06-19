# Lab Hints

You can use the simple-proxy Deployment spec as a starting point - adding in the PVC setup, similar to the products-db StatefulSet.

To get your Pods created in parallel you'll need to dig into the [Kubernetes API docs](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/stateful-set-v1/#StatefulSetSpec).

> Need more? Here's the [solution](solution.md).