# Lab Solution

The Helm chart has multiple layers of issues that need to be resolved in sequence.

You can make changes in the `labs/troubleshooting-3/specs/app-chart` folder and apply them with the same Helm command:

```
helm upgrade --install broken-app labs/troubleshooting-3/specs/app-chart/ --create-namespace --namespace troubleshooting-3
```

## Phase 1: Helm Template Issues

The chart won't install successfully due to template problems:

1. **Web Deployment selector mismatch**: 
   - Selector: `app: {{ .Release.Name }}-frontend`
   - Pod labels: `app: {{ .Release.Name }}-web`
   - **Fix**: Change selector to match pod labels

2. **Template syntax incorrect**:
   - `ingress-nodeport.yaml` file has incorrect whitepace
   - `{{ - if ... }}` and `{{ - end }}` should not have a space before the hyphen

## Phase 2: StatefulSet Issues (after Helm installs)

Only the web Pods are running.

```
kubectl -n troubleshooting-3 describe sts
```

1. **Volume mount vs claim template name mismatch**:
   - volumeMount name: `db-storage`
   - volumeClaimTemplate name: `postgres-data`
   - **Fix**: Make the names match

## Phase 3: Ingress Access Issues (after StatefulSet works)

1. **Service mismatch**:
   - Ingress binds to `{{ .Release.Name }}-web-service`
   - **Fix**: Change to `{{ .Release.Name }}-web-svc`

## Apply the Fixed Chart

You can replace the broken deployment with a fixed chart:

```
helm uninstall broken-app -n troubleshooting-3

helm upgrade --install fixed-app labs/troubleshooting-3/solution/app-chart/ --create-namespace --namespace troubleshooting-3
```

## Verify Everything Works

```bash
# Check all resources
kubectl get pods,svc,ing,pvc -n troubleshooting-3

# Test the web app through ingress
curl http://whoami.local:8000

# Verify Helm deployment
helm list -n troubleshooting-app
helm get values fixed-app -n troubleshooting-app
```