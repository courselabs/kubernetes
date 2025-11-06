---
layout: cover
---

# Examining Nodes

<div class="abs-br m-6 flex gap-2">
  <carbon-kubernetes class="text-6xl text-blue-400" />
</div>

<div v-click class="mt-8 text-xl opacity-80">
Understanding the machines that run your containers
</div>

---
layout: center
---

# What Are Nodes?

<div v-click="1">

```mermaid
graph TB
    C[Kubernetes Cluster]
    C --> N1[Node 1]
    C --> N2[Node 2]
    C --> N3[Node 3]
    N1 --> P1[Pods]
    N2 --> P2[Pods]
    N3 --> P3[Pods]
    style C fill:#60a5fa
    style N1 fill:#4ade80
    style N2 fill:#4ade80
    style N3 fill:#4ade80
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Worker machines that run containers
</div>

<div class="grid grid-cols-3 gap-4 mt-6 text-sm">
<div v-click="3" class="text-center">
<carbon-container-software class="text-4xl text-green-400 mb-2" />
<strong>Physical servers</strong>
</div>
<div v-click="4" class="text-center">
<carbon-virtual-machine class="text-4xl text-blue-400 mb-2" />
<strong>Virtual machines</strong>
</div>
<div v-click="5" class="text-center">
<carbon-cloud class="text-4xl text-purple-400 mb-2" />
<strong>Cloud instances</strong>
</div>
</div>

---
layout: center
---

# Node Components

<div v-click="1">

```mermaid
graph TB
    N[Node]
    N --> K[kubelet<br/>Container manager]
    N --> C[Container Runtime<br/>Docker, containerd, CRI-O]
    N --> P[kube-proxy<br/>Network proxy]
    style N fill:#60a5fa
    style K fill:#4ade80
    style C fill:#fbbf24
    style P fill:#a78bfa
```

</div>

<div class="grid grid-cols-3 gap-6 mt-8 text-sm">
<div v-click="2" class="text-center">
<carbon-settings class="text-4xl text-green-400 mb-2" />
<strong>kubelet</strong><br/>
Manages containers
</div>
<div v-click="3" class="text-center">
<carbon-container-software class="text-4xl text-yellow-400 mb-2" />
<strong>Runtime</strong><br/>
Runs containers
</div>
<div v-click="4" class="text-center">
<carbon-network-3 class="text-4xl text-purple-400 mb-2" />
<strong>kube-proxy</strong><br/>
Network routing
</div>
</div>

<div v-click="5" class="mt-8 text-center text-sm opacity-80">
Kubernetes stores node information queryable via kubectl
</div>

---
layout: center
---

# Basic Node Commands

<div v-click="1" class="mb-6">

```bash
kubectl get nodes
kubectl get nodes -o wide
kubectl describe nodes
kubectl describe node <name>
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="2">
<carbon-list class="text-4xl text-blue-400 mb-2" />
<strong>get nodes</strong><br/>
<span class="text-sm opacity-80">List all nodes with status</span>
</div>
<div v-click="3">
<carbon-view class="text-4xl text-green-400 mb-2" />
<strong>get nodes -o wide</strong><br/>
<span class="text-sm opacity-80">Extended information</span>
</div>
<div v-click="4">
<carbon-document class="text-4xl text-purple-400 mb-2" />
<strong>describe nodes</strong><br/>
<span class="text-sm opacity-80">Detailed info for all</span>
</div>
<div v-click="5">
<carbon-view class="text-4xl text-yellow-400 mb-2" />
<strong>describe node</strong><br/>
<span class="text-sm opacity-80">Details for specific node</span>
</div>
</div>

---
layout: center
---

# Node Status & Conditions

<div v-click="1">

```mermaid
stateDiagram-v2
    [*] --> Ready: Node healthy
    Ready --> NotReady: Issues detected
    NotReady --> Ready: Issues resolved
    Ready --> Unknown: Connection lost
```

</div>

