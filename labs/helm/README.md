
## Install Helm CLI

Full install instructions https://helm.sh/docs/intro/install/

The simple way, if you have a package manager installed:

```
# On Windows using Chocolatey:
choco install kubernetes-helm

# On MacOS using brew:
brew install helm

# On Linux:
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```

Test with:

```
helm version
```

## Deploy a chart with default values

```
helm install whoami-default labs\helm\charts\whoami

helm ls

kubectl get all
```

Check labels & selector:

```
kubectl get po -o wide --show-labels

kubectl describe svc whoami-default-server 
```

> Both pods in service

```
curl localhost:30820
```


## Install & upgrade a chart with custom values


```
helm install whoami-custom --set replicaCount=1 --set serverMode=V --set serviceNodePort=30821 labs\helm\charts\whoami

helm ls

kubectl get all -l app=whoami-custom
```

```
curl localhost:30821
```

```
# this will fail - need to include previous values
helm upgrade whoami-custom --set serverMode=q labs\helm\charts\whoami

helm upgrade whoami-custom --reuse-values --set serverMode=q labs\helm\charts\whoami

curl localhost:30821
```

```
helm history whoami-custom

k get deploy whoami-custom-server --show-labels

k get rs -l app=whoami-custom
```


## Using chart repositories

```
helm repo ls

helm repo add kiamol https://kiamol.net

helm repo update
```

```
helm search repo vweb --versions

helm show values kiamol/vweb --version 2.0.0

helm install --set replicaCount=1 --set serviceType=NodePort --set servicePort=30890 vweb kiamol/vweb  --version 2.0.0

k get svc
```

> http://localhost:30890


## Lab

Install the Nginx Ingress controller with Helm, using the values file in labs\helm\ingress-nginx\dev.yaml.

Browse to the HTTP endpoint and confirm you get a response from Nginx.
