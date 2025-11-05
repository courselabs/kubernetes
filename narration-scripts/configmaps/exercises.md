# ConfigMaps - Exercises Narration Script

**Duration:** 15-18 minutes
**Format:** Hands-on demonstration following README.md exercises
**Audience:** Developers practicing Kubernetes ConfigMap operations

---

## Introduction (0:00 - 0:30)

Welcome to the hands-on ConfigMaps lab. In this session, we'll work through practical exercises that demonstrate how to create ConfigMaps and use them in real applications.

We'll be using a demo application called "configurable" that's designed to show configuration from multiple sources. It displays its active configuration settings through a web interface, making it easy to see exactly how ConfigMaps affect your running applications.

Make sure you have a Kubernetes cluster running and kubectl configured. Let's get started.

**[Pause for 2 seconds]**

---

## Exercise 1: Running the Demo App with Defaults (0:30 - 2:30)

**[Start typing]**

First, let's run the configurable app without any ConfigMaps to see its default behavior.

We'll use kubectl run to create a Pod imperatively. This is useful for quick testing, though in production you'd always use YAML.

```bash
kubectl run configurable --image=sixeyed/configurable:21.04 \
  --labels='kubernetes.courselabs.co=configmaps'
```

**[Execute command]**

The Pod is created. Now let's wait for it to be ready:

```bash
kubectl wait --for=condition=Ready pod configurable
```

**[Wait for output]**

Perfect, the Pod is running. Now let's access the application using port-forward:

```bash
kubectl port-forward pod/configurable 8080:80
```

**[Execute and switch to browser]**

Open your browser to localhost:8080. You should see the configurable application interface.

**[Show browser window at localhost:8080]**

Notice the configuration section. These are the default settings from the appsettings.json file that's baked into the container image. The release version is coming from the Docker image, and you can see various environment variables that Kubernetes automatically sets.

This demonstrates an important point: every application has default configuration. ConfigMaps allow you to override these defaults without rebuilding the image.

**[Switch back to terminal]**

Let's clean this up:

**[Press Ctrl-C to exit port-forward]**

```bash
kubectl delete pod configurable
```

**[Execute]**

---

## Exercise 2: Setting Config with Environment Variables (2:30 - 5:00)

**[Continue typing]**

Now let's see how to add configuration through the Pod spec itself. We'll use environment variables defined directly in the YAML.

Let me show you the deployment manifest:

```bash
cat labs/configmaps/specs/configurable/deployment.yaml
```

**[Execute and highlight the env section]**

Notice the env section in the container spec. It defines a single environment variable called Configurable__Release with the value 24.01.1. The double underscore is a naming convention used by this .NET application to represent nested configuration.

Let's deploy this:

```bash
kubectl apply -f labs/configmaps/specs/configurable/
```

**[Execute]**

This creates both a Deployment and a Service. Let's verify the environment variable is set inside the container:

```bash
kubectl exec deploy/configurable -- printenv | grep __
```

**[Execute]**

There it is: Configurable__Release=24.01.1. The environment variable is set in the container.

Now let's access the application through the Service:

```bash
kubectl get svc -l app=configurable
```

**[Execute and show output]**

You can see the Service has a NodePort. If you're using Docker Desktop or kind, you can access it at localhost and that port number. If you're using a cloud cluster, use the external IP.

**[Open browser to the service]**

Look at the configuration display. The release is now 24.01.1, overriding the default from the image.

**[Pause for 2 seconds]**

This approach works for simple cases, but it has limitations. For multiple settings, you'd need multiple environment variable definitions, which makes the YAML verbose. That's where ConfigMaps come in.

---

## Exercise 3: Creating and Using ConfigMaps with Environment Variables (5:00 - 8:00)

**[Switch back to terminal]**

Let's create a ConfigMap to hold multiple environment variables. First, let's look at the ConfigMap definition:

```bash
cat labs/configmaps/specs/configurable/config-env/configmap-env.yaml
```

**[Execute and show output]**

This ConfigMap has two key-value pairs: Configurable__Release set to 24.01.2, and Configurable__Environment set to uat. Both will become environment variables.

Now let's look at how the Deployment uses it:

```bash
cat labs/configmaps/specs/configurable/config-env/deployment-env.yaml
```

**[Execute and highlight the envFrom section]**

Instead of listing individual environment variables, we use envFrom with a configMapRef. This loads all key-value pairs from the ConfigMap as environment variables.

Let's apply these changes:

```bash
kubectl apply -f labs/configmaps/specs/configurable/config-env/
```

**[Execute]**

This creates the ConfigMap and updates the Deployment. Remember, when you update a Deployment, it creates a new ReplicaSet with the updated Pod template.

Let's verify the environment variables in the new Pod:

```bash
kubectl exec deploy/configurable -- printenv | grep __
```

**[Execute]**

Perfect! Now we see Configurable__Release=24.01.2 and Configurable__Environment=uat. Both values from the ConfigMap are available as environment variables.

**[Refresh browser]**

