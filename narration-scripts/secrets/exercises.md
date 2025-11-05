# Secrets - Exercises Narration Script

**Duration:** 15-18 minutes
**Format:** Hands-on demonstration following README.md exercises
**Audience:** Developers practicing Kubernetes Secret operations

---

## Introduction (0:00 - 0:30)

Welcome to the hands-on Secrets lab. In this session, we'll work through practical exercises demonstrating how to create and use Secrets in real applications.

We'll use the same "configurable" demo application from the ConfigMaps lab. This makes it easy to compare how Secrets and ConfigMaps work, and see how they can be used together in the same application.

Make sure you have a Kubernetes cluster running and kubectl configured. Let's get started.

**[Pause for 2 seconds]**

---

## Exercise 1: Understanding the Security Risk with ConfigMaps (0:30 - 2:30)

**[Start typing]**

First, let's deploy the configurable app using ConfigMaps to see why we need Secrets for sensitive data.

```bash
kubectl apply -f labs/secrets/specs/configurable
```

**[Execute command]**

This creates both ConfigMaps and the application. Let's examine what ConfigMaps expose:

```bash
kubectl get configmaps
```

**[Execute and show output]**

You can see several ConfigMaps. Now let's look at one in detail:

```bash
kubectl describe cm configurable-env
```

**[Execute command]**

**[Point to the Data section in output]**

Notice how the data is completely visible in plain text. Anyone with kubectl access can see all these values. You can also get the full YAML:

```bash
kubectl get configmap configurable-env -o yaml
```

**[Execute and show output]**

Everything is right there in plain text. This is fine for hostnames, ports, and feature flags, but imagine if this contained database passwords, API keys, or OAuth tokens. That would be a serious security problem.

**[Pause for 2 seconds]**

This is exactly why Kubernetes provides Secrets. Let's see how they're different.

---

## Exercise 2: Creating Secrets from Encoded YAML (2:30 - 5:00)

**[Continue typing]**

Let's create our first Secret using base64-encoded values in YAML. First, let me show you the Secret definition:

```bash
cat labs/secrets/specs/configurable/secrets-encoded/secret-encoded.yaml
```

**[Execute and highlight the data section]**

Notice the data field contains a key called Configurable__Environment with a base64-encoded value. This is different from ConfigMaps where values are plain text.

Let me show you what that encoded value contains. On Linux and Mac, we can decode it:

```bash
echo "cHJlLXByb2QK" | base64 -d
```

**[Execute]**

It says "pre-prod". So the encoding is reversible - anyone can decode it. This is important to understand: encoding is not encryption.

**[Pause for 1 second]**

Now let's look at the Deployment that uses this Secret:

```bash
cat labs/secrets/specs/configurable/secrets-encoded/deployment-env.yaml
```

**[Execute and highlight the envFrom section]**

The syntax is almost identical to ConfigMaps. Instead of configMapRef, we use secretRef. That's the only difference in the Pod spec.

Let's deploy both:

```bash
kubectl apply -f labs/secrets/specs/configurable/secrets-encoded
```

**[Execute]**

Wait for the rollout to complete:

```bash
kubectl rollout status deployment/configurable
```

**[Execute and wait]**

Now let's access the application. First, get the Service:

```bash
kubectl get svc configurable
```

**[Execute and show NodePort]**

**[Open browser to the service]**

Look at the application UI. You can see the Configurable:Environment value is now "pre-prod", which came from our Secret. Inside the container, the Secret value is surfaced as plain text - the application doesn't need to decode anything.

**[Pause for 2 seconds]**

Now let's verify what the Secret looks like in the cluster:

```bash
kubectl get secret configurable-secret-env -o yaml
```

**[Execute]**

The value is base64-encoded in storage and when you retrieve it with kubectl. This provides minimal protection - it's not visible at a glance, but anyone can decode it.

---

## Exercise 3: Creating Secrets from Plaintext YAML (5:00 - 7:00)

**[Switch back to terminal]**

Base64 encoding is awkward. You need to encode values before putting them in YAML, and it gives a false sense of security. Kubernetes provides a better option: stringData.

Let's look at this Secret definition:

```bash
cat labs/secrets/specs/configurable/secrets-plain/secret-plain.yaml
```

**[Execute and highlight stringData section]**

Notice we're using stringData instead of data, and the value is in plain text: "uat". When you apply this YAML, Kubernetes automatically converts it to base64 for storage.

