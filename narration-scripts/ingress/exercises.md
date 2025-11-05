# Ingress Practical Exercises - Demo Narration Script

**Duration:** 18-22 minutes
**Format:** Live demonstration with terminal and browser
**Prerequisite:** Kubernetes cluster with kubectl configured
**Lab Files:** `/home/user/kubernetes-ckad/labs/ingress/`

---

## Introduction (0:00-1:00)
**Duration:** 60 seconds

**Screen:** Terminal at repository root

**Narration:**
"Welcome to the hands-on Ingress lab. In this session, we'll deploy a working Ingress Controller and configure routing for multiple applications. By the end, you'll understand how to expose services through a single entry point with sophisticated routing rules.

We'll start by deploying the Nginx Ingress Controller, then progressively add applications with different routing patterns - a default backend, host-based routing, and path-based routing with response caching. Finally, you'll complete a lab challenge to test your skills.

I'm working in a Kubernetes cluster - you can use Docker Desktop, K3s, or any other distribution. Let's verify our cluster is running."

**Commands:**


---

## Part 1: Deploy the Ingress Controller (1:00-4:30)
**Duration:** 3 minutes 30 seconds

### Understanding the Controller Architecture (1:00-2:00)

**Screen:** Show directory listing and open files in editor

**Narration:**
"First, let's understand what we're deploying. An Ingress Controller isn't a single Kubernetes resource - it's a collection of objects working together. Let's examine the manifests in the ingress-controller directory."

**Commands:**


**Narration (continued):**
"We have five files here. The namespace file creates a dedicated namespace called 'ingress-nginx' because the controller is shared across all applications. The RBAC file sets up permissions so the controller can query the Kubernetes API for services, endpoints, and Ingress resources.

The ConfigMap contains Nginx-specific configuration, including enabling proxy caching which we'll use later. The DaemonSet runs the actual controller pods - using a DaemonSet ensures one controller pod runs on each node for high availability. Finally, the services file exposes the controller externally, typically using LoadBalancer or NodePort."

### Deploying the Controller (2:00-3:30)

**Screen:** Terminal

**Narration:**
"Let's deploy the entire controller with a single kubectl apply command, pointing to the directory."

**Commands:**


**Narration (continued):**
"Notice the output shows all five resources being created. Now let's check what we have in the ingress-nginx namespace."

**Commands:**


**Narration (continued):**
"We can see the DaemonSet, the pods it created, and the services. Let's wait for the controller pods to be ready before proceeding."

**Commands:**


### Testing the Controller (3:30-4:30)

**Screen:** Split screen - terminal and browser

**Narration:**
"The controller is now running and accepting traffic. Even though we haven't deployed any applications yet, we can verify the controller is working by accessing it. Open your browser to localhost port 8000, or port 30000 if you're using NodePort."

**Browser:** Navigate to http://localhost:8000

**Narration (continued):**
"You'll see a 404 Not Found response - but notice this is coming from nginx, not your browser. This confirms the Ingress Controller is running and ready to route traffic. The 404 is expected because we haven't defined any routing rules yet. Let's fix that."

---

## Part 2: Deploy a Default Backend (4:30-7:30)
**Duration:** 3 minutes

### Understanding the Default App (4:30-5:30)

**Screen:** Terminal and editor

**Narration:**
"Instead of showing users an nginx 404 page, let's deploy a default application that provides a friendly landing page. We'll use a simple nginx deployment with custom HTML."

**Commands:**


**Narration (continued):**
"The ConfigMap contains HTML for our default page. The deployment uses a standard nginx image and mounts this HTML file. The service exposes it internally as a ClusterIP - remember, we don't need external services because the Ingress Controller handles that."

### Deploying Without Ingress Rules (5:30-6:15)

**Screen:** Terminal

**Narration:**
"Let's deploy the default application."

**Commands:**


**Narration (continued):**
"The pod is running and the service is created. But if we refresh our browser, we still see the 404 page. That's because services aren't automatically wired to the Ingress Controller - we need to explicitly create routing rules."

### Creating the Ingress Rule (6:15-7:30)

**Screen:** Terminal and editor

**Narration:**
"Let's examine the Ingress resource that will connect our service to the controller."

**Commands:**


**Narration (continued):**
"This Ingress resource has no host specified in the rules, which makes it a catch-all. Any request that doesn't match a more specific rule will come here. The path is just slash, and we're using Prefix matching so it matches everything. The backend points to our default service.

Now let's deploy it and see what happens."

**Commands:**


