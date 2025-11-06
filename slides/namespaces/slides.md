---
layout: cover
---

# Kubernetes Namespaces

<div class="abs-br m-6 flex gap-2">
  <carbon-partition-auto class="text-6xl text-blue-400" />
</div>

<div v-click class="mt-8 text-xl opacity-80">
Isolating workloads in virtual clusters
</div>

---
layout: center
---

# The Multi-Tenancy Problem

<div v-click="1">

```mermaid
graph TB
    C[Cluster] --> A1[50 Applications]
    C --> T[Multiple Teams]
    C --> E[Multiple Environments]
    C --> R[Hundreds of Resources]
    style C fill:#ef4444,color:#fff
    style A1 fill:#fbbf24
    style T fill:#fbbf24
    style E fill:#fbbf24
    style R fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-4 mt-8 text-sm">
<div v-click="2">
<carbon-close class="inline-block text-3xl text-red-400" /> Name collisions
</div>
<div v-click="3">
<carbon-warning class="inline-block text-3xl text-red-400" /> Accidental deletions
</div>
<div v-click="4">
<carbon-dashboard class="inline-block text-3xl text-red-400" /> Resource contention
</div>
<div v-click="5">
<carbon-unlocked class="inline-block text-3xl text-red-400" /> No access control
</div>
</div>

<div v-click="6" class="mt-6 text-center text-lg">
<carbon-partition-auto class="inline-block text-3xl text-green-400" /> Namespaces solve these problems
</div>

---
layout: center
---

# What Are Namespaces?

<div v-click="1">

```mermaid
graph TB
    subgraph Cluster
        subgraph NS1[dev namespace]
            P1[Pod: web]
            S1[Service: web]
        end
        subgraph NS2[prod namespace]
            P2[Pod: web]
            S2[Service: web]
        end
    end
    style Cluster fill:#60a5fa,color:#fff
    style NS1 fill:#4ade80
    style NS2 fill:#fbbf24
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Virtual cluster boundaries within physical cluster
</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div v-click="3">
<carbon-container-software class="inline-block text-2xl text-blue-400" /> Contains resources
</div>
<div v-click="4">
<carbon-partition-auto class="inline-block text-2xl text-green-400" /> Logical isolation
</div>
<div v-click="5">
<carbon-tag class="inline-block text-2xl text-purple-400" /> Unique names per namespace
</div>
<div v-click="6">
<carbon-rule class="inline-block text-2xl text-yellow-400" /> Flat structure (no nesting)
</div>
</div>

---
layout: center
---

# Default Namespaces

<div v-click="1">

```mermaid
graph TB
    K[Kubernetes Cluster]
    K --> D[default<br/>User resources]
    K --> S[kube-system<br/>System components]
    K --> P[kube-public<br/>Public resources]
    K --> N[kube-node-lease<br/>Node heartbeats]
    style K fill:#60a5fa
    style D fill:#4ade80
    style S fill:#fbbf24
    style P fill:#a78bfa
    style N fill:#ef4444
```

</div>

<div class="grid grid-cols-2 gap-4 mt-8 text-sm">
<div v-click="2">
<carbon-document class="inline-block text-2xl text-green-400" /> <strong>default:</strong> Where resources go without -n flag
</div>
<div v-click="3">
<carbon-kubernetes class="inline-block text-2xl text-yellow-400" /> <strong>kube-system:</strong> DNS, dashboard, controllers
</div>
<div v-click="4">
<carbon-view class="inline-block text-2xl text-purple-400" /> <strong>kube-public:</strong> Publicly readable data
</div>
<div v-click="5">
<carbon-activity class="inline-block text-2xl text-red-400" /> <strong>kube-node-lease:</strong> Node health tracking
</div>
</div>

---
layout: center
---

# Namespace Scoping

<div v-click="1" class="mb-6">

