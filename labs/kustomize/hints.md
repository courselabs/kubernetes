# Lab Hints

## Creating the QA Overlay

The lab asks you to create a new overlay for a QA environment. Here are some hints to guide you:

### Directory Structure

You'll need to create:
- A new directory: `labs/kustomize/specs/overlays/qa/`
- A kustomization.yaml file in that directory

### Kustomization File Structure

Your `kustomization.yaml` needs to:

1. **Reference the base**
   ```yaml
   resources:
     - ../../base
   ```

2. **Set the namespace**
   ```yaml
   namespace: qa
   ```

3. **Add a name prefix**
   ```yaml
   namePrefix: qa-
   ```

4. **Override replicas**
   Look at the staging overlay to see how to set replicas

5. **Add custom labels**
   Look at how other overlays use `commonLabels`

6. **Change the image tag**
   Look at how staging and prod use the `images` field

### Applying the Overlay

Remember to:
1. Create the namespace first: `kubectl create namespace qa`
2. Apply the kustomization: `kubectl apply -k labs/kustomize/specs/overlays/qa`

### Verification

Check your work:
```bash
kubectl get all -n qa
kubectl get deploy -n qa -o wide
kubectl describe deploy -n qa qa-whoami
```

If you're stuck, check the solution file!
