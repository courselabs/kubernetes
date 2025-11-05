# Examining Nodes - CKAD Exam Preparation
## Narration Script for Exam-Focused Training (15-18 minutes)

### Section 1: CKAD Node Query Requirements (2 min)
**[00:00-02:00]**

CKAD tests your ability to query cluster state efficiently. Node operations appear in troubleshooting scenarios.

Essential commands (memorize these):

Time target: Answer any node query in <30 seconds.

### Section 2: Quick Node Information Lookup (3 min)
**[02:00-05:00]**

**Find node capacity**:

**Find CPU count**:

**Find memory**:

**Find container runtime**:

**Find OS/arch**:

Practice until you can run these without thinking.

### Section 3: Node Labels for Scheduling (3 min)
**[05:00-08:00]**

Labels critical for Pod placement.

**View labels**:

**Add label**:

**Update label** (requires --overwrite):

**Remove label**:

**Find nodes with label**:

Use in Pod spec:

### Section 4: Troubleshooting with Node Information (3 min)
**[08:00-11:00]**

**Scenario: Pod stuck in Pending**

Check node capacity:

Shows CPU/memory usage percentages. If at 100%, node is full.

Check node conditions:

Look for MemoryPressure, DiskPressure, or Ready=False.

Check if nodes match selectors:

Check node taints:

### Section 5: Output Formatting for Speed (2 min)
**[11:00-13:00]**

JSONPath for quick answers:

Custom columns:

Saves time in exam scenarios requiring specific node information.

### Section 6: Common Exam Patterns (3 min)
**[13:00-16:00]**

**Pattern 1**: Find nodes with specific label

**Pattern 2**: Label a node

**Pattern 3**: Find node capacity

**Pattern 4**: Check if node ready

**Pattern 5**: Find which nodes are schedulable

### Section 7: Exam Tips (2 min)
**[16:00-18:00]**

**Speed tips**:
- Use short commands:  (alias for nodes)
- Tab completion for node names
- Pipe to grep for specific info
- Remember JSONPath patterns for complex queries

**Common mistakes**:
- Forgetting quotes in -L with slashes: 
- Not checking node status before troubleshooting Pods
- Typing full commands when aliases work

**Practice drill**: 
1. List nodes (<5 sec)
2. Find CPU capacity (<15 sec)
3. Check node labels (<10 sec)
4. Label a node (<10 sec)
5. Find nodes with specific label (<15 sec)

Total: <60 seconds for all operations.

**Checklist**:
- [ ] Can list nodes quickly
- [ ] Can find node capacity
- [ ] Can view and add labels
- [ ] Can use JSONPath for queries
- [ ] Can use describe for troubleshooting
- [ ] Know standard node labels

Master these, and node operations won't slow you down in the exam.
