---
layout: cover
---

# Helm

<div class="abs-br m-6 flex gap-2">
  <carbon-container-software class="text-6xl text-blue-400" />
</div>

<div v-click="1" class="mt-8 text-xl opacity-80">
The package manager for Kubernetes
</div>

<div v-click="2" class="mt-6 text-lg">
<carbon-document class="inline-block text-xl text-yellow-400" /> CKAD Supplementary Material
</div>

<div v-click="3" class="mt-4 text-sm opacity-60">
May appear on exam • Essential for real-world deployments
</div>

---
layout: center
---

# The Challenge Without Helm

<div v-click="1">

```mermaid
graph TB
    A[Application] --> D[Dev YAML]
    A --> S[Staging YAML]
    A --> P[Prod YAML]
    D --> I1[Duplication]
    S --> I2[Manual updates]
    P --> I3[No versioning]
    style A fill:#60a5fa
    style D fill:#fbbf24
    style S fill:#fbbf24
    style P fill:#fbbf24
    style I1 fill:#ef4444
    style I2 fill:#ef4444
    style I3 fill:#ef4444
```

</div>

<div class="grid grid-cols-2 gap-6 mt-8 text-sm">
<div v-click="2">
<carbon-document class="text-3xl text-red-400 mb-2" />
Duplicate YAML for each environment
</div>
<div v-click="3">
<carbon-edit class="text-3xl text-yellow-400 mb-2" />
Manual config updates
</div>
<div v-click="4">
<carbon-version class="text-3xl text-purple-400 mb-2" />
No easy rollbacks
</div>
<div v-click="5">
<carbon-share class="text-3xl text-blue-400 mb-2" />
Difficult to share apps
</div>
</div>

<div v-click="6" class="mt-6 text-center text-green-400">
<carbon-checkmark class="inline-block text-2xl" /> Helm solves all these challenges
</div>

---
layout: center
---

# What is Helm?

<div v-click="1" class="mb-6">

```mermaid
graph LR
    H["Helm<br/>Package Manager"] --> T[Templating]
    H --> V[Variables]
    H --> L[Lifecycle]
    T --> K[Kubernetes YAML]
    V --> K
    L --> K
    style H fill:#60a5fa
    style T fill:#4ade80
    style V fill:#4ade80
    style L fill:#4ade80
    style K fill:#a78bfa
```

</div>

<div class="grid grid-cols-2 gap-6">
<div v-click="2">
<carbon-settings class="text-4xl text-blue-400 mb-2" />
<strong>Like apt, yum, brew</strong><br/>
<span class="text-sm opacity-80">But for Kubernetes</span>
</div>
<div v-click="3">
<carbon-terminal class="text-4xl text-green-400 mb-2" />
<strong>CLI tool</strong><br/>
<span class="text-sm opacity-80">No server required (v3+)</span>
</div>
</div>

<div v-click="4" class="mt-6 text-center text-yellow-400">
<carbon-checkmark class="inline-block text-2xl" /> Works with standard Kubernetes resources
</div>

---
layout: center
---

# Helm Architecture

<div v-click="1">

```mermaid
graph LR
    H[Helm CLI] --> K[kubeconfig]
    K --> A[Kubernetes API]
    H --> P1[1. Process Templates]
    P1 --> P2[2. Generate YAML]
    P2 --> P3[3. Apply to cluster]
    P3 --> A
    A --> S[Store Metadata<br/>in Secrets]
    style H fill:#60a5fa
    style P1 fill:#4ade80
    style P2 fill:#4ade80
    style P3 fill:#4ade80
    style A fill:#a78bfa
    style S fill:#fbbf24
```

</div>

<div v-click="2" class="mt-6 text-center opacity-80">
Uses same kubeconfig as kubectl
</div>

