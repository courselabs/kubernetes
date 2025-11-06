---
layout: cover
---

# Kubernetes Operators

<div class="abs-br m-6 flex gap-2">
  <carbon-settings class="text-6xl text-blue-400" />
</div>

<div v-click class="mt-8 text-xl opacity-80">
Extending Kubernetes with application-specific intelligence
</div>

<div v-click class="mt-4 text-sm text-yellow-400">
Advanced - Beyond CKAD (CRDs are CKAD-relevant)
</div>

---
layout: center
---

# The Operational Complexity Challenge

<div v-click="1">

```mermaid
graph TB
    D[Complex Application<br/>Database Cluster]
    D --> I[Initial Deployment<br/>StatefulSet, PV, Services]
    D --> O[Ongoing Operations]
    O --> B[Backups]
    O --> U[Upgrades]
    O --> S[Scaling]
    O --> F[Failover]
    O --> M[Monitoring]
    style D fill:#ef4444,color:#fff
    style I fill:#fbbf24
    style O fill:#60a5fa
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Standard Kubernetes handles deployment, not operations
</div>

<div v-click="3" class="mt-4 text-center text-xl">
<carbon-settings class="inline-block text-3xl text-green-400" /> Operators encode operational knowledge
</div>

---
layout: center
---

# What is an Operator?

<div v-click="1">

```mermaid
graph LR
    O[Operator Pattern] --> CR[Custom Resources]
    O --> C[Controllers]
    CR --> E[Extend API]
    C --> A[Automate Operations]
    style O fill:#60a5fa
    style CR fill:#4ade80
    style C fill:#fbbf24
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Software extensions to Kubernetes
</div>

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
<div v-click="3">
<carbon-api class="text-3xl text-blue-400 mb-2" />
<strong>Extends API</strong><br/>
Custom resource types
</div>
<div v-click="4">
<carbon-activity class="text-3xl text-green-400 mb-2" />
<strong>Runs continuously</strong><br/>
Watches for changes
</div>
<div v-click="5">
<carbon-settings class="text-3xl text-purple-400 mb-2" />
<strong>Encodes knowledge</strong><br/>
Operational logic in code
</div>
<div v-click="6">
<carbon-restart class="text-3xl text-yellow-400 mb-2" />
<strong>Self-healing</strong><br/>
Automatic reconciliation
</div>
</div>

---
layout: center
---

# Custom Resource Definitions (CRDs)

<div v-click="1" class="mb-4">

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: postgresclusters.db.example.com
spec:
  group: db.example.com
  names:
    kind: PostgresCluster
    plural: postgresclusters
  scope: Namespaced
```

</div>

<div v-click="2">

```mermaid
graph LR
    CRD[CRD] --> S[Schema Definition]
    S --> V[Validation Rules]
    S --> F[Field Types]
    S --> K[kubectl Integration]
    style CRD fill:#60a5fa
    style S fill:#fbbf24
```

</div>

<div v-click="3" class="mt-6 text-center text-lg">
Extends Kubernetes API with new resource types
</div>

<div v-click="4" class="mt-4 text-center text-sm text-green-400">
<carbon-checkmark class="inline-block text-2xl" /> CKAD-relevant skill!
</div>

---
layout: center
---

# Creating Custom Resources

<div v-click="1" class="mb-6">

```yaml
apiVersion: db.example.com/v1
kind: PostgresCluster
metadata:
  name: my-database
spec:
  version: "14"
  replicas: 3
  storage: 100Gi
```

</div>

<div v-click="2">

```mermaid
graph TB
    U[User Creates CR] --> CRD[CRD Validates]
    CRD --> K[Kubernetes Stores]
    K --> C[Controller Sees Change]
    C --> A[Takes Action]
    style U fill:#4ade80
    style CRD fill:#60a5fa
    style K fill:#fbbf24
    style C fill:#a78bfa
    style A fill:#ef4444
```

</div>

<div v-click="3" class="mt-6 text-center text-sm opacity-80">
After CRD is installed, create custom resources like built-in resources
</div>

---
layout: center
---

# Controllers

<div v-click="1">

```mermaid
graph TB
    C[Controller Loop]
    C --> W[Watch Resources]
    W --> R[Read Desired State]
    R --> A[Read Actual State]
    A --> CO[Compare]
    CO --> RE[Reconcile Differences]
    RE --> U[Update Status]
    U --> W
    style C fill:#60a5fa
    style W fill:#4ade80
    style RE fill:#fbbf24
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
The "brains" of an Operator
</div>

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
<div v-click="3">
<carbon-view class="text-3xl text-blue-400 mb-2" />
<strong>Watch custom resources</strong><br/>
Detect changes
</div>
<div v-click="4">
<carbon-settings class="text-3xl text-green-400 mb-2" />
<strong>Reconcile state</strong><br/>
Make reality match desire
</div>
</div>