```mermaid
graph LR
    R[Resources]
    R --> NS[Namespace-Scoped]
    R --> CS[Cluster-Scoped]
    NS --> P[Pods<br/>Services<br/>ConfigMaps<br/>Secrets]
    CS --> N[Nodes<br/>Namespaces<br/>PersistentVolumes<br/>StorageClasses]
    style R fill:#60a5fa
    style NS fill:#4ade80
    style CS fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-6">
<div v-click="2">
<carbon-tag class="text-4xl text-green-400 mb-2" />
<strong>Namespace-scoped</strong><br/>
<span class="text-sm opacity-80">Need -n flag to query</span>
</div>
<div v-click="3">
<carbon-network-3 class="text-4xl text-yellow-400 mb-2" />
<strong>Cluster-scoped</strong><br/>
<span class="text-sm opacity-80">Global, visible to all</span>
</div>
</div>

<div v-click="4" class="mt-6 text-center text-sm">
<carbon-terminal class="inline-block text-2xl text-blue-400" /> kubectl api-resources --namespaced=true
</div>

---
layout: center
---

# Resource Quotas

<div v-click="1">

```mermaid
graph TB
    NS[Namespace] --> RQ[ResourceQuota]
    RQ --> C[CPU Limits<br/>4 cores max]
    RQ --> M[Memory Limits<br/>8GB max]
    RQ --> O[Object Counts<br/>10 Pods max]
    RQ --> S[Storage<br/>100GB max]
    style NS fill:#60a5fa
    style RQ fill:#fbbf24
    style C fill:#4ade80
    style M fill:#4ade80
    style O fill:#4ade80
    style S fill:#4ade80
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Limit total resources consumed in a namespace
</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div v-click="3">
<carbon-dashboard class="inline-block text-2xl text-blue-400" /> Compute: CPU & memory totals
</div>
<div v-click="4">
<carbon-rule class="inline-block text-2xl text-green-400" /> Objects: Pod, Service counts
</div>
</div>

<div v-click="5" class="mt-6 text-center text-red-400">
<carbon-warning class="inline-block text-2xl" /> With quotas, Pods MUST specify resources!
</div>

---
layout: center
---

# LimitRange

<div v-click="1">

```mermaid
graph LR
    LR[LimitRange] --> D[Default Values]
    LR --> MM[Min/Max Constraints]
    LR --> R[Request/Limit Ratios]
    D --> A[Apply to Pods]
    MM --> A
    R --> A
    style LR fill:#60a5fa
    style D fill:#4ade80
    style MM fill:#fbbf24
    style R fill:#a78bfa
    style A fill:#ef4444
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Per-Pod/container defaults and constraints
</div>

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
<div v-click="3">
<carbon-settings class="text-3xl text-green-400 mb-2" />
<strong>Default Values</strong><br/>
Auto-apply when not specified
</div>
<div v-click="4">
<carbon-rule class="text-3xl text-yellow-400 mb-2" />
<strong>Constraints</strong><br/>
Min/max per container
</div>
</div>

<div v-click="5" class="mt-6 text-center text-sm opacity-80">
ResourceQuota = namespace total | LimitRange = per-container
</div>

---
layout: center
---

# Cross-Namespace Communication

<div v-click="1">

```mermaid
graph TB
    subgraph frontend[frontend namespace]
        F[Frontend Pod]
    end
    subgraph backend[backend namespace]
        B[Backend Service]
    end
    F -->|web-service.backend| B
    F -->|web-service.backend.svc.cluster.local| B
    style frontend fill:#4ade80
    style backend fill:#60a5fa
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Services accessible via DNS across namespaces
</div>

<div class="grid grid-cols-3 gap-4 mt-6 text-xs">
<div v-click="3" class="text-center">
<carbon-text-font class="text-3xl text-green-400 mb-2" />
<strong>Short name</strong><br/>
web-service<br/>
<span class="opacity-60">Same namespace only</span>
</div>
<div v-click="4" class="text-center">
<carbon-network-1 class="text-3xl text-blue-400 mb-2" />
<strong>Qualified</strong><br/>
web-service.production<br/>
<span class="opacity-60">Any namespace</span>
</div>
<div v-click="5" class="text-center">
<carbon-network-3 class="text-3xl text-purple-400 mb-2" />
<strong>FQDN</strong><br/>
web.prod.svc.cluster.local<br/>
<span class="opacity-60">Fully qualified</span>
</div>
</div>

<div v-click="6" class="mt-6 text-center text-sm text-yellow-400">
<carbon-security class="inline-block text-2xl" /> For network isolation, use NetworkPolicies
</div>

---
layout: center
---

# ConfigMaps & Secrets Scoping

<div v-click="1">

```mermaid
graph TB
    subgraph app[app namespace]
        P1[Pod]
        C1[ConfigMap]
        P1 -.->|✓ Can mount| C1
    end
    subgraph shared[shared namespace]
        C2[ConfigMap]
    end
    P1 -.->|✗ Cannot mount| C2
    style app fill:#4ade80
    style shared fill:#60a5fa
```

</div>