<div class="grid grid-cols-2 gap-4 mt-8 text-sm">
<div v-click="2">
<carbon-checkmark class="inline-block text-3xl text-green-400" /> <strong>Ready:</strong> Healthy, can accept Pods
</div>
<div v-click="3">
<carbon-dashboard class="inline-block text-3xl text-yellow-400" /> <strong>MemoryPressure:</strong> Low on memory
</div>
<div v-click="4">
<carbon-data-volume class="inline-block text-3xl text-yellow-400" /> <strong>DiskPressure:</strong> Low on disk space
</div>
<div v-click="5">
<carbon-activity class="inline-block text-3xl text-yellow-400" /> <strong>PIDPressure:</strong> Too many processes
</div>
<div v-click="6">
<carbon-network-3 class="inline-block text-3xl text-red-400" /> <strong>NetworkUnavailable:</strong> Network not configured
</div>
</div>

<div v-click="7" class="mt-8 text-center text-sm">
<carbon-terminal class="inline-block text-2xl text-blue-400" /> kubectl describe node &lt;name&gt; | grep Conditions -A 5
</div>

---
layout: center
---

# Node Capacity vs Allocatable

<div v-click="1">

```mermaid
graph TB
    T[Total Node Resources] --> C[Capacity<br/>Total hardware]
    C --> R[Reserved<br/>System components]
    C --> A[Allocatable<br/>Available for Pods]
    style T fill:#60a5fa
    style C fill:#fbbf24
    style R fill:#ef4444
    style A fill:#4ade80
```

</div>

<div v-click="2" class="mt-6 mb-4">

```yaml
Capacity:
  cpu: 4
  memory: 16Gi
Allocatable:
  cpu: 3800m
  memory: 15Gi
```

</div>

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="3" class="text-center">
<carbon-dashboard class="text-4xl text-yellow-400 mb-2" />
<strong>Capacity</strong><br/>
<span class="text-sm opacity-80">Total node resources</span>
</div>
<div v-click="4" class="text-center">
<carbon-checkmark class="text-4xl text-green-400 mb-2" />
<strong>Allocatable</strong><br/>
<span class="text-sm opacity-80">Available for Pods</span>
</div>
</div>

<div v-click="5" class="mt-6 text-center text-sm text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> Pods can only use allocatable resources!
</div>

---
layout: center
---

# Node Labels

<div v-click="1">

```mermaid
graph TB
    N[Node] --> L1["kubernetes.io/hostname<br/>Node name"]
    N --> L2["kubernetes.io/os<br/>Operating system"]
    N --> L3["kubernetes.io/arch<br/>CPU architecture"]
    N --> L4["topology.kubernetes.io/zone<br/>Availability zone"]
    style N fill:#60a5fa
    style L1 fill:#4ade80
    style L2 fill:#4ade80
    style L3 fill:#4ade80
    style L4 fill:#4ade80
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Key-value pairs providing node metadata
</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-xs">
<div v-click="3">
<carbon-terminal class="inline-block text-2xl text-blue-400" /> kubectl get nodes --show-labels
</div>
<div v-click="4">
<carbon-terminal class="inline-block text-2xl text-green-400" /> kubectl get nodes -L os,arch
</div>
</div>

<div v-click="5" class="mt-8 text-center text-sm opacity-80">
Labels used for Pod scheduling with nodeSelector or affinity
</div>

---
layout: center
---

# Output Formatting

<div v-click="1" class="mb-6 text-sm">

```bash
kubectl get nodes           # Table (default)
kubectl get nodes -o wide   # Extended table
kubectl get nodes -o yaml   # YAML format
kubectl get nodes -o json   # JSON format
kubectl get nodes -o name   # Just names
```

</div>

<div v-click="2" class="mb-6">

```mermaid
graph LR
    K[kubectl get] --> T[Table]
    K --> W[Wide]
    K --> Y[YAML]
    K --> J[JSON]
    K --> JP[JSONPath]
    style K fill:#60a5fa
    style T fill:#4ade80
    style W fill:#4ade80
    style Y fill:#fbbf24
    style J fill:#fbbf24
    style JP fill:#a78bfa
