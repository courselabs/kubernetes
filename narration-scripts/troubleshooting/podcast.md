# Troubleshooting Kubernetes - Podcast Script

**Duration:** 18-20 minutes
**Format:** Audio-only narration
**Audience:** CKAD candidates and Kubernetes practitioners

---

## Opening: The Art of Kubernetes Troubleshooting (1 min)

Welcome to this deep dive on troubleshooting Kubernetes applications. Troubleshooting is one of the most critical skills for the CKAD exam and real-world Kubernetes operations. Unlike simple memorization of syntax or commands, troubleshooting requires systematic thinking, understanding of how components interact, and the ability to diagnose issues under pressure.

The CKAD exam includes troubleshooting questions where applications don't work correctly, and you need to identify and fix the problems. These questions test whether you truly understand Kubernetes or just know how to copy-paste examples. They also test your speed - can you diagnose and fix issues in a few minutes, or do you spend twenty minutes guessing?

Today we'll cover systematic troubleshooting methodology, common Pod failure patterns, networking and service discovery issues, configuration problems, resource constraints, and the diagnostic commands that reveal root causes quickly. We'll focus on the practical skills and mental models that make you fast and accurate at finding and fixing problems.

---

## Systematic Troubleshooting Methodology (2 min)

Effective troubleshooting follows a systematic process, not random trial and error. Let me walk you through a proven methodology.

Step one: observe the symptoms. What's actually wrong? Is a Pod not starting? Is an application returning errors? Is connectivity failing? Get clear on the observed problem before jumping to solutions. Use kubectl get to see high-level status. Look for Pods in Pending, CrashLoopBackOff, ImagePullBackOff, or Error states.

Step two: gather information. Use kubectl describe on the failing resources. This shows detailed status, events, and error messages. Events often contain the exact error causing the problem. Check recent events in the namespace with kubectl get events --sort-by=.metadata.creationTimestamp. Use kubectl logs to see application output and error messages.

Step three: form hypotheses. Based on the information gathered, what could cause these symptoms? Is it a configuration issue? A missing dependency? A resource constraint? Network connectivity? Generate possible causes based on error messages and behavior.

Step four: test hypotheses. Start with the most likely causes and check them systematically. If you think it's a ConfigMap issue, verify the ConfigMap exists and has correct keys. If you suspect network problems, test connectivity with curl or wget from inside Pods. Test one hypothesis at a time, not multiple changes simultaneously.

Step five: implement fixes. Once you've identified the root cause, make the minimal change needed to fix it. Verify the fix works before moving to the next issue. Don't make multiple unrelated changes simultaneously - if the problem persists, you won't know which change failed.

Step six: verify the solution. After fixing the issue, confirm the application works correctly. Check Pod status is Running. Test the application functionality. Verify other components still work - sometimes fixes break other things.

This systematic approach is much faster than guessing and changing random things hoping something works. Practice this methodology until it becomes automatic.

---

## Common Pod Status Issues (3 min)

Let's walk through the most common Pod statuses you'll encounter during troubleshooting and what each indicates.

Pending status means the Pod has been accepted by Kubernetes but can't be scheduled to a node. Common causes include insufficient cluster resources - no node has enough CPU or memory for the Pod's requests. Another cause is PersistentVolumeClaim binding failures - the Pod needs storage, but no PersistentVolume matches the claim. Node selectors or affinity rules might prevent scheduling if no nodes match. Use kubectl describe pod to see scheduling failure messages in events.

ImagePullBackOff or ErrImagePull means Kubernetes can't pull the container image. The image name might be misspelled. The image might not exist in the registry. You might lack credentials for a private registry - check if imagePullSecrets are configured. The registry might be unreachable. Use kubectl describe pod and look at events for specific pull errors. Check the image name in the Pod spec - typos are common.

CrashLoopBackOff means the container starts but immediately crashes. Kubernetes tries to restart it repeatedly with exponential backoff. The application might be misconfigured - missing environment variables, incorrect command arguments, or pointing to non-existent resources. The application might fail startup checks - perhaps it can't connect to a database. Use kubectl logs to see why the application is crashing. If the container exits before logging, use kubectl logs --previous to see logs from the previous crashed instance.

CreateContainerConfigError indicates a problem with container configuration before it even starts. Common causes include referencing non-existent ConfigMaps or Secrets, referencing incorrect keys within ConfigMaps or Secrets, or problems with mounted volumes. The describe output will specify exactly which configuration is missing.

Init:Error or Init:CrashLoopBackOff means an init container failed. Init containers run before application containers, and all must succeed for the Pod to proceed. Use kubectl logs pod-name -c init-container-name to see init container logs. Fix the init container issue before the main container will run.

RunContainerError typically indicates a problem with the container command or arguments. The command might not exist in the image. Arguments might be malformed. Check the command and args fields in the Pod spec.

---

## Troubleshooting Application Errors (2 min)

