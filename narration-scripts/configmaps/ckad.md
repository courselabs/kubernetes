# ConfigMaps - CKAD Exam Preparation Narration Script

**Duration:** 20-25 minutes
**Format:** Exam-focused scenarios and advanced techniques
**Audience:** Developers preparing for the CKAD certification exam

---

## Introduction (0:00 - 0:45)

Welcome to the CKAD exam preparation session for ConfigMaps. This is where we move beyond basics and focus on exam-specific scenarios, advanced techniques, and speed optimization.

The CKAD exam is time-constrained - you have 2 hours to complete 15-20 questions. ConfigMaps will appear in multiple questions, both as standalone topics and as part of larger application deployment scenarios.

In this session, we'll cover:
- All four ConfigMap creation methods with exam tips
- Advanced consumption patterns including selective mounting and subPath
- Immutable ConfigMaps and update strategies
- Troubleshooting common issues
- Exam scenarios with time-saving techniques

Let's make sure you're fully prepared. I'll be demonstrating everything in real-time, so follow along with your own cluster.

**[Pause for 2 seconds]**

---

## Section 1: Rapid ConfigMap Creation (0:45 - 4:00)

### Method 1: From Literals (0:45 - 1:30)

**[Start typing]**

In the exam, you'll often need to create ConfigMaps quickly. The from-literal method is fastest for simple key-value pairs.

**[Execute]**

Three settings, one command. Let's verify:

**[Execute and show output]**

All three key-value pairs are in the data section. This took about 10 seconds.

**Pro tip for the exam**: You can chain multiple --from-literal flags. Use up arrow and modify previous commands instead of retyping.

### Method 2: From Environment Files (1:30 - 2:15)

**[Continue]**

For multiple values, environment files are even faster. Let me create one:

**[Execute]**

Now create the ConfigMap:

**[Execute]**

Verify:

**[Execute]**

Five settings in seconds. This is ideal when you have many configuration values.

**Exam tip**: The question might provide values in a specific format. If you see key=value pairs, copy them to a file and use from-env-file.

### Method 3: From Files (2:15 - 3:00)

**[Continue]**

For configuration files like JSON or properties files:

**[Execute]**

Create ConfigMap with the filename as key:

**[Execute]**

Or with a custom key name:

**[Execute]**

Verify the difference:

**[Execute both]**

Notice how the key name changes. In the exam, read carefully whether they want the actual filename or a specific key name.

### Method 4: From Directories (3:00 - 4:00)

**[Continue]**

Create a directory with multiple files:

**[Execute]**

Create ConfigMap from entire directory:

**[Execute]**

Check the result:

**[Execute]**

Each file in the directory became a key in the ConfigMap. This is powerful when you have multiple configuration files.

**Exam tip**: The --dry-run=client -o yaml flag lets you preview before creating:

**[Execute]**

This shows you exactly what will be created. Use it to verify before applying.

---

## Section 2: Advanced Consumption Patterns (4:00 - 8:30)

### Pattern 1: Selective Environment Variables (4:00 - 5:00)

**[Continue]**

Let's create a Pod that uses both envFrom and selective env entries:

**[Execute]**

Apply and check:

**[Execute]**

Notice DATABASE_PORT is 5432, not 3306. When you mix envFrom and env, the env entries take precedence.

**Exam scenario**: "Override one value from a ConfigMap while keeping others." Use envFrom for the ConfigMap, then add specific env entries to override.

### Pattern 2: Environment Variable Prefix (5:00 - 5:45)

**[Continue]**

Prevent naming collisions with prefixes:

**[Execute]**

Apply and verify:

**[Execute]**

All ConfigMap keys are prefixed with APP_. You see APP_database_host, APP_database_port, etc.

**Exam tip**: This is useful when multiple ConfigMaps might have overlapping keys.

### Pattern 3: Selective Key Mounting (5:45 - 7:00)

**[Continue]**

Mount only specific keys from a ConfigMap:

**[Execute]**

Apply and check:

**[Execute]**

Only two of the three files from the ConfigMap are mounted, and features.json was renamed to app-features.json.

**Exam scenario**: "Mount only the database config file from a ConfigMap containing multiple files."

### Pattern 4: SubPath for Individual Files (7:00 - 8:30)

**[Continue]**

The critical pattern for avoiding directory overwrites:

**[Execute]**

First, create the nginx-config ConfigMap:

**[Execute]**

Now apply the Pod:

**[Execute]**

Check the mount:

**[Execute]**

The file exists at the exact path. Without subPath, the entire /etc/nginx/conf.d directory would be replaced.