If you refresh the web page, you'll see the new release number and environment setting displayed.

**[Pause for 2 seconds]**

This is much cleaner than defining environment variables directly in the Pod spec. You can reuse the same ConfigMap across multiple Deployments, and updating configuration is as simple as editing the ConfigMap YAML.

---

## Exercise 4: Using ConfigMaps as Files (8:00 - 11:30)

**[Continue in terminal]**

Environment variables are useful, but files are even better for complex configuration. Let's see how to load configuration from a JSON file stored in a ConfigMap.

First, let's examine the ConfigMap:

```bash
cat labs/configmaps/specs/configurable/config-json/configmap-json.yaml
```

**[Execute and show output]**

This ConfigMap has a data section with a key called override.json. The value after the pipe and dash is the entire JSON file contents. Notice how the JSON is indented - it needs to be one level deeper than the filename.

The JSON contains nested configuration with a Release setting.

Now let's look at the updated Deployment:

```bash
cat labs/configmaps/specs/configurable/config-json/deployment-json.yaml
```

**[Execute and highlight volumes and volumeMounts sections]**

There are two key sections here:

First, the volumes section at the Pod level. It defines a volume named config-override that sources from our ConfigMap.

Second, the volumeMounts section in the container spec. It mounts that volume to /app/config in the container filesystem, with readOnly set to true.

Let's apply this configuration:

```bash
kubectl apply -f labs/configmaps/specs/configurable/config-json/
```

**[Execute]**

The Deployment is updated and new Pods are created. Let's explore the container filesystem:

```bash
kubectl exec deploy/configurable -- ls /app/
```

**[Execute]**

You see several files including appsettings.json. That's from the container image.

Now let's look in the config directory:

```bash
kubectl exec deploy/configurable -- ls /app/config/
```

**[Execute]**

There's override.json. That's our ConfigMap mounted as a file.

Let's see its contents:

```bash
kubectl exec deploy/configurable -- cat /app/config/override.json
```

**[Execute]**

Perfect! It's the JSON from our ConfigMap. The application reads this file at startup and merges it with the default configuration.

**[Refresh browser]**

Look at the application UI. You'll see new settings coming from the override.json file.

**[Pause for 2 seconds]**

Now let's check something interesting. Look at the release value:

```bash
kubectl exec deploy/configurable -- cat /app/config/override.json
```

**[Execute and show Release: 24.01.3]**

The JSON file says 24.01.3. But let's check the environment variable:

```bash
kubectl exec deploy/configurable -- printenv | grep __
```

**[Execute and show Configurable__Release=24.01.2]**

The environment variable still says 24.01.2 from our earlier ConfigMap.

**[Switch to browser and point to Release display]**

If you look at the UI, which value is shown? The 24.01.2 from the environment variable.

This demonstrates configuration hierarchy. This particular application prioritizes environment variables over file-based configuration, so the environment variable wins. Different applications handle configuration precedence differently, so it's important to understand your application's behavior.

---

## Exercise 5: Lab Challenge - Creating ConfigMaps Imperatively (11:30 - 14:30)

**[Back to terminal]**

Now it's your turn to practice. Here's the lab challenge:

You need to create two ConfigMaps imperatively using kubectl create commands, without writing YAML. These ConfigMaps will support a Deployment that requires specific configuration values.

Let me show you the Deployment spec:

```bash
cat labs/configmaps/specs/configurable/lab/deployment-lab.yaml
```

**[Execute and highlight the ConfigMap references]**

This Deployment expects:
1. A ConfigMap named configurable-env-lab with environment variables
2. A ConfigMap named configurable-override-lab with a JSON file

Your task is to create:
- Environment variable: Configuration__Release=21.04-lab
- JSON file with: Features.DarkMode=true

**[Pause for 5 seconds]**

Let me show you the solution. First, create the environment variable ConfigMap using from-literal:

```bash
kubectl create configmap configurable-env-lab \
  --from-literal=Configurable__Release='21.04-lab'
```

**[Execute]**

Let's verify it was created correctly:

```bash
kubectl describe configmap configurable-env-lab
```

**[Execute and show output]**

Good! The key and value are there.

Now for the JSON file ConfigMap. We need a file first. There's one in the solution directory:

```bash
cat labs/configmaps/solution/override.json
```

**[Execute and show JSON content]**

This JSON has the nested Features.DarkMode setting. Now create the ConfigMap from this file:

```bash
kubectl create configmap configurable-override-lab \
  --from-file=labs/configmaps/solution/override.json
```

**[Execute]**

The filename override.json becomes the key in the ConfigMap, and the file contents become the value. Let's verify:

```bash
kubectl describe configmap configurable-override-lab
```

**[Execute and show the JSON in the output]**

Perfect! Now we can deploy the lab application:

```bash
kubectl apply -f labs/configmaps/specs/configurable/lab/
```

**[Execute]**

Wait a moment for the rollout to complete:

```bash
kubectl rollout status deployment/configurable
```

**[Execute and wait]**

Now let's check the application:

```bash
kubectl get svc configurable
```

