# Lab Solution

You can list the processes in Linux with `ps`:

```
kubectl exec sleep -- ps
```

You'll find the `sleep` command is PID 1. That's the container startup process, so if you remove that the container will exit:

```
kubectl exec sleep -- kill 1
```

Check the Pod and you'll see it has restarted:

```
kubectl get pods
```

> Pods restart by creating a new container **not** by restarting the existing container

You can see that in the JSON Pod details under the `containerStatuses` field:

```
kubectl get pod sleep -o json
```

If you repeatedly force a restart, Kubernetes changes the state of the Pod. Run the `get` command with the `watch` option:

```
kubectl get pods sleep --watch
```

> Watch checks the status of the object and prints any changes

Now open a new terminal window and run the kill command a few more times:

```
kubectl exec sleep -- kill 1
```

> The status changes to `Error` then `Running` again, but if you repeatedly kill the process the Pod enters `CrashLoopBackOff` status.


---

[Back](./)