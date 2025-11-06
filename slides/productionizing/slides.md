---
layout: cover
---

# Production Readiness

<div class="abs-br m-6 flex gap-2">
  <carbon-health-cross class="text-6xl text-blue-400" />
</div>

<div v-click class="mt-8 text-xl opacity-80">
Making Kubernetes applications production-grade
</div>

---
layout: center
---

# The Production Gap

<div v-click="1">

```mermaid
graph TB
    B[Basic Deployment] --> P[Production Ready]
    B --> N1[No health checks]
    B --> N2[No resource limits]
    B --> N3[No autoscaling]
    B --> N4[No security]
    P --> Y1[Health probes]
    P --> Y2[Resource management]
    P --> Y3[HPA]
    P --> Y4[Security contexts]
    style B fill:#ef4444
    style P fill:#4ade80
    style N1 fill:#fbbf24
    style N2 fill:#fbbf24
    style N3 fill:#fbbf24
    style N4 fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="2">
<carbon-close class="inline-block text-3xl text-red-400" />
<strong>Basic:</strong> Works but fragile
</div>
<div v-click="3">
<carbon-checkmark class="inline-block text-3xl text-green-400" />
<strong>Production:</strong> Reliable & secure
</div>
</div>

---
layout: center
---

# Health Probes Overview

<div v-click="1">

```mermaid
graph LR
    P[Pod] --> S[Startup<br/>Probe]
    S --> R[Readiness<br/>Probe]
    R --> L[Liveness<br/>Probe]
    R -->|Fails| T[Remove from<br/>Service]
    L -->|Fails| RS[<carbon-restart/>Restart]
    style S fill:#fbbf24
    style R fill:#4ade80
    style L fill:#60a5fa
    style T fill:#a78bfa
    style RS fill:#ef4444
```

</div>

<div class="grid grid-cols-3 gap-4 mt-8 text-sm">
<div v-click="2" class="text-center">
<carbon-power class="text-5xl text-yellow-400 mb-2" />
<strong>Startup</strong><br/>
Slow initialization
</div>
<div v-click="3" class="text-center">
<carbon-traffic-flow class="text-5xl text-green-400 mb-2" />
<strong>Readiness</strong><br/>
Ready for traffic
</div>
<div v-click="4" class="text-center">
<carbon-activity class="text-5xl text-blue-400 mb-2" />
<strong>Liveness</strong><br/>
Healthy & running
</div>
</div>

---
layout: center
---

# Probe Mechanisms

<div v-click="1">

```mermaid
graph TB
    PM[Probe Mechanisms]
    PM --> HTTP[<carbon-http/>HTTP GET]
    PM --> TCP[<carbon-network-3/>TCP Socket]
    PM --> EXEC[<carbon-terminal/>Exec Command]
    HTTP --> H1[Check /healthz]
    TCP --> T1[Connect to port]
    EXEC --> E1[Run command]
    style PM fill:#60a5fa
    style HTTP fill:#4ade80
    style TCP fill:#4ade80
    style EXEC fill:#4ade80
```

</div>

<div class="mt-8 text-sm">
<div v-click="2">

```yaml
# HTTP GET - most common
httpGet:
  path: /healthz
  port: 8080
```

</div>
<div v-click="3">

```yaml
# TCP Socket - non-HTTP apps
tcpSocket:
  port: 5432
```

</div>
</div>

---
layout: center
---

# Readiness vs Liveness

<div v-click="1">

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Running: Container starts
    Running --> NotReady: Readiness fails
    NotReady --> Running: Probe passes
    Running --> Dead: Liveness fails
    Dead --> Running: Restart

    note right of NotReady
        Removed from Service
        No traffic sent
        Pod not killed
    end note

    note right of Dead
        Container killed
        New container started
        Fresh state
    end note
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="2">
<carbon-network-3 class="text-4xl text-green-400 mb-2" />
<strong>Readiness:</strong> Traffic routing
</div>
<div v-click="3">
<carbon-restart class="text-4xl text-blue-400 mb-2" />
<strong>Liveness:</strong> Container lifecycle
</div>
</div>

---
layout: center
---

# Probe Configuration

<div v-click="1" class="mb-4">

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30   # Wait before first check
  periodSeconds: 10         # How often to check
  timeoutSeconds: 5         # Request timeout
  failureThreshold: 3       # Failures before action
  successThreshold: 1       # Successes to be healthy
```

</div>

<div v-click="2">

```mermaid
graph LR
    T0[Start] -->|30s wait| T1[Check 1]
    T1 -->|10s| T2[Check 2]
    T2 -->|10s| T3[Check 3]
    T3 -->|Fail| A[Action Taken]
    style T0 fill:#4ade80
    style T3 fill:#fbbf24
    style A fill:#ef4444
```

</div>

<div v-click="3" class="mt-6 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> Configure carefully to avoid false positives!
</div>

---
layout: center
---

# Resource Management

<div v-click="1">

