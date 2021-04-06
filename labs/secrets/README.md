# Configuring Apps with Secrets

ConfigMaps are flexible for pretty much any application config system, but they're not suitable for sensitive data. ConfigMap contents are visible in plain text to anyone who has access to your cluster.

For sensitive information Kubernetes has [Secrets](). The API is very similar - you can surface the contents as environment variables or files in the Pod contianer - but there are additional safeguards around Secrets.

## Secrets and Pod YAML - environment variables

Secret values can be base-64 encoded and set in YAML data:

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: configurable-secret-env
data:
  Configurable__Environment: cHJlLXByb2QK
```

The metadata is standard - you'll reference the name of the Secret in the Pod spec to load settings.

* `data` - list of settings as key-value pairs, separated with colons

In the Pod spec you add a reference:

```
spec:
  containers:
    - name: app
      image: sixeyed/configurable:21.04
      envFrom:
        - secretRef:
            name: configurable-secret-env
```

* `envFrom` - load all the values in the source as environment variables

Modelling your app to use Secrets is the same as with ConfigMaps - loading environment variables or mounting volumes.

In the container environment, Secret values are presented as plain text.

## Creating Secrets from encoded YAML

Start by making sure your demo app is up-to-date:

```
kubectl apply -f labs/secrets/specs/configurable
```

Check the details of a ConfigMap and you can see all the values in plain text:

```
kubectl describe cm configurable-env
```

> That's why you don't want sensitive data in there.

This YAML creates a Secret from an encoded value, and loads it into environment variables:

- [secret-encoded.yaml](labs/secrets/specs/configurable/secrets-encoded/secret-encoded.yaml)
- [deployment-env.yaml](labs/secrets/specs/configurable/secrets-encoded/deployment-env.yaml)

```
kubectl apply -f labs/secrets/specs/configurable/secrets-encoded
```

> Browse to the website and you can see the plain-text value for `Configurable:Environment`

## Creating Secrets from plaintext YAML

Encoding to base-64 is awkward and it gives you the illusion your data is safe. Encoding is not encryption, and you can easily decode base-64.

If you want to store sensitive data in plaintext YAML, you can do that instead. You'd only do this when your YAML is locked down:

- [secret-plain.yaml](labs/secrets/specs/configurable/secrets-plain/secret-plain.yaml) - uses `stringData` to store values in plain text
- [deployment-env.yaml](labs/secrets/specs/configurable/secrets-plain/deployment-env.yaml)

```
kubectl apply -f labs/secrets/specs/configurable/secrets-plain
```

> Refresh the site and you'll see the updated config value

## Working with base-64 Secret values

Secrets are always surfaced as plaintext inside the container environment.

They **may** be encrypted in the Kubernetes database, but that is not the default setup. You can also integrate Kubernetes with third-party secure stores like Hashicorp Vault and Azure KeyVault.

Kubectl always shows Secrets encoded as base-64, but that's just a basic safety measure.

_Windows doesn't have a base64 command, so run this PowerShell script if you're on Windows:_

```
. ./labs/secrets/base64.ps1
```

Now you can fetch the data item from a Secret, and decode it into plaintext:

```
kubectl describe secret configurable-env-plain

kubectl get secret configurable-env-plain -o jsonpath="{.data.Configurable__Environment}"

kubectl get secret configurable-env-plain -o jsonpath="{.data.Configurable__Environment}" | base64 -d
```

> In production you'll need to understand how your cluster secures Secrets at rest. You'll also use [Role-Based Access Control]() to limit who can work with Secrets in Kubectl.

## Creating Secrets from files

Some organizations have separate configuration management teams. They have access to the raw sensitive data, and in Kuberneted they would own the management of Secrets. 

The product team would own the Deployment YAML which references the Secrets and ConfigMaps. The workflow is decoupled, so the DevOps team can deploy and manage the app without having access to the sensitive data.

Play the cnfig management team and create secrets from your local store:

```
kubectl create secret generic configurable-env-file --from-env-file ./labs/secrets/secrets/configurable.env 

kubectl create secret generic configurable-secret-file --from-file ./labs/secrets/secrets/secret.json
```

And play the DevOps team, now that the secrets are there:

```
kubectl apply -f ./labs/secrets/specs/configurable/secrets-file
```


## Environment variable overrides in Pods

You'll often have multiple configuration sources in your Pod spec. Config quickly sprawls and it makes sense to centralize it as much as possible - if all your apps use the same logging config, then store that in one ConfigMap and use it in all the Deployments.

Breaking down configuration makes it easier to manage, but you need to understand how different sources get merged so you know the priority order.

## Lab

Mapping configuration in ConfigMap YAML works well and it means you can deploy your whole app with `kubectl apply`. But it won't suit every organization, and Kubernetes also supports creating ConfigMaps directly from values and config files.

Create two new ConfigMaps to support the Deployment in [deployment-lab.yaml](specs/configurable/lab/deployment-lab.yaml) and set these values:

- Environment variable `Configuration__Release=21.04-lab`
- JSON setting `Features.DarkMode=true`

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

