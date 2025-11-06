---
layout: cover
---

# Deployment Strategies

<div class="abs-br m-6 flex gap-2">
  <carbon-deploy class="text-6xl text-blue-400" />
</div>

<div v-click class="mt-8 text-xl opacity-80">
Rolling out changes with zero downtime
</div>

---
layout: center
---

# The Update Challenge

<div v-click="1">

```mermaid
graph TB
    C[Constant Changes]
    C --> F[New Features]
    C --> S[Security Patches]
    C --> CFG[Config Updates]
    C --> I[Infrastructure]
    Q[Question: How to update<br/>without downtime?]
    F --> Q
    S --> Q
    CFG --> Q
    I --> Q
    style C fill:#60a5fa
    style Q fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-8 mt-8">
<div v-click="2">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>Traditional</strong><br/>
<span class="text-sm opacity-80">Downtime required</span>
</div>
<div v-click="3">
<carbon-checkmark class="text-5xl text-green-400 mb-2" />
<strong>Kubernetes</strong><br/>
<span class="text-sm opacity-80">Zero downtime updates</span>
</div>
</div>

---
layout: center
---

# Deployment Strategies Overview

<div v-click="1">

```mermaid
graph TB
    DS[Deployment<br/>Strategies]
    DS --> RU[Rolling Update<br/>Default]
    DS --> BG[Blue/Green<br/>Instant switch]
    DS --> C[Canary<br/>Gradual rollout]
    DS --> R[Recreate<br/>Downtime]
    style DS fill:#60a5fa
    style RU fill:#4ade80
    style BG fill:#a78bfa
    style C fill:#fbbf24
    style R fill:#ef4444
```

</div>

<div class="grid grid-cols-4 gap-2 mt-8 text-xs">
<div v-click="2" class="text-center">
<carbon-chart-line-smooth class="text-4xl text-green-400 mb-1" />
<strong>Rolling</strong><br/>
Low risk
</div>
<div v-click="3" class="text-center">
<carbon-switch class="text-4xl text-purple-400 mb-1" />
<strong>Blue/Green</strong><br/>
Very low risk
</div>
<div v-click="4" class="text-center">
<carbon-test-tool class="text-4xl text-yellow-400 mb-1" />
<strong>Canary</strong><br/>
Gradual
</div>
<div v-click="5" class="text-center">
<carbon-warning class="text-4xl text-red-400 mb-1" />
<strong>Recreate</strong><br/>
Downtime
</div>
</div>

---
layout: center
---

# Rolling Updates - Default Strategy

<div v-click="1">

```mermaid
graph LR
    V1A[v1] --> V2A[v2]
    V1B[v1] --> V2B[v2]
    V1C[v1] --> V2C[v2]
    V2A --> DONE[Complete]
    V2B --> DONE
    V2C --> DONE
    style V1A fill:#ef4444
    style V1B fill:#ef4444
    style V1C fill:#ef4444
    style V2A fill:#4ade80
    style V2B fill:#4ade80
    style V2C fill=#4ade80
    style DONE fill:#60a5fa
```

</div>

<div v-click="2" class="mt-8">

```mermaid
sequenceDiagram
    participant O as Old Pods
    participant N as New Pods
    participant S as Service
    Note over O,N: Rolling Update
    N->>N: Create new pod
    N->>N: Wait for ready
    S->>N: Add to endpoints
    O->>O: Terminate old pod
    N->>N: Repeat...