---
layout: center
---

# Operator Pattern in Action

<div v-click="1">

```mermaid
sequenceDiagram
    participant U as User
    participant CR as Custom Resource
    participant C as Controller
    participant K as Kubernetes
    U->>CR: Create PostgresCluster
    CR->>C: Event: New resource
    C->>K: Create StatefulSet
    C->>K: Create Services
    C->>K: Create PVCs
    C->>K: Create CronJob (backup)
    C->>CR: Update status: Ready
```

</div>

<div v-click="2" class="mt-6 text-center text-lg">
Declarative intent → automated operations
</div>

---
layout: center
---

# Operator Benefits

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-settings class="text-4xl text-blue-400 mb-2" />
<strong>Application intelligence</strong><br/>
<span class="text-sm opacity-80">Understands app-specific needs</span>
</div>
<div v-click="2">
<carbon-rule class="text-4xl text-green-400 mb-2" />
<strong>Simplified management</strong><br/>
<span class="text-sm opacity-80">High-level abstractions</span>
</div>
<div v-click="3">
<carbon-restart class="text-4xl text-purple-400 mb-2" />
<strong>Self-healing</strong><br/>
<span class="text-sm opacity-80">Continuous reconciliation</span>
</div>
<div v-click="4">
<carbon-document class="text-4xl text-yellow-400 mb-2" />
<strong>Declarative operations</strong><br/>
<span class="text-sm opacity-80">Version control everything</span>
</div>
</div>

<div v-click="5" class="mt-8 text-center text-sm">
Example: Update version field → Operator handles entire upgrade safely
</div>

---
layout: center
---

# Common Operator Use Cases

<div v-click="1">

```mermaid
graph TB
    O[Operators] --> D[Databases<br/>PostgreSQL, MySQL, MongoDB]
    O --> M[Message Queues<br/>Kafka, RabbitMQ]
    O --> P[Data Processing<br/>Spark, Flink]
    O --> MO[Monitoring<br/>Prometheus, Grafana]
    O --> C[Certificates<br/>cert-manager]
    style O fill:#60a5fa
    style D fill:#4ade80
    style M fill:#4ade80
    style P fill:#4ade80
    style MO fill:#4ade80
    style C fill:#4ade80
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Most valuable for complex, stateful applications
</div>

<div v-click="3" class="mt-4 text-center text-sm opacity-80">
If your app needs ongoing operational tasks, an operator can help
</div>

---
layout: center
---

# Operator Maturity Levels

<div v-click="1">

```mermaid
graph TB
    L1[Level 1<br/>Basic Install] --> L2[Level 2<br/>Seamless Upgrades]
    L2 --> L3[Level 3<br/>Full Lifecycle]
    L3 --> L4[Level 4<br/>Deep Insights]
    L4 --> L5[Level 5<br/>Auto Pilot]
    style L1 fill:#ef4444
    style L2 fill:#fbbf24
    style L3 fill:#60a5fa
    style L4 fill:#a78bfa
    style L5 fill:#4ade80
```

</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-xs">
<div v-click="2">
<carbon-document class="inline-block text-2xl text-red-400" /> <strong>L1:</strong> Automated provisioning
</div>
<div v-click="3">
<carbon-arrow-up class="inline-block text-2xl text-yellow-400" /> <strong>L2:</strong> Automated upgrades
</div>
<div v-click="4">
<carbon-restart class="inline-block text-2xl text-blue-400" /> <strong>L3:</strong> Backup, restore, recovery
</div>
<div v-click="5">
<carbon-view class="inline-block text-2xl text-purple-400" /> <strong>L4:</strong> Performance tuning, insights
</div>
<div v-click="6">
<carbon-settings class="inline-block text-2xl text-green-400" /> <strong>L5:</strong> Full automation
</div>
</div>

<div v-click="7" class="mt-6 text-center text-sm opacity-80">
Most operators are Level 2-3
</div>

---
layout: center
---

# Operator Deployment

<div v-click="1">

```mermaid
graph TB
    I[Installation Methods]
    I --> M[kubectl apply -f<br/>Manifest-based]
    I --> H[helm install<br/>Helm-based]
    I --> O[OLM<br/>Operator Lifecycle Manager]
    style I fill:#60a5fa
    style M fill:#4ade80
    style H fill:#fbbf24
    style O fill:#a78bfa
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
Typical operator structure
</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div v-click="3">
<carbon-api class="inline-block text-2xl text-blue-400" /> CRD definitions
</div>
<div v-click="4">
<carbon-locked class="inline-block text-2xl text-green-400" /> RBAC resources
</div>
<div v-click="5">
<carbon-container-software class="inline-block text-2xl text-purple-400" /> Operator Deployment
</div>
<div v-click="6">
<carbon-rule class="inline-block text-2xl text-yellow-400" /> Validation webhooks
</div>
</div>

