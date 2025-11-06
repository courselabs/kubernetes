---
layout: cover
---

# Pods
## CKAD Exam Preparation

<div class="abs-br m-6 flex gap-2">
  <carbon-kubernetes class="text-6xl text-blue-400" />
</div>

---
layout: center
---

# From Practice to Performance

```mermaid
graph LR
    A[<carbon-education/> Hands-on<br/>Exercises] --> B[<carbon-arrow-right/> Transition] --> C[<carbon-certificate/> CKAD<br/>Exam]
    style A fill:#4ade80
    style C fill:#60a5fa
```

<div class="mt-8 text-center text-xl opacity-80">
You've mastered the fundamentals<br/>
Now it's time to prepare for exam scenarios
</div>

---
layout: two-cols
---

# CKAD Reality

<carbon-timer class="text-5xl text-red-400 mb-4" />

## 2 Hours
15-20 practical tasks

<carbon-terminal class="text-5xl text-green-400 mb-4 mt-8" />

## Performance-Based
Real clusters, real kubectl

::right::

<div class="mt-16">

```mermaid
pie title Exam Focus
    "Multi-Container" : 20
    "Resources" : 20
    "Health Probes" : 20
    "Security" : 20
    "Configuration" : 20
```

</div>

---
layout: center
---

# Multi-Container Patterns

```mermaid
graph TB
    subgraph Pod
        I[<carbon-document/> Init<br/>Container]
        M[<carbon-application/> Main<br/>Container]
        S[<carbon-side-panel-open/> Sidecar<br/>Container]
        V[<carbon-data-volume/> Shared<br/>Volume]
    end
    I -.->|initialize| M
    M <-->|share data| V
    S <-->|access data| V
    style I fill:#fbbf24
    style M fill:#60a5fa
    style S fill:#a78bfa
    style V fill:#4ade80
```

<div class="text-center mt-4 text-lg opacity-80">
Containers collaborate within a Pod
</div>

---
layout: center
---

# Resource Management

```mermaid
graph LR
    subgraph Pod Lifecycle
        R[<carbon-request-quote/> Requests<br/>Guaranteed] --> L[<carbon-threshold-limit/> Limits<br/>Maximum]
        L --> O[<carbon-warning/> OOMKilled<br/>Exceeded]
    end
    style R fill:#4ade80
    style L fill:#fbbf24
    style O fill:#ef4444
```

<div class="mt-8 grid grid-cols-2 gap-4">
<div>

## Requests
<carbon-arrow-down class="text-2xl text-green-400" />

Scheduling guarantee

</div>
<div>

## Limits
<carbon-arrow-up class="text-2xl text-yellow-400" />

Upper boundary

</div>
</div>

---
layout: center
---

# Health Probes

```mermaid
graph TB
    subgraph Probe Types
        S[<carbon-power/> Startup<br/>Initial Ready]
        R[<carbon-checkmark/> Readiness<br/>Traffic Ready]
        L[<carbon-restart/> Liveness<br/>Restart Check]
    end
    S --> R
    R --> L
    L -.->|failure| RESTART[<carbon-renew/> Container<br/>Restart]
    style S fill:#fbbf24
    style R fill:#4ade80
    style L fill:#60a5fa
    style RESTART fill:#ef4444
```

<div class="mt-4 flex justify-around text-sm">
<div class="text-center">
<carbon-http class="text-3xl mb-2" />
HTTP
</div>
<div class="text-center">
<carbon-network-3 class="text-3xl mb-2" />
TCP
</div>
<div class="text-center">
<carbon-terminal class="text-3xl mb-2" />
Exec
</div>
</div>

---
layout: center
---

# Security Contexts

```mermaid
graph TD
    SC[<carbon-security/> Security Context]
    SC --> U[<carbon-user/> Non-root User]
    SC --> F[<carbon-locked/> Filesystem<br/>Permissions]
    SC --> C[<carbon-chip/> Capability<br/>Dropping]
    style SC fill:#60a5fa
    style U fill:#4ade80
    style F fill:#fbbf24
    style C fill:#a78bfa
```

<div class="mt-8 text-center text-lg opacity-80">
<carbon-security class="text-4xl text-blue-400 inline-block mb-2" />
<br/>
Principle of least privilege
</div>

---
layout: center
---

# Configuration Management

```mermaid
graph LR
    subgraph Sources
        CM[<carbon-settings/> ConfigMap]
        S[<carbon-password/> Secret]
    end
    subgraph Pod
        E[<carbon-code/> Environment<br/>Variables]
        V[<carbon-data-volume/> Volume<br/>Mounts]
    end
    CM --> E
    CM --> V
    S --> E
    S --> V
    style CM fill:#4ade80
    style S fill:#ef4444
    style E fill:#60a5fa
    style V fill:#a78bfa
```

<div class="mt-4 text-center text-lg opacity-80">
Separate configuration from specification
</div>

---
layout: two-cols
---

# What's Coming

<carbon-education class="text-5xl text-blue-400 mb-4" />

## Practical Scenarios
- Multi-container Pods
- Resource configurations
- Health probe implementation
- Security hardening

<carbon-terminal class="text-5xl text-green-400 mb-4 mt-8" />

## Time-Saving Techniques
- kubectl shortcuts
- YAML templates
- Quick troubleshooting

::right::

<div class="mt-16">

```mermaid
graph TB
    E[<carbon-exam-mode/> EXAM<br/>SCENARIOS]
    E --> M[Multi-container]
    E --> R[Resources]
    E --> H[Health]
    E --> S[Security]
    E --> T[<carbon-timer/> 4-5 min<br/>per task]
    style E fill:#60a5fa
    style T fill:#ef4444
```

</div>

---
layout: center
---

# Exam Mindset

```mermaid
graph LR
    P[<carbon-practice/> Practice] --> M[<carbon-flash/> Muscle<br/>Memory] --> C[<carbon-checkmark-filled/> Confidence] --> S[<carbon-trophy/> Success]
    style P fill:#4ade80
    style M fill:#fbbf24
    style C fill:#60a5fa
    style S fill:#a78bfa
```

<div class="mt-12 text-center">
<div class="text-2xl mb-4">
<carbon-idea class="text-yellow-400 text-4xl inline-block" />
</div>

### The exam tests realistic scenarios
### Build patterns through repetition
### Speed comes from practice

</div>
