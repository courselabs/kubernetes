---
layout: cover
---

# Kustomize

<div class="abs-br m-6 flex gap-2">
  <carbon-settings class="text-6xl text-blue-400" />
</div>

<div v-click="1" class="mt-8 text-xl opacity-80">
Template-free configuration management for Kubernetes
</div>

<div v-click="2" class="mt-6 text-lg">
<carbon-certificate class="inline-block text-xl text-green-400" /> Required topic for CKAD exam
</div>

<div v-click="3" class="mt-4 text-sm opacity-60">
Built into kubectl • Essential for multi-environment configs
</div>

---
layout: center
---

# Configuration Management Challenge

<div v-click="1">

```mermaid
graph TB
    A[Same Application] --> D[Dev: 1 replica, NodePort]
    A --> S[Staging: 3 replicas, LoadBalancer]
    A --> P[Prod: 5 replicas, limits]
    D --> I1[Duplicate YAML]
    S --> I2[Configuration drift]
    P --> I3[Manual sync]
    style A fill:#60a5fa
    style D fill:#fbbf24
    style S fill:#fbbf24
    style P fill:#fbbf24
    style I1 fill:#ef4444
    style I2 fill:#ef4444
    style I3 fill:#ef4444
```

</div>

<div class="grid grid-cols-3 gap-4 mt-8 text-sm">
<div v-click="2" class="text-center">
<carbon-copy class="text-3xl text-red-400 mb-1" />
Duplicate files
</div>
<div v-click="3" class="text-center">
<carbon-warning class="text-3xl text-yellow-400 mb-1" />
Config drift
</div>
<div v-click="4" class="text-center">
<carbon-sync class="text-3xl text-purple-400 mb-1" />
Manual sync
</div>
</div>

<div v-click="5" class="mt-6 text-center text-green-400">
<carbon-checkmark class="inline-block text-2xl" /> Kustomize solves with overlays
</div>

---
layout: center
---

# What is Kustomize?

<div v-click="1" class="mb-6">

```mermaid
graph LR
    K[Kustomize] --> T[Template-free]
    K --> B[Built into kubectl]
    K --> O[Overlay-based]
    K --> D[Declarative YAML]
    T --> Y[Standard YAML]
    B --> Y
    O --> Y
    D --> Y
    style K fill:#60a5fa
    style T fill:#4ade80
    style B fill:#4ade80
    style O fill:#4ade80
    style D fill:#4ade80
```

</div>

<div v-click="2" class="mt-6 text-center opacity-80">
Define base, then create overlays for environments
</div>

<div class="grid grid-cols-2 gap-6 mt-6">
<div v-click="3">
<carbon-terminal class="text-4xl text-blue-400 mb-2" />
<strong>Built into kubectl</strong><br/>
<span class="text-sm opacity-80">No installation (v1.14+)</span>
</div>
<div v-click="4">
<carbon-document class="text-4xl text-green-400 mb-2" />
<strong>Pure YAML</strong><br/>
<span class="text-sm opacity-80">No template syntax</span>
</div>
</div>

<div v-click="5" class="mt-6 text-center text-yellow-400">
<carbon-virtual-machine class="inline-block text-2xl" /> Processes in memory, files stay clean
</div>

---
layout: center
---

# Kustomize vs Helm

<div class="grid grid-cols-2 gap-6 mt-4">
<div v-click="1">
<carbon-settings class="text-5xl text-blue-400 mb-2" />
<strong>Kustomize</strong><br/>
<span class="text-sm opacity-80">• Simpler learning curve<br/>• Built into kubectl<br/>• Template-free<br/>• Environment configs<br/>• <strong>CKAD required</strong></span>
</div>
<div v-click="2">
<carbon-container-software class="text-5xl text-green-400 mb-2" />
<strong>Helm</strong><br/>
<span class="text-sm opacity-80">• Package distribution<br/>• Chart versioning<br/>• Complex templates<br/>• Third-party apps<br/>• CKAD supplementary</span>
</div>
</div>

<div v-click="3" class="mt-8 text-center text-lg">
<carbon-flow class="inline-block text-3xl text-purple-400" /> Many teams use both!
</div>

<div v-click="4" class="mt-4 text-center text-sm opacity-80">
Helm for third-party apps • Kustomize for own applications
</div>

---
layout: center
---

# Core Concept: Base

<div v-click="1" class="mb-4">

```
base/
├── kustomization.yaml
├── deployment.yaml
└── service.yaml
```

</div>

<div v-click="2" class="mb-4 text-xs">

```yaml
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
```

</div>

<div v-click="3">

```mermaid
graph TB
    B[Base Configuration] --> C[Common to all environments]
    C --> G[Generic/Default values]
    G --> N[No environment specifics]
    style B fill:#60a5fa
    style C fill:#4ade80
    style G fill:#4ade80
    style N fill:#4ade80
```

</div>

<div v-click="4" class="mt-6 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> Base should work in ANY environment
</div>

---
layout: center
---

# Core Concept: Overlays

