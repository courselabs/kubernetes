# RBAC Practical Demo - Narration Script
**Duration: 18-22 minutes**
**Format: Live demonstration following README.md**

---

## Introduction (1:00)

Welcome to the hands-on portion of our RBAC training. In this demonstration, we'll work through practical scenarios that show RBAC in action. We'll deploy applications, grant them API access, troubleshoot permission issues, and implement security best practices.

By the end of this session, you'll have seen real examples of creating ServiceAccounts, Roles, and RoleBindings, and you'll understand how to verify that permissions are working correctly.

Let's get started with our first exercise - securing API access for applications.


---

## Docker Desktop RBAC Fix (0:30)

Before we begin, a quick note for those using Docker Desktop: older versions have a bug in the default RBAC setup that prevents permissions from being applied correctly. If you're using Docker Desktop version 4.2 or earlier, you'll need to run a fix script first.

I'm on a newer version, so I'll skip this step. But if you see the error message about docker-for-desktop-binding not found, that's actually good - it means you don't have the bug.

Let's move on to our first real exercise.

---

## Exercise 1: Deploying the Application (2:00)


We're going to work with a web application called kube-explorer that connects to the Kubernetes API to display and manage Pods. First, let's create a sleep Deployment so we'll have some Pods to view.


Good. Now let's look at the kube-explorer deployment spec before we apply it.


Notice here - the Pod spec includes "serviceAccountName: kube-explorer". This tells Kubernetes to use a specific ServiceAccount instead of the default one. The ServiceAccount is created in this same file.

This is important: by creating a dedicated ServiceAccount, we're setting up a unique identity for this application. Now we can grant permissions to this specific identity.

Let's deploy all the kube-explorer resources:


Perfect. The deployment creates a ServiceAccount, a Deployment with one Pod, and two Services for accessing the app.

---

## Exercise 2: Understanding the 403 Error (2:30)


Now let's browse to the application at localhost:8010.


And we see an error. The application is getting a "403 Forbidden" response when it tries to list Pods from the Kubernetes API. This is RBAC in action - the application is authenticated, meaning Kubernetes knows who it is, but it's not authorized, meaning it doesn't have permission to perform this action.

Let's investigate. First, let's look at the Pod details:


Look at the Mounts section here. You'll see a volume mounted at /var/run/secrets/kubernetes.io/serviceaccount. This volume contains three files: a namespace file, a CA certificate, and most importantly, a token file.

Kubernetes automatically injects this token into every Pod. It's how the application authenticates to the API server. Let's look at that token:


This JWT token identifies the Pod as using the kube-explorer ServiceAccount. The API server sees this token, knows the identity, but when it checks RBAC rules, there are no permissions granted to this ServiceAccount.

Let's verify this using kubectl auth can-i:


The command returns "no" - confirming that this ServiceAccount cannot get or list Pods. Now let's fix that.

---

## Exercise 3: Creating and Applying RBAC Rules (3:00)


Let's look at the RBAC resources we need to create:


This Role is called "pod-manager". It has rules that grant two sets of permissions. The first rule allows "get", "list", and "watch" verbs on pods. The second rule allows "delete" on pods. We're separating these because deletion is a more privileged operation.

Notice the apiGroups is set to an empty string in quotes - that's correct for Pods because they're in the core v1 API. Now let's look at the RoleBinding:


The RoleBinding connects our Role to the ServiceAccount. The roleRef section points to the "pod-manager" Role. The subjects section specifies the kube-explorer ServiceAccount in the default namespace.

Let's apply both of these:


Great. Now let's verify the ServiceAccount has permissions:


Excellent! It returns "yes" now. Let's refresh the web application.


Perfect! The application now displays a list of Pods. You can see our kube-explorer Pod and the sleep Pod we created earlier. Notice we can click the delete button on the sleep Pod.


The Pod was deleted, but if we go back to the main page, we see a new sleep Pod. This is the ReplicaSet creating a replacement, which shows our application has working delete permissions.

---

## Exercise 4: Cluster-Wide Permissions (3:30)


Our current RBAC rules only work in the default namespace. Let's verify this by checking permissions in the kube-system namespace:


As expected, it returns "no". To grant access across all namespaces, we need ClusterRole and ClusterRoleBinding resources.

Let's examine the cluster-wide RBAC configuration:


This ClusterRole is named "pod-reader". Notice it has no namespace in the metadata - that's what makes it cluster-scoped. It grants "get", "list", and "watch" permissions on pods, but notice it doesn't include "delete". This is following the principle of least privilege - we'll give cluster-wide read access, but keep deletion restricted to the default namespace.

Now the ClusterRoleBinding:


The ClusterRoleBinding connects the pod-reader ClusterRole to our kube-explorer ServiceAccount. Let's apply these:


Now let's verify permissions in the system namespace:


Great - returns "yes" for reading. But let's check deletion:


Perfect! Returns "no" for delete. This shows how we can have different permission levels in different scopes - full management in default namespace, but read-only cluster-wide.

Let's verify in the browser:


Excellent! We can see Pods from the kube-system namespace. Notice we can view them, but the delete buttons won't work here because we don't have delete permissions.

---

## Exercise 5: Fine-Grained Permissions (2:00)


RBAC permissions are very fine-grained. Our application only has access to Pod resources. Let's demonstrate this by clicking the Service Accounts link.


And we get the 403 Forbidden error again. The application needs separate permissions for ServiceAccounts. This shows the principle of least privilege in action - just because you can access Pods doesn't mean you can access other resources.

---

## Lab Exercise: ServiceAccount Viewer (4:00)


Now it's your turn to practice. Your challenge is to grant the kube-explorer application permissions to view ServiceAccounts in the default namespace.

Let me show you how I would approach this. First, I need to understand what permissions are required. Let's check the API group for ServiceAccounts:


ServiceAccounts are in the core API group - the empty string. Now I'll create a Role:


That creates the Role imperatively. For the exam, imperative commands are faster than writing YAML. Now I need a RoleBinding:


The key here is the format of the serviceaccount subject: namespace colon name. Let's verify:


Perfect! Let's test it in the browser:


Excellent! Now we can see the ServiceAccounts in the default namespace.

---

## Lab Exercise: Disabling ServiceAccount Token (3:00)


The second part of the lab asks us to disable ServiceAccount token mounting for the sleep Pod as a security best practice.

Most applications don't need to access the Kubernetes API, so mounting the token creates an unnecessary security risk. If an attacker compromises the container, they could potentially use that token to query or modify cluster resources.

Let's check if the token is currently mounted:


Yes, the token is there. To disable it, we need to set automountServiceAccountToken to false in the Pod spec. Let me show you how using kubectl patch:


This updates the Deployment template. Now we need to wait for the Pod to be recreated:


Good, we have a new Pod. Let's verify the token is no longer mounted:


Perfect! The directory doesn't exist or is empty. The ServiceAccount token is no longer mounted, reducing our security exposure.

---

## Review and Best Practices (1:00)


Let's review what we've covered in this practical session.

We created a dedicated ServiceAccount for our application, following the principle of having unique identities for each application.

We granted namespace-scoped permissions using a Role and RoleBinding, giving the application management capabilities in the default namespace.

We extended access cluster-wide using a ClusterRole and ClusterRoleBinding, but with reduced permissions - demonstrating layered security.

We practiced troubleshooting RBAC issues using kubectl auth can-i, which is essential for both development and the CKAD exam.

And finally, we improved security by disabling ServiceAccount token mounting for applications that don't need API access.

These patterns form the foundation of application security in Kubernetes. Practice creating these resources imperatively for exam speed, but always verify your work using auth can-i before moving on.

---

## Cleanup (0:30)


Before we wrap up, let's clean up our resources:


All resources are removed. You're now ready to practice these exercises on your own.

---

**End of Practical Demo: 18-22 minutes**

## Notes for Presenter

### Prerequisites
- Kubernetes cluster running (Docker Desktop, k3d, or similar)
- kubectl configured and working
- Terminal with good font size for visibility
- Browser ready for localhost access
- All lab files present in /home/user/kubernetes-ckad/labs/rbac/

### Pacing Tips
- **Faster track (18 min)**: Skip some of the "let's look at the file" sections, assume viewers know YAML
- **Standard track (20 min)**: Follow script as written
- **Detailed track (22 min)**: Add more explanation of YAML fields, answer anticipated questions

### Common Issues
- **Port conflict**: If port 8010 is busy, the service won't be accessible. Check with `lsof -i :8010`
- **Timing issues**: After applying RBAC, sometimes need to wait a few seconds for API server to sync
- **Browser caching**: Use Ctrl+Shift+R for hard refresh if application seems stuck

### Demo Environment Setup
Before starting:


### Terminal Commands Summary
For quick reference during demo:


### Visual Aids
- **Terminal**: Use split screen - commands on left, watch output on right
- **Browser**: Keep dedicated window for kube-explorer app
- **Timing display**: Optional countdown timer visible to help with pacing

### Audience Engagement
- Pause after Exercise 2 to let "403 Forbidden" sink in
- Ask "What would you try first?" before showing kubectl auth can-i
- Encourage viewers to follow along in their own clusters
- Mention "This is a common exam scenario" when appropriate

### Key Callouts
When to emphasize:
- "This is exam-relevant" → ServiceAccount creation, imperative commands
- "Common mistake" → Forgetting namespace in ServiceAccount subject
- "Security best practice" → Disabling token mounting, least privilege
- "Troubleshooting technique" → Using kubectl auth can-i
