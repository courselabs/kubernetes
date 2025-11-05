# Narration Scripts for Kubernetes CKAD Labs

This directory contains professional narration scripts for video tutorials covering the Kubernetes CKAD labs.

## Overview

Each lab has three narration scripts following a consistent structure:

1. **intro.md** - Concept slideshow (8-12 minutes)
   - Theoretical foundation
   - Key concepts and terminology
   - Why the topic matters
   - Visual/slide-based presentation

2. **exercises.md** - Practical demo (12-18 minutes)
   - Hands-on walkthrough following the lab README.md
   - Live terminal demonstrations
   - Step-by-step command execution
   - Troubleshooting and explanations

3. **ckad.md** - CKAD exam preparation (15-25 minutes)
   - Exam-focused training following lab CKAD.md
   - Time-saving techniques
   - Common exam patterns
   - Quick reference commands
   - Practice scenarios

## Completed Labs

### Newly Created Scripts (7 labs, 21 scripts)

1. **affinity/** - Pod Scheduling with Affinity
   - intro.md (10-12 min): Node affinity, pod affinity/anti-affinity, taints and tolerations
   - exercises.md (15-18 min): Multi-node cluster, affinity demonstrations
   - ckad.md (20-25 min): Exam patterns, troubleshooting, decision trees

2. **api-versions/** - API Versions and Deprecations
   - intro.md (8-10 min): API versioning, deprecations, upgrades
   - exercises.md (12-15 min): API discovery, kubectl convert, migrations
   - ckad.md (15-20 min): Quick version lookups, fixing deprecated APIs

3. **admission/** - Admission Control
   - intro.md (10-12 min): Admission controllers, webhooks, validation
   - exercises.md (15-18 min): Custom webhooks, OPA Gatekeeper
   - ckad.md (18-22 min): Pod Security Standards, troubleshooting

4. **clusters/** - Kubernetes Clusters
   - intro.md (8-10 min): Cluster architecture, components, setup options
   - exercises.md (12-15 min): Multi-node clusters, taints, maintenance
   - ckad.md (15-20 min): Node operations, cordon/drain workflows

5. **docker/** - Container Images and Dockerfiles
   - intro.md (10-12 min): Containers, images, Docker basics, multi-stage builds
   - exercises.md (15-18 min): Building images, tagging, deploying to Kubernetes
   - ckad.md (15-20 min): Quick Dockerfile patterns, image troubleshooting

6. **nodes/** - Examining Nodes with Kubectl
   - intro.md (8-10 min): Node management, labels, kubectl queries
   - exercises.md (12-15 min): Node information, labels, output formatting
   - ckad.md (15-18 min): Speed queries, troubleshooting node issues

7. **tools/** - kubectl and Productivity Tools
   - intro.md (8-10 min): kubectl, useful tools, plugins, productivity
   - exercises.md (12-15 min): Autocomplete, aliases, imperative commands
   - ckad.md (15-18 min): Time-saving techniques, exam strategies

## Script Features

### Professional Style
- Clear timing guides with timestamps
- Section markers for easy navigation
- Code blocks with proper syntax
- Practical examples and demonstrations
- Exam tips and strategies

### Timing Guidelines
- **intro.md**: Concept-focused, 8-12 minutes
- **exercises.md**: Hands-on practice, 12-18 minutes
- **ckad.md**: Exam preparation, 15-25 minutes depending on complexity

### Structure
Each script follows a consistent format:
- Title and purpose statement
- Timed sections with clear transitions
- Command examples with expected output
- Explanations of what's happening
- Summary and key takeaways

## Usage

These narration scripts are designed for:

1. **Video Recording**: Read directly while recording screencasts
2. **Live Presentations**: Use as speaking notes for training sessions
3. **Self-Study**: Follow along as a structured learning guide
4. **Content Planning**: Template for creating similar educational content

## File Organization

```
narration-scripts/
├── affinity/
│   ├── intro.md (12K)
│   ├── exercises.md (12K)
│   └── ckad.md (17K)
├── api-versions/
│   ├── intro.md (13K)
│   ├── exercises.md (9K)
│   └── ckad.md (9K)
├── admission/
│   ├── intro.md (13K)
│   ├── exercises.md (5K)
│   └── ckad.md (6K)
├── clusters/
│   ├── intro.md (4K)
│   ├── exercises.md (3K)
│   └── ckad.md (4K)
├── docker/
│   ├── intro.md (6K)
│   ├── exercises.md (3K)
│   └── ckad.md (5K)
├── nodes/
│   ├── intro.md (4K)
│   ├── exercises.md (3K)
│   └── ckad.md (5K)
└── tools/
    ├── intro.md (4K)
    ├── exercises.md (4K)
    └── ckad.md (6K)
```

## Quality Standards

All scripts maintain:
- Professional narration style
- Clear technical explanations
- Accurate command syntax
- Practical examples
- CKAD exam relevance
- Consistent formatting
- Appropriate pacing

## Total Content

- **7 labs covered**
- **21 narration scripts** (3 per lab)
- **~300 minutes** of narrated content
- Professional quality suitable for video production

## Notes

- Scripts reference lab materials in `/home/user/kubernetes-ckad/labs/`
- Commands assume standard Kubernetes cluster setup
- Timing estimates based on normal speaking pace
- CKAD scripts focus on exam-relevant topics

---

Created: 2025-11-05
Purpose: Professional narration scripts for CKAD video tutorials
Status: Complete - Ready for video production