<div v-click="2" class="mt-8 text-center text-lg text-red-400">
<carbon-warning class="inline-block text-3xl" /> ConfigMaps & Secrets cannot cross namespaces
</div>

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
<div v-click="3">
<carbon-copy class="text-3xl text-yellow-400 mb-2" />
<strong>Duplicate config</strong><br/>
Create in each namespace
</div>
<div v-click="4">
<carbon-network-3 class="text-3xl text-blue-400 mb-2" />
<strong>Use FQDN</strong><br/>
Reference services across namespaces
</div>
</div>

---
layout: center
---

# Managing Context

<div v-click="1">

```mermaid
graph LR
    K[kubectl] --> F["-n flag<br/>(explicit)"]
    K --> C["Context<br/>(implicit)"]
    K --> Y["YAML metadata<br/>(declarative)"]
    style K fill:#60a5fa
    style F fill:#4ade80
    style C fill:#fbbf24
    style Y fill:#a78bfa
```

</div>

<div class="grid grid-cols-3 gap-4 mt-8 text-xs">
<div v-click="2">
<carbon-terminal class="text-3xl text-green-400 mb-2" />
<strong>Flag method</strong><br/>
kubectl get pods -n prod<br/>
<span class="opacity-60">Clear, explicit</span>
</div>
<div v-click="3">
<carbon-settings class="text-3xl text-yellow-400 mb-2" />
<strong>Context method</strong><br/>
kubectl config set-context<br/>
<span class="opacity-60">Less typing</span>
</div>
<div v-click="4">
<carbon-document class="text-3xl text-purple-400 mb-2" />
<strong>YAML method</strong><br/>
metadata: namespace: prod<br/>
<span class="opacity-60">Self-documenting</span>
</div>
</div>

<div v-click="5" class="mt-8 text-center text-sm">
<carbon-idea class="inline-block text-2xl text-blue-400" /> CKAD tip: Use -n flag to avoid mistakes
</div>

---
layout: center
---

# Namespace Lifecycle

<div v-click="1">

```mermaid
stateDiagram-v2
    [*] --> Active: kubectl create ns
    Active --> Terminating: kubectl delete ns
    Terminating --> [*]: All resources deleted
```

</div>

<div v-click="2" class="mt-8 text-center text-2xl text-red-400">
<carbon-warning class="inline-block text-4xl" /> WARNING
</div>

<div v-click="3" class="text-center text-lg mt-4">
Deleting a namespace deletes EVERYTHING inside
</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div v-click="4">
<carbon-close class="inline-block text-2xl text-red-400" /> All Pods, Services, Deployments
</div>
<div v-click="5">
<carbon-close class="inline-block text-2xl text-red-400" /> All ConfigMaps, Secrets
</div>
<div v-click="6">
<carbon-close class="inline-block text-2xl text-red-400" /> All PersistentVolumeClaims
</div>
<div v-click="7">
<carbon-warning class="inline-block text-2xl text-red-400" /> Cannot be undone!
</div>
</div>

<div v-click="8" class="mt-6 text-center text-sm opacity-80">
Deletion is async - namespace enters "Terminating" state
</div>

---
layout: center
---

# Summary

<div v-click="1">

```mermaid
mindmap
  root((Namespaces))
    Virtual Clusters
      Logical isolation
      Multi-tenancy
    Scoping
      Namespace-scoped
      Cluster-scoped
    Resource Control
      ResourceQuota
      LimitRange
    Communication
      DNS FQDN
      NetworkPolicy
    Lifecycle
      Create delete
      Deletes all inside
```

</div>

---
layout: center
---

# Key Takeaways

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-partition-auto class="text-4xl text-blue-400 mb-2" />
<strong>Logical isolation</strong><br/>
<span class="text-sm opacity-80">Virtual clusters within physical cluster</span>
</div>
<div v-click="2">
<carbon-rule class="text-4xl text-green-400 mb-2" />
<strong>Resource control</strong><br/>
<span class="text-sm opacity-80">Quotas and limits per namespace</span>
</div>
<div v-click="3">
<carbon-network-3 class="text-4xl text-purple-400 mb-2" />
<strong>DNS discovery</strong><br/>
<span class="text-sm opacity-80">Access services via FQDN</span>
</div>
<div v-click="4">
<carbon-warning class="text-4xl text-red-400 mb-2" />
<strong>Careful deletion</strong><br/>
<span class="text-sm opacity-80">Deletes all resources inside</span>
</div>
</div>

<div v-click="5" class="mt-8 text-center text-lg">
<carbon-education class="inline-block text-3xl text-blue-400" /> Essential CKAD topic - practice context switching!
</div>
