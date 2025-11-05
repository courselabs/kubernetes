# Helm Exercises - Practical Demo
**Duration: 18-22 minutes**

---

## Setup and Introduction (1:00)

Welcome to the hands-on Helm exercises. In this session, we'll deploy and manage applications using Helm, following the exercises from the Helm lab README.

We'll be working with:
- Installing the Helm CLI
- Deploying charts from local directories
- Customizing releases with values
- Upgrading and rolling back releases
- Working with chart repositories
- Completing a lab challenge

Let's ensure we have a working Kubernetes cluster and begin by installing Helm.

---

## Exercise 1: Install Helm CLI (2:00)

**Timing: 0:00-2:00**

First, we need to install the Helm CLI. Helm uses the same kubeconfig as kubectl, so if you can run kubectl commands, Helm will work too.

The installation method depends on your operating system. I'll use the package manager approach as it's the simplest.

```bash
# For Windows with Chocolatey:
choco install kubernetes-helm

# For macOS with Homebrew:
brew install helm

# For Linux:
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```

Let me verify the installation:

```bash
helm version --short
```

Good, we see a version number. This confirms Helm is installed and working.

Important note: Always use Helm v3 or later. Earlier versions had a server component called Tiller which had security issues. From v3 onwards, Helm is purely client-side, which is much safer.

---

## Exercise 2: Deploy a Chart with Default Values (3:00)

**Timing: 2:00-5:00**

Now let's deploy our first Helm chart. We have a simple whoami application chart in the labs directory. Let's explore its structure first.

The chart contains:
- Chart.yaml: Metadata describing the application
- values.yaml: Default configuration values
- templates/deployment.yaml: The templated Deployment
- templates/service.yaml: The templated Service

Looking at the templates, we can see template syntax like `{{ .Values.imageTag }}` and `{{ .Release.Name }}`. These will be replaced with actual values when we install the chart.

Let's install this chart with the release name "whoami-default":

```bash
helm install whoami-default labs/helm/charts/whoami
```

Notice the output shows what was created. Helm generates standard Kubernetes resources from the templates.

Let's check our releases:

```bash
helm ls
```

We see one release named "whoami-default" with status "deployed".

Now let's look at the Kubernetes objects that were created:

```bash
kubectl get all -l app.kubernetes.io/managed-by=Helm
```

We have a Service and a Deployment. Notice the object names include the release name "whoami-default". This is how Helm allows multiple releases of the same chart without conflicts.

Let me verify the Pod labels and Service selector:

```bash
kubectl get po -o wide --show-labels

kubectl describe svc whoami-default-server
```

The labels include the release name, so multiple releases won't interfere with each other. The Service endpoints show two Pods, matching our replica count.

Let's test the application:

```bash
curl localhost:30028
```

Perfect, we get a response. If I repeat this, responses are load-balanced between Pods. The application is running with default values from the chart.

---

## Exercise 3: Install with Custom Values (3:00)

**Timing: 5:00-8:00**

Now let's explore customization. Helm's real power comes from being able to override default values.

Looking at the values.yaml file, we can see all the available variables:
- imageTag
- replicaCount
- serviceNodePort
- serverMode

Let's install a second release with custom values. We'll use the --set flag to override defaults:

```bash
helm install whoami-custom --set replicaCount=1 --set serviceNodePort=30038 labs/helm/charts/whoami
```

Let's verify both releases are running:

```bash
helm ls
```

Good, we have two releases: whoami-default and whoami-custom.

Let's check the Pods:

```bash
kubectl get pods -l component=server -L app
```

Excellent. We see three Pods total:
- Two with label app=whoami-default (from first release)
- One with label app=whoami-custom (from second release with replicaCount=1)

Let's test the custom release at its custom port:

```bash
curl localhost:30038
```

Perfect. We now have two independent releases of the same chart running simultaneously, each with different configurations. This demonstrates how Helm enables multi-tenancy and environment isolation.

---

## Exercise 4: Upgrade a Release (4:00)

**Timing: 8:00-12:00**

One of Helm's key features is the ability to upgrade releases. Let's try modifying our custom release.

I want to change the server mode to verbose. Let me try:

```bash
helm upgrade whoami-custom --set serverMode=V labs/helm/charts/whoami
```

This fails! The error says the port is already in use. What happened?

When we upgrade, Helm doesn't automatically reuse values from the original install. It tries to use defaults, which means it's attempting to use port 30028 - already in use by our first release.

This is important to remember: upgrades don't inherit previous custom values. We need to explicitly reuse them:

```bash
helm upgrade whoami-custom --reuse-values --set serverMode=V labs/helm/charts/whoami
```

Now it works! The --reuse-values flag tells Helm to keep all previous custom values and only change the serverMode.

Let's test the application:

```bash
curl localhost:30038
```

