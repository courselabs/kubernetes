# Namespaces - Practical Exercises
## Narration Script for Hands-On Demonstration
**Duration:** 12-15 minutes

---

## Setup and Introduction (0:00 - 0:30)

"Welcome to the practical exercises for Kubernetes Namespaces. We'll work through real scenarios that demonstrate namespace isolation, resource quotas, and cross-namespace communication."

**Preparation:**


"Let's start by exploring the namespaces that already exist in your cluster."

---

## Exercise 1: Exploring System Namespaces (0:30 - 2:30)

### Understanding Default Namespaces (0:30 - 1:30)

"Every Kubernetes cluster has system namespaces. Let's examine them:"


"You'll see several namespaces:
- default: Where we've been working
- kube-system: System components
- kube-public: Publicly accessible resources
- kube-node-lease: Node heartbeat data"

"The kube-system namespace contains the core components that make Kubernetes work:"


"You'll see Pods for:
- DNS server (CoreDNS or kube-dns)
- kube-proxy for networking
- Possibly metrics-server, dashboard, or other system components"

### Accessing Resources in Other Namespaces (1:30 - 2:30)

"By default, kubectl commands use the 'default' namespace. Watch what happens:"


"That failed because the DNS server is in kube-system, not default. Let's fix it:"


"Now we see the DNS server logs. The -n flag is essential when working across namespaces."

---

## Exercise 2: Context Switching (2:30 - 4:30)

### Understanding Contexts (2:30 - 3:15)

"Adding -n to every command gets tedious. Kubernetes has contexts to set a default namespace:"


"The context includes:
- Which cluster to connect to
- Authentication credentials
- Default namespace for commands"

### Changing Your Working Namespace (3:15 - 4:00)

"Let's switch our default namespace to kube-system:"


"Notice we didn't specify -n, but we see system Pods. Our context now defaults to kube-system."

### Best Practice: Switch Back (4:00 - 4:30)

"It's dangerous to work in system namespaces. Always switch back:"


"Develop this habit: switch context for focused work, but always return to default when done."

---

## Exercise 3: Creating and Using Namespaces (4:30 - 7:00)

### Deploying to Different Namespaces (4:30 - 5:30)

"Let's deploy the same Pod to multiple namespaces:"


"Notice there's no namespace in the YAML. Kubectl will decide where it goes:"


"Same Pod name, same labels, but in different namespaces. They don't conflict because namespaces provide isolation."

### Creating Application Namespaces (5:30 - 7:00)

"Now let's deploy a complete application in its own namespace. The whoami app has three files:"


"Notice the file naming:
- 01-namespace.yaml - Creates the namespace first
- deployment.yaml - The application
- services.yaml - The services

The '01' prefix ensures the namespace is created before the other resources."


"The application is completely isolated in the 'whoami' namespace. This is how you organize applications or environments."

---

## Exercise 4: Working with Multiple Applications (7:00 - 9:00)

### Deploying the Configurable App (7:00 - 8:00)

"Let's deploy another application in a different namespace:"


"This app has:
- A namespace
- A ConfigMap with configuration
- A Deployment that uses the ConfigMap"


"Notice how we can see Deployments from all namespaces at once with -A (or --all-namespaces)."

### Filtering with Labels (8:00 - 9:00)

"Both apps have the same label for this lab:"


"This shows Services across all namespaces that match the label. Labels work across namespace boundaries, but label selectors within resources (like Services selecting Pods) only work within the same namespace."

**Important distinction:** "A Service in the 'whoami' namespace can only select Pods in the 'whoami' namespace, even if matching Pods exist in other namespaces."

---

## Exercise 5: Cross-Namespace DNS (9:00 - 11:00)

### Understanding Service DNS (9:00 - 9:45)

"Services have DNS names, but how do they work across namespaces?"

"Let's test from the sleep Pod in default namespace:"


"That fails! The whoami-np service is in the 'whoami' namespace, not 'default'."

### Using Fully-Qualified Names (9:45 - 11:00)

"To access services across namespaces, use the FQDN:"


"That works! The FQDN format is:


You can also use the shorter form:"


"Best practice: Always use FQDNs for cross-namespace communication. It's explicit and prevents confusion."

---

## Exercise 6: Resource Quotas (11:00 - 14:00)

### Understanding Resource Limits (11:00 - 11:45)

"Quotas prevent applications from consuming all cluster resources. Let's see them in action with the Pi application:"


