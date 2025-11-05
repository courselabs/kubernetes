# Secrets - CKAD Exam Preparation Narration Script

**Duration:** 20-25 minutes
**Format:** Exam-focused scenarios and advanced techniques
**Audience:** Developers preparing for the CKAD certification exam

---

## Introduction (0:00 - 0:45)

Welcome to the CKAD exam preparation session for Secrets. This is where we move beyond basics and focus on exam-specific scenarios, speed optimization, and advanced troubleshooting.

The CKAD exam tests Secrets heavily because they're fundamental to real-world Kubernetes deployments. You'll encounter Secret questions both standalone and integrated into larger application scenarios. With only 2 hours for 15-20 questions, speed and accuracy are critical.

In this session, we'll cover:
- All Secret creation methods with speed techniques
- Every Secret type including docker-registry and TLS
- Advanced consumption patterns with selective mounting
- Update strategies and immutable Secrets
- Comprehensive troubleshooting methodology
- Timed exam scenarios with solutions

Have your cluster ready. We'll be working through everything in real-time. Let's make sure you're fully prepared.

**[Pause for 2 seconds]**

---

## Section 1: Rapid Secret Creation (0:45 - 4:00)

### Method 1: From Literal Values (0:45 - 1:30)

**[Start typing]**

In the exam, imperative commands are your fastest option. Let's create a Secret with multiple values:

**[Execute]**

Three key-value pairs in one command. Verify it:

**[Execute and show base64-encoded values]**

All values are automatically base64-encoded. This took about 15 seconds.

**Exam tip**: Chain multiple --from-literal flags. Use up-arrow to recall and modify commands instead of retyping.

### Method 2: From Environment Files (1:30 - 2:15)

**[Continue]**

For many values, env files are faster. Create one:

**[Execute]**

Create the Secret:

**[Execute]**

Verify:

**[Execute]**

Five settings created instantly. This is ideal when questions provide multiple values.

**Exam tip**: If you see key=value pairs in the question, copy them to a file and use from-env-file.

### Method 3: From Files (2:15 - 3:00)

**[Continue]**

For configuration files or certificates:

**[Execute]**

Create Secret with filename as key:

**[Execute]**

Or with custom key name:

**[Execute]**

Verify the difference:

**[Execute both]**

First uses "app-config.json" as the key, second uses "config". Read the question carefully for which format they want.

### Method 4: Using --dry-run for YAML (3:00 - 4:00)

**[Continue]**

Generate Secret YAML without creating it:

**[Execute and show output]**

This shows exactly what will be created. You can pipe it to a file:

**[Execute]**

Edit if needed, then apply:

**[Execute]**

**Exam tip**: Use --dry-run=client -o yaml to preview, especially for complex Secrets. It's faster than writing YAML from scratch.

---

## Section 2: Secret Types - Docker Registry and TLS (4:00 - 7:30)

### Docker Registry Secrets (4:00 - 5:30)

**[Continue]**

Docker registry Secrets are common in exams for pulling private images. Create one:

**[Execute]**

Examine it:

**[Execute and show the .dockerconfigjson key]**

The Secret contains a .dockerconfigjson field with base64-encoded Docker credentials. Now use it in a Pod:

**[Execute]**

Apply it:

**[Execute]**

Check status:

**[Execute]**

It will fail because the registry doesn't exist, but you can see it attempts to use the credentials. In the exam, the registry will be real.

**Exam scenario**: "Create a Pod that pulls an image from a private registry at registry.example.com using credentials user/pass."

**Solution**: Create docker-registry Secret, then reference it with imagePullSecrets.

### TLS Secrets (5:30 - 7:30)

**[Continue]**

TLS Secrets store certificates and keys for HTTPS. First, create a self-signed certificate for testing:

**[Execute]**

Now create the TLS Secret:

**[Execute]**

Examine it:

**[Execute and show tls.crt and tls.key fields]**

TLS Secrets automatically validate that both certificate and key are present. These are commonly used with Ingress:

**[Execute]**

**Exam tip**: TLS Secret questions often combine with Ingress configuration. Know both topics well.

---

## Section 3: Using Secrets in Pods (7:30 - 12:00)

### As Environment Variables - All Keys (7:30 - 8:30)

**[Continue]**

Load all Secret keys as environment variables:

**[Execute]**

Apply and check:

**[Execute]**

All keys from db-config are now environment variables. Simple and fast.