This is much more convenient when writing YAML by hand. The security is identical - both are base64-encoded in etcd.

Now let's look at the Deployment:

```bash
cat labs/secrets/specs/configurable/secrets-plain/deployment-env.yaml
```

**[Execute]**

The Deployment references this new Secret name. Let's apply the changes:

```bash
kubectl apply -f labs/secrets/specs/configurable/secrets-plain
```

**[Execute]**

This updates the Secret and triggers a Deployment rollout. Let's verify:

```bash
kubectl rollout status deployment/configurable
```

**[Execute and wait]**

**[Refresh browser]**

The application now shows the environment as "uat". The update worked seamlessly.

**[Pause for 2 seconds]**

Let's verify that even though we used stringData in our YAML, Kubernetes stores it encoded:

```bash
kubectl get secret configurable-env-plain -o yaml
```

**[Execute and show the data field]**

Notice it's now under data, not stringData, and it's base64-encoded. Kubernetes handled the encoding for us.

---

## Exercise 4: Decoding Secret Values (7:00 - 9:00)

**[Continue in terminal]**

Let's explore how to work with base64-encoded Secret values. If you're on Windows, you first need to run this PowerShell script to enable the base64 command:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force
. ./scripts/windows-tools.ps1
```

**[Note: Only show this if on Windows]**

This only affects your current PowerShell session and doesn't make permanent system changes.

**[Pause for 1 second]**

Now let's examine our Secret. First, describe it:

```bash
kubectl describe secret configurable-env-plain
```

**[Execute and show output]**

The describe command shows the keys but not the values. It displays the byte size instead - a small security measure. To see the actual values, you need to get the raw data:

```bash
kubectl get secret configurable-env-plain -o jsonpath="{.data.Configurable__Environment}"
```

**[Execute and show encoded value]**

That's the base64-encoded value. Now let's decode it:

```bash
kubectl get secret configurable-env-plain -o jsonpath="{.data.Configurable__Environment}" | base64 -d
```

**[Execute and show decoded "uat"]**

There it is: "uat" in plain text. This demonstrates why base64 is not security. Anyone with kubectl access can decode Secrets this easily.

**[Pause for 2 seconds]**

In production, you need additional safeguards:
- Enable encryption at rest so Secrets are encrypted in etcd
- Use RBAC to control who can read Secrets
- Consider integrating with external secret stores like HashiCorp Vault

We cover RBAC in detail in the dedicated RBAC lab.

---

## Exercise 5: Creating Secrets from Files (9:00 - 12:00)

**[Continue typing]**

In many organizations, there's separation of concerns. A security team manages sensitive data and creates Secrets, while the DevOps team deploys applications that reference those Secrets. Neither team needs access to what the other manages.

Let's simulate this workflow. First, play the security team with access to sensitive files on disk:

```bash
cat labs/secrets/secrets/configurable.env
```

**[Execute and show contents]**

This is a .env file with key-value pairs. Now look at another file:

```bash
cat labs/secrets/secrets/secret.json
```

**[Execute and show JSON]**

This is a JSON file with structured configuration. Both contain sensitive data that the security team manages.

**[Pause for 1 second]**

Now let's create Secrets from these files. For the .env file, use from-env-file:

```bash
kubectl create secret generic configurable-env-file \
  --from-env-file ./labs/secrets/secrets/configurable.env
```

**[Execute]**

This parses the .env file and creates one key-value pair per line. Let's verify:

```bash
kubectl describe secret configurable-env-file
```

**[Execute and show keys]**

Perfect! The key Configurable__Release is there. Now for the JSON file, use from-file:

```bash
kubectl create secret generic configurable-secret-file \
  --from-file ./labs/secrets/secrets/secret.json
