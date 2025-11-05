# PersistentVolumes Practical Exercises
## Narration Script for Hands-On Demo

**Duration**: 18-22 minutes
**Format**: Live demonstration with hands-on exercises
**Audience**: Kubernetes learners with basic kubectl knowledge
**Objective**: Demonstrate volume types, data persistence, and PVC usage through practical examples

---

## Introduction [0:00-1:00]

Hello and welcome to this hands-on demonstration of PersistentVolumes in Kubernetes. In this session, we'll work through practical examples that illustrate different storage options and demonstrate how data persistence works in real applications.

We'll use a Pi calculation web application fronted by an Nginx caching proxy. This is a perfect example because the cache needs to persist to improve performance, and we'll see how different storage choices affect the application's behavior.

You should have a Kubernetes cluster ready—Docker Desktop, k3d, or any local cluster will work fine. Let's get started.

---

## Exercise 1: Container Writeable Layer [1:00-4:00]

**[1:00-1:30] Setup and Deployment**

Let's begin with the simplest storage option: the container's writeable layer. We'll deploy our Pi application with Nginx proxy that caches responses in the /tmp directory.

```bash
kubectl apply -f labs/persistentvolumes/specs/pi
```

This command deploys:
- A Pi calculation web service
- An Nginx reverse proxy with caching enabled
- A NodePort service to access the application

Let's wait for the Pods to be ready:

```bash
kubectl get pods -l app=pi-proxy
```

**[1:30-2:30] Testing Initial Performance**

Now let's test the application. Open your browser and navigate to:
- http://localhost:30010/pi?dp=30000 (or http://localhost:8010/pi?dp=30000)

Notice how long this takes—over a second to calculate 30,000 digits of Pi. The proxy caches this response in its /tmp directory.

Now refresh the page. It's instant! The response is served from the cache. Let's verify the cache exists:

```bash
kubectl exec deploy/pi-proxy -- ls /tmp
```

You'll see cache files created by Nginx. This is working as expected—the cache improves performance dramatically.

**[2:30-4:00] Demonstrating Data Loss**

Now let's see what happens when the container restarts. We'll stop the Nginx process, which forces Kubernetes to restart the container:

```bash
kubectl exec deploy/pi-proxy -- kill 1
```

The container exits, and Kubernetes immediately starts a replacement. Let's check the Pods:

```bash
kubectl get po -l app=pi-proxy
```

Notice the restart count has increased. Now let's check the /tmp directory:

```bash
kubectl exec deploy/pi-proxy -- ls /tmp
```

It's empty! The cache is gone. If you refresh your browser now, you'll see it takes over a second again—the calculation has to run from scratch.

**Key lesson**: Data in the container writeable layer is lost when the container is replaced. This is the default behavior and unsuitable for any data you need to preserve.

---

## Exercise 2: EmptyDir Volumes [4:00-8:00]

**[4:00-5:00] Understanding EmptyDir**

Let's improve this by using an EmptyDir volume. This volume exists at the Pod level, so it survives container restarts within the same Pod.

Let's look at the updated specification:

```bash
kubectl get deployment pi-proxy -o yaml | grep -A 10 volumes
```

Actually, let's apply the new configuration that includes an EmptyDir volume:

```bash
kubectl apply -f labs/persistentvolumes/specs/caching-proxy-emptydir
```

This updates the Deployment to add a volume section that creates an EmptyDir and mounts it to /tmp. Since this is a Pod spec change, Kubernetes creates a new Pod.

Let's wait for it to be ready:

```bash
kubectl wait --for=condition=Ready pod -l app=pi-proxy,storage=emptydir
```

**[5:00-6:00] Testing with EmptyDir**

Now refresh your browser to calculate Pi again. The cache fills up:

```bash
kubectl exec deploy/pi-proxy -- ls /tmp
```

You'll see the cache files. The difference now is that this cache lives in an EmptyDir volume, not just the container filesystem.

**[6:00-7:00] EmptyDir Survives Container Restarts**

