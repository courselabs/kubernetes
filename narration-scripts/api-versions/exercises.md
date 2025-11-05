# API Versions and Deprecations - Practical Demo
## Narration Script for Hands-On Exercises (12-15 minutes)

---

### Section 1: Environment Setup and API Discovery (3 min)
**[00:00-03:00]**

Welcome to the hands-on demonstration of Kubernetes API versions and deprecations. In this session, we'll practice identifying API versions, working with deprecated APIs, and migrating resources to current versions.

Let's start by exploring what API versions our current cluster supports:

```bash
kubectl api-versions
```

Notice the output shows various API groups and versions. You'll see core resources like v1, and grouped resources like apps/v1, batch/v1, networking.k8s.io/v1. This command is essential for understanding what your cluster can handle.

Now let's get more detailed information:

```bash
kubectl api-resources
```

This shows every resource type with its API version, short name, whether it's namespaced, and the kind name used in YAML. Let's find specific resources:

```bash
kubectl api-resources | grep deployment
kubectl api-resources | grep ingress
kubectl api-resources | grep cronjob
```

Notice deployments use apps/v1, ingress uses networking.k8s.io/v1, and cronjobs use batch/v1. These are all stable versions.

Let's check the cluster version:

```bash
kubectl version --short
```

Understanding your cluster version is crucial because different versions support different API versions. Now let's deploy a resource and examine its API version:

```bash
kubectl apply -f labs/api-versions/specs/deployment-current-api.yaml
kubectl get deployment api-demo -o yaml | grep apiVersion
```

You can see this deployment uses apps/v1, the current stable version.

---

### Section 2: Understanding API Version Structure (2 min)
**[03:00-05:00]**

Let's use kubectl explain to understand API structure. This is incredibly useful for the CKAD exam:

```bash
kubectl explain deployment
```

Notice it shows VERSION: apps/v1 and describes what a Deployment is. You can drill into specific fields:

```bash
kubectl explain deployment.spec
kubectl explain deployment.spec.template
kubectl explain deployment.spec.strategy
```

This is faster than searching documentation. Now let's look at other resources:

```bash
kubectl explain ingress
kubectl explain cronjob
kubectl explain poddisruptionbudget
```

Each shows its current stable API version. For the exam, if you forget the exact structure of an API field, kubectl explain is your friend. It works offline and doesn't require documentation access.

Let's see what happens with an unknown or removed API:

```bash
kubectl explain deployment --api-version=extensions/v1beta1
```

You'll get an error or warning because extensions/v1beta1 for Deployment was removed in Kubernetes 1.16. This demonstrates how old API versions become unavailable.

---

### Section 3: Working with API Version Changes (3 min)
**[05:00-08:00]**

Let's explore how API versions evolve using Ingress as an example. Ingress had significant changes from v1beta1 to v1.

Look at the old v1beta1 Ingress spec:

```bash
cat labs/api-versions/specs/ingress-old.yaml
```

Notice it uses networking.k8s.io/v1beta1. Try applying it:

```bash
kubectl apply -f labs/api-versions/specs/ingress-old.yaml
```

Depending on your cluster version, this might fail with an error like "no matches for kind Ingress in version networking.k8s.io/v1beta1". This is what happens when you try to use a removed API.

