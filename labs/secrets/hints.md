# Lab Hints

Deployments only trigger a Pod rollout if the Pod spec changes. 

There are two approaches for this. One preserves your config changes by keeping old objects in Kubernetes, rather than replacing the Secret for each update.

The other replaces the secret and uses metadata to trigger the Deployment change.

> Need more? Here's the [solution](solution.md).