**Browser:** Navigate to http://localhost:8000/any/random/path

**Narration (continued):**
"Excellent! Now we see our custom default page instead of the 404 error. The Ingress Controller has picked up our routing rule and is forwarding all requests to our default service."

---

## Part 3: Host-Based Routing with Whoami (7:30-11:00)
**Duration:** 3 minutes 30 seconds

### Deploying the Whoami Application (7:30-9:00)

**Screen:** Terminal

**Narration:**
"Now let's deploy an actual application with host-based routing. We'll use the 'whoami' application, which displays information about the request it receives - perfect for testing routing and load balancing."

**Commands:**


**Narration (continued):**
"We now have multiple pods running for high availability. Notice we have two Ingress resources - our default catch-all, and this new whoami Ingress. Let's look at the whoami Ingress in detail."

**Commands:**


**Narration (continued):**
"The key difference here is the host field - this Ingress only matches requests with the hostname 'whoami.local'. Because this is more specific than our default rule, it takes priority."

### Configuring Local DNS (9:00-10:00)

**Screen:** Terminal

**Narration:**
"To test host-based routing locally, we need to resolve 'whoami.local' to localhost. The repository includes scripts to update your hosts file. On Windows, run this PowerShell script as Administrator. On macOS or Linux, run the shell script with sudo."

**Commands (Windows shown):**


**Narration (continued):**
"This adds an entry to your hosts file mapping whoami.local to 127.0.0.1. In production, you'd use real DNS records instead."

### Testing Host-Based Routing (10:00-11:00)

**Screen:** Browser

**Narration:**
"Now let's test the routing. First, I'll access localhost without a hostname."

**Browser:** Navigate to http://localhost:8000

**Narration (continued):**
"We still see our default page - perfect. Now let's access whoami.local."

**Browser:** Navigate to http://whoami.local:8000

**Narration (continued):**
"Excellent! Now we see the whoami application. Notice it shows the pod name, IP address, and request details. If you refresh several times, you'll see the hostname changes - the Ingress Controller is load balancing across our multiple pods. This demonstrates that host-based routing is working correctly."

---

## Part 4: Path-Based Routing with Response Caching (11:00-16:00)
**Duration:** 5 minutes

### Understanding the Pi Application (11:00-12:00)

**Screen:** Terminal

**Narration:**
"For our next example, we'll deploy the Pi calculator application. This app calculates Pi to a specified number of decimal places - it's CPU intensive, which makes it perfect for demonstrating response caching."

**Commands:**


**Narration (continued):**
"Let's examine the initial Ingress configuration for this application."

**Commands:**


**Narration (continued):**
"This Ingress routes requests for 'pi.local' to the pi-web service. There's nothing special here yet - no caching configured. Let's add pi.local to our hosts file and test it."

### Testing Without Caching (12:00-13:30)

**Commands:**


**Browser:** Navigate to http://pi.local:8000/pi?dp=25000

**Narration:**
"I'm requesting Pi calculated to 25,000 decimal places. Watch how long this takes... there we go, about 2 to 3 seconds. Now if I refresh the page, it takes the same amount of time again. The application is recalculating Pi for every single request, and if we have multiple users, each calculation uses CPU resources.

Notice the hostname in the response. As I refresh multiple times, you can see it's load balancing between different pods. But every request is slow because there's no caching."

### Implementing Response Caching (13:30-15:00)

**Screen:** Terminal and editor

**Narration:**
"Let's improve performance by enabling response caching in the Ingress Controller. We'll use Nginx annotations to enable this feature."

**Commands:**


**Narration (continued):**
"The updated Ingress adds two nginx-specific annotations. The first enables caching with 'nginx.ingress.kubernetes.io/proxy-cache-valid' set to cache 200 responses for 30 minutes. The second disables cache bypassing.

Notice we're not changing the application code or the service - only the Ingress resource. This is the power of handling caching at the ingress layer. Let's apply this update."

**Commands:**


### Testing With Caching (15:00-16:00)

**Browser:** Navigate to http://pi.local:8000/pi?dp=25000

**Narration:**
"Now let's test again. The first request after the update still takes a few seconds because the cache is empty... there's the response. But now watch what happens when I refresh."

**Browser:** Refresh page multiple times

**Narration (continued):**
"Instant! The response is coming from the Nginx cache in the Ingress Controller. Notice the hostname might stay the same or change, but the response is always instant because Nginx is serving it from cache without hitting the backend pods.