Let's kill the Nginx process again:

```bash
kubectl exec deploy/pi-proxy -- kill 1
```

The container restarts. Check the Pod status:

```bash
kubectl get pods -l app=pi-proxy,storage=emptydir
```

Now, critically, let's check the /tmp directory:

```bash
kubectl exec deploy/pi-proxy -- ls /tmp
```

The cache files are still there! This is because the EmptyDir volume exists at the Pod level. When the container restarted, the Pod remained the same, so the volume and its data persisted.

Refresh your browser—the response is still instant because the cache survived the container restart.

**[7:00-8:00] EmptyDir Limitations**

EmptyDir is better than the container writeable layer, but it still has limitations. If you delete the Pod itself:

```bash
kubectl delete pod -l app=pi-proxy,storage=emptydir
```

The Deployment creates a replacement Pod with a brand new EmptyDir volume—which starts empty. The cache is lost again.

**Key lesson**: EmptyDir volumes survive container restarts but not Pod deletions. They're perfect for temporary caching within a Pod's lifetime but not for truly persistent data.

---

## Exercise 3: PersistentVolumeClaims [8:00-15:00]

**[8:00-9:00] Introduction to Persistent Storage**

Now let's tackle real persistence. We need storage that survives both container and Pod replacements. This is where PersistentVolumes and PersistentVolumeClaims come in.

First, let's see what StorageClasses are available in our cluster:

```bash
kubectl get storageclass
```

You'll see at least one StorageClass, possibly marked as default. In Docker Desktop, you might see "hostpath." In cloud environments, you'd see provider-specific classes like "gp2" on AWS or "managed-premium" on Azure.

**[9:00-10:30] Creating a PersistentVolumeClaim**

Let's create a PVC that requests 100 megabytes of storage. We'll look at the specification first:

```bash
cat labs/persistentvolumes/specs/caching-proxy-pvc/pvc.yaml
```

Notice the structure:
- accessModes: ReadWriteOnce—the volume can be mounted read-write by a single node
- resources.requests.storage: 100Mi—we're requesting 100 megabytes
- No storageClassName specified, so it uses the default

Let's create this PVC:

```bash
kubectl apply -f labs/persistentvolumes/specs/caching-proxy-pvc/pvc.yaml
```

Now let's check what happened:

```bash
kubectl get pvc
```

You'll see the PVC status. Depending on your storage provisioner, it might be "Bound" immediately, or it might wait until a Pod claims it. Let's also check for PersistentVolumes:

```bash
kubectl get persistentvolumes
# or the short form:
kubectl get pv
```

Some provisioners create the PV immediately when the PVC is created. Others wait until the PVC is actually used by a Pod. This varies by storage system.

**[10:30-12:00] Using the PVC in a Pod**

Now let's deploy our Nginx proxy configured to use this PVC:

```bash
kubectl apply -f labs/persistentvolumes/specs/caching-proxy-pvc/
```

This applies both the PVC (if not already created) and the updated Deployment that references it. Let's wait for the Pod:

```bash
kubectl wait --for=condition=Ready pod -l app=pi-proxy,storage=pvc
```

Now let's check the PVC and PV status again:

```bash
kubectl get pvc,pv
```

You should now see:
- The PVC in "Bound" status
- A PV that was created automatically, also "Bound" to our PVC
- The PV shows the requested size (100Mi) and access mode (RWO)

**[12:00-13:00] Testing Data Persistence - Container Restart**

The PVC starts empty, so let's populate it by accessing our application. Refresh your browser to calculate Pi. The response gets cached. Check the cache:

```bash
kubectl exec deploy/pi-proxy -- ls /tmp
```

Cache files exist. Now, let's test persistence. First, let's restart the container:

```bash
kubectl exec deploy/pi-proxy -- kill 1
```

Wait for the restart:

```bash
kubectl get pods -l app=pi-proxy,storage=pvc
```

Check the cache:

```bash
kubectl exec deploy/pi-proxy -- ls /tmp
```