```

</div>

---
layout: center
---

# Rolling Update Configuration

<div v-click="1" class="mb-4">

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%          # Extra pods allowed
      maxUnavailable: 25%    # Pods that can be down
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="2">
<carbon-arrow-up class="text-4xl text-green-400 mb-2" />
<strong>maxSurge</strong><br/>
<span class="text-sm opacity-80">Maximum extra pods during rollout</span>
</div>
<div v-click="3">
<carbon-arrow-down class="text-4xl text-red-400 mb-2" />
<strong>maxUnavailable</strong><br/>
<span class="text-sm opacity-80">Maximum pods that can be down</span>
</div>
</div>

<div v-click="4" class="mt-8 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> Both versions run concurrently!
</div>

---
layout: center
---

# Rolling Update Examples

<div v-click="1">

```mermaid
graph TB
    F[Fast Rollout]
    F --> FS[maxSurge: 100%]
    F --> FU[maxUnavailable: 0%]
    F --> FR[Creates all new pods<br/>immediately]

    C[Conservative]
    C --> CS[maxSurge: 1]
    C --> CU[maxUnavailable: 0]
    C --> CR[One pod at a time]

    B[Balanced]
    B --> BS[maxSurge: 25%]
    B --> BU[maxUnavailable: 25%]
    B --> BR[Default behavior]

    style F fill:#4ade80
    style C fill:#fbbf24
    style B fill:#60a5fa
```

</div>

---
layout: center
---

# Rollback Capabilities

<div v-click="1">

```mermaid
graph LR
    D[Deployment] --> RS1[ReplicaSet v1]
    D --> RS2[ReplicaSet v2]
    D --> RS3[ReplicaSet v3]
    RS3 --> CURRENT[Current: 3 pods]
    RS2 --> OLD1[Old: 0 pods]
    RS1 --> OLD2[Old: 0 pods]
    style RS3 fill:#4ade80
    style RS2 fill:#60a5fa
    style RS1 fill:#60a5fa
```

</div>

<div v-click="2" class="mt-6 text-sm">

```bash
# View history
kubectl rollout history deployment/myapp

# Rollback to previous version
kubectl rollout undo deployment/myapp

# Rollback to specific revision
kubectl rollout undo deployment/myapp --to-revision=3

# Monitor rollout
kubectl rollout status deployment/myapp
```

</div>

<div v-click="3" class="mt-6 text-center text-red-400">
<carbon-warning class="inline-block text-2xl" /> No automatic rollback!
</div>

---
layout: center
---

# Blue/Green Deployments

<div v-click="1">

```mermaid
graph TB
    subgraph Production
        SVC[Service<br/>version: blue]
    end
    subgraph Blue[Blue v1]
        B1[Pod]
        B2[Pod]
        B3[Pod]
    end
    subgraph Green[Green v2]
        G1[Pod]
        G2[Pod]
        G3[Pod]
    end
    SVC -->|Traffic| B1 & B2 & B3
    SVC -.->|Ready| G1 & G2 & G3
    style SVC fill:#60a5fa
    style Blue fill:#4ade80
    style Green fill:#fbbf24
```

</div>

<div v-click="2" class="mt-6 text-center">
<carbon-switch class="inline-block text-4xl text-purple-400" />
<strong class="ml-2">Instant switchover by changing selector</strong>
</div>

---
layout: center
---

# Blue/Green Implementation

<div v-click="1" class="mb-4">

```yaml
# Two deployments
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
spec:
  selector:
    matchLabels:
      app: myapp
      version: blue
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  selector:
    matchLabels:
      app: myapp
      version: green
```

</div>

---
layout: center
---

# Switching Traffic

<div v-click="1">

```mermaid
sequenceDiagram
    participant SVC as Service
    participant B as Blue (v1)
    participant G as Green (v2)
    Note over B: Currently serving
    Note over G: Deploy & test
    G->>G: Verify health
    SVC->>B: Switch selector
    SVC->>G: version: green
    Note over G: Now serving
    Note over B: Keep as rollback
```

</div>

<div v-click="2" class="mt-6 text-sm">

```bash
# Switch to green
kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'

# Instant rollback if needed
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'
```

</div>

---
layout: center
---

# Blue/Green Trade-offs

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-checkmark class="text-5xl text-green-400 mb-2" />
<strong>Advantages</strong><br/>
<div class="text-sm opacity-80 mt-2">
• Instant switchover<br/>
• Easy rollback<br/>
• Full testing first<br/>
• No mixed versions
</div>
</div>
<div v-click="2">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>Drawbacks</strong><br/>
<div class="text-sm opacity-80 mt-2">
• 2x resources needed<br/>
• Complex with databases<br/>
• Not always practical
</div>
</div>
</div>

---
layout: center
---

# Canary Deployments

<div v-click="1">

```mermaid
graph TB
    SVC[Service<br/>app: myapp]
    subgraph Stable[Stable v1]
        S1[Pod]
        S2[Pod]
        S3[Pod]
        S4[Pod]
    end
    subgraph Canary[Canary v2]
        C1[Pod]
    end
    SVC -->|80% traffic| S1 & S2 & S3 & S4
    SVC -->|20% traffic| C1
    style SVC fill:#60a5fa
    style Stable fill:#4ade80
    style Canary fill:#fbbf24