"This ResourceQuota limits:
- Total CPU limits across all Pods: 4 cores
- Total memory limits: 8Gi

Let's deploy the Pi app with a small CPU allocation:"


### Testing the Application (11:45 - 12:30)

"The app should be running. Let's test it:"


"On my machine, this takes about 10.5 seconds. The Pod is limited to 125 millicores (0.125 CPU), so it's slow."

**Note:** "If you're using Kind or Minikube, you might not see the slowdown. Docker Desktop and k3d do enforce CPU limits, as do all production Kubernetes platforms."

### Increasing Resources (12:30 - 13:15)

"Let's give the Pod more CPU:"


"This bumps the CPU limit to 2.5 cores. Much more power!"


"Try the calculation again:"


"Much faster! On my machine, down to 1.2 seconds. That's the impact of resource allocation."

### Exceeding Quota Limits (13:15 - 14:00)

"What happens if we try to exceed the namespace quota?"


"This requests 4.5 CPU cores, but our namespace quota is 4 cores total."


"Look at the events: 'exceeded quota'. The ReplicaSet can't create the Pod because it would violate the namespace quota."

"Kubernetes keeps trying in case the quota changes or other Pods are deleted, freeing up resources."

---

## Exercise 7: Lab Challenge (14:00 - 15:00)

### Understanding the Challenge (14:00 - 14:30)

"The lab asks us to add a caching proxy in front of the Pi service. Requirements:
- Use the reverse-proxy specs as a starting point
- The proxy must be in a namespace called 'front-end'
- Fix any configuration errors"


"This spec has:
- Nginx deployment and service
- ConfigMap with proxy configuration
- But NO namespace defined"

### Solution Approach (14:30 - 15:00)

"We need to:
1. Create the 'front-end' namespace
2. Add namespace to all resources
3. Fix the proxy configuration to point to the Pi service in the 'pi' namespace using FQDN"

"I'll let you work through this in the solution.md file, but the key is understanding:
- Namespaces must exist before resources
- ConfigMaps must be in the same namespace as Pods that use them
- Service URLs must use FQDN for cross-namespace access"

**Hint:** "The proxy configuration needs to point to: http://pi-web.pi.svc.cluster.local"

---

## Cleanup and Summary (15:00 - 15:30)

### Cleaning Up Resources

"Namespaces make cleanup easy - just delete the namespace:"


"The labeled namespaces are gone, along with all their resources."

"Don't forget the sleep Pods we created:"


### Key Takeaways

"What we've learned:

1. **Namespace basics** - Creating and switching between namespaces
2. **Context management** - Using kubectl config to set default namespace
3. **Resource isolation** - Same names in different namespaces don't conflict
4. **Cross-namespace DNS** - Using FQDNs to access services across namespaces
5. **Resource quotas** - Limiting resources at the namespace level
6. **Configuration scoping** - ConfigMaps and Secrets are namespace-bound
7. **Cleanup** - Deleting a namespace removes all its resources

These patterns are essential for:
- Multi-tenant clusters
- Environment separation (dev/test/prod)
- Resource management
- Team isolation
- Cost tracking and allocation"

---

## Common Issues and Troubleshooting

**If Pods don't start in namespaces with quotas:**
- Check: `kubectl describe quota -n <namespace>`
- Ensure Pods have resource requests and limits defined
- Verify quota hasn't been exceeded

**If cross-namespace communication fails:**
- Use FQDN: `service.namespace.svc.cluster.local`
- Check service exists: `kubectl get svc -n <namespace>`
- Verify DNS is working: `kubectl exec <pod> -- nslookup kubernetes.default`

**If you lose track of your namespace:**
- Check context: `kubectl config get-contexts`
- See current namespace: `kubectl config view --minify | grep namespace`
- Always return to default: `kubectl config set-context --current --namespace default`

**If resources aren't visible:**
- Check the right namespace: `kubectl get pods -n <namespace>`
- List all namespaces: `kubectl get pods -A`
- Verify resource type is namespace-scoped: `kubectl api-resources --namespaced=true`

---

## Transition to CKAD Exam Prep

"In the next section, we'll focus on CKAD exam scenarios. You'll learn:
- Imperative commands for namespace creation
- Working with ResourceQuotas under time pressure
- Quick context switching techniques
- Common exam patterns with namespaces
- Time-saving tips for the certification

Let's practice for the exam!"