When Pods are Running but applications don't work correctly, you need different troubleshooting approaches.

Start with application logs using kubectl logs. Look for error messages, exceptions, or warnings that indicate what's failing. For Pods with multiple containers, specify the container: kubectl logs pod-name -c container-name. Use kubectl logs --tail=50 to see recent logs, or kubectl logs --follow to watch logs in real-time.

If logs don't show the problem, exec into the container to investigate: kubectl exec -it pod-name -- /bin/sh or bash. From inside the container, check environment variables with env - are expected variables present? Check mounted files with ls and cat - are ConfigMaps and Secrets mounted correctly? Test network connectivity with curl, wget, or ping - can you reach dependencies?

For connectivity issues, test DNS resolution. Use nslookup or dig to check if service names resolve: nslookup service-name. If DNS doesn't work, there's a fundamental cluster networking issue. If DNS works but connections fail, check if the Service has endpoints: kubectl get endpoints service-name. No endpoints means no Pods match the Service selector.

For permission issues, check file ownership and permissions. Non-root containers might not be able to access files. Check security contexts - is the container running as the expected user? Are volumes mounted with correct permissions?

For resource exhaustion, check if the container hit memory or CPU limits: kubectl describe pod shows resource usage and limit enforcement. An OOMKilled status means the container exceeded memory limits.

For application configuration issues, verify environment variables, ConfigMap contents, and Secret values match expectations. A common issue is typos in ConfigMap keys or misconfigured environment variable names that the application requires.

---

## Networking and Service Discovery (3 min)

Network issues are common and can be tricky to diagnose. Let me walk through systematic network troubleshooting.

First, verify the Service exists and is correctly configured. kubectl get service service-name shows the Service type and cluster IP. kubectl describe service service-name shows the selector and ports. Does the selector match your Pod labels? Are the port and targetPort configured correctly?

Second, check Service endpoints. kubectl get endpoints service-name shows which Pods the Service discovered. If there are no endpoints, no Pods match the Service selector. Check Pod labels with kubectl get pods --show-labels and compare with the Service selector. Even one mismatched label prevents the Pod from being discovered.

Third, test DNS resolution. From a Pod, use nslookup service-name. It should resolve to the Service's cluster IP. If DNS fails, try the fully qualified name: service-name.namespace.svc.cluster.local. If DNS completely fails, there's a cluster-level DNS issue - possibly the CoreDNS Pods are not running.

Fourth, test connectivity to the Service. From another Pod, use curl or wget: curl http://service-name:port. If DNS works but connectivity fails, the problem might be with Pod readiness. Services only route to Ready Pods. Check if Pods pass their readiness probes.

Fifth, test connectivity directly to Pod IPs, bypassing the Service. Get Pod IPs with kubectl get pods -o wide. Try curl http://pod-ip:container-port. If direct Pod connectivity works but Service connectivity doesn't, the problem is with the Service configuration or endpoints.

For NetworkPolicy issues, check if NetworkPolicies are preventing traffic. kubectl get networkpolicies shows defined policies. If a NetworkPolicy exists, traffic is denied by default unless explicitly allowed. Check if the policy allows ingress from your source Pod or egress to your destination.

For NodePort Services, verify the nodePort is in the valid range (30000-32767) and accessible. From outside the cluster, try curl http://node-ip:node-port. If it doesn't work, check firewall rules - the nodePort might be blocked.

For LoadBalancer Services, check if the external IP was provisioned: kubectl get service -o wide. If the external IP is pending indefinitely, your cluster might not support LoadBalancer Services, or there's an integration issue with the cloud provider.

---

## Configuration and Secret Issues (2 min)

Configuration problems frequently cause application failures. Let's explore common configuration issues and how to diagnose them.

For ConfigMap issues, first verify the ConfigMap exists: kubectl get configmap configmap-name. If it exists, check its contents: kubectl describe configmap configmap-name or kubectl get configmap configmap-name -o yaml. Verify the keys and values match what the application expects. A common issue is referencing the wrong key name in environment variable definitions.

For Secret issues, the same verification applies: kubectl get secret secret-name, then kubectl describe secret secret-name. Note that describe shows key names but not values, for security. To see actual values, use kubectl get secret secret-name -o yaml, then base64 decode the values to verify contents.

When ConfigMaps or Secrets are mounted as volumes, exec into the Pod and verify files exist and contain expected content: kubectl exec pod-name -- ls /mount/path and kubectl exec pod-name -- cat /mount/path/key-name. If files are missing, check the volume mount configuration in the Pod spec.

For environment variables from ConfigMaps or Secrets, exec into the Pod and run env to list all variables. Search for expected variable names. If they're missing, check the envFrom or env configuration in the Pod spec. Ensure configMapRef or secretKeyRef correctly references existing resources and keys.

A subtle issue is environment variable updates. If you change a ConfigMap or Secret, environment variables in existing Pods don't update. You must restart the Pods or trigger a rolling update. Volume-mounted ConfigMaps and Secrets do update automatically, but with a delay of up to a minute due to caching.