```

</div>

<div v-click="2" class="mt-6 text-center">
<carbon-test-tool class="inline-block text-4xl text-yellow-400" />
<strong class="ml-2">Gradual exposure to minimize risk</strong>
</div>

---
layout: center
---

# Canary Progression

<div v-click="1">

```mermaid
graph LR
    START[Start:<br/>4 stable<br/>1 canary]
    STEP1[Step 1:<br/>3 stable<br/>3 canary]
    STEP2[Step 2:<br/>0 stable<br/>4 canary]
    DONE[Complete:<br/>Remove stable]
    START -->|Monitor| STEP1
    STEP1 -->|Monitor| STEP2
    STEP2 --> DONE
    START -.->|Issues| ROLLBACK[Scale canary to 0]
    style START fill:#4ade80
    style STEP1 fill:#fbbf24
    style STEP2 fill:#60a5fa
    style ROLLBACK fill:#ef4444
```

</div>

<div v-click="2" class="mt-8 text-center text-sm">
<carbon-chart-line-smooth class="inline-block text-3xl text-blue-400" />
Monitor metrics at each stage
</div>

---
layout: center
---

# Canary Implementation

<div v-click="1" class="text-sm">

```yaml
# Stable deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-stable
spec:
  replicas: 4
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: stable
---
# Canary deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: canary
```

</div>

---
layout: center
---

# Canary Trade-offs

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-checkmark class="text-5xl text-green-400 mb-2" />
<strong>Advantages</strong><br/>
<div class="text-sm opacity-80 mt-2">
• Minimal user impact<br/>
• Gradual rollout<br/>
• Easy rollback<br/>
• Data-driven decisions
</div>
</div>
<div v-click="2">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>Drawbacks</strong><br/>
<div class="text-sm opacity-80 mt-2">
• More complex<br/>
• Needs good monitoring<br/>
• Uneven distribution
</div>
</div>
</div>

---
layout: center
---

# Recreate Strategy

<div v-click="1">

```mermaid
graph LR
    V1A[v1] --> TERM[Terminate<br/>ALL]
    V1B[v1] --> TERM
    V1C[v1] --> TERM
    TERM --> DOWN[Downtime]
    DOWN --> V2A[v2]
    DOWN --> V2B[v2]
    DOWN --> V2C[v2]
    style V1A fill:#ef4444
    style V1B fill:#ef4444
    style V1C fill:#ef4444
    style DOWN fill:#fbbf24
    style V2A fill:#4ade80
    style V2B fill:#4ade80
    style V2C fill:#4ade80
```

</div>

<div v-click="2" class="mt-8">

```yaml
spec:
  strategy:
    type: Recreate
```

</div>

<div v-click="3" class="mt-6 text-center text-red-400">
<carbon-warning class="inline-block text-2xl" /> Use with extreme caution in production!
</div>

---
layout: center
---

# When to Use Recreate

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="1">
<carbon-checkmark class="text-5xl text-green-400 mb-2" />
<strong>Use when:</strong><br/>
<div class="text-sm opacity-80 mt-2">
• Development/testing<br/>
• Can't run multiple versions<br/>
• Database migrations<br/>
• Downtime acceptable
</div>
</div>
<div v-click="2">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>Avoid when:</strong><br/>
<div class="text-sm opacity-80 mt-2">
• Production workloads<br/>
• Zero downtime required<br/>
• High availability needed
</div>
</div>
</div>

---
layout: center
---

# Choosing the Right Strategy

<div v-click="1">

```mermaid
graph TD
    Q1{Can run<br/>multiple versions?}
    Q1 -->|No| REC[Recreate]
    Q1 -->|Yes| Q2{Zero downtime<br/>critical?}
    Q2 -->|Very| Q3{Have 2x<br/>resources?}
    Q3 -->|Yes| BG[Blue/Green]
    Q3 -->|No| CAN[Canary]
    Q2 -->|Moderate| Q4{High risk<br/>change?}
    Q4 -->|Yes| CAN
    Q4 -->|No| ROLL[Rolling Update]
    style REC fill=#ef4444
    style BG fill:#a78bfa
    style CAN fill:#fbbf24
    style ROLL fill:#4ade80