**Critical exam point**: Always use subPath when mounting into directories that contain other important files.

---

## Section 3: Immutable ConfigMaps (8:30 - 11:00)

### Creating Immutable ConfigMaps (8:30 - 9:30)

**[Continue]**

Immutable ConfigMaps are important for production and exam scenarios:

**[Execute]**

Apply it:

**[Execute]**

Now try to update it:

**[Execute and show error]**

It fails! Immutable ConfigMaps cannot be updated. This provides:
- Protection against accidental changes
- Better cluster performance (kube-apiserver doesn't watch for changes)
- Predictable behavior in production

### Version-Based Update Strategy (9:30 - 11:00)

**[Continue]**

The proper way to update immutable ConfigMaps is with versioning:

**[Execute]**

Apply v2:

**[Execute]**

Now create a Deployment using this pattern:

**[Execute]**

Apply:

**[Execute]**

To roll out configuration changes, create v3, update the Deployment to reference v3, and let Kubernetes perform a rolling update. This ensures zero-downtime config changes.

**Exam tip**: If a question mentions "production" or "cannot update," think immutable ConfigMaps with version numbers.

---

## Section 4: Troubleshooting ConfigMaps (11:00 - 15:00)

### Issue 1: Missing ConfigMap (11:00 - 12:00)

**[Continue]**

Let's create a Pod referencing a non-existent ConfigMap:

**[Execute]**

Apply:

**[Execute]**

Check status:

**[Execute]**

It's stuck in CreateContainerConfigError. Describe it:

**[Execute and show events]**

The events section shows: "configmap 'nonexistent-config' not found."

**Solution**: Make the ConfigMap optional:

**[Execute]**

Apply:

**[Execute]**

It runs! The optional flag allows the Pod to start even without the ConfigMap.

### Issue 2: Wrong Key Name (12:00 - 13:00)

**[Continue]**

Reference a key that doesn't exist:

**[Execute]**

Apply:

**[Execute]**

CreateContainerConfigError again. Describe:

**[Execute]**

Error: "key 'wrong_key_name' not found in ConfigMap 'app-config'."

**Debugging approach**:
1. List ConfigMap keys:

**[Execute]**

2. Find the correct key name
3. Update Pod spec with correct key

**Exam tip**: Always verify ConfigMap keys with describe before creating Pods that reference them.

### Issue 3: Volume Mount Overwrites Directory (13:00 - 14:00)

**[Continue]**

The classic mistake:

**[Execute]**

Apply:

**[Execute]**

The Pod runs, but nginx won't serve correctly:

**[Execute]**

Instead of index.html, you see ConfigMap keys. The volume mount replaced the entire directory.

**Solution**: Use subPath:

Or mount to a different directory entirely.

### Issue 4: ConfigMap Updates Not Reflecting (14:00 - 15:00)

**[Continue]**

Create a Pod with both environment variables and volume mounts:

**[Execute]**

Apply and watch logs:

**[Execute and show output]**

Now update the ConfigMap:

**[Execute]**

Keep watching the logs. Within 60 seconds, you'll see:
- ENV variable: Still shows old value
- File from volume mount: Shows new value

**Key point**: Environment variables are static. Volume mounts update automatically but with a delay.

**Exam tip**: If asked about updating configuration without Pod restart, use volume mounts, not environment variables.

---

## Section 5: File Permissions and Binary Data (15:00 - 17:00)

### Setting File Permissions (15:00 - 16:00)

**[Continue]**

Control permissions on mounted files:

**[Execute]**

Apply and check:

**[Execute]**

Features.json has 0600 permissions (only owner can read/write), overriding the default 0644.

**Exam scenario**: "Ensure configuration file is only readable by the application user."

### Binary Data in ConfigMaps (16:00 - 17:00)

**[Continue]**

ConfigMaps can store binary data in base64:

**[Execute]**

Create ConfigMap with binary data:

**[Execute]**

Check it:

**[Execute]**

Kubernetes automatically detects binary files and stores them in the binaryData field with base64 encoding.

Mount it in a Pod:

**[Execute]**

Apply and verify:

**[Execute]**

The binary file is correctly mounted and usable.

---

## Section 6: Exam Scenarios and Speed Techniques (17:00 - 22:00)

### Scenario 1: Application Configuration Migration (17:00 - 18:30)

**[Continue]**

**Exam question**: "An application currently uses hardcoded environment variables in its Deployment. Move the configuration to a ConfigMap without changing the application code."

**Time limit**: 5 minutes

**Solution approach**:

Step 1: Examine current Deployment:

**[Execute]**

Step 2: Extract environment variables:

**[Execute]**

Step 3: Create ConfigMap quickly:

**[Execute]**

Step 4: Update Deployment (fastest way):

**[Execute]**

Verify:

**[Execute]**

**Time saved**: Using kubectl create and kubectl patch is faster than editing YAML files in vim.

### Scenario 2: Multi-Environment Configuration (18:30 - 19:45)

**[Continue]**

**Exam question**: "Create development and production ConfigMaps for an application. Deploy the application to the dev namespace with dev config."

**Time limit**: 4 minutes

**Solution**:

**[Execute]**

**[Execute]**

**[Execute]**

**[Execute]**

**[Execute]**

Verify:

**[Execute]**

**Speed tip**: kubectl set env is much faster than editing Deployment YAML.

### Scenario 3: Configuration Hot-Reload (19:45 - 20:45)

**[Continue]**

**Exam question**: "Configure an application to automatically pick up configuration changes without Pod restart."

**Solution**: Use volume mounts, not environment variables.

**[Execute]**

**[Execute]**

**[Execute]**

Watch logs in background:

**[Execute]**

Update ConfigMap:

**[Execute]**

Within 60 seconds, logs show the new version. No Pod restart needed.

### Scenario 4: Troubleshooting Broken Configuration (20:45 - 22:00)

**[Continue]**

**Exam question**: "A Pod is in CreateContainerConfigError state. Fix it."

**Time limit**: 3 minutes

**Approach**:

**[Execute]**

**[Execute]**

Common issues and fixes:

**Issue**: ConfigMap not found

**Issue**: Key not found in ConfigMap

**Issue**: Namespace mismatch

**Speed technique**: Use describe pod, describe configmap, and logs in that order. This catches 90% of configuration issues.

---

## Section 7: Quick Command Reference (22:00 - 23:30)

**[Continue speaking while showing reference]**

Let me give you a rapid-fire reference of commands you must know for the exam:

**Creation**:

**Inspection**:

**Updates**:

**Deployment Integration**:

**Debugging**:

---

## Section 8: Exam Tips and Best Practices (23:30 - 25:00)

**[Continue]**

Let me share critical exam tips based on ConfigMap questions:

**Time Management**:
- Creating a ConfigMap should take 30 seconds
- Adding it to a Deployment should take 60 seconds
- Total ConfigMap question: 3-5 minutes maximum
- If you're taking longer, you're doing it wrong

**Command Efficiency**:
- Use kubectl create with --from-literal for quick creation
- Use kubectl set env to add ConfigMaps to Deployments
- Use --dry-run=client -o yaml to preview before applying
- Use kubectl patch for surgical updates

**Common Mistakes to Avoid**:
- Don't forget the quotes around values with special characters
- Don't use Secrets for non-sensitive data (overkill)
- Don't mount ConfigMaps to critical directories without subPath
- Don't forget optional: true when ConfigMap might not exist

**What to Memorize**:
- envFrom vs env vs volumeMounts syntax
- configMapRef vs configMapKeyRef
- subPath syntax for individual file mounts
- immutable: true for production scenarios

**Exam Question Patterns**:
- "Create a ConfigMap and use it in a Pod" - Basic creation and consumption
- "Update application configuration without downtime" - Volume mounts and rolling updates
- "Fix a Pod in error state" - Troubleshooting ConfigMap issues
- "Separate dev and prod configuration" - Namespace-specific ConfigMaps
- "Prevent accidental config changes" - Immutable ConfigMaps

**Verification Steps**:
Always verify your work:
1. kubectl get configmap - ConfigMap exists
2. kubectl describe configmap - Contains correct data
3. kubectl get pod - Pod is Running
4. kubectl logs pod - Application started correctly
5. kubectl exec pod -- env or ls /config - Configuration is present

**Final Tips**:
- Practice with a timer - speed matters
- Learn vim or nano basics for YAML editing
- Use kubectl explain when you forget syntax
- Read the question twice - they often hide details
- If something fails, move on and come back

---

## Conclusion (25:00)

**[Wrap up]**

ConfigMaps are fundamental to Kubernetes application deployment and will appear throughout the CKAD exam. Master these skills:

- All four creation methods with speed
- Both consumption patterns: environment variables and volume mounts
- Troubleshooting with describe, logs, and exec
- Immutable ConfigMaps and version-based updates
- The critical subPath pattern

Practice until you can complete any ConfigMap task in under 5 minutes. The exam is about speed and accuracy.

Good luck with your CKAD exam preparation. Keep practicing, stay calm during the exam, and remember: kubectl is your friend.

---
