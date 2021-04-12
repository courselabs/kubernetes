
## Run the app

```
kubectl apply -f labs/troubleshooting/specs/pi-failing
```

## Troubleshooting Deployments

1. Fix the labels in the Pod spec

k get po 

2. Scale up :) (replicas=0 is perfectly valid)

k describe po -l app=pi-web

3. Reduce resource requests (large numbers will only work on powerful nodes)

k get po

`ErrImagePull`

4. Fix image name :)

k get po

`RunContainerError`

5. Fix command

Pods run :)

## Troubleshooting Services

```
curl http://localhost:8020
```

k get endpoints pi-lb

> no endpoints

1. Fix selector

k get endpoints pi-lb

> still no endpoints

2. Fix target port name

Works.