<div class="grid grid-cols-3 gap-4 mt-6 text-sm">
<div v-click="3" class="text-center">
<carbon-template class="text-3xl text-green-400 mb-1" />
<strong>Process</strong><br/>
Templates + Values
</div>
<div v-click="4" class="text-center">
<carbon-document class="text-3xl text-blue-400 mb-1" />
<strong>Generate</strong><br/>
Standard YAML
</div>
<div v-click="5" class="text-center">
<carbon-kubernetes class="text-3xl text-purple-400 mb-1" />
<strong>Deploy</strong><br/>
To cluster
</div>
</div>

---
layout: center
---

# Core Concepts: Charts

<div v-click="1">

```mermaid
graph TB
    C[Chart Package] --> M[Chart.yaml<br/>Metadata]
    C --> V[values.yaml<br/>Default values]
    C --> T[templates/<br/>YAML Templates]
    C --> R[README.md<br/>Documentation]
    style C fill:#60a5fa
    style M fill:#4ade80
    style V fill:#fbbf24
    style T fill:#a78bfa
    style R fill:#ef4444
```

</div>

<div v-click="2" class="mt-8 text-center text-lg opacity-80">
Everything needed to deploy an application
</div>

<div class="grid grid-cols-3 gap-4 mt-6 text-sm">
<div v-click="3" class="text-center">
<carbon-folder class="text-3xl text-green-400 mb-1" />
Local directories
</div>
<div v-click="4" class="text-center">
<carbon-archive class="text-3xl text-yellow-400 mb-1" />
Tar.gz archives
</div>
<div v-click="5" class="text-center">
<carbon-cloud class="text-3xl text-purple-400 mb-1" />
Remote repositories
</div>
</div>

<div v-click="6" class="mt-6 text-center text-green-400">
<carbon-checkmark class="inline-block text-2xl" /> Charts contain templates, not images
</div>

---
layout: center
---

# Core Concepts: Values

<div v-click="1" class="mb-4">

```yaml
# values.yaml
replicaCount: 3
image:
  repository: nginx
  tag: "1.21"
service:
  type: LoadBalancer
  port: 80
```

</div>

<div v-click="2">

```mermaid
graph LR
    D[Default values.yaml] --> O1[--set replicas=5]
    D --> O2[-f custom.yaml]
    O1 --> F[Final Config]
    O2 --> F
    style D fill:#4ade80
    style O1 fill:#60a5fa
    style O2 fill:#60a5fa
    style F fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
<div v-click="3">
<carbon-settings class="text-3xl text-blue-400 mb-1" />
<strong>Override with --set</strong><br/>
helm install --set replicas=5
</div>
<div v-click="4">
<carbon-document class="text-3xl text-green-400 mb-1" />
<strong>Custom values file</strong><br/>
helm install -f prod-values.yaml
</div>
</div>

<div v-click="5" class="mt-6 text-center text-purple-400">
<carbon-flow class="inline-block text-2xl" /> Separation makes charts reusable
</div>

---
layout: center
---

# Core Concepts: Templates

<div v-click="1" class="mb-4">

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

</div>

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="2">
<carbon-template class="text-4xl text-blue-400 mb-2" />
<strong>Go Template Syntax</strong><br/>
<span class="text-sm opacity-80">{{ .Values.field }}</span>
</div>
<div v-click="3">
<carbon-flow class="text-4xl text-green-400 mb-2" />
<strong>Built-in Objects</strong><br/>
<span class="text-sm opacity-80">.Release .Chart .Values</span>
</div>
</div>

<div v-click="4" class="mt-6 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> For CKAD: Read templates, provide values
</div>

---
layout: center
---

# Core Concepts: Releases

<div v-click="1">

```mermaid
graph TB
    CH["Chart:<br/>wordpress"] --> R1["Release:<br/>blog-prod"]
    CH --> R2["Release:<br/>blog-staging"]
    CH --> R3["Release:<br/>docs-prod"]
    R1 --> N1[Production namespace]
    R2 --> N2[Staging namespace]
    R3 --> N3[Production namespace]
    style CH fill:#60a5fa
    style R1 fill:#4ade80
    style R2 fill:#4ade80
    style R3 fill:#4ade80