```mermaid
graph TB
    R[Resources]
    R --> REQ[Requests<br/>Guaranteed minimum]
    R --> LIM[Limits<br/>Maximum allowed]
    REQ --> SCH[Scheduler uses<br/>for placement]
    LIM --> CPU[CPU: Throttled]
    LIM --> MEM[Memory: OOMKilled]
    style R fill:#60a5fa
    style REQ fill:#4ade80
    style LIM fill:#fbbf24
    style CPU fill:#a78bfa
    style MEM fill:#ef4444
```

</div>

<div v-click="2" class="mt-6">

```yaml
resources:
  requests:
    cpu: 100m        # Guaranteed
    memory: 128Mi
  limits:
    cpu: 500m        # Maximum
    memory: 256Mi
```

</div>

---
layout: center
---

# Quality of Service Classes

<div v-click="1">

```mermaid
graph TB
    QOS[QoS Classes]
    QOS --> G[Guaranteed<br/>requests = limits]
    QOS --> B[Burstable<br/>requests < limits]
    QOS --> BE[BestEffort<br/>no requests/limits]
    G --> GP[Highest priority]
    B --> BP[Medium priority]
    BE --> BEP[Lowest priority]
    style G fill:#4ade80
    style B fill:#fbbf24
    style BE fill:#ef4444
```

</div>

<div class="grid grid-cols-3 gap-4 mt-8 text-sm">
<div v-click="2" class="text-center">
<carbon-trophy class="text-5xl text-green-400 mb-2" />
<strong>Guaranteed</strong><br/>
Last to evict
</div>
<div v-click="3" class="text-center">
<carbon-arrow-up-right class="text-5xl text-yellow-400 mb-2" />
<strong>Burstable</strong><br/>
Can use extra
</div>
<div v-click="4" class="text-center">
<carbon-help class="text-5xl text-red-400 mb-2" />
<strong>BestEffort</strong><br/>
First to evict
</div>
</div>

---
layout: center
---

# Horizontal Pod Autoscaler

<div v-click="1">

```mermaid
graph LR
    M[Metrics<br/>Server] --> HPA[HPA<br/>Controller]
    HPA --> D[Deployment]
    D --> RS[ReplicaSet]
    RS --> P1[Pod]
    RS --> P2[Pod]
    RS --> PN[Pod N]
    HPA -->|CPU > 70%| UP[Scale Up]
    HPA -->|CPU < 70%| DOWN[Scale Down]
    style M fill:#4ade80
    style HPA fill:#60a5fa
    style UP fill:#fbbf24
    style DOWN fill:#a78bfa
```

</div>

<div v-click="2" class="mt-6">

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        averageUtilization: 70
```

</div>

---
layout: center
---

# HPA Requirements

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="1">
<carbon-checkmark class="text-5xl text-green-400 mb-2" />
<strong>Prerequisites</strong><br/>
<div class="text-sm opacity-80 mt-2">
• Metrics Server installed<br/>
• Resource requests set<br/>
• Scalable target
</div>
</div>
<div v-click="2">
<carbon-warning class="text-5xl text-yellow-400 mb-2" />
<strong>Limitations</strong><br/>
<div class="text-sm opacity-80 mt-2">
• Can't scale below min<br/>
• Cooldown periods<br/>
• Average across pods
</div>
</div>
</div>

<div v-click="3" class="mt-8">

```mermaid
graph LR
    L[Load Increases] --> C[CPU > 70%]
    C --> S[Scale Up]
    S --> N[New Pods]
    N --> A[Average < 70%]
    style L fill:#ef4444
    style C fill:#fbbf24
    style S fill:#60a5fa
    style A fill:#4ade80
```

</div>

---
layout: center
---

# Security Contexts

<div v-click="1">

```mermaid
graph TB
    SC[Security Context]
    SC --> U[<carbon-user/>runAsNonRoot]
    SC --> R[<carbon-locked/>readOnlyRootFilesystem]
    SC --> P[<carbon-security/>allowPrivilegeEscalation]
    SC --> C[<carbon-rule/>capabilities]
    U --> U1[Run as UID 1000]
    R --> R1[Immutable filesystem]
    P --> P1[Prevent escalation]
    C --> C1[Drop ALL]
    style SC fill:#60a5fa
    style U fill:#4ade80
    style R fill:#4ade80
    style P fill:#4ade80
    style C fill:#4ade80
```

</div>

<div v-click="2" class="mt-6 text-sm">

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]
```

</div>

---
layout: center
---

# Security Best Practices

<div class="grid grid-cols-2 gap-6 mt-4">
<div v-click="1">
<carbon-user class="text-5xl text-blue-400 mb-2" />
<strong>Run as non-root</strong><br/>
<span class="text-sm opacity-80">Never run as UID 0</span>
</div>
<div v-click="2">
<carbon-locked class="text-5xl text-green-400 mb-2" />
<strong>Read-only filesystem</strong><br/>
<span class="text-sm opacity-80">Use emptyDir for writes</span>
</div>
<div v-click="3">
<carbon-rule class="text-5xl text-purple-400 mb-2" />
<strong>Drop capabilities</strong><br/>
<span class="text-sm opacity-80">Start with drop: ["ALL"]</span>
</div>
<div v-click="4">
<carbon-security class="text-5xl text-yellow-400 mb-2" />
<strong>Prevent escalation</strong><br/>
<span class="text-sm opacity-80">allowPrivilegeEscalation: false</span>
</div>
</div>

