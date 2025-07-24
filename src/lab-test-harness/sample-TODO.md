# Lab Test Issues

Generated: 2025-01-24T15:30:00.000Z
Lab: pods

## ❌ Errors (2)

### Error 1: Working with Pods

**Command:** `kubectl exec sleep -- curl -s 10.244.0.5`

**Error:** Command failed

**Time:** 2025-01-24T15:25:30.000Z

**Block ID:** 13

**Investigation needed:**
- [ ] Check if command syntax is correct
- [ ] Verify prerequisites are met
- [ ] Check if resources exist
- [ ] Validate cluster state

---

### Error 2: Cleanup

**Command:** `kubectl delete pod sleep whoami sleep-lab`

**Error:** pod "sleep-lab" not found

**Time:** 2025-01-24T15:28:45.000Z

**Block ID:** 14

**Investigation needed:**
- [ ] Check if command syntax is correct
- [ ] Verify prerequisites are met
- [ ] Check if resources exist
- [ ] Validate cluster state

---

## ⚠️ Warnings (1)

### Warning 1: Working with Pods

**Command:** `kubectl get pods`

**Warning:** No resources found in default namespace

**Time:** 2025-01-24T15:22:15.000Z

**Block ID:** 3

**Review needed:**
- [ ] Check if this is expected behavior
- [ ] Verify if documentation needs updates

---

## 🔧 Resolution Checklist

- [ ] All errors have been investigated
- [ ] Commands have been tested manually
- [ ] Lab documentation has been updated if needed
- [ ] Prerequisites section is accurate
- [ ] Cleanup instructions work correctly

## 📋 Lab Test Summary

- **Total Errors:** 2
- **Total Warnings:** 1
- **Test Date:** 2025-01-24T15:20:00.000Z
- **Lab Path:** `/Users/elton/scm/github/courselabs/kubernetes/labs/pods/README.md`