Another common issue is namespace mismatches. ConfigMaps and Secrets must be in the same namespace as Pods using them. If a Pod in namespace-a references a ConfigMap in namespace-b, it will fail with CreateContainerConfigError.

---

## Resource Constraints and Limits (2 min)

Resource constraints cause Pods to fail scheduling or to be killed after starting. Let's explore how to diagnose these issues.

If a Pod is Pending with a message about insufficient resources, use kubectl describe pod to see the exact error. Typically it says something like "zero of three nodes are available: three insufficient CPU, three insufficient memory". This means no node has enough free capacity for the Pod's resource requests.

Check Pod resource requests and limits: kubectl describe pod shows requested and limit values for CPU and memory. Are the requests reasonable? Sometimes developers set unnecessarily high requests, preventing scheduling.

Check node capacity and usage: kubectl top nodes shows CPU and memory usage per node. kubectl describe node node-name shows allocatable resources and current requests. If nodes are fully utilized, you need to either reduce Pod requests, scale down other workloads, or add more nodes.

For namespace-level resource constraints, check ResourceQuotas: kubectl get resourcequota shows quotas in the namespace. kubectl describe resourcequota shows used versus total quota. If you've exhausted namespace quota, Pods won't schedule even if nodes have capacity. Either increase the quota or reduce usage.

LimitRange resources enforce default and max/min limits per Pod. kubectl get limitrange and kubectl describe limitrange show these constraints. If a Pod's resources violate LimitRange rules, it won't be created.

If a Pod was OOMKilled, it exceeded memory limits and was terminated by the kernel. Check memory limits - are they too low for the application? Check memory requests - are they significantly lower than limits, causing multiple Pods to overcommit node memory?

CPU throttling doesn't kill Pods but slows them down. If an application is slow, check if it's hitting CPU limits. kubectl top pods shows current CPU usage compared to limits.

---

## Debugging with Ephemeral Containers (1 min)

Kubernetes supports ephemeral containers for debugging running Pods without modifying the Pod spec. This is useful when you need debugging tools that aren't in the application image.

kubectl debug pod-name -it --image=busybox adds an ephemeral container to a running Pod. You can install and use debugging tools inside this container while sharing the Pod's namespaces and volumes.

kubectl debug node/node-name creates a privileged Pod on a node with access to the node's filesystem and processes. This lets you debug node-level issues.

For the CKAD exam, ephemeral containers might not be available depending on cluster version, but kubectl exec will always work. Focus on using exec to get inside containers and standard Linux tools for debugging.

---

## Troubleshooting Checklist for CKAD (2 min)

Here's a systematic checklist for troubleshooting on the CKAD exam.

Step one: Check Pod status with kubectl get pods. Is the Pod Running, Pending, or CrashLoopBackOff?

Step two: If not Running, use kubectl describe pod. Read events carefully - they usually explain the problem.

Step three: If Running but not working, use kubectl logs. Check for errors or exceptions.

Step four: Check Services and networking. Does kubectl get endpoints show endpoints? Does DNS resolve with nslookup from inside a Pod?

Step five: Verify ConfigMaps and Secrets exist and have correct keys. Use kubectl describe or get with -o yaml.

Step six: Check resource requests and limits. Are they reasonable? Is namespace quota exceeded?

Step seven: Verify labels and selectors match. Services find Pods by labels. Does kubectl get pods --show-labels show labels matching the Service selector?

Step eight: Test connectivity with curl or wget from inside Pods. Can you reach Services by name?

Step nine: Check security contexts and permissions. Can the container access files? Is it running as the right user?

Step ten: Review the full configuration. Sometimes the issue is simple - a typo in an image name, a wrong port number, or a missing environment variable.

Practice this workflow until it's automatic. Speed comes from systematic investigation, not random guessing.

---

## Summary and Key Takeaways (1 min)

Let's summarize the essential troubleshooting concepts for CKAD success.

Use systematic methodology: observe symptoms, gather information with describe and logs, form hypotheses, test them, fix issues, and verify solutions. Don't guess randomly - be methodical.

Learn common Pod statuses: Pending means scheduling issues, ImagePullBackOff means image problems, CrashLoopBackOff means the application crashes, CreateContainerConfigError means configuration issues.

For networking, verify Services exist, check endpoints match labels, test DNS resolution, and test connectivity. For configuration, verify ConfigMaps and Secrets exist and have correct contents.

Master diagnostic commands: kubectl describe for events and details, kubectl logs for application output, kubectl exec for interactive debugging, kubectl get endpoints for Service discovery verification.

For exam success: practice troubleshooting broken applications until diagnosis is fast and automatic. The exam rewards systematic, efficient problem-solving.

Troubleshooting is a skill built through practice. The more broken applications you fix, the faster you recognize patterns and find solutions.

Thank you for listening. Good luck with your CKAD preparation!