<div v-click="5" class="mt-8 text-center text-lg">
<carbon-shield-security class="inline-block text-3xl text-blue-400" /> Principle of least privilege
</div>

---
layout: center
---

# Production Checklist

<div class="grid grid-cols-2 gap-4 text-sm">
<div v-click="1">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Readiness probe configured
</div>
<div v-click="2">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Liveness probe configured
</div>
<div v-click="3">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Resource requests set
</div>
<div v-click="4">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Resource limits set
</div>
<div v-click="5">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> HPA configured
</div>
<div v-click="6">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Multiple replicas (min 2)
</div>
<div v-click="7">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Run as non-root
</div>
<div v-click="8">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Security context applied
</div>
<div v-click="9">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Logging configured
</div>
<div v-click="10">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Graceful shutdown
</div>
</div>

---
layout: center
---

# Common Anti-Patterns

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>No health probes</strong><br/>
<span class="text-sm opacity-80">Can't detect failures</span>
</div>
<div v-click="2">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>Aggressive liveness</strong><br/>
<span class="text-sm opacity-80">Restart loops</span>
</div>
<div v-click="3">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>No resource limits</strong><br/>
<span class="text-sm opacity-80">Noisy neighbors</span>
</div>
<div v-click="4">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>Running as root</strong><br/>
<span class="text-sm opacity-80">Security risk</span>
</div>
<div v-click="5">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>Single replica</strong><br/>
<span class="text-sm opacity-80">No high availability</span>
</div>
<div v-click="6">
<carbon-close class="text-5xl text-red-400 mb-2" />
<strong>No monitoring</strong><br/>
<span class="text-sm opacity-80">Blind to issues</span>
</div>
</div>

---
layout: center
---

# CKAD Exam Focus

<div v-click="1" class="text-center mb-6">
<carbon-certificate class="inline-block text-6xl text-blue-400" />
</div>

<div class="grid grid-cols-2 gap-4 text-sm">
<div v-click="2">
<carbon-health-cross class="inline-block text-2xl text-green-400" /> Configure all probe types
</div>
<div v-click="3">
<carbon-dashboard class="inline-block text-2xl text-green-400" /> Set requests and limits
</div>
<div v-click="4">
<carbon-rule class="inline-block text-2xl text-green-400" /> Create HPA
</div>
<div v-click="5">
<carbon-security class="inline-block text-2xl text-green-400" /> Apply security contexts
</div>
<div v-click="6">
<carbon-debug class="inline-block text-2xl text-green-400" /> Troubleshoot OOMKilled
</div>
<div v-click="7">
<carbon-debug class="inline-block text-2xl text-green-400" /> Debug CrashLoopBackOff
</div>
</div>

<div v-click="8" class="mt-8 text-center text-lg">
<carbon-timer class="inline-block text-3xl text-red-400" /> Practice for speed!
</div>

---
layout: center
---

# Summary

<div v-click="1">

```mermaid
mindmap
  root((Production<br/>Ready))
    Health Probes
      Readiness
      Liveness
      Startup
    Resources
      Requests
      Limits
      QoS Classes
    Autoscaling
      HPA
      Metrics Server
      Min/Max replicas
    Security
      Non-root user
      Read-only FS
      Drop capabilities
      Prevent escalation
```

</div>

---
layout: center
---

# Key Takeaways

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-health-cross class="text-4xl text-blue-400 mb-2" />
<strong>Health probes</strong><br/>
<span class="text-sm opacity-80">Essential for reliability</span>
</div>
<div v-click="2">
<carbon-dashboard class="text-4xl text-green-400 mb-2" />
<strong>Resource management</strong><br/>
<span class="text-sm opacity-80">Protect the cluster</span>
</div>
<div v-click="3">
<carbon-rule class="text-4xl text-purple-400 mb-2" />
<strong>Autoscaling</strong><br/>
<span class="text-sm opacity-80">Handle variable load</span>
</div>
<div v-click="4">
<carbon-security class="text-4xl text-yellow-400 mb-2" />
<strong>Security contexts</strong><br/>
<span class="text-sm opacity-80">Reduce attack surface</span>
</div>
</div>

<div v-click="5" class="mt-8 text-center text-xl">
Production readiness is about reliability, security, and observability
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
    C[Concepts] --> H[Hands-on<br/>Configuration]
    H --> T[Test<br/>Failures]
    T --> P[CKAD<br/>Practice]
    style C fill:#4ade80
    style H fill:#60a5fa
    style T fill:#fbbf24
    style P fill:#a78bfa
```

</div>

<div v-click="3" class="mt-8 text-center text-xl">
Let's configure production-ready apps! <carbon-arrow-right class="inline-block text-2xl" />
</div>
