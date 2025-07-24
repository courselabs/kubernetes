# Test Lab for PowerShell Parsing

This is a test README to verify the parser only picks up PowerShell code blocks.

## Setup

This bash block should be ignored:

```bash
kubectl get nodes
kubectl get pods
```

This generic block should also be ignored:

```
apiVersion: v1
kind: Pod
metadata:
  name: test
```

## PowerShell Commands

This PowerShell block should be executed:

```powershell
kubectl get nodes
kubectl exec -it sleep -- sh
kubectl exec whoami -- date
kubectl get pods --all-namespaces
Write-Host "Testing PowerShell execution"
$pods = kubectl get pods -o json | ConvertFrom-Json
```

## More Examples

Another bash block to ignore:

```bash
curl localhost:8080
echo "This should not run"
```

Another PowerShell block to execute:

```powershell
# Get cluster info
kubectl cluster-info
Get-Date
Write-Output "PowerShell commands work!"
```

## YAML Example

This should be ignored (no language specified):

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-deployment
spec:
  replicas: 3
```

## Final PowerShell Commands

```powershell
kubectl apply -f test.yaml
Test-Path "config.json"
Remove-Item "temp.txt" -ErrorAction SilentlyContinue
```

## Cleanup

Regular cleanup commands (should be ignored):

```bash
kubectl delete all --all
```