```

**[Execute]**

With from-file, the filename becomes the key, and the entire file contents become the value. Verify:

```bash
kubectl describe secret configurable-secret-file
```

**[Execute and show secret.json key]**

Good! The key is named secret.json and contains the file contents.

**[Pause for 2 seconds]**

Now switch roles to the DevOps team. They don't have access to the sensitive files, but they can reference the Secrets that already exist. Let's look at the Deployment:

```bash
cat labs/secrets/specs/configurable/secrets-file/deployment.yaml
```

**[Execute and highlight both secretRef and volume sections]**

This Deployment references both Secrets:
- configurable-env-file for environment variables
- configurable-secret-file mounted as a volume at /app/secrets

The DevOps team can deploy the application without ever seeing the sensitive values:

```bash
kubectl apply -f labs/secrets/specs/configurable/secrets-file
```

**[Execute]**

Wait for the rollout:

```bash
kubectl rollout status deployment/configurable
```

**[Execute and wait]**

**[Switch to browser and refresh]**

Look at the application UI. There's a new section showing secrets.json configuration. The JSON file was mounted into the container and the application loaded it.

**[Pause for 2 seconds]**

This workflow enables secure separation of responsibilities. The security team manages actual secret values, and the DevOps team manages application deployments, with neither needing full access to what the other manages.

---

## Exercise 6: Lab Challenge - Configuration Update Strategy (12:00 - 15:00)

**[Back to terminal]**

Now here's a challenge that reflects a real production problem. Configuration loaded as volume mounts can be updated by Kubernetes automatically. When you change a ConfigMap or Secret, Kubernetes pushes the update into the container filesystem within about 60 seconds.

But there's a catch: the application might not reload the configuration automatically. Most apps only read config at startup.

**[Pause for 1 second]**

So you have two options:
1. Wait for the file to update, then manually restart the Deployment
2. Find a way to automate the restart as part of the configuration update

The first option is error-prone. You update the Secret, then separately run kubectl rollout restart. If you forget the second step, the old config stays active. Not ideal for production.

The challenge is: come up with a better approach so that when you update a Secret in YAML, the Deployment automatically rolls out new Pods.

**[Pause for 5 seconds]**

Let me show you one solution. The key insight is that Kubernetes triggers a Deployment rollout whenever the Pod template changes. So if we can make the Secret change affect the Pod template, we get automatic rollouts.

One approach is to add an annotation or label to the Pod template that references the configuration version:

```yaml
spec:
  template:
    metadata:
      annotations:
        config-version: "v1"
