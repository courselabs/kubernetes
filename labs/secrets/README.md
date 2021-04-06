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

- []()
- []()

```
kubectl apply -f labs/secrets/specs/configurable/secrets-encoded
```

> Browse to the website and you can see the plain-text value for `Configurable:Environment`

## Creating Secrets from plaintext YAML

Encoding to base-64 is awkward and it gives you the illusion your data is safe. Encoding is not encryption, and you can easily decode base-64.

If you want to store sensitive data in plain-text YAML, you can do that instead. You'd only do this when your YAML is locked down:

- []() - uses `stringData` to store values in plain text
- []()

```
kubectl apply -f labs/secrets/specs/configurable/secrets-plain
```




## Working with base-64 Secret values

## Creating Secrets from literals

## Environment variable overrides in Pods

You'll often have multiple configuration sources in your Pod spec. Config quickly sprawls and it makes sense to centralize it as much as possible - if all your apps use the same logging config, then store that in one ConfigMap and use it in all the Deployments.

Breaking down configuration makes it easier to manage, but you need to understand how different sources get merged so you know the priority order.

## Lab

Mapping configuration in ConfigMap YAML works well and it means you can deploy your whole app with `kubectl apply`. But it won't suit every organization, and Kubernetes also supports creating ConfigMaps directly from values and config files.

Create two new ConfigMaps to support the Deployment in [deployment-lab.yaml](specs/configurable/lab/deployment-lab.yaml) and set these values:

- Environment variable `Configuration__Release=21.04-lab`
- JSON setting `Features.DarkMode=true`

> Stuck? Try [hints](hints.md) or check the [solution](solution.md).