```

</div>

<div v-click="3" class="text-sm">

```bash
# JSONPath for specific fields
kubectl get node <name> -o jsonpath='{.status.capacity.cpu}'
kubectl get node <name> -o jsonpath='{.status.nodeInfo.containerRuntimeVersion}'
```

</div>

<div v-click="4" class="mt-6 text-center text-sm opacity-80">
Useful for scripting and automation
</div>

---
layout: center
---

# kubectl explain

<div v-click="1" class="mb-6">

```bash
kubectl explain node
kubectl explain node.status
kubectl explain node.status.capacity
```

</div>

<div v-click="2">

```mermaid
graph TB
    E[kubectl explain] --> D[Documentation]
    D --> F[Field descriptions]
    D --> T[Types]
    D --> S[Structure]
    style E fill:#60a5fa
    style D fill:#fbbf24
    style F fill:#4ade80
    style T fill:#4ade80
    style S fill:#4ade80
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="3">
<carbon-document class="text-4xl text-blue-400 mb-2" />
<strong>Works offline</strong><br/>
<span class="text-sm opacity-80">No internet needed</span>
</div>
<div v-click="4">
<carbon-education class="text-4xl text-green-400 mb-2" />
<strong>CKAD essential</strong><br/>
<span class="text-sm opacity-80">Understand resource structure</span>
</div>
</div>

---
layout: center
---

# Common Node Operations

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-tag class="text-4xl text-blue-400 mb-2" />
<strong>Label a node</strong><br/>
<span class="text-xs opacity-80">kubectl label node &lt;name&gt; key=value</span>
</div>
<div v-click="2">
<carbon-rule class="text-4xl text-yellow-400 mb-2" />
<strong>Taint a node</strong><br/>
<span class="text-xs opacity-80">kubectl taint node &lt;name&gt; key=value:NoSchedule</span>
</div>
<div v-click="3">
<carbon-close class="text-4xl text-red-400 mb-2" />
<strong>Cordon</strong><br/>
<span class="text-xs opacity-80">kubectl cordon &lt;name&gt; - Mark unschedulable</span>
</div>
<div v-click="4">
<carbon-arrow-down class="text-4xl text-orange-400 mb-2" />
<strong>Drain</strong><br/>
<span class="text-xs opacity-80">kubectl drain &lt;name&gt; - Evict Pods</span>
</div>
<div v-click="5">
<carbon-checkmark class="text-4xl text-green-400 mb-2" />
<strong>Uncordon</strong><br/>
<span class="text-xs opacity-80">kubectl uncordon &lt;name&gt; - Re-enable</span>
</div>
</div>

<div v-click="6" class="mt-8 text-center text-lg">
Essential for node maintenance operations
</div>

---
layout: center
---

# Node Maintenance Flow

<div v-click="1">

```mermaid
sequenceDiagram
    participant A as Admin
    participant N as Node
    participant P as Pods
    A->>N: kubectl cordon
    N->>N: Mark unschedulable
    A->>N: kubectl drain
    N->>P: Evict Pods
    P->>P: Reschedule elsewhere
    A->>N: Perform maintenance
    A->>N: kubectl uncordon
    N->>N: Mark schedulable
```

</div>

<div v-click="2" class="mt-6 text-center text-sm">
<carbon-idea class="inline-block text-2xl text-blue-400" /> Safe pattern for node updates and repairs
</div>

---
layout: center
---

# Summary

<div v-click="1">

```mermaid
mindmap
  root((Nodes))
    Worker Machines
      Physical servers
      VMs
      Cloud instances
    Components
      kubelet
      Runtime
      kube-proxy
    Status
      Ready
      Conditions
      Capacity
    Labels
      Standard labels
      Custom labels
      Scheduling
    Operations
      Cordon
      Drain
      Uncordon
```

</div>

---
layout: center
---

# Key Takeaways

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-kubernetes class="text-4xl text-blue-400 mb-2" />
<strong>Worker machines</strong><br/>
<span class="text-sm opacity-80">Run containers in cluster</span>
</div>
<div v-click="2">
<carbon-dashboard class="text-4xl text-green-400 mb-2" />
<strong>Capacity vs allocatable</strong><br/>
<span class="text-sm opacity-80">Understand resource limits</span>
</div>
<div v-click="3">
<carbon-tag class="text-4xl text-purple-400 mb-2" />
<strong>Labels</strong><br/>
<span class="text-sm opacity-80">Metadata for scheduling</span>
</div>
<div v-click="4">
<carbon-terminal class="text-4xl text-yellow-400 mb-2" />
<strong>kubectl commands</strong><br/>
<span class="text-sm opacity-80">get, describe, explain</span>
</div>
</div>

<div v-click="5" class="mt-8 text-center text-lg">
<carbon-education class="inline-block text-3xl text-blue-400" /> CKAD focus: Query nodes, understand capacity, troubleshoot!
</div>