The cache files are still there! Refresh the browser—still instant. Good, but we already achieved this with EmptyDir. The real test is Pod deletion.

**[13:00-14:30] Testing Data Persistence - Pod Replacement**

Let's force a complete Pod replacement by triggering a rollout restart:

```bash
kubectl rollout restart deploy/pi-proxy
```

This creates a completely new Pod with a new container. Let's watch the rollout:

```bash
kubectl get pods -l app=pi-proxy,storage=pvc
```

You'll see the old Pod terminating and a new Pod starting. Once the new Pod is ready, let's check the cache:

```bash
kubectl exec deploy/pi-proxy -- ls /tmp
```

The cache files are STILL there! This is the power of PersistentVolumes. The data persisted through the complete Pod replacement.

Refresh your browser—the response is still instant. The new Pod picked up exactly where the old one left off.

**[14:30-15:00] Understanding What Happened**

Let's understand what made this possible:

1. We created a PVC requesting persistent storage
2. Kubernetes (via the storage provisioner) created a PV backed by actual storage
3. The PVC was bound to the PV
4. Our Pod mounted the PVC
5. When the Pod was deleted, the PVC and PV remained
6. The new Pod mounted the same PVC, accessing the same data

The key is that the PV has a lifecycle independent of any Pod. It persists until explicitly deleted.

---

## Exercise 4: Lab Challenge - HostPath Volumes [15:00-18:00]

**[15:00-16:00] Introduction to the Challenge**

Now it's your turn. There's another volume type we haven't discussed yet: HostPath. This volume type mounts a directory from the host node directly into the Pod.

Your challenge is to:
1. Create a simple sleep Pod that uses a HostPath volume
2. Mount the host node's filesystem to explore it
3. Find the cache files from our Nginx Pod on the node's disk

HostPath volumes are simpler than PVCs—no claim needed—but they come with security concerns because Pods can access the host filesystem.

**[16:00-17:00] Hints and Approach**

Think about this:
- HostPath volumes mount a specific path from the node
- The Nginx cache is in /tmp in the container, but where is it on the node?
- PersistentVolumes using local storage are stored somewhere on the node's filesystem
- A sleep Pod can stay running indefinitely, giving you time to explore

You'll need to create a Pod specification with:
- A container that doesn't exit immediately (like busybox with a sleep command)
- A HostPath volume pointing to the root directory (/) of the host
- A volume mount to access that directory from the container

**[17:00-18:00] Solution and Discussion**

Let's look at the solution:

```bash
cat labs/persistentvolumes/solution/sleep-with-hostpath.yaml
```

The key points are:
- The volume type is "hostPath" with path set to "/"
- This gives the Pod access to the entire host filesystem
- Security context may be needed for full access

Let's apply it:

```bash
kubectl apply -f labs/persistentvolumes/solution/sleep-with-hostpath.yaml
```

Now we can explore the host filesystem:

```bash
kubectl exec -it sleep-with-hostpath -- sh
```

From inside the Pod, you can navigate the host filesystem. The actual location of PersistentVolume data depends on your cluster setup. On Docker Desktop, it might be in /var/lib/k8s-pvs/ or similar.

**Important security note**: HostPath volumes are powerful but dangerous. They give Pods access to the host system, which can be a security risk. In production, use them sparingly and with proper security policies. For the CKAD exam, know they exist and understand the security implications.

---

## EXTRA: Manual PV Management [18:00-22:00]

**[18:00-19:00] Introduction to Static Provisioning**

This is an advanced topic that demonstrates manual PV management. Most of the time, you'll use dynamic provisioning where PVs are created automatically. But sometimes you need more control.

Let's first clean up our existing PVC:

```bash
kubectl delete -f labs/persistentvolumes/specs/caching-proxy-pvc/
```

Wait a moment and check the PV:

```bash
kubectl get pv
```

Depending on your storage provisioner's reclaim policy, the PV might still exist in "Released" state, or it might have been deleted automatically. This behavior varies by StorageClass.