<div v-click="1" class="mb-4">

```
overlays/
├── dev/
│   └── kustomization.yaml
├── staging/
│   └── kustomization.yaml
└── prod/
    ├── kustomization.yaml
    └── resources-patch.yaml
```

</div>

<div v-click="2" class="text-xs mb-4">

```yaml
# overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namePrefix: prod-
namespace: production
replicas:
  - name: myapp
    count: 5
```

</div>

<div v-click="3">

```mermaid
graph LR
    B[Base] --> OD[Dev Overlay]
    B --> OS[Staging Overlay]
    B --> OP[Prod Overlay]
    style B fill:#60a5fa
    style OD fill:#4ade80
    style OS fill:#fbbf24
    style OP fill:#ef4444
```

</div>

<div v-click="4" class="mt-6 text-center text-green-400">
<carbon-checkmark class="inline-block text-2xl" /> Each overlay: small, focused on differences
</div>

---
layout: center
---

# Core Concept: Patches

<div v-click="1" class="mb-4 text-xs">

```yaml
# Strategic Merge Patch
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
      - name: myapp
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
```

</div>

<div v-click="2" class="text-xs mb-4">

```yaml
# JSON Patch (RFC 6902)
- op: replace
  path: /spec/replicas
  value: 3
- op: add
  path: /spec/template/spec/containers/0/env/-
  value:
    name: LOG_LEVEL
    value: debug
```

</div>

<div v-click="3">

```mermaid
graph LR
    P[Patch Types] --> S[Strategic Merge<br/>Simple, common]
    P --> J[JSON Patch<br/>Complex scenarios]
    style P fill:#60a5fa
    style S fill:#4ade80
    style J fill:#fbbf24
```

</div>

<div v-click="4" class="mt-4 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> Focus on strategic merge for CKAD
</div>

---
layout: center
---

# Kustomization Features

<div v-click="1" class="text-xs mb-4">

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namePrefix: prod-
nameSuffix: -v2
namespace: production

commonLabels:
  environment: production
  team: backend

images:
  - name: myapp
    newTag: v2.0.1

replicas:
  - name: myapp
    count: 5
```

</div>

<div class="grid grid-cols-3 gap-4 text-xs">
<div v-click="2">
<carbon-text-font class="inline-block text-xl text-blue-400" /> namePrefix/Suffix
</div>
<div v-click="3">
<carbon-folder class="inline-block text-xl text-green-400" /> namespace
</div>
<div v-click="4">
<carbon-tag class="inline-block text-xl text-purple-400" /> commonLabels
</div>
<div v-click="5">
<carbon-image class="inline-block text-xl text-yellow-400" /> images
</div>
<div v-click="6">
<carbon-flow class="inline-block text-xl text-red-400" /> replicas
</div>
</div>

<div v-click="7" class="mt-6 text-center text-green-400">
<carbon-checkmark class="inline-block text-2xl" /> Prefer built-in features over patches
</div>

---
layout: center
---

# ConfigMap and Secret Generators

<div v-click="1" class="text-xs mb-4">

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

configMapGenerator:
  - name: app-config
    literals:
      - LOG_LEVEL=info
      - MAX_CONNECTIONS=100
    files:
      - config.properties

secretGenerator:
  - name: db-credentials
    literals:
      - username=admin
      - password=secret123
```

</div>

<div v-click="2">

```mermaid
graph LR
    G[Generators] --> L[Literals<br/>Key-value pairs]
    G --> F[Files<br/>From disk]
    L --> CM[ConfigMap/Secret]
    F --> CM
    CM --> H[Auto hash suffix]
    style G fill:#60a5fa
    style CM fill:#4ade80
    style H fill:#fbbf24
```

</div>

<div v-click="3" class="mt-6 text-center text-yellow-400">
<carbon-warning class="inline-block text-2xl" /> Generates unique hash suffix for versioning
</div>

---
layout: center
---

# How Kustomize Works

<div v-click="1">

```mermaid
sequenceDiagram
    participant U as kubectl apply -k overlays/prod
    participant K as Kustomize
    participant B as Base
    participant O as Overlay
    participant A as API Server
    U->>K: 1. Process
    K->>B: 2. Read base
    K->>O: 3. Read overlay
    K->>K: 4. Apply transformations
    K->>K: 5. Generate final YAML
    K->>A: 6. kubectl apply
```

</div>

<div v-click="2" class="mt-6 text-center text-xl">
<carbon-virtual-machine class="inline-block text-3xl text-blue-400" /> All processing in memory
</div>

<div v-click="3" class="mt-4 text-center text-sm opacity-80">
Source files remain unchanged • Safe for version control
</div>

---
layout: center
---

# Preview Generated YAML

<div v-click="1" class="mb-4">

```bash
# Preview without applying
kubectl kustomize overlays/prod/

# Apply to cluster
kubectl apply -k overlays/prod/
```

</div>

<div v-click="2">

