# kubectl Productivity - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-18 minutes)

### Section 1: CKAD Time Management (2 min)
**[00:00-02:00]**

CKAD: 2 hours, 15-20 questions, ~7-8 minutes per question. kubectl speed is critical.

Time breakdown per question:
- Read/understand: 60 sec
- Plan approach: 30 sec
- Execute: 4-5 min
- Verify: 30-60 sec

Slow kubectl = <4 min execution. Fast kubectl = 5-6 min execution. That's the difference between completing the exam or running out of time.

### Section 2: Essential Speed Commands (3 min)
**[02:00-05:00]**

Memorize these patterns:

**Create resources**:

**Generate YAML**:

**Quick edits**:

### Section 3: Debugging Speed Patterns (3 min)
**[05:00-08:00]**

Standard debug workflow (<2 min per issue):

Most issues solved by describe. Events section shows admission errors, scheduling failures, image pull issues.

**Quick checks**:

### Section 4: Output Formatting for Speed (3 min)
**[08:00-11:00]**

**Common patterns**:

**Filtering**:

**Time-saver**: Use JSONPath or custom-columns instead of parsing YAML manually.

### Section 5: Context and Namespace Efficiency (2 min)
**[11:00-13:00]**

Set namespace immediately:

Saves typing  on every command.

Verify current namespace:

Quick namespace operations:

**Exam tip**: First thing when reading a question - check if it specifies a namespace. Set it immediately.

### Section 6: Exam Scenario Practice (3 min)
**[13:00-16:00]**

**Scenario 1: Deploy and expose** (Target: 2 min)

**Scenario 2: Update image** (Target: 1 min)

**Scenario 3: Debug ImagePullBackOff** (Target: 2 min)

**Scenario 4: ConfigMap and Secret** (Target: 2 min)

Practice these until under target time.

### Section 7: Exam Day Strategy (2 min)
**[16:00-18:00]**

**Before exam**:
- Set up autocomplete
- Create key aliases (if allowed)
- Practice typing without looking

**During exam**:
1. Read question fully
2. Check namespace requirement
3. Use imperative commands when possible
4. --dry-run for complex YAML
5. Verify with quick kubectl get
6. Move on if stuck (flag for review)

**Time allocation**:
- Simple questions (labels, port-forward): 3-4 min
- Medium (deployment, configmap): 5-7 min
- Complex (network policy, multi-resource): 10-12 min

**Common time wasters**:
- Writing YAML from scratch (use generators)
- Reading full YAML output (use JSONPath)
- Not using autocomplete (slow typing)
- Not setting namespace context (typing -n every time)
- Debugging wrong object (check ReplicaSet for Deployment issues)

**Quick wins**:
- kubectl run for single Pods
- kubectl create for standard resources
- kubectl set image for updates
- kubectl describe for debugging
- kubectl explain for syntax

**Checklist**:
- [ ] Can create any resource in <60 sec
- [ ] Can debug any issue in <2 min
- [ ] Know all short resource names
- [ ] Can use JSONPath for queries
- [ ] Have imperative patterns memorized
- [ ] Can set namespace context quickly

Practice until these operations are reflexive. In the exam, your fingers should move before your brain finishes thinking.

Good luck!