```

When you update the Secret, you also increment this annotation to "v2". The changed Pod template triggers a rolling update automatically.

**[Pause for 1 second]**

Another approach is more sophisticated: use a hash of the Secret contents as an annotation. When the Secret changes, the hash changes, triggering a rollout. Some tools like Helm do this automatically.

Let's look at the solution provided:

```bash
cat labs/secrets/solution.md
```

**[Execute and scroll through solution]**

The solution shows using a config version annotation. This ensures configuration updates and Pod updates happen atomically in a single kubectl apply.

**[Pause for 2 seconds]**

This pattern is important for production systems where configuration consistency is critical.

---

## Exercise 7: Environment Variable Precedence (EXTRA) (15:00 - 16:30)

**[Continue typing]**

If we have time, let's explore something important: what happens when the same configuration key appears in multiple places?

In a Pod spec, you can load configuration from:
- ConfigMaps via envFrom
- Secrets via envFrom
- Direct environment variables via env

What's the precedence order?

Let's test it:

```bash
kubectl apply -f labs/secrets/specs/configurable/secrets-overlapping
```

**[Execute]**

This applies ConfigMaps, Secrets, and a Deployment that loads from all sources. Let's look at the Deployment:

```bash
cat labs/secrets/specs/configurable/secrets-overlapping/deployment-env.yaml
```

**[Execute and highlight the envFrom and env sections]**

Notice:
- envFrom loads from a ConfigMap
- envFrom loads from a Secret
- env defines explicit environment variables

Some keys overlap across these sources. Let's see what wins:

```bash
kubectl rollout status deployment/configurable
```

**[Execute and wait]**

**[Open browser and refresh]**

Look at the configuration display. The precedence order is:
1. env (explicit Pod spec) - highest priority
2. envFrom Secret
3. envFrom ConfigMap - lowest priority

**[Pause for 2 seconds]**

This is important when you need to override configuration for specific Pods while keeping most values in shared ConfigMaps and Secrets.

---

## Exercise 8: Configuration Updates with Volume Mounts (EXTRA) (16:30 - 17:30)

**[Continue in terminal]**

Let's see configuration updates in action. Deploy a new version:

```bash
kubectl apply -f labs/secrets/specs/configurable/secrets-update
```

**[Execute]**

Wait for rollout:

```bash
kubectl rollout status deployment/configurable
```

**[Execute and wait]**

**[Open browser and find secrets.json section]**

Look for Configurable__ConfigVersion in the secrets.json section. It should show v1.

Now we'll update the Secret:

```bash
kubectl apply -f labs/secrets/specs/configurable/secrets-update/v1-update
```

**[Execute]**

This updates the Secret to version v2. Let's check if the file updated inside the Pod:

```bash
kubectl exec deploy/configurable -- cat /app/secrets/secret.json
```

**[Execute every 10 seconds, wait for change]**

It might take 30-60 seconds due to Kubernetes' caching. Once the file updates, check the browser:

**[Refresh browser]**

If the application doesn't show the new value, it means the app isn't watching for file changes. You need to force a Pod restart:

```bash
kubectl rollout restart deploy/configurable
```

**[Execute]**

Wait for new Pods:

```bash
kubectl rollout status deployment/configurable
```

**[Execute and wait]**

**[Refresh browser]**

Now you see v2. This demonstrates the two-phase update: first the file updates, then you restart the app if it doesn't hot-reload.

---

## Cleanup and Summary (17:30 - 18:00)

**[Switch to terminal]**

Let's clean up everything we created:

```bash
kubectl delete all,cm,secret -l kubernetes.courselabs.co=secrets
```

**[Execute]**

This removes all Pods, Deployments, Services, ConfigMaps, and Secrets with our lab label.

**[Pause for 2 seconds]**

Let's recap what we learned:

**First**, we saw why ConfigMaps aren't suitable for sensitive data - everything is visible in plain text.

**Second**, we created Secrets with base64-encoded values in YAML, understanding that encoding is not encryption.

**Third**, we used stringData for convenience when writing Secrets in YAML, letting Kubernetes handle encoding.

**Fourth**, we practiced decoding Secret values, demonstrating how easy it is for anyone with kubectl access.

**Fifth**, we created Secrets from files using imperative commands, supporting workflow separation between security and DevOps teams.

**Sixth**, we explored the challenge of coordinating Secret updates with Deployment rollouts, and saw solution patterns.

**Finally**, we examined environment variable precedence and automatic configuration updates with volume mounts.

**[Pause for 2 seconds]**

Key takeaways:
- Secrets are for sensitive data, ConfigMaps for everything else
- Base64 encoding provides format compatibility, not security
- Use RBAC and encryption at rest for real protection
- Volume mounts support automatic updates, environment variables don't
- Imperative commands are fast for creating Secrets from existing files
- Production updates require coordination between Secret changes and Pod rollouts

In the CKAD exam preparation session, we'll dive deeper into all Secret types, advanced troubleshooting, and speed techniques for passing the certification.

Thanks for following along. Practice these exercises on your own cluster before moving to the exam preparation session.

---

## Presenter Notes

**Timing Checkpoints:**
- Exercise 2 complete by 5:00
- Exercise 5 complete by 12:00
- Exercise 6 complete by 15:00

**Command Preparation:**
- Have all commands ready to paste
- Prepare browser windows in advance
- Test Secret creation before recording
- Have base64 decode tested for your platform

**Key Demonstration Points:**
- Always contrast ConfigMaps (visible) vs Secrets (encoded)
- Show the decoded value to emphasize encoding != encryption
- Demonstrate the workflow separation with from-file
- Highlight the automatic encoding of stringData
- Show both describe (hides values) and get -o yaml (shows encoded values)

**Common Issues to Address:**
- If base64 command doesn't work on Windows, show PowerShell script
- If Secret doesn't mount, check Secret name spelling
- If updates don't appear, explain Kubernetes caching delay
- Emphasize when you need rollout restart vs automatic updates

**Pacing:**
- Speak clearly when executing commands
- Pause after kubectl apply to let changes propagate
- Allow time for browser refreshes
- Don't rush through the lab challenge explanation
- Show patience with configuration update delays (this is realistic)

**Visual Elements:**
- Keep browser and terminal side-by-side when possible
- Zoom in on YAML sections being discussed
- Highlight encoded vs decoded values
- Use terminal colors to distinguish commands from output
- Show the describe output hiding values vs get -o yaml showing them

**Error Handling:**
- If Secret creation fails, verify the path to files
- If Pod doesn't start, use describe pod to show error
- If decode fails, double-check the Secret key name
- Demonstrate troubleshooting as a learning opportunity

**Security Emphasis:**
- Repeatedly mention that base64 is not encryption
- Show how easy it is to decode
- Reference RBAC and encryption at rest as real solutions
- Mention this is why external secret stores exist