The key differences between v1beta1 and v1 Ingress:
- pathType field is required in v1 (wasn't in v1beta1)
- backend structure changed to use service with name and port
- IngressClassName is now used instead of annotations

Let's apply the current version:

```bash
cat labs/api-versions/specs/ingress-current.yaml
kubectl apply -f labs/api-versions/specs/ingress-current.yaml
```

This works because it uses networking.k8s.io/v1. Let's verify:

```bash
kubectl get ingress -o yaml | grep apiVersion
```

For the CKAD exam, you need to recognize these structural differences. When migrating APIs, it's not just changing the version number - sometimes the schema changes too.

---

### Section 4: Identifying Deprecated APIs in Your Cluster (2 min)
**[08:00-10:00]**

Now let's find all API versions currently in use in our cluster:

```bash
kubectl get all --all-namespaces -o json | grep -o '"apiVersion":"[^"]*"' | sort -u
```

This shows every API version actually being used. You might see apps/v1, v1, batch/v1, and others.

To check a specific namespace:

```bash
kubectl get all -n default -o json | grep -o '"apiVersion":"[^"]*"' | sort -u
```

Let's check specific resource types:

```bash
kubectl get deployments --all-namespaces -o json | grep -o '"apiVersion":"[^"]*"' | sort -u
kubectl get ingress --all-namespaces -o json | grep -o '"apiVersion":"[^"]*"' | sort -u
```

This helps you identify if any resources are using old API versions. For a comprehensive check, you'd need to scan your Git repositories and Helm charts, not just running resources.

Let's check the Kubernetes deprecation guide:

```bash
kubectl api-resources | grep -E "batch|networking|policy"
```

This shows current API versions for commonly updated resources. Compare these against what you found in your cluster to identify potential issues.

---

### Section 5: Using kubectl convert (2 min)
**[10:00-12:00]**

The kubectl convert tool helps migrate manifests to new API versions. First, let's check if we have it installed:

```bash
kubectl convert --help
```

If it's not installed, you'd need to install it separately. Assuming it's available, here's how to use it:

```bash
# Convert an old API version to new
kubectl convert -f labs/api-versions/specs/old-version-example.yaml --output-version apps/v1
```

The output shows the converted YAML using the new API version. To save it:

```bash
kubectl convert -f labs/api-versions/specs/old-version-example.yaml \
  --output-version apps/v1 > new-version.yaml
```

Let's try with an Ingress:

```bash
kubectl convert -f labs/api-versions/specs/ingress-old.yaml \
  --output-version networking.k8s.io/v1
```

Notice how the structure changed - not just the apiVersion field, but the entire schema adapted to v1 requirements.

Important limitations:
- kubectl convert doesn't always handle complex schema changes perfectly
- Always review the converted output before applying
- Test in a non-production environment first

For the CKAD exam, understand what kubectl convert does and its basic syntax, even if you don't use it extensively during the exam.

---

### Section 6: Troubleshooting API Version Issues (2 min)
**[12:00-14:00]**

Let's practice troubleshooting common API version problems. First, let's try to apply a manifest with a wrong API version:

```bash
cat > test-deployment.yaml <<EOF
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: test-app
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: test
    spec:
      containers:
      - name: nginx
        image: nginx
EOF

kubectl apply -f test-deployment.yaml
```

You'll see an error: "no matches for kind Deployment in version extensions/v1beta1". This is the classic deprecated API error.

How to fix it:

```bash
# Option 1: Edit the file manually
sed -i 's|extensions/v1beta1|apps/v1|' test-deployment.yaml

# Add required selector
cat > test-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: test
  template:
    metadata:
      labels:
        app: test
    spec:
      containers:
      - name: nginx
        image: nginx
EOF

kubectl apply -f test-deployment.yaml
```

Now it works because we're using apps/v1 and included the required selector field.

Another common issue - trying to update a resource with the wrong API version:

```bash
kubectl get deployment test-app -o yaml > current.yaml
# Edit current.yaml to change apiVersion to extensions/v1beta1
# Then try to apply - it will fail
```

The lesson: always use current API versions. When troubleshooting, check the apiVersion field first.

---

### Section 7: Cleanup and Summary (1 min)
**[14:00-15:00]**

Let's clean up the resources we created:

```bash
kubectl delete deployment api-demo test-app
kubectl delete ingress test-ingress
rm test-deployment.yaml new-version.yaml
```

To summarize what we practiced:
- Using kubectl api-versions and api-resources to discover supported APIs
- Using kubectl explain to understand resource structures
- Identifying deprecated APIs in running resources
- Converting manifests with kubectl convert
- Troubleshooting API version errors

Key takeaways for CKAD:
- Always check api-resources when unsure about the correct API version
- Use explain to understand field requirements
- Recognize deprecated API errors and know how to fix them
- Practice updating manifests from old to new API versions

These skills will help you avoid common pitfalls during the exam and in real-world Kubernetes operations. Thank you for following along with this demonstration.
