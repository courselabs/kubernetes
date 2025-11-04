# Troubleshooting Application Modeling in Kubernetes

🎯 **CKAD Core Topic** - Essential for CKAD exam preparation

Modelling apps in Kubernetes involves multiple resources, Even simple apps use ConfigMaps, Secrets, PersistentVolumes, and Namespaces. Any mistakes in configuration will make apps fail in interesting ways.

## Lab

This lab presents a (pretend) web application that reads configuration from a ConfigMap, database credentials from a Secret, and stores data in a PersistentVolume. The app is deployed to a custom namespace.

Try running this app - and make whatever changes you need to get the app running, so the Pod is healthy and you can access the application.

```
kubectl apply -f labs/troubleshooting-2/specs/
```

> Your goal is to browse to http://localhost:8040 or http://localhost:30040 and see the web app displaying its configuration

Don't go straight to the solution! These configuration issues are common in real deployments, so it's important to practice diagnosing and fixing them.

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

___
## Cleanup

When you're done you can remove all the objects:

```
kubectl delete ns troubleshooting-2

kubectl delete cm -A -l kubernetes.courselabs.co=troubleshooting-2
```