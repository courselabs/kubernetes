# Lab Hints

Fixing deployments is usually about checking the status of running objects and seeing what's wrong, then fixing up the YAML and redeploying.

## Troubleshooting Deployments

1. If the spec isn't valid you'll get a useful error from Kubectl

2. Remember the relationship between objects - you'll need to investigate with `get` and `describe` for Pods, ReplicaSets and Deployments.

## Troubleshooting Services

1. If the spec isn't valid you'll get a useful error from Kubectl

1. The relationship between Services, Pods and container ports is what you need to investigate.

> Need more? Here's the [solution](solution.md).