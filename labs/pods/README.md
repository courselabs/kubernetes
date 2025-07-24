# Running Containers in Pods

The [Pod](https://kubernetes.io/docs/concepts/workloads/pods/) is the basic unit of compute in Kubernetes. Pods run containers - it's their job to ensure the container keeps running.

Pod specs are very simple. The minimal YAML needs some metadata - like the name of the Pod - and the specification needs a name for the container, and the image to run.


## API specs

- [Pod](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/)

<details>
  <summary>YAML overview</summary>

This is as simple as it gets for a Pod:

```
apiVersion: v1
kind: Pod
metadata:
  name: whoami
spec:
  containers:
    - name: app
      image: sixeyed/whoami:21.04
```

Every Kubernetes resource requires these four fields:

* `apiVersion` - resource specifications are versioned to support backwards compatibility
* `kind` - the type of the object
* `metadata` - collection of additional object data
  * `name` - the name of the object

The format of the `spec` field is different for every object type. For Pods, this is the minimum you need:

* `containers`- list of containers to run in the Pod (at least one)
  * `name` - the name of the container
  * `image` - the Docker image to run

> Indentation is important in YAML - object fields are nested with spaces. 

</details><br/>

## Run a simple Pod

You use Kubectl to query objects, but also to manage them. You create any object from YAML using the `apply` command.

- [whoami-pod.yaml](specs/whoami-pod.yaml) is the Pod spec for a simple web app

Deploy the app from your local copy of the course repo:

```powershell
kubectl apply -f labs/pods/specs/whoami-pod.yaml
```

Or the path to the YAML file can be a web address:

```powershell
kubectl apply -f https://kubernetes.courselabs.co/labs/pods/specs/whoami-pod.yaml
```

> The output shows you that nothing has changed. Kubernetes works on **desired state** deployment and both the local and remote YAML files have the same spec.

Now you can use the familiar commands to print information:

```powershell
kubectl get pods

kubectl get po -o wide
```

> The second command uses the short name `po` and adds extra columns, including the Pod IP address.

What extra information do you see in the `wide` output, and how would you print all the Pod information in a readable format?

📋 Print the Pod details.

<details>
  <summary>Not sure how? </summary>

The wide output for Pods shows additional columns for the IP address of the Pod, and the node it is running on. You can see that and more if you `describe` the Pod:

```powershell
# the get and describe commands work for all resources:
kubectl describe pod whoami
```
</details><br/>

## Working with Pods

Production Kubernetes clusters have many nodes to run workloads, and the Pod could be running on any one. You manage it using Kubectl so you don't need access to the server directly.

📋 Print the container logs (remember `kubectl --help`).

<details>
  <summary>Not sure how?</summary>

```powershell
kubectl logs whoami
```
</details><br/>

You can get the logs from any type of application running in a Pod. You can also execute commands inside the Pod container and see the output:

```powershell
kubectl exec whoami -- date
```

> With `exec` Kubernetes makes a connection to the Pod container, starts a shell session and sends in whatever command you pass after the two dashes `--`. 

This container image is based on a minimal Linux OS, and it has all the usual command line tools instaled.

Let's try another Pod:

- [sleep-pod.yaml](specs/sleep-pod.yaml) runs an app which does nothing

📋 Deploy the new app from `labs/pods/specs/sleep-pod.yaml` and check it is running.

<details>
  <summary>Not sure how?</summary>

```powershell
kubectl apply -f labs/pods/specs/sleep-pod.yaml

kubectl get pods
```
</details><br/>

This Pod container has a Linux shell and some useful tools installed. You can start a shell inside the contianer and connect to it using the interactive `-it` flag:

```powershell
kubectl exec -it sleep -- sh
```

Now you're connected inside the container; you can explore the container environment:

```container
# print the name of the computer - which is really a container:
hostname

# print all the environment variables:
printenv
```

The container images has some networking tools installed:

- `nslookup` does a domain name (DNS) lookup and returns with an IP address for the name
- `ping` sends network traffic to an address

Those are useful for checking connectivity in the Pod container:

```container
# find the address of the Kubernetes API server:
nslookup kubernetes

# try to ping the API server (this_could_fail):
ping kubernetes -c1 -W2
```

> The Kubernetes API server is available for Pod containers to use, but not all Kubernetes deployments support the ping protocol for internal addresses, so you may see `100% packet loss`

## Connecting from one Pod to another

Exit the shell session on the sleep Pod:

```container
exit
```

📋 Print the IP address of the original whoami Pod.

<details>
  <summary>Not sure how?</summary>

Lots of ways to see this, but the wide output is the easiest:

```powershell
kubectl get pods -o wide whoami
```
</details><br/>

> That shows the internal IP address of the Pod - any other Pod in the cluster can connect on that address.

The sleep Pod container has cURL installed, which you can use to make a request to the HTTP server in the whoami Pod. We'll store the IP address in a variable to make the commands easier:

```powershell
$ip = kubectl get pod whoami -o jsonpath='{.status.podIP}'
echo "whoami pod IP address: $ip"
kubectl exec sleep -- curl -s $ip
```

> The output is the response from the HTTP server running in the whoami Pod - it includes the hostname and IP addresses

## Lab

Pods are an abstraction over containers. They wrap the container and monitor it - if the app crashes the Pod restarts, creating a new container to keep your app running. This is the first layer of high-availability Kubernetes provides.

You can see this in action with a badly-configured app, where the container keeps exiting. Write your own Pod spec to run a container from the Docker Hub image `courselabs/bad-sleep`. Deploy your spec and watch the Pod - what happens after about 30 seconds? And after a couple of minutes?

Kubernetes will keep trying to make the Pod work, so you can remove it when you're done.

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).


___
## Cleanup

We'll clean up before we move on, deleting all the Pods we created:

```powershell
kubectl delete pod sleep whoami sleep-lab --ignore-not-found
```