This demonstrates two key concepts. First, Ingress annotations allow you to use controller-specific features. Second, the Ingress Controller can do more than just routing - it can provide performance optimizations like caching, compression, and rate limiting."

---

## Part 5: Reviewing What We've Built (16:00-17:30)
**Duration:** 90 seconds

**Screen:** Terminal and browser

**Narration:**
"Let's review what we've accomplished. We have a single Ingress Controller handling all HTTP traffic into our cluster. Let's check our Ingress resources."

**Commands:**


**Narration (continued):**
"We have three Ingress resources - the default catch-all with no host, whoami routing whoami.local, and pi routing pi.local. All three share the same Ingress Controller, meaning we only need one LoadBalancer service instead of three separate ones.

Let's test all three to confirm everything works."

**Browser:** Navigate to:
- http://localhost:8000
- http://whoami.local:8000
- http://pi.local:8000

**Narration (continued):**
"Perfect! Each hostname routes to its designated application, and unmapped hosts go to the default page. This is exactly what you need in production - consolidated routing through a single entry point with flexible rules."

---

## Part 6: Lab Challenge (17:30-20:00)
**Duration:** 2 minutes 30 seconds

### Explaining the Challenge (17:30-18:30)

**Screen:** Terminal

**Narration:**
"Now it's time for your lab challenge. There are two parts. First, you need to deploy the configurable web application and create an Ingress resource to route traffic to it. The application specs are already provided, but you need to write the Ingress manifest yourself.

Let me deploy the application for you."

**Commands:**


**Narration (continued):**
"The application is running with a ClusterIP service. Your task is to create an Ingress resource that routes 'configurable.local' to this service. Use what you've learned about host-based routing and Ingress resources.

The second part of the challenge is more advanced. Currently, our Ingress Controller uses non-standard ports - 8000 and 30000. Can you modify the controller's service to use the standard HTTP and HTTPS ports, 80 and 443? You'll need to be using a LoadBalancer service for this to work.

Pause the video now and attempt the challenge. When you're ready, continue to see the solution."

### Showing the Solution (18:30-20:00)

**Screen:** Terminal

**Narration:**
"Welcome back. Let's walk through the solution. First, for the Ingress resource, we need to create a YAML manifest with the standard structure."

**Commands:**


**Narration (continued):**
"Add configurable.local to your hosts file, and you should be able to access the application. For the second part, changing the controller ports, you need to edit the Ingress Controller's service."

**Commands:**


**Narration (continued):**
"Change port 8000 to 80 for HTTP and 8443 to 443 for HTTPS in the service spec. Save and exit, and the service will be updated. Now you can access your applications on the standard ports without specifying port numbers in the URL.

If you found this challenging, review the hints and solution files in the lab directory. The key is understanding the relationship between the Ingress resource, the service it references, and the Ingress Controller that implements the routing."

---

## Conclusion and Cleanup (20:00-21:00)
**Duration:** 60 seconds

**Screen:** Terminal

**Narration:**
"Congratulations! You've successfully deployed an Ingress Controller and configured sophisticated routing rules for multiple applications. You've learned host-based routing, path-based routing, and how to use annotations for advanced features like caching.

These skills are essential for the CKAD exam and for managing production Kubernetes clusters. Remember that Ingress resources must be in the same namespace as their services, annotations are controller-specific, and you can combine host and path-based routing for complex scenarios.

Before we finish, let's clean up all the resources we created."

**Commands:**


**Narration (continued):**
"This deletes all resources labeled with the lab identifier. In our next session, we'll explore HTTPS configuration with TLS certificates and prepare for CKAD exam scenarios. Thank you for following along, and I'll see you in the next lab."

---

## Alternative Approaches (Optional Segment)

**Screen:** Terminal

**Narration:**
"Before we wrap up completely, let me show you a quick technique for rapid Ingress creation. Kubernetes 1.19 and later includes a kubectl create ingress command that generates Ingress YAML for you."

**Commands:**


**Narration (continued):**
"This command generates a complete Ingress resource without writing YAML from scratch. It's perfect for the CKAD exam where time is limited. You can specify multiple rules, add TLS configuration, and then pipe the output to a file or directly apply it. This technique can save you valuable minutes during the exam."

---

**End of Script**

**Total Runtime:** Approximately 21 minutes

**Key Timing Checkpoints:**
- 4:30 - Controller deployed
- 7:30 - Default backend working
- 11:00 - Host-based routing complete
- 16:00 - Caching demonstration complete
- 20:00 - Lab challenge and cleanup