**[Execute and note the NodePort]**

**[Open browser to the service]**

Excellent! Look at the configuration display. The release shows 21.04-lab from our environment variable ConfigMap, and you can see the DarkMode feature flag from our JSON file ConfigMap.

**[Pause for 2 seconds]**

This demonstrates both imperative ConfigMap creation methods: from-literal for simple key-value pairs, and from-file for configuration files. Both are useful in different scenarios.

---

## Exercise 6: Understanding Volume Mount Gotchas (14:30 - 16:30)

**[Back to terminal]**

Before we finish, let's explore one important gotcha with volume mounts. When you mount a ConfigMap as a volume, it replaces the entire target directory. This can break your application if you're not careful.

Let me show you a broken example:

```bash
cat labs/configmaps/specs/configurable/config-broken/deployment-broken.yaml
```

**[Execute and highlight the mountPath: /app]**

This configuration mounts a ConfigMap to /app, which is where the application binary lives. Let's see what happens:

```bash
kubectl apply -f labs/configmaps/specs/configurable/config-broken/
```

**[Execute]**

Watch the Pods:

```bash
kubectl get pods -l app=configurable --watch
```

**[Wait for new Pod to appear and show CrashLoopBackOff]**

Notice that a new Pod is created, but it goes into CrashLoopBackOff. The Pod keeps restarting and failing.

**[Press Ctrl-C]**

Let's check the logs:

```bash
kubectl logs -l app=configurable,broken=bad-mount
```

**[Execute and show error]**

The container can't find the application to run because the volume mount replaced the entire /app directory, including the application binary. The ConfigMap contents overwrote everything.

But notice something interesting:

```bash
kubectl get replicaset -l app=configurable
```

**[Execute]**

There are two ReplicaSets. The old one still has its Pod running, and the new broken one can't start. The Deployment protects you by not terminating the old Pods until the new ones are healthy.

**[Pause for 2 seconds]**

The solution is to either mount to a different directory, or use subPath to mount individual files instead of replacing directories. Always be careful with volume mount paths.

---

## Cleanup and Summary (16:30 - 18:00)

**[Continue in terminal]**

Let's clean up all the resources we created:

```bash
kubectl delete configmap,deploy,svc,pod -l kubernetes.courselabs.co=configmaps
```

**[Execute]**

This deletes all objects with our lab label.

**[Pause for 2 seconds]**

Let's recap what we learned in this hands-on session:

**First**, we ran an application with default configuration to establish a baseline.

**Second**, we added configuration through environment variables defined directly in the Pod spec.

**Third**, we created ConfigMaps to hold environment variables and loaded them with envFrom. This keeps configuration separate from the Deployment spec.

**Fourth**, we created ConfigMaps containing file data and mounted them as volumes into the container filesystem. This supports complex configuration formats like JSON.

**Fifth**, we practiced creating ConfigMaps imperatively using kubectl create with both from-literal and from-file options.

**Finally**, we explored volume mount gotchas and saw how improper mount paths can break your application.

**[Pause for 2 seconds]**

Key takeaways:
- Environment variables are simple but static - they require Pod restarts to update
- Volume mounts support complex configuration and update automatically
- Understanding your application's configuration hierarchy is crucial
- Imperative ConfigMap creation is faster for quick tasks
- Always use labels for easy cleanup

In the next session, we'll dive into CKAD exam scenarios, covering advanced topics like immutable ConfigMaps, troubleshooting, and exam-specific tips.

**[Pause for 1 second]**

Thanks for following along. Make sure to practice these exercises on your own cluster before moving on to the exam preparation session.

---

## Presenter Notes

**Timing Checkpoints:**
- Exercise 2 complete by 5:00
- Exercise 4 complete by 11:30
- Exercise 5 complete by 14:30

**Command Preparation:**
- Have all commands ready to paste to minimize typing time
- Prepare browser windows in advance
- Test port-forward access before recording

**Key Demonstration Points:**
- Always show the configuration in the browser after each change
- Highlight the specific YAML sections before executing commands
- Use printenv to verify environment variables are set
- Use exec ls and cat to explore mounted volumes
- Emphasize the difference between env, envFrom, and volumeMounts

**Common Issues to Address:**
- If port-forward fails, check if Pod is Running
- If Service access fails, verify NodePort or LoadBalancer is ready
- If ConfigMap mount doesn't appear, check spelling of ConfigMap name
- Show that describe configmap helps verify ConfigMap contents

**Pacing:**
- Speak clearly when executing commands
- Pause after each kubectl apply to let changes propagate
- Allow time for browser refreshes to show new configuration
- Don't rush through the volume mount gotcha - it's important

**Visual Elements:**
- Keep browser and terminal side-by-side when possible
- Zoom in on YAML sections being discussed
- Highlight configuration values in the browser UI
- Use terminal colors to distinguish commands from output

**Error Handling:**
- If something doesn't work, show the troubleshooting process
- Use kubectl describe and kubectl logs to diagnose issues
- Demonstrate that errors are learning opportunities
