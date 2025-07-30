# Troubleshooting Advanced Kubernetes Components

More advanced app models use Helm for package management, along with complex resources like Ingress for HTTP routing and StatefulSets for stateful applications.

When these components are misconfigured within a Helm chart, debugging requires understanding both Helm templating and the underlying Kubernetes resources.

## Lab

This lab presents a broken application packaged as a Helm chart. The chart deploys a web frontend with Ingress routing and a PostgreSQL database using StatefulSet.

Deploy the Ingress Controller:

```
kubectl apply -f labs/ingress/specs/ingress-controller
```

Install the Helm chart:

```
helm upgrade --install broken-app labs/troubleshooting-3/specs/app-chart/ --create-namespace --namespace troubleshooting-3
```

Your goals:

1. Fix the Helm deployment so it installs successfully

2. Browse tohttp://whoami.local:8000/ and see the web app served through the Ingress

Don't go straight to the solution! Start by investigating why the Helm install fails, then work through the subsequent issues you'll discover.

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

___
## Cleanup

When you're done you can remove all the objects:

```
helm uninstall broken-app -n troubleshooting-app
kubectl delete pvc --all -n troubleshooting-app
kubectl delete ns troubleshooting-app
```