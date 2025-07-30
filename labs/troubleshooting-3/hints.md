# Lab Hints

This lab combines Helm templating issues with advanced Kubernetes resource problems. Start with getting Helm to install successfully, then debug the application issues.

## Troubleshooting Helm Installation

1. Use `helm install --dry-run --debug` to see what templates would be generated

2. Check for template syntax errors and undefined variables

3. Verify that template variable references match the values.yaml structure

4. Look for inconsistent label selectors between related resources

5. Use `helm template <chart-path>` to render templates without installing

## Once Helm Installs Successfully...

## Troubleshooting the Web Application

1. Check if the web deployment pods are starting successfully

2. Check if the Ingress can find the correct Service name

## Troubleshooting the Database StatefulSet

1. StatefulSets require a matching headless Service name in the `serviceName` field

2. Verify volumeMount names match volumeClaimTemplate names exactly

## Troubleshooting Ingress Access

1. The Ingress may have host restrictions that prevent localhost access

2. Check if the Ingress backend service name matches the actual Service

4. Verify that an Ingress controller is running in your cluster

Use `kubectl get pods,svc,ing,pvc -n troubleshooting-app` to see all resources after each fix attempt.

> Need more? Here's the [solution](solution.md).