**[19:00-20:00] Creating a Static PV**

Let's create a PersistentVolume manually:

```bash
cat labs/persistentvolumes/specs/caching-proxy-pv/persistentVolume.yaml
```

This PV specification includes:
- Type: local storage (a directory on a node's disk)
- Size: 100Mi
- Access mode: ReadWriteOnce
- Node selector: requires a node with label "labs-pvc=1"

Let's apply all the resources:

```bash
kubectl apply -f labs/persistentvolumes/specs/caching-proxy-pv
```

This creates the PV, a new PVC that claims it by name, and the Deployment. Now check the status:

```bash
kubectl get pvc,pv -l app=pi-proxy
```

The PV and PVC exist and might be bound, depending on timing. But check the Pod:

```bash
kubectl get pod -l app=pi-proxy,storage=local
```

**[20:00-21:00] Troubleshooting Node Selectors**

The Pod is probably stuck in "Pending" state. Let's investigate:

```bash
kubectl describe pod -l app=pi-proxy,storage=local
```

Look at the events. You'll see messages about volume node affinity conflicts or the Pod being unable to schedule. The problem is that our PV requires a node with the label "labs-pvc=1," but no node has that label.

This demonstrates an important concept: PVs can have requirements that constrain where Pods can run. Let's fix this by labeling a node:

```bash
kubectl label node $(kubectl get nodes -o jsonpath='{.items[0].metadata.name}') labs-pvc=1
```

Now let's verify the label was added:

```bash
kubectl get nodes --show-labels
```

And check the Pod again:

```bash
kubectl get pod -l app=pi-proxy,storage=local
```

**[21:00-22:00] Understanding Static PV Use Cases**

The Pod should now be scheduled. However, you might encounter another issue—local volumes require the directory to exist on the node first. This is intentional complexity to demonstrate the additional considerations with static PVs.

When would you use static PVs?
- When you need precise control over where data lives
- For existing storage that you want to import into Kubernetes
- When using storage systems without dynamic provisioners
- For special performance or locality requirements

For CKAD, focus on PVCs with dynamic provisioning, which is the modern, recommended approach. Static PVs are important to understand but less commonly used.

---

## Wrap-Up and Key Takeaways [22:00-23:00]

**Summary of What We Learned**

Today we explored three levels of data persistence:

1. **Container Writeable Layer**: Data lost on container restart. Quick and simple but unreliable.

2. **EmptyDir Volumes**: Data survives container restarts within a Pod. Perfect for temporary caching and shared storage between containers.

3. **PersistentVolumes via PVCs**: Data survives everything—container restarts, Pod deletions, even node failures (with the right storage backend). Essential for stateful applications.

We also saw:
- How to create and use PVCs
- How to verify volume mounting and data persistence
- The relationship between StorageClasses, PVs, and PVCs
- HostPath volumes and their security implications
- Static PV provisioning for advanced use cases

**For CKAD Exam Preparation**

Practice these skills:
- Quickly creating PVCs with appropriate access modes and sizes
- Mounting PVCs in Pod specifications
- Troubleshooting PVC binding issues
- Understanding when to use each volume type
- Checking volume status and debugging mount problems

**Cleanup**

Before we finish, let's clean up our resources:

```bash
kubectl delete all,cm,pvc,pv -l kubernetes.courselabs.co=persistentvolumes
```

This removes all the Pods, Services, Deployments, ConfigMaps, PVCs, and PVs we created during this lab.

Thank you for following along. In your next session, work through the CKAD practice scenarios to reinforce these concepts under exam-like conditions.

---

**End of Practical Demo: 18-23 minutes total**

*Timing notes:*
- *Allow extra time for kubectl commands to complete—Pod creation, volume binding*
- *If running ahead, expand troubleshooting discussions*
- *If running behind, skip the EXTRA section (manual PV management)*
- *Pause for questions after each major exercise*
- *Demonstrate in a real cluster; showing actual command output is crucial*