---
layout: center
---

# RBAC & Security

<div v-click="1" class="mb-4">

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: database-operator
rules:
- apiGroups: ["apps"]
  resources: ["statefulsets"]
  verbs: ["get", "list", "create", "update", "delete"]
- apiGroups: ["db.example.com"]
  resources: ["postgresclusters"]
  verbs: ["get", "list", "watch", "update"]
```

</div>

<div v-click="2" class="mt-6 text-center text-lg text-red-400">
<carbon-warning class="inline-block text-3xl" /> Operators have significant cluster privileges
</div>

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
<div v-click="3">
<carbon-user class="text-3xl text-blue-400 mb-2" />
<strong>ServiceAccounts</strong><br/>
Minimal permissions
</div>
<div v-click="4">
<carbon-security class="text-3xl text-yellow-400 mb-2" />
<strong>Review permissions</strong><br/>
Before installation
</div>
</div>

---
layout: center
---

# Building vs Using Operators

<div v-click="1">

```mermaid
graph LR
    D[Decision] --> U[Use Existing<br/>Operators]
    D --> B[Build Custom<br/>Operators]
    U --> P[Popular apps]
    U --> C[Community-maintained]
    B --> I[Internal apps]
    B --> S[Specific needs]
    style D fill:#60a5fa
    style U fill:#4ade80
    style B fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="2">
<carbon-download class="text-4xl text-green-400 mb-2" />
<strong>Use existing</strong><br/>
<span class="text-sm opacity-80">Databases, queues, monitoring</span>
</div>
<div v-click="3">
<carbon-edit class="text-4xl text-yellow-400 mb-2" />
<strong>Build custom</strong><br/>
<span class="text-sm opacity-80">Internal apps, unique logic</span>
</div>
</div>

<div v-click="4" class="mt-8 text-center text-sm opacity-80">
Tools: Operator SDK, Kubebuilder, KUDO
</div>

---
layout: center
---

# Operators and CKAD

<div v-click="1">

```mermaid
graph TB
    E[CKAD Exam] --> R[Required<br/>CRDs & Custom Resources]
    E --> A[Advanced<br/>Building Operators]
    R --> C[Create resources]
    R --> L[List resources]
    R --> D[Describe resources]
    style E fill:#60a5fa
    style R fill:#4ade80
    style A fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8">
<div v-click="2">
<carbon-checkmark class="text-4xl text-green-400 mb-2" />
<strong>CKAD Required</strong><br/>
<span class="text-sm opacity-80">Work with CRDs and custom resources</span>
</div>
<div v-click="3">
<carbon-close class="text-4xl text-red-400 mb-2" />
<strong>Beyond CKAD</strong><br/>
<span class="text-sm opacity-80">Building operators, complex development</span>
</div>
</div>

<div v-click="4" class="mt-8 text-center text-lg">
<carbon-education class="inline-block text-3xl text-blue-400" /> Focus: Be a user of operators, not a developer
</div>

---
layout: center
---

# Summary

<div v-click="1">

```mermaid
mindmap
  root((Operators))
    Pattern
      Custom Resources
      Controllers
    Extends Kubernetes
      Application intelligence
      Operational automation
    CRDs
      Schema definition
      CKAD-relevant
    Use Cases
      Databases
      Message queues
      Monitoring
      Certificates
    CKAD Focus
      Create resources
      List describe
      Troubleshoot
```

</div>

---
layout: center
---

# Key Takeaways

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="1">
<carbon-settings class="text-4xl text-blue-400 mb-2" />
<strong>Operator pattern</strong><br/>
<span class="text-sm opacity-80">CRDs + Controllers = automation</span>
</div>
<div v-click="2">
<carbon-api class="text-4xl text-green-400 mb-2" />
<strong>Extends Kubernetes</strong><br/>
<span class="text-sm opacity-80">Application-specific intelligence</span>
</div>
<div v-click="3">
<carbon-document class="text-4xl text-purple-400 mb-2" />
<strong>CRDs are CKAD</strong><br/>
<span class="text-sm opacity-80">Practice creating custom resources</span>
</div>
<div v-click="4">
<carbon-education class="text-4xl text-yellow-400 mb-2" />
<strong>User, not builder</strong><br/>
<span class="text-sm opacity-80">Work with operators, don't build them</span>
</div>
</div>

<div v-click="5" class="mt-8 text-center text-lg">
Operators simplify complex application management <carbon-arrow-right class="inline-block text-2xl" />
</div>
