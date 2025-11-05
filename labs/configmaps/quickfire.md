# ConfigMaps - Quickfire Questions

Test your knowledge of Kubernetes ConfigMaps with these 10 multiple-choice questions covering the core concepts and CKAD exam requirements.

## Questions

### 1. What are the two primary ways to consume ConfigMap data in a Pod?

A) As volumes and as secrets
B) As environment variables and as command-line arguments
C) As annotations and as labels
D) As environment variables and as mounted files

### 2. Which field in a ConfigMap YAML defines the configuration data?

A) data
B) spec
C) values
D) config

### 3. How do you load all key-value pairs from a ConfigMap as environment variables?

A) Using `configMap` in the volumes section
B) Using `envFrom` with `configMapRef`
C) Using `env` with `valueFrom`
D) Using `configMapKeyRef` for each key

### 4. What happens to a Pod if it references a ConfigMap that doesn't exist?

A) The Pod starts but the environment variables are empty
B) The Pod starts with default values
C) The Pod creates the ConfigMap automatically
D) The Pod fails to start until the ConfigMap is created

### 5. When you mount a ConfigMap as a volume, where does the data appear in the container?

A) In /etc/config by default
B) As command-line arguments
C) As environment variables only
D) As files in the specified mountPath directory

### 6. Can you update a ConfigMap after it's been created?

A) No, ConfigMaps are immutable
B) Yes, but only for file-based data
C) Only by deleting and recreating it
D) Yes, using kubectl edit or kubectl apply

### 7. How do you consume a single key from a ConfigMap as an environment variable?

A) Using `volumes` with `items` selecting the key
B) Using `envFrom` with the key name
C) Using `configMapRef` with `key` field
D) Using `env` with `valueFrom.configMapKeyRef`

### 8. What is the syntax separator used in ConfigMap YAML for multi-line file content?

A) `|-`
B) `--`
C) `|`
D) `:`

### 9. Which kubectl command creates a ConfigMap from a file?

A) kubectl configmap create myconfig --from=myfile.txt
B) kubectl create configmap myconfig --from-file=myfile.txt
C) kubectl apply configmap myconfig --file=myfile.txt
D) kubectl create config myconfig --input=myfile.txt

### 10. When a ConfigMap mounted as a volume is updated, what happens to the files in the container?

A) The Pod is automatically restarted
B) Nothing, the container must be restarted
C) The Deployment performs a rolling update
D) The files are automatically updated after a sync period

---

## Answers

1. **D** - ConfigMap data can be consumed as environment variables (using `envFrom` or `env`) or as mounted files (using volumes and volumeMounts).

2. **A** - The `data` field contains the configuration as key-value pairs (for environment variables) or as file content.

3. **B** - Using `envFrom` with `configMapRef` loads all key-value pairs from the ConfigMap as environment variables in the container.

4. **D** - If a Pod references a non-existent ConfigMap, it will fail to start and remain in a pending or error state until the ConfigMap is created.

5. **D** - ConfigMap data mounted as a volume appears as files in the specified `mountPath` directory. Each key becomes a filename with its value as content.

6. **D** - ConfigMaps can be updated using `kubectl edit configmap <name>` or `kubectl apply -f <updated-yaml>`. However, environment variables won't update in running Pods.

7. **D** - Use `env` with `valueFrom.configMapKeyRef` to consume a single specific key from a ConfigMap as an environment variable.

8. **A** - The `|-` separator is used for multi-line string content in YAML, preserving line breaks while trimming trailing newlines.

9. **B** - `kubectl create configmap myconfig --from-file=myfile.txt` creates a ConfigMap from a file. You can also use `--from-literal` for key-value pairs.

10. **D** - When a ConfigMap volume is updated, Kubernetes eventually syncs the changes to the mounted files (usually within a minute). Environment variables do not update.

---

## Study Resources

- [Lab README](README.md) - Core ConfigMap concepts and exercises
- [CKAD Requirements](CKAD.md) - CKAD-specific ConfigMap topics
- [Official ConfigMap Documentation](https://kubernetes.io/docs/concepts/configuration/configmap/)