```

</div>

---
layout: center
---

# CKAD Exam Tips

<div v-click="1" class="text-center mb-6">
<carbon-certificate class="inline-block text-6xl text-blue-400" />
</div>

<div class="grid grid-cols-2 gap-4 text-sm">
<div v-click="2">
<carbon-settings class="inline-block text-2xl text-green-400" /> Configure rolling updates
</div>
<div v-click="3">
<carbon-restart class="inline-block text-2xl text-green-400" /> Rollback deployments
</div>
<div v-click="4">
<carbon-view class="inline-block text-2xl text-green-400" /> Check rollout history
</div>
<div v-click="5">
<carbon-switch class="inline-block text-2xl text-green-400" /> Implement blue/green
</div>
<div v-click="6">
<carbon-test-tool class="inline-block text-2xl text-green-400" /> Create canary deployments
</div>
<div v-click="7">
<carbon-edit class="inline-block text-2xl text-green-400" /> Patch Service selectors
</div>
</div>

<div v-click="8" class="mt-8 text-sm">

```bash
# Quick image update
kubectl set image deployment/myapp myapp=myapp:v2

# Rollback
kubectl rollout undo deployment/myapp

# Monitor
kubectl rollout status deployment/myapp
```

</div>

---
layout: center
---

# Summary

<div v-click="1">

```mermaid
mindmap
  root((Deployment<br/>Strategies))
    Rolling Update
      Default choice
      maxSurge maxUnavailable
      Both versions run
    Blue/Green
      Instant switch
      2x resources
      Easy rollback
    Canary
      Gradual rollout
      Monitor metrics
      Minimal impact
    Recreate
      Downtime
      Simple
      Dev/test only
    Rollback
      No auto rollback
      Manual intervention
      History maintained
```

</div>

---
layout: center
---

# Key Takeaways

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-chart-line-smooth class="text-4xl text-green-400 mb-2" />
<strong>Rolling Update</strong><br/>
<span class="text-sm opacity-80">Default for most cases</span>
</div>
<div v-click="2">
<carbon-switch class="text-4xl text-purple-400 mb-2" />
<strong>Blue/Green</strong><br/>
<span class="text-sm opacity-80">Instant switchover</span>
</div>
<div v-click="3">
<carbon-test-tool class="text-4xl text-yellow-400 mb-2" />
<strong>Canary</strong><br/>
<span class="text-sm opacity-80">Minimize risk exposure</span>
</div>
<div v-click="4">
<carbon-restart class="text-4xl text-blue-400 mb-2" />
<strong>No auto rollback</strong><br/>
<span class="text-sm opacity-80">Monitor and intervene</span>
</div>
</div>

<div v-click="5" class="mt-8 text-center text-xl">
Deployment strategy is about managing risk <carbon-arrow-right class="inline-block text-2xl" />
</div>

---
layout: center
---

# Next Steps

<div v-click="1" class="text-center mb-8">
<carbon-education class="inline-block text-6xl text-blue-400" />
</div>

<div v-click="2">

```mermaid
graph LR
    C[Concepts] --> H[Hands-on<br/>Deployments]
    H --> F[Handle<br/>Failures]
    F --> P[CKAD<br/>Practice]
    style C fill:#4ade80
    style H fill:#60a5fa
    style F fill:#fbbf24
    style P fill:#a78bfa
```

</div>

<div v-click="3" class="mt-8 text-center text-xl">
Let's deploy and rollback! <carbon-arrow-right class="inline-block text-2xl" />
</div>