Notice the verbose output now. The upgrade worked.

Behind the scenes, Helm just updated the Kubernetes Deployment. Let's see the ReplicaSets:

```bash
kubectl get rs -l app=whoami-custom
```

We see two ReplicaSets - the old one scaled to zero, the new one with one Pod. This is normal Kubernetes Deployment behavior. Helm simply modifies the standard resources, and Kubernetes handles the rollout.

---

## Exercise 5: Rollback a Release (2:00)

**Timing: 12:00-14:00**

Helm maintains a complete revision history for each release, making rollbacks straightforward.

Let's view the history:

```bash
helm history whoami-custom
```

We see two revisions. The first was our install, the second was our upgrade to verbose mode.

Let's rollback to revision 1:

```bash
helm rollback whoami-custom 1
```

Check the ReplicaSets again:

```bash
kubectl get rs -l app=whoami-custom
```

The original ReplicaSet scaled back up. Helm created a new revision that matches revision 1's configuration.

Test the application:

```bash
curl localhost:30038
```

The verbose output is gone - we're back to quiet mode. The rollback was successful.

This rollback capability is valuable in production when upgrades cause issues.

---

## Exercise 6: Using Chart Repositories (4:00)

**Timing: 14:00-18:00**

So far we've used local charts. In practice, you'll often install charts from repositories.

Let's add a chart repository:

```bash
helm repo ls
```

Initially, we have no repositories configured.

```bash
helm repo add kiamol https://kiamol.net

helm repo update
```

This is similar to package managers like apt or yum. We add repositories, then update their indexes.

Now let's search for a chart:

```bash
helm search repo vweb --versions
```

We see multiple versions. Notice there are two version numbers: app version and chart version. Charts can evolve independently of the application.

Let's look at the default values for version 2.0.0:

```bash
helm show values kiamol/vweb --version 2.0.0
```

The values file includes comments explaining each option - very helpful for users.

Let's install this chart:

```bash
helm install --set replicaCount=1 --set serviceType=NodePort --set servicePort=30039 vweb kiamol/vweb --version 2.0.0
```

Check the Service:

```bash
kubectl get svc -l app.kubernetes.io/instance=vweb
```

Perfect. The app should be available at http://localhost:30039.

Now let's try something interesting - downgrade to version 1.0.0:

```bash
helm show values kiamol/vweb --version 1.0.0
```

Notice version 1.0.0 doesn't have a serviceType variable. Let's upgrade anyway:

```bash
helm upgrade --reuse-values vweb kiamol/vweb --version 1.0.0
```

It works, but check the Service:

```bash
kubectl get svc -l app.kubernetes.io/instance=vweb
```

The Service type changed to LoadBalancer because version 1.0.0's template hardcodes that type. This demonstrates that chart versions matter - different versions can have different templates and variables.

---

## Exercise 7: Lab Challenge (3:00)

**Timing: 18:00-21:00**

Now for the lab challenge. We need to install the Nginx Ingress controller from a public Helm chart.

Requirements:
- Use at least version 1.3.0 of the app
- Use a new namespace called "ingress"
- Apply the provided values file for local development

First, let's add the Nginx repository:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

helm repo update
```

Search for the chart:

```bash
helm search repo ingress-nginx --versions
```

We need to find a version with app version 1.3.0 or higher. Let's check the available versions and pick an appropriate one.

Create the namespace:

```bash
kubectl create namespace ingress
```

Now install the chart using the provided values file:

```bash
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress \
  --values labs/helm/ingress-nginx/dev.yaml \
  --version [appropriate-version]
```

Wait for the pods to be ready:

```bash
kubectl get pods -n ingress --watch
```

Once running, let's verify the HTTP endpoint:

```bash
curl localhost
```

We should see a 404 response from Nginx, which is correct - the ingress controller is running, it just doesn't have any ingress rules configured yet.

Perfect! We've successfully deployed a production-grade ingress controller using Helm.

---

## Cleanup and Summary (1:00)

**Timing: 21:00-22:00**

Before we finish, let's clean up our releases:

```bash
helm uninstall vweb whoami-custom whoami-default

helm uninstall ingress-nginx -n ingress

kubectl delete ns ingress
```

Let's review what we've covered:
- Installing the Helm CLI
- Deploying charts with default values
- Customizing deployments with --set flags
- Upgrading releases with new values
- Rolling back to previous revisions
- Working with chart repositories
- Installing production applications like Nginx ingress

Remember these key points:
- Helm creates standard Kubernetes resources
- The --reuse-values flag is crucial for upgrades
- Chart repositories make sharing applications easy
- Rollback capability provides safety for production changes

You now have the practical skills to deploy and manage applications with Helm. In the next session, we'll focus on CKAD exam-specific scenarios and time-saving techniques.

Thank you for following along with these exercises.