```mermaid
graph LR
    P[kubectl kustomize] --> Y[Generated YAML]
    A[kubectl apply -k] --> Y
    Y --> C[Cluster]
    style P fill:#60a5fa
    style A fill:#4ade80
    style Y fill:#fbbf24
    style C fill:#a78bfa
```

</div>

<div v-click="3" class="mt-8 text-center">
<carbon-view class="inline-block text-3xl text-green-400" /> Always preview before applying!
</div>

<div v-click="4" class="mt-4 text-center text-sm opacity-80">
Perfect for debugging and validation
</div>

---
layout: center
---

# Kustomize in Practice

<div v-click="1" class="mb-4">

```
.
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── overlays/
    ├── dev/
    │   └── kustomization.yaml
    ├── staging/
    │   ├── kustomization.yaml
    │   └── replica-patch.yaml
    └── prod/
        ├── kustomization.yaml
        ├── replica-patch.yaml
        └── resources-patch.yaml
```

</div>

<div v-click="2" class="text-sm mb-4">

```bash
# Deploy to different environments
kubectl apply -k overlays/dev
kubectl apply -k overlays/staging
kubectl apply -k overlays/prod
```

</div>

<div v-click="3" class="mt-6 text-center">
<carbon-version class="inline-block text-2xl text-purple-400" /> Everything in Git
</div>

<div v-click="4" class="mt-2 text-center text-sm">
<carbon-flow class="inline-block text-xl text-blue-400" /> Perfect for GitOps (ArgoCD, Flux)
</div>

---
layout: center
---

# Best Practices

<div class="grid grid-cols-2 gap-6 mt-4">
<div v-click="1">
<carbon-checkmark class="text-4xl text-green-400 mb-2" />
<strong>Keep base generic</strong><br/>
<span class="text-sm opacity-80">No environment-specific values</span>
</div>
<div v-click="2">
<carbon-layers class="text-4xl text-blue-400 mb-2" />
<strong>Small, focused overlays</strong><br/>
<span class="text-sm opacity-80">Only define differences</span>
</div>
<div v-click="3">
<carbon-settings class="text-4xl text-purple-400 mb-2" />
<strong>Prefer built-ins</strong><br/>
<span class="text-sm opacity-80">Use replicas, images over patches</span>
</div>
<div v-click="4">
<carbon-view class="text-4xl text-yellow-400 mb-2" />
<strong>Test locally</strong><br/>
<span class="text-sm opacity-80">kubectl kustomize before apply</span>
</div>
<div v-click="5">
<carbon-folder class="text-4xl text-red-400 mb-2" />
<strong>Namespace isolation</strong><br/>
<span class="text-sm opacity-80">Different namespace per env</span>
</div>
<div v-click="6">
<carbon-tag class="text-4xl text-teal-400 mb-2" />
<strong>Consistent labeling</strong><br/>
<span class="text-sm opacity-80">Use commonLabels</span>
</div>
</div>

---
layout: center
---

# Kustomize and CKAD

<div v-click="1" class="text-center mb-6">
<carbon-certificate class="inline-block text-6xl text-blue-400" />
</div>

<div class="grid grid-cols-2 gap-4 text-sm">
<div v-click="2">
<carbon-edit class="inline-block text-2xl text-green-400" /> Create kustomization.yaml from scratch
</div>
<div v-click="3">
<carbon-terminal class="inline-block text-2xl text-green-400" /> kubectl apply -k
</div>
<div v-click="4">
<carbon-layers class="inline-block text-2xl text-green-400" /> Base/overlay pattern
</div>
<div v-click="5">
<carbon-settings class="inline-block text-2xl text-green-400" /> Common transformations
</div>
<div v-click="6">
<carbon-document class="inline-block text-2xl text-green-400" /> Strategic merge patches
</div>
<div v-click="7">
<carbon-view class="inline-block text-2xl text-green-400" /> kubectl kustomize preview
</div>
<div v-click="8">
<carbon-warning class="inline-block text-2xl text-yellow-400" /> Required topic!
</div>
<div v-click="9">
<carbon-timer class="inline-block text-2xl text-red-400" /> Practice creating overlays quickly
</div>
</div>

<div v-click="10" class="mt-8 text-center text-xl">
<carbon-checkmark class="inline-block text-3xl text-blue-400" /> More likely than Helm on exam
</div>

---
layout: center
---

# Summary

<div v-click="1">

```mermaid
mindmap
  root((Kustomize))
    Template-free
      Pure YAML
      No special syntax
      Built into kubectl
    Base & Overlays
      Base common
      Overlay customizes
      Small focused changes
    Transformations
      namePrefix namespace
      replicas images
      commonLabels
    Patches
      Strategic merge
      JSON patches
      Fine-grained control
    GitOps
      Everything in Git
      ArgoCD Flux
      Declarative
```

</div>

<div v-click="2" class="mt-8 text-center text-lg">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Configuration management without templates
</div>

<div v-click="3" class="mt-2 text-center text-lg">
<carbon-checkmark class="inline-block text-2xl text-green-400" /> Base + overlays for environments
</div>
