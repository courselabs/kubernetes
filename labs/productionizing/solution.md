# Lab Solution

Here's my solution:

- [deployment-productionized.yaml](labs/productionizing/solution/deployment-productionized.yaml) - adds CPU resources and container probes
- [hpa-cpu.yaml](labs/productionizing/solution/hpa-cpu.yaml) - HPA to scale the Deployment

```
kubectl apply -f labs/productionizing/solution
```

Open three terminals and you can watch the repair and scale in action:

```
kubectl get pods -l app=configurable --watch

kubectl get endpoints configurable-lb --watch

kubectl get hpa configurable-cpu --watch
```

> Browse to the app and refresh lots. You'll still see failures because the app fails so frequently, but leave it a few seconds between refreshes and the app comes back online.

## Testing the HPA

The HPA is independent of the Deployment. You can scale the Deployment manually (or delete Pods to simulate node loss) and the HPA will override it.

Scale down manually:

```
kubectl scale deployment/configurable --replicas 1

kubectl get hpa configurable-cpu --watch
```

> The HPA scales back up after a few minutes - the minimum is not dependent on CPU usage and it overrides the scale setting for the Deployment

Scale up manually:

```
kubectl scale deployment/configurable --replicas 8

kubectl get hpa configurable-cpu --watch
```

> After a few more minutes the HPA scales down - it scales down to the maximum initially, but there's no CPU activity so it will repeatedly scale down until it gets to the minimum.

You can't configure the scale-up and scale-down timings for v1 HPAs. If you need that level of control you can use [HorizontalPodAutoscaler v2beta2](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#horizontalpodautoscaler-v2beta2-autoscaling), which is a more complex HPA spec.