```

</div>

<div v-click="2" class="mt-8 text-center opacity-80">
One chart can create multiple releases
</div>

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="3" class="text-center">
<carbon-package class="text-4xl text-blue-400 mb-1" />
<strong>Chart</strong><br/>
<span class="text-sm opacity-80">Application package</span>
</div>
<div v-click="4" class="text-center">
<carbon-deployment-pattern class="text-4xl text-green-400 mb-1" />
<strong>Release</strong><br/>
<span class="text-sm opacity-80">Running instance</span>
</div>
</div>

<div v-click="5" class="mt-6 text-center text-purple-400">
<carbon-tag class="inline-block text-2xl" /> Release name used in Kubernetes object names
</div>

---
layout: center
---

# Chart Repositories

<div v-click="1">

```mermaid
graph TB
    R[Chart Repositories] --> A[Artifact Hub<br/>artifacthub.io]
    R --> B[Bitnami<br/>charts.bitnami.com]
    R --> P[Project Repos<br/>Prometheus, Nginx, etc]
    R --> PR[Private Repos<br/>Harbor, ChartMuseum]
    style R fill:#60a5fa
    style A fill:#4ade80
    style B fill:#4ade80
    style P fill:#4ade80
    style PR fill:#fbbf24
```

</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div v-click="2">
<carbon-terminal class="inline-block text-2xl text-blue-400" /> helm repo add
</div>
<div v-click="3">
<carbon-renew class="inline-block text-2xl text-green-400" /> helm repo update
</div>
<div v-click="4">
<carbon-search class="inline-block text-2xl text-purple-400" /> helm search repo
</div>
<div v-click="5">
<carbon-view class="inline-block text-2xl text-yellow-400" /> helm show values
</div>
</div>

<div v-click="6" class="mt-8 text-center opacity-80">
HTTP servers hosting packaged charts
</div>

---
layout: center
---

# Helm Lifecycle Operations

<div v-click="1">

```mermaid
stateDiagram-v2
    [*] --> Install
    Install --> Running
    Running --> Upgrade
    Upgrade --> Running
    Running --> Rollback
    Rollback --> Running
    Running --> Uninstall
    Uninstall --> [*]
```

</div>

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div v-click="2">
<carbon-add class="inline-block text-2xl text-green-400" /> <strong>install:</strong> Deploy new release
</div>
<div v-click="3">
<carbon-upgrade class="inline-block text-2xl text-blue-400" /> <strong>upgrade:</strong> Update existing release
</div>
<div v-click="4">
<carbon-reset class="inline-block text-2xl text-yellow-400" /> <strong>rollback:</strong> Revert to previous revision
</div>
<div v-click="5">
<carbon-list class="inline-block text-2xl text-purple-400" /> <strong>list:</strong> Show all releases
</div>
<div v-click="6">
<carbon-information class="inline-block text-2xl text-teal-400" /> <strong>status:</strong> Display release status
</div>
<div v-click="7">
<carbon-close class="inline-block text-2xl text-red-400" /> <strong>uninstall:</strong> Remove release
</div>
</div>

---
layout: center
---

# Install and Upgrade

<div v-click="1" class="mb-4">

```bash
# Install new release
helm install myapp bitnami/nginx --set replicas=3

# Install with custom values file
helm install myapp bitnami/nginx -f prod-values.yaml

# Upgrade with new values
helm upgrade myapp bitnami/nginx --set replicas=5

# Install or upgrade (idempotent)
helm upgrade --install myapp bitnami/nginx
```

</div>

<div v-click="2">

```mermaid
graph LR
    I[Install] --> R1[Revision 1]
    R1 --> U1[Upgrade]
    U1 --> R2[Revision 2]
    R2 --> U2[Upgrade]
    U2 --> R3[Revision 3]
    style I fill:#4ade80
    style U1 fill:#60a5fa
    style U2 fill:#60a5fa
    style R1 fill:#fbbf24
    style R2 fill:#fbbf24
    style R3 fill:#fbbf24