### As Environment Variables - Specific Keys (8:30 - 9:30)

**[Continue]**

Load only specific keys and optionally rename them:

**[Execute]**

Apply and verify:

**[Execute]**

Only specified keys are loaded, and we renamed them (username -> DATABASE_USER).

**Exam tip**: Use envFrom when you need all keys. Use env when you need specific keys or want to rename them.

### As Volume Mounts - Entire Secret (9:30 - 10:30)

**[Continue]**

Mount all Secret keys as files:

**[Execute]**

Apply and check:

**[Execute]**

Each Secret key becomes a file. The key is the filename, the value is the file contents (decoded).

### As Volume Mounts - Specific Keys (10:30 - 11:30)

**[Continue]**

Mount only specific keys with custom filenames:

**[Execute]**

Apply and verify:

**[Execute]**

Only username and password are mounted, renamed to db-user.txt and db-pass.txt. The password file has mode 0400 (read-only for owner).

**Exam tip**: Use items with path to select specific keys and rename files. Use mode to set file permissions.

### SubPath for Individual Files (11:30 - 12:00)

**[Continue]**

Critical pattern for avoiding directory overwrites:

**[Execute]**

Apply and check:

**[Execute]**

Individual files are mounted without replacing the entire directory.

**Critical exam point**: Always use subPath when mounting into directories with existing files.

---

## Section 4: Managing Secret Updates (12:00 - 15:00)

### Understanding Update Behavior (12:00 - 13:00)

**[Continue]**

Create a test Pod with both environment variables and volume mounts:

**[Execute]**

Apply and watch logs:

**[Execute]**

Now update the Secret:

**[Execute]**

Watch the logs. Within 60 seconds:
- ENV: Still shows "admin" (old value)
- FILE: Shows "updated-admin" (new value)

**[Press Ctrl+C to stop logs]**

**Key point**: Environment variables NEVER update. Volume mounts update automatically with a delay.

**Exam tip**: If asked about updating configuration without Pod restart, use volume mounts.

### Pattern 1: Annotation-Based Updates (13:00 - 14:00)

**[Continue]**

Force Deployment rollout when Secret changes using annotations:

**[Execute]**

Apply:

**[Execute]**

Now update both Secret and Deployment:

**[Execute both]**

The annotation change triggers automatic rollout:

**[Execute]**

New Pods pick up the new Secret values.

### Pattern 2: Immutable Secrets with Versioning (14:00 - 15:00)

**[Continue]**

Create immutable Secret with version in name:

**[Execute]**

Apply:

**[Execute]**

Try to update it:

**[Execute and show error]**

It fails! Immutable Secrets cannot be updated. To update, create a new version:

**[Execute]**

Apply v2:

**[Execute]**

Update Deployment to reference v2:

**[Execute]**

Kubernetes performs rolling update automatically. Benefits:
- Protection against accidental changes
- Better performance (no watching for changes)
- Easy rollback (just reference previous version)

**Exam tip**: If question mentions "production" or "prevent updates", think immutable Secrets.

---

## Section 5: Troubleshooting Secrets (15:00 - 18:30)

### Issue 1: Secret Not Found (15:00 - 15:45)

**[Continue]**

Create Pod referencing non-existent Secret:

**[Execute]**

Apply:

**[Execute]**

Status: CreateContainerConfigError. Describe it:

**[Execute and show "secret 'nonexistent-secret' not found"]**

**Debugging steps**:

**Solution 1**: Create the missing Secret.

**Solution 2**: Make it optional:

Pod will start even without the Secret.

### Issue 2: Wrong Key Name (15:45 - 16:30)

**[Continue]**

Reference non-existent key:

**[Execute]**

Apply and check:

**[Execute]**

Error: "key 'wrong_key' not found in Secret 'db-credentials'"

**Debugging**:

**[Execute and show correct keys]**

Fix the key name in Pod spec.

**Exam tip**: Always verify Secret keys with describe before creating Pods.

### Issue 3: Namespace Mismatch (16:30 - 17:00)

**[Continue]**

Secrets must be in the same namespace as Pods:

**[Execute]**

This will fail because the Secret is in default, not test.

**Solution**: Create Secret in the correct namespace:

**[Execute]**

### Issue 4: Volume Mount Overwrites Directory (17:00 - 18:00)

**[Continue]**

Classic mistake:

**[Execute]**

Apply and check:

**[Execute]**