```

</div>

<div v-click="3" class="mt-6 text-center text-sm">
<carbon-version class="inline-block text-2xl text-purple-400" /> Each upgrade creates a new revision
</div>

---
layout: center
---

# Rollback and History

<div v-click="1" class="mb-4">

```bash
# View release history
helm history myapp

# Rollback to previous revision
helm rollback myapp

# Rollback to specific revision
helm rollback myapp 2
```

</div>

<div v-click="2">

```mermaid
graph TB
    H[Release History] --> R1[Revision 1: v1.0]
    H --> R2[Revision 2: v1.1]
    H --> R3[Revision 3: v1.2<br/>Issue detected!]
    R3 --> RB[Rollback to 2]
    RB --> R4[Revision 4: v1.1]
    style H fill:#60a5fa
    style R3 fill:#ef4444
    style RB fill:#fbbf24
    style R4 fill:#4ade80
```

</div>

<div v-click="3" class="mt-6 text-center opacity-80">
Rollback creates a new revision
</div>

<div v-click="4" class="mt-2 text-center text-green-400">
<carbon-checkmark class="inline-block text-2xl" /> Complete revision history preserved
</div>

---
layout: center
---

# When to Use Helm

<div class="grid grid-cols-2 gap-6 mt-4">
<div v-click="1">
<carbon-checkmark class="text-5xl text-green-400 mb-2" />
<strong>Best Use Cases</strong><br/>
<span class="text-sm opacity-80">• Third-party applications<br/>• Complex applications<br/>• Multiple environments<br/>• Sharing across teams<br/>• Frequent upgrades</span>
</div>
<div v-click="2">
<carbon-help class="text-5xl text-yellow-400 mb-2" />
<strong>Consider Alternatives</strong><br/>
<span class="text-sm opacity-80">• Very simple apps<br/>• Template-free preference<br/>• Team lacks Go template knowledge<br/>• Need GitOps workflows</span>
</div>
</div>

<div v-click="3" class="mt-8 text-center text-lg">
<carbon-flow class="inline-block text-3xl text-blue-400" /> Many teams use Helm + Kustomize together
</div>

<div v-click="4" class="mt-4 text-center text-sm opacity-80">
Helm for third-party apps • Kustomize for custom apps
</div>

---
layout: center
---

# Helm and CKAD

<div v-click="1" class="text-center mb-6">
<carbon-certificate class="inline-block text-6xl text-blue-400" />
</div>

<div class="grid grid-cols-2 gap-4 text-sm">
<div v-click="2">
<carbon-terminal class="inline-block text-2xl text-green-400" /> Install Helm CLI
</div>
<div v-click="3">
<carbon-add class="inline-block text-2xl text-green-400" /> Install charts with custom values
</div>
<div v-click="4">
<carbon-settings class="inline-block text-2xl text-green-400" /> Use --set to override values
</div>
<div v-click="5">
<carbon-upgrade class="inline-block text-2xl text-green-400" /> Upgrade releases
</div>
<div v-click="6">
<carbon-reset class="inline-block text-2xl text-green-400" /> Rollback to previous revisions
</div>
<div v-click="7">
<carbon-list class="inline-block text-2xl text-green-400" /> List and view status
</div>
<div v-click="8">
<carbon-view class="inline-block text-2xl text-green-400" /> Inspect generated YAML
</div>
<div v-click="9">
<carbon-timer class="inline-block text-2xl text-yellow-400" /> Practice for speed
</div>
</div>

<div v-click="10" class="mt-8 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> Remember: helm uninstall removes all resources
</div>

---
layout: center
---

# Summary

<div v-click="1">

```mermaid
mindmap
  root((Helm))
    Package Manager
      Like apt/yum
      For Kubernetes
      CLI tool v3+
    Charts
      Templates
      Values
      Metadata
      Portable
    Releases
      Chart instances
      Named deployments
      Revision history
    Repositories
      Artifact Hub
      Bitnami
      Private repos
    Lifecycle
      install upgrade
      rollback uninstall
      list status
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Templating and packaging for Kubernetes
</div>

<div v-click="3" class="mt-2 text-center text-lg">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Reusable charts across environments
</div>