Instead of index.html, you see Secret keys. The mount replaced the entire directory.

**Solution**: Use subPath or mount to different directory.

### Issue 5: Decoding for Verification (18:00 - 18:30)

**[Continue]**

Quick commands for debugging Secret values:

**[Execute all]**

**Exam tip**: Use jsonpath with base64 -d to quickly verify Secret values.

---

## Section 6: ServiceAccounts with imagePullSecrets (18:30 - 19:30)

**[Continue]**

ServiceAccounts can reference docker-registry Secrets, automatically providing credentials to all Pods:

**[Execute]**

Apply:

**[Execute]**

The Pod automatically gets registry credentials through the ServiceAccount. No need to specify imagePullSecrets in every Pod.

**Exam scenario**: "All Pods in namespace should pull from private registry."

**Solution**: Create ServiceAccount with imagePullSecrets, use it as default or in all Pods.

---

## Section 7: Exam Scenarios and Speed Techniques (19:30 - 23:00)

### Scenario 1: Database Credentials Setup (19:30 - 20:30)

**[Continue]**

**Exam question**: "Create a Secret with database credentials (host, port, user, password) and use it in a Deployment running postgres client."

**Time limit**: 5 minutes

**Solution**:

**[Execute all]**

Total time: 2.5 minutes. Well under the limit.

**Speed tip**: kubectl set env is much faster than editing YAML.

### Scenario 2: TLS Certificate for Ingress (20:30 - 21:30)

**[Continue]**

**Exam question**: "Create TLS Secret from provided certificate files and configure Ingress to use HTTPS."

**Solution**:

**[Execute]**

Total: ~2 minutes.

**Exam tip**: The --rule flag with tls= parameter creates Ingress with TLS in one command.

### Scenario 3: Private Registry Access (21:30 - 22:30)

**[Continue]**

**Exam question**: "Deploy application from private registry gcr.io/myproject using credentials."

**Solution**:

**[Execute]**

**Alternative with ServiceAccount**:

**[Execute]**

### Scenario 4: Multi-Source Configuration (22:30 - 23:00)

**[Continue]**

**Exam question**: "Application needs database password from Secret, host from ConfigMap, and custom timeout as direct env var."

**Solution**:

**[Execute]**

**Speed technique**: Use kubectl run with --dry-run, then edit:

---

## Section 8: Quick Command Reference (23:00 - 24:00)

**[Continue speaking while showing reference]**

Essential commands for the exam:

**Creation**:

**Inspection**:

**Deployment Integration**:

**Debugging**:

---

## Section 9: Exam Tips and Best Practices (24:00 - 25:00)

**[Continue]**

Critical exam tips:

**Time Management**:
- Creating a Secret: 20-30 seconds
- Using it in a Pod: 30-60 seconds
- Complete Secret question: 3-5 minutes max
- If taking longer, skip and return later

**Command Efficiency**:
- kubectl create secret for speed
- kubectl set env for adding to Deployments
- kubectl patch for specific changes
- --dry-run=client -o yaml to preview

**Common Mistakes**:
- Forgetting quotes around values with special characters
- Using ConfigMap instead of Secret (or vice versa)
- Mounting without subPath and breaking directories
- Not setting optional: true when Secret might not exist
- Namespace mismatch between Secret and Pod

**What to Memorize**:
- secretRef vs secretKeyRef syntax
- imagePullSecrets structure
- TLS Secret field names (tls.crt, tls.key)
- Volume mount with items and mode
- subPath syntax

**Verification Checklist**:
1. kubectl get secret - exists
2. kubectl describe secret - has correct keys
3. kubectl get pod - running
4. kubectl logs pod - started correctly
5. kubectl exec pod -- env or ls - values present

**Final Tips**:
- Practice with timer
- Learn vim basics for quick edits
- Use kubectl explain when stuck
- Read questions twice
- Move on if stuck, come back later

---

## Conclusion (25:00)

**[Wrap up]**

Secrets are fundamental to CKAD and appear throughout the exam. Master these skills:

- All creation methods with speed
- Every Secret type especially docker-registry and TLS
- Both consumption patterns with advanced options
- Troubleshooting methodology
- Update strategies including immutable Secrets
- Critical subPath pattern

Practice until you can complete any Secret task in under 5 minutes. The exam rewards speed and accuracy.

Good luck with your CKAD exam. Keep practicing, stay calm, and remember: kubectl is your best friend.

---
